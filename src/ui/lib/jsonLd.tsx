import type { Blog } from "@/core/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

type PersonJsonLdProps = {
  name: string;
  url?: string;
  jobTitle?: string;
  sameAs?: string[];
};

export function PersonJsonLd({ name, url = BASE_URL, jobTitle, sameAs = [] }: PersonJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    jobTitle,
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

type WebSiteJsonLdProps = {
  name: string;
  url?: string;
  description?: string;
};

export function WebSiteJsonLd({ name, url = BASE_URL, description }: WebSiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

type BlogPostingJsonLdProps = {
  post: Blog.Post;
  locale: string;
  dateModified?: string;
  image?: string;
  wordCount?: number;
};

export function BlogPostingJsonLd({
  post,
  locale,
  dateModified,
  image,
  wordCount,
}: BlogPostingJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    // @template:i18n-start
    // inLanguage: locale === "pt" ? "pt-BR" : "en-US",
    // @template:i18n-end
    // @template:no-i18n-start
    inLanguage: "en-US",
    // @template:no-i18n-end
    author: {
      "@type": "Person",
      name: "Author",
      url: BASE_URL,
    },
    // @template:i18n-start
    // url: `${BASE_URL}/${locale}/blog/${post.slug}`,
    // @template:i18n-end
    // @template:no-i18n-start
    url: `${BASE_URL}/blog/${post.slug}`,
    // @template:no-i18n-end
    keywords: post.tags.join(", "),
  };

  if (dateModified) jsonLd.dateModified = dateModified;
  if (image) jsonLd.image = image;
  if (wordCount !== undefined) jsonLd.wordCount = wordCount;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
