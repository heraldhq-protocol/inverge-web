"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft02Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  Idea01Icon,
  Settings02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackDialog } from "@/features/feedback/components/feedback-dialog";
import {
  createId,
  duplicateQuestion,
  emptyAnswerFor,
  enabledDestinations,
  FEEDBACK_LIMITS,
  moveItem,
  newQuestion,
  primaryDestination,
  validateCommunityUrl,
  validateFeedbackForm,
} from "@/features/feedback/lib/feedback";
import {
  COMMUNITY_DESTINATION_META,
  FEEDBACK_QUESTION_META,
  type CommunityDestination,
  type CommunityDestinationKind,
  type CommunityInvite,
  type FeedbackAnswers,
  type FeedbackForm,
  type FeedbackQuestion,
  type FeedbackQuestionType,
} from "@/features/feedback/types";
import type { IdeaDetail } from "@/features/ideas/types";

const typeOptions = Object.entries(FEEDBACK_QUESTION_META).map(
  ([value, meta]) => ({ label: meta.label, value }),
);

const destinationOptions = Object.entries(COMMUNITY_DESTINATION_META).map(
  ([value, meta]) => ({ label: meta.label, value }),
);

const DRAFT_PREFIX = "inverge:feedback-builder:";

type StoredDraft = { form: FeedbackForm; community: CommunityInvite };

function readDraft(ideaId: string): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_PREFIX}${ideaId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    return parsed.form && parsed.community
      ? { form: parsed.form, community: parsed.community }
      : null;
  } catch {
    return null;
  }
}

function writeDraft(ideaId: string, draft: StoredDraft): void {
  try {
    window.localStorage.setItem(
      `${DRAFT_PREFIX}${ideaId}`,
      JSON.stringify(draft),
    );
  } catch {
    // Storage failure must not block editing.
  }
}

function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: typeof Add01Icon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-brand/35 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <HugeiconsIcon
        icon={icon}
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </button>
  );
}

