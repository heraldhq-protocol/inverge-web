import type { Metadata } from "next";

import { ProductPlaceholderPage } from "@/features/app-shell/components/product-placeholder-page";

export const metadata: Metadata = { title: "Notifications | Inverge" };

export default function NotificationsPage() {
  return (
    <ProductPlaceholderPage
      eyebrow="Notifications"
      title="You're all caught up"
      description="Campaign, milestone, objection-window, outcome, and refund notices will collect here once notification delivery is connected."
    />
  );
}
