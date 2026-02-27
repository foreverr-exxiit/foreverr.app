import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type UserBadge = Tables["user_badges"]["Row"];
type BadgeDefinition = Tables["badge_definitions"]["Row"];

const BADGES_KEY = "user-badges";
const BADGE_DEFS_KEY = "badge-definitions";

type BadgeWithDefinition = UserBadge & {
  definition: BadgeDefinition | null;
};

// ============================================================
// User's earned badges
// ============================================================

export function useUserBadges(userId: string | undefined) {
  return useQuery({
    queryKey: [BADGES_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, definition:badge_definitions!user_badges_badge_type_fkey(*)")
        .eq("user_id", userId!)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BadgeWithDefinition[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// All available badge definitions
// ============================================================

export function useBadgeDefinitions() {
  return useQuery({
    queryKey: [BADGE_DEFS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge_definitions")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BadgeDefinition[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================
// Check eligibility & award badges
// ============================================================

export function useCheckAndAwardBadges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string }) => {
      // Get all badge definitions
      const { data: defs } = await supabase
        .from("badge_definitions")
        .select("*")
        .eq("is_active", true);

      // Get already earned badges
      const { data: earned } = await supabase
        .from("user_badges")
        .select("badge_type, badge_tier, progress")
        .eq("user_id", params.userId);

      const earnedMap = new Map(
        (earned ?? []).map((b) => [b.badge_type, b])
      );

      // Get user's activity counts
      const { data: activities } = await supabase
        .from("user_activities")
        .select("activity_type")
        .eq("user_id", params.userId);

      const activityCounts: Record<string, number> = {};
      (activities ?? []).forEach((a) => {
        activityCounts[a.activity_type] = (activityCounts[a.activity_type] ?? 0) + 1;
      });

      // Badge type → activity type mapping
      const badgeActivityMap: Record<string, string> = {
        first_tribute: "tribute_posted",
        candlelight: "candle_lit",
        memory_keeper: "vault_item_added",
        storyteller: "tribute_posted",
        generous_heart: "donation_made",
        event_planner: "event_created",
        time_traveler: "capsule_created",
        digital_artist: "scrapbook_published",
        community_builder: "user_followed",
      };

      const newBadges: Array<{ badge_type: string; badge_tier: string; progress: number }> = [];

      for (const def of (defs ?? []) as BadgeDefinition[]) {
        const actType = badgeActivityMap[def.badge_type];
        if (!actType) continue;

        const count = activityCounts[actType] ?? 0;
        if (count === 0) continue;

        const thresholds = def.tier_thresholds as Record<string, number>;
        let tier = "";
        if (count >= (thresholds.platinum ?? 999)) tier = "platinum";
        else if (count >= (thresholds.gold ?? 999)) tier = "gold";
        else if (count >= (thresholds.silver ?? 999)) tier = "silver";
        else if (count >= (thresholds.bronze ?? 1)) tier = "bronze";

        if (!tier) continue;

        const existing = earnedMap.get(def.badge_type);
        if (!existing) {
          newBadges.push({ badge_type: def.badge_type, badge_tier: tier, progress: count });
        } else if (tierRank(tier) > tierRank(existing.badge_tier)) {
          // Upgrade tier
          await supabase
            .from("user_badges")
            .update({ badge_tier: tier, progress: count })
            .eq("user_id", params.userId)
            .eq("badge_type", def.badge_type);
        }
      }

      if (newBadges.length > 0) {
        await supabase
          .from("user_badges")
          .insert(
            newBadges.map((b) => ({
              user_id: params.userId,
              badge_type: b.badge_type,
              badge_tier: b.badge_tier,
              progress: b.progress,
            }))
          );
      }

      return newBadges;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BADGES_KEY] });
    },
  });
}

function tierRank(tier: string): number {
  switch (tier) {
    case "platinum": return 4;
    case "gold": return 3;
    case "silver": return 2;
    case "bronze": return 1;
    default: return 0;
  }
}

// ============================================================
// Toggle badge display
// ============================================================

export function useToggleBadgeDisplay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { badgeId: string; isDisplayed: boolean }) => {
      const { error } = await supabase
        .from("user_badges")
        .update({ is_displayed: params.isDisplayed })
        .eq("id", params.badgeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BADGES_KEY] });
    },
  });
}
