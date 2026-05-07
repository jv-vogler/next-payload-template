"use client";

import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type AnchorHeadingProps = {
  id: string;
  level: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
};

export function AnchorHeading({ id, level, children, className }: AnchorHeadingProps) {
  const [copied, setCopied] = useState(false);
  const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";

  // @ts-ignore
  const copyLinkLabel = "Copy link";
  // @ts-ignore
  const linkCopiedLabel = "Link copied!";

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for browsers without Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      // Update URL hash without triggering scroll
      history.replaceState(null, "", `#${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Graceful fail — do nothing
    }
  };

  return (
    <Tag id={id} className={cn("group scroll-mt-24", className)}>
      {children}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? linkCopiedLabel : copyLinkLabel}
        className={cn(
          "ml-2 inline-flex translate-y-[-1px] items-center opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          "rounded text-muted-foreground hover:text-primary",
        )}
      >
        <Link2 className="size-4" />
      </button>
    </Tag>
  );
}
