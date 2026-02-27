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
CREATE INDEX idx_celebrity_death_month_day ON celebrity_memorials(death_month, death_day) WHERE is_active = true;
CREATE INDEX idx_celebrity_category ON celebrity_memorials(category) WHERE is_active = true;
CREATE INDEX idx_celebrity_featured ON celebrity_memorials(is_featured) WHERE is_active = true AND is_featured = true;
CREATE INDEX idx_celebrity_created_at ON celebrity_memorials(created_at DESC) WHERE is_active = true;

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

CREATE INDEX idx_news_category ON news_items(category) WHERE is_active = true;
CREATE INDEX idx_news_published ON news_items(published_at DESC) WHERE is_active = true;
CREATE INDEX idx_news_featured ON news_items(is_featured) WHERE is_active = true AND is_featured = true;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE celebrity_memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon/guest) can read active entries
CREATE POLICY "celebrity_memorials_public_read" ON celebrity_memorials
  FOR SELECT USING (is_active = true);

CREATE POLICY "news_items_public_read" ON news_items
  FOR SELECT USING (is_active = true);

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
