import type {
  CommunityInvite,
  FeedbackAnswers,
  FeedbackForm,
  FeedbackQuestion,
  IdeaGoals,
} from "@/features/feedback/types";

const UPDATED = "2026-10-16T09:00:00.000Z";

function question(
  id: string,
  label: string,
  type: FeedbackQuestion["type"],
  extra: Partial<FeedbackQuestion> = {},
): FeedbackQuestion {
  return { id, label, required: false, type, ...extra };
}

const fullQuestions: FeedbackQuestion[] = [
  question("promise", "Overall, how promising is this idea?", "rating", {
    required: true,
  }),
  question("interest", "What best describes your interest?", "single-choice", {
    options: [
      { id: "use", label: "I could use this" },
      { id: "recommend", label: "I would recommend it to someone" },
      { id: "learn", label: "I would like to learn more" },
      { id: "else", label: "Something else" },
    ],
  }),
  question("blockers", "What would stop you backing this?", "multi-choice", {
    options: [
      { id: "unclear", label: "Problem unclear" },
      { id: "price", label: "Ask too high" },
      { id: "trust", label: "Trust concern" },
      { id: "solved", label: "Already solved elsewhere" },
    ],
  }),
  question("trust", "Would you trust this service with your details?", "boolean"),
  question(
    "confidence",
    "How confident are you that this would work in practice?",
    "scale",
    {
      scale: {
        min: 1,
        max: 5,
        minLabel: "Not confident",
        maxLabel: "Very confident",
      },
    },
  ),
  question("role", "What best describes you?", "short-text", {
    helpText: "For example: student, vendor, or campus staff.",
  }),
  question("advice", "What should the creator know?", "long-text", {
    helpText: "A concrete concern or suggestion is more useful than a score.",
  }),
];

const coreQuestions: FeedbackQuestion[] = [
  question("promise-core", "How promising does this feel?", "rating", {
    required: true,
  }),
  question("advice-core", "What would make this more useful?", "long-text"),
];

const analyticsQuestions: FeedbackQuestion[] = [
  question("skill-promise", "How promising is this idea?", "rating", {
    required: true,
  }),
  question("skill-interest", "Would you take part in a session?", "single-choice", {
    required: true,
    options: [
      { id: "teach", label: "I would teach a skill" },
      { id: "learn", label: "I would learn a skill" },
      { id: "both", label: "Both" },
      { id: "no", label: "Not for me" },
    ],
  }),
  question("skill-blockers", "What concerns you?", "multi-choice", {
    options: [
      { id: "safety", label: "Safety and trust" },
      { id: "time", label: "Finding time" },
      { id: "quality", label: "Quality of teaching" },
      { id: "none", label: "Nothing major" },
    ],
  }),
  question("skill-notes", "What would make the exchange better?", "long-text"),
];

export const previewFeedbackForms: Readonly<Record<string, FeedbackForm>> = {
  "campus-konekt": {
    description:
      "Your answers help the creator decide what to build first. They are private, and you can withdraw a response later.",
    enabled: true,
    published: true,
    questions: fullQuestions,
    title: "Share your feedback",
    updatedAt: UPDATED,
    version: 2,
  },
  "sungrid-community-power": {
    description:
      "Two short questions about whether shared solar power would work where you are.",
    enabled: true,
    published: true,
    questions: coreQuestions,
    title: "Tell us what you think",
    updatedAt: UPDATED,
    version: 1,
  },
  "skill-circle": {
    description:
      "SkillCircle is testing a neighbourhood skill exchange. Your answers stay with the creator.",
    enabled: true,
    published: true,
    questions: analyticsQuestions,
    title: "Would you join a skill exchange?",
    updatedAt: UPDATED,
    version: 3,
  },
  "zippy-campus": {
    description: "",
    enabled: false,
    published: true,
    questions: [],
    title: "Share your feedback",
    updatedAt: UPDATED,
    version: 1,
  },
};

export function getPreviewFeedbackForm(ideaId: string): FeedbackForm | undefined {
  return previewFeedbackForms[ideaId];
}

