# Orbital design system

## Status

Direction A / **Orbital** is the locked visual system for AuthApp. The product owner selected
it on 2026-11-04 from the five options in `design/ui-directions.html`. Orbital is the only
canonical direction; the other four remain historical exploration and must not be mixed into
new work.

Read this file before adding or changing any UI. For auth, routing, build, or deployment
changes, also read `AGENTS.md` and `docs/ARCHITECTURE.md`.

## Identity

- Mood: calm, optimistic, precise.
- Audience: broad; trust and effortlessness matter more than technical density.
- Visual signature: a bright or deep navy field, one cobalt or electric-blue signal, soft
  8-12 px geometry, disciplined Manrope typography, and a single restrained orbital ring.
- Density: low. Prefer one clear hierarchy and generous space over packed dashboards.
- Copy: direct, quiet, confident. Sentence case. Page titles may end with a period.

The watch-out from the exploration still applies: without the orbital motif and the type
scale, Orbital can read as a generic SaaS theme. Use the motif and the tokens deliberately.

## Source of truth

| Concern            | File                             |
| ------------------ | -------------------------------- |
| CSS tokens         | `src/styles/orbital.css`         |
| Vuetify themes     | `src/plugins/vuetify.ts`         |
| Fonts              | `src/main.ts` and `package.json` |
| Brand lockup       | `src/components/BrandMark.vue`   |
| Auth page shell    | `src/components/AuthShell.vue`   |
| Theme toggle       | `src/components/ThemeToggle.vue` |
| Visual exploration | `design/ui-directions.html`      |

The prototype is a reference, not an application dependency. Production styling lives in the
files above. Change the tokens there first; do not copy one-off hex values into views.

## Color tokens

Role names are stable. Use the CSS variable rather than the hex value in components.

| Role        | CSS variable            | Light     | Dark                     | Use                                     |
| ----------- | ----------------------- | --------- | ------------------------ | --------------------------------------- |
| Canvas      | `--orbital-canvas`      | `#F5F7FA` | `#07111F`                | Page background                         |
| Surface     | `--orbital-surface`     | `#FFFFFF` | `#0B1728`                | Cards, panels, fields                   |
| Surface 2   | `--orbital-surface-2`   | `#EEF2F7` | `#101F34`                | Notes, readouts, inset bands            |
| Ink         | `--orbital-ink`         | `#0A1B2E` | `#EAF1FA`                | Primary text and strong values          |
| Muted       | `--orbital-muted`       | `#58687A` | `#91A3B7`                | Secondary text, labels, metadata        |
| Line        | `--orbital-line`        | `#D9E1EA` | `#1E3148`                | Hairline borders and dividers           |
| Accent      | `--orbital-accent`      | `#1D4ED8` | `#60A5FA`                | Primary action, focus, orbital ring     |
| Accent text | `--orbital-accent-text` | `#1D4ED8` | `#93C5FD`                | Accent text and links on surfaces       |
| Accent ink  | `--orbital-accent-ink`  | `#FFFFFF` | `#06111F`                | Text and icons on accent                |
| Accent soft | `--orbital-accent-soft` | `#E6ECFF` | `rgba(96,165,250,0.16)`  | Focus rings, selected and badge fills   |
| Signal      | `--orbital-signal`      | `#0E8F7E` | `#2DD4BF`                | Success, active session, healthy status |
| Signal soft | `--orbital-signal-soft` | `#E0F5F1` | `rgba(45,212,191,0.13)`  | Signal badge fills and status halo      |
| Danger      | `--orbital-danger`      | `#B42318` | `#FDA4AF`                | Errors and destructive text             |
| Danger soft | `--orbital-danger-soft` | `#FEECE9` | `rgba(253,164,175,0.12)` | Error fills                             |
| Shadow      | `--orbital-shadow`      | soft navy | deep black               | Auth and dashboard panels               |
| Shadow soft | `--orbital-shadow-soft` | 2 px navy | 2 px black               | Stat cards and quiet surfaces           |

Exact shadows:

```css
/* light */
--orbital-shadow: 0 1px 2px rgba(10, 27, 46, 0.04), 0 18px 50px rgba(10, 27, 46, 0.08);
--orbital-shadow-soft: 0 1px 2px rgba(10, 27, 46, 0.04);

/* dark */
--orbital-shadow: 0 1px 2px rgba(0, 0, 0, 0.18), 0 24px 60px rgba(0, 0, 0, 0.4);
--orbital-shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.18);
```

Do not introduce purple, teal-mint, orange, serif display type, grid-paper backgrounds,
planets, glows, or gradients. Those belong to the other directions.

## Typography

- Display and body: `Manrope` via `@fontsource-variable/manrope` as `Manrope Variable`.
- Metadata, labels, indices, and code-like values: `IBM Plex Mono` at 400/500.
- Fallbacks are system sans and monospace. Do not load Google Fonts at runtime.

