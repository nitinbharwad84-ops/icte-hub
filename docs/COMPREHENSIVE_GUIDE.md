<div align="center">
  <h1 style="margin: 0; font-size: 2.2rem; font-weight: 800; color: #1E40FF;">ICTE Hub</h1>
  <p style="font-size: 1.1rem; color: #64748b; margin-top: 0.25rem;">
    <strong>Comprehensive Architecture &amp; Implementation Guide</strong>
  </p>
  <p style="color: #94a3b8; font-size: 0.9rem;">
    For clients, developers, and stakeholders — understanding every layer of the platform
  </p>
</div>

---

<details>
  <summary><strong>📋 Table of Contents</strong></summary>

- [1. Project Overview](#1-project-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Technology Decisions & Rationale](#3-technology-decisions--rationale)
- [4. Route Structure & Navigation Flow](#4-route-structure--navigation-flow)
- [5. Database Schema & Relationships](#5-database-schema--relationships)
- [6. Row Level Security (RLS) Deep Dive](#6-row-level-security-rls-deep-dive)
- [7. Database Triggers & Automations](#7-database-triggers--automations)
- [8. Telecaller Auto-Assignment Algorithm](#8-telecaller-auto-assignment-algorithm)
- [9. Authentication & Authorization Flow](#9-authentication--authorization-flow)
- [10. Business Logic Flows](#10-business-logic-flows)
- [11. Component Architecture](#11-component-architecture)
- [12. Data Flow Patterns](#12-data-flow-patterns)
- [13. Audit Logging System](#13-audit-logging-system)
- [14. Behavioral Tracking System](#14-behavioral-tracking-system)
- [15. Security Considerations](#15-security-considerations)
- [16. Rate Limiting Strategy](#16-rate-limiting-strategy)
- [17. Deployment Architecture](#17-deployment-architecture)

</details>

---

## 1. Project Overview

ICTE Hub is a **university discovery and student enrollment platform** that connects students with universities and degree programs. It serves three categories of users:

| Stakeholder | Need | Solution |
|-------------|------|----------|
| **Students** | Find the right university/course, check application status | Public pages: college browse, status check, inquiry forms |
| **Telecallers** | Manage assigned leads, log calls, update statuses | Telecaller dashboard with lead table + call logging |
| **Admins** | Oversee all leads, manage colleges/courses/team, track commissions | Admin dashboard with 8 management pages |
| **Owners** | Full system control, manage admins, view audit trails | Owner dashboard with admin mgmt + audit logs |

### Core Workflow

```
Student browses colleges → Submits inquiry (lead created)
    ↓
Lead auto-assigned to telecaller (via DB trigger)
    ↓
Telecaller contacts student → Logs call outcome
    ↓
Student enrolls → Status changes to 'enrolled-college'
    ↓
Commission auto-created (via DB trigger)
    ↓
Admin marks commission as 'received' → Payout completed
```

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel (Edge Network)                     │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js 15 App Router                   │  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │  Server       │  │  Server      │  │  Middleware     │  │  │
│  │  │  Components   │  │  Actions     │  │  (Edge)        │  │  │
│  │  │  (RSC)        │  │  (Mutations) │  │  Auth + Route  │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │  │
│  │         │                  │                   │           │  │
│  │  ┌──────┴──────────────────┴───────────────────┴────────┐ │  │
│  │  │              Client Components                       │ │  │
│  │  │         (Interactivity, State, Effects)              │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                        Supabase                                  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   Auth         │  │  PostgreSQL    │  │  Storage          │  │
│  │   (GoTrue)     │  │  + RLS         │  │  (S3-compatible)  │  │
│  │                │  │  + Triggers    │  │                   │  │
│  │  • Email/Pass  │  │  + RPCs        │  │  • college_logos  │  │
│  │  • Sessions    │  │  + Functions   │  │  • profile_pics   │  │
│  │  • JWT Tokens  │  │                │  │                   │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Fetching | **Server Components** | No client-side waterfalls, direct DB access, smaller JS bundle |
| Mutations | **Server Actions** | No API routes to maintain, built-in progressive enhancement, revalidatePath |
| Auth | **Supabase Auth** | Managed service, JWT-based, integrates with RLS natively |
| Rate Limiting | **Upstash** | Serverless Redis, edge-compatible, sliding window algorithm |
| Image Handling | **Client-side compression** | Reduces upload size before sending to Supabase Storage |
| Audit Logs | **DB Triggers** | Cannot be bypassed by app code, 100% coverage, zero app logic |
| Role Protection | **Middleware + RLS** | Defense in depth — middleware guards routes, RLS guards data |

---

## 3. Technology Decisions & Rationale

### Why Next.js 15 App Router?

- **Server Components by default** — data fetching happens on the server, reducing client JS
- **Server Actions** — form mutations without building API endpoints
- **Middleware (Edge)** — auth checks run at the edge before request reaches the page
- **Layout nesting** — route groups ((public), (auth), (dashboard)) keep code organized
- **Streaming & Suspense** — progressive loading for data-heavy pages

### Why Supabase?

- **Managed PostgreSQL** — no server management, built-in backups, point-in-time recovery
- **Auth (GoTrue)** — JWT-based auth that integrates directly with PostgreSQL RLS
- **Row Level Security** — data access policies at the database level, can't be bypassed
- **Realtime** — option to subscribe to DB changes if needed later
- **Storage** — S3-compatible file storage with RLS policies
- **Triggers & RPCs** — business logic runs inside the database atomically

### Why Not API Routes?

Server Actions provide the same functionality with less boilerplate:
- No route files to create
- No request/response handling
- Built-in form handling with progressive enhancement
- `revalidatePath()` for cache invalidation
- Type-safe without serialization

### Why DB Triggers for Business Logic?

Critical operations run inside PostgreSQL to ensure **atomicity** and **consistency**:

| Operation | Risk if done in App Code | DB Trigger Solution |
|-----------|-------------------------|-------------------|
| Telecaller Assignment | Race condition on concurrent inserts | `BEFORE INSERT` trigger reads + assigns in same transaction |
| Commission Creation | Could be forgotten or delayed | `AFTER UPDATE` trigger fires atomically on status change |
| Audit Logging | Developer might forget to call log function | `AFTER INSERT/UPDATE/DELETE` triggers always fire |
| User Sync | Profile might not be created | `AFTER INSERT` on `auth.users` creates `public.users` |

---

## 4. Route Structure & Navigation Flow

```
/                                              # Home page (public)
├── /colleges                                  # College browse (public)
├── /check-status                              # Lead status lookup (public)
├── /partner-with-us                           # Partner inquiry form (public)
├── /privacy                                   # Privacy policy (public)
├── /terms                                     # Terms of service (public)
├── /disclaimer                                # Disclaimer (public)
│
├── /login                                     # Login page (auth — has "Back to Home" link)
│
├── /admin                                     # Admin dashboard
│   ├── /admin/institute-leads                 # Institute leads management
│   ├── /admin/colleges                        # College CRUD
│   ├── /admin/institute-courses               # Course offerings CRUD
│   ├── /admin/team                            # Telecaller management
│   ├── /admin/commissions                     # Commission tracker
│   ├── /admin/partner-inquiries               # Partner form submissions
│   └── /admin/hot-leads                       # Behavioral analytics
│
├── /owner                                     # Owner dashboard
│   ├── /owner/admins                          # Admin account management
│   └── /owner/audit-logs                      # Audit log viewer
│       └── /owner/audit-logs/[userId]         # Per-user audit detail
│
├── /telecaller                                # Telecaller dashboard
├── /profile                                   # User profile (all roles)
└── /tracking                                  # Behavioral tracking API (POST)
```

### Route Group Organization

```
src/app/
├── (public)/          # Layout: Header + Footer
│   ├── page.tsx       # Home page
│   ├── colleges/
│   ├── check-status/
│   ├── partner-with-us/
│   └── [legal_route]/
│
├── (auth)/            # Layout: minimal (no header/footer)
│   └── login/
│
├── (dashboard)/       # Layout: sidebar + content
│   ├── admin/
│   ├── owner/
│   ├── telecaller/
│   └── profile/
│
└── tracking/          # No layout (API route)
    └── route.ts
```

### Middleware Role Routing

The middleware at `src/middleware.ts` handles all auth-aware routing:

```
Request → Middleware
    ├── Public path? → Allow through
    ├── /login?
    │   ├── Not logged in → Show login page
    │   └── Logged in → Redirect to role dashboard (/admin, /owner, /telecaller)
    ├── Not logged in? → Redirect to /login
    ├── Forced password change? → Redirect to /{role}?change_password=true (modal on dashboard)
    ├── Role mismatch?
    │   ├── /owner but not owner → Redirect to /admin
    │   ├── /admin but not admin/owner → Redirect to /telecaller
    │   └── /telecaller but not telecaller → Redirect to /admin
    └── All good → Allow through
```

---

## 5. Database Schema & Relationships

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   auth.users │────→│  public.users│←────│   commissions    │
│  (Supabase)  │     │              │     │                  │
└──────────────┘     │ id (PK)      │     │ lead_id (FK)     │
                     │ role         │     │ college_id (FK)  │
                     │ is_active    │     │ amount           │
                     │ must_change_ │     │ status           │
                     │   password   │     │ pending/received │
                     └──────────────┘     └──────────────────┘
                           │ ↑                    ↑
                           │ │                    │
                     ┌─────┴─┴────────────────────┘
                     │
               ┌─────┴──────────────────┐
               │        leads           │
               │                        │
               │ id (PK)                │
               │ name, phone, email     │
               │ interested_college_ids │──→ public.colleges
               │ status (enum)          │
               │ assigned_telecaller_id │──→ public.users
               │ enrolled_institute_    │
               │   course_id            │──→ public.institute_courses
               │ session_id             │
               │ source                 │
               │ created_at             │
               └───────────┬────────────┘
                           │
                    ┌──────┴──────┐
                    │  call_logs  │
                    │             │
                    │ lead_id (FK)│
                    │ outcome     │
                    │ notes       │
                    │ call_date   │
                    └─────────────┘

┌──────────────────┐    ┌──────────────────────┐
│ institute_leads  │    │ partner_inquiries    │
│                  │    │                      │
│ id (PK)          │    │ id (PK)              │
│ name, phone,     │    │ college_name         │
│ email            │    │ contact_person       │
│ interested_course│    │ phone, email         │
│   _id (FK)──→institute_courses              │
│ message          │    │ city                 │
│ status (enum)    │    │ status               │
│ assigned_tele-   │    │ created_at           │
│   caller_id (FK) │    └──────────────────────┘
│ session_id       │
│ created_at       │    ┌──────────────────────┐
└──────────────────┘    │      visitors        │
                        │                      │
┌──────────────────┐    │ session_id (unique)  │
│ institute_courses│    │ viewed_colleges(JSON)│
│                  │    │ mode_filters_used [] │
│ id (PK)          │    │ first_seen_at        │
│ name             │    │ last_seen_at         │
│ duration         │    │ converted_to_lead_id │
│ fees             │    └──────────────────────┘
│ created_at       │
└──────────────────┘    ┌──────────────────────┐
                        │     audit_logs       │
┌──────────────────┐    │                      │
│    colleges      │    │ user_id (FK)         │
│                  │    │ user_role            │
│ id (PK)          │    │ action (enum)        │
│ name             │    │ target_entity (enum) │
│ mode (Online/    │    │ target_id            │
│       Offline)   │    │ description          │
│ location         │    │ old_value (JSONB)    │
│ courses_offered[]│    │ new_value (JSONB)    │
│ commission_*     │    │ ip_address           │
│ contact_*        │    │ created_at           │
│ logo_url         │    └──────────────────────┘
│ created_at       │
└──────────────────┘
```

### Enums & Constraints

**Lead Status** (`leads.status`):
```
'new' → 'contacted' → 'interested' → 'enrolled-college'
                                     → 'enrolled-institute'
                   → 'not-interested' (terminal)
```

**Institute Lead Status** (`institute_leads.status`):
```
'new' → 'contacted' → 'interested' → 'enrolled'
                   → 'not-interested' (terminal)
```

**Call Outcomes** (`call_logs.outcome`):
```
'interested' | 'not-interested' | 'call-back-later' | 'no-answer'
```

**User Roles** (`users.role`):
```
'owner' | 'admin' | 'telecaller'
```

**Commission Status** (`commissions.status`):
```
'pending' → 'received'
```

**Audit Actions** (`audit_logs.action`):
```
'create' | 'update' | 'delete' | 'status_change' | 'login' | 'password_change' | 'assign' | 'export' | 'upload'
```

**Audit Target Entities** (`audit_logs.target_entity`):
```
'leads' | 'institute_leads' | 'colleges' | 'institute_courses' | 'users' | 'commissions' | 'call_logs' | 'partner_inquiries' | 'visitors' | 'auth'
```

### Indexes

```sql
-- Performance indexes on audit_logs (high-volume table)
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target_entity ON public.audit_logs(target_entity);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Additional implicit indexes:
-- Primary keys (auto-indexed by Postgres)
-- Foreign keys (should be indexed manually in production)
-- leads(assigned_telecaller_id) — for telecaller queries
-- leads(status) — for status filters
-- visitors(session_id) — unique constraint (auto-indexed)
```

---

## 6. Row Level Security (RLS) Deep Dive

### Helper Functions

These are used by RLS policies to determine the current user's role:

```sql
-- Returns the role of the currently authenticated user
CREATE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE((SELECT role FROM public.users WHERE id = auth.uid()), 'guest');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Role check shortcuts
CREATE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner'));
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

### Policy Matrix

| Table | Owner | Admin | Telecaller | Public (unauthenticated) |
|-------|-------|-------|------------|--------------------------|
| **users** | ALL | Manage telecallers only | SELECT self, UPDATE self | No access |
| **colleges** | ALL | ALL | ALL (SELECT only) | SELECT only |
| **institute_courses** | ALL | ALL | ALL (SELECT only) | SELECT only |
| **leads** | ALL | ALL | SELECT + UPDATE assigned only | INSERT only |
| **institute_leads** | ALL | ALL | No direct access | INSERT only |
| **commissions** | ALL | ALL | No access | No access |
| **call_logs** | ALL | ALL | INSERT + SELECT for own leads | No access |
| **visitors** | SELECT | SELECT | No access | INSERT + UPDATE |
| **partner_inquiries** | SELECT | SELECT | No access | INSERT only |
| **audit_logs** | SELECT | No access | No access | No access |

### How RLS Policies Work

1. **Every request** includes a JWT from Supabase Auth in the `Authorization` header
2. Postgres extracts `auth.uid()` from the JWT
3. RLS policies use `auth.uid()` to look up the user's role via `get_user_role()`
4. Based on the role, the policy either allows or denies the operation
5. **Defense in depth**: even if a client-side query tries to access forbidden data, RLS blocks it at the database level

---

## 7. Database Triggers & Automations

### Trigger 1: User Sync (`on_auth_user_created`)

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**What it does:** When an admin creates a user via the Supabase Admin API (creating a record in `auth.users`), this trigger automatically creates the corresponding profile in `public.users` with role, name, and `must_change_password = true`.

**Why a trigger?** Ensures that every auth user has a profile record — no orphaned auth accounts.

**Edge case:** If `auth.users` is created but the trigger fails, the user can log in but won't have a profile. The app middleware catches this and redirects to login.

---

### Trigger 2: Commission Auto-Creation (`on_lead_enrolled`)

```sql
CREATE TRIGGER on_lead_enrolled
  AFTER UPDATE OF status ON public.leads
  FOR EACH ROW
  WHEN (NEW.status = 'enrolled-college' AND OLD.status != 'enrolled-college')
  EXECUTE FUNCTION public.handle_lead_enrolled();
```

**What it does:** When a lead's status changes to `enrolled-college`, this trigger creates commission records for each college the student was interested in.

**Business logic:**
1. Detects the status change to `enrolled-college`
2. Loops through `NEW.interested_college_ids` array
3. Creates a `commission` record for each college with `status = 'pending'`
4. Uses `ON CONFLICT DO NOTHING` to prevent duplicates

**Why a trigger?** Commission creation must be atomic with the status change. If done in app code, a crash between the status update and commission creation could lose the commission.

---

### Trigger 3: Audit Logging (`audit_*`)

```sql
-- Attached to: leads, institute_leads, colleges, institute_courses,
--             users, commissions, call_logs

CREATE TRIGGER audit_leads
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_entry();
```

**What it does:** Every INSERT, UPDATE, or DELETE on tracked tables creates an entry in `audit_logs` with:
- The acting user's ID and role
- The action type (`create`, `update`, `delete`, or `status_change`)
- The target entity and record ID
- A human-readable description
- The old and new values as JSONB (for before/after comparison)
- Automatic detection of status changes (labeled as `status_change` action)

**Why a trigger?** 100% audit coverage — developers can't forget to call a log function. Every mutation is captured automatically.

---

### Trigger 4: Telecaller Auto-Assignment

(See Section 8 for full details.)

---

## 8. Telecaller Auto-Assignment Algorithm

### The Problem

When a student submits an inquiry (lead created), it needs to be assigned to a telecaller. Without automation:
- An admin must manually assign each lead
- During high volume, leads sit unassigned
- Hot leads go cold

### The Solution

A `BEFORE INSERT` trigger on both `leads` and `institute_leads` tables runs the auto-assignment RPC:

```sql
CREATE FUNCTION public.assign_telecaller_to_lead()
RETURNS TRIGGER AS $$
DECLARE v_telecaller_id UUID;
BEGIN
  SELECT u.id INTO v_telecaller_id FROM public.users u
  WHERE u.role = 'telecaller' AND u.is_active = true
  ORDER BY (
    -- Workload score: sum of weighted statuses for assigned leads
    (SELECT COALESCE(SUM(
      CASE l.status
        WHEN 'new' THEN 1
        WHEN 'contacted' THEN 2
        WHEN 'interested' THEN 3
        ELSE 0
      END), 0)
     FROM public.leads l
     WHERE l.assigned_telecaller_id = u.id
       AND l.status NOT IN ('not-interested', 'enrolled-college', 'enrolled-institute'))
    +
    -- Same for institute leads
    (SELECT COALESCE(SUM(
      CASE il.status
        WHEN 'new' THEN 1
        WHEN 'contacted' THEN 2
        WHEN 'interested' THEN 3
        ELSE 0
      END), 0)
     FROM public.institute_leads il
     WHERE il.assigned_telecaller_id = u.id
       AND il.status NOT IN ('not-interested', 'enrolled'))
  ) ASC, random()
  LIMIT 1;

  IF v_telecaller_id IS NOT NULL THEN
    NEW.assigned_telecaller_id := v_telecaller_id;
    NEW.auto_assigned := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### How the Scoring Works

Each telecaller gets a **workload score** based on their currently active leads:

| Lead Status | Weight | Why |
|-------------|--------|-----|
| `new` | 1 | Not yet contacted — minimal effort |
| `contacted` | 2 | In conversation — active follow-up needed |
| `interested` | 3 | High engagement — requires detailed counseling |

Terminal statuses (`not-interested`, `enrolled-college`, `enrolled-institute`) are excluded because they require no further action.

The algorithm:
1. Sums up workload scores for each active telecaller
2. Orders by score ascending (lowest workload first)
3. Ties broken by `random()` (fair distribution)

**Why a `BEFORE INSERT` trigger?** The assignment happens atomically — the lead is created with the telecaller already assigned. There's no window where an unassigned lead exists.

**Race condition handling:** Since the trigger runs in the same transaction as the INSERT, concurrent inserts are serialized by PostgreSQL's transaction isolation. Two leads created simultaneously won't both assign to the same telecaller.

---

## 9. Authentication & Authorization Flow

### Login Flow

```
User submits email + password
    ↓
Server Action: supabase.auth.signInWithPassword()
    ├── Success → Returns session with JWT
    │                ↓
    │         Client sets cookies via @supabase/ssr
    │                ↓
    │         Next request hits middleware
    │                ↓
    │         Middleware checks:
    │         ├── must_change_password? → Redirect to /{role}?change_password=true
    │         └── Role-based redirect:
    │             ├── owner → /owner
    │             ├── admin → /admin
    │             └── telecaller → /telecaller
    │
    └── Failure → Return error: "Invalid email or password"
```

### Force Password Change Flow

```
First login detected (must_change_password = true)
    ↓
Login redirects to /{role}?change_password=true
    ↓
Dashboard layout reads query param → opens ChangePasswordModal popup
    ↓
User can:
  Option A: Fill in current + new password and submit
    ↓
    Client Action (ChangePasswordModal):
        1. Verify current password via signInWithPassword()
        2. Call supabase.auth.updateUser({ password: newPassword })
        3. Update public.users: must_change_password = false
        4. Modal closes, user stays on dashboard
  Option B: Dismiss the modal
    ↓
    User navigates freely; can change password later via Profile → "Change Password"
```

### Session Handling

```
Client Component         Server Component          Server Action
    │                        │                        │
    │── createBrowserClient()│                        │
    │   (from @supabase/ssr) │                        │
    │                        │── createServerClient() │
    │                        │   (reads cookies)      │── createServerClient()
    │                        │                        │   (reads cookies)
    │                        │                        │
    │   ┌─────────────────────────────────────────────┤
    │   │  All use the SAME session cookie            │
    │   │  set by Supabase Auth on login              │
    │   └─────────────────────────────────────────────┤
```

### Role Protection Layers

```
Layer 1: Middleware (Edge)
  - Checks JWT session
  - Enforces role-based route access
  - Redirects unauthenticated users
  - Enforces password change

Layer 2: RLS (Database)
  - Every query is filtered by role policies
  - Even if a user bypasses middleware, they can't access data

Layer 3: Server Actions (App)
  - User identity verified before mutations
  - Rate limiting on sensitive actions

Layer 4: Admin API Key (Supabase)
  - Service role key used only for user creation
  - Never exposed to client
```

---

## 10. Business Logic Flows

### Lead Lifecycle

```
                    ┌──────────────┐
                    │     NEW      │  Student submits inquiry
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
              ┌─────│  CONTACTED   │─────┐
              │     └──────┬───────┘     │
              │            │             │
     ┌────────▼───┐  ┌────▼──────┐  ┌───▼─────────┐
     │ INTERESTED │  │ CALL BACK │  │ NO ANSWER /  │
     │            │  │  LATER    │  │ NOT INTEREST │
     └──┬────┬────┘  └────┬──────┘  └──────┬───────┘
        │    │            │                 │
   ┌────▼┐ ┌─▼─────────┐ │                 │
   │ENR- │ │ENROLLED-  │ │                 │
   │OLLED│ │INSTITUTE  │ │                 │
   │COLL-│ └───────────┘ │                 │
   │EGE  │               │                 │
   └──┬──┘               │                 │
      │                  │                 │
      ▼                  ▼                 ▼
  Commission        No commission     Lead closed
  auto-created      (direct enroll)   (no further action)
```

### Commission Flow

```
Lead status → 'enrolled-college'
    ↓
DB Trigger: handle_lead_enrolled()
    ↓
Creates commission records for each interested college
    ↓
Status: 'pending'
    ↓
Admin reviews commission in /admin/commissions
    ↓
Admin marks as 'received'
    ↓
Status: 'received' (payment completed)
```

### Partner Inquiry Flow

```
Institute fills Partner With Us form
    ↓
Server Action inserts into partner_inquiries
    ↓
Admin reviews in /admin/partner-inquiries
    ↓
Admin updates status:
  ├── 'approved' → Contact institute, set up partnership
  ├── 'contacted' → Follow-up in progress
  ├── 'rejected' → Not suitable
  └── 'new' → Awaiting review
```

### Student Check Status Flow

```
Student enters name + phone
    ↓
Server Action queries:
  SELECT * FROM leads
  WHERE name ILIKE '%input%' AND phone = input
    ↓
  ├── No match → "No inquiry found with those details"
  └── Match → Show:
               ├── Status badge (colored by status)
               ├── Status description
               ├── Interested colleges list
               └── Submission date
```

---

## 11. Component Architecture

### Component Hierarchy

```
RootLayout
├── PublicLayout
│   ├── Header
│   │   ├── IcteLogo
│   │   ├── Nav Links
│   │   └── MobileDrawer (mobile only)
│   ├── Page Content (from page.tsx)
│   │   ├── HomeContent (client)
│   │   │   ├── HeroSection
│   │   │   ├── StatsCounter
│   │   │   ├── TopRecommendations
│   │   │   ├── SmartUniversityFinder
│   │   │   ├── FeaturedUniversities → CollegeCard[]
│   │   │   ├── BrowseByCategory → CategoryTile[]
│   │   │   ├── DegreePrograms → InstituteInquiryModal
│   │   │   ├── InlineCTA → InquiryModal
│   │   │   └── StickySubNav
│   │   └── ...
│   └── Footer
│
├── AuthLayout (minimal)
│   ├── LoginPage
│   └── ChangePasswordPage
│
├── DashboardLayout (role-based)
│   ├── AdminSidebar / OwnerSidebar
│   │   ├── Nav items (icons + labels)
│   │   ├── User profile card
│   │   └── Logout button
│   ├── MobileHeader (mobile only)
│   └── Page Content (from page.tsx)
│       ├── Admin pages (leads table, colleges CRUD, etc.)
│       └── Owner pages (admin mgmt, audit logs)
│
└── TelecallerLayout
    ├── TopBar (logo + logout)
    └── TelecallerPage (leads table + call logging)
```

### Utility Functions

| File | Purpose |
|------|---------|
| `utils/cn.ts` | Tailwind class merging (`cn()`) |
| `utils/constants.ts` | Shared constants: nav items, status labels, categories, call outcomes |
| `utils/csv.ts` | `downloadCsv(headers, rows, filename)` — shared CSV export utility |
| `utils/formatters.ts` | `formatDate()`, `formatCurrency()`, `formatPhone()` |
| `utils/session.ts` | `getSessionId()` — localStorage session ID for behavioral tracking |
| `utils/image-compression.ts` | `compressLogo()` (400px WebP 90%), `compressProfile()` (200px WebP 65%) |

### UI Component Library (9 Primitives)

| Component | Props | Purpose |
|-----------|-------|---------|
| **Button** | variant, size, loading, icon | All interactive actions |
| **Card** | hover, glass | Content containers |
| **Input** | label, error, icon, dark | Form inputs |
| **Badge** | variant, color | Status/mode labels |
| **Modal** | open, onClose | Overlay dialogs |
| **Select** | label, error, options | Dropdown selects |
| **Skeleton** | className | Loading placeholders |
| **Spinner** | size | Loading indicator |
| **Alert** | variant | Notifications & errors |

### Shared Business Components

| Component | Used By | Purpose |
|-----------|---------|---------|
| **StatusBadge** | All pages | Maps internal status → display label + color |
| **CollegeCard** | Home, Colleges | College preview in grid |
| **CategoryTile** | Home | Browse by category grid |
| **StatsCounter** | Home | Animated statistics |
| **InquiryModal** | Home, Colleges | Student inquiry form |
| **InstituteInquiryModal** | Home | Direct enrollment form |
| **IcteLogo** | Header, Sidebar | Brand logo display |
| **AdminSidebar** | Admin, Owner | Navigation sidebar |
| **OwnerSidebar** | Owner | Extended admin sidebar |

---

## 12. Data Flow Patterns

### Pattern 1: Server Component Data Fetching

```tsx
// ✅ Server Component — data fetched at request time, zero client JS
export default async function CollegesPage() {
  const supabase = await createClient();
  const { data: colleges } = await supabase.from('colleges').select('*');
  return <CollegeGrid colleges={colleges} />;
}
```

**Flow:**
```
Request → Server Component → Supabase query → Render HTML → Send to client
```

### Pattern 2: Server Action Mutation

```tsx
// ✅ Server Action — mutation with auth, validation, and revalidation
'use server';
export async function createLeadAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('leads').insert({
    name: formData.get('name'),
    phone: formData.get('phone'),
    // ...
  });
  revalidatePath('/admin');
  return { success: !error };
}
```

**Flow:**
```
Form submit → Server Action → Validate → Supabase mutation → revalidatePath → UI update
```

### Pattern 3: Client Component with Supabase

```tsx
// ✅ Client Component — for interactivity (filters, modals, inline edits)
'use client';
export function LeadsTable() {
  const supabase = createClient();
  const [data, setData] = useState([]);
  useEffect(() => {
    supabase.from('leads').select('*').then(({ data }) => setData(data));
  }, []);
  // ... render with inline editing, sorting, filtering
}
```

**Flow:**
```
Page load → Client effect → Supabase query → Set state → Re-render
```

### When to Use Each Pattern

| Situation | Pattern | Why |
|-----------|---------|-----|
| Displaying data (no interaction) | Server Component | Zero client JS, direct DB, cached |
| Form submission | Server Action | Built-in progressive enhancement, type-safe |
| Real-time search/filter | Client Component | Instant UI updates, URL params sync |
| Inline editing | Client Component | Immediate feedback, optimistic updates |
| CSV export | Client Component | Blob creation, file download |
| Auth operations | Server Action | Access to cookies, admin client |

---

## 13. Audit Logging System

### Architecture

```
App Code (Server Actions)
    │
    ├── UPDATE leads SET status = 'enrolled-college'
    │       │
    │       ▼
    │   PostgreSQL
    │       │
    │       ├── UPDATE succeeds (lead status changed)
    │       │
    │       └── AFTER UPDATE trigger fires
    │               │
    │               ├── Detects: action = 'status_change'
    │               ├── Captures: old_status, new_status
    │               ├── Records: user_id, user_role, description
    │               └── INSERT INTO audit_logs (...)
    │
    └── (app code never calls audit_logs directly)
```

### Audit Log Entry Example

```json
{
  "id": "abc-123",
  "user_id": "user-uuid",
  "user_role": "admin",
  "action": "status_change",
  "target_entity": "leads",
  "target_id": "lead-uuid",
  "description": "Changed leads status from 'new' to 'enrolled-college'",
  "old_value": { "status": "new", "name": "Rahul Sharma" },
  "new_value": { "status": "enrolled-college", "name": "Rahul Sharma" },
  "created_at": "2026-07-03T10:30:00Z"
}
```

### What's Tracked

| Table | Actions Logged | Description Format |
|-------|---------------|-------------------|
| leads | create, update, delete, status_change | "Changed leads status from 'new' to 'contacted'" |
| institute_leads | create, update, delete, status_change | "Updated institute_leads record" |
| colleges | create, update, delete | "Created colleges record" |
| institute_courses | create, update, delete | "Deleted institute_courses record" |
| users | create, update, delete | "Updated users record" |
| commissions | create, update, delete | "Created commissions record" |
| call_logs | create, update, delete | "Created call_logs record" |

### Owner Audit Viewer

The owner can:
1. View a list of all internal users (admins + telecallers) with their last activity date
2. Click a user to see their complete audit trail
3. Filter by action type, target entity, and date range
4. View old/new JSONB values (collapsible) for before/after comparison
5. Paginate through results (50 per page)

---

## 14. Behavioral Tracking System

### How Tracking Works

```tsx
// 1. Client-side hook fires events
const { track } = useTracking();
track({ action: 'view_college', payload: { college_id, college_name } });

// 2. Fire-and-forget POST to /tracking
fetch('/tracking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session_id, action, payload }),
});
// No error handling — fails silently

// 3. Server route upserts visitor data
// For view_college: appends to viewed_colleges JSON array
// For filter_change: appends to mode_filters_used array
// For converted: sets converted_to_lead_id
```

### Session ID

```tsx
// Generated once, stored in localStorage
export function getSessionId(): string {
  let id = localStorage.getItem('icte_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('icte_session_id', id);
  }
  return id;
}
```

### Tracked Events

| Event | Payload | DB Effect |
|-------|---------|-----------|
| `page_view` | — | Updates `last_seen_at` |
| `view_college` | `{ college_id, college_name }` | Appends to `viewed_colleges` JSON |
| `filter_change` | `{ mode }` | Appends to `mode_filters_used` array |
| `converted` | `{ lead_id }` | Sets `converted_to_lead_id` |

### Hot Leads Scoring (Admin Dashboard)

The `/admin/hot-leads` page calculates an engagement score:

| Signal | Points |
|--------|--------|
| Page visit | +20 |
| Unique page viewed | +10 |
| Smart search used | +30 |
| Inquiry submitted | +40 |
| College details viewed | +15 |

Leads are sorted by score descending so admins can prioritize high-intent students.

---

## 15. Security Considerations

### Authentication Security

- **No public signup** — accounts are created only by Owner/Admin via Supabase Admin API
- **Temporary passwords** — new users must change password on first login
- **Account deactivation** — admins can deactivate telecaller accounts instantly
- **Password hashing** — Supabase Auth handles bcrypt hashing automatically

### Rate Limiting

| Action | Limit | Window | Why |
|--------|-------|--------|-----|
| Lead creation | 50 | 15 minutes per IP | Prevent spam submissions |

Rate limiting uses **Upstash Ratelimit** with sliding window algorithm, stored in Redis.

### Data Access Security

```
Layer 1: Middleware (Edge)
  ✓ Route protection based on JWT
  ✓ Role-based redirects
  ✓ Password change enforcement

Layer 2: RLS (Database)
  ✓ Row-level access policies
  ✓ Role-based CRUD permissions
  ✓ Cannot be bypassed by client

Layer 3: Server Actions
  ✓ Server-side validation
  ✓ No client-side data manipulation

Layer 4: Service Role Key
  ✓ Only used in admin server actions
  ✓ Never exposed to client
  ✓ Stored in server-side env variables only
```

### Storage Security

- **college_logos**: Public bucket (anyone can view)
- **profile_pictures**: Private bucket (authenticated users only)
- File size limit: 2MB per upload
- Client-side image compression before upload

---

## 16. Rate Limiting Strategy

### Implementation

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),     // Uses UPSTASH_REDIS_REST_URL + TOKEN
  limiter: Ratelimit.slidingWindow(50, '15 m'),  // 50 requests per 15 minutes
  analytics: true,            // Track rate limit events
});
```

### How It Works

1. Server Action extracts client IP from `x-forwarded-for` header
2. IP is used as the rate limit key
3. Sliding window algorithm checks recent request count
4. If under limit: action proceeds
5. If over limit: error returned with "Too many attempts" message

### What's Rate Limited

| Action | Limit | Description |
|--------|-------|-------------|
| `createLeadAction` | 50/15min per IP | Prevents spam lead submissions |

Login rate limiting is handled by Supabase Auth's built-in brute-force protection. The application does not implement its own login rate limit.

---

## 17. Deployment Architecture

### Supabase Configuration Checklist

- [ ] Project created in Supabase dashboard
- [ ] All 17 migrations run in order (001 → 016)
- [ ] Auth settings: Email provider enabled, Confirm email disabled
- [ ] Storage buckets created (college_logos, profile_pictures)
- [ ] API settings: JWT expiry configured, allowed redirect URLs set

### Vercel Configuration

- **Framework preset:** Next.js (auto-detected)
- **Build command:** `npm run build`
- **Output directory:** `.next` (auto-detected)
- **Environment variables:** All 5 from `.env.example`
- **Node.js version:** 18.x or 20.x (LTS)

### Environment Variable Categories

| Category | Variables | Where Used |
|----------|-----------|------------|
| Supabase (public) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side, middleware |
| Supabase (secret) | `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin actions |
| Upstash (optional) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |

### Performance Considerations

- **Static pages:** Legal pages (`/privacy`, `/terms`, `/disclaimer`) — pre-rendered at build time
- **Dynamic pages:** All admin/owner/telecaller pages — rendered per request (auth required)
- **ISR:** Not used (all dynamic pages require auth)
- **Edge functions:** Middleware runs at edge (fast auth checks)
- **Images:** Supabase CDN for storage, Next.js Image Optimization for resizing

---

<div align="center">
  <br />
  <hr style="width: 50%; border-color: #e2e8f0;" />
  <p style="color: #94a3b8; font-size: 0.85rem;">
    ICTE Hub — Comprehensive Architecture Guide<br />
    &copy; 2026 · All rights reserved
  </p>
  <br />
</div>
