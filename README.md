# FIRSTWAVE

FIRSTWAVE is a desktop-first beta testing marketplace for makers and testers. The Next.js App Router application uses Supabase Auth, Postgres, Row Level Security, and Storage. No production usage figures or sample customers are hardcoded. The hero dashboard is explicitly marked as a design preview.

## Cloudflare Pages static deployment

The deployable static marketing site is committed in `site/`. In Cloudflare Pages, connect this GitHub repository, select the **None** framework preset, leave the build command empty, and set the build output directory to `site`. No environment variables or server runtime are needed for this static site. To regenerate it after editing the source, run `npm run build:static` and commit the updated `site/` files.

The `site/` deployment includes Explore, How It Works, Pricing, a developer introduction at `/developers/`, and an interactive **local demo** at `/login/` and `/dashboard/`. Use `demo@firstwave.app` / `Firstwave123!` to enter. This is a public preview credential, not a real account. Demo projects are stored only in the current browser's `localStorage`; the login flag is stored in `sessionStorage`. Anyone can inspect the credential and local data. Do not enter private information in the demo. Real authentication, applications, moderation, feedback, and shared data require the Next.js app and Supabase setup below.

## Local development

Requirements: Node.js 20.9 or newer, npm, and a Supabase project.

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
3. Apply `supabase/migrations/001_initial.sql`, `002_hardening.sql`, `003_workflows.sql`, then `004_integrity.sql` to your Supabase database using the Supabase SQL editor or CLI.
4. In Supabase Auth, enable email sign-in and optionally Google. Add `http://localhost:3000/auth/callback` and the corresponding production callback URL to the redirect allowlist. Set `NEXT_PUBLIC_SITE_URL` to the exact app origin.
5. Run `npm run dev` and open `http://localhost:3000`.

The public pages render with an empty marketplace before Supabase is configured. Authenticated routes need the environment variables and applied migrations.

If npm packages cannot be downloaded, run `npm run preview:static` for the dependency-free static site at `http://127.0.0.1:3000`. It serves all public information pages, demo login, and the local dashboard. It does not run the server-backed marketplace or real authentication.

## Routes

Public: `/`, `/developers`, `/explore`, `/projects/[slug]`, `/how-it-works`, `/pricing`, `/login`, `/signup`.

Signed in: `/dashboard`, `/dashboard/projects`, `/dashboard/projects/new`, `/dashboard/projects/[id]`, `/dashboard/applications`, `/dashboard/feedback`, `/dashboard/analytics`, `/dashboard/notifications`, `/dashboard/profile`, `/dashboard/settings`.

Admin: `/admin`, `/admin/projects`, `/admin/users`, `/admin/reports`, `/admin/audit`.

One account can both publish projects and test other projects. Admin access is determined by `public.users.is_admin`; grant it manually to a trusted account in the Supabase SQL editor after signup. Never expose the service role key in Next.js public environment variables.

## Workflow and security

- Makers create a draft, upload assets, and submit it for moderation. An admin approves or rejects the project. Edits to published content send it back to review.
- Testers apply to published, open campaigns. Makers approve or reject applications. The Postgres `approve_application` function locks the project row before counting members and inserting a selected tester, preventing concurrent approvals beyond capacity.
- Only selected members can submit feedback. A feedback submission marks the matching approved application completed.
- RLS protects project ownership, application details, feedback, admin records, and storage writes. Privileged actions check identity on the server and in the database.
- Maker moderation fields are locked at the database layer, answered feedback questions remain stable, and the public maker view exposes only the profile fields needed on a project page.
- Public project availability uses a safe aggregate function without exposing private applicant records.

## Validation

Run `npm run build:static`, `npm run test:static`, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` after installing dependencies. The database test checks all four migrations, recruitment capacity, private row visibility, moderation field integrity, required feedback questions, notifications, selected tester feedback, and paused campaign behavior. Test the following browser flows with separate maker, tester, and admin accounts:

1. Maker draft → submit review → admin approval → public Explore.
2. Tester application → maker approval → tester feedback → maker analytics.
3. Try access to another maker's draft, another tester's application, and admin routes as a normal account.
4. Approve applications concurrently at the final available position; only one should succeed.

## Deployment

For the future server-backed Next.js app, deploy the repository to a platform that supports Next.js server actions, such as Vercel. Configure the same three environment variables for production, with `NEXT_PUBLIC_SITE_URL` set to the production origin. Apply all four migrations to the production Supabase project and allowlist `https://<your-domain>/auth/callback` in Supabase Auth. Configure Google credentials in Supabase only if Google login is desired. Confirm the database and storage policies before accepting users.

## Current scope

The static deployment supports browsing the landing page, trying the demo login, and creating/editing local demo projects. Its applications, feedback, and analytics surfaces show honest empty states. The Next.js source includes the marketplace, project, application, custom feedback question, notification, analytics, and moderation workflows. Real login, shared project data, tester participation, and admin actions are pending Supabase configuration and a server-capable deployment. Email delivery, end-to-end browser tests, and a full production security review remain. No live Supabase or Next.js deployment is included in this source tree.
