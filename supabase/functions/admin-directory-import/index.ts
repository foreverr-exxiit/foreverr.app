// ============================================================
// Edge Function: admin-directory-import
// Purpose: Mass-import directory listings from external APIs
//          (Google Places, Yelp, CSV) into directory_listings.
// This is a BACKEND/ADMIN tool — not user-facing.
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Google Places API key (set in Supabase secrets)
const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") ?? "";
// Yelp API key (set in Supabase secrets)
const YELP_API_KEY = Deno.env.get("YELP_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// Types
// ============================================================

interface ImportRequest {
  source: "google_places" | "yelp" | "manual_csv";
  category: string; // e.g. "funeral_home", "florist", "grief_counselor"
  region: string; // e.g. "New York, NY" or "Los Angeles, CA"
  radius?: number; // Search radius in meters (default 50000 = 50km)
  limit?: number; // Max results (default 60)
  csvData?: CsvListing[]; // For manual_csv source
}

interface CsvListing {
  business_name: string;
  business_type: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  description?: string;
  lat?: number;
  lng?: number;
}

interface NormalizedListing {
  business_name: string;
  business_type: string;
  address: string;
  city: string;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  rating_avg: number | null;
  review_count: number | null;
  photo_url: string | null;
  source: string;
  source_id: string | null;
  status: string;
  services: string[];
}

// ============================================================
// Google Places API — Nearby Search + Details
// ============================================================

const CATEGORY_TO_GOOGLE_TYPE: Record<string, string> = {
  funeral_home: "funeral_home",
  florist: "florist",
  cemetery: "cemetery",
  church: "church",
  lawyer: "lawyer",
  counselor: "health",
  grief_counselor: "health",
  memorial_park: "park",
  hospice: "hospital",
  estate_attorney: "lawyer",
};

const CATEGORY_TO_GOOGLE_KEYWORD: Record<string, string> = {
  funeral_home: "funeral home",
  florist: "florist memorial flowers",
  cemetery: "cemetery memorial park",
  grief_counselor: "grief counselor therapist",
  estate_attorney: "estate planning attorney",
  memorial_park: "memorial park cemetery",
  hospice: "hospice care",
  church: "church",
};

async function geocodeRegion(region: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_PLACES_API_KEY) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(region)}&key=${GOOGLE_PLACES_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.results?.[0]?.geometry?.location) {
    return data.results[0].geometry.location;
  }
  return null;
}

async function searchGooglePlaces(
  category: string,
  region: string,
  radius: number,
  limit: number
): Promise<NormalizedListing[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured. Set it in Supabase secrets.");
  }

  const location = await geocodeRegion(region);
  if (!location) {
    throw new Error(`Could not geocode region: ${region}`);
  }

  const type = CATEGORY_TO_GOOGLE_TYPE[category] ?? "";
  const keyword = CATEGORY_TO_GOOGLE_KEYWORD[category] ?? category;

  const listings: NormalizedListing[] = [];
  let nextPageToken: string | null = null;

  // Google Places returns up to 20 per page, max 3 pages (60 results)
  for (let page = 0; page < 3 && listings.length < limit; page++) {
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_PLACES_API_KEY}`;

    if (type) url += `&type=${type}`;
    if (nextPageToken) url += `&pagetoken=${nextPageToken}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places error:", data.status, data.error_message);
      break;
    }

    for (const place of data.results ?? []) {
      if (listings.length >= limit) break;

      listings.push({
        business_name: place.name,
        business_type: category,
        address: place.vicinity ?? "",
        city: extractCity(place.vicinity ?? "", region),
        state: extractState(region),
        zip_code: null,
        phone: null,
        email: null,
        website_url: null,
        description: null,
        latitude: place.geometry?.location?.lat ?? null,
        longitude: place.geometry?.location?.lng ?? null,
        rating_avg: place.rating ?? null,
        review_count: place.user_ratings_total ?? null,
        photo_url: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
          : null,
        source: "google_places",
        source_id: place.place_id ?? null,
        status: "active",
        services: [],
      });
    }

    nextPageToken = data.next_page_token ?? null;
    if (!nextPageToken) break;

    // Google requires a short delay before using next_page_token
    await new Promise((r) => setTimeout(r, 2000));
  }

  return listings;
}

// ============================================================
// Yelp Fusion API
// ============================================================

const CATEGORY_TO_YELP: Record<string, string> = {
  funeral_home: "funeralservices",
  florist: "florists",
  cemetery: "cemeteries",
  grief_counselor: "counseling",
  estate_attorney: "estateplanning",
  memorial_park: "cemeteries",
  hospice: "hospice",
  church: "churches",
};

