import type { IdeaComment } from "@/features/ideas/types";

/**
 * Sample discussion threads for review.
 *
 * Preview content only — none of this is live platform activity. A thread is
 * present for a handful of ideas so the discussion surface can be reviewed at a
 * realistic density; every other idea renders its empty state. The `pinned`
 * comment is the creator's response, shown with a "Creator" marker.
 */
export const previewComments: Record<string, IdeaComment[]> = {
  "campus-konekt": [
    {
      author: "Dami Oluwole",
      authorInitials: "DO",
      body: "This would save me so much time — I spend an hour a week just finding where to print and bind course materials. Are you planning to include tailors too?",
      createdAt: "2026-09-02T10:00:00.000Z",
      id: "campus-konekt-1",
    },
    {
      author: "Tobi Adeyemi",
      authorInitials: "TA",
      body: "Yes — tailors are one of the first vendor groups in the directory. Verification is the part we are most careful about, because a dead directory is worse than no directory.",
      createdAt: "2026-09-04T09:15:00.000Z",
      id: "campus-konekt-2",
      pinned: true,
    },
    {
      author: "Blessing Nnamdi",
      authorInitials: "BN",
      body: "As a vendor I would want a way to pause orders when I am busy in lectures. Would that be part of the first version?",
      createdAt: "2026-09-11T14:40:00.000Z",
      id: "campus-konekt-3",
    },
  ],
  "sungrid-community-power": [
    {
      author: "Chidera Obi",
      authorInitials: "CO",
      body: "Pay-as-you-use is the part that matters here — most traders I know cannot afford a flat monthly fee for power they only use part of the day.",
      createdAt: "2026-09-18T11:20:00.000Z",
      id: "sungrid-1",
    },
    {
      author: "Amaka Nwosu",
      authorInitials: "AN",
      body: "Exactly. Metering per business keeps the cost proportional to use, and a spare unit covers maintenance without a full shutdown.",
      createdAt: "2026-09-20T08:05:00.000Z",
      id: "sungrid-2",
      pinned: true,
    },
  ],
  "farmlink-coldbox": [
    {
      author: "Sadiq Abdullahi",
      authorInitials: "SA",
      body: "Paying per crate per day is the right model. Can farmers book in advance for a full harvest week?",
      createdAt: "2026-09-08T13:00:00.000Z",
      id: "farmlink-1",
    },
  ],
};
