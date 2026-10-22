import type { Metadata } from "next";

import { AdvertisingPreferences } from "@/features/advertising/components/advertising-preferences";
import { PageHeader } from "@/features/marketing/components/page-header";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Choose whether Inverge may measure paid placements and whether a third-party advertising vendor may personalise ads.",
  og: { eyebrow: "Advertising choices", template: "marketing" },
  path: "/advertising-preferences",
  title: "Advertising choices",
});

export default function AdvertisingPreferencesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Privacy controls"
        title="Advertising choices"
        description="Paid placements are labelled and keep their distance from organic ranking and funding figures. Two optional purposes are yours to allow or refuse."
        note="Choices apply to this browser and can be changed at any time."
      />
      <AdvertisingPreferences />
    </main>
  );
}
