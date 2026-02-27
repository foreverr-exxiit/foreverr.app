-- Phase 4: Virtual Memorial Spaces & Advanced Social
-- Migration: 00012_virtual_spaces.sql

-- ============================================================
-- Virtual Spaces (AR/VR memorial rooms)
-- ============================================================
CREATE TABLE IF NOT EXISTS virtual_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  space_type TEXT NOT NULL DEFAULT 'memorial_room' CHECK (space_type IN (
    'memorial_room', 'garden', 'chapel', 'gravesite', 'beach', 'forest', 'custom'
  )),
  theme_data JSONB DEFAULT '{}', -- Colors, lighting, skybox, etc.
  background_music_url TEXT,
  is_public BOOLEAN DEFAULT true,
  visitor_count INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_virtual_spaces_memorial ON virtual_spaces(memorial_id);

ALTER TABLE virtual_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public spaces" ON virtual_spaces
  FOR SELECT USING (is_public = true);

CREATE POLICY "Memorial hosts can manage spaces" ON virtual_spaces
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memorial_hosts WHERE memorial_id = virtual_spaces.memorial_id AND user_id = auth.uid())
  );

-- ============================================================
-- Virtual Space Items (objects placed in 3D space)
-- ============================================================
CREATE TABLE IF NOT EXISTS virtual_space_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES virtual_spaces(id) ON DELETE CASCADE,
  placed_by UUID NOT NULL REFERENCES profiles(id),
  item_type TEXT NOT NULL CHECK (item_type IN (
    'candle', 'flower', 'photo', 'wreath', 'plant', 'teddy_bear',
    'cross', 'star_of_david', 'crescent', 'dove', 'butterfly',
    'custom_3d', 'text_plaque', 'audio_clip', 'video_frame'
  )),
  -- 3D positioning
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  position_z DOUBLE PRECISION DEFAULT 0,
  rotation_x DOUBLE PRECISION DEFAULT 0,
  rotation_y DOUBLE PRECISION DEFAULT 0,
  rotation_z DOUBLE PRECISION DEFAULT 0,
  scale DOUBLE PRECISION DEFAULT 1.0,
  -- Content
  media_url TEXT, -- For photos, videos, custom 3D models
  text_content TEXT, -- For text plaques
  message TEXT, -- Personal message attached to item
  -- Properties
  color TEXT,
  animation TEXT, -- 'flicker' for candles, 'sway' for flowers, etc.
  is_permanent BOOLEAN DEFAULT false, -- Permanent items vs temporary (e.g., birthday flowers)
  expires_at TIMESTAMPTZ,
  ribbon_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_space_items_space ON virtual_space_items(space_id);
CREATE INDEX idx_space_items_placed_by ON virtual_space_items(placed_by);

ALTER TABLE virtual_space_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items in public spaces" ON virtual_space_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM virtual_spaces WHERE id = virtual_space_items.space_id AND is_public = true)
  );

CREATE POLICY "Authenticated users can place items" ON virtual_space_items
  FOR INSERT WITH CHECK (auth.uid() = placed_by);

CREATE POLICY "Item placer or space host can manage" ON virtual_space_items
  FOR UPDATE USING (
    placed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM virtual_spaces vs
      JOIN memorial_hosts mh ON mh.memorial_id = vs.memorial_id
      WHERE vs.id = virtual_space_items.space_id AND mh.user_id = auth.uid()
    )
  );

CREATE POLICY "Item placer or space host can delete" ON virtual_space_items
  FOR DELETE USING (
    placed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM virtual_spaces vs
      JOIN memorial_hosts mh ON mh.memorial_id = vs.memorial_id
      WHERE vs.id = virtual_space_items.space_id AND mh.user_id = auth.uid()
    )
  );

-- ============================================================
-- Memorial Memory Streaks (engagement tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_visits INTEGER DEFAULT 0,
  total_candles_lit INTEGER DEFAULT 0,
  total_memories_shared INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, memorial_id)
);

CREATE INDEX idx_memory_streaks_user ON memory_streaks(user_id);
CREATE INDEX idx_memory_streaks_memorial ON memory_streaks(memorial_id);

ALTER TABLE memory_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON memory_streaks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own streaks" ON memory_streaks
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- Seasonal Decorations (time-limited virtual decorations)
-- ============================================================
CREATE TABLE IF NOT EXISTS seasonal_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  decoration_type TEXT NOT NULL CHECK (decoration_type IN (
    'christmas', 'easter', 'valentines', 'mothers_day', 'fathers_day',
    'memorial_day', 'veterans_day', 'halloween', 'thanksgiving',
    'new_year', 'birthday', 'anniversary', 'custom'
  )),
  image_url TEXT NOT NULL,
  preview_url TEXT,
  ribbon_cost INTEGER DEFAULT 0, -- 0 = free
  is_premium BOOLEAN DEFAULT false,
  available_from TIMESTAMPTZ NOT NULL,
  available_until TIMESTAMPTZ NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seasonal_decorations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available decorations" ON seasonal_decorations
  FOR SELECT USING (
    now() BETWEEN available_from AND available_until
  );

-- ============================================================
-- Applied Decorations (decorations applied to memorials)
-- ============================================================
CREATE TABLE IF NOT EXISTS applied_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  decoration_id UUID NOT NULL REFERENCES seasonal_decorations(id),
  applied_by UUID NOT NULL REFERENCES profiles(id),
  applied_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- When the seasonal period ends
  UNIQUE(memorial_id, decoration_id, applied_by)
);

CREATE INDEX idx_applied_decorations_memorial ON applied_decorations(memorial_id);

ALTER TABLE applied_decorations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view applied decorations" ON applied_decorations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can apply decorations" ON applied_decorations
  FOR INSERT WITH CHECK (auth.uid() = applied_by);

-- Sync item count on virtual spaces
CREATE OR REPLACE FUNCTION sync_space_item_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE virtual_spaces SET item_count = (
    SELECT COUNT(*) FROM virtual_space_items WHERE space_id = COALESCE(NEW.space_id, OLD.space_id)
  ) WHERE id = COALESCE(NEW.space_id, OLD.space_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_space_items AFTER INSERT OR DELETE ON virtual_space_items
  FOR EACH ROW EXECUTE FUNCTION sync_space_item_count();

-- Triggers for updated_at
CREATE TRIGGER handle_virtual_spaces_updated_at BEFORE UPDATE ON virtual_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_memory_streaks_updated_at BEFORE UPDATE ON memory_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
