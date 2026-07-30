import { notFound } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { IdeaDetail } from '@/lib/api/types';
import { Amount, Count } from '@/components/ui/amount';
import { IdeaActions } from '@/components/ideas/idea-actions';

export const dynamic = 'force-dynamic';

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await api.GET('/ideas/{id}', { params: { path: { id } } });
  const idea = data as IdeaDetail | undefined;
  if (!idea) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{idea.title}</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Raising <Amount value={idea.askAmount} />
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Metric label="Supporters" value={<Count value={idea.supporterCount} />} />
        <Metric label="Pre-pledged" value={<Amount value={idea.prePledgeTotal} />} />
        <Metric
          label="Feedback"
          value={
            <span className="tabular-nums">
              {Number(idea.feedbackScore).toFixed(1)}
              <span className="text-foreground/40">/5</span>
            </span>
          }
        />
      </section>

      <Prose title="Problem" body={idea.problem} />
      <Prose title="Solution" body={idea.solution} />
      <Prose title="Roadmap" body={idea.roadmap} />

      <IdeaActions ideaId={idea.id} />
    </article>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-foreground/10 p-4">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-1 text-lg font-medium">{value}</div>
    </div>
  );
}

function Prose({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-foreground/50">
        {title}
      </h2>
      <p className="whitespace-pre-wrap text-foreground/80">{body}</p>
    </section>
  );
}
