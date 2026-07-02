CREATE TABLE IF NOT EXISTS public.institute_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration TEXT DEFAULT '2 years',
  fees DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
