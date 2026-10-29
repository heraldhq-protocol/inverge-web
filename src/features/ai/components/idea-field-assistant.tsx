"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiLockIcon,
  AiSparklesIcon,
  ArrowReloadHorizontalIcon,
  ArrowTurnBackwardIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/api/client";

import {
  IDEA_ASSISTANT_ACTIONS,
  type AiAccess,
  type IdeaAssistantAction,
  type IdeaAssistantField,
  type IdeaSuggestion,
} from "@/features/ai/types";

const FIELD_LABELS: Record<IdeaAssistantField, string> = {
  title: "title",
  summary: "summary",
  problem: "problem",
  targetUser: "audience",
  currentAlternative: "current alternative",
  solution: "solution",
  risks: "risks",
};

const ACTION_COPY: Record<
  IdeaAssistantAction,
  { label: string; description: string }
> = {
  improve: { label: "Improve", description: "Clearer wording, same facts." },
  shorten: { label: "Shorten", description: "Tighter, without losing detail." },
  expand: {
    label: "Add detail",
    description: "More specificity from your draft.",
  },
  critique: { label: "Review", description: "Weaknesses to fix, no rewrite." },
};

type IdeaFieldAssistantProps = {
  field: IdeaAssistantField;
  value: string;
  context: Record<string, string>;
  baseRevision: string;
  ideaId: string | null;
  access: AiAccess | null;
  accessLoading: boolean;
  requestingAccess: boolean;
  onRefreshAccess: () => void;
  onRequestAccess: () => void;
  onSaveFirst: () => Promise<string | null>;
  onApply: (value: string) => void;
  disabledReason?: string | undefined;
};

/**
 * Contextual assistant for one builder field.
 *
 * It is deliberately a proposal box, not an editor: nothing is written to the
 * draft until the creator presses "Use this text", and a response that arrives
 * after the field changed is discarded. All entitlement and quota decisions are
 * made by the API; this component only renders what the API returned.
 */
