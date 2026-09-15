import type { Metadata } from "next";

import { EmailVerificationPage } from "@/features/auth/components/email-verification-page";

export const metadata: Metadata = {
  title: "Verify your email | Inverge",
  description: "Enter the verification code sent to your email address.",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ flow?: string | string[] }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { flow } = await searchParams;
  const mode = flow === "sign-in" ? "sign-in" : "sign-up";

  return <EmailVerificationPage mode={mode} />;
}
