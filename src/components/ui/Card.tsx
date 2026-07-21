"use client";

import { ReactNode } from "react";

type CardVariant = "default" | "elevated" | "bordered" | "interactive" | "sponsored";

export type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg" | "xl" | "none";
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-line-light)",
  },
  elevated: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-line-light)",
    boxShadow: "var(--shadow-md)",
  },
  bordered: {
    background: "transparent",
    border: "1px solid var(--color-line)",
  },
  interactive: {
    background: "var(--color-bg-secondary)",
    border: "1px solid var(--color-line-light)",
    cursor: "pointer",
    transition: "all var(--duration-normal) ease",
  },
  sponsored: {
    background: "rgba(201,168,76,0.06)",
    border: "1px solid var(--color-accent)",
  },
};

const paddingStyles: Record<string, React.CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: "var(--space-md)" },
  md: { padding: "var(--space-lg)" },
  lg: { padding: "var(--space-xl)" },
  xl: { padding: "var(--space-2xl)" },
};

export function Card({
  children,
  variant = "default",
  padding = "lg",
  onClick,
  className = "",
  style,
}: CardProps) {
  const isInteractive = variant === "interactive" || onClick;

  return (
    <div
      className={`${isInteractive ? "card-hover" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        borderRadius: "var(--radius-lg)",
        ...variantStyles[variant],
        ...paddingStyles[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
