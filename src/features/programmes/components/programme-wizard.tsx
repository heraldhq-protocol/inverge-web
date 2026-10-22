"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Idea01Icon,
  StarAward01Icon,
  TrophyIcon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { NgnEstimate } from "@/components/ui/ngn-estimate";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  Programme,
  ProgrammeType,
  Reward,
} from "@/features/programmes/types";
import {
  PROGRAMME_STATUS_LABELS,
  PROGRAMME_TYPE_LABELS,
  formatProgrammeDate,
  moduleAvailabilityLabel,
  moduleLabel,
  prizePoolTotal,
  publishChecklist,
  validateProgramme,
} from "@/features/programmes/lib/programme";
import {
  removeWizardDraft,
  saveLocalProgramme,
  saveWizardDraft,
} from "@/features/programmes/lib/local-store";
import { parseUsdAmount } from "@/lib/money";

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "branding", label: "Brand & page" },
  { id: "schedule", label: "Schedule" },
  { id: "submissions", label: "Submissions" },
  { id: "rewards", label: "Prizes" },
  { id: "judging", label: "Judging" },
  { id: "modules", label: "Modules" },
  { id: "review", label: "Review" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const typeOptions = Object.entries(PROGRAMME_TYPE_LABELS).map(
  ([value, label]) => ({
    label,
    value,
  }),
);

const typeIcons = {
  monthly_ideathon: TrophyIcon,
  sponsored_challenge: StarAward01Icon,
  showcase: Calendar03Icon,
  workshop: UserGroupIcon,
  expert_session: Idea01Icon,
  other: Idea01Icon,
} as const;

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}`;
}

function dateInput(iso: string): string {
  return Number.isFinite(new Date(iso).getTime()) ? iso.slice(0, 16) : "";
}

function fromDateInput(value: string): string {
  return value ? `${value}:00.000Z` : "";
}

function blankProgramme(): Programme {
  const now = new Date();
  const inDays = (days: number) =>
    new Date(now.getTime() + days * 86_400_000).toISOString();
  return {
    assets: [],
    audience: {
      ideaSource: "both",
      language: "English",
      regions: ["Nigeria"],
      teamSize: { max: 4, min: 1 },
      who: "",
    },
    category: "",
    createdBy: "Ada Admin",
    description: "",
    experts: [],
    faqs: [],
    heroCopy: "",
    id: createId("prog"),
    modules: [
      {
        availability: "plan",
        enabled: true,
        key: "ai_analytics",
        note: "Pro plan only.",
      },
      { availability: "preview", enabled: true, key: "community_followup" },
      { availability: "coming_soon", enabled: false, key: "showcase" },
      { availability: "coming_soon", enabled: false, key: "mentorship" },
      { availability: "preview", enabled: false, key: "workshops" },
      { availability: "coming_soon", enabled: false, key: "sponsor_challenge" },
    ],
    organiser: "Inverge",
    registrations: [],
    rewards: [],
    rubric: {
      communityWeight: 0,
      criteria: [
        {
          guidance: "Is the problem specific and evidenced?",
          id: createId("crit"),
          label: "Problem clarity",
          weight: 40,
        },
        {
          guidance: "Does the solution fit the problem?",
          id: createId("crit"),
          label: "Solution fit",
          weight: 40,
        },
        {
          guidance: "Can the team execute?",
          id: createId("crit"),
          label: "Feasibility",
          weight: 20,
        },
      ],
      judges: [],
      resultsVisibility: "public",
      scores: [],
      tieBreak: "judge_total",
    },
    rules: [],
    schedule: {
      eventEndsAt: inDays(45),
      eventStartsAt: inDays(40),
      judgingEndsAt: inDays(34),
      judgingStartsAt: inDays(28),
      registrationClosesAt: inDays(7),
      registrationOpensAt: inDays(1),
      resultsAt: inDays(36),
      submissionClosesAt: inDays(21),
      submissionOpensAt: inDays(7),
      timezone: "Africa/Lagos",
    },
    showcase: undefined,
    slug: "",
    snapshot: undefined,
    sponsors: [],
    status: "draft",
    submissionRequirements: {
      allowTeams: true,
      attachments: [],
      requiredFields: ["Problem", "Target audience", "Solution", "Roadmap"],
      template:
        "Use an existing Inverge idea, or create one during registration.",
    },
    submissions: [],
    tagline: "",
    title: "",
    type: "monthly_ideathon",
    updatedAt: now.toISOString(),
    workshops: [],
  };
}

function duplicate(source: Programme): Programme {
  return {
    ...source,
    id: createId("prog"),
    registrations: [],
    rewards: source.rewards.map((reward) => ({
      ...reward,
      id: createId("reward"),
    })),
    rubric: {
      ...source.rubric,
      criteria: source.rubric.criteria.map((criterion) => ({
        ...criterion,
        id: createId("crit"),
      })),
      judges: [],
      scores: [],
    },
    slug: "",
    snapshot: undefined,
    sponsors: [],
    status: "draft",
    submissions: [],
    title: `${source.title} (copy)`,
    updatedAt: new Date().toISOString(),
  };
}

function Field({
  children,
  error,
  hint,
  label,
  optional,
}: {
  children: ReactNode;
  error?: string | undefined;
  hint?: string | undefined;
  label: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink">
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal text-muted">optional</span>
        ) : (
          <span className="ml-1 text-muted" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {hint ? (
        <span className="mt-0.5 block text-[0.6875rem] text-muted">{hint}</span>
      ) : null}
      <span className="mt-1 block">{children}</span>
      {error ? (
        <span className="mt-1 block text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function issueFor(
  issues: ReturnType<typeof validateProgramme>,
  prefix: string,
) {
  return issues.find(
    (issue) => issue.field === prefix || issue.field.startsWith(`${prefix}.`),
  )?.message;
}

export function ProgrammeWizard({
  duplicateFrom,
}: {
  duplicateFrom?: Programme | undefined;
}) {
  const [programme, setProgramme] = useState<Programme>(() =>
    duplicateFrom ? duplicate(duplicateFrom) : blankProgramme(),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const step = STEPS[stepIndex]?.id ?? "identity";
  const issues = useMemo(() => validateProgramme(programme), [programme]);
  const checks = useMemo(() => publishChecklist(programme), [programme]);
  const pool = prizePoolTotal(programme.rewards);

  useEffect(() => {
    if (published) return;
    const timeout = window.setTimeout(() => {
      saveWizardDraft(programme);
      setSavedAt(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [programme, published]);

  function update(patch: Partial<Programme>) {
    setProgramme((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
    setStatus(null);
  }

  function goNext() {
    const stepIssues = issuesForStep(programme, step);
    if (stepIssues.length > 0) {
      setShowValidation(true);
      setStatus("Complete the highlighted fields before continuing.");
      return;
    }
    setShowValidation(false);
    setStatus(null);
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  function saveDraft() {
    saveLocalProgramme({ ...programme, status: "draft" });
    setStatus(
      "Draft saved in this browser and listed on the dashboard. It is not on the server.",
    );
  }

  function publish() {
    const allIssues = validateProgramme(programme);
    if (allIssues.length > 0) {
      setShowValidation(true);
      setStepIndex(STEPS.length - 1);
      setStatus("Fix the publish checklist before scheduling this programme.");
      return;
    }
    const starts = new Date(programme.schedule.registrationOpensAt).getTime();
    const next: Programme = {
      ...programme,
      slug:
        programme.slug ||
        programme.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      status: starts <= Date.now() ? "registration_open" : "scheduled",
      updatedAt: new Date().toISOString(),
    };
    saveWizardDraft(next);
    saveLocalProgramme(next);
    removeWizardDraft(programme.id);
    setProgramme(next);
    setPublished(true);
  }

  if (published) {
    return (
      <div className="mx-auto max-w-2xl">
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
            Programme saved for scheduling
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            It appears on the dashboard and in the local workspace with status{" "}
            <strong>{PROGRAMME_STATUS_LABELS[programme.status]}</strong>.
            Because no API session is connected, this is a browser preview, not
            a server publication.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href={`/admin/programmes/${programme.id}`}
              className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Open workspace
            </Link>
            <Link
              href="/admin/programmes"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Back to programmes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/admin/programmes"
              className="font-medium hover:text-ink"
            >
              Programmes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Create programme</li>
        </ol>
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Programme builder</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            {programme.title.trim() || "Untitled programme"}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {savedAt ? `Autosaved locally at ${savedAt}` : "Autosaving locally"}
            {" · "}
            Preview only
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="md" onClick={saveDraft}>
            Save draft
          </Button>
          <Button type="button" size="md" onClick={publish}>
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={16}
              strokeWidth={1.9}
              aria-hidden="true"
            />
            Schedule programme
          </Button>
        </div>
      </header>

      {status ? (
        <p
          className="mt-3 rounded-xl border border-brand/25 bg-brand-tint px-3 py-2 text-xs leading-5 text-brand-strong"
          role="status"
        >
          {status}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[14rem_minmax(0,1fr)_18rem]">
        <aside
          aria-label="Programme steps"
          className="xl:sticky xl:top-24 xl:self-start"
        >
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Steps</Eyebrow>
            <span className="text-[0.625rem] tabular-nums text-muted">
              {checks.filter((check) => check.complete).length}/{checks.length}{" "}
              ready
            </span>
          </div>
          <ol className="mt-2 flex gap-1 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
            {STEPS.map((item, index) => {
              const current = item.id === step;
              const passed = index < stepIndex;
              return (
                <li key={item.id} className="shrink-0 xl:w-full">
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    onClick={() => {
                      setStepIndex(index);
                      setShowValidation(false);
                    }}
                    className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      current
                        ? "bg-brand-soft font-semibold text-brand-strong"
                        : passed
                          ? "font-medium text-ink hover:bg-canvas"
                          : "text-muted hover:bg-canvas"
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
                      {passed ? <span aria-hidden="true">✓</span> : index + 1}
                    </span>
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[0.6875rem] font-semibold tabular-nums text-muted">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-[-0.03em] text-ink">
                {STEPS[stepIndex]?.label}
              </h2>
            </div>
            <Pill tone="neutral" size="xs">
              {PROGRAMME_TYPE_LABELS[programme.type]}
            </Pill>
          </div>

          <div className="mt-4 space-y-4">
            {step === "identity" ? (
              <>
                <Field
                  label="Programme title"
                  error={showValidation ? issueFor(issues, "title") : undefined}
                >
                  <Input
                    value={programme.title}
                    maxLength={120}
                    placeholder="e.g. Sustainable Solutions"
                    onChange={(event) => update({ title: event.target.value })}
                  />
                </Field>
                <Field
                  label="One-line description"
                  error={
                    showValidation ? issueFor(issues, "tagline") : undefined
                  }
                >
                  <Input
                    value={programme.tagline}
                    maxLength={140}
                    placeholder="Big ideas. Real impact."
                    onChange={(event) =>
                      update({ tagline: event.target.value })
                    }
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Programme type">
                    <Select
                      aria-label="Programme type"
                      options={typeOptions}
                      value={programme.type}
                      onValueChange={(value) =>
                        update({ type: value as ProgrammeType })
                      }
                    />
                  </Field>
                  <Field label="Category">
                    <Input
                      value={programme.category}
                      placeholder="Sustainable solutions"
                      onChange={(event) =>
                        update({ category: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Organiser">
                    <Input
                      value={programme.organiser}
                      onChange={(event) =>
                        update({ organiser: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Language">
                    <Input
                      value={programme.audience.language}
                      onChange={(event) =>
                        update({
                          audience: {
                            ...programme.audience,
                            language: event.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                </div>
                <Field
                  label="Who is this for"
                  error={
                    showValidation
                      ? issueFor(issues, "audience.who")
                      : undefined
                  }
                >
                  <Textarea
                    rows={2}
                    value={programme.audience.who}
                    placeholder="Early-stage African builders working on climate, food, or energy."
                    onChange={(event) =>
                      update({
                        audience: {
                          ...programme.audience,
                          who: event.target.value,
                        },
                      })
                    }
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Regions" hint="Comma separated">
                    <Input
                      value={programme.audience.regions.join(", ")}
                      onChange={(event) =>
                        update({
                          audience: {
                            ...programme.audience,
                            regions: event.target.value
                              .split(",")
                              .map((value) => value.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Idea source">
                    <Select
                      aria-label="Idea source"
                      options={[
                        { label: "Existing ideas", value: "existing" },
                        { label: "New ideas", value: "new" },
                        { label: "Both", value: "both" },
                      ]}
                      value={programme.audience.ideaSource}
                      onValueChange={(value) =>
                        update({
                          audience: {
                            ...programme.audience,
                            ideaSource:
                              value as Programme["audience"]["ideaSource"],
                          },
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Minimum team size">
                    <Input
                      type="number"
                      min={1}
                      value={programme.audience.teamSize.min}
                      onChange={(event) =>
                        update({
                          audience: {
                            ...programme.audience,
                            teamSize: {
                              ...programme.audience.teamSize,
                              min: Number(event.target.value),
                            },
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Maximum team size">
                    <Input
                      type="number"
                      min={1}
                      value={programme.audience.teamSize.max}
                      onChange={(event) =>
                        update({
                          audience: {
                            ...programme.audience,
                            teamSize: {
                              ...programme.audience.teamSize,
                              max: Number(event.target.value),
                            },
                          },
                        })
                      }
                    />
                  </Field>
                </div>
              </>
            ) : null}

            {step === "branding" ? (
              <>
                <Field
                  label="Full description"
                  error={
                    showValidation ? issueFor(issues, "description") : undefined
                  }
                >
                  <Textarea
                    rows={4}
                    value={programme.description}
                    placeholder="What the programme is, who should enter, and why it exists."
                    onChange={(event) =>
                      update({ description: event.target.value })
                    }
                  />
                </Field>
                <Field
                  label="Hero copy"
                  hint="One sentence shown on the public banner."
                >
                  <Input
                    value={programme.heroCopy}
                    placeholder="Build something the community wants to exist."
                    onChange={(event) =>
                      update({ heroCopy: event.target.value })
                    }
                  />
                </Field>
                <Field
                  label="Banner image URL"
                  hint="HTTPS only. The admin must hold the rights to the image."
                >
                  <Input
                    type="url"
                    value={
                      programme.assets.find((asset) => asset.kind === "banner")
                        ?.url ?? ""
                    }
                    placeholder="https://images.example.com/banner.jpg"
                    onChange={(event) =>
                      update({
                        assets: [
                          ...programme.assets.filter(
                            (asset) => asset.kind !== "banner",
                          ),
                          {
                            alt: `${programme.title} banner`,
                            kind: "banner",
                            url: event.target.value,
                          },
                        ],
                      })
                    }
                  />
                </Field>
                <Field label="Thumbnail image URL" optional>
                  <Input
                    type="url"
                    value={
                      programme.assets.find(
                        (asset) => asset.kind === "thumbnail",
                      )?.url ?? ""
                    }
                    onChange={(event) =>
                      update({
                        assets: [
                          ...programme.assets.filter(
                            (asset) => asset.kind !== "thumbnail",
                          ),
                          {
                            alt: `${programme.title} thumbnail`,
                            kind: "thumbnail",
                            url: event.target.value,
                          },
                        ],
                      })
                    }
                  />
                </Field>
                <Field label="Partner logo URL" optional>
                  <Input
                    type="url"
                    value={
                      programme.assets.find(
                        (asset) => asset.kind === "partner_logo",
                      )?.url ?? ""
                    }
                    onChange={(event) =>
                      update({
                        assets: [
                          ...programme.assets.filter(
                            (asset) => asset.kind !== "partner_logo",
                          ),
                          {
                            alt: "Partner logo",
                            kind: "partner_logo",
                            url: event.target.value,
                          },
                        ],
                      })
                    }
                  />
                </Field>
                <p className="rounded-xl bg-canvas px-3 py-2 text-[0.6875rem] leading-4 text-muted">
                  Uploads are not connected. A URL is stored in this preview so
                  a broken image never ships silently: the public page falls
                  back to a branded panel when the URL is empty or invalid.
                </p>
              </>
            ) : null}

            {step === "schedule" ? (
              <>
                <p className="text-xs leading-5 text-muted">
                  All times are stored in UTC and displayed in{" "}
                  {programme.schedule.timezone}. Dates must run in order.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["registrationOpensAt", "Registration opens"],
                      ["registrationClosesAt", "Registration closes"],
                      ["submissionOpensAt", "Submissions open"],
                      ["submissionClosesAt", "Submissions close"],
                      ["judgingStartsAt", "Judging starts"],
                      ["judgingEndsAt", "Judging ends"],
                      ["resultsAt", "Results published"],
                      ["eventStartsAt", "Event starts"],
                      ["eventEndsAt", "Event ends"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      error={
                        showValidation
                          ? issueFor(issues, `schedule.${key}`)
                          : undefined
                      }
                    >
                      <Input
                        type="datetime-local"
                        value={dateInput(programme.schedule[key])}
                        onChange={(event) =>
                          update({
                            schedule: {
                              ...programme.schedule,
                              [key]: fromDateInput(event.target.value),
                            },
                          })
                        }
                      />
                    </Field>
                  ))}
                </div>
                <Field label="Time zone">
                  <Input
                    value={programme.schedule.timezone}
                    onChange={(event) =>
                      update({
                        schedule: {
                          ...programme.schedule,
                          timezone: event.target.value,
                        },
                      })
                    }
                  />
                </Field>
              </>
            ) : null}

            {step === "submissions" ? (
              <>
                <Field
                  label="Submission template"
                  hint="How an entrant starts."
                >
                  <Textarea
                    rows={3}
                    value={programme.submissionRequirements.template}
                    onChange={(event) =>
                      update({
                        submissionRequirements: {
                          ...programme.submissionRequirements,
                          template: event.target.value,
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Required fields" hint="One per line">
                  <Textarea
                    rows={4}
                    value={programme.submissionRequirements.requiredFields.join(
                      "\n",
                    )}
                    onChange={(event) =>
                      update({
                        submissionRequirements: {
                          ...programme.submissionRequirements,
                          requiredFields: event.target.value
                            .split("\n")
                            .map((value) => value.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </Field>
                <Field
                  label="Attachments"
                  hint="One per line. Declarations only; uploads are not connected."
                >
                  <Textarea
                    rows={3}
                    value={programme.submissionRequirements.attachments.join(
                      "\n",
                    )}
                    onChange={(event) =>
                      update({
                        submissionRequirements: {
                          ...programme.submissionRequirements,
                          attachments: event.target.value
                            .split("\n")
                            .map((value) => value.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </Field>
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={programme.submissionRequirements.allowTeams}
                    onChange={(event) =>
                      update({
                        submissionRequirements: {
                          ...programme.submissionRequirements,
                          allowTeams: event.target.checked,
                        },
                      })
                    }
                    className="size-4 accent-brand"
                  />
                  Allow teams
                </label>
                <div>
                  <p className="text-xs font-medium text-ink">Rules</p>
                  <ul className="mt-1.5 space-y-2">
                    {programme.rules.map((rule, index) => (
                      <li key={`${rule}-${index}`} className="flex gap-1.5">
                        <Input
                          value={rule}
                          aria-label={`Rule ${index + 1}`}
                          onChange={(event) =>
                            update({
                              rules: programme.rules.map((item, itemIndex) =>
                                itemIndex === index ? event.target.value : item,
                              ),
                            })
                          }
                        />
                        <button
                          type="button"
                          aria-label={`Remove rule ${index + 1}`}
                          onClick={() =>
                            update({
                              rules: programme.rules.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            })
                          }
                          className="grid size-11 shrink-0 place-items-center rounded-lg border border-border text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
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
                    onClick={() => update({ rules: [...programme.rules, ""] })}
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Add rule
                  </Button>
                </div>
              </>
            ) : null}

            {step === "rewards" ? (
              <RewardsEditor
                programme={programme}
                update={update}
                showValidation={showValidation}
                issues={issues}
              />
            ) : null}

            {step === "judging" ? (
              <JudgingEditor programme={programme} update={update} />
            ) : null}

            {step === "modules" ? (
              <div className="space-y-2">
                <p className="text-xs leading-5 text-muted">
                  Optional modules never block publication. A module marked
                  coming soon cannot be presented as available on the public
                  page.
                </p>
                {programme.modules.map((module) => (
                  <div
                    key={module.key}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {moduleLabel(module.key)}
                        </p>
                        <p className="mt-0.5 text-[0.6875rem] text-muted">
                          {moduleAvailabilityLabel(module.availability)}
                          {module.note ? ` · ${module.note}` : ""}
                        </p>
                      </div>
                      <Switch
                        aria-label={`Enable ${moduleLabel(module.key)}`}
                        checked={module.enabled}
                        disabled={module.availability === "coming_soon"}
                        onCheckedChange={(enabled) =>
                          update({
                            modules: programme.modules.map((item) =>
                              item.key === module.key
                                ? { ...item, enabled }
                                : item,
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {step === "review" ? (
              <div className="space-y-4">
                <ul className="space-y-2">
                  {checks.map((check) => (
                    <li
                      key={check.key}
                      className={`flex items-start gap-2.5 rounded-xl border p-3 ${
                        check.complete
                          ? "border-brand/20 bg-brand-tint"
                          : "border-warning/30 bg-warning/5"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                          check.complete
                            ? "bg-brand text-white"
                            : "bg-warning/15 text-warning-strong"
                        }`}
                      >
                        {check.complete ? (
                          <span className="text-[0.625rem]" aria-hidden="true">
                            ✓
                          </span>
                        ) : (
                          <span
                            className="text-[0.625rem] font-bold"
                            aria-hidden="true"
                          >
                            !
                          </span>
                        )}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-ink">
                          {check.label}
                        </p>
                        <p className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                          {check.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                {issues.length > 0 ? (
                  <div
                    className="rounded-xl border border-danger/30 bg-danger/5 p-3"
                    role="alert"
                  >
                    <p className="text-xs font-semibold text-danger">
                      {issues.length} issue{issues.length === 1 ? "" : "s"} to
                      resolve
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {issues.slice(0, 8).map((issue) => (
                        <li
                          key={`${issue.field}-${issue.message}`}
                          className="text-[0.6875rem] text-danger"
                        >
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="rounded-xl border border-brand/25 bg-brand-tint px-3 py-2 text-xs text-brand-strong">
                    Ready to schedule. Publishing here stores the programme in
                    this browser; the API will run the authoritative validation
                    when it is connected.
                  </p>
                )}
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold text-ink">Prize pool</p>
                  <p className="mt-1 text-sm text-ink">
                    {programme.rewards.length} reward
                    {programme.rewards.length === 1 ? "" : "s"} ·{" "}
                    {new Intl.NumberFormat("en-US", {
                      currency: "USD",
                      maximumFractionDigits: 0,
                      style: "currency",
                    }).format(Number(BigInt(pool.atomic) / 100n))}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] text-muted">
                    Every reward needs a named fulfilment owner before
                    publication.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={stepIndex === 0}
              onClick={() => {
                setShowValidation(false);
                setStepIndex((index) => Math.max(0, index - 1));
              }}
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
                onClick={saveDraft}
              >
                Save draft
              </Button>
              {step === "review" ? (
                <Button type="button" size="md" onClick={publish}>
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  Schedule programme
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

        <aside
          aria-label="Programme preview"
          className="space-y-3 xl:sticky xl:top-24 xl:self-start"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="relative aspect-[16/9] bg-brand-soft">
              {programme.assets.find((asset) => asset.kind === "banner")
                ?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    programme.assets.find((asset) => asset.kind === "banner")
                      ?.url
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full place-items-center text-brand-strong">
                  <HugeiconsIcon
                    icon={typeIcons[programme.type]}
                    size={30}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-ink">
                {PROGRAMME_STATUS_LABELS[programme.status]}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted">
                {PROGRAMME_TYPE_LABELS[programme.type]}
              </p>
              <h3 className="mt-1 text-base font-bold leading-snug tracking-[-0.025em] text-ink">
                {programme.title.trim() || "Your programme title"}
              </h3>
              <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">
                {programme.tagline.trim() ||
                  "A one-line description appears here, so participants know what they are joining."}
              </p>
              <p className="mt-2 text-[0.6875rem] text-muted">
                {formatProgrammeDate(programme.schedule.registrationOpensAt)} ·{" "}
                {formatProgrammeDate(programme.schedule.submissionClosesAt)}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink">
                {new Intl.NumberFormat("en-US", {
                  currency: "USD",
                  maximumFractionDigits: 0,
                  style: "currency",
                }).format(Number(BigInt(pool.atomic) / 100n))}{" "}
                prize pool
              </p>
              {pool.atomic === "0" ? null : (
                <NgnEstimate
                  amount={pool}
                  block
                  className="mt-0.5 text-[0.625rem] text-muted"
                  showRate
                />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-xs font-semibold text-ink">Public page</p>
            <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
              The live ideathon page reads the active monthly ideathon. Other
              programme types have no public route until their module is
              enabled.
            </p>
            {programme.type === "monthly_ideathon" ? (
              <Link
                href="/ideathon"
                className="mt-2 inline-flex min-h-9 items-center gap-1 text-[0.6875rem] font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={ViewIcon}
                  size={13}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                Open ideathon page
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function issuesForStep(programme: Programme, step: StepId): string[] {
  const issues = validateProgramme(programme);
  if (step === "identity") {
    return issues
      .filter((issue) =>
        ["title", "tagline", "description", "audience.who"].includes(
          issue.field,
        ),
      )
      .map((issue) => issue.message);
  }
  if (step === "branding") {
    return issues
      .filter((issue) => issue.field === "description")
      .map((issue) => issue.message);
  }
  if (step === "schedule") {
    return issues
      .filter((issue) => issue.field.startsWith("schedule"))
      .map((issue) => issue.message);
  }
  if (step === "rewards") {
    return issues
      .filter((issue) => issue.field.startsWith("reward"))
      .map((issue) => issue.message);
  }
  if (step === "judging") {
    return issues
      .filter((issue) => issue.field.startsWith("rubric"))
      .map((issue) => issue.message);
  }
  return [];
}

function RewardsEditor({
  issues,
  programme,
  showValidation,
  update,
}: {
  issues: ReturnType<typeof validateProgramme>;
  programme: Programme;
  showValidation: boolean;
  update: (patch: Partial<Programme>) => void;
}) {
  function updateReward(index: number, patch: Partial<Reward>) {
    update({
      rewards: programme.rewards.map((reward, rewardIndex) =>
        rewardIndex === index ? { ...reward, ...patch } : reward,
      ),
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-muted">
        A prize is a commitment, not a payment. Cash prizes need an owner and
        amount; non-cash benefits name the person or partner who delivers them.
      </p>
      <ul className="space-y-2">
        {programme.rewards.map((reward, index) => (
          <li key={reward.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-ink">
                Reward {index + 1}
              </p>
              <button
                type="button"
                aria-label={`Remove reward ${index + 1}`}
                onClick={() =>
                  update({
                    rewards: programme.rewards.filter(
                      (_, rewardIndex) => rewardIndex !== index,
                    ),
                  })
                }
                className="grid size-8 place-items-center rounded-md text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={reward.title}
                  onChange={(event) =>
                    updateReward(index, { title: event.target.value })
                  }
                />
              </Field>
              <Field label="Placement">
                <Input
                  type="number"
                  min={1}
                  value={reward.placement}
                  onChange={(event) =>
                    updateReward(index, {
                      placement: Number(event.target.value),
                    })
                  }
                />
              </Field>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label="Kind">
                <Select
                  aria-label={`Reward ${index + 1} kind`}
                  options={[
                    { label: "Cash", value: "cash" },
                    { label: "Non-cash", value: "non_cash" },
                    { label: "Mixed", value: "mixed" },
                  ]}
                  value={reward.kind}
                  onValueChange={(value) =>
                    updateReward(index, { kind: value as Reward["kind"] })
                  }
                />
              </Field>
              <Field label="Amount (USD)">
                <Input
                  inputMode="decimal"
                  value={
                    reward.amount
                      ? String(Number(BigInt(reward.amount.atomic) / 100n))
                      : ""
                  }
                  disabled={reward.kind === "non_cash"}
                  onChange={(event) => {
                    const atomic = parseUsdAmount(event.target.value);
                    updateReward(index, {
                      amount: atomic
                        ? { atomic, currency: "USD", decimals: 2 }
                        : undefined,
                    });
                  }}
                />
              </Field>
            </div>
            <Field label="Fulfilment owner">
              <Input
                value={reward.fulfilmentOwner}
                placeholder="Inverge operations"
                onChange={(event) =>
                  updateReward(index, { fulfilmentOwner: event.target.value })
                }
              />
            </Field>
            <Field label="Description">
              <Input
                value={reward.description}
                onChange={(event) =>
                  updateReward(index, { description: event.target.value })
                }
              />
            </Field>
            {showValidation &&
            issues.some((issue) => issue.field === `reward.${reward.id}`) ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {
                  issues.find((issue) => issue.field === `reward.${reward.id}`)
                    ?.message
                }
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          update({
            rewards: [
              ...programme.rewards,
              {
                amount: undefined,
                description: "",
                fulfilmentOwner: programme.organiser,
                fulfilmentStatus: "committed",
                fundingStatus: "unconfirmed",
                id: createId("reward"),
                kind: "cash",
                placement: programme.rewards.length + 1,
                title: "",
              },
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
        Add reward
      </Button>
    </div>
  );
}

function JudgingEditor({
  programme,
  update,
}: {
  programme: Programme;
  update: (patch: Partial<Programme>) => void;
}) {
  const total = programme.rubric.criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0,
  );

  function updateCriterion(
    index: number,
    patch: Partial<Programme["rubric"]["criteria"][number]>,
  ) {
    update({
      rubric: {
        ...programme.rubric,
        criteria: programme.rubric.criteria.map((criterion, criterionIndex) =>
          criterionIndex === index ? { ...criterion, ...patch } : criterion,
        ),
      },
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-5 text-muted">
        Judging is separate from community support. A paid promotion never
        enters a score. Weights must total 100 before publication.
      </p>
      <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
        <span className="text-xs font-medium text-ink">Weight total</span>
        <span
          className={`text-xs font-bold tabular-nums ${
            total === 100 ? "text-brand-strong" : "text-danger"
          }`}
        >
          {total} / 100
        </span>
      </div>
      <ul className="space-y-2">
        {programme.rubric.criteria.map((criterion, index) => (
          <li
            key={criterion.id}
            className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,1fr)_5rem_auto]"
          >
            <Input
              aria-label={`Criterion ${index + 1} label`}
              value={criterion.label}
              onChange={(event) =>
                updateCriterion(index, { label: event.target.value })
              }
            />
            <Input
              aria-label={`Criterion ${index + 1} weight`}
              type="number"
              min={0}
              max={100}
              value={criterion.weight}
              onChange={(event) =>
                updateCriterion(index, { weight: Number(event.target.value) })
              }
            />
            <button
              type="button"
              aria-label={`Remove criterion ${index + 1}`}
              onClick={() =>
                update({
                  rubric: {
                    ...programme.rubric,
                    criteria: programme.rubric.criteria.filter(
                      (_, criterionIndex) => criterionIndex !== index,
                    ),
                  },
                })
              }
              className="grid size-11 place-items-center rounded-lg border border-border text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                size={14}
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
        onClick={() =>
          update({
            rubric: {
              ...programme.rubric,
              criteria: [
                ...programme.rubric.criteria,
                { guidance: "", id: createId("crit"), label: "", weight: 0 },
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
        Add criterion
      </Button>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Tie-break">
          <Select
            aria-label="Tie-break rule"
            options={[
              { label: "Judge total", value: "judge_total" },
              { label: "Community support", value: "community_support" },
              { label: "Earliest submission", value: "earliest_submission" },
            ]}
            value={programme.rubric.tieBreak}
            onValueChange={(value) =>
              update({
                rubric: {
                  ...programme.rubric,
                  tieBreak: value as Programme["rubric"]["tieBreak"],
                },
              })
            }
          />
        </Field>
        <Field label="Results visibility">
          <Select
            aria-label="Results visibility"
            options={[
              { label: "Private until published", value: "private" },
              { label: "Participants first", value: "participants" },
              { label: "Public", value: "public" },
            ]}
            value={programme.rubric.resultsVisibility}
            onValueChange={(value) =>
              update({
                rubric: {
                  ...programme.rubric,
                  resultsVisibility:
                    value as Programme["rubric"]["resultsVisibility"],
                },
              })
            }
          />
        </Field>
      </div>

      <div>
        <p className="text-xs font-medium text-ink">Judges</p>
        <ul className="mt-1.5 space-y-2">
          {programme.rubric.judges.map((judge, index) => (
            <li
              key={judge.id}
              className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-3"
            >
              <Input
                aria-label={`Judge ${index + 1} name`}
                value={judge.name}
                placeholder="Name"
                onChange={(event) =>
                  update({
                    rubric: {
                      ...programme.rubric,
                      judges: programme.rubric.judges.map((item) =>
                        item.id === judge.id
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    },
                  })
                }
              />
              <Input
                aria-label={`Judge ${index + 1} affiliation`}
                value={judge.affiliation}
                placeholder="Affiliation"
                onChange={(event) =>
                  update({
                    rubric: {
                      ...programme.rubric,
                      judges: programme.rubric.judges.map((item) =>
                        item.id === judge.id
                          ? { ...item, affiliation: event.target.value }
                          : item,
                      ),
                    },
                  })
                }
              />
              <button
                type="button"
                aria-label={`Remove judge ${index + 1}`}
                onClick={() =>
                  update({
                    rubric: {
                      ...programme.rubric,
                      judges: programme.rubric.judges.filter(
                        (item) => item.id !== judge.id,
                      ),
                    },
                  })
                }
                className="grid size-11 place-items-center rounded-lg border border-border text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={14}
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
              rubric: {
                ...programme.rubric,
                judges: [
                  ...programme.rubric.judges,
                  {
                    affiliation: "",
                    conflict: "none",
                    id: createId("judge"),
                    name: "",
                  },
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
          Add judge
        </Button>
      </div>
    </div>
  );
}
