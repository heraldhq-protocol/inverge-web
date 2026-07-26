import { VerifyIdentity } from '@/components/kyc/verify-identity';

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Account verification</h1>
      <p className="mt-3 text-foreground/60">
        Verifying your identity is a one-time ID + selfie check. It’s optional for browsing and
        pre-pledging, but verified backers carry full weight in an idea’s estimated interest —
        and it’s the first step toward running your own campaign.
      </p>

      <div className="mt-8">
        <VerifyIdentity purpose="IDEA_VALIDATION" />
      </div>

      <p className="mt-6 text-xs text-foreground/40">
        We never store your ID documents — only a verification reference and status (NFR-12).
      </p>
    </div>
  );
}
