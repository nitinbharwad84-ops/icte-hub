# ICTE Hub — Rebuild Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete ICTE Hub platform — a university discovery and student enrollment platform with public pages, admin/owner dashboards, telecaller dashboard, behavioral tracking, and audit logging.

**Architecture:** Next.js 15 App Router with React 19 Server Components for data fetching and Server Actions for mutations. Supabase (PostgreSQL) for database, auth, storage, and RLS. DB triggers for audit logs, commission auto-creation, and telecaller auto-assignment.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Supabase (DB/Auth/Storage/RLS), Postgres Triggers/RPCs, Zod, @upstash/ratelimit

## Global Constraints

- No public signup — accounts created only by Owner/Admin via Supabase Admin API
- Styling: Tailwind utility classes only, matching design tokens from docs/icte-hub-design-system.md
- Icons: Lucide React only (outline/line style, never filled)
- Font: Inter (300-800 weights via Google Fonts)
- All SQL migrations must be runnable in Supabase SQL Editor
- All DB write actions logged via Postgres triggers (app never writes to audit_logs directly)
- Telecaller auto-assignment runs as BEFORE INSERT trigger (atomic, no race conditions)
- Environment variables required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

---

## Phase 1 - Foundation (Project Setup + DB + Auth)

### Task 1.1: Scaffold Next.js 15 Project

**Files:**
- Create: package.json
- Create: tsconfig.json
- Create: next.config.ts
- Create: tailwind.config.ts
- Create: postcss.config.js
- Create: .env.local
- Create: public/favicon.svg

- [ ] **Step 1: Create package.json**

```json
{
  "name": "icte-hub",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.23.0",
    "browser-image-compression": "^2.0.0",
    "@upstash/ratelimit": "^2.0.0",
    "@upstash/redis": "^1.34.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'brand-blue': '#1E40FF',
        'brand-light': '#EEF2FF',
        'brand-dark': '#1A1A1A',
        'brand-orange': '#FFA94D',
        'brand-border': '#E5E7EB',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.08)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create .env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

- [ ] **Step 7: Create public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#1E40FF"/>
  <text x="16" y="21" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-weight="800" font-size="12">ICTE</text>
</svg>
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: node_modules created, no errors

### Task 1.2: Create Database Migrations (14 SQL files)

**Files:**
- Create: supabase/migrations/001_users.sql
- Create: supabase/migrations/002_colleges.sql
- Create: supabase/migrations/003_institute_courses.sql
- Create: supabase/migrations/004_leads.sql
- Create: supabase/migrations/005_institute_leads.sql
- Create: supabase/migrations/006_commissions.sql
- Create: supabase/migrations/007_call_logs.sql
- Create: supabase/migrations/008_visitors.sql
- Create: supabase/migrations/009_partner_inquiries.sql
- Create: supabase/migrations/010_audit_logs.sql
- Create: supabase/migrations/011_rls_policies.sql
- Create: supabase/migrations/012_triggers.sql
- Create: supabase/migrations/013_rpcs.sql
- Create: supabase/migrations/014_storage_buckets.sql

- [ ] **Step 1: Create 001_users.sql**

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

- [ ] **Step 2: Create 002_colleges.sql**

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

- [ ] **Step 3: Create 003_institute_courses.sql**

```sql
CREATE TABLE IF NOT EXISTS public.institute_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration TEXT DEFAULT '2 years',
  fees DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 4: Create 004_leads.sql**

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

- [ ] **Step 5: Create 005_institute_leads.sql**

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

- [ ] **Step 6: Create 006_commissions.sql**

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

- [ ] **Step 7: Create 007_call_logs.sql**

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

- [ ] **Step 8: Create 008_visitors.sql**

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

- [ ] **Step 9: Create 009_partner_inquiries.sql**

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

- [ ] **Step 10: Create 010_audit_logs.sql**

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
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

- [ ] **Step 11: Create 011_rls_policies.sql**

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

