-- ============================================================
-- SEED: COLLEGES / UNIVERSITIES
-- ============================================================

INSERT INTO public.colleges (id, name, mode, location, courses_offered, commission_percent, commission_structure, contact_name, contact_phone, contact_email) VALUES
  (gen_random_uuid(), 'Delhi University', 'Offline', 'New Delhi, Delhi', ARRAY['BCA', 'BBA', 'BCom', 'BA'], 5.00, 'one-time', 'Dr. Sharma', '+919810000001', 'admissions@du.ac.in'),
  (gen_random_uuid(), 'Mumbai University', 'Offline', 'Mumbai, Maharashtra', ARRAY['BSc', 'BCom', 'BBA', 'MBA'], 4.50, 'one-time', 'Prof. Patil', '+919810000002', 'info@mu.ac.in'),
  (gen_random_uuid(), 'Amity University Online', 'Online', 'Noida, UP', ARRAY['BCA', 'BBA', 'MCA', 'MBA', 'MSc'], 6.00, 'installments', 'Ms. Verma', '+919810000003', 'online@amity.edu'),
  (gen_random_uuid(), 'Chandigarh University', 'Offline', 'Chandigarh', ARRAY['BCA', 'BBA', 'BSc', 'MBA', 'MCA'], 5.50, 'one-time', 'Mr. Singh', '+919810000004', 'admissions@cumail.in'),
  (gen_random_uuid(), 'LPU Online', 'Online', 'Phagwara, Punjab', ARRAY['BCA', 'BBA', 'MCA', 'MBA', 'MSc', 'MA'], 7.00, 'installments', 'Dr. Gupta', '+919810000005', 'online@lpu.co.in'),
  (gen_random_uuid(), 'Christ University', 'Offline', 'Bangalore, Karnataka', ARRAY['BBA', 'BCA', 'BSc', 'BA', 'BCom'], 4.00, 'one-time', 'Fr. Joseph', '+919810000006', 'admissions@christuniversity.in'),
  (gen_random_uuid(), 'IGNOU', 'Online', 'New Delhi, Delhi', ARRAY['BCA', 'BBA', 'BSc', 'BA', 'BCom', 'MA', 'MCA'], 3.00, 'one-time', 'Dr. Mehta', '+919810000007', 'info@ignou.ac.in'),
  (gen_random_uuid(), 'SRM Institute of Technology', 'Offline', 'Chennai, Tamil Nadu', ARRAY['BCA', 'BBA', 'BSc', 'BCom', 'MBA'], 5.00, 'installments', 'Dr. Krishnan', '+919810000008', 'admissions@srmist.edu.in'),
  (gen_random_uuid(), 'Manipal University Jaipur', 'Offline', 'Jaipur, Rajasthan', ARRAY['BCA', 'BBA', 'BSc', 'BA', 'BCom'], 4.50, 'one-time', 'Prof. Jain', '+919810000009', 'admissions@jaipur.manipal.edu'),
  (gen_random_uuid(), 'Jain University Online', 'Online', 'Bangalore, Karnataka', ARRAY['BCA', 'BBA', 'MCA', 'MBA', 'MSc'], 6.50, 'installments', 'Ms. Nair', '+919810000010', 'online@jainuniversity.ac.in');
