# ICTE Hub

**University Discovery & Student Enrollment Platform**

A full-stack platform for discovering universities, managing student leads, tracking enrollments, and handling commissions. Built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict) |
| **UI** | React 19, Tailwind CSS, Lucide Icons |
| **Database** | Supabase (PostgreSQL + RLS + Triggers + RPCs) |
| **Auth** | Supabase Auth (email/password, role-based access) |
| **Storage** | Supabase Storage (college logos, profile pictures) |
| **Rate Limiting** | Upstash Redis + Ratelimit |
| **Image Opt** | browser-image-compression (WebP, client-side) |

## Features

### Public Pages
- **Home** — Hero, stats, featured colleges, category browsing, degree programs, smart search, CTA
- **College Browse** — Search + mode filter (Online/Offline) + grid layout
- **Check Status** — Look up lead status by name + phone
- **Partner With Us** — Institute partner inquiry form
- **Legal** — Privacy Policy, Terms of Service, Disclaimer

### Admin Dashboard (`/admin`)
- **Lead Management** — Student leads table, status updates, telecaller assignment, call history, CSV export
- **Institute Leads** — Partner inquiry leads, status tracking
- **College Management** — Full CRUD for partner colleges
- **Institute Courses** — Course offerings management
- **Team Management** — Create/manage telecaller accounts, activate/deactivate
- **Commissions** — Enrollment commission tracker, mark as paid
- **Partner Inquiries** — Partner form submissions log
- **Hot Leads** — Behavioral analytics, engagement scoring

### Owner Dashboard (`/owner`)
- **Admin Management** — Create/manage admin accounts, reset passwords
- **Audit Logs** — Full activity audit trail with per-user drill-down, JSON diff, pagination

### Telecaller Dashboard (`/telecaller`)
- Assigned leads table, inline status updates, call logging with outcome/notes, call history

### Cross-Cutting
- **Authentication** — Email/password, role-based routing (admin/owner/telecaller)
- **Force Password Change** — First-login password enforcement
- **Profile** — Edit name, change password
- **Behavioral Tracking** — Anonymous visitor tracking, engagement scoring
- **Audit Logging** — All mutations logged via database triggers
- **Rate Limiting** — Login (20/15min), lead creation (50/15min) via Upstash
- **RLS** — Row Level Security for role-based data access
- **Responsive** — Mobile-first design, desktop sidebar + mobile drawer

## Database Architecture

All DB writes are logged via PostgreSQL triggers — the application code never writes to `audit_logs` directly.

Key automations:
- **User sync** — `auth.users` INSERT triggers `public.users` insert
- **Commission creation** — Lead status change to `enrolled-college` triggers commission record creation
- **Telecaller assignment** — `BEFORE INSERT` trigger auto-assigns leads to least-loaded telecaller
- **Audit logging** — Every table has `AFTER INSERT/UPDATE/DELETE` triggers writing to `audit_logs`

## Project Structure

```
src/
├── app/
│   ├── (public)/        # Public pages (home, colleges, etc.)
│   ├── (auth)/          # Login, change password
│   ├── (dashboard)/     # Admin, Owner, Telecaller, Profile pages
│   └── tracking/        # Behavioral tracking API route
├── components/
│   ├── layout/          # Header, Footer, Sidebars, MobileDrawer
│   ├── shared/          # StatusBadge, CollegeCard, InquiryModal, etc.
│   └── ui/              # Button, Card, Input, Modal, Select, Table, etc.
├── lib/
│   ├── actions/         # Server Actions (leads, auth, colleges, calls, export, team, owner)
│   ├── hooks/           # useTracking custom hook
│   ├── supabase/        # client.ts, server.ts, admin.ts
│   └── utils/           # cn, constants, formatters, session, image-compression
├── middleware.ts         # Auth middleware (role routing, force password change)
└── styles/globals.css   # Tailwind + custom styles
supabase/migrations/     # 17 SQL migration files (001 → 016)
docs/                    # Design docs, setup guide
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn
- Supabase account (free)

### Quick Start

```bash
# Clone
git clone https://github.com/nitinbharwad84-ops/icte-hub.git
cd icte-hub

# Install
npm install

# Environment variables (edit with your values)
cp .env.local .env.local

# Run Supabase migrations in order (001 → 016) via SQL Editor

# Start dev server
npm run dev
```

For detailed instructions, see [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service_role key |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token (rate limiting) |

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Roles & Permissions

| Role | Access | Created By |
|------|--------|------------|
| **Owner** | Full access — all dashboards, audit logs, admin management | Supabase dashboard |
| **Admin** | Student/college/course CRUD, team management, commissions, analytics | Owner |
| **Telecaller** | Assigned leads only, call logging | Admin/Owner |

## Roles & Route Access

| Route | Owner | Admin | Telecaller | Public |
|-------|-------|-------|------------|--------|
| `/` | ✓ | ✓ | ✓ | ✓ |
| `/colleges` | ✓ | ✓ | ✓ | ✓ |
| `/check-status` | ✓ | ✓ | ✓ | ✓ |
| `/partner-with-us` | ✓ | ✓ | ✓ | ✓ |
| `/login` | ✓ | ✓ | ✓ | ✓ |
| `/admin/*` | ✓ | ✓ | ✗ | ✗ |
| `/owner/*` | ✓ | ✗ | ✗ | ✗ |
| `/telecaller` | ✗ | ✗ | ✓ | ✗ |
| `/profile` | ✓ | ✓ | ✓ | ✗ |

## Deployment

### Vercel (Recommended)

1. Push to GitHub.
2. Import repo into Vercel.
3. Add environment variables in Vercel dashboard.
4. Deploy.

See [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for full Vercel deployment instructions.

## Design System

The UI follows a consistent design system defined in [docs/icte-hub-design-system.md](./docs/icte-hub-design-system.md):

- **Colors:** Brand blue (`#1E40FF`), brand light (`#EEF2FF`), brand orange (`#FFA94D`)
- **Typography:** Inter font, 10px uppercase tracking-widest for labels, 12-14px for body
- **Components:** 10 reusable UI primitives (Button, Card, Input, Modal, Select, Table, Badge, Skeleton, Spinner, Alert)
- **Cards:** Glass morphism, 2rem radius, subtle shadows, hover elevation

## License

Private — internal use.
