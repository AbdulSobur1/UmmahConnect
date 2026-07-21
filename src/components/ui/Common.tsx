import { ReactNode } from "react";

/* ─── Section Header ─── */
type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="row space-between" style={{ marginBottom: "var(--space-md)" }}>
      <h2 style={{ margin: 0, fontSize: "var(--text-h3)", fontWeight: 700 }}>{title}</h2>
      {action}
    </div>
  );
}

/* ─── Progress Bar ─── */
type ProgressBarProps = {
  value: number;
  max?: number;
  height?: number;
  color?: string;
  dangerColor?: string;
};
export function ProgressBar({ value, max = 10, height = 8, color = "var(--color-primary)", dangerColor = "var(--color-danger)" }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height, borderRadius: "var(--radius-full)", background: "var(--color-primary-light)", overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`,
        height: "100%",
        background: value >= max ? dangerColor : color,
        borderRadius: "var(--radius-full)",
        transition: "width var(--duration-slow) ease",
      }} />
    </div>
  );
}

/* ─── Tag / Pill ─── */
type TagProps = {
  children: ReactNode;
  variant?: "green" | "dark" | "custom";
  className?: string;
  style?: React.CSSProperties;
};
export function Tag({ children, variant = "green", className, style }: TagProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-xs)",
    padding: "4px 10px",
    borderRadius: "var(--radius-full)",
    fontSize: "var(--text-caption)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
  const variants: Record<string, React.CSSProperties> = {
    green: {
      background: "var(--color-success-light)",
      color: "var(--color-success)",
      border: "1px solid rgba(94,205,181,0.16)",
    },
    dark: {
      background: "var(--color-bg-hover)",
      color: "var(--color-text-light)",
      border: "1px solid transparent",
    },
  };
  return <span className={className} style={{ ...base, ...variants[variant], ...style }}>{children}</span>;
}

/* ─── Icon Box (44px colored square with initial) ─── */
type IconBoxProps = {
  children: ReactNode;
  size?: number;
};
export function IconBox({ children, size = 44 }: IconBoxProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "var(--radius-md)",
      background: "var(--color-success-light)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: size > 40 ? "var(--text-h4)" : "var(--text-body)",
      color: "var(--color-success)",
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

/* ─── Error State ─── */
type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};
export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="card" style={{ padding: "var(--space-2xl)" }}>
      <h2 style={{ margin: 0, fontSize: "var(--text-h3)" }}>{title}</h2>
      {message && <p className="muted" style={{ fontSize: "var(--text-body)", margin: "6px 0 var(--space-md)" }}>{message}</p>}
      <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: message ? 0 : "var(--space-md)" }}>Retry</button>
    </div>
  );
}

/* ─── Card with Icon + Title + Description ─── */
type InfoCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  extra?: ReactNode;
};
export function InfoCard({ icon, title, description, extra }: InfoCardProps) {
  return (
    <div className="card">
      <div className="row" style={{ gap: "var(--space-sm)" }}>
        {icon}
        <strong style={{ fontSize: "var(--text-body)" }}>{title}</strong>
      </div>
      <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-light)", margin: "6px 0 0", lineHeight: "var(--lh-normal)" }}>{description}</p>
      {extra}
    </div>
  );
}

/* ─── Action Row (Like, Comment, Share) ─── */
type ActionRowProps = {
  items: Array<{ icon: ReactNode; label: string; count?: number; onClick?: () => void }>;
};
export function ActionRow({ items }: ActionRowProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--space-lg)",
      marginTop: "var(--space-md)",
      paddingTop: 10,
      borderTop: "1px solid var(--color-line-light)",
      fontSize: "var(--text-body)",
      color: "var(--color-text-light)",
    }}>
      {items.map((item, i) => (
        <button
          key={i}
          className="btn-link"
          onClick={item.onClick}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", fontSize: "var(--text-body)", color: "inherit" }}
        >
          {item.icon} {item.count ?? item.label}
        </button>
      ))}
    </div>
  );
}
