import type { ReactNode } from "react";

const styles = {
  success: "bg-brand/10 text-brand-strong",
  neutral: "bg-canvas text-muted",
  warning: "bg-warning/10 text-warning-strong",
  danger: "bg-danger/10 text-danger",
} as const;

export function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: keyof typeof styles;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
