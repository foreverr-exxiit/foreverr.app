import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const FUNDRAISER_V2_KEY = "fundraise-campaigns-v2";

// ─── Types ────────────────────────────────────────────────────
interface CreateFundraiserInput {
  memorialId: string;
  creatorId: string;
  title: string;
  description?: string;
  goalCents: number;
  beneficiaryName?: string;
  beneficiaryRelation?: string;
  expiresAt?: string;
  payoutMethod?: string;
}

interface DonateInput {
  fundraiserId: string;
  amountCents: number;
}

// ─── useCreateFundraiser ──────────────────────────────────────
/** Create a fundraiser with trust level validation (level >= 2 required) */
export function useCreateFundraiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFundraiserInput) => {
      // Check trust level first
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("trust_level")
        .eq("id", input.creatorId)
        .single() as any;

      if (profileErr) throw profileErr;

      const trustLevel = profile?.trust_level ?? 1;
      if (trustLevel < 2) {
        throw new Error("You need to be at least Verified (Trust Level 2) to create a fundraiser.");
      }

      // Check fundraise limit from trust_levels
      const { data: trustInfo, error: trustErr } = await supabase
        .from("trust_levels")
        .select("max_fundraise_amount_cents")
        .eq("id", trustLevel)
        .single() as any;

      if (trustErr) throw trustErr;

      const maxAmount = trustInfo?.max_fundraise_amount_cents ?? 0;
      if (maxAmount > 0 && input.goalCents > maxAmount) {
        throw new Error(
          `Your trust level allows a maximum fundraise goal of $${(maxAmount / 100).toFixed(2)}.`
        );
      }

      const { data, error } = await supabase
        .from("fundraise_campaigns_v2")
        .insert({
          memorial_id: input.memorialId,
          creator_id: input.creatorId,
          title: input.title,
          description: input.description ?? null,
          goal_cents: input.goalCents,
          beneficiary_name: input.beneficiaryName ?? null,
          beneficiary_relation: input.beneficiaryRelation ?? null,
          trust_level: trustLevel,
          expires_at: input.expiresAt ?? null,
          payout_method: input.payoutMethod ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUNDRAISER_V2_KEY] });
    },
  });
}

// ─── useMyFundraisers ─────────────────────────────────────────
/** Fetch fundraisers created by a user */
export function useMyFundraisers(userId: string | undefined) {
  return useQuery({
    queryKey: [FUNDRAISER_V2_KEY, "my", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraise_campaigns_v2")
        .select("*")
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false }) as any;

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

// ─── useFundraiserDetails ─────────────────────────────────────
/** Fetch a single fundraiser by ID */
export function useFundraiserDetails(id: string | undefined) {
  return useQuery({
    queryKey: [FUNDRAISER_V2_KEY, "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraise_campaigns_v2")
        .select("*, creator:profiles!fundraise_campaigns_v2_creator_id_fkey(id, display_name, avatar_url)")
        .eq("id", id!)
        .single() as any;

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

// ─── useDonateToFundraiser ────────────────────────────────────
/** Donate to a fundraiser — atomically increments raised_cents and donor_count via RPC */
export function useDonateToFundraiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DonateInput) => {
      // Use atomic RPC to avoid race conditions on concurrent donations
      const { data, error } = await (supabase as any).rpc(
        "increment_fundraiser_donation",
        {
          p_fundraiser_id: input.fundraiserId,
          p_amount_cents: input.amountCents,
        }
      );

      if (error) throw error;
      return data as any;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [FUNDRAISER_V2_KEY] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [FUNDRAISER_V2_KEY, "detail", data.id] });
      }
    },
  });
}
