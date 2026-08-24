---
name: saas-sidebar-redesign
description: Redesigns the Vue 3 frontend into a modern SaaS-style UI — replaces the horizontal top nav with a vertical left sidebar, introduces a real design-token system (color/spacing/radius/shadow) to fix ad-hoc spacing, and applies a fresh opinionated SaaS palette. Always proposes a written before/after plan and waits for explicit user confirmation before touching any files. Use when the user asks to "redesign the UI", "add a sidebar", "modernize the frontend", "give this a SaaS-style layout", "fix the spacing/design system", or "restyle the app".
---

# SaaS Sidebar Redesign

Turns the current horizontal top-nav layout into a modern SaaS-style interface: a vertical left sidebar, a real design-token system, and consistent spacing across every view. This is a four-step workflow — **Analyze → Propose → Implement → Verify** — and step 2 always ends with a stop for user confirmation before any file is touched.

**Non-negotiable rule:** this skill never edits `.vue` files itself. Per this repo's `CLAUDE.md` and `.claude/agents/vue-expert.md`, ANY creation or significant edit of a `.vue` file MUST be delegated to the `vue-expert` subagent. This skill's own job is analysis, proposing the plan, and directing `vue-expert` through the implementation batches once approved.

## Step 1 — Analyze

Before proposing anything, read:

- `client/src/App.vue` (full file — layout, global `<style>`, nav markup)
- `client/src/main.js` (route list)
- Every view under `client/src/views/` (Dashboard, Inventory, Orders, Demand, Spending, Reports, Backlog) — specifically each view's root container class and scoped `<style>` for page-header/padding rules
- `client/src/components/{ProfileMenu,LanguageSwitcher,FilterBar}.vue`
- `client/src/composables/{useFilters,useAuth,useI18n}.js` and `client/src/locales/{en,ja}.js`
- `CLAUDE.md`, `client/CLAUDE.md`, `.claude/agents/vue-expert.md`
- `client/package.json` — confirm whether an icon library or CSS framework has since been added (as of writing, only `vue`/`vue-router`/`axios` are installed)

Produce a short structured summary before moving to Step 2:
1. Confirmed route list with current labels and i18n keys (or lack thereof)
2. Confirmed presence/absence of `:root` design tokens
3. The specific spacing/padding inconsistencies found (e.g. any view overriding padding that others inherit from a shared container)
4. Confirmed presence/absence of an icon library

Do not assume the findings below are still accurate without checking — the app may have changed since this skill was written.

## Step 2 — Propose (then STOP)

Present a concrete, specific plan and wait for the user to confirm before writing anything. A vague "we'll modernize the colors" is not acceptable — the plan must name real values and real files. Cover:

### Design tokens
Read `references/design-tokens.md` for the full color/spacing/type/radius/shadow spec and the mapping table for any off-grid spacing values found in Step 1 — do not invent your own palette. Summarize the token plan in the proposal: new indigo/zinc SaaS palette, strict 4px spacing scale, a type scale kept separate from spacing, and new radius/shadow tokens. All tokens are added once, in a new `:root { }` block inside `App.vue`'s `<style>`.

