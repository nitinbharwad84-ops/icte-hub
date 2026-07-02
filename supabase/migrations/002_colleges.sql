CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Online', 'Offline')),
  location TEXT,
  courses_offered TEXT[] DEFAULT '{}',
  commission_percent DECIMAL,
  commission_structure TEXT CHECK (commission_structure IN ('one-time', 'installments')),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
