import { CallbackClient } from './callback-client';

// Where the provider returns the user after they finish (DIDIT_CALLBACK_URL). Didit appends
// ?verificationSessionId=...&status=...; the decision is confirmed server-side via webhook, so
// here we just poll our own /kyc/status until it settles and point the user onward.
export default async function KycCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; verificationSessionId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Verification submitted</h1>
      <p className="mt-3 text-foreground/60">
        Thanks — we’re confirming your result. This can take a moment.
      </p>
      <div className="mt-6">
        <CallbackClient providerStatus={sp.status ?? null} />
      </div>
    </div>
  );
}
