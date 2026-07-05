-- ============================================================
-- SEED: PARTNER INQUIRIES (Partner With Us form submissions)
-- ============================================================
-- Valid statuses: new, contacted, interested, not-interested, converted
-- institution_type column added in migration 018_schema_fixes.sql
-- ============================================================

INSERT INTO public.partner_inquiries (id, college_name, contact_person, phone, email, city, institution_type, message, status, created_at) VALUES
  (gen_random_uuid(), 'Apex Institute of Technology', 'Mr. Rajesh Khanna', '+919910000001', 'rajesh.khanna@apex.edu.in', 'Pune', 'institute', 'We want to partner with ICTE Hub for student referrals. Our institute offers BCA, BBA, and BSc programs.', 'new', now() - interval '2 days'),
  (gen_random_uuid(), 'Sahara College of Science', 'Dr. Farah Sheikh', '+919910000002', 'farah.sheikh@sahara.edu.in', 'Mumbai', 'college', 'Interested in listing our college on your platform. We have 2000+ students.', 'contacted', now() - interval '5 days'),
  (gen_random_uuid(), 'Vidya Mandir University', 'Prof. Arun Desai', '+919910000003', 'arun.desai@vidyamandir.ac.in', 'Hyderabad', 'university', 'We offer distance education programs. Looking for enrollment partners.', 'interested', now() - interval '10 days'),
  (gen_random_uuid(), 'National Skill Academy', 'Ms. Pooja Singh', '+919910000004', 'pooja@nationalskill.in', 'Delhi', 'institute', 'We provide skill-based certification courses. Interested in referral partnership.', 'not-interested', now() - interval '7 days'),
  (gen_random_uuid(), 'Global Education Centre', 'Mr. Amitabh Bachchan', '+919910000005', 'amitabh@globaledu.co.in', 'Bangalore', 'college', 'Please share your partnership terms and commission structure.', 'new', now() - interval '1 day'),
  (gen_random_uuid(), 'NextGen College of IT', 'Mrs. Sunita Rao', '+919910000006', 'srao@nextgenit.edu.in', 'Chennai', 'college', 'We want to collaborate for student enrollments in our BCA and MCA programs.', 'contacted', now() - interval '3 days'),
  (gen_random_uuid(), 'Excel Institute of Management', 'Dr. Vikram Seth', '+919910000007', 'vikram@excelim.edu.in', 'Jaipur', 'institute', 'We are a new institute offering MBA, BBA, and BCom. Looking for student acquisition partners.', 'new', now() - interval '6 hours');
