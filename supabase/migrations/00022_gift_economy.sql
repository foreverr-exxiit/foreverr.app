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

CREATE INDEX idx_gift_catalog_category ON public.gift_catalog(category);

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

CREATE INDEX idx_gift_transactions_recipient ON public.gift_transactions(recipient_type, recipient_id);
CREATE INDEX idx_gift_transactions_sender ON public.gift_transactions(sender_id);

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

CREATE POLICY "gift_catalog_select" ON public.gift_catalog
  FOR SELECT USING (true);

-- gift_transactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_transactions_select" ON public.gift_transactions
  FOR SELECT USING (true);

CREATE POLICY "gift_transactions_insert" ON public.gift_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- flower_walls: readable by all
ALTER TABLE public.flower_walls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flower_walls_select" ON public.flower_walls
  FOR SELECT USING (true);

-- gift_reactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_reactions_select" ON public.gift_reactions
  FOR SELECT USING (true);

CREATE POLICY "gift_reactions_insert" ON public.gift_reactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

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
