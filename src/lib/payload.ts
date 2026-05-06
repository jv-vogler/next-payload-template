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
