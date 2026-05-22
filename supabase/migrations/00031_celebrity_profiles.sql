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
