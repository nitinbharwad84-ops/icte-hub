# ICTE Hub — Product Requirements Document (PRD)

> **Version**: 2.0  
> **Last Updated**: July 2, 2026  
> **Status**: Reference document for rebuild  
> **Purpose**: This document captures every feature, business rule, data model, and functional requirement of the ICTE Hub platform. It is intentionally **tech-stack agnostic** to serve as the single source of truth for a ground-up rebuild.

---

## 1. Product Overview

### 1.1 What Is ICTE Hub?

ICTE Hub is a **university discovery and student enrollment platform** operated by a small education consultancy team. It connects students seeking higher education with partner universities and colleges. The platform earns revenue through **commissions from partner institutions** when a student successfully enrolls.

### 1.2 Value Proposition

| Stakeholder | Value |
|---|---|
| **Students** | Free counseling service. Browse, compare, and inquire about universities in one place. Track inquiry status without creating an account. |
| **Partner Colleges** | Access to qualified, interested student leads funneled by the ICTE Hub team. |
| **ICTE Hub Team** | Commission-based revenue from partner college enrollments. Internal enrollment revenue from own degree programs. Behavioral analytics to identify high-intent visitors. |

### 1.3 Revenue Model

1. **Commission from Partner Colleges** — When a student enrolls in a partner university, ICTE Hub earns a percentage-based commission (configurable per college — one-time or installment-based).
2. **Direct Enrollment Revenue** — Students who don't find a suitable partner college can enroll in ICTE Hub's own 2-year online degree programs (no commission; internal enrollment).

---

## 2. User Roles & Permissions

### 2.1 Role Definitions & Hierarchy

```
Owner (highest authority)
  └── Admin (managed by Owner)
        └── Telecaller (managed by Admin or Owner)
```

| Role | Description | Account Creation | Who Manages This Role |
|---|---|---|---|
| **Public / Guest** | Any anonymous visitor to the website. No account needed. | N/A — no public signup exists | N/A |
| **Telecaller** | Internal team member who calls students, logs call outcomes, and manages assigned leads. | Created by Admin or Owner | Admin or Owner |
| **Admin** | Platform administrator with access to lead management, college management, commissions, and team management (telecallers only). | Created **exclusively by Owner** | Owner only |
| **Owner** | The top-level platform owner with full unrestricted access. Manages admins, views audit logs, and has the ultimate authority over all platform operations. | Pre-seeded / hardcoded during initial setup (only 1 Owner exists) | Cannot be created, deleted, or modified by anyone except self |

> **Critical Rules**:
> - There is **no public signup**. All internal accounts are created by an Owner or Admin.
> - **Admins can only create and manage telecaller accounts.** Admins **cannot** create, edit, pause, or delete other admin accounts.
> - **Only the Owner can create, manage, pause, or delete admin accounts.** This prevents internal conflicts or sabotage between admins.
> - The Owner account is **pre-seeded** during initial platform setup and cannot be deleted or demoted.

### 2.2 Permission Matrix

| Action | Guest | Telecaller | Admin | Owner |
|---|---|---|---|---|
| Browse colleges | ✅ | ✅ | ✅ | ✅ |
| Submit inquiry (lead) | ✅ | ❌ | ❌ | ❌ |
| Check inquiry status (by phone + name) | ✅ | ❌ | ❌ | ❌ |
| Submit partner inquiry | ✅ | ❌ | ❌ | ❌ |
| View own assigned leads | ❌ | ✅ | ❌ | ❌ |
| Log call outcomes | ❌ | ✅ | ❌ | ❌ |
| View all leads | ❌ | ❌ | ✅ | ✅ |
| Manage colleges | ❌ | ❌ | ✅ | ✅ |
| Manage institute courses | ❌ | ❌ | ✅ | ✅ |
| Manage commissions | ❌ | ❌ | ✅ | ✅ |
| Create/manage **telecaller** accounts | ❌ | ❌ | ✅ | ✅ |
| Create/manage **admin** accounts | ❌ | ❌ | ❌ | ✅ |
| View hot leads (behavioral) | ❌ | ❌ | ✅ | ✅ |
| View partner inquiries | ❌ | ❌ | ✅ | ✅ |
| Export data (CSV) | ❌ | ❌ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |
| Reset other user's password | ❌ | ❌ | ❌ | ✅ |
| Update own profile / picture | ❌ | ✅ | ✅ | ✅ |

### 2.3 Management Hierarchy Rules

| Who | Can Manage | Cannot Manage |
|---|---|---|
| **Owner** | Admins, Telecallers, Self (profile only) | Cannot be deleted or demoted |
| **Admin** | Telecallers only | Other Admins, Owner |
| **Telecaller** | Self (profile only) | No one else |

---

## 3. Pages & Navigation

### 3.1 Public Pages

