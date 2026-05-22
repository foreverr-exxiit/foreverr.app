import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";
import type { Tribute, TributeInsert, TributeComment } from "../types/models";

const TRIBUTES_KEY = "tributes";

/** Valid UUID pattern — static/demo IDs like "sample-memorial-2" are NOT valid UUIDs */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fetch tributes for a memorial (paginated), enriched with reaction counts + user reactions */
export function useTributes(memorialId: string | undefined, userId?: string | null) {
  const limit = 20;

  return useInfiniteQuery({
    queryKey: [TRIBUTES_KEY, "list", memorialId, userId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("tributes")
        .select("*, author:profiles!tributes_author_id_fkey(id, username, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (error) throw error;
      const tributes = data ?? [];
      if (tributes.length === 0) {
        return { data: tributes, nextCursor: undefined };
      }

      // ── Enrich tributes with reaction counts & user reactions ──
      const tributeIds = tributes.map((t: any) => t.id);
      try {
        // Fetch all reactions for these tributes
        const { data: reactions } = await (supabase as any)
          .from("reactions")
          .select("target_id, reaction_type")
          .eq("target_type", "tribute")
          .in("target_id", tributeIds);

        // Aggregate counts per tribute
        const countsByTribute: Record<string, Record<string, number>> = {};
        for (const r of (reactions ?? []) as any[]) {
          if (!countsByTribute[r.target_id]) countsByTribute[r.target_id] = {};
          countsByTribute[r.target_id][r.reaction_type] =
            (countsByTribute[r.target_id][r.reaction_type] ?? 0) + 1;
        }

        // Fetch current user's reactions for these tributes
        let userReactionsByTribute: Record<string, string[]> = {};
        if (userId) {
          const { data: userRxns } = await (supabase as any)
            .from("reactions")
            .select("target_id, reaction_type")
            .eq("target_type", "tribute")
            .eq("user_id", userId)
            .in("target_id", tributeIds);

          for (const r of (userRxns ?? []) as any[]) {
            if (!userReactionsByTribute[r.target_id]) userReactionsByTribute[r.target_id] = [];
            userReactionsByTribute[r.target_id].push(r.reaction_type);
          }
        }

        // Merge reaction data into each tribute
        const enriched = tributes.map((t: any) => ({
          ...t,
          reaction_counts: countsByTribute[t.id] ?? {},
          user_reactions: userReactionsByTribute[t.id] ?? [],
        }));

        return { data: enriched, nextCursor: data && data.length === limit ? pageParam + limit : undefined };
      } catch {
        // Reactions enrichment failed — return tributes without reaction data
        return { data: tributes, nextCursor: data && data.length === limit ? pageParam + limit : undefined };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!memorialId,
  });
}

/** Fetch a user's home feed (tributes from followed memorials), enriched with reactions */
export function useHomeFeed(userId: string | undefined) {
  const limit = 20;

  return useInfiniteQuery({
    queryKey: [TRIBUTES_KEY, "feed", userId],
    queryFn: async ({ pageParam = 0 }) => {
      // First get followed memorial IDs
      const { data: follows, error: followError } = await supabase
        .from("followers")
        .select("memorial_id")
        .eq("user_id", userId!);

      if (followError) throw followError;
      const memorialIds = (follows ?? []).map((f) => f.memorial_id);

      if (memorialIds.length === 0) return { data: [], nextCursor: undefined };

      const { data, error } = await supabase
        .from("tributes")
        .select("*, author:profiles!tributes_author_id_fkey(id, username, display_name, avatar_url), memorial:memorials!tributes_memorial_id_fkey(id, first_name, last_name, profile_photo_url, slug, lifecycle_stage)")
        .in("memorial_id", memorialIds)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (error) throw error;
      const tributes = data ?? [];
      if (tributes.length === 0) {
        return { data: tributes, nextCursor: undefined };
      }

      // ── Enrich tributes with reaction counts & user reactions ──
      const tributeIds = tributes.map((t: any) => t.id);
      try {
        const { data: reactions } = await (supabase as any)
          .from("reactions")
          .select("target_id, reaction_type")
          .eq("target_type", "tribute")
          .in("target_id", tributeIds);

        const countsByTribute: Record<string, Record<string, number>> = {};
        for (const r of (reactions ?? []) as any[]) {
          if (!countsByTribute[r.target_id]) countsByTribute[r.target_id] = {};
          countsByTribute[r.target_id][r.reaction_type] =
            (countsByTribute[r.target_id][r.reaction_type] ?? 0) + 1;
        }

        let userReactionsByTribute: Record<string, string[]> = {};
        if (userId) {
          const { data: userRxns } = await (supabase as any)
            .from("reactions")
            .select("target_id, reaction_type")
            .eq("target_type", "tribute")
            .eq("user_id", userId)
            .in("target_id", tributeIds);

          for (const r of (userRxns ?? []) as any[]) {
            if (!userReactionsByTribute[r.target_id]) userReactionsByTribute[r.target_id] = [];
            userReactionsByTribute[r.target_id].push(r.reaction_type);
          }
        }

        const enriched = tributes.map((t: any) => ({
          ...t,
          reaction_counts: countsByTribute[t.id] ?? {},
          user_reactions: userReactionsByTribute[t.id] ?? [],
        }));

        return { data: enriched, nextCursor: data && data.length === limit ? pageParam + limit : undefined };
      } catch {
        return { data: tributes, nextCursor: data && data.length === limit ? pageParam + limit : undefined };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

/** Create a new tribute */
export function useCreateTribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tribute: TributeInsert) => {
      const { data, error } = await supabase
        .from("tributes")
        .insert(tribute)
        .select("*")
        .single();

      if (error) throw error;
      return data as unknown as Tribute;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRIBUTES_KEY, "list", data.memorial_id] });
      queryClient.invalidateQueries({ queryKey: [TRIBUTES_KEY, "feed"] });
      // Award engagement points for creating a tribute
      if (data.author_id) {
        awardEngagementPoints(data.author_id, "create_tribute", { referenceId: data.id });
      }
    },
  });
}

/** Fetch comments on a tribute */
export function useTributeComments(tributeId: string | undefined) {
  return useQuery({
    queryKey: [TRIBUTES_KEY, "comments", tributeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tribute_comments")
        .select("*, author:profiles!tribute_comments_author_id_fkey(id, username, display_name, avatar_url)")
        .eq("tribute_id", tributeId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tributeId,
  });
}

/** Add a comment to a tribute */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tributeId, authorId, content, parentCommentId }: {
      tributeId: string;
      authorId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      const { data, error } = await supabase
        .from("tribute_comments")
        .insert({
          tribute_id: tributeId,
          author_id: authorId,
          content,
          parent_comment_id: parentCommentId,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data as unknown as TributeComment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRIBUTES_KEY, "comments", data.tribute_id] });
      // Award engagement points for adding a comment
      if (data.author_id) {
        awardEngagementPoints(data.author_id, "add_comment", { referenceId: data.id });
      }
    },
  });
}

