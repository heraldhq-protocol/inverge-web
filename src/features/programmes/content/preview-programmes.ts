import type { MoneyAmount } from "@/lib/money";
import type {
  AuditEntry,
  Programme,
  ProgrammeModule,
  Reward,
  Sponsor,
  Submission,
} from "@/features/programmes/types";

const usd = (dollars: number): MoneyAmount => ({
  atomic: String(dollars * 100),
  currency: "USD",
  decimals: 2,
});

const MODULES: readonly ProgrammeModule[] = [
  {
    availability: "plan",
    enabled: true,
    key: "ai_analytics",
    note: "AI synthesis requires Pro. Basic analytics stay free.",
  },
  { availability: "preview", enabled: true, key: "community_followup" },
  { availability: "coming_soon", enabled: false, key: "showcase" },
  { availability: "coming_soon", enabled: false, key: "mentorship" },
  { availability: "preview", enabled: false, key: "workshops" },
  { availability: "coming_soon", enabled: false, key: "sponsor_challenge" },
];

const rubric = {
  communityWeight: 0,
  criteria: [
    {
      guidance: "Is the problem specific and evidenced?",
      id: "problem",
      label: "Problem clarity",
      weight: 25,
    },
    {
      guidance: "Does the solution answer the problem?",
      id: "solution",
      label: "Solution fit",
      weight: 30,
    },
    {
      guidance: "Can this team execute in the stated window?",
      id: "feasibility",
      label: "Feasibility",
      weight: 25,
    },
    {
      guidance: "Would the target user actually use it?",
      id: "evidence",
      label: "Community evidence",
      weight: 20,
    },
  ],
  judges: [
    {
      affiliation: "Inverge",
      conflict: "none" as const,
      id: "judge-1",
      name: "Amara Okonkwo",
    },
    {
      affiliation: "Sahel Energy",
      conflict: "none" as const,
      id: "judge-2",
      name: "Tunde Balogun",
    },
    {
      affiliation: "Lagos Innovation Lab",
      conflict: "none" as const,
      id: "judge-3",
      name: "Ngozi Eze",
    },
  ],
  resultsVisibility: "public" as const,
  scores: [] as {
    judgeId: string;
    submissionId: string;
    scores: Record<string, number>;
  }[],
  tieBreak: "judge_total" as const,
};

function scoreFor(seed: number, criterion: string): number {
  const offsets: Record<string, number> = {
    problem: 8,
    solution: 7,
    feasibility: 6,
    evidence: 7,
  };
  const base = offsets[criterion] ?? 7;
  return Math.max(
    3,
    Math.min(10, base + ((seed * 7 + criterion.length * 3) % 4) - 1),
  );
}