- [ ] **Step 12: Create 012_triggers.sql**

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
  v_user_id := auth.uid();
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
```

- [ ] **Step 13: Create 013_rpcs.sql**

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

- [ ] **Step 14: Create 014_storage_buckets.sql**

```sql
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
```

### Task 1.3: Create Supabase Clients

**Files:**
- Create: src/lib/supabase/client.ts
- Create: src/lib/supabase/server.ts
- Create: src/lib/supabase/admin.ts

- [ ] **Step 1: Create browser client**

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

```ts
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create admin client**

```ts
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

### Task 1.4: Create Middleware

**Files:**
- Create: src/middleware.ts

- [ ] **Step 1: Create middleware.ts**

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const publicPaths = ['/colleges', '/check-status', '/partner-with-us', '/privacy', '/terms', '/disclaimer'];
  const isPublic = path === '/' || publicPaths.some(p => path.startsWith(p));
  if (isPublic) return supabaseResponse;

  if (path === '/login') {
    if (!user) return supabaseResponse;
    const { data: profile } = await supabase.from('users').select('role,must_change_password').eq('id', user.id).single();
    if (profile?.must_change_password) return NextResponse.redirect(new URL('/change-password', request.url));
    return NextResponse.redirect(new URL(`/${profile?.role || 'telecaller'}`, request.url));
  }

  if (!user) return NextResponse.redirect(new URL('/login', request.url));
  const { data: profile } = await supabase.from('users').select('role,must_change_password,is_active').eq('id', user.id).single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (profile.must_change_password && path !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', request.url));
  }
  if (path === '/change-password') return supabaseResponse;

  const role = profile.role;
  if (path.startsWith('/owner') && role !== 'owner') return NextResponse.redirect(new URL(`/${role}`, request.url));
  if (path.startsWith('/admin') && !['admin', 'owner'].includes(role)) return NextResponse.redirect(new URL(`/${role}`, request.url));
  if (path.startsWith('/telecaller') && role !== 'telecaller') return NextResponse.redirect(new URL(`/${role}`, request.url));

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### Task 1.5: Create Utilities

**Files:**
- Create: src/lib/utils/cn.ts
- Create: src/lib/utils/constants.ts
- Create: src/lib/utils/formatters.ts
- Create: src/lib/utils/session.ts

- [ ] **Step 1: Create cn utility**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create constants**

```ts
export const STATUS_LABELS: Record<string, string> = {
  'new': 'Inquiry Received',
  'contacted': 'Contacted',
  'interested': 'Evaluation',
  'not-interested': 'Closed',
  'enrolled-college': 'Enrolled',
  'enrolled-institute': 'Directly Enrolled',
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  'new': "We've received your request! An advisor will review your options shortly.",
  'contacted': 'Our team has contacted you. We are ready to help you select a program.',
  'interested': 'Your profile is updated. We are finalizing details for your target universities.',
  'not-interested': 'Inquiry closed. Let us know if you decide to explore other courses.',
  'enrolled-college': 'Congratulations! You are enrolled in a partner university.',
  'enrolled-institute': 'Congratulations! You are enrolled directly in our degree program.',
};

export const CATEGORIES = [
  { abbr: 'BCA', name: 'Computer Applications', icon: 'MonitorPlay' },
  { abbr: 'BBA', name: 'Business Administration', icon: 'Briefcase' },
  { abbr: 'MBA', name: 'Business Mgmt (Masters)', icon: 'Award' },
  { abbr: 'BSc', name: 'Science & Technology', icon: 'Atom' },
  { abbr: 'MSc', name: 'Advanced Science', icon: 'Atom' },
  { abbr: 'BCom', name: 'Commerce & Finance', icon: 'Calculator' },
];

export const LEAD_STATUSES = ['new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute'] as const;
export const CALL_OUTCOMES = ['interested', 'not-interested', 'call-back-later', 'no-answer'] as const;
export const COLLEGE_MODES = ['Online', 'Offline'] as const;
```

- [ ] **Step 3: Create formatters**

```ts
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
}
```

- [ ] **Step 4: Create session utility**

```ts
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('icte_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('icte_session_id', id);
  }
  return id;
}

