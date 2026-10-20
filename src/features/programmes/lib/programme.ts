import { adminCan } from "@/features/admin/permissions";
import type { MoneyAmount } from "@/lib/money";
import type {
  JudgingRubric,
  LeaderboardEntry,
  ModuleAvailability,
  Programme,
  ProgrammeModuleKey,
  ProgrammePermission,
  ProgrammeRole,
  ProgrammeStatus,
  ProgrammeType,
  Reward,
  Submission,
} from "@/features/programmes/types";

export const PROGRAMME_TYPE_LABELS: Readonly<Record<ProgrammeType, string>> = {
  monthly_ideathon: "Monthly ideathon",
  sponsored_challenge: "Sponsored challenge",
  showcase: "Showcase / demo day",
  workshop: "Workshop",
  expert_session: "Expert session",
  other: "Other programme",
};

export const PROGRAMME_STATUS_LABELS: Readonly<
  Record<ProgrammeStatus, string>
> = {
  draft: "Draft",
  scheduled: "Scheduled",
  registration_open: "Registration open",
  submission_open: "Submissions open",
  judging: "Judging",
  results_review: "Results review",
  completed: "Completed",
  archived: "Archived",
};

export type StatusTone = "accent" | "danger" | "neutral" | "warning";

export function programmeStatusTone(status: ProgrammeStatus): StatusTone {
  switch (status) {
    case "draft":
      return "neutral";
    case "scheduled":
      return "warning";
    case "registration_open":
    case "submission_open":
      return "accent";
    case "judging":
    case "results_review":
      return "warning";
    case "completed":
      return "accent";
    case "archived":
      return "neutral";
  }
}

/** Allowed lifecycle transitions, enforced again by the API when it exists. */
const TRANSITIONS: Readonly<
  Record<ProgrammeStatus, readonly ProgrammeStatus[]>
> = {
  draft: ["scheduled", "registration_open"],
  scheduled: ["registration_open", "draft", "archived"],
  registration_open: ["submission_open", "judging", "archived"],
  submission_open: ["judging", "archived"],
  judging: ["results_review", "submission_open"],
  results_review: ["completed", "judging"],
  completed: ["archived"],
  archived: [],
};

