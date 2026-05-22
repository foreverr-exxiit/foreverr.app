import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "./useAuth";

const FEATURE_ACCESS_KEY = "feature-access";

// ============================================================
// Types
// ============================================================

export interface FeatureUnlock {
  id: number;
  feature_key: string;
  label: string;
  description: string | null;
  required_level: number;
  required_trust_level: number;
  required_premium_tier: number;
  category: string;
  icon: string | null;
  unlock_message: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface UserFeatureUnlock {
  id: string;
  user_id: string;
  feature_key: string;
  unlocked_at: string;
  seen_notification: boolean;
}

export interface FeatureAccessResult {
  isUnlocked: boolean;
  requiredLevel: number;
  currentLevel: number;
  pointsNeeded: number;
  featureLabel: string;
  featureIcon: string | null;
  unlockMessage: string | null;
}

// ============================================================
// Constants
// ============================================================

export const LEVEL_TIERS = [
  { level: 1, name: "Seedling",  minPoints: 0,     color: "#8BC34A", icon: "🌱" },
  { level: 2, name: "Sprout",    minPoints: 100,   color: "#4CAF50", icon: "🌿" },
  { level: 3, name: "Bloom",     minPoints: 500,   color: "#E91E63", icon: "🌸" },
  { level: 4, name: "Tree",      minPoints: 2000,  color: "#795548", icon: "🌳" },
  { level: 5, name: "Grove",     minPoints: 5000,  color: "#2E7D32", icon: "🌲" },
  { level: 6, name: "Forest",    minPoints: 15000, color: "#1B5E20", icon: "🏔️" },
  { level: 7, name: "Eternal",   minPoints: 50000, color: "#FFD700", icon: "✨" },
] as const;

export const FEATURE_CATEGORIES = [
  "core", "social", "content", "creator", "community", "discovery",
] as const;

// ============================================================
// useFeatureCatalog — fetch all feature unlock definitions
// ============================================================

export function useFeatureCatalog() {
  return useQuery({
    queryKey: [FEATURE_ACCESS_KEY, "catalog"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("feature_unlocks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FeatureUnlock[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour — catalog rarely changes
  });
}

// ============================================================
// useMyUnlockedFeatures — fetch user's unlocked feature keys
// ============================================================

export function useMyUnlockedFeatures(userId: string | undefined) {
  return useQuery({
    queryKey: [FEATURE_ACCESS_KEY, "my-unlocks", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_feature_unlocks")
        .select("*")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []) as UserFeatureUnlock[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// useFeatureAccess — check if a specific feature is unlocked
// ============================================================

export function useFeatureAccess(featureKey: string): FeatureAccessResult {
  const { user } = useAuth();
  const { data: catalog } = useFeatureCatalog();
  const { data: unlocks } = useMyUnlockedFeatures(user?.id);
  const { data: balance } = useQuery({
    queryKey: ["legacy-points", "balance", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("legacy_point_balances")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as { level: number; total_earned: number } | null;
    },
    enabled: !!user?.id,
  });

  return useMemo(() => {
    const feature = catalog?.find((f) => f.feature_key === featureKey);
    const isUnlocked = unlocks?.some((u) => u.feature_key === featureKey) ?? false;
    const currentLevel = balance?.level ?? 1;
    const requiredLevel = feature?.required_level ?? 1;
    const currentPoints = balance?.total_earned ?? 0;
    const nextLevelPoints = LEVEL_TIERS.find((t) => t.level === requiredLevel)?.minPoints ?? 0;
    const pointsNeeded = Math.max(0, nextLevelPoints - currentPoints);

    return {
      isUnlocked,
      requiredLevel,
      currentLevel,
      pointsNeeded,
      featureLabel: feature?.label ?? featureKey,
      featureIcon: feature?.icon ?? null,
      unlockMessage: feature?.unlock_message ?? null,
    };
  }, [featureKey, catalog, unlocks, balance]);
}

// ============================================================
// useFeatureUnlockNotifications — unseen unlock notifications
// ============================================================

export function useFeatureUnlockNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: [FEATURE_ACCESS_KEY, "notifications", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_feature_unlocks")
        .select("*, feature:feature_unlocks!user_feature_unlocks_feature_key_fkey(label, icon, unlock_message, category)")
        .eq("user_id", userId!)
        .eq("seen_notification", false);
      if (error) throw error;
      return (data ?? []) as (UserFeatureUnlock & {
        feature: { label: string; icon: string | null; unlock_message: string | null; category: string } | null;
      })[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// useMarkUnlockSeen — mark an unlock notification as seen
// ============================================================

export function useMarkUnlockSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, featureKey }: { userId: string; featureKey: string }) => {
      const { error } = await (supabase as any)
        .from("user_feature_unlocks")
        .update({ seen_notification: true })
        .eq("user_id", userId)
        .eq("feature_key", featureKey);
      if (error) throw error;
    },
    onSuccess: (_d, variables) => {
      queryClient.invalidateQueries({
        queryKey: [FEATURE_ACCESS_KEY, "notifications", variables.userId],
      });
    },
  });
}

// ============================================================
// useMarkAllUnlocksSeen — mark all unseen notifications as seen
// ============================================================

export function useMarkAllUnlocksSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any)
        .from("user_feature_unlocks")
        .update({ seen_notification: true })
        .eq("user_id", userId)
        .eq("seen_notification", false);
      if (error) throw error;
    },
    onSuccess: (_d, userId) => {
      queryClient.invalidateQueries({
        queryKey: [FEATURE_ACCESS_KEY, "notifications", userId],
      });
    },
  });
}

