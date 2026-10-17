/**
 * Decides whether a naira estimate is relevant to this reader.
 *
 * This is presentation only. It never changes a price, a prize, a payment, or a
 * score — it decides whether an extra line of context is worth drawing.
 */

const NGN_TIMEZONES = new Set(["Africa/Lagos"]);

/** Locales that indicate a Nigerian reader, e.g. `en-NG`, `ig-NG`, `yo-NG`. */
function isNigerianLocale(locale: string): boolean {
  return /(^|-)NG$/i.test(locale.trim().replace("_", "-"));
}

export type LocaleEvidence = {
  timeZone?: string | undefined;
  locale?: string | undefined;
  languages?: readonly string[] | undefined;
};

/**
 * True when the reader's own device signals Nigeria: a Lagos timezone or any
 * Nigerian locale in the `navigator` languages.
 *
 * Deliberately conservative. IP geolocation, a server header, or a saved
 * preference would be better evidence, but none of those exist in this
 * repository, and guessing from an ambiguous signal is worse than staying quiet.
 */
export function shouldShowNgnEstimate(evidence: LocaleEvidence): boolean {
  if (evidence.timeZone && NGN_TIMEZONES.has(evidence.timeZone)) return true;
  if (evidence.locale && isNigerianLocale(evidence.locale)) return true;
  return (evidence.languages ?? []).some(isNigerianLocale);
}

/** Reads the current browser's signals; safe to call only on the client. */
export function browserLocaleEvidence(): LocaleEvidence {
  if (typeof navigator === "undefined") return {};
  const locale =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().locale
      : undefined;
  const timeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;

  return { languages: navigator.languages, locale, timeZone };
}
