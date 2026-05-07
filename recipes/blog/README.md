# Blog recipe

Adds a Payload `Posts` collection, a Lexical code-block editor feature with
Shiki syntax highlighting, `/blog` and `/blog/[slug]` routes, an RSS feed at
`/feed.xml`, and the supporting UI components (table of contents, share
buttons, related posts, reading progress bar, etc.).

## What gets installed

```
src/collections/Posts.ts
src/features/lexicalCode/{feature.client,feature.server}.ts
src/core/blog.ts
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/feed.xml/route.ts
src/app/actions/blog.ts
src/ui/blog/lib/highlightCode.ts
src/ui/blog/components/*.tsx          (12 components)
src/ui/lib/jsonLd.tsx
```

Dependencies added: `@lexical/code`, `lexical`, `shiki`.

## Manual edits

The recipe runner copies files but does not touch `payload.config.ts`. After
install, open it and add three things:

```ts
// imports
import { Posts } from "@/collections/Posts";
import { LexicalCodeFeature } from "@/features/lexicalCode/feature.server";

// in the buildConfig() call:
collections: [Users, Media, Posts],

editor: lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    LexicalCodeFeature(),
  ],
}),
```

If you want blog routes to appear in `src/app/sitemap.ts`, add:

```ts
import { Blog } from "@/core/blog";
import { getAllPosts } from "@/app/actions/blog";

const posts = await getAllPosts();
const postEntries = posts.map((post) => ({
  url: `${BASE_URL}/blog/${post.slug}`,
  lastModified: post.updatedAt ?? post.date,
}));
```

## Environment

`NEXT_PUBLIC_BASE_URL` — used to build absolute URLs in Open Graph metadata
and RSS items. Defaults to `https://example.com` if unset.

## Customising

- Post copy/strings are inline English placeholders. Search the recipe for
  obvious labels (e.g. "Read more", "Related posts") and adjust.
- The collection in `src/collections/Posts.ts` ships with `title`, `slug`,
  `date`, `excerpt`, `coverImage`, `tags`, `content`, `updatedAt`. Edit there
  to add fields.
- After modifying the collection, run `pnpm db:migrate:create <name>` then
  `pnpm db:migrate`.
