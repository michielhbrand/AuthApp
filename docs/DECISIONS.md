# Architecture decision records

Decisions are recorded here so future agents do not need to rediscover the reasoning.
Dates use ISO 8601. Status values are proposed, accepted, superseded, or deprecated.

## ADR-001: Vue 3 + Vite + TypeScript

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The project is a small login demo that should be easy to deploy as static
  files and easy for future agents to extend.
- **Decision:** Use Vue 3 single-file components, Vite, and TypeScript. Use Vue Router and
  Pinia from the start so auth state and protected routes have clear homes.
- **Consequences:** Fast local feedback and static hosting. TypeScript adds a typecheck step
  and requires generated Vuetify component types to work with `vue-tsc`.

## ADR-002: Supabase Auth with the publishable key only

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** Supabase now issues publishable keys (`sb_publishable_...`) for browser use
  and secret keys (`sb_secret_...`) for trusted servers. Legacy anon/service_role keys are
  being deprecated by the end of 2026.
- **Decision:** Use `@supabase/supabase-js` in the browser with `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`. Never ship a secret key to the client.
- **Consequences:** No backend is required. Authorization for future data access must be
  enforced with Row Level Security, not with key secrecy. The environment validator rejects
  `sb_secret_` values defensively.

## ADR-003: Hosted Supabase plus local Supabase CLI

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The demo must run locally without touching production data, and also deploy
  against a real hosted project.
- **Decision:** Commit `supabase/config.toml` and support `supabase start` for local
  development. Use a hosted cloud project for the Pages deployment. Local and cloud Auth URL
  settings are documented together.
- **Consequences:** Local development requires Docker. The local stack is disposable and can
  be reset independently of the cloud project.

## ADR-004: Manual demo users, sign-ups disabled

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The goal is a login screen demonstration, not a registration product. Open
  sign-up would add email confirmation and abuse concerns.
- **Decision:** Disable public sign-ups in cloud and local settings. Create demo users
  manually in the Supabase dashboard or local Studio with auto-confirm enabled.
- **Consequences:** Visitors cannot create accounts. Provisioning is an explicit operator
  step. If registration is added later, Supabase email confirmation and redirect URLs must
  be configured for both local and Pages origins.

## ADR-005: Vuetify 4 instead of PrimeVue 5

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** A component library was requested. PrimeVue 5 is distributed under terms
  other than MIT and includes a license manager; this repository is Apache-2.0. Vuetify 4
  is MIT-licensed.
- **Decision:** Use Vuetify 4 with `vite-plugin-vuetify` auto-import and MDI icons.
- **Consequences:** The bundle is larger than a minimal CSS approach. Do not upgrade the UI
  library to a non-MIT major without a license review and an ADR update.

## ADR-006: GitHub Pages project site with history routing

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The repository is `AuthApp`, so the free project site lives under
  `/AuthApp/`. GitHub Pages has no server-side SPA rewrite.
- **Decision:** Set the production Vite base to `/AuthApp/`, use `createWebHistory`, and
  copy the built `index.html` to `404.html` in a postbuild script. Write `.nojekyll` as
  well.
- **Consequences:** URLs remain pretty and direct navigation works, at the cost of returning
  HTTP 404 for deep links. Renaming the repository requires changing the base and Supabase
  redirect URLs together.

## ADR-007: Official Pages Actions artifact and build-time secrets

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The deployment must use GitHub Actions and repository secrets, and should not
  push generated files to a long-lived branch.
- **Decision:** Build in GitHub Actions with `npm ci`, upload `dist/` using
  `actions/upload-pages-artifact`, and deploy with `actions/deploy-pages`. Inject
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from repository secrets. CI builds
  with placeholders so untrusted pull requests do not need secrets.
- **Consequences:** Pages must use the GitHub Actions source. The publishable key is still
  public in the bundle by design; GitHub secrets are used for consistent injection and to
  avoid hardcoding values.

## ADR-008: Deploy on main, release with manual tags

- **Date:** 2026-11-03
- **Status:** Superseded by ADR-012
- **Context:** The project needs a simple, transparent release process without an automated
  changelog or semantic-release toolchain.
- **Decision:** Every push to `main` deploys. Versioned releases are explicit semver tags
  (for example `v0.1.0`) followed by `gh release create`.
- **Consequences:** The deployed site may be newer than the latest release. Operators must
  tag intentionally. The initial `v0.1.0` release is created after the first successful
  deployment.

## ADR-009: Node 22 LTS and npm

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The toolchain requires a modern Node version; the current create-vue and
  Vitest releases require Node 22.18 or newer.
- **Decision:** Pin Node 22 in `.nvmrc`, declare the engine range in `package.json`, use npm,
  and commit `package-lock.json`.
- **Consequences:** CI uses `npm ci`. Contributors using newer Node versions should still be
  compatible with the declared range.

## ADR-010: Apache-2.0 license

- **Date:** 2026-11-03
- **Status:** Accepted
- **Context:** The project is a public demonstration that should be permissively licensed
  and include an explicit patent grant.
- **Decision:** License the repository under Apache-2.0 with
  `Copyright 2026 Michiel Brand`.
- **Consequences:** Dependencies must remain license-compatible. The Vuetify choice was
  partly driven by this constraint.

## ADR-011: Admin invitations with an in-app password setup route

- **Date:** 2026-11-04
- **Status:** Accepted
- **Context:** Administrators should be able to invite users from the Supabase dashboard and
  let each recipient choose a password. Supabase invitation emails redirect to the project's
  configured Site URL, and the invite token must be exchanged before the password update.
- **Decision:** Detect the `invite` and `recovery` link types in `src/lib/auth-link.ts`
  before Supabase consumes the URL. Track `passwordSetupRequired` in the auth store, route
  those users to `/set-password`, and call `supabase.auth.updateUser({ password })` from the
  store. Keep public sign-ups disabled; invitations are an administrator action.
- **Consequences:** The cloud Supabase Site URL must be the Pages origin. If it points at
  `localhost:3000`, invite links fail regardless of application code. The same route also
  supports future password recovery links.

## ADR-012: Automated semantic releases from Conventional Commits

- **Date:** 2026-11-04
- **Status:** Accepted
- **Context:** Manual tagging and `gh release create` are easy to forget and leave the
  deployed site ahead of the latest release. Releases should be created consistently from
  commit history.
- **Decision:** Run `semantic-release` on every push to `main` from
  `.github/workflows/release.yml`. Use the commit analyzer, release notes generator, and
  GitHub plugins configured in `.releaserc.json`. Require Conventional Commits: `fix` and
  `perf` produce patches, `feat` produces minors, and breaking changes produce majors.
  Deployment remains independent and continues on every push to `main`.
- **Consequences:** Only release-worthy commits create tags and GitHub releases. Commits
  without a conventional type are ignored by semantic-release. Release versions come from
  Git tags rather than `package.json`. The release workflow needs `contents: write` (and
  issue/PR write for the GitHub plugin) but does not deploy the site.
