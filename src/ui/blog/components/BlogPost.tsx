import type { SerializedEditorState } from "lexical";
import { RichTextRenderer } from "./RichTextRenderer";

type BlogPostProps = {
  content: SerializedEditorState;
};

export function BlogPost({ content }: BlogPostProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
      <RichTextRenderer data={content} />
    </article>
  );
}
