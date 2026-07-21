"use client";

import { ReactNode } from "react";

type EmptyStateVariant = "default" | "compact";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: EmptyStateVariant;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className="animate-scale-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isCompact ? "var(--space-xl)" : "var(--space-3xl) var(--space-xl)",
        gap: isCompact ? "var(--space-sm)" : "var(--space-md)",
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-line-light)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {icon && (
        <div
          style={{
            width: isCompact ? 40 : 56,
            height: isCompact ? 40 : 56,
            borderRadius: "var(--radius-full)",
            background: "var(--color-accent-light)",
            color: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isCompact ? 20 : 28,
          }}
        >
          {icon}
        </div>
      )}
      <strong
        style={{
          fontSize: isCompact ? "var(--text-h4)" : "var(--text-h3)",
          color: "var(--color-text-primary)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </strong>
      {description && (
        <p
          className="muted"
          style={{
            fontSize: "var(--text-body)",
            margin: 0,
            maxWidth: 320,
            lineHeight: "var(--lh-relaxed)",
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: "var(--space-sm)" }}>{action}</div>}
    </div>
  );
}
