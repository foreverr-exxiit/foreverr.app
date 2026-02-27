-- ============================================================
-- 00024_trust_system.sql
-- Phase 6 Sprint 3: Trust System & Memorial Creation Logic
-- Tables: trust_levels, memorial_claims, memorial_managers,
--         duplicate_reports, fundraise_campaigns_v2
-- Alters: profiles, memorials
-- ============================================================

-- 1. Trust Levels (lookup table)
CREATE TABLE IF NOT EXISTS trust_levels (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  can_create_memorial boolean DEFAULT true,
  can_fundraise boolean DEFAULT false,
  can_claim_memorial boolean DEFAULT false,
  can_moderate boolean DEFAULT false,
  max_fundraise_amount_cents integer DEFAULT 0,
  verification_required boolean DEFAULT false
);

-- 2. Memorial Claims
CREATE TABLE IF NOT EXISTS memorial_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  claimer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('spouse','parent','child','sibling','grandchild','grandparent','extended_family','executor','close_friend')),
  evidence_type text CHECK (evidence_type IN ('obituary_link','death_certificate','family_photo','other')),
  evidence_url text,
  evidence_note text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','disputed')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(memorial_id, claimer_id)
);

-- 3. Memorial Managers
CREATE TABLE IF NOT EXISTS memorial_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','family_admin','contributor','moderator')),
  granted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(memorial_id, user_id)
);

-- 4. Duplicate Reports
CREATE TABLE IF NOT EXISTS duplicate_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memorial_id_a uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  memorial_id_b uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','merged')),
  merged_into_id uuid REFERENCES memorials(id),
  notes text,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Fundraise Campaigns V2 (trust-gated)
CREATE TABLE IF NOT EXISTS fundraise_campaigns_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  goal_cents integer NOT NULL,
  raised_cents integer DEFAULT 0,
  donor_count integer DEFAULT 0,
  beneficiary_name text,
  beneficiary_relation text,
  is_verified boolean DEFAULT false,
  trust_level integer DEFAULT 1,
  platform_fee_pct numeric DEFAULT 5.0,
  status text DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','cancelled')),
  expires_at timestamptz,
  payout_method text CHECK (payout_method IN ('stripe','paypal','check')),
  payout_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ALTER existing tables
-- ============================================================

-- Add trust_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_level integer DEFAULT 1;

-- Add claim & celebrity columns to memorials
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS claimed_by uuid;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_celebrity boolean DEFAULT false;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS celebrity_verified boolean DEFAULT false;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_memorial_claims_memorial ON memorial_claims(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_managers_memorial ON memorial_managers(memorial_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_reports_status ON duplicate_reports(status);
CREATE INDEX IF NOT EXISTS idx_fundraise_v2_memorial ON fundraise_campaigns_v2(memorial_id);

-- ============================================================
-- Seed trust levels
-- ============================================================

INSERT INTO trust_levels (id, name, description, can_create_memorial, can_fundraise, can_claim_memorial, can_moderate, max_fundraise_amount_cents, verification_required)
VALUES
  (1, 'Community', 'Default level', true, false, false, false, 0, false),
  (2, 'Verified', 'Email and phone verified', true, true, false, false, 100000, true),
  (3, 'Family Verified', 'Approved family claim', true, true, true, true, 2500000, true),
  (4, 'Executor', 'Legal documentation provided', true, true, true, true, 0, true),
  (5, 'Admin', 'Platform moderator', true, true, true, true, 0, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE trust_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraise_campaigns_v2 ENABLE ROW LEVEL SECURITY;

-- trust_levels: readable by all
CREATE POLICY "trust_levels_select" ON trust_levels
  FOR SELECT USING (true);

-- memorial_claims: readable by claimer or memorial creator
CREATE POLICY "memorial_claims_select" ON memorial_claims
  FOR SELECT USING (
    claimer_id = auth.uid()
    OR memorial_id IN (
      SELECT id FROM memorials WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "memorial_claims_insert" ON memorial_claims
  FOR INSERT WITH CHECK (claimer_id = auth.uid());

-- memorial_managers: readable by memorial participants
CREATE POLICY "memorial_managers_select" ON memorial_managers
  FOR SELECT USING (
    user_id = auth.uid()
    OR memorial_id IN (
      SELECT memorial_id FROM memorial_managers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "memorial_managers_insert" ON memorial_managers
  FOR INSERT WITH CHECK (
    granted_by = auth.uid()
    AND memorial_id IN (
      SELECT memorial_id FROM memorial_managers
      WHERE user_id = auth.uid() AND role IN ('owner', 'family_admin')
    )
  );

CREATE POLICY "memorial_managers_delete" ON memorial_managers
  FOR DELETE USING (
    memorial_id IN (
      SELECT memorial_id FROM memorial_managers
      WHERE user_id = auth.uid() AND role IN ('owner', 'family_admin')
    )
  );

-- duplicate_reports: readable by reporter
CREATE POLICY "duplicate_reports_select" ON duplicate_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "duplicate_reports_insert" ON duplicate_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- fundraise_campaigns_v2: readable by all, insertable by authenticated
CREATE POLICY "fundraise_v2_select" ON fundraise_campaigns_v2
  FOR SELECT USING (true);

CREATE POLICY "fundraise_v2_insert" ON fundraise_campaigns_v2
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "fundraise_v2_update" ON fundraise_campaigns_v2
  FOR UPDATE USING (creator_id = auth.uid());

-- ============================================================
-- Updated_at trigger helper (reuse if exists)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memorial_claims_updated_at
  BEFORE UPDATE ON memorial_claims
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER duplicate_reports_updated_at
  BEFORE UPDATE ON duplicate_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER fundraise_v2_updated_at
  BEFORE UPDATE ON fundraise_campaigns_v2
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
