import { Menu, X } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { Container } from "@/features/marketing/components/container";

const navigation = [
  { href: "/discover", label: "Ideas" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Journal" },
] as const;

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return navigation.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={
        mobile
          ? "flex min-h-12 items-center border-b border-border text-base font-medium text-ink"
          : "rounded-md px-1 py-3 text-sm font-medium text-ink transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      }
    >
      {item.label}
    </Link>
  ));
}

export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-border/70 bg-canvas/95">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <BrandMark />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <NavigationLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center rounded-full bg-contrast px-5 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            Start an idea
          </Link>
        </div>

        <details className="group relative md:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border border-border bg-surface text-ink [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open navigation</span>
            <Menu className="size-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden size-5 group-open:block" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <nav aria-label="Mobile navigation" className="flex flex-col">
              <NavigationLinks mobile />
              <Link
                href="/sign-in"
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="mt-3 inline-flex min-h-12 items-center justify-center rounded-full bg-contrast px-5 text-sm font-semibold text-white"
              >
                Start an idea
              </Link>
            </nav>
          </div>
        </details>
      </Container>
    </header>
  );
}
