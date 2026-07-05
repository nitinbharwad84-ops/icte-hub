-- 1. Auto-sync auth.users -> public.users on account creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN
  INSERT INTO public.users (id, name, email, password_hash, role, must_change_password, created_by)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email, NEW.encrypted_password,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'telecaller'), true,
    (NEW.raw_user_meta_data ->> 'created_by')::UUID)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Commission auto-creation on lead enrolled-college
CREATE OR REPLACE FUNCTION public.handle_lead_enrolled()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE v_college_id UUID; BEGIN
  IF NEW.status = 'enrolled-college' AND OLD.status != 'enrolled-college' THEN
    FOREACH v_college_id IN ARRAY NEW.interested_college_ids LOOP
      INSERT INTO public.commissions (lead_id, college_id, status)
      VALUES (NEW.id, v_college_id, 'pending') ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_lead_enrolled ON public.leads;
CREATE TRIGGER on_lead_enrolled
  AFTER UPDATE OF status ON public.leads FOR EACH ROW
  WHEN (NEW.status = 'enrolled-college' AND OLD.status != 'enrolled-college')
  EXECUTE FUNCTION public.handle_lead_enrolled();

-- 3. Generic audit log trigger
CREATE OR REPLACE FUNCTION public.log_audit_entry()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE
  v_action TEXT; v_description TEXT; v_old JSONB; v_new JSONB;
  v_user_id UUID; v_user_role TEXT; v_target_entity TEXT;
BEGIN
  v_target_entity := TG_TABLE_NAME;
  v_user_id := auth.uid();
  v_user_role := COALESCE(public.get_user_role(), 'system');
  IF TG_OP = 'INSERT' THEN
    v_action := 'create'; v_new := to_jsonb(NEW);
    v_description := 'Created ' || v_target_entity || ' record';
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
    IF (v_target_entity IN ('leads', 'institute_leads') AND (v_old->>'status') IS DISTINCT FROM (v_new->>'status')) THEN
      v_action := 'status_change';
      v_description := 'Changed ' || v_target_entity || ' status from ''' || (v_old->>'status') || ''' to ''' || (v_new->>'status') || '''';
    ELSE
      v_action := 'update';
      v_description := 'Updated ' || v_target_entity || ' record';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete'; v_old := to_jsonb(OLD);
    v_description := 'Deleted ' || v_target_entity || ' record';
  END IF;
  INSERT INTO public.audit_logs (user_id, user_role, action, target_entity, target_id, description, old_value, new_value)
  VALUES (v_user_id, v_user_role, v_action, v_target_entity, COALESCE(NEW.id, OLD.id), v_description, v_old, v_new);
  RETURN COALESCE(NEW, OLD);
END; $$;

-- Attach audit triggers
DROP TRIGGER IF EXISTS audit_leads ON public.leads;
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
DROP TRIGGER IF EXISTS audit_institute_leads ON public.institute_leads;
CREATE TRIGGER audit_institute_leads AFTER INSERT OR UPDATE OR DELETE ON public.institute_leads FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
DROP TRIGGER IF EXISTS audit_colleges ON public.colleges;
CREATE TRIGGER audit_colleges AFTER INSERT OR UPDATE OR DELETE ON public.colleges FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
DROP TRIGGER IF EXISTS audit_institute_courses ON public.institute_courses;
CREATE TRIGGER audit_institute_courses AFTER INSERT OR UPDATE OR DELETE ON public.institute_courses FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
DROP TRIGGER IF EXISTS audit_users ON public.users;
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
DROP TRIGGER IF EXISTS audit_commissions ON public.commissions;
CREATE TRIGGER audit_commissions AFTER INSERT OR UPDATE OR DELETE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
DROP TRIGGER IF EXISTS audit_call_logs ON public.call_logs;
CREATE TRIGGER audit_call_logs AFTER INSERT OR UPDATE OR DELETE ON public.call_logs FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
