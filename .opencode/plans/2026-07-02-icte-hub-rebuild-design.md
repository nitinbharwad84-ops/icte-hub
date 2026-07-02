# ICTE Hub — Rebuild Design Document

> **Date**: July 2, 2026  
> **Status**: Approved for implementation  
> **Source Docs**: `docs/icte-hub.md` (PRD), `docs/icte-hub-design-system.md`, `docs/icte-hub-tech-stack.md`

## 1. Project Structure

```
icte-hub/
├── supabase/
│   └── migrations/
│       ├── 001_users.sql
│       ├── 002_colleges.sql
│       ├── 003_institute_courses.sql
│       ├── 004_leads.sql
│       ├── 005_institute_leads.sql
│       ├── 006_commissions.sql
│       ├── 007_call_logs.sql
│       ├── 008_visitors.sql
│       ├── 009_partner_inquiries.sql
│       ├── 010_audit_logs.sql
│       ├── 011_rls_policies.sql
│       ├── 012_triggers.sql
│       ├── 013_rpcs.sql
│       └── 014_storage_buckets.sql
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── change-password/page.tsx
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── colleges/page.tsx
│   │   │   ├── check-status/page.tsx
│   │   │   ├── partner-with-us/page.tsx
│   │   │   └── [legal_route]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── profile/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── institute-leads/page.tsx
│   │   │   │   ├── colleges/page.tsx
│   │   │   │   ├── institute-courses/page.tsx
│   │   │   │   ├── team/page.tsx
│   │   │   │   ├── commissions/page.tsx
│   │   │   │   ├── partner-inquiries/page.tsx
│   │   │   │   └── hot-leads/page.tsx
│   │   │   ├── owner/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── admins/page.tsx
│   │   │   │   └── audit-logs/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [userId]/page.tsx
│   │   │   └── telecaller/page.tsx
│   │   └── tracking/route.ts
│   ├── components/
│   │   ├── ui/ (Button, Card, Input, Badge, Modal, Select, Table, Skeleton, Spinner, Alert)
│   │   ├── layout/ (Header, Footer, AdminSidebar, OwnerSidebar, MobileDrawer, StickySubNav, DashboardHeader)
│   │   └── shared/ (IcteLogo, InquiryModal, InstituteInquiryModal, StatusBadge, CollegeCard, StatsCounter, CategoryTile, LeadTable, CallHistory, EmptyState)
│   ├── lib/
│   │   ├── supabase/ (client.ts, server.ts, admin.ts)
│   │   ├── utils/ (cn.ts, constants.ts, formatters.ts, session.ts)
│   │   ├── middleware.ts
│   │   └── actions/ (leads.ts, colleges.ts, institute-courses.ts, calls.ts, auth.ts, tracking.ts, export.ts)
│   └── styles/globals.css
├── public/favicon.svg
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

## 2. SQL Migrations

### 2.1 `001_users.sql`

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'telecaller')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  profile_picture_url TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 `002_colleges.sql`

```sql
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Online', 'Offline')),
  location TEXT,
  courses_offered TEXT[] DEFAULT '{}',
  commission_percent DECIMAL,
  commission_structure TEXT CHECK (commission_structure IN ('one-time', 'installments')),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 `003_institute_courses.sql`

```sql
CREATE TABLE IF NOT EXISTS public.institute_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration TEXT DEFAULT '2 years',
  fees DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.4 `004_leads.sql`

```sql
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_college_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute')),
  assigned_telecaller_id UUID REFERENCES public.users(id),
  auto_assigned BOOLEAN DEFAULT false,
  enrolled_institute_course_id UUID REFERENCES public.institute_courses(id),
  session_id TEXT,
  source TEXT DEFAULT 'direct',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.5 `005_institute_leads.sql`

```sql
CREATE TABLE IF NOT EXISTS public.institute_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_course_id UUID REFERENCES public.institute_courses(id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'enrolled')),
  assigned_telecaller_id UUID REFERENCES public.users(id),
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.6 `006_commissions.sql`

```sql
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id),
  college_id UUID NOT NULL REFERENCES public.colleges(id),
  amount DECIMAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.7 `007_call_logs.sql`

