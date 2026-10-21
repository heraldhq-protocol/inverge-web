import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { SignOutCard } from "@/features/auth/components/sign-out-card";

export const metadata: Metadata = {
  title: "Sign out",
  description: "End your Inverge session on this device.",
};

export default function SignOutPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-canvas px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <BrandMark />
        </div>

        <h1 className="mt-8 text-balance text-center text-2xl font-bold tracking-[-0.04em] text-ink">
          Signing you out
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-muted">
          This ends your Inverge session and the wallet sign-in on this device.
          You can sign in again at any time.
        </p>

        <div className="mt-6">
          <SignOutCard />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link
            className="font-medium text-ink underline underline-offset-3"
            href="/"
          >
            Return to Inverge
          </Link>
        </p>
      </div>
    </main>
  );
}
