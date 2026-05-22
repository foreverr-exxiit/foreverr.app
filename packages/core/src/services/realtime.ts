/**
 * Real-time Collaboration Service for ǝterrn
 *
 * Provides hooks for real-time features:
 * - Presence tracking (who's viewing a memorial)
 * - Real-time tribute updates
 * - Collaborative editing indicators
 * - Live candle/flower counts
 *
 * Built on Supabase Realtime channels.
 *
 * Usage:
 *   import { usePresence, useRealtimeUpdates } from "@foreverr/core";
 *   const { viewers } = usePresence("memorial", memorialId);
 *   useRealtimeUpdates("tributes", memorialId, (tribute) => { ... });
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────

export interface PresenceUser {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: string;
  status: "viewing" | "editing" | "typing";
}

interface PresenceState {
  /** Users currently present on this resource */
  viewers: PresenceUser[];
  /** Number of active viewers */
  viewerCount: number;
  /** Whether the current user is tracked as present */
  isTracking: boolean;
  /** Update the current user's status */
  updateStatus: (status: PresenceUser["status"]) => void;
}

interface RealtimeEvent<T = Record<string, unknown>> {
  type: "INSERT" | "UPDATE" | "DELETE";
  old: T | null;
  new: T | null;
}

// ── usePresence ────────────────────────────────────────────

/**
 * Track and display who's currently viewing/editing a resource.
 *
 * @param resourceType - Type of resource (e.g., "memorial", "tribute", "family-tree")
 * @param resourceId - ID of the specific resource
 * @param currentUser - Current user info for presence tracking
 */
export function usePresence(
  resourceType: string,
  resourceId: string | undefined,
  currentUser?: { id: string; displayName: string; avatarUrl?: string }
): PresenceState {
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!resourceId) return;

    const channelName = `presence:${resourceType}:${resourceId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users: PresenceUser[] = [];
        for (const key of Object.keys(state)) {
          const presences = state[key] as unknown as PresenceUser[];
          for (const presence of presences) {
            // Deduplicate by userId
            if (!users.some((u) => u.userId === presence.userId)) {
              users.push(presence);
            }
          }
        }
        setViewers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUser) {
          await channel.track({
            userId: currentUser.id,
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
            joinedAt: new Date().toISOString(),
            status: "viewing" as const,
          });
          setIsTracking(true);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
      setIsTracking(false);
    };
  }, [resourceType, resourceId, currentUser?.id]);

  const updateStatus = useCallback(
    (status: PresenceUser["status"]) => {
      if (channelRef.current && currentUser) {
        channelRef.current.track({
          userId: currentUser.id,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          joinedAt: new Date().toISOString(),
          status,
        });
      }
    },
    [currentUser?.id]
  );

  return {
    viewers,
    viewerCount: viewers.length,
    isTracking,
    updateStatus,
  };
}

// ── useRealtimeUpdates ─────────────────────────────────────

/**
 * Subscribe to real-time INSERT/UPDATE/DELETE events on a table,
 * filtered by a specific column value.
 *
 * @param table - Database table name
 * @param filterColumn - Column to filter on (e.g., "memorial_id")
 * @param filterValue - Value to match
 * @param onEvent - Callback when an event occurs
 */
export function useRealtimeUpdates<T = Record<string, unknown>>(
  table: string,
  filterColumn: string,
  filterValue: string | undefined,
  onEvent: (event: RealtimeEvent<T>) => void
): { isSubscribed: boolean } {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!filterValue) return;

    const channel = supabase
      .channel(`realtime:${table}:${filterColumn}:${filterValue}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `${filterColumn}=eq.${filterValue}`,
        },
        (payload) => {
          callbackRef.current({
            type: payload.eventType as RealtimeEvent["type"],
            old: (payload.old as T) || null,
            new: (payload.new as T) || null,
          });
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [table, filterColumn, filterValue]);

  return { isSubscribed };
}

// ── useRealtimeTributes ────────────────────────────────────

/**
 * Real-time tribute updates for a memorial.
 * Automatically adds new tributes and updates existing ones.
 */
