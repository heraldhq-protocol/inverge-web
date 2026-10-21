import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPage } from "@/features/auth/components/auth-page";
import { safeReturnPath } from "@/features/auth/lib/auth-routes";
import {
  postAuthPath,
  safeOnboardingIntent,
} from "@/features/auth/lib/onboarding";
import { readSessionUser } from "@/features/auth/server/session-user";

export const metadata: Metadata = {
  title: "Sign in or create your account",
  description:
    "Sign in to Inverge, or create an account, to back ideas, follow builders, and keep up with milestones and outcomes.",
};

type AuthRouteProps = {
  searchParams: Promise<{
    intent?: string | string[];
    next?: string | string[];
  }>;
};

export default async function AuthRoute({ searchParams }: AuthRouteProps) {
  const { intent: rawIntent, next } = await searchParams;
  const intent = safeOnboardingIntent(rawIntent);
  const returnPath = safeReturnPath(next);

  // A visitor who already holds a session has nothing to do here. The cookie is
  // read on the server, so this decision is never made from client state. A
  // half-finished profile resumes at that step rather than skipping it.
  const user = await readSessionUser();
  if (user) {
    redirect(
      postAuthPath({
        intent,
        requiresOnboarding: user.requiresOnboarding,
        returnPath,
      }),
    );
  }

  return <AuthPage intent={intent} returnPath={returnPath} />;
}
