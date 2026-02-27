import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const POINTS_KEY = "legacy-points";

// ============================================================
// Types
// ============================================================

interface PointBalance {
  id: string;
  user_id: string;
  total_earned: number;
  total_spent: number;
  current_balance: number;
  level: number;
  level_name: string;
  next_level_at: number;
  updated_at: string;
}

interface PointEntry {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

interface LegacyLevel {
  id: number;
  level_name: string;
  min_points: number;
  icon: string;
  color: string;
  perks: string[];
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_earned: number;
  current_balance: number;
  level: number;
  level_name: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface AwardPointsParams {
  user_id: string;
  points: number;
  action_type: string;
  reference_id?: string;
  description?: string;
}

interface RedeemPointsParams {
  user_id: string;
  points_spent: number;
  redemption_type: string;
  reference_id?: string;
}

// ============================================================
// My point balance
// ============================================================

export function useMyPointBalance(userId: string | undefined) {
  return useQuery({
    queryKey: [POINTS_KEY, "balance", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legacy_point_balances" as any)
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as unknown as PointBalance) ?? null;
    },
    enabled: !!userId,
  });
}

// ============================================================
// Point history (paginated)
// ============================================================

const PAGE_SIZE = 20;

export function usePointHistory(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [POINTS_KEY, "history", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("legacy_points" as any)
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return (data ?? []) as unknown as PointEntry[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
    enabled: !!userId,
  });
}

// ============================================================
// Award points
// ============================================================

export function useAwardPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: AwardPointsParams) => {
      const { data, error } = await supabase
        .from("legacy_points" as any)
        .insert({
          user_id: params.user_id,
          points: params.points,
          action_type: params.action_type,
          reference_id: params.reference_id ?? null,
          description: params.description ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PointEntry;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY, "balance", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY, "history", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY, "leaderboard"] });
    },
  });
}

// ============================================================
// Legacy levels catalog
// ============================================================

export function useLegacyLevels() {
  return useQuery({
    queryKey: [POINTS_KEY, "levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legacy_levels" as any)
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as LegacyLevel[];
    },
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
}

// ============================================================
// Redeem points
// ============================================================

export function useRedeemPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: RedeemPointsParams) => {
      const { data, error } = await supabase
        .from("point_redemptions" as any)
        .insert({
          user_id: params.user_id,
          points_spent: params.points_spent,
          redemption_type: params.redemption_type,
          reference_id: params.reference_id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY, "balance", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY, "history", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY, "leaderboard"] });
    },
  });
}

// ============================================================
// Point leaderboard (top 20)
// ============================================================

export function usePointLeaderboard() {
  return useQuery({
    queryKey: [POINTS_KEY, "leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legacy_point_balances" as any)
        .select("*, profiles!legacy_point_balances_user_id_fkey(display_name, avatar_url)")
        .order("total_earned", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as LeaderboardEntry[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
