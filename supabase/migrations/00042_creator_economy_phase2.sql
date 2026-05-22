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
CREATE POLICY "tickets_own" ON event_tickets FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "tickets_insert" ON event_tickets FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "tickets_event_owner" ON event_tickets FOR SELECT USING (
  event_id IN (SELECT id FROM events WHERE created_by = auth.uid())
);

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
CREATE POLICY "honor_day_public_read" ON honor_day_sponsorships FOR SELECT USING (is_active = true);
CREATE POLICY "honor_day_insert" ON honor_day_sponsorships FOR INSERT WITH CHECK (sponsor_id = auth.uid());
CREATE POLICY "honor_day_own" ON honor_day_sponsorships FOR SELECT USING (sponsor_id = auth.uid());

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
CREATE POLICY "vault_pres_own" ON vault_preservation_orders FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "vault_pres_insert" ON vault_preservation_orders FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "vault_pres_creator" ON vault_preservation_orders FOR SELECT USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
);

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

CREATE POLICY "licenses_public_read" ON content_licenses FOR SELECT USING (is_active = true);
CREATE POLICY "licenses_creator_all" ON content_licenses FOR ALL USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "license_purchases_own" ON content_license_purchases FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "license_purchases_insert" ON content_license_purchases FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "license_purchases_creator" ON content_license_purchases FOR SELECT USING (
  license_id IN (
    SELECT id FROM content_licenses WHERE creator_id IN (
      SELECT id FROM creator_profiles WHERE user_id = auth.uid()
    )
  )
);

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
CREATE POLICY "channel_subs_own" ON channel_subscriptions FOR SELECT USING (subscriber_id = auth.uid());
CREATE POLICY "channel_subs_insert" ON channel_subscriptions FOR INSERT WITH CHECK (subscriber_id = auth.uid());
