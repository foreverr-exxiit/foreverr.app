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
