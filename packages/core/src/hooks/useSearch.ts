import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SearchResultType = "memorial" | "directory" | "tribute" | "user";

export interface SearchResult {
  id: string;
  result_type: SearchResultType;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  rank: number;
}

/* ------------------------------------------------------------------ */
/*  useGlobalSearch — Full-text search across all content              */
/* ------------------------------------------------------------------ */
export function useGlobalSearch(query: string, options?: { limit?: number; enabled?: boolean }) {
  const trimmedQuery = query.trim();
  const limit = options?.limit ?? 20;
  const enabled = (options?.enabled ?? true) && trimmedQuery.length >= 2;

  return useQuery({
    queryKey: ["global-search", trimmedQuery, limit],
    enabled,
    queryFn: async () => {
      // Use the search_all database function
      const { data, error } = await (supabase as any).rpc("search_all", {
        query: trimmedQuery,
        result_limit: limit,
      });

      if (error) {
        // Fallback to basic ILIKE search if tsvector not available
        return fallbackSearch(trimmedQuery, limit);
      }

      return (data ?? []) as SearchResult[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/* ------------------------------------------------------------------ */
/*  useSearchMemorials — Search memorials specifically                  */
/* ------------------------------------------------------------------ */
export function useSearchMemorials(query: string, limit = 20) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search-memorials", trimmed],
    enabled: trimmed.length >= 2,
    queryFn: async () => {
      // Try full-text search first
      const { data, error } = await (supabase as any)
        .from("memorials")
        .select("id, first_name, last_name, nickname, cover_photo_url, profile_photo_url, place_of_birth, date_of_birth, date_of_death, lifecycle_stage, slug")
        .or(`first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,nickname.ilike.%${trimmed}%`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 30 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  useSearchDirectory — Search directory listings                     */
/* ------------------------------------------------------------------ */
export function useSearchDirectory(query: string, limit = 20) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search-directory", trimmed],
    enabled: trimmed.length >= 2,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("directory_listings")
        .select("*")
        .or(`business_name.ilike.%${trimmed}%,city.ilike.%${trimmed}%,business_type.ilike.%${trimmed}%`)
        .eq("status", "active")
        .order("rating_avg", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 30 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  useSearchUsers — Search user profiles                              */
/* ------------------------------------------------------------------ */
export function useSearchUsers(query: string, limit = 20) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search-users", trimmed],
    enabled: trimmed.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, bio")
        .or(`display_name.ilike.%${trimmed}%,username.ilike.%${trimmed}%`)
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  useDebounceSearch — Debounced search state                         */
/* ------------------------------------------------------------------ */
export function useDebounceSearch(delayMs = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), delayMs);
    return () => clearTimeout(timeout);
  }, [query, delayMs]);

  return { query, setQuery, debouncedQuery };
}

/* ------------------------------------------------------------------ */
/*  Fallback search (ILIKE) when tsvector is not available             */
/* ------------------------------------------------------------------ */
async function fallbackSearch(query: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Search memorials
  const { data: memorials } = await (supabase as any)
    .from("memorials")
    .select("id, first_name, last_name, cover_photo_url, profile_photo_url, place_of_birth")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .eq("status", "active")
    .limit(Math.floor(limit / 2));

  for (const m of (memorials ?? []) as any[]) {
    results.push({
      id: m.id,
      result_type: "memorial",
      title: `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim(),
      subtitle: m.place_of_birth,
      image_url: m.profile_photo_url ?? m.cover_photo_url,
      rank: 1,
    });
  }

  // Search directory
  const { data: listings } = await (supabase as any)
    .from("directory_listings")
    .select("id, business_name, city, state")
    .or(`business_name.ilike.%${query}%,city.ilike.%${query}%`)
    .eq("status", "active")
    .limit(Math.floor(limit / 2));

  for (const d of (listings ?? []) as any[]) {
    results.push({
      id: d.id,
      result_type: "directory",
      title: d.business_name,
      subtitle: d.city ? `${d.city}, ${d.state ?? ""}` : null,
      image_url: null,
      rank: 0.5,
    });
  }

  return results.sort((a, b) => b.rank - a.rank).slice(0, limit);
}
