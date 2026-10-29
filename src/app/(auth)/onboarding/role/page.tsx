import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingPage } from "@/features/auth/components/onboarding-page";
import { RoleOnboardingForm } from "@/features/auth/components/role-onboarding-form";
import { authHref } from "@/features/auth/lib/auth-routes";
import {
  PROFILE_ONBOARDING_PATH,
  ROLE_ONBOARDING_PATH,
  safeOnboardingIntent,
} from "@/features/auth/lib/onboarding";
import { readSessionUser } from "@/features/auth/server/session-user";

export const metadata: Metadata = {
  title: "Choose where to start",
  description: "Choose your starting point on Inverge.",
};

type RoleOnboardingRouteProps = {
  searchParams: Promise<{ intent?: string | string[] }>;
};

export default async function RoleOnboardingPage({
  searchParams,
}: RoleOnboardingRouteProps) {
  const { intent: rawIntent } = await searchParams;
  const intent = safeOnboardingIntent(rawIntent);

  const user = await readSessionUser();
  if (!user) redirect(authHref(ROLE_ONBOARDING_PATH));

  // Email confirmation is a non-blocking account task; it never interrupts the
  // starting-point question.

  // The starting-point choice is only meaningful after the shared profile
  // exists, so an interrupted flow resumes at the step it missed.
  if (user.requiresOnboarding) redirect(PROFILE_ONBOARDING_PATH);

  return (
    <OnboardingPage screen="role">
      <RoleOnboardingForm intent={intent} />
    </OnboardingPage>
  );
}
