import type { SettingsData } from "@/features/settings/types";

export const settingsPreviewData: SettingsData = {
  profile: {
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
    {
      id: "apple",
      label: "Apple",
      detail: "Not connected",
      status: "not-connected",
      actionLabel: "Connect",
    },
  ],
  feed: {
    topics: ["technology", "agriculture", "clean-energy", "creative"],
    region: "west-africa",
    showPromoted: true,
  },
  notifications: {
    "email-updates": true,
    "milestone-reviews": true,
    "creator-updates": true,
    "discovery-digest": false,
  },
};
