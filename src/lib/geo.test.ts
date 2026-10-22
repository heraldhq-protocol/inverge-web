import { describe, expect, it } from "vitest";

import { shouldShowNgnEstimate } from "@/lib/geo";

describe("shouldShowNgnEstimate", () => {
  it("shows the estimate for a Lagos timezone", () => {
    expect(shouldShowNgnEstimate({ timeZone: "Africa/Lagos" })).toBe(true);
  });

  it("shows the estimate for a Nigerian locale", () => {
    expect(shouldShowNgnEstimate({ locale: "en-NG" })).toBe(true);
    expect(shouldShowNgnEstimate({ locale: "ig_NG" })).toBe(true);
  });

  it("shows the estimate when any browser language is Nigerian", () => {
    expect(shouldShowNgnEstimate({ languages: ["en-GB", "yo-NG"] })).toBe(true);
  });

  it("stays quiet for an unrelated locale and timezone", () => {
    expect(
      shouldShowNgnEstimate({
        languages: ["en-GB", "fr-FR"],
        locale: "en-GB",
        timeZone: "Europe/London",
      }),
    ).toBe(false);
  });

  it("stays quiet when there is no evidence at all", () => {
    expect(shouldShowNgnEstimate({})).toBe(false);
  });

  it("does not mistake a similar country code for Nigeria", () => {
    // `en-NG` is Nigeria; `en-NZ`, `no-NO`, and `en-GH` are not.
    expect(shouldShowNgnEstimate({ locale: "en-NZ" })).toBe(false);
    expect(shouldShowNgnEstimate({ locale: "no-NO" })).toBe(false);
    expect(shouldShowNgnEstimate({ locale: "en-GH" })).toBe(false);
  });
});
