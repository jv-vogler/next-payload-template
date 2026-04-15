import type { Blog } from "@/core/blog";
import Image from "next/image";

type CoverImageProps = {
  coverImage: Blog.CoverImage | null;
  title: string;
  priority?: boolean;
};

export function CoverImage({ coverImage, title, priority = false }: CoverImageProps) {
  if (!coverImage) return null;

  const src = coverImage.heroUrl ?? coverImage.url;

  return (
    <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl">
      <Image
        src={src}
        alt={coverImage.alt || title}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
      />
      {/* Subtle gradient overlay at the bottom for readability */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
