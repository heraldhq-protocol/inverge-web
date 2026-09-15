import type { Metadata } from "next";

import { AuthPage } from "@/features/auth/components/auth-page";

export const metadata: Metadata = {
  title: "Create your account | Inverge",
  description:
    "Create an Inverge account to discover ideas, support African builders, and follow their progress.",
};

export default function SignUpPage() {
  return <AuthPage mode="sign-up" />;
}
