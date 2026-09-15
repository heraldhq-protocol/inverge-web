import { AuthShell } from "@/features/auth/components/auth-shell";
import { EmailVerificationForm } from "@/features/auth/components/email-verification-form";
import { authPageContent } from "@/features/auth/content";
import type { AuthMode } from "@/features/auth/types";

export function EmailVerificationPage({ mode }: { mode: AuthMode }) {
  const content = authPageContent[mode];

  return (
    <AuthShell
      eyebrow={content.eyebrow}
      title="Check your email"
      description={
        <p>
          You&apos;ll receive a 6-digit verification code at the email address
          you entered.
        </p>
      }
      panelTitle={content.panelTitle}
      panelDescription={content.panelDescription}
    >
      <EmailVerificationForm mode={mode} />
    </AuthShell>
  );
}
