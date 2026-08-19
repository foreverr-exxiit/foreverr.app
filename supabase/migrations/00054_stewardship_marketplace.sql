-- =============================================
-- Stewardship marketplace
-- Completes the page-stewardship feature: lets a page owner list a page
-- for a trusted steward (or sale), and lets others apply. The hooks in
-- useStewardship.ts (useStewardshipListings / useCreateStewardshipListing
-- / useApplyForStewardship) were stubbed pending these tables.
-- =============================================

-- 1. Listings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stewardship_listings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type          text NOT NULL,               -- memorial / wedding / pet / …
  page_id            uuid NOT NULL,
  listed_by          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title              text NOT NULL,
  description        text,
  listing_type       text NOT NULL DEFAULT 'stewardship'
                     CHECK (listing_type IN ('stewardship', 'purchase', 'both')),
  asking_price_cents integer DEFAULT 0,
  stewardship_terms  jsonb DEFAULT '{}'::jsonb,
  status             text NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'paused', 'fulfilled', 'cancelled')),
  view_count         integer DEFAULT 0,
  application_count  integer DEFAULT 0,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stewardship_listings_status
  ON public.stewardship_listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stewardship_listings_page_type
  ON public.stewardship_listings (page_type);
CREATE INDEX IF NOT EXISTS idx_stewardship_listings_listed_by
  ON public.stewardship_listings (listed_by);

-- 2. Applications ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stewardship_applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     uuid NOT NULL REFERENCES public.stewardship_listings(id) ON DELETE CASCADE,
  applicant_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message        text,
  proposed_terms jsonb DEFAULT '{}'::jsonb,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (listing_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_stewardship_applications_listing
  ON public.stewardship_applications (listing_id);
CREATE INDEX IF NOT EXISTS idx_stewardship_applications_applicant
  ON public.stewardship_applications (applicant_id);

-- Keep listing.application_count in sync.
CREATE OR REPLACE FUNCTION public.bump_stewardship_application_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stewardship_listings
      SET application_count = application_count + 1, updated_at = now()
      WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stewardship_listings
      SET application_count = GREATEST(0, application_count - 1), updated_at = now()
      WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_stewardship_application_count ON public.stewardship_applications;
CREATE TRIGGER trg_stewardship_application_count
  AFTER INSERT OR DELETE ON public.stewardship_applications
  FOR EACH ROW EXECUTE FUNCTION public.bump_stewardship_application_count();

-- 3. RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.stewardship_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_applications ENABLE ROW LEVEL SECURITY;

-- Listings: anyone can read; only the lister can write.
DO $p$ BEGIN
  CREATE POLICY "stewardship_listings_select" ON public.stewardship_listings
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "stewardship_listings_insert" ON public.stewardship_listings
    FOR INSERT WITH CHECK (auth.uid() = listed_by);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "stewardship_listings_update" ON public.stewardship_listings
    FOR UPDATE USING (auth.uid() = listed_by);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "stewardship_listings_delete" ON public.stewardship_listings
    FOR DELETE USING (auth.uid() = listed_by);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;

-- Applications: applicant and the listing owner can read; applicant writes.
DO $p$ BEGIN
  CREATE POLICY "stewardship_applications_select" ON public.stewardship_applications
    FOR SELECT USING (
      auth.uid() = applicant_id
      OR EXISTS (
        SELECT 1 FROM public.stewardship_listings l
        WHERE l.id = listing_id AND l.listed_by = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "stewardship_applications_insert" ON public.stewardship_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "stewardship_applications_update" ON public.stewardship_applications
    FOR UPDATE USING (
      auth.uid() = applicant_id
      OR EXISTS (
        SELECT 1 FROM public.stewardship_listings l
        WHERE l.id = listing_id AND l.listed_by = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $p$;
