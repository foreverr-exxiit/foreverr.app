-- =============================================
-- Security audit patches (2026-06)
-- Fixes from full-project audit:
-- 1. record_gift_to_wall() now requires auth.uid() (was anonymous-callable)
-- 2. increment_fundraiser_donation() now requires auth.uid()
-- 3. delete_my_account() also anonymizes geolocation columns
--    (city, region, country, latitude, longitude added in 00032)
--
-- Note: (1) and (2) only block *anonymous* abuse. Any authenticated
-- user can still call them with arbitrary arguments — the deeper fix
-- is to move both to server-side triggers/webhooks. Tracked as
-- follow-up; this migration closes the worst hole (anonymous abuse).
-- =============================================

-- 1. record_gift_to_wall — add auth.uid() guard
CREATE OR REPLACE FUNCTION public.record_gift_to_wall(
  p_target_type text,
  p_target_id uuid,
  p_category text,
  p_quantity integer DEFAULT 1,
  p_amount_cents integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

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
    total_flowers     = flower_walls.total_flowers     + CASE WHEN p_category = 'flowers' THEN p_quantity ELSE 0 END,
    total_candles     = flower_walls.total_candles     + CASE WHEN p_category = 'candles' THEN p_quantity ELSE 0 END,
    total_gifts       = flower_walls.total_gifts       + p_quantity,
    total_amount_cents = flower_walls.total_amount_cents + COALESCE(p_amount_cents, 0),
    last_gift_at      = now(),
    updated_at        = now();
END;
$$;

-- 2. increment_fundraiser_donation — add auth.uid() guard
CREATE OR REPLACE FUNCTION public.increment_fundraiser_donation(
  p_fundraiser_id uuid,
  p_amount_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be positive';
  END IF;

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

GRANT EXECUTE ON FUNCTION public.increment_fundraiser_donation(uuid, integer) TO authenticated;

-- 3. delete_my_account — extend to also clear geo PII added in 00032.
--    Idempotent: profiles.* columns are nullable; setting NULL is safe
--    to re-run on already-deleted accounts.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tombstone_username text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  v_tombstone_username := 'deleted_' || replace(v_uid::text, '-', '');

  UPDATE public.profiles
  SET
    username      = v_tombstone_username,
    display_name  = 'Deleted user',
    avatar_url    = NULL,
    bio           = NULL,
    notification_preferences = '{}'::jsonb,
    -- Geo PII added in 00032_proximity_support — also clear
    city          = NULL,
    region        = NULL,
    country       = NULL,
    latitude      = NULL,
    longitude     = NULL,
    deleted_at    = now(),
    updated_at    = now()
  WHERE id = v_uid;

  -- Mark any active subscriptions to cancel at period end (idempotent
  -- via EXCEPTION block; matches the pattern from 00048).
  BEGIN
    UPDATE public.user_subscriptions
    SET
      cancel_at_period_end = true,
      cancelled_at         = COALESCE(cancelled_at, now()),
      updated_at           = now()
    WHERE user_id = v_uid
      AND status IN ('active', 'trialing', 'past_due');
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Lock the auth row so the user can't sign back in.
  UPDATE auth.users
  SET
    email              = NULL,
    phone              = NULL,
    encrypted_password = NULL,
    raw_user_meta_data = '{}'::jsonb,
    banned_until       = 'infinity'::timestamptz
  WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