// ============================================================
// useNextUnlocks — features available at the next level
// ============================================================

export function useNextUnlocks(userId: string | undefined) {
  const { data: catalog } = useFeatureCatalog();
  const { data: balance } = useQuery({
    queryKey: ["legacy-points", "balance", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("legacy_point_balances")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as { level: number; total_earned: number } | null;
    },
    enabled: !!userId,
  });

  return useMemo(() => {
    const currentLevel = balance?.level ?? 1;
    const nextLevel = Math.min(currentLevel + 1, 7);
    const nextLevelFeatures = catalog?.filter((f) => f.required_level === nextLevel) ?? [];
    const nextLevelInfo = LEVEL_TIERS.find((t) => t.level === nextLevel);
    const currentPoints = balance?.total_earned ?? 0;
    const pointsToNext = Math.max(0, (nextLevelInfo?.minPoints ?? 0) - currentPoints);

    return {
      nextLevel,
      nextLevelName: nextLevelInfo?.name ?? "Unknown",
      nextLevelIcon: nextLevelInfo?.icon ?? "🔒",
      pointsToNext,
      features: nextLevelFeatures,
      isMaxLevel: currentLevel >= 7,
    };
  }, [catalog, balance]);
}

// ============================================================
// useRequireFeatureAccess — wrapper that calls onBlocked if locked
// ============================================================

export function useRequireFeatureAccess(
  featureKey: string,
  onBlocked?: (access: FeatureAccessResult) => void,
) {
  const access = useFeatureAccess(featureKey);

  const requireAccess = useCallback(
    (action: () => void) => {
      if (access.isUnlocked) {
        action();
      } else {
        onBlocked?.(access);
      }
    },
    [access, onBlocked],
  );

  return { ...access, requireAccess };
}

// ============================================================
// useFeaturesByLevel — group features by required level
// ============================================================

export function useFeaturesByLevel() {
  const { data: catalog } = useFeatureCatalog();

  return useMemo(() => {
    if (!catalog) return [];
    const grouped = LEVEL_TIERS.map((tier) => ({
      ...tier,
      features: catalog.filter((f) => f.required_level === tier.level),
    }));
    return grouped;
  }, [catalog]);
}