const submissionSeed: readonly {
  ideaId: string;
  creator: string;
  title: string;
  category: string;
  supporters: number;
  status: Submission["status"];
  submittedAt: string;
}[] = [
  {
    category: "Clean energy",
    creator: "Amaka Nwosu",
    ideaId: "sungrid-community-power",
    status: "shortlisted",
    submittedAt: "2026-10-05T10:00:00.000Z",
    supporters: 286,
    title: "SunGrid Community Power",
  },
  {
    category: "Agriculture",
    creator: "Ibrahim Musa",
    ideaId: "farmlink-coldbox",
    status: "submitted",
    submittedAt: "2026-10-06T11:30:00.000Z",
    supporters: 193,
    title: "FarmLink ColdBox",
  },
  {
    category: "Campus technology",
    creator: "Tobi Adeyemi",
    ideaId: "campus-konekt",
    status: "submitted",
    submittedAt: "2026-10-04T09:15:00.000Z",
    supporters: 412,
    title: "CampusKonekt",
  },
  {
    category: "Education technology",
    creator: "Zainab Bello",
    ideaId: "studymate-ng",
    status: "under_review",
    submittedAt: "2026-10-07T14:10:00.000Z",
    supporters: 112,
    title: "StudyMate NG",
  },
  {
    category: "Logistics",
    creator: "Chinedu Eze",
    ideaId: "zippy-campus",
    status: "submitted",
    submittedAt: "2026-10-08T08:40:00.000Z",
    supporters: 76,
    title: "ZippyCampus",
  },
  {
    category: "Agriculture",
    creator: "Morenike Afolabi",
    ideaId: "crop-circle",
    status: "submitted",
    submittedAt: "2026-10-09T12:05:00.000Z",
    supporters: 104,
    title: "CropCircle",
  },
  {
    category: "Agriculture",
    creator: "Femi Danladi",
    ideaId: "agroroute",
    status: "accepted",
    submittedAt: "2026-10-03T16:20:00.000Z",
    supporters: 127,
    title: "AgroRoute",
  },
  {
    category: "Clean energy",
    creator: "Efe Ighalo",
    ideaId: "ecocharge-kiosks",
    status: "submitted",
    submittedAt: "2026-10-10T09:00:00.000Z",
    supporters: 149,
    title: "EcoCharge Kiosks",
  },
  {
    category: "Clean energy",
    creator: "Yusuf Lawal",
    ideaId: "solarchill",
    status: "submitted",
    submittedAt: "2026-10-02T13:35:00.000Z",
    supporters: 171,
    title: "SolarChill",
  },
  {
    category: "Food & retail",
    creator: "Tolu Martins",
    ideaId: "kitchen-collective",
    status: "draft",
    submittedAt: "2026-10-11T07:50:00.000Z",
    supporters: 132,
    title: "Kitchen Collective",
  },
];

const submissions: Submission[] = submissionSeed.map((entry) => ({
  category: entry.category,
  creator: entry.creator,
  id: `sub-${entry.ideaId}`,
  ideaId: entry.ideaId,
  status: entry.status,
  submittedAt: entry.submittedAt,
  supporters: entry.supporters,
  title: entry.title,
}));

for (const [index, submission] of submissions.entries()) {
  for (const judge of rubric.judges) {
    rubric.scores.push({
      judgeId: judge.id,
      scores: {
        evidence: scoreFor(index + judge.id.length, "evidence"),
        feasibility: scoreFor(index + judge.id.length + 1, "feasibility"),
        problem: scoreFor(index + judge.id.length + 2, "problem"),
        solution: scoreFor(index + judge.id.length + 3, "solution"),
      },
      submissionId: submission.id,
    });
  }
}

const registrations = Array.from({ length: 14 }, (_, index) => {
  const names = [
    "Aisha Bello",
    "Tunde Adeyemi",
    "Zainab Yusuf",
    "Daniel Okoro",
    "Chidinma Eze",
    "Ibrahim Sani",
    "Ngozi Okafor",
    "Femi Adeola",
    "Ada Nwosu",
    "Emeka Nwankwo",
    "Bola Adekunle",
    "Amina Sadiq",
    "Kelechi Nnamani",
    "Tolu Martins",
  ];
  const name = names[index] ?? `Participant ${index + 1}`;
  return {
    eligibilityNote: index === 11 ? "Awaiting student verification" : undefined,
    handle: `@${name.toLowerCase().replace(/[^a-z]+/g, "")}`,
    id: `reg-${index + 1}`,
    location:
      index % 3 === 0
        ? "Lagos, Nigeria"
        : index % 3 === 1
          ? "Abuja, Nigeria"
          : "Accra, Ghana",
    participantName: name,
    registeredAt: `2026-10-${String(2 + (index % 9)).padStart(2, "0")}T09:00:00.000Z`,
    status:
      index === 11
        ? ("pending" as const)
        : index === 13
          ? ("withdrawn" as const)
          : ("eligible" as const),
  };
});

