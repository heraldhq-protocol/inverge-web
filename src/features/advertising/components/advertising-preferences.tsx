"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";

import { Container } from "@/features/marketing/components/container";
import {
  ESSENTIAL_ONLY_CONSENT,
  type AdConsentDraft,
} from "@/features/advertising/lib/consent";
import {
  getAdConsentSnapshot,
  getServerAdConsentSnapshot,
  saveAdConsent,
  subscribeAdConsent,
} from "@/features/advertising/lib/consent-store";

/**
 * Advertising preference controls.
 *
 * First-party labelled placements are not a choice: they are part of the page.
 * The two switches here cover the optional purposes only. A first visit shows
 * both off, and saving is explicit; nothing is written merely by opening this
 * page.
 */
export function AdvertisingPreferences() {
  const record = useSyncExternalStore(
    subscribeAdConsent,
    getAdConsentSnapshot,
    getServerAdConsentSnapshot,
  );
  const [draft, setDraft] = useState<AdConsentDraft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const value = draft ?? record ?? ESSENTIAL_ONLY_CONSENT;

  function update(patch: Partial<AdConsentDraft>) {
    setDraft({ ...value, ...patch });
    setNotice(null);
  }

  function save(next: AdConsentDraft, message: string) {
    const saved = saveAdConsent(next);
    setDraft(null);
    setNotice(
      `${message} Saved on this device at ${new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(new Date(saved.updatedAt))} UTC.`,
    );
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save(value, "Advertising choices updated.");
        }}
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <fieldset>
          <legend className="text-lg font-bold tracking-[-0.025em] text-ink">
            Optional advertising purposes
          </legend>
          <p className="mt-1 text-sm leading-6 text-muted">
            These choices apply to this browser. They do not change which
            Inverge content you see, and refusing them never hides a page or a
            campaign.
          </p>

          <div className="mt-5 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand/35">
              <input
                type="checkbox"
                checked={value.measurement}
                onChange={(event) =>
                  update({ measurement: event.target.checked })
                }
                aria-describedby="ad-measurement-help"
                className="mt-0.5 size-4 shrink-0 accent-[var(--inverge-brand)]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Measure paid placements
                </span>
                <span
                  id="ad-measurement-help"
                  className="mt-1 block text-sm leading-6 text-muted"
                >
                  Record that a labelled placement was seen, clicked, dismissed,
                  or opened. Uses a random per-tab identifier, never your
                  account, IP address, or user agent. Off by default.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand/35">
              <input
                type="checkbox"
                checked={value.personalisedAds}
                onChange={(event) =>
                  update({ personalisedAds: event.target.checked })
                }
                aria-describedby="ad-personalisation-help"
                className="mt-0.5 size-4 shrink-0 accent-[var(--inverge-brand)]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Allow third-party personalised advertising
                </span>
                <span
                  id="ad-personalisation-help"
                  className="mt-1 block text-sm leading-6 text-muted"
                >
                  Allow an isolated advertising vendor on editorial pages. The
                  vendor may use cookies or device identifiers under its own
                  policy. Off by default, and no vendor is configured in this
                  build.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Save choices
          </button>
          <button
            type="button"
            onClick={() =>
              save(ESSENTIAL_ONLY_CONSENT, "Optional advertising turned off.")
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Turn off optional advertising
          </button>
        </div>

        <p
          role="status"
          className="mt-4 rounded-xl bg-canvas px-3.5 py-2.5 text-sm leading-6 text-muted"
        >
          {notice ??
            (record
              ? `Last saved on this device: ${new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                  year: "numeric",
                }).format(new Date(record.updatedAt))}.`
              : "No optional advertising choice has been saved on this device.")}
        </p>
      </form>

      <section
        aria-labelledby="advertising-rights"
        className="mt-8 space-y-3 text-sm leading-6 text-muted"
      >
        <h2
          id="advertising-rights"
          className="text-base font-bold tracking-[-0.02em] text-ink"
        >
          What these choices do not cover
        </h2>
        <p>
          Inverge may still show a clearly labelled first-party sponsorship as
          part of a page. Those placements carry a Sponsored label, never change
          organic ranking, validation signals, or funding figures, and are
          excluded from campaign analytics.
        </p>
        <p>
          Read the{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand-strong underline-offset-4 hover:underline"
          >
            privacy notice
          </Link>{" "}
          for retention, lawful bases, and how to exercise your rights.
        </p>
      </section>
    </Container>
  );
}
