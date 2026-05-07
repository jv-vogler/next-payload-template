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

  try {
    const { post } = await getPost(slug);
    const showUpdated = isUpdatedAfterPublish(post.date, post.updatedAt);
    const coverImageUrl = post.coverImage?.heroUrl ?? post.coverImage?.url;
    // @ts-ignore
    const metaUrl = `${BASE_URL}/blog/${slug}`;
    // @ts-ignore
    const metaAlternates = { canonical: metaUrl };

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

  // @ts-ignore
  const locale = "en";

  try {
    const { post, content: rawContent, headings } = await getPost(slug);
    const [content, relatedPosts] = await Promise.all([
      enrichCodeBlocks(rawContent),
      getRelatedPosts(slug, post.tags, undefined, 3),
    ]);

    const showUpdated = isUpdatedAfterPublish(post.date, post.updatedAt);
    // @ts-ignore
    const postUrl = `${BASE_URL}/blog/${slug}`;
    const coverImageUrl = post.coverImage?.heroUrl ?? post.coverImage?.url;
    // @ts-ignore
    const tocLabel = "Table of Contents";

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
            Back to Blog
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
                  {`${post.readingTime} min read`}
                </span>
              )}
              {showUpdated && post.updatedAt && (
                <Badge variant="outline" className="text-xs">
                  {`Updated ${formatDate(post.updatedAt, locale)}`}
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
