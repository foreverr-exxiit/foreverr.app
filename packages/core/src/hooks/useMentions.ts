import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type Mention = Tables["mentions"]["Row"];
type Profile = Tables["profiles"]["Row"];

const MENTIONS_KEY = "mentions";

type MentionWithProfiles = Mention & {
  mentionedUser: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
  mentioner: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
};

// ============================================================
// Mentions where user is tagged
// ============================================================

export function useMyMentions(userId: string | undefined) {
  return useQuery({
    queryKey: [MENTIONS_KEY, "my", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentions")
        .select(
          "*, mentionedUser:profiles!mentions_mentioned_user_id_fkey(id, username, display_name, avatar_url), mentioner:profiles!mentions_mentioned_by_fkey(id, username, display_name, avatar_url)"
        )
        .eq("mentioned_user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as MentionWithProfiles[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Create mention
// ============================================================

export function useCreateMention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mentionedUserId: string;
      mentionedBy: string;
      contextType: string;
      contextId: string;
    }) => {
      const { error } = await supabase.from("mentions").insert({
        mentioned_user_id: params.mentionedUserId,
        mentioned_by: params.mentionedBy,
        context_type: params.contextType,
        context_id: params.contextId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENTIONS_KEY] });
    },
  });
}

// ============================================================
// Mark mention as read
// ============================================================

export function useMarkMentionRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mentionId: string) => {
      const { error } = await supabase
        .from("mentions")
        .update({ is_read: true })
        .eq("id", mentionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENTIONS_KEY] });
    },
  });
}

// ============================================================
// Parse @username mentions from text
// ============================================================

export function parseMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
}
