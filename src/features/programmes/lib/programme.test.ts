import { describe, expect, it } from "vitest";

import { previewProgrammes } from "@/features/programmes/content/preview-programmes";
import { sortSponsorsForDisplay } from "@/features/programmes/components/sponsor-logo";
import {
  canTransitionProgramme,
  computeLeaderboard,
  isSafeLogoUrl,
  nextProgrammeStatus,
  prizePoolTotal,
  programmeCounts,
  publicCta,
  publishChecklist,
  roleCan,
  securedSponsorFunding,
  submissionJudgeTotal,
  validateProgramme,
  weightedJudgeScore,
} from "@/features/programmes/lib/programme";
import type { Programme, Sponsor } from "@/features/programmes/types";

function programme(id = "prog-ideathon-oct-2026"): Programme {
  const found = previewProgrammes.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing programme ${id}`);
  return found;
}

describe("programme lifecycle", () => {
  it("allows only the documented transitions", () => {
    expect(canTransitionProgramme("draft", "registration_open")).toBe(true);
    expect(canTransitionProgramme("draft", "completed")).toBe(false);
    expect(canTransitionProgramme("archived", "draft")).toBe(false);
    expect(nextProgrammeStatus("submission_open")).toBe("judging");
  });
});

describe("publicCta", () => {
  it("offers submission while a round is open", () => {
    const now = new Date("2026-10-15T00:00:00.000Z");
    expect(publicCta(programme(), now).label).toBe("Submit your idea");
  });

  it("never advertises submissions after the deadline", () => {
    const now = new Date("2026-11-30T00:00:00.000Z");
    const cta = publicCta(programme(), now);
    expect(cta.label).toBe("Submissions closed");
    expect(cta.kind).toBe("disabled");
  });

  it("keeps judging scores out of the primary action", () => {
    const judging: Programme = { ...programme(), status: "judging" };
    const cta = publicCta(judging);
    expect(cta.label).toBe("View leaderboard");
    expect(cta.note).toMatch(/scores stay private/i);
  });

  it("marks a draft programme as unavailable", () => {
    expect(publicCta({ ...programme(), status: "draft" }).kind).toBe("disabled");
  });
});

describe("money separation", () => {
  it("counts only provider-confirmed sponsor invoices as secured", () => {
    const value = programme();
    const secured = BigInt(securedSponsorFunding(value).atomic);
    const total = BigInt(
      value.sponsors
        .reduce((sum, sponsor) => sum + BigInt(sponsor.commitment.atomic), 0n)
        .toString(),
    );
    expect(secured).toBeLessThan(total);
  });

  it("sums the prize pool without floating point", () => {
    expect(prizePoolTotal(programme().rewards).atomic).toBe("1000000");
  });

  it("keeps paid promotion out of validation by construction", () => {
    const value = programme();
    expect(value.rewards.every((reward) => !("promotion" in reward))).toBe(true);
  });
});

describe("judging", () => {
  it("computes a weighted score against the rubric", () => {
    const rubric = programme().rubric;
    const score = weightedJudgeScore(
      rubric,
      Object.fromEntries(rubric.criteria.map((criterion) => [criterion.id, 10])),
    );
    expect(score).toBe(100);
  });

  it("ranks by judge total and keeps community support separate", () => {
    const leaderboard = computeLeaderboard(programme());
    expect(leaderboard.length).toBeGreaterThan(0);
    const first = leaderboard[0];
    const second = leaderboard[1];
    expect(first?.rank).toBe(1);
    if (first && second) {
      expect(first.judgeScore).toBeGreaterThanOrEqual(second.judgeScore);
    }
  });

  it("does not let a disqualified or draft submission rank", () => {
    const value = programme();
    const leaderboard = computeLeaderboard(value);
    const draft = value.submissions.find((submission) => submission.status === "draft");
    expect(leaderboard.some((entry) => entry.submissionId === draft?.id)).toBe(false);
  });

  it("returns zero rather than inventing a score for an unscored entry", () => {
    const value = programme();
    expect(submissionJudgeTotal(value.rubric, "not-a-submission")).toBe(0);
  });
});

describe("validation and publish checklist", () => {
  it("rejects weights that do not total 100", () => {
    const value = programme();
    const issues = validateProgramme({
      ...value,
      rubric: {
        ...value.rubric,
        criteria: value.rubric.criteria.map((criterion) => ({ ...criterion, weight: 10 })),
      },
    });
    expect(issues.some((issue) => issue.field === "rubric.criteria")).toBe(true);
  });

  it("rejects a schedule whose dates run backwards", () => {
    const value = programme();
    const issues = validateProgramme({
      ...value,
      schedule: { ...value.schedule, submissionClosesAt: value.schedule.registrationOpensAt },
    });
    expect(issues.some((issue) => issue.field.startsWith("schedule"))).toBe(true);
  });

  it("requires a reward owner", () => {
    const value = programme();
    const issues = validateProgramme({
      ...value,
      rewards: value.rewards.map((reward) => ({ ...reward, fulfilmentOwner: "" })),
    });
    expect(issues.some((issue) => issue.field.startsWith("reward."))).toBe(true);
  });

  it("produces a complete checklist for the live programme", () => {
    const checks = publishChecklist(programme());
    expect(checks.find((check) => check.key === "identity")?.complete).toBe(true);
    expect(checks.find((check) => check.key === "judging")?.complete).toBe(true);
  });
});

const sponsor = (tier: Sponsor["tier"]): Sponsor => ({
  commitment: { atomic: "0", currency: "USD", decimals: 2 },
  confirmedByProvider: false,
  deliverables: [],
  id: `sponsor-${tier}`,
  invoiceStatus: "draft",
  name: "Acme Partners",
  tier,
  website: "https://example.com/acme",
});

describe("sponsor logos", () => {
  it("accepts a local asset path and an https URL", () => {
    expect(isSafeLogoUrl("/images/partners/acme.svg")).toBe(true);
    expect(isSafeLogoUrl("https://cdn.example.com/logo.png")).toBe(true);
  });

  it("rejects a missing, relative, protocol-relative, or non-https logo", () => {
    expect(isSafeLogoUrl(undefined)).toBe(false);
    expect(isSafeLogoUrl("")).toBe(false);
    expect(isSafeLogoUrl("images/logo.png")).toBe(false);
    expect(isSafeLogoUrl("//example.com/logo.png")).toBe(false);
    expect(isSafeLogoUrl("http://example.com/logo.png")).toBe(false);
    expect(isSafeLogoUrl("javascript:alert(1)")).toBe(false);
  });

  it("orders the wall by tier without dropping sponsors", () => {
    const ordered = sortSponsorsForDisplay([
      sponsor("supporter"),
      sponsor("lead"),
      sponsor("partner"),
    ]);
    expect(ordered.map((entry) => entry.tier)).toEqual([
      "lead",
      "partner",
      "supporter",
    ]);
  });
});

describe("counts and permissions", () => {
  it("counts registrations and submissions", () => {
    const counts = programmeCounts(programme());
    expect(counts.registrations).toBeGreaterThan(0);
    expect(counts.submissions).toBeGreaterThan(0);
  });

  it("does not let a judge publish results or manage sponsors", () => {
    expect(roleCan("judge", "judging:score")).toBe(true);
    expect(roleCan("judge", "results:publish")).toBe(false);
    expect(roleCan("judge", "sponsors:manage")).toBe(false);
  });

  it("lets an organiser publish but not change platform settings", () => {
    expect(roleCan("organiser", "programme:publish")).toBe(true);
    expect(roleCan("organiser", "settings:manage")).toBe(false);
  });
});
