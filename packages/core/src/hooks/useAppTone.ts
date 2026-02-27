import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const APP_TONE_KEY = "app-tone";

// ============================================================
// Warm greeting based on time-of-day, name & streak
// ============================================================

export function useWarmGreeting(userId: string | undefined) {
  return useQuery({
    queryKey: [APP_TONE_KEY, "greeting", userId],
    queryFn: async () => {
      // Fetch display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId!)
        .maybeSingle();

      const name = profile?.display_name ?? "Friend";

      // Determine time-of-day greeting
      const hour = new Date().getHours();
      let timeGreeting: string;
      let emoji: string;
      if (hour < 12) {
        timeGreeting = "Good morning";
        emoji = "\u{1F305}"; // sunrise
      } else if (hour < 17) {
        timeGreeting = "Good afternoon";
        emoji = "\u{2600}\u{FE0F}"; // sun
      } else {
        timeGreeting = "Good evening";
        emoji = "\u{1F319}"; // moon
      }

      // Fetch engagement streak
      const { data: streak } = await supabase
        .from("engagement_streaks")
        .select("current_streak")
        .eq("user_id", userId!)
        .maybeSingle();

      const streakCount = streak?.current_streak ?? 0;

      // Build subtitle
      const subtitles = [
        "Ready to honor someone special today?",
        "Every memory you share keeps love alive.",
        "Your presence here means the world.",
        "Let's celebrate the lives that matter most.",
      ];
      const subtitleIndex = Math.floor(Date.now() / 86400000) % subtitles.length;

      return {
        greeting: `${timeGreeting}, ${name}! ${emoji}`,
        subtitle: subtitles[subtitleIndex],
        streakCount,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================
// Contextual CTA based on current screen
// ============================================================

export function useContextualCTA(screen: string) {
  return useQuery({
    queryKey: [APP_TONE_KEY, "cta", screen],
    queryFn: async () => {
      switch (screen) {
        case "home":
          return {
            ctaText: "Give someone their flowers today",
            ctaRoute: "/gifts",
            ctaIcon: "flower" as const,
          };
        case "profile":
          return {
            ctaText: "Share your legacy",
            ctaRoute: "/legacy-link",
            ctaIcon: "share" as const,
          };
        case "memorial":
          return {
            ctaText: "Light a candle in their memory",
            ctaRoute: "/gifts",
            ctaIcon: "flame" as const,
          };
        case "explore":
          return {
            ctaText: "Discover inspiring stories",
            ctaRoute: "/stories",
            ctaIcon: "compass" as const,
          };
        default:
          return {
            ctaText: "Honor someone special",
            ctaRoute: "/living-tribute/create",
            ctaIcon: "gift" as const,
          };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ============================================================
// Celebration moment (milestone detection)
// ============================================================

export function useCelebrationMoment(userId: string | undefined) {
  return useQuery({
    queryKey: [APP_TONE_KEY, "celebration", userId],
    queryFn: async () => {
      // Check recent legacy_points for milestone actions
      const { data: recentPoints } = await (supabase as any)
        .from("legacy_points")
        .select("action_type, points, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!recentPoints || recentPoints.length === 0) return null;

      const latest = recentPoints[0] as any;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      // Only show celebration for very recent events
      if (latest.created_at < fiveMinutesAgo) return null;

      // Detect milestone types
      if (latest.action_type === "first_memorial") {
        return {
          type: "milestone" as const,
          title: "Your First Memorial!",
          description: "You've created your first memorial. This is a beautiful way to honor someone's legacy.",
          pointsEarned: latest.points,
        };
      }

      if (latest.action_type?.startsWith("level_up")) {
        return {
          type: "level_up" as const,
          title: "Level Up!",
          description: "Your dedication to preserving memories has been recognized. Keep going!",
          pointsEarned: latest.points,
        };
      }

      // Check for streak milestones
      if (latest.action_type === "streak_milestone") {
        return {
          type: "streak" as const,
          title: "Streak Milestone!",
          description: "Your commitment to daily remembrance is truly inspiring.",
          pointsEarned: latest.points,
        };
      }

      return null;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
