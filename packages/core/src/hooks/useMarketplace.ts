import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type {
  MarketplaceCategory,
  MarketplaceListing,
  ListingInquiry,
  SellerProfile,
  SellerReview,
} from "../types/models";

const CATEGORIES_KEY = "marketplace-categories";
const LISTINGS_KEY = "marketplace-listings";
const LISTING_KEY = "marketplace-listing";
const MY_LISTINGS_KEY = "my-listings";
const SAVED_KEY = "saved-listings";
const INQUIRIES_KEY = "listing-inquiries";
const SELLER_KEY = "seller-profile";
const REVIEWS_KEY = "seller-reviews";
const PAGE_SIZE = 20;

/** Fetch all marketplace categories */
export function useMarketplaceCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MarketplaceCategory[];
    },
    staleTime: 1000 * 60 * 30, // 30 min — categories rarely change
  });
}

/** Search & browse listings with filters */
export function useListings(filters?: {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: string;
  sortBy?: "newest" | "price_low" | "price_high" | "popular";
}) {
  return useInfiniteQuery({
    queryKey: [LISTINGS_KEY, filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("marketplace_listings")
        .select("*, seller:profiles!marketplace_listings_seller_id_fkey(id, username, display_name, avatar_url), category:marketplace_categories!marketplace_listings_category_id_fkey(id, name, slug, icon_name)")
        .eq("status", "active");

      // Category filter
      if (filters?.categorySlug) {
        const { data: cat } = await supabase
          .from("marketplace_categories")
          .select("id")
          .eq("slug", filters.categorySlug)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      // Search
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      // Price filters
      if (filters?.minPrice !== undefined) {
        query = query.gte("price_cents", filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte("price_cents", filters.maxPrice);
      }

      // Listing type
      if (filters?.listingType) {
        query = query.eq("listing_type", filters.listingType);
      }

      // Sort
      switch (filters?.sortBy) {
        case "price_low":
          query = query.order("price_cents", { ascending: true });
          break;
        case "price_high":
          query = query.order("price_cents", { ascending: false });
          break;
        case "popular":
          query = query.order("view_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      return {
        data: data ?? [],
        nextCursor: data?.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/** Fetch single listing by ID */
export function useListing(listingId: string | undefined) {
  return useQuery({
    queryKey: [LISTING_KEY, listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*, seller:profiles!marketplace_listings_seller_id_fkey(id, username, display_name, avatar_url), category:marketplace_categories!marketplace_listings_category_id_fkey(id, name, slug, icon_name)")
        .eq("id", listingId!)
        .single();
      if (error) throw error;

      // Increment view count (fire and forget)
      const listing = data as any;
      supabase
        .from("marketplace_listings")
        .update({ view_count: (listing.view_count ?? 0) + 1 } as any)
        .eq("id", listingId!);

      return listing as MarketplaceListing;
    },
    enabled: !!listingId,
  });
}

/** Fetch current user's listings */
export function useMyListings(userId: string | undefined) {
  return useQuery({
    queryKey: [MY_LISTINGS_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*, category:marketplace_categories!marketplace_listings_category_id_fkey(id, name, slug, icon_name)")
        .eq("seller_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MarketplaceListing[];
    },
    enabled: !!userId,
  });
}

/** Create a new listing */
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      sellerId: string;
      categoryId: string;
      title: string;
      description?: string;
      priceCents: number;
      listingType?: string;
      condition?: string;
      images?: string[];
      location?: string;
      shippingAvailable?: boolean;
      shippingPriceCents?: number;
    }) => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .insert({
          seller_id: params.sellerId,
          category_id: params.categoryId,
          title: params.title,
          description: params.description,
          price_cents: params.priceCents,
          listing_type: params.listingType ?? "product",
          condition: params.condition,
          images: params.images ?? [],
          location: params.location,
          shipping_available: params.shippingAvailable ?? false,
          shipping_price_cents: params.shippingPriceCents,
          status: "active",
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as MarketplaceListing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_LISTINGS_KEY] });
    },
  });
}

/** Update an existing listing */
export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      listingId: string;
      updates: Partial<{
        title: string;
        description: string | null;
        price_cents: number;
        category_id: string;
        listing_type: string;
        condition: string | null;
        images: string[];
        location: string | null;
        shipping_available: boolean;
        shipping_price_cents: number | null;
        status: string;
      }>;
    }) => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .update(params.updates)
        .eq("id", params.listingId)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as MarketplaceListing;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LISTING_KEY, vars.listingId] });
      queryClient.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_LISTINGS_KEY] });
    },
  });
}

