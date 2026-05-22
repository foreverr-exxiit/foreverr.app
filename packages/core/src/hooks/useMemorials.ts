import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";
import type { Memorial, MemorialInsert } from "../types/models";
import { STATIC_MEMORIALS } from "../data/sampleMemorials";
import { STATIC_CELEBRITIES } from "../data/celebrityData";

const MEMORIALS_KEY = "memorials";

/** Fetch paginated public memorials (home feed / discover) — falls back to static data */
export function useMemorials(options?: { search?: string; limit?: number }) {
  const limit = options?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: [MEMORIALS_KEY, "list", options?.search],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        let query = supabase
          .from("memorials")
          .select("*")
          .eq("status", "active")
          .eq("privacy", "public")
          .order("last_interaction_at", { ascending: false })
          .range(pageParam, pageParam + limit - 1);

        if (options?.search) {
          query = query.or(
            `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) {
          // Enrich DB rows with static data so photos/names/traits are present
          const enriched = await Promise.all(
            data.map(async (row) => {
              const sm = STATIC_MEMORIALS.find((m) => m.id === row.id);
              if (sm) return enrichWithStaticData(row, sm) as Memorial;
              const cm = STATIC_CELEBRITIES.find((c) => c.id === row.id || c.memorial_id === row.id);
              if (cm) return enrichWithStaticData(row, celebToMemorialFields(cm)) as Memorial;
              const dbCeleb = await fetchCelebrityEnrichment(row.id);
              if (dbCeleb) return enrichWithStaticData(row, celebToMemorialFields(dbCeleb)) as Memorial;
              return row as Memorial;
            })
          );
          return { data: enriched, nextCursor: data.length === limit ? pageParam + limit : undefined };
        }
      } catch {
        // DB might not be reachable — fall back to static
      }

      // Static fallback — filter by search if provided
      let staticData = STATIC_MEMORIALS as unknown as Memorial[];
      if (options?.search) {
        const term = options.search.toLowerCase();
        staticData = staticData.filter(
          (m) =>
            m.first_name.toLowerCase().includes(term) ||
            m.last_name.toLowerCase().includes(term)
        );
      }
      const page = staticData.slice(pageParam, pageParam + limit);
      return { data: page, nextCursor: page.length === limit ? pageParam + limit : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

/** Fetch top/trending memorials — falls back to static sample data when DB is empty */
export function useTopMemorials(limit = 10) {
  return useQuery({
    queryKey: [MEMORIALS_KEY, "top", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("memorials")
          .select("*")
          .eq("status", "active")
          .eq("privacy", "public")
          .order("follower_count", { ascending: false })
          .limit(limit);

        if (error) throw error;
        if (data && data.length > 0) {
          // Enrich DB rows with static data so photos/names/traits are always present
          const enriched = await Promise.all(
            data.map(async (row) => {
              const staticMatch = STATIC_MEMORIALS.find((m) => m.id === row.id);
              if (staticMatch) return enrichWithStaticData(row, staticMatch) as Memorial;
              const celebMatch = STATIC_CELEBRITIES.find((c) => c.id === row.id || c.memorial_id === row.id);
              if (celebMatch) return enrichWithStaticData(row, celebToMemorialFields(celebMatch)) as Memorial;
              // Try DB celebrity_memorials table
              const dbCeleb = await fetchCelebrityEnrichment(row.id);
              if (dbCeleb) return enrichWithStaticData(row, celebToMemorialFields(dbCeleb)) as Memorial;
              return row as Memorial;
            })
          );
          return enriched;
        }
      } catch {
        // DB might not be reachable — fall back to static
      }
      // Return sample data sorted by follower count (matching DB query order)
      return [...STATIC_MEMORIALS]
        .sort((a, b) => b.follower_count - a.follower_count)
        .slice(0, limit) as unknown as Memorial[];
    },
  });
}

/** Fetch memorials the current user follows */
export function useFollowedMemorials(userId: string | undefined) {
  return useQuery({
    queryKey: [MEMORIALS_KEY, "followed", userId],
    queryFn: async () => {
      if (!userId) return [] as Memorial[];
      // Get followed memorial IDs first
      const { data: follows, error: followErr } = await supabase
        .from("followers")
        .select("memorial_id")
        .eq("user_id", userId);

      if (followErr) throw followErr;
      const ids = (follows ?? []).map((f) => f.memorial_id);
      if (ids.length === 0) return [] as Memorial[];

      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .in("id", ids)
        .order("last_interaction_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Memorial[];
    },
    enabled: !!userId,
  });
}

/**
 * Merge DB data with static enrichment data.
 * DB values take priority, but any null/empty/missing fields are filled
 * from the static source so sample profiles always look fully personalized.
 */
function enrichWithStaticData(dbData: Record<string, any>, staticData: Record<string, any>): Record<string, any> {
  const merged = { ...dbData };
  for (const [key, staticVal] of Object.entries(staticData)) {
    const dbVal = merged[key];
    // Fill in missing fields: null, undefined, empty string, empty array
    if (
      dbVal === null ||
      dbVal === undefined ||
      dbVal === "" ||
      (Array.isArray(dbVal) && dbVal.length === 0)
    ) {
      merged[key] = staticVal;
    }
  }
  return merged;
}

/**
 * Convert a celebrity_memorials row into memorial-like enrichment fields.
 * Used both for static and DB celebrity data.
 */
function celebToMemorialFields(celeb: Record<string, any>): Record<string, any> {
  // Determine lifecycle stage: anyone with a date_of_death is a memorial,
  // also check explicit type/category fields
  const isMemorial =
    !!celeb.date_of_death ||
    celeb.lifecycle_type === "memorial" ||
    celeb.lifecycle_type === "legacy" ||
    celeb.category === "memorial" ||
    celeb.category === "historical" ||
    celeb.category === "legacy";

  return {
    first_name: celeb.first_name,
    last_name: celeb.last_name,
    bio: celeb.biography_summary,
    biography: celeb.biography_summary,
    profile_photo_url: celeb.photo_url,
    occupation: celeb.occupation,
    nationality: celeb.nationality,
    date_of_birth: celeb.date_of_birth,
    date_of_death: celeb.date_of_death,
    lifecycle_stage: isMemorial ? "remember" : "celebrate",
  };
}

/**
 * Look up a celebrity from the DB celebrity_memorials table.
 * Checks both the celebrity ID and memorial_id columns.
 */
async function fetchCelebrityEnrichment(id: string): Promise<Record<string, any> | null> {
  try {
    // First check by memorial_id (celebrity linked to this memorial)
    const { data: byMemorial } = await supabase
      .from("celebrity_memorials")
      .select("*")
      .eq("memorial_id", id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (byMemorial) return byMemorial;

    // Then check by the celebrity's own ID
    const { data: byId } = await supabase
      .from("celebrity_memorials")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (byId) return byId;
  } catch {
    // DB not reachable — no enrichment
  }
  return null;
}

/** Fetch a single memorial by ID — falls back to static data when DB record not found */
export function useMemorial(id: string | undefined) {
  return useQuery({
    queryKey: [MEMORIALS_KEY, "detail", id],
    queryFn: async () => {
      // Look up static data first — we'll use it for enrichment or as fallback
      const staticMatch = STATIC_MEMORIALS.find((m) => m.id === id);
      const celebMatch = STATIC_CELEBRITIES.find(
        (c) => c.id === id || c.memorial_id === id
      );

      try {
        const { data, error } = await supabase
          .from("memorials")
          .select("*")
          .eq("id", id!)
          .single();

        if (!error && data) {
          // DB row found — enrich with static data so personality, photos, etc. are filled
          if (staticMatch) {
            return enrichWithStaticData(data, staticMatch) as Memorial;
          }
          if (celebMatch) {
            return enrichWithStaticData(data, celebToMemorialFields(celebMatch)) as Memorial;
          }
          // No static match — try celebrity_memorials DB table for enrichment
          const dbCeleb = await fetchCelebrityEnrichment(id!);
          if (dbCeleb) {
            return enrichWithStaticData(data, celebToMemorialFields(dbCeleb)) as Memorial;
          }
          return data as Memorial;
        }
      } catch {
        // DB might not be reachable — fall through to static
      }

      // Static fallback — return the full static entry
      if (staticMatch) return staticMatch as unknown as Memorial;

      // Celebrity static fallback — construct a memorial-like object from celebrity data
      if (celebMatch) {
        return buildMemorialFromCelebrity(celebMatch);
      }

      // DB celebrity fallback — check celebrity_memorials table directly
      const dbCeleb = await fetchCelebrityEnrichment(id!);
      if (dbCeleb) {
        return buildMemorialFromCelebrity(dbCeleb);
      }

      // No match anywhere — return null
      return null as unknown as Memorial;
    },
    enabled: !!id,
    retry: 1,
  });
}

/** Build a full memorial-like object from celebrity data (static or DB) */
function buildMemorialFromCelebrity(celeb: Record<string, any>): Memorial {
  const now = new Date().toISOString();
  const fullName = celeb.full_name || `${celeb.first_name ?? ""} ${celeb.last_name ?? ""}`.trim();
  return {
    id: celeb.id,
    first_name: celeb.first_name,
    last_name: celeb.last_name,
    middle_name: null,
    nickname: null,
    date_of_birth: celeb.date_of_birth ?? null,
    date_of_death: celeb.date_of_death ?? null,
    place_of_birth: celeb.nationality ?? null,
    place_of_death: null,
    bio: celeb.biography_summary ?? null,
    biography: celeb.biography_summary ?? null,
    obituary: null,
    profile_photo_url: celeb.photo_url ?? null,
    cover_photo_url: null,
    slug: fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    status: "published",
    privacy: "public",
    follower_count: 0,
    tribute_count: 0,
    view_count: celeb.view_count ?? 0,
    host_user_id: "system",
    created_by: null,
    relationship: "fan",
    personality: null,
    personality_traits: [],
    accomplishments: null,
    hobbies: null,
    favorite_memories: null,
    occupation: celeb.occupation ?? null,
    lifecycle_stage: (
      !!celeb.date_of_death ||
      celeb.lifecycle_type === "memorial" ||
      celeb.lifecycle_type === "legacy" ||
      celeb.category === "memorial" ||
      celeb.category === "historical" ||
      celeb.category === "legacy"
    ) ? "remember" : "celebrate",
    biography_is_ai_generated: false,
    last_interaction_at: now,
    created_at: now,
    updated_at: now,
  } as unknown as Memorial;
}

/** Fetch memorials hosted by a user */
export function useHostedMemorials(userId: string | undefined) {
  return useQuery({
    queryKey: [MEMORIALS_KEY, "hosted", userId],
    queryFn: async () => {
      if (!userId) return [] as Memorial[];
      const { data: hosts, error: hostErr } = await supabase
        .from("memorial_hosts")
        .select("memorial_id")
        .eq("user_id", userId);

      if (hostErr) throw hostErr;
      const ids = (hosts ?? []).map((h) => h.memorial_id);
      if (ids.length === 0) return [] as Memorial[];

      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .in("id", ids);

      if (error) throw error;
      return (data ?? []) as Memorial[];
    },
    enabled: !!userId,
  });
}

/** Check if user follows a memorial */
export function useIsFollowing(memorialId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["followers", memorialId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followers")
        .select("id")
        .eq("memorial_id", memorialId!)
        .eq("user_id", userId!)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!memorialId && !!userId,
  });
}

/** Create a new memorial */
export function useCreateMemorial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memorial: MemorialInsert) => {
      const { data, error } = await supabase
        .from("memorials")
        .insert(memorial)
        .select()
        .single();

      if (error) throw error;
      return data as Memorial;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [MEMORIALS_KEY] });
      // Award engagement points for creating a memorial
      if (data.created_by) {
        awardEngagementPoints(data.created_by, "create_memorial", { referenceId: data.id });
      }
    },
  });
}

/** Fetch hosts/maintainers of a memorial */
export function useMemorialHosts(
  memorialId: string | undefined,
  fallbackCreatorId?: string | null,
) {
  return useQuery({
    queryKey: ["memorial-hosts", memorialId, fallbackCreatorId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("memorial_hosts")
          .select("id, role, relationship, relationship_detail, user_id")
          .eq("memorial_id", memorialId!)
          .order("role", { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          // Fetch profiles for each host
          const userIds = (data as any[]).map((h: any) => h.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, username, avatar_url")
            .in("id", userIds);

          const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

          return (data as any[]).map((host: any) => ({
            id: host.id,
            role: host.role as string,
            relationship: host.relationship as string,
            relationship_detail: host.relationship_detail as string | null,
            user: profileMap.get(host.user_id) ?? {
              id: host.user_id,
              display_name: "Unknown",
              username: null,
              avatar_url: null,
            },
          }));
        }
      } catch {
        // DB not reachable — fall through to creator fallback
      }

      // ── Fallback: show memorial creator as the default host ─────────
      if (fallbackCreatorId) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, display_name, username, avatar_url")
            .eq("id", fallbackCreatorId)
            .single();

          if (profile) {
            return [
              {
                id: `creator-${fallbackCreatorId}`,
                role: "owner",
                relationship: "immediate_family",
                relationship_detail: null as string | null,
                user: {
                  id: (profile as any).id as string,
                  display_name: (profile as any).display_name as string,
                  username: ((profile as any).username ?? null) as string | null,
                  avatar_url: ((profile as any).avatar_url ?? null) as string | null,
                },
              },
            ];
          }
        } catch {
          // Profile fetch failed — return empty
        }
      }

      return [] as Array<{
        id: string;
        role: string;
        relationship: string;
        relationship_detail: string | null;
        user: { id: string; display_name: string; username: string | null; avatar_url: string | null };
      }>;
    },
    enabled: !!memorialId,
  });
}

/** Follow / unfollow a memorial */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memorialId, userId, isFollowing }: { memorialId: string; userId: string; isFollowing: boolean }) => {
      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("memorial_id", memorialId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("followers")
          .insert({ memorial_id: memorialId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["followers", vars.memorialId] });
      queryClient.invalidateQueries({ queryKey: [MEMORIALS_KEY] });
      // Award engagement points when following (not unfollowing)
      if (!vars.isFollowing && vars.userId) {
        awardEngagementPoints(vars.userId, "follow_memorial", { referenceId: vars.memorialId });
      }
    },
  });
}
