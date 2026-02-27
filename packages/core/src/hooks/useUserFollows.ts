import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type UserFollow = Tables["user_follows"]["Row"];
type Profile = Tables["profiles"]["Row"];

const FOLLOWS_KEY = "user-follows";

type FollowWithProfile = UserFollow & {
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "bio"> | null;
};

// ============================================================
// Followers (people who follow a user)
// ============================================================

export function useUserFollowers(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [FOLLOWS_KEY, "followers", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;
      const { data, error } = await supabase
        .from("user_follows")
        .select("*, profile:profiles!user_follows_follower_id_fkey(id, username, display_name, avatar_url, bio)")
        .eq("following_id", userId!)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);
      if (error) throw error;
      return {
        data: (data ?? []) as unknown as FollowWithProfile[],
        nextCursor: data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

// ============================================================
// Following (people a user follows)
// ============================================================

export function useUserFollowing(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [FOLLOWS_KEY, "following", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;
      const { data, error } = await supabase
        .from("user_follows")
        .select("*, profile:profiles!user_follows_following_id_fkey(id, username, display_name, avatar_url, bio)")
        .eq("follower_id", userId!)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);
      if (error) throw error;
      return {
        data: (data ?? []) as unknown as FollowWithProfile[],
        nextCursor: data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

// ============================================================
// Check if current user follows target user
// ============================================================

export function useIsFollowingUser(
  currentUserId: string | undefined,
  targetUserId: string | undefined
) {
  return useQuery({
    queryKey: [FOLLOWS_KEY, "is-following", currentUserId, targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", currentUserId!)
        .eq("following_id", targetUserId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
  });
}

// ============================================================
// Toggle follow / unfollow
// ============================================================

export function useToggleUserFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      followerId,
      followingId,
      isCurrentlyFollowing,
    }: {
      followerId: string;
      followingId: string;
      isCurrentlyFollowing: boolean;
    }) => {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", followerId)
          .eq("following_id", followingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({ follower_id: followerId, following_id: followingId });
        if (error) throw error;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [FOLLOWS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-profile", vars.followingId] });
      queryClient.invalidateQueries({ queryKey: ["public-profile", vars.followerId] });
    },
  });
}

// ============================================================
// Suggested users (follow same memorials but not followed yet)
// ============================================================

export function useSuggestedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: [FOLLOWS_KEY, "suggested", userId],
    queryFn: async () => {
      // Get memorials the user follows
      const { data: myFollows } = await supabase
        .from("memorial_followers")
        .select("memorial_id")
        .eq("user_id", userId!);
      const memorialIds = (myFollows ?? []).map((f) => (f as any).memorial_id);
      if (memorialIds.length === 0) return [] as Profile[];

      // Get users who also follow those memorials
      const { data: otherFollowers } = await supabase
        .from("memorial_followers")
        .select("user_id")
        .in("memorial_id", memorialIds)
        .neq("user_id", userId!)
        .limit(50);
      const otherUserIds = [...new Set((otherFollowers ?? []).map((f) => (f as any).user_id as string))];
      if (otherUserIds.length === 0) return [] as Profile[];

      // Exclude already followed
      const { data: alreadyFollowing } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId!)
        .in("following_id", otherUserIds);
      const followedIds = new Set((alreadyFollowing ?? []).map((f) => f.following_id));
      const suggestedIds = otherUserIds.filter((uid) => !followedIds.has(uid)).slice(0, 10);
      if (suggestedIds.length === 0) return [] as Profile[];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", suggestedIds);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// Active contributors (top by recent activity)
// ============================================================

export function useActiveContributors(limit = 10) {
  return useQuery({
    queryKey: [FOLLOWS_KEY, "active-contributors", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
