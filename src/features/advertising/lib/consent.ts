/**
 * Advertising consent.
 *
 * First-party, labelled placements are part of the page and need no choice. Two
 * optional things do: measuring whether a placement was seen or used, and
 * loading a third-party vendor that can personalise advertising. They are
 * separate decisions because a reader can reasonably allow the first and refuse
 * the second.
 *
 * Nothing is pre-selected. An unreadable, older, or partially written record
 * fails closed: no measurement, no personalisation.
 */

export const AD_CONSENT_STORAGE_KEY = "inverge:advertising-consent:v2";

export type AdConsentDraft = {
  /** First-party impression and click measurement. Off by default. */
  measurement: boolean;
  /** Third-party personalised advertising. Off by default. */
  personalisedAds: boolean;
};

export type AdConsentRecord = AdConsentDraft & {
  updatedAt: string;
  version: 2;
};

export const ESSENTIAL_ONLY_CONSENT: AdConsentDraft = {
  measurement: false,
  personalisedAds: false,
};

export function parseAdConsent(raw: string | null): AdConsentRecord | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (
      record.version !== 2 ||
      typeof record.measurement !== "boolean" ||
      typeof record.personalisedAds !== "boolean" ||
      typeof record.updatedAt !== "string" ||
      Number.isNaN(Date.parse(record.updatedAt))
    ) {
      return null;
    }

    return {
      measurement: record.measurement,
      personalisedAds: record.personalisedAds,
      updatedAt: record.updatedAt,
      version: 2,
    };
  } catch {
    return null;
  }
}

export function consentAllowsMeasurement(
  record: AdConsentRecord | null,
): boolean {
  return record?.measurement === true;
}

export function consentAllowsPersonalisedAds(
  record: AdConsentRecord | null,
): boolean {
  return record?.personalisedAds === true;
}

export function createAdConsentRecord(
  draft: AdConsentDraft,
  at: string,
): AdConsentRecord {
  return {
    measurement: draft.measurement,
    personalisedAds: draft.personalisedAds,
    updatedAt: at,
    version: 2,
  };
}

/**
 * Whether a third-party unit may be placed at all.
 *
 * The provider needs both identifiers and an explicit personalisation choice.
 * This stays a pure rule so the component and its test cannot disagree.
 */
export function shouldRenderThirdPartyAd(input: {
  clientId: string | undefined;
  consent: AdConsentRecord | null;
  slotId: string | undefined;
}): boolean {
  return (
    Boolean(input.clientId && input.slotId) &&
    consentAllowsPersonalisedAds(input.consent)
  );
}
