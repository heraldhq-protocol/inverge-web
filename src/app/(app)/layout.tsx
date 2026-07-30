import React from 'react';
import { AppSidebar } from '@/components/app/app-sidebar';
import { AppTopbar } from '@/components/app/app-topbar';

/**
 * The app shell, identical on every logged-in screen (app-mockup-kit §5). Sidebar on the forest
 * ground at `lg` and up, off-canvas below it; content on paper, max 1200px.
 *
 * The auth routes deliberately have no shell and keep their own layout — the user is not signed in
 * yet, so a sidebar there would be a lie about the state they are in.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink selection:bg-accent-500 selection:text-white">
      <AppSidebar />

      <div className="lg:pl-60">
        <AppTopbar />
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
