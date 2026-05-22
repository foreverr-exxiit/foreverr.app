-- ============================================================
-- Migration 00029: Life Timeline, Milestones & Photo Face Tagging
-- Captures the complete lifecycle: birth → milestones → present/passing
-- ============================================================

-- ============================================================
-- 1. LIFE MILESTONES — Structured milestone tracking per memorial
-- ============================================================
CREATE TABLE IF NOT EXISTS life_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'birth','first_steps','first_words','first_day_school','graduation_elementary',
    'graduation_high_school','graduation_college','first_job','promotion','retirement',
    'engagement','wedding','anniversary','first_child','adoption',
    'baptism','bar_mitzvah','confirmation','first_communion',
    'first_trip','milestone_birthday','achievement','award','military_service',
    'homeownership','learned_to_drive','first_pet','custom'
  )),
  title text NOT NULL,
  description text,
  milestone_date date,
  age_at_milestone integer,
  location text,

  -- Media
  photo_url text,
  media_urls text[] DEFAULT '{}',

  -- Metadata
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES profiles(id),
  emoji text,
  sort_order integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. LIFE TIMELINE EVENTS — Unified chronological events feed
-- ============================================================
CREATE TABLE IF NOT EXISTS life_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),

  -- Event type (can be auto-generated from various sources)
  event_type text NOT NULL CHECK (event_type IN (
    'milestone','tribute','photo','memory','achievement',
    'life_event','medical','travel','education','career',
    'relationship','spiritual','hobby','community','custom'
  )),
  source_type text CHECK (source_type IN (
    'manual','auto_milestone','auto_tribute','auto_photo','import','ai_generated'
  )),
  source_id uuid, -- Reference to the original record (milestone_id, tribute_id, etc.)

  -- Content
  title text NOT NULL,
  description text,
  event_date date,
  event_end_date date, -- For multi-day events
  location text,

  -- Media
  photo_url text,
  media_urls text[] DEFAULT '{}',

  -- Display
  icon text DEFAULT 'calendar',
  color text DEFAULT '#8B5CF6',
  is_highlight boolean DEFAULT false,
  is_private boolean DEFAULT false,

  -- Ordering
  sort_date date, -- Computed date for timeline ordering (uses event_date or created_at)

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. MILESTONE TEMPLATES — Pre-defined milestone categories
-- ============================================================
CREATE TABLE IF NOT EXISTS milestone_templates (
  id serial PRIMARY KEY,
  milestone_type text NOT NULL UNIQUE,
  label text NOT NULL,
  emoji text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'childhood','education','career','relationships',
    'family','spiritual','achievements','lifestyle'
  )),
  typical_age_range text, -- e.g. "0-1", "5-6", "18-22"
  description text,
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 4. PHOTO FACE TAGS — Tag people in photos
-- ============================================================
CREATE TABLE IF NOT EXISTS photo_face_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL, -- The photo being tagged
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,

  -- Who is tagged
  tagged_memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  tagged_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tagged_name text, -- Fallback name if no memorial/profile linked

  -- Face location in image (normalized 0-1 coordinates)
  face_x numeric(5,4), -- Center X
  face_y numeric(5,4), -- Center Y
  face_width numeric(5,4),
  face_height numeric(5,4),

  -- Recognition
  confidence numeric(5,4), -- ML confidence score 0-1
  is_verified boolean DEFAULT false, -- User confirmed the tag
  is_auto_detected boolean DEFAULT false, -- Created by ML vs manual

  -- Metadata
  tagged_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. FACE EMBEDDINGS — ML face recognition vectors (backend)
-- ============================================================
CREATE TABLE IF NOT EXISTS face_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,

  -- The reference photo for this face
  source_photo_url text NOT NULL,

  -- ML embedding vector (stored as JSON array of floats)
  embedding jsonb NOT NULL,
  embedding_model text DEFAULT 'google_vision_v1',

  -- Quality
  quality_score numeric(5,4) DEFAULT 0,
  is_primary boolean DEFAULT false, -- Primary face for this person

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Either memorial_id or profile_id must be set
  CONSTRAINT face_embeddings_person_check CHECK (
    memorial_id IS NOT NULL OR profile_id IS NOT NULL
  )
);

-- ============================================================
-- 6. AUTO-REMINDER RULES — Smart reminder generation
-- ============================================================
CREATE TABLE IF NOT EXISTS auto_reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,

  rule_type text NOT NULL CHECK (rule_type IN (
    'birthday','death_anniversary','wedding_anniversary',
    'milestone_birthday','custom_recurring','days_before'
  )),
  title_template text NOT NULL, -- e.g. "{name}'s birthday is tomorrow!"
  days_before integer DEFAULT 1, -- How many days before to remind
  is_recurring boolean DEFAULT true,
  is_enabled boolean DEFAULT true,

  -- For custom recurring
  recurring_month integer, -- 1-12
  recurring_day integer, -- 1-31

  last_triggered_at timestamptz,
  next_trigger_date date,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-set sort_date on life_timeline_events
