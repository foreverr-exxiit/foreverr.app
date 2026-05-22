-- ============================================================
-- Migration 00046: Relationship Lifecycle
-- Tracks relationship transitions (marriage, divorce, remarriage)
-- in The Arc timeline. Adds chapter linking for wedding pages
-- and status tracking for family tree connections.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ALTER family_tree_connections — add status tracking
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN status text DEFAULT 'active'
    CHECK (status IN ('active', 'separated', 'divorced', 'widowed', 'annulled', 'reconciled', 'ended'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN status_date date;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN status_note text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE family_tree_connections ADD COLUMN is_current boolean DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 2. ALTER wedding_pages — add relationship lifecycle fields
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN chapter integer DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN relationship_status text DEFAULT 'active'
    CHECK (relationship_status IN ('engaged', 'married', 'separated', 'divorced', 'widowed', 'renewed', 'other'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN status_changed_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN previous_page_id uuid REFERENCES wedding_pages(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE wedding_pages ADD COLUMN next_page_id uuid REFERENCES wedding_pages(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 3. RELATIONSHIP EVENTS — significant transitions
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS relationship_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id    uuid REFERENCES family_tree_connections(id) ON DELETE SET NULL,
  wedding_page_id  uuid REFERENCES wedding_pages(id) ON DELETE SET NULL,
  event_type       text NOT NULL CHECK (event_type IN (
    'engagement', 'wedding', 'anniversary', 'separation', 'divorce',
    'reconciliation', 'remarriage', 'vow_renewal', 'civil_union',
    'widowed', 'custody_arrangement'
  )),
  event_date       date NOT NULL,
  title            text NOT NULL,
  description      text,
  is_private       boolean DEFAULT true,  -- Sensitive events default to private
  media_urls       text[] DEFAULT '{}',
  emotional_tag    text CHECK (emotional_tag IN (
    'joyful', 'bittersweet', 'difficult', 'hopeful', 'peaceful', 'grateful'
  )),
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_relationship_events_user ON relationship_events(user_id);
CREATE INDEX idx_relationship_events_wedding ON relationship_events(wedding_page_id);
CREATE INDEX idx_relationship_events_connection ON relationship_events(connection_id);
CREATE INDEX idx_relationship_events_date ON relationship_events(user_id, event_date);

-- ────────────────────────────────────────────────────────────
-- 4. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE relationship_events ENABLE ROW LEVEL SECURITY;

-- Owner always sees their own events
CREATE POLICY "relationship_events_select_own" ON relationship_events
  FOR SELECT USING (
    user_id = auth.uid()
    OR (is_private = false)
  );

CREATE POLICY "relationship_events_insert" ON relationship_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "relationship_events_update" ON relationship_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "relationship_events_delete" ON relationship_events
  FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. AUTO-GENERATE TIMELINE EVENT on relationship event creation
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_timeline_from_relationship_event()
RETURNS TRIGGER AS $$
DECLARE
  event_icon text;
  event_color text;
BEGIN
  -- Map event types to icons and colors
  CASE NEW.event_type
    WHEN 'engagement' THEN event_icon := '💍'; event_color := '#EC4899';
    WHEN 'wedding' THEN event_icon := '💒'; event_color := '#F59E0B';
    WHEN 'anniversary' THEN event_icon := '🥂'; event_color := '#D97706';
    WHEN 'separation' THEN event_icon := '💔'; event_color := '#6B7280';
    WHEN 'divorce' THEN event_icon := '📄'; event_color := '#6B7280';
    WHEN 'reconciliation' THEN event_icon := '🤝'; event_color := '#10B981';
    WHEN 'remarriage' THEN event_icon := '💒'; event_color := '#7C3AED';
    WHEN 'vow_renewal' THEN event_icon := '💕'; event_color := '#EC4899';
    WHEN 'civil_union' THEN event_icon := '🤝'; event_color := '#3B82F6';
    WHEN 'widowed' THEN event_icon := '🕊️'; event_color := '#6B7280';
    WHEN 'custody_arrangement' THEN event_icon := '👨‍👩‍👧'; event_color := '#8B5CF6';
    ELSE event_icon := '❤️'; event_color := '#EC4899';
  END CASE;

  -- Only create timeline events for non-private relationship events
  IF NEW.is_private = false THEN
    -- Find a memorial linked to this user to attach the timeline event
    INSERT INTO life_timeline_events (
      memorial_id, created_by, event_type, source_type, source_id,
      title, description, event_date, icon, color, is_private, is_highlight
    )
    SELECT
      m.id, NEW.user_id, 'relationship', 'manual', NEW.id::text,
      NEW.title, NEW.description, NEW.event_date::timestamptz,
      event_icon, event_color, NEW.is_private, true
    FROM memorials m
    WHERE m.created_by = NEW.user_id
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_relationship_timeline
  AFTER INSERT ON relationship_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_timeline_from_relationship_event();
