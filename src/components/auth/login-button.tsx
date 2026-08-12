'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { useCurrentUser } from '@/lib/auth/use-user';
import { isPrivyConfigured } from '@/lib/env';

function UserMenu() {
  const { authenticated, login, logout, ready } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!ready) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-slate-800/50 border border-slate-700/50" />
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={() => login()}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
      >
        <span className="relative z-10">Sign in</span>
        <svg
          className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    );
  }

  const displayName =
    currentUser?.creatorProfile?.displayName ||
    currentUser?.creator?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'User';

  const avatarUrl = currentUser?.creatorProfile?.avatarUrl;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-slate-700/60 bg-slate-900/80 p-1.5 pr-3 text-sm transition-all hover:border-emerald-500/40 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-emerald-500/40"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-slate-950">
            {initial}
          </div>
        )}
        <span className="max-w-[120px] truncate font-medium text-slate-200">{displayName}</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-white/10 bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-50 text-slate-200">
          <div className="border-b border-white/10 px-3 py-2.5">
            <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
            {currentUser?.email && (
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium tracking-wide uppercase text-emerald-400">Privy Wallet Connected</span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/ideas/create"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Idea
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
          </div>

          <div className="border-t border-white/10 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LoginButton() {
  if (!isPrivyConfigured) {
    return (
      <span
        title="Set NEXT_PUBLIC_PRIVY_APP_ID to enable sign-in"
        className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-500"
      >
        Sign in (Privy Unset)
      </span>
    );
  }
  return <UserMenu />;
}

