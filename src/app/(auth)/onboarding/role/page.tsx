import type { Metadata } from "next";

import { OnboardingPage } from "@/features/auth/components/onboarding-page";
import { RoleOnboardingForm } from "@/features/auth/components/role-onboarding-form";

export const metadata: Metadata = {
  title: "Choose where to start | Inverge",
  description: "Choose your starting point on Inverge.",
};

export default function RoleOnboardingPage() {
  return (
    <OnboardingPage screen="role">
      <RoleOnboardingForm />
    </OnboardingPage>
  );
}
