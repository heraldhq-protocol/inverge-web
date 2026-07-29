import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Long-form body copy for the secondary marketing pages (legal, help, guides).
 *
 * The repo intentionally has no `@tailwindcss/typography` plugin — conventions §5.1 bans
 * adding v3-era plugins without a compatibility check — so element styling is applied here
 * with v4 descendant variants. Authors write plain semantic HTML (`<p>`, `<ul>`, `<strong>`)
 * inside and it inherits the vertical rhythm and colour scale without per-element classes.
 *
 * Links step down to `accent-700`: `accent-500` on cream is ~3:1 and fails AA for text this
 * small (conventions §5.2).
 */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'text-[15px] leading-relaxed text-ink-muted',
        '[&>*+*]:mt-4',
        '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink',
        '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-accent-500',
        '[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:marker:text-ink-muted',
        '[&_li]:pl-1',
        '[&_strong]:font-semibold [&_strong]:text-ink',
        '[&_a]:font-medium [&_a]:text-accent-700 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-accent-700/40 hover:[&_a]:decoration-accent-700',
        className
      )}
    >
      {children}
    </div>
  );
}
