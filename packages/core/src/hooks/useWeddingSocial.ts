import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { captureException } from "../services/errorReporting";

/* ------------------------------------------------------------------ */
/*  Wedding social — message wall (guestbook) + RSVP.                  */
/*  Backend: wedding_messages + wedding_rsvps (migration 00036).       */
/* ------------------------------------------------------------------ */

const WEDDING_KEY = "wedding-social";

export interface WeddingMessage {
  id: string;
  wedding_id: string;
  author_id: string | null;
  author_name: string | null;
  content: string;
  media_url: string | null;
  is_anonymous: boolean;
  reaction_count: number;
  created_at: string;
  author?: { display_name: string | null; avatar_url: string | null } | null;
}

export type WeddingRsvpStatus = "attending" | "not_attending" | "maybe" | "pending";

export interface WeddingRsvp {
  id: string;
  wedding_id: string;
  user_id: string | null;
  guest_name: string;
  guest_email: string | null;
  party_size: number;
  dietary_restrictions: string | null;
  status: WeddingRsvpStatus;
  message: string | null;
  created_at: string;
}

/* ── Message wall ─────────────────────────────────────────────────── */

export function useWeddingMessages(weddingId: string | undefined) {
  return useQuery({
    queryKey: [WEDDING_KEY, "messages", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("wedding_messages")
        .select(
          "*, author:profiles!wedding_messages_author_id_fkey(display_name, avatar_url)",
        )
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WeddingMessage[];
    },
  });
}

export function useCreateWeddingMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      weddingId: string;
      authorId: string;
      authorName: string;
      content: string;
      isAnonymous?: boolean;
      mediaUrl?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("wedding_messages")
        .insert({
          wedding_id: input.weddingId,
          author_id: input.authorId,
          author_name: input.isAnonymous ? null : input.authorName,
          content: input.content,
          is_anonymous: input.isAnonymous ?? false,
          media_url: input.mediaUrl ?? null,
          media_type: input.mediaUrl ? "photo" : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as WeddingMessage;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [WEDDING_KEY, "messages", vars.weddingId] });
    },
    onError: (err, vars) => {
      captureException(err, {
        where: "useWeddingSocial.useCreateWeddingMessage",
        wedding_id: vars.weddingId,
      });
    },
  });
}

/* ── RSVP ─────────────────────────────────────────────────────────── */

export function useMyWeddingRsvp(
  weddingId: string | undefined,
  userId: string | undefined,
) {
  return useQuery({
    queryKey: [WEDDING_KEY, "rsvp", weddingId, userId],
    enabled: !!weddingId && !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("wedding_rsvps")
        .select("*")
        .eq("wedding_id", weddingId!)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as WeddingRsvp | null;
    },
  });
}

export function useSubmitWeddingRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      weddingId: string;
      userId: string;
      guestName: string;
      status: WeddingRsvpStatus;
      partySize?: number;
      message?: string;
      dietaryRestrictions?: string;
      existingId?: string;
    }) => {
      const row = {
        wedding_id: input.weddingId,
        user_id: input.userId,
        guest_name: input.guestName,
        status: input.status,
        party_size: input.partySize ?? 1,
        message: input.message ?? null,
        dietary_restrictions: input.dietaryRestrictions ?? null,
        updated_at: new Date().toISOString(),
      };
      // Update in place if the guest already RSVP'd, else insert.
      const q = input.existingId
        ? (supabase as any)
            .from("wedding_rsvps")
            .update(row)
            .eq("id", input.existingId)
            .select()
            .single()
        : (supabase as any)
            .from("wedding_rsvps")
            .insert(row)
            .select()
            .single();
      const { data, error } = await q;
      if (error) throw error;
      return data as WeddingRsvp;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [WEDDING_KEY, "rsvp", vars.weddingId] });
    },
    onError: (err, vars) => {
      captureException(err, {
        where: "useWeddingSocial.useSubmitWeddingRsvp",
        wedding_id: vars.weddingId,
      });
    },
  });
}
