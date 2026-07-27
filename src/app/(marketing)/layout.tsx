import React from 'react';
import { Nav } from '@/components/marketing/nav';
import { Footer } from '@/components/marketing/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink selection:bg-accent-500 selection:text-white">
      <Nav />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
