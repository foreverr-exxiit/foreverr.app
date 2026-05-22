-- Migration 00037: Allow users to have multiple reaction types per target
-- Previously: unique(user_id, target_type, target_id) → one reaction per user per target
-- Now: unique(user_id, target_type, target_id, reaction_type) → one of each type per user

-- 1. Drop the old unique constraint (one reaction per user per target)
ALTER TABLE public.reactions
  DROP CONSTRAINT IF EXISTS reactions_user_id_target_type_target_id_key;

-- 2. Add new unique constraint including reaction_type (one of each type per user per target)
ALTER TABLE public.reactions
  ADD CONSTRAINT reactions_user_target_type_unique
  UNIQUE (user_id, target_type, target_id, reaction_type);

-- 3. Update reaction_type check to include all types used in the app
ALTER TABLE public.reactions
  DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

ALTER TABLE public.reactions
  ADD CONSTRAINT reactions_reaction_type_check
  CHECK (reaction_type IN ('heart', 'candle', 'flower', 'prayer', 'dove', 'balloon', 'cheers'));