#### 3.1.1 Home Page (`app/(public)/page.tsx`)
The primary landing page featuring:
- **Hero Section** — Large headline with gradient text ("Find the Right University For Your Future"), animated mesh background, two CTAs: "Get Free Consultation" (opens inquiry modal) and "Browse Colleges".
- **Stats Counter** — Dynamic counts: total universities, total unique courses, "100% Free Service" badge.
- **Top Recommendations Card** — Glass-morphism card showing the first 3 colleges with name, mode (Online/Offline), and location. Clicking any opens the inquiry modal.
- **Smart University Finder** — Dark-themed search bar with keyword input, mode filter dropdown (All/Online/Offline), and search button. Navigates to the Browse page with pre-filled filters.
- **Featured Universities Grid** — First 6 colleges displayed as cards. "View All Catalog" link navigates to Browse.
- **Browse by Category Section** — 6 category tiles: BCA, BBA, MBA, BSc, MSc, BCom. Clicking any navigates to Browse with the course name pre-filled as search query.
- **Degree Programs Section** — Conditional (only shows if institute courses exist). Displays ICTE Hub's own degree programs with name, duration, fees, and "Enroll Now" button (opens Institute Inquiry modal).
- **Inline CTA / Contact Section** — Dark-themed section with split layout: left side has benefits list ("100% Free" counseling pitch), right side has an inline inquiry form (name, phone, email, college checkboxes).
- **Sticky Sub-Navigation** — Appears after scrolling past the hero. Quick links: Universities, Courses, Programs, Get Help. Highlights the currently visible section using IntersectionObserver.
- **Footer** — Full footer with quick links, partner links, legal links, contact info.

#### 3.1.2 College Browse Page (`app/(public)/colleges/page.tsx`)
- **Page Header** — "Explore Colleges" title with subtitle and "Partner Network" badge.
- **Stats Cards** — Three cards showing: Total Colleges, Online Programs count, Campus (Offline) Programs count.
- **CTA Button** — "Interested? Get a Free Consultation" opens the inquiry modal.
- **Search & Filter Bar** — Glass-morphism bar with:
  - Text search input (searches by college name and course name)
  - Mode filter toggle buttons: All, Online, Offline (each with count badge)
  - Clear search button (X icon)
- **College Grid** — Responsive grid (1/2/3/4 columns) of college cards.
- **Loading State** — Skeleton loader cards during data fetch.
- **Empty State** — "No Colleges Found" message with clear filters button.
- **Error State** — Error message with "Try Again" button.

#### 3.1.3 Check Status Page (`app/(public)/check-status/page.tsx`)
- **Purpose**: Allows students to check the status of their inquiry without logging in.
- **Search Form** — Requires both:
  - Full name (case-insensitive match)
  - 10-digit phone number (exact match)
