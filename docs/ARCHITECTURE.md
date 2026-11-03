# Architecture

## Overview

AuthApp is a static Vue 3 single-page application. All authentication is performed directly
against Supabase Auth from the browser using the publishable key. There is no custom backend,
no server-side session, and no database access yet.

```text
Browser
  |
  |  HTTPS (Supabase Auth API)
  v
Supabase Auth  <---- session JWT issued to the browser
  |
  |  (future) Row Level Security for tables
  v
Postgres

Build time:
GitHub Actions secrets -> Vite env -> bundled publishable key + URL -> GitHub Pages
```

## Runtime auth lifecycle

1. `src/main.ts` creates the app, installs Pinia, and resolves the auth store.
2. `auth.initialize()` calls `supabase.auth.getSession()`, which reads a persisted session
   from browser storage if one exists.
3. The store subscribes to `onAuthStateChange`; token refreshes and sign-out events update
   `session` in place.
4. Only after initialization does `main.ts` install the router and mount the app. This keeps
   the first navigation from racing the session lookup.
5. `router.beforeEach` checks `to.meta.requiresAuth`. Unauthenticated visitors to
   `/dashboard` are redirected to `/` with a `redirect` query parameter.
6. `LoginView.vue` validates the form and calls `auth.signIn(email, password)`, which calls
   `supabase.auth.signInWithPassword()`.
7. On success the store stores the session, and the view navigates to the requested redirect
   or `/dashboard`.
8. `DashboardView.vue` reads the session from the store and displays non-sensitive session
   details. Sign-out calls `auth.signOut()`, clears the session, and returns to `/`.

## State ownership

`src/stores/auth.ts` is the single source of truth for:

- `session` and derived `user`
- `isAuthenticated`
- `initialized` and `loading`
- `error` (user-facing message)
- `initialize`, `signIn`, `signOut`

Components must not call `supabase.auth` directly. This keeps error handling and session
updates consistent.

The Supabase client is a singleton in `src/lib/supabase.ts`. It reads
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at module load and refuses to start
without them. It also rejects a `sb_secret_` key defensively.

## Routing and GitHub Pages

- History mode: `createWebHistory(import.meta.env.BASE_URL)`.
- Dev base: `/`; production base: `/AuthApp/`.
- Routes: `/` (login), `/dashboard` (protected), catch-all redirect to `/`.
- GitHub Pages does not rewrite unknown paths. `scripts/postbuild.mjs` copies the built
  `index.html` to `404.html` and writes `.nojekyll`. A direct request to
  `/AuthApp/dashboard` receives the 404 document, which boots Vue Router with the original
  URL and renders the dashboard.
- The 404 response status is intentional and harmless for this demo. Do not replace the
  fallback with hash routing unless pretty URLs are abandoned.

## Build and deployment pipeline

```text
push to main
  -> deploy.yml
     -> npm ci
     -> lint, typecheck, test
     -> validate:env (fails if secrets are missing or a secret key is used)
     -> npm run build (Vite embeds VITE_SUPABASE_URL + publishable key)
     -> postbuild: dist/404.html + dist/.nojekyll
     -> actions/configure-pages
     -> actions/upload-pages-artifact
     -> actions/deploy-pages
  -> https://michielhbrand.github.io/AuthApp/
```

`ci.yml` runs on pull requests and pushes to `main`. It builds with placeholder values so
forks and untrusted PRs do not need secrets. The deploy workflow, which runs only from the
trusted `main` branch or a manual dispatch, uses the real repository secrets.

## Environment matrix

| Context                   | URL                      | Key source                        | Sign-ups                  |
| ------------------------- | ------------------------ | --------------------------------- | ------------------------- |
| Local dev, local Supabase | `http://127.0.0.1:54321` | `supabase status` publishable key | Disabled in `config.toml` |
| Local dev, cloud Supabase | Project URL              | Supabase Connect dialog           | Disabled in dashboard     |
| CI build                  | Placeholder              | Workflow placeholders             | Not used                  |
| Production build          | Project URL              | GitHub Actions secret             | Disabled in dashboard     |

## Failure modes

- Missing env values: `src/lib/supabase.ts` throws a clear startup error; `validate:env`
  fails the deploy before building.
- Wrong Supabase URL or key: the login request fails; the store surfaces a connection error.
- Unconfirmed user: Supabase returns an email-confirmation error; the store explains how to
  fix it.
- Invalid credentials: mapped to "Invalid email or password."
- Pages direct navigation: served through `404.html`; if the fallback is removed, refreshing
  `/AuthApp/dashboard` returns a GitHub 404 page.
- Renamed repository: production base and Supabase redirect URLs must change together.

## Extension guidance

- If a database table is added, create a migration in `supabase/migrations`, enable RLS, and
  add policies for `anon` and `authenticated`. Keep the secret key server-side; this static
  app must never use it.
- If password reset or magic links are added, extend the Supabase redirect allow-list for
  both local and Pages origins and add the corresponding routes.
- If a custom domain is used, update the Vite base (possibly `/`), Supabase Site URL and
  redirect URLs, and the deployment documentation.
