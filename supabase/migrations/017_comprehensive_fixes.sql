-- ============================================================
-- MIGRATION 017: COMPREHENSIVE DATABASE SCHEMA FIXES
-- ============================================================
-- Sections: schema changes > policies > triggers > indexes
-- ============================================================

-- ============================================================
-- SECTION 1: Missing Column
-- ============================================================

ALTER TABLE public.institute_leads ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT false NOT NULL;

-- ============================================================
-- SECTION 2: Missing UNIQUE Constraints
-- ============================================================

ALTER TABLE public.commissions ADD CONSTRAINT commissions_lead_college_unique UNIQUE (lead_id, college_id);

ALTER TABLE public.colleges ADD CONSTRAINT colleges_name_unique UNIQUE (name);

ALTER TABLE public.lead_sessions ADD CONSTRAINT lead_sessions_lead_session_unique UNIQUE (lead_id, session_id);

-- ============================================================
-- SECTION 3: Missing NOT NULL Constraints
-- ============================================================

ALTER TABLE public.commissions ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE public.commissions ALTER COLUMN amount SET NOT NULL;

ALTER TABLE public.visitors ALTER COLUMN viewed_colleges SET NOT NULL;
ALTER TABLE public.visitors ALTER COLUMN mode_filters_used SET NOT NULL;

ALTER TABLE public.leads ALTER COLUMN source SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN interested_college_ids SET NOT NULL;

-- ============================================================
-- SECTION 4: ON DELETE Actions (FK fixes)
-- ============================================================

-- HIGH priority
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_telecaller_id_fkey;
ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_telecaller_id_fkey FOREIGN KEY (assigned_telecaller_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.institute_leads DROP CONSTRAINT IF EXISTS institute_leads_assigned_telecaller_id_fkey;
ALTER TABLE public.institute_leads ADD CONSTRAINT institute_leads_assigned_telecaller_id_fkey FOREIGN KEY (assigned_telecaller_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_lead_id_fkey;
ALTER TABLE public.commissions ADD CONSTRAINT commissions_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.call_logs DROP CONSTRAINT IF EXISTS call_logs_lead_id_fkey;
ALTER TABLE public.call_logs ADD CONSTRAINT call_logs_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- MEDIUM priority
ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_college_id_fkey;
ALTER TABLE public.commissions ADD CONSTRAINT commissions_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE SET NULL;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_created_by_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_enrolled_institute_course_id_fkey;
ALTER TABLE public.leads ADD CONSTRAINT leads_enrolled_institute_course_id_fkey FOREIGN KEY (enrolled_institute_course_id) REFERENCES public.institute_courses(id) ON DELETE SET NULL;

ALTER TABLE public.institute_leads DROP CONSTRAINT IF EXISTS institute_leads_interested_course_id_fkey;
ALTER TABLE public.institute_leads ADD CONSTRAINT institute_leads_interested_course_id_fkey FOREIGN KEY (interested_course_id) REFERENCES public.institute_courses(id) ON DELETE SET NULL;

ALTER TABLE public.visitors DROP CONSTRAINT IF EXISTS visitors_converted_to_lead_id_fkey;
ALTER TABLE public.visitors ADD CONSTRAINT visitors_converted_to_lead_id_fkey FOREIGN KEY (converted_to_lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

-- ============================================================
-- SECTION 5: Fix RLS — page_visits and lead_sessions
-- ============================================================

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_insert_page_visits ON public.page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY public_insert_lead_sessions ON public.lead_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY auth_select_page_visits ON public.page_visits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY auth_select_lead_sessions ON public.lead_sessions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY auth_delete_page_visits ON public.page_visits FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- SECTION 6: Fix Overly Permissive RLS Policies
-- ============================================================

-- Restrict visitors UPDATE
DROP POLICY IF EXISTS public_update_own_visitors ON public.visitors;
CREATE POLICY public_update_own_visitors ON public.visitors FOR UPDATE USING (session_id IS NOT NULL) WITH CHECK (session_id IS NOT NULL);

-- Restrict public insert leads
DROP POLICY IF EXISTS public_insert_leads ON public.leads;
CREATE POLICY public_insert_leads ON public.leads FOR INSERT WITH CHECK (
  status = 'new' AND
  assigned_telecaller_id IS NULL AND
  source = 'website'
);

-- Restrict public insert institute_leads
DROP POLICY IF EXISTS public_insert_institute_leads ON public.institute_leads;
CREATE POLICY public_insert_institute_leads ON public.institute_leads FOR INSERT WITH CHECK (
  status = 'new' AND
  assigned_telecaller_id IS NULL
);

-- Restrict public insert partner_inquiries
DROP POLICY IF EXISTS public_insert_inquiries ON public.partner_inquiries;
CREATE POLICY public_insert_inquiries ON public.partner_inquiries FOR INSERT WITH CHECK (
  status = 'new'
);

-- ============================================================
-- SECTION 7: RLS Helper Functions — Add SET search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role = 'owner' FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role = 'admin' FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role IN ('admin', 'owner') FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- SECTION 8: Fix Telecaller Storage Policies
-- ============================================================

DROP POLICY IF EXISTS telecaller_write_own_avatar ON storage.objects;
CREATE POLICY telecaller_write_own_avatar ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'profile_pictures' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'telecaller'
);

CREATE POLICY telecaller_update_own_avatar ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile_pictures' AND
  auth.uid() = owner
) WITH CHECK (
  bucket_id = 'profile_pictures' AND
  auth.uid() = owner
);

CREATE POLICY telecaller_delete_own_avatar ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile_pictures' AND
  auth.uid() = owner
);

