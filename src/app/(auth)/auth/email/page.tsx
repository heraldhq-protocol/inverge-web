import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EmailVerificationPage } from "@/features/auth/components/email-verification-page";
import { authHref, safeReturnPath } from "@/features/auth/lib/auth-routes";
import {
  postAuthPath,
  safeOnboardingIntent,
} from "@/features/auth/lib/onboarding";
import { readEmailHint } from "@/features/auth/server/session";
import { readEmailVerification } from "@/features/auth/server/email-verification";
import { readSessionUser } from "@/features/auth/server/session-user";

export const metadata: Metadata = {
  title: "Confirm your email",
  description:
    "Confirm the email address on your Inverge account to unlock comments, ideas, and campaign actions.",
};

type EmailVerificationRouteProps = {
  searchParams: Promise<{
    change?: string | string[];
    intent?: string | string[];
    next?: string | string[];
  }>;
};

export default async function EmailVerificationRoute({
  searchParams,
}: EmailVerificationRouteProps) {
  const { change, intent: rawIntent, next } = await searchParams;
  const intent = safeOnboardingIntent(rawIntent);
  const returnPath = safeReturnPath(next);
  const changing = (Array.isArray(change) ? change[0] : change) === "1";

  const user = await readSessionUser();
  if (!user) redirect(authHref(returnPath, intent));

  // The server re-reads the API state on every render, so a confirmation in
  // another tab cannot leave this screen showing a stale challenge.
  const status = await readEmailVerification();
  // `?change=1` is the settings entry point: a verified account still needs
  // this screen to propose a replacement address. Everywhere else, a verified
  // account is already done here.
  if (!changing && (status?.verified || user.emailVerified)) {
    redirect(
      postAuthPath({
        intent,
        requiresOnboarding: user.requiresOnboarding,
        returnPath,
      }),
    );
  }

  const hint = await readEmailHint();
  const initialEmail =
    status?.email ?? status?.challenge?.email ?? user.email ?? hint ?? "";

  return (
    <EmailVerificationPage
      changing={changing}
      initialEmail={initialEmail}
      initialStatus={status}
      intent={intent}
      returnPath={returnPath}
    />
  );
}
