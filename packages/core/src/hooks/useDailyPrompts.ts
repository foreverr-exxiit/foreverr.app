import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type DailyPrompt = Database["public"]["Tables"]["daily_prompts"]["Row"];
type PromptResponse = Database["public"]["Tables"]["user_prompt_responses"]["Row"];

const PROMPT_KEY = "daily-prompts";
const PAGE_SIZE = 20;

// ============================================================
// Today's prompt (rotates daily based on day-of-year)
// ============================================================

export function useTodayPrompt() {
  return useQuery({
    queryKey: [PROMPT_KEY, "today"],
    queryFn: async () => {
      const { data: prompts, error } = await supabase
        .from("daily_prompts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      if (!prompts || prompts.length === 0) return null;

      // Rotate based on day of year
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      const idx = dayOfYear % prompts.length;
      return prompts[idx] as DailyPrompt;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// ============================================================
// All prompts (optionally filtered by category)
// ============================================================

export function useDailyPrompts(category?: string) {
  return useQuery({
    queryKey: [PROMPT_KEY, "all", category],
    queryFn: async () => {
      let query = supabase
        .from("daily_prompts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (category) {
        query = query.eq("prompt_category", category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DailyPrompt[];
    },
  });
}

// ============================================================
// Responses for a prompt (paginated)
// ============================================================

export function usePromptResponsesList(promptId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [PROMPT_KEY, "responses", promptId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("user_prompt_responses")
        .select("*")
        .eq("prompt_id", promptId!)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      return { data: (data ?? []) as PromptResponse[], nextPage: (data ?? []).length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!promptId,
  });
}

// ============================================================
// My prompt response history
// ============================================================

export function useMyPromptHistory(userId: string | undefined) {
  return useQuery({
    queryKey: [PROMPT_KEY, "my-history", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_prompt_responses")
        .select("*, prompt:prompt_id(prompt_text, prompt_category, icon)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Respond to a prompt
// ============================================================

export function useRespondToPromptDaily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      promptId: string;
      content: string;
      mediaUrl?: string;
      isPublic?: boolean;
      taggedMemorialId?: string;
    }) => {
      const { data, error } = await supabase
        .from("user_prompt_responses")
        .insert({
          user_id: input.userId,
          prompt_id: input.promptId,
          content: input.content,
          media_url: input.mediaUrl,
          is_public: input.isPublic ?? true,
          tagged_memorial_id: input.taggedMemorialId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PromptResponse;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [PROMPT_KEY] });
      queryClient.invalidateQueries({ queryKey: ["engagement-streak"] });
    },
  });
}

// ============================================================
// Public feed of prompt responses
// ============================================================

export function usePromptFeed() {
  return useInfiniteQuery({
    queryKey: [PROMPT_KEY, "feed"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("user_prompt_responses")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      return { data: (data ?? []) as PromptResponse[], nextPage: (data ?? []).length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
