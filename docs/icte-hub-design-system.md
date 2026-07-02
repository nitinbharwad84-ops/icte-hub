# ICTE Hub — Design System & Theme Overview

> **Version**: 1.1  
> **Last Updated**: July 2, 2026  
> **Purpose**: Complete reference for the current visual design language, layout patterns, and animation system. Use this as a baseline for UI/UX redesign. Asset inventory has been moved to a separate file: `icte-hub-assets.md`.

---

## 1. Brand Identity

### 1.1 Brand Name
- **Full Name**: ICTE Hub
- **Tagline**: "Find the right university for your future."
- **Secondary Tagline**: "Accompanying you at every step of your educational roadmap."
- **Footer Credit**: "Built with care in India"
- **Copyright**: "© {year} ICTE Hub. All rights reserved."

### 1.2 Logo Usage
- The logo is a PNG image used across the header, footer, admin sidebar, owner dashboard, and login page.
- It is rendered via a reusable `IcteLogo` component that accepts a `size` prop (renders `<img>` tag with dynamic height).
- In the footer, the logo sits inside a white container with rounded corners and shadow for contrast against the dark background.
- **No text is rendered alongside the logo** — the logo image itself contains the brand text.

### 1.3 Favicon
- **Type**: Inline SVG data URI (embedded in `index.html`)
- **Design**: Blue rounded rectangle (`#1E40FF` fill, `rx=8`) with "ICTE" white bold text centered.
- **Note**: There is also a `favicon.svg` file in `client/public/` (9.5 KB) that appears unused in favor of the inline data URI.

---

## 2. Color Palette

### 2.1 Core Brand Colors

| Color | Hex | CSS Variable | Usage |
|---|---|---|---|
| **Primary Blue** | `#1E40FF` | `--color-academic-gold` | Primary buttons, active nav items, links, badges, accents |
| **Light Blue Background** | `#EEF2FF` | `--color-section-light` | Active state backgrounds, badge backgrounds, pill backgrounds |
| **Dark Text** | `#1A1A1A` | `--color-academic-navy` | Headlines, primary text |
| **Orange Accent** | `#FFA94D` | `--color-tag-accent` | Tag highlights, "100% Free" gradient text |
| **Page Background** | `#FFFFFF` | `--color-academic-bg` | Default page background |
| **Border** | `#E5E7EB` | `--color-academic-border` | Default borders |

> **Note**: The variable name `academic-gold` is misleading — it's actually the primary blue. This was a naming legacy; consider renaming in the redesign.

### 2.2 Extended Palette (Heavily Used from Utility Classes)

