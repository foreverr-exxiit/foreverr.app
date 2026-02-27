import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  useDirectoryImportBatches — fetch all import batches               */
/* ------------------------------------------------------------------ */
export function useDirectoryImportBatches() {
  return useQuery({
    queryKey: ["directory-import-batches"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("directory_import_batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useStartDirectoryImport — create a new import batch                */
/* ------------------------------------------------------------------ */
export function useStartDirectoryImport() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      source: string;
      category: string;
      region?: string;
      total_listings?: number;
    }) => {
      const { data, error } = await (supabase as any)
        .from("directory_import_batches")
        .insert({
          source: input.source,
          category: input.category,
          region: input.region ?? null,
          total_listings: input.total_listings ?? 0,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["directory-import-batches"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useDirectoryByRegion — query directory_listings by region/category */
/* ------------------------------------------------------------------ */
export function useDirectoryByRegion(region?: string, category?: string) {
  return useQuery({
    queryKey: ["directory-by-region", region, category],
    enabled: !!(region || category),
    queryFn: async () => {
      let query = (supabase as any)
        .from("directory_listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (region) {
        query = query.ilike("city", `%${region}%`);
      }
      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });
}
