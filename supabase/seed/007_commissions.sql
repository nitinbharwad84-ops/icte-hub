-- ============================================================
-- SEED: COMMISSIONS
-- ============================================================
-- Commissions are normally auto-created by the DB trigger
-- when a lead's status changes to 'enrolled-college'.
-- This file inserts sample commissions for testing.
-- ============================================================

DO $$
DECLARE
  v_lead1 UUID; v_lead2 UUID;
  v_col1 UUID; v_col2 UUID;
BEGIN
  -- Get leads with enrolled-college status
  SELECT id INTO v_lead1 FROM public.leads WHERE status = 'enrolled-college' ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO v_lead2 FROM public.leads WHERE status = 'enrolled-college' ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO v_col1 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 0;
  SELECT id INTO v_col2 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 1;

  IF v_lead1 IS NULL THEN
    RAISE NOTICE 'No enrolled-college leads found. Run 004_leads.sql first.';
    RETURN;
  END IF;

  INSERT INTO public.commissions (lead_id, college_id, amount, status, created_at) VALUES
    (v_lead1, v_col1, 2500.00, 'pending', now() - interval '10 days'),
    (v_lead2, v_col2, 3500.00, 'pending', now() - interval '5 days');

  RAISE NOTICE 'Sample commissions inserted.';
END $$;
