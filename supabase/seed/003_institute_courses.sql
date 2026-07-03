-- ============================================================
-- SEED: INSTITUTE COURSES (ICTE Direct Programs)
-- ============================================================

INSERT INTO public.institute_courses (id, name, duration, fees) VALUES
  (gen_random_uuid(), 'BCA - Bachelor of Computer Applications', '3 years', 45000),
  (gen_random_uuid(), 'BBA - Bachelor of Business Administration', '3 years', 50000),
  (gen_random_uuid(), 'BSc IT - Information Technology', '3 years', 42000),
  (gen_random_uuid(), 'BCom - Bachelor of Commerce', '3 years', 35000),
  (gen_random_uuid(), 'BA - Bachelor of Arts (English)', '3 years', 30000),
  (gen_random_uuid(), 'MCA - Master of Computer Applications', '2 years', 65000),
  (gen_random_uuid(), 'MBA - Master of Business Administration', '2 years', 75000),
  (gen_random_uuid(), 'MSc Data Science', '2 years', 70000),
  (gen_random_uuid(), 'Diploma in Digital Marketing', '1 year', 25000),
  (gen_random_uuid(), 'Certificate in Web Development', '6 months', 15000);
