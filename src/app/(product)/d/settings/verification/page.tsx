import type { Metadata } from "next";
import Link from "next/link";

import { VerificationPanel } from "@/features/verification/components/verification-panel";
import {
  getVerificationState,
  verificationPreviewMode,
} from "@/features/verification/server/api";
import type { VerificationState } from "@/features/verification/types";

export const metadata: Metadata = {
  title: "Verification",
  description:
    "Complete identity, AML and business verification before creating or funding campaigns.",
};

export default async function VerificationSettingsPage() {
  const preview = verificationPreviewMode();
  let initial: VerificationState | null = null;
  let error: string | undefined;

  if (!preview) {
    const result = await getVerificationState();
    if (result.ok) {
      initial = result.data;
    } else if (result.status !== 401) {
      error = result.message;
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/d/settings"
        className="inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        ← Settings
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
        Verification
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Verification is required before a campaign can be submitted and before a
        contribution crosses the backer threshold. It cannot be completed by a
        button click on this page: the provider returns the outcome to Inverge.
      </p>
      <div className="mt-6">
        <VerificationPanel
          initial={initial}
          mode={preview ? "preview" : "live"}
          {...(error === undefined ? {} : { error })}
        />
      </div>
    </main>
  );
}
