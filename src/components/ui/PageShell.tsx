import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: number;
  className?: string;
};

/**
 * PageShell — consistent page layout wrapper.
 * Provides max-width centering, padding, and background.
 */
export function PageShell({ children, maxWidth = 1120, className = "" }: PageShellProps) {
  return (
    <div
      className={className}
      style={{
        width: `min(100% - 32px, ${maxWidth}px)`,
        margin: "0 auto",
        padding: "28px 0 64px",
      }}
    >
      {children}
    </div>
  );
}
