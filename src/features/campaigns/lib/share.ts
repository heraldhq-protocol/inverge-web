import type { Campaign } from "@/features/campaigns/types";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Sharing a public campaign.
 *
 * The whole point of this module is that a share either happened or it did not.
 * Three rules shape it:
 *
 * 1. The payload is built here, from the campaign, so every surface shares the
 *    same title, the same sentence, and the canonical URL. `absoluteUrl` reads
 *    the configured site origin, never `window.location`, so a share from a
 *    Vercel preview or a local build still points at the real campaign and not
 *    at a deployment hostname.
 * 2. The browser's own share sheet is used when it exists, and only from the
 *    user's gesture. There is no imitation of an operating-system dialog.
 * 3. A cancelled sheet is a decision, not an error: it is reported as
 *    `cancelled`, no copy is attempted behind the user's back, and no message
 *    claims success. A genuine failure falls through to the clipboard; only a
 *    resolved clipboard write is reported as `copied`.
 *
 * The browser APIs are passed in rather than reached for, so the whole decision
 * table is testable without a DOM.
 */

/** What is handed to the platform share sheet. `url` is always canonical. */
export type CampaignSharePayload = {
  title: string;
  text: string;
  url: string;
};

/**
 * What actually happened.
 *
 * `shared` and `cancelled` describe the share sheet (the platform took over, or
 * the user dismissed it). `copied` is the fallback that ran instead. `failed`
 * means neither route completed, so the caller must offer the link to the user
 * by hand rather than claim a copy.
 */
export type ShareOutcome = "shared" | "cancelled" | "copied" | "failed";

/** The callable browser APIs a share may use. Absent means unsupported here. */
export type ShareDependencies = {
  share?: (request: CampaignSharePayload) => Promise<void>;
  copy?: (text: string) => Promise<void>;
};

/** The canonical public path of a campaign. Depth is fixed; the slug is opaque. */
export function campaignSharePath(slug: string): string {
  return `/campaigns/${slug}`;
}

/** The canonical public URL of a campaign. */
export function campaignShareUrl(slug: string): string {
  return absoluteUrl(campaignSharePath(slug));
}

/**
 * The single share payload for a campaign.
 *
 * The title is the campaign's own title and the text is its own summary: the
 * share sheet is filling in a message on the creator's behalf, so the copy is
 * theirs, not a marketing rewrite.
 */
export function campaignSharePayload(
  campaign: Pick<Campaign, "slug" | "title" | "summary">,
): CampaignSharePayload {
  return {
    text: campaign.summary,
    title: campaign.title,
    url: campaignShareUrl(campaign.slug),
  };
}

/** Whether an error is the platform's "the user dismissed the sheet" signal. */
export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

/**
 * Runs the share, and reports what happened.
 *
 * The share call is evaluated before any `await` suspends, so it still runs
 * inside the caller's user gesture — a browser that requires transient
 * activation to open the sheet will still open it.
 */
export async function shareCampaign(
  payload: CampaignSharePayload,
  dependencies: ShareDependencies,
): Promise<ShareOutcome> {
  const { copy, share } = dependencies;

  if (share) {
    try {
      await share(payload);
      return "shared";
    } catch (error) {
      // The user closed the sheet. Copying now would be doing something they
      // just declined, so stop here.
      if (isAbortError(error)) return "cancelled";
      // Any other failure is a real one: fall through to the copy fallback.
    }
  }

  if (!copy) return "failed";

  try {
    await copy(payload.url);
    return "copied";
  } catch {
    return "failed";
  }
}

/**
 * The browser's own share and clipboard APIs, when this context has them.
 *
 * Read at call time rather than at module load so a server render never touches
 * `navigator`, and so a page that is hydrated before the APIs are polyfilled
 * still picks them up.
 */
export function browserShareDependencies(): ShareDependencies {
  if (typeof navigator === "undefined") return {};

  const dependencies: ShareDependencies = {};

  if (typeof navigator.share === "function") {
    dependencies.share = (request) =>
      navigator.share({
        text: request.text,
        title: request.title,
        url: request.url,
      });
  }

  if (typeof navigator.clipboard?.writeText === "function") {
    const clipboard = navigator.clipboard;
    dependencies.copy = (text) => clipboard.writeText(text);
  }

  return dependencies;
}

/** The live-region message for an outcome. `null` means say nothing. */
export function shareOutcomeMessage(outcome: ShareOutcome): string | null {
  switch (outcome) {
    case "copied":
      return "Link copied to your clipboard.";
    case "failed":
      return "Sharing is not available here. Select the link below to copy it.";
    // The platform showed its own sheet, or the user dismissed it. Either way
    // there is nothing for this page to announce.
    case "shared":
    case "cancelled":
      return null;
  }
}

/** Whether the outcome is one where the user has to take the link by hand. */
export function shareOutcomeRevealsLink(outcome: ShareOutcome): boolean {
  return outcome === "failed";
}
