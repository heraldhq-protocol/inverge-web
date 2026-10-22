"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { ProgrammeWorkspace } from "@/features/programmes/components/programme-workspace";
import {
  getLocalProgrammesSnapshot,
  getServerProgrammesSnapshot,
  subscribeLocalProgrammes,
} from "@/features/programmes/lib/local-store";
import type { Programme } from "@/features/programmes/types";

const TABS = [
  "overview",
  "participants",
  "submissions",
  "judging",
  "leaderboard",
  "rewards",
  "sponsors",
  "branding",
  "schedule",
  "ai",
  "settings",
] as const;

type TabId = (typeof TABS)[number];

function tabFrom(value: string | undefined): TabId {
  return TABS.includes(value as TabId) ? (value as TabId) : "overview";
}

/**
 * Resolves a programme from the server record or the browser's preview store.
 * Programmes created in the wizard exist only in local storage, so the server
 * cannot render their workspace; this boundary keeps the route honest without
 * pretending the record is remote.
 */
export function ProgrammeWorkspaceLoader({
  initialProgramme,
  programmeId,
  initialTab,
}: {
  initialProgramme: Programme | null;
  programmeId: string;
  initialTab: string | undefined;
}) {
  const localProgrammes = useSyncExternalStore(
    subscribeLocalProgrammes,
    getLocalProgrammesSnapshot,
    getServerProgrammesSnapshot,
  );
  const programme =
    initialProgramme ??
    localProgrammes.find((entry) => entry.id === programmeId) ??
    null;

  if (!programme) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-bold text-ink">Programme not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          This programme is not in the server catalogue and no local draft
          exists in this browser.
        </p>
        <Link
          href="/admin/programmes"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to programmes
        </Link>
      </div>
    );
  }

  return (
    <ProgrammeWorkspace
      initialProgramme={programme}
      initialTab={tabFrom(initialTab)}
    />
  );
}