const rewards: readonly Reward[] = [
  {
    amount: usd(5000),
    description: "First place, paid by bank transfer after eligibility checks.",
    fulfilmentOwner: "Inverge operations",
    fulfilmentStatus: "committed",
    fundingStatus: "committed",
    id: "reward-1",
    kind: "cash",
    placement: 1,
    title: "First place",
  },
  {
    amount: usd(3000),
    description: "Second place.",
    fulfilmentOwner: "Inverge operations",
    fulfilmentStatus: "committed",
    fundingStatus: "committed",
    id: "reward-2",
    kind: "cash",
    placement: 2,
    title: "Second place",
  },
  {
    amount: usd(2000),
    description: "Third place.",
    fulfilmentOwner: "Inverge operations",
    fulfilmentStatus: "committed",
    fundingStatus: "committed",
    id: "reward-3",
    kind: "cash",
    placement: 3,
    title: "Third place",
  },
  {
    description: "A place on the partner mentorship shortlist.",
    fulfilmentOwner: "Sahel Energy partnerships",
    fulfilmentStatus: "committed",
    fundingStatus: "committed",
    id: "reward-4",
    kind: "non_cash",
    placement: 4,
    title: "Mentor shortlist",
  },
];

const sponsors: readonly Sponsor[] = [
  {
    commitment: usd(10000),
    confirmedByProvider: true,
    deliverables: ["Prize funding", "Two mentors", "Opening workshop"],
    id: "sponsor-sahel",
    invoiceStatus: "paid",
    logoUrl: "/images/partners/sahel-energy.svg",
    name: "Sahel Energy",
    tier: "lead",
    website: "https://example.com/sahel-energy",
  },
  {
    commitment: usd(2500),
    confirmedByProvider: false,
    deliverables: ["Workshop venue", "Participant refreshments"],
    id: "sponsor-hub",
    invoiceStatus: "issued",
    logoUrl: "/images/partners/lagos-innovation-lab.svg",
    name: "Lagos Innovation Lab",
    tier: "partner",
    website: "https://example.com/lagos-innovation",
  },
];

const audit: readonly AuditEntry[] = [
  {
    action: "Programme published",
    actor: "Ada Admin",
    actorRole: "platform_admin",
    after: "submission_open",
    at: "2026-10-01T08:00:00.000Z",
    id: "audit-1",
    target: "Sustainable Solutions",
  },
  {
    action: "Submission status changed",
    actor: "Ada Admin",
    actorRole: "platform_admin",
    after: "shortlisted",
    at: "2026-10-12T09:40:00.000Z",
    before: "submitted",
    id: "audit-2",
    target: "SunGrid Community Power",
  },
  {
    action: "Sponsor invoice marked paid",
    actor: "Ada Admin",
    actorRole: "platform_admin",
    after: "paid (provider confirmed)",
    at: "2026-10-08T14:15:00.000Z",
    before: "pending",
    id: "audit-3",
    target: "Sahel Energy",
  },
];

