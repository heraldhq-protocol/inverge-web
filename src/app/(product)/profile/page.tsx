import type { Metadata } from "next";

import { ProductPlaceholderPage } from "@/features/app-shell/components/product-placeholder-page";

export const metadata: Metadata = { title: "Profile | Inverge" };

export default function ProfilePage() {
  return (
    <ProductPlaceholderPage
      variant="unavailable"
      eyebrow="Profile"
      title="Your profile is not connected yet"
      description="Your public identity, participation history, ideas, and account details will live here after profile persistence is connected."
    />
  );
}
