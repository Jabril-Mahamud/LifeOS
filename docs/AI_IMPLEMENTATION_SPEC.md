### LifeOS — AI Implementation Spec (Redesign + UX Improvements)

This document specifies exactly what to build, where to build it, and how to verify it. Keep implementation incremental; ensure a green build after each task.

### Context
- Stack: Next.js 15 (App Router, RSC), React 19, TypeScript, Tailwind, shadcn/ui
- Auth: Clerk
- ORM/DB: Prisma + PostgreSQL (Neon)
- PWA: Workbox service worker, rich manifest, install prompt
- Key code refs:
  - Layout: `app/layout.tsx`
  - Nav: `components/layout/main-header.tsx`
  - Dashboard: `app/dashboard/page.tsx`
  - Habits UI: `components/habits/*`
  - Tasks UI: `components/tasks/task-list.tsx`
  - APIs: `app/api/**/*`
  - Models: `prisma/schema.prisma`

### High-level goals
1) Navigation and IA: Improve discoverability and mobile ergonomics
2) Dashboard: Promote “today” actions and embed habit insights
3) Mobile: Add bottom tab bar
4) Data safety/validation: Introduce Zod schemas in APIs
5) Fill gap: Add basic Pomodoro page (already protected by middleware)
6) Metadata/domain hygiene

---

## 1) Navigation & Information Architecture

#### Desktop sidebar + unified “Create”
- Create `components/layout/sidebar.tsx` with a persistent left sidebar on ≥lg screens.
- Items (icons from lucide-react):
  - Dashboard (`/dashboard`) BarChart3
  - Journal (`/journal`) FileEdit
  - Habits (`/habits`) CheckCircle2
  - Projects (`/projects`) LayoutGrid
  - Tasks (`/tasks`) ListTodo
- Place a floating “Create” button (Plus) top-right in content area, surfacing actions:
  - New Journal (`/journal/new`)
  - New Habit (`/habits/new`)
  - New Project (`/projects/new`)
  - New Task (`/tasks/new`)

Edits
- Update `app/layout.tsx` to render the sidebar on desktop and a placeholder container for mobile tab bar (see section 2). Keep `MainHeader`, but reduce dropdowns (see below).
- Edit `components/layout/main-header.tsx`:
  - Remove both large dropdowns. Keep logo, theme toggle, auth controls.
  - Add a small “Create” button that triggers the same menu as the floating create.

Acceptance criteria
- Desktop: Sidebar visible ≥lg; header has no bulky dropdowns; create menu accessible from header and floating action; routes highlight properly based on `usePathname()`.
- Mobile (≤lg): Sidebar hidden; no regression in header features.

Files to add
- `components/layout/sidebar.tsx`

Files to edit
- `app/layout.tsx`
- `components/layout/main-header.tsx`

---

## 2) Mobile Bottom Tab Bar

Create `components/layout/mobile-tabbar.tsx` rendered only on <lg screens with 5 tabs: Dashboard, Journal, Habits, Projects, Tasks. Use big hit targets. Active tab highlights via pathname.

Integration
- In `app/layout.tsx`, render `<MobileTabBar />` at the bottom on small screens, above `<Footer />`.

Acceptance criteria
- On mobile, persistent bottom tabs navigate between the five areas; header remains minimal; content area accounts for tab bar height (no content overlap).

Files to add
- `components/layout/mobile-tabbar.tsx`

Files to edit
- `app/layout.tsx`

---

## 3) Dashboard: Quick Add + Habit Insights

Add quick actions and embed habit visualizations.

Files to add
- `components/quick-add.tsx`

Implementation
- `components/quick-add.tsx`: A small card with 3 buttons: New Journal, New Task, New Habit. Clicks route using `next/navigation`.
- Edit `app/dashboard/page.tsx`:
  - Render `<QuickAdd />` at the top-right.
  - Embed `HabitHeatmapCalendar` and `HabitConsistencyChart` below the existing summary cards. Use data already fetched from `/api/dashboard` (fields `habits`, `journal.heatmap` as needed). If data insufficient, display existing empty states.

Acceptance criteria
- Dashboard loads without console errors; quick actions navigate correctly; charts render when habit data exists, otherwise show friendly empty states.

Files to edit
- `app/dashboard/page.tsx`

---

## 4) API Validation with Zod

Add input schemas and consistent error responses for create/update endpoints.

Files to add
- `lib/validation/habits.ts`
- `lib/validation/journal.ts`
- `lib/validation/tasks.ts`
- `lib/validation/projects.ts`

Schema examples (keep names, can adjust messages):
```ts
// lib/validation/habits.ts
import { z } from "zod";
export const createHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(500).optional(),
  icon: z.string().max(8).optional(),
  color: z.string().max(30).optional(),
});
export const updateHabitSchema = createHabitSchema.partial().extend({ active: z.boolean().optional() });
```

Edits
- `app/api/habits/route.ts` (POST): parse body with `createHabitSchema.safeParse`. On failure, return `{ error: "VALIDATION_ERROR", issues }` with 400.
- `app/api/habits/[id]/route.ts` (PATCH): use `updateHabitSchema` similarly.
- Apply similar patterns to journal/projects/tasks endpoints if modified in this scope. Keep error shape consistent.

Acceptance criteria
- Invalid inputs return 400 with `{ error: "VALIDATION_ERROR", issues: [...] }`.
- Valid inputs behavior unchanged.

---