const baseSchedule = {
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

function programme(
  overrides: Partial<Programme> &
    Pick<Programme, "id" | "slug" | "title" | "type" | "status">,
): Programme {
  return {
    assets: [],
    audience: {
      ideaSource: "both",
      language: "English",
      regions: ["Nigeria", "Ghana", "Senegal"],
      teamSize: { max: 4, min: 1 },
      who: "Early-stage African builders and creators.",
    },
    category: "Sustainable solutions",
    createdBy: "Ada Admin",
    description:
      "A monthly programme for early-stage African builders to publish a real idea, gather structured feedback, and show what the community would support.",
    experts: [],
    faqs: [],
    heroCopy: "Build something the community wants to exist.",
    modules: MODULES,
    organiser: "Inverge",
    registrations: [],
    rewards: [],
    rubric,
    rules: [
      "One entry per idea.",
      "Paid promotion never affects judging or validation metrics.",
      "Results are published only after review.",
    ],
    schedule: baseSchedule,
    showcase: undefined,
    snapshot: undefined,
    sponsors: [],
    submissionRequirements: {
      allowTeams: true,
      attachments: ["Pitch deck (PDF, optional)"],
      requiredFields: ["Problem", "Target audience", "Solution", "Roadmap"],
      template:
        "Use an existing Inverge idea, or create one during registration.",
    },
    submissions: [],
    tagline: "Big ideas. Real impact.",
    updatedAt: "2026-10-17T08:00:00.000Z",
    workshops: [],
    ...overrides,
  };
}

export const previewProgrammes: readonly Programme[] = [
  programme({
    assets: [
      {
        alt: "Creators collaborating in a bright workshop",
        kind: "banner",
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=800&fit=crop&q=80",
      },
    ],
    category: "Sustainable solutions",
    description:
      "The October ideathon asks for ideas that tackle climate, food, energy, and environmental challenges in Africa. Entries are open, the community is responding, and judging begins once submissions close.",
    experts: [
      {
        availability: "open",
        bio: "Solar operations lead working with small businesses on shared power.",
        expertise: ["Clean energy", "Operations"],
        id: "expert-amaka",
        name: "Amaka Nwosu",
        sessionsCompleted: 12,
      },
      {
        availability: "waitlist",
        bio: "Agri-logistics operator focused on cold-chain access.",
        expertise: ["Agriculture", "Logistics"],
        id: "expert-ibrahim",
        name: "Ibrahim Musa",
        sessionsCompleted: 8,
      },
    ],
    faqs: [
      {
        answer:
          "Ranking uses weighted support from accounts that supported, gave feedback, or recorded a pre-pledge. Money never affects rank.",
        question: "How are community standings calculated?",
      },
      {
        answer:
          "No. Selecting a funding goal is non-binding and does not open a campaign, escrow, or raise.",
        question: "Does entering mean I am fundraising?",
      },
      {
        answer:
          "Yes. A private idea can be entered without appearing in public discovery. Judging still sees the entry.",
        question: "Can I enter a private idea?",
      },
    ],
    heroCopy:
      "Ideas that tackle climate, food, energy, and environmental challenges in Africa.",
    id: "prog-ideathon-oct-2026",
    modules: MODULES.map((module) =>
      module.key === "workshops"
        ? { ...module, enabled: true, availability: "preview" as const }
        : module.key === "showcase"
          ? { ...module, enabled: true, availability: "preview" as const }
          : module,
    ),
    registrations,
    rewards,
    rules: [
      "One entry per idea; the creator must own the idea.",
      "Community support is weighted by verification tier and never by payment.",
      "Pre-pledge amounts are displayed but never add points.",
      "Judges score the shortlist against the published rubric.",
      "Results remain private until the review is complete.",
    ],
    showcase: {
      capacity: 120,
      format: "online",
      id: "showcase-oct",
      presenterIdeaIds: [
        "sungrid-community-power",
        "farmlink-coldbox",
        "solarchill",
      ],
      rsvps: 64,
      startsAt: "2026-11-01T15:00:00.000Z",
      title: "Sustainable Solutions demo day",
      venue: "Online",
    },
    slug: "sustainable-solutions",
    sponsors,
    status: "submission_open",
    submissions,
    tagline: "Big ideas. Real impact.",
    title: "Sustainable Solutions",
    type: "monthly_ideathon",
    workshops: [
      {
        capacity: 40,
        description:
          "Turn raw feedback into a sharper problem statement and a testable next experiment.",
        durationMinutes: 60,
        facilitator: "Amaka Nwosu",
        id: "workshop-feedback",
        price: null,
        seatsTaken: 27,
        startsAt: "2026-10-22T16:00:00.000Z",
        title: "From feedback to a validation plan",
      },
      {
        capacity: 30,
        description:
          "How to present a hardware or energy idea to a judging panel.",
        durationMinutes: 45,
        facilitator: "Tunde Balogun",
        id: "workshop-pitch",
        price: usd(10),
        seatsTaken: 12,
        startsAt: "2026-10-25T10:00:00.000Z",
        title: "Telling the story of an energy idea",
      },
    ],
  }),
  programme({
    category: "Climate adaptation",
    description:
      "A sponsor-backed challenge looking for practical ways to keep food and medicine cold in places with unreliable power.",
    id: "prog-cold-chain-2026",
    modules: MODULES.map((module) =>
      module.key === "sponsor_challenge"
        ? { ...module, enabled: true, availability: "preview" as const }
        : module.key === "ai_analytics"
          ? { ...module, enabled: false }
          : module,
    ),
    rewards: [
      {
        amount: usd(15000),
        description:
          "Pilot funding plus a place in the sponsor's accelerator shortlist.",
        fulfilmentOwner: "Sahel Energy partnerships",
        fulfilmentStatus: "committed",
        fundingStatus: "committed",
        id: "challenge-reward",
        kind: "mixed",
        placement: 1,
        title: "Pilot and shortlist",
      },
    ],
    schedule: {
      ...baseSchedule,
      eventEndsAt: "2026-12-12T17:00:00.000Z",
      eventStartsAt: "2026-12-10T09:00:00.000Z",
      judgingEndsAt: "2026-12-06T23:59:59.000Z",
      judgingStartsAt: "2026-12-01T09:00:00.000Z",
      registrationClosesAt: "2026-11-24T23:59:59.000Z",
      registrationOpensAt: "2026-10-20T09:00:00.000Z",
      resultsAt: "2026-12-08T12:00:00.000Z",
      submissionClosesAt: "2026-11-28T23:59:59.000Z",
      submissionOpensAt: "2026-11-01T09:00:00.000Z",
    },
    slug: "cold-chain-challenge",
    sponsors: [
      {
        commitment: usd(15000),
        confirmedByProvider: false,
        deliverables: ["Pilot funding", "Cold-chain lab access"],
        id: "sponsor-cold",
        invoiceStatus: "pending",
        name: "Sahel Energy",
        tier: "lead",
        website: "https://example.com/sahel-energy",
      },
    ],
    status: "scheduled",
    tagline: "Keep what matters cold.",
    title: "Cold Chain Challenge",
    type: "sponsored_challenge",
  }),
  programme({
    category: "Community",
    description:
      "A showcase for nine ideas that completed validation this quarter, with short demos and a founder Q&A.",
    id: "prog-showcase-q3",
    rewards: [],
    schedule: {
      ...baseSchedule,
      eventEndsAt: "2026-09-25T18:00:00.000Z",
      eventStartsAt: "2026-09-25T15:00:00.000Z",
      judgingEndsAt: "2026-09-20T23:59:59.000Z",
      judgingStartsAt: "2026-09-18T09:00:00.000Z",
      registrationClosesAt: "2026-09-20T23:59:59.000Z",
      registrationOpensAt: "2026-08-25T09:00:00.000Z",
      resultsAt: "2026-09-25T15:00:00.000Z",
      submissionClosesAt: "2026-09-12T23:59:59.000Z",
      submissionOpensAt: "2026-08-25T09:00:00.000Z",
    },
    showcase: {
      capacity: 150,
      format: "in_person",
      id: "showcase-q3",
      presenterIdeaIds: ["campus-konekt", "skill-circle", "market-basket"],
      rsvps: 138,
      startsAt: "2026-09-25T15:00:00.000Z",
      title: "Validation showcase",
      venue: "Lagos Innovation Lab",
    },
    slug: "validation-showcase",
    status: "completed",
    tagline: "Nine ideas. One afternoon.",
    title: "Validation Showcase",
    type: "showcase",
  }),
  programme({
    category: "Workshops",
    description:
      "A free workshop on making sense of structured feedback, run by the Inverge creator team.",
    id: "prog-workshop-feedback",
    modules: MODULES.map((module) =>
      module.key === "workshops"
        ? { ...module, enabled: true, availability: "available" as const }
        : module,
    ),
    schedule: {
      ...baseSchedule,
      eventEndsAt: "2026-10-22T17:00:00.000Z",
      eventStartsAt: "2026-10-22T16:00:00.000Z",
      judgingEndsAt: "2026-10-22T15:00:00.000Z",
      judgingStartsAt: "2026-10-22T15:00:00.000Z",
      registrationClosesAt: "2026-10-21T23:59:59.000Z",
      registrationOpensAt: "2026-10-01T09:00:00.000Z",
      resultsAt: "2026-10-22T17:00:00.000Z",
      submissionClosesAt: "2026-10-21T23:59:59.000Z",
      submissionOpensAt: "2026-10-01T09:00:00.000Z",
    },
    slug: "feedback-to-validation",
    status: "registration_open",
    tagline: "Make feedback do something.",
    title: "From feedback to validation",
    type: "workshop",
    workshops: [
      {
        capacity: 40,
        description:
          "A practical hour on turning free-text and ratings into a testable plan.",
        durationMinutes: 60,
        facilitator: "Amara Okonkwo",
        id: "workshop-solo",
        price: null,
        seatsTaken: 31,
        startsAt: "2026-10-22T16:00:00.000Z",
        title: "From feedback to validation",
      },
    ],
  }),
  programme({
    category: "Sustainable solutions",
    description:
      "The September ideathon archive. Final standings are frozen and results are published.",
    id: "prog-ideathon-sep-2026",
    modules: MODULES.map((module) => ({ ...module, enabled: false })),
    registrations: registrations.slice(0, 9),
    rewards,
    schedule: {
      ...baseSchedule,
      eventEndsAt: "2026-10-02T17:00:00.000Z",
      eventStartsAt: "2026-09-28T09:00:00.000Z",
      judgingEndsAt: "2026-09-26T23:59:59.000Z",
      judgingStartsAt: "2026-09-22T09:00:00.000Z",
      registrationClosesAt: "2026-09-10T23:59:59.000Z",
      registrationOpensAt: "2026-08-20T09:00:00.000Z",
      resultsAt: "2026-09-29T12:00:00.000Z",
      submissionClosesAt: "2026-09-18T23:59:59.000Z",
      submissionOpensAt: "2026-08-25T09:00:00.000Z",
    },
    slug: "sustainable-solutions-september",
    snapshot: {
      capturedAt: "2026-09-19T00:00:00.000Z",
      checksum: "sha256-preview-frozen",
      entries: submissions.slice(0, 6).map((submission, index) => ({
        communityScore: submission.supporters,
        frozen: true,
        judgeScore: 86 - index * 4,
        rank: index + 1,
        submissionId: submission.id,
      })),
      published: true,
    },
    sponsors,
    status: "archived",
    submissions: submissions.slice(0, 6),
    tagline: "The September round.",
    title: "Sustainable Solutions · September",
    type: "monthly_ideathon",
  }),
];

export const previewProgrammeById = new Map(
  previewProgrammes.map((programme) => [programme.id, programme]),
);

export function getPreviewActiveIdeathon(): Programme {
  const programme =
    previewProgrammes.find(
      (entry) =>
        entry.type === "monthly_ideathon" && entry.status === "submission_open",
    ) ?? previewProgrammes[0];

  if (!programme) {
    throw new Error("Preview programmes are empty.");
  }
  return programme;
}

export function getPreviewProgramme(id: string): Programme | undefined {
  return previewProgrammeById.get(id);
}

export const previewAuditEntries = audit;

/** Illustrative AI usage for the admin/pro analytics surfaces. */
export const previewAiUsage = {
  allowance: 10,
  plan: "pro" as const,
  resetsAt: "2026-11-01T00:00:00.000Z",
  used: 3,
};
