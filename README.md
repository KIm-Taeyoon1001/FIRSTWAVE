# FIRSTWAVE

FIRSTWAVE is a desktop-first beta testing marketplace for makers and testers. The Next.js App Router application uses Supabase Auth, Postgres, Row Level Security, and Storage. No production usage figures or sample customers are hardcoded. The hero dashboard is explicitly marked as a design preview.

## Cloudflare Pages static deployment

The deployable static site is committed in `site/`. In Cloudflare Pages, connect this GitHub repository, select the **None** framework preset, leave the build command empty, and set the build output directory to `site`. To regenerate it after editing the source, run `npm run build:static` and commit the updated `site/` files. Pages serves these committed files; adding a Pages environment variable alone does not update them with the build command blank.

The `site/` deployment includes Explore, How It Works, Pricing, a developer introduction at `/developers/`, and an interactive workspace. With no Supabase public key configured, `/login/` and `/dashboard/` use a **local demo**. Use `demo@firstwave.app` / `Firstwave123!` to enter. This is a public preview credential, not a real account. Demo projects and the demo login flag are stored only in the current browser. Do not enter private information in the demo.

The static site also has an English/Korean language toggle and a `/community/` page. The community reads and writes through Supabase browser APIs protected by migration 006 RLS. Set the Supabase public key before expecting shared posts and replies; with no key, the page explains that community sign-in is unavailable. It never substitutes fabricated community posts.

The FIRSTWAVE Test Exchange is the core community interaction: makers can post focused testing requests, testers can offer their device and testing perspective, and either can filter posts by role or request type. Quick-start buttons prepare a structured request/offer template. This keeps discussions tied to actual product validation rather than a general-purpose social feed.

To enable real email login, registration, Google sign-in, and password recovery on the static Pages deployment:

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in local `.env.local` or the build environment. A legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works. Use **only** a publishable or anon key. The builder rejects other key types. Public keys are embedded in `site/auth-config.js`; they are visible to every visitor.
2. In Supabase Auth, enable email sign-in. Set the Site URL to the deployed Pages origin. Add `https://<your-pages-domain>/dashboard/` and `https://<your-pages-domain>/reset-password/` to the Auth redirect allowlist. For local static testing, also allowlist `http://127.0.0.1:3000/dashboard/` and `http://127.0.0.1:3000/reset-password/`. Configure the Google provider in Supabase if Google login is desired.
3. Run `npm run build:static` and commit the updated `site/` files. Push to the connected GitHub branch. Then test signup, email confirmation, login, Home navigation, logout, and password recovery on the deployed domain.

Real authentication on Pages identifies the user, but its workspace projects are still a **local preview** stored separately for each account in that browser. Shared projects, applications, moderation, feedback, and server-side authorization require deploying the Next.js app with its Supabase migrations.

## Local development

Requirements: Node.js 20.9 or newer, npm, and a Supabase project.

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. The project URL for the supplied Supabase project is `https://xxytpyxnxaiwgzglsyel.supabase.co`. The publishable key is available in the project's **Connect** dialog. A legacy anon key also works via `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never use the service role key in either public variable.
3. Apply `supabase/migrations/001_initial.sql` through `007_signup_preferences.sql` in numeric order to your Supabase database using the Supabase SQL editor or CLI. If migrations 001–006 are already installed, apply only 007.
4. In Supabase Auth, enable email sign-in and optionally Google. Add `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/callback?next=/reset-password`, and the corresponding production callback URLs to the redirect allowlist. Set `NEXT_PUBLIC_SITE_URL` to the exact app origin. The default confirmation email can use the PKCE `code` response; the callback also accepts `token_hash` links with `type=email` or `type=recovery` if you customize email templates. Password reset redirects to `/auth/callback?next=/reset-password`.
5. Run `npm run dev` and open `http://localhost:3000`.

The public pages render with an empty marketplace before Supabase is configured. Authenticated routes need the environment variables and applied migrations. New email signups can select testing interests and enter devices; migration 007 stores these in the profile as soon as Supabase creates the account. Google sign-in users can set the same preferences on their profile page.

## Search and advertising preparation

The Next.js Worker serves `/robots.txt` and `/sitemap.xml`. The sitemap includes only published projects. Set `NEXT_PUBLIC_SITE_URL` to the exact production origin in both build and runtime settings so canonical URLs and sitemap links use the deployed domain. Authenticated dashboard and admin pages are marked `noindex`.

