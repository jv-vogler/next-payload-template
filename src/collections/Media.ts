import path from "path";
import type { CollectionConfig } from "payload";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: undefined },
      { name: "card", width: 768, height: undefined },
      { name: "hero", width: 1400, height: undefined },
    ],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
    },
  ],
};
