import { getAllPosts, getAllTags } from "@/app/actions/blog";
import { Blog } from "@/core/blog";
import { BlogList } from "@/ui/blog/components/BlogList";
import { TagFilter } from "@/ui/blog/components/TagFilter";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles and posts.",
  openGraph: {
    title: "Blog",
    description: "Articles and posts.",
    url: `${BASE_URL}/blog`,
  },
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

type BlogPageProps = {
  searchParams: Promise<{ tag?: string | string[] }>;
};

export default async function BlogPage(props: BlogPageProps) {
  const searchParams = props.searchParams;

  const { tag } = await searchParams;

  // Normalise tag param to a single string (use the first if multiple provided)
  const activeTag = Array.isArray(tag) ? tag[0] : tag;

  // @ts-ignore
  const [allPosts, tags] = await Promise.all([getAllPosts(undefined, activeTag), getAllTags()]);

  const posts = Blog.sortFeaturedFirst(allPosts);

  return (
    <section aria-labelledby="blog-heading" className="container mx-auto max-w-4xl px-4 py-20">
      <div className="mb-12 text-center">
        <div className="relative inline-block">
          <h1 id="blog-heading" className="mb-4 text-4xl font-bold">
            Blog
          </h1>
          <a
            href="/feed.xml"
            aria-label="RSS feed"
            title="RSS feed"
            className="absolute -right-8 top-1 text-muted-foreground transition-colors hover:text-orange-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Rss className="h-5 w-5" />
          </a>
        </div>
        <p className="text-lg text-muted-foreground">Articles and posts.</p>
      </div>

      <Suspense>
        <TagFilter tags={tags} />
      </Suspense>

      <BlogList posts={posts} tags={tags} />
    </section>
  );
}
