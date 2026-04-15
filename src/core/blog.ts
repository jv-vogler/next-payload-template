import type { SerializedEditorState } from "lexical";

// ---------------------------------------------------------------------------
// Payload raw document type (loose, until payload-types.ts is generated)
// ---------------------------------------------------------------------------

type PayloadMediaObject = {
  url: string;
  alt: string;
  sizes?: {
    thumbnail?: { url: string };
    card?: { url: string };
    hero?: { url: string };
  };
};

export type PayloadPost = {
  id: string | number;
  slug: string;
  title: string;
  description: string;
  content: SerializedEditorState;
  tags?: Array<{ tag: string }>;
  publishedDate: string;
  updatedAt?: string;
  featured?: boolean;
  coverImage?: PayloadMediaObject | string | number | null;
  _status?: string;
};

// ---------------------------------------------------------------------------
// Internal Lexical node shape (minimal)
// ---------------------------------------------------------------------------

type LexicalNode = {
  type: string;
  text?: string;
  tag?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Blog namespace
// ---------------------------------------------------------------------------

export namespace Blog {
  // ---- Domain types --------------------------------------------------------

  export type CoverImage = {
    url: string;
    alt: string;
    thumbnailUrl?: string;
    cardUrl?: string;
    heroUrl?: string;
  };

  export type Heading = {
    id: string;
    text: string;
    level: 2 | 3;
  };

  export type Post = {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    published: boolean;
    locale: string;
    readingTime: number;
    updatedAt: string | null;
    featured: boolean;
    coverImage: CoverImage | null;
  };

  // ---- Sorting & filtering -------------------------------------------------

  export function sortByDate(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /** Featured posts first, then sorted by date descending. */
  export function sortFeaturedFirst(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  export function filterPublished(posts: Post[]): Post[] {
    return posts.filter((post) => post.published);
  }

  // ---- Content analysis ----------------------------------------------------

  /**
   * Recursively extract all text content from a Lexical SerializedEditorState.
   * Returns a concatenated string of all text nodes.
   */
  function extractText(node: LexicalNode): string {
    if (node.type === "text" && typeof node.text === "string") {
      return node.text;
    }
    if (Array.isArray(node.children)) {
      return node.children.map(extractText).join(" ");
    }
    return "";
  }

  /**
   * Compute estimated reading time in minutes from Lexical content.
   * Uses 200 words per minute. Minimum of 1 minute.
   */
  export function computeReadingTime(content: SerializedEditorState): number {
    const root = content.root as unknown as LexicalNode;
    const text = extractText(root);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  /**
   * Slugify a heading text for use as an HTML id attribute.
   */
  function slugifyHeading(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Recursively extract all text content from a single Lexical node subtree
   * (used specifically for heading text extraction).
   */
  function extractNodeText(node: LexicalNode): string {
    if (node.type === "text" && typeof node.text === "string") {
      return node.text;
    }
    if (Array.isArray(node.children)) {
      return node.children.map(extractNodeText).join("");
    }
    return "";
  }

  /**
   * Extract h2 and h3 headings from Lexical content for use in a Table of Contents.
   * Returns an array of { id, text, level } objects sorted by document order.
   */
  export function extractHeadings(content: SerializedEditorState): Heading[] {
    const headings: Heading[] = [];

    function walk(node: LexicalNode): void {
      if (node.type === "heading" && (node.tag === "h2" || node.tag === "h3")) {
        const text = extractNodeText(node);
        headings.push({
          id: slugifyHeading(text),
          text,
          level: node.tag === "h2" ? 2 : 3,
        });
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    }

    walk(content.root as unknown as LexicalNode);
    return headings;
  }

  // ---- Payload mapping -----------------------------------------------------

  function resolveCoverImage(raw: PayloadPost["coverImage"]): CoverImage | null {
    if (!raw || typeof raw === "string" || typeof raw === "number") return null;
    return {
      url: raw.url,
      alt: raw.alt,
      thumbnailUrl: raw.sizes?.thumbnail?.url,
      cardUrl: raw.sizes?.card?.url,
      heroUrl: raw.sizes?.hero?.url,
    };
  }

  export function fromPayload(doc: PayloadPost, locale: string): Post {
    return {
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      date: doc.publishedDate,
      tags: (doc.tags ?? []).map((tag) => tag.tag),
      published: doc._status === "published",
      locale,
      readingTime: computeReadingTime(doc.content),
      updatedAt: doc.updatedAt ?? null,
      featured: doc.featured ?? false,
      coverImage: resolveCoverImage(doc.coverImage),
    };
  }
}
