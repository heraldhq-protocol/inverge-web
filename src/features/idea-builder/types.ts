import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type {
  CommunityInvite,
  FeedbackForm,
  IdeaGoals,
} from "@/features/feedback/types";

export type DraftRoadmapStep = {
  id: string;
  date: string;
  description: string;
};

export type DraftUseOfFunds = {
  id: string;
  label: string;
  amount: string;
};

export type IdeaDraft = {
  title: string;
  summary: string;
  category: DiscoveryCategory | "";
  region: string;
  coverUrl: string;
  /** A YouTube or Vimeo page URL, played in the idea hero. Never a file. */
  demoUrl: string;
  problem: string;
  targetUser: string;
  currentAlternative: string;
  solution: string;
  risks: string;
  roadmapSteps: DraftRoadmapStep[];
  goals: IdeaGoals;
  funding: {
    askAmount: string;
    useOfFunds: DraftUseOfFunds[];
  };
  feedback: FeedbackForm;
  community: CommunityInvite;
  updatedAt: string;
};

export const emptyIdeaDraft: IdeaDraft = {
  title: "",
  summary: "",
  category: "",
  region: "",
  coverUrl: "",
  demoUrl: "",
  problem: "",
  targetUser: "",
  currentAlternative: "",
  solution: "",
  risks: "",
  roadmapSteps: [],
  goals: { community: false, feedback: true, funding: false },
  funding: { askAmount: "", useOfFunds: [] },
  feedback: {
    enabled: true,
    published: false,
    version: 1,
    updatedAt: new Date(0).toISOString(),
    title: "Share your feedback",
    description:
      "A few honest answers help the creator decide what to build next.",
    questions: [
      {
        id: "default-rating",
        label: "Overall, how promising is this idea?",
        required: true,
        type: "rating",
      },
      {
        id: "default-note",
        label: "What would make this idea stronger?",
        required: false,
        type: "long-text",
      },
    ],
  },
  community: {
    enabled: false,
    title: "Want to stay connected?",
    description:
      "Join the creator's community to hear about progress and new ideas.",
    primaryDestinationId: null,
    showAfterFeedback: true,
    showOnIdeaPage: false,
    destinations: [],
  },
  updatedAt: new Date(0).toISOString(),
};

export const BUILDER_STEPS = [
  { id: "basics", label: "Idea basics" },
  { id: "problem", label: "Problem & audience" },
  { id: "solution", label: "Solution" },
  { id: "roadmap", label: "Roadmap (optional)" },
  { id: "goals", label: "Ask & funding" },
  { id: "feedback", label: "Feedback & community" },
  { id: "review", label: "Review & publish" },
] as const;

export type BuilderStep = (typeof BUILDER_STEPS)[number]["id"];
