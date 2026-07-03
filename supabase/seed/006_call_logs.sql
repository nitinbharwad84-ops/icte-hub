-- ============================================================
-- SEED: CALL LOGS
-- ============================================================
-- Requires telecaller users and leads to exist.
-- Skip this if no telecallers have been created yet.
-- Run 001 (owner) and 004 (leads) first, then create telecaller
-- users via the Admin → Team page, then run this.
-- ============================================================

DO $$
DECLARE
  v_telecaller_id UUID;
  v_lead_id UUID;
BEGIN
  -- Get first telecaller (if any)
  SELECT id INTO v_telecaller_id FROM public.users WHERE role = 'telecaller' LIMIT 1;

  IF v_telecaller_id IS NULL THEN
    RAISE NOTICE 'No telecaller found. Create a telecaller first via Admin → Team page, then re-run this.';
    RETURN;
  END IF;

  -- Get some leads
  FOR v_lead_id IN SELECT id FROM public.leads ORDER BY created_at DESC LIMIT 5 LOOP
    INSERT INTO public.call_logs (lead_id, telecaller_id, outcome, notes, call_date) VALUES
      (v_lead_id, v_telecaller_id, 'interested', 'Student is interested in BCA programs. Sent brochure via WhatsApp.', now() - interval '2 days'),
      (v_lead_id, v_telecaller_id, 'call-back-later', 'Student asked to call after 5 PM on weekend.', now() - interval '1 day');
  END LOOP;

  RAISE NOTICE 'Call logs inserted for up to 5 leads.';
END $$;