export function getSource(): string {
  if (typeof window === 'undefined') return 'direct';
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  if (source) {
    localStorage.setItem('icte_source', source);
    return source;
  }
  return localStorage.getItem('icte_source') || 'direct';
}
```

### Task 1.6: Create CSS Globals

**Files:**
- Create: src/styles/globals.css

- [ ] **Step 1: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
```

### Task 1.7: Create UI Components

**Files:**
- Create: src/components/ui/Button.tsx
- Create: src/components/ui/Card.tsx
- Create: src/components/ui/Input.tsx
- Create: src/components/ui/Badge.tsx
- Create: src/components/ui/Modal.tsx
- Create: src/components/ui/Select.tsx
- Create: src/components/ui/Table.tsx
- Create: src/components/ui/Skeleton.tsx
- Create: src/components/ui/Spinner.tsx
- Create: src/components/ui/Alert.tsx

- [ ] **Step 1: Button component**

```tsx
'use client';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40',
  secondary: 'bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white',
  dark: 'bg-slate-900 hover:bg-brand-blue text-white',
  danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
  ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all duration-200',
        size === 'sm' && 'px-3 py-1.5 rounded-lg',
        size === 'md' && 'px-5 py-2.5 rounded-xl',
        size === 'lg' && 'px-6 py-3 rounded-xl',
        variants[variant],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
```

- [ ] **Step 2: Card component**

```tsx
import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ className, hover = true, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-slate-100 transition-all duration-300',
        glass ? 'bg-white/90 backdrop-blur-2xl border-white shadow-2xl' : 'bg-white/90 backdrop-blur-xl shadow-card',
        hover && 'hover:shadow-card-hover hover:-translate-y-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Input component**

```tsx
'use client';
import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  dark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, dark, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl text-sm font-semibold transition-all duration-200 outline-none',
            icon ? 'pl-11 pr-4 py-3' : 'px-4 py-3',
            dark
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
              : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
```

- [ ] **Step 4: Badge component**

```tsx
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  variant?: 'status' | 'mode' | 'default';
  color?: 'blue' | 'indigo' | 'purple' | 'slate' | 'emerald' | 'teal' | 'cyan' | 'orange';
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-blue-700 bg-blue-50 border-blue-200',
  indigo: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  purple: 'text-purple-700 bg-purple-50 border-purple-200',
  slate: 'text-slate-500 bg-slate-50 border-slate-200',
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  teal: 'text-teal-700 bg-teal-50 border-teal-200',
  cyan: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  orange: 'text-orange-700 bg-orange-50 border-orange-200',
};

export function Badge({ color = 'slate', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border',
      colorMap[color], className
    )}>
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Modal component**

```tsx
'use client';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-[2rem] shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto', className)}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Select component**

```tsx
'use client';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold px-4 py-3 pr-10 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all',
            error && 'border-red-500', className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
```

- [ ] **Step 7: Table component**

```tsx
import { cn } from '@/lib/utils/cn';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  className?: string;
}

