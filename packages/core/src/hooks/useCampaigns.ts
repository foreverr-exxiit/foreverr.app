import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

const CAMPAIGN_KEY = "campaigns";

// ============================================================
// Active campaigns (currently running)
// ============================================================

export function useActiveCampaigns() {
  return useQuery({
    queryKey: [CAMPAIGN_KEY, "active"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", today!)
        .gte("end_date", today!)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });
}

// ============================================================
// Single campaign
// ============================================================

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: [CAMPAIGN_KEY, "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
}

// ============================================================
// All upcoming campaigns
// ============================================================

export function useUpcomingCampaigns() {
  return useQuery({
    queryKey: [CAMPAIGN_KEY, "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .gte("start_date", today!)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });
}
