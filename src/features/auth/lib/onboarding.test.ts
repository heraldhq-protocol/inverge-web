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
        returnPath: DASHBOARD_HOME_PATH,
      }),
    ).toBe(CREATOR_HOME_PATH);
    expect(
      postAuthPath({
        intent: "general",
        requiresOnboarding: false,
        returnPath: "/d/settings",
      }),
    ).toBe("/d/settings");
  });

  it("keeps creator intent from replacing a specific destination", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: false,
        returnPath: "/d/wallet",
      }),
    ).toBe("/d/wallet");
  });

  it("finishes an incomplete profile first without losing the destination", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: true,
        returnPath: "/d/wallet",
      }),
    ).toBe(`${PROFILE_ONBOARDING_PATH}?next=%2Fd%2Fwallet`);
    expect(
      postAuthPath({
        intent: "general",
        requiresOnboarding: true,
        returnPath: "/ideas/idea-1?compose=1",
      }),
    ).toBe(`${PROFILE_ONBOARDING_PATH}?next=%2Fideas%2Fidea-1%3Fcompose%3D1`);
  });

  it("opens Creator Studio when creator intent has no specific destination", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: false,
        returnPath: DASHBOARD_HOME_PATH,
      }),
    ).toBe(CREATOR_HOME_PATH);
  });

  it("returns a creator to the page they explicitly asked for", () => {
    expect(
      postAuthPath({
        intent: "creator",
        requiresOnboarding: false,
        returnPath: "/campaigns/community-power?tab=discussion",
      }),
    ).toBe("/campaigns/community-power?tab=discussion");
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

  it("carries the original destination into the starting-point question", () => {
    expect(postProfilePath("general", "/campaigns/c?tab=discussion")).toBe(
      `${ROLE_ONBOARDING_PATH}?next=%2Fcampaigns%2Fc%3Ftab%3Ddiscussion`,
    );
    expect(postProfilePath("creator", "/ideas/i?compose=1")).toBe(
      `${ROLE_ONBOARDING_PATH}?intent=creator&next=%2Fideas%2Fi%3Fcompose%3D1`,
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
