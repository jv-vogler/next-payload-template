"use client";

import { Check, Link2, Linkedin, Share2, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
// @template:i18n-start
import { useTranslations } from "next-intl";
// @template:i18n-end

type ShareButtonsProps = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: ShareButtonsProps) {
  // @template:i18n-start
  const t = useTranslations("blog");
  const tA11y = useTranslations("a11y");
  // @ts-ignore
  const sharePostLabel = t("sharePost");
  // @ts-ignore
  const copyLinkLabel = t("copyLink");
  // @ts-ignore
  const linkCopiedLabel = t("linkCopied");
  // @ts-ignore
  const opensInNewTabLabel = tA11y("opensInNewTab");
  // @template:i18n-end
  // @template:no-i18n-start
  // @ts-ignore
  const sharePostLabel = "Share post";
  // @ts-ignore
  const copyLinkLabel = "Copy link";
  // @ts-ignore
  const linkCopiedLabel = "Link copied!";
  // @ts-ignore
  const opensInNewTabLabel = "opens in new tab";
  // @template:no-i18n-end

  const [copied, setCopied] = useState(false);
  // Start as false so server and initial client render agree (no navigator on server).
  // Set to true after mount only if the Web Share API is actually available.
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Graceful fail
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // Dismissed or not supported — graceful fail
    }
  };

  const buttonClass =
    "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={sharePostLabel}>
      {/* Mobile: Web Share API — only rendered after mount to avoid hydration mismatch */}
      {hasNativeShare ? (
        <button type="button" onClick={handleNativeShare} className={buttonClass}>
          <Share2 className="size-4" />
          {sharePostLabel}
        </button>
      ) : (
        <>
          {/* Desktop: individual share buttons */}
          <a
            href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on X / Twitter — ${opensInNewTabLabel}`}
            className={buttonClass}
          >
            <Twitter className="size-4" />X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on LinkedIn — ${opensInNewTabLabel}`}
            className={buttonClass}
          >
            <Linkedin className="size-4" />
            LinkedIn
          </a>
        </>
      )}

      {/* Copy link — always visible */}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copyLinkLabel}
        className={buttonClass}
      >
        {copied ? (
          <>
            <Check className="size-4 text-green-500" />
            {linkCopiedLabel}
          </>
        ) : (
          <>
            <Link2 className="size-4" />
            {copyLinkLabel}
          </>
        )}
      </button>
    </div>
  );
}
