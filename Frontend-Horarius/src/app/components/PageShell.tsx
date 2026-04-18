import type { ReactNode } from "react";

import { cn } from "./ui/utils";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  accent?: "default" | "sand" | "coral";
  className?: string;
};

type SectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <section className={cn("page-shell", className)}>
      <div className="page-shell-inner">
        <header className="page-hero animate-fade-up">
          <div className="page-hero__content">
            <div className="max-w-3xl space-y-4">
              <span className="eyebrow">{eyebrow}</span>
              <div className="space-y-3">
                <h1 className="page-title">{title}</h1>
                <p className="page-description">{description}</p>
              </div>
            </div>
            {actions ? <div className="page-actions">{actions}</div> : null}
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  accent = "default",
  className,
}: MetricCardProps) {
  return (
    <article className={cn("metric-card animate-fade-up animate-fade-up-delay-1", className)} data-accent={accent}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="metric-label">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/60 text-primary shadow-[0_18px_40px_-28px_rgba(31,109,104,0.7)]">
            {icon}
          </div>
        ) : null}
      </div>
      {helper ? <p className="metric-helper">{helper}</p> : null}
    </article>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  const hasHeader = title || description || action;

  return (
    <section className={cn("surface-panel animate-fade-up animate-fade-up-delay-2", className)}>
      {hasHeader ? (
        <div className="section-heading">
          <div className="space-y-2">
            {title ? <h2 className="section-title">{title}</h2> : null}
            {description ? <p className="section-copy">{description}</p> : null}
          </div>
          {action ? <div className="page-actions">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(hasHeader ? "mt-5" : "", contentClassName)}>{children}</div>
    </section>
  );
}

export function EmptyStatePanel({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state animate-fade-up animate-fade-up-delay-3", className)}>
      <div className="empty-state__icon">{icon}</div>
      <h3 className="text-3xl text-foreground">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}