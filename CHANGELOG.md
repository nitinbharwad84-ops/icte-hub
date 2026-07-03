# Changelog

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