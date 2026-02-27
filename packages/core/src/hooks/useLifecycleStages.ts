import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  useLifecycleStages — fetch all lifecycle stages ordered            */
/* ------------------------------------------------------------------ */
export function useLifecycleStages() {
  return useQuery({
    queryKey: ["lifecycle-stages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lifecycle_stages")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Array<{
        id: number;
        name: string;
        description: string;
        icon: string;
        color: string;
        features: string[];
        sort_order: number;
      }>;
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useLifecycleContent — query memorials/tributes by lifecycle stage  */
/* ------------------------------------------------------------------ */
export function useLifecycleContent(stage?: string) {
  return useQuery({
    queryKey: ["lifecycle-content", stage],
    enabled: !!stage,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("memorials")
        .select("id, full_name, slug, cover_photo_url, lifecycle_stage, created_at")
        .eq("lifecycle_stage", stage)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as any[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useCelebrityMemorialRequests — fetch user's own requests           */
/* ------------------------------------------------------------------ */
export function useCelebrityMemorialRequests() {
  return useQuery({
    queryKey: ["celebrity-memorial-requests"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("celebrity_memorial_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useRequestCelebrityMemorial — submit a new request                 */
/* ------------------------------------------------------------------ */
export function useRequestCelebrityMemorial() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      celebrity_name: string;
      wikipedia_url?: string;
      known_for?: string;
      date_of_birth?: string;
      date_of_death?: string;
      notes?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("celebrity_memorial_requests")
        .insert({
          requested_by: user.id,
          celebrity_name: input.celebrity_name,
          wikipedia_url: input.wikipedia_url ?? null,
          known_for: input.known_for ?? null,
          date_of_birth: input.date_of_birth ?? null,
          date_of_death: input.date_of_death ?? null,
          notes: input.notes ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["celebrity-memorial-requests"] });
    },
  });
}
