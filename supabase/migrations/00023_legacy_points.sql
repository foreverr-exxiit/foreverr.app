-- ============================================================
-- 00023_legacy_points.sql
-- Legacy Points & Reward System
-- ============================================================

-- ============================================================
-- 1. Legacy Levels (catalog — created first for FK reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_levels (
  id integer PRIMARY KEY,
  level_name text NOT NULL,
  min_points integer NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  perks text[]
);

-- ============================================================
-- 2. Legacy Point Balances
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_point_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  current_balance integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  level_name text NOT NULL DEFAULT 'Seedling',
  next_level_at integer NOT NULL DEFAULT 100,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_point_balances_user ON public.legacy_point_balances(user_id);

-- ============================================================
-- 3. Legacy Points (individual point transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  action_type text NOT NULL CHECK (action_type IN (
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
    'referral_signup'
  )),
  reference_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_points_user ON public.legacy_points(user_id, created_at DESC);

-- ============================================================
-- 4. Point Redemptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.point_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  redemption_type text NOT NULL CHECK (redemption_type IN (
    'gift_purchase',
    'premium_feature',
    'donation_boost',
    'custom_theme'
  )),
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. Trigger: Auto-update balances on points earned
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_legacy_points_insert()
RETURNS TRIGGER AS $$
DECLARE
  _balance_row public.legacy_point_balances%ROWTYPE;
  _new_total integer;
  _new_level integer;
  _level_row public.legacy_levels%ROWTYPE;
  _next_level public.legacy_levels%ROWTYPE;
BEGIN
  -- Upsert the balance row
  INSERT INTO public.legacy_point_balances (user_id, total_earned, current_balance, level, level_name, next_level_at)
  VALUES (NEW.user_id, NEW.points, NEW.points, 1, 'Seedling', 100)
  ON CONFLICT (user_id) DO UPDATE SET
    total_earned = public.legacy_point_balances.total_earned + NEW.points,
    current_balance = public.legacy_point_balances.current_balance + NEW.points,
    updated_at = now()
  RETURNING * INTO _balance_row;

  _new_total := _balance_row.total_earned;

  -- Determine current level based on total earned
  SELECT * INTO _level_row
  FROM public.legacy_levels
  WHERE min_points <= _new_total
  ORDER BY min_points DESC
  LIMIT 1;

  IF _level_row IS NOT NULL THEN
    _new_level := _level_row.id;

    -- Determine next level threshold
    SELECT * INTO _next_level
    FROM public.legacy_levels
    WHERE id = _level_row.id + 1;

    UPDATE public.legacy_point_balances SET
      level = _level_row.id,
      level_name = _level_row.level_name,
      next_level_at = COALESCE(_next_level.min_points, _level_row.min_points),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_legacy_points_insert ON public.legacy_points;
CREATE TRIGGER trg_legacy_points_insert
  AFTER INSERT ON public.legacy_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_legacy_points_insert();

-- ============================================================
-- 6. Trigger: Auto-update balances on point redemption
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_point_redemption_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.legacy_point_balances SET
    total_spent = total_spent + NEW.points_spent,
    current_balance = GREATEST(current_balance - NEW.points_spent, 0),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_point_redemption_insert ON public.point_redemptions;
CREATE TRIGGER trg_point_redemption_insert
  AFTER INSERT ON public.point_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_point_redemption_insert();

-- ============================================================
-- 7. RLS Policies
-- ============================================================

-- legacy_points
ALTER TABLE public.legacy_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.legacy_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert points"
  ON public.legacy_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- legacy_point_balances
ALTER TABLE public.legacy_point_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view point balances"
  ON public.legacy_point_balances FOR SELECT
  USING (true);

CREATE POLICY "Users can update own balance"
  ON public.legacy_point_balances FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert balances"
  ON public.legacy_point_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- legacy_levels
ALTER TABLE public.legacy_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view levels"
  ON public.legacy_levels FOR SELECT
  USING (true);

-- point_redemptions
ALTER TABLE public.point_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.point_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON public.point_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. Seed Legacy Levels
-- ============================================================
INSERT INTO public.legacy_levels (id, level_name, min_points, icon, color, perks) VALUES
  (1, 'Seedling',   0,     'leaf',     '#22C55E', ARRAY['Basic access']),
  (2, 'Sprout',     100,   'leaf',     '#16A34A', ARRAY['Custom themes']),
  (3, 'Bloom',      500,   'flower',   '#A855F7', ARRAY['Premium gifts']),
  (4, 'Tree',       2000,  'tree',     '#059669', ARRAY['Badge showcase']),
  (5, 'Grove',      5000,  'forest',   '#0D9488', ARRAY['Profile highlight']),
  (6, 'Forest',     15000, 'mountain', '#1D4ED8', ARRAY['Legacy builder badge']),
  (7, 'Eternal',    50000, 'star',     '#F59E0B', ARRAY['Legendary status'])
ON CONFLICT (id) DO NOTHING;
