import type { MoneyAmount } from "@/lib/money";

/**
 * Programme domain.
 *
 * One shared record backs every recurring Inverge format: the monthly ideathon,
 * a sponsor-backed challenge, a showcase, a workshop, or an expert session.
 * Modules are optional so a community ideathon never has to configure prizes,
 * sponsors, or judging it does not use.
 */

export type ProgrammeType =
  | "monthly_ideathon"
  | "sponsored_challenge"
  | "showcase"
  | "workshop"
  | "expert_session"
  | "other";

export type ProgrammeStatus =
  | "draft"
  | "scheduled"
  | "registration_open"
  | "submission_open"
  | "judging"
  | "results_review"
  | "completed"
  | "archived";

export type ProgrammeModuleKey =
  | "ai_analytics"
  | "showcase"
  | "mentorship"
  | "workshops"
  | "sponsor_challenge"
  | "community_followup";

/** What a module can honestly claim about itself today. */
export type ModuleAvailability = "available" | "preview" | "coming_soon" | "plan";

export type ProgrammeModule = {
  key: ProgrammeModuleKey;
  enabled: boolean;
  availability: ModuleAvailability;
  /** Optional note shown to admins, e.g. the plan required. */
  note?: string | undefined;
};

export type ProgrammeSchedule = {
  registrationOpensAt: string;
  registrationClosesAt: string;
  submissionOpensAt: string;
  submissionClosesAt: string;
  judgingStartsAt: string;
  judgingEndsAt: string;
  resultsAt: string;
  eventStartsAt: string;
  eventEndsAt: string;
  timezone: string;
};

export type ProgrammeAsset = {
  kind: "banner" | "thumbnail" | "partner_logo";
  url: string;
  alt: string;
};

export type ProgrammeAudience = {
  who: string;
  regions: readonly string[];
  language: string;
  teamSize: { min: number; max: number };
  ideaSource: "existing" | "new" | "both";
};

export type SubmissionRequirements = {
  template: string;
  requiredFields: readonly string[];
  attachments: readonly string[];
  allowTeams: boolean;
};

export type RewardKind = "cash" | "non_cash" | "mixed";

export type RewardFulfilmentStatus =
  | "committed"
  | "funded"
  | "eligibility_pending"
  | "approved"
  | "processing"
  | "delivered"
  | "failed";

export type Reward = {
  id: string;
  placement: number;
  title: string;
  kind: RewardKind;
  /** Present only for cash or mixed rewards. */
  amount?: MoneyAmount | undefined;
  description: string;
  /** The named person or organisation responsible for delivery. */
  fulfilmentOwner: string;
  fundingStatus: "unconfirmed" | "committed" | "funded";
  fulfilmentStatus: RewardFulfilmentStatus;
};

export type SponsorInvoiceStatus =
  | "draft"
  | "issued"
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled";

export type Sponsor = {
  id: string;
  name: string;
  website: string;
  logoUrl?: string | undefined;
  tier: "lead" | "partner" | "supporter";
  /** What the sponsor receives. */
  deliverables: readonly string[];
  commitment: MoneyAmount;
  invoiceStatus: SponsorInvoiceStatus;
  /** A payment is only paid when a verified provider event confirms it. */
  confirmedByProvider: boolean;
};

export type JudgingCriterion = {
  id: string;
  label: string;
  /** Whole percent; criteria must sum to 100. */
  weight: number;
  guidance: string;
};

export type JudgeAssignment = {
  id: string;
  name: string;
  affiliation: string;
  conflict: "none" | "declared" | "excluded";
};

export type JudgeScore = {
  judgeId: string;
  submissionId: string;
  /** criterionId -> 0..10 */
  scores: Readonly<Record<string, number>>;
  comment?: string | undefined;
};

export type JudgingRubric = {
  criteria: readonly JudgingCriterion[];
  judges: readonly JudgeAssignment[];
  scores: readonly JudgeScore[];
  /** Community support contributes to a separate public score, never to judging. */
  communityWeight: number;
  tieBreak: "judge_total" | "community_support" | "earliest_submission";
  resultsVisibility: "private" | "participants" | "public";
};