```sql
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id),
  telecaller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('interested', 'not-interested', 'call-back-later', 'no-answer')),
  notes TEXT,
  call_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.8 `008_visitors.sql`

```sql
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  viewed_colleges JSONB DEFAULT '[]'::jsonb,
  mode_filters_used TEXT[] DEFAULT '{}',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_to_lead_id UUID REFERENCES public.leads(id)
);
```

### 2.9 `009_partner_inquiries.sql`

```sql
CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.10 `010_audit_logs.sql`

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  user_role TEXT NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('create', 'update', 'delete', 'status_change', 'login', 'password_change', 'assign', 'export', 'upload')),
  target_entity TEXT NOT NULL
    CHECK (target_entity IN ('leads', 'institute_leads', 'colleges', 'institute_courses', 'users', 'commissions', 'call_logs', 'partner_inquiries', 'visitors', 'auth')),
  target_id UUID,
  description TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_entity ON public.audit_logs(target_entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
```

### 2.11 `011_rls_policies.sql`

```sql
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
```

### 2.12 `012_triggers.sql`

```sql
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
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000');
  v_user_role := COALESCE(public.get_user_role(), 'system');
  IF TG_OP = 'INSERT' THEN
    v_action := 'create'; v_new := to_jsonb(NEW);
    v_description := 'Created ' || v_target_entity || ' record';
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
    IF (v_target_entity IN ('leads', 'institute_leads') AND OLD.status IS DISTINCT FROM NEW.status) THEN
      v_action := 'status_change';
      v_description := 'Changed ' || v_target_entity || ' status from ''' || OLD.status || ''' to ''' || NEW.status || '''';
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
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
CREATE TRIGGER audit_institute_leads AFTER INSERT OR UPDATE OR DELETE ON public.institute_leads FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
CREATE TRIGGER audit_colleges AFTER INSERT OR UPDATE OR DELETE ON public.colleges FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
CREATE TRIGGER audit_institute_courses AFTER INSERT OR UPDATE OR DELETE ON public.institute_courses FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
CREATE TRIGGER audit_commissions AFTER INSERT OR UPDATE OR DELETE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
CREATE TRIGGER audit_call_logs AFTER INSERT OR UPDATE OR DELETE ON public.call_logs FOR EACH ROW EXECUTE FUNCTION public.log_audit_entry();
```

### 2.13 `013_rpcs.sql`

```sql
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
```

### 2.14 `014_storage_buckets.sql`

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('college_logos', 'college_logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pictures', 'profile_pictures', false)
ON CONFLICT (id) DO NOTHING;

-- College logos: public read, admin/owner write
CREATE POLICY public_read_logos ON storage.objects FOR SELECT USING (bucket_id = 'college_logos');
CREATE POLICY admin_owner_write_logos ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'college_logos' AND public.is_admin_or_owner());
CREATE POLICY admin_owner_update_logos ON storage.objects FOR UPDATE USING (bucket_id = 'college_logos' AND public.is_admin_or_owner());
CREATE POLICY admin_owner_delete_logos ON storage.objects FOR DELETE USING (bucket_id = 'college_logos' AND public.is_admin_or_owner());

-- Profile pictures: auth read, admin/owner write any, telecaller write own
CREATE POLICY auth_read_avatars ON storage.objects FOR SELECT USING (bucket_id = 'profile_pictures' AND auth.role() = 'authenticated');
CREATE POLICY admin_owner_write_avatars ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile_pictures' AND public.is_admin_or_owner());
CREATE POLICY telecaller_write_own_avatar ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile_pictures' AND public.is_owner() = false AND public.is_admin() = false
  AND auth.uid()::TEXT = (string_to_array(name, '/'))[1]
);

-- Set max file size (2MB)
UPDATE storage.buckets SET file_size_limit = 2097152 WHERE id IN ('college_logos', 'profile_pictures');
```

## 3. Auth Middleware

**`src/lib/middleware.ts`** logic:

```
Request -> Check Supabase session -> No  -> Redirect /login
                                   -> Yes -> Check must_change_password
                                          -> True -> Redirect /change-password
                                          -> False -> Match route pattern to role
                                                    -> /admin/* + role=telecaller -> Redirect /telecaller
                                                    -> /owner/* + role!=owner -> Redirect /admin or /telecaller
                                                    -> /telecaller/* + role!=telecaller -> Redirect /admin
                                                    -> Match -> Allow
```

| Route Pattern | Allowed Roles |
|---|---|
| `/(public)/*` | All (including guest) |
| `/(auth)/login` | Guest only |
| `/(auth)/change-password` | Any authenticated with must_change_password=true |
| `/(dashboard)/admin/*` | `admin`, `owner` |
| `/(dashboard)/owner/*` | `owner` only |
| `/(dashboard)/telecaller/*` | `telecaller` only |
| `/(dashboard)/profile/*` | Any authenticated |

## 4. Implementation Phases

**Phase 1 -- Foundation**: package.json, next.config.ts, tsconfig.json, tailwind.config.ts, globals.css, supabase clients, middleware, cn utility, constants, formatters, session helpers, 10 UI components, 4 layout components, IcteLogo, 14 SQL migrations, .env.local

**Phase 2 -- Public Pages**: Public layout, Home (all sections), Browse, Check Status, Partner With Us, Legal catch-all, Login, Change Password, shared components (InquiryModal, CollegeCard, StatsCounter, CategoryTile), server actions (leads, colleges, auth)

**Phase 3 -- Admin Dashboard**: Admin layout + sidebar, 8 pages (Leads, Institute Leads, Colleges, Courses, Team, Commissions, Partner Inquiries, Hot Leads), Profile, LeadTable, CallHistory, EmptyState, actions (calls, courses, export)

**Phase 4 -- Owner Dashboard**: Owner layout, Admin Management, Audit Logs (list + per-user detail with filters)

**Phase 5 -- Telecaller Dashboard**: Single page with assigned leads table + call logging

**Phase 6 -- Polish**: Tracking route, rate limiting (Upstash), error boundaries, loading states, empty/error states, image compression utility

## 5. Key Decisions

1. **No API routes** -- Server Actions for mutations, RSC for reads
2. **Audit logs via DB triggers** -- App never writes to audit_logs directly
3. **Auto-assignment in DB** -- Atomic RPC, no race conditions
4. **Commission auto-creation via trigger** -- Status change to enrolled-college
5. **User sync via trigger** -- auth.users AFTER INSERT -> public.users
6. **Client-side image optimization** -- WebP conversion before upload
7. **Session tracking** -- localStorage UUID, fire-and-forget POST

## 6. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```
