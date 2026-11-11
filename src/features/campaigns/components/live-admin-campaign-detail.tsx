"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { Textarea } from "@/components/ui/textarea";
import { adminCan, type AdminActor } from "@/features/admin/permissions";
import { AdminReviewRefresh } from "@/features/campaigns/components/admin-review-refresh";
import {
  adminCampaignTitle,
  adminCreatorName,
  reviewActionLabels,
  reviewActionSchema,
  reviewDate,
  reviewLabels,
  reviewRequestSchema,
  reviewSuccessSchema,
  reviewUsd,
  type AdminCampaignDetail,
  type CampaignReviewDecision,
  type ReviewAction,
} from "@/features/campaigns/lib/admin-campaign-review";
import { sendJson } from "@/lib/api/client";

const actionHelp: Record<ReviewAction, string> = {
  APPROVE:
    "Accept the campaign for publication. Identity and application-fee checks are rechecked when you submit.",
  REQUEST_CHANGES:
    "Tell the creator what to change before resubmitting for review.",
  REJECT: "Decline the campaign and give the creator a specific reason.",
};
const linkClass =
  "inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-strong underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// FR-304: review state is updated only from a validated backend receipt.
// There is intentionally no browser storage or preview-store subscription.
export function LiveAdminCampaignDetail({
  detail,
  actor,
}: {
  detail: AdminCampaignDetail;
  actor: AdminActor;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<CampaignReviewDecision | null>(null);
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<"action" | "reason" | null>(
    null,
  );
  const [blockers, setBlockers] = useState<string[]>([]);
  const [reloadRequired, setReloadRequired] = useState(false);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const actionRef = useRef<HTMLInputElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const campaign = decision
    ? {
        ...detail.campaign,
        reviewStatus: decision.reviewStatus,
        reviewedAt: decision.reviewedAt,
        reviewReason: decision.reviewReason,
      }
    : detail.campaign;
  const events =
    decision &&
    !detail.reviewEvents.some((event) => event.id === decision.event.id)
      ? [decision.event, ...detail.reviewEvents]
      : detail.reviewEvents;
  const canReview = adminCan(actor.role, "campaign:review");
  const actionable =
    canReview && campaign.reviewStatus === "IN_REVIEW" && !reloadRequired;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actionable || submitting.current) return;
    setError(null);
    setBlockers([]);
    setFieldError(null);
    const parsed = reviewRequestSchema.safeParse({
      action,
      reason: reason.trim() || undefined,
    });
    if (!parsed.success) {
      const field = action ? "reason" : "action";
      setFieldError(field);
      setError(
        action
          ? (parsed.error.issues[0]?.message ?? "Check the reason.")
          : "Choose a review decision.",
      );
      (action ? reasonRef : actionRef).current?.focus();
      return;
    }
    if (parsed.data.action === "APPROVE" && !detail.preconditions.eligible) {
      setError("Resolve the approval checks before approving this campaign.");
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const response = await sendJson<unknown>(
        `/api/admin/campaigns/${encodeURIComponent(campaign.id)}/review`,
        { method: "POST", body: parsed.data },
      );
      if (!response.ok) {
        const uncertain =
          response.status === 0 ||
          response.status >= 500 ||
          response.status === 409;
        setError(
          response.status === 0
            ? "The decision could not be confirmed. Reload the review before trying again."
            : response.message,
        );
        setReloadRequired(uncertain);
        const details = response.details;
        if (
          details &&
          typeof details === "object" &&
          "blockers" in details &&
          Array.isArray(details.blockers)
        ) {
          setBlockers(
            details.blockers.filter(
              (value): value is string => typeof value === "string",
            ),
          );
        }
        return;
      }
      const receipt = reviewSuccessSchema.safeParse(response.data);
      if (
        !receipt.success ||
        receipt.data.decision.id !== campaign.id ||
        receipt.data.decision.event.action !== parsed.data.action ||
        receipt.data.decision.reviewReason !== (parsed.data.reason || null)
      ) {
        setError(
          "The decision response could not be confirmed. Reload the review before trying again.",
        );
        setReloadRequired(true);
        return;
      }
      setDecision(receipt.data.decision);
      setReason("");
      setAction(null);
      noticeRef.current?.focus();
      router.refresh();
    } catch {
      setError(
        "The decision could not be confirmed. Reload the review before trying again.",
      );
      setReloadRequired(true);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Link href="/admin/campaigns" className={linkClass}>
        Review queue
      </Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Eyebrow>Campaign review</Eyebrow>
          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {adminCampaignTitle(campaign)}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill
              size="sm"
              tone={
                campaign.reviewStatus === "APPROVED"
                  ? "accent"
                  : campaign.reviewStatus === "REJECTED"
                    ? "danger"
                    : "neutral"
              }
            >
              {reviewLabels[campaign.reviewStatus]}
            </Pill>
            <Pill size="sm" tone="neutral">
              Funding lifecycle:{" "}
              {campaign.status.replaceAll("_", " ").toLowerCase()}
            </Pill>
          </div>
        </div>
        <AdminReviewRefresh />
      </header>
      <p
        ref={noticeRef}
        tabIndex={-1}
        role="status"
        className="mt-3 rounded-xl text-sm font-semibold text-brand-strong focus-visible:outline-2 focus-visible:outline-brand"
      >
        {decision
          ? `${reviewLabels[decision.reviewStatus]}. Decision confirmed at ${reviewDate(decision.reviewedAt)}.`
          : ""}
      </p>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="min-w-0 space-y-4">
          <Section title="Submission">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Fact label="Creator">{adminCreatorName(campaign)}</Fact>
              <Fact label="Campaign ID">{campaign.id}</Fact>
              <Fact label="Linked idea location">
                {campaign.idea?.region || "Not provided"}
              </Fact>
              <Fact label="Funding target (USD)">
                {reviewUsd(campaign.targetAmount)}
              </Fact>
              <Fact label="Funding model">
                {campaign.type === "ALL_OR_NOTHING"
                  ? "All-or-Nothing"
                  : "Flexible Funding"}
              </Fact>
              <Fact label="Settlement asset">{campaign.tokenType}</Fact>
              <Fact label="Funding closes">
                {reviewDate(campaign.deadline)}
              </Fact>
              <Fact label="Submitted">{reviewDate(campaign.submittedAt)}</Fact>
              <Fact label="Working capital">{campaign.workingCapitalPct}%</Fact>
              {campaign.type === "FLEXIBLE_FUNDING" && (
                <Fact label="Funding floor">
                  {campaign.fundingFloorPct === null
                    ? "Not provided"
                    : `${campaign.fundingFloorPct}%`}
                </Fact>
              )}
              <Fact label="Last reviewed">
                {reviewDate(campaign.reviewedAt)}
              </Fact>
              <Fact label="Launched">{reviewDate(campaign.launchedAt)}</Fact>
            </dl>
            {campaign.reviewReason && (
              <p className="mt-4 whitespace-pre-wrap break-words text-sm text-muted">
                Reviewer note: {campaign.reviewReason}
              </p>
            )}
            <p className="mt-4 text-xs leading-5 text-muted">
              Approval records a curation decision. Publication and escrow
              deployment are separate steps.
            </p>
          </Section>
          <Section title="Idea at conversion">
            <ReviewValue value={campaign.ideaSnapshot} />
            <p className="mt-4 rounded-xl bg-canvas p-3 text-sm leading-6 text-muted">
              The review record does not include the authored campaign story,
              use of funds or disclosures. The idea snapshot may differ from the
              current campaign.
            </p>
          </Section>
          <Section title="Campaign media">
            <div className="flex flex-wrap gap-4">
              <MediaLink
                value={campaign.coverImageUrl}
                label="Open cover image"
              />
              <MediaLink
                value={campaign.videoUrl}
                label="Open campaign video"
              />
              <MediaLink
                value={campaign.videoPosterUrl}
                label="Open video poster"
              />
            </div>
          </Section>
          <Section title="Milestone plan">
            <p className="text-sm leading-6 text-muted">
              Allocations and evidence are shown as submitted. Milestone
              deadlines are not included in this review record.
            </p>
            {campaign.milestones.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No milestones provided.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {campaign.milestones.map((milestone, position) => (
                  <li
                    key={milestone.id}
                    className="rounded-xl border border-border bg-canvas p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="break-words text-sm font-semibold text-ink">
                        Milestone {position + 1} ·{" "}
                        {milestone.title || "Untitled milestone"}
                      </h3>
                      <p className="text-sm font-semibold text-ink">
                        {milestone.tranchePct}%
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">
                      {milestone.deliverable || "No deliverable provided."}
                    </p>
                    <h4 className="mb-2 mt-3 text-xs font-semibold text-ink">
                      Evidence required
                    </h4>
                    <ReviewValue value={milestone.evidenceDefinition} />
                  </li>
                ))}
              </ol>
            )}
            <dl className="mt-4">
              <Fact label="Terms hash">
                {campaign.termsHash || "Not provided"}
              </Fact>
            </dl>
          </Section>
          <Section title="Reward tiers">
            <ReviewValue value={campaign.rewardTiers} />
          </Section>
          <Section title="Review history">
            {events.length === 0 ? (
              <p className="text-sm text-muted">
                No review decisions recorded.
              </p>
            ) : (
              <ol className="space-y-3">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-xl border border-border p-3 text-sm"
                  >
                    <p className="font-semibold text-ink">
                      {reviewLabels[event.toStatus]}
                    </p>
                    <p className="mt-1 break-words text-muted">
                      {event.actor.email || event.actor.id} · {event.actor.role}
                    </p>
                    <time
                      dateTime={event.createdAt}
                      className="text-xs text-muted"
                    >
                      {reviewDate(event.createdAt)}
                    </time>
                    <p className="mt-1 text-xs text-muted">
                      {reviewLabels[event.fromStatus]} →{" "}
                      {reviewLabels[event.toStatus]}
                    </p>
                    {event.reason && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-muted">
                        {event.reason}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Section title="Approval checks">
            <ul className="space-y-3">
              {detail.preconditions.checks.map((check) => (
                <li key={check.key}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {check.label}
                    </p>
                    <Pill
                      size="xs"
                      tone={check.satisfied ? "accent" : "warning"}
                    >
                      {check.satisfied ? "Satisfied" : "Action needed"}
                    </Pill>
                  </div>
                  <p className="mt-1 break-words text-xs leading-5 text-muted">
                    {check.detail}
                  </p>
                </li>
              ))}
            </ul>
            {detail.preconditions.blockers.length > 0 && (
              <ul className="mt-3 list-inside list-disc text-sm leading-6 text-danger">
                {detail.preconditions.blockers.map((blocker, index) => (
                  <li key={index}>{blocker}</li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs leading-5 text-muted">
              {detail.preconditions.eligible
                ? "The current identity and fee checks permit approval. They are rechecked on submission."
                : "Approval is blocked. You can still request changes or reject the campaign."}
            </p>
            {detail.applicationFee && (
              <p className="mt-3 break-words text-xs leading-5 text-muted">
                Linked fee: {detail.applicationFee.status} ·{" "}
                {detail.applicationFee.currency} ·{" "}
                {reviewDate(detail.applicationFee.createdAt)}
              </p>
            )}
          </Section>
          <Section title="Decision">
            {!canReview ? (
              <p className="text-sm text-muted">
                Your account cannot review campaigns.
              </p>
            ) : campaign.reviewStatus !== "IN_REVIEW" ? (
              <p className="text-sm text-muted">
                This campaign is{" "}
                {reviewLabels[campaign.reviewStatus].toLowerCase()}. It cannot
                receive another decision until it is submitted for review again.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <fieldset
                  disabled={pending || reloadRequired}
                  aria-describedby={
                    fieldError === "action" ? "review-error" : undefined
                  }
                  className="space-y-2"
                >
                  <legend className="mb-2 text-sm font-semibold text-ink">
                    Review decision
                  </legend>
                  {reviewActionSchema.options.map((candidate, index) => (
                    <label
                      key={candidate}
                      className="flex min-h-11 cursor-pointer gap-3 rounded-xl border border-border p-3 has-disabled:cursor-not-allowed has-disabled:opacity-60 has-checked:border-brand has-checked:bg-brand-tint"
                    >
                      <input
                        ref={
                          index === (detail.preconditions.eligible ? 0 : 1)
                            ? actionRef
                            : undefined
                        }
                        type="radio"
                        name="review-action"
                        value={candidate}
                        checked={action === candidate}
                        disabled={
                          candidate === "APPROVE" &&
                          !detail.preconditions.eligible
                        }
                        aria-invalid={fieldError === "action" || undefined}
                        onChange={() => {
                          setAction(candidate);
                          setFieldError(null);
                          setError(null);
                        }}
                        className="mt-1 size-4 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {reviewActionLabels[candidate]}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted">
                          {actionHelp[candidate]}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div>
                  <label
                    htmlFor="review-reason"
                    className="text-sm font-semibold text-ink"
                  >
                    Reason for the creator
                  </label>
                  <p
                    id="review-reason-help"
                    className="mt-1 text-xs leading-5 text-muted"
                  >
                    Required for changes or rejection: 20–2,000 characters.
                    Optional for approval.
                  </p>
                  <Textarea
                    ref={reasonRef}
                    id="review-reason"
                    name="reason"
                    rows={4}
                    maxLength={2000}
                    value={reason}
                    disabled={pending || reloadRequired}
                    aria-invalid={fieldError === "reason" || undefined}
                    aria-describedby={`review-reason-help${fieldError === "reason" ? " review-error" : ""}`}
                    onChange={(event) => {
                      setReason(event.target.value);
                      setFieldError(null);
                    }}
                    className="mt-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={pending || reloadRequired}
                >
                  {pending ? "Recording decision…" : "Record decision"}
                </Button>
              </form>
            )}
            {error && (
              <div className="mt-3 rounded-xl border border-danger/30 p-3 text-sm text-danger">
                <p id="review-error" role="alert">
                  {error}
                </p>
                {blockers.length > 0 && (
                  <ul className="mt-2 list-inside list-disc">
                    {blockers.map((blocker, index) => (
                      <li key={index}>{blocker}</li>
                    ))}
                  </ul>
                )}
                {reloadRequired && (
                  <a
                    className={linkClass}
                    href={`/admin/campaigns/${encodeURIComponent(campaign.id)}`}
                  >
                    Reload review
                  </a>
                )}
              </div>
            )}
            <p className="mt-4 break-words text-xs text-muted">
              Reviewer: {actor.name}
            </p>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 text-base font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{children}</dd>
    </div>
  );
}

/** Render structured author content as escaped text, including evidence objects. */
function ReviewValue({ value }: { value: unknown }): ReactNode {
  if (value === null || value === undefined || value === "")
    return <p className="text-sm text-muted">Not provided.</p>;
  if (Array.isArray(value))
    return value.length ? (
      <ul className="space-y-3">
        {value.map((item, index) => (
          <li key={index}>
            <ReviewValue value={item} />
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted">None provided.</p>
    );
  if (typeof value === "object")
    return (
      <dl className="space-y-2">
        {Object.entries(value).map(([key, item]) => (
          <div key={key}>
            <dt className="text-xs font-semibold capitalize text-muted">
              {key.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2")}
            </dt>
            <dd className="mt-1">
              <ReviewValue value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink">
      {String(value)}
    </p>
  );
}
function MediaLink({ value, label }: { value: string | null; label: string }) {
  let href: string | null = null;
  try {
    const url = new URL(value ?? "");
    if (url.protocol === "https:" || url.protocol === "http:") href = url.href;
  } catch {
    /* Missing or unsupported media is not made into a link. */
  }
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <p className="text-sm text-muted">
      {label.replace("Open ", "")}:{" "}
      {value ? "Link unavailable" : "Not provided"}
    </p>
  );
}
