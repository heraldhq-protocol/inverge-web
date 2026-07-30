import { Button } from '@/components/ui/button';

export default function IdeaNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        We could not find that idea
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        It may have been removed, or the link may be incomplete. Some ideas are also reachable only by
        their direct link while their creator is still working on them.
      </p>
      <div className="mt-6 flex justify-center">
        <Button variant="primary" size="md" href="/feed">
          Browse ideas
        </Button>
      </div>
    </div>
  );
}
