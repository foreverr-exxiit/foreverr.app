import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import {
  STATIC_CELEBRITIES,
  STATIC_NEWS,
  getStaticNearbyHistory,
} from "../data/celebrityData";

/**
 * Fetch recent celebrity obituaries / deaths, ordered by date_of_death descending.
 * Falls back to static data when the DB table is empty or doesn't exist yet.
 */
export function useRecentObituaries(limit = 10) {
  return useQuery({
    queryKey: ["celebrity-obituaries", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("celebrity_memorials")
          .select("*")
          .eq("is_active", true)
          .order("date_of_death", { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch {
        // Table might not exist yet — fall back to static
      }
      return STATIC_CELEBRITIES.slice(0, limit);
    },
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch celebrity deaths matching today's month/day for "On This Day" section.
 * Falls back to curated featured celebs when no exact match exists.
 */
export function useTodayInHistory() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return useQuery({
    queryKey: ["today-in-history", month, day],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("celebrity_memorials")
          .select("*")
          .eq("is_active", true)
          .eq("death_month", month)
          .eq("death_day", day)
          .order("date_of_death", { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch {
        // Fall through to static
      }
      // Return nearby/featured static data so there's always content
      return getStaticNearbyHistory(month, day);
    },
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetch featured / highlighted celebrity memorials.
 * Falls back to static featured set.
 */
export function useFeaturedCelebrities(limit = 10) {
  return useQuery({
    queryKey: ["featured-celebrities", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("celebrity_memorials")
          .select("*")
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("view_count", { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch {
        // Fall through
      }
      return STATIC_CELEBRITIES.filter((c) => c.is_featured).slice(0, limit);
    },
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch all celebrity memorials (for browsing / discovery).
 * Falls back to full static list.
 */
export function useCelebrityMemorials(limit = 20) {
  return useQuery({
    queryKey: ["celebrity-memorials", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("celebrity_memorials")
          .select("*")
          .eq("is_active", true)
          .order("full_name", { ascending: true })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch {
        // Fall through
      }
      return STATIC_CELEBRITIES.slice(0, limit);
    },
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch news feed items.
 * Falls back to static news when DB is empty.
 */
export function useNewsFeed(limit = 20) {
  return useQuery({
    queryKey: ["news-feed", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("news_items")
          .select("*")
          .eq("is_active", true)
          .order("published_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch {
        // Fall through
      }
      return STATIC_NEWS.slice(0, limit);
    },
    staleTime: 1000 * 60 * 15,
  });
}

/**
 * Fetch featured news items only.
 * Falls back to static featured news.
 */
export function useFeaturedNews(limit = 5) {
  return useQuery({
    queryKey: ["featured-news", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("news_items")
          .select("*")
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("published_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch {
        // Fall through
      }
      return STATIC_NEWS.filter((n) => n.is_featured).slice(0, limit);
    },
    staleTime: 1000 * 60 * 30,
  });
}
