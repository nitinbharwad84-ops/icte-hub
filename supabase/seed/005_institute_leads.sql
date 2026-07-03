-- ============================================================
-- SEED: INSTITUTE LEADS (Direct enrollment inquiries)
-- ============================================================

DO $$
DECLARE
  v_course1 UUID; v_course2 UUID; v_course3 UUID; v_course4 UUID; v_course5 UUID;
BEGIN
  SELECT id INTO v_course1 FROM public.institute_courses ORDER BY name LIMIT 1 OFFSET 0;
  SELECT id INTO v_course2 FROM public.institute_courses ORDER BY name LIMIT 1 OFFSET 1;
  SELECT id INTO v_course3 FROM public.institute_courses ORDER BY name LIMIT 1 OFFSET 2;
  SELECT id INTO v_course4 FROM public.institute_courses ORDER BY name LIMIT 1 OFFSET 3;
  SELECT id INTO v_course5 FROM public.institute_courses ORDER BY name LIMIT 1 OFFSET 4;

  INSERT INTO public.institute_leads (id, name, phone, email, interested_course_id, message, status, created_at) VALUES
    (gen_random_uuid(), 'Ravi Kumar', '+919987654301', 'ravi.kumar@gmail.com', v_course1, 'I want to pursue BCA through distance mode. Please share fee details.', 'new', now() - interval '1 day'),
    (gen_random_uuid(), 'Sunita Yadav', '+919987654302', 'sunita.yadav@yahoo.com', v_course2, 'Interested in BBA program. Can I get a scholarship?', 'contacted', now() - interval '3 days'),
    (gen_random_uuid(), 'Mohammad Ali', '+919987654303', 'mohd.ali@outlook.com', v_course4, 'Need information about MCA admission process and eligibility.', 'interested', now() - interval '5 days'),
    (gen_random_uuid(), 'Swati Joshi', '+919987654304', 'swati.joshi@gmail.com', v_course3, 'Looking for BSc IT program details and fee structure.', 'new', now() - interval '12 hours'),
    (gen_random_uuid(), 'Akash Verma', '+919987654305', 'akash.verma@rediffmail.com', v_course5, 'I have completed BCom and want to do MBA. Is it possible?', 'enrolled', now() - interval '10 days'),
    (gen_random_uuid(), 'Divya Saxena', '+919987654306', 'divya.saxena@gmail.com', v_course1, 'Please call me regarding BCA admission for 2026 batch.', 'contacted', now() - interval '2 days'),
    (gen_random_uuid(), 'Prakash Rao', '+919987654307', 'prakash.rao@hotmail.com', v_course2, 'Share complete details about BBA program with placements.', 'not-interested', now() - interval '7 days'),
    (gen_random_uuid(), 'Anjali Mehta', '+919987654308', 'anjali.mehta@gmail.com', v_course3, 'Interested in BSc IT. Is this UGC approved?', 'new', now() - interval '6 hours');

END $$;
