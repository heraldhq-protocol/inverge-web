import type { Metadata } from "next";

import { ProductPlaceholderPage } from "@/features/app-shell/components/product-placeholder-page";

export const metadata: Metadata = { title: "Settings | Inverge" };

export default function SettingsPage() {
  return (
    <ProductPlaceholderPage
      variant="unavailable"
      eyebrow="Settings"
      title="Settings are not connected yet"
      description="Account preferences, linked wallets, privacy controls, and notification choices will appear here after authentication and profile persistence are integrated."
    />
  );
}
