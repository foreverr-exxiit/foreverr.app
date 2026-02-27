import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type UserActivity = Tables["user_activities"]["Row"];
type Profile = Tables["profiles"]["Row"];

const ACTIVITY_KEY = "user-activities";

type ActivityWithUser = UserActivity & {
  user: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
};

// ============================================================
// Activity Feed (followed users' public activities)
// ============================================================

export function useActivityFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [ACTIVITY_KEY, "feed", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;

      // Get who this user follows
      const { data: following } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId!);
      const followingIds = (following ?? []).map((f) => f.following_id);

      // Include own activities + followed users
      const userIds = [userId!, ...followingIds];

      const { data, error } = await supabase
        .from("user_activities")
        .select("*, user:profiles!user_activities_user_id_fkey(id, username, display_name, avatar_url)")
        .in("user_id", userIds)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);
      if (error) throw error;
      return {
        data: (data ?? []) as unknown as ActivityWithUser[],
        nextCursor: data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

// ============================================================
// Single user's activity timeline
// ============================================================

export function useUserActivities(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [ACTIVITY_KEY, "user", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;
      const { data, error } = await supabase
        .from("user_activities")
        .select("*, user:profiles!user_activities_user_id_fkey(id, username, display_name, avatar_url)")
        .eq("user_id", userId!)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);
      if (error) throw error;
      return {
        data: (data ?? []) as unknown as ActivityWithUser[],
        nextCursor: data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

// ============================================================
// Log a new activity
// ============================================================

export function useLogActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      activityType: string;
      targetType?: string;
      targetId?: string;
      metadata?: Record<string, unknown>;
      isPublic?: boolean;
    }) => {
      const { error } = await supabase
        .from("user_activities")
        .insert({
          user_id: params.userId,
          activity_type: params.activityType,
          target_type: params.targetType,
          target_id: params.targetId,
          metadata: (params.metadata ?? {}) as any,
          is_public: params.isPublic ?? true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITY_KEY] });
    },
  });
}