Advertising is not enabled by default. After obtaining your own AdSense publisher ID and completing AdSense site review, set `ADSENSE_PUBLISHER_ID` in the Worker runtime environment to a value such as `pub-1234567890123456`. The Worker then serves the matching `/ads.txt`; without a valid ID, the endpoint returns 404. Add your own privacy and contact information and review applicable consent requirements before loading any advertising script. No ad code or publisher ID has been invented or activated.

If npm packages cannot be downloaded, run `npm run preview:static` for the dependency-free static site at `http://127.0.0.1:3000`. It serves the public pages and local dashboard. With a Supabase public key, the static site uses browser authentication; without one, it uses the local demo. It does not run the server-backed marketplace.

## Routes

Public: `/`, `/developers`, `/explore`, `/projects/[slug]`, `/how-it-works`, `/pricing`, `/community`, `/login`, `/signup`, `/resend-confirmation`, `/forgot-password`, `/reset-password`, `/suspended`.

Signed in: `/dashboard`, `/dashboard/projects`, `/dashboard/projects/new`, `/dashboard/projects/[id]`, `/dashboard/applications`, `/dashboard/feedback`, `/dashboard/analytics`, `/dashboard/community`, `/dashboard/notifications`, `/dashboard/profile`, `/dashboard/settings`.

Admin: `/admin`, `/admin/projects`, `/admin/users`, `/admin/reports`, `/admin/audit`.

One account can both publish projects and test other projects. Admin access is determined by `public.users.is_admin`; grant it manually to a trusted account in the Supabase SQL editor after signup. Never expose the service role key in Next.js public environment variables.

## Workflow and security

- Makers create a draft, upload assets, and submit it for moderation. An admin approves or rejects the project. Edits to published content send it back to review.
- Testers apply to published, open campaigns. Makers approve or reject applications. The Postgres `approve_application` function locks the project row before counting members and inserting a selected tester, preventing concurrent approvals beyond capacity.
- Only selected members can submit feedback. A feedback submission marks the matching approved application completed.
- The authenticated community supports maker and tester discussions, product showcases, testing requests, replies, and owner-only edits with RLS.
- RLS protects project ownership, application details, feedback, admin records, and storage writes. Privileged actions check identity on the server and in the database.
- Maker moderation fields are locked at the database layer, answered feedback questions remain stable, and the public maker view exposes only the profile fields needed on a project page.
- Public project availability uses a safe aggregate function without exposing private applicant records.

## Validation

Run `npm run build:static`, `npm run test:static`, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` after installing dependencies. The database test checks all six migrations, recruitment capacity, private row visibility, moderation field integrity, required feedback questions, answer integrity, notifications, selected tester feedback, and paused campaign behavior. Test the following browser flows with separate maker, tester, and admin accounts:

1. Maker draft → submit review → admin approval → public Explore.
2. Tester application → maker approval → tester feedback → maker analytics.
3. Try access to another maker's draft, another tester's application, and admin routes as a normal account.
4. Approve applications concurrently at the final available position; only one should succeed.

## Deployment

The server-backed marketplace is configured for Cloudflare Workers through OpenNext. Connect this repository to Workers Builds, leave the Build command blank, and set the Deploy command to `npm run deploy`. That script builds the Next.js app with OpenNext and deploys the generated Worker. The Worker name in Cloudflare must match `firstwave` in `wrangler.jsonc`.

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` in both Workers Builds variables and Worker runtime variables. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin, such as `https://firstwave.kty10010.workers.dev`. Apply all seven SQL migrations to Supabase. In Supabase Auth URL Configuration, set the Site URL to the Worker origin and allowlist `<origin>/auth/callback` and `<origin>/auth/callback?next=%2Freset-password`. Google OAuth requires the Supabase callback URL in Google Cloud Console. The Cloudflare Pages `site/` build remains a separate static preview and does not run server actions.

## Current scope

The static Pages deployment supports public pages, optional Supabase browser authentication, and local preview projects. The Next.js Worker source includes the marketplace, project, application, feedback, notification, analytics, moderation, community, and email confirmation recovery flows. Live authentication, email delivery, end-to-end browser checks, and a full production security review still require verification against the configured Supabase project and deployed Worker.
