import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthSignInCard } from "@/features/auth/components/auth-sign-in-card";
import { authPageContent } from "@/features/auth/content";
import type { OnboardingIntent } from "@/features/auth/lib/onboarding";

export function AuthPage({
  intent,
  returnPath,
}: {
  intent: OnboardingIntent;
  returnPath: string;
}) {
  return (
    <AuthShell
      eyebrow={authPageContent.eyebrow}
      title={authPageContent.title}
      description={<p>{authPageContent.description}</p>}
      panelTitle={authPageContent.panelTitle}
      panelDescription={authPageContent.panelDescription}
    >
      <AuthSignInCard intent={intent} returnPath={returnPath} />
    </AuthShell>
  );
}
