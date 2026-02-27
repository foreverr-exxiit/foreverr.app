import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type AppreciationLetter = Database["public"]["Tables"]["appreciation_letters"]["Row"];
type AppreciationLetterInsert = Database["public"]["Tables"]["appreciation_letters"]["Insert"];

const LETTER_KEY = "appreciation-letters";

// ============================================================
// My sent appreciation letters
// ============================================================

export function useMyAppreciationLetters(userId: string | undefined) {
  return useQuery({
    queryKey: [LETTER_KEY, "sent", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appreciation_letters")
        .select("*, recipient:recipient_user_id(id, display_name, avatar_url)")
        .eq("author_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Received appreciation letters
// ============================================================

export function useReceivedAppreciationLetters(userId: string | undefined) {
  return useQuery({
    queryKey: [LETTER_KEY, "received", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appreciation_letters")
        .select("*, author:author_id(id, display_name, avatar_url)")
        .eq("recipient_user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Create appreciation letter
// ============================================================

export function useCreateAppreciationLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AppreciationLetterInsert) => {
      const { data, error } = await supabase
        .from("appreciation_letters")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as AppreciationLetter;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LETTER_KEY, "sent", vars.author_id] });
    },
  });
}

// ============================================================
// Mark letter as read
// ============================================================

export function useMarkAppreciationLetterRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ letterId, userId }: { letterId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("appreciation_letters")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        } as any)
        .eq("id", letterId)
        .select()
        .single();
      if (error) throw error;
      return data as AppreciationLetter;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LETTER_KEY, "received", vars.userId] });
    },
  });
}
