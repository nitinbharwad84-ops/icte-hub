-- Grant table access to authenticated role (RLS policies control actual row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colleges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institute_courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institute_leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_inquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_visits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_sessions TO authenticated;

-- Grant anon role access to public-facing tables only
-- (RLS policies further restrict inserts to source='website' etc.)
GRANT SELECT ON public.colleges TO anon;
GRANT SELECT ON public.institute_courses TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.institute_leads TO anon;
GRANT INSERT ON public.partner_inquiries TO anon;
GRANT INSERT ON public.visitors TO anon;
GRANT INSERT ON public.page_visits TO anon;
GRANT SELECT, INSERT ON public.lead_sessions TO anon;
