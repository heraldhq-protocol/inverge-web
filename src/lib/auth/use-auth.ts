'use client';

import { usePrivy, useLogin } from '@privy-io/react-auth';

// The ONLY module (besides providers.tsx) that imports the Privy SDK hooks.
// Swapping wallet providers = rewrite these two files, nothing else (plan §3 frontend caveat).
export function useAuth() {
  const { ready, authenticated, user, logout, exportWallet, connectWallet } = usePrivy();
  const { login } = useLogin();
  return { ready, authenticated, user, login, logout, exportWallet, connectWallet };
}
