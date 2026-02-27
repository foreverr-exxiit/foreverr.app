import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type PromptCategory = Tables["prompt_categories"]["Row"];
type MemoryPrompt = Tables["memory_prompts"]["Row"];

const PROMPT_CATEGORIES_KEY = "prompt-categories";
const MEMORY_PROMPTS_KEY = "memory-prompts";

// ============================================================
// Prompt Categories
// ============================================================

/** Fetch all active prompt categories */
export function usePromptCategories() {
  return useQuery({
    queryKey: [PROMPT_CATEGORIES_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompt_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PromptCategory[];
    },
  });
}

/** Fetch prompts filtered by category slug */
export function usePromptsByCategory(
  categoryId: string | undefined,
  memorialId: string | undefined
) {
  return useQuery({
    queryKey: [MEMORY_PROMPTS_KEY, "by-category", categoryId, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_prompts")
        .select("*")
        .eq("memorial_id", memorialId!)
        .eq("category_id", categoryId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MemoryPrompt[];
    },
    enabled: !!categoryId && !!memorialId,
  });
}

/** Fetch AI-suggested prompts for a memorial */
export function useAISuggestedPrompts(memorialId: string | undefined) {
  return useQuery({
    queryKey: [MEMORY_PROMPTS_KEY, "ai-suggested", memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_prompts")
        .select("*")
        .eq("memorial_id", memorialId!)
        .eq("is_ai_suggested", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MemoryPrompt[];
    },
    enabled: !!memorialId,
  });
}
