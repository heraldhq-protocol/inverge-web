import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingPage } from "@/features/auth/components/onboarding-page";
import { ProfileOnboardingForm } from "@/features/auth/components/profile-onboarding-form";
import { authHref } from "@/features/auth/lib/auth-routes";
import { PROFILE_ONBOARDING_PATH } from "@/features/auth/lib/onboarding";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionUser } from "@/features/auth/server/session-user";

export const metadata: Metadata = {
  title: "Set up your profile",
  description: "Choose how your public Inverge profile will appear.",
};

export default async function ProfileOnboardingPage() {
  // The profile step writes to the API with the session cookie, so there is
  // nothing honest to render without one.
  const user = await readSessionUser();
  if (!user) redirect(authHref(PROFILE_ONBOARDING_PATH));

  // Email confirmation is a non-blocking account task. Onboarding must remain
  // available so a new account can reach the dashboard and support ideas first.

  // The API decides when the shared profile is complete. A returning visitor
  // who has already finished it must not be asked again.
  if (!user.requiresOnboarding) redirect("/d");

  return (
    <OnboardingPage screen="profile">
      <ProfileOnboardingForm
        initialAccountType={user.accountType ?? null}
        initialContactName={user.contactName ?? ""}
        initialDisplayName={user.displayName ?? ""}
        initialUsername={user.username ?? ""}
        preview={isPreviewAuth()}
      />
    </OnboardingPage>
  );
}
