import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "./useAuth";
import { analytics } from "../services/analytics";

const PREMIUM_KEY = "premium";

// ============================================================
// Types
// ============================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  annual_price_cents: number;
  currency: string;
  tier: number;
  features: string[];
  limits: Record<string, number>;
  badge_icon: string | null;
  badge_color: string | null;
  is_active: boolean;
  sort_order: number;
  store_product_id_monthly: string | null;
  store_product_id_annual: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "trialing" | "past_due" | "cancelled" | "expired" | "paused";
  billing_period: "monthly" | "annual" | "lifetime";
  current_period_start: string;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  provider: string;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  points_multiplier: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PremiumFeatureGate {
  id: string;
  feature_key: string;
  label: string;
  description: string | null;
  required_tier: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface BillingEntry {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount_cents: number;
  currency: string;
  description: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  provider: string | null;
  provider_payment_id: string | null;
  invoice_url: string | null;
  receipt_url: string | null;
  created_at: string;
}

export type PremiumTier = 0 | 1 | 2;
export type PlanSlug = "free" | "premium" | "elite";

// ============================================================
// Feature Key type — all gatable features
// ============================================================

export type PremiumFeatureKey =
  | "premium_templates"
  | "animated_cards"
  | "custom_themes"
  | "branded_cards"
  | "white_label_exports"
  | "ai_voice"
  | "ai_photo_restore"
  | "ai_memorial_video"
  | "unlimited_ai"
  | "premium_gifts"
  | "physical_gifts"
  | "unlimited_vault"
  | "unlimited_living_tributes"
  | "unlimited_share_cards"
  | "vip_events"
  | "priority_celebrity_requests"
  | "family_plan"
  | "custom_domains"
  | "ad_free"
  | "priority_support"
  | "points_multiplier"
  | "dedicated_support";

// ============================================================
// Fetch all subscription plans
// ============================================================

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: [PREMIUM_KEY, "plans"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SubscriptionPlan[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour — plans rarely change
  });
}

// ============================================================
// Fetch user's current subscription
// ============================================================

export function useMySubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PREMIUM_KEY, "subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as UserSubscription & { subscription_plans: SubscriptionPlan }) ?? null;
    },
    enabled: !!user?.id,
  });
}

// ============================================================
// Main hook: usePremium — all premium logic in one place
// ============================================================

export function usePremium() {
  const { user, profile } = useAuth();
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { data: plans } = useSubscriptionPlans();
  const { data: featureGates } = useFeatureGates();

  // The user's effective tier (0 = free, 1 = premium, 2 = elite)
  const tier: PremiumTier = (profile as any)?.premium_tier ?? 0;

  const isPremium = tier >= 1;
  const isElite = tier >= 2;
  const isFree = tier === 0;

  // Check if a specific feature is available — uses DB-backed gates with local fallback
  // Wrapped in useCallback to provide a stable reference and avoid cascading re-renders
  const hasFeature = useCallback((featureKey: PremiumFeatureKey): boolean => {
    // Try DB-backed feature gates first
    if (featureGates && featureGates.length > 0) {
      const gate = featureGates.find((g) => g.feature_key === featureKey);
      if (gate) return tier >= gate.required_tier;
    }

    // Fallback: hardcoded tier map (used if DB fetch hasn't loaded yet)
    const FEATURE_TIERS: Record<PremiumFeatureKey, number> = {
      premium_templates: 1,
      animated_cards: 1,
      custom_themes: 1,
      branded_cards: 2,
      white_label_exports: 2,
      ai_voice: 1,
      ai_photo_restore: 1,
      ai_memorial_video: 1,
      unlimited_ai: 2,
      premium_gifts: 1,
      physical_gifts: 2,
      unlimited_vault: 1,
      unlimited_living_tributes: 1,
      unlimited_share_cards: 1,
      vip_events: 2,
      priority_celebrity_requests: 2,
      family_plan: 2,
      custom_domains: 2,
      ad_free: 1,
      priority_support: 1,
      points_multiplier: 1,
      dedicated_support: 2,
    };

    return tier >= (FEATURE_TIERS[featureKey] ?? 1);
  }, [tier, featureGates]);

  // Get the user's limit for a resource (returns -1 for unlimited)
  // Wrapped in useCallback for stable reference
  const getLimit = useCallback((key: string): number => {
    if (!plans || plans.length === 0) {
      // Default free limits
      const FREE_LIMITS: Record<string, number> = {
        vault_items: 5,
        living_tributes: 1,
        share_cards_per_month: 3,
        ai_generations_per_month: 2,
      };
      return FREE_LIMITS[key] ?? 0;
    }

    const currentPlan = plans.find((p) => p.tier === tier);
    if (!currentPlan) return 0;
    return (currentPlan.limits as Record<string, number>)[key] ?? 0;
  }, [plans, tier]);

  // Memoize the entire return value to prevent cascading re-renders
  return useMemo(() => {
    const pointsMultiplier = tier >= 2 ? 2.0 : tier >= 1 ? 1.5 : 1.0;
    const currentPlan = plans?.find((p) => p.tier === tier) ?? null;
    const premiumPlan = plans?.find((p) => p.slug === "premium") ?? null;
    const elitePlan = plans?.find((p) => p.slug === "elite") ?? null;
    const isActive = subscription?.status === "active" || subscription?.status === "trialing";
    const isTrialing = subscription?.status === "trialing";
    const isCancelling = subscription?.cancel_at_period_end === true;
    const renewsAt = subscription?.current_period_end ?? null;

    return {
      tier,
      isPremium,
      isElite,
      isFree,
      hasFeature,
      getLimit,
      pointsMultiplier,
      currentPlan,
      premiumPlan,
      elitePlan,
      plans: plans ?? [],
      subscription,
      isActive,
      isTrialing,
      isCancelling,
      renewsAt,
      isLoading: subLoading,
    };
  }, [tier, isPremium, isElite, isFree, hasFeature, getLimit, plans, subscription, subLoading]);
}

