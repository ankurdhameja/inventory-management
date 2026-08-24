# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Factory Inventory Management System Demo with GitHub integration - Full-stack application with Vue 3 frontend, Python FastAPI backend, and in-memory mock data (no database).

> ⚠️ **This repository and any fork you create are PUBLIC.** Do not commit credentials, internal hostnames, or private registry URLs. `client/.npmrc` pins the public npm registry and `client/package-lock.json` is gitignored to prevent locally-configured registries from leaking into commits — leave both in place.

## Critical Tool Usage Rules

### Subagents
Use the Task tool with these specialized subagents for appropriate tasks:

- **vue-expert**: Use for Vue 3 frontend features, UI components, styling, and client-side functionality
  - Examples: Creating components, fixing reactivity issues, performance optimization, complex state management
  - **MANDATORY RULE: ANY time you need to create or significantly modify a .vue file, you MUST delegate to vue-expert**
  - Scoped to `client/` only — never touches `server/` or API contracts
- **code-reviewer**: Use after writing significant code to review quality and best practices
- **security-auditor**: Fast, changed-files-only review for hardcoded secrets, XSS (`v-html`/`innerHTML`), and missing API input validation
- **Explore**: Use for understanding codebase structure, searching for patterns, or answering questions about how components work
- **general-purpose**: Use for complex multi-step tasks or when other agents don't fit

### Skills
- **backend-api-test** skill: Use when writing or modifying tests in `tests/backend` directory with pytest and FastAPI TestClient

### Custom Slash Commands (`.claude/commands/`)
- `/start`, `/stop` — start/stop both dev servers (kills anything already bound to ports 3000/8001 first)
- `/test` — run the full test suite with a report
- `/optimize` — scan for dead code/unused deps across client+server and clean it up
- `/demo-branch` — create an auto-numbered `demo-branch` for live demos
- `/reset-branch` — hard-reset back to main, deleting the current branch and its upstream PR (destructive)

### MCP Tools
- **ALWAYS use GitHub MCP tools** (`mcp__github__*`) for ALL GitHub operations
  - Exception: Local branches only - use `git checkout -b` instead of `mcp__github__create_branch`
  - Requires `GITHUB_PERSONAL_ACCESS_TOKEN` env var (see `.mcp.json`)
- **ALWAYS use Playwright MCP tools** (`mcp__playwright__*`) for browser testing
  - Test against: `http://localhost:3000` (frontend), `http://localhost:8001` (API)

## Stack
- **Frontend**: Vue 3 + Composition API + Vite (port 3000)
- **Backend**: Python FastAPI (port 8001), managed with `uv`
- **Data**: JSON files in `server/data/` loaded via `server/mock_data.py` — no database, changes don't persist across restarts

## Commands

**Install:**
```bash
cd server && uv sync
cd client && npm install
```

**Run dev servers** (Windows: run each in its own terminal; macOS/Linux: `./scripts/start.sh` / `./scripts/stop.sh`):
```bash
cd server && uv run python main.py   # http://localhost:8001, docs at /docs
cd client && npm run dev             # http://localhost:3000
```

**Run backend tests** (there's no `pyproject.toml` in `tests/`, so point `uv` at the server's venv with `--project`):
```bash
cd tests && uv run --project ../server pytest -v
cd tests && uv run --project ../server pytest backend/test_inventory.py -v          # single file
cd tests && uv run --project ../server pytest backend/test_inventory.py::TestInventoryEndpoints::test_get_all_inventory -v  # single test
```
There is no frontend test suite yet.

**Production build:**
```bash
cd client && npm run build   # output: client/dist/
```

## Architecture

**Data flow**: Vue filter state → `client/src/composables/useFilters.js` → `client/src/api.js` (axios) → FastAPI route in `server/main.py` → in-memory `apply_filters`/`filter_by_month` over data loaded by `server/mock_data.py` → Pydantic response validation → Vue computed properties render it.

**Routing** (`client/src/main.js`): a single `vue-router` instance maps each top-level view directly — `/` Dashboard, `/inventory`, `/orders`, `/demand`, `/spending`, `/reports`. Backlog is surfaced inside Dashboard rather than its own route.

**Filter system**: 4 filters (Time Period, Warehouse, Category, Order Status) live as **module-level singleton refs** in `useFilters.js` (not per-component state), so every view/component sharing that composable reads and mutates the same filter state. `getCurrentFilters()` translates UI state into the query-param shape the API expects; inventory endpoints ignore `month` since inventory has no time dimension.

**Reactivity convention**: raw data loaded from the API lives in refs (`allOrders`, `inventoryItems`); everything derived (totals, chart series, filtered lists) is a `computed()`, never recalculated imperatively.

**Auth & i18n are client-only mocks, not backend features**: `useAuth.js` hardcodes `isAuthenticated = true` and a fake current user (logout just alerts); `useI18n.js` + `locales/{en,ja}.js` drive language-dependent display strings (including the mock user's name/tasks). None of this touches the FastAPI backend.

**Known gap**: `client/src/api.js` has methods for `getTasks`/`createTask`/`deleteTask`/`toggleTask` and `createPurchaseOrder`/`getPurchaseOrderByBacklogItem`, but `server/main.py` has no corresponding `/api/tasks` or `/api/purchase-orders` routes — tasks are actually sourced from the client-only mock user data in `useAuth.js`, and purchase orders are only read (not created) via the `has_purchase_order` flag on `/api/backlog`. Don't assume these client methods have live backend support without checking `server/main.py` first.

## API Endpoints
All endpoints support optional filtering via query params: `warehouse`, `category`, `status`, `month` (where applicable).

- `GET /api/inventory`, `/api/inventory/{id}` - Filters: warehouse, category
- `GET /api/orders`, `/api/orders/{id}` - Filters: warehouse, category, status, month
- `GET /api/dashboard/summary` - All filters
- `GET /api/demand`, `/api/backlog` - No filters
- `GET /api/spending/summary|monthly|categories|transactions`
- `GET /api/reports/quarterly`, `/api/reports/monthly-trends`

## Code Style
- Always document non-obvious logic changes with comments

## Common Issues
1. Use unique keys in v-for (not `index`) - use `sku`, `month`, etc.
2. Validate dates before `.getMonth()` calls
3. Update Pydantic models in `server/main.py` when changing JSON data structure in `server/data/*.json`
4. Inventory filters don't support month (no time dimension)
5. Revenue goals: $800K/month single, $9.6M YTD all months

## File Locations
- Views: `client/src/views/*.vue`
- Reusable components/modals: `client/src/components/*.vue`
- Composables: `client/src/composables/{useAuth,useFilters,useI18n}.js`
- API Client: `client/src/api.js`
- i18n strings: `client/src/locales/{en,ja}.js`
- Backend: `server/main.py` (routes + Pydantic models), `server/mock_data.py` (data loading)
- Data: `server/data/*.json`
- Backend tests: `tests/backend/*.py` (fixtures in `tests/backend/conftest.py`)
- Styles: `client/src/App.vue`

Nested `CLAUDE.md` files in `client/` and `server/` contain detailed framework-specific patterns (component templates, filtering conventions, error handling, testing examples) — Claude Code loads them automatically when working in those directories.

## Design System
- Colors: Slate/gray (#0f172a, #64748b, #e2e8f0)
- Status: green/blue/yellow/red
- Charts: Custom SVG, CSS Grid for layouts
- No emojis in UI