| Role        | Family        | Size                            | Weight  | Tracking     | Line height |
| ----------- | ------------- | ------------------------------- | ------- | ------------ | ----------- |
| Page title  | Manrope       | `clamp(2.6rem, 5-6vw, 4.75rem)` | 700     | `-0.055em`   | 0.98-1.05   |
| Panel title | Manrope       | `1.15rem`                       | 700     | `-0.035em`   | 1.2         |
| Stat value  | Manrope       | `1.55rem`                       | 700     | `-0.045em`   | 1.05        |
| Body        | Manrope       | `1rem`                          | 400     | normal       | 1.7         |
| Small body  | Manrope       | `0.75-0.88rem`                  | 400-600 | normal       | 1.5-1.6     |
| Eyebrow     | IBM Plex Mono | `0.66rem`                       | 500     | `0.12em`     | 1.5         |
| Meta label  | IBM Plex Mono | `0.62-0.68rem`                  | 500     | `0.08-0.1em` | 1.4-1.5     |
| Field label | IBM Plex Mono | `0.68rem`                       | 500     | `0.09em`     | 1.4         |
| Field value | Manrope       | `0.94rem`                       | 400     | normal       | 1.45        |

Rules:

- Eyebrows, labels, badges, and table-like metadata are uppercase.
- Body copy and button labels are sentence case; buttons are never uppercase.
- Keep headings tight. Do not add letter-spacing to body copy.
- Use at most one display-scale title per page.

## Geometry and spacing

- Radii: panel and auth card `12px`; input and button `8px`; small inset `5px`; badges and
  avatars `999px`.
- Borders: always a hairline `1px solid var(--orbital-line)` unless the surface is intentionally
  borderless (badge fills and the accent button).
- Spacing scale: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80 px. Use the closest step; do not invent
  intermediate values for layout gaps.
- Main content width: `min(1180px, calc(100% - 64px))`; at `920px` or below use
  `calc(100% - 40px)`; at `520px` or below use `calc(100% - 32px)`.
- Auth card: maximum `460px`, panel padding `36px` desktop / `24px` tablet / `18-22px` phone.
- Top bar: `88px` desktop, `76px` tablet.
- Page padding: `64px 0 72px` for auth pages; `clamp(40px, 6vw, 72px) 0 80px` for the
  dashboard.

## Orbital motif

The motif is one thin off-canvas circle, not a decorative illustration system.

- Use `1px` accent stroke at `10-12%` opacity.
- Desktop ring: large, roughly `460-840px`, anchored off the top-right of the page.
- Optional second ring: signal color at about `6%`, anchored off the bottom-left.
- Auth panels may repeat a smaller accent arc in the top-right corner at `10%` opacity.
- Never place a ring behind form text, never animate it continuously, and never use more than
  two page rings plus one panel arc.
- The `mdi-orbit` icon in the brand mark is the only filled orbital glyph.

The implementation classes are `.orbital-orbit`, `.orbital-orbit--a`,
`.orbital-orbit--b`, and the `.auth-panel::after` arc.

## Layout patterns

### Auth pages

Use `AuthShell` for `/` and `/set-password`.

```vue
<AuthShell eyebrow="Secure access" title="Welcome back." subtitle="...">
  <div class="panel-head">...</div>
  <v-form class="auth-form">...</v-form>
  <div class="auth-note">...</div>
</AuthShell>
```

- Desktop: two columns, editorial intro on the left and a `460px` auth panel on the right.
- The intro contains an eyebrow, page title, one short paragraph, and a three-cell readout.
- At `720px` and below the readout is hidden so the form stays close to the top; the
  eyebrow, title, and paragraph remain. The layout becomes one column with the intro first.
- Every auth page uses `BrandMark`, the `Secure access` status badge, and the `ThemeToggle`
  from the shell.
- Auth forms use a panel heading, the fields, one primary full-width submit button, and one
  quiet note. Do not add social login, tabs, or extra actions without a product decision.

### Protected pages

Use the dashboard pattern:

- `dashboard-topbar` with `BrandMark context="Flight deck"`, session badge, avatar, and
  `ThemeToggle`.
- Eyebrow plus display title, one paragraph, and the page-level action.
- A three-card stat row for the most important current facts.
- A two-column body: primary record panel and a narrower status/notes column.
- At `1024px` the body becomes one column; the aside becomes two columns, then stacks at
  `720px`.

## Components

### Buttons

- Primary: accent fill, accent-ink text, `48px` height, `8px` radius, 700 weight, sentence
  case. Use one primary action per panel.
