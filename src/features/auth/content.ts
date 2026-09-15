import type { AuthMode } from "@/features/auth/types";

export const authPageContent: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
  }
> = {
  "sign-up": {
    eyebrow: "Built around accountability",
    title: "Create your Inverge account",
    description:
      "Discover promising ideas, support African builders, and follow delivery from first signal to final milestone.",
    panelTitle: "Good ideas deserve backing. Backers deserve proof.",
    panelDescription:
      "Discover builders early and stay connected to the evidence, decisions, and progress that follow funding.",
  },
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to Inverge",
    description:
      "Return to the ideas you follow, the builders you support, and every milestone along the way.",
    panelTitle: "Every promise should stay visible after funding.",
    panelDescription:
      "Keep up with builder updates, milestone evidence, and the outcomes tied to projects you support.",
  },
};
