-- BATCH 4 OF 4: Migrations 00041-00047 (SAFE)

-- === 00041_memorial_templates.sql ===
-- ============================================================
-- Migration 00041: Memorial Templates & Template Downloads
-- ============================================================
-- Supports the template marketplace where creators can sell
-- or share memorial/celebration page designs.
-- ============================================================

-- ── Memorial Templates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS memorial_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'memorial'
    CHECK (category IN ('memorial', 'celebration', 'tribute_page', 'life_story', 'milestone', 'anniversary', 'wedding', 'pet', 'other')),
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  preview_images TEXT[] DEFAULT '{}',
  template_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Template Downloads / Purchases ──────────────────────────
CREATE TABLE IF NOT EXISTS template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES memorial_templates(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'completed'
    CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, buyer_id)
);

-- ── Template Reviews ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES memorial_templates(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, reviewer_id)
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_templates_creator ON memorial_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON memorial_templates(category) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_templates_published ON memorial_templates(is_published, download_count DESC);
CREATE INDEX IF NOT EXISTS idx_template_downloads_buyer ON template_downloads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_template_downloads_template ON template_downloads(template_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON template_reviews(template_id);

-- ── RLS Policies ────────────────────────────────────────────
ALTER TABLE memorial_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;

-- Templates: anyone can read published, creators manage their own
DO $safe$ BEGIN
CREATE POLICY "templates_public_read" ON memorial_templates
  FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "templates_creator_all" ON memorial_templates
  FOR ALL USING (
    creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Downloads: users see their own, template owners see all for their templates
DO $safe$ BEGIN
CREATE POLICY "downloads_own" ON template_downloads
  FOR SELECT USING (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "downloads_insert" ON template_downloads
  FOR INSERT WITH CHECK (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "downloads_creator_view" ON template_downloads
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM memorial_templates WHERE creator_id IN (
        SELECT id FROM creator_profiles WHERE user_id = auth.uid()
      )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Reviews: anyone reads, authenticated users create their own
DO $safe$ BEGIN
CREATE POLICY "template_reviews_read" ON template_reviews
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "template_reviews_insert" ON template_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ── Auto-update template rating trigger ─────────────────────
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE memorial_templates SET
    rating_avg = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM template_reviews WHERE template_id = NEW.template_id), 0),
    rating_count = (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id)
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_template_rating
  AFTER INSERT OR UPDATE OR DELETE ON template_reviews
  FOR EACH ROW EXECUTE FUNCTION update_template_rating();

-- ── Record template sale earnings ───────────────────────────
CREATE OR REPLACE FUNCTION record_template_sale_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_template memorial_templates%ROWTYPE;
  v_platform_fee INTEGER;
  v_net INTEGER;
BEGIN
  IF NEW.amount_paid_cents > 0 AND NEW.payment_status = 'completed' THEN
    SELECT * INTO v_template FROM memorial_templates WHERE id = NEW.template_id;
    v_platform_fee := GREATEST(1, (NEW.amount_paid_cents * 15 / 100)); -- 15% platform fee on templates
    v_net := NEW.amount_paid_cents - v_platform_fee;

    INSERT INTO creator_earnings (creator_id, type, gross_amount_cents, platform_fee_cents, net_amount_cents, source_id, description)
    VALUES (v_template.creator_id, 'template_sale', NEW.amount_paid_cents, v_platform_fee, v_net, NEW.id, 'Template sale: ' || v_template.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_template_sale
  AFTER INSERT ON template_downloads
  FOR EACH ROW EXECUTE FUNCTION record_template_sale_earning();

-- === 00042_creator_economy_phase2.sql ===
-- ============================================================
-- Migration 00042: Creator Economy Phase 2
-- Event Ticketing, Honor-a-Day Sponsorships, Vault Preservation,
-- Content Licensing, Channel Subscriptions
-- ============================================================

-- ── 1. Event Ticketing ────────────────────────────────────────
-- Add ticketing columns to existing events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_ticketed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_sold INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_limit INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_creator_id UUID REFERENCES creator_profiles(id);

-- Event ticket purchases
CREATE TABLE IF NOT EXISTS event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  ticket_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_buyer ON event_tickets(buyer_id);

ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;
DO $safe$ BEGIN
CREATE POLICY "tickets_own" ON event_tickets FOR SELECT USING (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "tickets_insert" ON event_tickets FOR INSERT WITH CHECK (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "tickets_event_owner" ON event_tickets FOR SELECT USING (
  event_id IN (SELECT id FROM events WHERE created_by = auth.uid())
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Trigger: record ticket sale as creator earning
CREATE OR REPLACE FUNCTION record_event_ticket_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_event events%ROWTYPE;
  v_creator_id UUID;
  v_platform_fee INTEGER;
  v_net INTEGER;
BEGIN
  SELECT * INTO v_event FROM events WHERE id = NEW.event_id;
  
  -- Get creator_id from organizer or event creator's creator profile
  v_creator_id := v_event.organizer_creator_id;
  IF v_creator_id IS NULL THEN
    SELECT id INTO v_creator_id FROM creator_profiles WHERE user_id = v_event.created_by;
  END IF;
  
  IF v_creator_id IS NOT NULL AND NEW.amount_paid_cents > 0 THEN
    v_platform_fee := GREATEST(1, (NEW.amount_paid_cents * 10 / 100)); -- 10% platform fee
    v_net := NEW.amount_paid_cents - v_platform_fee;
    
    INSERT INTO creator_earnings (creator_id, type, gross_amount_cents, platform_fee_cents, net_amount_cents, source_id, description)
    VALUES (v_creator_id, 'event_ticket', NEW.amount_paid_cents, v_platform_fee, v_net, NEW.id, 'Ticket sale: ' || v_event.title);
  END IF;
  
  -- Update tickets_sold count
  UPDATE events SET tickets_sold = tickets_sold + NEW.quantity WHERE id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_ticket_sale
  AFTER INSERT ON event_tickets
  FOR EACH ROW EXECUTE FUNCTION record_event_ticket_earning();

-- ── 2. Honor-a-Day Micro-Sponsorships ────────────────────────
CREATE TABLE IF NOT EXISTS honor_day_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsored_date DATE NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 500,
  message TEXT,
  sponsor_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_badge TEXT DEFAULT 'candle'
    CHECK (display_badge IN ('candle', 'flower', 'dove', 'star', 'heart', 'ribbon')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(memorial_id, sponsored_date)
);

CREATE INDEX IF NOT EXISTS idx_honor_day_memorial ON honor_day_sponsorships(memorial_id);
CREATE INDEX IF NOT EXISTS idx_honor_day_sponsor ON honor_day_sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_honor_day_date ON honor_day_sponsorships(sponsored_date);

ALTER TABLE honor_day_sponsorships ENABLE ROW LEVEL SECURITY;
DO $safe$ BEGIN
CREATE POLICY "honor_day_public_read" ON honor_day_sponsorships FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "honor_day_insert" ON honor_day_sponsorships FOR INSERT WITH CHECK (sponsor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "honor_day_own" ON honor_day_sponsorships FOR SELECT USING (sponsor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ── 3. Memory Vault Preservation Orders ──────────────────────
CREATE TABLE IF NOT EXISTS vault_preservation_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creator_profiles(id),
  preservation_type TEXT NOT NULL DEFAULT 'digital_archive'
    CHECK (preservation_type IN ('digital_archive', 'printed_book', 'video_compilation', 'time_capsule', 'full_preservation')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  items_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  deliverables JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_preservation_owner ON vault_preservation_orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_vault_preservation_creator ON vault_preservation_orders(creator_id);

ALTER TABLE vault_preservation_orders ENABLE ROW LEVEL SECURITY;
DO $safe$ BEGIN
CREATE POLICY "vault_pres_own" ON vault_preservation_orders FOR SELECT USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "vault_pres_insert" ON vault_preservation_orders FOR INSERT WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "vault_pres_creator" ON vault_preservation_orders FOR SELECT USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ── 4. Legacy Content Licensing ──────────────────────────────
CREATE TABLE IF NOT EXISTS content_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text'
    CHECK (content_type IN ('text', 'photo', 'video', 'audio', 'template', 'design', 'bundle')),
  license_type TEXT NOT NULL DEFAULT 'personal'
    CHECK (license_type IN ('personal', 'commercial', 'exclusive', 'open')),
  price_cents INTEGER NOT NULL DEFAULT 0,
  preview_url TEXT,
  content_url TEXT,
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_license_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES content_licenses(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  license_type TEXT NOT NULL DEFAULT 'personal',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(license_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_content_licenses_creator ON content_licenses(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_license_purchases_buyer ON content_license_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_content_license_purchases_license ON content_license_purchases(license_id);

ALTER TABLE content_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_license_purchases ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "licenses_public_read" ON content_licenses FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "licenses_creator_all" ON content_licenses FOR ALL USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "license_purchases_own" ON content_license_purchases FOR SELECT USING (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "license_purchases_insert" ON content_license_purchases FOR INSERT WITH CHECK (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "license_purchases_creator" ON content_license_purchases FOR SELECT USING (
  license_id IN (
    SELECT id FROM content_licenses WHERE creator_id IN (
      SELECT id FROM creator_profiles WHERE user_id = auth.uid()
    )
  )
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Trigger: record license sale as creator earning
CREATE OR REPLACE FUNCTION record_license_sale_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_license content_licenses%ROWTYPE;
  v_platform_fee INTEGER;
  v_net INTEGER;
BEGIN
  IF NEW.amount_paid_cents > 0 THEN
    SELECT * INTO v_license FROM content_licenses WHERE id = NEW.license_id;
    v_platform_fee := GREATEST(1, (NEW.amount_paid_cents * 12 / 100)); -- 12% platform fee on licenses
    v_net := NEW.amount_paid_cents - v_platform_fee;
    
    INSERT INTO creator_earnings (creator_id, type, gross_amount_cents, platform_fee_cents, net_amount_cents, source_id, description)
    VALUES (v_license.creator_id, 'template_sale', NEW.amount_paid_cents, v_platform_fee, v_net, NEW.id, 'License sale: ' || v_license.title);
    
    -- Bump download count
    UPDATE content_licenses SET download_count = download_count + 1 WHERE id = NEW.license_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_license_sale
  AFTER INSERT ON content_license_purchases
  FOR EACH ROW EXECUTE FUNCTION record_license_sale_earning();

-- ── 5. Channel Subscriptions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS channel_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL, -- references celebrity memorial or creator profile
  subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'basic'
    CHECK (tier IN ('basic', 'premium', 'vip')),
  amount_cents INTEGER NOT NULL DEFAULT 499,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_subs_channel ON channel_subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_subs_subscriber ON channel_subscriptions(subscriber_id);

ALTER TABLE channel_subscriptions ENABLE ROW LEVEL SECURITY;
DO $safe$ BEGIN
CREATE POLICY "channel_subs_own" ON channel_subscriptions FOR SELECT USING (subscriber_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "channel_subs_insert" ON channel_subscriptions FOR INSERT WITH CHECK (subscriber_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- === 00043_page_stewardship.sql ===
-- ============================================================
-- Migration 00043: Page Stewardship & Transfer System
-- ============================================================
-- Complete ownership transfer, stewardship delegation, inheritance,
-- provenance tracking, valuation, and guardian subscription system.
-- Enables voluntary transfers, purchase/sale, temporary stewardship,
-- inheritance triggers, and immutable provenance chains.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. PAGE TRANSFERS — Central transfer tracking
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL CHECK (page_type IN (
    'memorial', 'living_tribute', 'event', 'family_tree',
    'virtual_space', 'wedding', 'pet_page'
  )),
  page_id uuid NOT NULL,
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,  -- null = open offer
  initiated_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transfer_type text NOT NULL CHECK (transfer_type IN (
    'voluntary', 'request', 'claim_transfer', 'stewardship',
    'purchase', 'inheritance', 'reclamation'
  )),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'negotiating', 'accepted', 'cooling_off',
    'escrow_funded', 'completed', 'rejected', 'cancelled',
    'expired', 'disputed', 'admin_review'
  )),
  price_cents integer DEFAULT 0,
  platform_fee_cents integer DEFAULT 0,
  net_to_seller_cents integer DEFAULT 0,
  escrow_status text CHECK (escrow_status IN (
    'none', 'pending', 'funded', 'released', 'refunded'
  )) DEFAULT 'none',
  stripe_payment_intent_id text,

  -- Stewardship-specific fields
  stewardship_terms jsonb DEFAULT null,
  stewardship_start_at timestamptz,
  stewardship_end_at timestamptz,
  stewardship_deposit_cents integer DEFAULT 0,
  stewardship_deposit_status text CHECK (stewardship_deposit_status IN (
    'none', 'held', 'returned', 'forfeited'
  )) DEFAULT 'none',

  -- Inheritance-specific fields
  inheritance_trigger text CHECK (inheritance_trigger IN (
    'manual', 'inactivity_90_days', 'inactivity_180_days', 'date_triggered'
  )),
  inheritance_trigger_date timestamptz,

  -- Cooling off
  cooling_off_ends_at timestamptz,

  -- Valuation snapshot at time of transfer
  valuation_snapshot jsonb DEFAULT null,

  -- Negotiation tracking
  message_count integer DEFAULT 0,
  last_message_at timestamptz,

  -- Admin review
  admin_reviewer_id uuid REFERENCES profiles(id),
  admin_notes text,

  -- General
  reason text,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_transfers_page
  ON page_transfers(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_transfers_from_user
  ON page_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_page_transfers_to_user
  ON page_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_page_transfers_status_active
  ON page_transfers(status)
  WHERE status IN ('pending', 'negotiating', 'accepted', 'cooling_off', 'escrow_funded', 'disputed', 'admin_review');
CREATE INDEX IF NOT EXISTS idx_page_transfers_type
  ON page_transfers(transfer_type);


-- ────────────────────────────────────────────────────────────
-- 2. TRANSFER MESSAGES — Negotiation thread
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transfer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES page_transfers(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN (
    'text', 'system', 'offer', 'counter_offer', 'evidence', 'terms_update'
  )),
  attachments text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_messages_transfer
  ON transfer_messages(transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfer_messages_sender
  ON transfer_messages(sender_id);


-- ────────────────────────────────────────────────────────────
-- 3. STEWARDSHIP SCORES — Per-user reputation
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stewardship_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_score integer NOT NULL DEFAULT 0,
  pages_managed integer NOT NULL DEFAULT 0,
  pages_transferred integer NOT NULL DEFAULT 0,
  avg_page_growth_pct numeric(5,2) DEFAULT 0,
  avg_response_time_hours integer DEFAULT 24,
  smooth_transfers integer NOT NULL DEFAULT 0,
  disputed_transfers integer NOT NULL DEFAULT 0,
  tributes_added integer DEFAULT 0,
  events_created integer DEFAULT 0,
  content_uploads integer DEFAULT 0,
  stewardship_tier text DEFAULT 'newcomer' CHECK (stewardship_tier IN (
    'newcomer', 'reliable', 'dedicated', 'exemplary', 'legendary'
  )),
  founding_steward_pages uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stewardship_scores_user
  ON stewardship_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_stewardship_scores_tier
  ON stewardship_scores(stewardship_tier);


-- ────────────────────────────────────────────────────────────
-- 4. PAGE VALUATIONS — Cached page value
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL,
  page_id uuid NOT NULL,
  tribute_count integer DEFAULT 0,
  follower_count integer DEFAULT 0,
  media_count integer DEFAULT 0,
  event_count integer DEFAULT 0,
  gift_count integer DEFAULT 0,
  page_age_days integer DEFAULT 0,
  last_activity_days_ago integer DEFAULT 0,
  estimated_value_cents integer DEFAULT 0,
  valuation_tier text DEFAULT 'basic' CHECK (valuation_tier IN (
    'basic', 'bronze', 'silver', 'gold', 'platinum', 'priceless'
  )),
  valuation_formula_version integer DEFAULT 1,
  breakdown jsonb DEFAULT '{}',
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(page_type, page_id)
);

CREATE INDEX IF NOT EXISTS idx_page_valuations_page
  ON page_valuations(page_type, page_id);


-- ────────────────────────────────────────────────────────────
-- 5. TRANSFER HISTORY — Immutable provenance chain
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transfer_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL,
  page_id uuid NOT NULL,
  transfer_id uuid REFERENCES page_transfers(id) ON DELETE SET NULL,
  sequence_number integer NOT NULL,
  from_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'created', 'transferred', 'claimed', 'stewardship_started',
    'stewardship_ended', 'inherited', 'reclaimed', 'purchased'
  )),
  valuation_at_time_cents integer DEFAULT 0,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_history_page
  ON transfer_history(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_transfer_history_page_seq
  ON transfer_history(page_type, page_id, sequence_number);


-- ────────────────────────────────────────────────────────────
-- 6. GUARDIAN SUBSCRIPTIONS — Tiered page management plans
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guardian_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  tier text NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'plus', 'pro')),
  max_pages integer NOT NULL DEFAULT 5,
  priority_support boolean DEFAULT false,
  expedited_transfers boolean DEFAULT false,
  advanced_analytics boolean DEFAULT false,
  revenucat_entitlement text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 7. ALTER EXISTING TABLES
-- ────────────────────────────────────────────────────────────

-- page_hosts: succession planning columns
ALTER TABLE page_hosts
  ADD COLUMN IF NOT EXISTS designated_successor_id uuid REFERENCES profiles(id);

ALTER TABLE page_hosts
  ADD COLUMN IF NOT EXISTS successor_trigger text CHECK (successor_trigger IN (
    'manual', 'inactivity_90_days', 'inactivity_180_days', 'date_triggered'
  ));

ALTER TABLE page_hosts
  ADD COLUMN IF NOT EXISTS successor_trigger_date timestamptz;

-- profiles: stewardship & guardian columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stewardship_score integer DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_guardian_subscriber boolean DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS max_managed_pages integer DEFAULT 5;


-- ────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- page_transfers
ALTER TABLE page_transfers ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "page_transfers_select" ON page_transfers
  FOR SELECT USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR initiated_by = auth.uid()
    OR admin_reviewer_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "page_transfers_insert" ON page_transfers
  FOR INSERT WITH CHECK (
    initiated_by = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "page_transfers_update" ON page_transfers
  FOR UPDATE USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR initiated_by = auth.uid()
    OR admin_reviewer_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- transfer_messages
ALTER TABLE transfer_messages ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "transfer_messages_select" ON transfer_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM page_transfers pt
      WHERE pt.id = transfer_messages.transfer_id
        AND (
          pt.from_user_id = auth.uid()
          OR pt.to_user_id = auth.uid()
          OR pt.initiated_by = auth.uid()
          OR pt.admin_reviewer_id = auth.uid()
        )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "transfer_messages_insert" ON transfer_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM page_transfers pt
      WHERE pt.id = transfer_messages.transfer_id
        AND (
          pt.from_user_id = auth.uid()
          OR pt.to_user_id = auth.uid()
          OR pt.initiated_by = auth.uid()
        )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- stewardship_scores: public read
ALTER TABLE stewardship_scores ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "stewardship_scores_select" ON stewardship_scores
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- page_valuations: public read
ALTER TABLE page_valuations ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "page_valuations_select" ON page_valuations
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- transfer_history: public read
ALTER TABLE transfer_history ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "transfer_history_select" ON transfer_history
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- guardian_subscriptions: own data only
ALTER TABLE guardian_subscriptions ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "guardian_subscriptions_select" ON guardian_subscriptions
  FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "guardian_subscriptions_update" ON guardian_subscriptions
  FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;


-- ────────────────────────────────────────────────────────────
-- 9. TRIGGERS
-- ────────────────────────────────────────────────────────────

-- 9a. record_transfer_history()
-- When a transfer is completed, append to the immutable provenance chain
-- and update stewardship_scores for both parties.
CREATE OR REPLACE FUNCTION record_transfer_history()
RETURNS TRIGGER AS $$
DECLARE
  v_next_seq integer;
  v_action text;
  v_valuation integer;
BEGIN
  -- Only fire when status transitions to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN

    -- Determine next sequence number for this page
    SELECT COALESCE(MAX(sequence_number), 0) + 1
      INTO v_next_seq
      FROM transfer_history
      WHERE page_type = NEW.page_type
        AND page_id = NEW.page_id;

    -- Map transfer_type to action_type
    v_action := CASE NEW.transfer_type
      WHEN 'voluntary'       THEN 'transferred'
      WHEN 'request'         THEN 'transferred'
      WHEN 'claim_transfer'  THEN 'claimed'
      WHEN 'stewardship'     THEN 'stewardship_started'
      WHEN 'purchase'        THEN 'purchased'
      WHEN 'inheritance'     THEN 'inherited'
      WHEN 'reclamation'     THEN 'reclaimed'
      ELSE 'transferred'
    END;

    -- Pull valuation from snapshot if available
    v_valuation := COALESCE(
      (NEW.valuation_snapshot ->> 'estimated_value_cents')::integer,
      0
    );

    -- Insert provenance record
    INSERT INTO transfer_history (
      page_type, page_id, transfer_id, sequence_number,
      from_user_id, to_user_id, action_type,
      valuation_at_time_cents, notes, metadata
    ) VALUES (
      NEW.page_type, NEW.page_id, NEW.id, v_next_seq,
      NEW.from_user_id, NEW.to_user_id, v_action,
      v_valuation, NEW.reason,
      jsonb_build_object(
        'transfer_type', NEW.transfer_type,
        'price_cents', NEW.price_cents,
        'platform_fee_cents', NEW.platform_fee_cents
      )
    );

    -- Update stewardship_scores for the sender (from_user)
    INSERT INTO stewardship_scores (user_id, pages_transferred, smooth_transfers, total_score)
    VALUES (NEW.from_user_id, 1, 1, 10)
    ON CONFLICT (user_id) DO UPDATE SET
      pages_transferred = stewardship_scores.pages_transferred + 1,
      smooth_transfers = stewardship_scores.smooth_transfers + 1,
      total_score = stewardship_scores.total_score + 10,
      updated_at = now();

    -- Update stewardship_scores for the receiver (to_user), if present
    IF NEW.to_user_id IS NOT NULL THEN
      INSERT INTO stewardship_scores (user_id, pages_managed, total_score)
      VALUES (NEW.to_user_id, 1, 5)
      ON CONFLICT (user_id) DO UPDATE SET
        pages_managed = stewardship_scores.pages_managed + 1,
        total_score = stewardship_scores.total_score + 5,
        updated_at = now();
    END IF;

    -- Set completed_at timestamp on the transfer itself
    NEW.completed_at := now();
  END IF;

  -- Handle disputed transfers
  IF NEW.status = 'disputed' AND (OLD.status IS DISTINCT FROM 'disputed') THEN
    -- Increment disputed count for the initiator
    INSERT INTO stewardship_scores (user_id, disputed_transfers, total_score)
    VALUES (NEW.initiated_by, 1, -5)
    ON CONFLICT (user_id) DO UPDATE SET
      disputed_transfers = stewardship_scores.disputed_transfers + 1,
      total_score = GREATEST(0, stewardship_scores.total_score - 5),
      updated_at = now();
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_record_transfer_history ON page_transfers;
CREATE TRIGGER trg_record_transfer_history
  BEFORE UPDATE ON page_transfers
  FOR EACH ROW
  EXECUTE FUNCTION record_transfer_history();


-- 9b. update_transfer_message_count()
-- On every new message, bump the message count and last_message_at on the transfer.
CREATE OR REPLACE FUNCTION update_transfer_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE page_transfers
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.transfer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_transfer_message_count ON transfer_messages;
CREATE TRIGGER trg_update_transfer_message_count
  AFTER INSERT ON transfer_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_transfer_message_count();


-- 9c. set_cooling_off_period()
-- When a transfer enters cooling_off status, set 72-hour deadline.
CREATE OR REPLACE FUNCTION set_cooling_off_period()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cooling_off' AND (OLD.status IS DISTINCT FROM 'cooling_off') THEN
    NEW.cooling_off_ends_at := now() + interval '72 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_cooling_off_period ON page_transfers;
CREATE TRIGGER trg_set_cooling_off_period
  BEFORE UPDATE ON page_transfers
  FOR EACH ROW
  EXECUTE FUNCTION set_cooling_off_period();


-- ────────────────────────────────────────────────────────────
-- 10. RPC: calculate_page_valuation
-- ────────────────────────────────────────────────────────────
-- Computes a page's estimated value based on engagement metrics,
-- content volume, age, and recent activity. Upserts the result
-- into page_valuations and returns a jsonb summary.

CREATE OR REPLACE FUNCTION calculate_page_valuation(
  p_page_type text,
  p_page_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_tribute_count integer := 0;
  v_follower_count integer := 0;
  v_media_count integer := 0;
  v_event_count integer := 0;
  v_gift_count integer := 0;
  v_page_age_days integer := 0;
  v_last_activity_days integer := 0;
  v_raw_value integer := 0;
  v_estimated_value integer := 0;
  v_tier text := 'basic';
  v_inactivity_factor numeric := 1.0;
  v_created_at timestamptz;
  v_last_interaction timestamptz;
  v_breakdown jsonb;
BEGIN
  -- ── Gather metrics based on page type ──
  IF p_page_type = 'memorial' THEN
    SELECT
      COALESCE(m.tribute_count, 0),
      COALESCE(m.follower_count, 0),
      m.created_at,
      m.last_interaction_at
    INTO v_tribute_count, v_follower_count, v_created_at, v_last_interaction
    FROM memorials m
    WHERE m.id = p_page_id;

  ELSIF p_page_type = 'living_tribute' THEN
    SELECT lt.created_at, lt.updated_at
    INTO v_created_at, v_last_interaction
    FROM living_tributes lt
    WHERE lt.id = p_page_id;

    -- Count tributes associated with the page
    SELECT COUNT(*) INTO v_tribute_count
    FROM tributes t
    WHERE t.memorial_id = p_page_id;

  ELSIF p_page_type = 'event' THEN
    SELECT e.created_at, e.updated_at
    INTO v_created_at, v_last_interaction
    FROM events e
    WHERE e.id = p_page_id;

  ELSIF p_page_type = 'family_tree' THEN
    SELECT ft.created_at, ft.updated_at
    INTO v_created_at, v_last_interaction
    FROM family_trees ft
    WHERE ft.id = p_page_id;

  ELSE
    -- Generic fallback: use page_hosts creation date
    SELECT MIN(ph.created_at)
    INTO v_created_at
    FROM page_hosts ph
    WHERE ph.page_type = p_page_type AND ph.page_id = p_page_id;

    v_last_interaction := v_created_at;
  END IF;

  -- Guard: if page not found, return empty result
  IF v_created_at IS NULL THEN
    RETURN jsonb_build_object(
      'estimated_value_cents', 0,
      'valuation_tier', 'basic',
      'error', 'Page not found'
    );
  END IF;

  -- ── Count related content (cross-page-type) ──
  -- Media (photos, videos in memorial_media or generic)
  SELECT COUNT(*) INTO v_media_count
  FROM memorial_media mm
  WHERE mm.memorial_id = p_page_id;

  -- Events linked to this page (for memorials)
  IF p_page_type = 'memorial' THEN
    SELECT COUNT(*) INTO v_event_count
    FROM events ev
    WHERE ev.memorial_id = p_page_id;
  END IF;

  -- Gifts sent to this page
  SELECT COUNT(*) INTO v_gift_count
  FROM gifts g
  WHERE g.memorial_id = p_page_id;

  -- ── Calculate age & activity ──
  v_page_age_days := GREATEST(0, EXTRACT(EPOCH FROM (now() - v_created_at)) / 86400)::integer;
  v_last_activity_days := GREATEST(0, EXTRACT(EPOCH FROM (now() - COALESCE(v_last_interaction, v_created_at))) / 86400)::integer;

  -- ── Value formula ──
  -- tributes: 10c each, media: 15c each, events: 25c each,
  -- followers: 5c each, gifts: 8c each, age: 1c/day (capped at 3650 = 10 years)
  v_raw_value := (v_tribute_count * 10)
               + (v_media_count * 15)
               + (v_event_count * 25)
               + (v_follower_count * 5)
               + (v_gift_count * 8)
               + (LEAST(v_page_age_days, 3650) * 1);

  -- ── Inactivity discount ──
  IF v_last_activity_days >= 180 THEN
    v_inactivity_factor := 0.50;  -- 50% value
  ELSIF v_last_activity_days >= 90 THEN
    v_inactivity_factor := 0.75;  -- 75% value
  END IF;

  v_estimated_value := (v_raw_value * v_inactivity_factor)::integer;

  -- ── Determine tier ──
  v_tier := CASE
    WHEN v_estimated_value >= 50000 THEN 'priceless'
    WHEN v_estimated_value >= 20000 THEN 'platinum'
    WHEN v_estimated_value >= 10000 THEN 'gold'
    WHEN v_estimated_value >= 5000  THEN 'silver'
    WHEN v_estimated_value >= 1000  THEN 'bronze'
    ELSE 'basic'
  END;

  -- ── Build breakdown ──
  v_breakdown := jsonb_build_object(
    'tributes', jsonb_build_object('count', v_tribute_count, 'value_cents', v_tribute_count * 10),
    'media',    jsonb_build_object('count', v_media_count,   'value_cents', v_media_count * 15),
    'events',   jsonb_build_object('count', v_event_count,   'value_cents', v_event_count * 25),
    'followers', jsonb_build_object('count', v_follower_count, 'value_cents', v_follower_count * 5),
    'gifts',    jsonb_build_object('count', v_gift_count,    'value_cents', v_gift_count * 8),
    'age',      jsonb_build_object('days', v_page_age_days,  'value_cents', LEAST(v_page_age_days, 3650)),
    'raw_value_cents', v_raw_value,
    'inactivity_factor', v_inactivity_factor,
    'last_activity_days_ago', v_last_activity_days,
    'formula_version', 1
  );

  -- ── Upsert into page_valuations ──
  INSERT INTO page_valuations (
    page_type, page_id,
    tribute_count, follower_count, media_count,
    event_count, gift_count,
    page_age_days, last_activity_days_ago,
    estimated_value_cents, valuation_tier,
    valuation_formula_version, breakdown,
    calculated_at
  ) VALUES (
    p_page_type, p_page_id,
    v_tribute_count, v_follower_count, v_media_count,
    v_event_count, v_gift_count,
    v_page_age_days, v_last_activity_days,
    v_estimated_value, v_tier,
    1, v_breakdown,
    now()
  )
  ON CONFLICT (page_type, page_id) DO UPDATE SET
    tribute_count = EXCLUDED.tribute_count,
    follower_count = EXCLUDED.follower_count,
    media_count = EXCLUDED.media_count,
    event_count = EXCLUDED.event_count,
    gift_count = EXCLUDED.gift_count,
    page_age_days = EXCLUDED.page_age_days,
    last_activity_days_ago = EXCLUDED.last_activity_days_ago,
    estimated_value_cents = EXCLUDED.estimated_value_cents,
    valuation_tier = EXCLUDED.valuation_tier,
    valuation_formula_version = EXCLUDED.valuation_formula_version,
    breakdown = EXCLUDED.breakdown,
    calculated_at = now();

  -- ── Return result ──
  RETURN jsonb_build_object(
    'estimated_value_cents', v_estimated_value,
    'valuation_tier', v_tier,
    'metrics', jsonb_build_object(
      'tribute_count', v_tribute_count,
      'follower_count', v_follower_count,
      'media_count', v_media_count,
      'event_count', v_event_count,
      'gift_count', v_gift_count,
      'page_age_days', v_page_age_days,
      'last_activity_days_ago', v_last_activity_days
    ),
    'breakdown', v_breakdown
  );
END;
$$;

-- === 00044_progressive_unlocking.sql ===
-- ============================================================
-- Migration 00044: Progressive Feature Unlocking
-- Gates features behind user point levels so new users
-- aren't overwhelmed and must earn access to advanced features.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. FEATURE UNLOCKS — maps features to required levels
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_unlocks (
  id              serial PRIMARY KEY,
  feature_key     text UNIQUE NOT NULL,
  label           text NOT NULL,
  description     text,
  required_level  integer NOT NULL DEFAULT 1 CHECK (required_level >= 1 AND required_level <= 7),
  required_trust_level integer NOT NULL DEFAULT 1,
  required_premium_tier integer NOT NULL DEFAULT 0,
  category        text NOT NULL DEFAULT 'general',
  icon            text,
  unlock_message  text,
  sort_order      integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. USER FEATURE UNLOCKS — tracks per-user unlock state
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_feature_unlocks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key       text NOT NULL,
  unlocked_at       timestamptz DEFAULT now(),
  seen_notification boolean DEFAULT false,
  UNIQUE(user_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_user_feature_unlocks_user ON user_feature_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_unlocks_unseen ON user_feature_unlocks(user_id) WHERE seen_notification = false;

-- ────────────────────────────────────────────────────────────
-- 3. ALTER profiles — add feature tier tracking
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS feature_tier integer DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS features_unlocked text[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 4. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE feature_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_unlocks ENABLE ROW LEVEL SECURITY;

-- feature_unlocks: anyone can read (public catalog)
DO $safe$ BEGIN
CREATE POLICY "feature_unlocks_select" ON feature_unlocks
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- user_feature_unlocks: users see only their own
DO $safe$ BEGIN
CREATE POLICY "user_feature_unlocks_select" ON user_feature_unlocks
  FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "user_feature_unlocks_insert" ON user_feature_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "user_feature_unlocks_update" ON user_feature_unlocks
  FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ────────────────────────────────────────────────────────────
-- 5. AUTO-UNLOCK TRIGGER — when user levels up
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_level_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when level actually changes upward
  IF NEW.level > OLD.level THEN
    -- Insert unlocks for all features at or below new level
    INSERT INTO user_feature_unlocks (user_id, feature_key, unlocked_at, seen_notification)
    SELECT NEW.user_id, fu.feature_key, now(), false
    FROM feature_unlocks fu
    WHERE fu.required_level <= NEW.level
      AND fu.is_active = true
    ON CONFLICT (user_id, feature_key) DO NOTHING;

    -- Update profile feature_tier
    UPDATE profiles
    SET feature_tier = NEW.level,
        features_unlocked = ARRAY(
          SELECT feature_key FROM user_feature_unlocks WHERE user_id = NEW.user_id
        )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_level_change
  AFTER UPDATE OF level ON legacy_point_balances
  FOR EACH ROW
  EXECUTE FUNCTION handle_level_change();

-- ────────────────────────────────────────────────────────────
-- 6. SEED FEATURE UNLOCK CATALOG
-- ────────────────────────────────────────────────────────────

-- Level 1 — Seedling (0 points) — Core basics
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('create_page',         'Create Pages',          'Create memorial, celebration, and lifecycle pages',  1, 'core',       'add-circle',    'Welcome! Start creating pages to honor lives.',          1),
  ('post_tribute',        'Post Tributes',         'Write tributes on pages you follow',                 1, 'social',     'heart',         'Share your memories and tributes.',                       2),
  ('follow_pages',        'Follow Pages',          'Follow pages to stay updated',                       1, 'social',     'people',        'Follow pages that matter to you.',                       3),
  ('reactions',           'Reactions',             'React to tributes, photos, and updates',             1, 'social',     'thumbs-up',     'Express yourself with reactions.',                        4),
  ('basic_profile',       'Profile Setup',         'Set up your basic profile',                          1, 'core',       'person',        'Personalize your ǝterrn profile.',                       5),
  ('echoes_feed',         'Echoes Feed',           'View your personalized Echoes activity feed',        1, 'core',       'pulse',         'Stay connected with Echoes.',                            6),
  ('browse_directory',    'Browse Directory',      'Browse the public page directory',                   1, 'discovery',  'search',        'Explore pages in the directory.',                        7),
  ('view_timeline',       'View The Arc',          'View timeline events on pages',                      1, 'core',       'time',          'Explore life stories in The Arc.',                       8)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 2 — Sprout (100 points) — Social & collaboration
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('chat_dms',            'Chat & DMs',            'Send direct messages to other users',                2, 'social',     'chatbubbles',   'You can now chat with other members!',                  10),
  ('create_events',       'Create Events',         'Create and manage events',                           2, 'social',     'calendar',      'Start organizing events and gatherings.',               11),
  ('photo_albums',        'Photo Albums',          'Create photo albums on pages',                       2, 'content',    'images',        'Create beautiful photo albums.',                        12),
  ('family_tree',         'Family Tree',           'Build and manage family trees',                      2, 'content',    'git-branch',    'Connect family members in your tree.',                  13),
  ('share_links',         'Share Links',           'Generate shareable links for pages',                 2, 'social',     'share-social',  'Share pages with anyone via link.',                     14),
  ('send_gifts',          'Send Gifts',            'Send virtual gifts to pages',                        2, 'social',     'gift',          'Send meaningful virtual gifts.',                        15),
  ('baby_journey',        'Little Arcs',           'Create baby journey pages to track milestones',      2, 'content',    'happy',         'Track your little one''s journey!',                     16),
  ('relationship_events', 'Relationship Events',   'Record relationship milestones and transitions',     2, 'content',    'heart-half',    'Document your relationship journey.',                   17)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 3 — Bloom (500 points) — Creator economy entry
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('creator_hub',         'Creator Hub',           'Access the Creator Hub to offer services and earn',  3, 'creator',    'briefcase',     'Welcome to the Creator Hub! Start earning.',           20),
  ('service_listings',    'Service Listings',      'Create and manage service listings',                 3, 'creator',    'storefront',    'List your services for others to discover.',            21),
  ('templates',           'Templates',             'Create and sell memorial templates',                 3, 'creator',    'document',      'Design templates for the community.',                   22),
  ('honor_fundraisers',   'Honor Fundraisers',     'Create fundraisers in someone''s honor',             3, 'community',  'ribbon',        'Start fundraisers to honor loved ones.',                23),
  ('marketplace_browse',  'Marketplace',           'Browse the full marketplace',                        3, 'discovery',  'cart',          'Explore the marketplace.',                              24),
  ('stewardship',         'Stewardship',           'Access page stewardship and transfer features',      3, 'community',  'shield-checkmark', 'Manage page stewardship.',                           25),
  ('grief_coaching',      'Grief Coaching',        'Access grief coaching services',                     3, 'community',  'medkit',        'Connect with grief coaching professionals.',            26)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 4 — Tree (2,000 points) — Advanced features
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('content_licensing',       'Content Licensing',       'License your content for use by others',        4, 'creator',    'document-lock', 'License your creative work.',                        30),
  ('channel_subscriptions',   'Channel Subscriptions',   'Create subscription channels',                  4, 'creator',    'tv',            'Launch your subscription channel.',                   31),
  ('honor_a_day',             'Honor-a-Day',             'Sponsor Honor-a-Day micro-sponsorships',        4, 'community',  'sunny',         'Sponsor a day in someone''s honor.',                  32),
  ('advanced_analytics',      'Advanced Analytics',      'View detailed page analytics and insights',     4, 'creator',    'analytics',     'Unlock powerful analytics insights.',                 33),
  ('vault_preservation',      'Vault Preservation',      'Order vault preservation services',              4, 'community',  'archive',       'Preserve memories with vault services.',              34)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 5 — Grove (5,000 points) — Elite features
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('featured_placement',      'Featured Placement',      'Eligible for featured placement in directory',  5, 'discovery',  'star',          'You''re now eligible for featured placement!',       40),
  ('community_governance',    'Community Governance',    'Participate in community governance decisions',  5, 'community',  'people-circle', 'Help shape the community.',                          41),
  ('reduced_fees',            'Reduced Fees',            'Reduced platform fees on all transactions',      5, 'creator',    'trending-down', 'Enjoy reduced fees on transactions.',                42)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 6 — Forest (15,000 points) — Veteran features
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('mentorship_tools',        'Mentorship Tools',        'Access tools to mentor newer members',           6, 'community',  'school',        'Guide newer members with mentorship tools.',         50),
  ('beta_features',           'Beta Features',           'Early access to new features',                   6, 'discovery',  'flask',         'Get early access to beta features.',                 51),
  ('priority_support',        'Priority Support',        'Priority customer support queue',                 6, 'core',       'flash',         'You now have priority support access.',               52)
ON CONFLICT (feature_key) DO NOTHING;

-- Level 7 — Eternal (50,000 points) — Legendary
INSERT INTO feature_unlocks (feature_key, label, description, required_level, category, icon, unlock_message, sort_order) VALUES
  ('founding_member',         'Founding Member',         'Permanent founding member status and perks',      7, 'core',       'trophy',        'You''ve achieved Founding Member status! Thank you.', 60),
  ('zero_fee_transfers',      'Zero-Fee Transfers',      '0% platform fee on first 3 transfers/year',      7, 'creator',    'swap-horizontal', 'Enjoy zero-fee transfers.',                         61)
ON CONFLICT (feature_key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 7. BOOTSTRAP — auto-unlock Level 1 features for all existing users
-- ────────────────────────────────────────────────────────────

INSERT INTO user_feature_unlocks (user_id, feature_key, unlocked_at, seen_notification)
SELECT p.id, fu.feature_key, now(), true
FROM profiles p
CROSS JOIN feature_unlocks fu
WHERE fu.required_level = 1 AND fu.is_active = true
ON CONFLICT (user_id, feature_key) DO NOTHING;

-- Also unlock features for users who are already at higher levels
INSERT INTO user_feature_unlocks (user_id, feature_key, unlocked_at, seen_notification)
SELECT lpb.user_id, fu.feature_key, now(), true
FROM legacy_point_balances lpb
JOIN feature_unlocks fu ON fu.required_level <= lpb.level AND fu.is_active = true
ON CONFLICT (user_id, feature_key) DO NOTHING;

-- === 00045_baby_journey.sql ===
-- ============================================================
-- Migration 00045: Baby Journey ("Little Arcs")
-- Dedicated page type for tracking a child's journey from
-- pregnancy through adulthood. Follows pet_pages/wedding_pages pattern.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. BABY PAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_pages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  baby_name         text NOT NULL,
  nickname          text,
  date_of_birth     date,
  due_date          date,
  gender            text CHECK (gender IN ('boy', 'girl', 'non_binary', 'surprise', 'other')),
  birth_weight_oz   integer,
  birth_length_in   numeric(5,2),
  profile_photo_url text,
  cover_photo_url   text,
  bio               text,
  current_stage     text DEFAULT 'expecting' CHECK (current_stage IN (
    'expecting', 'newborn', 'infant', 'toddler', 'preschool',
    'elementary', 'tween', 'teenager', 'young_adult', 'adult'
  )),
  privacy           text DEFAULT 'private' CHECK (privacy IN ('public', 'family', 'private')),
  status            text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  slug              text UNIQUE,
  follower_count    integer DEFAULT 0,
  milestone_count   integer DEFAULT 0,
  photo_count       integer DEFAULT 0,
  update_count      integer DEFAULT 0,
  lifecycle_stage   text DEFAULT 'celebrate',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_baby_pages_created_by ON baby_pages(created_by);
CREATE INDEX IF NOT EXISTS idx_baby_pages_slug ON baby_pages(slug);

-- Auto-generate slug from baby name
CREATE OR REPLACE FUNCTION generate_baby_page_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.baby_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM baby_pages WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_baby_page_slug
  BEFORE INSERT ON baby_pages
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_baby_page_slug();

-- Auto-add creator as page_host owner
CREATE OR REPLACE FUNCTION auto_add_baby_page_host()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_hosts (page_type, page_id, user_id, role, status)
  VALUES ('baby', NEW.id, NEW.created_by, 'owner', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_page_host
  AFTER INSERT ON baby_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_baby_page_host();

-- ────────────────────────────────────────────────────────────
-- 2. BABY MILESTONES — age-specific milestone tracking
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_milestones (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_page_id     uuid NOT NULL REFERENCES baby_pages(id) ON DELETE CASCADE,
  created_by       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stage            text NOT NULL CHECK (stage IN (
    'expecting', 'newborn', 'infant', 'toddler', 'preschool',
    'elementary', 'tween', 'teenager', 'young_adult', 'adult'
  )),
  milestone_type   text NOT NULL CHECK (milestone_type IN (
    -- Expecting (10)
    'first_ultrasound', 'gender_reveal', 'first_kick', 'baby_shower',
    'nursery_ready', 'birth_plan', 'hospital_bag', 'contractions_start',
    'water_broke', 'birth',
    -- Newborn (8)
    'first_cry', 'first_hold', 'first_feed', 'umbilical_cord_off',
    'first_bath', 'first_smile', 'first_night_home', 'naming_ceremony',
    -- Infant 0-12m (10)
    'first_laugh', 'first_roll', 'first_solid_food', 'first_tooth',
    'first_crawl', 'first_steps', 'first_word', 'first_haircut',
    'first_birthday', 'first_wave',
    -- Toddler 1-3y (8)
    'first_sentence', 'potty_trained', 'first_friend', 'first_tantrum',
    'first_drawing', 'learned_abc', 'first_bike', 'started_daycare',
    -- Preschool 3-5y (6)
    'first_day_preschool', 'learned_to_write_name', 'first_performance',
    'lost_first_tooth', 'first_sleepover', 'kindergarten_ready',
    -- Elementary 5-11y (6)
    'first_day_school', 'first_report_card', 'learned_to_read',
    'first_sports_team', 'first_instrument', 'elementary_graduation',
    -- Tween/Teen 11-18y (6)
    'middle_school', 'first_phone', 'learners_permit', 'first_date',
    'high_school_graduation', 'college_acceptance',
    -- Young Adult 18+ (4)
    'moved_out', 'first_job', 'college_graduation', 'first_apartment',
    -- Custom
    'custom'
  )),
  title            text NOT NULL,
  description      text,
  milestone_date   date,
  age_at_milestone text,  -- e.g. "3 months", "2 years 4 months"
  photo_url        text,
  media_urls       text[] DEFAULT '{}',
  height_in        numeric(5,2),
  weight_oz        integer,
  emoji            text,
  sort_order       integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_baby_milestones_page ON baby_milestones(baby_page_id);
CREATE INDEX IF NOT EXISTS idx_baby_milestones_stage ON baby_milestones(baby_page_id, stage);

-- Auto-update milestone_count on baby_pages
CREATE OR REPLACE FUNCTION update_baby_milestone_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE baby_pages SET milestone_count = milestone_count + 1, updated_at = now()
    WHERE id = NEW.baby_page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE baby_pages SET milestone_count = GREATEST(0, milestone_count - 1), updated_at = now()
    WHERE id = OLD.baby_page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_milestone_count
  AFTER INSERT OR DELETE ON baby_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_milestone_count();

-- ────────────────────────────────────────────────────────────
-- 3. BABY UPDATES — journal-style entries
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_updates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_page_id     uuid NOT NULL REFERENCES baby_pages(id) ON DELETE CASCADE,
  author_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content          text NOT NULL,
  media_url        text,
  media_type       text CHECK (media_type IN ('photo', 'video', 'voice')),
  mood             text CHECK (mood IN (
    'joyful', 'proud', 'tired', 'grateful', 'emotional', 'funny', 'challenging'
  )),
  stage            text,
  reaction_count   integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_baby_updates_page ON baby_updates(baby_page_id);

-- Auto-update update_count on baby_pages
CREATE OR REPLACE FUNCTION update_baby_update_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE baby_pages SET update_count = update_count + 1, updated_at = now()
    WHERE id = NEW.baby_page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE baby_pages SET update_count = GREATEST(0, update_count - 1), updated_at = now()
    WHERE id = OLD.baby_page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_update_count
  AFTER INSERT OR DELETE ON baby_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_update_count();

-- ────────────────────────────────────────────────────────────
-- 4. STAGE AUTO-PROGRESSION — update current_stage based on age
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_baby_stage()
RETURNS TRIGGER AS $$
DECLARE
  dob date;
  age_days integer;
  new_stage text;
BEGIN
  SELECT date_of_birth INTO dob FROM baby_pages WHERE id = NEW.baby_page_id;

  IF dob IS NULL THEN
    RETURN NEW;
  END IF;

  age_days := CURRENT_DATE - dob;

  IF age_days < 0 THEN
    new_stage := 'expecting';
  ELSIF age_days <= 28 THEN
    new_stage := 'newborn';
  ELSIF age_days <= 365 THEN
    new_stage := 'infant';
  ELSIF age_days <= 1095 THEN  -- 3 years
    new_stage := 'toddler';
  ELSIF age_days <= 1825 THEN  -- 5 years
    new_stage := 'preschool';
  ELSIF age_days <= 4015 THEN  -- 11 years
    new_stage := 'elementary';
  ELSIF age_days <= 4745 THEN  -- 13 years
    new_stage := 'tween';
  ELSIF age_days <= 6570 THEN  -- 18 years
    new_stage := 'teenager';
  ELSIF age_days <= 9125 THEN  -- 25 years
    new_stage := 'young_adult';
  ELSE
    new_stage := 'adult';
  END IF;

  UPDATE baby_pages SET current_stage = new_stage, updated_at = now()
  WHERE id = NEW.baby_page_id AND current_stage != new_stage;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_stage_update
  AFTER INSERT ON baby_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_stage();

-- ────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE baby_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_updates ENABLE ROW LEVEL SECURITY;

-- baby_pages: public pages visible to all, private/family only to hosts
DO $safe$ BEGIN
CREATE POLICY "baby_pages_select" ON baby_pages
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_pages.id
        AND user_id = auth.uid() AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_pages_insert" ON baby_pages
  FOR INSERT WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_pages_update" ON baby_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_pages.id
        AND user_id = auth.uid() AND role IN ('owner', 'co_host') AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_pages_delete" ON baby_pages
  FOR DELETE USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- baby_milestones: visible if parent page is visible
DO $safe$ BEGIN
CREATE POLICY "baby_milestones_select" ON baby_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM baby_pages bp
      WHERE bp.id = baby_milestones.baby_page_id
        AND (
          bp.privacy = 'public'
          OR bp.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM page_hosts
            WHERE page_type = 'baby' AND page_id = bp.id
              AND user_id = auth.uid() AND status = 'active'
          )
        )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_milestones_insert" ON baby_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_milestones.baby_page_id
        AND user_id = auth.uid() AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_milestones_update" ON baby_milestones
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_milestones.baby_page_id
        AND user_id = auth.uid() AND role IN ('owner', 'co_host') AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_milestones_delete" ON baby_milestones
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_milestones.baby_page_id
        AND user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- baby_updates: same pattern
DO $safe$ BEGIN
CREATE POLICY "baby_updates_select" ON baby_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM baby_pages bp
      WHERE bp.id = baby_updates.baby_page_id
        AND (
          bp.privacy = 'public'
          OR bp.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM page_hosts
            WHERE page_type = 'baby' AND page_id = bp.id
              AND user_id = auth.uid() AND status = 'active'
          )
        )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_updates_insert" ON baby_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_updates.baby_page_id
        AND user_id = auth.uid() AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "baby_updates_delete" ON baby_updates
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_updates.baby_page_id
        AND user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- === 00046_relationship_lifecycle.sql ===
-- ============================================================
-- Migration 00046: Relationship Lifecycle
-- Tracks relationship transitions (marriage, divorce, remarriage)
-- in The Arc timeline. Adds chapter linking for wedding pages
-- and status tracking for family tree connections.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ALTER family_tree_connections — add status tracking
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'
    CHECK (status IN ('active', 'separated', 'divorced', 'widowed', 'annulled', 'reconciled', 'ended'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN IF NOT EXISTS status_date date;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN IF NOT EXISTS status_note text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN IF NOT EXISTS is_current boolean DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 2. ALTER wedding_pages — add relationship lifecycle fields
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN IF NOT EXISTS chapter integer DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN IF NOT EXISTS relationship_status text DEFAULT 'active'
    CHECK (relationship_status IN ('engaged', 'married', 'separated', 'divorced', 'widowed', 'renewed', 'other'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN IF NOT EXISTS previous_page_id uuid REFERENCES wedding_pages(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN IF NOT EXISTS next_page_id uuid REFERENCES wedding_pages(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 3. RELATIONSHIP EVENTS — significant transitions
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS relationship_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id    uuid REFERENCES family_tree_connections(id) ON DELETE SET NULL,
  wedding_page_id  uuid REFERENCES wedding_pages(id) ON DELETE SET NULL,
  event_type       text NOT NULL CHECK (event_type IN (
    'engagement', 'wedding', 'anniversary', 'separation', 'divorce',
    'reconciliation', 'remarriage', 'vow_renewal', 'civil_union',
    'widowed', 'custody_arrangement'
  )),
  event_date       date NOT NULL,
  title            text NOT NULL,
  description      text,
  is_private       boolean DEFAULT true,  -- Sensitive events default to private
  media_urls       text[] DEFAULT '{}',
  emotional_tag    text CHECK (emotional_tag IN (
    'joyful', 'bittersweet', 'difficult', 'hopeful', 'peaceful', 'grateful'
  )),
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationship_events_user ON relationship_events(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_events_wedding ON relationship_events(wedding_page_id);
CREATE INDEX IF NOT EXISTS idx_relationship_events_connection ON relationship_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_relationship_events_date ON relationship_events(user_id, event_date);

-- ────────────────────────────────────────────────────────────
-- 4. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE relationship_events ENABLE ROW LEVEL SECURITY;

-- Owner always sees their own events
DO $safe$ BEGIN
CREATE POLICY "relationship_events_select_own" ON relationship_events
  FOR SELECT USING (
    user_id = auth.uid()
    OR (is_private = false)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "relationship_events_insert" ON relationship_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "relationship_events_update" ON relationship_events
  FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "relationship_events_delete" ON relationship_events
  FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ────────────────────────────────────────────────────────────
-- 5. AUTO-GENERATE TIMELINE EVENT on relationship event creation
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_timeline_from_relationship_event()
RETURNS TRIGGER AS $$
DECLARE
  event_icon text;
  event_color text;
BEGIN
  -- Map event types to icons and colors
  CASE NEW.event_type
    WHEN 'engagement' THEN event_icon := '💍'; event_color := '#EC4899';
    WHEN 'wedding' THEN event_icon := '💒'; event_color := '#F59E0B';
    WHEN 'anniversary' THEN event_icon := '🥂'; event_color := '#D97706';
    WHEN 'separation' THEN event_icon := '💔'; event_color := '#6B7280';
    WHEN 'divorce' THEN event_icon := '📄'; event_color := '#6B7280';
    WHEN 'reconciliation' THEN event_icon := '🤝'; event_color := '#10B981';
    WHEN 'remarriage' THEN event_icon := '💒'; event_color := '#7C3AED';
    WHEN 'vow_renewal' THEN event_icon := '💕'; event_color := '#EC4899';
    WHEN 'civil_union' THEN event_icon := '🤝'; event_color := '#3B82F6';
    WHEN 'widowed' THEN event_icon := '🕊️'; event_color := '#6B7280';
    WHEN 'custody_arrangement' THEN event_icon := '👨‍👩‍👧'; event_color := '#8B5CF6';
    ELSE event_icon := '❤️'; event_color := '#EC4899';
  END CASE;

  -- Only create timeline events for non-private relationship events
  IF NEW.is_private = false THEN
    -- Find a memorial linked to this user to attach the timeline event
    INSERT INTO life_timeline_events (
      memorial_id, created_by, event_type, source_type, source_id,
      title, description, event_date, icon, color, is_private, is_highlight
    )
    SELECT
      m.id, NEW.user_id, 'relationship', 'manual', NEW.id::text,
      NEW.title, NEW.description, NEW.event_date::timestamptz,
      event_icon, event_color, NEW.is_private, true
    FROM memorials m
    WHERE m.created_by = NEW.user_id
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_relationship_timeline
  AFTER INSERT ON relationship_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_timeline_from_relationship_event();

-- === 00047_fix_handle_new_user.sql ===
-- Fix handle_new_user trigger to handle conflicts gracefully
-- Previously: bare INSERT would fail if username already existed (e.g. partial signup retries)
-- Now: ON CONFLICT (id) DO UPDATE ensures idempotency; username gets a random suffix on conflict

create or replace function public.handle_new_user()
returns trigger as $$
declare
  desired_username text;
  final_username text;
begin
  desired_username := coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8));

  -- Check if username is taken by another user
  if exists (select 1 from public.profiles where username = desired_username and id != new.id) then
    final_username := desired_username || '_' || substr(md5(new.id::text || now()::text), 1, 6);
  else
    final_username := desired_username;
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();

  -- Grant signup bonus ribbons (only if no prior transaction for this user)
  insert into public.ribbon_transactions (user_id, amount, type, description, balance_after)
  select new.id, 100, 'signup_bonus', 'Welcome to eterrn!', 100
  where not exists (
    select 1 from public.ribbon_transactions
    where user_id = new.id and type = 'signup_bonus'
  );

  return new;
end;
$$ language plpgsql security definer;

