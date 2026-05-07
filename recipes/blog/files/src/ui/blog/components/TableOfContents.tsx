"use client";

import type { Blog } from "@/core/blog";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TableOfContentsProps = {
  headings: Blog.Heading[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  // @ts-ignore
  const tocLabel = "Table of Contents";

  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const visibleMap = new Map<string, boolean>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleMap.set(entry.target.id, entry.isIntersecting);
        }

        const firstVisible = headings.find((heading) => visibleMap.get(heading.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const el of headingElements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav
        aria-label={tocLabel}
        className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
      >
        <p className="mb-3 text-sm font-semibold text-foreground">{tocLabel}</p>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id} className={cn(heading.level === 3 && "pl-4")}>
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={cn(
                  "block py-1 text-sm leading-snug transition-colors",
                  activeId === heading.id
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: collapsible */}
      <div className="mb-6 rounded-lg border border-border bg-muted/30 lg:hidden">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="toc-mobile-list"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {tocLabel}
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>
        {isOpen && (
          <ul id="toc-mobile-list" className="border-t border-border px-4 pb-3 pt-2 space-y-1">
            {headings.map((heading) => (
              <li key={heading.id} className={cn(heading.level === 3 && "pl-4")}>
                <a
                  href={`#${heading.id}`}
                  aria-current={activeId === heading.id ? "location" : undefined}
                  className={cn(
                    "block py-1 text-sm leading-snug transition-colors",
                    activeId === heading.id
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
