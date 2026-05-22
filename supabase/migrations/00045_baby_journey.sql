-- ============================================================
-- Migration 00045: Baby Journey ("Little Arcs")
-- Dedicated page type for tracking a child's journey from
-- pregnancy through adulthood. Follows pet_pages/wedding_pages pattern.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. BABY PAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_pages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  baby_name         text NOT NULL,
  nickname          text,
  date_of_birth     date,
  due_date          date,
  gender            text CHECK (gender IN ('boy', 'girl', 'non_binary', 'surprise', 'other')),
  birth_weight_oz   integer,
  birth_length_in   numeric(5,2),
  profile_photo_url text,
  cover_photo_url   text,
  bio               text,
  current_stage     text DEFAULT 'expecting' CHECK (current_stage IN (
    'expecting', 'newborn', 'infant', 'toddler', 'preschool',
    'elementary', 'tween', 'teenager', 'young_adult', 'adult'
  )),
  privacy           text DEFAULT 'private' CHECK (privacy IN ('public', 'family', 'private')),
  status            text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  slug              text UNIQUE,
  follower_count    integer DEFAULT 0,
  milestone_count   integer DEFAULT 0,
  photo_count       integer DEFAULT 0,
  update_count      integer DEFAULT 0,
  lifecycle_stage   text DEFAULT 'celebrate',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_baby_pages_created_by ON baby_pages(created_by);
CREATE INDEX idx_baby_pages_slug ON baby_pages(slug);

-- Auto-generate slug from baby name
CREATE OR REPLACE FUNCTION generate_baby_page_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.baby_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM baby_pages WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_baby_page_slug
  BEFORE INSERT ON baby_pages
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_baby_page_slug();

