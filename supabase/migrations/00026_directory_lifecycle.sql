-- ============================================================
-- Migration 00026: Directory Mass Import & Lifecycle Stages
-- Phase 6, Sprint 5
-- ============================================================

-- 1. Directory Import Batches
CREATE TABLE IF NOT EXISTS directory_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('google_places','yelp','manual_csv','partnership','web_scrape')),
  category text NOT NULL,
  region text,
  total_listings integer DEFAULT 0,
  imported_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  imported_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Celebrity Memorial Requests
CREATE TABLE IF NOT EXISTS celebrity_memorial_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  celebrity_name text NOT NULL,
  wikipedia_url text,
  known_for text,
  date_of_birth date,
  date_of_death date,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','created','rejected')),
  memorial_id uuid REFERENCES memorials(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. Lifecycle Stages
CREATE TABLE IF NOT EXISTS lifecycle_stages (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  color text NOT NULL,
  features text[],
  sort_order integer
);

-- 4. ALTER existing tables
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'remember';

-- living_tributes may not exist yet; wrap in DO block
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'living_tributes') THEN
    ALTER TABLE living_tributes ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'celebrate';
  END IF;
END $$;

-- ============================================================
-- SEED: Lifecycle Stages
-- ============================================================
INSERT INTO lifecycle_stages (id, name, description, icon, color, features, sort_order) VALUES
  (1, 'Celebrate', 'Honor achievements, milestones, and birthdays while they are living', 'sparkles', '#F59E0B', ARRAY['Living tributes','Birthday celebrations','Achievement honors'], 1),
  (2, 'Preserve', 'Capture stories, photos, and memories before they fade', 'camera', '#3B82F6', ARRAY['Memory vault','Family tree','Story recording'], 2),
  (3, 'Support', 'Rally around those who are aging, ill, or transitioning', 'heart', '#EC4899', ARRAY['Care circles','Gift flowers','Support messages'], 3),
  (4, 'Remember', 'After passing, keep their memory alive', 'flame', '#8B5CF6', ARRAY['Memorials','Tribute wall','Candle lighting'], 4),
  (5, 'Legacy', 'Their impact continues through stories, lessons, and inspiration', 'star', '#F97316', ARRAY['Legacy profiles','Inspiration feed','Impact stories'], 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Sample Directory Import Batches
-- ============================================================
INSERT INTO directory_import_batches (source, category, region, total_listings, imported_count, status) VALUES
  ('google_places', 'Funeral Homes', 'New York, NY', 250, 250, 'completed'),
  ('yelp', 'Florists', 'Los Angeles, CA', 180, 180, 'completed'),
  ('manual_csv', 'Grief Counselors', 'Chicago, IL', 45, 45, 'completed'),
  ('partnership', 'Memorial Parks', 'Houston, TX', 120, 98, 'processing'),
  ('web_scrape', 'Estate Attorneys', 'Miami, FL', 90, 0, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

-- directory_import_batches: readable by admins only
ALTER TABLE directory_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read import batches"
  ON directory_import_batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert import batches"
  ON directory_import_batches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- celebrity_memorial_requests: insertable by authenticated, readable by requester
ALTER TABLE celebrity_memorial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can request celebrity memorials"
  ON celebrity_memorial_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can read their own requests"
  ON celebrity_memorial_requests FOR SELECT
  USING (auth.uid() = requested_by);

-- lifecycle_stages: readable by all (public reference data)
ALTER TABLE lifecycle_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lifecycle stages"
  ON lifecycle_stages FOR SELECT
  USING (true);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_directory_import_batches_status ON directory_import_batches(status);
CREATE INDEX IF NOT EXISTS idx_directory_import_batches_region ON directory_import_batches(region);
CREATE INDEX IF NOT EXISTS idx_celebrity_memorial_requests_status ON celebrity_memorial_requests(status);
CREATE INDEX IF NOT EXISTS idx_celebrity_memorial_requests_requested_by ON celebrity_memorial_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_lifecycle_stages_sort_order ON lifecycle_stages(sort_order);
CREATE INDEX IF NOT EXISTS idx_memorials_lifecycle_stage ON memorials(lifecycle_stage);
