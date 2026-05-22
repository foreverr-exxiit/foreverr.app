-- ============================================================
-- Migration 00036: Wedding Pages & Pet Pages
-- Celebration pages for weddings and beloved pets.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. WEDDING PAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_pages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner1_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  partner2_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  partner1_name    text NOT NULL,
  partner2_name    text NOT NULL,
  wedding_date     date,
  venue_name       text,
  venue_address    text,
  venue_url        text,
  cover_photo_url  text,
  profile_photo_url text,
  story            text,  -- "How we met"
  hashtag          text,
  color_scheme     jsonb DEFAULT '{"primary": "#F59E0B", "secondary": "#FEF3C7"}'::jsonb,
  privacy          text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited')),
  status           text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  slug             text UNIQUE,
  rsvp_enabled     boolean DEFAULT true,
  registry_url     text,
  livestream_url   text,
  follower_count   integer DEFAULT 0,
  message_count    integer DEFAULT 0,
  photo_count      integer DEFAULT 0,
  lifecycle_stage  text DEFAULT 'celebrate',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Auto-generate slug from partner names + year (e.g. 'sarah-and-james-2026')
CREATE OR REPLACE FUNCTION generate_wedding_page_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
  yr text;
BEGIN
  yr := COALESCE(EXTRACT(YEAR FROM NEW.wedding_date)::text, EXTRACT(YEAR FROM now())::text);
  base_slug := lower(regexp_replace(NEW.partner1_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 20) || '-and-';
  base_slug := base_slug || lower(regexp_replace(NEW.partner2_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 45) || '-' || yr;
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM wedding_pages WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wedding_page_slug
  BEFORE INSERT ON wedding_pages
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_wedding_page_slug();


-- ────────────────────────────────────────────────────────────
-- 1b. WEDDING RSVPs
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_rsvps (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id           uuid NOT NULL REFERENCES wedding_pages(id) ON DELETE CASCADE,
  user_id              uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name           text NOT NULL,
  guest_email          text,
  party_size           integer DEFAULT 1 CHECK (party_size >= 1),
  dietary_restrictions text,
  status               text DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not_attending', 'maybe')),
  message              text,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 1c. WEDDING PARTY
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_party (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES wedding_pages(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name       text NOT NULL,
  role       text NOT NULL CHECK (role IN (
    'maid_of_honor', 'best_man', 'bridesmaid', 'groomsman',
    'flower_girl', 'ring_bearer', 'officiant', 'other'
  )),
  photo_url  text,
  bio        text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 1d. WEDDING MESSAGES (guest book / wall)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wedding_messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id     uuid NOT NULL REFERENCES wedding_pages(id) ON DELETE CASCADE,
  author_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name    text,
  content        text NOT NULL,
  media_url      text,
  media_type     text CHECK (media_type IN ('photo', 'video', 'voice')),
  is_anonymous   boolean DEFAULT false,
  reaction_count integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2. PET PAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_pages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_name            text NOT NULL,
  species             text NOT NULL CHECK (species IN (
    'dog', 'cat', 'bird', 'fish', 'horse', 'rabbit',
    'hamster', 'reptile', 'other'
  )),
  breed               text,
  date_of_birth       date,
  date_of_passing     date,
  adoption_date       date,
  profile_photo_url   text,
  cover_photo_url     text,
  bio                 text,
  personality_traits  text[],
  favorite_things     text[],
  privacy             text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited')),
  status              text DEFAULT 'active' CHECK (status IN ('active', 'memorial', 'archived')),
  slug                text UNIQUE,
  follower_count      integer DEFAULT 0,
  tribute_count       integer DEFAULT 0,
  photo_count         integer DEFAULT 0,
  lifecycle_stage     text DEFAULT 'celebrate',
  last_interaction_at timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Auto-generate slug from pet name
CREATE OR REPLACE FUNCTION generate_pet_page_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.pet_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM pet_pages WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pet_page_slug
  BEFORE INSERT ON pet_pages
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_pet_page_slug();


-- ────────────────────────────────────────────────────────────
-- 2b. PET MILESTONES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_milestones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         uuid NOT NULL REFERENCES pet_pages(id) ON DELETE CASCADE,
  title          text NOT NULL,
  description    text,
  milestone_date date,
  photo_url      text,
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'birthday', 'adoption_day', 'training', 'health',
    'travel', 'achievement', 'funny_moment', 'other'
  )),
  created_at     timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2c. PET TRIBUTES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_tributes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         uuid NOT NULL REFERENCES pet_pages(id) ON DELETE CASCADE,
  author_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        text,
  media_url      text,
  media_type     text CHECK (media_type IN ('photo', 'video', 'voice')),
  reaction_count integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ────────────────────────────────────────────────────────────

-- Wedding pages
CREATE INDEX idx_wedding_pages_partner1 ON wedding_pages(partner1_user_id);
CREATE INDEX idx_wedding_pages_partner2 ON wedding_pages(partner2_user_id);
CREATE INDEX idx_wedding_pages_slug ON wedding_pages(slug);
CREATE INDEX idx_wedding_pages_status ON wedding_pages(status);
CREATE INDEX idx_wedding_pages_date ON wedding_pages(wedding_date);

-- Wedding RSVPs
CREATE INDEX idx_wedding_rsvps_wedding ON wedding_rsvps(wedding_id);
CREATE INDEX idx_wedding_rsvps_user ON wedding_rsvps(user_id);
CREATE INDEX idx_wedding_rsvps_status ON wedding_rsvps(status);

-- Wedding party
CREATE INDEX idx_wedding_party_wedding ON wedding_party(wedding_id);
CREATE INDEX idx_wedding_party_user ON wedding_party(user_id);

-- Wedding messages
CREATE INDEX idx_wedding_messages_wedding ON wedding_messages(wedding_id);
CREATE INDEX idx_wedding_messages_author ON wedding_messages(author_id);

-- Pet pages
CREATE INDEX idx_pet_pages_created_by ON pet_pages(created_by);
CREATE INDEX idx_pet_pages_slug ON pet_pages(slug);
CREATE INDEX idx_pet_pages_species ON pet_pages(species);
CREATE INDEX idx_pet_pages_status ON pet_pages(status);

-- Pet milestones
CREATE INDEX idx_pet_milestones_pet ON pet_milestones(pet_id);
CREATE INDEX idx_pet_milestones_type ON pet_milestones(milestone_type);

-- Pet tributes
CREATE INDEX idx_pet_tributes_pet ON pet_tributes(pet_id);
CREATE INDEX idx_pet_tributes_author ON pet_tributes(author_id);


-- ────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE wedding_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_party ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_tributes ENABLE ROW LEVEL SECURITY;

-- ── Wedding Pages ──

CREATE POLICY "wedding_pages_select" ON wedding_pages
  FOR SELECT USING (
    privacy = 'public'
    OR partner1_user_id = auth.uid()
    OR partner2_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_pages.id
        AND ph.user_id = auth.uid()
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_pages_insert" ON wedding_pages
  FOR INSERT WITH CHECK (
    auth.uid() = partner1_user_id OR auth.uid() = partner2_user_id
  );

CREATE POLICY "wedding_pages_update" ON wedding_pages
  FOR UPDATE USING (
    partner1_user_id = auth.uid()
    OR partner2_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_pages.id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_pages_delete" ON wedding_pages
  FOR DELETE USING (
    partner1_user_id = auth.uid()
    OR partner2_user_id = auth.uid()
  );

-- ── Wedding RSVPs ──

CREATE POLICY "wedding_rsvps_select" ON wedding_rsvps
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_rsvps.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_rsvps.wedding_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_rsvps_insert" ON wedding_rsvps
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "wedding_rsvps_update" ON wedding_rsvps
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_rsvps.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

-- ── Wedding Party ──

CREATE POLICY "wedding_party_select" ON wedding_party
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.privacy = 'public' OR wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

CREATE POLICY "wedding_party_insert" ON wedding_party
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_party.wedding_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_party_update" ON wedding_party
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'wedding'
        AND ph.page_id = wedding_party.wedding_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "wedding_party_delete" ON wedding_party
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_party.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

-- ── Wedding Messages ──

CREATE POLICY "wedding_messages_select" ON wedding_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_messages.wedding_id
      AND (wp.privacy = 'public' OR wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

CREATE POLICY "wedding_messages_insert" ON wedding_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "wedding_messages_update" ON wedding_messages
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "wedding_messages_delete" ON wedding_messages
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wedding_pages wp
      WHERE wp.id = wedding_messages.wedding_id
      AND (wp.partner1_user_id = auth.uid() OR wp.partner2_user_id = auth.uid())
    )
  );

-- ── Pet Pages ──

CREATE POLICY "pet_pages_select" ON pet_pages
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_pages.id
        AND ph.user_id = auth.uid()
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_pages_insert" ON pet_pages
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "pet_pages_update" ON pet_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_pages.id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_pages_delete" ON pet_pages
  FOR DELETE USING (created_by = auth.uid());

-- ── Pet Milestones ──

CREATE POLICY "pet_milestones_select" ON pet_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND (pp.privacy = 'public' OR pp.created_by = auth.uid())
    )
  );

CREATE POLICY "pet_milestones_insert" ON pet_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND pp.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_milestones.pet_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_milestones_update" ON pet_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND pp.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM page_hosts ph
      WHERE ph.page_type = 'pet_page'
        AND ph.page_id = pet_milestones.pet_id
        AND ph.user_id = auth.uid()
        AND ph.role IN ('owner', 'co_host')
        AND ph.invite_status = 'accepted'
    )
  );

