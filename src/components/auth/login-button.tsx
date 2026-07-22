'use client';

import { useAuth } from '@/lib/auth/use-auth';
import { isPrivyConfigured } from '@/lib/env';

function PrivyLoginButton() {
  const { ready, authenticated, login, logout } = useAuth();
  const base =
    'rounded-full px-4 py-1.5 text-sm font-medium transition disabled:opacity-50';
  if (!ready) {
    return (
      <button disabled className={`${base} bg-foreground/10`}>
        …
      </button>
    );
  }
  return authenticated ? (
    <button onClick={() => logout()} className={`${base} bg-foreground/10 hover:bg-foreground/20`}>
      Sign out
    </button>
  ) : (
    <button onClick={() => login()} className={`${base} bg-foreground text-background hover:opacity-90`}>
      Sign in
    </button>
  );
}

export function LoginButton() {
  if (!isPrivyConfigured) {
    return (
      <span
        title="Set NEXT_PUBLIC_PRIVY_APP_ID to enable sign-in"
        className="rounded-full px-4 py-1.5 text-sm text-foreground/40"
      >
        Sign in
      </span>
    );
  }
  return <PrivyLoginButton />;
}
