"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { createClientFeature } from "@payloadcms/richtext-lexical/client";

/**
 * Client-side feature that registers Lexical's built-in CodeNode and
 * CodeHighlightNode so the admin editor can parse and render posts that were
 * seeded with fenced code blocks (type: "code" / "code-highlight").
 */
export const ClientLexicalCodeFeature = createClientFeature({
  nodes: [CodeNode, CodeHighlightNode],
});
