"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Cancel01Icon, Menu01Icon } from "@/components/ui/hugeicons";
import { authHref } from "@/features/auth/lib/auth-routes";
import { CommandPaletteTrigger } from "@/features/command-palette/components/command-palette-trigger";
import { Container } from "@/features/marketing/components/container";
import {
  SiteAccountMenu,
  SiteAccountPanel,
  type SiteViewer,
} from "@/features/marketing/components/site-account";

/**
 * Primary navigation.
 *
 * Kept to the destinations that need top-level prominence: the two discovery
 * surfaces, the ideathon, and the two editorial sections. "How it works" is
 * deliberately absent — it is an anchor on the home page and is linked from the
 * footer, so a header slot would crowd the bar without adding a destination.
 * Journal, About, Careers, and the legal pages are footer-only for the same
 * reason.
 *
 * The links appear at `md`, but the search field and the account control do not
 * fit beside them until `lg`. Below `lg` they stay in the panel so no action is
 * unreachable at a tablet width.
 *
 * `viewer` is resolved by the server layout from the HttpOnly session, so the
 * first paint already knows whether the visitor is signed in. The header never
 * reads a local-storage flag or a client-only auth store.
 */
const navigation = [
  { href: "/ideas", label: "Discover" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/ideathon", label: "Ideathon" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
] as const;

function isCurrentPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ viewer }: { viewer: SiteViewer | null }) {
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
            <CommandPaletteTrigger />
          </div>
          {viewer ? (
            <SiteAccountMenu viewer={viewer} />
          ) : (
            <>
              <Link
                href="/auth"
                className="inline-flex min-h-11 items-center rounded-md px-1 text-sm font-semibold text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Sign in
              </Link>
              <Link
                href={authHref(undefined, "creator")}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-contrast px-5 text-sm font-semibold text-white shadow-sm transition-[filter,background-color] duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Start building
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <CommandPaletteTrigger variant="icon" />
          <button
            ref={triggerRef}
            type="button"
            onClick={() =>
              mobileMenuOpen ? closeMenu() : setMobileMenuOpen(true)
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-border/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
          >
            {mobileMenuOpen ? (
              <Cancel01Icon size={20} className="text-ink" />
            ) : (
              <Menu01Icon size={20} className="text-ink" />
            )}
          </button>
        </div>
      </Container>

      {mobileMenuOpen ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          className="border-b border-border bg-surface px-6 py-6 shadow-xl lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {viewer ? (
              <div className="pb-4">
                <SiteAccountPanel onNavigate={closeMenu} viewer={viewer} />
              </div>
            ) : null}
            <div className="pb-3">
              <CommandPaletteTrigger
                onBeforeOpen={() => setMobileMenuOpen(false)}
              />
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
            {viewer ? null : (
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  href="/auth"
                  onClick={closeMenu}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-border text-sm font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Sign in
                </Link>
                <Link
                  href={authHref(undefined, "creator")}
                  onClick={closeMenu}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-contrast text-sm font-semibold text-white transition-[filter,background-color] duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Start building
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
