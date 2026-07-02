INSERT INTO storage.buckets (id, name, public)
VALUES ('college_logos', 'college_logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pictures', 'profile_pictures', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS public_read_logos ON storage.objects;
CREATE POLICY public_read_logos ON storage.objects FOR SELECT USING (bucket_id = 'college_logos');
DROP POLICY IF EXISTS admin_owner_write_logos ON storage.objects;
CREATE POLICY admin_owner_write_logos ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'college_logos' AND public.is_admin_or_owner());
DROP POLICY IF EXISTS admin_owner_update_logos ON storage.objects;
CREATE POLICY admin_owner_update_logos ON storage.objects FOR UPDATE USING (bucket_id = 'college_logos' AND public.is_admin_or_owner());
DROP POLICY IF EXISTS admin_owner_delete_logos ON storage.objects;
CREATE POLICY admin_owner_delete_logos ON storage.objects FOR DELETE USING (bucket_id = 'college_logos' AND public.is_admin_or_owner());

DROP POLICY IF EXISTS auth_read_avatars ON storage.objects;
CREATE POLICY auth_read_avatars ON storage.objects FOR SELECT USING (bucket_id = 'profile_pictures' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS admin_owner_write_avatars ON storage.objects;
CREATE POLICY admin_owner_write_avatars ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile_pictures' AND public.is_admin_or_owner());
DROP POLICY IF EXISTS telecaller_write_own_avatar ON storage.objects;
CREATE POLICY telecaller_write_own_avatar ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile_pictures' AND public.is_owner() = false AND public.is_admin() = false
  AND auth.uid()::TEXT = (string_to_array(name, '/'))[1]
);

UPDATE storage.buckets SET file_size_limit = 2097152 WHERE id IN ('college_logos', 'profile_pictures');
