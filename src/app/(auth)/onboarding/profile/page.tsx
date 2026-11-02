import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingPage } from "@/features/auth/components/onboarding-page";
import { ProfileOnboardingForm } from "@/features/auth/components/profile-onboarding-form";
import { authHref, safeReturnPath } from "@/features/auth/lib/auth-routes";
import {
  hasSpecificReturnPath,
  PROFILE_ONBOARDING_PATH,
} from "@/features/auth/lib/onboarding";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionUser } from "@/features/auth/server/session-user";

export const metadata: Metadata = {
  title: "Set up your profile",
  description: "Choose how your public Inverge profile will appear.",
};

type ProfileOnboardingRouteProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function ProfileOnboardingPage({
  searchParams,
}: ProfileOnboardingRouteProps) {
  const returnPath = safeReturnPath((await searchParams).next);

  // The profile step writes to the API with the session cookie, so there is
  // nothing honest to render without one. The original destination is carried
  // into sign-in rather than replaced by this onboarding step.
  const user = await readSessionUser();
  if (!user) redirect(authHref(returnPath));

  // Email confirmation is a non-blocking account task. Onboarding must remain
  // available so a new account can reach the dashboard and support ideas first.

  // The API decides when the shared profile is complete. A returning visitor
  // who has already finished it must not be asked again.
  if (!user.requiresOnboarding) {
    redirect(hasSpecificReturnPath(returnPath) ? returnPath : "/d");
  }

  return (
    <OnboardingPage screen="profile">
      <ProfileOnboardingForm
        initialAccountType={user.accountType ?? null}
        initialContactName={user.contactName ?? ""}
        initialDisplayName={user.displayName ?? ""}
        initialUsername={user.username ?? ""}
        preview={isPreviewAuth()}
        returnPath={returnPath}
      />
    </OnboardingPage>
  );
}
