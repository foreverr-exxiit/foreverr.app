import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { RibbonPackage, DailyReward, GiftCatalogItem } from "../types/models";

const PACKAGES_KEY = "ribbon-packages";
const REWARDS_KEY = "daily-rewards";
const GIFTS_KEY = "gift-catalog";
const RIBBON_HISTORY_KEY = "ribbon-history";

/** Fetch available ribbon packages */
export function useRibbonPackages() {
  return useQuery({
    queryKey: [PACKAGES_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ribbon_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RibbonPackage[];
    },
  });
}

/** Fetch gift catalog items */
export function useGiftCatalog() {
  return useQuery({
    queryKey: [GIFTS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_catalog")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as GiftCatalogItem[];
    },
  });
}

/** Fetch ribbon transaction history for a user */
export function useRibbonHistory(userId: string | undefined) {
  return useQuery({
    queryKey: [RIBBON_HISTORY_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ribbon_transactions")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

/** Claim daily reward */
export function useClaimDailyReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string }) => {
      // Check today's reward
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("daily_rewards")
        .select("*")
        .eq("user_id", params.userId)
        .eq("reward_date", today)
        .maybeSingle();

      if (existing) throw new Error("Already claimed today");

      // Get streak
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const { data: yesterdayReward } = await supabase
        .from("daily_rewards")
        .select("streak_day")
        .eq("user_id", params.userId)
        .eq("reward_date", yesterday)
        .maybeSingle();

      const streakDay = (yesterdayReward?.streak_day ?? 0) + 1;
      const ribbonsEarned = Math.min(5 + (streakDay - 1) * 2, 25); // 5 base + 2 per streak day, max 25

      // Create reward
      const { data, error } = await supabase
        .from("daily_rewards")
        .insert({
          user_id: params.userId,
          reward_date: today,
          ribbons_earned: ribbonsEarned,
          streak_day: streakDay,
        })
        .select("*")
        .single();
      if (error) throw error;

      // Add ribbon transaction
      const { data: profile } = await supabase
        .from("profiles")
        .select("ribbon_balance")
        .eq("id", params.userId)
        .single();

      const newBalance = (profile?.ribbon_balance ?? 0) + ribbonsEarned;
      await supabase
        .from("ribbon_transactions")
        .insert({
          user_id: params.userId,
          amount: ribbonsEarned,
          type: "daily_reward",
          description: `Day ${streakDay} reward`,
          balance_after: newBalance,
        });

      await supabase
        .from("profiles")
        .update({ ribbon_balance: newBalance })
        .eq("id", params.userId);

      return data as unknown as DailyReward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REWARDS_KEY] });
      queryClient.invalidateQueries({ queryKey: [RIBBON_HISTORY_KEY] });
    },
  });
}

/** Send a gift to a memorial */
export function useSendGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      senderId: string;
      giftId: string;
      message?: string;
      ribbonCost: number;
      isAnonymous?: boolean;
    }) => {
      // Deduct ribbons
      const { data: profile } = await supabase
        .from("profiles")
        .select("ribbon_balance")
        .eq("id", params.senderId)
        .single();

      const balance = profile?.ribbon_balance ?? 0;
      if (balance < params.ribbonCost) throw new Error("Not enough ribbons");

      const newBalance = balance - params.ribbonCost;

      // Create gift
      const { error: giftErr } = await supabase.from("memorial_gifts").insert({
        memorial_id: params.memorialId,
        sender_id: params.senderId,
        gift_id: params.giftId,
        message: params.message,
        ribbon_cost: params.ribbonCost,
        is_anonymous: params.isAnonymous ?? false,
      });
      if (giftErr) throw giftErr;

      // Record transaction
      await supabase.from("ribbon_transactions").insert({
        user_id: params.senderId,
        amount: -params.ribbonCost,
        type: "spent_gift",
        description: "Sent a memorial gift",
        balance_after: newBalance,
      });

      await supabase
        .from("profiles")
        .update({ ribbon_balance: newBalance })
        .eq("id", params.senderId);

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RIBBON_HISTORY_KEY] });
      queryClient.invalidateQueries({ queryKey: [GIFTS_KEY] });
    },
  });
}