## 5) Pomodoro Page (baseline)

Add a minimal, accessible Pomodoro timer page since it’s protected in middleware.

Files to add
- `app/pomodoro/page.tsx`

Requirements
- Basic work/break durations with start/pause/reset.
- Store session state in `localStorage` to persist across reloads.
- Optional: Notifications if permission granted.

Acceptance criteria
- Page renders under auth; timer works and persists; no API dependencies.

---

## 6) Metadata & Domain Hygiene

Edits
- `app/layout.tsx`: replace `metadataBase` with env-based URL.
  - Add `NEXT_PUBLIC_APP_URL` in `.env.local`.
  - Update: `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")`.

Acceptance criteria
- Local dev: no crash if env not set.
- Production: set proper Vercel URL via env; OG tags still work.

---

## 7) Accessibility & Visual Consistency

Tasks
- Ensure all interactive elements in new components have keyboard focus, `aria-label`s where text not visible, and visible focus rings.
- Standardize spacing and font sizes across new cards/menus to match existing shadcn/ui usage.

Acceptance criteria
- All new UI is keyboard navigable; color contrast ≥ WCAG AA for text.

---

## 8) Environmental & Build Notes

Environment
- `.env.local` example (do not commit secrets):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
  - `CLERK_SECRET_KEY=...`
  - `DATABASE_URL=...` (Neon in current setup)
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`

Build
- Keep existing scripts. Do not run `npm install` inside `build` locally; CI will ensure clean lockfile.

---

## Deliverables Checklist

- [x] `components/layout/sidebar.tsx` implemented and integrated on desktop
- [x] `components/layout/mobile-tabbar.tsx` implemented and integrated on mobile
- [x] `components/quick-add.tsx` added; wired into `app/dashboard/page.tsx`
- [x] Dashboard embeds `HabitHeatmapCalendar` and `HabitConsistencyChart` (with graceful empty states)
- [x] Zod validation added and wired in habits APIs (and any edited endpoints), with consistent error shape
- [x] `app/pomodoro/page.tsx` created with minimal timer
- [x] `app/layout.tsx` metadata uses `NEXT_PUBLIC_APP_URL`
- [ ] All new UI keyboard accessible and visually consistent
- [ ] `npm run build` and `npm run lint` pass locally

---

## Phase 2 — Validation coverage & UX polish

### 2.1 Extend validation to other APIs
- Add Zod schemas:
  - `lib/validation/journal.ts` (create/update journal)
  - `lib/validation/projects.ts` (create/update project)
  - `lib/validation/tasks.ts` (create/update task)
- Apply to:
  - `app/api/journal/route.ts`, `app/api/journal/[id]/route.ts`
  - `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`
  - `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`
- Error shape: `{ error: "VALIDATION_ERROR", issues }` with 400 on invalid.

Acceptance
- Invalid payloads return 400 with issues; valid flows unchanged.

### 2.2 Accessibility and mobile polish
- Add `aria-label`s to icon-only buttons and ensure focus rings on new components.
- Ensure dashboard container bottom padding accounts for mobile tab bar across pages.

Acceptance
- Keyboard navigation works for new buttons/menus; no content is obscured by the tab bar on mobile.

### 2.3 Quick visual cleanups
- Normalize card paddings and typography on the dashboard and Quick Add.
- Align icon sizes (h-4 w-4) in actions consistently.

Acceptance
- Visual spacing consistent with existing shadcn/ui patterns.

---

## Phase 3 — Tests & monitoring

### 3.1 Unit tests for analytics
- Add tests for streak/completion calculations used in habit components (pure functions where possible).

### 3.2 Integration tests for protected routes
- Add minimal tests that assert 401 without auth and 200 with auth on `/api/*` key endpoints.

### 3.3 Error logging improvements
- Standardize error responses and add minimal console logging contexts (endpoint + user ID) in catch blocks.

Acceptance
- Tests pass locally; consistent error shapes across endpoints.

---

## Acceptance Tests (Manual)

Navigation
- Desktop ≥1024px: Sidebar visible; clicking each item navigates. Create menu opens from header and floating action.
- Mobile ≤1023px: Bottom tabs visible and functional; no sidebar.

Dashboard
- Quick Add buttons route correctly.
- Habit charts render when data exists; empty states otherwise; no console errors.

API Validation
- POST `/api/habits` with empty `name` returns 400 with `VALIDATION_ERROR`.
- PATCH `/api/habits/:id` with invalid types returns 400 with `VALIDATION_ERROR`.

Pomodoro
- Timer starts/stops/resets; state persists across reloads; accessible buttons.

Metadata
- `metadataBase` resolves to env URL in prod; falls back locally without crash.

---

## Implementation Hints

- Use `usePathname()` to highlight active nav in sidebar and tab bar.
- Keep new components client-only (`"use client"`) if they rely on hooks.
- Re-use shadcn/ui: `Button`, `Card`, `Tabs`, `DropdownMenu`, `Sheet`.
- Follow existing Tailwind patterns; avoid unrelated refactors.
- Keep types explicit; avoid `any`.

---

## Out of Scope (for this pass)

- Team collaboration/multi-user org features
- Advanced analytics beyond what exists
- Data export/import
- Full i18n rollout

---

## Definition of Done

- All checklist items satisfied, acceptance tests pass, lint/build green, no runtime errors on core flows (auth, dashboard, journal, habits, projects, tasks, pomodoro), and navigation UX improved on desktop and mobile.

