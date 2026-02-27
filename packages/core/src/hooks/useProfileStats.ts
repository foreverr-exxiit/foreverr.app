import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

interface ProfileStats {
  followerCount: number;
  tributesWritten: number;
  reactionsReceived: number;
  giftsGiven: number;
  ribbonBalance: number;
  memorialsHosted: number;
}

/**
 * Fetches real profile statistics from Supabase via parallel queries.
 */
export function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: async (): Promise<ProfileStats> => {
      if (!userId) throw new Error("No user ID");

      const [
        followersResult,
        tributesResult,
        reactionsResult,
        giftsResult,
        profileResult,
        memorialsResult,
      ] = await Promise.all([
        // Follower count — across all hosted memorials
        supabase
          .from("followers")
          .select("id", { count: "exact", head: true })
          .in(
            "memorial_id",
            // Sub-select memorial IDs the user hosts
            (
              await supabase
                .from("memorial_hosts")
                .select("memorial_id")
                .eq("user_id", userId)
            ).data?.map((h: any) => h.memorial_id) ?? []
          ),

        // Tributes written count
        supabase
          .from("tributes")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userId),

        // Reactions received on user's tributes
        supabase
          .from("reactions")
          .select("id", { count: "exact", head: true })
          .in(
            "target_id",
            (
              await supabase
                .from("tributes")
                .select("id")
                .eq("author_id", userId)
            ).data?.map((t: any) => t.id) ?? []
          )
          .eq("target_type", "tribute"),

        // Gifts given count
        supabase
          .from("ribbon_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("transaction_type", "gift_sent"),

        // Ribbon balance from profile
        supabase
          .from("profiles")
          .select("ribbon_balance")
          .eq("id", userId)
          .single(),

        // Memorials hosted
        supabase
          .from("memorial_hosts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);

      return {
        followerCount: followersResult.count ?? 0,
        tributesWritten: tributesResult.count ?? 0,
        reactionsReceived: reactionsResult.count ?? 0,
        giftsGiven: giftsResult.count ?? 0,
        ribbonBalance: profileResult.data?.ribbon_balance ?? 0,
        memorialsHosted: memorialsResult.count ?? 0,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