export function canTransitionProgramme(
  from: ProgrammeStatus,
  to: ProgrammeStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextProgrammeStatus(
  status: ProgrammeStatus,
): ProgrammeStatus | null {
  const candidates = TRANSITIONS[status].filter(
    (next) => next !== "archived" && next !== "draft",
  );
  return candidates[0] ?? null;
}

export type PublicCta = {
  label: string;
  href: string;
  kind: "primary" | "secondary" | "disabled";
  note: string;
};

/**
 * The one public CTA for the current lifecycle. It never offers registration or
 * submission while the programme is closed, and it never exposes judging.
 */
export function publicCta(
  programme: Programme,
  now: Date = new Date(),
): PublicCta {
  const time = now.getTime();
  const schedule = programme.schedule;
  const before = (iso: string) => time < new Date(iso).getTime();
  const after = (iso: string) => time > new Date(iso).getTime();

  if (programme.status === "draft") {
    return {
      kind: "disabled",
      label: "Not published",
      href: "#",
      note: "This programme is still a draft.",
    };
  }
  if (programme.status === "archived") {
    return {
      kind: "secondary",
      label: "View archive",
      href: "#archive",
      note: "This edition has ended.",
    };
  }
  if (programme.status === "completed") {
    return {
      kind: "primary",
      label: "See results",
      href: "#results",
      note: "Results are published.",
    };
  }
  if (programme.status === "results_review") {
    return {
      kind: "disabled",
      label: "Results under review",
      href: "#results",
      note: "Results are not public yet.",
    };
  }
  if (programme.status === "judging") {
    return {
      kind: "secondary",
      label: "View leaderboard",
      href: "#standings",
      note: "Judging is in progress. Scores stay private until publication.",
    };
  }
  if (programme.status === "registration_open") {
    return before(schedule.registrationClosesAt)
      ? {
          kind: "primary",
          label: "Register",
          href: "#register",
          note: "Registration is open.",
        }
      : {
          kind: "disabled",
          label: "Registration closed",
          href: "#",
          note: "Registration has closed.",
        };
  }
  if (programme.status === "submission_open") {
    if (!after(schedule.submissionClosesAt)) {
      return {
        kind: "primary",
        label: "Submit your idea",
        href: "#submit",
        note: "Submissions are open.",
      };
    }
    return {
      kind: "disabled",
      label: "Submissions closed",
      href: "#",
      note: "Submissions have closed.",
    };
  }
  return {
    kind: "secondary",
    label: "Programme details",
    href: "#about",
    note: "Registration details will appear here.",
  };
}

export function phaseLabel(
  programme: Programme,
  now: Date = new Date(),
): string {
  const time = now.getTime();
  if (programme.status === "submission_open") {
    return time <= new Date(programme.schedule.submissionClosesAt).getTime()
      ? "Submissions open"
      : "Submissions closed";
  }
  if (programme.status === "registration_open") {
    return time <= new Date(programme.schedule.registrationClosesAt).getTime()
      ? "Registration open"
      : "Registration closed";
  }
  return PROGRAMME_STATUS_LABELS[programme.status];
}

export type ProgrammeCounts = {
  registrations: number;
  eligible: number;
  submissions: number;
  underReview: number;
  shortlisted: number;
  judges: number;
};

export function programmeCounts(programme: Programme): ProgrammeCounts {
  return {
    registrations: programme.registrations.length,
    eligible: programme.registrations.filter(
      (registration) => registration.status === "eligible",
    ).length,
    submissions: programme.submissions.length,
    underReview: programme.submissions.filter(
      (submission) => submission.status === "under_review",
    ).length,
    shortlisted: programme.submissions.filter(
      (submission) => submission.status === "shortlisted",
    ).length,
    judges: programme.rubric.judges.filter(
      (judge) => judge.conflict !== "excluded",
    ).length,
  };
}

export function prizePoolTotal(rewards: readonly Reward[]): MoneyAmount {
  return {
    atomic: rewards
      .reduce((sum, reward) => sum + BigInt(reward.amount?.atomic ?? "0"), 0n)
      .toString(),
    currency: "USD",
    decimals: 2,
  };
}

export function sponsorCommitmentTotal(programme: Programme): MoneyAmount {
  return {
    atomic: programme.sponsors
      .reduce((sum, sponsor) => sum + BigInt(sponsor.commitment.atomic), 0n)
      .toString(),
    currency: "USD",
    decimals: 2,
  };
}

export type ValidationIssue = { field: string; message: string };

const nonEmpty = (value: string) => value.trim().length > 0;

export function validateProgramme(programme: Programme): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!nonEmpty(programme.title)) {
    issues.push({ field: "title", message: "Add a programme title." });
  }
  if (!nonEmpty(programme.tagline)) {
    issues.push({ field: "tagline", message: "Add a one-line description." });
  }
  if (!nonEmpty(programme.description)) {
    issues.push({ field: "description", message: "Describe the programme." });
  }
  if (!nonEmpty(programme.audience.who)) {
    issues.push({
      field: "audience.who",
      message: "State who the programme is for.",
    });
  }

  const schedule = programme.schedule;
  const requiredDates = [
    ["registrationOpensAt", "Registration opens"],
    ["registrationClosesAt", "Registration closes"],
    ["submissionOpensAt", "Submissions open"],
    ["submissionClosesAt", "Submissions close"],
    ["judgingStartsAt", "Judging starts"],
    ["judgingEndsAt", "Judging ends"],
    ["resultsAt", "Results publish"],
    ["eventStartsAt", "Event starts"],
    ["eventEndsAt", "Event ends"],
  ] as const;
  for (const [key, label] of requiredDates) {
    if (!Number.isFinite(new Date(schedule[key]).getTime())) {
      issues.push({
        field: `schedule.${key}`,
        message: `${label} needs a valid date and time.`,
      });
    }
  }

  const ordered = [
    ["registrationOpensAt", "Registration opens"],
    ["registrationClosesAt", "Registration closes"],
    ["submissionClosesAt", "Submissions close"],
    ["judgingEndsAt", "Judging ends"],
    ["resultsAt", "Results"],
  ] as const;
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (!previous || !current) continue;
    if (
      new Date(schedule[current[0]]).getTime() <
      new Date(schedule[previous[0]]).getTime()
    ) {
      issues.push({
        field: `schedule.${current[0]}`,
        message: `${current[1]} cannot be before ${previous[1].toLowerCase()}.`,
      });
    }
  }

  const criteriaTotal = programme.rubric.criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0,
  );
  if (programme.rubric.criteria.length > 0 && criteriaTotal !== 100) {
    issues.push({
      field: "rubric.criteria",
      message: `Scoring weights must add up to 100 (currently ${criteriaTotal}).`,
    });
  }

  for (const sponsor of programme.sponsors) {
    if (
      sponsor.commitment.atomic !== "0" &&
      !sponsor.confirmedByProvider &&
      sponsor.invoiceStatus === "paid"
    ) {
      issues.push({
        field: `sponsor.${sponsor.id}`,
        message:
          "A sponsor invoice cannot be paid without provider confirmation.",
      });
    }
  }

  for (const reward of programme.rewards) {
    if (reward.kind !== "non_cash" && !reward.amount) {
      issues.push({
        field: `reward.${reward.id}`,
        message: "Cash and mixed rewards need an amount.",
      });
    }
    if (!nonEmpty(reward.fulfilmentOwner)) {
      issues.push({
        field: `reward.${reward.id}`,
        message: "Every reward needs a named fulfilment owner.",
      });
    }
  }

  return issues;
}

