import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { FundraisingCampaign, Donation } from "../types/models";

const CAMPAIGNS_KEY = "campaigns";
const DONATIONS_KEY = "donations";

/** Fetch campaigns for a memorial */
export function useMemorialCampaigns(memorialId: string | undefined) {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraising_campaigns")
        .select("*")
        .eq("memorial_id", memorialId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FundraisingCampaign[];
    },
    enabled: !!memorialId,
  });
}

/** Create a campaign */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      title: string;
      description?: string;
      goalCents: number;
      beneficiaryName?: string;
      beneficiaryType?: string;
    }) => {
      const { data, error } = await supabase
        .from("fundraising_campaigns")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          title: params.title,
          description: params.description,
          goal_cents: params.goalCents,
          beneficiary_name: params.beneficiaryName,
          beneficiary_type: params.beneficiaryType,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as FundraisingCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
  });
}

/** Fetch donations for a campaign (donor wall) */
export function useCampaignDonations(campaignId: string | undefined) {
  return useQuery({
    queryKey: [DONATIONS_KEY, campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, donor:profiles!donations_donor_id_fkey(id, display_name, avatar_url)")
        .eq("campaign_id", campaignId!)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Donation[];
    },
    enabled: !!campaignId,
  });
}

/** Create a donation (creates pending record, actual payment via Stripe) */
export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      campaignId: string;
      donorId: string;
      amountCents: number;
      message?: string;
      isAnonymous?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("donations")
        .insert({
          campaign_id: params.campaignId,
          donor_id: params.donorId,
          amount_cents: params.amountCents,
          message: params.message,
          is_anonymous: params.isAnonymous ?? false,
          status: "pending",
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as Donation;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [DONATIONS_KEY, vars.campaignId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
    },
  });
}
