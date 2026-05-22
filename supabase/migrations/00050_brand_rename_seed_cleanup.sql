-- =============================================
-- Brand rename: clean up deployed seed data
-- Foreverr → ǝterrn (display strings only; product IDs and CHECK
-- constraint values like 'foreverr_day' are left alone to avoid
-- breaking external integrations like RevenueCat / App Store).
--
-- Idempotent: each UPDATE filters on `LIKE '%Foreverr%'`, so
-- re-running this migration is a no-op once strings are cleaned up.
-- Each block is wrapped in EXCEPTION handlers so a missing table
-- (schema drift) skips that block rather than failing the migration.
-- =============================================

-- 1. Seed Foreverr Team contributor profile (00013)
DO $b$ BEGIN
  UPDATE public.profiles
  SET
    username     = 'eterrn_team',
    display_name = 'ǝterrn Team',
    bio          = 'The official ǝterrn team account'
  WHERE id = '00000000-0000-0000-0000-000000000001'
    AND (username = 'foreverr_team' OR display_name LIKE '%Foreverr%' OR bio LIKE '%Foreverr%');
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 2. News items / announcements (00014) — title, summary, source_name
DO $b$ BEGIN
  UPDATE public.news_items
  SET
    title       = replace(title, 'Foreverr', 'ǝterrn'),
    summary     = replace(summary, 'Foreverr', 'ǝterrn'),
    source_name = CASE WHEN source_name = 'Foreverr' THEN 'ǝterrn' ELSE source_name END
  WHERE title LIKE '%Foreverr%' OR summary LIKE '%Foreverr%' OR source_name = 'Foreverr';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 3. Seasonal campaigns (00020) — Foreverr Day display strings.
--    NOTE: campaign_type='foreverr_day' is part of a CHECK constraint;
--    leaving the type identifier alone, only renaming user-visible text.
DO $b$ BEGIN
  UPDATE public.campaigns
  SET
    title       = replace(title, 'Foreverr', 'ǝterrn'),
    description = replace(description, 'Foreverr', 'ǝterrn')
  WHERE title LIKE '%Foreverr%' OR description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 4. Subscription plans (00028) — display name + description.
--    DO NOT touch store_product_id_monthly/annual (configured in
--    RevenueCat + App Store + Play Store with the foreverr_* IDs).
DO $b$ BEGIN
  UPDATE public.subscription_plans
  SET
    name        = replace(name, 'Foreverr', 'ǝterrn'),
    description = replace(description, 'Foreverr', 'ǝterrn')
  WHERE name LIKE '%Foreverr%' OR description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 5. Premium feature gates (00028) — descriptions only.
DO $b$ BEGIN
  UPDATE public.premium_feature_gates
  SET description = replace(description, 'Foreverr', 'ǝterrn')
  WHERE description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 6. Welcome journey onboarding tasks (00035)
DO $b$ BEGIN
  UPDATE public.welcome_journey
  SET
    task_title       = replace(task_title, 'Foreverr', 'ǝterrn'),
    task_description = replace(task_description, 'Foreverr', 'ǝterrn')
  WHERE task_title LIKE '%Foreverr%' OR task_description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 7. Achievement quests (00035) — Community Builder etc.
DO $b$ BEGIN
  UPDATE public.achievement_quests
  SET
    name        = replace(name, 'Foreverr', 'ǝterrn'),
    description = replace(description, 'Foreverr', 'ǝterrn')
  WHERE name LIKE '%Foreverr%' OR description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 8. Legacy points (00035) — welcome bonus + any other branded text.
DO $b$ BEGIN
  UPDATE public.legacy_points
  SET description = replace(description, 'Foreverr', 'eterrn')
  WHERE description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;

-- 9. Ribbon transactions (00001 handle_new_user signup bonus) —
--    catch any rows created before migration 00047 fixed the function.
DO $b$ BEGIN
  UPDATE public.ribbon_transactions
  SET description = replace(description, 'Foreverr', 'eterrn')
  WHERE description LIKE '%Foreverr%';
EXCEPTION WHEN undefined_table THEN NULL; WHEN others THEN NULL; END $b$;
