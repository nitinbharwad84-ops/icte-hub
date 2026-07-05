-- Fix institute_courses column names and add missing columns
ALTER TABLE public.institute_courses RENAME COLUMN name TO course_name;
ALTER TABLE public.institute_courses RENAME COLUMN fees TO fee;
ALTER TABLE public.institute_courses ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.partner_inquiries(id);
ALTER TABLE public.institute_courses ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'online';
ALTER TABLE public.institute_courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.institute_courses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Fix users table: add missing phone column (profile page queries it)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
