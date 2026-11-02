import type { SettingsData } from "@/features/settings/types";

export const settingsPreviewData: SettingsData = {
  source: "preview",
  account: {
    accountType: "INDIVIDUAL",
    email: "amara@example.com",
    emailVerified: true,
    emailVerifiedAt: "2026-09-14T10:30:00.000Z",
    memberSince: "2026-08-02T09:00:00.000Z",
    role: "USER",
  },
  profile: {
    avatarUrl: null,
    bio: "",
    displayName: "Amara Okonkwo",
    email: "amara@example.com",
    location: "Lagos, Nigeria",
    username: "amaraokonkwo",
  },
  connections: [
    {
      id: "email",
      label: "Email address",
      detail: "amara@example.com",
      status: "verified",
      actionLabel: "Change",
    },
    {
      id: "google",
      label: "Google",
      detail: "Connected",
      status: "connected",
      actionLabel: "Manage",
    },
  ],
  feed: {
    topics: ["technology", "agritech", "cleantech", "art"],
    region: "west-africa",
    showPromoted: true,
  },
  notifications: {
    "email-updates": true,
    "milestone-reviews": true,
    "creator-updates": true,
    "discovery-digest": false,
  },
  verification: {
    amlStatus: "CLEAR",
    kycStatus: "VERIFIED",
    latestCaseAt: "2026-09-15T12:00:00.000Z",
    latestCaseStatus: "APPROVED",
  },
  wallet: {
    connected: false,
    embedded: false,
    provider: null,
  },
  requests: [],
  emailChallenge: null,
  pendingEmail: null,
};
