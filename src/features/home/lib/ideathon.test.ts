import { describe, expect, it } from "vitest";

import {
  formatMilestoneDate,
  nextProgrammeMilestone,
  programmeStatusLabel,
} from "@/features/home/lib/ideathon";
import type { ProgrammeSchedule } from "@/features/programmes/types";

const schedule: ProgrammeSchedule = {
  eventEndsAt: "2026-11-05T17:00:00.000Z",
  eventStartsAt: "2026-11-01T09:00:00.000Z",
  judgingEndsAt: "2026-10-31T23:59:59.000Z",
  judgingStartsAt: "2026-10-27T09:00:00.000Z",
  registrationClosesAt: "2026-10-12T23:59:59.000Z",
  registrationOpensAt: "2026-09-20T09:00:00.000Z",
  resultsAt: "2026-11-03T12:00:00.000Z",
  submissionClosesAt: "2026-10-24T23:59:59.000Z",
  submissionOpensAt: "2026-10-01T09:00:00.000Z",
  timezone: "Africa/Lagos",
};

describe("nextProgrammeMilestone", () => {
  it("shows the registration deadline while registration is open", () => {
    expect(nextProgrammeMilestone("registration_open", schedule)).toEqual({
      at: schedule.registrationClosesAt,
      label: "Registration closes",
    });
  });

  it("shows the submission deadline while submissions are open", () => {
    expect(nextProgrammeMilestone("submission_open", schedule)).toEqual({
      at: schedule.submissionClosesAt,
      label: "Submissions close",
    });
  });

  it("shows the results date during judging", () => {
    expect(nextProgrammeMilestone("judging", schedule)?.label).toBe(
      "Results due",
    );
  });

  it("never shows a deadline for a finished programme", () => {
    expect(nextProgrammeMilestone("completed", schedule)).toBeNull();
    expect(nextProgrammeMilestone("archived", schedule)).toBeNull();
  });
});

describe("formatMilestoneDate", () => {
  it("formats in the programme's timezone", () => {
    const formatted = formatMilestoneDate(
      "2026-10-24T23:59:59.000Z",
      "Africa/Lagos",
    );

    expect(formatted).toBe("25 Oct 2026");
  });

  it("returns null for an unparseable date or unknown zone", () => {
    expect(formatMilestoneDate("not-a-date", "Africa/Lagos")).toBeNull();
    expect(
      formatMilestoneDate("2026-10-24T23:59:59.000Z", "Not/AZone"),
    ).toBeNull();
  });
});

describe("programmeStatusLabel", () => {
  it("uses readable status labels", () => {
    expect(programmeStatusLabel("submission_open")).toBe("Submissions open");
    expect(programmeStatusLabel("results_review")).toBe("Results review");
  });
});
