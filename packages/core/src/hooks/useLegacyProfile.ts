import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserShareStats = Database["public"]["Tables"]["user_share_stats"]["Row"];

const LEGACY_KEY = "legacy-profile";

// ============================================================
// Get legacy profile for a user
// ============================================================

export function useLegacyProfile(userId: string | undefined) {
  return useQuery({
    queryKey: [LEGACY_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}

// ============================================================
// Update legacy profile fields
// ============================================================

export function useUpdateLegacyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      legacy_message?: string;
      legacy_link_slug?: string;
      is_living_tribute_enabled?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (input.legacy_message !== undefined) updates.legacy_message = input.legacy_message;
      if (input.legacy_link_slug !== undefined) updates.legacy_link_slug = input.legacy_link_slug;
      if (input.is_living_tribute_enabled !== undefined) updates.is_living_tribute_enabled = input.is_living_tribute_enabled;

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", input.userId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [LEGACY_KEY, vars.userId] });
      qc.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

// ============================================================
// Get user share stats
// ============================================================

export function useUserShareStats(userId: string | undefined) {
  return useQuery({
    queryKey: [LEGACY_KEY, "share-stats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_share_stats")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data ?? null) as UserShareStats | null;
    },
    enabled: !!userId,
  });
}

// ============================================================
// Get legacy profile by slug (public access)
// ============================================================

export function useLegacyProfileBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: [LEGACY_KEY, "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("legacy_link_slug", slug!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!slug,
  });
}
