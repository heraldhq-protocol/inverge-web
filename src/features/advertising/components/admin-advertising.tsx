"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Alert02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Edit02Icon,
  EyeIcon,
  Megaphone01Icon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Textarea } from "@/components/ui/textarea";
import { adminCan, type AdminActor } from "@/features/admin/permissions";
import {
  AD_PLACEMENTS,
  getAdPlacement,
} from "@/features/advertising/lib/placements";
import {
  advertisingStoreFor,
  getAdvertisingStoreSnapshot,
  getServerAdvertisingStoreSnapshot,
  resetAdvertisingStore,
  saveAdvertisingCreative,
  subscribeAdvertisingStore,
  transitionAdvertisingCreative,
} from "@/features/advertising/lib/admin-store";
import {
  AD_ACTION_LABELS,
  AD_BODY_MAX,
  AD_HEADLINE_MAX,
  AD_STATUS_LABELS,
  AD_STATUS_TONES,
  adActionPermission,
  adActionsFor,
  adInventorySummary,
  adPlacementOptionsForFormat,
  isCreativeInSchedule,
  type AdCreativeInput,
} from "@/features/advertising/lib/validation";
import { discoveryCategories } from "@/features/home/discovery-categories";
import type {
  AdAction,
  AdCreative,
  AdCreativeStatus,
  AdFormat,
} from "@/features/advertising/types";

type StatusFilter =
  "all" | "drafts" | "ended" | "live" | "paused" | "pending" | "scheduled";

const filters: readonly { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "scheduled", label: "Scheduled" },
  { key: "pending", label: "Pending review" },
  { key: "paused", label: "Paused" },
  { key: "drafts", label: "Drafts" },
  { key: "ended", label: "Ended" },
];

function displayStatus(
  creative: AdCreative,
  nowIso: string,
): "expired" | "live" | "scheduled" | AdCreativeStatus {
  if (creative.status !== "approved") return creative.status;
  if (isCreativeInSchedule(creative, nowIso)) return "live";
  if (Date.parse(creative.startsAt) > Date.parse(nowIso)) return "scheduled";
  return "expired";
}

const displayLabels: Readonly<Record<string, string>> = {
  expired: "Expired",
  live: "Live",
  scheduled: "Scheduled",
  ...AD_STATUS_LABELS,
};

function displayTone(status: string) {
  if (status === "live") return "accent" as const;
  if (status === "scheduled") return "warning" as const;
  return AD_STATUS_TONES[status as AdCreativeStatus] ?? "neutral";
}

