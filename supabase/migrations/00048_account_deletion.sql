-- =============================================
-- Account deletion (soft / anonymize)
-- Apple App Store 5.1.1(v) + Google Play + GDPR right-to-erasure
-- Memorial content authored by the user is preserved (other users depend on it);
-- the user's PII is wiped and their account is locked out.
-- =============================================

-- 1. deleted_at column on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- 2. Exclude deleted profiles from public reads.
--    Replace the existing "Public profiles are viewable by everyone" policy
--    with one that filters out tombstoned rows (owner can still see their own).
DO $safe$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
EXCEPTION WHEN others THEN NULL; END $safe$;

DO $safe$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (deleted_at IS NULL OR auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $safe$;

-- 3. RPC: delete_my_account()
--    Caller-authenticated only (auth.uid()); SECURITY DEFINER so it can
--    bypass RLS for the anonymize UPDATE. Returns void on success.
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

  -- Username must remain unique + not null; replace with an opaque tombstone.
  v_tombstone_username := 'deleted_' || replace(v_uid::text, '-', '');

  UPDATE public.profiles
  SET
    username      = v_tombstone_username,
    display_name  = 'Deleted user',
    avatar_url    = NULL,
    bio           = NULL,
    notification_preferences = '{}'::jsonb,
    deleted_at    = now(),
    updated_at    = now()
  WHERE id = v_uid;

  -- Lock the auth row so the user can't sign back in (email/password).
  -- For anonymous demo users this also prevents re-use of the session.
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
