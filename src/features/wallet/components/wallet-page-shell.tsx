import type { ReactNode } from "react";

import { Tabs } from "@/components/ui/tabs";

export type WalletSection = "activity" | "overview" | "refunds" | "security";

/**
 * The primary wallet destinations.
 *
 * Security is contextual rather than primary: it keeps its own route but stays
 * out of the tab bar. Send and receive are not routes at all — they open the
 * Wallet Services UI from the overview card, so the tab bar stays at three.
 */
const sections: readonly {
  href: string;
  id: WalletSection;
  label: string;
}[] = [
  { href: "/d/wallet", id: "overview", label: "Overview" },
  { href: "/d/wallet/activity", id: "activity", label: "Activity" },
  { href: "/d/wallet/refunds", id: "refunds", label: "Refunds" },
];

/**
 * The wallet frame.
 *
 * Every wallet route renders inside this shell so the page heading and the
 * section links are consistent. Sections are real links, so each one is
 * shareable and works without JavaScript.
 */
export function WalletPageShell({
  active,
  children,
  description,
  title = "Wallet",
}: {
  active: WalletSection;
  children: ReactNode;
  description: string;
  title?: string;
}) {
  const items = sections.map((section) => ({
    active: section.id === active,
    href: section.href,
    label: section.label,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <header className="max-w-2xl">
        <h1 className="text-balance text-[1.75rem] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-base leading-6 text-muted sm:text-[0.9375rem]">
          {description}
        </p>
      </header>

      <Tabs className="mt-5 sm:mt-6" items={items} label="Wallet sections" />

      <div className="mt-5 sm:mt-6">{children}</div>
    </div>
  );
}
