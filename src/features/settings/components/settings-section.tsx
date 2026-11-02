import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A settings group: one titled surface with an optional status and a body.
 *
 * The section owns the card chrome so panels can sit beside one another in a
 * balanced grid without each child drawing its own competing border. Rows and
 * forms inside are separated by the warm hairline only.
 */
export function SettingsSection({
  action,
  children,
  description,
  icon: Icon,
  id,
  status,
  title,
  tone = "default",
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  id: string;
  status?: ReactNode;
  title: string;
  tone?: "danger" | "default";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-36 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_34px_rgba(13,29,21,0.04)]"
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
        <span
          aria-hidden="true"
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${
            tone === "danger"
              ? "bg-danger/[0.08] text-danger"
              : "bg-brand/[0.09] text-brand-strong"
          }`}
        >
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2
              id={`${id}-title`}
              className="text-base font-bold tracking-[-0.02em] text-ink sm:text-lg"
            >
              {title}
            </h2>
            {status}
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted sm:text-sm">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

/** Row container inside a section. The section supplies the surrounding card. */
export function SettingsCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={`divide-y divide-border/70 ${className}`}>{children}</ul>
  );
}
