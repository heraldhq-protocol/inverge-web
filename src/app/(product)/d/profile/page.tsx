import type { Metadata } from "next";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { getDashboardViewer } from "@/features/app-shell/server/viewer";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { getCreatorView } from "@/features/ideas/server/creator-view";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Inverge identity and the ideas you have made public.",
};

/**
 * The signed-in profile.
 *
 * Only fields the account model actually holds are shown. There is no bio,
 * follower count, or join date in this repository's fixtures, so the page states
 * that they are not connected rather than filling the gaps with invented copy.
 */
export default async function ProfilePage() {
  const viewer = await getDashboardViewer();
  const { rows } = getCreatorView();
  const publicIdeas = rows.filter((row) => row.visibility === "public");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
        Account
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
        Your profile
      </h1>

      <section className="mt-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={viewer.displayName} size={64} src={viewer.avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold tracking-[-0.02em] text-ink">
                {viewer.displayName ?? "Your account"}
              </p>
              <Pill tone="neutral" size="xs">
                {viewer.dataSource === "preview"
                  ? "Preview profile"
                  : "Inverge account"}
              </Pill>
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {viewer.handle ? `@${viewer.handle}` : "No public handle yet"}
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-muted">
              {viewer.dataSource === "preview"
                ? "Profile details come from the preview identity used across the dashboard. Bio, links, and follower counts are not connected yet, so nothing is shown for them."
                : "Profile details come from your Inverge account. Bio, links, and follower counts are not connected yet, so nothing is shown for them."}
            </p>
          </div>
          <Link
            href="/d/settings"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-canvas px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Settings01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Settings
          </Link>
        </div>
      </section>

      <div className="mt-5">
        <CreatorStudioTabs active="ideas" />
      </div>

      <section aria-labelledby="public-ideas-heading" className="mt-5">
        <h2
          id="public-ideas-heading"
          className="text-base font-bold tracking-[-0.02em] text-ink"
        >
          Public ideas
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Ideas you have listed in discovery. Unlisted ideas stay reachable by
          link and are not shown here.
        </p>

        {publicIdeas.length > 0 ? (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {publicIdeas.map((idea) => (
              <li key={idea.id}>
                <Link
                  href={idea.detailHref ?? "/d/creator/ideas"}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {idea.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {idea.category} ·{" "}
                      {idea.supporters.toLocaleString("en-US")} supporters ·{" "}
                      {idea.validationPercent}% validated
                    </span>
                  </span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={15}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center">
            <p className="text-sm font-semibold text-ink">
              No public ideas yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">
              Publishing an idea lists it in discovery so supporters can find
              and follow it.
            </p>
            <Link
              href="/d/creator/ideas/new"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Start an idea
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
