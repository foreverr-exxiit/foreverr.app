-- BATCH 3 OF 4: Migrations 00024-00039
-- Production & polish features

-- === 00024_trust_system.sql ===
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

-- === 00025_content_import.sql ===
-- ============================================================
-- 00025_content_import.sql
-- Phase 6 Sprint 4: Content Import Center
-- Tables: import_jobs, import_items, connected_accounts
-- ============================================================

-- -------------------------------------------------------
-- 1. import_jobs — tracks bulk import operations
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type   text NOT NULL CHECK (source_type IN (
    'facebook','instagram','twitter','tiktok','google_photos','apple_photos',
    'gedcom','csv','legacy_com','findagrave','ancestry','manual'
  )),
  target_type   text NOT NULL CHECK (target_type IN (
    'memorial','living_tribute','memory_vault','family_tree','profile'
  )),
  target_id     uuid,
  status        text DEFAULT 'pending' CHECK (status IN (
    'pending','processing','completed','failed','partial'
  )),
  total_items     integer DEFAULT 0,
  imported_items  integer DEFAULT 0,
  failed_items    integer DEFAULT 0,
  error_log       jsonb DEFAULT '[]'::jsonb,
  source_metadata jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 2. import_items — individual items within an import job
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id   uuid NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  source_url      text,
  source_id       text,
  content_type    text NOT NULL CHECK (content_type IN (
    'photo','video','text','post','story','memory','person','relationship'
  )),
  content         text,
  media_url       text,
  metadata        jsonb,
  status          text DEFAULT 'pending' CHECK (status IN (
    'pending','imported','skipped','failed'
  )),
  target_item_id  uuid,
  created_at      timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 3. connected_accounts — OAuth social account links
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS connected_accounts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform                text NOT NULL CHECK (platform IN (
    'facebook','instagram','twitter','tiktok','google','apple'
  )),
  platform_user_id        text,
  access_token_encrypted  text,
  refresh_token_encrypted text,
  token_expires_at        timestamptz,
  display_name            text,
  avatar_url              text,
  is_active               boolean DEFAULT true,
  last_sync_at            timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_import_jobs_user
  ON import_jobs (user_id, status);

CREATE INDEX IF NOT EXISTS idx_import_items_job
  ON import_items (import_job_id);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user
  ON connected_accounts (user_id);

-- -------------------------------------------------------
-- RLS — all tables private to the owning user
-- -------------------------------------------------------

-- import_jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_jobs_select_own"
  ON import_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "import_jobs_insert_own"
  ON import_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "import_jobs_update_own"
  ON import_jobs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "import_jobs_delete_own"
  ON import_jobs FOR DELETE
  USING (user_id = auth.uid());

-- import_items (access via parent job ownership)
ALTER TABLE import_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_items_select_own"
  ON import_items FOR SELECT
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_insert_own"
  ON import_items FOR INSERT
  WITH CHECK (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_update_own"
  ON import_items FOR UPDATE
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_delete_own"
  ON import_items FOR DELETE
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

-- connected_accounts
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connected_accounts_select_own"
  ON connected_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "connected_accounts_insert_own"
  ON connected_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "connected_accounts_update_own"
  ON connected_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "connected_accounts_delete_own"
  ON connected_accounts FOR DELETE
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- updated_at trigger for import_jobs
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_import_jobs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_jobs_updated_at();

-- -------------------------------------------------------
-- updated_at trigger for connected_accounts
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_connected_accounts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_connected_accounts_updated_at();

-- === 00026_directory_lifecycle.sql ===
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

-- === 00027_phase6_polish.sql ===
-- Phase 6 Sprint 6: Polish & notifications enhancement
-- Add metadata column for rich notification data
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);

-- === 00028_premium_subscriptions.sql ===
-- ============================================================
-- Migration 00028: Premium Subscriptions & Monetization
-- ============================================================
-- Tables: subscription_plans, user_subscriptions, premium_entitlements,
--         billing_history, premium_feature_gates
-- ============================================================

-- ── Subscription Plans ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,                                -- "Free", "Premium", "Elite"
  slug            text NOT NULL UNIQUE,                         -- "free", "premium", "elite"
  description     text,
  price_cents     integer NOT NULL DEFAULT 0,                   -- Monthly price in cents (999 = $9.99)
  annual_price_cents integer DEFAULT 0,                         -- Annual price in cents (7999 = $79.99)
  currency        text NOT NULL DEFAULT 'USD',
  tier            integer NOT NULL DEFAULT 0,                   -- 0=free, 1=premium, 2=elite
  features        jsonb DEFAULT '[]'::jsonb,                    -- Array of feature keys
  limits          jsonb DEFAULT '{}'::jsonb,                    -- { "vault_items": 100, "share_cards": -1 }
  badge_icon      text,                                         -- Icon name for badge display
  badge_color     text,                                         -- Hex color for badge
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer DEFAULT 0,
  store_product_id_monthly  text,                               -- RevenueCat/App Store product ID (monthly)
  store_product_id_annual   text,                               -- RevenueCat/App Store product ID (annual)
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── User Subscriptions ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id             uuid NOT NULL REFERENCES public.subscription_plans(id),
  status              text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired', 'paused')),
  billing_period      text NOT NULL DEFAULT 'monthly'
                      CHECK (billing_period IN ('monthly', 'annual', 'lifetime')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end  timestamptz,
  trial_start         timestamptz,
  trial_end           timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at        timestamptz,
  -- Payment provider references
  provider            text DEFAULT 'revenuecat'
                      CHECK (provider IN ('revenuecat', 'stripe', 'apple', 'google', 'manual')),
  provider_subscription_id  text,                               -- RevenueCat/Stripe subscription ID
  provider_customer_id      text,                               -- RevenueCat/Stripe customer ID
  -- Points bonus
  points_multiplier   numeric(3,1) DEFAULT 1.0,                 -- 1.5x for premium, 2.0x for elite
  -- Metadata
  metadata            jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(user_id)                                               -- One active subscription per user
);

-- ── Premium Entitlements ────────────────────────────────────
-- Granular feature access — ties plan features to boolean gates

CREATE TABLE IF NOT EXISTS public.premium_entitlements (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id         uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_key     text NOT NULL,                                -- "premium_templates", "ai_voice", etc.
  description     text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(plan_id, feature_key)
);

-- ── Billing History ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.billing_history (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id     uuid REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount_cents        integer NOT NULL,
  currency            text NOT NULL DEFAULT 'USD',
  description         text,
  status              text NOT NULL DEFAULT 'completed'
                      CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider            text,
  provider_payment_id text,                                     -- Stripe charge ID / RevenueCat transaction
  invoice_url         text,
  receipt_url         text,
  metadata            jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz DEFAULT now()
);

-- ── Premium Feature Gates ───────────────────────────────────
-- Master list of all gatable features with their required tier

