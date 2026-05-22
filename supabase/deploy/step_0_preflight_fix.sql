-- ============================================================
-- STEP 0: Pre-flight fixes
-- Run this FIRST before any other migration.
-- Patches the existing gift_catalog table schema to be compatible
-- with migrations 00022+ which expect additional columns.
-- ============================================================

-- 1. Add missing columns to gift_catalog (created in 00001 with minimal schema)
ALTER TABLE public.gift_catalog ADD COLUMN IF NOT EXISTS icon text DEFAULT 'gift';
ALTER TABLE public.gift_catalog ADD COLUMN IF NOT EXISTS price_cents integer DEFAULT 0;
ALTER TABLE public.gift_catalog ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE public.gift_catalog ADD COLUMN IF NOT EXISTS is_physical boolean DEFAULT false;
ALTER TABLE public.gift_catalog ADD COLUMN IF NOT EXISTS physical_partner_id uuid;

-- 2. Make image_url nullable (was NOT NULL in 00001, nullable in 00022)
ALTER TABLE public.gift_catalog ALTER COLUMN image_url DROP NOT NULL;

-- 3. Expand gift_catalog category CHECK constraint to include new categories
--    Old: ('candle', 'flower', 'plant', 'sympathy_card', 'wreath', 'ribbon_bouquet')
--    New: adds ('flowers', 'candles', 'cards', 'stuffed_animals', 'balloons', 'custom', 'money')
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find the existing CHECK constraint on category
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
  WHERE con.conrelid = 'public.gift_catalog'::regclass
    AND att.attname = 'category'
    AND con.contype = 'c';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.gift_catalog DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

ALTER TABLE public.gift_catalog ADD CONSTRAINT gift_catalog_category_check
  CHECK (category IN (
    'candle', 'flower', 'plant', 'sympathy_card', 'wreath', 'ribbon_bouquet',
    'flowers', 'candles', 'cards', 'stuffed_animals', 'balloons', 'custom', 'money'
  ));

-- 4. Verify
DO $$
BEGIN
  RAISE NOTICE 'Pre-flight fix completed successfully!';
END $$;
