import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface NearbyEvent {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  latitude: number;
  longitude: number;
  memorial_id: string | null;
  distance_km: number;
}

export interface NearbyListing {
  id: string;
  title: string;
  description: string | null;
  price_cents: number | null;
  listing_type: string;
  location: string | null;
  latitude: number;
  longitude: number;
  images: string[] | null;
  category_id: string | null;
  distance_km: number;
}

export interface NearbyBusiness {
  id: string;
  business_name: string;
  business_type: string;
  description: string | null;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  rating_avg: number | null;
  rating_count: number | null;
  is_verified: boolean;
  distance_km: number;
}

export interface NearbyContentResult {
  events: NearbyEvent[];
  marketplace: NearbyListing[];
  directory: NearbyBusiness[];
}

// ─── Merged "nearby item" for mixed-feed display ──────────────────────────────

export type NearbyItemType = "event" | "marketplace" | "directory";

export interface NearbyItem {
  id: string;
  type: NearbyItemType;
  title: string;
  subtitle: string;
  distance_km: number;
  imageUrl?: string | null;
  route: string;
  accentColor: string;
  iconName: string;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fetch nearby events, marketplace listings, and directory businesses
 * within a given radius of the user's location.
 */
export function useNearbyContent(
  latitude?: number,
  longitude?: number,
  radiusKm = 50
) {
  return useQuery<NearbyContentResult>({
    queryKey: ["nearby-content", latitude, longitude, radiusKm],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("nearby_content", {
        user_lat: latitude,
        user_lon: longitude,
        radius_km: radiusKm,
        content_limit: 20,
      });
      if (error) throw error;
      return (data ?? { events: [], marketplace: [], directory: [] }) as NearbyContentResult;
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Transform NearbyContentResult into a flat list of NearbyItems
 * sorted by distance, for display in a mixed horizontal feed.
 */
export function flattenNearbyContent(content: NearbyContentResult | undefined): NearbyItem[] {
  if (!content) return [];

  const items: NearbyItem[] = [];

  // Events → blue
  for (const e of content.events) {
    items.push({
      id: e.id,
      type: "event",
      title: e.title,
      subtitle: e.location ?? e.type,
      distance_km: e.distance_km,
      imageUrl: null,
      route: `/events/${e.id}`,
      accentColor: "#2563EB",
      iconName: "calendar-outline",
    });
  }

  // Marketplace → green
  for (const m of content.marketplace) {
    const price = m.price_cents
      ? `$${(m.price_cents / 100).toFixed(0)}`
      : "Free";
    items.push({
      id: m.id,
      type: "marketplace",
      title: m.title,
      subtitle: `${price} · ${m.listing_type}`,
      distance_km: m.distance_km,
      imageUrl: m.images?.[0] ?? null,
      route: `/marketplace/${m.id}`,
      accentColor: "#16A34A",
      iconName: "pricetag-outline",
    });
  }

  // Directory → purple
  for (const d of content.directory) {
    const rating = d.rating_avg ? `★ ${d.rating_avg.toFixed(1)}` : "";
    items.push({
      id: d.id,
      type: "directory",
      title: d.business_name,
      subtitle: [d.business_type, rating].filter(Boolean).join(" · "),
      distance_km: d.distance_km,
      imageUrl: null,
      route: `/directory/${d.id}`,
      accentColor: "#7C3AED",
      iconName: "storefront-outline",
    });
  }

  // Sort by distance
  items.sort((a, b) => a.distance_km - b.distance_km);
  return items;
}
