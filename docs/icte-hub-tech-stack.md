# ICTE Hub — Tech Stack Specification

> **Chosen Stack**: Option 2 (Next.js 15 + Supabase)
> **Purpose**: Detailed technical architecture mapping for the ICTE Hub platform based on the selected BaaS (Backend-as-a-Service) stack.

---

## 1. Core Technologies

### 1.1 Frontend (Client & Server-Side Rendering)
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (Utility-first CSS framework)
- **Icons**: Lucide React
- **Language**: TypeScript (Strict typing for robust data models)
- **Forms & Validation**: React Hook Form + Zod (for robust client/server validation)
- **State Management**: Zustand (for lightweight global state) or React Context.
- **Data Fetching**: Next.js 15 native `fetch` (uncached by default) plus Supabase JS Client for database interactions.

### 1.2 Backend & Infrastructure (Supabase)
- **Database**: PostgreSQL (Managed by Supabase)
- **Authentication**: Supabase Auth (JWT-based, handles session persistence natively)
- **Storage**: Supabase Storage (S3-compatible bucket for Logos and Avatars)
- **Security**: PostgreSQL Row Level Security (RLS)
- **Serverless Logic**: Supabase Edge Functions (Deno) / Postgres Database Triggers and Functions (RPC)

### 1.3 Hosting & Deployment
- **Frontend Hosting**: Vercel (Optimized specifically for Next.js 15, Edge network)
- **Backend Hosting**: Supabase (Fully managed Cloud)
- **CI/CD**: Vercel GitHub Integration (Automated deployments on push to `main`)

---

## 2. How the Stack Solves Platform Requirements

### 2.1 SEO & Public Pages (Home, Browse)
- **The Problem**: Single Page Applications (SPAs) often struggle with SEO because content is loaded via JavaScript after the page loads.
- **The Solution (Next.js 15)**: Next.js allows **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)**. When a student or search engine bot visits `/colleges`, Next.js 15 fetches the college data from Supabase on the server, renders the HTML, and sends a fully populated page to the browser. This guarantees perfect SEO.

### 2.2 Role Hierarchy & Security (Owner > Admin > Telecaller)
- **The Problem**: Security rules must be strictly enforced (e.g., Admins can't manage other admins, Telecallers can only see their own leads).
- **The Solution (Supabase RLS)**: Supabase relies on Postgres **Row Level Security (RLS)**. We can write SQL policies directly in the database.
  - *Example*: A policy on the `leads` table: `CREATE POLICY "Telecallers can view own leads" ON leads FOR SELECT USING (auth.uid() = assigned_telecaller_id);`
  - Even if a malicious user tries to manipulate the frontend API calls, the database itself will reject the request. This provides military-grade security without writing complex backend middleware.

### 2.3 Authentication & Forced Password Change
- **The Problem**: No public signup, accounts created by admins/owners, and mandatory password changes on first login.
- **The Solution (Supabase Auth + Next.js 15 Middleware)**:
  - Supabase Auth allows creating users via the secure Admin API (`supabase.auth.admin.createUser()`).
  - We store `role` and `must_change_password` inside a linked public `users` table.
  - **Next.js 15 Middleware** runs on the edge for every route request. If a user logs in and their `must_change_password` flag is true, the middleware instantly redirects them to `/change-password` before the page even loads, fully blocking access to the dashboard.

### 2.4 Audit Logging (Immutable Records)
- **The Problem**: The Owner needs an uneditable log of every action performed on the platform.
- **The Solution (Postgres Triggers)**: Instead of manually writing logs in the application code (which can be bypassed or fail), we use **PostgreSQL Database Triggers** in Supabase. Whenever an `INSERT`, `UPDATE`, or `DELETE` happens on key tables (leads, colleges, users), the database automatically fires a trigger that inserts a record into the `audit_logs` table. This guarantees logs are never missed and are completely immune to client-side tampering.

### 2.5 Asset Optimization (Free-Tier Friendly)
- **The Problem**: Uploaded images (logos, profiles) need to be compressed to save Supabase Storage space.
- **The Solution**: 
  1. **Client-side compression**: Use a library like `browser-image-compression` to shrink the image and convert it to WebP *before* it is uploaded to Supabase Storage.
  2. **Next.js 15 Image Optimization**: When displaying images, we use the Next.js `<Image>` component. It automatically caches, resizes, and serves modern optimized formats to the browser, saving massive amounts of bandwidth.

### 2.6 Telecaller Auto-Assignment Algorithm
- **The Solution**: When a new lead is submitted (via a Next.js 15 Server Action using React 19 `useActionState`), we execute a **Postgres Stored Procedure (RPC)** in Supabase. The database calculates the workload score for all active telecallers natively and assigns the lead in a single atomic database transaction. This is lightning fast and prevents race conditions if multiple leads come in at the exact same millisecond.

### 2.7 Hot Leads / Behavioral Analytics
- **The Solution**: Track sessions using a client-side UUID stored in `localStorage`. Send tracking events to a Next.js 15 Route Handler (`app/api/...`) without blocking the UI, which batches them or writes them to a lightweight `visitors` table in Supabase.

---

## 3. Development Workflow

1. **Local Setup**: Use the Supabase CLI to run the entire database locally for testing (`supabase start`).
2. **Database Migrations**: All table creations, RLS policies, and triggers are stored as SQL migration files in the repo, ensuring version control.
3. **Type Generation**: Run `supabase gen types typescript` to automatically generate TypeScript interfaces directly from the database schema. This means the Next.js 15 frontend always knows the exact structure of the data, catching typo errors before the code even runs.
4. **Deployment**: Push code to GitHub. Vercel automatically detects the push and deploys the frontend. Supabase handles the production database scaling.

---

## 4. Free Tier Limits & Scaling

| Resource | Vercel / Supabase Free Tier Limit | How We Optimize For It |
|---|---|---|
| **Vercel Bandwidth** | 100 GB / month | Next.js 15 Image caching and serving WebP assets. |
| **Vercel Functions** | 100,000 / month | Use React Server Components (RSC) efficiently; aggressively cache public pages like `/colleges`. |
| **Supabase Database** | 500 MB space | Heavy data is text/JSON only. 500MB will easily hold hundreds of thousands of leads and audit logs. |
| **Supabase Storage** | 1 GB space | Compress logos (max 400px) and avatars (max 200px) aggressively on the client before upload. |
| **Supabase Auth** | 50,000 MAU | We have a small internal team and no public signups; we will never hit this limit. |
| **DB Connections** | Connection Pooler included | Supabase provides Supavisor (connection pooling) to handle thousands of concurrent queries without exhausting direct DB connections. |

> **Verdict**: The Next.js 15 + Supabase stack provides a highly scalable, extremely secure, and SEO-optimized platform. Thanks to the architecture strategies outlined above, it will operate entirely within the generous free tiers of Vercel and Supabase for a very long time.

---

## 5. Required Environment Variables

To run the platform locally or in production, the following environment variables must be configured:

- `NEXT_PUBLIC_SUPABASE_URL`: The URL of the Supabase project. Used by the client and server to connect.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key. Safe to expose to the browser.
- `SUPABASE_SERVICE_ROLE_KEY`: The secret admin key. **Never expose to the browser.** Required by the Owner dashboard to use the Admin API (for creating accounts and bypassing RLS to reset passwords).
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Credentials for the Upstash Redis database, used to execute the rate limiting on Server Actions.
