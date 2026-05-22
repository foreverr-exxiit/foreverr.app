-- ============================================================
-- Migration 00040: Creator Economy System
-- Enables users to earn money by honoring people they love
-- ============================================================

-- ── 1. Creator Profiles ─────────────────────────────────────
-- Extends the existing seller_profiles concept with creator-specific fields
CREATE TABLE IF NOT EXISTS creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Creator identity
  display_name text NOT NULL DEFAULT '',
  tagline text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text,
  cover_image_url text,
  portfolio_urls text[] DEFAULT '{}',
  -- Specialties
  specialties text[] DEFAULT '{}', -- e.g. ['tribute_writing', 'memorial_design', 'life_storytelling', 'memorial_art', 'event_hosting']
  -- Creator tier (earned through consistent quality)
  tier text NOT NULL DEFAULT 'rising' CHECK (tier IN ('rising', 'bronze', 'silver', 'gold', 'platinum', 'legend')),
  tier_points integer NOT NULL DEFAULT 0,
  -- Earnings
  total_earned_cents bigint NOT NULL DEFAULT 0,
  pending_balance_cents bigint NOT NULL DEFAULT 0,
  lifetime_orders integer NOT NULL DEFAULT 0,
  -- Stripe Connect
  stripe_connect_id text,
  stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  -- Verification & status
  is_verified boolean NOT NULL DEFAULT false,
  is_accepting_orders boolean NOT NULL DEFAULT true,
  application_status text NOT NULL DEFAULT 'approved' CHECK (application_status IN ('pending', 'approved', 'rejected', 'suspended')),
  -- Stats
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  response_time_hours integer DEFAULT 24,
  completion_rate numeric(5,2) DEFAULT 100.0,
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ── 2. Creator Tiers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  min_points integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT '⭐',
  color text NOT NULL DEFAULT '#9ca3af',
  platform_fee_pct numeric(4,2) NOT NULL DEFAULT 15.0, -- lower fee = reward for higher tier
  perks text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO creator_tiers (id, name, min_points, icon, color, platform_fee_pct, perks, sort_order) VALUES
  ('rising',   'Rising Creator',    0,    '🌱', '#9ca3af', 20.0, ARRAY['Basic profile', 'Accept service orders', 'Standard payouts'], 1),
  ('bronze',   'Bronze Creator',    100,  '🥉', '#cd7f32', 18.0, ARRAY['Bronze badge', 'Priority in search', 'Featured on category pages'], 2),
  ('silver',   'Silver Creator',    500,  '🥈', '#c0c0c0', 15.0, ARRAY['Silver badge', 'Lower platform fee', 'Analytics dashboard', 'Bulk messaging'], 3),
  ('gold',     'Gold Creator',      2000, '🥇', '#ffd700', 12.0, ARRAY['Gold badge', 'Premium placement', 'Custom portfolio URL', 'Priority support'], 4),
  ('platinum', 'Platinum Creator',  5000, '💎', '#e5e4e2', 10.0, ARRAY['Platinum badge', 'Lowest fee tier', 'Invite-only events', 'Revenue sharing'], 5),
  ('legend',   'Legend Creator',    15000,'👑', '#ff6b35', 8.0,  ARRAY['Legend badge', 'Custom branding', 'Mentorship program', 'Advisory board'], 6)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Service Listings ─────────────────────────────────────
-- Services creators offer (distinct from physical marketplace items)
CREATE TABLE IF NOT EXISTS service_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  -- Service details
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN (
    'tribute_writing', 'memorial_design', 'life_storytelling',
    'memorial_art', 'event_hosting', 'grief_support',
    'photo_restoration', 'video_memorial', 'eulogy_writing',
    'family_tree', 'digital_archival', 'celebration_planning',
    'legacy_coaching', 'other'
  )),
  -- Pricing
  pricing_type text NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'hourly', 'package', 'custom')),
  price_cents integer NOT NULL DEFAULT 0,
  -- Packages (for multi-tier pricing)
  packages jsonb DEFAULT '[]', -- [{name, description, price_cents, delivery_days, features: []}]
  -- Media
  cover_image_url text,
  sample_images text[] DEFAULT '{}',
  -- Delivery
  delivery_days integer DEFAULT 7,
  max_revisions integer DEFAULT 2,
  -- Status
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  -- Stats
  order_count integer NOT NULL DEFAULT 0,
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  -- Metadata
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 4. Service Orders ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Parties
  service_id uuid NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Order details
  title text NOT NULL,
  description text DEFAULT '',
  package_name text, -- which package was selected
  -- Pricing
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  creator_payout_cents integer NOT NULL DEFAULT 0,
  -- Payment
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'disputed')),
  stripe_payment_intent_id text,
  -- Fulfillment
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'in_progress', 'delivered',
    'revision_requested', 'completed', 'cancelled', 'disputed'
  )),
  delivery_deadline timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  -- Deliverables
  deliverables jsonb DEFAULT '[]', -- [{type, url, description}]
  -- Communication
  messages_count integer NOT NULL DEFAULT 0,
  -- Review
  buyer_rating integer CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  buyer_review text,
  -- Context (optional link to memorial)
  memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 5. Order Messages ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachments text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 6. Creator Earnings ─────────────────────────────────────
