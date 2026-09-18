import type { ReactNode } from "react";

import { StateIllustration } from "@/components/ui/state-illustration";

type StatePanelProps = {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  variant: "empty" | "error" | "unavailable";
};

export function StatePanel({
  action,
  description,
  eyebrow,
  title,
  variant,
}: StatePanelProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface px-5 py-9 text-center shadow-sm sm:px-8 sm:py-11">
      <StateIllustration variant={variant} />
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-balance text-2xl font-bold tracking-[-0.035em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </section>
  );
}