### `Sidebar.vue`
A new component in `client/src/components/`:
- Nav items driven by a config array in a new `client/src/config/navigation.js` (`{ path, labelKey, icon }` per item), not hardcoded template markup.
- Real Vue Router active-link matching (`router-link`'s built-in active classes) instead of any manual `$route.path === '...'` comparison — call out explicitly if the current code uses the manual pattern, since it's a regression risk if copied forward.
- Icons: prefer hand-authored inline `<svg>` (stroke-based, `currentColor`) over adding an icon-library dependency, consistent with this repo's existing "custom SVG, no chart library" convention and to avoid touching the pinned public npm registry in `client/.npmrc` unnecessarily. One small icon per nav item.
- Collapse/expand via a new singleton composable `client/src/composables/useSidebar.js` (same module-level-ref pattern as `useFilters.js`), persisted to `localStorage`.
- A footer area for whatever account/profile and language-switching components currently live in the top nav — flag that dropdown-open-direction CSS built for a horizontal bar may need to open upward/sideways once relocated to a vertical sidebar footer.

### Layout restructure
The root layout wrapper (currently a `flex-direction: column` stack under a top header) becomes a flex **row**: sidebar + content column. Any app-wide toolbar (e.g. a filter bar) that currently sits under the header stays app-wide, relocated to the top of the new content column — do not accidentally scope a currently-global element to a single view.

### Fixing the spacing duplication (the actual point of this redesign)
If, as found in Step 1, each view re-implements its own page header markup and its own page padding independently, introduce two small shared components and migrate every view to them:
- `PageHeader.vue` — props `title`, `subtitle`, an `actions` slot — replacing copy-pasted header markup.
- `PageContainer.vue` — a thin wrapper owning the single source of truth for view padding, default slot for content.

Any view found overriding padding in a way that conflicts with the shared container (e.g. zeroing it out) must have that override **deleted**, not preserved — the whole point is one source of truth.

### i18n
If any nav label found in Step 1 is a hardcoded string rather than passed through the app's translation function, add the missing key to every locale file that exists — this is a bug fix riding along with the redesign, not optional polish.

## Step 3 — Implement (only after the user confirms Step 2)

Delegate every `.vue` file creation/edit to the `vue-expert` subagent, in small reviewable batches so diffs stay easy to check:

1. Token `:root` block into `App.vue` — no structural changes yet.
2. `navigation.js` config, icon set, `useSidebar.js`, `Sidebar.vue`.
3. `App.vue` template + layout swap (old nav markup → `<Sidebar/>`, column → row), relocating any global toolbar/profile/language components. Grep the whole `client/src` tree for the old nav's CSS class names before deleting their styles, to confirm nothing else references them.
4. Locale file additions for any newly-introduced i18n keys.
5. `PageHeader.vue` + `PageContainer.vue`, then view migrations in small batches (e.g. 2-3 views at a time), explicitly removing each view's now-redundant page-header markup and conflicting padding rules.

After the batches, run the `code-reviewer` subagent per this repo's existing convention of reviewing significant new code.

## Step 4 — Verify

Per this repo's CLAUDE.md rule to always use Playwright MCP tools for browser testing against `http://localhost:3000`:

1. Start both dev servers (`/start`, or manually `cd server && uv run python main.py` and `cd client && npm run dev`).
2. Visit every route; confirm the sidebar renders on the left on every route, and exactly the correct nav item is highlighted active on each — including that the root route isn't falsely active elsewhere (the regression check for removing any manual active-class logic).
3. Click through sidebar links; confirm client-side navigation and active-state updates without a full reload.
4. Toggle sidebar collapse/expand; confirm the layout reflows correctly and collapsed nav items remain identifiable (e.g. via `title` tooltips).
5. Exercise language switching from its new position; confirm every nav label translates, including any newly-added key.
6. Exercise any global filter/toolbar component on at least two different views; confirm shared filter state still works correctly after relocation and the component isn't accidentally mounted more than once.
7. Open any profile/account dropdown or modals from their new sidebar-footer position; confirm they still open/close/position correctly.
8. Load any view that embeds another view/section without its own route (check Step 1's findings) and confirm it isn't double-wrapped in the new page container.
9. Capture the browser console log on each route; confirm zero errors or warnings.

## Risks and gotchas to check for (confirmed in this codebase as of writing — reverify in Step 1, the app may have changed since)

- `App.vue`'s "Reports" nav label is a hardcoded string, not run through `t()` like every other label — must become a real translation key (e.g. `nav.reports`) in both `client/src/locales/en.js` and `ja.js`, not a hardcoded replacement string.
- `Reports.vue` sets `.reports { padding: 0; }`, overriding the padding every other view inherits from the shared main-content container — delete this override once page padding is centralized in `PageContainer`, don't carry it forward.
- `FilterBar.vue` is currently rendered app-wide directly under the header (outside any per-view template), not per-view — preserve that global placement in the new layout unless the confirmed plan says otherwise.
- `useFilters.js` holds module-level singleton refs (safe across the layout relocation), but verify `FilterBar` isn't accidentally mounted more than once in the new tree.
- `Backlog.vue` has no route of its own — it's embedded inside `Dashboard.vue`. Don't double-wrap it in `PageContainer` when Dashboard is migrated.
- No icon library is installed (`client/package.json` currently lists only `vue`/`vue-router`/`axios`) — avoid adding one; use inline SVG instead.
- The current top nav is `position: sticky`; switching to a `position: fixed` sidebar can break any code that assumes window-level scroll (`window.scrollY`, scroll event listeners) — check for this before finalizing.
- `ProfileMenu.vue`/`LanguageSwitcher.vue` dropdown-direction CSS was built for a horizontal top bar and may need to open upward/sideways once relocated to a vertical sidebar footer.
- Before deleting `.top-nav`/`.nav-tabs`/`.logo` and related global styles from `App.vue`, grep the whole `client/src` tree to confirm no other file references those class names.

## Additional resources

- `references/design-tokens.md` — the full color/spacing/type-scale/radius/shadow token spec, plus the exact mapping from any off-grid legacy spacing values to new tokens. Read this before drafting the Step 2 proposal; do not invent token values ad hoc.
