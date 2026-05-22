import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";

const REL_KEY = "relationship-lifecycle";

// ============================================================
// Types
// ============================================================

export type RelationshipEventType =
  | "engagement" | "wedding" | "anniversary" | "separation" | "divorce"
  | "reconciliation" | "remarriage" | "vow_renewal" | "civil_union"
  | "widowed" | "custody_arrangement";

export type RelationshipStatus =
  | "active" | "separated" | "divorced" | "widowed" | "annulled" | "reconciled" | "ended";

export type WeddingRelationshipStatus =
  | "engaged" | "married" | "separated" | "divorced" | "widowed" | "renewed" | "other";

export type EmotionalTag =
  | "joyful" | "bittersweet" | "difficult" | "hopeful" | "peaceful" | "grateful";

export interface RelationshipEvent {
  id: string;
  user_id: string;
  connection_id: string | null;
  wedding_page_id: string | null;
  event_type: RelationshipEventType;
  event_date: string;
  title: string;
  description: string | null;
  is_private: boolean;
  media_urls: string[];
  emotional_tag: EmotionalTag | null;
  created_at: string;
}

export interface WeddingPageChapter {
  id: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  chapter: number;
  relationship_status: WeddingRelationshipStatus;
  status: string;
  previous_page_id: string | null;
  next_page_id: string | null;
  cover_photo_url: string | null;
}

// ============================================================
// Constants
// ============================================================

export const RELATIONSHIP_EVENT_TYPES: { key: RelationshipEventType; label: string; emoji: string; color: string }[] = [
  { key: "engagement",          label: "Engagement",          emoji: "💍", color: "#EC4899" },
  { key: "wedding",             label: "Wedding",             emoji: "💒", color: "#F59E0B" },
  { key: "anniversary",         label: "Anniversary",         emoji: "🥂", color: "#D97706" },
  { key: "separation",          label: "Separation",          emoji: "💔", color: "#6B7280" },
  { key: "divorce",             label: "Divorce",             emoji: "📄", color: "#6B7280" },
  { key: "reconciliation",      label: "Reconciliation",      emoji: "🤝", color: "#10B981" },
  { key: "remarriage",          label: "Remarriage",          emoji: "💒", color: "#7C3AED" },
  { key: "vow_renewal",         label: "Vow Renewal",         emoji: "💕", color: "#EC4899" },
  { key: "civil_union",         label: "Civil Union",         emoji: "🤝", color: "#3B82F6" },
  { key: "widowed",             label: "Widowed",             emoji: "🕊️", color: "#6B7280" },
  { key: "custody_arrangement", label: "Custody Arrangement", emoji: "👨‍👩‍👧", color: "#8B5CF6" },
];

export const RELATIONSHIP_STATUSES: { key: RelationshipStatus; label: string }[] = [
  { key: "active",      label: "Active"      },
  { key: "separated",   label: "Separated"   },
  { key: "divorced",    label: "Divorced"    },
  { key: "widowed",     label: "Widowed"     },
  { key: "annulled",    label: "Annulled"    },
  { key: "reconciled",  label: "Reconciled"  },
  { key: "ended",       label: "Ended"       },
];

export const EMOTIONAL_TAGS: { key: EmotionalTag; label: string; emoji: string; color: string }[] = [
  { key: "joyful",      label: "Joyful",      emoji: "😄", color: "#F59E0B" },
  { key: "bittersweet", label: "Bittersweet", emoji: "🥲", color: "#8B5CF6" },
  { key: "difficult",   label: "Difficult",   emoji: "😔", color: "#6B7280" },
  { key: "hopeful",     label: "Hopeful",     emoji: "🌅", color: "#10B981" },
  { key: "peaceful",    label: "Peaceful",    emoji: "☮️", color: "#3B82F6" },
  { key: "grateful",    label: "Grateful",    emoji: "🙏", color: "#EC4899" },
];

// ============================================================
// useRelationshipEvents — all events for a user
// ============================================================

export function useRelationshipEvents(userId: string | undefined) {
  return useQuery({
    queryKey: [REL_KEY, "events", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("relationship_events")
        .select("*")
        .eq("user_id", userId!)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RelationshipEvent[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// useCreateRelationshipEvent
// ============================================================

export function useCreateRelationshipEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      user_id: string;
      connection_id?: string;
      wedding_page_id?: string;
      event_type: RelationshipEventType;
      event_date: string;
      title: string;
      description?: string;
      is_private?: boolean;
      media_urls?: string[];
      emotional_tag?: EmotionalTag;
    }) => {
      const { data, error } = await (supabase as any)
        .from("relationship_events")
        .insert({
          ...params,
          is_private: params.is_private ?? true,
          media_urls: params.media_urls ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      awardEngagementPoints(params.user_id, "add_relationship_event");
      return data as RelationshipEvent;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [REL_KEY, "events", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: [REL_KEY, "timeline", variables.user_id] });
    },
  });
}

// ============================================================
// useUpdateRelationshipStatus — update a family tree connection status
// ============================================================

export function useUpdateRelationshipStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      connectionId: string;
      userId: string;
      status: RelationshipStatus;
      statusDate?: string;
      statusNote?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("family_tree_connections")
        .update({
          status: params.status,
          status_date: params.statusDate ?? new Date().toISOString().split("T")[0],
          status_note: params.statusNote ?? null,
          is_current: params.status === "active" || params.status === "reconciled",
          end_date: ["divorced", "widowed", "annulled", "ended"].includes(params.status)
            ? (params.statusDate ?? new Date().toISOString().split("T")[0])
            : null,
        })
        .eq("id", params.connectionId)
        .select()
        .single();
      if (error) throw error;
      awardEngagementPoints(params.userId, "update_relationship_status");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-connections"] });
      queryClient.invalidateQueries({ queryKey: [REL_KEY] });
    },
  });
}

