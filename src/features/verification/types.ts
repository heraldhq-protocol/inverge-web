/**
 * Verification contract shared by the verification panel, the campaign
 * checklist and the admin review screens. Codes mirror the API's stable
 * machine-readable failures; the UI never derives eligibility itself.
 */

export type AccountType = "INDIVIDUAL" | "BUSINESS";

export type VerificationCaseStatus =
  | "NOT_STARTED"
  | "SESSION_CREATED"
  | "AWAITING_USER"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "DECLINED"
  | "ACTION_REQUIRED"
  | "EXPIRED"
  | "CANCELLED"
  | "ERROR";

export type RiskOutcome = "NOT_ASSESSED" | "CLEAR" | "REVIEW" | "FLAGGED";

export type VerificationErrorCode =
  | "VERIFICATION_REQUIRED"
  | "VERIFICATION_IN_PROGRESS"
  | "VERIFICATION_IN_REVIEW"
  | "VERIFICATION_ACTION_REQUIRED"
  | "VERIFICATION_DECLINED"
  | "VERIFICATION_EXPIRED"
  | "VERIFICATION_PROVIDER_ERROR"
  | "VERIFICATION_COMPLIANCE_HOLD"
  | "VERIFICATION_BUSINESS_PROFILE_REQUIRED"
  | "VERIFICATION_ACCOUNT_TYPE_MISMATCH"
  | "VERIFICATION_ATTEMPTS_EXCEEDED"
  | "VERIFICATION_UNAVAILABLE"
  | "CONTRIBUTION_THRESHOLD_EXCEEDED"
  | "CONTRIBUTION_CAMPAIGN_NOT_FUNDABLE";

export type VerificationCaseView = {
  id: string;
  type: AccountType;
  status: VerificationCaseStatus;
  statusLabel: string;
  providerStatus: string | null;
  risk: RiskOutcome;
  requiresHumanReview: boolean;
  attempt: number;
  submittedAt: string | null;
  decidedAt: string | null;
  lastProviderSyncAt: string | null;
  nextReconcileAt: string | null;
  lastErrorCode: string | null;
  createdAt: string;
};

export type VerificationRequirement = {
  key: string;
  label: string;
  satisfied: boolean;
  detail: string;
};

/** Gate preview for one action; the same shape the API uses to refuse a request. */
export type VerificationEligibility = {
  accountType: AccountType;
  blockers: string[];
  code: VerificationErrorCode | null;
  eligible: boolean;
  nextAction: VerificationState["nextAction"];
  policyVersion: string;
  purpose: "IDEA_VALIDATION" | "CAMPAIGN_CREATOR" | "BACKER_THRESHOLD";
  requirements: VerificationRequirement[];
  state: VerificationCaseStatus;
};

export type VerificationState = {
  accountType: AccountType;
  overall: VerificationCaseStatus;
  overallLabel: string;
  individual: VerificationCaseView | null;
  business: VerificationCaseView | null;
  requirements: VerificationRequirement[];
  blockers: string[];
  nextAction:
    | "start"
    | "resume"
    | "wait"
    | "retry"
    | "contact_support"
    | "resolve_review"
    | "complete_business_profile"
    | "none";
  policyVersion: string;
  identityVerified: boolean;
  fundsCleared: boolean;
  complianceHold: boolean;
  businessRegistered: boolean;
  canStartSession: boolean;
  nextSubject: AccountType | null;
  lastErrorCode: string | null;
};

export type AdminCaseSummary = {
  id: string;
  type: AccountType;
  status: VerificationCaseStatus;
  risk: RiskOutcome;
  requiresHumanReview: boolean;
  lastErrorCode: string | null;
  providerStatus: string | null;
  accountType: AccountType;
  businessName: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string | null };
};

export type AdminQueue = {
  counts: {
    byStatus: Array<{ status: VerificationCaseStatus; count: number }>;
    escalated: number;
    providerErrors: number;
    reviewOpen: number;
  };
  pending: AdminCaseSummary[];
  escalated: AdminCaseSummary[];
  policyVersion: string;
};

export type AdminCaseDetail = {
  case: {
    attempt: number;
    createdAt: string;
    decidedAt: string | null;
    features: string[];
    id: string;
    lastErrorCode: string | null;
    lastErrorMessage: string | null;
    lastProviderSyncAt: string | null;
    nextReconcileAt: string | null;
    provider: string;
    providerSessionId: string;
    providerStatus: string | null;
    purpose: string | null;
    reconcileAttempts: number;
    requiresHumanReview: boolean;
    riskOutcome: RiskOutcome;
    riskReasonCodes: string[];
    status: VerificationCaseStatus;
    submittedAt: string | null;
    type: AccountType;
    updatedAt: string;
  };
  business: {
    id: string;
    legalName: string;
    registrationNumber: string | null;
    country: string | null;
  } | null;
  user: {
    id: string;
    email: string | null;
    role: string;
    accountType: AccountType;
    kycStatus: string;
    amlStatus: string;
  };
  events: Array<{
    id: string;
    eventType: string;
    source: string;
    previousStatus: VerificationCaseStatus | null;
    newStatus: VerificationCaseStatus | null;
    reasonCode: string | null;
    actorId: string | null;
    occurredAt: string;
    createdAt: string;
    metadata: unknown;
  }>;
};
