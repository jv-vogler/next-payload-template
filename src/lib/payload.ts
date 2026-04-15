import "server-only";
import { cache } from "react";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

const PAYLOAD_ENABLED = process.env.PAYLOAD_ENABLED !== "false";

export const getPayloadSafe = cache(async (): Promise<Payload | null> => {
  if (!PAYLOAD_ENABLED) return null;
  try {
    return await getPayload({ config });
  } catch (err: unknown) {
    if ((err as { payloadInitError?: boolean })?.payloadInitError) {
      console.warn("[payload] skipped init: missing env vars (PAYLOAD_SECRET / POSTGRES_URL)");
      return null;
    }
    throw err;
  }
});

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
