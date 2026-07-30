'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { clearSessionToken } from '@/lib/api/client';
import { isPrivyConfigured } from '@/lib/env';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

/**
 * Signed-in identity in the top bar, plus sign-out.
 *
 * The email shown here is the user's own, read from the auth session — not from any public
 * projection. Public surfaces have no name to render at all yet (see the API gap backlog), which is
 * exactly why this menu is the only place an identity appears today.
 *
 * Hand-rolled popover rather than the native Popover API: that lands in Chrome 114 / Safari 17 and
 * our floor is Chrome 111 / Safari 16.4 (conventions §0).
 */
export function AccountMenu() {
  const { ready, authenticated, user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (!isPrivyConfigured) {
    return (
      <Button variant="outline" size="sm" href="/signin">
        Sign in
      </Button>
    );
  }

  // Reserve the button's footprint while auth resolves so the bar does not jump (CLS).
  if (!ready) {
    return <div className="h-8 w-8 shrink-0 rounded-full bg-ink/5" aria-hidden="true" />;
  }

  if (!authenticated) {
    return (
      <Button variant="outline" size="sm" onClick={() => login()}>
        Sign in
      </Button>
    );
  }

  const email = user?.email?.address ?? null;
  const label = email ?? 'Your account';

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2 rounded-full pl-1 pr-2 transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      >
        <Avatar name={label} size={32} />
        <span className="hidden max-w-[12rem] truncate text-sm text-ink-muted sm:block">{label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-lift"
        >
          {email && (
            <p className="truncate border-b border-border px-4 py-3 text-xs text-ink-muted">{email}</p>
          )}
          <Link
            role="menuitem"
            href="/verify"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:bg-accent-50"
          >
            Verification
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              // Drop our session token too, not just the auth vendor's — otherwise the next
              // request still carries a bearer for a user who has signed out.
              clearSessionToken();
              setOpen(false);
              void logout();
            }}
            className="block w-full px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:bg-accent-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
