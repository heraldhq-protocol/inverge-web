import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account — Inverge',
  description: 'Create your Inverge account to back money that has to deliver.',
};

export default function SignUpPage() {
  return <AuthSplitLayout initialMode="signup" />;
}
