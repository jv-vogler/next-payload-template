"use client";

import { Badge } from "@/ui/components/ui/badge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
// @template:i18n-start
import { useTranslations } from "next-intl";
// @template:i18n-end

type TagFilterProps = {
  tags: string[];
};

export function TagFilter({ tags }: TagFilterProps) {
  // @template:i18n-start
  const t = useTranslations("blog");
  // @ts-ignore
  const allTagsLabel = t("allTags");
  // @ts-ignore
  const filterByTagLabel = t("filterByTag");
  // @template:i18n-end
  // @template:no-i18n-start
  // @ts-ignore
  const allTagsLabel = "All";
  // @ts-ignore
  const filterByTagLabel = "Filter by tag";
  // @template:no-i18n-end

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTags = searchParams.getAll("tag");

  const toggleTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("tag");

      params.delete("tag");
      if (current.includes(tag)) {
        // Remove tag
        for (const t of current) {
          if (t !== tag) params.append("tag", t);
        }
      } else {
        // Add tag
        for (const t of current) {
          params.append("tag", t);
        }
        params.append("tag", tag);
      }

      router.replace(`${pathname}?${params.toString()}` as never);
    },
    [searchParams, pathname, router],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    router.replace(`${pathname}?${params.toString()}` as never);
  }, [searchParams, pathname, router]);

  if (tags.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={filterByTagLabel}>
      <button
        type="button"
        onClick={clearAll}
        aria-pressed={activeTags.length === 0}
        className="cursor-pointer"
      >
        <Badge
          variant={activeTags.length === 0 ? "default" : "outline"}
          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {allTagsLabel}
        </Badge>
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          aria-pressed={activeTags.includes(tag)}
          className="cursor-pointer"
        >
          <Badge
            variant={activeTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {tag}
          </Badge>
        </button>
      ))}
    </div>
  );
}
