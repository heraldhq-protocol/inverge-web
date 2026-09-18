import Link from "next/link";

export function ProductFooter() {
  return (
    <footer className="border-t border-border bg-surface/55 px-5 py-7 pb-24 text-xs text-muted sm:px-8 lg:px-10 lg:pb-7 xl:px-12">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Inverge. Rewards and donation crowdfunding only.</p>
        <nav
          aria-label="Product footer"
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          <Link className="hover:text-ink" href="/help">
            Help
          </Link>
          <Link className="hover:text-ink" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-ink" href="/terms">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
