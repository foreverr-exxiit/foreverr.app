import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// ── Types ────────────────────────────────────────────────────

export type TransferType =
  | "voluntary"
  | "request"
  | "claim_transfer"
  | "stewardship"
  | "purchase"
  | "inheritance"
  | "reclamation";

export type TransferStatus =
  | "pending"
  | "negotiating"
  | "accepted"
  | "cooling_off"
  | "escrow_funded"
  | "completed"
  | "rejected"
  | "cancelled"
  | "expired"
  | "disputed"
  | "admin_review";

export type StewardshipTier =
  | "newcomer"
  | "reliable"
  | "dedicated"
  | "exemplary"
  | "legendary";

export type ValuationTier =
  | "basic"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "priceless";

export type MessageType =
  | "text"
  | "system"
  | "counter_offer"
  | "terms_update"
  | "attachment";

export interface StewardshipTerms {
  duration_days: number;
  auto_return: boolean;
  return_conditions: string[];
  deposit_cents: number;
  allowed_actions: string[];
  restricted_actions: string[];
}

// ── Constants ────────────────────────────────────────────────

export const STEWARDSHIP_TIERS: Record<
  StewardshipTier,
  { name: string; icon: string; color: string; minScore: number }
> = {
  newcomer: { name: "Newcomer Steward", icon: "🌱", color: "#9ca3af", minScore: 0 },
  reliable: { name: "Reliable Steward", icon: "🌿", color: "#22c55e", minScore: 100 },
  dedicated: { name: "Dedicated Steward", icon: "🌳", color: "#3b82f6", minScore: 500 },
  exemplary: { name: "Exemplary Steward", icon: "🏛️", color: "#a855f7", minScore: 2000 },
  legendary: { name: "Legendary Steward", icon: "👑", color: "#f59e0b", minScore: 5000 },
};

export const VALUATION_TIERS: Record<
  ValuationTier,
  { name: string; icon: string; color: string }
> = {
  basic: { name: "Basic", icon: "📄", color: "#9ca3af" },
  bronze: { name: "Bronze", icon: "🥉", color: "#cd7f32" },
  silver: { name: "Silver", icon: "🥈", color: "#c0c0c0" },
  gold: { name: "Gold", icon: "🥇", color: "#ffd700" },
  platinum: { name: "Platinum", icon: "💎", color: "#e5e4e2" },
  priceless: { name: "Priceless", icon: "🏆", color: "#ff6b35" },
};

/** Platform fee percentage per transfer type (applied to purchase price) */
export const TRANSFER_FEES: Record<TransferType, number> = {
  voluntary: 0,
  request: 0,
  claim_transfer: 0,
  stewardship: 0,
  purchase: 15,
  inheritance: 0,
  reclamation: 0,
};

/** Cooling-off period in hours before a transfer finalizes */
export const COOLING_OFF_HOURS: Record<TransferType, number> = {
  voluntary: 24,
  request: 24,
  claim_transfer: 24,
  stewardship: 24,
  purchase: 72,
  inheritance: 168,
  reclamation: 168,
};

/** Guardian subscription tiers */
export const GUARDIAN_TIERS = {
  basic: { name: "Basic", maxPages: 5, feeDiscount: 0, price: 0 },
  plus: { name: "Plus", maxPages: 15, feeDiscount: 10, price: 499 },
  pro: { name: "Pro", maxPages: -1, feeDiscount: 25, price: 1499 },
};

// ── Query key constants ──────────────────────────────────────

const MY_TRANSFERS_KEY = "my-transfers";
const PAGE_TRANSFERS_KEY = "page-transfers";
const TRANSFER_DETAIL_KEY = "transfer-detail";
const PENDING_TRANSFERS_KEY = "pending-transfers";
const TRANSFER_MESSAGES_KEY = "transfer-messages";
const PAGE_VALUATION_KEY = "page-valuation";
const STEWARDSHIP_SCORE_KEY = "stewardship-score";
const STEWARDSHIP_LEADERBOARD_KEY = "stewardship-leaderboard";
const TRANSFER_HISTORY_KEY = "transfer-history";
const SUCCESSOR_DESIGNATIONS_KEY = "successor-designations";
const GUARDIAN_SUBSCRIPTION_KEY = "guardian-subscription";
const STEWARDSHIP_LISTINGS_KEY = "stewardship-listings";
const FEATURED_STEWARDS_KEY = "featured-stewards";
const PAGE_ANALYTICS_KEY = "page-analytics-summary";

const MESSAGES_PAGE_SIZE = 20;

