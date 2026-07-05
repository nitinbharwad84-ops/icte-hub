-- ============================================================
-- MIGRATION 018: SCHEMA FIXES — code/schema mismatches
-- ============================================================

-- ============================================================
-- FIX 1: leads — missing `message` column
-- createLeadAction inserts message but column doesn't exist
-- ============================================================

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message TEXT;

-- ============================================================
-- FIX 2: partner_inquiries — missing `institution_type` column
-- createPartnerInquiry inserts institution_type but column doesn't exist
-- ============================================================

ALTER TABLE public.partner_inquiries ADD COLUMN IF NOT EXISTS institution_type TEXT;

-- ============================================================
-- FIX 3: RLS — public leads INSERT blocked by source mismatch
-- createLeadAction sends source='website' (corrected in code)
-- Policy already correctly requires source='website' for public inserts
-- No schema change needed here — code fix is in leads.ts
-- ============================================================

-- ============================================================
-- FIX 4: RLS — checkLeadStatus needs public SELECT on leads
-- Anon users (check-status page) have no SELECT policy → always empty
-- Solution: SECURITY DEFINER RPC that bypasses RLS safely
-- ============================================================

DROP FUNCTION IF EXISTS public.check_lead_status(text, text);

CREATE OR REPLACE FUNCTION public.check_lead_status(p_name TEXT, p_phone TEXT)
RETURNS TABLE(
  name                   TEXT,
  status                 TEXT,
  interested_college_ids UUID[],
  created_at             TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return rows where BOTH name AND phone match — no full-table exposure
  RETURN QUERY
  SELECT
    l.name,
    l.status,
    l.interested_college_ids,
    l.created_at
  FROM public.leads l
  WHERE l.phone = p_phone
    AND l.name ILIKE p_name;
END;
$$;

-- Allow anon and authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.check_lead_status(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_lead_status(TEXT, TEXT) TO authenticated;

-- ============================================================
-- FIX 5a: profile_pictures — make bucket public
-- Code calls getPublicUrl() which only works for public buckets
-- Private bucket URLs are inaccessible from <img> tags (no auth headers)
-- ============================================================

UPDATE storage.buckets SET public = true WHERE id = 'profile_pictures';

-- ============================================================
-- FIX 5b: profile_pictures — add UPDATE + DELETE policies for admin/owner
-- admin_owner_write_avatars only covers INSERT
-- Upsert on re-upload requires an UPDATE policy too
-- ============================================================

DROP POLICY IF EXISTS admin_owner_update_avatars ON storage.objects;
CREATE POLICY admin_owner_update_avatars ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile_pictures' AND public.is_admin_or_owner()
) WITH CHECK (
  bucket_id = 'profile_pictures' AND public.is_admin_or_owner()
);

DROP POLICY IF EXISTS admin_owner_delete_avatars ON storage.objects;
CREATE POLICY admin_owner_delete_avatars ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile_pictures' AND public.is_admin_or_owner()
);
