import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Event, EventRsvp, ImportantDate } from "../types/models";

const EVENTS_KEY = "events";
const RSVPS_KEY = "event-rsvps";
const DATES_KEY = "important-dates";

/** Fetch events for a memorial */
export function useMemorialEvents(memorialId: string | undefined) {
  return useQuery({
    queryKey: [EVENTS_KEY, "memorial", memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Event[];
    },
    enabled: !!memorialId,
  });
}

/** Fetch upcoming events the user has RSVP'd to */
export function useMyUpcomingEvents(userId: string | undefined) {
  return useQuery({
    queryKey: [EVENTS_KEY, "my-upcoming", userId],
    queryFn: async () => {
      const { data: rsvps, error: rErr } = await supabase
        .from("event_rsvps")
        .select("event_id")
        .eq("user_id", userId!)
        .in("status", ["going", "maybe"]);
      if (rErr) throw rErr;
      if (!rsvps?.length) return [];

      const eventIds = rsvps.map((r) => r.event_id);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Event[];
    },
    enabled: !!userId,
  });
}

/** Fetch a single event */
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: [EVENTS_KEY, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId!)
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });
}

/** Create an event */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      title: string;
      description?: string;
      type?: string;
      location?: string;
      isVirtual?: boolean;
      virtualLink?: string;
      startDate: string;
      endDate?: string;
      maxAttendees?: number;
    }) => {
      const { data, error } = await supabase
        .from("events")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          title: params.title,
          description: params.description,
          type: params.type ?? "ceremony",
          location: params.location,
          is_virtual: params.isVirtual ?? false,
          virtual_link: params.virtualLink,
          start_date: params.startDate,
          end_date: params.endDate,
          max_attendees: params.maxAttendees,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
}

/** RSVP to an event */
export function useRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { eventId: string; userId: string; status: string; message?: string }) => {
      const { data, error } = await supabase
        .from("event_rsvps")
        .upsert(
          {
            event_id: params.eventId,
            user_id: params.userId,
            status: params.status,
            message: params.message,
          },
          { onConflict: "event_id,user_id" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as EventRsvp;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [RSVPS_KEY, vars.eventId] });
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
}

/** Get RSVPs for an event */
export function useEventRsvps(eventId: string | undefined) {
  return useQuery({
    queryKey: [RSVPS_KEY, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*, user:profiles!event_rsvps_user_id_fkey(id, display_name, avatar_url)")
        .eq("event_id", eventId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRsvp[];
    },
    enabled: !!eventId,
  });
}

/** Get user's RSVP for an event */
export function useMyRsvp(eventId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: [RSVPS_KEY, eventId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId!)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as EventRsvp | null;
    },
    enabled: !!eventId && !!userId,
  });
}

/** Get important dates for a memorial */
export function useImportantDates(memorialId: string | undefined) {
  return useQuery({
    queryKey: [DATES_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("important_dates")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ImportantDate[];
    },
    enabled: !!memorialId,
  });
}
