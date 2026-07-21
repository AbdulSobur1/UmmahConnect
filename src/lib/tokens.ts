/* ═══════════════════════════════════════════════════════════════════════════
 * UmmahConnect Design Tokens
 * ───────────────────────────────────────────────────────────────────────────
 * Single source of truth for every visual decision.
 * CSS custom properties in globals.css mirror these values.
 * Import this file when you need TypeScript access to design tokens.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Colors ─── */
export const colors = {
  primary: "#1A6B5C",
  primaryHover: "#155a4d",
  primaryLight: "rgba(26,107,92,0.12)",
  primaryGlow: "rgba(26,107,92,0.2)",

  accent: "#C9A84C",
  accentHover: "#b6953f",
  accentLight: "rgba(201,168,76,0.12)",
  accentGlow: "rgba(201,168,76,0.2)",

  success: "#5ECDB5",
  successLight: "rgba(94,205,181,0.12)",

  danger: "#f87171",
  dangerLight: "rgba(248,113,113,0.12)",

  bg: {
    dark: "#0D1B1E",
    secondary: "#132420",
    light: "#FAF7F2",
    elevated: "rgba(255,255,255,0.04)",
    hover: "rgba(255,255,255,0.06)",
  },

  text: {
    primary: "#FAF7F2",
    secondary: "rgba(255,255,255,0.8)",
    muted: "rgba(255,255,255,0.55)",
    light: "#6B7E78",
    disabled: "rgba(255,255,255,0.3)",
  },

  line: "rgba(255,255,255,0.08)",
  lineLight: "rgba(255,255,255,0.06)",
  lineStrong: "rgba(255,255,255,0.12)",
} as const;

/* ─── Typography Scale ─── */
export const typography = {
  display: {
    fontSize: "clamp(44px, 6.2vw, 78px)",
    lineHeight: 1.04,
    fontWeight: 900,
    fontFamily: "var(--font-display), 'Playfair Display', serif",
  },
  heading1: {
    fontSize: "40px",
    lineHeight: 1,
    fontWeight: 700,
    fontFamily: "var(--font-display), 'Playfair Display', serif",
  },
  heading2: {
    fontSize: "24px",
    lineHeight: 1.2,
    fontWeight: 700,
    fontFamily: "var(--font-display), 'Playfair Display', serif",
  },
  heading3: {
    fontSize: "18px",
    lineHeight: 1.3,
    fontWeight: 700,
  },
  heading4: {
    fontSize: "16px",
    lineHeight: 1.4,
    fontWeight: 700,
  },
  body: {
    fontSize: "14px",
    lineHeight: 1.6,
    fontWeight: 400,
  },
  small: {
    fontSize: "13px",
    lineHeight: 1.5,
    fontWeight: 400,
  },
  caption: {
    fontSize: "11px",
    lineHeight: 1.4,
    fontWeight: 600,
  },
  label: {
    fontSize: "10px",
    lineHeight: 1.4,
    fontWeight: 900,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
  },
} as const;

/* ─── Spacing Scale ─── */
export const space = {
  xxs: "2px",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  "4xl": "40px",
  "5xl": "48px",
} as const;

/* ─── Border Radii ─── */
export const radii = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "999px",
} as const;

/* ─── Shadows ─── */
export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.2)",
  md: "0 4px 12px rgba(0,0,0,0.25)",
  lg: "0 8px 30px rgba(0,0,0,0.3)",
  xl: "0 12px 40px rgba(0,0,0,0.4)",
  glow: "0 0 20px rgba(26,107,92,0.15)",
} as const;

/* ─── Animation Durations ─── */
export const duration = {
  instant: "100ms",
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  enter: "400ms",
} as const;

/* ─── CSS Duration Name Mapping ─── */
export const cssDuration = {
  instant: "var(--duration-instant)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
  enter: "var(--duration-enter)",
} as const;

/* ─── Z-Index Scale ─── */
export const zIndex = {
  base: 1,
  nav: 20,
  dropdown: 30,
  modal: 40,
  toast: 100,
  overlay: 50,
} as const;

/* ─── Layout Constants ─── */
export const layout = {
  containerMaxWidth: "1120px",
  pagePadding: "20px",
  cardPadding: "16px",
  sectionGap: "24px",
  itemGap: "12px",
  touchTarget: "44px",
  bottomNavHeight: "60px",
} as const;

/* ─── Semantic helpers ─── */
export const semantic = {
  /* Text color based on importance */
  text: (level: "primary" | "secondary" | "muted" | "disabled") => colors.text[level],
  /* Background for card/variant */
  card: (variant: "default" | "elevated" | "sponsored" | "success") => {
    const map = {
      default: colors.bg.secondary,
      elevated: colors.bg.dark,
      sponsored: "rgba(201,168,76,0.06)",
      success: "rgba(94,205,181,0.06)",
    };
    return map[variant];
  },
} as const;