export type RegistrationStatus = "pending" | "eligible" | "rejected" | "withdrawn";

export type Registration = {
  id: string;
  participantName: string;
  handle: string;
  location: string;
  status: RegistrationStatus;
  registeredAt: string;
  eligibilityNote?: string | undefined;
};

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "accepted"
  | "disqualified";

export type Submission = {
  id: string;
  ideaId: string;
  title: string;
  creator: string;
  category: string;
  status: SubmissionStatus;
  submittedAt: string;
  /** Community support, displayed but never mixed into judging scores. */
  supporters: number;
};

export type LeaderboardEntry = {
  rank: number;
  submissionId: string;
  judgeScore: number;
  communityScore: number;
  frozen: boolean;
};

export type LeaderboardSnapshot = {
  capturedAt: string;
  entries: readonly LeaderboardEntry[];
  checksum: string;
  published: boolean;
};

export type WorkshopSession = {
  id: string;
  title: string;
  description: string;
  facilitator: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  seatsTaken: number;
  price: MoneyAmount | null;
  replayUrl?: string | undefined;
};

export type ExpertProfile = {
  id: string;
  name: string;
  expertise: readonly string[];
  bio: string;
  availability: "open" | "waitlist" | "closed";
  sessionsCompleted: number;
};

export type ShowcaseEvent = {
  id: string;
  title: string;
  startsAt: string;
  format: "online" | "in_person";
  venue: string;
  capacity: number;
  rsvps: number;
  presenterIdeaIds: readonly string[];
  replayUrl?: string | undefined;
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  actorRole: "platform_admin" | "organiser" | "judge";
  action: string;
  target: string;
  before?: string | undefined;
  after?: string | undefined;
};

export type Programme = {
  id: string;
  slug: string;
  type: ProgrammeType;
  status: ProgrammeStatus;
  title: string;
  tagline: string;
  description: string;
  category: string;
  organiser: string;
  audience: ProgrammeAudience;
  submissionRequirements: SubmissionRequirements;
  schedule: ProgrammeSchedule;
  assets: readonly ProgrammeAsset[];
  heroCopy: string;
  rules: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  modules: readonly ProgrammeModule[];
  rewards: readonly Reward[];
  sponsors: readonly Sponsor[];
  rubric: JudgingRubric;
  registrations: readonly Registration[];
  submissions: readonly Submission[];
  snapshot?: LeaderboardSnapshot | undefined;
  workshops: readonly WorkshopSession[];
  experts: readonly ExpertProfile[];
  showcase?: ShowcaseEvent | undefined;
  updatedAt: string;
  createdBy: string;
};

export type ProgrammeSummary = Pick<
  Programme,
  "id" | "slug" | "type" | "status" | "title" | "category" | "organiser" | "updatedAt"
>;

/** Admin permission matrix. Enforced by the API; mirrored here for clarity. */
export type ProgrammeRole = "platform_admin" | "organiser" | "judge";

export type ProgrammePermission =
  | "programme:create"
  | "programme:edit"
  | "programme:publish"
  | "programme:archive"
  | "submission:moderate"
  | "judging:score"
  | "results:publish"
  | "rewards:fulfil"
  | "sponsors:manage"
  | "payments:confirm"
  | "settings:manage";

export const ROLE_PERMISSIONS: Readonly<Record<ProgrammeRole, readonly ProgrammePermission[]>> = {
  platform_admin: [
    "programme:create",
    "programme:edit",
    "programme:publish",
    "programme:archive",
    "submission:moderate",
    "judging:score",
    "results:publish",
    "rewards:fulfil",
    "sponsors:manage",
    "payments:confirm",
    "settings:manage",
  ],
  organiser: [
    "programme:edit",
    "programme:publish",
    "submission:moderate",
    "rewards:fulfil",
    "sponsors:manage",
  ],
  judge: ["judging:score"],
};
