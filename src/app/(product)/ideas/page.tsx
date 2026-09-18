import type { Metadata } from "next";

import { ProductPlaceholderPage } from "@/features/app-shell/components/product-placeholder-page";

export const metadata: Metadata = { title: "Ideas | Inverge" };

export default function IdeasPage() {
  return (
    <ProductPlaceholderPage
      eyebrow="Ideas"
      title="Idea discovery is getting ready"
      description="This route is prepared for the validation catalogue. Search, category filters, support, feedback, and pre-pledges will connect here with the backend integration."
    />
  );
}
