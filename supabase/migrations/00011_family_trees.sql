-- Phase 4: Family Trees & Memorial Connections
-- Migration: 00011_family_trees.sql

-- ============================================================
-- Family Trees (connect memorials into lineages)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_family_trees_created_by ON family_trees(created_by);

ALTER TABLE family_trees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public trees" ON family_trees
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creator can view own trees" ON family_trees
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create trees" ON family_trees
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update own trees" ON family_trees
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Creator can delete own trees" ON family_trees
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================
-- Family Tree Members (nodes in the tree)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_tree_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  memorial_id UUID REFERENCES memorials(id) ON DELETE SET NULL, -- Link to existing memorial (optional)
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Link to living user (optional)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  photo_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  bio TEXT,
  is_living BOOLEAN DEFAULT true,
  -- Position in tree visualization
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  generation_level INTEGER DEFAULT 0, -- 0 = root generation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tree_members_tree ON family_tree_members(tree_id);
CREATE INDEX idx_tree_members_memorial ON family_tree_members(memorial_id);
CREATE INDEX idx_tree_members_profile ON family_tree_members(profile_id);

ALTER TABLE family_tree_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view members of public trees" ON family_tree_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_members.tree_id AND is_public = true)
  );

CREATE POLICY "Tree creator can manage members" ON family_tree_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_members.tree_id AND created_by = auth.uid())
  );

-- ============================================================
-- Family Tree Connections (edges between members)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_tree_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES family_tree_members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES family_tree_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild',
    'aunt_uncle', 'niece_nephew', 'cousin', 'in_law', 'step_parent',
    'step_child', 'step_sibling', 'adopted', 'guardian', 'other'
  )),
  relationship_label TEXT, -- Custom label e.g., "Mother", "Husband"
  start_date DATE, -- Marriage date for spouse connections
  end_date DATE, -- Divorce date or end of relationship
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tree_id, from_member_id, to_member_id, relationship_type)
);

CREATE INDEX idx_tree_connections_tree ON family_tree_connections(tree_id);
CREATE INDEX idx_tree_connections_from ON family_tree_connections(from_member_id);
CREATE INDEX idx_tree_connections_to ON family_tree_connections(to_member_id);

ALTER TABLE family_tree_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view connections of public trees" ON family_tree_connections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_connections.tree_id AND is_public = true)
  );

CREATE POLICY "Tree creator can manage connections" ON family_tree_connections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM family_trees WHERE id = family_tree_connections.tree_id AND created_by = auth.uid())
  );

-- ============================================================
-- Memory Prompts (AI-generated prompts for memory sharing)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('remember_when', 'on_this_day', 'seasonal', 'milestone', 'random', 'custom')),
  trigger_date DATE, -- For date-based prompts
  is_active BOOLEAN DEFAULT true,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memory_prompts_memorial ON memory_prompts(memorial_id);
CREATE INDEX idx_memory_prompts_trigger ON memory_prompts(trigger_date);

ALTER TABLE memory_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prompts" ON memory_prompts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Memorial hosts can manage prompts" ON memory_prompts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = memory_prompts.memorial_id AND user_id = auth.uid())
  );

-- ============================================================
-- Memory Prompt Responses
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_prompt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES memory_prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

CREATE INDEX idx_prompt_responses_prompt ON memory_prompt_responses(prompt_id);
CREATE INDEX idx_prompt_responses_user ON memory_prompt_responses(user_id);

ALTER TABLE memory_prompt_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view responses" ON memory_prompt_responses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can respond" ON memory_prompt_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses" ON memory_prompt_responses
  FOR UPDATE USING (user_id = auth.uid());

-- Sync response count
CREATE OR REPLACE FUNCTION sync_prompt_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE memory_prompts SET response_count = (
    SELECT COUNT(*) FROM memory_prompt_responses WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
  ) WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_prompt_responses AFTER INSERT OR DELETE ON memory_prompt_responses
  FOR EACH ROW EXECUTE FUNCTION sync_prompt_response_count();

-- Sync family tree member count
CREATE OR REPLACE FUNCTION sync_tree_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE family_trees SET member_count = (
    SELECT COUNT(*) FROM family_tree_members WHERE tree_id = COALESCE(NEW.tree_id, OLD.tree_id)
  ) WHERE id = COALESCE(NEW.tree_id, OLD.tree_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_tree_members AFTER INSERT OR DELETE ON family_tree_members
  FOR EACH ROW EXECUTE FUNCTION sync_tree_member_count();

-- Triggers for updated_at
CREATE TRIGGER handle_family_trees_updated_at BEFORE UPDATE ON family_trees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_tree_members_updated_at BEFORE UPDATE ON family_tree_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