/** A conservative default for an idea that has not configured feedback. */
export function emptyFeedbackForm(): FeedbackForm {
  return {
    description: "",
    enabled: false,
    published: false,
    questions: [],
    title: "Share your feedback",
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

function invite(
  destinations: CommunityInvite["destinations"],
  title: string,
  description: string,
  overrides: Partial<CommunityInvite> = {},
): CommunityInvite {
  return {
    description,
    destinations,
    enabled: true,
    primaryDestinationId: destinations[0]?.id ?? null,
    showAfterFeedback: true,
    showOnIdeaPage: false,
    title,
    ...overrides,
  };
}

export const previewCommunityInvites: Readonly<Record<string, CommunityInvite>> = {
  "campus-konekt": invite(
    [
      {
        enabled: true,
        id: "campus-whatsapp",
        kind: "whatsapp",
        label: "CampusKonekt vendors",
        url: "https://chat.whatsapp.com/",
      },
      {
        enabled: true,
        id: "campus-newsletter",
        kind: "newsletter",
        label: "Build notes",
        url: "https://example.com/newsletter",
      },
    ],
    "Want to stay connected?",
    "Join the creator's community to hear about progress, new ideas, and opportunities to get involved.",
    { showOnIdeaPage: true },
  ),
  "skill-circle": invite(
    [
      {
        enabled: true,
        id: "skill-telegram",
        kind: "telegram",
        label: "SkillCircle neighbours",
        url: "https://t.me/",
      },
      {
        enabled: true,
        id: "skill-profile",
        kind: "profile",
        label: "Follow Amara on Inverge",
        url: "/creators/amara-okonkwo",
      },
    ],
    "Keep the exchange going",
    "Get updates from the creator and hear when the next neighbourhood session opens.",
  ),
};

export const previewGoals: Readonly<Record<string, IdeaGoals>> = {
  "campus-konekt": { community: true, feedback: true, funding: true },
  "sungrid-community-power": { community: true, feedback: true, funding: true },
  "farmlink-coldbox": { community: false, feedback: true, funding: true },
  "skill-circle": { community: true, feedback: true, funding: false },
  "zippy-campus": { community: true, feedback: false, funding: false },
};

export const previewCreatorFollows: Readonly<Record<string, string>> = {
  "campus-konekt": "tobiadeyemi",
  "skill-circle": "amaraokonkwo",
};

/**
 * Sample submissions for analytics. They are attributed to the form version
 * they answered, so editing a form does not reinterpret an old answer.
 */
export const previewFeedbackSubmissions: Readonly<
  Record<string, readonly { answers: FeedbackAnswers; formVersion: number }[]>
> = {
  "skill-circle": [
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["quality"],
        "skill-interest": "learn",
        "skill-notes":
          "I would join if sessions were nearby and I could see who is teaching before I commit.",
        "skill-promise": 5,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["safety", "time"],
        "skill-interest": "teach",
        "skill-notes":
          "I could teach basic tailoring on weekends. A simple way to verify people would help.",
        "skill-promise": 4,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["none"],
        "skill-interest": "both",
        "skill-notes": "This already happens informally. A board would make it easier to find.",
        "skill-promise": 4,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["time"],
        "skill-interest": "learn",
        "skill-notes": "Evenings after 6pm would work for me.",
        "skill-promise": 3,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["none"],
        "skill-interest": "teach",
        "skill-notes": "I can teach bike repair. A simple calendar would be enough.",
        "skill-promise": 5,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["quality"],
        "skill-interest": "learn",
        "skill-notes": "A short description of each teacher's experience would help.",
        "skill-promise": 5,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["safety"],
        "skill-interest": "both",
        "skill-notes": "Meeting in a public space for the first session would make me feel safer.",
        "skill-promise": 3,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["time", "safety"],
        "skill-interest": "learn",
        "skill-notes": "Weekend sessions, and a way to see who else is attending.",
        "skill-promise": 2,
      },
    },
    {
      formVersion: 3,
      answers: {
        "skill-blockers": ["none"],
        "skill-interest": "teach",
        "skill-notes": "I would start with one session to see how it works.",
        "skill-promise": 2,
      },
    },
  ],
  "campus-konekt": [
    {
      formVersion: 2,
      answers: {
        blockers: ["trust"],
        confidence: 4,
        interest: "use",
        promise: 5,
        role: "Student",
        trust: true,
        advice: "Verification is the part that matters. A dead listing is worse than none.",
      },
    },
    {
      formVersion: 2,
      answers: {
        blockers: ["solved"],
        confidence: 3,
        interest: "recommend",
        promise: 4,
        role: "Vendor",
        trust: true,
        advice: "Can vendors pause orders during lectures?",
      },
    },
  ],
};

export const previewNewQuestionIds = {
  exampleQuestion: "q_example",
};