export type PublishCheck = {
  key: string;
  label: string;
  complete: boolean;
  detail: string;
};

export function publishChecklist(programme: Programme): PublishCheck[] {
  const issues = validateProgramme(programme);
  const has = (field: string) =>
    !issues.some(
      (issue) => issue.field === field || issue.field.startsWith(`${field}.`),
    );

  return [
    {
      key: "identity",
      label: "Identity and audience",
      complete: has("title") && has("tagline") && has("audience.who"),
      detail: "Title, one-line description, full description, and audience.",
    },
    {
      key: "schedule",
      label: "Dates are in order",
      complete: has("schedule"),
      detail:
        "Registration, submission, judging, and results must run in sequence.",
    },
    {
      key: "asset",
      label: "Public banner",
      complete: programme.assets.some(
        (asset) => asset.kind === "banner" && nonEmpty(asset.url),
      ),
      detail: "A banner prevents a generic empty header on the public page.",
    },
    {
      key: "rewards",
      label: "Rewards have an owner",
      complete: programme.rewards.every(
        (reward) =>
          nonEmpty(reward.fulfilmentOwner) &&
          (reward.kind === "non_cash" || Boolean(reward.amount)),
      ),
      detail:
        "Cash and mixed rewards need an amount; every reward needs an owner.",
    },
    {
      key: "judging",
      label: "Judging weights total 100",
      complete:
        programme.rubric.criteria.length === 0 ||
        programme.rubric.criteria.reduce(
          (sum, criterion) => sum + criterion.weight,
          0,
        ) === 100,
      detail:
        "Optional for a community-only programme. Required once judging is enabled.",
    },
    {
      key: "modules",
      label: "Modules are honest",
      complete: programme.modules.every(
        (module) => !module.enabled || module.availability !== "coming_soon",
      ),
      detail: "A module marked coming soon cannot be presented as available.",
    },
  ];
}

export function isPubliclyVisible(programme: Programme): boolean {
  return programme.status !== "draft" && programme.status !== "archived";
}

export function moduleLabel(key: ProgrammeModuleKey): string {
  const labels: Record<ProgrammeModuleKey, string> = {
    ai_analytics: "AI analytics",
    showcase: "Showcase / demo day",
    mentorship: "Expert mentorship",
    workshops: "Workshops",
    sponsor_challenge: "Sponsor challenge",
    community_followup: "Community follow-up",
  };
  return labels[key];
}

export function moduleAvailabilityLabel(
  availability: ModuleAvailability,
): string {
  switch (availability) {
    case "available":
      return "Available";
    case "preview":
      return "Preview";
    case "coming_soon":
      return "Coming soon";
    case "plan":
      return "Pro plan";
  }
}

/**
 * Sponsor logos are rendered in a public page, so only a local asset path or an
 * https URL is allowed. Anything else falls back to the initials tile rather
 * than rendering an unexpected scheme or a broken image.
 */
export function isSafeLogoUrl(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//");
  try {
    return new URL(trimmed).protocol === "https:";
  } catch {
    return false;
  }
}

