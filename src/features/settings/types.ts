export type SettingsProfile = {
  displayName: string;
  email: string;
  location: string;
  username: string;
};

export type SignInConnection = {
  actionLabel: string;
  detail: string;
  id: "apple" | "email" | "google";
  label: string;
  status: "connected" | "not-connected" | "verified";
};

export type NotificationPreferenceId =
  | "creator-updates"
  | "discovery-digest"
  | "email-updates"
  | "milestone-reviews";

export type SettingsData = {
  connections: SignInConnection[];
  feed: {
    region: string;
    showPromoted: boolean;
    topics: string[];
  };
  notifications: Record<NotificationPreferenceId, boolean>;
  profile: SettingsProfile;
};