CREATE TABLE IF NOT EXISTS public.premium_feature_gates (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key     text NOT NULL UNIQUE,
  label           text NOT NULL,                                -- Human-readable name
  description     text,
  required_tier   integer NOT NULL DEFAULT 1,                   -- Minimum plan tier (0=free, 1=premium, 2=elite)
  category        text DEFAULT 'general'
                  CHECK (category IN ('general', 'templates', 'ai', 'gifts', 'storage', 'social', 'customization')),
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON public.billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_entitlements_plan_id ON public.premium_entitlements(plan_id);
CREATE INDEX IF NOT EXISTS idx_premium_entitlements_feature_key ON public.premium_entitlements(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_feature_gates_feature_key ON public.premium_feature_gates(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_feature_gates_tier ON public.premium_feature_gates(required_tier);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_feature_gates ENABLE ROW LEVEL SECURITY;

-- Plans: readable by everyone
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- User subscriptions: users can view their own
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Entitlements: readable by everyone (just a config table)
CREATE POLICY "Anyone can view entitlements"
  ON public.premium_entitlements FOR SELECT
  USING (true);

-- Billing history: users can view their own
CREATE POLICY "Users can view own billing history"
  ON public.billing_history FOR SELECT
  USING (auth.uid() = user_id);

-- Feature gates: readable by everyone (config table)
CREATE POLICY "Anyone can view feature gates"
  ON public.premium_feature_gates FOR SELECT
  USING (true);

-- ============================================================
-- Seed: Subscription Plans
-- ============================================================

INSERT INTO public.subscription_plans (name, slug, description, price_cents, annual_price_cents, tier, badge_icon, badge_color, features, limits, sort_order, store_product_id_monthly, store_product_id_annual) VALUES
(
  'Free',
  'free',
  'Everything you need to honor and remember loved ones',
  0,
  0,
  0,
  'heart',
  '#6B7280',
  '["memorials", "tributes", "basic_gifts", "basic_templates", "points", "streaks", "5_vault_items", "1_living_tribute"]'::jsonb,
  '{"vault_items": 5, "living_tributes": 1, "share_cards_per_month": 3, "ai_generations_per_month": 2}'::jsonb,
  0,
  NULL,
  NULL
),
(
  'Foreverr Premium',
  'premium',
  'Unlock premium templates, AI features, and unlimited access',
  999,
  7999,
  1,
  'diamond',
  '#7C3AED',
  '["all_free_features", "premium_templates", "premium_gifts", "animated_cards", "ad_free", "custom_themes", "unlimited_vault", "unlimited_living_tributes", "ai_voice", "ai_photo_restore", "ai_memorial_video", "priority_support", "points_1_5x"]'::jsonb,
  '{"vault_items": -1, "living_tributes": -1, "share_cards_per_month": -1, "ai_generations_per_month": 50}'::jsonb,
  1,
  'foreverr_premium_monthly',
  'foreverr_premium_annual'
),
(
  'Foreverr Elite',
  'elite',
  'The ultimate experience with exclusive perks and family plans',
  1999,
  15999,
  2,
  'star',
  '#D97706',
  '["all_premium_features", "physical_gifts", "family_plan_5", "branded_cards", "vip_events", "priority_celebrity_requests", "custom_domains", "white_label_exports", "dedicated_support", "points_2x"]'::jsonb,
  '{"vault_items": -1, "living_tributes": -1, "share_cards_per_month": -1, "ai_generations_per_month": -1, "family_members": 5}'::jsonb,
  2,
  'foreverr_elite_monthly',
  'foreverr_elite_annual'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Premium Feature Gates
-- ============================================================

INSERT INTO public.premium_feature_gates (feature_key, label, description, required_tier, category) VALUES
-- Templates & Customization (tier 1 = Premium)
('premium_templates',       'Premium Templates',           'Unlock Gold, Rose, Ocean and more card templates',       1, 'templates'),
('animated_cards',          'Animated Cards',              'Create animated share cards with motion effects',         1, 'templates'),
('custom_themes',           'Custom Themes',               'Personalize your memorial and tribute pages',             1, 'customization'),
('branded_cards',           'Branded Cards',               'Custom branded share cards with your own logo',           2, 'customization'),
('white_label_exports',    'White-Label Exports',          'Export content without Foreverr branding',                2, 'customization'),

-- AI Features (tier 1 = Premium)
('ai_voice',               'AI Voice Cloning',            'Generate voice messages using AI voice synthesis',         1, 'ai'),
('ai_photo_restore',       'AI Photo Restoration',        'Restore and enhance old photos using AI',                 1, 'ai'),
('ai_memorial_video',      'AI Memorial Video',           'Auto-generate tribute videos from photos and text',       1, 'ai'),
('unlimited_ai',           'Unlimited AI Generations',    'No monthly limit on AI-powered features',                 2, 'ai'),

-- Gifts (tier 1 = Premium)
('premium_gifts',          'Premium Digital Gifts',       'Access exclusive premium gift catalog items',              1, 'gifts'),
('physical_gifts',         'Physical Gifts',              'Send real flowers, cards, and keepsakes',                  2, 'gifts'),

-- Storage (tier 1 = Premium)
('unlimited_vault',        'Unlimited Memory Vault',      'Store unlimited photos, videos, and documents',           1, 'storage'),
('unlimited_living_tributes', 'Unlimited Living Tributes', 'Create unlimited living tribute pages',                  1, 'storage'),
('unlimited_share_cards',  'Unlimited Share Cards',        'Create unlimited announcement and share cards',           1, 'storage'),

-- Social & Events (tier 2 = Elite)
('vip_events',             'VIP Event Hosting',           'Host premium virtual events with advanced features',      2, 'social'),
('priority_celebrity_requests', 'Priority Celebrity Requests', 'Fast-track celebrity memorial requests',             2, 'social'),
('family_plan',            'Family Plan',                 'Share your subscription with up to 5 family members',     2, 'social'),
('custom_domains',         'Custom Domains',              'Use your own domain for legacy profile pages',            2, 'social'),

-- General (tier 1 = Premium)
('ad_free',                'Ad-Free Experience',          'Browse without any advertisements',                       1, 'general'),
('priority_support',       'Priority Support',            'Get faster responses from our support team',              1, 'general'),
('points_multiplier',      'Points Multiplier',           '1.5x-2x legacy points on all actions',                   1, 'general'),
('dedicated_support',      'Dedicated Support',           'Personal support representative',                         2, 'general')

ON CONFLICT (feature_key) DO NOTHING;

-- ============================================================
-- Seed: Premium Entitlements (link plans ↔ features)
-- ============================================================

-- Premium plan entitlements
INSERT INTO public.premium_entitlements (plan_id, feature_key, description)
SELECT sp.id, fg.feature_key, fg.description
FROM public.subscription_plans sp
CROSS JOIN public.premium_feature_gates fg
WHERE sp.slug = 'premium' AND fg.required_tier <= 1
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Elite plan entitlements (gets everything)
INSERT INTO public.premium_entitlements (plan_id, feature_key, description)
SELECT sp.id, fg.feature_key, fg.description
FROM public.subscription_plans sp
CROSS JOIN public.premium_feature_gates fg
WHERE sp.slug = 'elite'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- ============================================================
-- Trigger: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_subscription_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_subscription_update
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_updated_at();

CREATE TRIGGER on_subscription_plan_update
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_updated_at();

-- ============================================================
-- Add premium_tier column to profiles for fast lookups
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN premium_tier integer DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================================
-- Function: Sync premium tier to profile on subscription change
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_premium_tier()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET premium_tier = CASE
    WHEN NEW.status IN ('active', 'trialing') THEN (
      SELECT tier FROM public.subscription_plans WHERE id = NEW.plan_id
    )
    ELSE 0
  END
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change_sync_tier
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_premium_tier();

-- === 00029_life_timeline_photos.sql ===
-- ============================================================
-- Migration 00029: Life Timeline, Milestones & Photo Face Tagging
-- Captures the complete lifecycle: birth → milestones → present/passing
-- ============================================================

-- ============================================================
-- 1. LIFE MILESTONES — Structured milestone tracking per memorial
-- ============================================================
CREATE TABLE IF NOT EXISTS life_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'birth','first_steps','first_words','first_day_school','graduation_elementary',
    'graduation_high_school','graduation_college','first_job','promotion','retirement',
    'engagement','wedding','anniversary','first_child','adoption',
    'baptism','bar_mitzvah','confirmation','first_communion',
    'first_trip','milestone_birthday','achievement','award','military_service',
    'homeownership','learned_to_drive','first_pet','custom'
  )),
  title text NOT NULL,
  description text,
  milestone_date date,
  age_at_milestone integer,
  location text,

  -- Media
  photo_url text,
  media_urls text[] DEFAULT '{}',

  -- Metadata
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES profiles(id),
  emoji text,
  sort_order integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. LIFE TIMELINE EVENTS — Unified chronological events feed
-- ============================================================
CREATE TABLE IF NOT EXISTS life_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),

  -- Event type (can be auto-generated from various sources)
  event_type text NOT NULL CHECK (event_type IN (
    'milestone','tribute','photo','memory','achievement',
    'life_event','medical','travel','education','career',
    'relationship','spiritual','hobby','community','custom'
  )),
  source_type text CHECK (source_type IN (
    'manual','auto_milestone','auto_tribute','auto_photo','import','ai_generated'
  )),
  source_id uuid, -- Reference to the original record (milestone_id, tribute_id, etc.)

  -- Content
  title text NOT NULL,
  description text,
  event_date date,
  event_end_date date, -- For multi-day events
  location text,

  -- Media
  photo_url text,
  media_urls text[] DEFAULT '{}',

  -- Display
  icon text DEFAULT 'calendar',
  color text DEFAULT '#8B5CF6',
  is_highlight boolean DEFAULT false,
  is_private boolean DEFAULT false,

  -- Ordering
  sort_date date, -- Computed date for timeline ordering (uses event_date or created_at)

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. MILESTONE TEMPLATES — Pre-defined milestone categories
-- ============================================================
CREATE TABLE IF NOT EXISTS milestone_templates (
  id serial PRIMARY KEY,
  milestone_type text NOT NULL UNIQUE,
  label text NOT NULL,
  emoji text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'childhood','education','career','relationships',
    'family','spiritual','achievements','lifestyle'
  )),
  typical_age_range text, -- e.g. "0-1", "5-6", "18-22"
  description text,
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 4. PHOTO FACE TAGS — Tag people in photos
-- ============================================================
CREATE TABLE IF NOT EXISTS photo_face_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL, -- The photo being tagged
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,

  -- Who is tagged
  tagged_memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  tagged_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tagged_name text, -- Fallback name if no memorial/profile linked

  -- Face location in image (normalized 0-1 coordinates)
  face_x numeric(5,4), -- Center X
  face_y numeric(5,4), -- Center Y
  face_width numeric(5,4),
  face_height numeric(5,4),

  -- Recognition
  confidence numeric(5,4), -- ML confidence score 0-1
  is_verified boolean DEFAULT false, -- User confirmed the tag
  is_auto_detected boolean DEFAULT false, -- Created by ML vs manual

  -- Metadata
  tagged_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. FACE EMBEDDINGS — ML face recognition vectors (backend)
-- ============================================================
CREATE TABLE IF NOT EXISTS face_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,

  -- The reference photo for this face
  source_photo_url text NOT NULL,

  -- ML embedding vector (stored as JSON array of floats)
  embedding jsonb NOT NULL,
  embedding_model text DEFAULT 'google_vision_v1',

  -- Quality
  quality_score numeric(5,4) DEFAULT 0,
  is_primary boolean DEFAULT false, -- Primary face for this person

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Either memorial_id or profile_id must be set
  CONSTRAINT face_embeddings_person_check CHECK (
    memorial_id IS NOT NULL OR profile_id IS NOT NULL
  )
);

-- ============================================================
-- 6. AUTO-REMINDER RULES — Smart reminder generation
-- ============================================================
CREATE TABLE IF NOT EXISTS auto_reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,

  rule_type text NOT NULL CHECK (rule_type IN (
    'birthday','death_anniversary','wedding_anniversary',
    'milestone_birthday','custom_recurring','days_before'
  )),
  title_template text NOT NULL, -- e.g. "{name}'s birthday is tomorrow!"
  days_before integer DEFAULT 1, -- How many days before to remind
  is_recurring boolean DEFAULT true,
  is_enabled boolean DEFAULT true,

  -- For custom recurring
  recurring_month integer, -- 1-12
  recurring_day integer, -- 1-31

  last_triggered_at timestamptz,
  next_trigger_date date,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-set sort_date on life_timeline_events
