import "server-only";

import { createHighlighter } from "shiki";

type HighlighterInstance = Awaited<ReturnType<typeof createHighlighter>>;

// Module-level singleton — initialised once per server process.
let highlighterPromise: Promise<HighlighterInstance> | null = null;

function getHighlighter(): Promise<HighlighterInstance> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["dracula"],
      langs: [
        "typescript",
        "javascript",
        "tsx",
        "jsx",
        "css",
        "html",
        "json",
        "bash",
        "sh",
        "zsh",
        "python",
        "rust",
        "go",
        "sql",
        "yaml",
        "markdown",
        "mdx",
        "plaintext",
      ],
    });
  }
  return highlighterPromise;
}

/** Highlight a code string and return the Shiki HTML output. */
export async function highlightCode(code: string, language?: string): Promise<string> {
  const highlighter = await getHighlighter();
  const lang = language && language !== "plaintext" ? language : "plaintext";
  const supported = highlighter.getLoadedLanguages();
  const safeLang = supported.includes(lang as Parameters<typeof highlighter.codeToHtml>[1]["lang"])
    ? lang
    : "plaintext";

  return highlighter.codeToHtml(code, {
    lang: safeLang as Parameters<typeof highlighter.codeToHtml>[1]["lang"],
    theme: "dracula",
  });
}

/** Recursively extract text from a Lexical node tree. */
function extractNodeText(node: { type?: string; text?: string; children?: unknown[] }): string {
  if (typeof node.text === "string") return node.text;
  if (node.type === "linebreak") return "\n";
  if (Array.isArray(node.children)) {
    return (node.children as Array<{ type?: string; text?: string; children?: unknown[] }>)
      .map(extractNodeText)
      .join("");
  }
  return "";
}

type LexicalNode = {
  type?: string;
  text?: string;
  language?: string;
  highlightedHtml?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

/**
 * Walk a serialized Lexical editor state, find code blocks, and inject
 * `highlightedHtml` into each code node. The enriched AST can then be
 * passed to the client-side RichTextRenderer where CodeBlockCopy will
 * use the pre-highlighted HTML instead of loading Shiki.
 */
export async function enrichCodeBlocks<T extends { root: { children: LexicalNode[] } }>(
  content: T,
): Promise<T> {
  // Deep-clone so we don't mutate the original
  const enriched = JSON.parse(JSON.stringify(content)) as T;

  const codeNodes: LexicalNode[] = [];
  function walk(node: LexicalNode) {
    if (node.type === "code") {
      codeNodes.push(node);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  for (const child of enriched.root.children) {
    walk(child);
  }

  // Highlight all code blocks in parallel
  await Promise.all(
    codeNodes.map(async (node) => {
      const rawCode = extractNodeText(
        node as { type?: string; text?: string; children?: unknown[] },
      )
        .replace(/\n`{3,}\s*$/, "")
        .trimEnd();
      const language = node.language;
      try {
        node.highlightedHtml = await highlightCode(rawCode, language);
      } catch {
        // Leave unhighlighted — client will show plain fallback
      }
    }),
  );

  return enriched;
}
