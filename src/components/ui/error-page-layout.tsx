import { Menu, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/features/marketing/components/brand-mark";
import { Container } from "@/features/marketing/components/container";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Journal" },
] as const;

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

function BackgroundDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Top-left organic contour lines */}
      <svg
        className="absolute -left-16 -top-12 h-[30rem] w-[30rem] text-brand/20 opacity-60 sm:-left-20 sm:-top-16 sm:h-[38rem] sm:w-[38rem]"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-40 40 C 180 80, 240 280, 120 480 C 80 540, 20 580, -20 600"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M0 120 C 160 150, 200 300, 100 460"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Bottom-right organic contour lines */}
      <svg
        className="absolute -bottom-16 -right-12 h-[28rem] w-[28rem] text-brand/25 opacity-70 sm:-bottom-24 sm:-right-20 sm:h-[36rem] sm:w-[36rem]"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M620 420 C 460 380, 420 200, 520 60"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M580 500 C 420 460, 360 260, 480 80"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="6 6"
        />
        <path
          d="M500 580 C 380 520, 320 340, 420 140"
          stroke="var(--inverge-border)"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  );
}

export function ErrorPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col justify-between overflow-x-hidden bg-canvas">
      {/* Background vectors */}
      <BackgroundDecorations />

      {/* Top Header */}
      <header className="relative z-30 border-b border-border/60 bg-canvas/90 backdrop-blur-sm">
        <Container className="flex min-h-16 items-center justify-between gap-4">
          <BrandMark />

          {/* Desktop Navigation */}
          <nav
            aria-label="Error page navigation"
            className="hidden items-center gap-7 md:flex"
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-1 py-2 text-sm font-medium text-ink transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Link
            href="/contact"
            className="hidden min-h-10 items-center rounded-full bg-contrast px-5 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:inline-flex"
          >
            Talk to us
          </Link>

          {/* Mobile menu dropdown */}
          <details className="group relative md:hidden">
            <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-brand/40 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Open navigation menu</span>
              <Menu className="size-5 group-open:hidden" aria-hidden="true" />
              <X
                className="hidden size-5 group-open:block"
                aria-hidden="true"
              />
            </summary>
            <div className="absolute right-0 top-13 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-border bg-surface p-5 shadow-2xl">
              <nav aria-label="Mobile navigation" className="flex flex-col">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-12 items-center border-b border-border/70 text-base font-medium text-ink transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-contrast px-5 text-sm font-semibold text-white transition-colors hover:bg-brand"
                >
                  Talk to us
                </Link>
              </nav>
            </div>
          </details>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 my-auto flex flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
        <div className="w-full max-w-xl text-center">{children}</div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-canvas/80 py-4 sm:py-5">
        <Container className="flex flex-col items-center justify-between gap-3 text-center text-xs text-muted sm:flex-row sm:text-left">
          <p className="font-medium text-ink/70">
            Building a more possible Africa.
          </p>

          <nav
            aria-label="Error page footer links"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5"
          >
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </footer>
    </div>
  );
}
