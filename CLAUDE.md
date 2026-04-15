# Project guide for AI agents

This project was scaffolded from the `next-payload-template`. Skills live at `.agents/skills/` (real dir) with `.claude/skills/` symlinks. Architecture rules:

- `src/core/` — pure TypeScript. No React/Next imports. No imports from `app/` or `ui/`.
- `src/lib/` — shared helpers. May import React. No imports from `app/` or `ui/`.
- `src/ui/` — React components. Consumes `core` via `lib`.
- `src/app/` — Next.js routes + server actions. Composes everything.

CI enforces these via `scripts/arch-check.sh`.

For Payload admin: `pnpm payload` to create the first user. For Neon dev branch: `pnpm db:branch`.