// ============================================================
// Fetch feature gates (for admin/display)
// ============================================================

export function useFeatureGates() {
  return useQuery({
    queryKey: [PREMIUM_KEY, "feature-gates"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("premium_feature_gates")
        .select("*")
        .eq("is_active", true)
        .order("required_tier", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PremiumFeatureGate[];
    },
    staleTime: 60 * 60 * 1000,
  });
}

// ============================================================
// Fetch billing history
// ============================================================

export function useBillingHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PREMIUM_KEY, "billing-history", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("billing_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as BillingEntry[];
    },
    enabled: !!user?.id,
  });
}

// ============================================================
// Create / Update subscription (called after RevenueCat purchase)
// ============================================================

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      plan_id: string;
      billing_period: "monthly" | "annual" | "lifetime";
      provider?: string;
      provider_subscription_id?: string;
      provider_customer_id?: string;
      trial_end?: string;
    }) => {
      const userId = user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          plan_id: params.plan_id,
          status: params.trial_end ? "trialing" : "active",
          billing_period: params.billing_period,
          current_period_start: new Date().toISOString(),
          current_period_end: params.billing_period === "lifetime"
            ? null
            : new Date(
                Date.now() + (params.billing_period === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
          trial_start: params.trial_end ? new Date().toISOString() : null,
          trial_end: params.trial_end ?? null,
          provider: params.provider ?? "revenuecat",
          provider_subscription_id: params.provider_subscription_id ?? null,
          provider_customer_id: params.provider_customer_id ?? null,
          points_multiplier: 1.5, // Will be updated by plan tier
          cancel_at_period_end: false,
          cancelled_at: null,
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PREMIUM_KEY] });
      queryClient.invalidateQueries({ queryKey: ["auth"] }); // Refresh profile with new premium_tier
    },
  });
}

// ============================================================
// Cancel subscription
// ============================================================

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const userId = user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("user_subscriptions")
        .update({
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserSubscription;
    },
    onSuccess: (data) => {
      analytics.track("subscription_cancelled", {
        plan_id: (data as any)?.plan_id,
        cancel_at_period_end: true,
      });
      queryClient.invalidateQueries({ queryKey: [PREMIUM_KEY] });
    },
  });
}

// ============================================================
// Restore subscription (re-subscribe after cancellation)
// ============================================================

export function useRestoreSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const userId = user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("user_subscriptions")
        .update({
          cancel_at_period_end: false,
          cancelled_at: null,
          status: "active",
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PREMIUM_KEY] });
    },
  });
}
