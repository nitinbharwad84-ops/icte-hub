-- Telecaller Auto-Assignment Algorithm
CREATE OR REPLACE FUNCTION public.assign_telecaller_to_lead()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ DECLARE v_telecaller_id UUID; BEGIN
  SELECT u.id INTO v_telecaller_id FROM public.users u
  WHERE u.role = 'telecaller' AND u.is_active = true
  ORDER BY (
    (SELECT COALESCE(SUM(CASE l.status WHEN 'new' THEN 1 WHEN 'contacted' THEN 2 WHEN 'interested' THEN 3 ELSE 0 END), 0)
     FROM public.leads l WHERE l.assigned_telecaller_id = u.id AND l.status NOT IN ('not-interested', 'enrolled-college', 'enrolled-institute'))
    +
    (SELECT COALESCE(SUM(CASE il.status WHEN 'new' THEN 1 WHEN 'contacted' THEN 2 WHEN 'interested' THEN 3 ELSE 0 END), 0)
     FROM public.institute_leads il WHERE il.assigned_telecaller_id = u.id AND il.status NOT IN ('not-interested', 'enrolled'))
  ) ASC, random() LIMIT 1;
  IF v_telecaller_id IS NOT NULL THEN
    NEW.assigned_telecaller_id := v_telecaller_id;
    NEW.auto_assigned := true;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_lead_created ON public.leads;
CREATE TRIGGER on_lead_created BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.assign_telecaller_to_lead();
DROP TRIGGER IF EXISTS on_institute_lead_created ON public.institute_leads;
CREATE TRIGGER on_institute_lead_created BEFORE INSERT ON public.institute_leads FOR EACH ROW EXECUTE FUNCTION public.assign_telecaller_to_lead();
