"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  Coins01Icon,
  Comment01Icon,
  Delete02Icon,
  Idea01Icon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IdeaFieldAssistant } from "@/features/ai/components/idea-field-assistant";
import type { AiAccess, IdeaAssistantField } from "@/features/ai/types";
import { assistantContext } from "@/features/ai/lib/context";
import { discoveryCategories } from "@/features/home/discovery-categories";
import {
  COMMUNITY_DESTINATION_META,
  FEEDBACK_QUESTION_META,
  IDEA_GOAL_META,
  type CommunityDestination,
  type CommunityDestinationKind,
  type FeedbackQuestionType,
  type IdeaSupportGoal,
} from "@/features/feedback/types";
import {
  createId,
  duplicateQuestion,
  moveItem,
  newQuestion,
  validateCommunityUrl,
} from "@/features/feedback/lib/feedback";
import { IdeaGoalsStrip } from "@/features/feedback/components/idea-goals-strip";
import {
  BUILDER_STEPS,
  emptyIdeaDraft,
  type BuilderStep,
  type IdeaDraft,
} from "@/features/idea-builder/types";
import {
  toIdeaApiPayload,
  toSurveyApiPayload,
} from "@/features/idea-builder/lib/api-payload";
import {
  categoryLabel,
  draftCompleteness,
  validateDraft,
  validateDraftStep,
  type DraftIssue,
} from "@/features/idea-builder/lib/validation";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import { sendJson } from "@/lib/api/client";

const DRAFT_KEY = "inverge:idea-draft:new";
const REMOTE_ID_KEY = "inverge:idea-draft:remote-id";

const categoryOptions = discoveryCategories.map((category) => ({
  label: category.label,
  value: category.value,
}));

const regionOptions = [
  { label: "Nigeria", value: "Nigeria" },
  { label: "Ghana", value: "Ghana" },
  { label: "Senegal", value: "Senegal" },
  { label: "Kenya", value: "Kenya" },
  { label: "Other", value: "Other" },
];

const goalIcons: Record<IdeaSupportGoal, typeof Comment01Icon> = {
  feedback: Comment01Icon,
  community: UserGroupIcon,
  funding: Coins01Icon,
};

function freshDraft(): IdeaDraft {
  return {
    ...emptyIdeaDraft,
    feedback: {
      ...emptyIdeaDraft.feedback,
      updatedAt: new Date().toISOString(),
    },
    roadmapSteps: [
      { id: createId("step"), date: "", description: "" },
      { id: createId("step"), date: "", description: "" },
    ],
  };
}

/**
 * One-click demo content for reviews and visual checks. This is sample data,
 * not a published idea; the builder marks it as demo and lets the creator edit
 * every field before saving.
 */
function demoDraft(): IdeaDraft {
  return {
    ...freshDraft(),
    title: "GreenFleet: electric delivery vans for African cities",
    summary:
      "Clean, affordable electric delivery vans that help small businesses deliver faster and cut costs in dense African cities.",
    category: "clean-energy",
    region: "Nigeria",
    coverUrl:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop&q=80",
    problem:
      "Small businesses and online retailers in African cities face high delivery costs, unreliable fuel, and limited access to clean transport. This limits their growth and raises prices for customers.",
    targetUser:
      "Small and medium businesses, e-commerce merchants, and urban delivery services across West Africa.",
    currentAlternative:
      "Petrol bikes and ageing vans, often rented per trip. Fuel prices and breakdowns make costs unpredictable, and there is no shared charging or maintenance network.",
    solution:
      "GreenFleet provides affordable, durable electric delivery vans with local support services, enabling cleaner, faster, and more reliable deliveries for African businesses.",
    risks:
      "Charging infrastructure is uneven, and import costs can rise with exchange rates. We will start with one city, use a shared depot charger, and price maintenance into the lease rather than hiding it in fuel savings.",
    roadmapSteps: [
      {
        id: createId("step"),
        date: "2026-12-15",
        description:
          "Complete a 12-week prototype and fleet test with three delivery partners in Lagos.",
      },
      {
        id: createId("step"),
        date: "2027-03-31",
        description:
          "Begin pilot deliveries with 10 partner businesses and publish cost and uptime results.",
      },
      {
        id: createId("step"),
        date: "2027-07-31",
        description:
          "Scale production and expand the service to three more cities if the pilot holds.",
      },
    ],
    goals: { community: true, feedback: true, funding: true },
    funding: {
      askAmount: "60000",
      useOfFunds: [
        { id: createId("fund"), label: "Prototype testing", amount: "52000" },
        { id: createId("fund"), label: "Initial production", amount: "25000" },
        {
          id: createId("fund"),
          label: "Operations and logistics",
          amount: "15000",
        },
      ],
    },
    feedback: {
      enabled: true,
      published: false,
      version: 1,
      updatedAt: new Date().toISOString(),
      title: "Share your feedback",
      description:
        "GreenFleet is testing electric delivery vans for African cities. Your answers help the team improve the plan.",
      questions: [
        {
          id: createId("q"),
          label: "Overall, how promising is this idea?",
          required: true,
          type: "rating",
        },
        {
          id: createId("q"),
          label: "What best describes your interest?",
          required: false,
          type: "single-choice",
          options: [
            { id: createId("o"), label: "I could use this" },
            { id: createId("o"), label: "I would recommend it to someone" },
            { id: createId("o"), label: "I would like to learn more" },
            { id: createId("o"), label: "Something else" },
          ],
        },
        {
          id: createId("q"),
          label: "What would make this more useful?",
          required: false,
          type: "long-text",
        },
      ],
    },
    community: {
      enabled: true,
      title: "Want to stay connected?",
      description:
        "Join the creator's community to hear about progress, new ideas, and opportunities to get involved.",
      primaryDestinationId: "demo-whatsapp",
      showAfterFeedback: true,
      showOnIdeaPage: true,
      destinations: [
        {
          enabled: true,
          id: "demo-whatsapp",
          kind: "whatsapp",
          label: "GreenFleet updates",
          url: "https://chat.whatsapp.com/",
        },
        {
          enabled: true,
          id: "demo-newsletter",
          kind: "newsletter",
          label: "Build notes",
          url: "https://example.com/newsletter",
        },
      ],
    },
  };
}

function readDraft(): IdeaDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<IdeaDraft>;
    return parsed.title !== undefined ? { ...freshDraft(), ...parsed } : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: IdeaDraft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // A full or disabled store must not block the flow.
  }
}

function readRemoteId(): string | null {
  try {
    return window.localStorage.getItem(REMOTE_ID_KEY);
  } catch {
    return null;
  }
}

