/**
 * Onboarding intent is a routing hint, never a permission.
 *
 * It records which door the visitor came through ("Start an idea" versus a
 * general sign-up) so the post-auth flow can resume in the right place. The
 * backend remains the only authority on role, creator status, KYC and
 * capabilities; nothing here is sent as proof of any of those.
 */
export const ONBOARDING_INTENTS = ["general", "creator"] as const;

export type OnboardingIntent = (typeof ONBOARDING_INTENTS)[number];

export const DEFAULT_ONBOARDING_INTENT: OnboardingIntent = "general";

export const PROFILE_ONBOARDING_PATH = "/onboarding/profile";
export const ROLE_ONBOARDING_PATH = "/onboarding/role";
export const DASHBOARD_HOME_PATH = "/d";

/**
 * Email confirmation. It is a public auth screen, not onboarding: the account
 * already exists, but authored actions stay closed until the address is proven.
 */
export const EMAIL_VERIFICATION_PATH = "/auth/email";

/** Creator Studio. Reached after the shared onboarding asks where to start. */
export const CREATOR_HOME_PATH = "/d/creator";

/**
 * Who the account belongs to. Asked as part of the shared profile step so a
 * business can present its trading name instead of a person's name.
 *
 * `individual` and `business` are account shapes, not roles: neither grants
 * creator status, and a business account can still back ideas.
 */
export const ACCOUNT_TYPES = ["individual", "business"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export function isAccountType(value: unknown): value is AccountType {
  return value === "individual" || value === "business";
}

/** The two answers to "What would you like to do first?". */
export type StartingPoint = "build" | "support";

/**
 * Creator intent pre-selects the build door but never answers the question for
 * the visitor. It remains a routing hint that they can change in one click.
 */
export function initialStartingPoint(
  intent: OnboardingIntent,
): StartingPoint | null {
  return intent === "creator" ? "build" : null;
}

export function startingPointPath(startingPoint: StartingPoint): string {
  return startingPoint === "build" ? CREATOR_HOME_PATH : DASHBOARD_HOME_PATH;
}

/**
 * Skipping the question still honours the door the visitor came through: a
 * creator CTA lands in Creator Studio, a general sign-up in the dashboard.
 */
export function skipStartingPointPath(intent: OnboardingIntent): string {
  return intent === "creator" ? CREATOR_HOME_PATH : DASHBOARD_HOME_PATH;
}

/**
 * Collapses an untrusted query value onto the closed set of intents. An unknown
 * value is the general flow, never a creator flow, so a crafted URL cannot make
 * the app claim creator status.
 */
export function safeOnboardingIntent(
  value: string | string[] | undefined,
): OnboardingIntent {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "creator" ? "creator" : DEFAULT_ONBOARDING_INTENT;
}

export function isOnboardingIntent(value: unknown): value is OnboardingIntent {
  return value === "creator" || value === "general";
}

type PostAuthPathInput = {
  requiresOnboarding: boolean;
  intent: OnboardingIntent;
  returnPath: string;
};

/**
 * The email-confirmation URL, carrying the destination and door so the flow
 * resumes in the right place after the code is accepted.
 */
export function emailVerificationPath({
  intent,
  returnPath,
}: {
  intent: OnboardingIntent;
  returnPath: string;
}): string {
  const params = new URLSearchParams();
  const safeReturn =
    returnPath.startsWith("/") &&
    !returnPath.startsWith("//") &&
    !returnPath.includes("\\")
      ? returnPath
      : DASHBOARD_HOME_PATH;

  if (safeReturn !== DASHBOARD_HOME_PATH) params.set("next", safeReturn);
  if (intent === "creator") params.set("intent", "creator");

  const query = params.toString();
  return query
    ? `${EMAIL_VERIFICATION_PATH}?${query}`
    : EMAIL_VERIFICATION_PATH;
}

/**
 * Where a visitor goes immediately after the session exchange.
 *
 * Email confirmation is a non-blocking account task: it is prompted in the app
 * shell and settings, but it never stands between sign-in and the dashboard,
 * onboarding, or supporting an idea. Authored actions re-check it server-side.
 */
export function postAuthPath({
  intent,
  requiresOnboarding,
  returnPath,
}: PostAuthPathInput): string {
  if (requiresOnboarding) return PROFILE_ONBOARDING_PATH;
  if (intent === "creator") return CREATOR_HOME_PATH;
  return returnPath;
}

/**
 * Where the shared profile step sends the visitor once the API has stored it.
 *
 * Every completed profile sees the starting-point question, because it is the
 * same onboarding for both doors. Creator intent travels in the query string so
 * the question can pre-select "Build & validate" without answering it for the
 * visitor.
 */
export function postProfilePath(intent: OnboardingIntent): string {
  return intent === "creator"
    ? `${ROLE_ONBOARDING_PATH}?intent=creator`
    : ROLE_ONBOARDING_PATH;
}
