import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <p className="mb-3 text-sm font-medium uppercase tracking-wider text-foreground/50">
        Crowdfunding, without the rug
      </p>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Back African builders. Get your money back if they don’t deliver.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-foreground/70">
        Funds sit in on-chain escrow and release in milestone tranches only when backers
        approve delivery. Validate demand for your idea first — free.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/ideas"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Explore ideas
        </Link>
        <Link
          href="/ideas/new"
          className="rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium hover:bg-foreground/5"
        >
          Publish an idea
        </Link>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        <Feature
          title="Validate free"
          body="Publish an idea, gather supporters, pre-pledges and structured feedback before you raise."
        />
        <Feature
          title="Milestone escrow"
          body="Raised funds unlock tranche by tranche, only when backers approve each milestone."
        />
        <Feature
          title="Refundable by design"
          body="Miss the target or fail a milestone and remaining funds are refundable to backers."
        />
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-foreground/10 p-5">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-foreground/60">{body}</p>
    </div>
  );
}
