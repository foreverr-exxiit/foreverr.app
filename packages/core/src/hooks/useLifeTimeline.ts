import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TimelineEventType =
  | "milestone" | "tribute" | "photo" | "memory" | "achievement"
  | "life_event" | "medical" | "travel" | "education" | "career"
  | "relationship" | "spiritual" | "hobby" | "community" | "custom";

export type TimelineSourceType =
  | "manual" | "auto_milestone" | "auto_tribute" | "auto_photo" | "import" | "ai_generated";

export interface TimelineEvent {
  id: string;
  memorial_id: string;
  created_by: string | null;
  event_type: TimelineEventType;
  source_type: TimelineSourceType | null;
  source_id: string | null;
  title: string;
  description: string | null;
  event_date: string | null;
  event_end_date: string | null;
  location: string | null;
  photo_url: string | null;
  media_urls: string[];
  icon: string;
  color: string;
  is_highlight: boolean;
  is_private: boolean;
  sort_date: string | null;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  useLifeTimeline — fetch timeline events for a memorial             */
/* ------------------------------------------------------------------ */
export function useLifeTimeline(memorialId: string | undefined, options?: {
  eventType?: TimelineEventType;
  highlightsOnly?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["life-timeline", memorialId, options],
    enabled: !!memorialId,
    queryFn: async () => {
      let query = (supabase as any)
        .from("life_timeline_events")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("sort_date", { ascending: true });

      if (options?.eventType) {
        query = query.eq("event_type", options.eventType);
      }
      if (options?.highlightsOnly) {
        query = query.eq("is_highlight", true);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as TimelineEvent[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  useTimelineByYear — group timeline events by year                  */
/* ------------------------------------------------------------------ */
export function useTimelineByYear(memorialId: string | undefined) {
  const { data: events, ...rest } = useLifeTimeline(memorialId);

  const byYear = useMemo(() =>
    (events ?? []).reduce<Record<string, TimelineEvent[]>>((acc, event) => {
      const year = event.sort_date
        ? new Date(event.sort_date).getFullYear().toString()
        : "Unknown";
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    }, {}),
  [events]);

  return useMemo(() => ({ ...rest, data: byYear, flatEvents: events }), [rest.isLoading, rest.error, byYear, events]);
}

/* ------------------------------------------------------------------ */
/*  useCreateTimelineEvent — add a manual timeline event               */
/* ------------------------------------------------------------------ */
export function useCreateTimelineEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      memorial_id: string;
      created_by: string;
      event_type: TimelineEventType;
      title: string;
      description?: string;
      event_date?: string;
      event_end_date?: string;
      location?: string;
      photo_url?: string;
      media_urls?: string[];
      icon?: string;
      color?: string;
      is_highlight?: boolean;
      is_private?: boolean;
    }) => {
      const { data, error } = await (supabase as any)
        .from("life_timeline_events")
        .insert({
          memorial_id: input.memorial_id,
          created_by: input.created_by,
          event_type: input.event_type,
          source_type: "manual",
          title: input.title,
          description: input.description ?? null,
          event_date: input.event_date ?? null,
          event_end_date: input.event_end_date ?? null,
          location: input.location ?? null,
          photo_url: input.photo_url ?? null,
          media_urls: input.media_urls ?? [],
          icon: input.icon ?? "calendar",
          color: input.color ?? "#8B5CF6",
          is_highlight: input.is_highlight ?? false,
          is_private: input.is_private ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TimelineEvent;
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["life-timeline", vars.memorial_id] });
      // Award engagement points for creating a timeline event
      if (vars.created_by) {
        awardEngagementPoints(vars.created_by, "create_timeline_event", { referenceId: (data as any)?.id });
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useUpdateTimelineEvent — edit an existing timeline event           */
/* ------------------------------------------------------------------ */
export function useUpdateTimelineEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      memorial_id: string;
      title?: string;
      description?: string;
      event_date?: string;
      location?: string;
      photo_url?: string;
      is_highlight?: boolean;
      is_private?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.event_date !== undefined) updates.event_date = input.event_date;
      if (input.location !== undefined) updates.location = input.location;
      if (input.photo_url !== undefined) updates.photo_url = input.photo_url;
      if (input.is_highlight !== undefined) updates.is_highlight = input.is_highlight;
      if (input.is_private !== undefined) updates.is_private = input.is_private;

      const { data, error } = await (supabase as any)
        .from("life_timeline_events")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data as TimelineEvent;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["life-timeline", vars.memorial_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useDeleteTimelineEvent                                             */
/* ------------------------------------------------------------------ */
export function useDeleteTimelineEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; memorial_id: string }) => {
      const { error } = await (supabase as any)
        .from("life_timeline_events")
        .delete()
        .eq("id", input.id);

      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["life-timeline", vars.memorial_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useTimelineStats — summary stats for a memorial's timeline         */
/* ------------------------------------------------------------------ */
export function useTimelineStats(memorialId: string | undefined) {
  return useQuery({
    queryKey: ["timeline-stats", memorialId],
    enabled: !!memorialId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("life_timeline_events")
        .select("event_type, is_highlight")
        .eq("memorial_id", memorialId!);

      if (error) throw error;

      const events = (data ?? []) as Array<{ event_type: string; is_highlight: boolean }>;
      const totalEvents = events.length;
      const highlights = events.filter((e) => e.is_highlight).length;
      const byType = events.reduce<Record<string, number>>((acc, e) => {
        acc[e.event_type] = (acc[e.event_type] ?? 0) + 1;
        return acc;
      }, {});

      return { totalEvents, highlights, byType };
    },
    staleTime: 10 * 60 * 1000,
  });
}
