CREATE TABLE IF NOT EXISTS public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON public.page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at);

CREATE TABLE IF NOT EXISTS public.lead_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_lead_sessions_lead_id ON public.lead_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_sessions_session_id ON public.lead_sessions(session_id);
