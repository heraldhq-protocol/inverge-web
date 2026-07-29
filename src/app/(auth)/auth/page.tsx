import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in — Inverge',
  description: 'Sign in or create your Inverge account.',
};

export default function AuthPage() {
  return <AuthSplitLayout initialMode="signup" />;
}
