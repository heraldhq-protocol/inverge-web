"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Cancel01Icon, Menu01Icon } from "@/components/ui/hugeicons";
import { Container } from "@/features/marketing/components/container";

const navigation = [
  { href: "/ideas", label: "Discover" },
  { href: "/ideathon", label: "Ideathon" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Journal" },
] as const;

function isCurrentPath(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false;
  if (href === "/ideas") {
    return pathname === "/ideas" || pathname.startsWith("/ideas/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderSearch({ id }: { id: string }) {
  return (
    <form action="/ideas" role="search" className="relative">
      <label htmlFor={id} className="sr-only">
        Search ideas, creators, or topics
      </label>
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        type="search"
        name="q"
        placeholder="Search ideas, creators, or topics"
        className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/80 hover:border-border-strong focus:border-brand focus:ring-3 focus:ring-brand/12"
      />
    </form>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
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
      "a[href], button:not([disabled]), input:not([disabled])",
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
        <BrandMark />

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => {
            const current = isCurrentPath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`relative rounded-md px-0.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${
                  current
                    ? "font-semibold text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand"
                    : "font-medium text-ink-soft hover:text-brand-strong"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="w-52 xl:w-64">
            <HeaderSearch id="header-idea-search" />
          </div>
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center rounded-md px-1 text-sm font-semibold text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-contrast px-5 text-sm font-semibold text-white shadow-sm transition-[filter,background-color] duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Start building
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <Link
            href="/ideas"
            aria-label="Search ideas"
            className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </Link>
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
          <Link
            href="/sign-up"
            className="hidden min-h-11 items-center justify-center rounded-full bg-contrast px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:inline-flex lg:hidden"
          >
            Start building
          </Link>
        </div>
      </Container>

      {mobileMenuOpen ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          className="border-b border-border bg-surface px-6 py-6 shadow-xl md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <div className="pb-3">
              <HeaderSearch id="mobile-header-idea-search" />
            </div>
            {navigation.map((item) => {
              const current = isCurrentPath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-12 items-center border-b border-border/60 text-base transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    current
                      ? "font-semibold text-brand-strong"
                      : "font-medium text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
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
                Start building
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
