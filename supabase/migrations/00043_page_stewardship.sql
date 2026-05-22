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

CREATE POLICY "page_transfers_select" ON page_transfers
  FOR SELECT USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR initiated_by = auth.uid()
    OR admin_reviewer_id = auth.uid()
  );

CREATE POLICY "page_transfers_insert" ON page_transfers
  FOR INSERT WITH CHECK (
    initiated_by = auth.uid()
  );

CREATE POLICY "page_transfers_update" ON page_transfers
  FOR UPDATE USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR initiated_by = auth.uid()
    OR admin_reviewer_id = auth.uid()
  );

-- transfer_messages
ALTER TABLE transfer_messages ENABLE ROW LEVEL SECURITY;

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

-- stewardship_scores: public read
ALTER TABLE stewardship_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stewardship_scores_select" ON stewardship_scores
  FOR SELECT USING (true);

-- page_valuations: public read
ALTER TABLE page_valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_valuations_select" ON page_valuations
  FOR SELECT USING (true);

-- transfer_history: public read
ALTER TABLE transfer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfer_history_select" ON transfer_history
  FOR SELECT USING (true);

-- guardian_subscriptions: own data only
ALTER TABLE guardian_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guardian_subscriptions_select" ON guardian_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "guardian_subscriptions_update" ON guardian_subscriptions
  FOR UPDATE USING (user_id = auth.uid());


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
