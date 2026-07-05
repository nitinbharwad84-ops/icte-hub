# ICTE Hub — Complete Setup Guide

This guide covers local development setup, Supabase configuration, Vercel deployment, and the exact order in which to run all SQL files.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Supabase Project Setup](#3-supabase-project-setup)
4. [Run Migrations — Step by Step](#4-run-migrations--step-by-step)
5. [Run Seed Data — Step by Step](#5-run-seed-data--step-by-step)
6. [Environment Variables](#6-environment-variables)
7. [Vercel Deployment](#7-vercel-deployment)
8. [Post-Deployment Checklist](#8-post-deployment-checklist)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

- **Node.js** v18+ (recommended: v20 LTS)
- **npm** v9+
- **Git**
- **Supabase account** — [supabase.com](https://supabase.com) (free tier works)
- **Vercel account** — [vercel.com](https://vercel.com) (optional, for deployment)
- **Upstash account** — [upstash.com](https://upstash.com) (optional, for rate limiting)

---

## 2. Local Development Setup

### 2.1 Clone & Install

```bash
git clone https://github.com/nitinbharwad84-ops/icte-hub.git
cd icte-hub
npm install
```

### 2.2 Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials (see [Section 6](#6-environment-variables)).

### 2.3 Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Most features require Supabase to be configured first.

---

## 3. Supabase Project Setup

### 3.1 Create a New Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Fill in:
   - **Name:** `icte-hub`
   - **Database Password:** Save it securely
   - **Region:** Singapore (closest to India)
3. On the new project creation screen, under **Security**:
   - ✅ **Enable Data API** — required (Supabase JS library needs this)
   - ❌ **Automatically expose new tables** — leave unchecked (RLS controls access manually)
   - ❌ **Enable automatic RLS** — leave unchecked (we manage RLS in our migrations)
4. Click **Create new project** — takes ~2 minutes

### 3.2 Get API Credentials

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Never expose this publicly

### 3.3 Configure Authentication Settings

1. Go to **Authentication → Providers**
   - Ensure **Email** provider is **enabled**

2. Go to **Authentication → Settings**
   - **Disable "Confirm email"** — users are created by admin, not self-signup
   - **Disable "Secure email change"**
   - Set minimum password length to **6**

---

## 4. Run Migrations — Step by Step

Go to **SQL Editor** in your Supabase dashboard. Run each file below **in exact order** — paste the file contents and click **Run**. Do not skip or reorder.

### ⚠️ "Potential issue detected" prompt (RLS warning)

When you paste and run some migration files, Supabase may show a popup:

> **"This query creates a table without enabling Row Level Security."**
> — Choose "Run without RLS" or "Run and enable RLS"

**Always click "Run without RLS"** for every migration file.

- RLS is enabled explicitly by `011_rls_policies.sql` (step 11) for all tables created in steps 1–10
- `page_visits` and `lead_sessions` tables have RLS enabled in `017_comprehensive_fixes.sql` (step 18)
- If you click "Run and enable RLS" by mistake, it's not fatal — step 11 will re-enable RLS with proper policies anyway — but "Run without RLS" is the correct choice every time

| Step | File | What It Creates |
|------|------|-----------------|
| **1** | `001_users.sql` | `public.users` table (role, is_active, must_change_password, etc.) |
| **2** | `002_colleges.sql` | `public.colleges` table |
| **3** | `003_institute_courses.sql` | `public.institute_courses` table |
| **4** | `004_leads.sql` | `public.leads` table |
| **5** | `005_institute_leads.sql` | `public.institute_leads` table |
| **6** | `006_commissions.sql` | `public.commissions` table |
| **7** | `007_call_logs.sql` | `public.call_logs` table |
| **8** | `008_visitors.sql` | `public.visitors` table |
| **9** | `009_partner_inquiries.sql` | `public.partner_inquiries` table |
| **10** | `010_audit_logs.sql` | `public.audit_logs` table + indexes |
| **11** | `011_rls_policies.sql` | All RLS helper functions + all RLS policies |
| **12** | `012_triggers.sql` | Auth-sync, commission creation, and audit triggers |
| **13** | `013_rpcs.sql` | Telecaller auto-assignment RPC |
| **14** | `014_storage_buckets.sql` | Storage buckets (`college_logos`, `profile_pictures`) + policies |
| **15** | `015_colleges_extended.sql` | Adds city, state, type, status columns to colleges |
| **16** | `015_page_visits_lead_sessions.sql` | `page_visits` and `lead_sessions` tables |
| **17** | `016_partner_inquiries_extend.sql` | Adds city, status columns to partner_inquiries |
| **18** | `017_comprehensive_fixes.sql` | FK fixes, constraints, indexes, RLS tightening, updated_at triggers |
| **19** | `018_schema_fixes.sql` | Critical fixes: missing columns, public RPC, storage policies |
| **20** | `019_grants.sql` | ⭐ Table-level GRANT for authenticated + anon roles (required for login) |
| **21** | `020_schema_fixes_2.sql` | Fixes `institute_courses` columns + adds `users.phone` |

> **Important:** Steps 15a and 15b (the two `015_` files) can be run in either order — just run both before step 17.

After running all 21 steps, verify:

```sql
-- Should return all 12+ tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Should return the user-sync trigger
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Should return the check_lead_status function
SELECT proname FROM pg_proc WHERE proname = 'check_lead_status';
```

---

## 5. Run Seed Data — Step by Step

Seed data is optional but gives you demo data to test with. Run in order below via **SQL Editor**.

> ⚠️ **Before running seed/001:** Edit the email and password at the top of the file to your desired owner credentials.

| Step | File | What It Seeds | Notes |
|------|------|---------------|-------|
| **1** | `seed/001_create_owner.sql` | Creates the owner user in `auth.users` + `public.users` | **Edit email & password first** |
| **2** | `seed/002_colleges.sql` | 10 sample colleges/universities | Requires step 1 |
| **3** | `seed/003_institute_courses.sql` | 10 ICTE direct programs | Requires step 1 |
| **4** | `seed/004_leads.sql` | 16 student leads linked to colleges | Requires steps 2 & 3 |
| **5** | `seed/005_institute_leads.sql` | 8 direct enrollment inquiries | Requires step 3 |
| **6** | `seed/007_commissions.sql` | Sample commission records | Requires step 4 |
| **7** | `seed/008_partner_inquiries.sql` | 7 partner form submissions | No dependencies |
| **8** | `seed/009_page_visits.sql` | Visitor tracking + page view data | Requires steps 2 & 4 |
| **9** | `seed/006_call_logs.sql` | Sample call logs | ⚠️ Skip until you create a telecaller from the UI |

> `seed/010_cleanup.sql` is for **resetting** the database — do NOT run it during setup.

### After Seeding

1. Log in at `/login` with the owner email/password you set in `seed/001_create_owner.sql`
2. Go to `/admin/team` to create telecallers (then optionally run `seed/006_call_logs.sql`)
3. Go to `/owner/admins` to manage admin users

---

## 6. Environment Variables

### 6.1 Required

| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key | Project Settings → API → service_role |

### 6.2 Optional (Rate Limiting)

Rate limiting protects the lead creation endpoint from spam (50 requests/15 min per IP).

1. Go to [console.upstash.com](https://console.upstash.com) → create a **Redis** database
2. Copy the **REST URL** and **REST Token** from the Details tab

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |

If not configured, rate limiting is silently skipped and the app works normally.

### 6.3 `.env.local` Template

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Optional — rate limiting
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token-here
```

---

## 7. Vercel Deployment

### 7.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import the `icte-hub` GitHub repository
3. Vercel auto-detects Next.js — no changes needed

### 7.2 Add Environment Variables

In Vercel → **Settings → Environment Variables**, add all 5 variables from [Section 6](#6-environment-variables). Set each for **Production**, **Preview**, and **Development**.

### 7.3 Deploy

1. Go to **Deployments → Deploy**
2. Wait for build to complete (~2 min)
3. Your app is live at `https://icte-hub-xxx.vercel.app`

### 7.4 Custom Domain (Optional)

Go to **Settings → Domains** → add your domain → follow Vercel's DNS instructions.

---

## 8. Post-Deployment Checklist

- [ ] `/` — Home page loads, hero and college cards render
- [ ] `/colleges` — College browse with search and Online/Offline filter works
- [ ] `/check-status` — Submit a name + phone, verify result appears
- [ ] `/partner-with-us` — Submit the form, verify success state
- [ ] `/login` — Sign in with owner credentials; "Back to Home" link visible
- [ ] `/admin` — Admin leads page loads with data
- [ ] `/admin/team` — Create a telecaller account, verify temp password shown
- [ ] `/profile` — Edit name, upload profile picture, open Change Password modal
- [ ] `/owner` — Owner dashboard loads
- [ ] `/owner/admins` — Create an admin, reset password
- [ ] `/telecaller` — Log in as telecaller, verify assigned leads visible
- [ ] Password change modal — Log in as a new user, verify popup appears and works
- [ ] Storage — Upload a college logo and profile picture; verify images display
- [ ] Audit logs — Perform actions, verify they appear in `/owner/audit-logs`

---

## 9. Troubleshooting

### 9.1 Build Errors

**Problem:** TypeScript errors on `npm run build`
**Fix:** Run `npx tsc --noEmit`. Ensure Node.js v18+.

**Problem:** `npm run dev` fails to start
**Fix:** `rm -rf .next node_modules && npm install && npm run dev`

### 9.2 Database Issues

**Problem:** "relation 'public.users' does not exist"
**Fix:** Migrations not run. Run all 21 SQL files from `supabase/migrations/` in order.

**Problem:** "new row violates row-level security policy"
**Fix:** Re-run `011_rls_policies.sql` and `018_schema_fixes.sql`.

**Problem:** Auth users exist but `public.users` is empty
**Fix:** The auto-sync trigger may have missed. Re-run this SQL:
```sql
INSERT INTO public.users (id, name, email, password_hash, role, must_change_password)
SELECT id, raw_user_meta_data->>'name', email, encrypted_password,
  COALESCE(raw_user_meta_data->>'role', 'telecaller'), true
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

**Problem:** `check_lead_status` function not found
**Fix:** Run `018_schema_fixes.sql` which creates this function.

### 9.3 Login Issues

**Problem:** "Invalid login credentials"
**Fix:** Verify the user exists in Supabase → Authentication → Users.

**Problem:** Password change popup appears every time after login
**Fix:** The user has `must_change_password = true`. Dismiss the popup and change password, or reset manually:
```sql
UPDATE public.users SET must_change_password = false WHERE email = 'user@example.com';
```

**Problem:** 404 on `/admin` or `/owner` after login
**Fix:** Check that the user's `role` in `public.users` matches the route. Owner → `/owner`, Admin → `/admin`, Telecaller → `/telecaller`.

### 9.4 Storage Issues

**Problem:** Profile picture doesn't display after upload
**Fix:** Verify `profile_pictures` bucket is set to **public** in Supabase → Storage → `profile_pictures` → Edit. Or re-run `018_schema_fixes.sql`.

**Problem:** Re-uploading a profile picture fails
**Fix:** The `admin_owner_update_avatars` storage policy may be missing. Re-run `018_schema_fixes.sql`.

**Problem:** College logo upload fails
**Fix:** Verify the `college_logos` bucket exists in Supabase Storage. Re-run `014_storage_buckets.sql`.

### 9.5 Public Form Issues

**Problem:** "Partner With Us" form submits but nothing appears in the dashboard
**Fix:** Check that `018_schema_fixes.sql` was run — it adds the `institution_type` column required by the form.

**Problem:** Lead inquiry form submits successfully but no lead appears in admin
**Fix:** Same fix — `018_schema_fixes.sql` adds the `message` column. Also verify `source = 'website'` is set (fixed in `src/lib/actions/leads.ts`).

**Problem:** Check Status returns empty even for real leads
**Fix:** The `check_lead_status` RPC function may be missing. Run `018_schema_fixes.sql`.

### 9.6 Vercel Deployment Issues

**Problem:** Build passes locally but fails on Vercel
**Fix:** Check all environment variables are set in Vercel → Settings → Environment Variables. `NEXT_PUBLIC_` variables must have that prefix.

**Problem:** Supabase queries fail in production
**Fix:** Ensure the Supabase project is not paused (free tier pauses after inactivity). Check the Supabase dashboard.

### 9.7 Commission Issues

**Problem:** Commission not auto-created when lead status changes to `enrolled-college`
**Fix:** Verify the trigger is active:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_lead_enrolled';
```
If missing, re-run `012_triggers.sql`.

### 9.8 Audit Log Issues

**Problem:** Audit logs not populating
**Fix:** Triggers write to `audit_logs` automatically. Verify triggers exist:
```sql
SELECT tgname FROM pg_trigger WHERE tgname LIKE 'audit_%';
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Vercel (Edge/Node)                  │
│                                                       │
│  Public Pages        Dashboard (Auth Required)        │
│  ─────────────       ──────────────────────────       │
│  /                   /admin/*   (admin + owner)       │
│  /colleges           /owner/*   (owner only)          │
│  /check-status       /telecaller (telecaller only)    │
│  /partner-with-us    /profile   (all roles)           │
│  /login                                               │
│  /privacy, /terms, /disclaimer                        │
│                                                       │
│  API Routes                                           │
│  /tracking  (POST — anonymous visitor tracking)       │
└─────────────────────────┬────────────────────────────┘
                          │ HTTPS (Supabase JS + SSR)
┌─────────────────────────▼────────────────────────────┐
│                Supabase (PostgreSQL)                  │
│                                                       │
│  Auth              Database           Storage         │
│  ────              ────────           ───────         │
│  Email/password    12 tables          college_logos   │
│  Role metadata     RLS policies       profile_pics    │
│  Session cookies   6 triggers         (both public)   │
│  Admin API         3 RPCs                             │
│                    Audit logs                         │
└──────────────────────────────────────────────────────┘
```

---

> For a deep dive into the architecture, database design, RLS model, and business logic, see [COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md).
