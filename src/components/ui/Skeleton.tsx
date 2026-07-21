"use client";

type SkeletonVariant = "text" | "card" | "circle" | "rect";

export type SkeletonProps = {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  style?: React.CSSProperties;
};

export function Skeleton({
  variant = "card",
  width,
  height,
  lines = 3,
  style,
}: SkeletonProps) {
  if (variant === "text") {
    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-sm)",
          width: width ?? "100%",
          ...style,
        }}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              minHeight: 12,
              height: 12,
              borderRadius: "var(--radius-sm)",
              width: i === lines - 1 ? "60%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div
        className="skeleton"
        style={{
          width: width ?? 44,
          height: height ?? 44,
          borderRadius: "50%",
          minHeight: 0,
          ...style,
        }}
      />
    );
  }

  if (variant === "rect") {
    return (
      <div
        className="skeleton"
        style={{
          width: width ?? "100%",
          height: height ?? 100,
          borderRadius: "var(--radius-md)",
          minHeight: 0,
          ...style,
        }}
      />
    );
  }

  // card variant
  return (
    <div
      className="skeleton"
      style={{
        width: width ?? "100%",
        height: height ?? 180,
        borderRadius: "var(--radius-lg)",
        minHeight: 0,
        ...style,
      }}
    />
  );
}
