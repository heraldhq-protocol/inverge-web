import type {
  JudgingMethod,
  ProgrammePhase,
  ProgrammePrize,
  ProgrammeStatus,
  ProgrammeType,
  PublicProgramme,
} from "@/features/programmes/api/types";

export const PROGRAMME_TYPE_LABELS: Readonly<Record<ProgrammeType, string>> = {
  MONTHLY_IDEATHON: "Monthly ideathon",
  SPONSORED_CHALLENGE: "Sponsored challenge",
  SHOWCASE: "Showcase",
  WORKSHOP: "Workshop",
  EXPERT_SESSION: "Expert session",
  OTHER: "Programme",
};

export const PROGRAMME_PHASE_LABELS: Readonly<Record<ProgrammePhase, string>> =
  {
    SCHEDULED: "Opens soon",
    REGISTRATION_OPEN: "Registration open",
    SUBMISSION_OPEN: "Submissions open",
    JUDGING: "Judging",
    RESULTS_REVIEW: "Results review",
    COMPLETED: "Completed",
    ARCHIVED: "Archived",
  };

export function phaseLabel(phase: ProgrammePhase): string {
  return PROGRAMME_PHASE_LABELS[phase];
}

export function isLive(programme: PublicProgramme): boolean {
  return (
    programme.phase === "REGISTRATION_OPEN" ||
    programme.phase === "SUBMISSION_OPEN" ||
    programme.phase === "JUDGING" ||
    programme.phase === "RESULTS_REVIEW"
  );
}

export function isPast(programme: PublicProgramme): boolean {
  return programme.phase === "COMPLETED" || programme.phase === "ARCHIVED";
}

export function isSubmittable(programme: PublicProgramme): boolean {
  return programme.phase === "SUBMISSION_OPEN";
}

export function primaryCta(programme: PublicProgramme): {
  href: string;
  label: string;
} {
  if (isSubmittable(programme)) {
    return {
      href: `/ideathon/${programme.slug}#enter`,
      label: "Enter this programme",
    };
  }
  if (programme.phase === "REGISTRATION_OPEN") {
    return {
      href: `/ideathon/${programme.slug}#enter`,
      label: "Register your interest",
    };
  }
  if (programme.results) {
    return {
      href: `/ideathon/${programme.slug}#leaderboard`,
      label: "See the results",
    };
  }
  if (programme.phase === "RESULTS_REVIEW") {
    return {
      href: `/ideathon/${programme.slug}#leaderboard`,
      label: "Results are in review",
    };
  }
  return {
    href: `/ideathon/${programme.slug}`,
    label: "Read the details",
  };
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Date not set";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : DATE_FORMATTER.format(date);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "Date not set";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : DATE_TIME_FORMATTER.format(date);
}

export function formatDateRange(startsAt: string, endsAt: string): string {
  return `${formatDate(startsAt)} to ${formatDate(endsAt)}`;
}

export const JUDGING_METHOD_LABELS: Readonly<Record<JudgingMethod, string>> = {
  COMMUNITY: "Community support",
  JUDGES: "Judging panel",
  HYBRID: "Judges and community",
  CURATED: "Curated by the organiser",
};

export function judgingMethodLabel(method: JudgingMethod): string {
  return JUDGING_METHOD_LABELS[method];
}

export function statusLabel(status: ProgrammeStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

/**
 * A prize is advertised only when it can be described honestly.
 *
 * Cash prizes render only with an explicit currency and atomic amount. The API
 * already filters unverified or unfunded prizes out of the public projection;
 * this function makes the formatting rule explicit at the render boundary.
 */
export function prizeAmount(prize: ProgrammePrize): string | null {
  if (prize.kind === "NON_CASH" || prize.amountAtomic === null) return null;
  const decimals = Number.isInteger(prize.decimals) ? prize.decimals : 0;
  const raw = Number(prize.amountAtomic);
  if (!Number.isFinite(raw) || raw <= 0) return null;

  try {
    return new Intl.NumberFormat("en-GB", {
      currency: prize.currency,
      maximumFractionDigits: decimals,
      style: "currency",
    }).format(raw / 10 ** decimals);
  } catch {
    return `${prize.amountAtomic} ${prize.currency}`;
  }
}

export function winningRange(prizes: ProgrammePrize[]): string | null {
  if (prizes.length === 0) return null;
  const placements = prizes
    .map((prize) => prize.placement)
    .filter((placement) => Number.isFinite(placement))
    .sort((left, right) => left - right);
  if (placements.length === 0) return null;
  const first = placements[0];
  const last = placements[placements.length - 1];
  return first === last ? `Place ${first}` : `Places ${first}-${last}`;
}

export function methodologySummary(programme: PublicProgramme): string {
  const method = programme.judging.method;
  if (method === "COMMUNITY") {
    return "Ranked by community support, normalised to the highest eligible entry.";
  }
  if (method === "JUDGES") {
    return "Ranked by the judging panel's completed rubric scores.";
  }
  if (method === "HYBRID") {
    return `Ranked by ${programme.judging.judgeWeight}% judge score and ${programme.judging.communityWeight}% community score.`;
  }
  return "Ordered by the organiser's published curation, not by a public score.";
}

export function entryModeLabel(
  mode: PublicProgramme["entryPolicy"]["entryMode"],
) {
  if (mode === "NEW_IDEAS_ONLY") return "New ideas only";
  if (mode === "EXISTING_IDEAS_ONLY") return "Existing ideas only";
  return "New or existing ideas";
}

/** Groups cards without inventing a fourth state: live, upcoming, or past. */
export function splitProgrammes(programmes: PublicProgramme[]) {
  const live: PublicProgramme[] = [];
  const upcoming: PublicProgramme[] = [];
  const past: PublicProgramme[] = [];

  for (const programme of programmes) {
    if (isLive(programme)) live.push(programme);
    else if (isPast(programme)) past.push(programme);
    else upcoming.push(programme);
  }

  return { live, upcoming, past };
}
