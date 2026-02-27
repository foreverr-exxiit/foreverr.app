import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type InviteLink = Database["public"]["Tables"]["invite_links"]["Row"];
type InviteConversion = Database["public"]["Tables"]["invite_conversions"]["Row"];

const INVITE_KEY = "invites";

// ============================================================
// Create an invite link
// ============================================================

export function useCreateInviteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      creator_id: string;
      invite_type: string;
      target_id?: string;
      message?: string;
      max_uses?: number;
      expires_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("invite_links")
        .insert({
          creator_id: input.creator_id,
          invite_type: input.invite_type,
          target_id: input.target_id ?? null,
          message: input.message ?? null,
          max_uses: input.max_uses ?? null,
          expires_at: input.expires_at ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as InviteLink;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [INVITE_KEY, "mine", vars.creator_id] });
    },
  });
}

// ============================================================
// My invite links
// ============================================================

export function useMyInviteLinks(userId: string | undefined) {
  return useQuery({
    queryKey: [INVITE_KEY, "mine", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invite_links")
        .select("*")
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InviteLink[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Lookup invite by code
// ============================================================

export function useInviteLinkByCode(code: string | undefined) {
  return useQuery({
    queryKey: [INVITE_KEY, "code", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invite_links")
        .select("*")
        .eq("invite_code", code!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as InviteLink;
    },
    enabled: !!code,
  });
}

// ============================================================
// Record a conversion (someone used an invite)
// ============================================================

export function useRecordConversion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      invite_link_id: string;
      converted_user_id?: string;
      conversion_type: string;
    }) => {
      const { data, error } = await supabase
        .from("invite_conversions")
        .insert({
          invite_link_id: input.invite_link_id,
          converted_user_id: input.converted_user_id ?? null,
          conversion_type: input.conversion_type,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as InviteConversion;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INVITE_KEY] });
    },
  });
}

// ============================================================
// Invite analytics for a user
// ============================================================

export function useInviteAnalytics(userId: string | undefined) {
  return useQuery({
    queryKey: [INVITE_KEY, "analytics", userId],
    queryFn: async () => {
      // Get all invite links for the user
      const { data: links, error: linksError } = await supabase
        .from("invite_links")
        .select("*")
        .eq("creator_id", userId!);
      if (linksError) throw linksError;

      const inviteLinks = (links ?? []) as InviteLink[];
      const totalInvites = inviteLinks.length;
      const totalUses = inviteLinks.reduce((sum, l) => sum + (l.use_count ?? 0), 0);
      const activeInvites = inviteLinks.filter((l) => l.is_active).length;

      return {
        totalInvites,
        totalUses,
        activeInvites,
        conversionRate: totalInvites > 0 ? Math.round((totalUses / totalInvites) * 100) : 0,
      };
    },
    enabled: !!userId,
  });
}
