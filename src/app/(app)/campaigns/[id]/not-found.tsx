import { Button } from '@/components/ui/button';

export default function CampaignNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        We could not find that campaign
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        It may not have launched yet. Campaigns start as ideas, and most of them are still being validated.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="md" href="/campaigns">
          See campaigns
        </Button>
        <Button variant="outline" size="md" href="/feed">
          Browse ideas
        </Button>
      </div>
    </div>
  );
}