-- Every earning event is logged here
CREATE TABLE IF NOT EXISTS creator_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  -- Earning details
  type text NOT NULL CHECK (type IN (
    'service_order',     -- paid for a service
    'tip',               -- direct tip/gift from visitor
    'fundraiser_fee',    -- organizer fee from fundraiser
    'tribute_gift',      -- gift on their tribute content
    'template_sale',     -- sold a memorial template
    'event_ticket',      -- ticketed event income
    'referral_bonus',    -- referred a new creator
    'bonus'              -- platform bonus/promotion
  )),
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  net_amount_cents integer NOT NULL, -- what creator actually gets
  -- Reference
  reference_type text, -- 'service_order', 'gift_transaction', 'fundraising_campaign', etc.
  reference_id uuid,
  description text DEFAULT '',
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'paid_out', 'reversed')),
  clears_at timestamptz DEFAULT (now() + interval '7 days'), -- 7-day hold
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 7. Creator Payouts ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  -- Payout details
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  -- Stripe
  stripe_transfer_id text,
  stripe_payout_id text,
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  failure_reason text,
  -- Metadata
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz
);

-- ── 8. Honor Fundraisers ────────────────────────────────────
-- Enhanced fundraiser that allows organizer to earn a fee
CREATE TABLE IF NOT EXISTS honor_fundraisers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who created it
  creator_id uuid REFERENCES creator_profiles(id) ON DELETE SET NULL,
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Who is being honored
  honoree_name text NOT NULL,
  honoree_image_url text,
  memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  -- Fundraiser details
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  story text DEFAULT '', -- longer narrative
  cover_image_url text,
  images text[] DEFAULT '{}',
  -- Goal & progress
  goal_cents integer NOT NULL DEFAULT 0,
  raised_cents integer NOT NULL DEFAULT 0,
  donor_count integer NOT NULL DEFAULT 0,
  -- Beneficiary
  beneficiary_name text NOT NULL DEFAULT '',
  beneficiary_type text NOT NULL DEFAULT 'family' CHECK (beneficiary_type IN (
    'family', 'charity', 'scholarship', 'funeral_costs',
    'medical', 'education', 'community', 'other'
  )),
  beneficiary_url text, -- link to charity/org
  -- Organizer fee
  organizer_fee_pct numeric(4,2) NOT NULL DEFAULT 0, -- 0-15% organizer fee
  organizer_earned_cents integer NOT NULL DEFAULT 0,
  -- Status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  is_featured boolean NOT NULL DEFAULT false,
  end_date timestamptz,
  -- Sharing & engagement
  share_count integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 9. Honor Fundraiser Donations ───────────────────────────
CREATE TABLE IF NOT EXISTS honor_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id uuid NOT NULL REFERENCES honor_fundraisers(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  -- Amount
  amount_cents integer NOT NULL,
  organizer_fee_cents integer NOT NULL DEFAULT 0,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  net_to_beneficiary_cents integer NOT NULL,
  -- Payment
  stripe_payment_intent_id text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  -- Details
  donor_name text DEFAULT 'Anonymous',
  message text DEFAULT '',
  is_anonymous boolean NOT NULL DEFAULT false,
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 10. Creator Reviews ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES service_orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id, reviewer_id)
);