export function useRealtimeTributes(
  memorialId: string | undefined,
  callbacks: {
    onNewTribute?: (tribute: Record<string, unknown>) => void;
    onTributeUpdated?: (tribute: Record<string, unknown>) => void;
    onTributeDeleted?: (id: string) => void;
  }
) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  return useRealtimeUpdates("tributes", "memorial_id", memorialId, (event) => {
    if (event.type === "INSERT" && event.new) {
      callbacksRef.current.onNewTribute?.(event.new);
    } else if (event.type === "UPDATE" && event.new) {
      callbacksRef.current.onTributeUpdated?.(event.new);
    } else if (event.type === "DELETE" && event.old) {
      callbacksRef.current.onTributeDeleted?.((event.old as any).id);
    }
  });
}

// ── useRealtimeGifts ───────────────────────────────────────

/**
 * Real-time gift/flower updates for a memorial.
 */
export function useRealtimeGifts(
  memorialId: string | undefined,
  onNewGift?: (gift: Record<string, unknown>) => void
) {
  const callbackRef = useRef(onNewGift);
  callbackRef.current = onNewGift;

  return useRealtimeUpdates(
    "gift_transactions",
    "memorial_id",
    memorialId,
    (event) => {
      if (event.type === "INSERT" && event.new) {
        callbackRef.current?.(event.new);
      }
    }
  );
}

// ── useRealtimeNotifications ───────────────────────────────

/**
 * Real-time notification updates for the current user.
 */
export function useRealtimeNotifications(
  userId: string | undefined,
  onNewNotification?: (notification: Record<string, unknown>) => void
) {
  const callbackRef = useRef(onNewNotification);
  callbackRef.current = onNewNotification;

  return useRealtimeUpdates(
    "notifications",
    "user_id",
    userId,
    (event) => {
      if (event.type === "INSERT" && event.new) {
        callbackRef.current?.(event.new);
      }
    }
  );
}

// ── useTypingIndicator ─────────────────────────────────────

/**
 * Typing indicator for chat or collaborative features.
 * Broadcasts and listens for typing events on a channel.
 */
export function useTypingIndicator(
  channelId: string | undefined,
  currentUserId?: string
): {
  typingUsers: string[];
  startTyping: () => void;
  stopTyping: () => void;
} {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase.channel(`typing:${channelId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const userId = payload.payload?.userId as string;
        if (userId && userId !== currentUserId) {
          setTypingUsers((prev) =>
            prev.includes(userId) ? prev : [...prev, userId]
          );

          // Auto-remove after 3 seconds of no typing
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== userId));
          }, 3000);
        }
      })
      .on("broadcast", { event: "stop_typing" }, (payload) => {
        const userId = payload.payload?.userId as string;
        if (userId) {
          setTypingUsers((prev) => prev.filter((u) => u !== userId));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [channelId, currentUserId]);

  const startTyping = useCallback(() => {
    if (channelRef.current && currentUserId) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId },
      });

      // Auto-stop after 3 seconds
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.send({
          type: "broadcast",
          event: "stop_typing",
          payload: { userId: currentUserId },
        });
      }, 3000);
    }
  }, [currentUserId]);

  const stopTyping = useCallback(() => {
    if (channelRef.current && currentUserId) {
      channelRef.current.send({
        type: "broadcast",
        event: "stop_typing",
        payload: { userId: currentUserId },
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [currentUserId]);

  return { typingUsers, startTyping, stopTyping };
}

// ── useLiveCount ───────────────────────────────────────────

/**
 * Real-time counter that updates when rows are added/removed.
 * Useful for live candle counts, flower counts, etc.
 */
export function useLiveCount(
  table: string,
  filterColumn: string,
  filterValue: string | undefined,
  initialCount: number = 0
): { count: number; isLive: boolean } {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const { isSubscribed } = useRealtimeUpdates(
    table,
    filterColumn,
    filterValue,
    (event) => {
      if (event.type === "INSERT") {
        setCount((c) => c + 1);
      } else if (event.type === "DELETE") {
        setCount((c) => Math.max(0, c - 1));
      }
    }
  );

  return { count, isLive: isSubscribed };
}
