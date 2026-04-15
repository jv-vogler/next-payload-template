import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { createNode, createServerFeature } from "@payloadcms/richtext-lexical";

/**
 * Server-side Payload feature that registers Lexical's built-in CodeNode and
 * CodeHighlightNode. Posts were seeded with fenced code blocks stored as
 * type:"code" / type:"code-highlight" nodes (from @lexical/code). Without
 * this feature, the admin editor throws Lexical error #17 because those node
 * types are not registered in the default lexicalEditor() config.
 */
export const LexicalCodeFeature = createServerFeature({
  feature: {
    ClientFeature: "@/features/lexicalCode/feature.client#ClientLexicalCodeFeature",
    nodes: [createNode({ node: CodeNode }), createNode({ node: CodeHighlightNode })],
  },
  key: "lexicalCode",
});
