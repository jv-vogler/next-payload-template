"use client";

import { AnchorHeading } from "@/ui/blog/components/AnchorHeading";
import { CodeBlockCopy } from "@/ui/blog/components/CodeBlockCopy";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";

type RichTextRendererProps = {
  data: SerializedEditorState;
};

/** Replicate the heading-slug logic from core/blog.ts for client-side use. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Recursively extract text from a Lexical node tree. */
function extractNodeText(node: { type?: string; text?: string; children?: unknown[] }): string {
  // Both "text" and "code-highlight" nodes carry their content in `.text`
  if (typeof node.text === "string") return node.text;
  // Linebreak nodes → newline character
  if (node.type === "linebreak") return "\n";
  if (Array.isArray(node.children)) {
    return (node.children as Array<{ type?: string; text?: string; children?: unknown[] }>)
      .map(extractNodeText)
      .join("");
  }
  return "";
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  /** Override heading nodes to add anchor ids and a copy-link button. */
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const rawText = extractNodeText(node as { type?: string; text?: string; children?: unknown[] });
    const id = slugifyHeading(rawText);
    const tag = node.tag as string;
    const level = parseInt(tag.replace("h", ""), 10) as 2 | 3 | 4 | 5 | 6;
    return (
      <AnchorHeading id={id} level={level}>
        {children}
      </AnchorHeading>
    );
  },

  /**
   * Suppress paragraph nodes whose sole content is a fenced-code opening marker
   * (e.g. "```ts", "```typescript"). These are artifacts from seeded content
   * where the opening fence line was accidentally stored as a separate paragraph.
   */
  paragraph: ({ node, nodesToJSX }) => {
    const text = extractNodeText(
      node as { type?: string; text?: string; children?: unknown[] },
    ).trim();
    if (/^`{3}/.test(text)) return null;
    const children = nodesToJSX({ nodes: node.children });
    return children?.length ? (
      <p>{children}</p>
    ) : (
      <p>
        <br />
      </p>
    );
  },

  /** Override native Lexical code-block nodes to add a copy button. */
  code: ({ node }) => {
    // Extract the raw code text from the Lexical code-highlight/linebreak children.
    // Strip any trailing closing-fence line (```) that was accidentally stored
    // inside the code block content during seeding.
    const rawCode = extractNodeText(node as { type?: string; text?: string; children?: unknown[] })
      .replace(/\n`{3,}\s*$/, "")
      .trimEnd();
    const language = (node as unknown as { language?: string }).language;
    // Use pre-highlighted HTML from server-side enrichment if available
    const highlightedHtml = (node as unknown as { highlightedHtml?: string }).highlightedHtml;
    return <CodeBlockCopy code={rawCode} language={language} highlightedHtml={highlightedHtml} />;
  },
});

export function RichTextRenderer({ data }: RichTextRendererProps) {
  return <RichText data={data} converters={converters} />;
}
