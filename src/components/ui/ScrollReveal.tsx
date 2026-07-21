"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in ms before animation starts (default: 0) */
  delay?: number;
  /** Animation class to apply (default: animate-fade-in-up) */
  animation?: string;
  /** Threshold for IntersectionObserver (0-1, default: 0.1) */
  threshold?: number;
};

/**
 * Animates children when they scroll into the viewport.
 * Uses IntersectionObserver for performant detection.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  animation = "animate-fade-in-up",
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, revealed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        animation: revealed ? `${animation} 0.5s ease-out both` : "none",
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
