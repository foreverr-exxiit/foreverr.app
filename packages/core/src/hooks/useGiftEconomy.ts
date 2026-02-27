import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const GIFT_KEY = "gifts";

// ============================================================
// Types (using `as any` until types.ts is updated with gift tables)
// ============================================================

type GiftCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon_url: string | null;
  animation_url: string | null;
  ribbon_cost: number;
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type GiftTransaction = {
  id: string;
  sender_id: string;
  recipient_type: string;
  recipient_id: string;
  recipient_user_id: string | null;
  gift_id: string;
  quantity: number;
  message: string | null;
  is_anonymous: boolean;
  amount_cents: number;
  created_at: string;
  gift?: GiftCatalogItem | null;
  sender?: { id: string; username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

type FlowerWall = {
  target_type: string;
  target_id: string;
  total_flowers: number;
  total_candles: number;
  total_gifts: number;
  total_amount_cents: number;
  last_gift_at: string | null;
};

type GiftReaction = {
  id: string;
  gift_transaction_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
};

type LeaderboardEntry = {
  sender_id: string;
  total_quantity: number;
  sender: { id: string; username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

// ============================================================
// 1. Gift Catalog Items
// ============================================================

/** Fetch active gift catalog items, optionally filtered by category */
export function useGiftCatalogItems(category?: string) {
  return useQuery({
    queryKey: [GIFT_KEY, "catalog", category],
    queryFn: async () => {
      let query = supabase
        .from("gift_catalog")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as any as GiftCatalogItem[];
    },
  });
}

// ============================================================
// 2. Send Gift Transaction
// ============================================================

/** Insert a gift_transaction record */
export function useSendGiftTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      senderId: string;
      recipientType: "user" | "memorial" | "living_tribute";
      recipientId: string;
      recipientUserId?: string;
      giftId: string;
      quantity?: number;
      message?: string;
      isAnonymous?: boolean;
      amountCents?: number;
    }) => {
      const { data, error } = await supabase
        .from("gift_transactions")
        .insert({
          sender_id: params.senderId,
          recipient_type: params.recipientType,
          recipient_id: params.recipientId,
          recipient_user_id: params.recipientUserId ?? null,
          gift_id: params.giftId,
          quantity: params.quantity ?? 1,
          message: params.message ?? null,
          is_anonymous: params.isAnonymous ?? false,
          amount_cents: params.amountCents ?? 0,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as any as GiftTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GIFT_KEY] });
    },
  });
}

// ============================================================
// 3. Gifts Received (paginated)
// ============================================================

/** Fetch paginated gifts received by a target (memorial, user, living_tribute) */
export function useGiftsReceived(targetType?: string, targetId?: string) {
  return useInfiniteQuery({
    queryKey: [GIFT_KEY, "received", targetType, targetId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;

      const { data, error } = await supabase
        .from("gift_transactions")
        .select(
          "*, gift:gift_catalog(*), sender:profiles!gift_transactions_sender_id_fkey(id, username, display_name, avatar_url)"
        )
        .eq("recipient_type", targetType!)
        .eq("recipient_id", targetId!)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (error) throw error;
      return {
        data: (data ?? []) as any as GiftTransaction[],
        nextCursor:
          data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!targetType && !!targetId,
  });
}

// ============================================================
// 4. Gifts Sent (paginated)
// ============================================================

/** Fetch paginated gifts sent by a user */
export function useGiftsSent(userId?: string) {
  return useInfiniteQuery({
    queryKey: [GIFT_KEY, "sent", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;

      const { data, error } = await supabase
        .from("gift_transactions")
        .select(
          "*, gift:gift_catalog(*), sender:profiles!gift_transactions_sender_id_fkey(id, username, display_name, avatar_url)"
        )
        .eq("sender_id", userId!)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (error) throw error;
      return {
        data: (data ?? []) as any as GiftTransaction[],
        nextCursor:
          data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

// ============================================================
// 5. Flower Wall (aggregated gift stats for a target)
// ============================================================

/** Fetch the flower_walls record for a target — returns summary stats or null */
export function useFlowerWall(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: [GIFT_KEY, "flower-wall", targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flower_walls")
        .select("*")
        .eq("target_type", targetType!)
        .eq("target_id", targetId!)
        .maybeSingle();

      if (error) throw error;
      return (data as any as FlowerWall) ?? null;
    },
    enabled: !!targetType && !!targetId,
  });
}

// ============================================================
// 6. React to Gift
// ============================================================

/** Insert or toggle a reaction on a gift transaction */
export function useReactToGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      giftTransactionId: string;
      userId: string;
      reactionType: string;
    }) => {
      // Check for existing reaction of this type
      const { data: existing } = await supabase
        .from("gift_reactions")
        .select("id")
        .eq("gift_transaction_id", params.giftTransactionId)
        .eq("user_id", params.userId)
        .eq("reaction_type", params.reactionType)
        .maybeSingle();

      if (existing) {
        // Toggle off — remove the reaction
        const { error } = await supabase
          .from("gift_reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { removed: true } as const;
      }

      // Insert new reaction
      const { data, error } = await supabase
        .from("gift_reactions")
        .insert({
          gift_transaction_id: params.giftTransactionId,
          user_id: params.userId,
          reaction_type: params.reactionType,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { removed: false, reaction: data as any as GiftReaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GIFT_KEY] });
    },
  });
}

// ============================================================
// 7. Gift Leaderboard (top 10 senders for a target)
// ============================================================

/** Group gift_transactions by sender, sum quantities, return top 10 with profile data */
export function useGiftLeaderboard(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: [GIFT_KEY, "leaderboard", targetType, targetId],
    queryFn: async () => {
      // Fetch all transactions for this target to aggregate client-side
      const { data, error } = await supabase
        .from("gift_transactions")
        .select(
          "sender_id, quantity, sender:profiles!gift_transactions_sender_id_fkey(id, username, display_name, avatar_url)"
        )
        .eq("recipient_type", targetType!)
        .eq("recipient_id", targetId!)
        .eq("is_anonymous", false);

      if (error) throw error;

      // Aggregate by sender
      const senderMap = new Map<
        string,
        { total_quantity: number; sender: LeaderboardEntry["sender"] }
      >();

      for (const row of (data ?? []) as any[]) {
        const existing = senderMap.get(row.sender_id);
        if (existing) {
          existing.total_quantity += row.quantity ?? 1;
        } else {
          senderMap.set(row.sender_id, {
            total_quantity: row.quantity ?? 1,
            sender: row.sender ?? null,
          });
        }
      }

      // Sort descending by quantity and take top 10
      const leaderboard: LeaderboardEntry[] = Array.from(senderMap.entries())
        .map(([sender_id, entry]) => ({
          sender_id,
          total_quantity: entry.total_quantity,
          sender: entry.sender,
        }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 10);

      return leaderboard;
    },
    enabled: !!targetType && !!targetId,
  });
}
