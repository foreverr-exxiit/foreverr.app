-- BATCH 2 OF 4: Migrations 00014-00023 (SAFE)

-- === 00014_celebrity_content.sql ===
-- 00014_celebrity_content.sql
-- Celebrity memorials & news items for auto-updating content (Today in History, obituaries, news feed)

-- ============================================================
-- Table: celebrity_memorials
-- Famous people for "Today in History", recent deaths, featured content
-- ============================================================
CREATE TABLE IF NOT EXISTS celebrity_memorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  age_at_death INT,
  cause_of_death TEXT,
  nationality TEXT,
  occupation TEXT,
  biography_summary TEXT,
  photo_url TEXT,
  source_url TEXT,
  source TEXT, -- 'wikipedia', 'manual', 'api'
  category TEXT NOT NULL DEFAULT 'historical', -- 'recent_death', 'anniversary', 'historical', 'featured'
  death_month INT, -- 1-12, for "On This Day" queries
  death_day INT, -- 1-31, for "On This Day" queries
  memorial_id UUID REFERENCES memorials(id) ON DELETE SET NULL, -- optional link to user-created memorial
  view_count INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_celebrity_death_month_day ON celebrity_memorials(death_month, death_day) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_celebrity_category ON celebrity_memorials(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_celebrity_featured ON celebrity_memorials(is_featured) WHERE is_active = true AND is_featured = true;
CREATE INDEX IF NOT EXISTS idx_celebrity_created_at ON celebrity_memorials(created_at DESC) WHERE is_active = true;

-- ============================================================
-- Table: news_items
-- General news feed content (obituaries, platform updates, memorial news)
-- ============================================================
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  source_url TEXT,
  source_name TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'obituary', 'anniversary', 'memorial_news', 'platform_update', 'general'
  celebrity_memorial_id UUID REFERENCES celebrity_memorials(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(published_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_news_featured ON news_items(is_featured) WHERE is_active = true AND is_featured = true;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE celebrity_memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon/guest) can read active entries
DO $safe$ BEGIN
CREATE POLICY "celebrity_memorials_public_read" ON celebrity_memorials
  FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "news_items_public_read" ON news_items
  FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Only service_role can insert/update (via edge functions or admin)
-- (no INSERT/UPDATE policies for anon/authenticated — managed by service_role)

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE TRIGGER update_celebrity_memorials_updated_at
  BEFORE UPDATE ON celebrity_memorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_items_updated_at
  BEFORE UPDATE ON news_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed Data: 30+ historical figures across all 12 months
-- ============================================================

INSERT INTO celebrity_memorials (full_name, first_name, last_name, date_of_birth, date_of_death, age_at_death, nationality, occupation, biography_summary, category, death_month, death_day, source) VALUES

-- January
('Martin Luther King Jr.', 'Martin Luther', 'King Jr.', '1929-01-15', '1968-04-04', 39, 'American', 'Civil Rights Leader', 'Baptist minister and activist who became the most visible spokesperson and leader in the American civil rights movement.', 'historical', 4, 4, 'manual'),
('David Bowie', 'David', 'Bowie', '1947-01-08', '2016-01-10', 69, 'British', 'Musician & Actor', 'English singer-songwriter and actor who was a leading figure in the music industry.', 'historical', 1, 10, 'manual'),

-- February
('Kobe Bryant', 'Kobe', 'Bryant', '1978-08-23', '2020-01-26', 41, 'American', 'Basketball Player', 'American professional basketball player who spent his entire 20-year career with the Los Angeles Lakers.', 'historical', 1, 26, 'manual'),

-- March
('Stephen Hawking', 'Stephen', 'Hawking', '1942-01-08', '2018-03-14', 76, 'British', 'Physicist', 'English theoretical physicist, cosmologist, and author who was director of research at the Centre for Theoretical Cosmology.', 'historical', 3, 14, 'manual'),

-- April
('Prince', 'Prince', 'Rogers Nelson', '1958-06-07', '2016-04-21', 57, 'American', 'Musician', 'American singer, songwriter, musician, record producer, and filmmaker known for his eclectic and flamboyant style.', 'historical', 4, 21, 'manual'),

-- May
('Maya Angelou', 'Maya', 'Angelou', '1928-04-04', '2014-05-28', 86, 'American', 'Poet & Author', 'American poet, memoirist, and civil rights activist. Known for her series of seven autobiographies.', 'historical', 5, 28, 'manual'),

-- June
('Muhammad Ali', 'Muhammad', 'Ali', '1942-01-17', '2016-06-03', 74, 'American', 'Boxer', 'American professional boxer, activist, and philanthropist, widely regarded as one of the most significant sports figures of the 20th century.', 'historical', 6, 3, 'manual'),
('Anthony Bourdain', 'Anthony', 'Bourdain', '1956-06-25', '2018-06-08', 61, 'American', 'Chef & Author', 'American celebrity chef, author, and travel documentarian who starred in programs focusing on the exploration of international culture.', 'historical', 6, 8, 'manual'),

-- July
('Chadwick Boseman', 'Chadwick', 'Boseman', '1976-11-29', '2020-08-28', 43, 'American', 'Actor', 'American actor known for his portrayal of Black Panther in the Marvel Cinematic Universe.', 'historical', 8, 28, 'manual'),

-- August
('Robin Williams', 'Robin', 'Williams', '1951-07-21', '2014-08-11', 63, 'American', 'Actor & Comedian', 'American actor and comedian known for his improvisational skills and the wide variety of characters he created.', 'historical', 8, 11, 'manual'),
('Aretha Franklin', 'Aretha', 'Franklin', '1942-03-25', '2018-08-16', 76, 'American', 'Singer', 'American singer, songwriter, and pianist referred to as the "Queen of Soul."', 'historical', 8, 16, 'manual'),

-- September
('Queen Elizabeth II', 'Queen', 'Elizabeth II', '1926-04-21', '2022-09-08', 96, 'British', 'Monarch', 'Queen of the United Kingdom and other Commonwealth realms from 1952 until her death in 2022.', 'historical', 9, 8, 'manual'),

-- October
('Steve Jobs', 'Steve', 'Jobs', '1955-02-24', '2011-10-05', 56, 'American', 'Tech Visionary', 'American business magnate, inventor, and investor, co-founder of Apple Inc.', 'historical', 10, 5, 'manual'),

-- November
('Stan Lee', 'Stan', 'Lee', '1922-12-28', '2018-11-12', 95, 'American', 'Comic Book Creator', 'American comic book writer, editor, publisher, and producer who co-created Spider-Man, X-Men, and many other iconic characters.', 'historical', 11, 12, 'manual'),

-- December
('John Lennon', 'John', 'Lennon', '1940-10-09', '1980-12-08', 40, 'British', 'Musician', 'English singer, songwriter, musician, and peace activist who co-founded the Beatles.', 'historical', 12, 8, 'manual'),

-- More historical figures to ensure coverage
('Nelson Mandela', 'Nelson', 'Mandela', '1918-07-18', '2013-12-05', 95, 'South African', 'President & Activist', 'South African anti-apartheid revolutionary, political leader, and philanthropist who served as President of South Africa.', 'historical', 12, 5, 'manual'),
('Princess Diana', 'Princess', 'Diana', '1961-07-01', '1997-08-31', 36, 'British', 'Princess of Wales', 'Member of the British royal family, first wife of Charles, Prince of Wales.', 'historical', 8, 31, 'manual'),
('Albert Einstein', 'Albert', 'Einstein', '1879-03-14', '1955-04-18', 76, 'German-American', 'Physicist', 'German-born theoretical physicist who developed the theory of relativity.', 'historical', 4, 18, 'manual'),
('Whitney Houston', 'Whitney', 'Houston', '1963-08-09', '2012-02-11', 48, 'American', 'Singer & Actress', 'American singer and actress, known as "The Voice," one of the best-selling music artists of all time.', 'historical', 2, 11, 'manual'),
('Bob Marley', 'Bob', 'Marley', '1945-02-06', '1981-05-11', 36, 'Jamaican', 'Musician', 'Jamaican singer, songwriter, and musician, considered one of the pioneers of reggae.', 'historical', 5, 11, 'manual'),
('Mother Teresa', 'Mother', 'Teresa', '1910-08-26', '1997-09-05', 87, 'Albanian-Indian', 'Humanitarian', 'Roman Catholic nun and missionary, founded the Missionaries of Charity.', 'historical', 9, 5, 'manual'),
('Tupac Shakur', 'Tupac', 'Shakur', '1971-06-16', '1996-09-13', 25, 'American', 'Rapper & Actor', 'American rapper, songwriter, and actor considered one of the most influential rappers of all time.', 'historical', 9, 13, 'manual'),
('Freddie Mercury', 'Freddie', 'Mercury', '1946-09-05', '1991-11-24', 45, 'British', 'Musician', 'British singer, songwriter, record producer, and lead vocalist of the rock band Queen.', 'historical', 11, 24, 'manual'),
('Nipsey Hussle', 'Nipsey', 'Hussle', '1985-08-15', '2019-03-31', 33, 'American', 'Rapper & Activist', 'American rapper, songwriter, and entrepreneur known for his community activism in South Los Angeles.', 'historical', 3, 31, 'manual'),
('Ruth Bader Ginsburg', 'Ruth Bader', 'Ginsburg', '1933-03-15', '2020-09-18', 87, 'American', 'Supreme Court Justice', 'American jurist who served as an associate justice of the Supreme Court from 1993 until her death.', 'historical', 9, 18, 'manual'),
('Mac Miller', 'Mac', 'Miller', '1992-01-19', '2018-09-07', 26, 'American', 'Rapper & Producer', 'American rapper, singer, songwriter, and record producer known for his introspective lyrics.', 'historical', 9, 7, 'manual'),
('Virgil Abloh', 'Virgil', 'Abloh', '1980-09-30', '2021-11-28', 41, 'American', 'Fashion Designer', 'American fashion designer, entrepreneur, and DJ who served as the artistic director of Louis Vuitton men''s wear.', 'historical', 11, 28, 'manual'),
('Alex Trebek', 'Alex', 'Trebek', '1940-07-22', '2020-11-08', 80, 'Canadian-American', 'TV Host', 'Canadian-American television personality who hosted the game show Jeopardy! for 37 years.', 'historical', 11, 8, 'manual'),
('Betty White', 'Betty', 'White', '1922-01-17', '2021-12-31', 99, 'American', 'Actress & Comedian', 'American actress, comedian, and television personality with a career spanning over 80 years.', 'historical', 12, 31, 'manual'),
('Paul Walker', 'Paul', 'Walker', '1973-09-12', '2013-11-30', 40, 'American', 'Actor', 'American actor best known for his role as Brian O''Conner in The Fast and the Furious franchise.', 'historical', 11, 30, 'manual'),
('Juice WRLD', 'Juice', 'WRLD', '1998-12-02', '2019-12-08', 21, 'American', 'Rapper & Singer', 'American rapper, singer, and songwriter known for his emotional and introspective music.', 'historical', 12, 8, 'manual'),
('Pop Smoke', 'Pop', 'Smoke', '1999-07-20', '2020-02-19', 20, 'American', 'Rapper', 'American rapper, singer, and songwriter who was a leading figure in the Brooklyn drill music scene.', 'historical', 2, 19, 'manual'),
('XXXTentacion', 'XXXTentacion', '', '1998-01-23', '2018-06-18', 20, 'American', 'Rapper & Singer', 'American rapper, singer, and songwriter known for his versatile musical style.', 'historical', 6, 18, 'manual'),
('Avicii', 'Avicii', '', '1989-09-08', '2018-04-20', 28, 'Swedish', 'DJ & Producer', 'Swedish DJ, remixer, record producer, musician, and songwriter, one of the most famous electronic music artists.', 'historical', 4, 20, 'manual'),
('Carrie Fisher', 'Carrie', 'Fisher', '1956-10-21', '2016-12-27', 60, 'American', 'Actress & Writer', 'American actress, writer, and comedian, best known for playing Princess Leia in the Star Wars films.', 'historical', 12, 27, 'manual');


-- ============================================================
-- Seed Data: News items
-- ============================================================
INSERT INTO news_items (title, summary, category, is_featured, published_at, source_name) VALUES
('Welcome to Foreverr', 'The Foreverr community is dedicated to honoring and celebrating the lives of those who have passed. Create memorials, share tributes, and keep memories alive.', 'platform_update', true, now(), 'Foreverr'),
('How to Create a Meaningful Memorial', 'Tips for building a lasting tribute: include personal stories, favorite photos, and invite others to contribute their memories.', 'platform_update', false, now() - interval '1 day', 'Foreverr'),
('The Power of Shared Remembrance', 'Studies show that communal remembrance helps with the grieving process. Connecting with others who share memories can provide comfort and healing.', 'memorial_news', true, now() - interval '2 days', 'Foreverr'),
('New Feature: Light a Virtual Candle', 'Express your remembrance by lighting a virtual candle on any memorial. The animated candle represents your love and respect.', 'platform_update', false, now() - interval '3 days', 'Foreverr'),
('Community Spotlight: Most Tributed Memorials This Month', 'See which memorials received the most tributes and engagement from the Foreverr community this month.', 'memorial_news', false, now() - interval '5 days', 'Foreverr');

-- === 00015_vault_enhancements.sql ===
-- Migration 00015: Vault Enhancements
-- Adds: vault_folders, vault_item_tags, vault_item_folders, scrapbook_elements, prompt_categories
-- Alters: memory_vault_items (+ folder_id), memory_prompts (+ category_id, is_ai_suggested)

-- ============================================================
-- Vault Folders (collection/folder organization for vault items)
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#7C3AED',
  parent_folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL,
  item_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_folders_memorial ON vault_folders(memorial_id);
CREATE INDEX IF NOT EXISTS idx_vault_folders_created_by ON vault_folders(created_by);

ALTER TABLE vault_folders ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view vault folders"
  ON vault_folders FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can create vault folders"
  ON vault_folders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creators can update their vault folders"
  ON vault_folders FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Creators can delete their vault folders"
  ON vault_folders FOR DELETE TO authenticated
  USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Vault Item Tags (many-to-many tagging)
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES memory_vault_items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_vault_item_tags_memorial ON vault_item_tags(memorial_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_tags_item ON vault_item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_tags_tag ON vault_item_tags(tag);

ALTER TABLE vault_item_tags ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view vault item tags"
  ON vault_item_tags FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can tag items"
  ON vault_item_tags FOR INSERT TO authenticated
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can untag items"
  ON vault_item_tags FOR DELETE TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Vault Item Folder Assignment
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_item_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES memory_vault_items(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES vault_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_item_folders_item ON vault_item_folders(item_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_folders_folder ON vault_item_folders(folder_id);

ALTER TABLE vault_item_folders ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view vault item folders"
  ON vault_item_folders FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can assign items to folders"
  ON vault_item_folders FOR INSERT TO authenticated
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can remove items from folders"
  ON vault_item_folders FOR DELETE TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Scrapbook Elements (individual elements on a page)
-- ============================================================
CREATE TABLE IF NOT EXISTS scrapbook_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES scrapbook_pages(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('photo', 'text', 'sticker', 'shape', 'divider')),
  content TEXT,
  media_url TEXT,
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  width DOUBLE PRECISION DEFAULT 200,
  height DOUBLE PRECISION DEFAULT 200,
  rotation DOUBLE PRECISION DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  style_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scrapbook_elements_page ON scrapbook_elements(page_id);

ALTER TABLE scrapbook_elements ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view scrapbook elements"
  ON scrapbook_elements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can create scrapbook elements"
  ON scrapbook_elements FOR INSERT TO authenticated
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can update scrapbook elements"
  ON scrapbook_elements FOR UPDATE TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can delete scrapbook elements"
  ON scrapbook_elements FOR DELETE TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- Prompt Categories (pre-defined prompt groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bulb',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view prompt categories"
  ON prompt_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Seed prompt categories
INSERT INTO prompt_categories (name, slug, description, icon, sort_order) VALUES
  ('Childhood', 'childhood', 'Memories from growing up', 'happy', 1),
  ('Career', 'career', 'Professional life and achievements', 'briefcase', 2),
  ('Relationships', 'relationships', 'Family, friends, and loved ones', 'heart', 3),
  ('Favorites', 'favorites', 'Favorite things and preferences', 'star', 4),
  ('Milestones', 'milestones', 'Key life events and achievements', 'trophy', 5),
  ('Traditions', 'traditions', 'Family and cultural traditions', 'gift', 6),
  ('Personality', 'personality', 'Character traits and quirks', 'sparkles', 7),
  ('Travel', 'travel', 'Places visited and adventures', 'airplane', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ALTER existing tables
-- ============================================================

-- Add folder_id to memory_vault_items
ALTER TABLE memory_vault_items ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL;

-- Add category_id and is_ai_suggested to memory_prompts
ALTER TABLE memory_prompts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES prompt_categories(id) ON DELETE SET NULL;
ALTER TABLE memory_prompts ADD COLUMN IF NOT EXISTS is_ai_suggested BOOLEAN DEFAULT false;

-- ============================================================
-- Trigger: Auto-update vault_folders.item_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_vault_folder_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vault_folders SET item_count = item_count + 1 WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vault_folders SET item_count = item_count - 1 WHERE id = OLD.folder_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vault_folder_item_count
  AFTER INSERT OR DELETE ON vault_item_folders
  FOR EACH ROW EXECUTE FUNCTION update_vault_folder_item_count();

-- ============================================================
-- Trigger: Auto-update updated_at timestamps
-- ============================================================
CREATE TRIGGER set_vault_folders_updated_at
  BEFORE UPDATE ON vault_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_scrapbook_elements_updated_at
  BEFORE UPDATE ON scrapbook_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === 00016_advanced_social.sql ===
-- ============================================================
-- 00016_advanced_social.sql
-- Advanced Social Features: Follows, Activity Feed, Badges, Mentions
-- ============================================================

-- ============================================================
-- 1. User Follows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- ============================================================
-- 2. User Activities (Activity Feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN (
    'tribute_posted', 'memorial_followed', 'candle_lit', 'comment_posted',
    'reaction_given', 'streak_achieved', 'badge_earned', 'vault_item_added',
    'capsule_created', 'photo_uploaded', 'event_created', 'donation_made',
    'nft_minted', 'live_room_created', 'scrapbook_published', 'user_followed'
  )),
  target_type text, -- 'memorial', 'tribute', 'user', 'event', etc.
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_public ON public.user_activities(is_public, created_at DESC);

-- ============================================================
-- 3. Badge Definitions (Catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_type text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'ribbon',
  category text NOT NULL CHECK (category IN (
    'contribution', 'engagement', 'streak', 'social', 'special'
  )),
  requirement_count integer NOT NULL DEFAULT 1,
  tier_thresholds jsonb DEFAULT '{"bronze": 1, "silver": 5, "gold": 25, "platinum": 100}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. User Badges (Earned)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL REFERENCES public.badge_definitions(badge_type) ON DELETE CASCADE,
  badge_tier text NOT NULL DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  progress integer NOT NULL DEFAULT 0,
  is_displayed boolean NOT NULL DEFAULT true,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_displayed ON public.user_badges(user_id, is_displayed) WHERE is_displayed = true;

-- ============================================================
-- 5. Mentions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentioned_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentioned_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('tribute', 'comment', 'chat')),
  context_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentions_user ON public.mentions(mentioned_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_unread ON public.mentions(mentioned_user_id, is_read) WHERE is_read = false;

-- ============================================================
-- 6. ALTER profiles — add social count columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS follower_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_count integer NOT NULL DEFAULT 0;

-- ============================================================
-- 7. Triggers — Auto-update follower/following counts
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_follow_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_follow_count ON public.user_follows;
CREATE TRIGGER trg_follow_count
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_count_change();

-- Auto-update badge count on profiles
CREATE OR REPLACE FUNCTION public.handle_badge_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET badge_count = badge_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET badge_count = GREATEST(badge_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_badge_count ON public.user_badges;
CREATE TRIGGER trg_badge_count
  AFTER INSERT OR DELETE ON public.user_badges
  FOR EACH ROW EXECUTE FUNCTION public.handle_badge_count_change();

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view follows"
  ON public.user_follows FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Public activities visible to all"
  ON public.user_activities FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can create own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- badge_definitions
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view badge definitions"
  ON public.badge_definitions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view earned badges"
  ON public.user_badges FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "System can insert badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can toggle badge display"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- mentions
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Users can see their mentions"
  ON public.mentions FOR SELECT
  USING (auth.uid() = mentioned_user_id OR auth.uid() = mentioned_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can create mentions"
  ON public.mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can mark mentions read"
  ON public.mentions FOR UPDATE
  USING (auth.uid() = mentioned_user_id)
  WITH CHECK (auth.uid() = mentioned_user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- 9. Seed Badge Definitions
-- ============================================================
INSERT INTO public.badge_definitions (badge_type, name, description, icon, category, requirement_count, tier_thresholds) VALUES
  ('first_tribute', 'First Tribute', 'Posted your first tribute to a memorial', 'heart', 'contribution', 1, '{"bronze": 1, "silver": 10, "gold": 50, "platinum": 200}'),
  ('candlelight', 'Candlelight', 'Lit candles in remembrance', 'flame', 'contribution', 1, '{"bronze": 1, "silver": 25, "gold": 100, "platinum": 500}'),
  ('devoted', 'Devoted', 'Visited memorials consistently', 'calendar', 'streak', 7, '{"bronze": 7, "silver": 30, "gold": 90, "platinum": 365}'),
  ('memory_keeper', 'Memory Keeper', 'Added items to the Memory Vault', 'archive', 'contribution', 1, '{"bronze": 1, "silver": 10, "gold": 50, "platinum": 200}'),
  ('community_builder', 'Community Builder', 'Followed other community members', 'people', 'social', 5, '{"bronze": 5, "silver": 25, "gold": 100, "platinum": 500}'),
  ('storyteller', 'Storyteller', 'Shared stories and memories', 'book', 'contribution', 1, '{"bronze": 1, "silver": 5, "gold": 25, "platinum": 100}'),
  ('generous_heart', 'Generous Heart', 'Made donations to memorial campaigns', 'gift', 'engagement', 1, '{"bronze": 1, "silver": 5, "gold": 20, "platinum": 50}'),
  ('event_planner', 'Event Planner', 'Created memorial events', 'calendar', 'engagement', 1, '{"bronze": 1, "silver": 5, "gold": 15, "platinum": 50}'),
  ('time_traveler', 'Time Traveler', 'Created time capsules', 'time', 'special', 1, '{"bronze": 1, "silver": 3, "gold": 10, "platinum": 25}'),
  ('digital_artist', 'Digital Artist', 'Published scrapbook pages', 'brush', 'special', 1, '{"bronze": 1, "silver": 5, "gold": 15, "platinum": 50}')
ON CONFLICT (badge_type) DO NOTHING;

-- === 00017_sharing_deep_links.sql ===
-- ============================================================
-- Migration 00017: Social Sharing Infrastructure & Deep Links
-- Phase 5, Sprint 1: Make every piece of content shareable
-- ============================================================

-- ─── Share Cards (analytics for every share action) ─────────
CREATE TABLE IF NOT EXISTS public.share_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type     text NOT NULL CHECK (target_type IN ('memorial','tribute','event','profile','living_tribute','badge')),
  target_id       uuid NOT NULL,
  share_platform  text CHECK (share_platform IN ('instagram_story','facebook','twitter','whatsapp','sms','copy_link','native','other')),
  share_url       text NOT NULL,
  og_title        text,
  og_description  text,
  og_image_url    text,
  click_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_cards_target ON public.share_cards (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_user ON public.share_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_created ON public.share_cards (created_at DESC);

-- RLS for share_cards
ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Share cards are viewable by everyone"
  ON public.share_cards FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can create share cards"
  ON public.share_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ─── Legacy Links (vanity URLs for user profiles) ──────────
CREATE TABLE IF NOT EXISTS public.legacy_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slug            text NOT NULL UNIQUE,
  is_active       boolean NOT NULL DEFAULT true,
  click_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_legacy_links_slug ON public.legacy_links (slug);
CREATE INDEX IF NOT EXISTS idx_legacy_links_user ON public.legacy_links (user_id);

-- Slug validation: lowercase alphanumeric + hyphens, 3-30 chars
ALTER TABLE public.legacy_links
  ADD CONSTRAINT legacy_links_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- RLS for legacy_links
ALTER TABLE public.legacy_links ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Legacy links are viewable by everyone"
  ON public.legacy_links FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can manage their own legacy link"
  ON public.legacy_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can update their own legacy link"
  ON public.legacy_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can delete their own legacy link"
  ON public.legacy_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ─── Add legacy_link_slug to profiles for quick lookups ─────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legacy_link_slug text UNIQUE;

-- ─── Auto-update profiles.legacy_link_slug on legacy_links change ───
CREATE OR REPLACE FUNCTION public.sync_legacy_link_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles SET legacy_link_slug = NEW.slug WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET legacy_link_slug = NULL WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_legacy_link_change
  AFTER INSERT OR UPDATE OR DELETE ON public.legacy_links
  FOR EACH ROW EXECUTE FUNCTION public.sync_legacy_link_slug();

-- ─── Auto-update updated_at on legacy_links ─────────────────
CREATE OR REPLACE FUNCTION public.update_legacy_link_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_legacy_link_update
  BEFORE UPDATE ON public.legacy_links
  FOR EACH ROW EXECUTE FUNCTION public.update_legacy_link_timestamp();

-- === 00018_living_tributes.sql ===
-- ============================================================
-- Migration 00018: Living Tributes & Appreciation Letters
-- Phase 5, Sprint 2: Honor the Living
-- ============================================================

-- ============================================================
-- Table: living_tributes
-- Tribute pages for people who are ALIVE
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tributes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  honoree_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  honoree_name    text NOT NULL,
  honoree_email   text,
  honoree_photo_url text,
  cover_photo_url text,
  title           text NOT NULL,
  description     text,
  occasion        text CHECK (occasion IN (
    'birthday', 'anniversary', 'retirement', 'graduation',
    'appreciation', 'get_well', 'wedding', 'achievement',
    'just_because', 'other'
  )),
  occasion_date   date,
  privacy         text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited', 'honoree_only')),
  status          text DEFAULT 'active' CHECK (status IN ('active', 'converted_to_memorial', 'archived')),
  memorial_id     uuid REFERENCES memorials(id) ON DELETE SET NULL,
  slug            text NOT NULL UNIQUE,
  contributor_count integer DEFAULT 0,
  message_count   integer DEFAULT 0,
  view_count      integer DEFAULT 0,
  is_surprise     boolean DEFAULT false,
  reveal_at       timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_living_tribute_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM living_tributes WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_living_tribute_slug
  BEFORE INSERT ON living_tributes
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_living_tribute_slug();

-- ============================================================
-- Table: living_tribute_messages
-- Messages/contributions on living tributes
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tribute_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id      uuid NOT NULL REFERENCES living_tributes(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text,
  media_url       text,
  media_type      text CHECK (media_type IN ('photo', 'video', 'voice')),
  reaction_count  integer DEFAULT 0,
  is_anonymous    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-increment contributor_count and message_count
CREATE OR REPLACE FUNCTION update_living_tribute_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE living_tributes
    SET message_count = message_count + 1,
        contributor_count = (
          SELECT COUNT(DISTINCT author_id)
          FROM living_tribute_messages
          WHERE tribute_id = NEW.tribute_id
        ),
        updated_at = now()
    WHERE id = NEW.tribute_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE living_tributes
    SET message_count = GREATEST(message_count - 1, 0),
        contributor_count = (
          SELECT COUNT(DISTINCT author_id)
          FROM living_tribute_messages
          WHERE tribute_id = OLD.tribute_id
        ),
        updated_at = now()
    WHERE id = OLD.tribute_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_living_tribute_message_counts
  AFTER INSERT OR DELETE ON living_tribute_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_living_tribute_counts();

-- ============================================================
-- Table: living_tribute_invites
-- Invite people to contribute to a living tribute
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tribute_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id      uuid NOT NULL REFERENCES living_tributes(id) ON DELETE CASCADE,
  invited_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_email   text,
  invited_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code     text DEFAULT encode(gen_random_bytes(8), 'hex'),
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE(tribute_id, invited_email)
);

-- ============================================================
-- Table: appreciation_letters
-- Letters of appreciation for living people
-- ============================================================
CREATE TABLE IF NOT EXISTS appreciation_letters (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_name    text NOT NULL,
  recipient_email   text,
  subject           text NOT NULL,
  content           text NOT NULL,
  media_url         text,
  delivery_type     text DEFAULT 'immediate' CHECK (delivery_type IN ('immediate', 'scheduled', 'on_occasion')),
  delivery_date     date,
  occasion          text,
  is_delivered      boolean DEFAULT false,
  delivered_at      timestamptz,
  is_read           boolean DEFAULT false,
  read_at           timestamptz,
  is_public         boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_living_tributes_created_by ON living_tributes(created_by);
CREATE INDEX IF NOT EXISTS idx_living_tributes_honoree ON living_tributes(honoree_user_id);
CREATE INDEX IF NOT EXISTS idx_living_tributes_slug ON living_tributes(slug);
CREATE INDEX IF NOT EXISTS idx_living_tributes_status ON living_tributes(status);
CREATE INDEX IF NOT EXISTS idx_living_tributes_occasion ON living_tributes(occasion);

CREATE INDEX IF NOT EXISTS idx_living_tribute_messages_tribute ON living_tribute_messages(tribute_id);
CREATE INDEX IF NOT EXISTS idx_living_tribute_messages_author ON living_tribute_messages(author_id);

CREATE INDEX IF NOT EXISTS idx_living_tribute_invites_tribute ON living_tribute_invites(tribute_id);
CREATE INDEX IF NOT EXISTS idx_living_tribute_invites_code ON living_tribute_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_living_tribute_invites_email ON living_tribute_invites(invited_email);

CREATE INDEX IF NOT EXISTS idx_appreciation_letters_author ON appreciation_letters(author_id);
CREATE INDEX IF NOT EXISTS idx_appreciation_letters_recipient ON appreciation_letters(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_appreciation_letters_delivery ON appreciation_letters(delivery_type, delivery_date);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE living_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_tribute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_tribute_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE appreciation_letters ENABLE ROW LEVEL SECURITY;

-- Living Tributes: public readable, creator-manageable
DO $safe$ BEGIN
CREATE POLICY "living_tributes_select" ON living_tributes
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR honoree_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM living_tribute_invites
      WHERE tribute_id = living_tributes.id
      AND (invited_user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND status = 'accepted'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tributes_insert" ON living_tributes
  FOR INSERT WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tributes_update" ON living_tributes
  FOR UPDATE USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tributes_delete" ON living_tributes
  FOR DELETE USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Messages: readable if tribute is visible, insertable by authenticated
DO $safe$ BEGIN
CREATE POLICY "living_tribute_messages_select" ON living_tribute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM living_tributes
      WHERE id = living_tribute_messages.tribute_id
      AND (privacy = 'public' OR created_by = auth.uid() OR honoree_user_id = auth.uid())
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tribute_messages_insert" ON living_tribute_messages
  FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tribute_messages_update" ON living_tribute_messages
  FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tribute_messages_delete" ON living_tribute_messages
  FOR DELETE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Invites: visible to inviter and invitee
DO $safe$ BEGIN
CREATE POLICY "living_tribute_invites_select" ON living_tribute_invites
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tribute_invites_insert" ON living_tribute_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "living_tribute_invites_update" ON living_tribute_invites
  FOR UPDATE USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Appreciation Letters: visible to author and recipient
DO $safe$ BEGIN
CREATE POLICY "appreciation_letters_select" ON appreciation_letters
  FOR SELECT USING (
    author_id = auth.uid()
    OR recipient_user_id = auth.uid()
    OR is_public = true
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "appreciation_letters_insert" ON appreciation_letters
  FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "appreciation_letters_update" ON appreciation_letters
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = recipient_user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "appreciation_letters_delete" ON appreciation_letters
  FOR DELETE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- === 00019_daily_engagement.sql ===
-- ============================================================
-- Migration 00019: Daily Engagement System
-- Phase 5, Sprint 3: Daily Life Integration
-- ============================================================

-- ============================================================
-- Table: daily_prompts
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_prompts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text     text NOT NULL,
  prompt_category text NOT NULL CHECK (prompt_category IN ('gratitude','remembrance','appreciation','reflection','connection','milestone')),
  icon            text DEFAULT 'sparkles',
  is_active       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Table: user_prompt_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS user_prompt_responses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id          uuid NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  content            text NOT NULL,
  media_url          text,
  is_public          boolean DEFAULT true,
  tagged_memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  tagged_user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reaction_count     integer DEFAULT 0,
  created_at         timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_prompt_responses_daily
  ON user_prompt_responses (user_id, prompt_id, ((created_at AT TIME ZONE 'UTC')::date));

-- ============================================================
-- Table: smart_reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type   text NOT NULL CHECK (reminder_type IN ('birthday','anniversary','death_anniversary','holiday','custom','auto_generated')),
  title           text NOT NULL,
  description     text,
  memorial_id     uuid REFERENCES memorials(id) ON DELETE SET NULL,
  recurrence      text DEFAULT 'annual' CHECK (recurrence IN ('once','annual','monthly','weekly')),
  reminder_date   date NOT NULL,
  reminder_time   time DEFAULT '09:00',
  days_before     integer DEFAULT 0,
  is_enabled      boolean DEFAULT true,
  last_triggered  timestamptz,
  notification_sent boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Table: engagement_streaks
-- ============================================================
CREATE TABLE IF NOT EXISTS engagement_streaks (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak         integer DEFAULT 0,
  longest_streak         integer DEFAULT 0,
  last_activity_date     date,
  total_days_active      integer DEFAULT 0,
  total_prompts_answered integer DEFAULT 0,
  total_shares           integer DEFAULT 0,
  streak_shared_at       timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_daily_prompts_category ON daily_prompts(prompt_category);
CREATE INDEX IF NOT EXISTS idx_daily_prompts_active ON daily_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_user_prompt_responses_user ON user_prompt_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompt_responses_prompt ON user_prompt_responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_smart_reminders_user ON smart_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_reminders_date ON smart_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_engagement_streaks_user ON engagement_streaks(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_streaks ENABLE ROW LEVEL SECURITY;

-- Daily prompts: readable by all
DO $safe$ BEGIN
CREATE POLICY "daily_prompts_select" ON daily_prompts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Responses: public ones readable, own always readable, insertable by owner
DO $safe$ BEGIN
CREATE POLICY "user_prompt_responses_select" ON user_prompt_responses
  FOR SELECT USING (is_public = true OR user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "user_prompt_responses_insert" ON user_prompt_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "user_prompt_responses_update" ON user_prompt_responses
  FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Reminders: owner only
DO $safe$ BEGIN
CREATE POLICY "smart_reminders_select" ON smart_reminders FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "smart_reminders_insert" ON smart_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "smart_reminders_update" ON smart_reminders FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "smart_reminders_delete" ON smart_reminders FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- Streaks: owner only
DO $safe$ BEGIN
CREATE POLICY "engagement_streaks_select" ON engagement_streaks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "engagement_streaks_insert" ON engagement_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "engagement_streaks_update" ON engagement_streaks FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- SEED: Daily prompts
-- ============================================================
INSERT INTO daily_prompts (prompt_text, prompt_category, icon, sort_order) VALUES
-- Gratitude
('Who made you smile today?', 'gratitude', 'happy', 1),
('Name someone who changed your life for the better.', 'gratitude', 'heart', 2),
('What kindness did you witness or receive today?', 'gratitude', 'hand-left', 3),
('What is one thing you are grateful for right now?', 'gratitude', 'sparkles', 4),
('Who deserves a thank you that you haven''t given yet?', 'gratitude', 'gift', 5),
('What small moment brought you joy recently?', 'gratitude', 'sunny', 6),
('Name a teacher, mentor, or guide who shaped who you are.', 'gratitude', 'school', 7),
('What is a skill someone taught you that you still use?', 'gratitude', 'bulb', 8),
-- Remembrance
('Share a favorite memory of someone you miss.', 'remembrance', 'heart-circle', 10),
('What song reminds you of a loved one?', 'remembrance', 'musical-notes', 11),
('What lesson did you learn from someone who has passed?', 'remembrance', 'book', 12),
('Describe a tradition that keeps a loved one''s memory alive.', 'remembrance', 'flame', 13),
('What would you say if you had one more conversation?', 'remembrance', 'chatbubble', 14),
('Share a photo that captures a special moment.', 'remembrance', 'camera', 15),
('What smell or taste brings back a cherished memory?', 'remembrance', 'rose', 16),
('How do you honor someone who is no longer with you?', 'remembrance', 'candle', 17),
-- Appreciation
('Tell someone alive how they''ve impacted you.', 'appreciation', 'person', 20),
('Who deserves a thank you today?', 'appreciation', 'thumbs-up', 21),
('Name someone whose work ethic inspires you.', 'appreciation', 'star', 22),
('Who is your biggest cheerleader?', 'appreciation', 'megaphone', 23),
('What friend has stood by you through thick and thin?', 'appreciation', 'people', 24),
('Who in your family deserves more recognition?', 'appreciation', 'home', 25),
('Name a colleague who makes your work life better.', 'appreciation', 'briefcase', 26),
('Who is a quiet hero in your community?', 'appreciation', 'shield', 27),
-- Reflection
('What life lesson would you pass on to the next generation?', 'reflection', 'bulb', 30),
('What moment shaped who you are today?', 'reflection', 'compass', 31),
('If you could relive one day, which would it be?', 'reflection', 'time', 32),
('What do you want to be remembered for?', 'reflection', 'ribbon', 33),
('What advice would your younger self need to hear?', 'reflection', 'chatbubble-ellipses', 34),
('What is the bravest thing you''ve ever done?', 'reflection', 'flash', 35),
('How has your definition of success changed over time?', 'reflection', 'trending-up', 36),
('What value do you hold most dear?', 'reflection', 'diamond', 37),
-- Connection
('Who should you call today?', 'connection', 'call', 40),
('Share a family tradition worth preserving.', 'connection', 'people-circle', 41),
('What community do you feel most connected to?', 'connection', 'earth', 42),
('Name someone you''ve lost touch with that you miss.', 'connection', 'person-add', 43),
('How do you stay connected with loved ones far away?', 'connection', 'globe', 44),
('What meal brings your family together?', 'connection', 'restaurant', 45),
('Share a story that gets told at every family gathering.', 'connection', 'chatbubbles', 46),
('Who would you invite to your dream dinner party?', 'connection', 'wine', 47),
-- Milestone
('What achievement are you most proud of?', 'milestone', 'trophy', 50),
('Celebrate someone''s recent win — who accomplished something great?', 'milestone', 'ribbon', 51),
('What goal are you working toward right now?', 'milestone', 'flag', 52),
('Name a milestone birthday or anniversary coming up.', 'milestone', 'gift', 53),
('What is the best compliment you''ve ever received?', 'milestone', 'star', 54),
('Share a "first" that was meaningful to you.', 'milestone', 'rocket', 55),
('What skill have you recently learned or improved?', 'milestone', 'school', 56),
('What is something you accomplished that once seemed impossible?', 'milestone', 'checkmark-circle', 57)
ON CONFLICT DO NOTHING;

-- === 00020_viral_growth.sql ===
-- ============================================================
-- Migration 00020: Viral Growth Mechanics
-- Sprint 4 of Phase 5 — invite links, conversions, share
-- card templates, seasonal campaigns
-- ============================================================

-- ----------------------------------------------------------
-- 1. invite_links — trackable invite URLs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_links (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_type     text NOT NULL CHECK (invite_type IN ('memorial_contributor','living_tribute_contributor','app_invite','family_tree_join')),
    target_id       uuid,
    invite_code     text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    message         text,
    max_uses        integer,
    use_count       integer DEFAULT 0,
    expires_at      timestamptz,
    is_active       boolean DEFAULT true,
    created_at      timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 2. invite_conversions — tracks who signed up via invites
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_conversions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_link_id    uuid NOT NULL REFERENCES public.invite_links(id) ON DELETE CASCADE,
    converted_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    conversion_type   text NOT NULL CHECK (conversion_type IN ('app_signup','memorial_follow','tribute_contribution','family_tree_join')),
    created_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 3. share_card_templates — visual templates for share cards
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_card_templates (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text NOT NULL,
    template_type     text NOT NULL CHECK (template_type IN ('memorial','tribute','living_tribute','streak','badge','prompt_response','event','milestone')),
    background_color  text DEFAULT '#2D1B4E',
    text_color        text DEFAULT '#FFFFFF',
    layout            text DEFAULT 'standard' CHECK (layout IN ('standard','photo_overlay','minimal','celebration')),
    is_active         boolean DEFAULT true,
    sort_order        integer DEFAULT 0,
    created_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 4. campaigns — seasonal & special campaigns
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title             text NOT NULL,
    description       text,
    campaign_type     text NOT NULL CHECK (campaign_type IN ('mothers_day','fathers_day','memorial_day','veterans_day','grandparents_day','remembrance_day','foreverr_day','custom')),
    start_date        date NOT NULL,
    end_date          date NOT NULL,
    cover_image_url   text,
    cta_text          text DEFAULT 'Honor Someone Special',
    cta_route         text DEFAULT '/living-tribute/create',
    is_active         boolean DEFAULT true,
    participant_count integer DEFAULT 0,
    created_at        timestamptz DEFAULT now(),
    updated_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invite_links_creator ON public.invite_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON public.invite_links(invite_code);
CREATE INDEX IF NOT EXISTS idx_invite_conversions_link ON public.invite_conversions(invite_link_id);
CREATE INDEX IF NOT EXISTS idx_share_card_templates_type ON public.share_card_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);

-- ----------------------------------------------------------
-- Trigger: auto-increment use_count on conversion
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_invite_use_count()
RETURNS trigger AS $$
BEGIN
    UPDATE public.invite_links
    SET use_count = use_count + 1
    WHERE id = NEW.invite_link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_invite_use ON public.invite_conversions;
CREATE TRIGGER trg_increment_invite_use
    AFTER INSERT ON public.invite_conversions
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_invite_use_count();

-- ----------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- invite_links: creator can manage, anyone can read active links
DO $safe$ BEGIN
CREATE POLICY "invite_links_read" ON public.invite_links
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "invite_links_insert" ON public.invite_links
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "invite_links_update" ON public.invite_links
    FOR UPDATE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- invite_conversions: readable by invite creator, insertable by authenticated
DO $safe$ BEGIN
CREATE POLICY "invite_conversions_read" ON public.invite_conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invite_links
            WHERE id = invite_link_id AND creator_id = auth.uid()
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "invite_conversions_insert" ON public.invite_conversions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- share_card_templates: readable by all
DO $safe$ BEGIN
CREATE POLICY "share_card_templates_read" ON public.share_card_templates
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- campaigns: readable by all
DO $safe$ BEGIN
CREATE POLICY "campaigns_read" ON public.campaigns
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ----------------------------------------------------------
-- Seed: Share card templates
-- ----------------------------------------------------------
INSERT INTO public.share_card_templates (name, template_type, background_color, text_color, layout, sort_order) VALUES
    ('Memorial Classic',    'memorial',        '#2D1B4E', '#FFFFFF', 'standard',      1),
    ('Memorial Photo',      'memorial',        '#1F1145', '#FFFFFF', 'photo_overlay', 2),
    ('Tribute Elegant',     'tribute',         '#4A2D7A', '#FFFFFF', 'standard',      1),
    ('Tribute Minimal',     'tribute',         '#FFFFFF', '#2D1B4E', 'minimal',       2),
    ('Living Tribute',      'living_tribute',  '#059669', '#FFFFFF', 'celebration',   1),
    ('Living Tribute Photo','living_tribute',  '#047857', '#FFFFFF', 'photo_overlay', 2),
    ('Streak Fire',         'streak',          '#EF4444', '#FFFFFF', 'celebration',   1),
    ('Badge Earned',        'badge',           '#7C3AED', '#FFFFFF', 'celebration',   1),
    ('Prompt Response',     'prompt_response', '#F59E0B', '#FFFFFF', 'standard',      1),
    ('Event Invite',        'event',           '#2563EB', '#FFFFFF', 'standard',      1),
    ('Milestone',           'milestone',       '#2D1B4E', '#F59E0B', 'celebration',   1);

-- ----------------------------------------------------------
-- Seed: Campaign definitions
-- ----------------------------------------------------------
INSERT INTO public.campaigns (title, description, campaign_type, start_date, end_date, cta_text, cta_route) VALUES
    ('Mother''s Day',
     'Honor the mothers and maternal figures in your life with a living tribute.',
     'mothers_day', '2026-05-04', '2026-05-10',
     'Honor a Mother', '/living-tribute/create'),
    ('Father''s Day',
     'Celebrate fathers and father figures with a heartfelt tribute.',
     'fathers_day', '2026-06-15', '2026-06-21',
     'Honor a Father', '/living-tribute/create'),
    ('Memorial Day',
     'Remember and honor those who served our country.',
     'memorial_day', '2026-05-22', '2026-05-25',
     'Remember a Hero', '/memorial/create/basic-info'),
    ('Veterans Day',
     'Thank a veteran for their service with a living tribute.',
     'veterans_day', '2026-11-09', '2026-11-11',
     'Thank a Veteran', '/living-tribute/create'),
    ('Grandparents Day',
     'Celebrate the wisdom and love of grandparents.',
     'grandparents_day', '2026-09-07', '2026-09-13',
     'Honor a Grandparent', '/living-tribute/create'),
    ('Foreverr Day',
     'Our annual celebration of legacy, love, and remembrance.',
     'foreverr_day', '2026-10-01', '2026-10-07',
     'Join the Celebration', '/living-tribute/create');

-- === 00021_living_legacy_polish.sql ===
-- ============================================================
-- Migration 00021: Living Legacy Polish
-- Sprint 5 of Phase 5 — profile enhancements, memorial
-- conversion tracking, user share stats
-- ============================================================

-- ----------------------------------------------------------
-- 1. Profile enhancements for legacy features
-- ----------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legacy_message text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_living_tribute_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prompt_streak integer DEFAULT 0;

-- ----------------------------------------------------------
-- 2. Memorial conversion tracking
-- ----------------------------------------------------------
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS converted_from_living_tribute_id uuid;
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS page_type text DEFAULT 'memorial';

-- ----------------------------------------------------------
-- 3. user_share_stats — aggregate sharing metrics per user
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_share_stats (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_shares          integer DEFAULT 0,
    total_invites_sent    integer DEFAULT 0,
    total_conversions     integer DEFAULT 0,
    total_prompts_answered integer DEFAULT 0,
    most_shared_type      text,
    created_at            timestamptz DEFAULT now(),
    updated_at            timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_share_stats_user ON public.user_share_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_memorials_converted ON public.memorials(converted_from_living_tribute_id)
    WHERE converted_from_living_tribute_id IS NOT NULL;

-- ----------------------------------------------------------
-- Trigger: auto-create user_share_stats on profile creation
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_user_share_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_share_stats ON public.profiles;
CREATE TRIGGER trg_ensure_share_stats
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_share_stats();

-- ----------------------------------------------------------
-- Trigger: auto-update share stats on share_cards insert
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_share_stats_on_share()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id, total_shares, most_shared_type)
    VALUES (NEW.user_id, 1, NEW.target_type)
    ON CONFLICT (user_id) DO UPDATE SET
        total_shares = user_share_stats.total_shares + 1,
        most_shared_type = NEW.target_type,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_share_stats ON public.share_cards;
CREATE TRIGGER trg_update_share_stats
    AFTER INSERT ON public.share_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_share_stats_on_share();

-- ----------------------------------------------------------
-- Trigger: auto-update invite stats on invite_links insert
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_invite_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id, total_invites_sent)
    VALUES (NEW.creator_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_invites_sent = user_share_stats.total_invites_sent + 1,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invite_stats ON public.invite_links;
CREATE TRIGGER trg_update_invite_stats
    AFTER INSERT ON public.invite_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_invite_stats();

-- ----------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------
ALTER TABLE public.user_share_stats ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "user_share_stats_read" ON public.user_share_stats
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "user_share_stats_insert" ON public.user_share_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;
DO $safe$ BEGIN
CREATE POLICY "user_share_stats_update" ON public.user_share_stats
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- === 00022_gift_economy.sql ===
-- ============================================================
-- 00022_gift_economy.sql
-- Gift Economy: Gift Catalog, Transactions, Flower Walls, Reactions
-- ============================================================

-- ============================================================
-- 1. Gift Catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('flowers', 'candles', 'cards', 'stuffed_animals', 'balloons', 'custom', 'money')),
  icon text NOT NULL DEFAULT 'gift',
  image_url text,
  price_cents integer NOT NULL DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_physical boolean DEFAULT false,
  physical_partner_id uuid,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_catalog_category ON public.gift_catalog(category);

-- ============================================================
-- 2. Gift Transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('user', 'memorial', 'living_tribute')),
  recipient_id uuid NOT NULL,
  recipient_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  gift_id uuid NOT NULL REFERENCES public.gift_catalog(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  message text,
  is_anonymous boolean DEFAULT false,
  amount_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id text,
  is_physical boolean DEFAULT false,
  shipping_address jsonb,
  delivery_status text CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'returned')),
  tracking_number text,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_transactions_recipient ON public.gift_transactions(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender ON public.gift_transactions(sender_id);

-- ============================================================
-- 3. Flower Walls (Aggregated gift counts per target)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flower_walls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('user', 'memorial', 'living_tribute')),
  target_id uuid NOT NULL,
  total_flowers integer DEFAULT 0,
  total_candles integer DEFAULT 0,
  total_gifts integer DEFAULT 0,
  total_amount_cents integer DEFAULT 0,
  last_gift_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(target_type, target_id)
);

-- ============================================================
-- 4. Gift Reactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_transaction_id uuid NOT NULL REFERENCES public.gift_transactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('heart', 'pray', 'thanks', 'hug')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(gift_transaction_id, user_id)
);

-- ============================================================
-- 5. Row Level Security
-- ============================================================

-- gift_catalog: readable by all
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "gift_catalog_select" ON public.gift_catalog
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- gift_transactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "gift_transactions_select" ON public.gift_transactions
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "gift_transactions_insert" ON public.gift_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- flower_walls: readable by all
ALTER TABLE public.flower_walls ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "flower_walls_select" ON public.flower_walls
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- gift_reactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_reactions ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "gift_reactions_select" ON public.gift_reactions
  FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "gift_reactions_insert" ON public.gift_reactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- ============================================================
-- 6. Trigger: Auto-update flower_walls + calculate points_earned
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_gift_transaction()
RETURNS TRIGGER AS $$
DECLARE
  gift_category text;
  earned_points integer;
BEGIN
  -- Look up the gift category
  SELECT category INTO gift_category
  FROM public.gift_catalog
  WHERE id = NEW.gift_id;

  -- Calculate points earned based on category
  CASE gift_category
    WHEN 'flowers' THEN earned_points := 5;
    WHEN 'candles' THEN earned_points := 5;
    WHEN 'cards' THEN earned_points := 10;
    WHEN 'money' THEN earned_points := 15;
    ELSE earned_points := 10;
  END CASE;

  -- Set points_earned on the new row
  NEW.points_earned := earned_points;

  -- Upsert into flower_walls
  INSERT INTO public.flower_walls (target_type, target_id, total_flowers, total_candles, total_gifts, total_amount_cents, last_gift_at, updated_at)
  VALUES (
    NEW.recipient_type,
    NEW.recipient_id,
    CASE WHEN gift_category = 'flowers' THEN NEW.quantity ELSE 0 END,
    CASE WHEN gift_category = 'candles' THEN NEW.quantity ELSE 0 END,
    NEW.quantity,
    COALESCE(NEW.amount_cents, 0),
    now(),
    now()
  )
  ON CONFLICT (target_type, target_id) DO UPDATE SET
    total_flowers = flower_walls.total_flowers + CASE WHEN gift_category = 'flowers' THEN NEW.quantity ELSE 0 END,
    total_candles = flower_walls.total_candles + CASE WHEN gift_category = 'candles' THEN NEW.quantity ELSE 0 END,
    total_gifts = flower_walls.total_gifts + NEW.quantity,
    total_amount_cents = flower_walls.total_amount_cents + COALESCE(NEW.amount_cents, 0),
    last_gift_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gift_transaction_insert
  BEFORE INSERT ON public.gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_gift_transaction();

-- ============================================================
-- 7. Seed Data: Gift Catalog (30+ items)
-- ============================================================

-- Flowers (sort_order 1-6)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Single Rose', 'A single red rose to show you care', 'flowers', 'rose', 0, false, 1),
  ('Bouquet', 'A beautiful mixed bouquet of fresh flowers', 'flowers', 'rose', 299, false, 2),
  ('Sunflower', 'A bright sunflower to bring warmth and light', 'flowers', 'rose', 199, false, 3),
  ('Lily', 'An elegant lily symbolizing peace and remembrance', 'flowers', 'rose', 249, false, 4),
  ('Orchid', 'A graceful orchid representing eternal love', 'flowers', 'rose', 399, false, 5),
  ('Eternal Rose', 'A preserved rose that lasts forever, just like your love', 'flowers', 'rose', 999, true, 6);

-- Candles (sort_order 7-10)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Prayer Candle', 'Light a prayer candle in remembrance', 'candles', 'flame', 0, false, 7),
  ('Memorial Candle', 'A memorial candle that burns bright', 'candles', 'flame', 199, false, 8),
  ('Vigil Light', 'A vigil light to keep the memory alive', 'candles', 'flame', 299, false, 9),
  ('Eternal Flame', 'An eternal flame that never goes out', 'candles', 'flame', 799, true, 10);

-- Cards (sort_order 11-16)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Thank You Card', 'Express your gratitude with a heartfelt thank you', 'cards', 'mail', 0, false, 11),
  ('Thinking of You', 'Let someone know they are in your thoughts', 'cards', 'mail', 149, false, 12),
  ('Birthday Card', 'Celebrate a birthday with a special card', 'cards', 'mail', 199, false, 13),
  ('Get Well', 'Send warm wishes for a speedy recovery', 'cards', 'mail', 149, false, 14),
  ('Anniversary Card', 'Mark a special anniversary with love', 'cards', 'mail', 199, false, 15),
  ('Custom Message', 'Write your own personal message from the heart', 'cards', 'mail', 0, false, 16);

-- Stuffed Animals (sort_order 17-19)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Comfort Bear', 'A soft bear to bring comfort during difficult times', 'stuffed_animals', 'heart', 499, false, 17),
  ('Memorial Butterfly', 'A butterfly symbolizing transformation and hope', 'stuffed_animals', 'heart', 599, false, 18),
  ('Guardian Angel', 'A guardian angel to watch over your loved ones', 'stuffed_animals', 'heart', 699, false, 19);

-- Balloons (sort_order 20-22)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Celebration Bundle', 'A festive bundle of balloons for any occasion', 'balloons', 'balloon', 399, false, 20),
  ('Birthday Balloons', 'Colorful birthday balloons to brighten the day', 'balloons', 'balloon', 299, false, 21),
  ('Congratulations', 'Congratulations balloons to celebrate achievements', 'balloons', 'balloon', 349, false, 22);

-- Custom (sort_order 23-24)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Photo Frame', 'A digital photo frame to display cherished memories', 'custom', 'gift', 499, false, 23),
  ('Memory Book', 'A collaborative memory book for friends and family', 'custom', 'gift', 799, false, 24);

-- === 00023_legacy_points.sql ===
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

CREATE INDEX IF NOT EXISTS idx_legacy_point_balances_user ON public.legacy_point_balances(user_id);

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

CREATE INDEX IF NOT EXISTS idx_legacy_points_user ON public.legacy_points(user_id, created_at DESC);

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

DO $safe$ BEGIN
CREATE POLICY "Users can view own points"
  ON public.legacy_points FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Authenticated users can insert points"
  ON public.legacy_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- legacy_point_balances
ALTER TABLE public.legacy_point_balances ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view point balances"
  ON public.legacy_point_balances FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can update own balance"
  ON public.legacy_point_balances FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "System can insert balances"
  ON public.legacy_point_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- legacy_levels
ALTER TABLE public.legacy_levels ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Anyone can view levels"
  ON public.legacy_levels FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

-- point_redemptions
ALTER TABLE public.point_redemptions ENABLE ROW LEVEL SECURITY;

DO $safe$ BEGIN
CREATE POLICY "Users can view own redemptions"
  ON public.point_redemptions FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

DO $safe$ BEGIN
CREATE POLICY "Users can create own redemptions"
  ON public.point_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $safe$;

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

