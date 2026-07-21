"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

export type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: { maxWidth: "400px" },
  md: { maxWidth: "540px" },
  lg: { maxWidth: "640px" },
};

export function Modal({ title, children, onClose, size = "md" }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Keyboard escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Trap focus
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className="modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="animate-scale-in"
        style={{
          width: "100%",
          ...sizeStyles[size],
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
          background: "var(--color-bg-secondary)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-2xl)",
          boxShadow: "var(--shadow-xl)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <h2
            className="font-display"
            style={{
              margin: 0,
              fontSize: "var(--text-h2)",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <button
            className="transition-fast"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all var(--duration-fast) ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-bg-hover)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
