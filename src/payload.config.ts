import { buildConfig } from "payload";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
// @template:blog-start
import { Posts } from "./collections/Posts";
import { LexicalCodeFeature } from "./features/lexicalCode/feature.server";
// @template:blog-end
import { Settings } from "./globals/Settings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
    Users,
    Media,
    // @template:blog-start
    Posts,
    // @template:blog-end
  ],
  globals: [Settings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // @template:blog-start
      LexicalCodeFeature(),
      // @template:blog-end
    ],
  }),
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: vercelPostgresAdapter({ pool: { connectionString: process.env.POSTGRES_URL } }),
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
  // @template:i18n-start
  localization: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    fallback: true,
  },
  // @template:i18n-end
});
