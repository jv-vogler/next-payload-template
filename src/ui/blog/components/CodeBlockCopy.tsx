"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CodeBlockCopyProps = {
  code: string;
  language?: string;
  /** Pre-highlighted HTML from server-side Shiki. When provided, skips client-side highlighting. */
  highlightedHtml?: string;
};

export function CodeBlockCopy({ code, language, highlightedHtml }: CodeBlockCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Graceful fail
    }
  };

  const hasLanguage = Boolean(language);

  return (
    <div className="not-prose group my-4">
      {hasLanguage && (
        <div className="rounded-t-md border border-b-0 border-[#44475a] bg-[#282a36] px-3 py-1 font-mono text-xs text-[#6272a4]">
          {language}
        </div>
      )}
      <div
        className={`relative overflow-hidden border border-[#44475a] ${
          hasLanguage ? "rounded-b-md" : "rounded-md"
        }`}
      >
        {highlightedHtml ? (
          <div
            className="overflow-x-auto [&>pre]:m-0! [&>pre]:rounded-none! [&>pre]:border-0! [&>pre]:p-4 [&>pre]:text-sm"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is safe (generated server-side from our own code strings)
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="overflow-x-auto bg-[#282a36] p-4 text-sm text-[#f8f8f2]">
            <code>{code}</code>
          </pre>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied!" : "Copy code"}
          className="absolute right-2 top-2 rounded border border-[#44475a] bg-[#282a36] p-1.5 text-[#6272a4] opacity-0 shadow-sm transition-opacity hover:text-[#f8f8f2] focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
