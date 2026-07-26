'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getKycStatus, KycStatus } from '@/lib/kyc/kyc-api';

// Polls /kyc/status a handful of times while the webhook confirms the result on the backend.
export function CallbackClient({ providerStatus }: { providerStatus: string | null }) {
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      attempts += 1;
      try {
        const s = await getKycStatus();
        setStatus(s);
        const settled = s.kycStatus === 'VERIFIED' || s.kycStatus === 'REJECTED';
        if (settled || attempts >= 6) {
          setDone(true);
          return;
        }
      } catch {
        if (attempts >= 6) {
          setDone(true);
          return;
        }
      }
      timer = setTimeout(poll, 2500);
    };
    void poll();
    return () => clearTimeout(timer);
  }, []);

  const verified = status?.kycStatus === 'VERIFIED';
  const rejected = status?.kycStatus === 'REJECTED';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-foreground/10 p-4 text-sm">
        {!done && (
          <p className="text-foreground/60">
            Confirming your result{providerStatus ? ` (provider: ${providerStatus})` : ''}…
          </p>
        )}
        {done && verified && (
          <p>
            <span className="font-medium text-emerald-600">You’re verified.</span>{' '}
            <span className="text-foreground/60">
              Your pledges now carry full weight, and you can proceed with a campaign.
            </span>
          </p>
        )}
        {done && rejected && (
          <p className="text-red-600">
            Verification was declined. You can try again from the verification page.
          </p>
        )}
        {done && !verified && !rejected && (
          <p className="text-foreground/60">
            Still processing. Your status will update automatically — check back shortly.
          </p>
        )}
        {status && (
          <p className="mt-2 text-xs text-foreground/40">
            KYC: {status.kycStatus} · AML: {status.amlStatus}
          </p>
        )}
      </div>
      <div className="flex gap-3 text-sm">
        <Link href="/ideas" className="rounded-full border border-foreground/15 px-4 py-1.5">
          Back to ideas
        </Link>
        <Link href="/campaigns" className="rounded-full border border-foreground/15 px-4 py-1.5">
          Campaigns
        </Link>
      </div>
    </div>
  );
}
