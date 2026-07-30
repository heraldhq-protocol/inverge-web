import { CampaignVerify } from '@/components/kyc/campaign-verify';

export default function CampaignsPage() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="mt-3 text-foreground/60">
          On-chain milestone escrow launches in a later phase. For now, validate demand for
          your idea and convert it into a campaign draft once it clears the threshold.
        </p>
      </div>

      <div className="mt-10 text-left">
        <h2 className="text-sm font-semibold text-foreground/70">Before you can launch</h2>
        <p className="mt-1 mb-3 text-sm text-foreground/50">
          Creators receive funds, so verification and AML screening are required before a
          campaign can be submitted — verify as an individual or as a business.
        </p>
        <CampaignVerify />
      </div>
    </div>
  );
}
