import { getAllPosts, getPost, getRelatedPosts } from "@/app/actions/blog";
import { formatDate } from "@/lib/date";
import { enrichCodeBlocks } from "@/ui/blog/lib/highlightCode";
import { BackToTop } from "@/ui/blog/components/BackToTop";
import { BlogPost } from "@/ui/blog/components/BlogPost";
import { CoverImage } from "@/ui/blog/components/CoverImage";
import { ReadingProgressBar } from "@/ui/blog/components/ReadingProgressBar";
import { RelatedPosts } from "@/ui/blog/components/RelatedPosts";
import { ShareButtons } from "@/ui/blog/components/ShareButtons";
import { TableOfContents } from "@/ui/blog/components/TableOfContents";
import { Badge } from "@/ui/components/ui/badge";
import { BlogPostingJsonLd } from "@/ui/lib/jsonLd";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
// @template:i18n-start
import { getTranslations } from "next-intl/server";
// @template:i18n-end

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isUpdatedAfterPublish(publishedDate: string, updatedAt: string | null): boolean {
  if (!updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(publishedDate).getTime() > ONE_DAY_MS;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  // @template:i18n-start
  // @ts-ignore
  const locale = (resolvedParams as { slug: string; locale: string }).locale ?? "en";
  // @template:i18n-end

  try {
    const { post } = await getPost(slug);
    const showUpdated = isUpdatedAfterPublish(post.date, post.updatedAt);
    const coverImageUrl = post.coverImage?.heroUrl ?? post.coverImage?.url;
    // @template:i18n-start
    // @ts-ignore
    const metaUrl = `${BASE_URL}/${locale}/blog/${slug}`;
    // @ts-ignore
    const metaAlternates = {
      canonical: metaUrl,
      languages: { en: `${BASE_URL}/en/blog/${slug}`, pt: `${BASE_URL}/pt/blog/${slug}` },
    };
    // @template:i18n-end
    // @template:no-i18n-start
    // @ts-ignore
    const metaUrl = `${BASE_URL}/blog/${slug}`;
    // @ts-ignore
    const metaAlternates = { canonical: metaUrl };
    // @template:no-i18n-end

    return {
      title: post.title,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
        ...(showUpdated && post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
        tags: post.tags,
        url: metaUrl,
        ...(coverImageUrl
          ? {
              images: [
                {
                  url: coverImageUrl,
                  alt: post.coverImage?.alt ?? post.title,
                },
              ],
            }
          : {}),
      },
      alternates: metaAlternates,
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // @template:i18n-start
  // @ts-ignore
  const locale = (resolvedParams as { slug: string; locale: string }).locale;
  const t = await getTranslations({ locale, namespace: "blog" });
  // @template:i18n-end
  // @template:no-i18n-start
  // @ts-ignore
  const locale = "en";
  // @template:no-i18n-end

  try {
    const { post, content: rawContent, headings } = await getPost(slug);
    const [content, relatedPosts] = await Promise.all([
      enrichCodeBlocks(rawContent),
      getRelatedPosts(slug, post.tags, undefined, 3),
    ]);

    const showUpdated = isUpdatedAfterPublish(post.date, post.updatedAt);
    // @template:i18n-start
    // @ts-ignore
    const postUrl = `${BASE_URL}/${locale}/blog/${slug}`;
    // @template:i18n-end
    // @template:no-i18n-start
    // @ts-ignore
    const postUrl = `${BASE_URL}/blog/${slug}`;
    // @template:no-i18n-end
    const coverImageUrl = post.coverImage?.heroUrl ?? post.coverImage?.url;
    // @template:i18n-start
    // @ts-ignore
    const tocLabel = t("tableOfContents");
    // @template:i18n-end
    // @template:no-i18n-start
    // @ts-ignore
    const tocLabel = "Table of Contents";
    // @template:no-i18n-end

    return (
      <>
        <ReadingProgressBar />

        <section aria-labelledby="post-heading" className="container mx-auto max-w-5xl px-4 py-20">
          <BlogPostingJsonLd
            post={post}
            locale={locale}
            dateModified={showUpdated && post.updatedAt ? post.updatedAt : undefined}
            image={coverImageUrl}
            wordCount={post.readingTime * 200}
          />

          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {/* @template:i18n-start */}
            {t("backToList")}
            {/* @template:i18n-end */}
            {/* @template:no-i18n-start */}
            Back to Blog
            {/* @template:no-i18n-end */}
          </Link>

          {/* Cover image hero */}
          <CoverImage coverImage={post.coverImage} title={post.title} priority />

          {/* Post header */}
          <header className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
              </span>
              {post.readingTime > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {/* @template:i18n-start */}
                  {t("readingTime", { minutes: post.readingTime })}
                  {/* @template:i18n-end */}
                  {/* @template:no-i18n-start */}
                  {`${post.readingTime} min read`}
                  {/* @template:no-i18n-end */}
                </span>
              )}
              {showUpdated && post.updatedAt && (
                <Badge variant="outline" className="text-xs">
                  {/* @template:i18n-start */}
                  {t("updated", { date: formatDate(post.updatedAt, locale) })}
                  {/* @template:i18n-end */}
                  {/* @template:no-i18n-start */}
                  {`Updated ${formatDate(post.updatedAt, locale)}`}
                  {/* @template:no-i18n-end */}
                </Badge>
              )}
            </div>
            <h1 id="post-heading" className="mb-4 text-4xl font-bold tracking-tight">
              {post.title}
            </h1>
            <p className="mb-6 text-lg text-muted-foreground">{post.description}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          {/* Mobile TOC — shown before article on small screens */}
          {headings.length > 0 && (
            <div className="lg:hidden">
              <TableOfContents headings={headings} />
            </div>
          )}

          {/* Content area — two-column on desktop */}
          <div className={headings.length > 0 ? "lg:grid lg:grid-cols-[1fr_260px] lg:gap-12" : ""}>
            {/* Main article */}
            <div>
              <BlogPost content={content} />

              {/* Share buttons */}
              <div className="mt-10 border-t border-border pt-6">
                <ShareButtons url={postUrl} title={post.title} />
              </div>
            </div>

            {/* Desktop TOC sidebar */}
            {headings.length > 0 && (
              <aside className="hidden lg:block" aria-label={tocLabel}>
                <TableOfContents headings={headings} />
              </aside>
            )}
          </div>

          {/* Related posts */}
          <RelatedPosts posts={relatedPosts} locale={locale} />
        </section>

        <BackToTop />
      </>
    );
  } catch {
    notFound();
  }
}