function writeRemoteId(id: string) {
  try {
    window.localStorage.setItem(REMOTE_ID_KEY, id);
  } catch {
    // The draft still rounds-trips through the API response.
  }
}

function clearLocalDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
    window.localStorage.removeItem(REMOTE_ID_KEY);
  } catch {
    // Nothing else depends on the local copy.
  }
}

function StepField({
  children,
  counter,
  error,
  hint,
  label,
  optional,
}: {
  children: React.ReactNode;
  counter?: { max: number; value: number };
  error?: string | undefined;
  hint?: string | undefined;
  label: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">
          {label}
          {optional ? (
            <span className="ml-1.5 text-xs font-normal text-muted">
              optional
            </span>
          ) : (
            <span className="ml-1 text-muted" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {counter ? (
          <span
            className={`shrink-0 text-[0.6875rem] tabular-nums ${
              counter.value > counter.max * 0.9
                ? "text-warning-strong"
                : "text-muted"
            }`}
          >
            {counter.value}/{counter.max}
          </span>
        ) : null}
      </span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-muted">{hint}</span>
      ) : null}
      <span className="mt-1 block">{children}</span>
      {error ? (
        <span
          className="mt-1 block text-xs font-medium text-danger"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

function errorFor(
  issues: readonly DraftIssue[],
  field: string,
): string | undefined {
  return issues.find((issue) => issue.field === field)?.message;
}

function PreviewCard({ draft }: { draft: IdeaDraft }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-[16/10] bg-surface-muted">
        {draft.coverUrl.trim() ? (
          <IdeaCover
            artwork="creative"
            cover={draft.coverUrl}
            alt=""
            sizes="(min-width: 1280px) 320px, 100vw"
          />
        ) : (
          <span className="grid h-full place-items-center bg-brand-soft text-brand-strong">
            <HugeiconsIcon
              icon={Idea01Icon}
              size={28}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">{categoryLabel(draft.category)}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
          {draft.title.trim() || "Your idea title"}
        </h3>
        <p className="mt-1 line-clamp-3 text-sm leading-5 text-muted">
          {draft.summary.trim() ||
            "A short summary will appear here, so readers understand the idea before they open it."}
        </p>
        <p className="mt-2 text-xs text-muted">
          {draft.region || "Location not set"}
        </p>
      </div>
    </div>
  );
}

/**
 * Step navigation below the `xl` breakpoint, where the labelled sidebar does
 * not fit. Phones get a single segmented progress bar; wider screens get the
 * same steps as wrapping chips so a creator can still jump back without a
 * horizontally scrolling rail.
 */
function BuilderStepNav({
  onSelect,
  stepIndex,
}: {
  onSelect: (index: number) => void;
  stepIndex: number;
}) {
  return (
    <>
      <div
        aria-label="Creation progress"
        aria-valuemax={BUILDER_STEPS.length}
        aria-valuemin={1}
        aria-valuenow={stepIndex + 1}
        aria-valuetext={`Step ${stepIndex + 1} of ${BUILDER_STEPS.length}: ${BUILDER_STEPS[stepIndex]?.label ?? ""}`}
        className="grid grid-cols-7 gap-1 sm:hidden"
        role="progressbar"
      >
        {BUILDER_STEPS.map((item, index) => (
          <span
            aria-hidden="true"
            className={`h-1.5 rounded-full ${
              index <= stepIndex ? "bg-brand" : "bg-ink/[0.08]"
            }`}
            key={item.id}
          />
        ))}
      </div>

      <ol className="hidden flex-wrap gap-1.5 sm:flex xl:hidden">
        {BUILDER_STEPS.map((item, index) => {
          const current = index === stepIndex;
          const passed = index < stepIndex;
          return (
            <li className="min-w-0" key={item.id}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => onSelect(index)}
                disabled={index > stepIndex}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed ${
                  current
                    ? "border-brand/35 bg-brand-soft font-semibold text-brand-strong"
                    : passed
                      ? "border-border bg-surface font-medium text-ink hover:border-brand/35"
                      : "border-border/60 bg-surface/60 text-muted"
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full text-[0.5625rem] font-bold tabular-nums ${
                    passed
                      ? "bg-brand text-white"
                      : current
                        ? "bg-brand/15 text-brand-strong"
                        : "bg-ink/[0.06] text-muted"
                  }`}
                >
                  {passed ? (
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={12}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function IdeaBuilder({
  mode = "preview",
}: {
  mode?: "live" | "preview";
}) {
  const [draft, setDraft] = useState<IdeaDraft>(freshDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [issues, setIssues] = useState<DraftIssue[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [remoteId, setRemoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aiAccess, setAiAccess] = useState<AiAccess | null>(null);
  const [aiAccessLoading, setAiAccessLoading] = useState(false);
  const [aiAccessRequesting, setAiAccessRequesting] = useState(false);

  const step = BUILDER_STEPS[stepIndex]?.id ?? "basics";
  const completeness = draftCompleteness(draft);

  const refreshAiAccess = useCallback(async () => {
    if (mode !== "live") {
      setAiAccess(null);
      setAiAccessLoading(false);
      return;
    }

    setAiAccessLoading(true);
    const result = await sendJson<AiAccess>("/api/ai/access", {
      method: "GET",
    });
    setAiAccess(result.ok ? result.data : null);
    setAiAccessLoading(false);
  }, [mode]);

  useEffect(() => {
    // Access is server-owned; fetching after mount is the hydration boundary for
    // this client builder, which also restores its local draft in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAiAccess();
  }, [refreshAiAccess]);

  useEffect(() => {
    const saved = readDraft();
    if (saved) {
      // The draft lives only in this browser. Reading localStorage during render would
      // make the first client render disagree with the server HTML, so restoring after
      // mount is intentional; this is a hydration boundary, not derived state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(saved);
      setStatus("Restored the draft saved in this browser.");
    }
    const savedRemoteId = readRemoteId();
    if (savedRemoteId) setRemoteId(savedRemoteId);
    setLoaded(true);
  }, []);

  function update(patch: Partial<IdeaDraft>) {
    setDraft((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
    setPublished(false);
    setStatus(null);
    setApiError(null);
  }

  async function saveToApi(next: IdeaDraft): Promise<string | null> {
    setSaving(true);
    setApiError(null);

    try {
      const response = await fetch(
        remoteId ? `/api/ideas/${encodeURIComponent(remoteId)}` : "/api/ideas",
        {
          body: JSON.stringify(toIdeaApiPayload(next)),
          headers: { "Content-Type": "application/json" },
          method: remoteId ? "PATCH" : "POST",
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        id?: unknown;
        message?: unknown;
      } | null;

      if (!response.ok) {
        throw new Error(
          typeof payload?.message === "string"
            ? payload.message
            : "The API rejected this idea.",
        );
      }

      const id =
        typeof payload?.id === "string" ? payload.id : (remoteId ?? null);
      if (!id) throw new Error("The API did not return an idea id.");
      setRemoteId(id);
      writeRemoteId(id);

      if (next.feedback.enabled && next.feedback.questions.length > 0) {
        const survey = await fetch(
          `/api/ideas/${encodeURIComponent(id)}/survey`,
          {
            body: JSON.stringify(toSurveyApiPayload(next.feedback)),
            headers: { "Content-Type": "application/json" },
            method: "PUT",
          },
        );
        if (!survey.ok) {
          throw new Error(
            "The idea saved, but the feedback form could not be updated. Add a rating question and try again.",
          );
        }
      }

      return id;
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "We couldn't save this idea. Try again.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function persist(next = draft): Promise<boolean> {
    writeDraft({ ...next, updatedAt: new Date().toISOString() });

    if (mode === "preview") {
      setStatus("Draft saved in this browser.");
      return true;
    }

    const id = await saveToApi(next);
    if (!id) {
      setStatus("Could not save the draft to your account.");
      return false;
    }

    setStatus("Draft saved to your Inverge account.");
    return true;
  }

  function goNext() {
    const stepIssues = validateDraftStep(draft, step);
    setIssues(stepIssues);
    if (stepIssues.length > 0) {
      setStatus("Complete the highlighted fields to continue.");
      return;
    }
    setStatus(null);
    setStepIndex((index) => Math.min(index + 1, BUILDER_STEPS.length - 1));
  }

  function goBack() {
    setIssues([]);
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  async function publish() {
    const allIssues = validateDraft(draft);
    setIssues(allIssues);
    if (allIssues.length > 0) {
      setStatus("Fix the remaining fields before publishing.");
      return;
    }

    if (mode === "preview") {
      void persist();
      setPublished(true);
      setStatus(null);
      return;
    }

    const id = await saveToApi(draft);
    if (!id) return;

    setSaving(true);
    setApiError(null);
    try {
      const response = await fetch(
        `/api/ideas/${encodeURIComponent(id)}/publish`,
        { method: "POST" },
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: unknown;
        } | null;
        throw new Error(
          typeof payload?.message === "string"
            ? payload.message
            : "The API could not publish this idea.",
        );
      }
      setPublished(true);
      setStatus(null);
      clearLocalDraft();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "We couldn't publish this idea. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function requestAiAccess() {
    if (aiAccessRequesting) return;
    setAiAccessRequesting(true);

    try {
      const result = await sendJson<unknown>("/api/ai/access-requests", {
        method: "POST",
      });
      if (!result.ok) {
        setApiError(result.message);
        return;
      }
      await refreshAiAccess();
    } finally {
      setAiAccessRequesting(false);
    }
  }

  function assistantProps(field: IdeaAssistantField) {
    return {
      field,
      value: draft[field],
      context: assistantContext(draft, field),
      baseRevision: draft.updatedAt,
      ideaId: mode === "live" ? remoteId : null,
      access: mode === "live" ? aiAccess : null,
      accessLoading: mode === "live" ? aiAccessLoading : false,
      requestingAccess: aiAccessRequesting,
      onRefreshAccess: () => void refreshAiAccess(),
      onRequestAccess: () => void requestAiAccess(),
      onSaveFirst: async () => (mode === "live" ? saveToApi(draft) : null),
      onApply: (value: string) =>
        update({ [field]: value } as Partial<IdeaDraft>),
      disabledReason:
        mode === "live"
          ? undefined
          : "AI assist is available on the live API workspace. This preview keeps the manual flow.",
    };
  }

  if (published) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand-strong">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={28}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">
            Your idea is ready
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {mode === "live"
              ? "Your idea was saved and published through the API. The quality check and moderation run server-side."
              : "This preview has validated the plan and saved it in this browser. A live publish will run the existing quality check and create the public idea through the API."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {mode === "preview" ? (
              <Button type="button" onClick={() => setPublished(false)}>
                Keep editing
              </Button>
            ) : null}
            <Link
              href={
                mode === "live" && remoteId
                  ? `/d/creator/ideas/${remoteId}`
                  : "/d/creator/ideas"
              }
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {mode === "live" ? "Open idea workspace" : "Back to my ideas"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/d/creator/ideas"
              className="font-medium hover:text-ink"
            >
              My ideas
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Create an idea</li>
        </ol>
      </nav>

      <div className="mt-4 grid gap-6 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-8">
        <aside
          aria-label="Creation steps"
          className="hidden min-w-0 xl:sticky xl:top-24 xl:block xl:self-start"
        >
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Create an idea</Eyebrow>
            <span className="text-[0.625rem] tabular-nums text-muted">
              {completeness.percent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
            <div
              className="h-full rounded-full bg-brand transition-[width]"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
          <ol className="mt-4 flex flex-col gap-1">
            {BUILDER_STEPS.map((item, index) => {
              const current = item.id === step;
              const passed = index < stepIndex;
              return (
                <li key={item.id} className="w-full">
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    onClick={() => {
                      if (index <= stepIndex) {
                        setStepIndex(index);
                        setIssues([]);
                      }
                    }}
                    disabled={index > stepIndex}
                    className={`flex min-h-10 items-center gap-2 rounded-lg px-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${
                      current
                        ? "bg-brand-soft font-semibold text-brand-strong"
                        : passed
                          ? "font-medium text-ink hover:bg-canvas"
                          : "text-muted"
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-[0.625rem] font-bold tabular-nums ${
                        passed
                          ? "bg-brand text-white"
                          : current
                            ? "bg-brand/15 text-brand-strong"
                            : "bg-ink/[0.06] text-muted"
                      }`}
                    >
                      {passed ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={13}
                          strokeWidth={2.2}
                          aria-hidden="true"
                        />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[0.6875rem] leading-4 text-muted">
            Steps unlock as you go. A saved draft can be reopened at any point.
          </p>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 xl:hidden">
            <BuilderStepNav
              onSelect={(index) => {
                setStepIndex(index);
                setIssues([]);
              }}
              stepIndex={stepIndex}
            />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tabular-nums text-muted">
                Step {stepIndex + 1} of {BUILDER_STEPS.length}
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
                {BUILDER_STEPS[stepIndex]?.label}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#idea-preview"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
              >
                <HugeiconsIcon
                  icon={ViewIcon}
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Preview
              </a>
              <button
                type="button"
                onClick={() => {
                  const demo = demoDraft();
                  setDraft(demo);
                  writeDraft(demo);
                  setStepIndex(0);
                  setIssues([]);
                  setStatus(
                    "Demo data loaded into every step. Edit anything before saving or publishing.",
                  );
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Idea01Icon}
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Fill demo data
              </button>
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold text-warning-strong">
                {mode === "preview" ? "Preview workflow" : "Live API"}
              </span>
            </div>
          </div>

          {status ? (
            <p
              className="mt-3 rounded-xl border border-brand/25 bg-brand-tint px-3 py-2 text-xs leading-5 text-brand-strong"
              role="status"
            >
              {status}
            </p>
          ) : null}

          {apiError ? (
            <p
              className="mt-3 rounded-xl border border-danger/25 bg-danger/[0.04] px-3 py-2 text-xs leading-5 text-danger"
              role="alert"
            >
              {apiError}
            </p>
          ) : null}

          {mode === "live" ? (
            <p className="mt-2 text-[0.6875rem] leading-5 text-muted">
              Summary and community invite settings are not stored by the API
              yet; they remain local builder preview fields. The idea, roadmap,
              funding intent, and feedback questions are saved to your account.
            </p>
          ) : null}

          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
              {step === "basics" ? (
                <div className="space-y-7">
                  <section aria-labelledby="basics-idea" className="space-y-4">
                    <h2 id="basics-idea" className="text-sm font-bold text-ink">
                      The idea
                    </h2>
                    <StepField
                      label="Idea title"
                      counter={{ max: 140, value: draft.title.length }}
                      error={errorFor(issues, "title")}
                      hint="A clear, specific title beats a slogan."
                    >
                      <Input
                        value={draft.title}
                        maxLength={140}
                        placeholder="Give your idea a clear and specific title"
                        aria-invalid={Boolean(errorFor(issues, "title"))}
                        onChange={(event) =>
                          update({ title: event.target.value })
                        }
                      />
                    </StepField>
                    <IdeaFieldAssistant {...assistantProps("title")} />
                    <StepField
                      label="Short summary"
                      counter={{ max: 300, value: draft.summary.length }}
                      error={errorFor(issues, "summary")}
                      hint="This is what readers see on a card."
                    >
                      <Textarea
                        value={draft.summary}
                        rows={3}
                        maxLength={300}
                        placeholder="In a few sentences, what is your idea about?"
                        aria-invalid={Boolean(errorFor(issues, "summary"))}
                        onChange={(event) =>
                          update({ summary: event.target.value })
                        }
                      />
                    </StepField>
                    <IdeaFieldAssistant {...assistantProps("summary")} />
                  </section>

                  <section
                    aria-labelledby="basics-discovery"
                    className="space-y-4"
                  >
                    <h2
                      id="basics-discovery"
                      className="text-sm font-bold text-ink"
                    >
                      Discovery
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <StepField
                        label="Category"
                        error={errorFor(issues, "category")}
                      >
                        <Select
                          aria-label="Category"
                          options={categoryOptions}
                          value={draft.category || undefined}
                          placeholder="Select a category"
                          onValueChange={(value) =>
                            update({
                              category: value as IdeaDraft["category"],
                            })
                          }
                        />
                      </StepField>
                      <StepField label="Location" optional>
                        <Select
                          aria-label="Location"
                          options={regionOptions}
                          value={draft.region || undefined}
                          placeholder="Select a location"
                          onValueChange={(region) => update({ region })}
                        />
                      </StepField>
                    </div>
                    <StepField
                      label="Cover image"
                      optional
                      error={errorFor(issues, "coverUrl")}
                      hint="An https:// image link. A fallback cover is used when this is empty."
                    >
                      <Input
                        type="url"
                        value={draft.coverUrl}
                        placeholder="https://images.example.com/your-idea.jpg"
                        onChange={(event) =>
                          update({ coverUrl: event.target.value })
                        }
                      />
                    </StepField>
                  </section>
                </div>
              ) : null}

              {step === "problem" ? (
                <div className="space-y-4">
                  <StepField
                    label="The problem"
                    error={errorFor(issues, "problem")}
                  >
                    <Textarea
                      value={draft.problem}
                      rows={4}
                      placeholder="What is broken or missing today?"
                      onChange={(event) =>
                        update({ problem: event.target.value })
                      }
                    />
                  </StepField>
                  <IdeaFieldAssistant {...assistantProps("problem")} />
                  <StepField
                    label="Who it affects"
                    error={errorFor(issues, "targetUser")}
                  >
                    <Textarea
                      value={draft.targetUser}
                      rows={2}
                      placeholder="Name a specific group, not everyone."
                      onChange={(event) =>
                        update({ targetUser: event.target.value })
                      }
                    />
                  </StepField>
                  <IdeaFieldAssistant {...assistantProps("targetUser")} />
                  <StepField
                    label="What happens today"
                    error={errorFor(issues, "currentAlternative")}
                  >
                    <Textarea
                      value={draft.currentAlternative}
                      rows={3}
                      placeholder="What do those people do instead, and why does it fall short?"
                      onChange={(event) =>
                        update({ currentAlternative: event.target.value })
                      }
                    />
                  </StepField>
                  <IdeaFieldAssistant
                    {...assistantProps("currentAlternative")}
                  />
                </div>
              ) : null}

              {step === "solution" ? (
                <div className="space-y-4">
                  <StepField
                    label="The solution"
                    error={errorFor(issues, "solution")}
                  >
                    <Textarea
                      value={draft.solution}
                      rows={6}
                      placeholder="How does it work, and why is it better than what exists?"
                      onChange={(event) =>
                        update({ solution: event.target.value })
                      }
                    />
                  </StepField>
                  <IdeaFieldAssistant {...assistantProps("solution")} />
                  <StepField
                    label="Risks and challenges"
                    optional
                    hint="Naming a real risk builds more trust than claiming none exist."
                  >
                    <Textarea
                      value={draft.risks}
                      rows={3}
                      placeholder="What is most likely to go wrong, and what will you do about it?"
                      onChange={(event) =>
                        update({ risks: event.target.value })
                      }
                    />
                  </StepField>
                  <IdeaFieldAssistant {...assistantProps("risks")} />
                </div>
              ) : null}

              {step === "roadmap" ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm leading-6 text-muted">
                      Optional. Add dated steps if you want to show how the work
                      moves. A live campaign still needs its own milestone plan;
                      an idea does not.
                    </p>
                    <Pill size="xs">Optional</Pill>
                  </div>
                  {errorFor(issues, "roadmapSteps") ? (
                    <p
                      className="mt-2 text-xs font-medium text-danger"
                      role="alert"
                    >
                      {errorFor(issues, "roadmapSteps")}
                    </p>
                  ) : null}
                  <ol className="mt-3 space-y-2">
                    {draft.roadmapSteps.map((entry, index) => (
                      <li
                        key={entry.id}
                        className="rounded-xl border border-border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-ink">
                            Step {index + 1}
                          </p>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              aria-label={`Move step ${index + 1} up`}
                              disabled={index === 0}
                              onClick={() =>
                                update({
                                  roadmapSteps: moveItem(
                                    draft.roadmapSteps,
                                    index,
                                    index - 1,
                                  ),
                                })
                              }
                              className="grid size-9 place-items-center rounded-lg border border-border text-muted hover:text-ink disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand"
                            >
                              <HugeiconsIcon
                                icon={ArrowUp01Icon}
                                size={14}
                                strokeWidth={1.9}
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move step ${index + 1} down`}
                              disabled={index === draft.roadmapSteps.length - 1}
                              onClick={() =>
                                update({
                                  roadmapSteps: moveItem(
                                    draft.roadmapSteps,
                                    index,
                                    index + 1,
                                  ),
                                })
                              }
                              className="grid size-9 place-items-center rounded-lg border border-border text-muted hover:text-ink disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand"
                            >
                              <HugeiconsIcon
                                icon={ArrowDown01Icon}
                                size={14}
                                strokeWidth={1.9}
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove step ${index + 1}`}
                              onClick={() =>
                                update({
                                  roadmapSteps: draft.roadmapSteps.filter(
                                    (item) => item.id !== entry.id,
                                  ),
                                })
                              }
                              className="grid size-9 place-items-center rounded-lg border border-border text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
                            >
                              <HugeiconsIcon
                                icon={Delete02Icon}
                                size={14}
                                strokeWidth={1.9}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                          <Input
                            type="date"
                            aria-label={`Step ${index + 1} date`}
                            value={entry.date}
                            onChange={(event) =>
                              update({
                                roadmapSteps: draft.roadmapSteps.map((item) =>
                                  item.id === entry.id
                                    ? { ...item, date: event.target.value }
                                    : item,
                                ),
                              })
                            }
                          />
                          <Input
                            aria-label={`Step ${index + 1} description`}
                            value={entry.description}
                            placeholder="What happens at this step?"
                            onChange={(event) =>
                              update({
                                roadmapSteps: draft.roadmapSteps.map((item) =>
                                  item.id === entry.id
                                    ? {
                                        ...item,
                                        description: event.target.value,
                                      }
                                    : item,
                                ),
                              })
                            }
                          />
                        </div>
                        {errorFor(issues, `roadmap:${entry.id}`) ? (
                          <p className="mt-1 text-xs text-danger" role="alert">
                            {errorFor(issues, `roadmap:${entry.id}`)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      update({
                        roadmapSteps: [
                          ...draft.roadmapSteps,
                          { id: createId("step"), date: "", description: "" },
                        ],
                      })
                    }
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Add step
                  </Button>
                </div>
              ) : null}

              {step === "goals" ? (
                <div className="space-y-4">
                  <p className="text-sm leading-6 text-muted">
                    Choose what you are asking for. Feedback is not a funding
                    goal, and selecting funding does not open a campaign.
                  </p>
                  {errorFor(issues, "goals") ? (
                    <p className="text-xs font-medium text-danger" role="alert">
                      {errorFor(issues, "goals")}
                    </p>
                  ) : null}
                  <div className="grid gap-2">
                    {(Object.keys(IDEA_GOAL_META) as IdeaSupportGoal[]).map(
                      (key) => {
                        const Icon = goalIcons[key];
                        const selected = draft.goals[key];
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                              selected
                                ? "border-brand/40 bg-brand-tint"
                                : "border-border bg-surface hover:border-brand/25"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(event) =>
                                update({
                                  goals: {
                                    ...draft.goals,
                                    [key]: event.target.checked,
                                  },
                                })
                              }
                              className="mt-1 size-4 accent-brand"
                            />
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                              <HugeiconsIcon
                                icon={Icon}
                                size={17}
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-ink">
                                {IDEA_GOAL_META[key].label}
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-muted">
                                {IDEA_GOAL_META[key].description}
                              </span>
                            </span>
                          </label>
                        );
                      },
                    )}
                  </div>

                  {draft.goals.funding ? (
                    <div className="rounded-xl border border-border bg-canvas p-4">
                      <h2 className="text-sm font-bold text-ink">
                        Indicative funding ask
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        This is an estimate for context. It is not a campaign
                        target, approval, or money raised.
                      </p>
                      <div className="mt-3">
                        <StepField
                          label="Estimated amount (USD)"
                          error={errorFor(issues, "funding.askAmount")}
                        >
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={draft.funding.askAmount}
                            placeholder="15000"
                            onChange={(event) =>
                              update({
                                funding: {
                                  ...draft.funding,
                                  askAmount: event.target.value,
                                },
                              })
                            }
                          />
                        </StepField>
                      </div>
                      <p className="mt-3 text-sm font-medium text-ink">
                        What it would cover
                      </p>
                      <ul className="mt-1.5 space-y-2">
                        {draft.funding.useOfFunds.map((item, index) => (
                          <li
                            key={item.id}
                            className="flex gap-2 max-md:flex-col max-md:items-stretch"
                          >
                            <Input
                              aria-label={`Use of funds ${index + 1} label`}
                              value={item.label}
                              placeholder="e.g. Prototype build"
                              onChange={(event) =>
                                update({
                                  funding: {
                                    ...draft.funding,
                                    useOfFunds: draft.funding.useOfFunds.map(
                                      (entry) =>
                                        entry.id === item.id
                                          ? {
                                              ...entry,
                                              label: event.target.value,
                                            }
                                          : entry,
                                    ),
                                  },
                                })
                              }
                            />
                            <Input
                              aria-label={`Use of funds ${index + 1} amount`}
                              value={item.amount}
                              inputMode="decimal"
                              placeholder="5000"
                              onChange={(event) =>
                                update({
                                  funding: {
                                    ...draft.funding,
                                    useOfFunds: draft.funding.useOfFunds.map(
                                      (entry) =>
                                        entry.id === item.id
                                          ? {
                                              ...entry,
                                              amount: event.target.value,
                                            }
                                          : entry,
                                    ),
                                  },
                                })
                              }
                              className="md:max-w-28"
                            />
                            <button
                              type="button"
                              aria-label={`Remove use of funds ${index + 1}`}
                              onClick={() =>
                                update({
                                  funding: {
                                    ...draft.funding,
                                    useOfFunds: draft.funding.useOfFunds.filter(
                                      (entry) => entry.id !== item.id,
                                    ),
                                  },
                                })
                              }
                              className="grid size-11 shrink-0 place-items-center rounded-lg border border-border text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand max-md:ml-auto"
                            >
                              <HugeiconsIcon
                                icon={Delete02Icon}
                                size={15}
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          update({
                            funding: {
                              ...draft.funding,
                              useOfFunds: [
                                ...draft.funding.useOfFunds,
                                { id: createId("fund"), label: "", amount: "" },
                              ],
                            },
                          })
                        }
                      >
                        <HugeiconsIcon
                          icon={Add01Icon}
                          size={14}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        Add line
                      </Button>
                      <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-[0.6875rem] leading-4 text-warning-strong">
                        Funding interest is non-binding. No funds move, and a
                        later campaign still needs review, verification, and the
                        existing escrow rules.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === "feedback" ? (
                <div className="space-y-5">
                  {!draft.goals.feedback && !draft.goals.community ? (
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted">
                      This idea is not asking for feedback or community growth.
                      You can still publish it. Enable one of those goals in the
                      previous step to configure it.
                    </p>
                  ) : null}

                  {draft.goals.feedback ? (
                    <section>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-bold text-ink">
                            Feedback form
                          </h2>
                          <p className="mt-0.5 text-xs leading-5 text-muted">
                            Optional questions for supporters. Only star ratings
                            feed the average score.
                          </p>
                        </div>
                        <Switch
                          aria-label="Enable feedback form"
                          checked={draft.feedback.enabled}
                          onCheckedChange={(enabled) =>
                            update({
                              feedback: { ...draft.feedback, enabled },
                            })
                          }
                        />
                      </div>

                      {draft.feedback.enabled ? (
                        <div className="mt-3 space-y-3">
                          <StepField
                            label="Form title"
                            error={errorFor(issues, "title")}
                          >
                            <Input
                              value={draft.feedback.title}
                              onChange={(event) =>
                                update({
                                  feedback: {
                                    ...draft.feedback,
                                    title: event.target.value,
                                  },
                                })
                              }
                            />
                          </StepField>
                          <StepField label="Introduction" optional>
                            <Textarea
                              rows={2}
                              value={draft.feedback.description}
                              onChange={(event) =>
                                update({
                                  feedback: {
                                    ...draft.feedback,
                                    description: event.target.value,
                                  },
                                })
                              }
                            />
                          </StepField>

                          <ul className="space-y-2">
                            {draft.feedback.questions.map((question, index) => (
                              <li
                                key={question.id}
                                className="rounded-xl border border-border p-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <Pill size="xs">
                                    {
                                      FEEDBACK_QUESTION_META[question.type]
                                        .label
                                    }
                                  </Pill>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      aria-label={`Move question ${index + 1} up`}
                                      disabled={index === 0}
                                      onClick={() =>
                                        update({
                                          feedback: {
                                            ...draft.feedback,
                                            questions: moveItem(
                                              draft.feedback.questions,
                                              index,
                                              index - 1,
                                            ),
                                          },
                                        })
                                      }
                                      className="grid size-8 place-items-center rounded-md text-muted hover:text-ink disabled:opacity-40"
                                    >
                                      <HugeiconsIcon
                                        icon={ArrowUp01Icon}
                                        size={13}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Move question ${index + 1} down`}
                                      disabled={
                                        index ===
                                        draft.feedback.questions.length - 1
                                      }
                                      onClick={() =>
                                        update({
                                          feedback: {
                                            ...draft.feedback,
                                            questions: moveItem(
                                              draft.feedback.questions,
                                              index,
                                              index + 1,
                                            ),
                                          },
                                        })
                                      }
                                      className="grid size-8 place-items-center rounded-md text-muted hover:text-ink disabled:opacity-40"
                                    >
                                      <HugeiconsIcon
                                        icon={ArrowDown01Icon}
                                        size={13}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Duplicate question ${index + 1}`}
                                      onClick={() =>
                                        update({
                                          feedback: {
                                            ...draft.feedback,
                                            questions: [
                                              ...draft.feedback.questions.slice(
                                                0,
                                                index + 1,
                                              ),
                                              duplicateQuestion(question),
                                              ...draft.feedback.questions.slice(
                                                index + 1,
                                              ),
                                            ],
                                          },
                                        })
                                      }
                                      className="grid size-8 place-items-center rounded-md text-muted hover:text-ink"
                                    >
                                      <HugeiconsIcon
                                        icon={Add01Icon}
                                        size={14}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Delete question ${index + 1}`}
                                      onClick={() =>
                                        update({
                                          feedback: {
                                            ...draft.feedback,
                                            questions:
                                              draft.feedback.questions.filter(
                                                (item) =>
                                                  item.id !== question.id,
                                              ),
                                          },
                                        })
                                      }
                                      className="grid size-8 place-items-center rounded-md text-muted hover:text-danger"
                                    >
                                      <HugeiconsIcon
                                        icon={Delete02Icon}
                                        size={13}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                </div>
                                <Input
                                  className="mt-2"
                                  value={question.label}
                                  aria-label={`Question ${index + 1} label`}
                                  placeholder="Question label"
                                  onChange={(event) => {
                                    const next = draft.feedback.questions.map(
                                      (item) =>
                                        item.id === question.id
                                          ? {
                                              ...item,
                                              label: event.target.value,
                                            }
                                          : item,
                                    );
                                    update({
                                      feedback: {
                                        ...draft.feedback,
                                        questions: next,
                                      },
                                    });
                                  }}
                                />
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                  <label className="flex items-center gap-1.5 text-[0.6875rem] text-muted">
                                    <input
                                      type="checkbox"
                                      checked={question.required}
                                      onChange={(event) => {
                                        const next =
                                          draft.feedback.questions.map(
                                            (item) =>
                                              item.id === question.id
                                                ? {
                                                    ...item,
                                                    required:
                                                      event.target.checked,
                                                  }
                                                : item,
                                          );
                                        update({
                                          feedback: {
                                            ...draft.feedback,
                                            questions: next,
                                          },
                                        });
                                      }}
                                      className="size-4 accent-brand"
                                    />
                                    Required
                                  </label>
                                  <Select
                                    className="max-w-44"
                                    aria-label={`Question ${index + 1} type`}
                                    options={Object.entries(
                                      FEEDBACK_QUESTION_META,
                                    ).map(([value, meta]) => ({
                                      label: meta.label,
                                      value,
                                    }))}
                                    value={question.type}
                                    onValueChange={(value) => {
                                      const type =
                                        value as FeedbackQuestionType;
                                      const next = draft.feedback.questions.map(
                                        (item) =>
                                          item.id === question.id
                                            ? {
                                                ...item,
                                                type,
                                                options: FEEDBACK_QUESTION_META[
                                                  type
                                                ].supportsOptions
                                                  ? (item.options ??
                                                    newQuestion(type).options)
                                                  : undefined,
                                                scale:
                                                  type === "scale"
                                                    ? (item.scale ??
                                                      newQuestion(type).scale)
                                                    : undefined,
                                              }
                                            : item,
                                      );
                                      update({
                                        feedback: {
                                          ...draft.feedback,
                                          questions: next,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                {FEEDBACK_QUESTION_META[question.type]
                                  .supportsOptions ? (
                                  <label className="mt-2 block text-[0.6875rem] text-muted">
                                    Options, one per line
                                    <Textarea
                                      rows={3}
                                      className="mt-1 text-sm"
                                      value={(question.options ?? [])
                                        .map((option) => option.label)
                                        .join("\n")}
                                      onChange={(event) => {
                                        const options = event.target.value
                                          .split("\n")
                                          .map((label) => label.trim())
                                          .filter(Boolean)
                                          .map((label) => ({
                                            id: createId("o"),
                                            label,
                                          }));
                                        const next =
                                          draft.feedback.questions.map(
                                            (item) =>
                                              item.id === question.id
                                                ? { ...item, options }
                                                : item,
                                          );
                                        update({
                                          feedback: {
                                            ...draft.feedback,
                                            questions: next,
                                          },
                                        });
                                      }}
                                    />
                                  </label>
                                ) : null}
                                {errorFor(issues, `question:${question.id}`) ? (
                                  <p
                                    className="mt-1 text-xs text-danger"
                                    role="alert"
                                  >
                                    {errorFor(
                                      issues,
                                      `question:${question.id}`,
                                    )}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>

                          <div className="flex flex-wrap gap-1.5">
                            {(
                              [
                                "rating",
                                "long-text",
                                "short-text",
                                "single-choice",
                                "multi-choice",
                                "boolean",
                                "scale",
                              ] as FeedbackQuestionType[]
                            ).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  update({
                                    feedback: {
                                      ...draft.feedback,
                                      questions: [
                                        ...draft.feedback.questions,
                                        newQuestion(type),
                                      ],
                                    },
                                  })
                                }
                                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border bg-surface px-2.5 text-[0.6875rem] font-medium text-ink hover:border-brand/35 hover:text-brand-strong"
                              >
                                <HugeiconsIcon
                                  icon={Add01Icon}
                                  size={12}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                                {FEEDBACK_QUESTION_META[type].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {draft.goals.community ? (
                    <section className="border-t border-border pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-bold text-ink">
                            Community invitation
                          </h2>
                          <p className="mt-0.5 text-xs leading-5 text-muted">
                            Optional links shown after feedback or on the idea
                            page.
                          </p>
                        </div>
                        <Switch
                          aria-label="Enable community invitation"
                          checked={draft.community.enabled}
                          onCheckedChange={(enabled) =>
                            update({
                              community: { ...draft.community, enabled },
                            })
                          }
                        />
                      </div>
                      {draft.community.enabled ? (
                        <div className="mt-3 space-y-3">
                          <StepField
                            label="Invitation title"
                            error={errorFor(issues, "community.title")}
                          >
                            <Input
                              value={draft.community.title}
                              onChange={(event) =>
                                update({
                                  community: {
                                    ...draft.community,
                                    title: event.target.value,
                                  },
                                })
                              }
                            />
                          </StepField>
                          <StepField label="Description" optional>
                            <Textarea
                              rows={2}
                              value={draft.community.description}
                              onChange={(event) =>
                                update({
                                  community: {
                                    ...draft.community,
                                    description: event.target.value,
                                  },
                                })
                              }
                            />
                          </StepField>
                          <ul className="space-y-2">
                            {draft.community.destinations.map(
                              (destination, index) => (
                                <li
                                  key={destination.id}
                                  className="rounded-xl border border-border p-3"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 text-[0.6875rem] font-medium text-ink">
                                      <input
                                        type="radio"
                                        name="builder-primary-destination"
                                        checked={
                                          draft.community
                                            .primaryDestinationId ===
                                          destination.id
                                        }
                                        onChange={() =>
                                          update({
                                            community: {
                                              ...draft.community,
                                              primaryDestinationId:
                                                destination.id,
                                            },
                                          })
                                        }
                                        className="size-4 accent-brand"
                                      />
                                      Primary
                                    </label>
                                    <button
                                      type="button"
                                      aria-label={`Remove community link ${index + 1}`}
                                      onClick={() =>
                                        update({
                                          community: {
                                            ...draft.community,
                                            destinations:
                                              draft.community.destinations.filter(
                                                (item) =>
                                                  item.id !== destination.id,
                                              ),
                                            primaryDestinationId:
                                              draft.community
                                                .primaryDestinationId ===
                                              destination.id
                                                ? null
                                                : draft.community
                                                    .primaryDestinationId,
                                          },
                                        })
                                      }
                                      className="grid size-8 place-items-center rounded-md text-muted hover:text-danger"
                                    >
                                      <HugeiconsIcon
                                        icon={Delete02Icon}
                                        size={14}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                  <div className="mt-2 grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                                    <Select
                                      aria-label={`Community link ${index + 1} type`}
                                      options={Object.entries(
                                        COMMUNITY_DESTINATION_META,
                                      ).map(([value, meta]) => ({
                                        label: meta.label,
                                        value,
                                      }))}
                                      value={destination.kind}
                                      onValueChange={(value) => {
                                        const kind =
                                          value as CommunityDestinationKind;
                                        update({
                                          community: {
                                            ...draft.community,
                                            destinations:
                                              draft.community.destinations.map(
                                                (item) =>
                                                  item.id === destination.id
                                                    ? {
                                                        ...item,
                                                        kind,
                                                        label:
                                                          item.label ||
                                                          COMMUNITY_DESTINATION_META[
                                                            kind
                                                          ].label,
                                                      }
                                                    : item,
                                              ),
                                          },
                                        });
                                      }}
                                    />
                                    <Input
                                      aria-label={`Community link ${index + 1} label`}
                                      value={destination.label}
                                      placeholder="Label"
                                      onChange={(event) =>
                                        update({
                                          community: {
                                            ...draft.community,
                                            destinations:
                                              draft.community.destinations.map(
                                                (item) =>
                                                  item.id === destination.id
                                                    ? {
                                                        ...item,
                                                        label:
                                                          event.target.value,
                                                      }
                                                    : item,
                                              ),
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <Input
                                    type="url"
                                    className="mt-2"
                                    aria-label={`Community link ${index + 1} URL`}
                                    value={destination.url}
                                    placeholder={
                                      COMMUNITY_DESTINATION_META[
                                        destination.kind
                                      ].placeholder
                                    }
                                    onChange={(event) =>
                                      update({
                                        community: {
                                          ...draft.community,
                                          destinations:
                                            draft.community.destinations.map(
                                              (item) =>
                                                item.id === destination.id
                                                  ? {
                                                      ...item,
                                                      url: event.target.value,
                                                    }
                                                  : item,
                                            ),
                                        },
                                      })
                                    }
                                  />
                                  {(() => {
                                    const check = validateCommunityUrl(
                                      destination.url,
                                    );
                                    return destination.url &&
                                      "error" in check ? (
                                      <p
                                        className="mt-1 text-xs text-danger"
                                        role="alert"
                                      >
                                        {check.error}
                                      </p>
                                    ) : null;
                                  })()}
                                </li>
                              ),
                            )}
                          </ul>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const destination: CommunityDestination = {
                                enabled: true,
                                id: createId("community"),
                                kind: "website",
                                label: "Website",
                                url: "",
                              };
                              update({
                                community: {
                                  ...draft.community,
                                  destinations: [
                                    ...draft.community.destinations,
                                    destination,
                                  ],
                                  primaryDestinationId:
                                    draft.community.primaryDestinationId ??
                                    destination.id,
                                },
                              });
                            }}
                          >
                            <HugeiconsIcon
                              icon={Add01Icon}
                              size={14}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            Add community link
                          </Button>
                          {errorFor(issues, "community.destinations") ? (
                            <p className="text-xs text-danger" role="alert">
                              {errorFor(issues, "community.destinations")}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-3">
                            <label className="flex items-center gap-2 text-[0.6875rem] text-muted">
                              <input
                                type="checkbox"
                                checked={draft.community.showAfterFeedback}
                                onChange={(event) =>
                                  update({
                                    community: {
                                      ...draft.community,
                                      showAfterFeedback: event.target.checked,
                                    },
                                  })
                                }
                                className="size-4 accent-brand"
                              />
                              Show after feedback
                            </label>
                            <label className="flex items-center gap-2 text-[0.6875rem] text-muted">
                              <input
                                type="checkbox"
                                checked={draft.community.showOnIdeaPage}
                                onChange={(event) =>
                                  update({
                                    community: {
                                      ...draft.community,
                                      showOnIdeaPage: event.target.checked,
                                    },
                                  })
                                }
                                className="size-4 accent-brand"
                              />
                              Show on the idea page
                            </label>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              ) : null}

              {step === "review" ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Idea basics", ["basics"] as BuilderStep[], draft.title],
                      [
                        "Problem and audience",
                        ["problem"] as BuilderStep[],
                        draft.problem,
                      ],
                      [
                        "Solution",
                        ["solution"] as BuilderStep[],
                        draft.solution,
                      ],
                      [
                        "Roadmap",
                        ["roadmap"] as BuilderStep[],
                        draft.roadmapSteps.filter(
                          (entry) =>
                            entry.date.trim() && entry.description.trim(),
                        ).length > 0
                          ? `${draft.roadmapSteps.length} steps`
                          : "Optional, not added",
                      ],
                    ].map(([label, target, value]) => (
                      <div
                        key={label as string}
                        className="rounded-xl border border-border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-ink">
                            {label as string}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const targetStep = (target as BuilderStep[])[0];
                              const index = BUILDER_STEPS.findIndex(
                                (item) => item.id === targetStep,
                              );
                              setStepIndex(index >= 0 ? index : 0);
                              setIssues([]);
                            }}
                            className="text-[0.625rem] font-semibold text-brand-strong hover:text-brand"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                          {(value as string) || "Not set"}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold text-ink">Goals</p>
                    <div className="mt-2">
                      <IdeaGoalsStrip goals={draft.goals} compact />
                    </div>
                  </div>

                  {validateDraft(draft).length > 0 ? (
                    <div
                      className="rounded-xl border border-warning/30 bg-warning/5 p-3"
                      role="alert"
                    >
                      <p className="text-xs font-semibold text-warning-strong">
                        Still needed before publishing
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {validateDraft(draft)
                          .slice(0, 6)
                          .map((issue) => (
                            <li
                              key={`${issue.field}-${issue.message}`}
                              className="text-xs text-warning-strong"
                            >
                              {issue.message}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-brand/25 bg-brand-tint px-3 py-2 text-xs text-brand-strong">
                      All required fields are complete.{" "}
                      {mode === "live"
                        ? "The API will run its own quality and moderation checks when you publish."
                        : "Publishing in this preview validates the flow; the live API will run its own quality and moderation checks."}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <aside
              id="idea-preview"
              className="min-w-0 scroll-mt-24 space-y-3 lg:sticky lg:top-24 lg:self-start"
            >
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  Idea preview
                </p>
                <p className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                  Updates as you type, exactly as the public card will read.
                </p>
                <div className="mt-2">
                  <PreviewCard draft={draft} />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs font-semibold text-ink">
                  Draft completeness
                </p>
                <p className="mt-1 text-[0.6875rem] text-muted">
                  {completeness.completed} of {completeness.total} essentials
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${completeness.percent}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void persist()}
                  className="mt-2 inline-flex min-h-9 items-center gap-1 text-[0.6875rem] font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {mode === "live"
                    ? "Save draft"
                    : "Save draft in this browser"}
                </button>
              </div>
            </aside>
          </div>

          <div className="sticky bottom-0 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-canvas/95 py-3 backdrop-blur max-md:bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={goBack}
              disabled={stepIndex === 0}
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
              />
              Back
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => void persist()}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save draft"}
              </Button>
              {step === "review" ? (
                <Button
                  type="button"
                  size="md"
                  onClick={() => void publish()}
                  disabled={saving}
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {saving ? "Publishing..." : "Publish idea"}
                  {mode === "preview" ? (
                    <span className="ml-1 text-[0.625rem] font-normal opacity-80">
                      preview
                    </span>
                  ) : null}
                </Button>
              ) : (
                <Button type="button" size="md" onClick={goNext}>
                  Next
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={15}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {loaded ? "" : "Loading saved draft"}
      </span>
    </div>
  );
}

export function BuilderPreviewHint() {
  return (
    <p className="flex items-center gap-1 text-[0.6875rem] text-muted">
      <HugeiconsIcon
        icon={ViewIcon}
        size={12}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      Save a draft, then preview the published form from the idea workspace.
    </p>
  );
}