- Secondary: transparent fill, line border, ink text. It may become accent on hover.
- Text/ghost: accent text, no fill, no border. Use for navigation and cancellation.
- Add MDI icons at `18-20px`; place trailing icons with `<v-icon end>`.
- Loading state uses the Vuetify `loading` prop. Do not replace the label with a spinner.

### Theme toggle

- Use `ThemeToggle.vue`.
- Render an outlined primary `v-btn` with `mdi-weather-sunny` or `mdi-weather-night`.
- Toggle with `theme.change` between `orbitalLight` and `orbitalDark`.
- The control is `44px` and uses a dynamic accessible label.
- The default is light; the button switches to dark mode.

### Fields

Vuetify defaults set `variant="outlined"`, comfortable density, and the `orbital-field`
class. Keep the rules attached to the field.

- Height about `50px`; surface background; line outline; `8px` radius.
- Focus: accent outline plus a `3px` accent-soft ring.
- Labels are uppercase mono at `0.68rem`; values are Manrope at `0.94rem`.
- Icons are muted; the focused icon becomes accent text.
- Errors use the danger token. Never rely on color alone; keep the validation message.

### Alerts, badges, and notes

- Alerts are tonal, `8px` radius, and use the `orbital-alert` class. Use `error` for failures
  and `success` for completed actions.
- Badges are pill-shaped mono uppercase labels. Use `status-badge--signal` for active or
  healthy state, and the neutral badge for classification.
- A status dot is `6px`, current-color, with a soft halo.
- Notes use `.auth-note`: surface-2 fill, line border, 2 px accent left border, shield or
  lock icon, and small muted copy.

### Panels and data rows

- Use `.auth-panel`, `.data-panel`, and `.stat-card`; do not reimplement their borders,
  radius, or shadow.
- Panel header: mono label above a Manrope panel title; optional classification badge on the
  right.
- Identity/data rows are a three-column grid: mono index, label/value stack, optional MDI
  icon. Separate rows with hairlines; no zebra striping.
- Values wrap with `overflow-wrap: anywhere`; IDs and session timestamps use mono at
  `0.78rem`.

### Brand, avatar, and status

- `BrandMark` is the only application identity lockup. It combines the accent square, the
  `mdi-orbit` icon, `AuthApp`, and an uppercase mono context line.
- Use `Identity console` on auth pages and `Flight deck` on the protected dashboard.
- The avatar is a `38px` accent-soft circle with two initials. It is decorative; never make
  it the only way to identify the account.
- Session status belongs in the top bar and in the session panel. The labels are
  `Session active` and `Secure access`.

## Dark mode

Orbital is dual-mode by design.

- `src/plugins/vuetify.ts` registers `orbitalLight` and `orbitalDark`; the default theme is
  `orbitalLight`.
- `src/App.vue` provides the default app shell.
- `src/components/ThemeToggle.vue` toggles between `orbitalLight` and `orbitalDark` with
  `theme.change`.
- `src/styles/orbital.css` defines token overrides on `.v-theme--orbitalLight` and
  `.v-theme--orbitalDark`.
- The UI starts in light mode. The manual toggle switches to dark mode and back to light.
- Do not hardcode light-only colors in new components. Add or use a token.
- Do not add another theme source unless the product owner asks for one.

Check both modes for every UI change.

## Accessibility and motion

- Keep the visible focus treatment: the accent outline and 3 px accent-soft ring.
- Preserve native labels, `autocomplete`, validation messages, and keyboard order.
- Interactive controls are at least `44px` high; primary and auth buttons are `48px`.
- Do not use color as the only error, success, or status cue.
- Decorative orbital rings are `aria-hidden` and non-interactive.
- Entrance motion is a 420 ms fade and 12 px rise. No looping animation. Always respect
  `prefers-reduced-motion`, which the global stylesheet handles.
- Check key text against its surface using the token pairs. Accent text is for accents and
  links, not long paragraphs.

## Adding or changing UI

1. Reuse `AuthShell`, `BrandMark`, and the tokenized classes before building anything new.
2. If a new component is genuinely reusable, add it under `src/components` and style it with
   the existing tokens. Avoid page-specific copies of the same pattern.
3. Use Vuetify 4 components and MDI icon names. Keep the global defaults in
   `src/plugins/vuetify.ts`; override only the component internals that need Orbital
   treatment in `src/styles/orbital.css`.
4. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and
   `npm run build`.
5. Inspect the page in light and dark mode at desktop and phone widths.
6. If the behavior or design rules change, update this file and `AGENTS.md`.

## Do not

- Do not introduce another direction's palette, typography, radius, or motif.
- Do not use arbitrary hex values, box shadows, gradients, or fonts in a view.
- Do not add heavy illustration, glassmorphism, neon glow, or dense telemetry.
- Do not restyle Vuetify into a different system; extend the Orbital tokens.
- Do not add UI that is not part of the demo's auth purpose without a product decision.
