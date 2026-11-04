"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  PencilEdit02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { PhaseBadge } from "@/features/programmes/components/phase-badge";
import type {
  ParticipantEntry,
  ParticipantProgramme,
  PublicProgramme,
} from "@/features/programmes/api/types";
import type { MyIdea } from "@/features/programmes/api/participant";
import {
  entryModeLabel,
  formatDateTime,
  formatDateRange,
  PROGRAMME_TYPE_LABELS,
} from "@/features/programmes/lib/public-programme";

type Issue = { code?: string; field?: string; message: string };
type Feedback = { tone: "error" | "success"; message: string; issues: Issue[] };

type FieldSpec = { id: string; label: string; required: boolean };

function titleFromId(id: string): string {
  return id
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readFieldSpecs(value: unknown): FieldSpec[] {
  if (!Array.isArray(value)) return [];
  const specs: FieldSpec[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      specs.push({
        id: item.trim(),
        label: titleFromId(item.trim()),
        required: true,
      });
      continue;
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const id =
      typeof row.id === "string"
        ? row.id
        : typeof row.key === "string"
          ? row.key
          : typeof row.name === "string"
            ? row.name
            : null;
    if (!id) continue;
    specs.push({
      id,
      label:
        typeof row.label === "string" && row.label.trim()
          ? row.label.trim()
          : titleFromId(id),
      required: row.required !== false,
    });
  }
  return specs;
}

function stringContent(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const content: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string") content[key] = raw;
    else if (typeof raw === "number" || typeof raw === "boolean") {
      content[key] = String(raw);
    }
  }
  return content;
}

const STATUS_LABELS: Record<ParticipantEntry["status"], string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  SHORTLISTED: "Shortlisted",
  ACCEPTED: "Accepted",
  REJECTED: "Not selected",
  WITHDRAWN: "Withdrawn",
};

function statusTone(status: ParticipantEntry["status"]): string {
  if (status === "DRAFT") return "border-ink/15 bg-ink/[0.05] text-ink-soft";
  if (status === "SUBMITTED" || status === "UNDER_REVIEW") {
    return "border-warning/25 bg-warning/10 text-warning-strong";
  }
  if (status === "SHORTLISTED" || status === "ACCEPTED") {
    return "border-brand/30 bg-brand-soft text-brand-strong";
  }
  return "border-border bg-canvas text-muted";
}

async function readFailure(response: Response): Promise<Feedback> {
  try {
    const body = (await response.json()) as {
      error?: {
        message?: unknown;
        details?: { issues?: unknown };
      };
    };
    const rawIssues = body.error?.details?.issues;
    const issues: Issue[] = Array.isArray(rawIssues)
      ? rawIssues.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const row = item as Record<string, unknown>;
          if (typeof row.message !== "string") return [];
          return [
            {
              message: row.message,
              ...(typeof row.code === "string" ? { code: row.code } : {}),
              ...(typeof row.field === "string" ? { field: row.field } : {}),
            },
          ];
        })
      : [];
    return {
      tone: "error",
      message:
        typeof body.error?.message === "string"
          ? body.error.message
          : "The request was not accepted. Nothing was saved.",
      issues,
    };
  } catch {
    return {
      tone: "error",
      message: "The request was not accepted. Nothing was saved.",
      issues: [],
    };
  }
}

async function write(
  path: string,
  method: "PATCH" | "POST",
  body: unknown,
): Promise<{ ok: true } | { ok: false; feedback: Feedback }> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      feedback: {
        tone: "error",
        message: "The server could not be reached. Nothing was saved.",
        issues: [],
      },
    };
  }
  if (!response.ok) return { ok: false, feedback: await readFailure(response) };
  return { ok: true };
}

