'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field, FieldSet, controlClass, useTouched } from '@/components/ui/field';
import { ImageField } from '@/components/ui/image-field';
import { RichTextField } from '@/components/ui/rich-text-field';
import type { TiptapDoc } from '@/lib/ideas/rich-content';
import { IdeaCard } from '@/components/ideas/idea-card';
import { CATEGORIES, type FeedItem, type IdeaCategory } from '@/lib/feed/types';
import { cacheCreatedIdea, createIdea, publishIdea } from '@/lib/ideas/ideas-api';
import { env } from '@/lib/env';
import { IDEA_PRESETS, type IdeaPreset } from '@/lib/ideas/presets';
import { Pill } from '@/components/ui/pill';

type FormKey =
  | 'title'
  | 'problem'
  | 'targetUser'
  | 'currentAlternative'
  | 'solution'
  | 'askAmount'
  | 'roadmap';

const EMPTY_STEP = { date: '', description: '' };

export default function NewIdeaPage() {
  const router = useRouter();
  const { touched, touch, touchAll } = useTouched<FormKey>();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'software' as IdeaCategory,
    region: '',
    problem: '',
    targetUser: '',
    currentAlternative: '',
    solution: '',
    solutionDoc: null as TiptapDoc | null,
    problemDoc: null as TiptapDoc | null,
    coverImageUrl: null as string | null,
    coverPreview: null as string | null,
    askAmount: '',
    risks: '',
    steps: [{ ...EMPTY_STEP }, { ...EMPTY_STEP }],
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const applyPreset = (presetKey: 'weak' | 'normal' | 'detailed') => {
    const preset = IDEA_PRESETS[presetKey];
    setActivePreset(presetKey);
    setForm({
      title: preset.form.title,
      category: preset.form.category,
      region: preset.form.region,
      problem: preset.form.problem,
      targetUser: preset.form.targetUser,
      currentAlternative: preset.form.currentAlternative,
      solution: preset.form.solution,
      solutionDoc: preset.form.solutionDoc,
      problemDoc: preset.form.problemDoc,
      coverImageUrl: preset.form.coverImageUrl,
      coverPreview: preset.form.coverImageUrl,
      askAmount: preset.form.askAmount,
      risks: preset.form.risks,
      steps: preset.form.steps.map((s) => ({ ...s })),
    });
    setSubmitError(null);
  };

  const clearPreset = () => {
    setActivePreset(null);
    setForm({
      title: '',
      category: 'software',
      region: '',
      problem: '',
      targetUser: '',
      currentAlternative: '',
      solution: '',
      solutionDoc: null,
      problemDoc: null,
      coverImageUrl: null,
      coverPreview: null,
      askAmount: '',
      risks: '',
      steps: [{ ...EMPTY_STEP }, { ...EMPTY_STEP }],
    });
  };

  const errors: Partial<Record<FormKey, string>> = {};
  if (!form.title.trim()) errors.title = 'Give the idea a name people can search for.';
  if (form.problem.trim().length < 40)
    errors.problem = 'Tell us who has this problem and how often. One clear sentence is enough.';
  if (!form.targetUser.trim())
    errors.targetUser = 'Name the group specifically. "Students" is too broad to validate.';
  if (!form.currentAlternative.trim())
    errors.currentAlternative = 'Say what they do today, even if the answer is "nothing".';
  if (form.solution.trim().length < 30)
    errors.solution = 'Describe what you would build, not why it matters.';
  if (!(Number(form.askAmount) > 0)) errors.askAmount = 'Give a rough figure. You can change it later.';
  if (form.steps.filter((s) => s.date && s.description.trim()).length < 2)
    errors.roadmap = 'Two dated steps, at least. What will exist, and by when?';

  const showError = (key: FormKey) => (touched[key] || submitted ? errors[key] : undefined);
  const hasErrors = Object.keys(errors).length > 0;

  // The preview is the real card component, not a mock-up of it, so what a creator sees here is exactly
  // what a backer sees in the feed.
  const preview: FeedItem = useMemo(
    () => ({
      objectType: 'idea',
      id: 'preview',
      slug: 'preview',
      title: form.title.trim() || 'Your idea',
      problem: form.problem.trim() || 'The problem you are solving will appear here.',
      solution: form.solution,
      category: form.category,
      region: form.region.trim() || null,
      coverImageUrl: form.coverPreview ?? form.coverImageUrl,
      askAmount: form.askAmount || '0',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 0,
      weightedPrePledgeTotal: '0',
      feedbackScore: '0',
      feedbackCount: 0,
      commentCount: 0,
      qualityScore: null,
      creatorId: 'you',
      creator: { id: 'you', displayName: 'You', avatarUrl: null, identityVerified: false },
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'EXPLORE', label: 'New, worth a look' },
      creatorPrePledgeTarget: null,
      validatingSince: new Date().toISOString(),
    }),
    [form]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    touchAll(['title', 'problem', 'targetUser', 'currentAlternative', 'solution', 'askAmount', 'roadmap']);

    if (hasErrors) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!env.useFixtures) {
        const created = await createIdea({
          title: form.title.trim(),
          problem: form.problem.trim(),
          solution: form.solution.trim(),
          problemDoc: form.problemDoc ?? undefined,
          solutionDoc: form.solutionDoc ?? undefined,
          targetUser: form.targetUser.trim() || undefined,
          currentAlternative: form.currentAlternative.trim() || undefined,
          askBreakdown: {},
          category: form.category,
          region: form.region.trim() || undefined,
          coverImageUrl: form.coverPreview ?? form.coverImageUrl ?? undefined,
          risks: form.risks.trim() || undefined,
          roadmapSteps: form.steps.filter((s) => s.date && s.description.trim()),
          askAmount: Number(form.askAmount) || 0,
        });

        const published = await publishIdea(created.id);
        router.push(`/ideas/${published.id}`);
      } else {
        const mockSlug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-idea';
        const mockId = `idea_${mockSlug}`;
        const mockCreated = {
          objectType: 'idea' as const,
          id: mockId,
          slug: mockSlug,
          title: form.title.trim(),
          problem: form.problem.trim(),
          solution: form.solution.trim(),
          solutionDoc: form.solutionDoc,
          problemDoc: form.problemDoc,
          targetUser: form.targetUser.trim() || null,
          currentAlternative: form.currentAlternative.trim() || null,
          askAmount: form.askAmount || '0',
          category: form.category,
          region: form.region.trim() || null,
          coverImageUrl: form.coverPreview ?? form.coverImageUrl ?? null,
          status: 'VALIDATING' as const,
          discoverabilityTier: 'DISCOVERABLE' as const,
          supporterCount: 0,
          weightedPrePledgeTotal: '0',
          feedbackScore: '0',
          feedbackCount: 0,
          commentCount: 0,
          qualityScore: '0.8500',
          creatorId: 'you',
          creator: {
            id: 'you',
            displayName: 'You',
            avatarUrl: null,
            identityVerified: false,
            bio: 'Creator',
            tier: 'STARTER' as const,
            completedCampaigns: 0,
            ideasPublished: 1,
            memberSince: new Date().toISOString(),
          },
          roadmapSteps: form.steps.filter((s) => s.date && s.description.trim()),
          roadmap: form.steps.map((s) => `${s.date}: ${s.description}`).join('; '),
          risks: form.risks.trim() || null,
          askBreakdown: null,
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        };

        cacheCreatedIdea(mockCreated);

        setTimeout(() => {
          setIsSubmitting(false);
          router.push(`/ideas/${mockCreated.id}`);
        }, 400);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to publish idea. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Publish an idea
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Publishing is free and nothing is charged. You are asking people whether this is worth
          building, so describe what you will build and who needs it. Do not promise anyone a financial
          return.
        </p>
      </header>

      {/* Testing Preset Selector Toolbar */}
      <div className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-accent-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Quick-Fill Test Presets
            </h3>
            <span className="text-[11px] text-ink-muted hidden sm:inline">
              (Auto-fill pitch form with weak, normal, or detailed test data)
            </span>
          </div>
          {activePreset && (
            <button
              type="button"
              onClick={clearPreset}
              className="text-xs font-semibold text-ink-muted hover:text-danger-700 hover:underline transition cursor-pointer"
            >
              Clear form
            </button>
          )}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {(['weak', 'normal', 'detailed'] as const).map((key) => {
            const p = IDEA_PRESETS[key];
            const isSelected = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent-500 bg-surface ring-2 ring-accent-500/20 shadow-xs'
                    : 'border-border bg-surface/70 hover:border-accent-500/40 hover:bg-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-ink">{p.name}</span>
                  <Pill tone={p.badgeTone} size="sm">
                    {p.badge}
                  </Pill>
                </div>
                <p className="text-[11px] leading-relaxed text-ink-muted line-clamp-2">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <form onSubmit={submit} noValidate className="min-w-0 space-y-5">
          <FieldSet legend="The idea">
            <Field label="Idea title" error={showError('title')}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  onBlur={() => touch('title')}
                  aria-invalid={invalid}
                  aria-describedby={describedBy || undefined}
                  className={controlClass(invalid)}
                />
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Both fields in this row carry exactly one line of help. Without that the Category
                  control sits a line higher than its neighbour, because the help text under "Where you
                  are building" pushes only that column's input down. */}
              <Field label="Category" help="Where your idea appears when people browse by topic.">
                {({ id }) => (
                  <select
                    id={id}
                    value={form.category}
                    onChange={(e) => set('category', e.target.value as IdeaCategory)}
                    className={controlClass(false)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field
                label="Where you are building"
                help="A city or region. It helps people nearby find you."
                optional
              >
                {({ id }) => (
                  <input
                    id={id}
                    value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                    placeholder="Lagos"
                    className={controlClass(false)}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Cover image"
              help="A photo of the thing, or a screenshot, does better than a logo. Ideas without one get a plain typed cover."
              optional
            >
              {() => (
                <ImageField
                  value={form.coverImageUrl}
                  onChange={(next) => set('coverImageUrl', next)}
                  onLocalPreview={(objectUrl) => set('coverPreview', objectUrl)}
                />
              )}
            </Field>
          </FieldSet>

          <FieldSet
            legend="The problem"
            description="This is the part people judge. Specific beats impressive."
          >
            <Field
              label="The problem, in a sentence or two"
              help="This exact line is what people read on your card in the feed, so lead with who has the problem and how often. There is room for the full story below."
              error={showError('problem')}
              counter={{ value: form.problem.length, target: 200 }}
            >
              {({ id, invalid, describedBy }) => (
                <textarea
                  id={id}
                  rows={3}
                  value={form.problem}
                  onChange={(e) => set('problem', e.target.value)}
                  onBlur={() => touch('problem')}
                  aria-invalid={invalid}
                  aria-describedby={describedBy || undefined}
                  className={controlClass(invalid)}
                />
              )}
            </Field>

            <Field
              label="The full story"
              help="Evidence, numbers, what you have seen first hand, photos, links to anything that already exists. This is where a reader decides you actually know this problem."
              optional
            >
              {({ id }) => (
                <RichTextField
                  id={id}
                  value={form.problemDoc}
                  minHeight="10rem"
                  placeholder="What have you seen? What did it cost someone?"
                  onChange={(doc) => set('problemDoc', doc)}
                />
              )}
            </Field>

            <Field
              label="Who has this problem"
              help="Name the group as narrowly as you honestly can."
              error={showError('targetUser')}
            >
              {({ id, invalid, describedBy }) => (
                <textarea
                  id={id}
                  rows={2}
                  value={form.targetUser}
                  onChange={(e) => set('targetUser', e.target.value)}
                  onBlur={() => touch('targetUser')}
                  aria-invalid={invalid}
                  aria-describedby={describedBy || undefined}
                  className={controlClass(invalid)}
                />
              )}
            </Field>

            <Field
              label="What they do today"
              help="What do they use instead, and where does it fall short?"
              error={showError('currentAlternative')}
            >
              {({ id, invalid, describedBy }) => (
                <textarea
                  id={id}
                  rows={2}
                  value={form.currentAlternative}
                  onChange={(e) => set('currentAlternative', e.target.value)}
                  onBlur={() => touch('currentAlternative')}
                  aria-invalid={invalid}
                  aria-describedby={describedBy || undefined}
                  className={controlClass(invalid)}
                />
              )}
            </Field>
          </FieldSet>

          <FieldSet legend="The plan">
            <Field
              label="Your solution"
              help="What you would build. Not why it matters. Add headings, a link to anything that already exists, and a photo if you have one."
              error={showError('solution')}
              counter={{ value: form.solution.length, target: 300 }}
            >
              {({ id, invalid, describedBy }) => (
                <RichTextField
                  id={id}
                  value={form.solutionDoc}
                  invalid={invalid}
                  describedBy={describedBy}
                  placeholder="Describe what you would build…"
                  onBlur={() => touch('solution')}
                  onChange={(doc, plainText) =>
                    setForm((f) => ({ ...f, solutionDoc: doc, solution: plainText }))
                  }
                />
              )}
            </Field>

            <Field
              label="What happens when"
              help="At least two dated steps. What will exist, and by when?"
              error={showError('roadmap')}
            >
              {({ invalid }) => (
                <div className="space-y-2">
                  {form.steps.map((step, i) => (
                    <div key={i} className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="date"
                        value={step.date}
                        onChange={(e) => {
                          const steps = [...form.steps];
                          steps[i] = { ...steps[i], date: e.target.value };
                          set('steps', steps);
                        }}
                        onBlur={() => touch('roadmap')}
                        aria-label={`Step ${i + 1} date`}
                        className={controlClass(invalid, 'sm:w-44')}
                      />
                      <input
                        value={step.description}
                        onChange={(e) => {
                          const steps = [...form.steps];
                          steps[i] = { ...steps[i], description: e.target.value };
                          set('steps', steps);
                        }}
                        onBlur={() => touch('roadmap')}
                        aria-label={`Step ${i + 1} description`}
                        placeholder="What will exist by then"
                        className={controlClass(invalid, 'flex-1')}
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => set('steps', [...form.steps, { ...EMPTY_STEP }])}
                  >
                    Add another step
                  </Button>
                </div>
              )}
            </Field>
          </FieldSet>

          <FieldSet
            legend="The ask"
            description="A rough figure is fine. Nothing is charged, and no money moves while an idea is being validated."
          >
            <Field
              label="How much you would need"
              help="In US dollars, roughly. You can change this before a campaign."
              error={showError('askAmount')}
            >
              {({ id, invalid, describedBy }) => (
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted"
                  >
                    $
                  </span>
                  <input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={form.askAmount}
                    onChange={(e) => set('askAmount', e.target.value)}
                    onBlur={() => touch('askAmount')}
                    aria-invalid={invalid}
                    aria-describedby={describedBy || undefined}
                    className={controlClass(invalid, 'pl-7 tabular-nums')}
                  />
                </div>
              )}
            </Field>

            <Field
              label="What could go wrong"
              help="What is most likely to go wrong, and what would you do about it? Naming a real risk reads as competence, not doubt."
              optional
            >
              {({ id }) => (
                <textarea
                  id={id}
                  rows={3}
                  value={form.risks}
                  onChange={(e) => set('risks', e.target.value)}
                  className={controlClass(false)}
                />
              )}
            </Field>
          </FieldSet>

          {submitError && (
            <p className="rounded-lg border border-danger/40 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {submitError}
            </p>
          )}

          {submitted && hasErrors && (
            <p className="rounded-lg border border-danger/40 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              A few answers still need work. They are marked above.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing idea...' : 'Publish idea'}
            </Button>
            <Button variant="outline" size="md" type="button" disabled={isSubmitting}>
              Save draft
            </Button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24">
          <h2 className="mb-3 text-sm font-semibold text-ink">This is what backers will see</h2>
          <IdeaCard item={preview} />
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            Your idea starts at zero and is only reachable by its link until it has enough to show. That
            is normal, and it is why the first few supporters usually come from people you tell directly.
          </p>
        </aside>
      </div>
    </div>
  );
}
