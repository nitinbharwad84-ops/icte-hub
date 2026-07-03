ALTER TABLE public.partner_inquiries
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'converted'));