function QuestionCard({
  errors,
  index,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
  question,
  total,
}: {
  errors: string[];
  index: number;
  onChange: (next: FeedbackQuestion) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
  question: FeedbackQuestion;
  total: number;
}) {
  const meta = FEEDBACK_QUESTION_META[question.type];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const errorId = `question-error-${question.id}`;

  function patchOption(optionId: string, label: string) {
    onChange({
      ...question,
      options: (question.options ?? []).map((option) =>
        option.id === optionId ? { ...option, label } : option,
      ),
    });
  }

  function removeOption(optionId: string) {
    onChange({
      ...question,
      options: (question.options ?? []).filter(
        (option) => option.id !== optionId,
      ),
    });
  }

  function moveOption(optionIndex: number, direction: -1 | 1) {
    onChange({
      ...question,
      options: moveItem(
        question.options ?? [],
        optionIndex,
        optionIndex + direction,
      ),
    });
  }

  return (
    <li
      className={`rounded-2xl border bg-surface p-4 ${
        errors.length > 0 ? "border-danger/40" : "border-border"
      }`}
      aria-describedby={errors.length > 0 ? errorId : undefined}
    >
      <div className="flex items-start gap-2">
        <span className="mt-2 grid size-6 shrink-0 place-items-center rounded-full bg-canvas text-[0.625rem] font-bold tabular-nums text-muted">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill size="xs">{meta.label}</Pill>
            {question.required ? (
              <Pill tone="accent" size="xs">
                Required
              </Pill>
            ) : (
              <span className="text-[0.625rem] text-muted">Optional</span>
            )}
          </div>

          <label className="mt-2 block">
            <span className="sr-only">Question {index + 1} label</span>
            <Input
              value={question.label}
              maxLength={FEEDBACK_LIMITS.maxLabelLength}
              placeholder="Write the question"
              onChange={(event) =>
                onChange({ ...question, label: event.target.value })
              }
              className="font-medium"
            />
          </label>

          <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label
                htmlFor={`question-type-${question.id}`}
                className="mb-1 block text-[0.6875rem] font-medium text-muted"
              >
                Answer type
              </label>
              <Select
                id={`question-type-${question.id}`}
                options={typeOptions}
                value={question.type}
                onValueChange={(value) => {
                  const type = value as FeedbackQuestionType;
                  onChange({
                    ...question,
                    type,
                    options: FEEDBACK_QUESTION_META[type].supportsOptions
                      ? (question.options ?? newQuestion(type).options)
                      : undefined,
                    scale:
                      type === "scale"
                        ? (question.scale ?? newQuestion(type).scale)
                        : undefined,
                  });
                }}
              />
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-ink">
              Required
              <Switch
                aria-label={`Question ${index + 1} required`}
                checked={question.required}
                onCheckedChange={(checked) =>
                  onChange({ ...question, required: checked })
                }
              />
            </label>
          </div>

          {meta.supportsOptions ? (
            <fieldset className="mt-3">
              <legend className="text-[0.6875rem] font-medium text-muted">
                Options
              </legend>
              <ul className="mt-1.5 space-y-1.5">
                {(question.options ?? []).map((option, optionIndex) => (
                  <li key={option.id} className="flex items-center gap-1">
                    <Input
                      value={option.label}
                      aria-label={`Option ${optionIndex + 1}`}
                      maxLength={FEEDBACK_LIMITS.maxOptionLength}
                      onChange={(event) =>
                        patchOption(option.id, event.target.value)
                      }
                      className="min-h-10 text-sm"
                    />
                    <IconButton
                      icon={ArrowUp01Icon}
                      label={`Move option ${optionIndex + 1} up`}
                      disabled={optionIndex === 0}
                      onClick={() => moveOption(optionIndex, -1)}
                    />
                    <IconButton
                      icon={ArrowDown01Icon}
                      label={`Move option ${optionIndex + 1} down`}
                      disabled={
                        optionIndex === (question.options?.length ?? 0) - 1
                      }
                      onClick={() => moveOption(optionIndex, 1)}
                    />
                    <IconButton
                      icon={Delete02Icon}
                      label={`Remove option ${optionIndex + 1}`}
                      disabled={(question.options?.length ?? 0) <= 2}
                      onClick={() => removeOption(option.id)}
                    />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...question,
                    options: [
                      ...(question.options ?? []),
                      { id: createId("o"), label: "New option" },
                    ],
                  })
                }
                disabled={
                  (question.options?.length ?? 0) >= FEEDBACK_LIMITS.maxOptions
                }
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Add option
              </button>
            </fieldset>
          ) : null}

          {question.type === "scale" ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <label className="text-[0.6875rem] font-medium text-muted">
                Lowest value
                <Input
                  type="number"
                  min={0}
                  max={9}
                  value={question.scale?.min ?? 1}
                  onChange={(event) =>
                    onChange({
                      ...question,
                      scale: {
                        ...(question.scale ?? {
                          min: 1,
                          max: 5,
                          minLabel: "",
                          maxLabel: "",
                        }),
                        min: Number(event.target.value),
                      },
                    })
                  }
                  className="mt-1 min-h-10 text-sm"
                />
              </label>
              <label className="text-[0.6875rem] font-medium text-muted">
                Highest value
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={question.scale?.max ?? 5}
                  onChange={(event) =>
                    onChange({
                      ...question,
                      scale: {
                        ...(question.scale ?? {
                          min: 1,
                          max: 5,
                          minLabel: "",
                          maxLabel: "",
                        }),
                        max: Number(event.target.value),
                      },
                    })
                  }
                  className="mt-1 min-h-10 text-sm"
                />
              </label>
              <label className="text-[0.6875rem] font-medium text-muted">
                Low label
                <Input
                  value={question.scale?.minLabel ?? ""}
                  maxLength={40}
                  onChange={(event) =>
                    onChange({
                      ...question,
                      scale: {
                        ...(question.scale ?? {
                          min: 1,
                          max: 5,
                          minLabel: "",
                          maxLabel: "",
                        }),
                        minLabel: event.target.value,
                      },
                    })
                  }
                  className="mt-1 min-h-10 text-sm"
                />
              </label>
              <label className="text-[0.6875rem] font-medium text-muted">
                High label
                <Input
                  value={question.scale?.maxLabel ?? ""}
                  maxLength={40}
                  onChange={(event) =>
                    onChange({
                      ...question,
                      scale: {
                        ...(question.scale ?? {
                          min: 1,
                          max: 5,
                          minLabel: "",
                          maxLabel: "",
                        }),
                        maxLabel: event.target.value,
                      },
                    })
                  }
                  className="mt-1 min-h-10 text-sm"
                />
              </label>
            </div>
          ) : null}

          <details className="mt-3 rounded-lg border border-border">
            <summary className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
              <HugeiconsIcon
                icon={Settings02Icon}
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              More settings
            </summary>
            <div className="border-t border-border p-3">
              <label className="block text-[0.6875rem] font-medium text-muted">
                Help text (optional)
                <Input
                  value={question.helpText ?? ""}
                  maxLength={FEEDBACK_LIMITS.maxHelpLength}
                  placeholder="Why this question matters, or how to answer it"
                  onChange={(event) =>
                    onChange({ ...question, helpText: event.target.value })
                  }
                  className="mt-1 min-h-10 text-sm"
                />
              </label>
            </div>
          </details>

          {errors.length > 0 ? (
            <div id={errorId} className="mt-2 space-y-0.5" role="alert">
              {errors.map((error) => (
                <p key={error} className="text-xs font-medium text-danger">
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <IconButton
            icon={ArrowUp01Icon}
            label={`Move question ${index + 1} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          />
          <IconButton
            icon={ArrowDown01Icon}
            label={`Move question ${index + 1} down`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          />
          <IconButton
            icon={Copy01Icon}
            label={`Duplicate question ${index + 1}`}
            onClick={onDuplicate}
          />
          <IconButton
            icon={Delete02Icon}
            label={`Delete question ${index + 1}`}
            onClick={() => {
              if (confirmDelete) {
                onDelete();
                return;
              }
              setConfirmDelete(true);
            }}
          />
          {confirmDelete ? (
            <span className="max-w-20 text-[0.5625rem] leading-3 text-danger">
              Click again to delete
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Creator feedback and community configuration.
 *
 * Drafts persist in localStorage because this repository has no authenticated
 * session. Publishing is therefore a preview transition, not a backend write;
 * the page says so and keeps the API contract in `features/feedback/types` so
 * the swap point is explicit.
 */
export function FeedbackBuilder({
  idea,
  initialCommunity,
  initialForm,
}: {
  idea: IdeaDetail;
  initialCommunity: CommunityInvite;
  initialForm: FeedbackForm;
}) {
  const [tab, setTab] = useState<"community" | "feedback">("feedback");
  const [form, setForm] = useState<FeedbackForm>(initialForm);
  const [community, setCommunity] = useState<CommunityInvite>(initialCommunity);
  const [status, setStatus] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState(false);

  useEffect(() => {
    const draft = readDraft(idea.id);
    if (draft) {
      // The draft lives only in this browser. Reading localStorage during render would
      // make the first client render disagree with the server HTML, so restoring after
      // mount is intentional; this is a hydration boundary, not derived state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(draft.form);
      setCommunity(draft.community);
      setStatus("Restored the draft saved in this browser.");
    }
    setLoadedDraft(true);
  }, [idea.id]);

  const issues = useMemo(() => validateFeedbackForm(form), [form]);
  const issueMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const issue of issues) {
      map.set(issue.field, [...(map.get(issue.field) ?? []), issue.message]);
    }
    return map;
  }, [issues]);

  const communityIssues = useMemo(() => {
    if (!community.enabled) return [] as string[];
    const problems: string[] = [];
    if (!community.title.trim())
      problems.push("Community invitation needs a title.");
    for (const destination of community.destinations) {
      if (!destination.enabled) continue;
      const result = validateCommunityUrl(destination.url);
      if ("error" in result) {
        problems.push(`${destination.label || "A link"}: ${result.error}`);
      }
    }
    if (!primaryDestination(community)) {
      problems.push("Choose an enabled primary destination.");
    }
    return problems;
  }, [community]);

  function updateForm(patch: Partial<FeedbackForm>) {
    setForm((current) => ({ ...current, ...patch }));
    setStatus(null);
  }

  function updateQuestion(index: number, next: FeedbackQuestion) {
    updateForm({
      questions: form.questions.map((question, questionIndex) =>
        questionIndex === index ? next : question,
      ),
    });
  }

  function saveDraft() {
    writeDraft(idea.id, { community, form });
    setStatus("Draft saved in this browser. It is not on the server yet.");
  }

  function publish() {
    setShowErrors(true);
    if (issues.length > 0 || communityIssues.length > 0) {
      setStatus("Fix the highlighted fields before publishing.");
      return;
    }
    const nextForm: FeedbackForm = {
      ...form,
      published: true,
      updatedAt: new Date().toISOString(),
      version: form.published ? form.version + 1 : Math.max(1, form.version),
    };
    setForm(nextForm);
    writeDraft(idea.id, { community, form: nextForm });
    setStatus(
      `Published as form version ${nextForm.version} in this preview. Previous responses stay attached to the version they answered.`,
    );
  }

  function addDestination() {
    const kind: CommunityDestinationKind = "website";
    const destination: CommunityDestination = {
      enabled: true,
      id: createId("community"),
      kind,
      label: COMMUNITY_DESTINATION_META[kind].label,
      url: "",
    };
    setCommunity((current) => ({
      ...current,
      destinations: [...current.destinations, destination],
      primaryDestinationId: current.primaryDestinationId ?? destination.id,
    }));
    setStatus(null);
  }

  function updateDestination(id: string, patch: Partial<CommunityDestination>) {
    setCommunity((current) => ({
      ...current,
      destinations: current.destinations.map((destination) =>
        destination.id === id ? { ...destination, ...patch } : destination,
      ),
    }));
    setStatus(null);
  }

  function removeDestination(id: string) {
    setCommunity((current) => ({
      ...current,
      destinations: current.destinations.filter(
        (destination) => destination.id !== id,
      ),
      primaryDestinationId:
        current.primaryDestinationId === id
          ? (current.destinations.find((destination) => destination.id !== id)
              ?.id ?? null)
          : current.primaryDestinationId,
    }));
  }

  const previewAnswers = useMemo<FeedbackAnswers>(() => {
    const answers: FeedbackAnswers = {};
    for (const question of form.questions) {
      answers[question.id] = emptyAnswerFor(question.type) as never;
    }
    return answers;
  }, [form.questions]);

  const formForPreview: FeedbackForm = { ...form, enabled: true };
  const ideaForPreview: IdeaDetail = {
    ...idea,
    community,
    feedbackForm: formForPreview,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/d/creator/ideas"
              className="rounded font-medium hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              My ideas
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-56 truncate text-ink-soft">{idea.title}</li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Feedback & community</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Creator configuration</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Feedback and community
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Ask the questions you actually need, then decide whether to invite
            respondents into a community after they answer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={form.published ? "accent" : "neutral"} size="xs">
            {form.published ? `Published · v${form.version}` : "Draft"}
          </Pill>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold text-warning-strong">
            Preview persistence
          </span>
        </div>
      </header>

      <div className="mt-4 flex gap-1 border-b border-border">
        {(
          [
            ["feedback", "Feedback form"],
            ["community", "Community"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={`relative inline-flex min-h-11 items-center px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              tab === value
                ? "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-brand"
                : "font-medium text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {status ? (
        <p
          className="mt-4 rounded-xl border border-brand/25 bg-brand-tint px-3 py-2 text-xs leading-5 text-brand-strong"
          role="status"
        >
          {status}
        </p>
      ) : null}

      {tab === "feedback" ? (
        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink">
                    Feedback form
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-muted">
                    When this is off, the public page shows no feedback card at
                    all. Support and funding interest are separate.
                  </p>
                </div>
                <Switch
                  aria-label="Enable feedback form"
                  checked={form.enabled}
                  onCheckedChange={(enabled) => updateForm({ enabled })}
                />
              </div>

              {form.enabled ? (
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-medium text-ink">
                    Form title
                    <Input
                      value={form.title}
                      maxLength={120}
                      onChange={(event) =>
                        updateForm({ title: event.target.value })
                      }
                      className="mt-1"
                      aria-describedby={
                        showErrors && issueMap.get("title")
                          ? "form-title-error"
                          : undefined
                      }
                    />
                  </label>
                  {showErrors && issueMap.get("title") ? (
                    <p
                      id="form-title-error"
                      className="text-xs text-danger"
                      role="alert"
                    >
                      {issueMap.get("title")?.join(" ")}
                    </p>
                  ) : null}
                  <label className="block text-xs font-medium text-ink">
                    Introduction
                    <Textarea
                      value={form.description}
                      rows={2}
                      maxLength={FEEDBACK_LIMITS.maxDescriptionLength}
                      onChange={(event) =>
                        updateForm({ description: event.target.value })
                      }
                      className="mt-1"
                    />
                  </label>
                </div>
              ) : null}
            </section>

            {form.enabled ? (
              <>
                <section aria-labelledby="questions-heading">
                  <div className="flex items-center justify-between gap-3">
                    <h2
                      id="questions-heading"
                      className="text-base font-bold text-ink"
                    >
                      Questions
                    </h2>
                    <span className="text-xs tabular-nums text-muted">
                      {form.questions.length} / {FEEDBACK_LIMITS.maxQuestions}
                    </span>
                  </div>

                  {form.questions.length > 0 ? (
                    <ul className="mt-3 space-y-3">
                      {form.questions.map((question, index) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          index={index}
                          total={form.questions.length}
                          errors={
                            showErrors
                              ? (issueMap.get(`question:${question.id}`) ?? [])
                              : []
                          }
                          onChange={(next) => updateQuestion(index, next)}
                          onMove={(direction) =>
                            updateForm({
                              questions: moveItem(
                                form.questions,
                                index,
                                index + direction,
                              ),
                            })
                          }
                          onDuplicate={() =>
                            updateForm({
                              questions: [
                                ...form.questions.slice(0, index + 1),
                                duplicateQuestion(question),
                                ...form.questions.slice(index + 1),
                              ],
                            })
                          }
                          onDelete={() =>
                            updateForm({
                              questions: form.questions.filter(
                                (_, questionIndex) => questionIndex !== index,
                              ),
                            })
                          }
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
                      No questions yet. Add one below, or turn feedback off.
                    </p>
                  )}

                  <div className="mt-4 rounded-2xl border border-border bg-canvas p-4">
                    <p className="text-sm font-semibold text-ink">
                      Add a question
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {typeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          disabled={
                            form.questions.length >=
                            FEEDBACK_LIMITS.maxQuestions
                          }
                          onClick={() =>
                            updateForm({
                              questions: [
                                ...form.questions,
                                newQuestion(
                                  option.value as FeedbackQuestionType,
                                ),
                              ],
                            })
                          }
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-brand/35 hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          <HugeiconsIcon
                            icon={Add01Icon}
                            size={13}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[0.6875rem] leading-4 text-muted">
                      Only star-rating questions feed the overall average.
                      Choice, text, and scale answers are reported separately.
                    </p>
                  </div>
                </section>
              </>
            ) : null}
          </div>

          <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-2xl border border-border bg-surface p-4">
              <h2 className="text-sm font-bold text-ink">Before publishing</h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted">
                <li>Every question has a label.</li>
                <li>Choice questions have at least two unique options.</li>
                <li>Required questions are genuinely necessary.</li>
                <li>
                  A new form version keeps historical answers attached to the
                  version they answered.
                </li>
              </ul>
              <Button
                type="button"
                size="md"
                className="mt-3 w-full"
                onClick={() => setPreviewOpen(true)}
                disabled={!form.enabled || form.questions.length === 0}
              >
                <HugeiconsIcon
                  icon={ViewIcon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Preview form
              </Button>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-4">
              <h2 className="text-sm font-bold text-ink">Publishing rules</h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                The API currently allows survey edits only while an idea is a
                draft. This preview lets you edit at any time, but a live
                publish must follow that rule and create a new version.
              </p>
              <Link
                href="/guides"
                className="mt-2 inline-flex min-h-9 items-center gap-1 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Read the creator guides
              </Link>
            </section>
          </aside>
        </div>
      ) : (
        <CommunitySettings
          community={community}
          destinationOptions={destinationOptions}
          issues={communityIssues}
          onAddDestination={addDestination}
          onChange={(next) => {
            setCommunity(next);
            setStatus(null);
          }}
          onRemoveDestination={removeDestination}
          onUpdateDestination={updateDestination}
        />
      )}

      <div className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-canvas/95 py-3 backdrop-blur">
        <Link
          href="/d/creator/ideas"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          Back to my ideas
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="md" onClick={saveDraft}>
            Save draft
          </Button>
          <Button type="button" size="md" onClick={publish}>
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Publish changes
          </Button>
        </div>
      </div>

      {previewOpen ? (
        <FeedbackDialog
          idea={ideaForPreview}
          form={formForPreview}
          viewer="signed-in"
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}

      <span className="sr-only" aria-live="polite">
        {loadedDraft ? "" : "Loading saved draft"}
      </span>
      <span className="sr-only">{previewAnswers ? "" : ""}</span>
    </div>
  );
}

function CommunitySettings({
  community,
  destinationOptions,
  issues,
  onAddDestination,
  onChange,
  onRemoveDestination,
  onUpdateDestination,
}: {
  community: CommunityInvite;
  destinationOptions: readonly { label: string; value: string }[];
  issues: readonly string[];
  onAddDestination: () => void;
  onChange: (next: CommunityInvite) => void;
  onRemoveDestination: (id: string) => void;
  onUpdateDestination: (
    id: string,
    patch: Partial<CommunityDestination>,
  ) => void;
}) {
  const destinations = enabledDestinations(community);

  return (
    <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                Community invitation
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                Shown after feedback, on the public page, or both. Every field
                is optional and feedback can be completed without joining
                anything.
              </p>
            </div>
            <Switch
              aria-label="Enable community invitation"
              checked={community.enabled}
              onCheckedChange={(enabled) => onChange({ ...community, enabled })}
            />
          </div>

          {community.enabled ? (
            <div className="mt-4 grid gap-3">
              <label className="block text-xs font-medium text-ink">
                Invitation title
                <Input
                  value={community.title}
                  maxLength={120}
                  onChange={(event) =>
                    onChange({ ...community, title: event.target.value })
                  }
                  className="mt-1"
                />
              </label>
              <label className="block text-xs font-medium text-ink">
                Description
                <Textarea
                  value={community.description}
                  rows={2}
                  maxLength={320}
                  onChange={(event) =>
                    onChange({ ...community, description: event.target.value })
                  }
                  className="mt-1"
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={community.showAfterFeedback}
                    onChange={(event) =>
                      onChange({
                        ...community,
                        showAfterFeedback: event.target.checked,
                      })
                    }
                    className="size-4 accent-brand"
                  />
                  Show after feedback
                </label>
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={community.showOnIdeaPage}
                    onChange={(event) =>
                      onChange({
                        ...community,
                        showOnIdeaPage: event.target.checked,
                      })
                    }
                    className="size-4 accent-brand"
                  />
                  Show on the idea page
                </label>
              </div>
            </div>
          ) : null}
        </div>

        {community.enabled ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">Destinations</h2>
                <p className="mt-0.5 text-xs text-muted">
                  External links open in a new tab. Only HTTPS links are
                  accepted.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddDestination}
              >
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Add link
              </Button>
            </div>

            {community.destinations.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {community.destinations.map((destination, index) => {
                  const check = validateCommunityUrl(destination.url);
                  return (
                    <li
                      key={destination.id}
                      className="rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-ink">
                          <input
                            type="radio"
                            name="primary-destination"
                            checked={
                              community.primaryDestinationId === destination.id
                            }
                            onChange={() =>
                              onChange({
                                ...community,
                                primaryDestinationId: destination.id,
                              })
                            }
                            aria-label={`Make ${destination.label || `link ${index + 1}`} the primary action`}
                            className="size-4 accent-brand"
                          />
                          Primary
                        </label>
                        <button
                          type="button"
                          onClick={() => onRemoveDestination(destination.id)}
                          aria-label={`Remove ${destination.label || `link ${index + 1}`}`}
                          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={15}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <div className="mt-2 grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                        <div>
                          <label
                            htmlFor={`destination-kind-${destination.id}`}
                            className="mb-1 block text-[0.6875rem] font-medium text-muted"
                          >
                            Type
                          </label>
                          <Select
                            id={`destination-kind-${destination.id}`}
                            options={destinationOptions}
                            value={destination.kind}
                            onValueChange={(value) => {
                              const kind = value as CommunityDestinationKind;
                              onUpdateDestination(destination.id, {
                                kind,
                                label:
                                  destination.label ||
                                  COMMUNITY_DESTINATION_META[kind].label,
                              });
                            }}
                          />
                        </div>
                        <label className="block text-[0.6875rem] font-medium text-muted">
                          Label
                          <Input
                            value={destination.label}
                            maxLength={60}
                            onChange={(event) =>
                              onUpdateDestination(destination.id, {
                                label: event.target.value,
                              })
                            }
                            className="mt-1 min-h-10 text-sm"
                          />
                        </label>
                      </div>

                      <label className="mt-2 block text-[0.6875rem] font-medium text-muted">
                        URL
                        <Input
                          type="url"
                          value={destination.url}
                          placeholder={
                            COMMUNITY_DESTINATION_META[destination.kind]
                              .placeholder
                          }
                          onChange={(event) =>
                            onUpdateDestination(destination.id, {
                              url: event.target.value,
                            })
                          }
                          aria-invalid={
                            destination.url.length > 0 && "error" in check
                          }
                          className="mt-1 min-h-10 text-sm"
                        />
                      </label>
                      {destination.url.length > 0 && "error" in check ? (
                        <p className="mt-1 text-xs text-danger" role="alert">
                          {check.error}
                        </p>
                      ) : null}
                      <label className="mt-2 flex items-center gap-2 text-[0.6875rem] text-muted">
                        <input
                          type="checkbox"
                          checked={destination.enabled}
                          onChange={(event) =>
                            onUpdateDestination(destination.id, {
                              enabled: event.target.checked,
                            })
                          }
                          className="size-4 accent-brand"
                        />
                        Display this destination
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
                No destinations yet. Add one, or leave community off.
              </p>
            )}
          </div>
        ) : null}

        {issues.length > 0 ? (
          <div
            className="rounded-xl border border-danger/30 bg-danger/5 p-3"
            role="alert"
          >
            {issues.map((issue) => (
              <p key={issue} className="text-xs text-danger">
                {issue}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <aside className="rounded-2xl border border-border bg-brand-tint p-4 xl:sticky xl:top-24 xl:self-start">
        <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
          <HugeiconsIcon
            icon={Idea01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h2 className="mt-3 text-sm font-bold text-ink">Keep it optional</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          A community link is an invitation, not a condition. Feedback
          submission must work when every destination is disabled. Inverge never
          reports a click as a join.
        </p>
        {destinations.length > 0 ? (
          <p className="mt-2 text-[0.6875rem] text-muted">
            {destinations.length} destination
            {destinations.length === 1 ? "" : "s"} ready to display.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
