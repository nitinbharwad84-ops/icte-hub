-- ============================================================
-- SEED: STUDENT LEADS
-- ============================================================
-- Note: Telecaller auto-assignment trigger will assign telecallers.
-- College IDs must exist — run 002_colleges.sql first.
-- ============================================================

-- First, get some college IDs
DO $$
DECLARE
  v_col1 UUID; v_col2 UUID; v_col3 UUID; v_col4 UUID; v_col5 UUID;
  v_col6 UUID; v_col7 UUID; v_col8 UUID;
  v_course1 UUID; v_course2 UUID;
BEGIN
  SELECT id INTO v_col1 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 0;
  SELECT id INTO v_col2 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 1;
  SELECT id INTO v_col3 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 2;
  SELECT id INTO v_col4 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 3;
  SELECT id INTO v_col5 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 4;
  SELECT id INTO v_col6 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 5;
  SELECT id INTO v_col7 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 6;
  SELECT id INTO v_col8 FROM public.colleges ORDER BY name LIMIT 1 OFFSET 7;
  SELECT id INTO v_course1 FROM public.institute_courses ORDER BY name LIMIT 1;
  SELECT id INTO v_course2 FROM public.institute_courses ORDER BY name LIMIT 1 OFFSET 1;

  INSERT INTO public.leads (id, name, phone, email, interested_college_ids, status, source, created_at) VALUES
    (gen_random_uuid(), 'Rahul Sharma', '+919876543201', 'rahul.sharma@gmail.com', ARRAY[v_col1, v_col3], 'new', 'direct', now() - interval '2 days'),
    (gen_random_uuid(), 'Priya Patel', '+919876543202', 'priya.patel@yahoo.com', ARRAY[v_col2], 'new', 'direct', now() - interval '1 day'),
    (gen_random_uuid(), 'Amit Singh', '+919876543203', 'amit.singh@rediffmail.com', ARRAY[v_col4, v_col5, v_col1], 'contacted', 'direct', now() - interval '5 days'),
    (gen_random_uuid(), 'Sneha Reddy', '+919876543204', 'sneha.reddy@gmail.com', ARRAY[v_col3, v_col6], 'interested', 'direct', now() - interval '7 days'),
    (gen_random_uuid(), 'Vikram Joshi', '+919876543205', 'vikram.joshi@outlook.com', ARRAY[v_col5], 'enrolled-college', 'direct', now() - interval '14 days'),
    (gen_random_uuid(), 'Ananya Gupta', '+919876543206', 'ananya.gupta@gmail.com', ARRAY[v_col7], 'not-interested', 'direct', now() - interval '10 days'),
    (gen_random_uuid(), 'Rohan Deshmukh', '+919876543207', 'rohan.desh@gmail.com', ARRAY[v_col2, v_col8, v_col4], 'new', 'direct', now() - interval '3 hours'),
    (gen_random_uuid(), 'Neha Kapoor', '+919876543208', 'neha.kapoor@hotmail.com', ARRAY[v_col1, v_col6, v_col3], 'contacted', 'direct', now() - interval '3 days'),
    (gen_random_uuid(), 'Arjun Nair', '+919876543209', 'arjun.nair@gmail.com', ARRAY[v_col8], 'interested', 'direct', now() - interval '6 days'),
    (gen_random_uuid(), 'Kavita Mishra', '+919876543210', 'kavita.mishra@yahoo.com', ARRAY[v_col4, v_col2], 'enrolled-college', 'direct', now() - interval '20 days'),
    (gen_random_uuid(), 'Deepak Verma', '+919876543211', 'deepak.verma@gmail.com', ARRAY[v_col5, v_col7], 'new', 'direct', now() - interval '1 hour'),
    (gen_random_uuid(), 'Pooja Thakur', '+919876543212', 'pooja.thakur@rediffmail.com', ARRAY[v_col1, v_col8], 'enrolled-institute', 'institute', now() - interval '12 days'),
    (gen_random_uuid(), 'Suresh Kumar', '+919876543213', 'suresh.k@gmail.com', ARRAY[v_col3, v_col6, v_col5], 'contacted', 'direct', now() - interval '4 days'),
    (gen_random_uuid(), 'Meera Iyer', '+919876543214', 'meera.iyer@gmail.com', ARRAY[v_col2, v_col4], 'interested', 'direct', now() - interval '8 days'),
    (gen_random_uuid(), 'Gaurav Yadav', '+919876543215', 'gaurav.yadav@outlook.com', ARRAY[v_col7], 'new', 'direct', now() - interval '12 hours');

  -- Also create one lead with an enrolled_institute_course_id
  INSERT INTO public.leads (id, name, phone, email, interested_college_ids, status, enrolled_institute_course_id, source, created_at)
  VALUES (gen_random_uuid(), 'Ritu Agarwal', '+919876543216', 'ritu.agarwal@gmail.com', ARRAY[v_col1, v_col3], 'enrolled-institute', v_course1, 'direct', now() - interval '15 days');

END $$;
