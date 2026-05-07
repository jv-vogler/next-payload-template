# i18n recipe

Adds [next-intl](https://next-intl.dev/) with locale-prefixed routing
(`/en/...`, `/pt/...`), JSON message catalogs, and the middleware that
detects the user's locale and rewrites the URL.

## What gets installed

```
src/proxy.ts
src/i18n/config.ts
src/i18n/routing.ts
src/i18n/request.ts
src/messages/en.json
src/messages/pt.json
```

Default locales: `en` (default) and `pt`. Edit `src/i18n/routing.ts` to
change.

Dependency added: `next-intl`.

## Manual steps

This recipe **does not relocate your routes** — that part is bug-prone in the
general case, and it's clearer to do it once, deliberately, by hand.

### 1. Move frontend routes under `[locale]`

If your frontend currently lives at:

```
src/app/(frontend)/layout.tsx
src/app/(frontend)/page.tsx
```

Move it to:

```
src/app/[locale]/(frontend)/layout.tsx
src/app/[locale]/(frontend)/page.tsx
```

### 2. Wrap the layout with `NextIntlClientProvider`

```tsx
// src/app/[locale]/(frontend)/layout.tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 3. Register the middleware

If you already have a `src/middleware.ts`, re-export from `src/proxy.ts`:

```ts
// src/middleware.ts
export { default } from "@/proxy";
export { config } from "@/proxy";
```

Otherwise rename the file: `mv src/proxy.ts src/middleware.ts`.

### 4. Wrap `next.config.ts`

```ts
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  /* …existing config… */
};

export default withNextIntl(nextConfig);
```

## Using messages

```tsx
// Server components
import { getTranslations } from "next-intl/server";
const t = await getTranslations("HomePage");
return <h1>{t("title")}</h1>;

// Client components
("use client");
import { useTranslations } from "next-intl";
const t = useTranslations("HomePage");
return <h1>{t("title")}</h1>;
```

Add keys under `src/messages/<locale>.json`. Keep both `en.json` and
`pt.json` (or whatever locales you ship) in sync.
