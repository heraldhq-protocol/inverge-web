import type { Metadata } from "next";

import { OnboardingPage } from "@/features/auth/components/onboarding-page";
import { ProfileOnboardingForm } from "@/features/auth/components/profile-onboarding-form";

export const metadata: Metadata = {
  title: "Set up your profile | Inverge",
  description: "Choose how your public Inverge profile will appear.",
};

export default function ProfileOnboardingPage() {
  return (
    <OnboardingPage screen="profile">
      <ProfileOnboardingForm />
    </OnboardingPage>
  );
}
