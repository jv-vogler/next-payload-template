// NOTE: When this template is scaffolded with --with-i18n, setup.ts moves
// src/app/{layout,page}.tsx and src/app/blog/ under src/app/[locale]/
// and updates next.config.ts + payload.config.ts localization block.
export const locales = ["en", "pt"] as const;
export const defaultLocale = "en";
export type Locale = (typeof locales)[number];
