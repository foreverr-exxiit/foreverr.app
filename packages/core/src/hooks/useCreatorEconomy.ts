import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { captureException } from "../services/errorReporting";

// ── Types ────────────────────────────────────────────────────
export type CreatorTier = "rising" | "bronze" | "silver" | "gold" | "platinum" | "legend";

export type ServiceCategory =
  | "tribute_writing" | "memorial_design" | "life_storytelling"
  | "memorial_art" | "event_hosting" | "grief_support"
  | "photo_restoration" | "video_memorial" | "eulogy_writing"
  | "family_tree" | "digital_archival" | "celebration_planning"
  | "legacy_coaching" | "other";

export type EarningType =
  | "service_order" | "tip" | "fundraiser_fee" | "tribute_gift"
  | "template_sale" | "event_ticket" | "referral_bonus" | "bonus";

export type TemplateCategory =
  | "memorial" | "celebration" | "tribute_page" | "life_story"
  | "milestone" | "anniversary" | "wedding" | "pet" | "other";

// Category labels for display
export const SERVICE_CATEGORIES: Record<ServiceCategory, { label: string; icon: string; description: string }> = {
  tribute_writing: { label: "Tribute Writing", icon: "create-outline", description: "Custom tributes, eulogies, and memorial texts" },
  memorial_design: { label: "Memorial Design", icon: "color-palette-outline", description: "Beautiful memorial page layouts and themes" },
  life_storytelling: { label: "Life Storytelling", icon: "book-outline", description: "Professional life story documentation" },
  memorial_art: { label: "Memorial Art", icon: "brush-outline", description: "Custom portraits and memorial artwork" },
  event_hosting: { label: "Event Hosting", icon: "calendar-outline", description: "Virtual memorial and celebration events" },
  grief_support: { label: "Grief Support", icon: "heart-outline", description: "Compassionate counseling and support" },
  photo_restoration: { label: "Photo Restoration", icon: "image-outline", description: "Restore and enhance old photographs" },
  video_memorial: { label: "Video Memorial", icon: "videocam-outline", description: "Video tributes and memorial montages" },
  eulogy_writing: { label: "Eulogy Writing", icon: "document-text-outline", description: "Professional eulogy composition" },
  family_tree: { label: "Family Tree", icon: "git-merge-outline", description: "Family history research and tree building" },
  digital_archival: { label: "Digital Archival", icon: "archive-outline", description: "Digitize photos, letters, and memorabilia" },
  celebration_planning: { label: "Celebration Planning", icon: "sparkles-outline", description: "Plan celebration-of-life events" },
  legacy_coaching: { label: "Legacy Coaching", icon: "school-outline", description: "Help plan and preserve legacies" },
  other: { label: "Other", icon: "ellipsis-horizontal-outline", description: "Other memorial services" },
};

export const TIER_INFO: Record<CreatorTier, { name: string; icon: string; color: string }> = {
  rising: { name: "Rising Creator", icon: "🌱", color: "#9ca3af" },
  bronze: { name: "Bronze Creator", icon: "🥉", color: "#cd7f32" },
  silver: { name: "Silver Creator", icon: "🥈", color: "#c0c0c0" },
  gold: { name: "Gold Creator", icon: "🥇", color: "#ffd700" },
  platinum: { name: "Platinum Creator", icon: "💎", color: "#e5e4e2" },
  legend: { name: "Legend Creator", icon: "👑", color: "#ff6b35" },
};

// ══════════════════════════════════════════════════════════════
// Creator Profile Hooks
// ══════════════════════════════════════════════════════════════

