import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in — Inverge',
  description: 'Sign in to Inverge to browse ideas and manage your campaign pre-pledges.',
};

export default function SignInPage() {
  return <AuthSplitLayout initialMode="signin" />;
}
