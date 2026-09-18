import { previewIdeas } from "@/features/home/content/preview-data";
import type { PrePledgesData } from "@/features/pre-pledges/types";

// FR-202: these records are non-binding intent only; no payment state is implied.
export const prePledgesPreviewData: PrePledgesData = {
  active: [
    {
      idea: previewIdeas.campusKonekt,
      intent: { atomic: "5000000", currency: "NGN", decimals: 2 },
      stage: "active",
      status: "near-validation",
      updatedAt: "2026-09-15T09:00:00.000Z",
      updatedLabel: "3 days ago",
    },
    {
      idea: previewIdeas.sunGrid,
      intent: { atomic: "3000000", currency: "NGN", decimals: 2 },
      stage: "active",
      status: "validating",
      updatedAt: "2026-09-11T14:30:00.000Z",
      updatedLabel: "1 week ago",
    },
    {
      idea: previewIdeas.farmLink,
      intent: { atomic: "2000000", currency: "NGN", decimals: 2 },
      stage: "active",
      status: "validating",
      updatedAt: "2026-09-04T11:15:00.000Z",
      updatedLabel: "2 weeks ago",
    },
  ],
  past: [
    {
      idea: previewIdeas.kitchenCollective,
      intent: { atomic: "1500000", currency: "NGN", decimals: 2 },
      stage: "past",
      status: "validation-closed",
      updatedAt: "2026-08-28T12:00:00.000Z",
      updatedLabel: "3 weeks ago",
    },
    {
      idea: previewIdeas.skillCircle,
      intent: { atomic: "1000000", currency: "NGN", decimals: 2 },
      stage: "past",
      status: "validation-closed",
      updatedAt: "2026-08-10T10:45:00.000Z",
      updatedLabel: "5 weeks ago",
    },
  ],
};
