-- PART 3 of 3: Migrations 00028-00034
-- Premium, timeline, search, celebrity seeds, proximity, roles, enrich

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
