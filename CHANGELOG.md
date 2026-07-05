# Changelog

## [1.1.1] - 2026-07-06

### Fixed
- **Modal focus-stealing** (`src/components/ui/Modal.tsx`): Escape key handler now uses `useRef` to break React effect dependency chain — typing in form fields no longer causes focus to jump out of the input on every keystroke
- **Select null value warning** (`src/components/ui/Select.tsx`): Added `value={props.value ?? ''}` safeguard to suppress React "`value` prop on `select` should not be null" console error when bound to nullable database fields
- **Blob URL memory leaks** (`profile/page.tsx`, `colleges/page.tsx`): Added `URL.revokeObjectURL()` cleanup before creating new preview URLs on file re-upload
- **ChangePasswordModal timer leak** (`ChangePasswordModal.tsx`): Stored `setTimeout` handle in a `useRef` with `useEffect` cleanup to prevent stale timer execution after unmount
- **Vercel build warning** (`(public)/page.tsx`): Added `export const dynamic = 'force-dynamic'` to suppress `cookies()` static-generation warning on the home page

---

## [1.1.0] - 2026-07-05

### Changed
- **Auth flow**: Removed `/change-password` dedicated page — users now land on their dashboard after login, with a dismissible modal popup prompting password change if `must_change_password = true`
- **Login page**: Added "Back to Home" link so users are no longer trapped on the login page
- **Profile page**: Replaced inline change-password form with a "Change Password" button that opens the same modal
- **Middleware**: Removed force redirect to `/change-password`; old `/change-password` URL now redirects to dashboard

### Added
- `ChangePasswordModal` component (`src/components/shared/ChangePasswordModal.tsx`) — reusable modal for password changes used across dashboard layouts and profile page
- `check_lead_status` Supabase RPC function — allows the public check-status page to query leads without exposing the full table (SECURITY DEFINER)
- Migration `018_schema_fixes.sql` — adds missing `message` column to `leads`, `institution_type` column to `partner_inquiries`, makes `profile_pictures` bucket public, adds admin/owner storage UPDATE/DELETE policies, creates `check_lead_status` RPC

### Fixed
- Public lead form (`/colleges` inquiry) was blocked by RLS — `source` field now correctly set to `'website'` matching the RLS policy
- `checkLeadStatus` action on the check-status page always returned empty results for anonymous users — now uses the `check_lead_status` RPC
- Profile picture re-upload failed for admins/owners (no UPDATE storage policy) — fixed in migration 018
- Profile pictures not displaying (`getPublicUrl` doesn't work on private buckets) — `profile_pictures` bucket is now public
- Partner inquiry form failed silently — `institution_type` column was missing from `partner_inquiries` table
- Lead inquiry form failed silently — `message` column was missing from `leads` table
- Seed data `008_partner_inquiries.sql` had invalid status values (`'approved'`, `'rejected'`) not in the CHECK constraint
- Owner seed didn't clear `must_change_password` flag after user creation (trigger defaults to `true`)

---

## [1.0.0] - 2026-07-03

### Added
- Public pages: Home, College Browse, Check Status, Partner With Us, Legal (Privacy, Terms, Disclaimer)
- Authentication: Login, Force Password Change
- Admin Dashboard: Lead Management, Institute Leads, College CRUD, Institute Courses CRUD, Team Management, Commissions, Partner Inquiries, Hot Leads
- Owner Dashboard: Admin Management, Audit Logs
- Telecaller Dashboard: Assigned Leads, Call Logging, Call History
- Profile page with password change and avatar upload
- Behavioral tracking API with session-based analytics
- Rate limiting via Upstash Redis for lead creation
- Image compression (WebP conversion + resize before upload)
- Commission auto-creation via DB trigger on lead enrollment
- Telecaller auto-assignment via BEFORE INSERT trigger
- Audit logging via Postgres triggers on all critical tables
- CSV export for leads data
- Branded 404 and error pages

### Database
- 17 SQL migration files (001 → 016)
- 12 tables with RLS policies
- 4 storage buckets (college_logos, institute_course_images, profile_pictures, general_assets)
- 6 trigger functions (user sync, commission creation, telecaller assignment, audit logging, updated_at)
- Comprehensive indexes on FK and filter columns

### Technical
- Next.js 15 App Router + React 19
- TypeScript (strict mode)
- Tailwind CSS design system with 9 UI primitives
- Supabase (Auth, DB, Storage, RLS, Triggers, RPCs)
- Zod validation on server actions
- @upstash/ratelimit for API protection
- 25 pages compiled successfully