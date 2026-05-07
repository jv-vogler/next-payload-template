"use client";

import { useEffect, useRef } from "react";

export function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      if (barRef.current) {
        barRef.current.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    };

    const handleScroll = () => {
      if (prefersReducedMotion) {
        updateProgress();
        return;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="fixed top-0 right-0 left-0 z-50 h-[3px] w-full bg-transparent"
      aria-hidden="true"
      role="presentation"
    >
      <div ref={barRef} className="h-full bg-primary" style={{ width: "0%", transition: "none" }} />
    </div>
  );
}
