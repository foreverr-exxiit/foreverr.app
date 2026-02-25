import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Tribute, TributeInsert, TributeComment } from "../types/models";

const TRIBUTES_KEY = "tributes";

/** Fetch tributes for a memorial (paginated) */
export function useTributes(memorialId: string | undefined) {
  const limit = 20;

  return useInfiniteQuery({
    queryKey: [TRIBUTES_KEY, "list", memorialId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("tributes")
        .select("*, author:profiles!tributes_author_id_fkey(id, username, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (error) throw error;
      return { data: data ?? [], nextCursor: data && data.length === limit ? pageParam + limit : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!memorialId,
  });
}

/** Fetch a user's home feed (tributes from followed memorials) */
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
        .select("*, author:profiles!tributes_author_id_fkey(id, username, display_name, avatar_url), memorial:memorials!tributes_memorial_id_fkey(id, first_name, last_name, profile_photo_url, slug)")
        .in("memorial_id", memorialIds)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (error) throw error;
      return { data: data ?? [], nextCursor: data && data.length === limit ? pageParam + limit : undefined };
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
    },
  });
}

/** Toggle a reaction on a tribute or comment */
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, targetType, targetId, reactionType }: {
      userId: string;
      targetType: "tribute" | "comment";
      targetId: string;
      reactionType: "heart" | "candle" | "flower" | "prayer" | "dove";
    }) => {
      // Check existing reaction
      const { data: existing } = await supabase
        .from("reactions")
        .select("id")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("reaction_type", reactionType)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      } else {
        const { error } = await supabase.from("reactions").insert({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
          reaction_type: reactionType,
        });
        if (error) throw error;
        return { action: "added" as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIBUTES_KEY] });
    },
  });
}
