# Design Token Spec — SaaS Sidebar Redesign

Read this before drafting the Step 2 proposal in `SKILL.md`. These are the actual values to propose — don't invent alternatives. All tokens are added once, as a `:root { }` block inside `client/src/App.vue`'s global `<style>`, then consumed via `var(--token-name)` everywhere a hardcoded literal currently exists.

This is a deliberate departure from the app's current palette (a slate-neutral + blue-`#2563eb` accent scheme), not an extraction of it — the redesign applies a fresh, opinionated modern-SaaS look.

## Color tokens

```css
:root {
  /* Neutrals (zinc scale) */
  --color-bg-canvas: #fafafa;
  --color-bg-surface: #ffffff;
  --color-border: #e4e4e7;
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-muted: #a1a1aa;

  /* Primary accent (indigo — replaces the current #2563eb blue) */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;

  /* Status colors */
  --color-success-50: #ecfdf5;
  --color-success-500: #10b981;
  --color-success-700: #047857;

  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-700: #b45309;

  --color-danger-50: #fff1f2;
  --color-danger-500: #f43f5e;
  --color-danger-700: #be123c;

  --color-info-50: #f0f9ff;
  --color-info-500: #0ea5e9;
  --color-info-700: #0369a1;

  /* Sidebar-specific (deliberate dark sidebar for contrast against a light canvas) */
  --color-sidebar-bg: #18181b;
  --color-sidebar-border: #27272a;
  --color-sidebar-text: #a1a1aa;
  --color-sidebar-text-active: #ffffff;
  --color-sidebar-active-bg: rgba(99, 102, 241, 0.16); /* primary-500 @ 16% */
  --color-sidebar-active-bar: #6366f1; /* 2px left accent bar on the active nav item */
}
```

## Spacing tokens (strict 4px grid)

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
}
```

Every spacing literal in the codebase (margin, padding, gap) should resolve to one of these. If Step 1's analysis finds a value that isn't already one of `0.25/0.5/0.75/1/1.25/1.5/2/2.5/3rem`, snap it to the nearest token using this mapping (values confirmed present in `App.vue` as of writing — re-check, don't assume the list is exhaustive or still accurate):

| Legacy value | Nearest token |
|---|---|
| `0.313rem` (~5px) | `--space-2` (8px) |
| `0.375rem` (6px) | `--space-2` (8px) |
| `0.625rem` (10px) | `--space-3` (12px) |

## Type scale (kept separate from spacing — do not collapse font-sizes into the spacing grid)

Values like `0.813rem`, `0.938rem`, `1.375rem` found in the current codebase are **font sizes**, not spacing, even though they're off-grid. Move them into a type scale instead of snapping them to a spacing token:

```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
}
```

## Radius and shadow tokens (new — none exist in the codebase today)

```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 12px 24px -4px rgba(15, 23, 42, 0.12);
}
```

## Sidebar layout tokens

```css
:root {
  --sidebar-width: 260px;
  --sidebar-width-collapsed: 72px;
}
```

Use a CSS class toggle (e.g. `.app--sidebar-collapsed`) on the root layout element to switch between these two widths, rather than computing widths in JavaScript — this lets a single CSS transition handle both the sidebar and the content area's margin shift together.

## Applying the tokens

1. Add the full `:root { }` block (all sections above) into `client/src/App.vue`'s existing global `<style>` — do not scatter tokens across multiple files.
2. Replace hardcoded hex/px literals with `var(--token-name)` starting in `App.vue`'s own global styles, then in each view's scoped `<style>` block as it's migrated (see `SKILL.md` Step 3, batch 5).
3. Any new component (`Sidebar.vue`, `PageHeader.vue`, `PageContainer.vue`) should be written using tokens from the start — never introduce new hardcoded values in new code.
