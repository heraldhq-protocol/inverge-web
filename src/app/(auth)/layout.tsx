import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in to Inverge',
  description: 'Back money that has to deliver. Sign in to your Inverge account.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased">
      {children}
    </div>
  );
}
