# Flexprice Frontend — Storybook

A Storybook for components in the Flexprice billing dashboard (React 18 + TypeScript + Vite + Tailwind + Radix UI).

## Run

```bash
npm install
npm run storybook
```

Storybook starts on http://localhost:6006.

To build a static Storybook (for hosting):

```bash
npm run build-storybook
```

The static site is emitted to `storybook-static/`.

## What's covered

Stories ship for a curated set of components across atoms / molecules / organisms.

**Atoms**
Button, Card, Checkbox, Chip, DatePicker, DateRangePicker, Input, NoDataCard, Progress, RadioGroup, Select, Spinner, Stepper, Tooltip

**Molecules**
BreadcrumbsView, DataTable, InvoiceStatusBadge, MetricCard, QueryBuilder/SortDropdown, SearchBar

**Organisms**
EmptyState, PricingTierTable, SidebarNav

**Lib**
`queryConfig` — table query-state utility (`createQueryConfig`)

Each story file lives next to its component (`*.stories.tsx`) with `autodocs` tags so Storybook generates an inline docs page per component.

## Tests

A handful of components have Vitest + Testing Library render tests (e.g. `BreadcrumbsView`, `EmptyState`, `DataTable`).

```bash
npx vitest run                                   # all tests once
npx vitest run src/components/molecules/DataTable
```

Storybook `play` functions also act as smoke / interaction tests — run them via the **Interactions** panel inside Storybook, or via the Storybook test runner.

## Project layout

```
src/
  components/
    atoms/        # leaf UI primitives
    molecules/    # composed components
    organisms/    # page-level building blocks
    ui/           # shadcn/Radix primitives (Popover, Calendar, etc.)
  lib/            # utilities (cn, queryConfig, ...)
  store/          # Zustand stores
  utils/          # shared helpers (date formatting, etc.)
.storybook/       # Storybook config (main.ts, preview.ts)
```

## Notes

- Styling uses Tailwind utility classes; `cn()` from `src/lib/utils.ts` merges conditional classes.
- Headless UI primitives come from Radix (`@radix-ui/*`) wrapped in `src/components/ui/`.
- Date helpers live in `src/utils/common/format_date.ts` and are timezone-aware (`local` / `utc`).
- Supabase auth falls back to a mock client when env vars are missing, so Storybook runs without a `.env` file.

## Scripts

| Command | Description |
|---|---|
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-storybook` | Build static Storybook to `storybook-static/` |
| `npm run dev` | Start the Vite dev server (port 3000) |
| `npm run build` | TypeScript check + Vite production build |
| `npx vitest run` | Run all tests once |
| `npx eslint src/` | Lint |
| `npm run format` | Format with Prettier |

## Requirements

- Node 18+ (Node 20 recommended)
- npm 9+