export function Table<T>({ columns, data, keyExtractor, className }: TableProps<T>) {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className={cn('w-full text-sm', className)}>
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className={cn('text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pb-3 px-4', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={cn('py-3 px-4 text-slate-700', col.className)}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 8: Skeleton component**

```tsx
import { cn } from '@/lib/utils/cn';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-slate-200 rounded-xl', className)} />;
}
```

- [ ] **Step 9: Spinner component**

```tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SpinnerProps { className?: string; size?: number; }

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin text-indigo-500', className)} size={size} />;
}
```

- [ ] **Step 10: Alert component**

```tsx
import { cn } from '@/lib/utils/cn';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const alertStyles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const alertIcons = { error: AlertTriangle, success: CheckCircle, warning: AlertTriangle, info: Info };

export function Alert({ variant = 'info', children, className }: AlertProps) {
  const Icon = alertIcons[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm font-medium', alertStyles[variant], className)}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}
```

### Task 1.8: Create Layout Components

**Files:**
- Create: src/components/layout/Header.tsx
- Create: src/components/layout/Footer.tsx
- Create: src/components/layout/MobileDrawer.tsx
- Create: src/components/shared/IcteLogo.tsx

- [ ] **Step 1: IcteLogo component**

```tsx
import Image from 'next/image';

interface IcteLogoProps { size?: number; className?: string; }

export function IcteLogo({ size = 40, className }: IcteLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ICTE Hub"
      width={size * 3}
      height={size}
      className={className}
      style={{ height: size, width: 'auto' }}
      priority
    />
  );
}
```

Copy `docs/logo.png` to `public/logo.png`.

- [ ] **Step 2: Header component**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { Button } from '@/components/ui/Button';
import { Menu } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <IcteLogo size={32} />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {['Universities', 'Courses', 'Programs'].map((item) => (
              <Link key={item} href={item === 'Universities' ? '/colleges' : '#'}
                className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all">
                {item}
              </Link>
            ))}
            <Link href="/login"><Button variant="primary" size="sm">Login</Button></Link>
          </nav>
          <button onClick={() => setDrawerOpen(true)} className="md:hidden text-slate-600 p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: MobileDrawer component**

```tsx
'use client';
import Link from 'next/link';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface MobileDrawerProps { open: boolean; onClose: () => void; }

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 z-50 w-72 h-full bg-white border-r border-slate-200/80 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <IcteLogo size={28} />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {['Universities', 'Courses', 'Programs', 'Get Help'].map((item) => (
            <Link key={item} href={item === 'Universities' ? '/colleges' : '#'}
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-3 rounded-lg transition-all"
              onClick={onClose}>{item}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Link href="/login" onClick={onClose}><Button variant="primary" className="w-full">Login</Button></Link>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Footer component**

```tsx
import Link from 'next/link';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 inline-block mb-4"><IcteLogo size={36} /></div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Find the right university for your future. Accompanying you at every step of your educational roadmap.</p>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/colleges" className="text-sm text-slate-400 hover:text-white transition-colors">Universities</Link></li>
              <li><Link href="/check-status" className="text-sm text-slate-400 hover:text-white transition-colors">Check Status</Link></li>
              <li><Link href="/partner-with-us" className="text-sm text-slate-400 hover:text-white transition-colors">Partner With Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-slate-400 hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400"><Phone className="w-4 h-4 text-slate-500" /> +91 XXXXX XXXXX</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><Mail className="w-4 h-4 text-slate-500" /> info@ictehub.com</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="w-4 h-4 text-slate-500" /> New Delhi, India</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} ICTE Hub. All rights reserved.</p>
          <p className="text-xs text-slate-600">Built with care in India</p>
        </div>
      </div>
    </footer>
  );
}
```

### Task 1.9: Create App Root Layout

**Files:**
- Create: src/app/layout.tsx
- Create: src/app/page.tsx

- [ ] **Step 1: Root layout**

```tsx
import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ICTE Hub - Find Your Right University',
  description: 'Compare colleges, get free counseling, and find the right university for your future with ICTE Hub.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Root page redirect**

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() { redirect('/'); }
```

### Task 1.10: Initialize Git Repository

- [ ] **Step 1: Create .gitignore**

```
node_modules/
.next/
.env.local
.env*.local
out/
```

- [ ] **Step 2: Initialize git**

```bash
git init
git add -A
git commit -m "feat: initial scaffold - Next.js 15 + Supabase + design system"
```

---

## Phase 2 - Public Pages

### Task 2.1: Create Public Layout

**Files:**
- Create: src/app/(public)/layout.tsx

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
```

### Task 2.2: Create Home Page

**Files:**
- Create: src/app/(public)/page.tsx
- Create: src/app/(public)/loading.tsx

The home page has these sections, each as its own component within the file or inlined:
- HeroSection: gradient H1, animated mesh blobs (3 divs with blob animation), two CTAs
- StatsCounter: client component fetching college/course counts, animated with IntersectionObserver
- TopRecommendations: fetches first 3 colleges, glass card display
- SmartUniversityFinder: dark search bar with keyword input + mode dropdown, navigates to /colleges?search=X&mode=Y
- FeaturedUniversities: fetches first 6 colleges, grid of CollegeCard
- BrowseByCategory: 6 CATEGORIES tiles, each links to /colleges?search=BCA etc.
- DegreePrograms: conditional section, fetches institute_courses, shows enrollment button opening InstituteInquiryModal
- InlineCTA: dark bg section, left: benefits list, right: inline inquiry form
- StickySubNav: IntersectionObserver tracking sections, appears after hero scrolls up

Data fetching: All DB reads happen in the Server Component. Client components receive data as props.

### Task 2.3: Shared Components

**Files:**
- Create: src/components/shared/InquiryModal.tsx
- Create: src/components/shared/InstituteInquiryModal.tsx
- Create: src/components/shared/CollegeCard.tsx
- Create: src/components/shared/StatusBadge.tsx
- Create: src/components/shared/CategoryTile.tsx
- Create: src/components/shared/StatsCounter.tsx

**InquiryModal**: Modal with form (name, phone, email, college multi-select). Server Action creates lead. Zod validation. Shows success/error state.

**CollegeCard**: Card with colored top border strip (cyan for Online, indigo for Offline), logo/initials avatar, name, mode badge, location, course tags, expandable courses list, "Request Info" button opening InquiryModal.

**StatusBadge**: Maps internal status to friendly label + color via constants.ts. Badge component wrapper.

### Task 2.4: College Browse Page

**Files:**
- Create: src/app/(public)/colleges/page.tsx
- Create: src/app/(public)/colleges/loading.tsx

Server Component that reads search params (?search=X&mode=Y). Fetches colleges with ILIKE name search and mode filter. Renders header, stats cards, search/filter bar, college grid. Client component handles the filter bar with URL search params.

### Task 2.5: Check Status Page

**Files:**
- Create: src/app/(public)/check-status/page.tsx

Form with name + phone. Server Action: queries leads WHERE name ILIKE input AND phone = input. Returns generic empty response if no match. On match, shows each matching lead with StatusBadge, description, interested colleges, date.

### Task 2.6: Partner With Us Page

**Files:**
- Create: src/app/(public)/partner-with-us/page.tsx

Form: college_name, contact_person, phone, email, message. Server Action inserts into partner_inquiries. Shows success state on completion.

### Task 2.7: Legal Pages

**Files:**
- Create: src/app/(public)/[legal_route]/page.tsx

Catch-all for privacy, terms, disclaimer. Renders static content in card layout. 404 if route doesn't match known pages.

### Task 2.8: Login Page

**Files:**
- Create: src/app/(auth)/login/page.tsx

Glass card on animated mesh gradient. Email + password fields. Server Action: supabase.auth.signInWithPassword(). On success, middleware handles redirect based on role. Error display for invalid credentials.

### Task 2.9: Force Password Change Page

**Files:**
- Create: src/app/(auth)/change-password/page.tsx

Fields: current password, new password, confirm new password. Server Action verifies current password via signInWithPassword, then calls supabase.auth.updateUser(). Sets must_change_password=false via admin API. Redirects to dashboard on success. Error display for mismatched passwords or weak passwords.

### Task 2.10: Create Server Actions

**Files:**
- Create: src/lib/actions/leads.ts
- Create: src/lib/actions/colleges.ts
- Create: src/lib/actions/auth.ts

**leads.ts**: createLeadAction (insert + validate), updateLeadStatusAction, createInstituteLeadAction
**colleges.ts**: getCollegesAction (already done via RSC), trackCollegeViewAction
**auth.ts**: loginAction, changePasswordAction

---

## Phase 3 - Admin Dashboard

### Task 3.1: Admin Layout

**Files:**
- Create: src/app/(dashboard)/admin/layout.tsx
- Create: src/components/layout/AdminSidebar.tsx

**AdminSidebar**: Fixed w-60 sidebar with nav items (Leads, Institute Leads, Colleges, Institute Courses, Team, Commissions, Partner Inquiries, Hot Leads). Bottom: user profile card with avatar/initials, name, email, profile button, logout button. Active nav item highlighted.

**Layout**: Fetches current user. Desktop: sidebar + md:ml-60 content. Mobile: hamburger trigger at top, sidebar as overlay drawer.

### Task 3.2: Lead Management Page

**Files:**
- Create: src/app/(dashboard)/admin/page.tsx

Table with columns: name, phone, email, interested colleges, status badge, assigned telecaller, date. Filters: status dropdown, telecaller dropdown, date range. Assign/reassign telecaller via inline select. Update status via dropdown. View call history button opens call log modal. CSV export button.

### Task 3.3: Institute Leads Page

**Files:**
- Create: src/app/(dashboard)/admin/institute-leads/page.tsx

Same pattern as Lead Management but for institute_leads table. Columns: name, phone, email, interested course, status, message, date.

### Task 3.4: College Management Page

**Files:**
- Create: src/app/(dashboard)/admin/colleges/page.tsx

CRUD table. Add button opens form modal: name, mode (select Online/Offline), location (shown if Offline), courses_offered (multi-tag input or comma-separated), commission_percent, commission_structure, contact info, logo upload. Edit opens same form pre-filled. Delete with confirmation dialog. Logo upload uses browser-image-compression (max 400px, WebP, 85-95% quality).

### Task 3.5: Institute Courses Page

**Files:**
- Create: src/app/(dashboard)/admin/institute-courses/page.tsx

Simple CRUD: name input, duration input, fees input. Add/edit/delete.

### Task 3.6: Team Management Page

**Files:**
- Create: src/app/(dashboard)/admin/team/page.tsx

Table of telecallers (filtered by RLS to role=telecaller). Columns: name, email, active status (toggle switch), profile picture, assigned leads count. Create button opens form: name, email, password. Uses Supabase Admin API createUser with role=telecaller. Delete with confirmation. Pause/unpause toggle updates is_active.

### Task 3.7: Commissions Page

**Files:**
- Create: src/app/(dashboard)/admin/commissions/page.tsx

Table: lead name, college name, amount (editable input), status (dropdown: pending/received), date. Inline edit for amount and status. Auto-populated by DB trigger.

### Task 3.8: Partner Inquiries Page

**Files:**
- Create: src/app/(dashboard)/admin/partner-inquiries/page.tsx

Read-only table: college name, contact person, phone, email, message, date.

### Task 3.9: Hot Leads Page

**Files:**
- Create: src/app/(dashboard)/admin/hot-leads/page.tsx

Table from visitors WHERE converted_to_lead_id IS NULL. Columns: session_id (first 8 chars), colleges viewed (count), first_seen, last_seen, total views. Sorted by view count desc.

### Task 3.10: Profile Page

**Files:**
- Create: src/app/(dashboard)/profile/page.tsx

View/edit name. Upload profile picture (browser-image-compression: max 200px, WebP, 60-70% quality). Save button updates users table.

### Task 3.11: Create Additional Server Actions

**Files:**
- Create: src/lib/actions/calls.ts
- Create: src/lib/actions/institute-courses.ts
- Create: src/lib/actions/export.ts

**calls.ts**: logCallAction (insert into call_logs)
**institute-courses.ts**: createInstituteCourseAction, updateInstituteCourseAction, deleteInstituteCourseAction
**export.ts**: exportLeadsCsvAction (fetches leads, returns CSV string)

---

## Phase 4 - Owner Dashboard

### Task 4.1: Owner Layout

**Files:**
- Create: src/app/(dashboard)/owner/layout.tsx
- Create: src/components/layout/OwnerSidebar.tsx

Same as AdminSidebar but adds: Admin Management (ShieldCheck icon), Audit Logs (ScrollText icon) above the user profile section. Role badge shows "Owner".

### Task 4.2: Admin Management Page

**Files:**
- Create: src/app/(dashboard)/owner/admins/page.tsx

Table of admin accounts (filtered by role=admin). Create: name, email, password via Supabase Admin API with role=admin. Toggle is_active. Delete admin. Reset password: sets temporary password and must_change_password=true.

### Task 4.3: Audit Logs - User List

**Files:**
- Create: src/app/(dashboard)/owner/audit-logs/page.tsx

List of all internal users (admins + telecallers). Columns: name, email, role badge (Owner hidden, Admin/Telecaller), active status dot, last activity (from audit_logs max created_at for that user). Filters: role (All/Admin/Telecaller), search by name/email. Click row -> navigate to /owner/audit-logs/:userId.

### Task 4.4: Audit Logs - Per-User Detail

**Files:**
- Create: src/app/(dashboard)/owner/audit-logs/[userId]/page.tsx

Fetches user profile, then paginated audit_logs for that user (50 per page). Each row: action badge, target entity, target ID, description, old/new JSON (collapsible), IP address, timestamp. Filters: action type dropdown, target entity dropdown, date range. Sortable by created_at (default desc).

---

## Phase 5 - Telecaller Dashboard

### Task 5.1: Telecaller Page

**Files:**
- Create: src/app/(dashboard)/telecaller/page.tsx
- Create: src/app/(dashboard)/telecaller/layout.tsx

Simple layout (no sidebar, just a minimal top bar with logo + logout). Page shows table of leads WHERE assigned_telecaller_id = current user (auto-filtered by RLS). Each row expandable to show:
- Status update dropdown
- Call outcome form (outcome select + notes textarea)
- Call history list below

---

## Phase 6 - Behavioral Tracking & Polish

### Task 6.1: Visitor Tracking Route

**Files:**
- Create: src/app/tracking/route.ts

POST /tracking accepts JSON: { session_id, action, payload }. Upserts visitor data:
- action=view_college: appends { college_id, college_name } to viewed_colleges JSON array
- action=filter_change: appends mode to mode_filters_used
- action=converted: sets converted_to_lead_id

### Task 6.2: Client-Side Tracking Hook

**Files:**
- Create: src/lib/hooks/useTracking.ts

Custom hook that returns track function. Fire-and-forGET POST to /tracking. No blocking, no error handling (fail silently).

### Task 6.3: Rate Limiting

**Files:**
- Modify: src/lib/actions/leads.ts (add rate limit)
- Modify: src/lib/actions/auth.ts (add rate limit)

Use @upstash/ratelimit. Login: 20 attempts / 15 min per IP. Lead creation: 50 / 15 min per IP.

### Task 6.4: Error Boundaries

**Files:**
- Create: src/app/(public)/error.tsx
- Create: src/app/(dashboard)/error.tsx

Each error.tsx: "Something went wrong" message + "Try Again" button that calls reset().

### Task 6.5: Image Compression Utility

**Files:**
- Create: src/lib/utils/image-compression.ts

```ts
import compress from 'browser-image-compression';

export async function compressLogo(file: File): Promise<File> {
  return compress(file, { maxWidthOrHeight: 400, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.9 });
}

export async function compressProfile(file: File): Promise<File> {
  return compress(file, { maxWidthOrHeight: 200, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.65 });
}
```

---

## Spec Coverage Summary

| Spec Requirement | Phase.Task |
|---|---|
| All DB tables (users, colleges, courses, leads, etc.) | 1.2 |
| RLS policies for role-based access | 1.2 (011) |
| Trigger: auth.users sync to public.users | 1.2 (012) |
| Trigger: commission auto-creation | 1.2 (012) |
| Trigger: audit log entries | 1.2 (012) |
| RPC: telecaller auto-assignment | 1.2 (013) |
| Storage buckets + policies | 1.2 (014) |
| Supabase clients (browser, server, admin) | 1.3 |
| Auth middleware (forced password change, role routing) | 1.4 |
| Design system: colors, typography, spacing, animations | 1.6, 1.7 |
| Public layout (header, footer, mobile drawer) | 1.8, 2.1 |
| Home page with all sections | 2.2 |
| College browse with search/filter | 2.4 |
| Check status (phone + name lookup) | 2.5 |
| Partner With Us form | 2.6 |
| Legal pages | 2.7 |
| Login page | 2.8 |
| Force password change | 2.9 |
| Inquiry modals | 2.3 |
| College cards | 2.3 |
| Admin sidebar + all 8 pages | 3.1-3.9 |
| Profile page | 3.10 |
| Owner sidebar + Admin Management | 4.1, 4.2 |
| Audit logs (user list + per-user detail) | 4.3, 4.4 |
| Telecaller dashboard | 5.1 |
| Visitor behavioral tracking | 6.1, 6.2 |
| Rate limiting | 6.3 |
| Error boundaries | 6.4 |
| Image compression | 6.5 |
