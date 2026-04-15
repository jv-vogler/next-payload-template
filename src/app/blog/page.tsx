import { getAllPosts, getAllTags } from "@/app/actions/blog";
import { Blog } from "@/core/blog";
import { BlogList } from "@/ui/blog/components/BlogList";
import { TagFilter } from "@/ui/blog/components/TagFilter";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
// @template:i18n-start
import { getTranslations } from "next-intl/server";
// @template:i18n-end

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

// @template:i18n-start
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("heading"),
    description: t("description"),
    openGraph: {
      title: `${t("heading")} | Site`,
      description: t("description"),
      url: `${BASE_URL}/${locale}/blog`,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: { en: `${BASE_URL}/en/blog`, pt: `${BASE_URL}/pt/blog` },
    },
  };
}
// @template:i18n-end
// @template:no-i18n-start
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
// @template:no-i18n-end

type BlogPageProps = {
  // @template:i18n-start
  params: Promise<{ locale: string }>;
  // @template:i18n-end
  searchParams: Promise<{ tag?: string | string[] }>;
};

export default async function BlogPage(props: BlogPageProps) {
  const searchParams = props.searchParams;
  // @template:i18n-start
  // @ts-ignore
  const { locale } = await (props as unknown as { params: Promise<{ locale: string }> }).params;
  const t = await getTranslations({ locale, namespace: "blog" });
  // @template:i18n-end

  const { tag } = await searchParams;

  // Normalise tag param to a single string (use the first if multiple provided)
  const activeTag = Array.isArray(tag) ? tag[0] : tag;

  // @template:i18n-start
  // @ts-ignore
  const [allPosts, tags] = await Promise.all([getAllPosts(locale, activeTag), getAllTags(locale)]);
  // @template:i18n-end
  // @template:no-i18n-start
  // @ts-ignore
  const [allPosts, tags] = await Promise.all([getAllPosts(undefined, activeTag), getAllTags()]);
  // @template:no-i18n-end

  const posts = Blog.sortFeaturedFirst(allPosts);

  return (
    <section aria-labelledby="blog-heading" className="container mx-auto max-w-4xl px-4 py-20">
      <div className="mb-12 text-center">
        <div className="relative inline-block">
          {/* @template:i18n-start */}
          <h1 id="blog-heading" className="mb-4 text-4xl font-bold">
            {t("heading")}
          </h1>
          {/* @template:i18n-end */}
          {/* @template:no-i18n-start */}
          <h1 id="blog-heading" className="mb-4 text-4xl font-bold">
            Blog
          </h1>
          {/* @template:no-i18n-end */}
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
        {/* @template:i18n-start */}
        <p className="text-lg text-muted-foreground">{t("description")}</p>
        {/* @template:i18n-end */}
        {/* @template:no-i18n-start */}
        <p className="text-lg text-muted-foreground">Articles and posts.</p>
        {/* @template:no-i18n-end */}
      </div>

      <Suspense>
        <TagFilter tags={tags} />
      </Suspense>

      <BlogList posts={posts} tags={tags} />
    </section>
  );
}
