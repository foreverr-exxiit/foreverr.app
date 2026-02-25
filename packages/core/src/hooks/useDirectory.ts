import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Json } from "../supabase/types";
import type { DirectoryListing, DirectoryReview, DirectoryLead } from "../types/models";

const DIRECTORY_KEY = "directory-listings";
const DIRECTORY_DETAIL_KEY = "directory-detail";
const DIRECTORY_REVIEWS_KEY = "directory-reviews";
const DIRECTORY_LEADS_KEY = "directory-leads";
const PAGE_SIZE = 20;

/** Search directory listings with filters */
export function useDirectoryListings(filters?: {
  businessType?: string;
  city?: string;
  search?: string;
  priceRange?: string;
}) {
  return useInfiniteQuery({
    queryKey: [DIRECTORY_KEY, filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("directory_listings")
        .select("*")
        .eq("status", "active");

      if (filters?.businessType) {
        query = query.eq("business_type", filters.businessType);
      }
      if (filters?.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters?.search) {
        query = query.ilike("business_name", `%${filters.search}%`);
      }
      if (filters?.priceRange) {
        query = query.eq("price_range", filters.priceRange);
      }

      query = query
        .order("is_featured", { ascending: false })
        .order("rating_avg", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      const { data, error } = await query;
      if (error) throw error;
      return {
        data: (data ?? []) as DirectoryListing[],
        nextCursor: data?.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/** Fetch single directory listing by ID */
export function useDirectoryListing(id: string | undefined) {
  return useQuery({
    queryKey: [DIRECTORY_DETAIL_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directory_listings")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as DirectoryListing;
    },
    enabled: !!id,
  });
}

/** Create a directory listing */
export function useCreateDirectoryListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      ownerId: string;
      businessName: string;
      businessType: string;
      address: string;
      city: string;
      state?: string;
      zipCode?: string;
      description?: string;
      services?: string[];
      priceRange?: string;
      phone?: string;
      email?: string;
      websiteUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("directory_listings")
        .insert({
          owner_id: params.ownerId,
          business_name: params.businessName,
          business_type: params.businessType,
          address: params.address,
          city: params.city,
          state: params.state,
          zip_code: params.zipCode,
          description: params.description,
          services: params.services ?? [],
          price_range: params.priceRange,
          phone: params.phone,
          email: params.email,
          website_url: params.websiteUrl,
          status: "active",
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as DirectoryListing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY] });
    },
  });
}

/** Fetch reviews for a directory listing */
export function useDirectoryReviews(listingId: string | undefined) {
  return useQuery({
    queryKey: [DIRECTORY_REVIEWS_KEY, listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directory_reviews")
        .select("*, reviewer:profiles!directory_reviews_reviewer_id_fkey(id, username, display_name, avatar_url)")
        .eq("listing_id", listingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DirectoryReview[];
    },
    enabled: !!listingId,
  });
}

/** Leave a directory review */
export function useCreateDirectoryReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      listingId: string;
      reviewerId: string;
      rating: number;
      title?: string;
      reviewText?: string;
    }) => {
      const { data, error } = await supabase
        .from("directory_reviews")
        .insert({
          listing_id: params.listingId,
          reviewer_id: params.reviewerId,
          rating: params.rating,
          title: params.title,
          review_text: params.reviewText,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as DirectoryReview;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [DIRECTORY_REVIEWS_KEY, vars.listingId] });
      queryClient.invalidateQueries({ queryKey: [DIRECTORY_DETAIL_KEY, vars.listingId] });
    },
  });
}

/** Submit a lead / request quote */
export function useCreateDirectoryLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      listingId: string;
      userId?: string;
      name: string;
      email: string;
      phone?: string;
      message: string;
      serviceType?: string;
      preferredDate?: string;
    }) => {
      const { data, error } = await supabase
        .from("directory_leads")
        .insert({
          listing_id: params.listingId,
          user_id: params.userId,
          name: params.name,
          email: params.email,
          phone: params.phone,
          message: params.message,
          service_type: params.serviceType,
          preferred_date: params.preferredDate,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as DirectoryLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIRECTORY_LEADS_KEY] });
    },
  });
}

/** Fetch leads for a listing (owner view) */
export function useDirectoryLeads(listingId: string | undefined) {
  return useQuery({
    queryKey: [DIRECTORY_LEADS_KEY, listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directory_leads")
        .select("*")
        .eq("listing_id", listingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DirectoryLead[];
    },
    enabled: !!listingId,
  });
}