-- ============================================================
-- SECTION 9: updated_at columns + auto-update trigger
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.institute_courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.institute_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.partner_inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.page_visits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.lead_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['users','colleges','institute_courses','leads','institute_leads','commissions','call_logs','visitors','partner_inquiries','audit_logs','page_visits','lead_sessions'])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- SECTION 10: Audit Trigger for Missing Tables
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_partner_inquiry_changes' AND tgrelid = 'public.partner_inquiries'::regclass) THEN
    EXECUTE 'CREATE TRIGGER log_partner_inquiry_changes AFTER INSERT OR UPDATE OR DELETE ON public.partner_inquiries FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry()';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_visitor_changes' AND tgrelid = 'public.visitors'::regclass) THEN
    EXECUTE 'CREATE TRIGGER log_visitor_changes AFTER INSERT OR UPDATE OR DELETE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry()';
  END IF;
END;
$$;

-- ============================================================
-- SECTION 11: Critical Missing Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_leads_assigned_telecaller ON public.leads(assigned_telecaller_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_session ON public.leads(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

CREATE INDEX IF NOT EXISTS idx_institute_leads_assigned ON public.institute_leads(assigned_telecaller_id);
CREATE INDEX IF NOT EXISTS idx_institute_leads_phone ON public.institute_leads(phone);
CREATE INDEX IF NOT EXISTS idx_institute_leads_status ON public.institute_leads(status);
CREATE INDEX IF NOT EXISTS idx_institute_leads_session ON public.institute_leads(session_id);

CREATE INDEX IF NOT EXISTS idx_commissions_lead ON public.commissions(lead_id);
CREATE INDEX IF NOT EXISTS idx_commissions_college ON public.commissions(college_id);

CREATE INDEX IF NOT EXISTS idx_call_logs_lead ON public.call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_telecaller ON public.call_logs(telecaller_id);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

CREATE INDEX IF NOT EXISTS idx_colleges_mode ON public.colleges(mode);
CREATE INDEX IF NOT EXISTS idx_colleges_status ON public.colleges(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_id);

CREATE INDEX IF NOT EXISTS idx_visitors_converted ON public.visitors(converted_to_lead_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON public.page_visits(session_id);