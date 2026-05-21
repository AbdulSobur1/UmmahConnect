import { ShieldCheck } from "lucide-react";

export function HalalBadge() {
  return (
    <span className="halal-badge">
      <ShieldCheck size={14} aria-hidden="true" />
      Halal-verified
    </span>
  );
}
