/**
 * Live Broadcast Hook — Simple "Go Live" experience for ǝterrn
 *
 * Makes broadcasting so simple a 10-year-old can do it.
 *
 * Usage (3 steps):
 *   const broadcast = useLiveBroadcast();
 *
 *   // Step 1: Go live
 *   await broadcast.goLive({
 *     title: "Celebrating Mom's 80th Birthday",
 *     memorialId: "abc-123",
 *   });
 *
 *   // Step 2: During broadcast
 *   broadcast.sendReaction("heart");       // Send live reaction
 *   broadcast.sendMessage("Love you mom"); // Send live chat message
 *   broadcast.inviteSpeaker(userId);       // Invite someone to speak
 *   broadcast.muteParticipant(userId);     // Mute someone
 *
 *   // Step 3: End
 *   await broadcast.endBroadcast();
 *
 * Viewers just do:
 *   await broadcast.joinBroadcast(roomId);
 *   broadcast.raiseHand();     // Ask to speak
 *   broadcast.sendReaction("candle");
 *   await broadcast.leaveBroadcast();
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Alert, Share, Platform } from "react-native";
import { supabase } from "../supabase/client";
import { useAuth } from "./useAuth";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────

export type BroadcastStatus = "idle" | "preparing" | "live" | "ending" | "ended";
export type BroadcastRole = "host" | "co-host" | "speaker" | "listener";
export type LiveReaction = "heart" | "candle" | "flower" | "pray" | "clap" | "cry";

export interface BroadcastConfig {
  title: string;
  memorialId: string;
  description?: string;
  /** "audio" for voice, "video" for video, "hybrid" for both */
  broadcastType?: "audio" | "video" | "hybrid";
  /** Max number of viewers (default: unlimited) */
  maxViewers?: number;
  /** Schedule for later (ISO date string) */
  scheduledFor?: string;
  /** Allow viewers to request to speak */
  allowHandRaise?: boolean;
  /** Enable live chat */
  enableChat?: boolean;
  /** Enable reactions */
  enableReactions?: boolean;
  /** Auto-record the broadcast */
  autoRecord?: boolean;
}

export interface LiveChatMessage {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  message: string;
  timestamp: string;
  isPinned?: boolean;
}

export interface LiveReactionEvent {
  userId: string;
  reaction: LiveReaction;
  timestamp: string;
}

interface BroadcastState {
  /** Current status of the broadcast */
  status: BroadcastStatus;
  /** The current room ID (once live) */
  roomId: string | null;
  /** Current user's role */
  role: BroadcastRole;
  /** Number of active viewers */
  viewerCount: number;
  /** Total reactions received */
  reactionCount: number;
  /** Duration in seconds since going live */
  duration: number;
  /** Is the user's mic muted */
  isMuted: boolean;
  /** Is the user's camera off */
  isCameraOff: boolean;
  /** Live chat messages */
  chatMessages: LiveChatMessage[];
  /** Recent reactions (last 20) */
  recentReactions: LiveReactionEvent[];
  /** Error message if any */
  error: string | null;
  /** Is loading */
  isLoading: boolean;
}

// ── Helper: reaction icons ──────────────────────────────────

export const REACTION_MAP: Record<LiveReaction, { emoji: string; label: string }> = {
  heart: { emoji: "\u2764\ufe0f", label: "Love" },
  candle: { emoji: "\ud83d\udd6f\ufe0f", label: "Light a Candle" },
  flower: { emoji: "\ud83c\udf39", label: "Send Flowers" },
  pray: { emoji: "\ud83d\ude4f", label: "Prayer" },
  clap: { emoji: "\ud83d\udc4f", label: "Applause" },
  cry: { emoji: "\ud83d\ude22", label: "Tears" },
};

// ── The Hook ───────────────────────────────────────────────