export function IdeaFieldAssistant({
  field,
  value,
  context,
  baseRevision,
  ideaId,
  access,
  accessLoading,
  requestingAccess,
  onRefreshAccess,
  onRequestAccess,
  onSaveFirst,
  onApply,
  disabledReason,
}: IdeaFieldAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<IdeaSuggestion | null>(null);
  const [lastAction, setLastAction] = useState<IdeaAssistantAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [appliedText, setAppliedText] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);

  const valueRef = useRef(value);
  const sequence = useRef(0);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const premium = access?.premium === true;
  const fieldLabel = FIELD_LABELS[field];
  const remaining = access
    ? Math.max(0, access.requestsPerDay - access.requestsToday)
    : 0;

  async function run(action: IdeaAssistantAction) {
    setLastAction(action);
    setError(null);
    setStale(false);

    if (disabledReason) {
      setOpen(true);
      return;
    }

    if (!premium) {
      setOpen(true);
      return;
    }

    const source = valueRef.current;
    if (!source.trim()) {
      setError(`Write your ${fieldLabel} first, then ask for help.`);
      setOpen(true);
      return;
    }

    let id = ideaId;
    if (!id) {
      id = await onSaveFirst();
      if (!id) {
        setError(
          "Save the draft to your account first, then the assistant can work on it.",
        );
        setOpen(true);
        return;
      }
    }

    const runId = ++sequence.current;
    setLoading(true);
    setSuggestion(null);
    setAppliedText(null);
    setOriginalText(source);

    const result = await sendJson<IdeaSuggestion>(
      `/api/ideas/${encodeURIComponent(id)}/assistant`,
      {
        method: "POST",
        body: {
          action,
          target: field,
          text: source,
          context,
          baseRevision,
          clientRequestId: newRequestId(),
        },
        timeoutMs: 45_000,
      },
    );

    if (runId !== sequence.current) return;
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      if (result.status === 403) onRefreshAccess();
      return;
    }

    if (valueRef.current !== source) {
      setStale(true);
      setError(
        "The field changed while the assistant was working. The proposal was discarded.",
      );
      return;
    }

    setSuggestion(result.data);
  }

  function applyProposal() {
    if (!suggestion?.proposal) return;
    if (valueRef.current !== originalText) {
      setStale(true);
      setError(
        "The field changed after the proposal arrived, so it was not applied.",
      );
      return;
    }
    onApply(suggestion.proposal);
    setAppliedText(suggestion.proposal);
    setSuggestion(null);
  }

  function restoreOriginal() {
    if (originalText === null) return;
    if (valueRef.current !== appliedText) {
      setError(
        "The field has changed since the proposal was applied, so the original was not restored.",
      );
      return;
    }
    onApply(originalText);
    setAppliedText(null);
    setOriginalText(null);
    setError(null);
  }

  function discard() {
    sequence.current += 1;
    setSuggestion(null);
    setLoading(false);
    setError(null);
    setStale(false);
    setAppliedText(null);
    setOriginalText(null);
  }

  return (
    <div className="rounded-xl border border-border/80 bg-canvas/50 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={`ai-assistant-${field}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={premium ? AiSparklesIcon : AiLockIcon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          AI assist
          {premium ? null : (
            <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[0.5625rem] font-medium uppercase tracking-[0.08em] text-muted">
              Premium
            </span>
          )}
        </button>
        {premium && access ? (
          <span className="text-[0.625rem] tabular-nums text-muted">
            {remaining} of {access.requestsPerDay} left today
          </span>
        ) : null}
      </div>

      {open ? (
        <div
          id={`ai-assistant-${field}`}
          role="region"
          aria-label={`AI assist for the ${fieldLabel}`}
          className="mt-2 border-t border-border/70 pt-2"
        >
          {disabledReason ? (
            <p className="text-[0.6875rem] leading-5 text-muted">
              {disabledReason}
            </p>
          ) : accessLoading ? (
            <p className="text-[0.6875rem] text-muted">Checking AI access…</p>
          ) : !access ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.6875rem] leading-5 text-muted">
                AI access could not be checked. Manual editing still works.
              </p>
              <button
                type="button"
                onClick={onRefreshAccess}
                className="min-h-8 text-[0.6875rem] font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                Try again
              </button>
            </div>
          ) : !access.configured ? (
            <p className="text-[0.6875rem] leading-5 text-muted">
              The assistant is not configured on this deployment. You can keep
              writing this {fieldLabel} yourself.
            </p>
          ) : !access.premium ? (
            <LockedPanel
              access={access}
              requesting={requestingAccess}
              onRequest={onRequestAccess}
            />
          ) : (
            <div>
              <div className="flex flex-wrap gap-1.5">
                {IDEA_ASSISTANT_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={loading}
                    onClick={() => void run(action)}
                    title={ACTION_COPY[action].description}
                    className="inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-2.5 text-[0.6875rem] font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {ACTION_COPY[action].label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[0.625rem] leading-4 text-muted">
                The assistant proposes text. Nothing changes until you accept
                it.
              </p>
            </div>
          )}

          {loading ? (
            <p
              className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-muted"
              role="status"
            >
              <HugeiconsIcon
                icon={Loading03Icon}
                size={13}
                strokeWidth={1.9}
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
              Asking the assistant…
            </p>
          ) : null}

          {error ? (
            <p
              className={`mt-2 rounded-lg px-2 py-1.5 text-[0.6875rem] leading-5 ${
                stale
                  ? "bg-warning/10 text-warning-strong"
                  : "bg-danger/[0.06] text-danger"
              }`}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {suggestion ? (
            <div className="mt-2 rounded-lg border border-brand/20 bg-brand-tint/50 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-brand-strong">
                  {suggestion.action === "critique"
                    ? `Review of your ${fieldLabel}`
                    : `Proposal for your ${fieldLabel}`}
                </p>
                <span className="text-[0.5625rem] text-muted">
                  {suggestion.meta.model} ·{" "}
                  {(suggestion.meta.latencyMs / 1_000).toFixed(1)}s
                </span>
              </div>

              {suggestion.proposal ? (
                <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-ink">
                  {suggestion.proposal}
                </p>
              ) : null}

              {suggestion.notes.length > 0 ? (
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[0.6875rem] leading-5 text-ink">
                  {suggestion.notes.map((note, index) => (
                    <li key={`${index}-${note}`}>{note}</li>
                  ))}
                </ul>
              ) : null}

              {suggestion.assumptions.length > 0 ? (
                <div className="mt-2">
                  <p className="text-[0.625rem] font-semibold text-warning-strong">
                    Assumptions to check
                  </p>
                  <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[0.6875rem] leading-5 text-warning-strong">
                    {suggestion.assumptions.map((item, index) => (
                      <li key={`${index}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestion.proposal ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="min-h-9 px-3 text-xs"
                    onClick={applyProposal}
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Use this text
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-9 px-3 text-xs"
                  disabled={loading}
                  onClick={() => {
                    if (lastAction) void run(lastAction);
                  }}
                >
                  <HugeiconsIcon
                    icon={ArrowReloadHorizontalIcon}
                    size={14}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  Try again
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-9 px-3 text-xs"
                  onClick={discard}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={14}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  Discard
                </Button>
              </div>
            </div>
          ) : null}

          {appliedText !== null ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-soft px-2 py-1.5">
              <p className="flex items-center gap-1 text-[0.6875rem] font-semibold text-brand-strong">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={13}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Applied to your draft
              </p>
              <button
                type="button"
                onClick={restoreOriginal}
                className="inline-flex min-h-8 items-center gap-1 text-[0.6875rem] font-semibold text-brand-strong underline decoration-brand/40 underline-offset-2 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={ArrowTurnBackwardIcon}
                  size={12}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                Restore original
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** A v4 id for provider telemetry; not a security token. */
function newRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function LockedPanel({
  access,
  requesting,
  onRequest,
}: {
  access: AiAccess;
  requesting: boolean;
  onRequest: () => void;
}) {
  if (access.requestStatus === "PENDING") {
    return (
      <p className="flex items-start gap-1.5 text-[0.6875rem] leading-5 text-muted">
        <HugeiconsIcon
          icon={AiLockIcon}
          size={13}
          strokeWidth={1.9}
          aria-hidden="true"
          className="mt-0.5 shrink-0"
        />
        Your AI access request is under review. You can keep editing normally
        while you wait.
      </p>
    );
  }

  const rejected = access.requestStatus === "REJECTED";
  const expired = access.requestStatus === "EXPIRED";

  return (
    <div>
      <p className="flex items-start gap-1.5 text-[0.6875rem] leading-5 text-muted">
        <HugeiconsIcon
          icon={AiLockIcon}
          size={13}
          strokeWidth={1.9}
          aria-hidden="true"
          className="mt-0.5 shrink-0"
        />
        {rejected
          ? "Your last AI access request was declined. You can ask again if your work needs it."
          : expired
            ? "Your AI access grant has expired. You can request a new one."
            : "The assistant is part of Creator Studio Premium. Request access and an admin will review it."}
      </p>
      {access.canRequest ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2 min-h-9 px-3 text-xs"
          disabled={requesting}
          onClick={onRequest}
        >
          {requesting ? "Requesting…" : "Request AI access"}
        </Button>
      ) : null}
    </div>
  );
}
