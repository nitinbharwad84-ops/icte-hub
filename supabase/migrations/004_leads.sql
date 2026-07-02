CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_college_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute')),
  assigned_telecaller_id UUID REFERENCES public.users(id),
  auto_assigned BOOLEAN DEFAULT false,
  enrolled_institute_course_id UUID REFERENCES public.institute_courses(id),
  session_id TEXT,
  source TEXT DEFAULT 'direct',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
