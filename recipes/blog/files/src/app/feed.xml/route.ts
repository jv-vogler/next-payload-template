import { getAllPosts } from "@/app/actions/blog";
import { NextResponse } from "next/server";

export const revalidate = 3600;

function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

  try {
    const posts = await getAllPosts();
    // @ts-ignore
    const allPosts = posts
      .map((p) => ({ ...p, locale: "en" }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const items = allPosts
      .map((post) => {
        // @ts-ignore
        const link = `${baseUrl}/blog/${post.slug}`;
        const categories = post.tags
          .map((tag) => `    <category>${escapeXml(tag)}</category>`)
          .join("\n");
        return `  <item>
    <title>${escapeXml(post.title)}</title>
    <description>${escapeXml(post.description)}</description>
    <pubDate>${toRfc822(post.date)}</pubDate>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
${categories}
  </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Articles about software development, web technologies, and engineering.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate`,
      },
    });
  } catch (error) {
    console.error("RSS feed generation failed:", error);
    return new NextResponse("Failed to generate RSS feed.", { status: 500 });
  }
}