/** Toggle saved/bookmarked listing */
export function useToggleSavedListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; listingId: string; isSaved: boolean }) => {
      if (params.isSaved) {
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", params.userId)
          .eq("listing_id", params.listingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_listings")
          .insert({ user_id: params.userId, listing_id: params.listingId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_KEY] });
    },
  });
}

/** Fetch saved listings for a user */
export function useSavedListings(userId: string | undefined) {
  return useQuery({
    queryKey: [SAVED_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("listing_id, listing:marketplace_listings!saved_listings_listing_id_fkey(*, category:marketplace_categories!marketplace_listings_category_id_fkey(id, name, slug, icon_name))")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

/** Create an inquiry on a listing */
export function useCreateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { listingId: string; buyerId: string; message: string }) => {
      const { data, error } = await supabase
        .from("listing_inquiries")
        .insert({
          listing_id: params.listingId,
          buyer_id: params.buyerId,
          message: params.message,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as ListingInquiry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INQUIRIES_KEY] });
    },
  });
}

/** Fetch inquiries for a listing (seller view) or by user (buyer view) */
export function useInquiries(params: { listingId?: string; buyerId?: string }) {
  return useQuery({
    queryKey: [INQUIRIES_KEY, params],
    queryFn: async () => {
      let query = supabase
        .from("listing_inquiries")
        .select("*, buyer:profiles!listing_inquiries_buyer_id_fkey(id, username, display_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (params.listingId) {
        query = query.eq("listing_id", params.listingId);
      }
      if (params.buyerId) {
        query = query.eq("buyer_id", params.buyerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ListingInquiry[];
    },
    enabled: !!params.listingId || !!params.buyerId,
  });
}

/** Fetch or create seller profile */
export function useSellerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: [SELLER_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as SellerProfile | null;
    },
    enabled: !!userId,
  });
}

/** Create or update seller profile */
export function useUpsertSellerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      businessName?: string;
      businessDescription?: string;
      businessType?: string;
      websiteUrl?: string;
      phone?: string;
      address?: string;
    }) => {
      // Check if exists
      const { data: existing } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("user_id", params.userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("seller_profiles")
          .update({
            business_name: params.businessName,
            business_description: params.businessDescription,
            business_type: params.businessType,
            website_url: params.websiteUrl,
            phone: params.phone,
            address: params.address,
          })
          .eq("user_id", params.userId)
          .select("*")
          .single();
        if (error) throw error;
        return data as unknown as SellerProfile;
      } else {
        const { data, error } = await supabase
          .from("seller_profiles")
          .insert({
            user_id: params.userId,
            business_name: params.businessName,
            business_description: params.businessDescription,
            business_type: params.businessType,
            website_url: params.websiteUrl,
            phone: params.phone,
            address: params.address,
          })
          .select("*")
          .single();
        if (error) throw error;
        return data as unknown as SellerProfile;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [SELLER_KEY, vars.userId] });
    },
  });
}

/** Fetch reviews for a seller */
export function useSellerReviews(sellerId: string | undefined) {
  return useQuery({
    queryKey: [REVIEWS_KEY, sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*, reviewer:profiles!seller_reviews_reviewer_id_fkey(id, username, display_name, avatar_url)")
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SellerReview[];
    },
    enabled: !!sellerId,
  });
}

/** Leave a review for a seller */
export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      sellerId: string;
      reviewerId: string;
      listingId?: string;
      rating: number;
      reviewText?: string;
    }) => {
      const { data, error } = await supabase
        .from("seller_reviews")
        .insert({
          seller_id: params.sellerId,
          reviewer_id: params.reviewerId,
          listing_id: params.listingId,
          rating: params.rating,
          review_text: params.reviewText,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as SellerReview;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [REVIEWS_KEY, vars.sellerId] });
      queryClient.invalidateQueries({ queryKey: [SELLER_KEY] });
    },
  });
}
