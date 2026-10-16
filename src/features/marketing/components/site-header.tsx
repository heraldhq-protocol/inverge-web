"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Cancel01Icon, Menu01Icon } from "@/components/ui/hugeicons";
import { Container } from "@/features/marketing/components/container";

const navigation = [
  { href: "/ideas", label: "Ideas" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Journal" },
] as const;

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (first && last) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-canvas/92 backdrop-blur-md">
      <Container className="flex min-h-20 items-center justify-between gap-4">
        {/* Logo - preserved exactly as required */}
        <BrandMark />

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-1 py-2 text-sm font-medium text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions: Sign in (text), Start an idea (dark pill) */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-contrast px-5 text-sm font-semibold text-white shadow-sm transition-[filter,background-color] duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Start an idea
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() =>
            mobileMenuOpen ? closeMenu() : setMobileMenuOpen(true)
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-border/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:hidden"
        >
          {mobileMenuOpen ? (
            <Cancel01Icon size={20} className="text-ink" />
          ) : (
            <Menu01Icon size={20} className="text-ink" />
          )}
        </button>
      </Container>

      {/* Mobile drawer */}
      {mobileMenuOpen ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          className="border-b border-border bg-surface px-6 py-6 shadow-xl md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-12 items-center border-b border-border/60 text-base font-medium text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border text-sm font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMenu}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-contrast text-sm font-semibold text-white transition-[filter,background-color] duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Start an idea
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
