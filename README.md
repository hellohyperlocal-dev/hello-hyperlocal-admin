# Hello Linden — Admin Dashboard

Admin/back-office web app for "Hello Linden," used by JC's team alongside the
Expo mobile app (`../hello-hyperlocal-rebuild`). Same Supabase project, no
second database. See `../hello-hyperlocal-rebuild/ADMIN_DASHBOARD_BUILD_HANDOVER.md`
and `admin-dashboard-plan.md` for full context and decisions.

**Phase 1 (this build):** auth, JC's admin bootstrap, and the Ward Councillor
invite flow. Admin team management, content moderation, users, businesses, and
analytics are later phases — not built yet.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same values the
  mobile app uses (Supabase Dashboard → Project Settings → API).
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only secret.** Never prefix with
  `NEXT_PUBLIC_`, never import into a client component, never commit it. Used
  in Server Actions to read/write `invites`, `reports`, and `admin_activity_log`
  (all have zero public RLS policies by design) and to write audit log rows.
- `NEXT_PUBLIC_MOBILE_APP_SCHEME` — the mobile app's deep-link scheme
  (`hello-hyperlocal`, from its `app.json`). Invite links are built as
  `<scheme>://invite/<token>`. The mobile app doesn't have an invite-consumption
  screen yet, so this link doesn't do anything on the phone yet — it's just the
  copyable value the admin shares with the councillor.

```bash
npm run dev
```

## Bootstrapping the first admin (JC)

There's no admin account yet, so the very first one has to be created by hand:

1. JC opens the login page and clicks "First admin? Create an account," signs
   up with email + password.
2. If Supabase's email confirmation is enabled on this project, JC needs to
   confirm via the email link before signing in.
3. Once signed in (or confirmed), run this once in the Supabase SQL Editor,
   using JC's actual `auth.users` id or email:

   ```sql
   update profiles set role = 'admin' where id = '<jc-auth-user-id>';
   -- or, by email:
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'jc@example.com');
   ```

   This has to be done via the SQL Editor (or another service-role context) —
   the `0002_profiles_role_guard.sql` trigger deliberately blocks a user from
   promoting their own role through the app.
4. JC signs in again — the dashboard now loads.

Every other admin after JC goes through the same invite-link mechanism as
councillors (`role: 'admin'` invites) — not this sign-up form. That screen is
Phase 2, not built yet.

## Architecture notes

- Two Supabase clients, used deliberately differently:
  - `src/lib/supabase/client.ts` / `server.ts` — anon-key clients for the login
    flow and reading the signed-in session. Respects RLS.
  - `src/lib/supabase/admin.ts` — service-role client, server-only
    (`import "server-only"` makes using it from a client component a build
    error, not just a lint warning). Used inside Server Actions for anything
    RLS deliberately blocks the anon key from: `invites`, `reports`,
    `admin_activity_log`.
- `src/lib/auth.ts`'s `requireAdmin()` is the admin gate — call it at the top
  of every protected page/layout. Redirects to `/login` if unauthenticated, or
  `/access-denied` (after signing out) if authenticated but not `role='admin'`.
- `src/lib/email.ts`'s `sendInviteEmail()` is the single seam for invite email
  delivery. No Resend account exists yet, so it just logs for now — the invite
  link is also returned to the UI for the admin to copy manually. Dropping in
  Resend later should only require editing this one file.
- Styling: shadcn/ui (Nova preset — Lucide icons, Geist Sans/Mono), themed to
  `../hello-hyperlocal-rebuild/design.md`'s exact tokens in `src/app/globals.css`
  (colors, radii) and `src/components/ui/button.tsx` (pill radius on all
  buttons, per `design.md`'s `rounded.pill` spec).

## Deploy

Deploy on [Vercel](https://vercel.com/new). Set the same three env vars above
in the Vercel project's Environment Variables — `SUPABASE_SERVICE_ROLE_KEY`
must be added there too but **never** exposed to the browser (Vercel env vars
without `NEXT_PUBLIC_` stay server-only by default, which is what we want).