-- ── 11. Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_tier ON creator_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_specialties ON creator_profiles USING gin(specialties);
CREATE INDEX IF NOT EXISTS idx_service_listings_creator ON service_listings(creator_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_category ON service_listings(category);
CREATE INDEX IF NOT EXISTS idx_service_listings_active ON service_listings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_orders_creator ON service_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_buyer ON service_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_status ON creator_earnings(status);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_honor_fundraisers_organizer ON honor_fundraisers(organizer_id);
CREATE INDEX IF NOT EXISTS idx_honor_fundraisers_status ON honor_fundraisers(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_honor_donations_fundraiser ON honor_donations(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_creator ON creator_reviews(creator_id);
CREATE INDEX IF NOT EXISTS idx_service_order_messages_order ON service_order_messages(order_id);

-- Full-text search on service listings
CREATE INDEX IF NOT EXISTS idx_service_listings_search ON service_listings USING gin(
  (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')))
);

-- ── 12. RLS Policies ────────────────────────────────────────
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tiers ENABLE ROW LEVEL SECURITY;

-- Creator profiles: public read, own write
CREATE POLICY "creator_profiles_read" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "creator_profiles_insert" ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "creator_profiles_update" ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Service listings: public read, creator write
CREATE POLICY "service_listings_read" ON service_listings FOR SELECT USING (true);
CREATE POLICY "service_listings_insert" ON service_listings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);
CREATE POLICY "service_listings_update" ON service_listings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);

-- Service orders: buyer and creator can read their own
CREATE POLICY "service_orders_read" ON service_orders FOR SELECT USING (
  buyer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);
CREATE POLICY "service_orders_insert" ON service_orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "service_orders_update" ON service_orders FOR UPDATE USING (
  buyer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);

-- Order messages: participants only
CREATE POLICY "order_messages_read" ON service_order_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM service_orders
    WHERE id = order_id AND (
      buyer_id = auth.uid() OR
      EXISTS (SELECT 1 FROM creator_profiles WHERE id = service_orders.creator_id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "order_messages_insert" ON service_order_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Creator earnings: own only
CREATE POLICY "creator_earnings_read" ON creator_earnings FOR SELECT USING (
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);

-- Creator payouts: own only
CREATE POLICY "creator_payouts_read" ON creator_payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);
CREATE POLICY "creator_payouts_insert" ON creator_payouts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);

-- Honor fundraisers: public read, organizer write
CREATE POLICY "honor_fundraisers_read" ON honor_fundraisers FOR SELECT USING (true);
CREATE POLICY "honor_fundraisers_insert" ON honor_fundraisers FOR INSERT WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "honor_fundraisers_update" ON honor_fundraisers FOR UPDATE USING (organizer_id = auth.uid());

-- Honor donations: public read for non-anonymous, donor can see own
CREATE POLICY "honor_donations_read" ON honor_donations FOR SELECT USING (true);
CREATE POLICY "honor_donations_insert" ON honor_donations FOR INSERT WITH CHECK (donor_id = auth.uid() OR donor_id IS NULL);

-- Creator reviews: public read, reviewer write
CREATE POLICY "creator_reviews_read" ON creator_reviews FOR SELECT USING (true);
CREATE POLICY "creator_reviews_insert" ON creator_reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Creator tiers: public read
CREATE POLICY "creator_tiers_read" ON creator_tiers FOR SELECT USING (true);

-- ── 13. Triggers ────────────────────────────────────────────

-- Auto-update creator rating when review is created
CREATE OR REPLACE FUNCTION update_creator_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creator_profiles SET
    rating_avg = (SELECT AVG(rating)::numeric(3,2) FROM creator_reviews WHERE creator_id = NEW.creator_id),
    rating_count = (SELECT COUNT(*) FROM creator_reviews WHERE creator_id = NEW.creator_id),
    updated_at = now()
  WHERE id = NEW.creator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_creator_review_rating ON creator_reviews;
CREATE TRIGGER trg_creator_review_rating
  AFTER INSERT OR UPDATE ON creator_reviews
  FOR EACH ROW EXECUTE FUNCTION update_creator_rating();

-- Auto-update service listing stats on order completion
CREATE OR REPLACE FUNCTION update_service_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE service_listings SET
      order_count = order_count + 1,
      updated_at = now()
    WHERE id = NEW.service_id;
    UPDATE creator_profiles SET
      lifetime_orders = lifetime_orders + 1,
      updated_at = now()
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_service_order_complete ON service_orders;
CREATE TRIGGER trg_service_order_complete
  AFTER UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_service_on_order();

-- Auto-update honor fundraiser on donation
CREATE OR REPLACE FUNCTION update_honor_fundraiser_on_donation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' THEN
    UPDATE honor_fundraisers SET
      raised_cents = raised_cents + NEW.amount_cents,
      donor_count = donor_count + 1,
      organizer_earned_cents = organizer_earned_cents + NEW.organizer_fee_cents,
      updated_at = now()
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_honor_donation ON honor_donations;
CREATE TRIGGER trg_honor_donation
  AFTER INSERT ON honor_donations
  FOR EACH ROW EXECUTE FUNCTION update_honor_fundraiser_on_donation();

-- Auto-update creator earnings balance
CREATE OR REPLACE FUNCTION update_creator_earnings_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cleared' AND (OLD IS NULL OR OLD.status != 'cleared') THEN
    UPDATE creator_profiles SET
      pending_balance_cents = pending_balance_cents + NEW.net_amount_cents,
      total_earned_cents = total_earned_cents + NEW.net_amount_cents,
      updated_at = now()
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_creator_earning_clear ON creator_earnings;
CREATE TRIGGER trg_creator_earning_clear
  AFTER INSERT OR UPDATE ON creator_earnings
  FOR EACH ROW EXECUTE FUNCTION update_creator_earnings_balance();

-- ── 14. Tier auto-upgrade function ──────────────────────────
CREATE OR REPLACE FUNCTION check_creator_tier_upgrade(p_creator_id uuid)
RETURNS text AS $$
DECLARE
  v_points integer;
  v_new_tier text;
BEGIN
  SELECT tier_points INTO v_points FROM creator_profiles WHERE id = p_creator_id;

  SELECT id INTO v_new_tier FROM creator_tiers
  WHERE min_points <= v_points
  ORDER BY min_points DESC
  LIMIT 1;

  UPDATE creator_profiles SET tier = v_new_tier, updated_at = now()
  WHERE id = p_creator_id AND tier != v_new_tier;

  RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
