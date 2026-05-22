import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const WELCOME_JOURNEY_KEY = "welcome-journey";
const POINT_BALANCE_KEY = "point-balance";

// ============================================================
// Types
// ============================================================

export interface WelcomeTask {
  id: string;
  user_id: string;
  day_number: number;
  task_key: string;
  task_title: string;
  task_description: string | null;
  points_reward: number;
  is_completed: boolean;
  completed_at: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
}

export interface WelcomeJourneyResult {
  tasks: WelcomeTask[];
  currentDay: number;
  totalPointsEarned: number;
  totalPointsAvailable: number;
  isComplete: boolean;
}

// ============================================================
// 1. Fetch welcome journey for a user
// ============================================================

/** Fetches all 7 welcome_journey rows for a user, ordered by day_number.
 *  Returns tasks, current day progress, earned/available points, and completion status. */
export function useWelcomeJourney(userId: string | undefined) {
  return useQuery({
    queryKey: [WELCOME_JOURNEY_KEY, userId],
    queryFn: async (): Promise<WelcomeJourneyResult> => {
      try {
        const { data, error } = await (supabase as any)
          .from("welcome_journey")
          .select("*")
          .eq("user_id", userId!)
          .order("day_number", { ascending: true });

        if (error) throw error;

        const tasks = ((data ?? []) as any[]).map((row: any) => ({
          id: row.id as string,
          user_id: row.user_id as string,
          day_number: row.day_number as number,
          task_key: row.task_key as string,
          task_title: row.task_title as string,
          task_description: (row.task_description as string) ?? null,
          points_reward: (row.points_reward as number) ?? 0,
          is_completed: (row.is_completed as boolean) ?? false,
          completed_at: (row.completed_at as string) ?? null,
          is_claimed: (row.is_claimed as boolean) ?? false,
          claimed_at: (row.claimed_at as string) ?? null,
          created_at: row.created_at as string,
        })) as WelcomeTask[];

        // Current day = first uncompleted task's day, or 7 if all done
        const firstIncomplete = tasks.find((t) => !t.is_completed);
        const currentDay = firstIncomplete ? firstIncomplete.day_number : 7;

        const totalPointsEarned = tasks
          .filter((t) => t.is_claimed)
          .reduce((sum, t) => sum + t.points_reward, 0);

        const totalPointsAvailable = tasks.reduce((sum, t) => sum + t.points_reward, 0);

        const isComplete = tasks.length > 0 && tasks.every((t) => t.is_completed && t.is_claimed);

        return { tasks, currentDay, totalPointsEarned, totalPointsAvailable, isComplete };
      } catch {
        // DB not reachable — return empty journey
        return {
          tasks: [],
          currentDay: 1,
          totalPointsEarned: 0,
          totalPointsAvailable: 0,
          isComplete: false,
        };
      }
    },
    enabled: !!userId,
  });
}

// ============================================================
// 2. Claim welcome reward (mark claimed + award points)
// ============================================================

/** Marks a completed task as claimed and awards legacy points to the user */
export function useClaimWelcomeReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      userId: string;
      pointsReward: number;
      taskKey: string;
    }) => {
      // Mark task as claimed
      const { error: claimErr } = await (supabase as any)
        .from("welcome_journey")
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", params.taskId)
        .eq("user_id", params.userId);

      if (claimErr) throw claimErr;

      // Award legacy points
      if (params.pointsReward > 0) {
        const { error: pointsErr } = await (supabase as any)
          .from("legacy_points")
          .insert({
            user_id: params.userId,
            points: params.pointsReward,
            action: "welcome_journey",
            description: `Welcome journey reward: ${params.taskKey}`,
          });

        if (pointsErr) throw pointsErr;
      }

      return { taskId: params.taskId, pointsAwarded: params.pointsReward };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [WELCOME_JOURNEY_KEY, vars.userId] });
      queryClient.invalidateQueries({ queryKey: [POINT_BALANCE_KEY] });
    },
  });
}

// ============================================================
// 3. Complete a welcome task
// ============================================================

/** Marks a specific task_key as completed. Called automatically when user
 *  completes profile, follows a page, sends a gift, etc. */
export function useCompleteWelcomeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      taskKey: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("welcome_journey")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", params.userId)
        .eq("task_key", params.taskKey)
        .eq("is_completed", false)
        .select()
        .maybeSingle();

      if (error) throw error;
      return (data as any as WelcomeTask) ?? null;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [WELCOME_JOURNEY_KEY, vars.userId] });
    },
  });
}

// ============================================================
// 4. Check if user is new (has unclaimed welcome tasks)
// ============================================================

/** Checks if user has any unclaimed welcome_journey tasks. Returns boolean isNewUser. */
export function useIsNewUser(userId: string | undefined) {
  return useQuery({
    queryKey: [WELCOME_JOURNEY_KEY, "is-new", userId],
    queryFn: async (): Promise<boolean> => {
      try {
        const { data, error } = await (supabase as any)
          .from("welcome_journey")
          .select("id")
          .eq("user_id", userId!)
          .eq("is_claimed", false)
          .limit(1);

        if (error) throw error;
        return (data ?? []).length > 0;
      } catch {
        return false;
      }
    },
    enabled: !!userId,
  });
}
