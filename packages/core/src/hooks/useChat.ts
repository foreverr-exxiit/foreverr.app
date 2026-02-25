import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../supabase/client";
import type { Json } from "../supabase/types";
import type { ChatRoom, Message, ChatMember } from "../types/models";

const CHAT_ROOMS_KEY = "chat-rooms";
const MESSAGES_KEY = "messages";
const PAGE_SIZE = 30;

/** Fetch all chat rooms the current user is a member of */
export function useChatRooms(userId: string | undefined) {
  return useQuery({
    queryKey: [CHAT_ROOMS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      // Get rooms user is a member of
      const { data: memberships, error: mErr } = await supabase
        .from("chat_members")
        .select("room_id")
        .eq("user_id", userId);
      if (mErr) throw mErr;
      if (!memberships?.length) return [];

      const roomIds = memberships.map((m) => m.room_id);
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", roomIds)
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ChatRoom[];
    },
    enabled: !!userId,
  });
}

/** Fetch messages for a room with infinite pagination */
export function useMessages(roomId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [MESSAGES_KEY, roomId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)")
        .eq("room_id", roomId!)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      return { data: data ?? [], nextCursor: data?.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!roomId,
  });
}

/** Send a message */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      roomId: string;
      senderId: string;
      content?: string;
      type?: string;
      mediaUrl?: string;
      replyToId?: string;
      pollData?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          room_id: params.roomId,
          sender_id: params.senderId,
          content: params.content,
          type: params.type ?? "text",
          media_url: params.mediaUrl,
          reply_to_id: params.replyToId,
          poll_data: params.pollData as unknown as Json,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as Message;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_KEY, vars.roomId] });
      queryClient.invalidateQueries({ queryKey: [CHAT_ROOMS_KEY] });
    },
  });
}

/** Create a DM room between two users */
export function useCreateDM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; otherUserId: string; otherUserName: string }) => {
      // Check for existing DM
      const { data: myRooms } = await supabase
        .from("chat_members")
        .select("room_id")
        .eq("user_id", params.userId);

      if (myRooms?.length) {
        const roomIds = myRooms.map((r) => r.room_id);
        const { data: existing } = await supabase
          .from("chat_rooms")
          .select("id")
          .in("id", roomIds)
          .eq("type", "direct");

        if (existing?.length) {
          for (const room of existing) {
            const { data: members } = await supabase
              .from("chat_members")
              .select("user_id")
              .eq("room_id", room.id);
            const memberIds = members?.map((m) => m.user_id) ?? [];
            if (memberIds.includes(params.otherUserId) && memberIds.length === 2) {
              return room as unknown as ChatRoom;
            }
          }
        }
      }

      // Create new DM room
      const { data: room, error: rErr } = await supabase
        .from("chat_rooms")
        .insert({ type: "direct", name: params.otherUserName })
        .select("*")
        .single();
      if (rErr) throw rErr;
      const newRoom = room as unknown as ChatRoom;

      // Add both members
      const { error: mErr } = await supabase.from("chat_members").insert([
        { room_id: newRoom.id, user_id: params.userId, role: "admin" },
        { room_id: newRoom.id, user_id: params.otherUserId, role: "member" },
      ]);
      if (mErr) throw mErr;
      return newRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAT_ROOMS_KEY] });
    },
  });
}

/** Mark all messages in a room as read */
export function useMarkChatRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomId: string; userId: string }) => {
      const { error } = await supabase
        .from("chat_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("room_id", params.roomId)
        .eq("user_id", params.userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAT_ROOMS_KEY] });
    },
  });
}

/** Archive/unarchive a chat */
export function useArchiveChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomId: string; archived: boolean }) => {
      const { error } = await supabase
        .from("chat_rooms")
        .update({ is_archived: params.archived })
        .eq("id", params.roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAT_ROOMS_KEY] });
    },
  });
}

/** Subscribe to realtime messages for a room */
export function useChatRealtime(roomId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [MESSAGES_KEY, roomId] });
          queryClient.invalidateQueries({ queryKey: [CHAT_ROOMS_KEY] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);
}
