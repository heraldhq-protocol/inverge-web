import type { ReactNode } from "react";

import { Tabs } from "@/components/ui/tabs";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";
import { WalletStatusPill } from "@/features/wallet/components/wallet-status-pill";
import { walletProvisioningDescriptions } from "@/features/wallet/lib/status";
import type { WalletView } from "@/features/wallet/types";

export type WalletSection =
  "activity" | "overview" | "receive" | "refunds" | "security" | "send";

const sections: readonly {
  href: string;
  id: WalletSection;
  label: string;
}[] = [
  { href: "/d/wallet", id: "overview", label: "Overview" },
  { href: "/d/wallet/activity", id: "activity", label: "Activity" },
  { href: "/d/wallet/receive", id: "receive", label: "Receive" },
  { href: "/d/wallet/send", id: "send", label: "Send" },
  { href: "/d/wallet/refunds", id: "refunds", label: "Refunds" },
  { href: "/d/wallet/security", id: "security", label: "Security" },
];

/**
 * The wallet frame.
 *
 * Every wallet route renders inside this shell so the provisioning state and the
 * preview label are impossible to miss and impossible to contradict on a
 * sub-page. Sections are real links, so each one is shareable and works without
 * JavaScript.
 */
export function WalletPageShell({
  active,
  children,
  description,
  title = "Wallet",
  view,
}: {
  active: WalletSection;
  children: ReactNode;
  description: string;
  title?: string;
  view: WalletView;
}) {
  const items = sections.map((section) => {
    const count =
      section.id === "activity"
        ? view.counts.activity
        : section.id === "refunds"
          ? view.counts.refunds
          : null;

    return {
      active: section.id === active,
      href: section.href,
      label: section.label,
      ...(count === null ? {} : { count }),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <header>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Your space
          </p>
          <PreviewDataChip title="Wallet balances and activity are preview data until an embedded-wallet provider and chain index are connected" />
          <WalletStatusPill state={view.account.provisioning} size="xs" />
        </div>
        <h1 className="mt-2 text-balance text-[1.75rem] font-bold leading-tight tracking-[-0.045em] text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-[0.9375rem]">
          {description}
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
          {walletProvisioningDescriptions[view.account.provisioning]}
        </p>
      </header>

      <Tabs className="mt-6" items={items} label="Wallet sections" />

      <div className="mt-6">{children}</div>
    </div>
  );
}
