import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const DUPLICATES_KEY = "duplicate-reports";

// ─── Types ────────────────────────────────────────────────────
interface ReportDuplicateInput {
  reporterId: string;
  memorialIdA: string;
  memorialIdB: string;
  notes?: string;
}

// ─── useReportDuplicate ───────────────────────────────────────
/** Report two memorials as potential duplicates */
export function useReportDuplicate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReportDuplicateInput) => {
      const { data, error } = await supabase
        .from("duplicate_reports")
        .insert({
          reporter_id: input.reporterId,
          memorial_id_a: input.memorialIdA,
          memorial_id_b: input.memorialIdB,
          notes: input.notes ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DUPLICATES_KEY] });
    },
  });
}

// ─── usePotentialDuplicates ───────────────────────────────────
/** Find memorials with similar names (potential duplicates) */
export function usePotentialDuplicates(memorialId: string | undefined) {
  return useQuery({
    queryKey: [DUPLICATES_KEY, "potential", memorialId],
    queryFn: async () => {
      // First, get the memorial name
      const { data: memorial, error: memErr } = await supabase
        .from("memorials")
        .select("first_name, last_name")
        .eq("id", memorialId!)
        .single() as any;

      if (memErr) throw memErr;
      if (!memorial) return [];

      const firstName = memorial.first_name ?? "";
      const lastName = memorial.last_name ?? "";

      // Search for similar memorials using ilike
      const { data, error } = await supabase
        .from("memorials")
        .select("id, first_name, last_name, cover_image_url, created_at")
        .neq("id", memorialId!)
        .or(`first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%`)
        .limit(10) as any;

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!memorialId,
  });
}

// ─── useMyDuplicateReports ────────────────────────────────────
/** Fetch duplicate reports submitted by a user */
export function useMyDuplicateReports(userId: string | undefined) {
  return useQuery({
    queryKey: [DUPLICATES_KEY, "my-reports", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("duplicate_reports")
        .select("*")
        .eq("reporter_id", userId!)
        .order("created_at", { ascending: false }) as any;

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}