export function useLiveBroadcast() {
  const { user, profile } = useAuth();

  const [state, setState] = useState<BroadcastState>({
    status: "idle",
    roomId: null,
    role: "listener",
    viewerCount: 0,
    reactionCount: 0,
    duration: 0,
    isMuted: false,
    isCameraOff: true,
    chatMessages: [],
    recentReactions: [],
    error: null,
    isLoading: false,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const liveStartRef = useRef<number>(0);

  // ── Duration timer ──
  useEffect(() => {
    if (state.status === "live") {
      liveStartRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: Math.floor((Date.now() - liveStartRef.current) / 1000),
        }));
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [state.status]);

  // ── Clean up on unmount ──
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // ── Subscribe to realtime broadcast events ──
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`broadcast:${roomId}`);
      channelRef.current = channel;

      channel
        // Live chat messages
        .on("broadcast", { event: "chat" }, (payload) => {
          const msg = payload.payload as LiveChatMessage;
          setState((prev) => ({
            ...prev,
            chatMessages: [...prev.chatMessages.slice(-99), msg],
          }));
        })
        // Live reactions
        .on("broadcast", { event: "reaction" }, (payload) => {
          const reaction = payload.payload as LiveReactionEvent;
          setState((prev) => ({
            ...prev,
            reactionCount: prev.reactionCount + 1,
            recentReactions: [...prev.recentReactions.slice(-19), reaction],
          }));
        })
        // Viewer count updates
        .on("broadcast", { event: "viewer_count" }, (payload) => {
          setState((prev) => ({
            ...prev,
            viewerCount: (payload.payload as any).count ?? prev.viewerCount,
          }));
        })
        // Room status changes (ended, etc)
        .on("broadcast", { event: "status" }, (payload) => {
          const newStatus = (payload.payload as any).status;
          if (newStatus === "ended") {
            setState((prev) => ({ ...prev, status: "ended" }));
          }
        })
        // Participant changes via postgres realtime
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "live_room_participants",
            filter: `room_id=eq.${roomId}`,
          },
          () => {
            // Refetch participant count
            supabase
              .from("live_room_participants")
              .select("id", { count: "exact", head: true })
              .eq("room_id", roomId)
              .eq("is_active", true)
              .then(({ count }) => {
                setState((prev) => ({
                  ...prev,
                  viewerCount: count ?? prev.viewerCount,
                }));
              });
          }
        )
        .subscribe();
    },
    []
  );

  // ────────────────────────────────────────────────────────
  // HOST ACTIONS
  // ────────────────────────────────────────────────────────

  /** Go live — creates a room and starts broadcasting */
  const goLive = useCallback(
    async (config: BroadcastConfig) => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: "You need to sign in to go live" }));
        return;
      }

      setState((prev) => ({ ...prev, status: "preparing", isLoading: true, error: null }));

      try {
        // Create the live room
        const { data: room, error } = await (supabase as any)
          .from("live_rooms")
          .insert({
            host_id: user.id,
            memorial_id: config.memorialId,
            title: config.title,
            description: config.description ?? "",
            room_type: config.broadcastType ?? "audio",
            scheduled_at: config.scheduledFor ?? new Date().toISOString(),
            max_participants: config.maxViewers,
            status: config.scheduledFor ? "scheduled" : "live",
            settings: {
              allowHandRaise: config.allowHandRaise ?? true,
              enableChat: config.enableChat ?? true,
              enableReactions: config.enableReactions ?? true,
              autoRecord: config.autoRecord ?? false,
            },
          })
          .select("*")
          .single();

        if (error) throw error;

        // Add host as participant
        await (supabase as any).from("live_room_participants").insert({
          room_id: room.id,
          user_id: user.id,
          role: "host",
          is_speaking: false,
          is_active: true,
        });

        // Subscribe to realtime events
        subscribeToRoom(room.id);

        setState((prev) => ({
          ...prev,
          status: config.scheduledFor ? "idle" : "live",
          roomId: room.id,
          role: "host",
          viewerCount: 1,
          isLoading: false,
        }));

        return room.id as string;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: "idle",
          isLoading: false,
          error: err.message ?? "Failed to go live",
        }));
      }
    },
    [user?.id, subscribeToRoom]
  );

  /** End the broadcast */
  const endBroadcast = useCallback(async () => {
    if (!state.roomId) return;

    setState((prev) => ({ ...prev, status: "ending", isLoading: true }));

    try {
      // Broadcast end event
      channelRef.current?.send({
        type: "broadcast",
        event: "status",
        payload: { status: "ended" },
      });

      // Update room status
      await (supabase as any)
        .from("live_rooms")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", state.roomId);

      // Mark all participants inactive
      await (supabase as any)
        .from("live_room_participants")
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq("room_id", state.roomId);

      // Clean up channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        status: "ended",
        isLoading: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message ?? "Failed to end broadcast",
      }));
    }
  }, [state.roomId]);

  /** Invite a user to become a speaker */
  const inviteSpeaker = useCallback(
    async (userId: string) => {
      if (!state.roomId || state.role !== "host") return;

      await (supabase as any)
        .from("live_room_participants")
        .update({ role: "speaker" })
        .eq("room_id", state.roomId)
        .eq("user_id", userId);
    },
    [state.roomId, state.role]
  );

  /** Mute a participant (host only) */
  const muteParticipant = useCallback(
    async (userId: string) => {
      if (!state.roomId || state.role !== "host") return;

      await (supabase as any)
        .from("live_room_participants")
        .update({ is_speaking: false })
        .eq("room_id", state.roomId)
        .eq("user_id", userId);
    },
    [state.roomId, state.role]
  );

  /** Remove a participant (host only) */
  const removeParticipant = useCallback(
    async (userId: string) => {
      if (!state.roomId || state.role !== "host") return;

      await (supabase as any)
        .from("live_room_participants")
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq("room_id", state.roomId)
        .eq("user_id", userId);
    },
    [state.roomId, state.role]
  );

  /** Pin a chat message */
  const pinMessage = useCallback(
    (messageId: string) => {
      if (!channelRef.current) return;
      channelRef.current.send({
        type: "broadcast",
        event: "pin_message",
        payload: { messageId },
      });
    },
    []
  );

  // ────────────────────────────────────────────────────────
  // VIEWER ACTIONS
  // ────────────────────────────────────────────────────────

  /** Join an existing broadcast as a viewer */
  const joinBroadcast = useCallback(
    async (roomId: string) => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: "Sign in to join live events" }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Check if room is still live
        const { data: room, error: roomError } = await (supabase as any)
          .from("live_rooms")
          .select("id, status, max_participants, title")
          .eq("id", roomId)
          .single();

        if (roomError) throw roomError;
        if (room.status === "ended") throw new Error("This broadcast has ended");

        // Check capacity
        const { count } = await (supabase as any)
          .from("live_room_participants")
          .select("id", { count: "exact", head: true })
          .eq("room_id", roomId)
          .eq("is_active", true);

        if (room.max_participants && (count ?? 0) >= room.max_participants) {
          throw new Error("This broadcast is full");
        }

        // Join as listener
        await (supabase as any).from("live_room_participants").upsert(
          {
            room_id: roomId,
            user_id: user.id,
            role: "listener",
            is_active: true,
            joined_at: new Date().toISOString(),
          },
          { onConflict: "room_id,user_id" }
        );

        // Subscribe to realtime events
        subscribeToRoom(roomId);

        setState((prev) => ({
          ...prev,
          status: "live",
          roomId,
          role: "listener",
          viewerCount: (count ?? 0) + 1,
          isLoading: false,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message ?? "Failed to join broadcast",
        }));
      }
    },
    [user?.id, subscribeToRoom]
  );

  /** Leave the broadcast */
  const leaveBroadcast = useCallback(async () => {
    if (!state.roomId || !user?.id) return;

    try {
      await (supabase as any)
        .from("live_room_participants")
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq("room_id", state.roomId)
        .eq("user_id", user.id);

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setState({
        status: "idle",
        roomId: null,
        role: "listener",
        viewerCount: 0,
        reactionCount: 0,
        duration: 0,
        isMuted: false,
        isCameraOff: true,
        chatMessages: [],
        recentReactions: [],
        error: null,
        isLoading: false,
      });
    } catch {}
  }, [state.roomId, user?.id]);

  /** Raise hand to request to speak */
  const raiseHand = useCallback(async () => {
    if (!state.roomId || !user?.id) return;

    await (supabase as any)
      .from("live_room_participants")
      .update({ hand_raised: true })
      .eq("room_id", state.roomId)
      .eq("user_id", user.id);
  }, [state.roomId, user?.id]);

  /** Lower hand */
  const lowerHand = useCallback(async () => {
    if (!state.roomId || !user?.id) return;

    await (supabase as any)
      .from("live_room_participants")
      .update({ hand_raised: false })
      .eq("room_id", state.roomId)
      .eq("user_id", user.id);
  }, [state.roomId, user?.id]);

  // ────────────────────────────────────────────────────────
  // SHARED ACTIONS (host + viewers)
  // ────────────────────────────────────────────────────────

  /** Send a live chat message */
  const sendMessage = useCallback(
    (message: string) => {
      if (!channelRef.current || !user?.id) return;

      const chatMsg: LiveChatMessage = {
        id: `${Date.now()}-${user.id}`,
        userId: user.id,
        displayName: profile?.display_name ?? "User",
        avatarUrl: profile?.avatar_url ?? undefined,
        message,
        timestamp: new Date().toISOString(),
      };

      channelRef.current.send({
        type: "broadcast",
        event: "chat",
        payload: chatMsg,
      });

      // Add to local state immediately
      setState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages.slice(-99), chatMsg],
      }));
    },
    [user?.id, profile]
  );

  /** Send a live reaction */
  const sendReaction = useCallback(
    (reaction: LiveReaction) => {
      if (!channelRef.current || !user?.id) return;

      channelRef.current.send({
        type: "broadcast",
        event: "reaction",
        payload: {
          userId: user.id,
          reaction,
          timestamp: new Date().toISOString(),
        },
      });

      setState((prev) => ({
        ...prev,
        reactionCount: prev.reactionCount + 1,
      }));
    },
    [user?.id]
  );

  /** Toggle mute (self) */
  const toggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  /** Toggle camera */
  const toggleCamera = useCallback(() => {
    setState((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  }, []);

  /** Share broadcast link */
  const shareBroadcast = useCallback(async () => {
    if (!state.roomId) return;
    try {
      await Share.share({
        message: `Join me live on ǝterrn! https://eterrn.app/live/${state.roomId}`,
      });
    } catch {}
  }, [state.roomId]);

  /** Format duration as MM:SS or HH:MM:SS */
  const formattedDuration = useCallback(() => {
    const hrs = Math.floor(state.duration / 3600);
    const mins = Math.floor((state.duration % 3600) / 60);
    const secs = state.duration % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return hrs > 0
      ? `${hrs}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;
  }, [state.duration]);

  return {
    // State
    ...state,
    formattedDuration: formattedDuration(),

    // Host actions
    goLive,
    endBroadcast,
    inviteSpeaker,
    muteParticipant,
    removeParticipant,
    pinMessage,

    // Viewer actions
    joinBroadcast,
    leaveBroadcast,
    raiseHand,
    lowerHand,

    // Shared actions
    sendMessage,
    sendReaction,
    toggleMute,
    toggleCamera,
    shareBroadcast,
  };
}

// ── Quick launch helpers ───────────────────────────────────

/**
 * Pre-built broadcast configs for common memorial events.
 * Usage: goLive(broadcastPresets.memorialService(memorialId, title))
 */
export const broadcastPresets = {
  /** Memorial/celebration of life service */
  memorialService: (memorialId: string, title: string): BroadcastConfig => ({
    title,
    memorialId,
    description: "Live memorial service — join us as we celebrate a beautiful life",
    broadcastType: "hybrid",
    allowHandRaise: true,
    enableChat: true,
    enableReactions: true,
    autoRecord: true,
  }),

  /** Candle lighting ceremony */
  candleLighting: (memorialId: string): BroadcastConfig => ({
    title: "Live Candle Lighting Ceremony",
    memorialId,
    description: "Light a candle together in remembrance",
    broadcastType: "video",
    allowHandRaise: false,
    enableChat: true,
    enableReactions: true,
  }),

  /** Birthday celebration / living tribute */
  birthdayCelebration: (memorialId: string, name: string): BroadcastConfig => ({
    title: `${name}'s Birthday Celebration`,
    memorialId,
    description: `Join us in celebrating ${name}! Share your wishes and memories.`,
    broadcastType: "hybrid",
    allowHandRaise: true,
    enableChat: true,
    enableReactions: true,
  }),

  /** Story sharing / memory circle */
  memoryCircle: (memorialId: string): BroadcastConfig => ({
    title: "Memory Sharing Circle",
    memorialId,
    description: "Take turns sharing your favorite memories and stories",
    broadcastType: "audio",
    allowHandRaise: true,
    enableChat: true,
    enableReactions: true,
    maxViewers: 50,
  }),

  /** Annual remembrance */
  annualRemembrance: (memorialId: string, name: string): BroadcastConfig => ({
    title: `Remembering ${name}`,
    memorialId,
    description: `Annual remembrance gathering for ${name}`,
    broadcastType: "hybrid",
    allowHandRaise: true,
    enableChat: true,
    enableReactions: true,
    autoRecord: true,
  }),
};
