# AGENTS.md

Instructions for agents working in this repository. Read this file and
`docs/ARCHITECTURE.md` before changing auth, routing, build, or deployment behavior.

## Purpose

AuthApp is a deliberately small Vue 3 + Supabase authentication demo. It is hosted on
GitHub Pages and exists to demonstrate a login screen, admin invitations that let users
choose a password, persisted sessions, a protected page, and sign-out. Keep it focused; do
not add unrelated product features.

## Commands

Run from the repository root. Use Node 22 via `.nvmrc`.

```bash
nvm use
npm ci
npm run dev
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run validate:env
```

`npm run build` runs typechecking, the Vite build, and the `postbuild` script. A local
production build needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in
`.env.local` or the shell.

Before finishing any change, run at least:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment and secret rules

- `VITE_SUPABASE_URL`: Supabase project URL, or `http://127.0.0.1:54321` for local Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: publishable key (`sb_publishable_...`). It is safe to
  expose in the browser bundle.
- Never place a Supabase secret key (`sb_secret_...`) or legacy `service_role` key in the
  frontend, a `VITE_*` variable, the repository, tests, logs, or chat.
- `.env.local` is gitignored. `.env.example` contains placeholders only.
- Production values come from GitHub Actions secrets named exactly
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Use `npm run validate:env` before a deploy build. It rejects missing values and secret
  keys.

## Architecture map

- `src/lib/supabase.ts` — the only Supabase client instance.
- `src/lib/auth-link.ts` — reads invite/recovery link parameters before Supabase consumes
  the URL.
- `src/stores/auth.ts` — owns session state, initialization, sign-in, password setup, and
  sign-out.
- `src/router/index.ts` — routes and the auth guard.
- `src/views/LoginView.vue` — login form and validation.
- `src/views/SetPasswordView.vue` — invite and password update form.
- `src/views/DashboardView.vue` — protected session details.
- `src/plugins/vuetify.ts` — Vuetify configuration.
- `vite.config.ts` — production base `/AuthApp/`, Vuetify auto-import, aliases.
- `scripts/postbuild.mjs` — copies `index.html` to `404.html` and writes `.nojekyll`.
- `.github/workflows/ci.yml` — checks on pull requests and pushes to `main`.
- `.github/workflows/deploy.yml` — builds with secrets and deploys to GitHub Pages.
- `.github/workflows/release.yml` — creates GitHub releases with `semantic-release`.
- `.releaserc.json` — release branches, tag format, and plugins.

See `docs/ARCHITECTURE.md` for the auth lifecycle and deployment pipeline.

## Conventions

- Use Vue single-file components with `<script setup lang="ts">`.
- Keep auth state in the Pinia store. Components should not call `supabase.auth` directly.
- Keep the Supabase client singleton in `src/lib/supabase.ts`.
- Invite and recovery links arrive with a `type` in the URL hash or query. Preserve the
  detection in `src/lib/auth-link.ts`; do not let the login redirect bypass
  `/set-password`.
- Use Vuetify 4 components and MDI icon names. Do not upgrade to a non-MIT UI major without
  reviewing its license.
- Use Conventional Commits for commit messages and PR titles. `semantic-release` uses them
  to choose patch/minor/major versions; non-conventional commits do not create releases.
- Use the `@/` alias for imports from `src/`.
- No comments unless they explain non-obvious behavior.
- Match existing formatting. Prettier and ESLint are authoritative.
- Add tests for auth store behavior when changing sign-in, sign-out, or error handling.
- Keep documentation in sync with behavior changes.

## Deployment constraints

- The site is a GitHub Pages project site at `https://michielhbrand.github.io/AuthApp/`.
- Production `base` must remain `/AuthApp/` unless the repository is renamed. If it changes,
  update `vite.config.ts`, Supabase redirect URLs, the README, and the docs.
- The cloud Supabase **Site URL** must be `https://michielhbrand.github.io/AuthApp/`.
  Invitation emails build their link from it. If it points at `localhost:3000`, recipients
  cannot accept invites.
- Do not remove the `404.html` fallback; it is what makes `/AuthApp/dashboard` work on a
  hard refresh.
- `.github/workflows/deploy.yml` is the only production deploy path. Keep Pages permissions
  (`pages: write`, `id-token: write`) and the `github-pages` environment.
- Deployments occur on pushes to `main`. Releases are created automatically by
  `semantic-release` from Conventional Commits; do not create tags or releases manually
  unless recovering from a failed release.

## Supabase constraints

- Public sign-ups are disabled in cloud and local settings. Administrators create users or
  send invitations from the dashboard or local Studio. Invited users choose their password
  through `/set-password`.
- Keep the cloud Site URL aligned with the Pages origin so invite links return to the app.
  Local invitations use `supabase/config.toml` and Mailpit at `http://localhost:54324`.
- There are no database tables. If you add one, add a migration under `supabase/migrations`,
  enable Row Level Security, and write policies for the `anon` and `authenticated` roles.
- Use the publishable key for client access. Never introduce a service-role client into the
  browser bundle.
- Keep `supabase/config.toml` redirect URLs aligned with local and Pages origins.

## Do not

- Do not commit `.env` files, keys, tokens, or generated secrets.
- Do not add a sign-up UI without an explicit product decision.
- Do not add analytics, error reporting, or third-party scripts that handle auth data
  without documenting the privacy/security impact.
- Do not change the deployment target, repo name assumptions, or base path without updating
  all related configuration and docs.
- Do not force-push or rewrite shared history unless explicitly requested.

## Documentation rule

Any change to auth flow, environment variables, deployment, routing, or the UI library must
update the relevant files in `docs/` and this file when conventions change.
