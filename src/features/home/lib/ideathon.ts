import type { HomeIdeathon } from "@/features/home/types";
import type {
  Programme,
  ProgrammeSchedule,
  ProgrammeStatus,
} from "@/features/programmes/types";

const statusLabel: Record<ProgrammeStatus, string> = {
  archived: "Archived",
  completed: "Completed",
  draft: "Draft",
  judging: "Judging",
  registration_open: "Registration open",
  results_review: "Results review",
  scheduled: "Scheduled",
  submission_open: "Submissions open",
};

export function programmeStatusLabel(status: ProgrammeStatus): string {
  return statusLabel[status];
}

/**
 * The next date a reader should care about, as a label plus an ISO value.
 *
 * A passed registration window is not re-shown as "closes" — the phase picks
 * the date that is still ahead, and completed or archived programmes return
 * `null` rather than a stale deadline.
 */
export function nextProgrammeMilestone(
  status: ProgrammeStatus,
  schedule: ProgrammeSchedule,
): { at: string; label: string } | null {
  switch (status) {
    case "registration_open":
      return {
        at: schedule.registrationClosesAt,
        label: "Registration closes",
      };
    case "submission_open":
      return { at: schedule.submissionClosesAt, label: "Submissions close" };
    case "judging":
    case "results_review":
      return { at: schedule.resultsAt, label: "Results due" };
    case "scheduled":
      return { at: schedule.eventStartsAt, label: "Starts" };
    case "completed":
    case "archived":
    case "draft":
      return null;
  }
}

export function formatMilestoneDate(
  iso: string,
  timeZone: string,
): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone,
      year: "numeric",
    }).format(date);
  } catch {
    // An invalid IANA zone should not take the dashboard down.
    return null;
  }
}

/**
 * The programme record reduced to what a dashboard card can state honestly:
 * the event's own status and its next date. It never says the viewer is
 * registered — that fact lives with the backend.
 */
export function toHomeIdeathon(programme: Programme): HomeIdeathon {
  const milestone = nextProgrammeMilestone(
    programme.status,
    programme.schedule,
  );
  const formatted = milestone
    ? formatMilestoneDate(milestone.at, programme.schedule.timezone)
    : null;

  return {
    closesLabel:
      milestone && formatted ? `${milestone.label} ${formatted}` : null,
    href: "/d/ideathons",
    statusLabel: programmeStatusLabel(programme.status),
    theme: programme.tagline || programme.category,
    title: programme.title,
  };
}
