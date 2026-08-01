import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { AccountMenu } from './account-menu';
import { TopicsMenu } from './topics-menu';

/**
 * The app's only chrome.
 *
 * There is no sidebar. Phase 0 is idea validation: campaigns are not live and verification only matters
 * on the path to receiving money, so a rail would be three links to things a reader cannot use yet.
 *
 * Weight is deliberate. The wordmark drops to the `sm` size because a logo scaled for a landing page
 * out-shouts the page's own heading, and the two right-hand controls are ranked rather than matched:
 * "Start an idea" is the one action this product wants, so it is the only filled control up here, and
 * sign-in sits beside it as plain text. Two equally heavy pills read as two equally important choices.
 *
 * Server Component; the account menu and the topics panel are the only client islands.
 */
export function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo variant="light" size="sm" />

        <nav aria-label="Main" className="hidden items-center sm:flex">
          <Link
            href="/feed"
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Discover
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            My ideas
          </Link>
          <TopicsMenu />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button variant="primary" size="sm" href="/ideas/new">
            Start an idea
          </Button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