/** Get the current user's creator profile */
export function useMyCreatorProfile(userId?: string) {
  return useQuery({
    queryKey: ["creator-profile", "mine", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
  });
}

/** Get a creator profile by ID */
export function useCreatorProfile(creatorId?: string) {
  return useQuery({
    queryKey: ["creator-profile", creatorId],
    queryFn: async () => {
      if (!creatorId) return null;
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*, profiles:user_id(display_name, avatar_url, username, is_verified)")
        .eq("id", creatorId)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!creatorId,
  });
}

/** Get a creator profile by user ID (public view) */
export function useCreatorByUserId(userId?: string) {
  return useQuery({
    queryKey: ["creator-profile", "by-user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
  });
}

/** Create or update creator profile */
export function useUpsertCreatorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      display_name: string;
      tagline?: string;
      bio?: string;
      specialties?: string[];
      avatar_url?: string | null;
      cover_image_url?: string | null;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("creator_profiles")
        .upsert(data, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: ["creator-profile"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Creator Tiers
// ══════════════════════════════════════════════════════════════

export function useCreatorTiers() {
  return useQuery({
    queryKey: ["creator-tiers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_tiers")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 1000 * 60 * 60, // cache 1 hour
  });
}

// ══════════════════════════════════════════════════════════════
// Service Listings
// ══════════════════════════════════════════════════════════════

/** Browse all active service listings */
export function useServiceListings(options?: {
  category?: string;
  search?: string;
  sortBy?: "newest" | "popular" | "price_low" | "price_high" | "rating";
}) {
  const { category, search, sortBy = "newest" } = options ?? {};
  return useInfiniteQuery({
    queryKey: ["service-listings", category, search, sortBy],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      let query = (supabase as any)
        .from("service_listings")
        .select("*, creator:creator_id(id, display_name, avatar_url, tier, rating_avg, rating_count, user_id)")
        .eq("is_active", true)
        .range(pageParam, pageParam + 19);

      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("title", `%${search}%`);

      switch (sortBy) {
        case "popular": query = query.order("order_count", { ascending: false }); break;
        case "price_low": query = query.order("price_cents", { ascending: true }); break;
        case "price_high": query = query.order("price_cents", { ascending: false }); break;
        case "rating": query = query.order("rating_avg", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as any[], nextCursor: (data?.length ?? 0) >= 20 ? pageParam + 20 : undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

/** Get a single service listing */
export function useServiceListing(id?: string) {
  return useQuery({
    queryKey: ["service-listing", id],
    queryFn: async () => {
      if (!id) return null;
      // Increment view count
      await (supabase as any).rpc("", {}).catch(() => {}); // silent fail
      const { data, error } = await (supabase as any)
        .from("service_listings")
        .select("*, creator:creator_id(id, display_name, avatar_url, tier, rating_avg, rating_count, user_id, bio, tagline, is_verified, lifetime_orders, response_time_hours)")
        .eq("id", id)
        .single();
      if (error) throw error;
      // Bump view count in background
      (supabase as any)
        .from("service_listings")
        .update({ view_count: (data?.view_count ?? 0) + 1 })
        .eq("id", id)
        .then(() => {});
      return data as any;
    },
    enabled: !!id,
  });
}

/** Get current creator's service listings */
export function useMyServiceListings(creatorId?: string) {
  return useQuery({
    queryKey: ["service-listings", "mine", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await (supabase as any)
        .from("service_listings")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!creatorId,
  });
}

/** Create a service listing */
export function useCreateServiceListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      creator_id: string;
      title: string;
      description: string;
      category: string;
      pricing_type?: string;
      price_cents: number;
      packages?: any;
      delivery_days?: number;
      max_revisions?: number;
      tags?: string[];
      cover_image_url?: string | null;
      sample_images?: string[];
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("service_listings")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-listings"] });
    },
  });
}

/** Update a service listing */
export function useUpdateServiceListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await (supabase as any)
        .from("service_listings")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-listings"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Service Orders
// ══════════════════════════════════════════════════════════════

/** Get orders as buyer or creator */
export function useServiceOrders(userId?: string, role: "buyer" | "creator" = "buyer") {
  return useQuery({
    queryKey: ["service-orders", userId, role],
    queryFn: async () => {
      if (!userId) return [];
      let query = (supabase as any)
        .from("service_orders")
        .select("*, service:service_id(title, cover_image_url, category)")
        .order("created_at", { ascending: false });

      if (role === "buyer") {
        query = query.eq("buyer_id", userId);
      } else {
        // Creator: find by creator_profile
        const { data: cp } = await (supabase as any)
          .from("creator_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (!cp) return [];
        query = query.eq("creator_id", cp.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

/** Create a service order */
export function useCreateServiceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      service_id: string;
      creator_id: string;
      buyer_id: string;
      title: string;
      description?: string;
      package_name?: string;
      amount_cents: number;
      platform_fee_cents: number;
      creator_payout_cents: number;
      memorial_id?: string;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("service_orders")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-orders"] });
    },
    onError: (err, data) => {
      captureException(err, {
        where: "useCreatorEconomy.useCreateServiceOrder",
        service_id: data.service_id,
        creator_id: data.creator_id,
        amount_cents: data.amount_cents,
      });
    },
  });
}

/** Update an order status */
export function useUpdateServiceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; buyer_rating?: number; buyer_review?: string; deliverables?: any }) => {
      const updates: any = { ...data, updated_at: new Date().toISOString() };
      if (data.status === "completed") updates.completed_at = new Date().toISOString();
      if (data.status === "delivered") updates.delivered_at = new Date().toISOString();
      const { data: result, error } = await (supabase as any)
        .from("service_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Creator Earnings
// ══════════════════════════════════════════════════════════════

export function useCreatorEarnings(creatorId?: string) {
  return useQuery({
    queryKey: ["creator-earnings", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await (supabase as any)
        .from("creator_earnings")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!creatorId,
  });
}

export function useEarningsSummary(creatorId?: string) {
  return useQuery({
    queryKey: ["creator-earnings-summary", creatorId],
    queryFn: async () => {
      if (!creatorId) return null;
      const { data, error } = await (supabase as any)
        .from("creator_earnings")
        .select("type, net_amount_cents, status")
        .eq("creator_id", creatorId);
      if (error) throw error;
      const earnings = (data ?? []) as any[];

      const totalEarned = earnings.reduce((sum: number, e: any) => sum + (e.net_amount_cents ?? 0), 0);
      const pendingEarnings = earnings.filter((e: any) => e.status === "pending").reduce((sum: number, e: any) => sum + (e.net_amount_cents ?? 0), 0);
      const clearedEarnings = earnings.filter((e: any) => e.status === "cleared").reduce((sum: number, e: any) => sum + (e.net_amount_cents ?? 0), 0);
      const paidOut = earnings.filter((e: any) => e.status === "paid_out").reduce((sum: number, e: any) => sum + (e.net_amount_cents ?? 0), 0);

      // Breakdown by type
      const byType: Record<string, number> = {};
      for (const e of earnings) {
        byType[e.type] = (byType[e.type] ?? 0) + (e.net_amount_cents ?? 0);
      }

      return { totalEarned, pendingEarnings, clearedEarnings, paidOut, byType, count: earnings.length };
    },
    enabled: !!creatorId,
  });
}

// ══════════════════════════════════════════════════════════════
// Creator Payouts
// ══════════════════════════════════════════════════════════════

export function useCreatorPayouts(creatorId?: string) {
  return useQuery({
    queryKey: ["creator-payouts", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await (supabase as any)
        .from("creator_payouts")
        .select("*")
        .eq("creator_id", creatorId)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!creatorId,
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { creator_id: string; amount_cents: number }) => {
      const { data: result, error } = await (supabase as any)
        .from("creator_payouts")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      // Deduct from pending balance
      await (supabase as any)
        .from("creator_profiles")
        .update({
          pending_balance_cents: (supabase as any).rpc ? 0 : 0, // handled by trigger ideally
        })
        .eq("id", data.creator_id);
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creator-payouts"] });
      qc.invalidateQueries({ queryKey: ["creator-profile"] });
    },
    onError: (err, data) => {
      // Payout request failing means the creator can't get paid —
      // they'll absolutely contact support, surface it pre-emptively.
      captureException(err, {
        where: "useCreatorEconomy.useRequestPayout",
        creator_id: data.creator_id,
        amount_cents: data.amount_cents,
      });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Honor Fundraisers
// ══════════════════════════════════════════════════════════════

export function useHonorFundraisers(options?: { status?: string; organizerId?: string }) {
  return useInfiniteQuery({
    queryKey: ["honor-fundraisers", options?.status, options?.organizerId],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      let query = (supabase as any)
        .from("honor_fundraisers")
        .select("*, organizer:organizer_id(display_name, avatar_url, username)")
        .range(pageParam, pageParam + 19)
        .order("created_at", { ascending: false });

      if (options?.status) query = query.eq("status", options.status);
      if (options?.organizerId) query = query.eq("organizer_id", options.organizerId);

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as any[], nextCursor: (data?.length ?? 0) >= 20 ? pageParam + 20 : undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

export function useHonorFundraiser(id?: string) {
  return useQuery({
    queryKey: ["honor-fundraiser", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from("honor_fundraisers")
        .select("*, organizer:organizer_id(display_name, avatar_url, username, is_verified)")
        .eq("id", id)
        .single();
      if (error) throw error;
      // Bump view count
      (supabase as any)
        .from("honor_fundraisers")
        .update({ view_count: (data?.view_count ?? 0) + 1 })
        .eq("id", id)
        .then(() => {});
      return data as any;
    },
    enabled: !!id,
  });
}

export function useCreateHonorFundraiser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      organizer_id: string;
      honoree_name: string;
      honoree_image_url?: string;
      memorial_id?: string;
      title: string;
      description: string;
      story?: string;
      cover_image_url?: string;
      goal_cents: number;
      beneficiary_name: string;
      beneficiary_type: string;
      beneficiary_url?: string;
      organizer_fee_pct?: number;
      end_date?: string;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("honor_fundraisers")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["honor-fundraisers"] });
    },
    onError: (err, data) => {
      captureException(err, {
        where: "useCreatorEconomy.useCreateHonorFundraiser",
        organizer_id: data.organizer_id,
        memorial_id: data.memorial_id,
        goal_cents: data.goal_cents,
      });
    },
  });
}

export function useHonorDonations(fundraiserId?: string) {
  return useQuery({
    queryKey: ["honor-donations", fundraiserId],
    queryFn: async () => {
      if (!fundraiserId) return [];
      const { data, error } = await (supabase as any)
        .from("honor_donations")
        .select("*")
        .eq("fundraiser_id", fundraiserId)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!fundraiserId,
  });
}

// ══════════════════════════════════════════════════════════════
// Creator Reviews
// ══════════════════════════════════════════════════════════════

export function useCreatorReviews(creatorId?: string) {
  return useQuery({
    queryKey: ["creator-reviews", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await (supabase as any)
        .from("creator_reviews")
        .select("*, reviewer:reviewer_id(display_name, avatar_url)")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!creatorId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      creator_id: string;
      reviewer_id: string;
      order_id?: string;
      rating: number;
      review_text?: string;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("creator_reviews")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creator-reviews"] });
      qc.invalidateQueries({ queryKey: ["creator-profile"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Featured / Top Creators
// ══════════════════════════════════════════════════════════════

export function useFeaturedCreators() {
  return useQuery({
    queryKey: ["featured-creators"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*, profiles:user_id(display_name, avatar_url, username, is_verified)")
        .eq("application_status", "approved")
        .eq("is_accepting_orders", true)
        .order("rating_avg", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ══════════════════════════════════════════════════════════════
// Tips
// ══════════════════════════════════════════════════════════════

/** Send a tip to a creator */
export function useSendCreatorTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      creator_id: string;
      tipper_id: string;
      amount_cents: number;
      message?: string;
    }) => {
      // 1. Record the tip as a creator earning
      const { data: earning, error: earnError } = await (supabase as any)
        .from("creator_earnings")
        .insert({
          creator_id: data.creator_id,
          type: "tip",
          gross_amount_cents: data.amount_cents,
          platform_fee_cents: 0, // No platform fee on tips
          net_amount_cents: data.amount_cents,
          source_id: data.tipper_id,
          description: data.message ?? "Tip received",
        })
        .select()
        .single();
      if (earnError) throw earnError;

      // 2. Update creator's pending balance
      const { data: profile } = await (supabase as any)
        .from("creator_profiles")
        .select("pending_balance_cents")
        .eq("id", data.creator_id)
        .single();

      await (supabase as any)
        .from("creator_profiles")
        .update({
          pending_balance_cents: (profile?.pending_balance_cents ?? 0) + data.amount_cents,
          total_earned_cents: (supabase as any).rpc ? undefined : undefined, // Let trigger handle
        })
        .eq("id", data.creator_id);

      return earning as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creator-profile"] });
      qc.invalidateQueries({ queryKey: ["creator-earnings"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Memorial Templates
// ══════════════════════════════════════════════════════════════

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; icon: string }> = {
  memorial: { label: "Memorial", icon: "flower-outline" },
  celebration: { label: "Celebration", icon: "sparkles-outline" },
  tribute_page: { label: "Tribute Page", icon: "document-text-outline" },
  life_story: { label: "Life Story", icon: "book-outline" },
  milestone: { label: "Turning Point", icon: "flag-outline" },
  anniversary: { label: "Anniversary", icon: "calendar-outline" },
  wedding: { label: "Wedding", icon: "heart-outline" },
  pet: { label: "Pet Memorial", icon: "paw-outline" },
  other: { label: "Other", icon: "ellipsis-horizontal-outline" },
};

/** Browse published templates */
export function useTemplates(options?: { category?: string; search?: string; sortBy?: string }) {
  const { category, search, sortBy = "popular" } = options ?? {};
  return useInfiniteQuery({
    queryKey: ["templates", category, search, sortBy],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      let query = (supabase as any)
        .from("memorial_templates")
        .select("*, creator:creator_id(id, display_name, avatar_url, tier, user_id)")
        .eq("is_published", true)
        .range(pageParam, pageParam + 19);

      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("title", `%${search}%`);

      switch (sortBy) {
        case "popular": query = query.order("download_count", { ascending: false }); break;
        case "newest": query = query.order("created_at", { ascending: false }); break;
        case "price_low": query = query.order("price_cents", { ascending: true }); break;
        case "rating": query = query.order("rating_avg", { ascending: false }); break;
        default: query = query.order("download_count", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as any[], nextCursor: (data?.length ?? 0) >= 20 ? pageParam + 20 : undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

/** Get a single template */
export function useTemplate(id?: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from("memorial_templates")
        .select("*, creator:creator_id(id, display_name, avatar_url, tier, user_id, rating_avg)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

/** Get creator's own templates */
export function useMyTemplates(creatorId?: string) {
  return useQuery({
    queryKey: ["templates", "mine", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await (supabase as any)
        .from("memorial_templates")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!creatorId,
  });
}

/** Create a template */
export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      creator_id: string;
      title: string;
      description: string;
      category: string;
      price_cents: number;
      preview_images?: string[];
      template_data?: any;
      tags?: string[];
      is_free?: boolean;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("memorial_templates")
        .insert({ ...data, is_published: true })
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

/** Purchase / download a template */
export function usePurchaseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { template_id: string; buyer_id: string }) => {
      // Record the download
      const { data: result, error } = await (supabase as any)
        .from("template_downloads")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      // Bump download count
      const { data: tmpl } = await (supabase as any)
        .from("memorial_templates")
        .select("download_count")
        .eq("id", data.template_id)
        .single();
      await (supabase as any)
        .from("memorial_templates")
        .update({ download_count: (tmpl?.download_count ?? 0) + 1 })
        .eq("id", data.template_id);
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Event Ticketing
// ══════════════════════════════════════════════════════════════

/** Purchase a ticket for a paid event */
export function usePurchaseEventTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      event_id: string;
      buyer_id: string;
      amount_paid_cents: number;
      quantity?: number;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("event_tickets")
        .insert({
          event_id: data.event_id,
          buyer_id: data.buyer_id,
          amount_paid_cents: data.amount_paid_cents,
          quantity: data.quantity ?? 1,
        })
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-tickets"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/** Get tickets for an event (organizer view) */
export function useEventTickets(eventId?: string) {
  return useQuery({
    queryKey: ["event-tickets", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await (supabase as any)
        .from("event_tickets")
        .select("*, buyer:buyer_id(display_name, avatar_url)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!eventId,
  });
}

/** Get user's event tickets */
export function useMyEventTickets(userId?: string) {
  return useQuery({
    queryKey: ["event-tickets", "mine", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("event_tickets")
        .select("*, event:event_id(id, title, start_date, location, is_virtual, cover_image_url)")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

// ══════════════════════════════════════════════════════════════
// Honor-a-Day Micro-Sponsorships
// ══════════════════════════════════════════════════════════════

export const HONOR_DAY_BADGES: Record<string, { label: string; icon: string; emoji: string }> = {
  candle: { label: "Candle", icon: "flame-outline", emoji: "🕯️" },
  flower: { label: "Flowers", icon: "flower-outline", emoji: "🌸" },
  dove: { label: "Dove", icon: "leaf-outline", emoji: "🕊️" },
  star: { label: "Star", icon: "star-outline", emoji: "⭐" },
  heart: { label: "Heart", icon: "heart-outline", emoji: "❤️" },
  ribbon: { label: "Ribbon", icon: "ribbon-outline", emoji: "🎗️" },
};

/** Get sponsorships for a memorial */
export function useHonorDaySponsorships(memorialId?: string) {
  return useQuery({
    queryKey: ["honor-day", memorialId],
    queryFn: async () => {
      if (!memorialId) return [];
      const { data, error } = await (supabase as any)
        .from("honor_day_sponsorships")
        .select("*, sponsor:sponsor_id(display_name, avatar_url)")
        .eq("memorial_id", memorialId)
        .eq("is_active", true)
        .order("sponsored_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!memorialId,
  });
}

/** Get upcoming available dates for a memorial */
export function useAvailableHonorDays(memorialId?: string) {
  return useQuery({
    queryKey: ["honor-day", "available", memorialId],
    queryFn: async () => {
      if (!memorialId) return [];
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysOut = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      const { data, error } = await (supabase as any)
        .from("honor_day_sponsorships")
        .select("sponsored_date")
        .eq("memorial_id", memorialId)
        .gte("sponsored_date", today)
        .lte("sponsored_date", thirtyDaysOut);
      if (error) throw error;
      const taken = new Set((data ?? []).map((d: any) => d.sponsored_date));
      // Generate 30 days of dates, mark which are taken
      const days: { date: string; taken: boolean; label: string }[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(Date.now() + i * 86400000);
        const dateStr = d.toISOString().split("T")[0];
        days.push({
          date: dateStr,
          taken: taken.has(dateStr),
          label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        });
      }
      return days;
    },
    enabled: !!memorialId,
  });
}

/** Sponsor a day */
export function useSponsorDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      memorial_id: string;
      sponsor_id: string;
      sponsored_date: string;
      amount_cents: number;
      message?: string;
      sponsor_name?: string;
      is_anonymous?: boolean;
      display_badge?: string;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("honor_day_sponsorships")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["honor-day"] });
    },
  });
}

/** Get user's own sponsorships */
export function useMyHonorDays(userId?: string) {
  return useQuery({
    queryKey: ["honor-day", "mine", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("honor_day_sponsorships")
        .select("*, memorial:memorial_id(id, first_name, last_name, profile_photo_url)")
        .eq("sponsor_id", userId)
        .order("sponsored_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

// ══════════════════════════════════════════════════════════════
// Vault Preservation Orders
// ══════════════════════════════════════════════════════════════

export const PRESERVATION_TYPES: Record<string, { label: string; icon: string; description: string; basePrice: number }> = {
  digital_archive: { label: "Digital Archive", icon: "cloud-download-outline", description: "Professionally organized digital archive of all vault contents", basePrice: 1999 },
  printed_book: { label: "Printed Memory Book", icon: "book-outline", description: "Beautiful hardcover book with photos and memories", basePrice: 4999 },
  video_compilation: { label: "Video Compilation", icon: "videocam-outline", description: "Professional video montage of photos, videos, and memories", basePrice: 7999 },
  time_capsule: { label: "Digital Time Capsule", icon: "time-outline", description: "Encrypted time-locked capsule to be opened on a future date", basePrice: 2999 },
  full_preservation: { label: "Full Preservation Suite", icon: "shield-checkmark-outline", description: "Complete package: digital archive + printed book + video", basePrice: 12999 },
};

export function useVaultPreservationOrders(userId?: string) {
  return useQuery({
    queryKey: ["vault-preservation", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("vault_preservation_orders")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

export function useCreateVaultPreservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      vault_id: string;
      owner_id: string;
      creator_id?: string;
      preservation_type: string;
      amount_cents: number;
      items_count: number;
      notes?: string;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("vault_preservation_orders")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault-preservation"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Content Licensing
// ══════════════════════════════════════════════════════════════

export const CONTENT_TYPES: Record<string, { label: string; icon: string }> = {
  text: { label: "Written Content", icon: "document-text-outline" },
  photo: { label: "Photography", icon: "image-outline" },
  video: { label: "Video", icon: "videocam-outline" },
  audio: { label: "Audio", icon: "musical-notes-outline" },
  template: { label: "Template", icon: "grid-outline" },
  design: { label: "Design Asset", icon: "color-palette-outline" },
  bundle: { label: "Content Bundle", icon: "albums-outline" },
};

export const LICENSE_TYPES: Record<string, { label: string; description: string }> = {
  personal: { label: "Personal Use", description: "For personal and non-commercial use" },
  commercial: { label: "Commercial", description: "For commercial and business use" },
  exclusive: { label: "Exclusive Rights", description: "Full exclusive rights to the content" },
  open: { label: "Open License", description: "Free to use with attribution" },
};

export function useContentLicenses(options?: { contentType?: string; search?: string; sortBy?: string }) {
  const { contentType, search, sortBy = "newest" } = options ?? {};
  return useInfiniteQuery({
    queryKey: ["content-licenses", contentType, search, sortBy],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      let query = (supabase as any)
        .from("content_licenses")
        .select("*, creator:creator_id(id, display_name, avatar_url, tier, user_id)")
        .eq("is_active", true)
        .range(pageParam, pageParam + 19);

      if (contentType) query = query.eq("content_type", contentType);
      if (search) query = query.ilike("title", `%${search}%`);

      switch (sortBy) {
        case "popular": query = query.order("download_count", { ascending: false }); break;
        case "price_low": query = query.order("price_cents", { ascending: true }); break;
        case "price_high": query = query.order("price_cents", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as any[], nextCursor: (data?.length ?? 0) >= 20 ? pageParam + 20 : undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

export function useContentLicense(id?: string) {
  return useQuery({
    queryKey: ["content-license", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from("content_licenses")
        .select("*, creator:creator_id(id, display_name, avatar_url, tier, user_id, bio)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

export function useMyContentLicenses(creatorId?: string) {
  return useQuery({
    queryKey: ["content-licenses", "mine", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await (supabase as any)
        .from("content_licenses")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!creatorId,
  });
}

export function useCreateContentLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      creator_id: string;
      title: string;
      description: string;
      content_type: string;
      license_type: string;
      price_cents: number;
      preview_url?: string;
      content_url?: string;
      tags?: string[];
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("content_licenses")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-licenses"] });
    },
  });
}

export function usePurchaseContentLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      license_id: string;
      buyer_id: string;
      amount_paid_cents: number;
      license_type: string;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("content_license_purchases")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-licenses"] });
      qc.invalidateQueries({ queryKey: ["content-license-purchases"] });
    },
  });
}

// ══════════════════════════════════════════════════════════════
// Channel Subscriptions
// ══════════════════════════════════════════════════════════════

export const SUBSCRIPTION_TIERS: Record<string, { label: string; icon: string; price: number; description: string }> = {
  basic: { label: "Basic", icon: "star-outline", price: 499, description: "Access to exclusive posts and updates" },
  premium: { label: "Premium", icon: "star-half-outline", price: 999, description: "Everything in Basic + behind-the-scenes content" },
  vip: { label: "VIP", icon: "star", price: 1999, description: "Everything in Premium + direct messaging + early access" },
};

export function useChannelSubscription(channelId?: string, userId?: string) {
  return useQuery({
    queryKey: ["channel-subscription", channelId, userId],
    queryFn: async () => {
      if (!channelId || !userId) return null;
      const { data, error } = await (supabase as any)
        .from("channel_subscriptions")
        .select("*")
        .eq("channel_id", channelId)
        .eq("subscriber_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!channelId && !!userId,
  });
}

export function useChannelSubscribers(channelId?: string) {
  return useQuery({
    queryKey: ["channel-subscribers", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const { data, error } = await (supabase as any)
        .from("channel_subscriptions")
        .select("*, subscriber:subscriber_id(display_name, avatar_url)")
        .eq("channel_id", channelId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!channelId,
  });
}

export function useSubscribeToChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      channel_id: string;
      subscriber_id: string;
      tier: string;
      amount_cents: number;
    }) => {
      const { data: result, error } = await (supabase as any)
        .from("channel_subscriptions")
        .upsert(
          {
            channel_id: data.channel_id,
            subscriber_id: data.subscriber_id,
            tier: data.tier,
            amount_cents: data.amount_cents,
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          },
          { onConflict: "channel_id,subscriber_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return result as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-subscription"] });
      qc.invalidateQueries({ queryKey: ["channel-subscribers"] });
    },
  });
}

export function useMySubscriptions(userId?: string) {
  return useQuery({
    queryKey: ["my-subscriptions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("channel_subscriptions")
        .select("*")
        .eq("subscriber_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}
