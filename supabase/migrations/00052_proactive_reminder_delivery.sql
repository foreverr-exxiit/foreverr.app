-- =============================================
-- Proactive reminder delivery
-- The auto_reminder_rules table (00029) + compute_next_trigger trigger
-- already store WHEN to remind. What was missing: something that
-- actually fires due reminders. This adds process_due_reminders(),
-- meant to run once a day (pg_cron below, or any scheduled invoker).
--
-- Delivery is via the in-app notifications table (Echoes tab) so it
-- works with zero external dependencies. Push-on-top is layered by the
-- process-reminders edge function, which reads the rows this creates.
-- =============================================

-- Warm, emotionally-intelligent copy per rule type. Memorial context
-- deliberately avoids "achievement" framing — these are gentle nudges
-- to be present, not streaks to maintain.
CREATE OR REPLACE FUNCTION public.process_due_reminders()
RETURNS TABLE (
  notified_user_id uuid,
  notification_title text,
  notification_body text,
  memorial_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_name text;
  v_title text;
  v_body text;
  v_days_until int;
BEGIN
  FOR r IN
    SELECT ar.*
    FROM public.auto_reminder_rules ar
    WHERE ar.is_enabled = true
      AND ar.next_trigger_date IS NOT NULL
      AND ar.next_trigger_date <= CURRENT_DATE
      -- Once-per-year guard: never re-fire the same rule within 300 days,
      -- even though next_trigger_date sits inside the days_before window.
      AND (ar.last_triggered_at IS NULL
           OR ar.last_triggered_at < now() - interval '300 days')
  LOOP
    -- Resolve the honoree's name (falls back gracefully).
    v_name := NULL;
    IF r.memorial_id IS NOT NULL THEN
      SELECT NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), '')
        INTO v_name
      FROM public.memorials WHERE id = r.memorial_id;
    END IF;
    v_name := COALESCE(v_name, 'someone you love');

    -- Days until the actual date (next_trigger_date is date - days_before).
    v_days_until := GREATEST(0, (r.next_trigger_date + (r.days_before || ' days')::interval)::date - CURRENT_DATE);

    -- Compose warm copy per rule type.
    IF r.rule_type = 'birthday' THEN
      v_title := v_name || '''s birthday';
      v_body := CASE
        WHEN v_days_until = 0 THEN 'Today is ' || v_name || '''s birthday. Light a candle or share a memory.'
        WHEN v_days_until = 1 THEN 'Tomorrow is ' || v_name || '''s birthday. A good moment to remember them.'
        ELSE v_name || '''s birthday is in ' || v_days_until || ' days.'
      END;
    ELSIF r.rule_type = 'death_anniversary' THEN
      v_title := 'Remembering ' || v_name;
      v_body := CASE
        WHEN v_days_until = 0 THEN 'Today marks the anniversary of ' || v_name || '''s passing. You''re not alone.'
        ELSE 'The anniversary of ' || v_name || '''s passing is in ' || v_days_until || ' days.'
      END;
    ELSIF r.rule_type = 'wedding_anniversary' THEN
      v_title := v_name || '''s anniversary';
      v_body := CASE
        WHEN v_days_until = 0 THEN 'Today is ' || v_name || '''s wedding anniversary.'
        ELSE v_name || '''s wedding anniversary is in ' || v_days_until || ' days.'
      END;
    ELSE
      -- milestone_birthday, custom_recurring, days_before
      v_title := COALESCE(NULLIF(r.title_template, ''), 'A day to remember');
      v_body := CASE
        WHEN v_days_until = 0 THEN v_title
        ELSE v_title || ' — in ' || v_days_until || ' days.'
      END;
    END IF;

    -- 1. In-app notification (Echoes tab) — reliable, no external dep.
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      r.user_id,
      'reminder',
      v_title,
      v_body,
      jsonb_build_object(
        'type', 'reminder',
        'rule_type', r.rule_type,
        'memorial_id', r.memorial_id,
        'reminder_id', r.id
      )
    );

    -- 2. Advance the rule: mark fired, bump to next year. The
    --    BEFORE-UPDATE trigger (compute_next_trigger) recomputes
    --    next_trigger_date from CURRENT_DATE; since this year's date has
    --    now arrived, it rolls to next year automatically.
    UPDATE public.auto_reminder_rules
    SET last_triggered_at = now()
    WHERE id = r.id;

    -- Emit for the push layer to consume.
    notified_user_id := r.user_id;
    notification_title := v_title;
    notification_body := v_body;
    memorial_id := r.memorial_id;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Only the service role / scheduler should call this (it writes to any
-- user's notifications). Not granted to authenticated.
REVOKE ALL ON FUNCTION public.process_due_reminders() FROM PUBLIC;

-- Schedule daily at 13:00 UTC (~morning across the Americas) if pg_cron
-- is available. Safe no-op if the extension isn't installed.
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove any prior schedule with this name, then (re)create.
    PERFORM cron.unschedule('process-due-reminders')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-due-reminders');
    PERFORM cron.schedule(
      'process-due-reminders',
      '0 13 * * *',
      $job$ SELECT public.process_due_reminders(); $job$
    );
  END IF;
EXCEPTION WHEN others THEN
  -- pg_cron not available or insufficient privileges — the edge function
  -- (process-reminders) can invoke process_due_reminders() on a schedule
  -- instead. See supabase/functions/process-reminders/index.ts.
  NULL;
END $cron$;
