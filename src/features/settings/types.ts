export type SettingsProfile = {
  avatarUrl: string | null;
  bio: string;
  displayName: string;
  email: string;
  location: string;
  username: string;
};

export type SignInConnection = {
  actionLabel: string;
  detail: string;
  id: "email" | "google";
  label: string;
  status: "connected" | "not-connected" | "verified";
};

export type NotificationPreferenceId =
  | "creator-updates"
  | "discovery-digest"
  | "email-updates"
  | "milestone-reviews";

export type SettingsAccount = {
  accountType: "INDIVIDUAL" | "BUSINESS" | null;
  email: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  memberSince: string | null;
  role: "ADMIN" | "COMPLIANCE_REVIEWER" | "USER" | null;
};

export type SettingsVerification = {
  amlStatus: string | null;
  kycStatus: string | null;
  latestCaseAt: string | null;
  latestCaseStatus: string | null;
};

export type SettingsWallet = {
  connected: boolean;
  embedded: boolean;
  provider: string | null;
};

export type SettingsRequest = {
  createdAt: string;
  id: string;
  status: string;
  type: "ACCOUNT_DELETION" | "DATA_EXPORT";
};

export type EmailVerificationChallenge = {
  attemptsRemaining: number;
  email: string;
  expiresAt: string;
  purpose: "CHANGE" | "SIGNUP";
  resendAvailableAt: string;
};

export type SettingsData = {
  account: SettingsAccount;
  connections: SignInConnection[];
  emailChallenge: EmailVerificationChallenge | null;
  feed: {
    region: string;
    showPromoted: boolean;
    topics: string[];
  };
  notifications: Record<NotificationPreferenceId, boolean>;
  pendingEmail: string | null;
  profile: SettingsProfile;
  requests: SettingsRequest[];
  source: "api" | "preview" | "unavailable";
  verification: SettingsVerification;
  wallet: SettingsWallet;
};

export const emptySettingsData: SettingsData = {
  account: {
    accountType: null,
    email: null,
    emailVerified: false,
    emailVerifiedAt: null,
    memberSince: null,
    role: null,
  },
  connections: [],
  emailChallenge: null,
  feed: {
    region: "global",
    showPromoted: true,
    topics: [],
  },
  notifications: {
    "creator-updates": true,
    "discovery-digest": false,
    "email-updates": true,
    "milestone-reviews": true,
  },
  pendingEmail: null,
  profile: {
    avatarUrl: null,
    bio: "",
    displayName: "",
    email: "",
    location: "",
    username: "",
  },
  requests: [],
  source: "unavailable",
  verification: {
    amlStatus: null,
    kycStatus: null,
    latestCaseAt: null,
    latestCaseStatus: null,
  },
  wallet: {
    connected: false,
    embedded: false,
    provider: null,
  },
};
