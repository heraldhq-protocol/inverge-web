import React from 'react';

/**
 * Calm direction with the action attached — not an apology (conventions §7). No illustration, no
 * mascot, no emoji, no "Oops".
 */
export function EmptyState({
  title,
  body,
  actions,
}: {
  title: string;
  body?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>}
      {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}