function matchesFilter(
  creative: AdCreative,
  filter: StatusFilter,
  nowIso: string,
): boolean {
  const status = displayStatus(creative, nowIso);
  if (filter === "all") return true;
  if (filter === "live") return status === "live";
  if (filter === "scheduled") return status === "scheduled";
  if (filter === "pending") return status === "pending-review";
  if (filter === "paused") return status === "paused";
  if (filter === "ended") return status === "ended" || status === "expired";
  return status === "draft" || status === "rejected";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(iso));
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Keep the last valid instant when a browser date field is briefly empty. */
function fromLocalInput(value: string, fallback: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function emptyInput(nowIso: string): AdCreativeInput {
  const start = new Date(nowIso);
  const end = new Date(start.getTime() + 30 * 86_400_000);
  return {
    advertiser: "",
    body: "",
    categories: [],
    ctaLabel: "Learn more",
    destination: "https://example.com/",
    endsAt: end.toISOString(),
    format: "native-card",
    headline: "",
    placements: ["campaign-feed-inline"],
    priority: 50,
    regions: [],
    startsAt: start.toISOString(),
  };
}

export function AdminAdvertising({
  actor,
  nowIso,
}: {
  actor: AdminActor;
  nowIso: string;
}) {
  const store = useSyncExternalStore(
    subscribeAdvertisingStore,
    getAdvertisingStoreSnapshot,
    getServerAdvertisingStoreSnapshot,
  );
  const creatives = useMemo(() => advertisingStoreFor(store), [store]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdCreative | "new" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [previewViewport, setPreviewViewport] = useState<
    "desktop" | "mobile" | "tablet"
  >("desktop");

  const summary = adInventorySummary(creatives, nowIso);
  const visible = creatives.filter((creative) =>
    matchesFilter(creative, filter, nowIso),
  );
  const selected =
    creatives.find((creative) => creative.id === selectedId) ?? null;

  function openEditor(creative: AdCreative | "new") {
    setEditing(creative);
    if (creative !== "new") setSelectedId(creative.id);
    setNotice(null);
  }

  function handleSaved(creative: AdCreative) {
    setEditing(null);
    setSelectedId(creative.id);
    setNotice(
      "Saved in this browser as a draft. Submit it for review before it can be approved.",
    );
  }

  function handleAction(action: AdAction) {
    if (!selected) return;
    const result = transitionAdvertisingCreative(
      selected.id,
      action,
      actor,
      new Date().toISOString(),
      rejectReason,
    );
    setNotice(
      result.ok
        ? `${AD_ACTION_LABELS[action]} recorded in this browser.`
        : result.message,
    );
    if (result.ok) setRejectReason("");
  }

  const canApprove = adminCan(actor.role, "advertising:approve");

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Admin · Advertising</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Advertising inventory
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
            Approve, schedule, pause, and end paid placements. Every public
            placement is labelled and kept out of organic ranking, validation
            signals, and funding figures.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor("new")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={Add01Icon}
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />
          New creative
        </button>
      </header>

      <section
        aria-label="Preview boundary"
        className="mt-4 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
            className="text-warning-strong"
          />
          Inventory changes stay in this browser
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">
          No advertising endpoint is connected. A status change here is a named
          preview record, not a production approval, and it does not reach an ad
          server. The API must re-check the permission and the creative before
          serving anything publicly.
        </p>
      </section>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={CheckmarkCircle02Icon}
          label="Live now"
          value={summary.active}
          hint="Approved and inside the schedule."
        />
        <Metric
          icon={Calendar03Icon}
          label="Scheduled"
          value={summary.scheduled}
          hint="Approved, waiting for its start."
        />
        <Metric
          icon={EyeIcon}
          label="Pending review"
          value={summary.pending}
          hint="Needs an approver."
        />
        <Metric
          icon={PauseIcon}
          label="Paused"
          value={summary.paused}
          hint="Approved but not serving."
        />
      </dl>

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-brand/25 bg-brand-soft px-3.5 py-2.5 text-sm text-ink"
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
        <section
          aria-labelledby="inventory-heading"
          className="rounded-2xl border border-border bg-surface"
        >
          <div className="border-b border-border px-4 py-3.5 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="inventory-heading"
                className="flex items-center gap-2 text-base font-bold tracking-[-0.02em] text-ink"
              >
                <HugeiconsIcon
                  icon={Megaphone01Icon}
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-brand-strong"
                />
                Creatives
              </h2>
              <p className="text-xs text-muted">
                {visible.length} of {creatives.length}
              </p>
            </div>
            <div
              role="group"
              aria-label="Filter creatives"
              className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={filter === item.key}
                  onClick={() => setFilter(item.key)}
                  className={`inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    filter === item.key
                      ? "bg-brand-soft text-brand-strong"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No creative matches this filter.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((creative) => {
                const status = displayStatus(creative, nowIso);
                return (
                  <li key={creative.id}>
                    <div className="flex flex-wrap items-start gap-3 px-4 py-3.5 sm:px-5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(creative.id);
                          setNotice(null);
                        }}
                        aria-pressed={selectedId === creative.id}
                        className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {creative.headline}
                          </span>
                          <Pill size="xs" tone={displayTone(status)}>
                            {displayLabels[status] ?? status}
                          </Pill>
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {creative.advertiser} · {creative.placements.length}{" "}
                          placement
                          {creative.placements.length === 1 ? "" : "s"} ·{" "}
                          {formatDate(creative.startsAt)} –{" "}
                          {formatDate(creative.endsAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditor(creative)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-brand-strong hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          size={14}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                        Edit
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="min-w-0 space-y-4">
          {editing ? (
            <CreativeEditor
              actor={actor}
              creative={editing === "new" ? null : editing}
              nowIso={nowIso}
              onCancel={() => setEditing(null)}
              onSaved={handleSaved}
            />
          ) : selected ? (
            <CreativeDetail
              actor={actor}
              canApprove={canApprove}
              creative={selected}
              nowIso={nowIso}
              onEdit={() => openEditor(selected)}
              onAction={handleAction}
              onReasonChange={setRejectReason}
              reason={rejectReason}
            />
          ) : (
            <section className="rounded-2xl border border-dashed border-border-strong bg-surface p-6 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-soft text-brand-strong">
                <HugeiconsIcon
                  icon={Megaphone01Icon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <h2 className="mt-3 text-base font-bold text-ink">
                Select a creative
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Choose a row to review its schedule and status actions, or
                create a new draft.
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
                Device preview
              </h2>
              <div
                role="group"
                aria-label="Preview viewport"
                className="flex rounded-lg border border-border bg-canvas p-0.5"
              >
                {(["desktop", "tablet", "mobile"] as const).map((viewport) => (
                  <button
                    key={viewport}
                    type="button"
                    aria-pressed={previewViewport === viewport}
                    onClick={() => setPreviewViewport(viewport)}
                    className={`min-h-8 rounded-md px-2.5 text-xs font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                      previewViewport === viewport
                        ? "bg-surface text-ink shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {viewport}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl bg-canvas p-3">
              <div
                className="mx-auto transition-[max-width]"
                style={{
                  maxWidth:
                    previewViewport === "desktop"
                      ? "100%"
                      : previewViewport === "tablet"
                        ? 480
                        : 300,
                }}
              >
                <AdminAdPreview
                  creative={selected}
                  placementId={
                    previewViewport === "desktop"
                      ? "campaign-detail-rail"
                      : "campaign-feed-inline"
                  }
                />
              </div>
            </div>
            <p className="mt-2 text-[0.6875rem] leading-5 text-muted">
              Preview only. Rail placements are hidden below the desktop
              breakpoint, so the mobile preview shows the feed-card form.
            </p>
          </section>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-[0.6875rem] leading-5 text-muted">
          Approved here means approved in this browser preview. Nothing is
          served publicly from this store.
        </p>
        <button
          type="button"
          onClick={() => {
            resetAdvertisingStore();
            setSelectedId(null);
            setEditing(null);
            setNotice("Preview inventory reset to the fixture set.");
          }}
          className="min-h-9 rounded-lg px-2 text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-brand"
        >
          Reset preview inventory
        </button>
      </div>
    </div>
  );
}

function Metric({
  hint,
  icon,
  label,
  value,
}: {
  hint: string;
  icon: typeof Megaphone01Icon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
      </div>
      <dd className="mt-2 text-2xl font-bold tabular-nums tracking-[-0.035em] text-ink">
        {value}
      </dd>
      <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>
    </div>
  );
}

function CreativeDetail({
  actor,
  canApprove,
  creative,
  nowIso,
  onAction,
  onEdit,
  onReasonChange,
  reason,
}: {
  actor: AdminActor;
  canApprove: boolean;
  creative: AdCreative;
  nowIso: string;
  onAction: (action: AdAction) => void;
  onEdit: () => void;
  onReasonChange: (value: string) => void;
  reason: string;
}) {
  const status = displayStatus(creative, nowIso);
  const actions = adActionsFor(creative.status);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill size="xs" tone={displayTone(status)}>
              {displayLabels[status] ?? status}
            </Pill>
            <span className="text-xs text-muted">{creative.kind}</span>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-[-0.025em] text-ink">
            {creative.headline}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{creative.advertiser}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={Edit02Icon}
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          Edit
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">{creative.body}</p>

      <dl className="mt-4 grid gap-2 rounded-xl bg-canvas p-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted">Runs</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {formatDate(creative.startsAt)} – {formatDate(creative.endsAt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Priority</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">
            {creative.priority}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Placements</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {creative.placements
              .map((id) => getAdPlacement(id)?.label ?? id)
              .join(", ")}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Destination</dt>
          <dd className="mt-0.5 break-all font-mono text-[0.6875rem] text-ink">
            {creative.destination}
          </dd>
        </div>
      </dl>

      {creative.status === "pending-review" ? (
        <div className="mt-4">
          <label
            htmlFor="ad-reject-reason"
            className="text-xs font-semibold text-ink"
          >
            Rejection reason (required when rejecting)
          </label>
          <Textarea
            id="ad-reject-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={2}
            className="mt-1.5 text-sm"
            placeholder="Tell the advertiser what must change before approval."
          />
          {!canApprove ? (
            <p className="mt-1 text-xs text-muted">
              Your role can prepare inventory but cannot approve or reject it.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {actions.length === 0 ? (
          <p className="text-sm text-muted">
            This creative has ended. Create a new draft to run another
            placement.
          </p>
        ) : (
          actions.map((action) => {
            const permitted = adminCan(actor.role, adActionPermission(action));
            const icon =
              action === "approve"
                ? CheckmarkCircle02Icon
                : action === "pause"
                  ? PauseIcon
                  : action === "resume"
                    ? PlayIcon
                    : action === "end"
                      ? StopIcon
                      : Calendar03Icon;
            return (
              <button
                key={action}
                type="button"
                disabled={!permitted}
                title={
                  permitted
                    ? undefined
                    : "This account does not have this advertising permission."
                }
                onClick={() => onAction(action)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-45 ${
                  action === "approve"
                    ? "bg-brand text-white hover:bg-brand-strong"
                    : "border border-border bg-surface text-ink hover:border-brand/35"
                }`}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={14}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                {AD_ACTION_LABELS[action]}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

/**
 * The detail panel receives the actor and the approval hint. Approval is the
 * only permission that differs, but the permission check still runs against the
 * full matrix rather than inferring a role from a boolean.
 */

function CreativeEditor({
  actor,
  creative,
  nowIso,
  onCancel,
  onSaved,
}: {
  actor: AdminActor;
  creative: AdCreative | null;
  nowIso: string;
  onCancel: () => void;
  onSaved: (creative: AdCreative) => void;
}) {
  const [input, setInput] = useState<AdCreativeInput>(() =>
    creative
      ? {
          advertiser: creative.advertiser,
          body: creative.body,
          categories: creative.categories,
          ctaLabel: creative.ctaLabel,
          destination: creative.destination,
          endsAt: creative.endsAt,
          format: creative.format,
          headline: creative.headline,
          id: creative.id,
          placements: creative.placements,
          priority: creative.priority,
          regions: creative.regions,
          startsAt: creative.startsAt,
        }
      : emptyInput(nowIso),
  );
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});

  function update(patch: Partial<AdCreativeInput>) {
    setInput((current) => ({ ...current, ...patch }));
  }

  function togglePlacement(id: string) {
    setInput((current) => ({
      ...current,
      placements: current.placements.includes(id)
        ? current.placements.filter((placement) => placement !== id)
        : [...current.placements, id],
    }));
  }

  function toggleCategory(value: string) {
    setInput((current) => ({
      ...current,
      categories: current.categories.includes(value)
        ? current.categories.filter((category) => category !== value)
        : [...current.categories, value],
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = saveAdvertisingCreative(
      input,
      actor,
      new Date().toISOString(),
    );
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSaved(result.creative);
  }

  const placementsForFormat = adPlacementOptionsForFormat(
    input.format as AdFormat,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
        {creative ? "Edit creative" : "New creative"}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        Saving returns the creative to draft. Submit it for review, then a
        permitted approver can make it eligible to serve.
      </p>

      {errors.form ? (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {errors.form}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        <Field
          error={errors.advertiser}
          label="Advertiser"
          htmlFor="ad-advertiser"
        >
          <Input
            id="ad-advertiser"
            value={input.advertiser}
            onChange={(event) => update({ advertiser: event.target.value })}
            maxLength={70}
            required
          />
        </Field>

        <Field error={errors.headline} label="Headline" htmlFor="ad-headline">
          <Input
            id="ad-headline"
            value={input.headline}
            onChange={(event) => update({ headline: event.target.value })}
            maxLength={AD_HEADLINE_MAX}
            required
          />
        </Field>

        <Field error={errors.body} label="Body" htmlFor="ad-body">
          <Textarea
            id="ad-body"
            value={input.body}
            onChange={(event) => update({ body: event.target.value })}
            maxLength={AD_BODY_MAX}
            rows={3}
            className="text-sm"
            required
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field error={errors.ctaLabel} label="CTA label" htmlFor="ad-cta">
            <Input
              id="ad-cta"
              value={input.ctaLabel}
              onChange={(event) => update({ ctaLabel: event.target.value })}
              maxLength={30}
              required
            />
          </Field>
          <Field
            error={errors.priority}
            label="Priority (0–100)"
            htmlFor="ad-priority"
          >
            <Input
              id="ad-priority"
              type="number"
              min={0}
              max={100}
              value={input.priority}
              onChange={(event) => update({ priority: event.target.value })}
              required
            />
          </Field>
        </div>

        <Field
          error={errors.destination}
          label="Destination"
          htmlFor="ad-destination"
        >
          <Input
            id="ad-destination"
            type="text"
            inputMode="url"
            value={input.destination}
            onChange={(event) => update({ destination: event.target.value })}
            placeholder="https://example.com/offer"
            required
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field error={errors.startsAt} label="Starts" htmlFor="ad-starts">
            <Input
              id="ad-starts"
              type="datetime-local"
              value={toLocalInput(input.startsAt)}
              onChange={(event) =>
                update({
                  startsAt: fromLocalInput(event.target.value, input.startsAt),
                })
              }
              required
            />
          </Field>
          <Field error={errors.endsAt} label="Ends" htmlFor="ad-ends">
            <Input
              id="ad-ends"
              type="datetime-local"
              value={toLocalInput(input.endsAt)}
              onChange={(event) =>
                update({
                  endsAt: fromLocalInput(event.target.value, input.endsAt),
                })
              }
              required
            />
          </Field>
        </div>

        <Field error={errors.format} label="Format" htmlFor="ad-format">
          <select
            id="ad-format"
            value={input.format}
            onChange={(event) =>
              update({
                format: event.target.value,
                placements: adPlacementOptionsForFormat(
                  event.target.value as AdFormat,
                ).slice(0, 1),
              })
            }
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:ring-3 focus:ring-brand/12"
          >
            <option value="native-card">Native card</option>
            <option value="banner">Banner</option>
            <option value="sidebar">Rail card</option>
          </select>
        </Field>

        <fieldset>
          <legend className="text-xs font-semibold text-ink">Placements</legend>
          <div className="mt-1.5 grid gap-1.5">
            {placementsForFormat.map((id) => {
              const placement = AD_PLACEMENTS.find((item) => item.id === id);
              if (!placement) return null;
              return (
                <label
                  key={id}
                  className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs text-ink"
                >
                  <input
                    type="checkbox"
                    checked={input.placements.includes(id)}
                    onChange={() => togglePlacement(id)}
                    className="mt-0.5 size-4 accent-[var(--inverge-brand)]"
                  />
                  <span>
                    <span className="font-semibold">{placement.label}</span>
                    <span className="mt-0.5 block text-muted">
                      {placement.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.placements ? (
            <p className="mt-1 text-xs text-danger">{errors.placements}</p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold text-ink">
            Categories (optional)
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {discoveryCategories.map((category) => (
              <label
                key={category.value}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs text-ink"
              >
                <input
                  type="checkbox"
                  checked={input.categories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                  className="size-3.5 accent-[var(--inverge-brand)]"
                />
                {category.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-[0.6875rem] text-muted">
            Leave all unchecked to allow every category.
          </p>
          {errors.categories ? (
            <p className="mt-1 text-xs text-danger">{errors.categories}</p>
          ) : null}
        </fieldset>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-ink hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  error?: string | undefined;
  htmlFor: string;
  label: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-ink">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

function AdminAdPreview({
  creative,
  placementId,
}: {
  creative: AdCreative | null;
  placementId: "campaign-detail-rail" | "campaign-feed-inline";
}) {
  if (!creative) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-xs text-muted">
        Select a creative to preview it here.
      </div>
    );
  }

  const rail = placementId === "campaign-detail-rail";

  return (
    <article
      className={`rounded-2xl border border-brand/35 bg-brand/[0.055] p-4 ${
        rail ? "" : "sm:p-5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Pill size="xs" tone="promoted">
          Sponsored
        </Pill>
        <span className="text-[0.6875rem] text-muted">
          Paid placement by {creative.advertiser}
        </span>
      </div>
      <p className="mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-strong">
        {creative.advertiser}
      </p>
      <h3 className="mt-1 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
        {creative.headline}
      </h3>
      <p className="mt-1.5 text-sm leading-5 text-muted">{creative.body}</p>
      <span className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-surface px-3.5 text-sm font-semibold text-brand-strong">
        {creative.ctaLabel}
      </span>
      <p className="mt-3 border-t border-brand/15 pt-2.5 text-[0.625rem] leading-4 text-muted">
        Paid placement. Organic ranking and validation figures are unaffected.
      </p>
    </article>
  );
}
