-- Migration 00032: Proximity Support
-- Adds location columns to events and profiles for proximity-based feed

-- ─── 1. Add lat/long to events ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'latitude') THEN
    ALTER TABLE events ADD COLUMN latitude double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'longitude') THEN
    ALTER TABLE events ADD COLUMN longitude double precision;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_location ON events USING gist (point(longitude, latitude));

-- ─── 2. Add location to user profiles ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'region') THEN
    ALTER TABLE profiles ADD COLUMN region text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'latitude') THEN
    ALTER TABLE profiles ADD COLUMN latitude double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longitude') THEN
    ALTER TABLE profiles ADD COLUMN longitude double precision;
  END IF;
END $$;

-- ─── 3. Nearby content RPC ────────────────────────────────────────────────────
-- Returns events, marketplace listings, and directory businesses within a radius
-- Uses point-based distance (approx km via 111.045 km/degree)
CREATE OR REPLACE FUNCTION nearby_content(
  user_lat double precision,
  user_lon double precision,
  radius_km double precision DEFAULT 50,
  content_limit integer DEFAULT 20
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'events', COALESCE((
      SELECT jsonb_agg(row_to_json(e))
      FROM (
        SELECT id, title, description, type, location, start_date, end_date, status,
          latitude, longitude, memorial_id,
          round(((point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045)::numeric, 1) AS distance_km
        FROM events
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status IN ('upcoming', 'ongoing')
          AND (point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045 <= radius_km
        ORDER BY (point(longitude, latitude) <-> point(user_lon, user_lat))
        LIMIT content_limit
      ) e
    ), '[]'::jsonb),
    'marketplace', COALESCE((
      SELECT jsonb_agg(row_to_json(m))
      FROM (
        SELECT id, title, description, price_cents, listing_type, location,
          latitude, longitude, images, category_id,
          round(((point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045)::numeric, 1) AS distance_km
        FROM marketplace_listings
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status = 'active'
          AND (point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045 <= radius_km
        ORDER BY (point(longitude, latitude) <-> point(user_lon, user_lat))
        LIMIT content_limit
      ) m
    ), '[]'::jsonb),
    'directory', COALESCE((
      SELECT jsonb_agg(row_to_json(d))
      FROM (
        SELECT id, business_name, business_type, description, city, state,
          latitude, longitude, rating_avg, rating_count, is_verified,
          round(((point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045)::numeric, 1) AS distance_km
        FROM directory_listings
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status = 'active'
          AND (point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045 <= radius_km
        ORDER BY (point(longitude, latitude) <-> point(user_lon, user_lat))
        LIMIT content_limit
      ) d
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
