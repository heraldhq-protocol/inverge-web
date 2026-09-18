import type { ReactNode } from "react";

export function SettingsSection({
  children,
  description,
  id,
  title,
}: {
  children: ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-4">
        <h2
          id={`${id}-title`}
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-5 text-muted">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_35px_rgba(13,29,21,0.035)]">
      {children}
    </ul>
  );
}