-- Auto-add creator as page_host owner
CREATE OR REPLACE FUNCTION auto_add_baby_page_host()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_hosts (page_type, page_id, user_id, role, status)
  VALUES ('baby', NEW.id, NEW.created_by, 'owner', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_page_host
  AFTER INSERT ON baby_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_baby_page_host();

-- ────────────────────────────────────────────────────────────
-- 2. BABY MILESTONES — age-specific milestone tracking
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_milestones (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_page_id     uuid NOT NULL REFERENCES baby_pages(id) ON DELETE CASCADE,
  created_by       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stage            text NOT NULL CHECK (stage IN (
    'expecting', 'newborn', 'infant', 'toddler', 'preschool',
    'elementary', 'tween', 'teenager', 'young_adult', 'adult'
  )),
  milestone_type   text NOT NULL CHECK (milestone_type IN (
    -- Expecting (10)
    'first_ultrasound', 'gender_reveal', 'first_kick', 'baby_shower',
    'nursery_ready', 'birth_plan', 'hospital_bag', 'contractions_start',
    'water_broke', 'birth',
    -- Newborn (8)
    'first_cry', 'first_hold', 'first_feed', 'umbilical_cord_off',
    'first_bath', 'first_smile', 'first_night_home', 'naming_ceremony',
    -- Infant 0-12m (10)
    'first_laugh', 'first_roll', 'first_solid_food', 'first_tooth',
    'first_crawl', 'first_steps', 'first_word', 'first_haircut',
    'first_birthday', 'first_wave',
    -- Toddler 1-3y (8)
    'first_sentence', 'potty_trained', 'first_friend', 'first_tantrum',
    'first_drawing', 'learned_abc', 'first_bike', 'started_daycare',
    -- Preschool 3-5y (6)
    'first_day_preschool', 'learned_to_write_name', 'first_performance',
    'lost_first_tooth', 'first_sleepover', 'kindergarten_ready',
    -- Elementary 5-11y (6)
    'first_day_school', 'first_report_card', 'learned_to_read',
    'first_sports_team', 'first_instrument', 'elementary_graduation',
    -- Tween/Teen 11-18y (6)
    'middle_school', 'first_phone', 'learners_permit', 'first_date',
    'high_school_graduation', 'college_acceptance',
    -- Young Adult 18+ (4)
    'moved_out', 'first_job', 'college_graduation', 'first_apartment',
    -- Custom
    'custom'
  )),
  title            text NOT NULL,
  description      text,
  milestone_date   date,
  age_at_milestone text,  -- e.g. "3 months", "2 years 4 months"
  photo_url        text,
  media_urls       text[] DEFAULT '{}',
  height_in        numeric(5,2),
  weight_oz        integer,
  emoji            text,
  sort_order       integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_baby_milestones_page ON baby_milestones(baby_page_id);
CREATE INDEX idx_baby_milestones_stage ON baby_milestones(baby_page_id, stage);

-- Auto-update milestone_count on baby_pages
CREATE OR REPLACE FUNCTION update_baby_milestone_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE baby_pages SET milestone_count = milestone_count + 1, updated_at = now()
    WHERE id = NEW.baby_page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE baby_pages SET milestone_count = GREATEST(0, milestone_count - 1), updated_at = now()
    WHERE id = OLD.baby_page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_milestone_count
  AFTER INSERT OR DELETE ON baby_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_milestone_count();

-- ────────────────────────────────────────────────────────────
-- 3. BABY UPDATES — journal-style entries
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_updates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_page_id     uuid NOT NULL REFERENCES baby_pages(id) ON DELETE CASCADE,
  author_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content          text NOT NULL,
  media_url        text,
  media_type       text CHECK (media_type IN ('photo', 'video', 'voice')),
  mood             text CHECK (mood IN (
    'joyful', 'proud', 'tired', 'grateful', 'emotional', 'funny', 'challenging'
  )),
  stage            text,
  reaction_count   integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_baby_updates_page ON baby_updates(baby_page_id);

-- Auto-update update_count on baby_pages
CREATE OR REPLACE FUNCTION update_baby_update_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE baby_pages SET update_count = update_count + 1, updated_at = now()
    WHERE id = NEW.baby_page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE baby_pages SET update_count = GREATEST(0, update_count - 1), updated_at = now()
    WHERE id = OLD.baby_page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_update_count
  AFTER INSERT OR DELETE ON baby_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_update_count();

-- ────────────────────────────────────────────────────────────
-- 4. STAGE AUTO-PROGRESSION — update current_stage based on age
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_baby_stage()
RETURNS TRIGGER AS $$
DECLARE
  dob date;
  age_days integer;
  new_stage text;
BEGIN
  SELECT date_of_birth INTO dob FROM baby_pages WHERE id = NEW.baby_page_id;

  IF dob IS NULL THEN
    RETURN NEW;
  END IF;

  age_days := CURRENT_DATE - dob;

  IF age_days < 0 THEN
    new_stage := 'expecting';
  ELSIF age_days <= 28 THEN
    new_stage := 'newborn';
  ELSIF age_days <= 365 THEN
    new_stage := 'infant';
  ELSIF age_days <= 1095 THEN  -- 3 years
    new_stage := 'toddler';
  ELSIF age_days <= 1825 THEN  -- 5 years
    new_stage := 'preschool';
  ELSIF age_days <= 4015 THEN  -- 11 years
    new_stage := 'elementary';
  ELSIF age_days <= 4745 THEN  -- 13 years
    new_stage := 'tween';
  ELSIF age_days <= 6570 THEN  -- 18 years
    new_stage := 'teenager';
  ELSIF age_days <= 9125 THEN  -- 25 years
    new_stage := 'young_adult';
  ELSE
    new_stage := 'adult';
  END IF;

  UPDATE baby_pages SET current_stage = new_stage, updated_at = now()
  WHERE id = NEW.baby_page_id AND current_stage != new_stage;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_baby_stage_update
  AFTER INSERT ON baby_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_stage();

-- ────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE baby_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_updates ENABLE ROW LEVEL SECURITY;

-- baby_pages: public pages visible to all, private/family only to hosts
CREATE POLICY "baby_pages_select" ON baby_pages
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_pages.id
        AND user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "baby_pages_insert" ON baby_pages
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "baby_pages_update" ON baby_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_pages.id
        AND user_id = auth.uid() AND role IN ('owner', 'co_host') AND status = 'active'
    )
  );

CREATE POLICY "baby_pages_delete" ON baby_pages
  FOR DELETE USING (created_by = auth.uid());

-- baby_milestones: visible if parent page is visible
CREATE POLICY "baby_milestones_select" ON baby_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM baby_pages bp
      WHERE bp.id = baby_milestones.baby_page_id
        AND (
          bp.privacy = 'public'
          OR bp.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM page_hosts
            WHERE page_type = 'baby' AND page_id = bp.id
              AND user_id = auth.uid() AND status = 'active'
          )
        )
    )
  );

CREATE POLICY "baby_milestones_insert" ON baby_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_milestones.baby_page_id
        AND user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "baby_milestones_update" ON baby_milestones
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_milestones.baby_page_id
        AND user_id = auth.uid() AND role IN ('owner', 'co_host') AND status = 'active'
    )
  );

CREATE POLICY "baby_milestones_delete" ON baby_milestones
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_milestones.baby_page_id
        AND user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- baby_updates: same pattern
CREATE POLICY "baby_updates_select" ON baby_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM baby_pages bp
      WHERE bp.id = baby_updates.baby_page_id
        AND (
          bp.privacy = 'public'
          OR bp.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM page_hosts
            WHERE page_type = 'baby' AND page_id = bp.id
              AND user_id = auth.uid() AND status = 'active'
          )
        )
    )
  );

CREATE POLICY "baby_updates_insert" ON baby_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_updates.baby_page_id
        AND user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "baby_updates_delete" ON baby_updates
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts
      WHERE page_type = 'baby' AND page_id = baby_updates.baby_page_id
        AND user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );
