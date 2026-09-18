import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { DesktopNavigation } from "@/features/app-shell/components/product-navigation";

export function ProductSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto bg-contrast px-4 py-6 text-white lg:flex xl:px-5">
      <div className="px-2">
        <BrandMark href="/home" inverted />
      </div>

      <div className="mt-9">
        <DesktopNavigation />
      </div>

      <Link
        href="/ideas"
        className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
      >
        <Plus className="size-4.5" aria-hidden="true" />
        Start an idea
      </Link>

      <Link
        href="/profile"
        className="mt-auto flex min-h-16 items-center gap-3 rounded-xl px-2 py-3 text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-brand/[0.18] text-sm font-bold text-white">
          AO
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            Amara Okonkwo
          </span>
          <span className="block truncate text-xs text-white/52">
            @amaraokonkwo
          </span>
        </span>
        <ChevronDown className="size-4 text-white/52" aria-hidden="true" />
      </Link>
    </aside>
  );
}
