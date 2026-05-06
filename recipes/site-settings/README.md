# site-settings recipe

Adds a Payload `Settings` global that lets the client edit site-wide values
(site name, default meta title/description, social links) without touching
code, and a `getSettings()` helper for server components.

## What gets installed

```
src/globals/Settings.ts
src/lib/settings.ts
src/seed/settings.ts
```

No new dependencies.

## Manual edits

Open `src/payload.config.ts` and:

```ts
import { Settings } from "@/globals/Settings";

// in buildConfig():
globals: [Settings],
```

Then create + run a migration:

```bash
pnpm db:migrate:create site-settings
pnpm db:migrate
```

(Optional) wire the seed in `src/seed/index.ts`:

```ts
import { seedSettings } from "@/seed/settings";
await seedSettings(payload);
```

## Using settings in pages

```tsx
// any server component or layout
import { getSettings } from "@/lib/settings";

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  return (
    <html>
      <head>
        <title>{settings?.siteName ?? "My site"}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`getSettings()` returns `null` when `PAYLOAD_ENABLED=false` (static build
mode), so always handle the `null` case in your UI.
