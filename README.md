# next-payload-template

A small, opinionated starter for **Next.js 16 + Payload CMS 3** on Vercel
(Postgres + Blob). Ships only the basics — auth, media uploads, shadcn
primitives, sane tooling. Optional features (blog, contact form, i18n,
site-settings global) live as **add-on recipes** you install on demand.

## Quick start

```bash
git clone <this-repo> my-site
cd my-site
cp .env.example .env.local      # fill in PAYLOAD_SECRET, POSTGRES_URL, BLOB_READ_WRITE_TOKEN
pnpm install
pnpm db:migrate
pnpm dev                         # http://localhost:3000 + http://localhost:3000/admin
```

Create the first admin user from the Payload UI on first visit, or via
`pnpm payload`.

## What's in the base

- Next.js 16 (Turbopack) + React 19
- Payload 3 with the Vercel Postgres adapter and Vercel Blob storage
- Two collections: `Users` (auth), `Media` (uploads)
- Tailwind v4 + shadcn primitives (`Button`, `Input`, `Textarea`, `Label`, `Card`, `Badge`, `Dialog`)
- Vercel Analytics wired in `src/app/layout.tsx`
- Lightweight architecture rules (`src/core/` ⊄ react/next, `src/lib/` ⊄ app/ui) enforced by `scripts/arch-check.sh`
- Tooling: oxlint, oxfmt, tsgo typecheck, husky + lint-staged
- DB helpers: `pnpm db:branch` (per-dev Neon branch), `db:migrate`, `db:reset`

## Recipes (opt-in)

Each recipe is a self-contained add-on under `recipes/<name>/`. Install with:

```bash
pnpm template:add <name>
```

| Recipe          | What it adds                                                                          |
| --------------- | ------------------------------------------------------------------------------------- |
| `blog`          | `Posts` collection, Lexical code blocks (Shiki), `/blog` routes, RSS feed             |
| `contact`       | Resend-backed contact form with lazy validation + field hints                         |
| `i18n`          | `next-intl` with locale-prefixed routing (`/en`, `/pt`)                               |
| `site-settings` | Editable site-wide global (name, SEO defaults, social links) + `getSettings()` helper |

Each recipe ships its own README documenting the manual edits to
`payload.config.ts` (or `next.config.ts`, for `i18n`). The runner copies
files, installs deps, and appends env stubs to `.env.example`. It refuses to
overwrite existing files without `--force` and prints a diff for any
conflicts.

```bash
pnpm template:add blog               # install
pnpm template:add blog --dry-run     # show what would happen
pnpm template:add blog --force       # overwrite existing files
```

Once you've installed everything you want, you can `rm -rf recipes/`.

## Scripts

| Command                                                              | What                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                                                           | Next dev (Turbopack)                                             |
| `pnpm build`                                                         | Production build                                                 |
| `pnpm typecheck` / `pnpm lint` / `pnpm format`                       | Pre-commit runs these on staged files                            |
| `pnpm arch:check`                                                    | Layer-rules check (also in CI)                                   |
| `pnpm db:branch`                                                     | Create/ensure a per-dev Neon branch and point `.env.local` at it |
| `pnpm db:migrate` / `db:migrate:create <name>` / `db:migrate:status` | Payload migrations                                               |
| `pnpm template:add <name>`                                           | Install a recipe                                                 |

## Notes

- Setting `PAYLOAD_ENABLED=false` makes the site a pure static Next app:
  `/admin` returns 404 and `getPayloadSafe()` returns `null`. Useful for
  preview deploys where the DB isn't reachable.
- The base has no project-specific copy or branding. Add your own as you go.
