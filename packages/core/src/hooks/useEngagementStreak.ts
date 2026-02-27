import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type EngagementStreak = Database["public"]["Tables"]["engagement_streaks"]["Row"];

const STREAK_KEY = "engagement-streak";

// ============================================================
// My engagement streak
// ============================================================

export function useMyEngagementStreak(userId: string | undefined) {
  return useQuery({
    queryKey: [STREAK_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_streaks")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as EngagementStreak | null;
    },
    enabled: !!userId,
  });
}

// ============================================================
// Record daily engagement (updates streak)
// ============================================================

export function useRecordEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, type }: { userId: string; type: "prompt" | "share" | "activity" }) => {
      const today = new Date().toISOString().split("T")[0];

      // Get or create streak record
      const { data: existing } = await supabase
        .from("engagement_streaks")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existing) {
        // Create new streak
        const { data, error } = await supabase
          .from("engagement_streaks")
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            total_days_active: 1,
            total_prompts_answered: type === "prompt" ? 1 : 0,
            total_shares: type === "share" ? 1 : 0,
          })
          .select()
          .single();
        if (error) throw error;
        return data as EngagementStreak;
      }

      const streak = existing as EngagementStreak;
      const lastDate = streak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = streak.current_streak;
      let newTotalDays = streak.total_days_active;

      if (lastDate === today) {
        // Already active today — just update counts
      } else if (lastDate === yesterdayStr) {
        // Consecutive day
        newStreak += 1;
        newTotalDays += 1;
      } else {
        // Streak broken
        newStreak = 1;
        newTotalDays += 1;
      }

      const { data, error } = await supabase
        .from("engagement_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_activity_date: today,
          total_days_active: newTotalDays,
          total_prompts_answered: streak.total_prompts_answered + (type === "prompt" ? 1 : 0),
          total_shares: streak.total_shares + (type === "share" ? 1 : 0),
          updated_at: new Date().toISOString(),
        } as any)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as EngagementStreak;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [STREAK_KEY, vars.userId] });
    },
  });
}