/** Fetch aggregate reaction counts for a memorial profile (not per-tribute) */
export function useMemorialReactionCounts(memorialId: string | undefined, userId?: string | null) {
  const isStaticId = !!memorialId && !UUID_RE.test(memorialId);

  return useQuery({
    queryKey: [TRIBUTES_KEY, "memorial-reactions", memorialId, userId],
    enabled: !!memorialId,
    queryFn: async () => {
      // Static/demo memorial IDs (e.g. "sample-memorial-2") are not valid UUIDs.
      // The reactions table has target_id as uuid, so querying with a non-UUID fails.
      // For static content, return empty — the toggle mutation will update cache locally.
      if (isStaticId) {
        return { counts: {} as Record<string, number>, userReactions: [] as string[] };
      }

      try {
        // Get all reactions where target_id = memorialId
        const { data: reactions, error } = await (supabase as any)
          .from("reactions")
          .select("reaction_type")
          .eq("target_id", memorialId!);

        if (error) throw error;

        // Aggregate counts
        const counts: Record<string, number> = {};
        for (const r of (reactions ?? []) as any[]) {
          counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + 1;
        }

        // Get ALL of the current user's reactions (if logged in)
        const userReactions: string[] = [];
        if (userId) {
          const { data: userRs } = await (supabase as any)
            .from("reactions")
            .select("reaction_type")
            .eq("target_id", memorialId!)
            .eq("user_id", userId);
          if (userRs) {
            for (const r of userRs as any[]) {
              userReactions.push(r.reaction_type);
            }
          }
        }

        return { counts, userReactions };
      } catch {
        // DB error (table missing, etc.) — return empty gracefully
        return { counts: {} as Record<string, number>, userReactions: [] as string[] };
      }
    },
    // Static IDs: never re-fetch from DB (mutation updates cache directly)
    // Real IDs: re-fetch every 30s
    staleTime: isStaticId ? Infinity : 30_000,
  });
}

/** Toggle a reaction on a tribute, comment, or memorial */
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, targetType, targetId, reactionType }: {
      userId: string;
      targetType: string;
      targetId: string;
      reactionType: string;
    }) => {
      // Static/demo IDs are not valid UUIDs — the reactions table has target_id as uuid.
      // For static content, determine toggle from the local cache and return without DB ops.
      if (!UUID_RE.test(targetId)) {
        const cacheKey = [TRIBUTES_KEY, "memorial-reactions", targetId, userId];
        const cached = queryClient.getQueryData<{ counts: Record<string, number>; userReactions: string[] }>(cacheKey);
        const alreadyReacted = cached?.userReactions?.includes(reactionType) ?? false;
        return { action: alreadyReacted ? "removed" as const : "added" as const, _local: true };
      }

      // Check existing reaction
      const { data: existing } = await (supabase as any)
        .from("reactions")
        .select("id")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("reaction_type", reactionType)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any).from("reactions").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const, _local: false };
      } else {
        const { error } = await (supabase as any).from("reactions").insert({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
          reaction_type: reactionType,
        });
        if (error) throw error;
        return { action: "added" as const, _local: false };
      }
    },
    onSuccess: (result, variables) => {
      if (result._local) {
        // Static content — update the React Query cache directly (no DB to invalidate)
        const cacheKey = [TRIBUTES_KEY, "memorial-reactions", variables.targetId, variables.userId];
        const current = queryClient.getQueryData<{ counts: Record<string, number>; userReactions: string[] }>(cacheKey)
          ?? { counts: {}, userReactions: [] };

        const newCounts = { ...current.counts };
        const newUserReactions = [...current.userReactions];

        if (result.action === "added") {
          newCounts[variables.reactionType] = (newCounts[variables.reactionType] ?? 0) + 1;
          if (!newUserReactions.includes(variables.reactionType)) {
            newUserReactions.push(variables.reactionType);
          }
        } else {
          newCounts[variables.reactionType] = Math.max(0, (newCounts[variables.reactionType] ?? 0) - 1);
          const idx = newUserReactions.indexOf(variables.reactionType);
          if (idx >= 0) newUserReactions.splice(idx, 1);
        }

        queryClient.setQueryData(cacheKey, { counts: newCounts, userReactions: newUserReactions });
      } else {
        // Real DB content — invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: [TRIBUTES_KEY] });
      }
      // Award engagement points when adding a reaction (not removing)
      if (result.action === "added" && variables.userId) {
        awardEngagementPoints(variables.userId, "add_reaction");
      }
    },
  });
}