async function searchYelp(
  category: string,
  region: string,
  limit: number
): Promise<NormalizedListing[]> {
  if (!YELP_API_KEY) {
    throw new Error("YELP_API_KEY not configured. Set it in Supabase secrets.");
  }

  const yelpCategory = CATEGORY_TO_YELP[category] ?? category;
  const offset = 0;
  const fetchLimit = Math.min(limit, 50); // Yelp max 50 per request

  const listings: NormalizedListing[] = [];
  let currentOffset = offset;

  while (listings.length < limit) {
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(region)}&categories=${yelpCategory}&limit=${fetchLimit}&offset=${currentOffset}&sort_by=rating`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${YELP_API_KEY}` },
    });

    if (!res.ok) {
      console.error("Yelp error:", res.status, await res.text());
      break;
    }

    const data = await res.json();

    for (const biz of data.businesses ?? []) {
      if (listings.length >= limit) break;

      listings.push({
        business_name: biz.name,
        business_type: category,
        address: biz.location?.address1 ?? "",
        city: biz.location?.city ?? extractCity("", region),
        state: biz.location?.state ?? extractState(region),
        zip_code: biz.location?.zip_code ?? null,
        phone: biz.phone ?? null,
        email: null,
        website_url: biz.url ?? null,
        description: biz.categories?.map((c: any) => c.title).join(", ") ?? null,
        latitude: biz.coordinates?.latitude ?? null,
        longitude: biz.coordinates?.longitude ?? null,
        rating_avg: biz.rating ?? null,
        review_count: biz.review_count ?? null,
        photo_url: biz.image_url ?? null,
        source: "yelp",
        source_id: biz.id ?? null,
        status: "active",
        services: biz.categories?.map((c: any) => c.title) ?? [],
      });
    }

    if ((data.businesses ?? []).length < fetchLimit) break;
    currentOffset += fetchLimit;
  }

  return listings;
}

// ============================================================
// CSV Import (manual partner data)
// ============================================================

function processCsvData(csvData: CsvListing[], category: string): NormalizedListing[] {
  return csvData.map((row) => ({
    business_name: row.business_name,
    business_type: row.business_type || category,
    address: row.address || "",
    city: row.city || "",
    state: row.state ?? null,
    zip_code: row.zip_code ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    website_url: row.website_url ?? null,
    description: row.description ?? null,
    latitude: row.lat ?? null,
    longitude: row.lng ?? null,
    rating_avg: null,
    review_count: null,
    photo_url: null,
    source: "manual_csv",
    source_id: null,
    status: "active",
    services: [],
  }));
}

// ============================================================
// Helpers
// ============================================================

function extractCity(address: string, region: string): string {
  // Try to extract city from region string like "New York, NY"
  const parts = region.split(",");
  return parts[0]?.trim() ?? "";
}

function extractState(region: string): string | null {
  const parts = region.split(",");
  return parts[1]?.trim() ?? null;
}

// ============================================================
// Main Handler
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the calling user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ImportRequest = await req.json();
    const { source, category, region, radius = 50000, limit = 60, csvData } = body;

    if (!source || !category || !region) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: source, category, region" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create an import batch record
    const { data: batch, error: batchError } = await supabase
      .from("directory_import_batches")
      .insert({
        source,
        category,
        region,
        total_listings: 0,
        imported_count: 0,
        status: "processing",
        imported_by: user.id,
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // 2. Fetch listings from the specified source
    let listings: NormalizedListing[] = [];

    switch (source) {
      case "google_places":
        listings = await searchGooglePlaces(category, region, radius, limit);
        break;
      case "yelp":
        listings = await searchYelp(category, region, limit);
        break;
      case "manual_csv":
        if (!csvData || csvData.length === 0) {
          throw new Error("csvData is required for manual_csv source");
        }
        listings = processCsvData(csvData, category);
        break;
      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    // 3. Update batch with total count
    await supabase
      .from("directory_import_batches")
      .update({ total_listings: listings.length })
      .eq("id", batch.id);

    // 4. Upsert listings into directory_listings (deduplicate by source_id or name+address)
    let importedCount = 0;
    const errors: string[] = [];

    for (const listing of listings) {
      try {
        // Check for duplicates by source_id or name+city
        let isDuplicate = false;

        if (listing.source_id) {
          const { data: existing } = await supabase
            .from("directory_listings")
            .select("id")
            .eq("source_id", listing.source_id)
            .maybeSingle();
          isDuplicate = !!existing;
        }

        if (!isDuplicate) {
          const { data: existing } = await supabase
            .from("directory_listings")
            .select("id")
            .ilike("business_name", listing.business_name)
            .ilike("city", listing.city || "")
            .maybeSingle();
          isDuplicate = !!existing;
        }

        if (isDuplicate) {
          continue; // Skip duplicates
        }

        const { error: insertError } = await supabase
          .from("directory_listings")
          .insert({
            business_name: listing.business_name,
            business_type: listing.business_type,
            address: listing.address,
            city: listing.city,
            state: listing.state,
            zip_code: listing.zip_code,
            phone: listing.phone,
            email: listing.email,
            website_url: listing.website_url,
            description: listing.description,
            latitude: listing.latitude,
            longitude: listing.longitude,
            rating_avg: listing.rating_avg,
            review_count: listing.review_count,
            photo_url: listing.photo_url,
            source: listing.source,
            source_id: listing.source_id,
            services: listing.services,
            status: "active",
          });

        if (insertError) {
          errors.push(`${listing.business_name}: ${insertError.message}`);
        } else {
          importedCount++;
        }
      } catch (err) {
        errors.push(`${listing.business_name}: ${String(err)}`);
      }
    }

    // 5. Update batch with final counts
    await supabase
      .from("directory_import_batches")
      .update({
        imported_count: importedCount,
        status: errors.length === 0 ? "completed" : importedCount > 0 ? "completed" : "failed",
      })
      .eq("id", batch.id);

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: batch.id,
        total_found: listings.length,
        imported: importedCount,
        skipped_duplicates: listings.length - importedCount - errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
