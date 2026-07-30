import { Button } from '@/components/ui/button';
import { AccountMenu } from './account-menu';
import { AppDrawer } from './app-drawer';
import { Breadcrumb } from './breadcrumb';

/**
 * 64px top bar on paper (app-mockup-kit §5). Server Component: the three interactive parts are
 * client islands, the bar itself is not (conventions §3.1).
 *
 * No search field. The mockup kit puts one here, but there is no search endpoint, and a box that
 * silently does nothing is worse than no box (brief §2). It lands with the endpoint.
 */
export function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-paper/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <AppDrawer />
        <Breadcrumb />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Button variant="primary" size="sm" href="/ideas/new">
            Start an idea
          </Button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