CREATE POLICY "pet_milestones_delete" ON pet_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_milestones.pet_id
      AND pp.created_by = auth.uid()
    )
  );

-- ── Pet Tributes ──

CREATE POLICY "pet_tributes_select" ON pet_tributes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_tributes.pet_id
      AND (pp.privacy = 'public' OR pp.created_by = auth.uid())
    )
  );

CREATE POLICY "pet_tributes_insert" ON pet_tributes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "pet_tributes_update" ON pet_tributes
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "pet_tributes_delete" ON pet_tributes
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM pet_pages pp
      WHERE pp.id = pet_tributes.pet_id
      AND pp.created_by = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 5. AUTO-CREATE page_hosts OWNER ON INSERT
-- ────────────────────────────────────────────────────────────

-- Wedding pages: both partners become owners
CREATE OR REPLACE FUNCTION auto_create_wedding_page_hosts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner1_user_id IS NOT NULL THEN
    INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
    VALUES ('wedding', NEW.id, NEW.partner1_user_id, 'owner', 'spouse', 'accepted')
    ON CONFLICT (page_type, page_id, user_id) DO NOTHING;
  END IF;

  IF NEW.partner2_user_id IS NOT NULL THEN
    INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
    VALUES ('wedding', NEW.id, NEW.partner2_user_id, 'owner', 'spouse', 'accepted')
    ON CONFLICT (page_type, page_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_wedding_page_hosts
  AFTER INSERT ON wedding_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_wedding_page_hosts();

-- Pet pages: creator becomes owner
CREATE OR REPLACE FUNCTION auto_create_pet_page_hosts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_hosts (page_type, page_id, user_id, role, relationship, invite_status)
  VALUES ('pet_page', NEW.id, NEW.created_by, 'owner', 'pet_owner', 'accepted')
  ON CONFLICT (page_type, page_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_pet_page_hosts
  AFTER INSERT ON pet_pages
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_pet_page_hosts();


-- ────────────────────────────────────────────────────────────
-- 6. COUNT-UPDATE TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-update wedding_pages.message_count
CREATE OR REPLACE FUNCTION update_wedding_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wedding_pages
    SET message_count = message_count + 1, updated_at = now()
    WHERE id = NEW.wedding_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wedding_pages
    SET message_count = GREATEST(message_count - 1, 0), updated_at = now()
    WHERE id = OLD.wedding_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wedding_message_count
  AFTER INSERT OR DELETE ON wedding_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_wedding_message_count();

-- Auto-update pet_pages.tribute_count
CREATE OR REPLACE FUNCTION update_pet_tribute_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pet_pages
    SET tribute_count = tribute_count + 1, updated_at = now()
    WHERE id = NEW.pet_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pet_pages
    SET tribute_count = GREATEST(tribute_count - 1, 0), updated_at = now()
    WHERE id = OLD.pet_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pet_tribute_count
  AFTER INSERT OR DELETE ON pet_tributes
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_tribute_count();
