import React from 'react';
import { AppTopbar } from '@/components/app/app-topbar';

/**
 * The app shell: a top bar and a content column, nothing else.
 *
 * The sidebar was removed deliberately. Phase 0 ships idea validation only — campaigns are not live and
 * verification is a later piece of work — so a rail would have carried three links to surfaces a reader
 * cannot act on. Content gets the full width instead, which matters most on the feed.
 *
 * Auth routes keep their own layout and no chrome at all: the user is not signed in yet, so app chrome
 * there would be a lie about the state they are in.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // `min-w-0 w-full` is load-bearing, not decoration. The root layout makes <body> a flex column, and a
    // flex item's default `min-width: auto` refuses to shrink below its content — so a wide descendant
    // (a card lane, a chip row) widened the whole document even though every one of those components
    // clipped correctly on its own. That is why the horizontal scrollbar appeared at page level while
    // each section looked fine in isolation.
    <div className="min-h-dvh w-full min-w-0 bg-paper text-ink selection:bg-accent-500 selection:text-white">
      <AppTopbar />
      <main className="mx-auto w-full min-w-0 max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
