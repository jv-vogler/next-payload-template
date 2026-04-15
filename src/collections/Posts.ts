import { revalidatePath } from "next/cache";
import type { CollectionConfig } from "payload";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const revalidateBlog = (slug?: string) => {
  // @template:i18n-start
  revalidatePath("/en/blog", "layout");
  revalidatePath("/pt/blog", "layout");
  if (slug) {
    revalidatePath(`/en/blog/${slug}`, "layout");
    revalidatePath(`/pt/blog/${slug}`, "layout");
  }
  // @template:i18n-end
  // @template:no-i18n-start
  revalidatePath("/blog", "layout");
  if (slug) {
    revalidatePath(`/blog/${slug}`, "layout");
  }
  // @template:no-i18n-end
};

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedDate", "updatedAt"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Auto-generated from the English title on create. Can be edited manually.",
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      localized: true,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description: "Optional hero image for the post.",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      localized: true,
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "publishedDate",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "yyyy-MM-dd",
        },
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === "create" && !data.slug && data.title) {
          const titleValue =
            typeof data.title === "object" ? (data.title as Record<string, string>).en : data.title;
          if (titleValue) {
            data.slug = slugify(titleValue);
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, context }) => {
        if (context.disableRevalidate) return;
        const slug = doc.slug as string | undefined;
        revalidateBlog(slug);
      },
    ],
    afterDelete: [
      async ({ doc, context }) => {
        if (context?.disableRevalidate) return;
        const slug = doc.slug as string | undefined;
        revalidateBlog(slug);
      },
    ],
  },
};
