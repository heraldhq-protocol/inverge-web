'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { isPrivyConfigured } from '@/lib/env';

interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
}

export function AuthForm({ initialMode = 'signup' }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('amara.okonkwo@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setIsLoading(true);

    if (isPrivyConfigured) {
      login();
      setIsLoading(false);
    } else {
      // Graceful fallback when Privy ID is not set in dev env
      setTimeout(() => {
        setIsLoading(false);
        alert(`Demo mode: Code requested for ${email}`);
      }, 600);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'x') => {
    if (isPrivyConfigured) {
      login();
    } else {
      alert(`Demo mode: ${provider} authentication selected`);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight leading-snug">
          {mode === 'signup' ? 'Create your Inverge account' : 'Sign in to Inverge'}
        </h1>
        <p className="text-[14px] text-ink-muted mt-2 leading-normal">
          We&apos;ll email you a 6-digit code. There&apos;s no password to remember.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[13px] font-medium text-ink mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amara.okonkwo@gmail.com"
            className={`w-full px-3.5 py-2.5 rounded-md border text-[14px] text-ink bg-paper/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-500 transition-colors placeholder:text-ink-muted/50 ${
              error ? 'border-red-400 bg-red-50/50' : 'border-border'
            }`}
          />
          {error && (
            <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-md bg-accent-700 hover:bg-accent-900 text-white font-medium text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-60 shadow-xs"
        >
          {isLoading ? 'Sending code...' : 'Email me a code'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-7 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-paper px-3 text-[13px] text-ink-muted">
          or
        </span>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md border border-border bg-surface text-ink text-[14px] font-medium hover:bg-accent-50/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin('x')}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md border border-border bg-surface text-ink text-[14px] font-medium hover:bg-accent-50/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 shadow-xs"
        >
          <svg className="w-4 h-4 fill-ink" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Continue with X
        </button>
      </div>

      {/* Mode Switch Link */}
      <div className="mt-8 text-center text-[13px] text-ink-muted">
        {mode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-accent-700 font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500 rounded"
            >
              Sign in
            </button>
          </p>
        ) : (
          <p>
            New to Inverge?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-accent-700 font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500 rounded"
            >
              Create an account
            </button>
          </p>
        )}
      </div>

      {/* Legal Footer */}
      <div className="mt-12 text-center text-[12px] text-ink-muted">
        <p>
          By continuing you agree to our{' '}
          <Link href="/terms" className="text-accent-700 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent-700 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
