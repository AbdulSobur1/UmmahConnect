"use client";

import { InputHTMLAttributes, ReactNode, forwardRef, useState } from "react";

export type InputProps = {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      icon,
      iconPosition = "left",
      fullWidth = true,
      className = "",
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);

    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-xs)",
          width: fullWidth ? "100%" : "auto",
        }}
      >
        {label && (
          <label
            style={{
              fontSize: "var(--text-small)",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
            }}
          >
            {label}
          </label>
        )}
        <div
          className={className}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            minHeight: "var(--touch-target)",
            background: "var(--color-bg-secondary)",
            border: `1px solid ${
              hasError
                ? "var(--color-danger)"
                : focused
                  ? "var(--color-primary)"
                  : "var(--color-line)"
            }`,
            borderRadius: "var(--radius-md)",
            padding: "0 14px",
            transition: "all var(--duration-fast) ease",
            boxShadow: focused
              ? "0 0 0 3px var(--color-primary-glow)"
              : hasError
                ? "0 0 0 3px rgba(248,113,113,0.15)"
                : "none",
            ...style,
          }}
        >
          {icon && iconPosition === "left" && (
            <span
              style={{
                display: "inline-flex",
                color: focused ? "var(--color-primary)" : "var(--color-text-muted)",
                transition: "color var(--duration-fast) ease",
              }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-body)",
              fontWeight: 400,
              outline: "none",
              minHeight: "calc(var(--touch-target) - 6px)",
              width: "100%",
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {icon && iconPosition === "right" && (
            <span
              style={{
                display: "inline-flex",
                color: focused ? "var(--color-primary)" : "var(--color-text-muted)",
                transition: "color var(--duration-fast) ease",
              }}
            >
              {icon}
            </span>
          )}
        </div>
        {helper && !hasError && (
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-light)",
            }}
          >
            {helper}
          </span>
        )}
        {error && (
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