| Category | Colors Used |
|---|---|
| **Backgrounds** | `slate-50` (#F8FAFC), `slate-100`, `white`, `slate-900` (#0F172A) |
| **Text** | `slate-900`, `slate-800`, `slate-700`, `slate-600`, `slate-500`, `slate-400` |
| **Indigo Range** | `indigo-50`, `indigo-100`, `indigo-200`, `indigo-400`, `indigo-500`, `indigo-600`, `indigo-700` |
| **Cyan Range** | `cyan-100`, `cyan-400`, `cyan-500`, `cyan-600`, `cyan-700` |
| **Purple Range** | `purple-400`, `purple-500`, `purple-600`, `purple-700` |
| **Emerald Range** | `emerald-50`, `emerald-100`, `emerald-400`, `emerald-500`, `emerald-700` |
| **Amber/Orange** | `amber-100`, `amber-400`, `amber-500`, `orange-500` |
| **Red Range** | `red-50`, `red-100`, `red-200`, `red-500`, `red-600`, `red-700` |
| **Blue Range** | `blue-50`, `blue-200`, `blue-500`, `blue-700` |
| **Teal** | `teal-50`, `teal-200`, `teal-700` |

### 2.3 Gradient Patterns

| Gradient | From → To | Usage |
|---|---|---|
| **Primary CTA** | `indigo-600` → `purple-600` | Main action buttons |
| **Hero Text** | `indigo-600` → `cyan-500` | "University" gradient text in hero |
| **Search Button** | `cyan-500` → `blue-500` | Search submit button |
| **Star Badge** | `amber-400` → `orange-500` | "Top Recommendations" star icon background |
| **Free Tag** | `amber-400` → `orange-500` | "100% Free" text in CTA section |

### 2.4 Status Colors

| Status | Text | Background | Border |
|---|---|---|---|
| Inquiry Received (`new`) | `blue-700` | `blue-50` | `blue-200` |
| Contacted | `indigo-700` | `indigo-50` | `indigo-200` |
| Evaluation (`interested`) | `purple-700` | `purple-50` | `purple-200` |
| Closed (`not-interested`) | `slate-500` | `slate-50` | `slate-200` |
| Enrolled (college) | `emerald-700` | `emerald-50` | `emerald-200` |
| Directly Enrolled (institute) | `teal-700` | `teal-50` | `teal-200` |

---

## 3. Typography

### 3.1 Font Family
- **Primary (only font)**: **Inter** (Google Fonts)
- **Weights loaded**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Fallback stack**: `system-ui`, `-apple-system`, `sans-serif`
- **No serif or monospace fonts** are used anywhere.

### 3.2 Type Scale & Patterns

| Element | Size | Weight | Tracking | Case |
|---|---|---|---|---|
| **Hero H1** | `text-5xl` → `text-7xl` (responsive) | `font-extrabold` (800) | `tracking-tight` | Sentence case |
| **Section H2** | `text-3xl` → `text-4xl` | `font-extrabold` (800) | Default | Sentence case |
| **Card Title (H3)** | `text-xl` | `font-extrabold` (800) | Default | Sentence case |
| **Overline / Label** | `text-[10px]` | `font-extrabold` (800) | `tracking-widest` | `UPPERCASE` |
| **Body Text** | `text-sm` → `text-lg` | `font-medium` (500) / `font-semibold` (600) | Default | Sentence case |
| **Button Text** | `text-xs` | `font-bold` (700) | `tracking-wider` | `UPPERCASE` |
| **Badge / Tag** | `text-[10px]` → `text-[11px]` | `font-bold` (700) / `font-extrabold` (800) | `tracking-wider` / `tracking-widest` | `UPPERCASE` |
| **Nav Item** | `text-xs` | `font-bold` (700) | `tracking-wider` | `UPPERCASE` |

### 3.3 Text Color Hierarchy

1. **Primary**: `slate-900` / `#1A1A1A` — Headlines, card titles
2. **Secondary**: `slate-800` — Important body text
3. **Tertiary**: `slate-600` — Default body text, descriptions
4. **Muted**: `slate-500` → `slate-400` — Labels, overlines, meta info
5. **Accent**: `#1E40FF` (primary blue) — Links, active states
6. **On Dark**: `white` / `slate-200` → `slate-400` — Text on dark backgrounds

---

## 4. Spacing & Layout

### 4.1 Container & Max Width
- **Content max-width**: `max-w-[1800px]` (global) / `max-w-7xl` (header) / `max-w-5xl` (sub-nav, search bar)
- **Container padding**: `px-4 sm:px-6 lg:px-8` (header), `px-6` (content sections)

### 4.2 Grid System
- **College cards**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with `gap-8`
- **Course categories**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` with `gap-6`
- **Hero**: `grid-cols-1 lg:grid-cols-12` (7 + 5 split) with `gap-16`
- **CTA Section**: `grid-cols-1 lg:grid-cols-12` (6 + 6 split) with `gap-16`

### 4.3 Section Spacing
- Sections use `py-24 lg:py-32` for vertical padding.
- Inter-element spacing: `mb-6` → `mb-16` depending on context.

---

## 5. Component Design Patterns

> Not exhaustive component specs, but the **design language** and **patterns** used.

### 5.1 Cards

**General Card Style**:
- `bg-white/90 backdrop-blur-xl rounded-[2rem]`
- `border border-slate-100`
- `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
- Hover: `shadow-[0_20px_40px_rgb(0,0,0,0.08)]`, `hover:-translate-y-2`
- Transition: `transition-all duration-300`

**College Card Specifics**:
- Top colored border strip: `h-1.5 w-full bg-gradient-to-r` (cyan for online, indigo for offline)
- Logo or initials avatar (`w-14 h-14 rounded-2xl`)
- Mode badge (pill: `rounded-full text-[10px] uppercase`)
- Courses shown as tags (`bg-slate-100 text-slate-600 rounded-lg`)
- Expandable course list ("Show more" / "Show less")
- CTA button at bottom: `bg-slate-900 hover:bg-indigo-600 rounded-xl`

**Glass Card** (Hero, Search):
- `bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[2rem]`
- Sometimes with background rotation effect: `transform rotate-3 scale-105`

### 5.2 Buttons

| Variant | Style |
|---|---|
| **Primary CTA** | `bg-gradient-to-r from-indigo-600 to-purple-600`, white text, `rounded-xl`, `shadow-xl shadow-indigo-500/30`, shimmer effect on hover |
| **Secondary CTA** | `bg-white/80 backdrop-blur-md border border-slate-200`, `text-slate-700`, `rounded-xl` |
| **Dark CTA** | `bg-slate-900 hover:bg-[#1E40FF]`, white text, `rounded-xl` |
| **Nav Button (active)** | `text-[#1E40FF] bg-[#EEF2FF]`, `rounded-lg` |
| **Nav Button (default)** | `text-slate-500 hover:text-slate-900 hover:bg-slate-100` |
| **Danger** | `text-red-500 hover:text-red-700 hover:bg-red-50` |
| **Filter Toggle (active)** | `bg-slate-900 text-white` or `bg-cyan-500 text-white` or `bg-indigo-500 text-white` |
| **Filter Toggle (inactive)** | `bg-slate-100 text-slate-600 hover:bg-slate-200` |

All buttons use: `text-xs font-bold uppercase tracking-wider`, `cursor-pointer`, transitions.

### 5.3 Form Inputs

- **Background**: `bg-slate-50` (light) or `bg-white/5` → `bg-white/10` (dark theme)
- **Border**: `border border-slate-200` (light) or `border border-white/10` → `border-white/20` (dark)
- **Border Radius**: `rounded-xl`
- **Focus**: `focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15` (light) or `focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20` (dark)
- **Text**: `text-sm text-slate-800 font-semibold` (light) or `text-white font-semibold` (dark)
- **Label**: `text-[10px] font-extrabold uppercase tracking-widest text-slate-400`
- **Left icon**: `absolute left-4 top-1/2 -translate-y-1/2 text-slate-400`
- **Padding**: `pl-11 pr-4 py-3` (with icon) or `px-4 py-3` (without)

### 5.4 Badges & Tags

- **Status Badge**: `inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border`
- **Mode Badge**: Same pattern, colored per mode (cyan for online, indigo for offline)
- **Course Tag**: `bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200`
- **Overline Badge**: `text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full`

### 5.5 Modals

- Inquiry forms open as modal overlays.
- Dark backdrop with blur effect.
- Content card with `rounded-[2rem]` styling.

### 5.6 Alerts / Messages

- **Error**: `bg-red-50 border border-red-200 text-red-700 rounded-xl p-4`
- **Success**: `bg-emerald-50 border border-emerald-100` with check icon
- **Warning**: `bg-amber-50 border border-amber-200` with pulse icon

---

## 6. Animation & Motion

### 6.1 CSS Animations (Defined in `index.css`)

#### Blob Animation
- **Name**: `blob`
- **Duration**: 15s, infinite, alternate
- **Keyframes**: Translates and scales between 3 states (0%, 33%, 66%, 100%)
- **Purpose**: Background decorative floating blobs
- **Delays**: `.animation-delay-2000` (2s), `.animation-delay-4000` (4s)

#### Shimmer Animation
- **Name**: `shimmer`
- **Duration**: 1.5s, infinite
- **Keyframes**: `translateX(100%)` — a gradient sweep across button surfaces
- **Purpose**: CTA button hover shimmer effect

### 6.2 Transition Patterns

| Pattern | CSS | Usage |
|---|---|---|
| **Card hover lift** | `hover:-translate-y-2 transition-all duration-300` | Cards, category tiles |
| **Button hover lift** | `hover:-translate-y-1` or `hover:-translate-y-0.5` | Buttons |
| **Logo rotate** | `group-hover:rotate-6 transition-transform` | College card logos |
| **Arrow slide** | `group-hover:translate-x-1 transition-transform` | Arrow icons on buttons |
| **Scale bounce** | `group-hover:scale-110 transition-transform` | Category icons |
| **Fade in** | `animate-in fade-in` | Content appearance |
| **Slide in** | `slide-in-from-bottom-4/6/8/10` | Staggered hero elements |
| **Pulse** | `animate-pulse` | Hot leads flame icon, loading skeletons |
| **Spin** | `animate-spin` | Loading spinners |

### 6.3 Loading States (Next.js 15 App Router)

- **Skeleton Loaders (`loading.tsx`)**: Use Next.js 15 `loading.tsx` files or explicit `<Suspense fallback={<Skeleton />}>` boundaries for asynchronous Server Components. Skeleton components should use `animate-pulse` with slate-200 background blocks to match the card shapes.
- **Spinner**: `Loader2` (Lucide React) icon with `animate-spin`.
- **Content Shimmer**: Gradient sweep on loading content areas.
- **Server Action Pending State**: Use React 19's `useActionState` (or `useFormStatus`) hooks to show pending states on UI buttons (e.g., disabling the submit button and showing a spinner) while Server Actions are executing.

---

## 7. Layout Patterns

### 7.1 Header (Public Pages)

- **Position**: `sticky top-0 z-40`
- **Height**: `h-16`
- **Style**: `bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)]`
- **Desktop**: Logo left, nav links center/right, login button far right
- **Mobile**: Logo left, hamburger right → slide-in drawer from left

### 7.2 Mobile Navigation Drawer

- **Width**: `w-72`
- **Style**: `bg-white border-r border-slate-200/80`, slides from left with `transform transition-transform duration-300`
- **Backdrop**: `bg-black/40 backdrop-blur-sm`
- **Content**: Logo + close button header → nav links stacked vertically

### 7.3 Admin / Owner Sidebar

- **Width**: `w-60`
- **Position**: Fixed left sidebar on desktop, slide-in drawer on mobile
- **Style**: `bg-white border-r border-slate-200/80`
- **Desktop**: Always visible, content area has `md:ml-60`
- **Mobile**: Top header with logo + role badge (e.g., "Admin" / "Owner") + hamburger, sidebar slides in
- **Owner sidebar** includes additional nav items: Audit Logs, Admin Management

### 7.4 Footer

- **Style**: `bg-[#0A0A0A] border-t border-slate-900`
- **Layout**: 5-column grid on desktop (logo + tagline span 2, then quick links, partners, legal)
- **Contact Row**: Phone, email, location with icons
- **Bottom Bar**: Copyright left, "Built with care in India" right
- **Text**: `text-slate-400` → `text-slate-500` → `text-slate-600`

### 7.5 Sticky Sub-Navigation (Homepage)

- **Position**: `sticky top-16 z-30` (below main header)
- **Trigger**: Appears when hero section scrolls out of viewport (IntersectionObserver)
- **Active highlighting**: Current visible section is highlighted using IntersectionObserver
- **Style**: `bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm`

---

## 8. Backgrounds & Decorative Elements

### 8.1 Mesh Gradient Blobs

Used on: Hero section, Login page, College Browse page.

- Three large semi-transparent circles with `mix-blend-multiply filter blur-[100px]`
- Colors: `indigo-400/20`, `cyan-400/20`, `purple-400/20` (hero) / `indigo-500/20`, `purple-500/20`, `pink-500/20` (login)
- Animated with the `blob` keyframes
- Contained in `overflow-hidden` wrapper

### 8.2 Dot Grid Pattern

Used on: Search bar section, CTA section (dark backgrounds).

```svg
<pattern width="20" height="20">
  <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
</pattern>
```
- Applied at `opacity-10` with `mix-blend-screen`
- Creates a subtle repeating dot grid texture

### 8.3 Glow Effects

- **Card glow**: `bg-gradient-to-br from-{color}-400/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl` positioned behind card
- **Section glow**: Large semi-transparent circles with `blur-[100px]` floating behind content

---

## 9. Responsive Breakpoints

| Breakpoint | Prefix | Usage |
|---|---|---|
| Default | — | Mobile-first base styles |
| `640px` | `sm:` | Small tablets, wider phones |
| `768px` | `md:` | Tablets, hamburger → desktop nav switch |
| `1024px` | `lg:` | Desktop, multi-column layouts |
| `1280px` | `xl:` | Wide desktop, 4-column grids |

---

## 10. Iconography

- **Icon Library**: Lucide React (line icons)
- **Style**: Outline/line style only, never filled.
- **Default Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 28px, 32px, 36px, 40px
- **Color**: Inherits from text color or explicitly set (commonly `text-slate-400`, `text-indigo-500`, `text-[#1E40FF]`)

### Icons Used Across the Platform

| Icon | Usage |
|---|---|
| `GraduationCap` | Courses count, institute course card icon, sidebar nav |
| `Briefcase` | BBA category |
| `Calculator` | BCom category |
| `Award` | Status update section, MBA category |
| `Check` | Success states, benefit checkmarks |
| `Send` | Form submit sections, submit buttons |
| `BookOpen` | University count stat, interested colleges label |
| `ArrowRight` | "View all" links, card CTAs |
| `Search` | Search inputs |
| `Atom` | BSc category |
| `User` | Contact section, name input, profile nav, sidebar |
| `MonitorPlay` | Online mode indicators, BCA category |
| `MapPin` | Location/Offline indicators |
| `Clock` | Duration labels |
| `Calendar` | Date labels |
| `Menu` / `X` | Hamburger menu toggle |
| `Lock` / `Mail` / `Shield` | Login form |
| `Loader2` | Loading spinners |
| `Phone` | Phone input, footer contact |
| `Mail` | Email input, footer contact |
| `Building2` | College management |
| `DollarSign` | Commissions |
| `UserCog` | Team management |
| `Flame` | Hot leads (with `animate-pulse`) |
| `Handshake` | Partner inquiries |
| `LogOut` | Logout button |
| `Users` | Leads nav items |
| `Layers` | Browse page badge |
| `Grid` | Total colleges stat card |
| `Inbox` | Empty state |
| `AlertTriangle` | Error state |
| `AlertCircle` | Error messages |
| `RotateCw` | Retry button |
| `Info` | No results info |
| `Globe` | Online campus label |
| `CheckCircle` | Partner form success |
| `FileText` | Message textarea |
| `Crown` / `ShieldCheck` | Owner role badge / indicator (new) |
| `ScrollText` / `History` | Audit log pages (new) |
| `KeyRound` | Password reset / change (new) |

---

## 11. Scrollbar Styling

### Hidden Scrollbar
```css
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```
Used on: Sub-navigation horizontal scroll on mobile.

### Custom Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
```
Used on: College checkbox lists in forms.

---

## 12. Dark Theme Patterns

The site does **not** have a full dark mode, but uses dark-themed sections:

### Dark Sections
| Section | Background | Text |
|---|---|---|
| **Smart Search Bar** | `bg-slate-900` | `text-white`, inputs `bg-white/10 border-white/20` |
| **CTA / Contact** | `bg-slate-900` | `text-white`, form `bg-white/10 backdrop-blur-xl border-white/20` |
| **Footer** | `bg-[#0A0A0A]` | `text-slate-400` → `text-slate-600` |
| **Login Page** | `bg-slate-50` background + glass card | N/A (light card on light bg with animated mesh) |

---

## 13. Design Tokens Summary (Quick Reference)

```
Brand Blue:       #1E40FF
Light Blue BG:    #EEF2FF
Dark Text:        #1A1A1A
Orange Accent:    #FFA94D
Page BG:          #FFFFFF
Border:           #E5E7EB
Footer BG:        #0A0A0A
Dark Section BG:  slate-900 (#0F172A)

Font:             Inter (300–800)
Border Radius:    rounded-xl (inputs, buttons) / rounded-[2rem] (cards) / rounded-full (badges)
Shadow Light:     shadow-[0_8px_30px_rgb(0,0,0,0.04)]
Shadow Hover:     shadow-[0_20px_40px_rgb(0,0,0,0.08)]
Backdrop Blur:    backdrop-blur-2xl / backdrop-blur-xl / backdrop-blur-md
```

---

## 14. Asset & Image Optimization Guidelines

To ensure the platform feels fast and snappy while operating on free-tier hosting limitations, all images must be strictly optimized at the time of upload, before they are served to the frontend UI.

### 14.1 Profile Pictures (High Compression)
- **Role**: Used internally for small avatars (sidebar, audit logs, team list).
- **Format**: `WebP` (forced conversion on upload).
- **Dimensions**: Resize to max `200x200` pixels.
- **Compression**: Aggressive (e.g., 60-70% quality).
- **Why**: These are small UI elements where slight quality loss is invisible to the user, maximizing storage efficiency.

### 14.2 College Logos (High Quality)
- **Role**: Used in the public catalog and college cards. These represent partner brands.
- **Format**: `WebP` (forced conversion on upload).
- **Dimensions**: Resize to max `400x400` pixels.
- **Compression**: Light (e.g., 85-95% quality).
- **Why**: "Low reduce in size, high maintain in quality." We want smaller file sizes (WebP) but we **must** maintain crisp edges and true colors so partner logos do not look pixelated or blurry in the UI.

### 14.3 General Static Assets
- SVGs should be used for UI icons and the site Favicon (inline or cached).
- Any decorative images (if added later) must also follow the `WebP` conversion rule.
