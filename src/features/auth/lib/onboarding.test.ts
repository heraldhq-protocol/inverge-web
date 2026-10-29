import { describe, expect, it } from "vitest";

import {
  CREATOR_HOME_PATH,
  DASHBOARD_HOME_PATH,
  EMAIL_VERIFICATION_PATH,
  emailVerificationPath,
  initialStartingPoint,
  postAuthPath,
  postProfilePath,
  PROFILE_ONBOARDING_PATH,
  ROLE_ONBOARDING_PATH,
  safeOnboardingIntent,
  skipStartingPointPath,
  startingPointPath,
} from "@/features/auth/lib/onboarding";

describe("safeOnboardingIntent", () => {
  it("accepts the two supported doors", () => {
    expect(safeOnboardingIntent("general")).toBe("general");
    expect(safeOnboardingIntent("creator")).toBe("creator");
    expect(safeOnboardingIntent(["creator"])).toBe("creator");
  });

  it("falls back to the general flow for anything else", () => {
    for (const value of [
      undefined,
      "",
      "CREATOR",
      "admin",
      "creator ",
      ["admin", "creator"],
    ]) {
      expect(safeOnboardingIntent(value)).toBe("general");
    }
  });
});

describe("postAuthPath", () => {
  it("does not let an unverified email block onboarding or the dashboard", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: false,
        returnPath: "/d/wallet",
      }),
    ).toBe("/d/creator");
    expect(
      postAuthPath({
        intent: "general",
        requiresOnboarding: false,
        returnPath: "/d/settings",
      }),
    ).toBe("/d/settings");
  });

  it("always finishes an incomplete profile first", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: true,
        returnPath: "/d/wallet",
      }),
    ).toBe(PROFILE_ONBOARDING_PATH);
    expect(
      postAuthPath({
        intent: "general",
        requiresOnboarding: true,
        returnPath: "/d/wallet",
      }),
    ).toBe(PROFILE_ONBOARDING_PATH);
  });

  it("opens Creator Studio only after a completed profile", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: false,
        returnPath: "/d/wallet",
      }),
    ).toBe(CREATOR_HOME_PATH);
  });

  it("returns a general visitor to the page they asked for", () => {
    expect(
      postAuthPath({
        intent: "general",
        requiresOnboarding: false,
        returnPath: "/d/wallet",
      }),
    ).toBe("/d/wallet");
  });
});

describe("emailVerificationPath", () => {
  it("uses the bare path when there is no destination or intent to carry", () => {
    expect(
      emailVerificationPath({ intent: "general", returnPath: "/d" }),
    ).toBe(EMAIL_VERIFICATION_PATH);
  });

  it("refuses to carry an off-site return value", () => {
    expect(
      emailVerificationPath({
        intent: "general",
        returnPath: "//evil.test",
      }),
    ).toBe(EMAIL_VERIFICATION_PATH);
  });
});

describe("postProfilePath", () => {
  it("asks every completed profile where to start", () => {
    expect(postProfilePath("general")).toBe(ROLE_ONBOARDING_PATH);
    expect(postProfilePath("creator")).toBe(
      `${ROLE_ONBOARDING_PATH}?intent=creator`,
    );
  });
});

describe("starting-point routing", () => {
  it("pre-selects the build door for creator intent without deciding it", () => {
    expect(initialStartingPoint("creator")).toBe("build");
    expect(initialStartingPoint("general")).toBeNull();
  });

  it("routes a chosen starting point", () => {
    expect(startingPointPath("build")).toBe(CREATOR_HOME_PATH);
    expect(startingPointPath("support")).toBe(DASHBOARD_HOME_PATH);
  });

  it("honours the door the visitor came through when they skip", () => {
    expect(skipStartingPointPath("creator")).toBe(CREATOR_HOME_PATH);
    expect(skipStartingPointPath("general")).toBe(DASHBOARD_HOME_PATH);
  });
});
