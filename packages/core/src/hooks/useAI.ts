import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { AIGeneration } from "../types/models";

const AI_KEY = "ai_generations";

/** Fetch AI generations for a memorial */
export function useAIGenerations(memorialId: string | undefined, type?: string) {
  return useQuery({
    queryKey: [AI_KEY, "list", memorialId, type],
    queryFn: async () => {
      let query = supabase
        .from("ai_generations")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AIGeneration[];
    },
    enabled: !!memorialId,
  });
}

/** Generate AI obituary via Edge Function */
export function useGenerateObituary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memorialId, style }: {
      memorialId: string;
      style: "formal" | "warm" | "celebratory";
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-obituary", {
        body: { memorial_id: memorialId, style },
      });
      if (error) throw error;
      return data as { generation: AIGeneration; text: string };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [AI_KEY, "list", vars.memorialId] });
      queryClient.invalidateQueries({ queryKey: ["memorials", "detail", vars.memorialId] });
    },
  });
}

/** Generate AI biography via Edge Function */
export function useGenerateBiography() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memorialId, style }: {
      memorialId: string;
      style: "chronological" | "thematic";
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-biography", {
        body: { memorial_id: memorialId, style },
      });
      if (error) throw error;
      return data as { generation: AIGeneration; text: string };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [AI_KEY, "list", vars.memorialId] });
      queryClient.invalidateQueries({ queryKey: ["memorials", "detail", vars.memorialId] });
    },
  });
}

/** Generate AI tribute suggestion via Edge Function */
export function useGenerateTribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memorialId, attributes, impact, memories }: {
      memorialId: string;
      attributes?: string;
      impact?: string;
      memories?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-tribute", {
        body: { memorial_id: memorialId, attributes, impact, memories },
      });
      if (error) throw error;
      return data as { generation: AIGeneration; text: string };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [AI_KEY, "list", vars.memorialId] });
    },
  });
}

/** Run content moderation via Edge Function */
export function useModerateContent() {
  return useMutation({
    mutationFn: async ({ content, contentType }: {
      content: string;
      contentType: "tribute" | "comment" | "obituary" | "biography";
    }) => {
      const { data, error } = await supabase.functions.invoke("content-moderation", {
        body: { content, content_type: contentType },
      });
      if (error) throw error;
      return data as { flagged: boolean; categories: Record<string, boolean>; action: "allow" | "flag" | "block" };
    },
  });
}
