import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Memorial, MemorialInsert } from "../types/models";

const MEMORIALS_KEY = "memorials";

/** Fetch paginated public memorials (home feed / discover) */
export function useMemorials(options?: { search?: string; limit?: number }) {
  const limit = options?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: [MEMORIALS_KEY, "list", options?.search],
    queryFn: async ({ pageParam = 0 }) => {
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
      return { data: (data ?? []) as Memorial[], nextCursor: data && data.length === limit ? pageParam + limit : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

/** Fetch top/trending memorials */
export function useTopMemorials(limit = 10) {
  return useQuery({
    queryKey: [MEMORIALS_KEY, "top", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .eq("status", "active")
        .eq("privacy", "public")
        .order("follower_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as Memorial[];
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

/** Fetch a single memorial by ID */
export function useMemorial(id: string | undefined) {
  return useQuery({
    queryKey: [MEMORIALS_KEY, "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as Memorial;
    },
    enabled: !!id,
  });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMORIALS_KEY] });
    },
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
    },
  });
}
