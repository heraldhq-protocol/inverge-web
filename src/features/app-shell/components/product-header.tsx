import { Bell } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";

export function ProductHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/75 bg-canvas/92 backdrop-blur lg:hidden">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-18 sm:px-6">
        <BrandMark href="/home" />
        <div className="flex items-center gap-1.5">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Bell className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="grid size-10 place-items-center rounded-full bg-contrast text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            AO
          </Link>
        </div>
      </div>
    </header>
  );
}
