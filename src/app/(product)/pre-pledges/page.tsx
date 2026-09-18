import type { Metadata } from "next";

import { ProductPlaceholderPage } from "@/features/app-shell/components/product-placeholder-page";

export const metadata: Metadata = { title: "Pre-pledges | Inverge" };

export default function PrePledgesPage() {
  return (
    <ProductPlaceholderPage
      eyebrow="Pre-pledges"
      title="No connected pre-pledges yet"
      description="Your non-binding backing intentions will appear here after account and idea data are connected. No money moves when you make a pre-pledge."
    />
  );
}
