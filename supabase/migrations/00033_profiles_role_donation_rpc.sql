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
