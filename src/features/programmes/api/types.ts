/**
 * Wire types for the public programme API.
 *
 * These mirror the explicit projections in
 * `inverge-api/src/modules/programmes/programme-projections.ts`. They are
 * deliberately structural rather than generated: the public projection is a
 * small, stable contract, and keeping the shape here makes a server-side
 * projection change visible at compile time.
 */

export type ProgrammeType =
  | "MONTHLY_IDEATHON"
  | "SPONSORED_CHALLENGE"
  | "SHOWCASE"
  | "WORKSHOP"
  | "EXPERT_SESSION"
  | "OTHER";

export type ProgrammeStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "REGISTRATION_OPEN"
  | "SUBMISSION_OPEN"
  | "JUDGING"
  | "RESULTS_REVIEW"
  | "COMPLETED"
  | "ARCHIVED";

export type ProgrammePhase =
  | "SCHEDULED"
  | "REGISTRATION_OPEN"
  | "SUBMISSION_OPEN"
  | "JUDGING"
  | "RESULTS_REVIEW"
  | "COMPLETED"
  | "ARCHIVED";

export type JudgingMethod = "COMMUNITY" | "JUDGES" | "HYBRID" | "CURATED";

export type EntryMode =
  "NEW_IDEAS_ONLY" | "EXISTING_IDEAS_ONLY" | "NEW_OR_EXISTING";

export type RubricCriterion = {
  id: string;
  label: string;
  description?: string;
  weight: number;
  minScore: number;
  maxScore: number;
  required?: boolean;
};

export type TieBreakRule = {
  type: "CRITERION" | "CRITERIA_AVERAGE" | "SUBMITTED_AT" | "JUDGE_DECISION";
  criteria?: string[];
  label?: string;
};

export type ProgrammeTimeline = {
  registrationOpensAt: string;
  registrationClosesAt: string;
  submissionOpensAt: string;
  submissionClosesAt: string;
  judgingStartsAt: string;
  judgingEndsAt: string;
  resultsAt: string;
};

export type ProgrammePrize = {
  id: string;
  placement: number;
  title: string;
  description: string;
  kind: string;
  amountAtomic: string | null;
  currency: string;
  decimals: number;
  awardCriteria: string | null;
  eligibility: string | null;
};

export type ProgrammeSponsor = {
  id: string;
  name: string;
  tier: string;
  website: string | null;
  logoUrl: string | null;
};

export type ProgrammeAnnouncement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string | null;
};

export type ProgrammeEntryPolicy = {
  entryMode: EntryMode;
  registrationRequired: boolean;
  allowedCategories: string[];
  minQualityScore: number | null;
  allowMultipleEntries: boolean;
  maxEntriesPerParticipant: number;
  allowTeams: boolean;
  teamMinSize: number | null;
  teamMaxSize: number | null;
  requiredFields: unknown[];
  customQuestions: unknown[];
  maxAttachments: number;
  allowWithdrawal: boolean;
  lateEntriesAllowed: boolean;
};

export type ProgrammeJudging = {
  method: JudgingMethod;
  communityWeight: number;
  judgeWeight: number;
  rubric: RubricCriterion[];
  minimumEvaluations: number;
  missingEvaluationPolicy: "EXCLUDE" | "ZERO";
  tieBreak: TieBreakRule[];
};

export type ProgrammeStanding = {
  entryId: string;
  title: string;
  rank: number | null;
  officialScore: number | null;
  judgeScore: number | null;
  communityScore: number | null;
  communitySupporters: number;
  completedEvaluations: number;
  incompleteReason: string | null;
  disqualified: boolean;
  participantFeedback: string[];
};

export type ProgrammeMethodology = {
  judgingMethod: JudgingMethod;
  communityWeight: number;
  judgeWeight: number;
  minimumEvaluations: number;
  missingEvaluationPolicy: "EXCLUDE" | "ZERO";
  rubric: RubricCriterion[];
  tieBreak: TieBreakRule[];
  rounding: "TWO_DECIMAL_PLACES";
  communityScale: "LINEAR_TO_HIGHEST_ENTRY";
  formula: string;
};

export type ProgrammeResults = {
  revision: number;
  checksum: string;
  publishedAt: string;
  standings: ProgrammeStanding[];
  methodology: ProgrammeMethodology;
  notes: string | null;
};

export type PublicProgramme = {
  id: string;
  slug: string;
  type: ProgrammeType;
  status: ProgrammeStatus;
  phase: ProgrammePhase;
  title: string;
  tagline: string;
  description: string;
  category: string;
  organiser: string;
  heroCopy: string;
  timezone: string;
  timeline: ProgrammeTimeline;
  rules: string[];
  faqs: unknown[];
  assets: unknown[];
  modules: unknown[];
  entryPolicy: ProgrammeEntryPolicy;
  judging: ProgrammeJudging;
  prizes: ProgrammePrize[];
  sponsors: ProgrammeSponsor[];
  announcements: ProgrammeAnnouncement[];
  entryCount: number;
  results: ProgrammeResults | null;
};

export type PublicProgrammeEntry = {
  id: string;
  title: string;
  category: string;
  source: string;
  submittedAt: string | null;
  snapshot: unknown;
  idea: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
  };
  team: { name: string; role: string | null }[];
};

export type PublicProgrammeEntries = {
  data: PublicProgrammeEntry[];
  resultsPublic: boolean;
};

export type ParticipantEntry = {
  id: string;
  programmeId: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";
  title: string;
  category: string;
  source: string;
  content: Record<string, unknown>;
  submittedSnapshot: unknown;
  submissionVersion: number;
  submittedAt: string | null;
  withdrawnAt: string | null;
  curatedRank: number | null;
  createdAt: string;
  updatedAt: string;
  teamMembers: {
    id: string;
    name: string;
    email: string | null;
    role: string | null;
  }[];
  idea: {
    id: string;
    title: string;
    slug: string;
    status: string;
    coverImageUrl: string | null;
  };
  latestFeedback: {
    rank: number | null;
    officialScore: number | null;
    feedback: string[] | null;
    incompleteReason: string | null;
  } | null;
};

export type ParticipantProgramme = {
  programme: PublicProgramme;
  registration: {
    id: string;
    status: string;
    eligibilityNote: string | null;
    registeredAt: string;
  } | null;
  entryLimit: number;
  activeEntryCount: number;
  canAddEntry: boolean;
  entries: ParticipantEntry[];
};

export type ProgrammeListPage = {
  data: PublicProgramme[];
  page: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
    total: number | null;
    totalKind: "omitted" | string;
  };
};

export type Faq = { question: string; answer: string };

/**
 * `faqs` is stored as JSON so an organiser can write arbitrary editorial copy.
 * The public page only renders entries it can prove are question/answer pairs.
 */
export function readFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  const faqs: Faq[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const question =
      typeof candidate.question === "string"
        ? candidate.question
        : typeof candidate.q === "string"
          ? candidate.q
          : null;
    const answer =
      typeof candidate.answer === "string"
        ? candidate.answer
        : typeof candidate.a === "string"
          ? candidate.a
          : null;
    if (question?.trim() && answer?.trim()) {
      faqs.push({ question: question.trim(), answer: answer.trim() });
    }
  }
  return faqs;
}
