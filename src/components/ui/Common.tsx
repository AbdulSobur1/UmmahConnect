import { ReactNode } from "react";

/* ─── Section Header ─── */
type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
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
export function ProgressBar({ value, max = 10, height = 8, color = "var(--color-primary)", dangerColor = "#f87171" }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height, borderRadius: 999, background: "rgba(26,107,92,0.14)", overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`,
        height: "100%",
        background: value >= max ? dangerColor : color,
        borderRadius: 999,
        transition: "width 300ms ease",
      }} />
    </div>
  );
}

/* ─── Tag / Pill ─── */
type TagProps = {
  children: ReactNode;
  variant?: "green" | "dark" | "custom";
  style?: React.CSSProperties;
};
export function Tag({ children, variant = "green", style }: TagProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: "100px",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
  const variants: Record<string, React.CSSProperties> = {
    green: {
      background: "rgba(94,205,181,0.1)",
      color: "var(--color-success)",
      border: "1px solid rgba(94,205,181,0.16)",
    },
    dark: {
      background: "rgba(255,255,255,0.06)",
      color: "var(--color-muted-light)",
      border: "1px solid transparent",
    },
  };
  return <span style={{ ...base, ...variants[variant], ...style }}>{children}</span>;
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
      borderRadius: 12,
      background: "rgba(94,205,181,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: size > 40 ? 16 : 14,
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
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      {message && <p className="muted" style={{ fontSize: 14, margin: "6px 0 12px" }}>{message}</p>}
      <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: message ? 0 : 12 }}>Retry</button>
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
    <div className="card" style={{ padding: "var(--card-padding)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <strong style={{ fontSize: 14 }}>{title}</strong>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-muted-light)", margin: "6px 0 0", lineHeight: 1.5 }}>{description}</p>
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
      gap: 16,
      marginTop: 12,
      paddingTop: 10,
      borderTop: "1px solid rgba(255,255,255,0.06)",
      fontSize: 14,
      color: "var(--color-muted-light)",
    }}>
      {items.map((item, i) => (
        <button
          key={i}
          className="btn-link"
          onClick={item.onClick}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "inherit" }}
        >
          {item.icon} {item.count ?? item.label}
        </button>
      ))}
    </div>
  );
}
