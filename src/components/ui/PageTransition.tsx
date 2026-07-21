"use client";

import { ReactNode } from "react";

export type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Wraps page content with a fade-in + staggered entrance animation.
 * Apply this at the top level of every screen component.
 * The stagger affects direct children of the wrapper.
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

export type StaggerProps = {
  children: ReactNode;
  as?: "div" | "section" | "article" | "aside";
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Wraps children with staggered entrance animation.
 * Each direct child will fade-in-up with a 50ms delay between them.
 */
export function Stagger({
  children,
  as: Tag = "div",
  className = "",
  style,
}: StaggerProps) {
  return (
    <Tag className={`stagger-children ${className}`} style={style}>
      {children}
    </Tag>
  );
}
