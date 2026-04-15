import { Blog, type PayloadPost } from "@/core/blog";
import { getPayloadSafe } from "@/lib/payload";
import type { SerializedEditorState } from "lexical";
import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import { cache } from "react";

// @template:i18n-start
// import type { Locale } from '@/i18n/config'
// @template:i18n-end

export const getAllPosts = cache(async function getAllPosts(
  // @template:i18n-start
  locale = "en",
  // @template:i18n-end
  tag?: string,
): Promise<Blog.Post[]> {
  const payload = await getPayloadSafe();
  if (!payload) return [];

  const where: Where = {
    _status: { equals: "published" },
  };

  if (tag) {
    where["tags.tag"] = { equals: tag };
  }

  const { docs } = await payload.find({
    collection: "posts",
    // @template:i18n-start
    locale: locale as "en" | "pt",
    // @template:i18n-end
    where,
    sort: "-publishedDate",
    limit: 100,
    depth: 1,
    overrideAccess: true,
  });

  return (docs as PayloadPost[]).map((doc) => Blog.fromPayload(doc, locale));
});

/** Return a deduplicated, alphabetically sorted list of all tags in use. */
export const getAllTags = cache(async function getAllTags(
  // @template:i18n-start
  locale = "en",
  // @template:i18n-end
): Promise<string[]> {
  const posts = await getAllPosts(
    // @template:i18n-start
    locale,
    // @template:i18n-end
  );
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
});

/**
 * Return up to `limit` posts related to the given slug, ranked by shared-tag
 * overlap then by date descending. Falls back to most-recent posts when no
 * tags overlap.
 */
export const getRelatedPosts = cache(async function getRelatedPosts(
  slug: string,
  tags: string[],
  // @template:i18n-start
  locale = "en",
  // @template:i18n-end
  limit = 3,
): Promise<Blog.Post[]> {
  const all = await getAllPosts(
    // @template:i18n-start
    locale,
    // @template:i18n-end
  );
  const others = all.filter((post) => post.slug !== slug);

  const scored = others.map((post) => {
    const shared = post.tags.filter((tag) => tags.includes(tag)).length;
    return { post, shared };
  });

  scored.sort((a, b) => {
    if (b.shared !== a.shared) return b.shared - a.shared;
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });

  return scored.slice(0, limit).map((scoredPost) => scoredPost.post);
});

export const getPost = cache(async function getPost(
  slug: string,
  // @template:i18n-start
  locale = "en",
  // @template:i18n-end
): Promise<{
  post: Blog.Post;
  content: SerializedEditorState;
  headings: Blog.Heading[];
}> {
  const payload = await getPayloadSafe();
  if (!payload) throw new Error("Payload unavailable — cannot fetch post");

  const { docs } = await payload.find({
    collection: "posts",
    // @template:i18n-start
    locale: locale as "en" | "pt",
    // @template:i18n-end
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  });

  if (!docs.length) {
    throw new Error(`Post not found: ${slug}`);
  }

  const doc = docs[0] as PayloadPost;

  return {
    post: Blog.fromPayload(doc, locale),
    content: doc.content,
    headings: Blog.extractHeadings(doc.content),
  };
});

/** Cached minimal post data for CommandPalette — persists across requests for 1 hour. */
export const getCachedMinimalPosts = unstable_cache(
  async (
    // @template:i18n-start
    locale = "en",
    // @template:i18n-end
  ) => {
    const posts = await getAllPosts(
      // @template:i18n-start
      locale,
      // @template:i18n-end
    );
    return posts.map(({ slug, title, tags }) => ({ slug, title, tags }));
  },
  ["command-palette-posts"],
  { revalidate: 3600 },
);

/** Return the featured post (or most recent) for the hero section. */
export const getHeroPost = cache(async function getHeroPost(
  // @template:i18n-start
  locale = "en",
  // @template:i18n-end
) {
  const posts = await getAllPosts(
    // @template:i18n-start
    locale,
    // @template:i18n-end
  );
  const featured = posts.find((p) => p.featured);
  const post = featured ?? posts[0] ?? null;
  if (!post) return null;
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    readingTime: post.readingTime,
    tags: post.tags,
    coverImage: post.coverImage,
  };
});
