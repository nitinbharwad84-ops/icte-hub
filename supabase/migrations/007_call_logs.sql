CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id),
  telecaller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('interested', 'not-interested', 'call-back-later', 'no-answer')),
  notes TEXT,
  call_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