- **Security**: Generic empty response if no match (doesn't reveal which field was wrong).
- **Result Display** — For each matching inquiry:
  - Student name and status badge
  - Human-readable status translations (see Section 5.5)
  - Status update description
  - Interested colleges list
  - Submission date
- **Auto-redirect**: If a logged-in user visits this page, they're redirected to their dashboard.

#### 3.1.4 Login Page (`app/(auth)/login/page.tsx`)
- **Standalone** — No site header or footer.
- **Glass-morphism card** over animated mesh gradient background.
- **Fields**: Email and Password only.
- **No signup link** — Accounts are admin/owner-created only.
- **Post-login behavior**:
  - If `must_change_password` is `true` → Redirect to **Force Password Change** page (see Section 3.6.2).
  - Otherwise → Redirect to role-based dashboard: Owner → `/owner`, Admin → `/admin`, Telecaller → `/telecaller`.
- **Auto-redirect**: If already logged in, redirects to appropriate dashboard.

#### 3.1.5 Partner With Us Page (`app/(public)/partner-with-us/page.tsx`)
- **Purpose**: Allows colleges/universities to submit a partnership request.
- **Form Fields**:
  - College/Institution Name (required)
  - Contact Person Name (required)
  - Phone Number (required)
  - Email Address (required)
  - Proposal / Message (optional)
- **Success State**: Shows confirmation with "Submit Another Request" option.

#### 3.1.6 Legal Pages (`app/(public)/[legal_route]/page.tsx`)
- **Privacy Policy** (`/privacy`)
- **Terms of Service** (`/terms`)
- **Disclaimer** (`/disclaimer`)
- All styled as content pages with card layout.

### 3.2 Protected Pages — Telecaller

#### 3.2.1 Telecaller Dashboard (`app/(dashboard)/telecaller/page.tsx`)
- **Access**: Telecaller role only.
- **Shows only leads assigned to the current telecaller**.
- **Features**:
  - View assigned student leads with status, contact info, interested colleges
  - Update lead status (new → contacted → interested → not-interested → enrolled)
  - Log call outcomes with notes (interested, not-interested, call-back-later, no-answer)
  - View call history for each lead

### 3.3 Protected Pages — Admin

All admin pages use a **sidebar layout** with the following navigation items:

| Nav Item | Path | Icon |
|---|---|---|
| Leads | `/admin` | Users |
| Institute Leads | `/admin/institute-leads` | Users |
| Colleges | `/admin/colleges` | Building2 |
| Institute Courses | `/admin/institute-courses` | GraduationCap |
| Team | `/admin/team` | UserCog |
| Commissions | `/admin/commissions` | DollarSign |
| Partner Inquiries | `/admin/partner-inquiries` | Handshake |
| Hot Leads | `/admin/hot-leads` | Flame (animated pulse) |

**Sidebar Bottom Section**: User profile picture/avatar, name, email, Profile button, Logout button.

#### 3.3.1 Lead Management (`app/(dashboard)/admin/page.tsx`)
- View all student leads in a table/list
- Filter leads by status, telecaller, date range
- Assign/reassign telecallers to leads
- Update lead status
- View call history for any lead
- CSV export capability

#### 3.3.2 Institute Lead Management (`app/(dashboard)/admin/institute-leads/page.tsx`)
- Similar to Lead Management but for students who inquired about ICTE Hub's own programs.
- View, filter, assign telecallers, update status.

#### 3.3.3 College Management (`app/(dashboard)/admin/colleges/page.tsx`)
- **CRUD** for partner colleges:
  - Add new college: name, mode (Online/Offline), location, courses offered, commission %, commission structure, contact info, logo upload
  - Edit existing college details
  - Delete a college
  - Upload/change college logo (2MB max, JPEG/PNG/WebP)

#### 3.3.4 Institute Courses Management (`app/(dashboard)/admin/institute-courses/page.tsx`)
- **CRUD** for ICTE Hub's own degree programs:
  - Add/edit course: name, duration, fees
  - Delete a course

#### 3.3.5 Team Management (`app/(dashboard)/admin/team/page.tsx`)
- **Admin can only manage telecaller accounts** (cannot see or manage other admins).
- **Create new telecallers**: name, email, password, role is fixed to `telecaller`.
- **View all telecaller team members** with role, active status, profile picture.
- **Pause/Unpause telecaller accounts** (toggle `is_active` — paused users cannot log in).
- **Delete telecaller accounts**.
- **View telecaller activity**: assigned leads + call logs.

#### 3.3.6 Commissions Tracker (`app/(dashboard)/admin/commissions/page.tsx`)
- View all commission records
- Update commission amount and status (pending → received)
- Commission records are auto-created when a lead status changes to "enrolled-college"

#### 3.3.7 Partner Inquiries Log (`app/(dashboard)/admin/partner-inquiries/page.tsx`)
- View all partnership requests submitted by colleges
- Read-only log of: college name, contact person, phone, email, message, date

#### 3.3.8 Hot Leads / Behavioral Analytics (`app/(dashboard)/admin/hot-leads/page.tsx`)
- Shows **anonymous visitors who browsed heavily but haven't submitted an inquiry**.
- Data points per visitor session:
  - Colleges viewed (with view count per college)
  - Mode filters used
  - First and last seen timestamps
  - Total view count
- Sorted by view count (highest engagement first)
- Only shows sessions that have NOT converted to a lead

### 3.4 Protected Pages — Owner

The Owner has access to **all admin pages** (Sections 3.3.1–3.3.8) plus additional Owner-exclusive pages. The Owner's sidebar includes all admin nav items plus:

| Nav Item | Path | Icon |
|---|---|---|
| Admin Management | `/owner/admins` | ShieldCheck |
| Audit Logs | `/owner/audit-logs` | ScrollText |

#### 3.4.1 Admin Management (`app/(dashboard)/owner/admins/page.tsx`)
- **Owner-exclusive page** for managing admin accounts.
- **Create new admins**: name, email, password, role is fixed to `admin`.
- **View all admin accounts** with active status, profile picture, created date.
- **Pause/Unpause admin accounts** (toggle `is_active`).
- **Delete admin accounts** (no restriction — Owner has full authority).
- **Reset admin password** — Owner can directly reset any admin's password without knowing the current one. Sets `must_change_password=true` so the admin is forced to change it on next login.
- **View admin activity**: assigned leads, call logs, and full audit log filtered to this admin.

#### 3.4.2 Audit Logs (`app/(dashboard)/owner/audit-logs/page.tsx`)
- **Owner-exclusive page** for tracking all internal actions on the platform.
- **Landing View**: Shows a list of all internal users (admins and telecallers) with:
  - Name, email, role, role badge, active status
  - Profile picture / avatar
  - Last activity timestamp
- **Filters on the user list**:
  - Filter by **role** (All / Admin / Telecaller)
  - Search by **name or email**
- **User Detail View** (`/owner/audit-logs/:userId`): Clicking on any user in the list opens a **dedicated log page** showing every action that user performed on the platform:
  - Each log entry contains:
    - **Action type**: `create`, `update`, `delete`, `status_change`, `login`, `password_change`, `assign`, `export`, `upload`
    - **Target entity**: Which table/resource was affected (e.g., `leads`, `colleges`, `users`, `commissions`, `institute_courses`, `call_logs`)
    - **Target ID**: The specific record ID that was affected
    - **Description**: Human-readable summary of what happened (e.g., "Changed lead status from 'new' to 'contacted'", "Deleted college 'XYZ University'", "Created telecaller account for john@example.com")
    - **Old value / New value**: For updates and status changes, stores the previous and new values (as JSON)
    - **Timestamp**: Exact date and time of the action
    - **IP address** (optional): For security tracking
  - **Filters on the log detail page**:
    - Filter by **action type** (create, update, delete, etc.)
    - Filter by **target entity** (leads, colleges, users, etc.)
    - Filter by **date range**
  - **Sorting**: Most recent first (default), with option to sort by any column
  - **Pagination**: Logs can grow large — paginate with 50 entries per page

> **Purpose**: The audit log system allows the Owner to trace exactly who did what, when, and to which record. This enables rapid identification and remediation of any harmful, accidental, or unauthorized actions on the platform.

### 3.5 Shared Protected Pages

#### 3.5.1 Profile Page (`app/(dashboard)/profile/page.tsx`)
- **Access**: Any logged-in user (telecaller, admin, or owner).
- View and edit: name, profile picture
- Upload profile picture (2MB max, JPEG/PNG/WebP)

### 3.6 Authentication-Related Pages

#### 3.6.1 Login Page
(Described in Section 3.1.4)

#### 3.6.2 Force Password Change Page (`app/(auth)/change-password/page.tsx`)
- **Shown to**: Any admin or telecaller whose `must_change_password` flag is `true`.
- **Triggered**: Automatically after first login with credentials set by Owner/Admin, or after a password reset by the Owner.
- **Fields**:
  - **Current Password** — The password that was set by the Owner/Admin at account creation time (or the reset password).
  - **New Password** — The user's desired new password.
  - **Confirm New Password** — Must match the new password.
- **Validation**:
  - Current password must match the stored hash (prevents unauthorized changes if token is compromised).
  - New password must meet minimum strength requirements.
  - New password must differ from current password.
  - Confirm password must match new password.
- **On success**: `must_change_password` is set to `false`, password hash is updated, user is redirected to their dashboard.
- **Cannot skip**: Until the password is changed, the user cannot navigate to any other page. All routes redirect to `/change-password` if `must_change_password` is `true`.

---

## 4. Database Models & RLS Policies (Supabase/PostgreSQL)

> These models map directly to PostgreSQL tables in Supabase. **Every table must have Row Level Security (RLS) enabled.**
> 
> **Global RLS Rules:**
> - **Owner**: Has `ALL` privileges on every table based on JWT metadata (`auth.jwt() -> 'user_metadata' ->> 'role' = 'owner'`).
> - **Admin**: Has `ALL` privileges on most tables, EXCEPT `audit_logs` (read-only) and they cannot manage other admin/owner accounts in the `users` table.

### 4.1 Users (Extends auth.users)
> **RLS**: Owner = `ALL`. Admin = `ALL` where role is 'telecaller'. Telecaller = `SELECT, UPDATE` where `id = auth.uid()`.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| name | Text | Yes | |
| email | Text | Yes | Unique |
| password_hash | Text | Yes | Hashed password |
| role | Text | Yes | CHECK constraint: `owner`, `admin`, `telecaller` |
| is_active | Boolean | Yes | Default: `true`. When `false`, user cannot log in |
| must_change_password | Boolean | Yes | Default: `true`. Set to `true` on account creation and password resets. Set to `false` after user successfully changes their password. |
| profile_picture_url | Text | No | URL to uploaded profile picture |
| created_by | UUID | No | References users. The Owner/Admin who created this account. `null` for the pre-seeded Owner. |
| created_at | Timestamp | Auto | |

### 4.2 Colleges
> **RLS**: Owner/Admin = `ALL`. Public = `SELECT` only.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| name | Text | Yes | |
| mode | Text | Yes | CHECK constraint: `Online`, `Offline` |
| location | Text | Conditional | Required if mode is Offline |
| courses_offered | Text Array | No | e.g., `["BCA", "MBA", "BSc"]` |
| commission_percent | Decimal | No | Percentage commission |
| commission_structure | Text | No | Values: `one-time`, `installments` |
| contact_name | Text | No | College point of contact |
| contact_phone | Text | No | |
| contact_email | Text | No | |
| logo_url | Text | No | URL to uploaded college logo |
| created_at | Timestamp | Auto | |

### 4.3 Institute Courses
> **RLS**: Owner/Admin = `ALL`. Public = `SELECT` only.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| name | Text | Yes | |
| duration | Text | No | Default: `2 years` |
| fees | Decimal | No | Program fees in ₹ |
| created_at | Timestamp | Auto | |

### 4.4 Leads (Partner College Inquiries)
> **RLS**: Owner/Admin = `ALL`. Telecaller = `SELECT, UPDATE` where `assigned_telecaller_id = auth.uid()`. Public = `INSERT` only.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| name | Text | Yes | Student's full name |
| phone | Text | Yes | Student's phone (10 digits) |
| email | Text | No | |
| interested_college_ids | UUID Array | No | References colleges |
| status | Text | Yes | Default: `new`. CHECK constraint: `new`, `contacted`, `interested`, `not-interested`, `enrolled-college`, `enrolled-institute` |
| assigned_telecaller_id | UUID | No | References users. Auto-assigned on creation |
| auto_assigned | Boolean | No | Default: `false`. `true` if assigned by auto-assignment algorithm |
| enrolled_institute_course_id | UUID | No | References institute_courses (used when enrolled in own program) |
| session_id | Text | No | Links to visitors table for behavioral tracking |
| source | Text | No | Default: `direct`. Tracks UTM source (e.g., `instagram`, `google`) |
| created_at | Timestamp | Auto | |

### 4.5 Institute Leads (Own Program Inquiries)
> **RLS**: Same as Leads table.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| name | Text | Yes | |
| phone | Text | Yes | |
| email | Text | No | |
| interested_course_id | UUID | No | References institute_courses |
| message | Text | No | |
| status | Text | Yes | Default: `new`. CHECK constraint: `new`, `contacted`, `interested`, `not-interested`, `enrolled` |
| session_id | Text | No | |
| created_at | Timestamp | Auto | |

### 4.6 Commissions
> **RLS**: Owner/Admin = `ALL`. Telecaller/Public = No access.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| lead_id | UUID | Yes | References leads |
| college_id | UUID | Yes | References colleges |
| amount | Decimal | No | Admin fills in later |
| status | Text | Yes | Default: `pending`. CHECK constraint: `pending`, `received` |
| created_at | Timestamp | Auto | |

### 4.7 Call Logs
> **RLS**: Owner/Admin = `ALL`. Telecaller = `INSERT, SELECT` where they own the lead.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| lead_id | UUID | Yes | References leads |
| telecaller_id | UUID | No | References users. Set NULL on user deletion |
| outcome | Text | Yes | CHECK constraint: `interested`, `not-interested`, `call-back-later`, `no-answer` |
| notes | Text | No | Free-text call notes |
| call_date | Timestamp | Auto | |

### 4.8 Visitors (Behavioral Tracking)
> **RLS**: Owner/Admin = `SELECT`. Public = `INSERT, UPDATE` where session_id matches client.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| session_id | Text | Yes | Unique. Client-generated UUID stored in localStorage |
| viewed_colleges | JSON | No | Array of `{ college_id, college_name, count, last_viewed }` |
| mode_filters_used | Text Array | No | |
| first_seen_at | Timestamp | Yes | |
| last_seen_at | Timestamp | Yes | |
| converted_to_lead_id | UUID | No | References leads. Set when visitor submits inquiry |

### 4.9 Partner Inquiries
> **RLS**: Owner/Admin = `SELECT`. Public = `INSERT` only.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| college_name | Text | Yes | |
| contact_person | Text | No | |
| phone | Text | No | |
| email | Text | No | |
| message | Text | No | |
| created_at | Timestamp | Auto | |

### 4.10 Audit Logs (NEW)
> **RLS**: Owner = `SELECT`. Admin/Telecaller/Public = No access. (Records inserted via Postgres Triggers using `security definer`).

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Auto | Primary key |
| user_id | UUID | Yes | References users. The user who performed the action. |
| user_role | Text | Yes | Role of the user at the time of the action (`owner`, `admin`, `telecaller`). Stored separately so logs remain meaningful even if the user's role changes later. |
| action | Text | Yes | CHECK constraint: `create`, `update`, `delete`, `status_change`, `login`, `password_change`, `assign`, `export`, `upload` |
| target_entity | Text | Yes | The table/resource affected. CHECK constraint: `leads`, `institute_leads`, `colleges`, `institute_courses`, `users`, `commissions`, `call_logs`, `partner_inquiries`, `visitors`, `auth` |
| target_id | UUID | No | The specific record ID that was affected. Nullable for actions like `login` or `export`. |
| description | Text | Yes | Human-readable summary (e.g., "Changed lead status from 'new' to 'contacted'") |
| old_value | JSON | No | Previous state for updates/status changes |
| new_value | JSON | No | New state for updates/status changes |
| ip_address | Text | No | Client IP address for security tracking |
| created_at | Timestamp | Auto | When the action occurred |

### 4.11 Storage Buckets
> These define the Supabase Storage architecture for file uploads.

#### 4.11.1 `college_logos` Bucket
- **Purpose**: Stores images for college logos.
- **RLS**: 
  - **Public**: `SELECT` (Anyone can view logos).
  - **Owner/Admin**: `INSERT, UPDATE, DELETE`.
  - **Telecaller**: No write access.

#### 4.11.2 `profile_pictures` Bucket
- **Purpose**: Stores avatar images for internal users (Admins, Telecallers).
- **RLS**:
  - **Authenticated Users (Owner/Admin/Telecaller)**: `SELECT` (Can see other team members' avatars).
  - **Public**: No access.
  - **Owner/Admin**: `INSERT, UPDATE, DELETE` for any user.
  - **Telecaller**: `INSERT, UPDATE` only where the file path matches their own `user_id`.

---

## 5. Business Logic & Rules

### 5.1 Telecaller Auto-Assignment Algorithm

> **Implementation Note**: This will be implemented as a **Postgres Stored Procedure (RPC)** to ensure atomic assignment and prevent race conditions if multiple leads are submitted concurrently.

When a new lead is created (either partner college inquiry or institute program inquiry):

1. Fetch all **active** telecallers (`role=telecaller`, `is_active=true`).
2. Calculate a **weighted workload score** for each telecaller based on their currently assigned leads across BOTH the `leads` and `institute_leads` tables:
   - `new` status = **1 point**
   - `contacted` status = **2 points**
   - `interested` status = **3 points**
   - All other statuses (`not-interested`, `enrolled-college`, `enrolled-institute`, `enrolled`) = **0 points**
3. Select the telecaller with the **lowest score**.
4. If there's a tie, pick **randomly** among tied telecallers.
5. If **no active telecallers exist**, leave the lead unassigned (no error thrown).
6. Set `auto_assigned=true` on the lead record.

### 5.2 Commission Auto-Creation

> **Implementation Note**: This will be implemented using a **Postgres Database Trigger** that watches the `leads` table for status updates.

When a lead's status is updated to `enrolled-college`:
- The trigger **automatically creates** a commission record linked to the lead and its interested college.
- Commission amount is initially `null` (admin fills it in later).
- Commission status defaults to `pending`.
- If status is `enrolled-institute`, **no commission** is created (internal enrollment).

### 5.3 Visitor Behavioral Tracking

**Session Management**:
- A UUID `session_id` is generated on the client and persisted in `localStorage`.
- The same session is used across page visits until the browser storage is cleared.

**Tracking Events** (all fire-and-forget, never block UI):
- **College card click** → Records `college_id`, `college_name` for the session. Increments view count if same college viewed again.
- **Mode filter change** → Records the filter mode used (`Online`/`Offline`/`All`).
- **Inquiry form submission** → Links the session to the newly created lead (sets `converted_to_lead_id`).

**Hot Lead Detection** (Admin/Owner view):
- Shows all visitor sessions where `converted_to_lead_id IS NULL` (never submitted an inquiry).
- Sorted by total college view count (descending).
- Purpose: Identify high-intent visitors who browsed heavily but didn't convert.

### 5.4 First-Login Password Change Flow

> **Implementation Note**: This flow is enforced using **Next.js 15 Edge Middleware**, which intercepts all requests before the page loads.

When an Owner or Admin creates a new user account:

1. The Owner/Admin sets an **initial password** for the new account using the Supabase Admin API.
2. The `must_change_password` flag is set to `true` on the new user's metadata/profile record.
3. When the new user **logs in for the first time**:
   - Login succeeds normally (Supabase issues a JWT).
   - The Next.js 15 Middleware detects `must_change_password: true` in the session/cookie.
   - The middleware **immediately redirects** to the Force Password Change page (`/change-password`).
4. On the Force Password Change page, the user must:
   - Enter the **current password** (the one set by Owner/Admin).
   - Enter a **new password**.
   - Enter **confirm new password** (must match).
5. On successful password change (via `supabase.auth.updateUser`):
   - The password hash is updated.
   - `must_change_password` is set to `false`.
   - User is redirected to their role-based dashboard.
6. **Until the password is changed**, all navigation is blocked by the Middleware — every route redirects to `/change-password`.

**Owner Password Reset Flow**:
- The Owner can **directly reset** any admin's or telecaller's password from the management pages.
- This sets a new temporary password and sets `must_change_password=true`.
- The affected user will be forced to change the password on their next login.
- The Owner does **not** need to know the user's current password to perform a reset.

### 5.5 Student-Friendly Status Translations

Internal statuses are translated to friendly labels for the Check Status page:

| Internal Status | Public Label | Description Shown |
|---|---|---|
| `new` | Inquiry Received | "We've received your request! An advisor will review your options shortly." |
| `contacted` | Contacted | "Our team has contacted you. We are ready to help you select a program." |
| `interested` | Evaluation | "Your profile is updated. We are finalizing details for your target universities." |
| `not-interested` | Closed | "Inquiry closed. Let us know if you decide to explore other courses." |
| `enrolled-college` | Enrolled | "Congratulations! You are enrolled in a partner university." |
| `enrolled-institute` | Directly Enrolled | "Congratulations! You are enrolled directly in our degree program." |

### 5.6 Lead Source Tracking (UTM)

- The platform reads a `?source=` query parameter from the URL (e.g., `?source=instagram`).
- The source value is persisted in `localStorage` so it survives page navigation.
- When a lead is created, the source is attached to the lead record.
- If no source parameter exists, defaults to `direct`.

### 5.7 Check Status Security Rules

- Requires **both** phone (exact 10-digit match) **and** name (case-insensitive match).
- Returns only **safe fields**: name, status, interested colleges, created_at.
- If no match found, returns a **generic empty response** (doesn't reveal which field was incorrect).

### 5.8 Audit Log Recording Rules

> **Implementation Note**: This is enforced via **Postgres Database Triggers**. The application code NEVER writes directly to the `audit_logs` table. The triggers fire automatically on `INSERT/UPDATE/DELETE` operations on monitored tables.

Every **write action** performed by an authenticated internal user (Owner, Admin, or Telecaller) must be recorded in the `audit_logs` table. This includes:

| Action Type | When Logged | Example Description |
|---|---|---|
| `create` | A new record is created | "Created college 'ABC University'" |
| `update` | A record is modified | "Updated college commission from 10% to 15%" |
| `delete` | A record is deleted | "Deleted telecaller account (john@example.com)" |
| `status_change` | A lead/commission status changes | "Changed lead status from 'new' to 'contacted'" |
| `login` | A user logs in successfully | "Admin logged in" |
| `password_change` | A password is changed or reset | "Owner reset password for admin (admin@example.com)" |
| `assign` | A telecaller is assigned/reassigned to a lead | "Reassigned lead to telecaller 'Jane Smith'" |
| `export` | Data is exported (CSV) | "Exported 150 leads as CSV" |
| `upload` | A file is uploaded | "Uploaded college logo for 'XYZ University'" |

**Rules**:
- Audit logs are **write-only** — they can never be edited or deleted by anyone, including the Owner. (Enforced by RLS rejecting all UPDATE/DELETE calls).
- Logs are created purely server-side (in Postgres) to prevent tampering.
- The `user_role` is captured at the time of the action to preserve historical accuracy (read from `auth.jwt()`).
- Auto-assignment of telecallers is logged as an `assign` action with `user_id` set to a system constant (e.g., `SYSTEM`).

### 5.9 User Synchronization (`auth.users` to `public.users`)

> **Implementation Note**: Handled via a **Postgres Database Trigger** on the `auth.users` schema.

- When the Owner or Admin creates a new account via the Supabase Admin API, the account is created in Supabase's hidden `auth.users` table.
- A trigger on `auth.users` immediately fires `AFTER INSERT`.
- This trigger extracts the user's `id`, `email`, and `role` (from `raw_user_meta_data`) and `INSERT`s a corresponding row into the public `users` table.
- This ensures the `users` table is always perfectly synchronized with the auth system, allowing us to safely use foreign keys (e.g., linking leads to telecallers).

---

## 6. Server Actions & Supabase Data Fetching

> Since we are using Next.js 15 App Router and Supabase, we do not build traditional REST API endpoints (like `/api/colleges`). Instead, we use **React 19 Server Components (RSC)** for data fetching and **Next.js 15 Server Actions** for data mutations.

### 6.1 Authentication (Supabase Auth)
- **Login**: Use `supabase.auth.signInWithPassword()`. Returns session containing user metadata.
- **Account Creation**: Owner/Admin uses `supabase.auth.admin.createUser()` to create accounts without automatically logging into them. Sets `role` and `must_change_password` in user metadata.
- **Change Password**: Use `supabase.auth.updateUser({ password: new_password })`.
- **Reset Password (Owner)**: Use `supabase.auth.admin.updateUserById()`.

### 6.2 Data Fetching (Server Components)
All read operations (`SELECT`) are performed directly in Server Components using the `@supabase/ssr` client. 
- **Colleges List**: `supabase.from('colleges').select('*')`
- **Leads List (Admin)**: `supabase.from('leads').select('*, colleges(*)')`
- **Leads List (Telecaller)**: RLS automatically filters this to only show their assigned leads when using `supabase.from('leads').select('*')`.
- **Audit Logs**: `supabase.from('audit_logs').select('*').eq('user_id', id)`

### 6.3 Server Actions (Mutations)
All create, update, and delete operations are performed via exported `async function` Server Actions.

| Action Name | Access | Description |
|---|---|---|
| `createLeadAction` | Public | Inserts lead, calls RPC for auto-assignment. Rate limited. |
| `updateLeadStatusAction` | Admin, Owner, Assigned Telecaller | Updates status. Postgres Triggers handle audit log and commission creation automatically. |
| `createCollegeAction` | Admin, Owner | Inserts new college. |
| `updateCollegeAction` | Admin, Owner | Updates college details. |
| `deleteCollegeAction` | Admin, Owner | Deletes a college. |
| `logCallAction` | Telecaller | Inserts into `call_logs`. |
| `trackVisitorAction` | Public | Non-blocking insert/upsert into `visitors` table for behavioral analytics. |
| `toggleUserActiveAction` | Admin, Owner | Updates user's `is_active` status. |
| `uploadAssetAction` | Authenticated | Compresses image on client, then uploads to Supabase Storage bucket. |

> **Note on Audit Logs**: None of these Server Actions manually write to the `audit_logs` table. The Postgres Triggers in Supabase automatically detect these mutations and log them securely.

---

## 7. Security Requirements

1. **No public signup** — Handled by disabling public signups in the Supabase Dashboard. All accounts are Owner/Admin-created only via the Supabase Admin API.
2. **Role hierarchy enforcement** — Enforced via **Postgres Row Level Security (RLS)**. Admins physically cannot mutate other admin rows in the database.
3. **Rate limiting**:
   - Implemented using a tool like `@upstash/ratelimit` (Redis) on Server Actions for login and lead creation.
   - **Note**: Limits are configured generously to prevent abuse and brute-force attacks without ever blocking normal user activity (e.g., 50 lead creations per 15 mins per IP, 20 login attempts per 15 mins). Legitimate users will never hit these limits.
4. **File uploads**: Handled via Supabase Storage policies (2MB max limit enforced at bucket level).
5. **Password hashing**: Handled natively by Supabase Auth (bcrypt/argon2).
6. **Forced password change**: Enforced via **Next.js 15 Edge Middleware** checking the Supabase session object.
7. **Authentication**: Handled natively by Supabase Auth via secure HTTP-only cookies in Next.js 15 (`@supabase/ssr`).
8. **Security headers**: Applied via `next.config.js` headers.
9. **Owner account protection** — The Owner account cannot be deleted or paused (Enforced via RLS).
10. **Paused users cannot log in** — Enforced via a custom Postgres function tied to the Supabase Auth hook, or checked via Middleware.
11. **Call log ownership verification** — Enforced via RLS (Telecallers can only `INSERT` if `auth.uid()` matches the lead's owner).
12. **Check Status data minimization** — Server Component only fetches and returns necessary fields.
13. **Audit logs are immutable** — Enforced via RLS (no `UPDATE` or `DELETE` policies on the `audit_logs` table).
14. **Audit logs are server-side only** — Handled via Postgres Database Triggers.

---

## 8. SEO & Meta

- **Page Title**: "ICTE Hub - Find Your Right University"
- **Meta Description**: "Compare colleges, get free counseling, and find the right university for your future with ICTE Hub."
- **Favicon**: Blue rounded rectangle with "ICTE" text in white.

---

## 9. Contact Information (Current)

- **Phone**: +91 XXXXX XXXXX (placeholder — to be updated)
- **Email**: info@ictehub.com
- **Location**: New Delhi, India
- **Tagline**: "Find the right university for your future. Accompanying you at every step of your educational roadmap."
- **Footer Credit**: "Built with care in India"

---

## 10. Content & Copy

### 10.1 Homepage Copy

- **Hero Headline**: "Find the Right University For Your Future"
- **Hero Subtitle**: "Discover accredited partner colleges offering distance, online, and offline degree programs. Request a free counseling session and secure your admission today."
- **CTA Primary**: "Get Free Consultation"
- **CTA Secondary**: "Browse Colleges"
- **Stats**: `{count}+ Universities`, `{count}+ Courses`, `100% Free Service`
- **Counseling Section Headline**: "Talk to an Academic Counselor — 100% Free"
- **Counseling Benefits**:
  - "Get direct admission updates in partner universities"
  - "Compare online degrees vs offline structures"
  - "No charges or service commission billed to students"

### 10.2 Browse Page Copy

- **Headline**: "Explore Colleges"
- **Subtitle**: "Find the best partner institutions and courses for your career path."
- **CTA**: "Interested? Get a Free Consultation"

### 10.3 Course Categories

| Abbreviation | Full Name |
|---|---|
| BCA | Computer Applications |
| BBA | Business Administration |
| MBA | Business Mgmt (Masters) |
| BSc | Science & Technology |
| MSc | Advanced Science |
| BCom | Commerce & Finance |

---

## 11. Feature Checklist Summary

### Public Features
- [x] Dynamic college directory with search and Online/Offline filter
- [x] College card with logo/initials, name, mode badge, location, courses, "Request Info" CTA
- [x] Inquiry form modal (name, phone, email, college multi-select)
- [x] Institute inquiry form modal (for own degree programs)
- [x] Inline inquiry form on homepage
- [x] Check Status page (phone + name lookup, no login required)
- [x] Partner With Us page (college partnership request form)
- [x] UTM source tracking (`?source=` parameter)
- [x] Anonymous visitor behavior tracking (college views, filter usage)
- [x] Privacy Policy, Terms of Service, Disclaimer pages

### Authentication & Security Features
- [x] Login-only authentication (no signup)
- [x] Role-based access control (owner, admin, telecaller)
- [x] Role hierarchy: Owner > Admin > Telecaller
- [x] Forced password change on first login
- [x] Owner can reset any user's password
- [x] Password change requires current password verification

### Telecaller Features
- [x] Telecaller dashboard with own assigned leads
- [x] Call outcome logging with notes
- [x] Lead status updates

### Admin Features
- [x] Admin sidebar layout with collapsible mobile drawer
- [x] Lead management (view, filter, assign, update status, call history)
- [x] Institute lead management
- [x] College CRUD (add, edit, delete, logo upload)
- [x] Institute course CRUD (add, edit, delete)
- [x] Telecaller management (create, pause, delete telecaller accounts)
- [x] Commissions tracker (auto-created, update amount/status)
- [x] Partner inquiries log (read-only)
- [x] Hot leads / behavioral analytics (unconverted high-engagement visitors)
- [x] CSV export for leads and commissions
- [x] Auto-assignment of telecallers (weighted workload algorithm)
- [x] Commission auto-creation on enrollment
- [x] Profile management (name, profile picture upload)

### Owner-Exclusive Features
- [x] Admin account management (create, pause, delete admin accounts)
- [x] Password reset for any user
- [x] Audit log system — user list with role/search filters
- [x] Audit log detail — per-user action history with filters (action type, entity, date range)
- [x] Full platform oversight with immutable action trail

---

## 12. Performance & Production Readiness

### 12.1 Image & Asset Optimization
To support free-tier hosting limits while maintaining a premium UX, all uploaded assets must be aggressively optimized **before** saving to storage (e.g., using an image processing library like `sharp` in Node.js).

| Asset Type | Optimization Strategy |
|---|---|
| **College Logos** | **Low Size Reduction, High Quality**. Logos represent partner brands and must look crisp. Resize to max `400x400` px. Convert to `WebP`. Apply light compression (e.g., 85-95% quality) to slightly reduce file size without introducing any visible artifacts. |
| **Profile Pictures** | **High Size Reduction, Standard Quality**. Used only internally for small circular avatars. Resize to max `200x200` px. Convert to `WebP`. Apply aggressive compression (e.g., 60-70% quality) to minimize storage footprint. |

### 12.2 API & Workload Optimization
- **Connection Pooling**: The backend must use database connection pooling (e.g., PgBouncer or native pooling) to handle traffic spikes without exhausting strict free-tier DB connection limits.
- **Background Operations**: Heavy non-blocking operations (e.g., sending notification emails, CSV exports) should be processed asynchronously so they don't block the main API response.
- **Pagination & Caching**: 
  - All large list endpoints (`/leads`, `/audit-logs/users/:userId`) must be paginated.
  - Public endpoints (`/colleges`) should be cached in-memory (or via Redis) to drastically reduce database hits for anonymous visitors.
- **Lightweight Payloads**: APIs must strip out unnecessary relational data unless explicitly needed, and NEVER return sensitive fields (like password hashes).

### 12.3 Public Route & SPA Production Handing
- **Client-Side Routing Fallback (404 Issue)**: When deploying the frontend Single Page Application (SPA) to production (e.g., Nginx, Vercel, Render), the server must be configured to route all unknown requests to `index.html`. This prevents 404 errors when a user directly visits a path like `/colleges` or refreshes the page.
- **Strict CORS**: The backend must enforce CORS, only allowing requests from the explicitly defined production frontend URL (and `localhost` for development).
- **Static Asset Caching**: Production servers must send long-lived `Cache-Control` headers (e.g., `max-age=31536000, immutable`) for hashed static JS/CSS assets to optimize load times.
- **Proxy Trust**: If hosted behind a reverse proxy or load balancer, the backend must be configured to trust proxy headers (e.g., `X-Forwarded-For`) so rate limiters and audit logs capture the correct client IP, not the internal proxy IP.

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Owner** | The top-level platform administrator with unrestricted access. Only one Owner exists. Cannot be deleted or demoted. |
| **Admin** | A platform administrator who can manage leads, colleges, telecallers, and commissions. Created and managed exclusively by the Owner. |
| **Lead** | A student who has submitted an inquiry form expressing interest in partner colleges. |
| **Institute Lead** | A student who has submitted an inquiry for ICTE Hub's own degree programs. |
| **Hot Lead** | An anonymous visitor session with high engagement (many college views) but no inquiry submission. |
| **Telecaller** | An internal team member who calls students to follow up on inquiries. |
| **Partner College** | An external university or college listed on the platform that pays commission to ICTE Hub. |
| **Institute Course** | A degree program offered directly by ICTE Hub (2-year online programs). |
| **Commission** | The fee earned by ICTE Hub when a student enrolls in a partner college. |
| **Session** | A unique browser session identified by a UUID stored in localStorage. Used for behavioral tracking. |
| **Auto-Assignment** | The algorithm that automatically assigns new leads to the least-loaded active telecaller. |
| **UTM Source** | A URL parameter (`?source=`) used to track which marketing channel drove a visitor. |
| **Audit Log** | An immutable, append-only record of every write action performed by internal users on the platform. Used by the Owner to monitor and trace platform activity. |
| **Forced Password Change** | A security mechanism where new accounts or password-reset accounts must change their password on first login before accessing the platform. |
