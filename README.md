# next-payload-template

A Next.js 16 + Payload CMS 3 template with opt-in features, Vercel Postgres/Blob, and agent skills out-of-the-box.

## Quick start

```bash
gh repo create my-app --template jv-vogler/next-payload-template --private --clone
cd my-app
pnpm install
pnpm tsx setup.ts --name=my-app
```

The setup script prompts for optional features (blog, i18n, contact, seed, GA), prunes unused code and deps, writes `.env.local`, commits, and self-deletes.

### Non-interactive

```bash
pnpm tsx setup.ts --name=my-app --with-blog --no-i18n --no-contact --no-seed --no-ga --skip-neon
```

## Features

| Feature  | Default | Flag             | Includes                                             |
| -------- | ------- | ---------------- | ---------------------------------------------------- |
| Users    | Always  | —                | Auth, admin/user roles                               |
| Media    | Always  | —                | Uploads with three sizes, Vercel Blob storage        |
| Settings | Always  | —                | Site name, SEO, OG image, social links               |
| Blog     | On      | `--with/no-blog` | Posts collection, `/blog`, `/feed.xml`, code blocks  |
| i18n     | Off     | `--with-i18n`    | `next-intl`, `[locale]/` routing, EN + PT stubs      |
| Contact  | Off     | `--with-contact` | Resend form, server action, UI                       |
| Seed     | On      | `--with-seed`    | `pnpm seed` scaffold + `seedSettings` / `seedPosts`  |
| GA       | Off     | `--with-ga`      | `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var hook-in only |

## One-time setup (after `setup.ts`)

1. **Neon + Vercel**: install the [Neon ↔ Vercel integration](https://vercel.com/integrations/neon). Enable "preview branches per deploy". Vercel will inject `POSTGRES_URL` et al. into your project.
2. **Vercel Blob**: create a Blob store at [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores). Vercel injects `BLOB_READ_WRITE_TOKEN`.
3. **PAYLOAD_SECRET**: generate and set in Vercel: `openssl rand -hex 32`.
4. **Local dev branch**: `pnpm db:branch` creates `dev-$USER` from `main` and writes its URL into `.env.local`.
5. **First migration**: `pnpm db:migrate`.
6. **First admin user**: `pnpm payload`.

## DB workflow

- `pnpm db:branch` — create/ensure `dev-$USER` branch and point `.env.local` at it.
- `pnpm db:reset` — reset `dev-$USER` to `main` (pulls fresh prod schema + data).
- `pnpm db:migrate:create <name>` — generate a Payload migration SQL file.
- `pnpm db:migrate` — apply pending migrations.
- `pnpm db:migrate:status` — list pending migrations.

Schema is committed to `src/migrations/`. `vercel-build` runs `payload migrate` before `next build`.

## Admin toggle

Set `PAYLOAD_ENABLED=false` to run as a pure static Next.js site. The admin UI returns 404, all Payload API routes return 404, and `getPayloadSafe()` returns `null` so pages fall back to defaults.

## Architecture rules

- `src/core/` — pure TS domain. No React, no Next. No imports from `app/` or `ui/`.
- `src/lib/` — shared helpers. May import React. No imports from `app/` or `ui/`.
- `src/ui/` — React components.
- `src/app/` — Next.js routes + server actions. Composes everything.

Enforced by `pnpm arch:check` (runs in CI).

## Agent skills

`.agents/skills/` contains the canonical skill definitions. `.claude/skills/` contains symlinks for Claude Code. Skills included: `deploy-to-vercel`,`frontend-design`, `payload`, `vercel-composition-patterns`, `vercel-react-best-practices`, `web-design-guidelines`.

## Tooling

pnpm 10, Node 22, oxlint, oxfmt, tsgo, husky, lint-staged. Pre-commit runs typecheck + format + lint on staged files.
