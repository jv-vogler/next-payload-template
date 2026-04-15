import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";

export const Settings: GlobalConfig = {
  slug: "settings",
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "admin",
  },
  hooks: {
    afterChange: [
      () => {
        revalidatePath("/", "layout");
      },
    ],
  },
  fields: [
    { name: "siteName", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "ogImage", type: "upload", relationTo: "media" },
    {
      name: "social",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};
