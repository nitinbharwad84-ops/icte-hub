# ICTE Hub — Complete Setup Guide

This guide covers local development setup, Supabase configuration, Vercel deployment, and environment variable setup.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Supabase Project Setup](#3-supabase-project-setup)
4. [Environment Variables](#4-environment-variables)
5. [Vercel Deployment](#5-vercel-deployment)
6. [Post-Deployment Checklist](#6-post-deployment-checklist)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

- **Node.js** v18+ (recommended: v20 LTS)
- **npm** v9+ or **yarn** v1.22+
- **Git**
- **Supabase account** (free tier: https://supabase.com)
- **Vercel account** (free tier: https://vercel.com) — optional, for deployment
- **Upstash account** (free tier: https://upstash.com) — for rate limiting

---

## 2. Local Development Setup

### 2.1 Clone the Repository

```bash
git clone https://github.com/nitinbharwad84-ops/icte-hub.git
cd icte-hub
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see [Section 4](#4-environment-variables)).

### 2.4 Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2.5 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

> **Note:** The app starts but most features require Supabase to be configured (see Section 3).

---

## 3. Supabase Project Setup

### 3.1 Create a Supabase Project

1. Go to https://supabase.com and log in.
2. Click **New project**.
3. Enter:
   - **Name:** `icte-hub` (or any name)
   - **Database Password:** Save this securely — you'll need it.
   - **Region:** Choose closest to your users (e.g., `Singapore` for India).
4. Click **Create new project** (takes ~2 minutes).

### 3.2 Get Your API Credentials

1. In your Supabase project dashboard, go to **Project Settings → API**.
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3.3 Run Database Migrations

The project has 17 SQL migration files in `supabase/migrations/`. Run them **in order** (001 → 016).

**Option A: Supabase SQL Editor (recommended for one-time setup)**

1. In your Supabase dashboard, go to **SQL Editor**.
2. Open each migration file from `supabase/migrations/` in order.
3. Copy the contents into the editor and click **Run**.
4. Verify success (no errors).

**Option B: Supabase CLI (for automated workflows)**

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref <your-project-ref>

# Run all migrations
supabase db push
```

### 3.4 Configure Authentication (IMPORTANT)

Supabase Auth needs configuration for email/password login:

1. Go to **Authentication → Providers** in Supabase dashboard.
2. Ensure **Email** provider is enabled.
3. **Disable "Confirm email"** (users are created by admin, they don't sign up):
   - Go to **Authentication → Settings**.
   - Under **General → Email Confirmations**, disable "Confirm signup" and "Secure email change".
4. Under **Authentication → Settings → Auth Hooks**, ensure no hooks are required for this setup.

### 3.5 Verify Trigger and Create Initial Admin Account

After running all migrations, verify the user-sync trigger is active:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If the trigger is missing, re-run the relevant portion of `012_triggers.sql` manually.

1. Go to **Authentication → Users** in Supabase dashboard.
2. Click **Invite user** or **Add user**.
3. Enter email and password for the admin.
4. After creation, copy the user's UUID from the table.

Then create the corresponding profile in `public.users`:

```sql
INSERT INTO public.users (id, name, email, password_hash, role, must_change_password)
VALUES (
  '<user-uuid>',
  'Admin Name',
  'admin@example.com',
  '<password>',
  'admin',
  false
);
```

> **Note:** The trigger `on_auth_user_created` usually handles this automatically. If you created the user manually in the dashboard, the profile may already exist. Check first: `SELECT * FROM public.users;`

### 3.6 Configure Storage Buckets

If migrations ran successfully, storage buckets are already created. To verify:

1. Go to **Storage** in Supabase dashboard.
2. You should see:
   - `college_logos` (public)
   - `profile_pictures` (private)

If missing, run `014_storage_buckets.sql` manually in SQL Editor.

---

## 4. Environment Variables

### 4.1 Required Variables

| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase → Settings → API → service_role (keep secret!) |

### 4.2 Optional (Rate Limiting — Upstash)

Rate limiting protects the lead creation endpoint from spam. To set it up:

1. Go to [console.upstash.com](https://console.upstash.com) and log in or create a free account.
2. Create a new **Redis** database (name it e.g. `icte-hub-ratelimit`).
3. Once created, open the database and go to the **Details** tab.
4. Copy the **REST URL** (looks like `https://...upstash.io`).
5. Copy the **REST Token** (a long string).
6. Add both to your `.env.local` file:

```env
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token-here
```

If Upstash is not configured, rate limiting is skipped and the app still works (a warning `Rate limiter not available` appears in the server console).

### 4.3 `.env.local` Template

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

---

## 5. Vercel Deployment

### 5.1 Connect Repository to Vercel

1. Go to https://vercel.com and log in.
2. Click **Add New → Project**.
3. Import the `icte-hub` GitHub repository.
4. Vercel auto-detects Next.js — settings are pre-configured.

### 5.2 Configure Environment Variables in Vercel

In the Vercel project dashboard:

1. Go to **Settings → Environment Variables**.
2. Add each variable from [Section 4](#4-environment-variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `UPSTASH_REDIS_REST_URL` (optional)
   - `UPSTASH_REDIS_REST_TOKEN` (optional)
3. Set for all environments: **Production**, **Preview**, **Development**.

### 5.3 Deploy

1. Go to **Deployments**.
2. Click **Deploy** (or push to the connected branch).
3. Wait for build to complete.
4. Vercel provides a URL like `https://icte-hub.vercel.app`.

### 5.4 Custom Domain (Optional)

1. In Vercel, go to **Settings → Domains**.
2. Add your domain (e.g., `ictehub.com`).
3. Follow Vercel's DNS configuration instructions.

### 5.5 Vercel Configuration

The project already includes everything needed for Vercel:
- `next.config.ts` handles Supabase images.
- No additional `vercel.json` needed.
- Build command: `npm run build` (auto-detected).
- Output directory: `.next` (auto-detected).

---

## 6. Post-Deployment Checklist

- [ ] **Home page** loads at `/` — verify hero, stats, colleges, categories render.
- [ ] **College browse** at `/colleges` — verify search and filter work.
- [ ] **Check Status** at `/check-status` — test with a known lead.
- [ ] **Partner With Us** form at `/partner-with-us` — submit a test entry.
- [ ] **Login** at `/login` — sign in with admin credentials.
- [ ] **Admin dashboard** at `/admin` — verify leads, colleges, team pages load.
- [ ] **Create a telecaller** from Admin → Team page.
- [ ] **Profile page** at `/profile` — verify edit name and change password work.
- [ ] **Owner dashboard** at `/owner` — verify admin management and audit logs.
- [ ] **Telecaller dashboard** at `/telecaller` — verify lead table and call logging.
- [ ] **Rate limiting** — verify login blocks after 20 failed attempts (if Upstash configured).
- [ ] **Storage** — verify college logo and profile picture upload work.

---

## 7. Troubleshooting

### 7.1 Build Errors

**Problem:** Build fails with TypeScript errors.
**Fix:** Run `npm run lint` to check. Ensure Node.js v18+.

**Problem:** `npm run dev` fails to start.
**Fix:** Delete `.next` folder and node_modules, reinstall: `rm -rf .next node_modules && npm install && npm run dev`

### 7.2 Database Issues

**Problem:** "relation 'public.users' does not exist"
**Fix:** Migrations not run. Execute all SQL files in `supabase/migrations/` in order.

**Problem:** "new row violates row-level security policy"
**Fix:** RLS enabled but policies may be missing. Re-run `011_rls_policies.sql`.

**Problem:** Auth users exist but `public.users` table is empty.
**Fix:** The auto-sync trigger may not be active. Re-run the trigger from `012_triggers.sql` or manually insert:

```sql
INSERT INTO public.users (id, name, email, password_hash, role)
SELECT id, raw_user_meta_data->>'name', email, encrypted_password, COALESCE(raw_user_meta_data->>'role', 'telecaller')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

### 7.3 Login Issues

**Problem:** "Invalid login credentials"
**Fix:** Ensure the user exists in Supabase Auth → Users. Check email/password are correct.

**Problem:** Redirected to `/change-password` every time.
**Fix:** Set `must_change_password = false` in `public.users` for that user:

```sql
UPDATE public.users SET must_change_password = false WHERE email = 'admin@example.com';
```

**Problem:** 404 on login or blank page after login.
**Fix:** Check middleware routes — ensure `/admin`, `/owner`, `/telecaller` route groups exist.

### 7.4 Vercel Deployment Issues

**Problem:** Build fails on Vercel but works locally.
**Fix:** Check environment variables are set in Vercel dashboard. Verify `NEXT_PUBLIC_` prefix on public variables.

**Problem:** Supabase queries fail in production.
**Fix:** Ensure Supabase project allows API requests from the Vercel domain. In Supabase → Authentication → Settings, add the Vercel URL to allowed redirect URLs.

### 7.5 Storage Issues

**Problem:** Image upload fails.
**Fix:** Check storage bucket exists and RLS policies are active. Re-run `014_storage_buckets.sql`.

**Problem:** Profile picture upload fails.
**Fix:** Check that storage bucket `profile_pictures` exists in Supabase Storage. Verify RLS policies allow authenticated users to upload.

### 7.6 Misc Issues

**Problem:** Account deactivated — silently logged out, can't access dashboard.
**Fix:** Check `is_active` status for the user in the Team page (`/admin/team`). Set `is_active = true` to restore access.

**Problem:** Rate limiting not working (no blocking of spam leads).
**Fix:** Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in `.env.local`. Check the server console for `Rate limiter not available` warning.

**Problem:** CSV export fails (download doesn't start or is empty).
**Fix:** Check browser console for errors. Ensure Supabase connection is active and the query returns data.

**Problem:** Tracking data not appearing in Hot Leads (`/admin/hot-leads`).
**Fix:** Verify the `/tracking` POST route is accessible via middleware (not blocked for unauthenticated users). Check browser console for POST errors.

**Problem:** Commission not auto-created when lead enrolls.
**Fix:** Ensure lead status is exactly `enrolled-college` (not misspelled or different casing). Verify the trigger `handle_lead_enrolled` is active:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'handle_lead_enrolled';
```

**Problem:** Check Status returns "No inquiry found".
**Fix:** Try an exact name match. Phone must be exactly 10 digits without spaces or formatting.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Vercel (Edge)                   │
│  ┌───────────────────────────────────────────┐  │
│  │         Next.js 15 App Router             │  │
│  │                                           │  │
│  │  Public Pages   │  Dashboard Pages        │  │
│  │  ─────────────  │  ─────────────────      │  │
│  │  /colleges      │  /admin/*               │  │
│  │  /check-status  │  /owner/*               │  │
│  │  /partner-with  │  /telecaller/*          │  │
│  │  /login         │  /change-password       │  │
│  │  /privacy, etc  │  /profile               │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│              Supabase (PostgreSQL)               │
│                                                  │
│  Auth        │  Database       │  Storage        │
│  ──────      │  ─────────      │  ─────────      │
│  Email/Pass   │  Tables         │  college_logos  │
│  Role Mgmt    │  RLS Policies   │  profile_pics   │
│  Session Mgmt │  Triggers/RPCs  │                 │
│               │  Audit Logs     │                 │
└──────────────────────────────────────────────────┘
```

## Database Migrations (Run in Order)

| File | Description |
|------|-------------|
| `001_users.sql` | Public users table (synced with auth.users) |
| `002_colleges.sql` | Partner colleges |
| `003_institute_courses.sql` | Institute course offerings |
| `004_leads.sql` | Student leads |
| `005_institute_leads.sql` | Institute-specific leads |
| `006_commissions.sql` | Commission tracking (auto-created via trigger) |
| `007_call_logs.sql` | Telecaller call logs |
| `008_visitors.sql` | Anonymous visitor tracking |
| `009_partner_inquiries.sql` | Partner With Us form submissions |
| `010_audit_logs.sql` | System audit log (auto-populated via triggers) |
| `011_rls_policies.sql` | Row Level Security policies for role-based access |
| `012_triggers.sql` | Auto-sync, commission, and audit log triggers |
| `013_rpcs.sql` | Telecaller auto-assignment RPC |
| `014_storage_buckets.sql` | Storage bucket creation + policies |
| `015_colleges_extended.sql` | Extended college fields (city, state, type, etc.) |
| `015_page_visits_lead_sessions.sql` | Page visit and session tracking tables |
| `016_partner_inquiries_extend.sql` | Extended partner inquiry fields |

---

> For a deep dive into the system architecture, business logic, database triggers, security model, and data flows, see [COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md).