export function weightedJudgeScore(
  rubric: JudgingRubric,
  scores: Readonly<Record<string, number>>,
): number {
  const totalWeight = rubric.criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0,
  );
  if (totalWeight === 0) return 0;

  const weighted = rubric.criteria.reduce((sum, criterion) => {
    const value = Math.max(0, Math.min(10, scores[criterion.id] ?? 0));
    return sum + (value / 10) * criterion.weight;
  }, 0);

  return Math.round((weighted / totalWeight) * 100 * 100) / 100;
}

export function submissionJudgeTotal(
  rubric: JudgingRubric,
  submissionId: string,
): number {
  const activeJudges = new Set(
    rubric.judges
      .filter((judge) => judge.conflict !== "excluded")
      .map((judge) => judge.id),
  );
  const scores = rubric.scores.filter(
    (score) =>
      score.submissionId === submissionId && activeJudges.has(score.judgeId),
  );
  if (scores.length === 0) return 0;

  return (
    scores.reduce(
      (sum, score) => sum + weightedJudgeScore(rubric, score.scores),
      0,
    ) / scores.length
  );
}

/**
 * Standings are derived from the configured rubric and a deterministic
 * tie-break. Community support is a separate column; it is only used as a
 * tie-break when the rules explicitly say so, never added into the judge total.
 */
export function computeLeaderboard(programme: Programme): LeaderboardEntry[] {
  const eligible = programme.submissions.filter(
    (submission) =>
      submission.status === "submitted" ||
      submission.status === "under_review" ||
      submission.status === "shortlisted" ||
      submission.status === "accepted",
  );

  const sorted = eligible
    .map((submission) => ({
      submission,
      judgeScore: submissionJudgeTotal(programme.rubric, submission.id),
      communityScore: submission.supporters,
    }))
    .toSorted((left, right) => {
      if (right.judgeScore !== left.judgeScore)
        return right.judgeScore - left.judgeScore;
      if (
        programme.rubric.tieBreak === "community_support" &&
        right.communityScore !== left.communityScore
      ) {
        return right.communityScore - left.communityScore;
      }
      if (programme.rubric.tieBreak === "earliest_submission") {
        return (
          new Date(left.submission.submittedAt).getTime() -
          new Date(right.submission.submittedAt).getTime()
        );
      }
      return left.submission.id.localeCompare(right.submission.id);
    });

  return sorted.map((entry, index) => ({
    communityScore: entry.communityScore,
    frozen: Boolean(programme.snapshot?.published),
    judgeScore: entry.judgeScore,
    rank: index + 1,
    submissionId: entry.submission.id,
  }));
}

export function submissionFor(
  programme: Programme,
  submissionId: string,
): Submission | undefined {
  return programme.submissions.find(
    (submission) => submission.id === submissionId,
  );
}

export function roleCan(
  role: ProgrammeRole,
  permission: ProgrammePermission,
): boolean {
  return adminCan(role, permission);
}

export function formatProgrammeDate(iso: string, withTime = false): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  };
  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(iso));
}

/** Days until a deadline, or null when the deadline is missing/invalid. */
export function daysUntil(iso: string, now: Date = new Date()): number | null {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return null;
  return Math.ceil((target - now.getTime()) / 86_400_000);
}

/** The next deadline that matters for the current lifecycle. */
export function nextDeadline(
  programme: Programme,
): { label: string; at: string } | null {
  const schedule = programme.schedule;
  switch (programme.status) {
    case "scheduled":
    case "registration_open":
      return {
        at: schedule.registrationClosesAt,
        label: "Registration closes",
      };
    case "submission_open":
      return { at: schedule.submissionClosesAt, label: "Submissions close" };
    case "judging":
      return { at: schedule.judgingEndsAt, label: "Judging ends" };
    case "results_review":
      return { at: schedule.resultsAt, label: "Results due" };
    default:
      return { at: schedule.eventEndsAt, label: "Event ends" };
  }
}

/** Only confirmed, non-overdue sponsor invoices count toward secured funding. */
export function securedSponsorFunding(programme: Programme): MoneyAmount {
  return {
    atomic: programme.sponsors
      .filter(
        (sponsor) =>
          sponsor.invoiceStatus === "paid" && sponsor.confirmedByProvider,
      )
      .reduce((sum, sponsor) => sum + BigInt(sponsor.commitment.atomic), 0n)
      .toString(),
    currency: "USD",
    decimals: 2,
  };
}
