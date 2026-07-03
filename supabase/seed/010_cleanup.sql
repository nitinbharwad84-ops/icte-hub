-- ============================================================
-- COMPLETE CLEANUP: Removes ALL data + ALL users
-- ============================================================
-- WARNING: This DELETES everything in the database.
-- After running, you must re-run 001_create_owner.sql
-- and all seed files from scratch.
-- ============================================================

BEGIN;

-- Disable triggers temporarily to avoid audit log noise
SET session_replication_role = 'replica';

-- Clear tracking data
TRUNCATE TABLE public.page_visits CASCADE;
TRUNCATE TABLE public.visitors CASCADE;

-- Clear communications & commissions
TRUNCATE TABLE public.call_logs CASCADE;
TRUNCATE TABLE public.commissions CASCADE;

-- Clear leads
TRUNCATE TABLE public.leads CASCADE;
TRUNCATE TABLE public.institute_leads CASCADE;

-- Clear partner inquiries
TRUNCATE TABLE public.partner_inquiries CASCADE;

-- Clear courses & colleges
TRUNCATE TABLE public.institute_courses CASCADE;
TRUNCATE TABLE public.colleges CASCADE;

-- Clear audit logs (owned by owner only anyway)
TRUNCATE TABLE public.audit_logs CASCADE;

-- Remove all users EXCEPT the owner (we need owner to log in and recreate others)
-- Delete telecallers and admins first from auth (cascades to public.users via trigger)
DELETE FROM auth.users WHERE id IN (
  SELECT id FROM public.users WHERE role IN ('telecaller', 'admin')
);

-- Now delete the owner too (removes absolutely everyone)
-- ⚠️ UNCOMMENT THE NEXT 3 LINES to also remove the owner:
-- DELETE FROM public.users WHERE role = 'owner';
-- DELETE FROM auth.users WHERE id IN (SELECT id FROM public.users WHERE role = 'owner');
-- RAISE NOTICE 'Owner user also removed. Run 001_create_owner.sql to recreate.';

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify cleanup
SELECT 'users remaining' AS check_name, COUNT(*)::TEXT AS count FROM public.users
UNION ALL
SELECT 'leads', COUNT(*)::TEXT FROM public.leads
UNION ALL
SELECT 'institute_leads', COUNT(*)::TEXT FROM public.institute_leads
UNION ALL
SELECT 'colleges', COUNT(*)::TEXT FROM public.colleges
UNION ALL
SELECT 'institute_courses', COUNT(*)::TEXT FROM public.institute_courses
UNION ALL
SELECT 'commissions', COUNT(*)::TEXT FROM public.commissions
UNION ALL
SELECT 'call_logs', COUNT(*)::TEXT FROM public.call_logs
UNION ALL
SELECT 'partner_inquiries', COUNT(*)::TEXT FROM public.partner_inquiries
UNION ALL
SELECT 'visitors', COUNT(*)::TEXT FROM public.visitors
UNION ALL
SELECT 'audit_logs', COUNT(*)::TEXT FROM public.audit_logs;

COMMIT;
