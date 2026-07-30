import { Logo } from '@/components/ui/logo';
import { SidebarNav } from './sidebar-nav';

/**
 * Fixed 240px sidebar on the forest ground (app-mockup-kit §5). Desktop only — below `lg` the same
 * nav is reached through the top bar's menu button, which opens <AppDrawer />.
 */
export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-forest px-4 py-5 lg:flex">
      <div className="px-2">
        <Logo variant="dark" />
      </div>

      <div className="mt-8 flex-1">
        <SidebarNav />
      </div>

      {/* The guarantee, restated where a logged-in creator sees it daily. Not a sales line. */}
      <p className="mt-6 rounded-lg bg-white/5 px-3 py-3 text-xs leading-relaxed text-white/55">
        Money for a funded campaign is released in stages, and only after backers have had time to
        review what was delivered.
      </p>
    </aside>
  );
}
