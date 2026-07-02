-- Helper functions
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT COALESCE((SELECT role FROM public.users WHERE id = auth.uid()), 'guest'); $$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'); $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'); $$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')); $$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: owner=ALL, admin=on telecaller only, telecaller=self
CREATE POLICY owner_all_users ON public.users FOR ALL USING (public.is_owner());
CREATE POLICY admin_manage_telecallers ON public.users FOR ALL USING (public.is_admin() AND role = 'telecaller');
CREATE POLICY telecaller_self ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY telecaller_update_self ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Colleges: admin/owner=ALL, public=SELECT
CREATE POLICY admin_owner_all_colleges ON public.colleges FOR ALL USING (public.is_admin_or_owner());
CREATE POLICY public_select_colleges ON public.colleges FOR SELECT USING (true);

-- Institute Courses: admin/owner=ALL, public=SELECT
CREATE POLICY admin_owner_all_courses ON public.institute_courses FOR ALL USING (public.is_admin_or_owner());
CREATE POLICY public_select_courses ON public.institute_courses FOR SELECT USING (true);

-- Leads: admin/owner=ALL, telecaller=assigned only, public=INSERT
CREATE POLICY admin_owner_all_leads ON public.leads FOR ALL USING (public.is_admin_or_owner());
CREATE POLICY telecaller_assigned_leads ON public.leads FOR SELECT USING (auth.uid() = assigned_telecaller_id);
CREATE POLICY telecaller_update_assigned ON public.leads FOR UPDATE USING (auth.uid() = assigned_telecaller_id) WITH CHECK (auth.uid() = assigned_telecaller_id);
CREATE POLICY public_insert_leads ON public.leads FOR INSERT WITH CHECK (true);

-- Institute Leads: admin/owner=ALL, public=INSERT
CREATE POLICY admin_owner_all_institute_leads ON public.institute_leads FOR ALL USING (public.is_admin_or_owner());
CREATE POLICY public_insert_institute_leads ON public.institute_leads FOR INSERT WITH CHECK (true);

-- Commissions: admin/owner=ALL
CREATE POLICY admin_owner_all_commissions ON public.commissions FOR ALL USING (public.is_admin_or_owner());

-- Call Logs: admin/owner=ALL, telecaller=own leads only
CREATE POLICY admin_owner_all_call_logs ON public.call_logs FOR ALL USING (public.is_admin_or_owner());
CREATE POLICY telecaller_insert_call_logs ON public.call_logs FOR INSERT WITH CHECK (auth.uid() = (SELECT assigned_telecaller_id FROM public.leads WHERE id = lead_id));
CREATE POLICY telecaller_select_call_logs ON public.call_logs FOR SELECT USING (auth.uid() = (SELECT assigned_telecaller_id FROM public.leads WHERE id = lead_id));

-- Visitors: admin/owner=SELECT, public=INSERT/UPDATE
CREATE POLICY admin_owner_select_visitors ON public.visitors FOR SELECT USING (public.is_admin_or_owner());
CREATE POLICY public_upsert_visitors ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY public_update_own_visitors ON public.visitors FOR UPDATE USING (true);

-- Partner Inquiries: admin/owner=SELECT, public=INSERT
CREATE POLICY admin_owner_select_inquiries ON public.partner_inquiries FOR SELECT USING (public.is_admin_or_owner());
CREATE POLICY public_insert_inquiries ON public.partner_inquiries FOR INSERT WITH CHECK (true);

-- Audit Logs: owner=SELECT only (no INSERT/UPDATE/DELETE policies)
CREATE POLICY owner_select_audit_logs ON public.audit_logs FOR SELECT USING (public.is_owner());
