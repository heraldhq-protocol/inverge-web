'use client';

import { usePathname } from 'next/navigation';
import { crumbFor } from './nav-items';

/** Page label in the top bar. Client only for `usePathname`; it renders one string. */
export function Breadcrumb() {
  const pathname = usePathname();
  return (
    <span className="truncate text-sm font-semibold text-ink" aria-live="polite">
      {crumbFor(pathname)}
    </span>
  );
}