// ══════════════════════════════════════════════════════════════
// Transfer Lifecycle Hooks
// ══════════════════════════════════════════════════════════════

/** Initiate a new page transfer (voluntary, request, purchase, stewardship, etc.)
 *  Calculates platform fees automatically based on transfer type. */
export function useInitiateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pageType: string;
      pageId: string;
      fromUserId: string;
      toUserId?: string;
      transferType: TransferType;
      reason?: string;
      priceCents?: number;
      stewardshipTerms?: StewardshipTerms;
    }) => {
      const feePct = TRANSFER_FEES[params.transferType] ?? 0;
      const price = params.priceCents ?? 0;
      const platformFeeCents = Math.round(price * (feePct / 100));
      const netToSellerCents = price - platformFeeCents;

      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .insert({
          page_type: params.pageType,
          page_id: params.pageId,
          from_user_id: params.fromUserId,
          to_user_id: params.toUserId ?? null,
          transfer_type: params.transferType,
          status: "pending",
          reason: params.reason ?? null,
          price_cents: price,
          platform_fee_cents: platformFeeCents,
          net_to_seller_cents: netToSellerCents,
          stewardship_terms: params.stewardshipTerms ?? null,
          cooling_off_hours: COOLING_OFF_HOURS[params.transferType],
        })
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MY_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PAGE_TRANSFERS_KEY] });
    },
  });
}

/** Respond to a pending transfer (accept, reject, counter-offer, or dispute) */
export function useRespondToTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      transferId: string;
      action: "accept" | "reject" | "counter" | "dispute";
      counterPriceCents?: number;
      counterTerms?: StewardshipTerms;
      userId: string;
    }) => {
      const { transferId, action, counterPriceCents, counterTerms, userId } = params;

      // Fetch current transfer to determine cooling-off behavior
      const { data: transfer, error: fetchErr } = await (supabase as any)
        .from("page_transfers")
        .select("*")
        .eq("id", transferId)
        .single();
      if (fetchErr) throw fetchErr;
      if (!transfer) throw new Error("Transfer not found");

      const t = transfer as any;
      let newStatus: TransferStatus;
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };

      switch (action) {
        case "accept": {
          // Purchases and inheritances go through a cooling-off period
          const coolOffTypes: TransferType[] = ["purchase", "inheritance", "reclamation"];
          newStatus = coolOffTypes.includes(t.transfer_type as TransferType)
            ? "cooling_off"
            : "accepted";
          updates.status = newStatus;
          updates.accepted_at = new Date().toISOString();
          if (newStatus === "cooling_off") {
            const coolHours = COOLING_OFF_HOURS[t.transfer_type as TransferType] ?? 24;
            updates.cooling_off_until = new Date(
              Date.now() + coolHours * 60 * 60 * 1000
            ).toISOString();
          }
          break;
        }
        case "reject": {
          newStatus = "rejected";
          updates.status = newStatus;
          updates.rejected_at = new Date().toISOString();
          break;
        }
        case "counter": {
          newStatus = "negotiating";
          updates.status = newStatus;
          if (counterPriceCents !== undefined) {
            const feePct = TRANSFER_FEES[t.transfer_type as TransferType] ?? 0;
            updates.price_cents = counterPriceCents;
            updates.platform_fee_cents = Math.round(counterPriceCents * (feePct / 100));
            updates.net_to_seller_cents = counterPriceCents - updates.platform_fee_cents;
          }
          if (counterTerms) {
            updates.stewardship_terms = counterTerms;
          }
          // Insert a system message for the counter-offer
          await (supabase as any).from("transfer_messages").insert({
            transfer_id: transferId,
            sender_id: userId,
            content: counterPriceCents !== undefined
              ? `Counter-offer: $${(counterPriceCents / 100).toFixed(2)}`
              : "Updated terms proposed",
            message_type: "counter_offer",
            metadata: { counter_price_cents: counterPriceCents, counter_terms: counterTerms },
          });
          break;
        }
        case "dispute": {
          newStatus = "disputed";
          updates.status = newStatus;
          break;
        }
      }

      const { data: result, error } = await (supabase as any)
        .from("page_transfers")
        .update(updates)
        .eq("id", transferId)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [TRANSFER_DETAIL_KEY, vars.transferId] });
      qc.invalidateQueries({ queryKey: [MY_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PAGE_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PENDING_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSFER_MESSAGES_KEY, vars.transferId] });
    },
  });
}