CREATE OR REPLACE FUNCTION set_timeline_sort_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sort_date := COALESCE(NEW.event_date, NEW.created_at::date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timeline_sort_date
  BEFORE INSERT OR UPDATE ON life_timeline_events
  FOR EACH ROW EXECUTE FUNCTION set_timeline_sort_date();

-- Auto-create timeline event when milestone is created
CREATE OR REPLACE FUNCTION auto_timeline_from_milestone()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO life_timeline_events (
    memorial_id, created_by, event_type, source_type, source_id,
    title, description, event_date, photo_url, media_urls,
    icon, is_highlight
  ) VALUES (
    NEW.memorial_id, NEW.created_by, 'milestone', 'auto_milestone', NEW.id,
    NEW.title, NEW.description, NEW.milestone_date, NEW.photo_url, NEW.media_urls,
    COALESCE(NEW.emoji, 'star'), true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_timeline_from_milestone
  AFTER INSERT ON life_milestones
  FOR EACH ROW EXECUTE FUNCTION auto_timeline_from_milestone();

-- Auto-compute next_trigger_date for auto_reminder_rules
CREATE OR REPLACE FUNCTION compute_next_trigger()
RETURNS TRIGGER AS $$
DECLARE
  base_date date;
BEGIN
  IF NEW.rule_type IN ('birthday','death_anniversary','wedding_anniversary','milestone_birthday') THEN
    -- Calculate from memorial dates
    IF NEW.memorial_id IS NOT NULL THEN
      SELECT
        CASE NEW.rule_type
          WHEN 'birthday' THEN date_of_birth
          WHEN 'death_anniversary' THEN date_of_death
          ELSE date_of_birth
        END INTO base_date
      FROM memorials WHERE id = NEW.memorial_id;

      IF base_date IS NOT NULL THEN
        -- Next occurrence this year or next year
        base_date := make_date(
          EXTRACT(YEAR FROM CURRENT_DATE)::int,
          EXTRACT(MONTH FROM base_date)::int,
          EXTRACT(DAY FROM base_date)::int
        );
        IF base_date < CURRENT_DATE THEN
          base_date := base_date + interval '1 year';
        END IF;
        NEW.next_trigger_date := base_date - (NEW.days_before || ' days')::interval;
      END IF;
    END IF;
  ELSIF NEW.rule_type = 'custom_recurring' AND NEW.recurring_month IS NOT NULL AND NEW.recurring_day IS NOT NULL THEN
    base_date := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::int,
      NEW.recurring_month,
      NEW.recurring_day
    );
    IF base_date < CURRENT_DATE THEN
      base_date := base_date + interval '1 year';
    END IF;
    NEW.next_trigger_date := base_date - (NEW.days_before || ' days')::interval;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_next_trigger
  BEFORE INSERT OR UPDATE ON auto_reminder_rules
  FOR EACH ROW EXECUTE FUNCTION compute_next_trigger();

-- ============================================================
-- SEED: Milestone Templates
-- ============================================================
INSERT INTO milestone_templates (milestone_type, label, emoji, category, typical_age_range, description, sort_order) VALUES
  -- Childhood
  ('birth', 'Born', '👶', 'childhood', '0', 'The day it all began', 1),
  ('first_steps', 'First Steps', '🚶', 'childhood', '0-2', 'Those magical first steps', 2),
  ('first_words', 'First Words', '🗣️', 'childhood', '0-2', 'The first time they spoke', 3),
  ('first_day_school', 'First Day of School', '🎒', 'childhood', '4-6', 'A big day for everyone', 4),
  ('first_pet', 'First Pet', '🐾', 'childhood', '3-10', 'Their first furry friend', 5),

  -- Education
  ('graduation_elementary', 'Elementary Graduation', '🎓', 'education', '10-12', 'Moving on up', 10),
  ('graduation_high_school', 'High School Graduation', '🎓', 'education', '17-19', 'A major achievement', 11),
  ('graduation_college', 'College Graduation', '🎓', 'education', '21-25', 'Degree earned', 12),

  -- Career
  ('first_job', 'First Job', '💼', 'career', '16-22', 'Entering the workforce', 20),
  ('promotion', 'Promotion', '📈', 'career', NULL, 'Moving up in their career', 21),
  ('retirement', 'Retirement', '🏖️', 'career', '55-70', 'A well-earned rest', 22),
  ('military_service', 'Military Service', '🎖️', 'career', '18-65', 'Serving their country', 23),

  -- Relationships
  ('engagement', 'Engagement', '💍', 'relationships', NULL, 'They said yes!', 30),
  ('wedding', 'Wedding Day', '💒', 'relationships', NULL, 'The big day', 31),
  ('anniversary', 'Anniversary', '🕊️', 'relationships', NULL, 'Celebrating years together', 32),

  -- Family
  ('first_child', 'First Child Born', '👨‍👩‍👧', 'family', NULL, 'Welcome to parenthood', 40),
  ('adoption', 'Adoption', '❤️', 'family', NULL, 'A family grows with love', 41),

  -- Spiritual
  ('baptism', 'Baptism', '💧', 'spiritual', '0-1', 'A spiritual beginning', 50),
  ('bar_mitzvah', 'Bar/Bat Mitzvah', '✡️', 'spiritual', '12-13', 'Coming of age', 51),
  ('first_communion', 'First Communion', '🕯️', 'spiritual', '7-8', 'A sacred moment', 52),
  ('confirmation', 'Confirmation', '✝️', 'spiritual', '13-16', 'Affirming faith', 53),

  -- Achievements
  ('achievement', 'Achievement', '🏆', 'achievements', NULL, 'Something worth celebrating', 60),
  ('award', 'Award', '🏅', 'achievements', NULL, 'Recognized for excellence', 61),

  -- Lifestyle
  ('learned_to_drive', 'Learned to Drive', '🚗', 'lifestyle', '16-18', 'Freedom on wheels', 70),
  ('homeownership', 'Bought a Home', '🏠', 'lifestyle', NULL, 'Keys to their own place', 71),
  ('first_trip', 'First Big Trip', '✈️', 'lifestyle', NULL, 'Exploring the world', 72),
  ('milestone_birthday', 'Milestone Birthday', '🎂', 'lifestyle', NULL, 'A birthday worth celebrating', 73),
  ('custom', 'Custom Milestone', '⭐', 'lifestyle', NULL, 'A special moment in their story', 99)
ON CONFLICT (milestone_type) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

-- life_milestones
ALTER TABLE life_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestones"
  ON life_milestones FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create milestones"
  ON life_milestones FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their milestones"
  ON life_milestones FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete their milestones"
  ON life_milestones FOR DELETE
  USING (auth.uid() = created_by);

-- life_timeline_events
ALTER TABLE life_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public timeline events are readable"
  ON life_timeline_events FOR SELECT
  USING (is_private = false OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create timeline events"
  ON life_timeline_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their timeline events"
  ON life_timeline_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete their timeline events"
  ON life_timeline_events FOR DELETE
  USING (auth.uid() = created_by);

-- milestone_templates (public read-only)
ALTER TABLE milestone_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestone templates"
  ON milestone_templates FOR SELECT USING (true);

-- photo_face_tags
ALTER TABLE photo_face_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read face tags"
  ON photo_face_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create face tags"
  ON photo_face_tags FOR INSERT
  WITH CHECK (auth.uid() = tagged_by);

CREATE POLICY "Tag creator can update"
  ON photo_face_tags FOR UPDATE
  USING (auth.uid() = tagged_by);

CREATE POLICY "Tag creator can delete"
  ON photo_face_tags FOR DELETE
  USING (auth.uid() = tagged_by);

-- face_embeddings (admin/system only for writes, restricted reads)
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage face embeddings"
  ON face_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read embeddings for their memorials"
  ON face_embeddings FOR SELECT
  USING (
    memorial_id IN (
      SELECT id FROM memorials WHERE created_by = auth.uid()
    )
    OR profile_id = auth.uid()
  );

-- auto_reminder_rules
ALTER TABLE auto_reminder_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminder rules"
  ON auto_reminder_rules FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_life_milestones_memorial ON life_milestones(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_milestones_type ON life_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_life_milestones_date ON life_milestones(milestone_date);

CREATE INDEX IF NOT EXISTS idx_life_timeline_memorial ON life_timeline_events(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_timeline_sort_date ON life_timeline_events(sort_date DESC);
CREATE INDEX IF NOT EXISTS idx_life_timeline_event_type ON life_timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_life_timeline_source ON life_timeline_events(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_photo_face_tags_photo ON photo_face_tags(photo_url);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_memorial ON photo_face_tags(memorial_id);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_tagged_memorial ON photo_face_tags(tagged_memorial_id);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_tagged_profile ON photo_face_tags(tagged_profile_id);

CREATE INDEX IF NOT EXISTS idx_face_embeddings_memorial ON face_embeddings(memorial_id);
CREATE INDEX IF NOT EXISTS idx_face_embeddings_profile ON face_embeddings(profile_id);

CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_user ON auto_reminder_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_next ON auto_reminder_rules(next_trigger_date) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_memorial ON auto_reminder_rules(memorial_id);

-- === 00030_search_notifications_email.sql ===
-- ============================================================
-- Migration 00030: Full-text Search, Push Triggers & Email Log
-- ============================================================

-- ============================================================
-- 1. FULL-TEXT SEARCH — tsvector columns + indexes
-- ============================================================

-- Memorials search
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION memorials_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.nickname, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.biography, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.place_of_birth, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.place_of_death, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memorials_search ON memorials;
CREATE TRIGGER trg_memorials_search
  BEFORE INSERT OR UPDATE OF first_name, last_name, nickname, biography, place_of_birth, place_of_death
  ON memorials FOR EACH ROW EXECUTE FUNCTION memorials_search_update();

CREATE INDEX IF NOT EXISTS idx_memorials_search ON memorials USING gin(search_vector);

-- Backfill existing memorials
UPDATE memorials SET search_vector =
  setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(nickname, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(biography, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(place_of_birth, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(place_of_death, '')), 'D')
WHERE search_vector IS NULL;

-- Tributes search
ALTER TABLE tributes ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION tributes_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tributes_search ON tributes;
CREATE TRIGGER trg_tributes_search
  BEFORE INSERT OR UPDATE OF content
  ON tributes FOR EACH ROW EXECUTE FUNCTION tributes_search_update();

CREATE INDEX IF NOT EXISTS idx_tributes_search ON tributes USING gin(search_vector);

UPDATE tributes SET search_vector = to_tsvector('english', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Directory listings search
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION directory_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.business_type, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_directory_search ON directory_listings;
CREATE TRIGGER trg_directory_search
  BEFORE INSERT OR UPDATE OF business_name, description, city, business_type
  ON directory_listings FOR EACH ROW EXECUTE FUNCTION directory_search_update();

CREATE INDEX IF NOT EXISTS idx_directory_search ON directory_listings USING gin(search_vector);

UPDATE directory_listings SET search_vector =
  setweight(to_tsvector('english', COALESCE(business_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(business_type, '')), 'C')
WHERE search_vector IS NULL;

-- ============================================================
-- 2. PUSH NOTIFICATION TRIGGERS
-- ============================================================

-- Trigger: New tribute → notify memorial creator
CREATE OR REPLACE FUNCTION notify_tribute_created() RETURNS TRIGGER AS $$
DECLARE
  memorial_creator_id uuid;
  memorial_name text;
  author_name text;
BEGIN
  SELECT created_by, CONCAT(first_name, ' ', last_name)
    INTO memorial_creator_id, memorial_name
    FROM memorials WHERE id = NEW.memorial_id;

  SELECT COALESCE(display_name, username, 'Someone')
    INTO author_name
    FROM profiles WHERE id = NEW.author_id;

  -- Don't notify self
  IF memorial_creator_id IS NOT NULL AND memorial_creator_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      memorial_creator_id,
      'tribute',
      'New Tribute',
      author_name || ' left a tribute on ' || memorial_name,
      jsonb_build_object(
        'type', 'tribute',
        'memorial_id', NEW.memorial_id,
        'tribute_id', NEW.id,
        'author_id', NEW.author_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_tribute ON tributes;
CREATE TRIGGER trg_notify_tribute
  AFTER INSERT ON tributes
  FOR EACH ROW EXECUTE FUNCTION notify_tribute_created();

-- Trigger: Gift received → notify recipient
CREATE OR REPLACE FUNCTION notify_gift_received() RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
  gift_name text;
  gift_emoji text;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone')
    INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  SELECT name, icon INTO gift_name, gift_emoji
    FROM gift_catalog WHERE id = NEW.gift_id;

  IF NEW.recipient_id IS NOT NULL AND NEW.recipient_id != NEW.sender_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.recipient_id,
      'gift',
      COALESCE(gift_emoji, '🌸') || ' Gift Received!',
      sender_name || ' sent you ' || COALESCE(gift_name, 'a gift'),
      jsonb_build_object(
        'type', 'gift',
        'gift_transaction_id', NEW.id,
        'sender_id', NEW.sender_id,
        'gift_name', COALESCE(gift_name, 'gift')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_gift ON gift_transactions;
CREATE TRIGGER trg_notify_gift
  AFTER INSERT ON gift_transactions
  FOR EACH ROW EXECUTE FUNCTION notify_gift_received();

-- Trigger: New follower → notify
CREATE OR REPLACE FUNCTION notify_new_follower() RETURNS TRIGGER AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone')
    INTO follower_name FROM profiles WHERE id = NEW.follower_id;

  IF NEW.following_id != NEW.follower_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.following_id,
      'follow',
      'New Follower',
      follower_name || ' started following you',
      jsonb_build_object(
        'type', 'follow',
        'follower_id', NEW.follower_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_follow ON user_follows;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

-- Trigger: Milestone added → notify memorial followers
CREATE OR REPLACE FUNCTION notify_milestone_added() RETURNS TRIGGER AS $$
DECLARE
  memorial_name text;
  creator_name text;
BEGIN
  SELECT CONCAT(first_name, ' ', last_name) INTO memorial_name
    FROM memorials WHERE id = NEW.memorial_id;

  SELECT COALESCE(display_name, username, 'Someone')
    INTO creator_name FROM profiles WHERE id = NEW.created_by;

  -- Notify memorial creator if different from milestone creator
  DECLARE memorial_owner uuid;
  BEGIN
    SELECT created_by INTO memorial_owner FROM memorials WHERE id = NEW.memorial_id;
    IF memorial_owner IS NOT NULL AND memorial_owner != NEW.created_by THEN
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        memorial_owner,
        'milestone',
        'New Milestone Added',
        creator_name || ' added "' || NEW.title || '" to ' || memorial_name || '''s timeline',
        jsonb_build_object(
          'type', 'memorial',
          'memorial_id', NEW.memorial_id,
          'milestone_id', NEW.id
        )
      );
    END IF;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_milestone ON life_milestones;
CREATE TRIGGER trg_notify_milestone
  AFTER INSERT ON life_milestones
  FOR EACH ROW EXECUTE FUNCTION notify_milestone_added();

-- ============================================================
-- 3. EMAIL LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  email_type text NOT NULL,
  subject text,
  status text DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email log"
  ON email_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);

-- ============================================================
-- 4. SEARCH FUNCTION — Universal search across all content
-- ============================================================
CREATE OR REPLACE FUNCTION search_all(query text, result_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  result_type text,
  title text,
  subtitle text,
  image_url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Memorials
    SELECT
      m.id,
      'memorial'::text as result_type,
      CONCAT(m.first_name, ' ', m.last_name) as title,
      COALESCE(m.place_of_birth, '') as subtitle,
      m.cover_photo_url as image_url,
      ts_rank(m.search_vector, websearch_to_tsquery('english', query)) as rank
    FROM memorials m
    WHERE m.search_vector @@ websearch_to_tsquery('english', query)
      AND m.status = 'active'

    UNION ALL

    -- Directory Listings
    SELECT
      d.id,
      'directory'::text,
      d.business_name,
      CONCAT(d.city, ', ', COALESCE(d.state, '')),
      d.photo_url,
      ts_rank(d.search_vector, websearch_to_tsquery('english', query))
    FROM directory_listings d
    WHERE d.search_vector @@ websearch_to_tsquery('english', query)
      AND d.status = 'active'
  ) results
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- === 00031_celebrity_profiles.sql ===
-- ============================================================
-- Migration 00031: Add lifecycle_stage column + Celebrity Profiles
--
-- This migration:
-- 1. Adds lifecycle_stage column to memorials (if not exists)
-- 2. Adds biography_is_ai_generated column (if not exists)
-- 3. Adds place_of_birth / place_of_death columns (if not exists)
-- 4. Inserts 7 diverse celebrity/demo profiles
--
-- Safe to run multiple times (uses IF NOT EXISTS + ON CONFLICT DO NOTHING)
-- ============================================================

-- Step 1: Add lifecycle_stage column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'lifecycle_stage'
  ) THEN
    ALTER TABLE memorials ADD COLUMN lifecycle_stage text DEFAULT 'remember';
  END IF;
END $$;

-- Step 2: Add biography_is_ai_generated column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'biography_is_ai_generated'
  ) THEN
    ALTER TABLE memorials ADD COLUMN biography_is_ai_generated boolean DEFAULT false;
  END IF;
END $$;

-- Step 3: Add place columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'place_of_birth'
  ) THEN
    ALTER TABLE memorials ADD COLUMN place_of_birth text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'place_of_death'
  ) THEN
    ALTER TABLE memorials ADD COLUMN place_of_death text;
  END IF;
END $$;

-- Step 4: Insert celebrity profiles (skip if they already exist)

-- 1. Chadwick Boseman — Memorial (remember)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth, date_of_death,
  place_of_birth, place_of_death,
  biography, obituary,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'Chadwick', 'Boseman',
  '1976-11-29', '2020-08-28',
  'Anderson, South Carolina', 'Los Angeles, California',
  'Chadwick Aaron Boseman was an American actor and playwright who rose to international fame for his portrayal of T''Challa / Black Panther in the Marvel Cinematic Universe. A graduate of Howard University, Boseman brought dignity and depth to every role, from Jackie Robinson in "42" to James Brown in "Get on Up" to Thurgood Marshall in "Marshall." His quiet four-year battle with colon cancer, during which he continued to work and inspire millions, revealed a strength that transcended the screen.',
  'Chadwick Boseman, beloved actor and cultural icon, passed away on August 28, 2020, at the age of 43 after a courageous battle with colon cancer. He is remembered for his transformative performances, his commitment to representation, and the joy he brought to millions worldwide. Wakanda Forever.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop',
  'remember', 'chadwick-boseman', 'public', 'active',
  1250, 340
) ON CONFLICT (id) DO NOTHING;

-- 2. Kobe Bryant — Memorial (remember)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth, date_of_death,
  place_of_birth, place_of_death,
  biography, obituary,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000002-0000-0000-0000-000000000002',
  'Kobe', 'Bryant',
  '1978-08-23', '2020-01-26',
  'Philadelphia, Pennsylvania', 'Calabasas, California',
  'Kobe Bean Bryant was an American professional basketball player who spent his entire 20-year NBA career with the Los Angeles Lakers. A five-time NBA champion, two-time Finals MVP, and 18-time All-Star, Bryant''s relentless work ethic and competitive fire earned him the nickname "Mamba." After retiring in 2016, he became an Oscar-winning filmmaker, a devoted father, and a mentor to the next generation of athletes.',
  'Kobe Bryant, legendary basketball player and devoted father, was tragically taken from us on January 26, 2020, alongside his daughter Gianna and seven others. His Mamba Mentality, his dedication to family, and his passion for storytelling left an indelible mark on the world.',
  'https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&h=600&fit=crop',
  'remember', 'kobe-bryant', 'public', 'active',
  2100, 890
) ON CONFLICT (id) DO NOTHING;

-- 3. Queen Elizabeth II — Legacy
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth, date_of_death,
  place_of_birth, place_of_death,
  biography, obituary,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000003-0000-0000-0000-000000000003',
  'Queen Elizabeth', 'II',
  '1926-04-21', '2022-09-08',
  'Mayfair, London', 'Balmoral Castle, Scotland',
  'Queen Elizabeth II was the longest-reigning British monarch, serving as Queen of the United Kingdom and other Commonwealth realms from 1952 until her death in 2022. Over her 70-year reign, she witnessed enormous social change, guided the monarchy through periods of both celebration and crisis, and became a symbol of stability and duty.',
  'Her Majesty Queen Elizabeth II passed peacefully at Balmoral Castle on September 8, 2022, at the age of 96. The longest-reigning monarch in British history, she served with unwavering dedication for over seven decades.',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop',
  'legacy', 'queen-elizabeth-ii', 'public', 'active',
  3400, 1200
) ON CONFLICT (id) DO NOTHING;

-- 4. Sarah & James Chen — Wedding (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000004-0000-0000-0000-000000000004',
  'Sarah & James', 'Chen',
  '2024-06-15',
  'Napa Valley, California',
  'Sarah and James first met during a study abroad program in Florence, Italy, where a shared love of art and adventure sparked a connection that would last a lifetime. After five years together exploring the world from Tokyo to Patagonia, James proposed at the same cafe where they first shared a cappuccino. Their wedding celebration in Napa Valley brought together 150 of their closest friends and family.',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=600&fit=crop',
  'celebrate', 'sarah-james-chen-wedding', 'public', 'active',
  89, 45
) ON CONFLICT (id) DO NOTHING;

-- 5. Baby Aria Rodriguez — Birth (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000005-0000-0000-0000-000000000005',
  'Baby Aria', 'Rodriguez',
  '2024-12-03',
  'Austin, Texas',
  'Aria Sofia Rodriguez arrived on December 3, 2024, at 7:42 AM, weighing 7 lbs 3 oz. She has her mother Elena''s brown eyes and her father Miguel''s curious expression. The Rodriguez family is overjoyed to welcome this little miracle into the world. Big brother Lucas, age 4, has already declared himself her official protector.',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=600&fit=crop',
  'celebrate', 'baby-aria-rodriguez', 'public', 'active',
  56, 28
) ON CONFLICT (id) DO NOTHING;

-- 6. Coach David Thompson — Retirement (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000006-0000-0000-0000-000000000006',
  'Coach David', 'Thompson',
  '1959-03-18',
  'Portland, Oregon',
  'After 35 remarkable years coaching high school basketball at Lincoln High, Coach David Thompson is hanging up his whistle. With a career record of 687-234, 12 state championships, and hundreds of student-athletes who went on to play college ball, Coach T''s impact extends far beyond the court. His philosophy of "character first, championships second" shaped generations.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1461896836934-bd45ba04a950?w=1200&h=600&fit=crop',
  'celebrate', 'coach-david-thompson-retirement', 'public', 'active',
  234, 156
) ON CONFLICT (id) DO NOTHING;

-- 7. Grandma Rose Williams — 90th Birthday (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000007-0000-0000-0000-000000000007',
  'Grandma Rose', 'Williams',
  '1935-07-22',
  'Savannah, Georgia',
  'Rose Marie Williams, affectionately known as Grandma Rose, is celebrating 90 incredible years of life. Born in Savannah, Georgia, Rose was a trailblazing elementary school teacher for 40 years, a church choir director, and the undisputed queen of peach cobbler. Mother of five, grandmother of twelve, and great-grandmother of eight.',
  'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=600&fit=crop',
  'celebrate', 'grandma-rose-williams-90th', 'public', 'active',
  178, 92
) ON CONFLICT (id) DO NOTHING;

-- === 00032_proximity_support.sql ===
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

-- === 00033_profiles_role_donation_rpc.sql ===
-- =============================================
-- Migration 00033: Add profiles.role column + atomic donation RPC
-- =============================================

-- ── 1. Add role column to profiles ──
-- Referenced by RLS policies in migrations 00026, 00029, 00030
-- and by admin-directory-import + duplicate-detection edge functions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'moderator'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);

-- ── 2. Atomic donation increment RPC ──
-- Prevents race conditions when multiple donations arrive concurrently.
-- Uses UPDATE ... SET col = col + N (atomic in Postgres) instead of
-- read-modify-write from the client.
CREATE OR REPLACE FUNCTION public.increment_fundraiser_donation(
  p_fundraiser_id uuid,
  p_amount_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Validate input
  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be positive';
  END IF;

  -- Atomic increment — no race condition possible
  UPDATE public.fundraise_campaigns_v2
  SET
    raised_cents = raised_cents + p_amount_cents,
    donor_count  = donor_count + 1,
    updated_at   = now()
  WHERE id = p_fundraiser_id
    AND status = 'active'
  RETURNING to_jsonb(fundraise_campaigns_v2.*) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Campaign not found or not active';
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_fundraiser_donation(uuid, integer) TO authenticated;

-- === 00034_enrich_seed_content.sql ===
-- ============================================================================
-- Migration 00034: Enrich Seed Content
-- Adds milestones, timeline events, and varied-type tributes to the 5 sample
-- memorials created in migration 00013, making profiles feel fully populated.
-- ============================================================================

-- ============================================================================
-- 1. LIFE MILESTONES — across all 5 memorials
-- ============================================================================

INSERT INTO life_milestones (id, memorial_id, created_by, milestone_type, title, description, milestone_date, age_at_milestone, location, emoji, sort_order) VALUES

-- Eleanor Thompson milestones
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born in Burlington, Vermont', 'Eleanor Grace was born on a snowy March morning to loving parents.', '1938-03-15', 0, 'Burlington, VT', '👶', 1),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'graduation_college', 'Graduated from UVM', 'Earned her teaching degree from the University of Vermont with honors.', '1960-06-15', 22, 'Burlington, VT', '🎓', 2),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'wedding', 'Married Robert Thompson', 'A beautiful summer wedding at the Burlington Community Church.', '1961-08-12', 23, 'Burlington, VT', '💒', 3),
('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'first_child', 'First Child Born', 'Welcomed their first son, Robert Jr., into the world.', '1963-04-10', 25, 'Burlington, VT', '👨‍👩‍👧', 4),
('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'retirement', 'Retired After 40 Years of Teaching', 'Retired from Maple Street Elementary after four decades of inspiring young minds.', '2000-06-01', 62, 'Burlington, VT', '🏖️', 5),

-- Marcus Rivera milestones
('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born on the Fourth of July', 'Marcus came into the world on Independence Day — fitting for a future hero.', '1985-07-04', 0, 'San Antonio, TX', '👶', 1),
('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'graduation_high_school', 'Graduated Alamo Heights High', 'Class president and varsity soccer captain.', '2003-06-01', 17, 'San Antonio, TX', '🎓', 2),
('60000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'first_job', 'Joined Fire Station 7', 'Became a firefighter at Station 7, fulfilling a childhood dream.', '2012-03-01', 26, 'Downtown', '💼', 3),
('60000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'wedding', 'Married Maria Gonzalez', 'A joyful celebration with the entire fire station in attendance.', '2014-10-18', 29, 'San Antonio, TX', '💒', 4),
('60000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'promotion', 'Promoted to Captain', 'Youngest captain in Station 7 history at age 35.', '2020-01-15', 34, 'Station 7', '📈', 5),

-- Dr. Amara Okafor milestones
('60000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born in Lagos, Nigeria', 'Amara was born into a family that valued education above all else.', '1950-12-01', 0, 'Lagos, Nigeria', '👶', 1),
('60000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'graduation_college', 'Medical School Graduation', 'Graduated top of her class from Howard University College of Medicine.', '1978-05-20', 27, 'Washington, D.C.', '🎓', 2),
('60000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'achievement', 'Opened the Community Free Clinic', 'Founded a free clinic serving 10,000+ patients in its first decade.', '1990-03-15', 39, 'City General', '🏆', 3),
('60000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'award', 'Physician of the Year Award', 'Recognized for outstanding service and community impact.', '2005-11-10', 54, 'City General Hospital', '🏅', 4),

-- Jimmy Chen milestones
('60000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born in Millbrook', 'James "Jimmy" Chen arrived with his parents'' love of music already in his DNA.', '2005-09-20', 0, 'Millbrook', '👶', 1),
('60000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'achievement', 'First Guitar Performance', 'Played his first public performance at the school talent show at age 10.', '2015-12-05', 10, 'Millbrook Elementary', '🏆', 2),
('60000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'achievement', 'YouTube Milestone — 10K Views', 'His acoustic cover of a classic ballad went viral in the local community.', '2022-03-15', 16, 'Home Studio', '🏆', 3),

-- Rose Williams milestones
('60000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born During the Great Depression', 'Rose Marie was born into tough times that forged an even tougher spirit.', '1932-05-08', 0, 'Brooklyn, NY', '👶', 1),
('60000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'wedding', 'Married Harold Williams', 'Harold returned from Europe and married Rose in a simple, beautiful ceremony.', '1946-06-22', 14, 'Brooklyn, NY', '💒', 2),
('60000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'homeownership', 'Bought Their First Home', 'Rose and Harold saved for years to buy their first home on Oak Street.', '1952-09-01', 20, 'Oak Street', '🏠', 3),
('60000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'milestone_birthday', '90th Birthday Celebration', 'The whole family gathered — all five children, twelve grandkids, and eight great-grands.', '2022-05-08', 90, 'Family Home', '🎂', 4)

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 2. LIFE TIMELINE EVENTS — varied event types
-- ============================================================================

INSERT INTO life_timeline_events (id, memorial_id, created_by, event_type, source_type, title, description, event_date, location, icon, color, is_highlight) VALUES

-- Eleanor timeline
('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'career', 'manual', 'Started Teaching at Maple Street Elementary', 'Eleanor began what would become a 40-year career shaping young minds.', '1960-09-01', 'Burlington, VT', 'school', '#4A2D7A', true),
('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Founded the Neighborhood Garden Club', 'Eleanor started a garden club that brought neighbors together for 25+ years.', '1975-04-15', 'Burlington, VT', 'leaf', '#22c55e', false),
('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'hobby', 'manual', 'Won the County Cookie Bake-Off', 'Her chocolate chip cookies were famous, and she finally entered the competition.', '1985-10-20', 'Chittenden County Fair', 'restaurant', '#f59e0b', false),

-- Marcus timeline
('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'achievement', 'manual', 'Commendation for Bravery', 'Received a commendation for rescuing a family from a collapsed building.', '2018-07-22', 'City Hall', 'medal', '#d97706', true),
('70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Started Youth Soccer Program', 'Marcus launched a free soccer program for underprivileged kids in his district.', '2019-03-01', 'Community Park', 'football', '#22c55e', false),
('70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'relationship', 'manual', 'Welcomed Daughter Sofia', 'Marcus became a dad for the first time — and couldn''t stop smiling for weeks.', '2016-05-12', 'General Hospital', 'heart', '#ef4444', true),

-- Dr. Okafor timeline
('70000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'travel', 'manual', 'Immigrated to the United States', 'Left Lagos with $200 and a dream of becoming a doctor.', '1972-08-15', 'New York, NY', 'airplane', '#3b82f6', true),
('70000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Organized First Community Health Fair', 'Amara brought free health screenings to 500+ community members.', '1995-09-10', 'Community Center', 'medkit', '#22c55e', false),
('70000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'education', 'manual', 'Secretly Funded 3 Students Through College', 'Quietly paid tuition for three young women pursuing science careers.', '2000-06-01', NULL, 'school', '#7C3AED', true),

-- Jimmy timeline
('70000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'hobby', 'manual', 'First Coffee Shop Acoustic Set', 'Jimmy started playing Friday night sets at the local coffee shop at age 14.', '2019-11-08', 'Bean & Brew Coffee', 'musical-notes', '#f59e0b', true),
('70000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'education', 'manual', 'Made Honor Roll Every Semester', 'Straight-A student while juggling music commitments and volunteering.', '2022-06-15', 'Millbrook High School', 'school', '#4A2D7A', false),
('70000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Stood Up Against Bullying', 'Jimmy organized a kindness campaign at school that changed the culture.', '2021-02-01', 'Millbrook High School', 'shield', '#22c55e', false),

-- Rose timeline
('70000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'career', 'manual', 'Factory Worker During WWII', 'At just 12, Rose worked in a munitions factory to support the war effort.', '1944-06-01', 'Brooklyn, NY', 'hammer', '#6b7280', true),
('70000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'hobby', 'manual', 'Knitted Blankets for Every Family Baby', 'Over 40 handmade blankets — one for every child born into the Williams family.', '1950-01-01', 'Family Home', 'heart', '#ec4899', false),
('70000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'relationship', 'manual', 'Celebrated 50th Wedding Anniversary', 'Rose and Harold threw a legendary party for their golden anniversary.', '1996-06-22', 'Family Home', 'heart-circle', '#ef4444', true)

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 3. ADDITIONAL TRIBUTES — varied types (poem, quote, memory)
-- ============================================================================

INSERT INTO tributes (id, memorial_id, author_id, type, content, ribbon_type, ribbon_count, like_count, comment_count, created_at) VALUES

-- Eleanor — poems and memories
('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'poem',
 'In a garden where the roses grow,
Where autumn leaves dance soft and slow,
There lives a warmth no cold can chill —
The love of one who taught us still.
Her cookies cooled on windowsills,
Her laughter echoed over hills,
And though she''s gone beyond our sight,
She planted seeds of endless light.',
 'gold', 3, 11, 3, NOW() - INTERVAL '28 days'),

('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'memory',
 'I remember the day Eleanor helped me plant my first tomato garden. She was so patient, showing me how deep to dig, how much water to use. She said, "Gardens teach you that beautiful things take time." I think about that every spring when I plant my tomatoes.',
 'silver', 1, 5, 1, NOW() - INTERVAL '22 days'),

-- Marcus — quote and memory
('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'quote',
 '"Courage is not the absence of fear, but the judgment that something else is more important than fear." — This was pinned to Marcus''s locker at Station 7. He lived by these words every single day.',
 'gold', 3, 18, 4, NOW() - INTERVAL '12 days'),

('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'memory',
 'Marcus brought Diego to the station every Saturday morning. He''d put the little guy in an oversized helmet and let him sit in the truck. Diego would wave at everyone like he was in a parade. Marcus''s face lit up every time. That''s the Marcus I want to remember — the dad who made his son feel like a superhero.',
 'purple', 2, 14, 3, NOW() - INTERVAL '9 days'),

-- Dr. Okafor — poem and quote
('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'poem',
 'She crossed an ocean with a dream,
With hands that healed and eyes that gleamed.
For every life she chose to mend,
She wasn''t just a doctor — friend.
The clinic stands, her legacy bright,
A beacon born from borrowed light.
Two hundred dollars, boundless soul —
She made the broken somehow whole.',
 'eternal', 5, 22, 6, NOW() - INTERVAL '52 days'),

('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'quote',
 '"When you heal one person, you heal a family. When you heal a family, you heal a community." — Dr. Amara Okafor. These words guided her entire career and continue to inspire everyone at the clinic.',
 'gold', 3, 15, 3, NOW() - INTERVAL '48 days'),

-- Jimmy — poem and memory
('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'poem',
 'The strings are quiet now, but still
His melodies hang in the air,
On Friday nights the coffee spills
Into an empty corner chair.
He played for those who needed grace,
A seventeen-year-old with an old soul''s song,
And though we''ll never see his face,
His music carries us along.',
 'crystal', 4, 26, 7, NOW() - INTERVAL '82 days'),

('20000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', 'memory',
 'Jimmy learned to play "Happy Birthday" on piano when he was 4 so he could surprise me. He got one note wrong every time but refused to let me help. He said, "It has to come from ME, Mom." That stubborn sweetness was Jimmy in a nutshell. Now Lily plays it for me on his birthday, with the same wrong note. On purpose.',
 'eternal', 5, 35, 9, NOW() - INTERVAL '78 days'),

-- Rose — quote and memory
('20000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 'quote',
 '"Life doesn''t get easier — you just get tougher." — Rose Williams. She said this to every grandchild on their 18th birthday, right before handing them a card with $50 and the recipe for her mashed potatoes.',
 'gold', 3, 12, 3, NOW() - INTERVAL '4 days'),

('20000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013', 'memory',
 'I was 8 when Grandma Rose taught me her secret lemonade recipe. She made me promise never to tell anyone. Twenty-seven years later, I still haven''t. But I make it every Fourth of July, and when my kids ask why it tastes different from store-bought, I just say, "It has a secret ingredient: love." That''s what Rose would have said.',
 'purple', 2, 10, 2, NOW() - INTERVAL '1 day'),

('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'poem',
 'She fed us all from a kitchen small,
With recipes no book contained,
Her Sunday table, wide and tall,
Where love was served and joy remained.
Through wars and loss she stood unbowed,
Through ninety winters, warm and proud,
And knitted into every seam
The fabric of a family''s dream.',
 'gold', 3, 14, 4, NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;

-- === 00035_universal_hosts.sql ===
-- ============================================================
-- Migration 00035: Universal Host System, Welcome Journey & Quests
-- ============================================================
-- Extends the host/co-host/contributor concept to ALL page types
-- (not just memorials), adds 7-day welcome journey for new users,
-- and introduces achievement quests for gamification.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. UNIVERSAL PAGE HOSTS
-- ────────────────────────────────────────────────────────────
-- Polymorphic table: page_type + page_id targets any content type.
-- Replaces memorial_hosts for new pages; legacy memorial_hosts
-- data is migrated below.

CREATE TABLE IF NOT EXISTS page_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL CHECK (page_type IN (
    'memorial', 'living_tribute', 'event', 'family_tree',
    'virtual_space', 'wedding', 'pet_page'
  )),
  page_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN (
    'owner', 'co_host', 'contributor', 'moderator'
  )),
  relationship text CHECK (relationship IN (
    'immediate_family', 'extended_family', 'friend', 'colleague',
    'fan', 'spouse', 'partner', 'pet_owner', 'caretaker',
    'wedding_party', 'organizer', 'other'
  )),
  relationship_detail text,
  permissions jsonb DEFAULT '{
    "can_edit_details": false,
    "can_add_media": true,
    "can_invite_others": false,
    "can_delete_content": false,
    "can_manage_hosts": false,
    "can_moderate": false
  }'::jsonb,
  invited_by uuid REFERENCES profiles(id),
  invite_status text DEFAULT 'accepted' CHECK (invite_status IN (
    'pending', 'accepted', 'declined'
  )),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_type, page_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_page_hosts_page ON page_hosts(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_hosts_user ON page_hosts(user_id);
CREATE INDEX IF NOT EXISTS idx_page_hosts_invite ON page_hosts(invite_status) WHERE invite_status = 'pending';

-- Default permissions by role (applied via trigger on insert)
CREATE OR REPLACE FUNCTION set_page_host_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'owner' THEN
    NEW.permissions = '{
      "can_edit_details": true,
      "can_add_media": true,
      "can_invite_others": true,
      "can_delete_content": true,
      "can_manage_hosts": true,
      "can_moderate": true
    }'::jsonb;
  ELSIF NEW.role = 'co_host' THEN
    NEW.permissions = '{
      "can_edit_details": true,
      "can_add_media": true,
      "can_invite_others": true,
      "can_delete_content": false,
      "can_manage_hosts": false,
      "can_moderate": true
    }'::jsonb;
  ELSIF NEW.role = 'moderator' THEN
    NEW.permissions = '{
      "can_edit_details": false,
      "can_add_media": false,
      "can_invite_others": false,
      "can_delete_content": true,
      "can_manage_hosts": false,
      "can_moderate": true
    }'::jsonb;
  ELSE  -- contributor
    NEW.permissions = '{
      "can_edit_details": false,
      "can_add_media": true,
      "can_invite_others": false,
      "can_delete_content": false,
      "can_manage_hosts": false,
      "can_moderate": false
    }'::jsonb;
  END IF;

  IF NEW.invite_status = 'accepted' AND NEW.accepted_at IS NULL THEN
    NEW.accepted_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_page_host_permissions
  BEFORE INSERT ON page_hosts
  FOR EACH ROW
  EXECUTE FUNCTION set_page_host_permissions();

-- RLS policies
ALTER TABLE page_hosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_hosts_select" ON page_hosts
  FOR SELECT USING (true);

CREATE POLICY "page_hosts_insert" ON page_hosts
  FOR INSERT WITH CHECK (
    -- Owner/co_host of the same page can invite, OR self-insert as owner on creation
    user_id = auth.uid()
    OR (
      invited_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM page_hosts ph
        WHERE ph.page_type = page_hosts.page_type
          AND ph.page_id = page_hosts.page_id
          AND ph.user_id = auth.uid()
          AND ph.role IN ('owner', 'co_host')
          AND ph.invite_status = 'accepted'
      )
    )
  );

CREATE POLICY "page_hosts_update" ON page_hosts
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_hosts.page_type
        AND ph.page_id = page_hosts.page_id
        AND ph.user_id = auth.uid()
        AND ph.role = 'owner'
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "page_hosts_delete" ON page_hosts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_hosts.page_type
        AND ph.page_id = page_hosts.page_id
        AND ph.user_id = auth.uid()
        AND ph.role = 'owner'
        AND ph.invite_status = 'accepted'
    )
    AND role != 'owner'
  );

-- ── Migrate existing memorial_hosts → page_hosts ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, relationship_detail, invited_by, invite_status, accepted_at, created_at)
SELECT
  'memorial',
  mh.memorial_id,
  mh.user_id,
  CASE
    WHEN mh.role = 'co_host' THEN 'co_host'
    WHEN mh.role = 'owner' THEN 'owner'
    ELSE 'contributor'
  END,
  mh.relationship,
  mh.relationship_detail,
  mh.invited_by,
  CASE WHEN mh.accepted_at IS NOT NULL THEN 'accepted' ELSE 'pending' END,
  mh.accepted_at,
  mh.created_at
FROM memorial_hosts mh
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

-- ── Auto-insert owners for existing living_tributes ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
SELECT 'living_tribute', lt.id, lt.created_by, 'owner', 'other', 'accepted'
FROM living_tributes lt
WHERE lt.created_by IS NOT NULL
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

-- ── Auto-insert owners for existing events ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
SELECT 'event', e.id, e.created_by, 'owner', 'organizer', 'accepted'
FROM events e
WHERE e.created_by IS NOT NULL
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

-- ── Auto-insert owners for existing family_trees ──
INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
SELECT 'family_tree', ft.id, ft.created_by, 'owner', 'immediate_family', 'accepted'
FROM family_trees ft
WHERE ft.created_by IS NOT NULL
ON CONFLICT (page_type, page_id, user_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. PAGE INVITATIONS (unified invite system)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL,
  page_id uuid NOT NULL,
  invited_by uuid NOT NULL REFERENCES profiles(id),
  invited_email text,
  invited_user_id uuid REFERENCES profiles(id),
  proposed_role text NOT NULL DEFAULT 'contributor' CHECK (proposed_role IN (
    'co_host', 'contributor', 'moderator'
  )),
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_invitations_page ON page_invitations(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_invitations_user ON page_invitations(invited_user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_page_invitations_email ON page_invitations(invited_email) WHERE status = 'pending';

ALTER TABLE page_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_invitations_select" ON page_invitations
  FOR SELECT USING (
    invited_user_id = auth.uid()
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_invitations.page_type
        AND ph.page_id = page_invitations.page_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
    )
  );

CREATE POLICY "page_invitations_insert" ON page_invitations
  FOR INSERT WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = page_invitations.page_type
        AND ph.page_id = page_invitations.page_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "page_invitations_update" ON page_invitations
  FOR UPDATE USING (
    invited_user_id = auth.uid()
    OR invited_by = auth.uid()
  );


-- ────────────────────────────────────────────────────────────
-- 3. WELCOME JOURNEY (7-day new user onboarding)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS welcome_journey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  task_key text NOT NULL,
  task_title text NOT NULL,
  task_description text,
  points_reward integer NOT NULL DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  is_claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_welcome_journey_user ON welcome_journey(user_id);

ALTER TABLE welcome_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "welcome_journey_select" ON welcome_journey
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "welcome_journey_update" ON welcome_journey
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger: create welcome journey for every new user
CREATE OR REPLACE FUNCTION create_welcome_journey()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO welcome_journey (user_id, day_number, task_key, task_title, task_description, points_reward) VALUES
    (NEW.id, 1, 'complete_profile',  'Complete Your Profile',     'Add a photo and bio to your profile',                           25),
    (NEW.id, 2, 'explore_page',      'Explore & Follow a Page',   'Visit any memorial, tribute, or celebration and follow it',     15),
    (NEW.id, 3, 'daily_prompt',      'Answer a Daily Prompt',     'Share a memory or reflection to today''s prompt',               15),
    (NEW.id, 4, 'send_gift',         'Send Your First Gift',      'Send a free flower or candle to any page',                      20),
    (NEW.id, 5, 'create_page',       'Create Your First Page',    'Start a memorial, tribute, pet page, or wedding page',          50),
    (NEW.id, 6, 'invite_friend',     'Invite a Friend',           'Share Foreverr with someone you care about',                    25),
    (NEW.id, 7, 'week_complete',     'Week One Complete!',         'Return for 7 days and claim your bonus',                        100);

  -- Award Day 1 signup bonus (25 points)
  INSERT INTO legacy_points (user_id, points, action_type, description)
  VALUES (NEW.id, 25, 'daily_login', 'Welcome to Foreverr! Signup bonus')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only fire if welcome_journey doesn't already exist for this user
CREATE OR REPLACE FUNCTION maybe_create_welcome_journey()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM welcome_journey WHERE user_id = NEW.id LIMIT 1) THEN
    PERFORM create_welcome_journey();
    -- Manually insert since we can't call trigger functions directly
    INSERT INTO welcome_journey (user_id, day_number, task_key, task_title, task_description, points_reward) VALUES
      (NEW.id, 1, 'complete_profile',  'Complete Your Profile',     'Add a photo and bio to your profile',                           25),
      (NEW.id, 2, 'explore_page',      'Explore & Follow a Page',   'Visit any memorial, tribute, or celebration and follow it',     15),
      (NEW.id, 3, 'daily_prompt',      'Answer a Daily Prompt',     'Share a memory or reflection to today''s prompt',               15),
      (NEW.id, 4, 'send_gift',         'Send Your First Gift',      'Send a free flower or candle to any page',                      20),
      (NEW.id, 5, 'create_page',       'Create Your First Page',    'Start a memorial, tribute, pet page, or wedding page',          50),
      (NEW.id, 6, 'invite_friend',     'Invite a Friend',           'Share Foreverr with someone you care about',                    25),
      (NEW.id, 7, 'week_complete',     'Week One Complete!',         'Return for 7 days and claim your bonus',                        100)
    ON CONFLICT (user_id, day_number) DO NOTHING;

    -- Award signup bonus
    INSERT INTO legacy_points (user_id, points, action_type, description)
    VALUES (NEW.id, 25, 'daily_login', 'Welcome to Foreverr! Signup bonus')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_welcome_journey ON profiles;
CREATE TRIGGER trg_create_welcome_journey
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION maybe_create_welcome_journey();


-- ────────────────────────────────────────────────────────────
-- 4. ACHIEVEMENT QUESTS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievement_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'trophy',
  emoji text DEFAULT '🏆',
  category text CHECK (category IN ('newcomer', 'social', 'creator', 'collector', 'community')),
  action_type text NOT NULL,     -- e.g., 'create_tribute', 'send_gift', 'follow_user'
  required_count integer NOT NULL DEFAULT 1,
  reward_points integer NOT NULL DEFAULT 50,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES achievement_quests(id) ON DELETE CASCADE,
  current_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON user_quest_progress(user_id);

ALTER TABLE achievement_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievement_quests_select" ON achievement_quests
  FOR SELECT USING (true);

CREATE POLICY "user_quest_progress_select" ON user_quest_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_quest_progress_upsert" ON user_quest_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_quest_progress_update" ON user_quest_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Seed starter quests
INSERT INTO achievement_quests (name, description, icon, emoji, category, action_type, required_count, reward_points, sort_order) VALUES
  ('First Tribute',      'Write your first tribute to someone special',        'create',      '✍️', 'newcomer',  'create_tribute',     1,   50,  1),
  ('Gift Giver',         'Send 3 gifts to show your love',                      'gift',        '🎁', 'social',    'send_gift',          3,   40,  2),
  ('Memory Keeper',      'Upload 10 photos to preserve memories',               'camera',      '📸', 'collector', 'upload_photo',       10,  60,  3),
  ('Social Butterfly',   'Follow 5 users or pages',                             'people',      '🦋', 'social',    'follow',             5,   30,  4),
  ('Family Historian',   'Add 5 members to a family tree',                      'git-branch',  '🌳', 'creator',   'add_family_member',  5,   75,  5),
  ('Streak Champion',    'Maintain a 7-day engagement streak',                  'flame',       '🔥', 'community', 'streak_day',         7,  100,  6),
  ('Storyteller',        'Write 5 tributes sharing memories',                   'book',        '📖', 'creator',   'create_tribute',     5,   80,  7),
  ('Generous Heart',     'Send 10 gifts total',                                 'heart',       '💝', 'social',    'send_gift',          10, 100,  8),
  ('Community Builder',  'Invite 3 friends to join Foreverr',                   'person-add',  '🤝', 'community', 'invite_friend',      3,   75,  9),
  ('Daily Devotion',     'Answer 10 daily prompts',                             'chatbox',     '💭', 'community', 'answer_prompt',      10,  80, 10)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 5. DAILY SPOTLIGHT (random kindness)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_spotlight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spotlight_date date NOT NULL UNIQUE,
  reason text DEFAULT 'random_kindness',
  bonus_points integer DEFAULT 50,
  has_paid_forward boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_spotlight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_spotlight_select" ON daily_spotlight
  FOR SELECT USING (true);

CREATE POLICY "daily_spotlight_update" ON daily_spotlight
  FOR UPDATE USING (user_id = auth.uid());

-- === 00036_wedding_pet_pages.sql ===
-- ============================================================
-- Migration 00036: Wedding Pages & Pet Pages
-- Celebration pages for weddings and beloved pets.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. WEDDING PAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_pages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner1_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  partner2_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  partner1_name    text NOT NULL,
  partner2_name    text NOT NULL,
  wedding_date     date,
  venue_name       text,
  venue_address    text,
  venue_url        text,
  cover_photo_url  text,
  profile_photo_url text,
  story            text,  -- "How we met"
  hashtag          text,
  color_scheme     jsonb DEFAULT '{"primary": "#F59E0B", "secondary": "#FEF3C7"}'::jsonb,
  privacy          text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited')),
  status           text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  slug             text UNIQUE,
  rsvp_enabled     boolean DEFAULT true,
  registry_url     text,
  livestream_url   text,
  follower_count   integer DEFAULT 0,
  message_count    integer DEFAULT 0,
  photo_count      integer DEFAULT 0,
  lifecycle_stage  text DEFAULT 'celebrate',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Auto-generate slug from partner names + year (e.g. 'sarah-and-james-2026')
CREATE OR REPLACE FUNCTION generate_wedding_page_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
  yr text;
BEGIN
  yr := COALESCE(EXTRACT(YEAR FROM NEW.wedding_date)::text, EXTRACT(YEAR FROM now())::text);
  base_slug := lower(regexp_replace(NEW.partner1_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 20) || '-and-';
  base_slug := base_slug || lower(regexp_replace(NEW.partner2_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 45) || '-' || yr;
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM wedding_pages WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wedding_page_slug
  BEFORE INSERT ON wedding_pages
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_wedding_page_slug();


-- ────────────────────────────────────────────────────────────
-- 1b. WEDDING RSVPs
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_rsvps (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id           uuid NOT NULL REFERENCES wedding_pages(id) ON DELETE CASCADE,
  user_id              uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name           text NOT NULL,
  guest_email          text,
  party_size           integer DEFAULT 1 CHECK (party_size >= 1),
  dietary_restrictions text,
  status               text DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not_attending', 'maybe')),
  message              text,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 1c. WEDDING PARTY
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_party (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES wedding_pages(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name       text NOT NULL,
  role       text NOT NULL CHECK (role IN (
    'maid_of_honor', 'best_man', 'bridesmaid', 'groomsman',
    'flower_girl', 'ring_bearer', 'officiant', 'other'
  )),
  photo_url  text,
  bio        text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 1d. WEDDING MESSAGES (guest book / wall)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id     uuid NOT NULL REFERENCES wedding_pages(id) ON DELETE CASCADE,
  author_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name    text,
  content        text NOT NULL,
  media_url      text,
  media_type     text CHECK (media_type IN ('photo', 'video', 'voice')),
  is_anonymous   boolean DEFAULT false,
  reaction_count integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2. PET PAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_pages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_name            text NOT NULL,
  species             text NOT NULL CHECK (species IN (
    'dog', 'cat', 'bird', 'fish', 'horse', 'rabbit',
    'hamster', 'reptile', 'other'
  )),
  breed               text,
  date_of_birth       date,
  date_of_passing     date,
  adoption_date       date,
  profile_photo_url   text,
  cover_photo_url     text,
  bio                 text,
  personality_traits  text[],
  favorite_things     text[],
  privacy             text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited')),
  status              text DEFAULT 'active' CHECK (status IN ('active', 'memorial', 'archived')),
  slug                text UNIQUE,
  follower_count      integer DEFAULT 0,
  tribute_count       integer DEFAULT 0,
  photo_count         integer DEFAULT 0,
  lifecycle_stage     text DEFAULT 'celebrate',
  last_interaction_at timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Auto-generate slug from pet name
CREATE OR REPLACE FUNCTION generate_pet_page_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.pet_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM pet_pages WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pet_page_slug
  BEFORE INSERT ON pet_pages
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_pet_page_slug();


-- ────────────────────────────────────────────────────────────
-- 2b. PET MILESTONES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_milestones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         uuid NOT NULL REFERENCES pet_pages(id) ON DELETE CASCADE,
  title          text NOT NULL,
  description    text,
  milestone_date date,
  photo_url      text,
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'birthday', 'adoption_day', 'training', 'health',
    'travel', 'achievement', 'funny_moment', 'other'
  )),
  created_at     timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2c. PET TRIBUTES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_tributes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         uuid NOT NULL REFERENCES pet_pages(id) ON DELETE CASCADE,
  author_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        text,
  media_url      text,
  media_type     text CHECK (media_type IN ('photo', 'video', 'voice')),
  reaction_count integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ────────────────────────────────────────────────────────────

-- Wedding pages
CREATE INDEX idx_wedding_pages_partner1 ON wedding_pages(partner1_user_id);
CREATE INDEX idx_wedding_pages_partner2 ON wedding_pages(partner2_user_id);
CREATE INDEX idx_wedding_pages_slug ON wedding_pages(slug);
CREATE INDEX idx_wedding_pages_status ON wedding_pages(status);
CREATE INDEX idx_wedding_pages_date ON wedding_pages(wedding_date);

-- Wedding RSVPs
CREATE INDEX idx_wedding_rsvps_wedding ON wedding_rsvps(wedding_id);
CREATE INDEX idx_wedding_rsvps_user ON wedding_rsvps(user_id);
CREATE INDEX idx_wedding_rsvps_status ON wedding_rsvps(status);

-- Wedding party
CREATE INDEX idx_wedding_party_wedding ON wedding_party(wedding_id);
CREATE INDEX idx_wedding_party_user ON wedding_party(user_id);

-- Wedding messages
CREATE INDEX idx_wedding_messages_wedding ON wedding_messages(wedding_id);
CREATE INDEX idx_wedding_messages_author ON wedding_messages(author_id);

-- Pet pages
CREATE INDEX idx_pet_pages_created_by ON pet_pages(created_by);
CREATE INDEX idx_pet_pages_slug ON pet_pages(slug);
CREATE INDEX idx_pet_pages_species ON pet_pages(species);
CREATE INDEX idx_pet_pages_status ON pet_pages(status);

-- Pet milestones
CREATE INDEX idx_pet_milestones_pet ON pet_milestones(pet_id);
CREATE INDEX idx_pet_milestones_type ON pet_milestones(milestone_type);

-- Pet tributes
CREATE INDEX idx_pet_tributes_pet ON pet_tributes(pet_id);
CREATE INDEX idx_pet_tributes_author ON pet_tributes(author_id);


-- ────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE wedding_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_party ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_tributes ENABLE ROW LEVEL SECURITY;

-- ── Wedding Pages ──

CREATE POLICY "wedding_pages_select" ON wedding_pages
  FOR SELECT USING (
    privacy = 'public'
    OR partner1_user_id = auth.uid()
    OR partner2_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_pages.id
        AND ph.user_id = auth.uid()
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_pages_insert" ON wedding_pages
  FOR INSERT WITH CHECK (
    auth.uid() = partner1_user_id OR auth.uid() = partner2_user_id
  );

CREATE POLICY "wedding_pages_update" ON wedding_pages
  FOR UPDATE USING (
    partner1_user_id = auth.uid()
    OR partner2_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_pages.id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_pages_delete" ON wedding_pages
  FOR DELETE USING (
    partner1_user_id = auth.uid()
    OR partner2_user_id = auth.uid()
  );

-- ── Wedding RSVPs ──

CREATE POLICY "wedding_rsvps_select" ON wedding_rsvps
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_rsvps.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_rsvps.wedding_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_rsvps_insert" ON wedding_rsvps
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "wedding_rsvps_update" ON wedding_rsvps
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_rsvps.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

-- ── Wedding Party ──

CREATE POLICY "wedding_party_select" ON wedding_party
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.privacy = 'public' OR wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

CREATE POLICY "wedding_party_insert" ON wedding_party
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_party.wedding_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_party_update" ON wedding_party
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_party.wedding_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_party_delete" ON wedding_party
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

-- ── Wedding Messages ──

CREATE POLICY "wedding_messages_select" ON wedding_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_messages.wedding_id
      AND (wp.privacy = 'public' OR wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

CREATE POLICY "wedding_messages_insert" ON wedding_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "wedding_messages_update" ON wedding_messages
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "wedding_messages_delete" ON wedding_messages
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_messages.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

-- ── Pet Pages ──

CREATE POLICY "pet_pages_select" ON pet_pages
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_pages.id
        AND ph.user_id = auth.uid()
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_pages_insert" ON pet_pages
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "pet_pages_update" ON pet_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_pages.id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_pages_delete" ON pet_pages
  FOR DELETE USING (created_by = auth.uid());

-- ── Pet Milestones ──

CREATE POLICY "pet_milestones_select" ON pet_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND (pp.privacy = 'public' OR pp.created_by = auth.uid())
    )
  );

CREATE POLICY "pet_milestones_insert" ON pet_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND pp.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_milestones.pet_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_milestones_update" ON pet_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND pp.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_milestones.pet_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_milestones_delete" ON pet_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND pp.created_by = auth.uid()
    )
  );

-- ── Pet Tributes ──

CREATE POLICY "pet_tributes_select" ON pet_tributes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_tributes.pet_id
      AND (pp.privacy = 'public' OR pp.created_by = auth.uid())
    )
  );

CREATE POLICY "pet_tributes_insert" ON pet_tributes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "pet_tributes_update" ON pet_tributes
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "pet_tributes_delete" ON pet_tributes
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_tributes.pet_id
      AND pp.created_by = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 5. AUTO-CREATE page_hosts OWNER ON INSERT
-- ────────────────────────────────────────────────────────────

-- Wedding pages: both partners become owners
CREATE OR REPLACE FUNCTION auto_create_wedding_page_hosts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner1_user_id IS NOT NULL THEN
    INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
    VALUES ('wedding', NEW.id, NEW.partner1_user_id, 'owner', 'spouse', 'accepted')
    ON CONFLICT (page_type, page_id, user_id) DO NOTHING;
  END IF;

  IF NEW.partner2_user_id IS NOT NULL THEN
    INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
    VALUES ('wedding', NEW.id, NEW.partner2_user_id, 'owner', 'spouse', 'accepted')
    ON CONFLICT (page_type, page_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_wedding_page_hosts
  AFTER INSERT ON wedding_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_wedding_page_hosts();

-- Pet pages: creator becomes owner
CREATE OR REPLACE FUNCTION auto_create_pet_page_hosts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
  VALUES ('pet_page', NEW.id, NEW.created_by, 'owner', 'pet_owner', 'accepted')
  ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_pet_page_hosts
  AFTER INSERT ON pet_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_pet_page_hosts();


-- ────────────────────────────────────────────────────────────
-- 6. COUNT-UPDATE TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-update wedding_pages.message_count
CREATE OR REPLACE FUNCTION update_wedding_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wedding_pages
    SET message_count = message_count + 1, updated_at = now()
    WHERE id = NEW.wedding_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wedding_pages
    SET message_count = GREATEST(message_count - 1, 0), updated_at = now()
    WHERE id = OLD.wedding_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wedding_message_count
  AFTER INSERT OR DELETE ON wedding_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_wedding_message_count();

-- Auto-update pet_pages.tribute_count
CREATE OR REPLACE FUNCTION update_pet_tribute_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pet_pages
    SET tribute_count = tribute_count + 1, updated_at = now()
    WHERE id = NEW.pet_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pet_pages
    SET tribute_count = GREATEST(tribute_count - 1, 0), updated_at = now()
    WHERE id = OLD.pet_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pet_tribute_count
  AFTER INSERT OR DELETE ON pet_tributes
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_tribute_count();

-- === 00037_reactions_multi_type.sql ===
-- Migration 00037: Allow users to have multiple reaction types per target
-- Previously: unique(user_id, target_type, target_id) → one reaction per user per target
-- Now: unique(user_id, target_type, target_id, reaction_type) → one of each type per user

-- 1. Drop the old unique constraint (one reaction per user per target)
ALTER TABLE public.reactions
  DROP CONSTRAINT IF EXISTS reactions_user_id_target_type_target_id_key;

-- 2. Add new unique constraint including reaction_type (one of each type per user per target)
ALTER TABLE public.reactions
  ADD CONSTRAINT reactions_user_target_type_unique
  UNIQUE (user_id, target_type, target_id, reaction_type);

-- 3. Update reaction_type check to include all types used in the app
ALTER TABLE public.reactions
  DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

ALTER TABLE public.reactions
  ADD CONSTRAINT reactions_reaction_type_check
  CHECK (reaction_type IN ('heart', 'candle', 'flower', 'prayer', 'dove', 'balloon', 'cheers'));

-- === 00038_engagement_action_types.sql ===
-- ============================================================
-- 00038_engagement_action_types.sql
-- Extend legacy_points action_type CHECK to support all engagement actions
-- ============================================================

-- 1. Drop the existing narrow CHECK constraint
ALTER TABLE public.legacy_points
  DROP CONSTRAINT IF EXISTS legacy_points_action_type_check;

-- 2. Add the expanded CHECK constraint with all engagement action types
ALTER TABLE public.legacy_points
  ADD CONSTRAINT legacy_points_action_type_check
  CHECK (action_type IN (
    -- Original action types (from 00023)
    'daily_login',
    'create_memorial',
    'create_tribute',
    'send_gift',
    'send_flowers',
    'invite_accepted',
    'share_content',
    'respond_to_prompt',
    'complete_streak_day',
    'create_living_tribute',
    'write_appreciation',
    'contribute_to_tribute',
    'follow_memorial',
    'add_photo',
    'add_video',
    'complete_profile',
    'first_memorial',
    'first_tribute',
    'milestone_100_tributes',
    'campaign_participation',
    'referral_signup',
    -- New engagement action types
    'add_milestone',
    'create_event',
    'add_family_member',
    'upload_photo',
    'follow_user',
    'rsvp_event',
    'add_reaction',
    'send_message',
    'complete_quest',
    'earn_badge',
    'invite_user',
    'add_comment',
    'create_timeline_event',
    'purchase'
  ));

-- === 00039_flower_wall_rpc.sql ===
-- ============================================================
-- 00039_flower_wall_rpc.sql
-- RPC function to record gifts directly to flower_walls
-- Needed because built-in gifts skip the gift_transactions table
-- (which has a FK constraint to gift_catalog), so the
-- handle_gift_transaction trigger never fires for them.
-- ============================================================

-- Creates or replaces an RPC callable from the client that
-- atomically upserts a flower_walls row, incrementing counters.
CREATE OR REPLACE FUNCTION public.record_gift_to_wall(
  p_target_type text,
  p_target_id uuid,
  p_category text,
  p_quantity integer DEFAULT 1,
  p_amount_cents integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.flower_walls (
    target_type, target_id,
    total_flowers, total_candles, total_gifts,
    total_amount_cents, last_gift_at, updated_at
  )
  VALUES (
    p_target_type,
    p_target_id,
    CASE WHEN p_category = 'flowers' THEN p_quantity ELSE 0 END,
    CASE WHEN p_category = 'candles' THEN p_quantity ELSE 0 END,
    p_quantity,
    COALESCE(p_amount_cents, 0),
    now(),
    now()
  )
  ON CONFLICT (target_type, target_id) DO UPDATE SET
    total_flowers   = flower_walls.total_flowers   + CASE WHEN p_category = 'flowers' THEN p_quantity ELSE 0 END,
    total_candles   = flower_walls.total_candles   + CASE WHEN p_category = 'candles' THEN p_quantity ELSE 0 END,
    total_gifts     = flower_walls.total_gifts     + p_quantity,
    total_amount_cents = flower_walls.total_amount_cents + COALESCE(p_amount_cents, 0),
    last_gift_at    = now(),
    updated_at      = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

