import { withPayload } from "@payloadcms/next/withPayload";
// @template:i18n-start
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
// @template:i18n-end
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

// @template:i18n-start
// @ts-ignore
export default withPayload(withNextIntl(nextConfig));
// @template:i18n-end
// @template:no-i18n-start
// @ts-ignore
export default withPayload(nextConfig);
// @template:no-i18n-end