/** Admin / system-level status update on a transfer */
export function useUpdateTransferStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      transferId: string;
      status: TransferStatus;
      adminNotes?: string;
    }) => {
      const updates: Record<string, any> = {
        status: params.status,
        updated_at: new Date().toISOString(),
      };
      if (params.adminNotes) {
        updates.admin_notes = params.adminNotes;
      }
      if (params.status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .update(updates)
        .eq("id", params.transferId)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [TRANSFER_DETAIL_KEY, vars.transferId] });
      qc.invalidateQueries({ queryKey: [MY_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PAGE_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PENDING_TRANSFERS_KEY] });
    },
  });
}

/** Cancel / withdraw a transfer (sets status to 'cancelled') */
export function useCancelTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { transferId: string }) => {
      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", params.transferId)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [TRANSFER_DETAIL_KEY, vars.transferId] });
      qc.invalidateQueries({ queryKey: [MY_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PAGE_TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [PENDING_TRANSFERS_KEY] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Transfer Query Hooks
// ══════════════════════════════════════════════════════════════

/** Fetch all transfers where the user is sender or recipient, ordered newest first */
export function useMyTransfers(userId?: string) {
  return useQuery({
    queryKey: [MY_TRANSFERS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .select("*, from_user:from_user_id(id, display_name, avatar_url, username), to_user:to_user_id(id, display_name, avatar_url, username)")
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

/** Fetch all transfers for a specific page */
export function usePageTransfers(pageType?: string, pageId?: string) {
  return useQuery({
    queryKey: [PAGE_TRANSFERS_KEY, pageType, pageId],
    queryFn: async () => {
      if (!pageType || !pageId) return [];
      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .select("*, from_user:from_user_id(id, display_name, avatar_url, username), to_user:to_user_id(id, display_name, avatar_url, username)")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!pageType && !!pageId,
  });
}

/** Fetch a single transfer with all fields */
export function useTransferDetail(transferId?: string) {
  return useQuery({
    queryKey: [TRANSFER_DETAIL_KEY, transferId],
    queryFn: async () => {
      if (!transferId) return null;
      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .select("*, from_user:from_user_id(id, display_name, avatar_url, username, is_verified), to_user:to_user_id(id, display_name, avatar_url, username, is_verified)")
        .eq("id", transferId)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!transferId,
  });
}

/** Fetch pending incoming transfers for a user (awaiting their response) */
export function usePendingTransfers(userId?: string) {
  return useQuery({
    queryKey: [PENDING_TRANSFERS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("page_transfers")
        .select("*, from_user:from_user_id(id, display_name, avatar_url, username)")
        .eq("to_user_id", userId)
        .in("status", ["pending", "negotiating"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

// ══════════════════════════════════════════════════════════════
// Negotiation Hooks
// ══════════════════════════════════════════════════════════════

/** Fetch paginated messages for a transfer negotiation thread */
export function useTransferMessages(transferId?: string) {
  return useInfiniteQuery({
    queryKey: [TRANSFER_MESSAGES_KEY, transferId],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      if (!transferId) return { data: [], nextCursor: undefined };
      const { data, error } = await (supabase as any)
        .from("transfer_messages")
        .select("*, sender:sender_id(id, display_name, avatar_url, username)")
        .eq("transfer_id", transferId)
        .order("created_at", { ascending: true })
        .range(pageParam, pageParam + MESSAGES_PAGE_SIZE - 1);
      if (error) throw error;
      return {
        data: (data ?? []) as any[],
        nextCursor:
          (data?.length ?? 0) >= MESSAGES_PAGE_SIZE
            ? pageParam + MESSAGES_PAGE_SIZE
            : undefined,
      };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!transferId,
  });
}

/** Send a message in a transfer negotiation thread */
export function useSendTransferMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      transferId: string;
      senderId: string;
      content: string;
      messageType?: MessageType;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await (supabase as any)
        .from("transfer_messages")
        .insert({
          transfer_id: params.transferId,
          sender_id: params.senderId,
          content: params.content,
          message_type: params.messageType ?? "text",
          metadata: params.metadata ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [TRANSFER_MESSAGES_KEY, vars.transferId] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Valuation Hooks
// ══════════════════════════════════════════════════════════════

/** Fetch the current valuation for a page */
export function usePageValuation(pageType?: string, pageId?: string) {
  return useQuery({
    queryKey: [PAGE_VALUATION_KEY, pageType, pageId],
    queryFn: async () => {
      if (!pageType || !pageId) return null;
      const { data, error } = await (supabase as any)
        .from("page_valuations")
        .select("*")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!pageType && !!pageId,
  });
}

/** Request a fresh valuation calculation via RPC */
export function useRecalculateValuation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { pageType: string; pageId: string }) => {
      const { data, error } = await (supabase as any).rpc("calculate_page_valuation", {
        p_page_type: params.pageType,
        p_page_id: params.pageId,
      });
      if (error) throw error;
      return data as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [PAGE_VALUATION_KEY, vars.pageType, vars.pageId] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Stewardship Score Hooks
// ══════════════════════════════════════════════════════════════

/** Fetch a user's stewardship score and tier */
export function useStewardshipScore(userId?: string) {
  return useQuery({
    queryKey: [STEWARDSHIP_SCORE_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("stewardship_scores")
        .select("*, user:user_id(id, display_name, avatar_url, username)")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
  });
}

/** Fetch the current user's own stewardship score (convenience wrapper) */
export function useMyStewardshipScore(userId?: string) {
  return useQuery({
    queryKey: [STEWARDSHIP_SCORE_KEY, "mine", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("stewardship_scores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
  });
}

/** Fetch the top 20 stewards by total score */
export function useStewardshipLeaderboard() {
  return useQuery({
    queryKey: [STEWARDSHIP_LEADERBOARD_KEY],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stewardship_scores")
        .select("*, user:user_id(id, display_name, avatar_url, username, is_verified)")
        .order("total_score", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 1000 * 60 * 5, // cache 5 minutes
  });
}

// ══════════════════════════════════════════════════════════════
// Transfer History Hooks
// ══════════════════════════════════════════════════════════════

/** Fetch the complete ownership/transfer history for a page, ordered by sequence */
export function useTransferHistory(pageType?: string, pageId?: string) {
  return useQuery({
    queryKey: [TRANSFER_HISTORY_KEY, pageType, pageId],
    queryFn: async () => {
      if (!pageType || !pageId) return [];
      const { data, error } = await (supabase as any)
        .from("transfer_history")
        .select("*, from_user:from_user_id(id, display_name, avatar_url, username), to_user:to_user_id(id, display_name, avatar_url, username)")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .order("sequence_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!pageType && !!pageId,
  });
}

// ══════════════════════════════════════════════════════════════
// Inheritance / Successor Hooks
// ══════════════════════════════════════════════════════════════

/** Designate a successor for a page in page_hosts */
export function useSetSuccessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pageType: string;
      pageId: string;
      currentUserId: string;
      successorUserId: string;
      trigger: "inactivity" | "date" | "manual";
      triggerDate?: string;
    }) => {
      // Update the owner's page_hosts record with successor info
      const { data, error } = await (supabase as any)
        .from("page_hosts")
        .update({
          designated_successor_id: params.successorUserId,
          successor_trigger: params.trigger,
          successor_trigger_date: params.triggerDate ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("page_type", params.pageType)
        .eq("page_id", params.pageId)
        .eq("user_id", params.currentUserId)
        .eq("role", "owner")
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [SUCCESSOR_DESIGNATIONS_KEY] });
      qc.invalidateQueries({ queryKey: ["page-hosts", vars.pageType, vars.pageId] });
    },
  });
}

/** Fetch all pages where this user is designated as successor */
export function useMySuccessorDesignations(userId?: string) {
  return useQuery({
    queryKey: [SUCCESSOR_DESIGNATIONS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("page_hosts")
        .select("*, owner_user:user_id(id, display_name, avatar_url, username)")
        .eq("designated_successor_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

// ══════════════════════════════════════════════════════════════
// Guardian Subscription Hooks
// ══════════════════════════════════════════════════════════════

/** Fetch a user's guardian subscription (page management tier) */
export function useGuardianSubscription(userId?: string) {
  return useQuery({
    queryKey: [GUARDIAN_SUBSCRIPTION_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("guardian_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
  });
}

/** Create or upgrade a guardian subscription */
export function useUpgradeGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      tier: keyof typeof GUARDIAN_TIERS;
      paymentMethodId?: string;
    }) => {
      const tierInfo = GUARDIAN_TIERS[params.tier];
      const { data, error } = await (supabase as any)
        .from("guardian_subscriptions")
        .upsert(
          {
            user_id: params.userId,
            tier: params.tier,
            max_pages: tierInfo.maxPages,
            fee_discount_pct: tierInfo.feeDiscount,
            price_cents: tierInfo.price,
            payment_method_id: params.paymentMethodId ?? null,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: [GUARDIAN_SUBSCRIPTION_KEY, vars.userId] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Marketplace Hooks (Phase 3 stubs)
// ══════════════════════════════════════════════════════════════

/** Browse stewardship listings — stub until stewardship_listings table exists */
export function useStewardshipListings(filters?: {
  pageType?: string;
  search?: string;
  sortBy?: "newest" | "popular" | "urgency";
}) {
  const { pageType, search, sortBy = "newest" } = filters ?? {};
  return useInfiniteQuery({
    queryKey: [STEWARDSHIP_LISTINGS_KEY, pageType, search, sortBy],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      // Stub: table doesn't exist yet, return empty results
      // When stewardship_listings table is created, replace with real query:
      // let query = (supabase as any)
      //   .from("stewardship_listings")
      //   .select("*, page_host:page_host_id(*), user:listed_by(id, display_name, avatar_url)")
      //   .eq("status", "active")
      //   .range(pageParam, pageParam + 19);
      // if (pageType) query = query.eq("page_type", pageType);
      // if (search) query = query.ilike("title", `%${search}%`);
      // const { data, error } = await query;
      // if (error) throw error;
      return { data: [] as any[], nextCursor: undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

/** Create a stewardship listing — stub until stewardship_listings table exists */
export function useCreateStewardshipListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pageType: string;
      pageId: string;
      listedBy: string;
      title: string;
      description?: string;
      listingType: "stewardship" | "purchase" | "both";
      askingPriceCents?: number;
      stewardshipTerms?: StewardshipTerms;
    }) => {
      // Stub: table doesn't exist yet
      // When created, insert into stewardship_listings
      // const { data, error } = await (supabase as any)
      //   .from("stewardship_listings")
      //   .insert({ ...params, status: "active" })
      //   .select()
      //   .single();
      // if (error) throw error;
      // return data as any;
      console.warn("[useStewardship] stewardship_listings table not yet created");
      return params as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [STEWARDSHIP_LISTINGS_KEY] });
    },
  });
}

/** Apply for a stewardship listing — stub until stewardship_listings table exists */
export function useApplyForStewardship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      listingId: string;
      applicantId: string;
      message: string;
      proposedTerms?: StewardshipTerms;
    }) => {
      // Stub: table doesn't exist yet
      // When created, insert into stewardship_applications
      // const { data, error } = await (supabase as any)
      //   .from("stewardship_applications")
      //   .insert({ ...params, status: "pending" })
      //   .select()
      //   .single();
      // if (error) throw error;
      // return data as any;
      console.warn("[useStewardship] stewardship_applications table not yet created");
      return params as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [STEWARDSHIP_LISTINGS_KEY] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Analytics Hook
// ══════════════════════════════════════════════════════════════

/** Combined page analytics: valuation + transfer history + current host info */
export function usePageAnalyticsSummary(pageType?: string, pageId?: string) {
  return useQuery({
    queryKey: [PAGE_ANALYTICS_KEY, pageType, pageId],
    queryFn: async () => {
      if (!pageType || !pageId) return null;

      // Fetch valuation
      const { data: valuation } = await (supabase as any)
        .from("page_valuations")
        .select("*")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch transfer history count
      const { data: history, error: histErr } = await (supabase as any)
        .from("transfer_history")
        .select("id, transfer_type, completed_at")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .order("sequence_number", { ascending: false });
      if (histErr) throw histErr;

      // Fetch current owner from page_hosts
      const { data: owner } = await (supabase as any)
        .from("page_hosts")
        .select("*, user:user_id(id, display_name, avatar_url, username)")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .eq("role", "owner")
        .maybeSingle();

      // Fetch active transfer count
      const { data: activeTransfers } = await (supabase as any)
        .from("page_transfers")
        .select("id")
        .eq("page_type", pageType)
        .eq("page_id", pageId)
        .in("status", ["pending", "negotiating", "cooling_off", "escrow_funded"]);

      return {
        valuation: valuation as any,
        transferCount: (history ?? []).length,
        lastTransfer: (history ?? [])[0] ?? null,
        currentOwner: owner as any,
        activeTransferCount: (activeTransfers ?? []).length,
        hasSuccessor: !!(owner as any)?.designated_successor_id,
      };
    },
    enabled: !!pageType && !!pageId,
  });
}

// ══════════════════════════════════════════════════════════════
// Featured Stewards
// ══════════════════════════════════════════════════════════════

/** Top 5 stewards by score — used on homepage / explore sections */
export function useFeaturedStewards() {
  return useQuery({
    queryKey: [FEATURED_STEWARDS_KEY],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stewardship_scores")
        .select("*, user:user_id(id, display_name, avatar_url, username, is_verified)")
        .order("total_score", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 1000 * 60 * 10, // cache 10 minutes
  });
}
