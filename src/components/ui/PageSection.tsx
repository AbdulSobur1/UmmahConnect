import { ReactNode } from "react";

type PageSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

/**
 * PageSection — consistent section wrapper with optional title and action.
 */
export function PageSection({ title, children, className = "", action }: PageSectionProps) {
  return (
    <section className={`page-section ${className}`}>
      {title && (
        <div className="page-section-header">
          <h2 className="page-section-title">{title}</h2>
          {action && <div className="page-section-action">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
