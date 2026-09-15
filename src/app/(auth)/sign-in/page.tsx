import type { Metadata } from "next";

import { AuthPage } from "@/features/auth/components/auth-page";

export const metadata: Metadata = {
  title: "Sign in | Inverge",
  description:
    "Sign in to Inverge to follow ideas, builders, milestones, and project outcomes.",
};

export default function SignInPage() {
  return <AuthPage mode="sign-in" />;
}