CREATE OR REPLACE FUNCTION set_timeline_sort_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sort_date := COALESCE(NEW.event_date, NEW.created_at::date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timeline_sort_date
  BEFORE INSERT OR UPDATE ON life_timeline_events
  FOR EACH ROW EXECUTE FUNCTION set_timeline_sort_date();

-- Auto-create timeline event when milestone is created
CREATE OR REPLACE FUNCTION auto_timeline_from_milestone()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO life_timeline_events (
    memorial_id, created_by, event_type, source_type, source_id,
    title, description, event_date, photo_url, media_urls,
    icon, is_highlight
  ) VALUES (
    NEW.memorial_id, NEW.created_by, 'milestone', 'auto_milestone', NEW.id,
    NEW.title, NEW.description, NEW.milestone_date, NEW.photo_url, NEW.media_urls,
    COALESCE(NEW.emoji, 'star'), true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_timeline_from_milestone
  AFTER INSERT ON life_milestones
  FOR EACH ROW EXECUTE FUNCTION auto_timeline_from_milestone();

-- Auto-compute next_trigger_date for auto_reminder_rules
CREATE OR REPLACE FUNCTION compute_next_trigger()
RETURNS TRIGGER AS $$
DECLARE
  base_date date;
BEGIN
  IF NEW.rule_type IN ('birthday','death_anniversary','wedding_anniversary','milestone_birthday') THEN
    -- Calculate from memorial dates
    IF NEW.memorial_id IS NOT NULL THEN
      SELECT
        CASE NEW.rule_type
          WHEN 'birthday' THEN date_of_birth
          WHEN 'death_anniversary' THEN date_of_death
          ELSE date_of_birth
        END INTO base_date
      FROM memorials WHERE id = NEW.memorial_id;

      IF base_date IS NOT NULL THEN
        -- Next occurrence this year or next year
        base_date := make_date(
          EXTRACT(YEAR FROM CURRENT_DATE)::int,
          EXTRACT(MONTH FROM base_date)::int,
          EXTRACT(DAY FROM base_date)::int
        );
        IF base_date < CURRENT_DATE THEN
          base_date := base_date + interval '1 year';
        END IF;
        NEW.next_trigger_date := base_date - (NEW.days_before || ' days')::interval;
      END IF;
    END IF;
  ELSIF NEW.rule_type = 'custom_recurring' AND NEW.recurring_month IS NOT NULL AND NEW.recurring_day IS NOT NULL THEN
    base_date := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::int,
      NEW.recurring_month,
      NEW.recurring_day
    );
    IF base_date < CURRENT_DATE THEN
      base_date := base_date + interval '1 year';
    END IF;
    NEW.next_trigger_date := base_date - (NEW.days_before || ' days')::interval;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_next_trigger
  BEFORE INSERT OR UPDATE ON auto_reminder_rules
  FOR EACH ROW EXECUTE FUNCTION compute_next_trigger();

-- ============================================================
-- SEED: Milestone Templates
-- ============================================================
INSERT INTO milestone_templates (milestone_type, label, emoji, category, typical_age_range, description, sort_order) VALUES
  -- Childhood
  ('birth', 'Born', '👶', 'childhood', '0', 'The day it all began', 1),
  ('first_steps', 'First Steps', '🚶', 'childhood', '0-2', 'Those magical first steps', 2),
  ('first_words', 'First Words', '🗣️', 'childhood', '0-2', 'The first time they spoke', 3),
  ('first_day_school', 'First Day of School', '🎒', 'childhood', '4-6', 'A big day for everyone', 4),
  ('first_pet', 'First Pet', '🐾', 'childhood', '3-10', 'Their first furry friend', 5),

  -- Education
  ('graduation_elementary', 'Elementary Graduation', '🎓', 'education', '10-12', 'Moving on up', 10),
  ('graduation_high_school', 'High School Graduation', '🎓', 'education', '17-19', 'A major achievement', 11),
  ('graduation_college', 'College Graduation', '🎓', 'education', '21-25', 'Degree earned', 12),

  -- Career
  ('first_job', 'First Job', '💼', 'career', '16-22', 'Entering the workforce', 20),
  ('promotion', 'Promotion', '📈', 'career', NULL, 'Moving up in their career', 21),
  ('retirement', 'Retirement', '🏖️', 'career', '55-70', 'A well-earned rest', 22),
  ('military_service', 'Military Service', '🎖️', 'career', '18-65', 'Serving their country', 23),

  -- Relationships
  ('engagement', 'Engagement', '💍', 'relationships', NULL, 'They said yes!', 30),
  ('wedding', 'Wedding Day', '💒', 'relationships', NULL, 'The big day', 31),
  ('anniversary', 'Anniversary', '🕊️', 'relationships', NULL, 'Celebrating years together', 32),

  -- Family
  ('first_child', 'First Child Born', '👨‍👩‍👧', 'family', NULL, 'Welcome to parenthood', 40),
  ('adoption', 'Adoption', '❤️', 'family', NULL, 'A family grows with love', 41),

  -- Spiritual
  ('baptism', 'Baptism', '💧', 'spiritual', '0-1', 'A spiritual beginning', 50),
  ('bar_mitzvah', 'Bar/Bat Mitzvah', '✡️', 'spiritual', '12-13', 'Coming of age', 51),
  ('first_communion', 'First Communion', '🕯️', 'spiritual', '7-8', 'A sacred moment', 52),
  ('confirmation', 'Confirmation', '✝️', 'spiritual', '13-16', 'Affirming faith', 53),

  -- Achievements
  ('achievement', 'Achievement', '🏆', 'achievements', NULL, 'Something worth celebrating', 60),
  ('award', 'Award', '🏅', 'achievements', NULL, 'Recognized for excellence', 61),

  -- Lifestyle
  ('learned_to_drive', 'Learned to Drive', '🚗', 'lifestyle', '16-18', 'Freedom on wheels', 70),
  ('homeownership', 'Bought a Home', '🏠', 'lifestyle', NULL, 'Keys to their own place', 71),
  ('first_trip', 'First Big Trip', '✈️', 'lifestyle', NULL, 'Exploring the world', 72),
  ('milestone_birthday', 'Milestone Birthday', '🎂', 'lifestyle', NULL, 'A birthday worth celebrating', 73),
  ('custom', 'Custom Milestone', '⭐', 'lifestyle', NULL, 'A special moment in their story', 99)
ON CONFLICT (milestone_type) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

-- life_milestones
ALTER TABLE life_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestones"
  ON life_milestones FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create milestones"
  ON life_milestones FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their milestones"
  ON life_milestones FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete their milestones"
  ON life_milestones FOR DELETE
  USING (auth.uid() = created_by);

-- life_timeline_events
ALTER TABLE life_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public timeline events are readable"
  ON life_timeline_events FOR SELECT
  USING (is_private = false OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create timeline events"
  ON life_timeline_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their timeline events"
  ON life_timeline_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete their timeline events"
  ON life_timeline_events FOR DELETE
  USING (auth.uid() = created_by);

-- milestone_templates (public read-only)
ALTER TABLE milestone_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestone templates"
  ON milestone_templates FOR SELECT USING (true);

-- photo_face_tags
ALTER TABLE photo_face_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read face tags"
  ON photo_face_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create face tags"
  ON photo_face_tags FOR INSERT
  WITH CHECK (auth.uid() = tagged_by);

CREATE POLICY "Tag creator can update"
  ON photo_face_tags FOR UPDATE
  USING (auth.uid() = tagged_by);

CREATE POLICY "Tag creator can delete"
  ON photo_face_tags FOR DELETE
  USING (auth.uid() = tagged_by);

-- face_embeddings (admin/system only for writes, restricted reads)
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage face embeddings"
  ON face_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read embeddings for their memorials"
  ON face_embeddings FOR SELECT
  USING (
    memorial_id IN (
      SELECT id FROM memorials WHERE created_by = auth.uid()
    )
    OR profile_id = auth.uid()
  );

-- auto_reminder_rules
ALTER TABLE auto_reminder_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminder rules"
  ON auto_reminder_rules FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_life_milestones_memorial ON life_milestones(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_milestones_type ON life_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_life_milestones_date ON life_milestones(milestone_date);

CREATE INDEX IF NOT EXISTS idx_life_timeline_memorial ON life_timeline_events(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_timeline_sort_date ON life_timeline_events(sort_date DESC);
CREATE INDEX IF NOT EXISTS idx_life_timeline_event_type ON life_timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_life_timeline_source ON life_timeline_events(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_photo_face_tags_photo ON photo_face_tags(photo_url);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_memorial ON photo_face_tags(memorial_id);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_tagged_memorial ON photo_face_tags(tagged_memorial_id);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_tagged_profile ON photo_face_tags(tagged_profile_id);

CREATE INDEX IF NOT EXISTS idx_face_embeddings_memorial ON face_embeddings(memorial_id);
CREATE INDEX IF NOT EXISTS idx_face_embeddings_profile ON face_embeddings(profile_id);

CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_user ON auto_reminder_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_next ON auto_reminder_rules(next_trigger_date) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_memorial ON auto_reminder_rules(memorial_id);
