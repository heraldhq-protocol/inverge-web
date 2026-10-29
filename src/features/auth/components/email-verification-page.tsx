import { AuthShell } from "@/features/auth/components/auth-shell";
import { EmailVerificationCard } from "@/features/auth/components/email-verification-card";
import type { EmailVerificationStatus } from "@/features/auth/lib/email-verification";
import type { OnboardingIntent } from "@/features/auth/lib/onboarding";

export function EmailVerificationPage({
  changing,
  initialEmail,
  initialStatus,
  intent,
  returnPath,
}: {
  changing: boolean;
  initialEmail: string;
  initialStatus: EmailVerificationStatus | null;
  intent: OnboardingIntent;
  returnPath: string;
}) {
  return (
    <AuthShell
      eyebrow={changing ? "Account email" : "One more step"}
      title={
        changing ? "Change your email address" : "Confirm your email address"
      }
      description={
        <p>
          {changing
            ? "Your current address stays in place until a code sent to the new address is entered. Email confirmation is separate from identity verification."
            : "Comments, ideas, campaign submissions, and other authored actions need a confirmed address. Supporting an idea does not."}
        </p>
      }
      panelTitle="A small check that keeps the record honest."
      panelDescription="Confirmation proves you can receive mail at the address on your account. It is separate from identity verification and never replaces it."
      headerAction={null}
      visualSrc="/images/profile_img.png"
      visualAlt="African leather artisan working carefully in her studio"
    >
      <EmailVerificationCard
        changing={changing}
        initialEmail={initialEmail}
        initialStatus={initialStatus}
        intent={intent}
        returnPath={returnPath}
      />
    </AuthShell>
  );
}
