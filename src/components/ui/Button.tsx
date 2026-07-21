"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode, useState } from "react";

type ButtonVariant = "primary" | "accent" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--color-primary)",
    color: "#fff",
    border: "1px solid transparent",
  },
  accent: {
    background: "var(--color-accent)",
    color: "var(--color-bg-dark)",
    border: "1px solid transparent",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-muted)",
    border: "1px solid var(--color-line)",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-line-strong)",
  },
  danger: {
    background: "var(--color-danger-light)",
    color: "var(--color-danger)",
    border: "1px solid transparent",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    minHeight: "32px",
    fontSize: "var(--text-small)",
    padding: "0 12px",
    gap: "var(--space-xs)",
  },
  md: {
    minHeight: "var(--touch-target)",
    fontSize: "var(--text-body)",
    padding: "0 18px",
    gap: "var(--space-sm)",
  },
  lg: {
    minHeight: "48px",
    fontSize: "var(--text-body)",
    padding: "0 24px",
    gap: "var(--space-sm)",
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: "var(--color-primary-hover)" },
  accent: { background: "var(--color-accent-hover)" },
  ghost: { background: "var(--color-bg-hover)" },
  outline: { background: "var(--color-bg-hover)" },
  danger: { background: "rgba(248,113,113,0.2)" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      style,
      disabled,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const [hovered, setHovered] = useState(false);

    return (
      <button
        ref={ref}
        className={`transition-fast ${className}`}
        disabled={disabled || loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-full)",
          fontWeight: 600,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "all var(--duration-fast) ease",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
          ...(fullWidth ? { width: "100%" } : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        {...rest}
      >
        {loading ? (
          <span
            className="spin"
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              marginRight: "var(--space-xs)",
            }}
          />
        ) : icon && iconPosition === "left" ? (
          <span style={{ display: "inline-flex" }}>{icon}</span>
        ) : null}
        {children}
        {icon && iconPosition === "right" && !loading ? (
          <span style={{ display: "inline-flex" }}>{icon}</span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
