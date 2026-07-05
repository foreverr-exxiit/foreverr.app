-- =============================================
-- Backfill reminder rules for existing memorials
-- 00052 delivers reminders and useAutoSetupReminders creates them for
-- NEW memorials — but every memorial that already exists (including the
-- demo/seed data) has no rules, so the "Upcoming Remembrances" home
-- strip and the reminder pushes would stay empty until users create new
-- pages. This one-time backfill seeds birthday + death-anniversary rules
-- for existing memorials that have the relevant date and a known owner.
--
-- Idempotent: NOT EXISTS guards mean re-running inserts nothing. The
-- compute_next_trigger trigger (00029) sets next_trigger_date on insert.
-- =============================================

-- Birthdays — for memorials with a date_of_birth and an owner.
INSERT INTO public.auto_reminder_rules
  (user_id, memorial_id, rule_type, title_template, days_before, is_recurring)
SELECT
  m.created_by,
  m.id,
  'birthday',
  TRIM(m.first_name || ' ' || COALESCE(m.last_name, '')) || '''s birthday is coming up',
  1,
  true
FROM public.memorials m
WHERE m.created_by IS NOT NULL
  AND m.date_of_birth IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.auto_reminder_rules ar
    WHERE ar.memorial_id = m.id
      AND ar.user_id = m.created_by
      AND ar.rule_type = 'birthday'
  );

-- Death anniversaries — for memorials with a date_of_death and an owner.
INSERT INTO public.auto_reminder_rules
  (user_id, memorial_id, rule_type, title_template, days_before, is_recurring)
SELECT
  m.created_by,
  m.id,
  'death_anniversary',
  'Remembering ' || TRIM(m.first_name || ' ' || COALESCE(m.last_name, '')) || ' — anniversary of passing',
  1,
  true
FROM public.memorials m
WHERE m.created_by IS NOT NULL
  AND m.date_of_death IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.auto_reminder_rules ar
    WHERE ar.memorial_id = m.id
      AND ar.user_id = m.created_by
      AND ar.rule_type = 'death_anniversary'
  );
