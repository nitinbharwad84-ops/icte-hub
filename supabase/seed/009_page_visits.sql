-- ============================================================
-- SEED: VISITOR TRACKING & PAGE VISITS
-- ============================================================

DO $$
DECLARE
  v_col1 UUID; v_col2 UUID; v_col3 UUID;
  v_lead1 UUID;
BEGIN
  SELECT id INTO v_col1 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 0;
  SELECT id INTO v_col2 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 1;
  SELECT id INTO v_col3 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 2;
  SELECT id INTO v_lead1 FROM public.leads ORDER BY created_at LIMIT 1;

  -- Visitors who haven't converted
  INSERT INTO public.visitors (session_id, viewed_colleges, mode_filters_used, first_seen_at, last_seen_at) VALUES
    ('session-test-001', jsonb_build_array(
      jsonb_build_object('college_id', v_col1, 'college_name', 'Delhi University', 'viewed_at', now() - interval '2 hours'),
      jsonb_build_object('college_id', v_col2, 'college_name', 'Mumbai University', 'viewed_at', now() - interval '1 hour')
    ), ARRAY['Offline'], now() - interval '1 day', now() - interval '30 minutes'),

    ('session-test-002', jsonb_build_array(
      jsonb_build_object('college_id', v_col3, 'college_name', 'Amity University Online', 'viewed_at', now() - interval '3 hours')
    ), ARRAY['Online', 'Offline'], now() - interval '2 days', now() - interval '1 hour'),

    ('session-test-003', '[]'::jsonb, ARRAY['Offline'], now() - interval '5 days', now() - interval '4 days');

  -- Visitor who converted to a lead
  INSERT INTO public.visitors (session_id, viewed_colleges, mode_filters_used, first_seen_at, last_seen_at, converted_to_lead_id) VALUES
    ('session-test-004', jsonb_build_array(
      jsonb_build_object('college_id', v_col1, 'college_name', 'Delhi University', 'viewed_at', now() - interval '14 days')
    ), ARRAY['Offline'], now() - interval '15 days', now() - interval '14 days', v_lead1);

  -- Page visits (requires page_visits table if it exists)
  -- Check if the table exists first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_visits') THEN
    INSERT INTO public.page_visits (session_id, page_path, page_title, visited_at) VALUES
      ('session-test-001', '/', 'Home', now() - interval '1 day'),
      ('session-test-001', '/colleges', 'Colleges', now() - interval '23 hours'),
      ('session-test-001', '/colleges', 'Colleges', now() - interval '2 hours'),
      ('session-test-002', '/', 'Home', now() - interval '2 days'),
      ('session-test-002', '/colleges', 'Colleges', now() - interval '2 days'),
      ('session-test-002', '/check-status', 'Check Status', now() - interval '2 days'),
      ('session-test-003', '/', 'Home', now() - interval '5 days'),
      ('session-test-004', '/', 'Home', now() - interval '15 days'),
      ('session-test-004', '/colleges', 'Colleges', now() - interval '15 days');
  END IF;

  RAISE NOTICE 'Visitor tracking data seeded.';
END $$;
