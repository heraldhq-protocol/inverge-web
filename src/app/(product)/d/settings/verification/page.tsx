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

export default async function VerificationSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const preview = verificationPreviewMode();
  const params = await searchParams;
  const returnedFromProvider = typeof params.verificationSessionId === "string";
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
        Identity verification
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Verify your identity and sanctions status before submitting a campaign
        or contributing above the backer threshold. The provider returns the
        outcome to Inverge; this page never treats a redirect as proof.
      </p>
      <div className="mt-6">
        <VerificationPanel
          initial={initial}
          mode={preview ? "preview" : "live"}
          returnedFromProvider={returnedFromProvider}
          {...(error === undefined ? {} : { error })}
        />
      </div>
    </main>
  );
}
