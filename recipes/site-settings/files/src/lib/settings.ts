import "server-only";
import { cache } from "react";
import { getPayloadSafe } from "@/lib/payload";

export type SettingsData = {
  siteName: string;
  description: string;
  ogImageUrl: string | null;
  social: { label: string; url: string }[];
};

export const getSettings = cache(async (): Promise<SettingsData | null> => {
  const payload = await getPayloadSafe();
  if (!payload) return null;
  const global = await payload.findGlobal({ slug: "settings" });
  return {
    siteName: global.siteName ?? "",
    description: global.description ?? "",
    ogImageUrl:
      typeof global.ogImage === "object" && global.ogImage?.url ? global.ogImage.url : null,
    social: Array.isArray(global.social) ? global.social : [],
  };
});
