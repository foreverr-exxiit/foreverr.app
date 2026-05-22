-- ============================================================
-- 00039_flower_wall_rpc.sql
-- RPC function to record gifts directly to flower_walls
-- Needed because built-in gifts skip the gift_transactions table
-- (which has a FK constraint to gift_catalog), so the
-- handle_gift_transaction trigger never fires for them.
-- ============================================================

-- Creates or replaces an RPC callable from the client that
-- atomically upserts a flower_walls row, incrementing counters.
CREATE OR REPLACE FUNCTION public.record_gift_to_wall(
  p_target_type text,
  p_target_id uuid,
  p_category text,
  p_quantity integer DEFAULT 1,
  p_amount_cents integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.flower_walls (
    target_type, target_id,
    total_flowers, total_candles, total_gifts,
    total_amount_cents, last_gift_at, updated_at
  )
  VALUES (
    p_target_type,
    p_target_id,
    CASE WHEN p_category = 'flowers' THEN p_quantity ELSE 0 END,
    CASE WHEN p_category = 'candles' THEN p_quantity ELSE 0 END,
    p_quantity,
    COALESCE(p_amount_cents, 0),
    now(),
    now()
  )
  ON CONFLICT (target_type, target_id) DO UPDATE SET
    total_flowers   = flower_walls.total_flowers   + CASE WHEN p_category = 'flowers' THEN p_quantity ELSE 0 END,
    total_candles   = flower_walls.total_candles   + CASE WHEN p_category = 'candles' THEN p_quantity ELSE 0 END,
    total_gifts     = flower_walls.total_gifts     + p_quantity,
    total_amount_cents = flower_walls.total_amount_cents + COALESCE(p_amount_cents, 0),
    last_gift_at    = now(),
    updated_at      = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
