import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { authPageContent } from "@/features/auth/content";
import type { AuthMode } from "@/features/auth/types";

export function AuthPage({ mode }: { mode: AuthMode }) {
  const content = authPageContent[mode];

  return (
    <AuthShell
      eyebrow={content.eyebrow}
      title={content.title}
      description={<p>{content.description}</p>}
      panelTitle={content.panelTitle}
      panelDescription={content.panelDescription}
    >
      <AuthForm mode={mode} />
    </AuthShell>
  );
}
