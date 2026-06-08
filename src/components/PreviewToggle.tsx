"use client";

import { Eye, LogIn } from "lucide-react";

type PreviewToggleProps = {
  isVisitor: boolean;
  onToggle: () => void;
};

export function PreviewToggle({ isVisitor, onToggle }: PreviewToggleProps) {
  return (
    <button className="btn btn-accent preview-toggle" onClick={onToggle}>
      {isVisitor ? <LogIn size={18} /> : <Eye size={18} />}
      {isVisitor ? "Log In" : "Preview as Visitor"}
    </button>
  );
}
