# UI Layer — Current State (as of v1.1.1)

## 1. PROFILE PAGE
- Location: `src/app/(dashboard)/profile/page.tsx`
- Contains: User info, profile picture upload, "Change Password" button
- Features: Avatar with initials fallback, image compression (WebP), Supabase storage upload
- Password change: Opens `ChangePasswordModal` — inline form removed
- Blob URL lifecycle: Properly revokes previous preview URL on file re-upload (memory leak fix)
- Alerts: Error (red) and success (green) variants

## 2. MODAL COMPONENTS

### Base Modal (`src/components/ui/Modal.tsx`)
- Controlled: `open: boolean`, `onClose: () => void`
- Escape key to close (stable via `useRef` pattern — doesn't re-register listener on every render), click backdrop to close
- Focus trap (Tab cycling), ARIA attributes
- Auto-focus guarded: won't steal focus if user is already focused inside the modal
- Close button has explicit `type="button"` and `tabIndex={0}`
- Sizes: `sm | md | lg | xl`

### ChangePasswordModal (`src/components/shared/ChangePasswordModal.tsx`)
- Used by: all 3 dashboard layouts (on login with `must_change_password=true`) + profile page
- Fields: Current Password, New Password, Confirm New Password
- Validation: min 6 chars, must differ from current, must match confirm
- On cancel/dismiss: just closes (user can change later from profile)
- On success: clears `must_change_password` flag, shows success state, auto-closes after 1.5s
- Timer cleanup: `setTimeout` handle stored in `useRef` with `useEffect` teardown — prevents execution after unmount
- Optional `onSuccess` callback for post-change feedback

### InquiryModal (`src/components/shared/InquiryModal.tsx`)
- Used on: `/colleges` page (public lead inquiry form)
- Fields: Full Name, Phone (10 digits), Email (optional), College selection (multi-checkbox)

### InstituteInquiryModal (`src/components/shared/InstituteInquiryModal.tsx`)
- Used on: `/colleges` page (institute enrollment inquiry)
- Fields: Full Name, Phone, Email, Course Selection, Message

## 3. NAVIGATION

### Login Page (`src/app/(auth)/login/page.tsx`)
- No external navigation — users land here from protected route redirect
- "Back to Home" link (→ `/`) added below login form so users aren't trapped
- Brute-force protection: 3 attempts → 30s cooldown

### Public Header (`src/components/layout/Header.tsx`)
- Sticky, glass-morphism background
- Desktop: horizontal nav + Login button
- Mobile: hamburger → MobileDrawer

### Dashboard Sidebars
- `AdminSidebar` — used by admin/owner roles; Profile + Logout at bottom
- `OwnerSidebar` — used by owner role only

## 4. PASSWORD CHANGE FLOW (v1.1.0)

```
User logs in with must_change_password = true
    ↓
Redirected to /{role}?change_password=true
    ↓
Dashboard layout detects query param → opens ChangePasswordModal
    ↓
Option A: User changes password → flag cleared → modal closes
Option B: User dismisses modal → can navigate freely
    ↓ (if dismissed)
Profile page → "Change Password" button → ChangePasswordModal opens
```

No dedicated `/change-password` page exists — requests to that URL redirect to the dashboard.

## 5. DASHBOARD LAYOUTS

### AdminLayoutClient (`src/app/(dashboard)/admin/AdminLayoutClient.tsx`)
- Detects `?change_password=true` on mount → shows ChangePasswordModal
- Contains AdminSidebar (desktop fixed) + mobile overlay

### OwnerLayoutClient (`src/app/(dashboard)/owner/OwnerLayoutClient.tsx`)
- Same pattern — detects `?change_password=true` → ChangePasswordModal

### TelecallerLayoutClient (`src/app/(dashboard)/telecaller/TelecallerLayoutClient.tsx`)
- Same pattern — header layout (no sidebar) + ChangePasswordModal

## 6. TOAST/NOTIFICATIONS
- No dedicated toast library
- Uses: `Alert` component (persistent inline), inline validation errors, modal success states
- `Alert` variants: `error` (red), `success` (green), `warning` (amber), `info` (blue)

## 7. UI COMPONENTS (src/components/)

### Primitives (`ui/`)
Button, Input, Card, Alert, Badge, Modal, Select, Skeleton, Spinner

### Layout (`layout/`)
Header, Footer, MobileDrawer, AdminSidebar, OwnerSidebar, TelecallerSidebar

### Shared (`shared/`)
IcteLogo, InquiryModal, InstituteInquiryModal, StatusBadge, **ChangePasswordModal** (new)

## 8. DESIGN SYSTEM
- **Colors:** Indigo/Purple primary, Slate secondary, Emerald (telecaller), status-specific colors
- **Typography:** Sans-serif, `text-[10px] uppercase tracking-widest` for labels, `font-extrabold` for headings
- **Glass Morphism:** `bg-white/90 backdrop-blur-2xl` on auth cards and modals
- **Border Radius:** `rounded-[2rem]` for cards and modals
- **Responsive:** Mobile-first, `md:` breakpoint (768px) for sidebar/desktop layout