export function ParticipantProgrammeWorkspace({
  ideas,
  ideasUnavailable = false,
  initial,
  programme,
}: {
  ideas: MyIdea[];
  ideasUnavailable?: boolean;
  initial: ParticipantProgramme;
  programme: PublicProgramme;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editing, setEditing] = useState<ParticipantEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);

  const requiredFields = readFieldSpecs(programme.entryPolicy.requiredFields);
  const customQuestions = readFieldSpecs(programme.entryPolicy.customQuestions);
  const fields = [...requiredFields, ...customQuestions];
  const allowedCategories = programme.entryPolicy.allowedCategories;
  const canSubmitNow = programme.phase === "SUBMISSION_OPEN";
  const canRegister =
    !initial.registration &&
    (programme.phase === "REGISTRATION_OPEN" ||
      programme.phase === "SUBMISSION_OPEN");
  const registrationRequired = programme.entryPolicy.registrationRequired;
  const registrationBlocked =
    registrationRequired && !initial.registration && canSubmitNow;
  const usableIdeas = ideas.filter(
    (idea) => idea.status !== "DRAFT" && idea.status !== "ARCHIVED",
  );

  function refresh(message: string) {
    setFeedback({ tone: "success", message, issues: [] });
    setBusy(null);
    setCreating(false);
    setEditing(null);
    setConfirmFinal(false);
    startTransition(() => router.refresh());
  }

  async function register() {
    setBusy("register");
    setFeedback(null);
    const result = await write(
      `/api/programmes/${programme.slug}/register`,
      "POST",
      {},
    );
    if (!result.ok) {
      setFeedback(result.feedback);
      setBusy(null);
      return;
    }
    refresh("Registration recorded.");
  }

  async function createDraft(form: HTMLFormElement) {
    const data = new FormData(form);
    const ideaId = String(data.get("ideaId") ?? "");
    if (!ideaId) {
      setFeedback({
        tone: "error",
        message: "Choose one of your published ideas first.",
        issues: [],
      });
      return;
    }
    const content: Record<string, string> = {};
    for (const field of fields) {
      const value = String(data.get(field.id) ?? "").trim();
      if (value) content[field.id] = value;
    }
    const extra = String(data.get("summary") ?? "").trim();
    if (extra && !content.summary) content.summary = extra;

    setBusy("create");
    setFeedback(null);
    const result = await write(
      `/api/programmes/${programme.slug}/entries`,
      "POST",
      {
        ideaId,
        source:
          programme.entryPolicy.entryMode === "NEW_IDEAS_ONLY"
            ? "NEW_IDEA"
            : "EXISTING_IDEA",
        title: String(data.get("title") ?? "").trim() || undefined,
        category: String(data.get("category") ?? "").trim() || undefined,
        content,
      },
    );
    if (!result.ok) {
      setFeedback(result.feedback);
      setBusy(null);
      return;
    }
    refresh("Draft created. It stays private until you submit.");
  }

  async function saveDraft(entry: ParticipantEntry, form: HTMLFormElement) {
    const data = new FormData(form);
    const content: Record<string, string> = {};
    for (const field of fields) {
      const value = String(data.get(field.id) ?? "").trim();
      if (value) content[field.id] = value;
    }

    setBusy(`save-${entry.id}`);
    setFeedback(null);
    const result = await write(
      `/api/programmes/${programme.slug}/entries/${entry.id}`,
      "PATCH",
      {
        title: String(data.get("title") ?? "").trim(),
        category: String(data.get("category") ?? "").trim(),
        content,
      },
    );
    if (!result.ok) {
      setFeedback(result.feedback);
      setBusy(null);
      return;
    }
    refresh("Draft saved.");
  }

  async function submitEntry(entry: ParticipantEntry) {
    if (!confirmFinal) {
      setFeedback({
        tone: "error",
        message:
          "Confirm that the work is yours and that the submitted snapshot is final.",
        issues: [],
      });
      return;
    }
    setBusy(`submit-${entry.id}`);
    setFeedback(null);
    const result = await write(
      `/api/programmes/${programme.slug}/entries/${entry.id}/submit`,
      "POST",
      { confirmOriginalWork: true },
    );
    if (!result.ok) {
      setFeedback(result.feedback);
      setBusy(null);
      return;
    }
    refresh("Entry submitted. The snapshot is now frozen for judging.");
  }

  async function withdrawEntry(entry: ParticipantEntry) {
    if (
      !window.confirm(
        "Withdraw this entry? It will no longer be judged. This cannot be undone.",
      )
    ) {
      return;
    }
    setBusy(`withdraw-${entry.id}`);
    setFeedback(null);
    const result = await write(
      `/api/programmes/${programme.slug}/entries/${entry.id}/withdraw`,
      "POST",
      {},
    );
    if (!result.ok) {
      setFeedback(result.feedback);
      setBusy(null);
      return;
    }
    refresh("Entry withdrawn.");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PhaseBadge phase={programme.phase} />
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                {PROGRAMME_TYPE_LABELS[programme.type]}
              </span>
            </div>
            <h2 className="mt-2 text-balance text-xl font-bold tracking-[-0.035em] text-ink">
              {programme.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {programme.tagline}
            </p>
            <p className="mt-2 text-xs text-muted">
              {formatDateRange(
                programme.timeline.registrationOpensAt,
                programme.timeline.judgingEndsAt,
              )}{" "}
              · {entryModeLabel(programme.entryPolicy.entryMode)}
            </p>
          </div>
          <Link
            href={`/ideathon/${programme.slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Full brief
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>

        <dl className="mt-4 grid gap-3 border-t border-border pt-3 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted">Registrations</dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {initial.registration
                ? `Registered ${formatDateTime(initial.registration.registeredAt)}`
                : registrationRequired
                  ? "Required"
                  : "Not required"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Your active entries</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink">
              {initial.activeEntryCount} of {initial.entryLimit}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Submissions</dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {canSubmitNow
                ? `Close ${formatDateTime(programme.timeline.submissionClosesAt)}`
                : programme.phase === "JUDGING" ||
                    programme.phase === "RESULTS_REVIEW"
                  ? "Closed; judging in progress"
                  : "Not open"}
            </dd>
          </div>
        </dl>

        {canRegister ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={register}
              disabled={busy !== null}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {busy === "register"
                ? "Registering..."
                : "Register for this programme"}
            </button>
            <p className="text-xs text-muted">
              Registration is free. It does not create an entry.
            </p>
          </div>
        ) : null}

        {initial.registration ? (
          <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand-strong"
            />
            Registration status:{" "}
            <span className="font-semibold text-ink">
              {initial.registration.status.toLowerCase()}
            </span>
            {initial.registration.eligibilityNote
              ? ` · ${initial.registration.eligibilityNote}`
              : ""}
          </p>
        ) : null}
      </section>

      {feedback ? (
        <div
          role={feedback.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-2xl border p-4 text-sm ${
            feedback.tone === "error"
              ? "border-danger/25 bg-danger/5 text-ink"
              : "border-brand/25 bg-brand-soft text-ink"
          }`}
        >
          <p className="font-semibold">{feedback.message}</p>
          {feedback.issues.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
              {feedback.issues.map((issue, index) => (
                <li key={`${issue.code ?? "ISSUE"}-${index}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section
        aria-labelledby="your-entries"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="your-entries"
              className="text-sm font-bold tracking-[-0.02em] text-ink"
            >
              Your entries
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Drafts are private. Submitted snapshots are frozen.
            </p>
          </div>
          {canSubmitNow && initial.canAddEntry && !creating && !editing ? (
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setFeedback(null);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-contrast px-4 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Start an entry
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>

        {registrationBlocked ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning/25 bg-warning/10 p-3 text-xs leading-5 text-ink-soft">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-warning-strong"
            />
            Register before creating an entry. This programme requires a
            registration on file.
          </p>
        ) : null}

        {initial.entries.length === 0 && !creating ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold text-ink">No entries yet.</p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
              {canSubmitNow
                ? "Start an entry from one of your published ideas. You can save a draft and finish it later."
                : "Entries cannot be started in this phase."}
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {initial.entries.map((entry) => (
              <li key={entry.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold ${statusTone(entry.status)}`}
                      >
                        {STATUS_LABELS[entry.status]}
                      </span>
                      <span className="text-[0.625rem] uppercase tracking-[0.1em] text-muted">
                        {entry.category || "No category"}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-ink">
                      {entry.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      Updated {formatDateTime(entry.updatedAt)}
                      {entry.submittedAt
                        ? ` · submitted ${formatDateTime(entry.submittedAt)}`
                        : ""}
                      {entry.submissionVersion > 1
                        ? ` · version ${entry.submissionVersion}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/ideas/${entry.idea.slug || entry.idea.id}`}
                      className="inline-flex min-h-10 items-center rounded-xl border border-border bg-canvas px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      View idea
                    </Link>
                    {entry.status === "DRAFT" && canSubmitNow ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(entry);
                          setCreating(false);
                          setFeedback(null);
                          setConfirmFinal(false);
                        }}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-contrast px-3 text-xs font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <HugeiconsIcon
                          icon={PencilEdit02Icon}
                          size={13}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                        Edit draft
                      </button>
                    ) : null}
                    {entry.status === "SUBMITTED" &&
                    programme.entryPolicy.allowWithdrawal &&
                    programme.phase === "SUBMISSION_OPEN" ? (
                      <button
                        type="button"
                        onClick={() => withdrawEntry(entry)}
                        disabled={busy !== null}
                        className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {busy === `withdraw-${entry.id}`
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {entry.latestFeedback ? (
                  <div className="mt-3 rounded-xl border border-border bg-canvas p-3">
                    <p className="text-xs font-semibold text-ink">
                      Published result:{" "}
                      {entry.latestFeedback.rank !== null
                        ? `rank ${entry.latestFeedback.rank}`
                        : "not ranked"}
                      {entry.latestFeedback.officialScore !== null
                        ? ` · ${entry.latestFeedback.officialScore.toFixed(2)}`
                        : ""}
                    </p>
                    {entry.latestFeedback.incompleteReason ? (
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {entry.latestFeedback.incompleteReason}
                      </p>
                    ) : null}
                    {entry.latestFeedback.feedback?.length ? (
                      <ul className="mt-2 space-y-1">
                        {entry.latestFeedback.feedback.map((note) => (
                          <li
                            key={note}
                            className="text-xs leading-5 text-ink-soft"
                          >
                            {note}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                {entry.teamMembers.length > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    Team:{" "}
                    {entry.teamMembers.map((member) => member.name).join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {creating ? (
        <EntryForm
          mode="create"
          programme={programme}
          fields={fields}
          ideas={usableIdeas}
          ideasUnavailable={ideasUnavailable}
          busy={busy === "create"}
          onCancel={() => setCreating(false)}
          onSubmit={createDraft}
        />
      ) : null}

      {editing ? (
        <EntryForm
          mode="edit"
          programme={programme}
          fields={fields}
          entry={editing}
          busy={
            busy === `save-${editing.id}` || busy === `submit-${editing.id}`
          }
          confirmFinal={confirmFinal}
          onConfirmFinal={setConfirmFinal}
          onCancel={() => {
            setEditing(null);
            setConfirmFinal(false);
          }}
          onSave={(form) => saveDraft(editing, form)}
          onSubmitDraft={() => submitEntry(editing)}
        />
      ) : null}

      <section className="rounded-2xl border border-border bg-canvas p-5">
        <div className="flex gap-3">
          <HugeiconsIcon
            icon={Shield01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand-strong"
          />
          <div>
            <h2 className="text-sm font-bold text-ink">
              What happens after you submit
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">
              The submitted snapshot, not your live idea, is what judges score.
              Editing the idea later does not change a submitted snapshot.
              Provisional results may appear to participants before public
              standings are released; unpublished scores are never shown here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function EntryForm({
  mode,
  programme: formProgramme,
  fields: formFields,
  ideas: formIdeas,
  ideasUnavailable: formIdeasUnavailable,
  entry,
  busy: formBusy,
  confirmFinal: formConfirm,
  onConfirmFinal,
  onCancel,
  onSubmit,
  onSave,
  onSubmitDraft,
}: {
  mode: "create" | "edit";
  programme: PublicProgramme;
  fields: FieldSpec[];
  ideas?: MyIdea[];
  ideasUnavailable?: boolean;
  entry?: ParticipantEntry;
  busy: boolean;
  confirmFinal?: boolean;
  onConfirmFinal?: (value: boolean) => void;
  onCancel: () => void;
  onSubmit?: (form: HTMLFormElement) => void;
  onSave?: (form: HTMLFormElement) => void;
  onSubmitDraft?: () => void;
}) {
  const titleId = useId();
  const categoryId = useId();
  const [selectedIdea, setSelectedIdea] = useState<string>(
    formIdeas?.[0]?.id ?? "",
  );
  const content = stringContent(entry?.content);
  const categories = formProgramme.entryPolicy.allowedCategories;

  return (
    <section
      aria-labelledby={`${mode}-entry-title`}
      className="rounded-2xl border border-brand/25 bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brand-strong">
            {mode === "create" ? "New draft" : "Edit draft"}
          </p>
          <h2
            id={`${mode}-entry-title`}
            className="mt-1 text-lg font-bold tracking-[-0.03em] text-ink"
          >
            {mode === "create" ? "Enter this programme" : entry?.title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            {mode === "create"
              ? "Pick a published idea you own. This creates a private draft; nothing is submitted until you choose Submit."
              : "Saving updates the draft only. Submitting freezes a new snapshot."}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-ink/25 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Close
        </button>
      </div>

      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (mode === "create") onSubmit?.(event.currentTarget);
          else onSave?.(event.currentTarget);
        }}
      >
        {mode === "create" ? (
          <div>
            <label
              htmlFor="entry-idea"
              className="block text-xs font-semibold text-ink"
            >
              Idea
            </label>
            {formIdeas?.length ? (
              <select
                id="entry-idea"
                name="ideaId"
                required
                value={selectedIdea}
                onChange={(event) => setSelectedIdea(event.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {formIdeas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title}
                    {idea.category ? ` · ${idea.category}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1.5 rounded-xl border border-warning/25 bg-warning/10 p-3 text-xs leading-5 text-ink-soft">
                {formIdeasUnavailable
                  ? "Your ideas could not be loaded, so no entry can be started right now. Reload the page to try again."
                  : "You have no published idea that can be entered. Publish an idea first, then return here."}
                {!formIdeasUnavailable ? (
                  <>
                    {" "}
                    <Link
                      href="/d/creator/ideas/new"
                      className="font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand"
                    >
                      Create an idea
                    </Link>
                  </>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor={titleId}
              className="block text-xs font-semibold text-ink"
            >
              Entry title
            </label>
            <input
              id={titleId}
              name="title"
              required
              maxLength={160}
              defaultValue={
                entry?.title ??
                formIdeas?.find((idea) => idea.id === selectedIdea)?.title ??
                ""
              }
              key={mode === "create" ? selectedIdea : entry?.id}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
          </div>
          <div>
            <label
              htmlFor={categoryId}
              className="block text-xs font-semibold text-ink"
            >
              Category
            </label>
            {categories.length > 0 ? (
              <select
                id={categoryId}
                name="category"
                defaultValue={entry?.category ?? categories[0]}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={categoryId}
                name="category"
                maxLength={80}
                defaultValue={entry?.category ?? formProgramme.category}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              />
            )}
          </div>
        </div>

        {formFields.length > 0 ? (
          <div className="space-y-3">
            {formFields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={`field-${field.id}`}
                  className="block text-xs font-semibold text-ink"
                >
                  {field.label}
                  {field.required ? (
                    <span className="ml-1 text-danger" aria-hidden="true">
                      *
                    </span>
                  ) : (
                    <span className="ml-1 font-normal text-muted">
                      (optional)
                    </span>
                  )}
                </label>
                <textarea
                  id={`field-${field.id}`}
                  name={field.id}
                  required={field.required}
                  rows={3}
                  defaultValue={content[field.id] ?? ""}
                  className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm leading-6 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label
              htmlFor="field-summary"
              className="block text-xs font-semibold text-ink"
            >
              Submission notes
            </label>
            <textarea
              id="field-summary"
              name="summary"
              rows={4}
              defaultValue={content.summary ?? ""}
              className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm leading-6 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
            <p className="mt-1 text-[0.6875rem] leading-5 text-muted">
              The programme did not publish named required fields. Add any
              context a judge needs; the linked idea carries the full story.
            </p>
          </div>
        )}

        {mode === "edit" ? (
          <div className="rounded-xl border border-border bg-canvas p-3">
            <label className="flex items-start gap-2.5 text-xs leading-5 text-ink-soft">
              <input
                type="checkbox"
                checked={formConfirm ?? false}
                onChange={(event) => onConfirmFinal?.(event.target.checked)}
                className="mt-0.5 size-4 accent-[var(--brand)]"
              />
              <span>
                I confirm this entry is my original work and that submitting
                freezes this snapshot for judging. I understand later edits to
                the idea do not change the submitted version.
              </span>
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <button
            type="submit"
            disabled={formBusy || (mode === "create" && !formIdeas?.length)}
            className="inline-flex min-h-11 items-center rounded-xl bg-contrast px-4 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {formBusy
              ? "Saving..."
              : mode === "create"
                ? "Create private draft"
                : "Save draft"}
          </button>
          {mode === "edit" ? (
            <button
              type="button"
              onClick={onSubmitDraft}
              disabled={formBusy}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {formBusy ? "Submitting..." : "Submit entry"}
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          ) : null}
          <p className="text-[0.6875rem] leading-5 text-muted">
            {mode === "create"
              ? "Submitting is a separate, confirmed action."
              : "Your saved draft is never visible on the public programme page."}
          </p>
        </div>
      </form>
    </section>
  );
}
