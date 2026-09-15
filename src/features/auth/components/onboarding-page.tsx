import type { ReactNode } from "react";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { OnboardingProgress } from "@/features/auth/components/onboarding-progress";

const onboardingContent = {
  profile: {
    step: 1 as const,
    stepLabel: "Profile",
    eyebrow: "Welcome to Inverge",
    title: "Make Inverge yours",
    description:
      "Add a few details so people know who they are interacting with across ideas, feedback, and campaigns.",
    panelTitle: "Discover early. Support thoughtfully.",
    panelDescription:
      "Follow ideas from their earliest validation through the work that comes after funding.",
  },
  role: {
    step: 2 as const,
    stepLabel: "Your start",
    eyebrow: "One platform, both sides",
    title: "What would you like to do first?",
    description:
      "Choose where you would like to start. You can explore every side of Inverge at any time.",
    panelTitle:
      "Discover something worth backing. Or prove something worth building.",
    panelDescription:
      "Inverge connects early belief with accountable delivery.",
  },
} as const;

export function OnboardingPage({
  screen,
  children,
}: {
  screen: keyof typeof onboardingContent;
  children: ReactNode;
}) {
  const content = onboardingContent[screen];

  return (
    <AuthShell
      eyebrow={content.eyebrow}
      title={content.title}
      description={<p>{content.description}</p>}
      panelTitle={content.panelTitle}
      panelDescription={content.panelDescription}
      headerAction={null}
      beforeTitle={
        <>
          <OnboardingProgress
            currentStep={content.step}
            label={content.stepLabel}
          />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            {content.eyebrow}
          </p>
        </>
      }
    >
      {children}
    </AuthShell>
  );
}
