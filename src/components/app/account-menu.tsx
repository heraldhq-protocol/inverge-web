'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { useCurrentUser } from '@/lib/auth/use-user';
import { clearSessionToken } from '@/lib/api/client';
import { isPrivyConfigured } from '@/lib/env';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function AccountMenu() {
  const { ready, authenticated, user, login, logout } = useAuth();
  const { data: userProfile } = useCurrentUser();
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
      <Button variant="ghost" size="sm" href="/signin">
        Sign in
      </Button>
    );
  }

  // Reserve the button's footprint while auth resolves
  if (!ready) {
    return <div className="h-8 w-8 shrink-0 rounded-full bg-ink/5" aria-hidden="true" />;
  }

  if (!authenticated) {
    return (
      <Button variant="ghost" size="sm" onClick={() => login()}>
        Sign in
      </Button>
    );
  }

  const email = user?.email?.address ?? userProfile?.email ?? null;

  // Resolve display name / username with graceful fallbacks
  const privyUser = user as any;
  const rawDisplayName =
    userProfile?.creatorProfile?.displayName ||
    userProfile?.creator?.displayName ||
    privyUser?.google?.name ||
    (privyUser?.github?.username ? `@${privyUser.github.username}` : null) ||
    (privyUser?.twitter?.username ? `@${privyUser.twitter.username}` : null);

  // If display name is not explicitly set, use the clean part of the email (e.g. adebayo.anuoluwa02)
  const emailUsername = email ? email.split('@')[0] : null;
  const displayName = rawDisplayName || emailUsername || 'Creator';
  const avatarUrl = userProfile?.creatorProfile?.avatarUrl || userProfile?.creator?.avatarUrl || null;

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2 rounded-full pl-1 pr-2.5 transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 cursor-pointer"
      >
        <Avatar name={displayName} src={avatarUrl} size={32} />
        <span className="hidden max-w-[12rem] truncate text-sm font-medium text-ink sm:block">
          {displayName}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-lift"
        >
          {/* User Identity Header */}
          <div className="border-b border-border/80 px-4 py-3.5 bg-paper/50 flex items-center gap-3">
            <Avatar name={displayName} src={avatarUrl} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{displayName}</p>
              {email && (
                <p className="truncate text-xs text-ink-muted font-normal">{email}</p>
              )}
            </div>
          </div>

          <Link
            role="menuitem"
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:bg-accent-50 font-medium"
          >
            Creator Dashboard
          </Link>
          <Link
            role="menuitem"
            href="/ideas/my"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:bg-accent-50"
          >
            My ideas
          </Link>
          <Link
            role="menuitem"
            href="/settings"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:bg-accent-50"
          >
            Settings
          </Link>
          <Link
            role="menuitem"
            href="/verify"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:bg-accent-50"
          >
            Verification
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              clearSessionToken();
              setOpen(false);
              void logout();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-600 font-medium transition-colors hover:bg-red-50 focus-visible:outline-none border-t border-border/60 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