// ============================================================
// useArchiveWeddingPage — archive on divorce/separation
// ============================================================

export function useArchiveWeddingPage() {
  const queryClient = useQueryClient();
  const createEvent = useCreateRelationshipEvent();

  return useMutation({
    mutationFn: async (params: {
      pageId: string;
      userId: string;
      reason: WeddingRelationshipStatus;
      eventDate: string;
      note?: string;
    }) => {
      // Update wedding page status
      const { data, error } = await (supabase as any)
        .from("wedding_pages")
        .update({
          status: "archived",
          relationship_status: params.reason,
          status_changed_at: new Date().toISOString(),
        })
        .eq("id", params.pageId)
        .select()
        .single();
      if (error) throw error;

      // Create relationship event
      const eventType = params.reason === "divorced" ? "divorce"
        : params.reason === "separated" ? "separation"
        : params.reason === "widowed" ? "widowed"
        : "divorce";

      await createEvent.mutateAsync({
        user_id: params.userId,
        wedding_page_id: params.pageId,
        event_type: eventType,
        event_date: params.eventDate,
        title: `Relationship status changed to ${params.reason}`,
        description: params.note,
        is_private: true,
        emotional_tag: "difficult",
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding-pages"] });
      queryClient.invalidateQueries({ queryKey: [REL_KEY] });
    },
  });
}

// ============================================================
// useLinkWeddingPages — create chapter chain between pages
// ============================================================

export function useLinkWeddingPages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      currentPageId: string;
      previousPageId: string;
      userId: string;
    }) => {
      // Get the previous page to determine chapter number
      const { data: prevPage, error: prevErr } = await (supabase as any)
        .from("wedding_pages")
        .select("chapter")
        .eq("id", params.previousPageId)
        .single();
      if (prevErr) throw prevErr;

      const nextChapter = (prevPage?.chapter ?? 1) + 1;

      // Update current page with previous link and chapter
      const { error: e1 } = await (supabase as any)
        .from("wedding_pages")
        .update({
          previous_page_id: params.previousPageId,
          chapter: nextChapter,
        })
        .eq("id", params.currentPageId);
      if (e1) throw e1;

      // Update previous page with next link
      const { error: e2 } = await (supabase as any)
        .from("wedding_pages")
        .update({ next_page_id: params.currentPageId })
        .eq("id", params.previousPageId);
      if (e2) throw e2;

      awardEngagementPoints(params.userId, "link_wedding_chapters");
      return { chapter: nextChapter };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding-pages"] });
      queryClient.invalidateQueries({ queryKey: [REL_KEY, "chapters"] });
    },
  });
}

// ============================================================
// useWeddingPageChapters — linked wedding pages as ordered chapters
// ============================================================

export function useWeddingPageChapters(userId: string | undefined) {
  return useQuery({
    queryKey: [REL_KEY, "chapters", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("wedding_pages")
        .select("id, partner1_name, partner2_name, wedding_date, chapter, relationship_status, status, previous_page_id, next_page_id, cover_photo_url")
        .or(`partner1_user_id.eq.${userId},partner2_user_id.eq.${userId}`)
        .order("chapter", { ascending: true });
      if (error) throw error;
      return (data ?? []) as WeddingPageChapter[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// useRelationshipTimeline — merged chronological view
// ============================================================

export function useRelationshipTimeline(userId: string | undefined) {
  const { data: events } = useRelationshipEvents(userId);
  const { data: chapters } = useWeddingPageChapters(userId);

  return useMemo(() => {
    if (!events) return [];

    const timeline = events.map((event) => {
      const typeInfo = RELATIONSHIP_EVENT_TYPES.find((t) => t.key === event.event_type);
      const chapter = chapters?.find(
        (c) => c.id === event.wedding_page_id,
      );

      return {
        ...event,
        emoji: typeInfo?.emoji ?? "❤️",
        color: typeInfo?.color ?? "#EC4899",
        typeLabel: typeInfo?.label ?? event.event_type,
        chapter: chapter?.chapter ?? null,
        partnerNames: chapter
          ? `${chapter.partner1_name} & ${chapter.partner2_name}`
          : null,
      };
    });

    return timeline.sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    );
  }, [events, chapters]);
}

// ============================================================
// useRelationshipHistory — summary of relationship status changes
// ============================================================

export function useRelationshipHistory(userId: string | undefined) {
  return useQuery({
    queryKey: [REL_KEY, "history", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("relationship_events")
        .select("*, wedding:wedding_pages!relationship_events_wedding_page_id_fkey(partner1_name, partner2_name, chapter)")
        .eq("user_id", userId!)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (RelationshipEvent & {
        wedding: { partner1_name: string; partner2_name: string; chapter: number } | null;
      })[];
    },
    enabled: !!userId,
  });
}
