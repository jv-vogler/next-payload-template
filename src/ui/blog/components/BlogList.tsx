"use client";

import type { Blog } from "@/core/blog";
import { formatDate } from "@/lib/date";
import { Badge } from "@/ui/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { ArrowRight, Calendar, Clock, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
// @template:i18n-start
import { useLocale, useTranslations } from "next-intl";
// @template:i18n-end

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function wasUpdated(post: Blog.Post): boolean {
  if (!post.updatedAt) return false;
  return new Date(post.updatedAt).getTime() - new Date(post.date).getTime() > ONE_DAY_MS;
}

type BlogListProps = {
  posts: Blog.Post[];
  tags?: string[];
};

export function BlogList({ posts }: BlogListProps) {
  // @template:i18n-start
  const t = useTranslations("blog");
  // @ts-ignore
  const locale = useLocale();
  // @ts-ignore
  const noPostsLabel = t("noPosts");
  // @ts-ignore
  const readingTimeFn = (minutes: number) => t("readingTime", { minutes });
  // @ts-ignore
  const updatedFn = (date: string) => t("updated", { date });
  // @ts-ignore
  const readMoreLabel = t("readMore");
  // @template:i18n-end
  // @template:no-i18n-start
  // @ts-ignore
  const noPostsLabel = "No posts yet.";
  // @ts-ignore
  const readingTimeFn = (minutes: number) => `${minutes} min read`;
  // @ts-ignore
  const updatedFn = (date: string) => `Updated ${date}`;
  // @ts-ignore
  const readMoreLabel = "Read more";
  // @template:no-i18n-end

  // @template:no-i18n-start
  // Detect locale for date formatting; fall back to "en"
  // @ts-ignore
  const [locale, setLocale] = useState("en");
  useEffect(() => {
    setLocale(navigator.language.split("-")[0] ?? "en");
  }, []);
  // @template:no-i18n-end

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-lg">{noPostsLabel}</p>
      </div>
    );
  }

  const featuredPost = posts.find((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured || post !== featuredPost);

  return (
    <div>
      {featuredPost && (
        <Link href={`/blog/${featuredPost.slug}`} className="group mb-6 block">
          <Card className="hover:bg-accent/5 transition-colors border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="default" className="mb-1">
                  Featured
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <time dateTime={featuredPost.date}>{formatDate(featuredPost.date, locale)}</time>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {readingTimeFn(featuredPost.readingTime)}
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl transition-colors group-hover:text-primary">
                    {featuredPost.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    {featuredPost.description}
                  </CardDescription>
                </div>
                {featuredPost.coverImage?.thumbnailUrl && (
                  <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-md sm:block">
                    <Image
                      src={featuredPost.coverImage.thumbnailUrl}
                      alt={featuredPost.coverImage.alt}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="grid gap-6">
        {regularPosts.map((post) => (
          <div key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {readingTimeFn(post.readingTime)}
                    </span>
                    {wasUpdated(post) && post.updatedAt && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <RefreshCw className="size-3" />
                        {updatedFn(formatDate(post.updatedAt, locale))}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl transition-colors group-hover:text-primary">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-base">
                        {post.description}
                      </CardDescription>
                    </div>

                    {post.coverImage?.thumbnailUrl && (
                      <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-md sm:block">
                        <Image
                          src={post.coverImage.thumbnailUrl}
                          alt={post.coverImage.alt}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      {readMoreLabel}
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
