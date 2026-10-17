import { previewCompetition } from "@/features/ideathon/content/preview-competition";
import type { Ideathon, StandingEntry } from "@/features/ideathon/types";
import type { Programme } from "@/features/programmes/types";
import {
  computeLeaderboard,
  prizePoolTotal,
} from "@/features/programmes/lib/programme";

function statusFor(programme: Programme): Ideathon["status"] {
  switch (programme.status) {
    case "draft":
    case "archived":
      return "archived";
    case "scheduled":
      return "upcoming";
    case "registration_open":
    case "submission_open":
      return "open";
    case "judging":
    case "results_review":
      return "closed";
    case "completed":
      return "published";
  }
}

/**
 * Projects a programme into the public competition shape the ideathon page
 * already renders. Ranking comes from the programme's own leaderboard, while
 * the weighted tier buckets still come from the shared competition fixture —
 * money is never an input to either.
 */
export function competitionFromProgramme(programme: Programme): Ideathon {
  const byIdeaId = new Map(
    previewCompetition.entries.map((entry) => [entry.idea.id, entry]),
  );
  const leaderboard = computeLeaderboard(programme);

  const entries: StandingEntry[] = leaderboard.flatMap((entry) => {
    const submission = programme.submissions.find(
      (item) => item.id === entry.submissionId,
    );
    if (!submission) return [];
    const base = byIdeaId.get(submission.ideaId);
    if (!base) return [];
    return [
      {
        ...base,
        rank: entry.rank,
        score: entry.judgeScore || base.score,
      },
    ];
  });

  const pool = prizePoolTotal(programme.rewards);
  const cashRewards = programme.rewards.filter((reward) => reward.amount);
  const nonCash = programme.rewards.filter((reward) => !reward.amount);

  return {
    description:
      programme.description ||
      "Explore the ideas taking part and see how the community is responding.",
    endsAt: programme.schedule.submissionClosesAt,
    entries,
    id: programme.id,
    prizeDescription:
      cashRewards.length > 0
        ? `${cashRewards.map((reward) => reward.title).join(", ")} in cash recognition${
            nonCash.length > 0
              ? `, plus ${nonCash.map((reward) => reward.title).join(", ")}`
              : ""
          }. Fulfilled outside the platform.`
        : programme.rewards.length > 0
          ? `${nonCash.map((reward) => reward.description).join(" ")} Recognition, not investment.`
          : "Recognition through the Inverge showcase. No prize pool is committed yet.",
    prizeValue: pool.atomic === "0" ? undefined : pool,
    slug: programme.slug,
    startsAt: programme.schedule.submissionOpensAt,
    status: statusFor(programme),
    theme: programme.category || programme.title,
    themeSummary:
      programme.heroCopy ||
      programme.tagline ||
      "Ideas that solve a real problem for a real audience.",
    title: programme.title,
    updatedAt: programme.updatedAt,
  };
}
