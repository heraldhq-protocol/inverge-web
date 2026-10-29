import { Mail } from "lucide-react";
import Link from "next/link";

import { SettingsCard } from "@/features/settings/components/settings-section";
import { SettingsRow } from "@/features/settings/components/settings-row";

export function EmailSettings({
  email,
  verified,
}: {
  email: string | null;
  verified: boolean;
}) {
  return (
    <SettingsCard>
      <SettingsRow
        icon={Mail}
        title="Email address"
        description={
          email
            ? verified
              ? `${email} is confirmed. It is used for account notices and email verification.`
              : `${email} has not been confirmed. Confirm it to comment, publish ideas, and submit campaigns.`
            : "No address is attached to this account yet. Add one to unlock authored actions."
        }
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                verified
                  ? "bg-brand-soft text-brand-strong"
                  : "bg-warning/10 text-warning-strong"
              }`}
            >
              {verified ? "Verified" : "Not verified"}
            </span>
            <Link
              href="/auth/email?next=%2Fd%2Fsettings&change=1"
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {verified ? "Change" : email ? "Confirm" : "Add email"}
            </Link>
          </div>
        }
      />
      <li className="px-4 py-3 text-xs leading-5 text-muted sm:px-5">
        Email confirmation proves you can receive mail at this address. It is
        separate from identity verification (KYC) and does not replace it.
      </li>
    </SettingsCard>
  );
}
