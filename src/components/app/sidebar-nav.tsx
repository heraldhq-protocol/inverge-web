'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAV } from './nav-items';

/**
 * The nav list itself. Client only because the active item depends on the pathname; the sidebar
 * shell around it stays a Server Component (conventions §3.1).
 *
 * Active state is marked three ways — pale fill, a solid accent left edge, and `aria-current` —
 * because colour alone is not a signal (WCAG 1.4.1, conventions §5.2).
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {APP_NAV.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'relative flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-forest',
              active
                ? 'bg-accent-500/15 font-semibold text-white'
                : 'font-medium text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-500"
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
