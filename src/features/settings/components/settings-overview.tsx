import {
  ArrowUpRight,
  BookOpen,
  MailCheck,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { IdentityBadge } from "@/features/settings/components/account-identity-card";

const quickLinks = [
  { label: "How verification works", href: "/guides/identity-verification" },
  { label: "Wallet security", href: "/d/wallet/security" },
  { label: "Help and guides", href: "/help" },
  { label: "Contact support", href: "/contact" },
] as const;

/**
 * Glanceable account status beside the settings panels.
 *
 * No address, document reference, or provider identifier appears here: the rail
 * only restates states that already have a full, labelled home in the panels.
 */
export function SettingsOverview({
  adminEntry,
  emailVerified,
  source,
  verification,
  walletConnected,
}: {
  adminEntry?: ReactNode;
  emailVerified: boolean;
  source: "api" | "preview" | "unavailable";
  verification: IdentityBadge;
  walletConnected: boolean;
}) {
  return (
    <aside
      aria-label="Account overview"
      className="space-y-4 xl:sticky xl:top-36"
    >
      <section
        aria-labelledby="settings-glance"
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-contrast p-5 text-white shadow-[0_18px_44px_rgba(13,29,21,0.18)]"
      >
        <Image
          src="/images/bg/settings-dark-bg.webp"
          alt=""
          fill
          sizes="(min-width: 1280px) 20rem, 100vw"
          className="pointer-events-none object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-contrast/92 via-contrast/82 to-contrast/58"
        />
        <div className="relative">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand-soft">
            Account at a glance
          </p>
          <h2
            id="settings-glance"
            className="mt-1 text-lg font-bold tracking-[-0.02em]"
          >
            Your settings, in one view
          </h2>

          <dl className="mt-4 divide-y divide-white/10 border-y border-white/10">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex items-center gap-2 text-xs text-white/60">
                <MailCheck className="size-4" aria-hidden="true" />
                Email
              </dt>
              <dd className="text-xs font-semibold text-white">
                {emailVerified ? "Verified" : "Needs attention"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex items-center gap-2 text-xs text-white/60">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Identity
              </dt>
              <dd className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.6875rem] font-semibold text-white">
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${
                    verification.tone === "success"
                      ? "bg-brand"
                      : verification.tone === "warning"
                        ? "bg-warning"
                        : verification.tone === "danger"
                          ? "bg-danger"
                          : "bg-white/55"
                  }`}
                />
                {verification.label}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex items-center gap-2 text-xs text-white/60">
                <Wallet className="size-4" aria-hidden="true" />
                Wallet
              </dt>
              <dd className="text-xs font-semibold text-white">
                {walletConnected ? "Connected" : "Not connected"}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[0.6875rem] leading-4 text-white/52">
            {source === "api"
              ? "Verification outcomes are read from the provider; settings cannot approve an identity."
              : source === "preview"
                ? "This is a local preview. Changes are not written to an account."
                : "The API could not be reached. Values are limited to your signed-in identity."}
          </p>
        </div>
      </section>

      {adminEntry}

      <nav
        aria-label="Related settings links"
        className="rounded-2xl border border-border bg-surface p-2"
      >
        <p className="px-2.5 pb-1 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-muted">
          Quick links
        </p>
        <ul>
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {link.label}
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section
        aria-labelledby="settings-data-rights"
        className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5"
      >
        <Image
          src="/images/bg/settings-gradient-bg.webp"
          alt=""
          fill
          sizes="(min-width: 1280px) 20rem, 100vw"
          className="pointer-events-none object-cover opacity-80"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-canvas/94 via-canvas/82 to-canvas/58"
        />
        <div className="relative">
          <BookOpen
            className="size-5 text-brand-strong"
            strokeWidth={1.7}
            aria-hidden="true"
          />
          <h2
            id="settings-data-rights"
            className="mt-2.5 text-sm font-bold tracking-[-0.015em] text-ink"
          >
            Your data, your control
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Ask for a copy of your account information or tell us what should be
            corrected. Verification documents are handled by the provider, not
            stored here.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-brand-strong underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Request your data
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </aside>
  );
}
