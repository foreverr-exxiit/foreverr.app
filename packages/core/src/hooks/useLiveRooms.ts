import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../supabase/client";

const LIVE_ROOMS_KEY = "live-rooms";
const LIVE_ROOM_KEY = "live-room";
const ROOM_PARTICIPANTS_KEY = "room-participants";

/** Fetch active live rooms */
export function useLiveRooms(memorialId?: string) {
  return useQuery({
    queryKey: [LIVE_ROOMS_KEY, memorialId],
    queryFn: async () => {
      let query = supabase
        .from("live_rooms")
        .select("*, host:profiles!live_rooms_host_id_fkey(id, username, display_name, avatar_url), memorial:memorials!live_rooms_memorial_id_fkey(id, first_name, last_name)")
        .in("status", ["scheduled", "live"]);

      if (memorialId) {
        query = query.eq("memorial_id", memorialId);
      }

      const { data, error } = await query
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/** Fetch single live room */
export function useLiveRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: [LIVE_ROOM_KEY, roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_rooms")
        .select("*, host:profiles!live_rooms_host_id_fkey(id, username, display_name, avatar_url), memorial:memorials!live_rooms_memorial_id_fkey(id, first_name, last_name)")
        .eq("id", roomId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });
}

/** Fetch participants of a live room */
export function useLiveRoomParticipants(roomId: string | undefined) {
  return useQuery({
    queryKey: [ROOM_PARTICIPANTS_KEY, roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_room_participants")
        .select("*, user:profiles!live_room_participants_user_id_fkey(id, username, display_name, avatar_url)")
        .eq("room_id", roomId!)
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!roomId,
    refetchInterval: 10000, // Refresh every 10 sec
  });
}

/** Create a live room */
export function useCreateLiveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      hostId: string;
      memorialId: string;
      title: string;
      description?: string;
      roomType?: string;
      scheduledAt?: string;
      maxParticipants?: number;
    }) => {
      const { data, error } = await supabase
        .from("live_rooms")
        .insert({
          host_id: params.hostId,
          memorial_id: params.memorialId,
          title: params.title,
          description: params.description,
          room_type: params.roomType ?? "audio",
          scheduled_at: params.scheduledAt ?? new Date().toISOString(),
          max_participants: params.maxParticipants,
          status: params.scheduledAt ? "scheduled" : "live",
        })
        .select("*")
        .single();
      if (error) throw error;

      // Add host as participant with speaker role
      const room = data as any;
      await supabase.from("live_room_participants").insert({
        room_id: room.id,
        user_id: params.hostId,
        role: "host",
        is_speaking: false,
        is_active: true,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIVE_ROOMS_KEY] });
    },
  });
}

/** Join a live room */
export function useJoinLiveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomId: string; userId: string }) => {
      // Check capacity
      const { data: room } = await supabase
        .from("live_rooms")
        .select("max_participants, participant_count")
        .eq("id", params.roomId)
        .single();

      if (room?.max_participants && (room.participant_count ?? 0) >= room.max_participants) {
        throw new Error("Room is full");
      }

      const { error } = await supabase.from("live_room_participants").upsert(
        {
          room_id: params.roomId,
          user_id: params.userId,
          role: "listener",
          is_active: true,
          joined_at: new Date().toISOString(),
        },
        { onConflict: "room_id,user_id" }
      );
      if (error) throw error;

      // Increment participant count
      await (supabase.rpc as any)("increment_participant_count", { room_id_param: params.roomId });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [ROOM_PARTICIPANTS_KEY, vars.roomId] });
      queryClient.invalidateQueries({ queryKey: [LIVE_ROOM_KEY, vars.roomId] });
    },
  });
}

/** Leave a live room */
export function useLeaveLiveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomId: string; userId: string }) => {
      const { error } = await supabase
        .from("live_room_participants")
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq("room_id", params.roomId)
        .eq("user_id", params.userId);
      if (error) throw error;

      // Decrement participant count
      await (supabase.rpc as any)("decrement_participant_count", { room_id_param: params.roomId });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [ROOM_PARTICIPANTS_KEY, vars.roomId] });
      queryClient.invalidateQueries({ queryKey: [LIVE_ROOM_KEY, vars.roomId] });
    },
  });
}

/** Raise/lower hand */
export function useToggleHand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomId: string; userId: string; raised: boolean }) => {
      const { error } = await supabase
        .from("live_room_participants")
        .update({ hand_raised: params.raised })
        .eq("room_id", params.roomId)
        .eq("user_id", params.userId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [ROOM_PARTICIPANTS_KEY, vars.roomId] });
    },
  });
}

/** End a live room (host only) */
export function useEndLiveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomId: string }) => {
      const { error } = await supabase
        .from("live_rooms")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", params.roomId);
      if (error) throw error;

      // Mark all participants as inactive
      await supabase
        .from("live_room_participants")
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq("room_id", params.roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIVE_ROOMS_KEY] });
    },
  });
}

/** Subscribe to realtime updates for a live room */
export function useLiveRoomRealtime(roomId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`live-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_room_participants", filter: `room_id=eq.${roomId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [ROOM_PARTICIPANTS_KEY, roomId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_rooms", filter: `id=eq.${roomId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [LIVE_ROOM_KEY, roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);
}
