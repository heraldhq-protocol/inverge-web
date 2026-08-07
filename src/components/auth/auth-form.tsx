'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { isPrivyConfigured } from '@/lib/env';

interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
}

export function AuthForm({ initialMode = 'signup' }: AuthFormProps) {
  const router = useRouter();
  const { authenticated, user, login, logout } = useAuth();

  const handlePrivyLogin = () => {
    if (isPrivyConfigured && login) {
      login();
    } else {
      alert('Demo Mode: Privy authentication modal requested');
    }
  };

  const userEmail =
    user?.email?.address ??
    user?.google?.email ??
    (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : null);

  // If already authenticated with Privy, present a clean session card
  if (authenticated) {
    return (
      <div className="w-full max-w-[380px] mx-auto px-4 sm:px-0">
        <div className="rounded-2xl border border-emerald-500/30 bg-surface p-7 shadow-lift space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-ink tracking-tight">You&apos;re Signed In</h2>
            <p className="text-sm font-medium text-ink-muted break-all">
              {userEmail ? `Connected as ${userEmail}` : 'Connected via Privy'}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 px-5 rounded-xl bg-accent-700 hover:bg-accent-900 text-white font-bold text-[14px] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Go to My Dashboard</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl border border-border bg-paper text-ink-muted hover:text-ink hover:bg-surface font-semibold text-[13px] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px] mx-auto px-4 sm:px-0 space-y-7">
      {/* Header */}
      <div className="text-left space-y-2">
        <h1 className="font-display text-2xl sm:text-[30px] font-bold text-ink tracking-tight leading-tight">
          {initialMode === 'signup' ? 'Get started with Inverge' : 'Sign in to Inverge'}
        </h1>
        <p className="text-[14px] text-ink-muted leading-relaxed">
          Sign in or create an account with Email OTP code or Google.
        </p>
      </div>

      {/* Clean Single Action Card */}
      <div className="rounded-2xl border border-border/90 bg-surface p-7 shadow-lift space-y-6">
        <button
          type="button"
          onClick={handlePrivyLogin}
          className="w-full py-4 px-6 rounded-xl bg-accent-700 hover:bg-accent-900 text-white font-bold text-[15px] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>Continue with Privy</span>
        </button>

        <div className="pt-2 border-t border-border/60 text-center">
          <span className="text-xs font-medium text-ink-muted">
            Email OTP &bull; Google Auth Supported
          </span>
        </div>
      </div>

      {/* Security & Terms Footer */}
      <div className="pt-2 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-ink-muted">
          <svg className="h-3.5 w-3.5 text-accent-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secured by Privy</span>
        </div>

        <p className="text-[11px] text-ink-muted/80">
          By continuing you agree to our{' '}
          <Link href="/terms" className="text-accent-700 hover:underline font-medium">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent-700 hover:underline font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
