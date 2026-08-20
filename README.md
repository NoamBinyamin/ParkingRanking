# ParkPoints

A gamified parking tracker. Users report which zone they parked in, earn (or lose) points, and
compete on a monthly leaderboard — built with Next.js (App Router), Tailwind CSS v4, and Supabase.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + TypeScript
- **Tailwind CSS v4** with a custom "cartoon game" theme (`app/globals.css`)
- **Hebrew UI, RTL layout** (`dir="rtl"` on `<html>`) using the Suez One + Rubik fonts, which
  (unlike the original Fredoka/Nunito pairing) support Hebrew glyphs
- **Supabase** (Postgres + Auth + Row Level Security) for data and auth
- **Zustand** for the small bit of client-side state (live score pill)
- **Framer Motion** + **canvas-confetti** for the bouncy, game-like feel

## Folder structure

```
app/
  (auth)/login/page.tsx      Login / Sign-up screen
  (app)/layout.tsx           Auth-gated shell: header + bottom tab bar
  (app)/report/page.tsx      Report/Park screen (server-fetches zones)
  (app)/report/actions.ts    Server Action: submitParkingReport
  (app)/leaderboard/page.tsx Summary & Leaderboard screen
  layout.tsx, globals.css    Root layout, fonts, cartoon theme tokens
  page.tsx                   "/" -> redirects to /report or /login
middleware.ts                 Refreshes Supabase session, guards routes

components/
  ui/                        Button, Card, PointsBadge (dumb, reusable)
  layout/AppShell.tsx         Header + bottom nav, hydrates the user store
  auth/AuthForm.tsx           Login/Sign-up form
  report/                     ZoneGrid, ZoneCard, ReportConfirmation, ReportScreen
  leaderboard/                LeaderboardList/Row, ZoneHeatmap, LeaderboardScreen

lib/
  supabase/client.ts          Browser Supabase client
  supabase/server.ts          Server Supabase client (cookie-bound)
  services/                   Pure data-access functions (auth, zones, reports,
                               profile, leaderboard) - no React, easy to test/reuse
  stores/useUserStore.ts      Zustand store for the live score pill
  utils/                      points.ts, time.ts, cn.ts - small vanilla helpers
  types/database.ts           Shared TS types mirroring the DB schema

supabase/schema.sql            Full DB schema: tables, triggers, RLS, seed data
```

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates the
   `profiles` / `zones` / `reports` tables, the scoring triggers, RLS policies, the
   `get_monthly_leaderboard` / `get_zone_hourly_stats` aggregate functions, and seeds six
   starter zones (ג'וקר, כצנלסון א'/ב', סירקין א'/ב', סחלה). If your project already ran an
   earlier version of the schema, run [`supabase/migrations/002_hebrew_zones.sql`](supabase/migrations/002_hebrew_zones.sql)
   instead — it adds the `description` column and replaces the old zone list.
3. In **Authentication → Providers → Email**, turn **off** "Confirm email". This app only
   collects a username + password; `lib/services/auth.ts` synthesizes a `username@parkpoints.app`
   address behind the scenes so Supabase Auth (which requires an email) still works, and those
   addresses can't receive a real confirmation link.
4. Copy `.env.local.example` to `.env.local` and fill in your project's URL + anon key
   (Project Settings → API).
5. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on Login, then Report, then
Leaderboard.

## Data model

- **profiles** — `id` (= Supabase auth user id), `username`, `avatar_emoji`, `total_score`.
  No `password_hash` column: Supabase Auth owns credentials, `profiles.id` is the auth provider id.
- **zones** — `name`, `point_value` (positive or negative), `color`, `icon`, `description`
  (shown as flavor text in the Report screen's win/lose popup).
- **reports** — `user_id`, `zone_id`, `points_awarded` (snapshotted at insert time), `created_at`.

Two Postgres triggers do the bookkeeping automatically: one snapshots a zone's current
`point_value` onto each new report, and another adds that amount onto the reporter's
`profiles.total_score`. Nothing in the app layer computes totals by hand.

## Extending

- **Add a zone**: insert a row into `zones` — it shows up in the Report grid immediately.
- **Change the theme**: edit the `@theme` block in `app/globals.css` (Tailwind v4 CSS-first config).
- **Add a data source**: add a function to `lib/services/`, keep it framework-agnostic (it just
  takes a Supabase client and returns typed data) so it's reusable from Server Components,
  Server Actions, or client code.
