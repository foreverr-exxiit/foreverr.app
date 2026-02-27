import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const TRUST_KEY = "trust";
const CLAIMS_KEY = "memorial-claims";
const MANAGERS_KEY = "memorial-managers";

// ─── Types ────────────────────────────────────────────────────
interface TrustLevelInfo {
  trust_level: number;
  name: string;
  description: string;
  can_create_memorial: boolean;
  can_fundraise: boolean;
  can_claim_memorial: boolean;
  can_moderate: boolean;
  max_fundraise_amount_cents: number;
  verification_required: boolean;
}

interface SubmitClaimInput {
  memorialId: string;
  claimerId: string;
  relationship: string;
  evidenceType?: string;
  evidenceUrl?: string;
  evidenceNote?: string;
}

interface AddManagerInput {
  memorialId: string;
  userId: string;
  role: string;
  grantedBy: string;
}

// ─── useMyTrustLevel ──────────────────────────────────────────
/** Fetch the current user's trust level with perks from trust_levels table */
export function useMyTrustLevel(userId: string | undefined) {
  return useQuery({
    queryKey: [TRUST_KEY, "my-level", userId],
    queryFn: async () => {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("trust_level")
        .eq("id", userId!)
        .single() as any;

      if (profileErr) throw profileErr;

      const level = profile?.trust_level ?? 1;

      const { data: trustInfo, error: trustErr } = await supabase
        .from("trust_levels")
        .select("*")
        .eq("id", level)
        .single() as any;

      if (trustErr) throw trustErr;

      return {
        trust_level: level,
        name: trustInfo.name,
        description: trustInfo.description,
        can_create_memorial: trustInfo.can_create_memorial,
        can_fundraise: trustInfo.can_fundraise,
        can_claim_memorial: trustInfo.can_claim_memorial,
        can_moderate: trustInfo.can_moderate,
        max_fundraise_amount_cents: trustInfo.max_fundraise_amount_cents,
        verification_required: trustInfo.verification_required,
      } as TrustLevelInfo;
    },
    enabled: !!userId,
  });
}

// ─── useSubmitClaim ───────────────────────────────────────────
/** Submit a claim for a memorial */
export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitClaimInput) => {
      const { data, error } = await supabase
        .from("memorial_claims")
        .insert({
          memorial_id: input.memorialId,
          claimer_id: input.claimerId,
          relationship: input.relationship,
          evidence_type: input.evidenceType ?? null,
          evidence_url: input.evidenceUrl ?? null,
          evidence_note: input.evidenceNote ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [CLAIMS_KEY, vars.memorialId] });
    },
  });
}

// ─── useMemorialClaims ────────────────────────────────────────
/** Fetch all claims for a memorial */
export function useMemorialClaims(memorialId: string | undefined) {
  return useQuery({
    queryKey: [CLAIMS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorial_claims")
        .select("*, claimer:profiles!memorial_claims_claimer_id_fkey(id, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .order("created_at", { ascending: false }) as any;

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!memorialId,
  });
}

// ─── useMemorialManagers ──────────────────────────────────────
/** Fetch managers for a memorial with profile info */
export function useMemorialManagers(memorialId: string | undefined) {
  return useQuery({
    queryKey: [MANAGERS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorial_managers")
        .select("*, user:profiles!memorial_managers_user_id_fkey(id, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .order("created_at", { ascending: true }) as any;

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!memorialId,
  });
}

// ─── useAddManager ────────────────────────────────────────────
/** Add a manager to a memorial */
export function useAddManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddManagerInput) => {
      const { data, error } = await supabase
        .from("memorial_managers")
        .insert({
          memorial_id: input.memorialId,
          user_id: input.userId,
          role: input.role,
          granted_by: input.grantedBy,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [MANAGERS_KEY, vars.memorialId] });
    },
  });
}

// ─── useRemoveManager ─────────────────────────────────────────
/** Remove a manager from a memorial */
export function useRemoveManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ managerId, memorialId }: { managerId: string; memorialId: string }) => {
      const { error } = await supabase
        .from("memorial_managers")
        .delete()
        .eq("id", managerId) as any;

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [MANAGERS_KEY, vars.memorialId] });
    },
  });
}

// ─── useCanFundraise ──────────────────────────────────────────
/** Check if a user's trust level allows fundraising (level >= 2) */
export function useCanFundraise(userId: string | undefined) {
  return useQuery({
    queryKey: [TRUST_KEY, "can-fundraise", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("trust_level")
        .eq("id", userId!)
        .single() as any;

      if (error) throw error;
      return (data?.trust_level ?? 1) >= 2;
    },
    enabled: !!userId,
  });
}
