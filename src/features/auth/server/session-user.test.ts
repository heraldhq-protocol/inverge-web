import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(async () => null),
}));

import {
  toPreviewSessionUser,
  toSessionUser,
} from "@/features/auth/server/session-user";

describe("toSessionUser", () => {
  it("projects the identity the shell needs", () => {
    expect(
      toSessionUser({
        creator: { displayName: "Amara Okonkwo", username: "amaraokonkwo" },
        email: "amara@example.test",
        id: "usr_123",
        requiresOnboarding: false,
        role: "USER",
      }),
    ).toEqual({
      displayName: "Amara Okonkwo",
      email: "amara@example.test",
      id: "usr_123",
      mode: "live",
      requiresOnboarding: false,
      username: "amaraokonkwo",
    });
  });

  it("keeps a user whose provider did not supply an email", () => {
    expect(
      toSessionUser({
        creator: { displayName: null, username: "usr_123" },
        email: null,
        id: "usr_123",
        requiresOnboarding: true,
      }),
    ).toEqual({
      displayName: null,
      email: null,
      id: "usr_123",
      mode: "live",
      requiresOnboarding: true,
      username: null,
    });
  });

  it("drops the id fallback the creator projection uses as a username", () => {
    const user = toSessionUser({
      creator: { displayName: "Amara", username: "usr_123" },
      id: "usr_123",
      requiresOnboarding: false,
    });

    expect(user?.username).toBeNull();
  });

  it("drops a handle while onboarding is still incomplete", () => {
    const user = toSessionUser({
      creator: { displayName: "Amara", username: "amara" },
      id: "usr_123",
      requiresOnboarding: true,
    });

    expect(user).toMatchObject({ displayName: "Amara", username: null });
  });

  it("rejects a payload without a stable id", () => {
    expect(toSessionUser({ email: "amara@example.test" })).toBeNull();
    expect(toSessionUser({ id: "" })).toBeNull();
    expect(toSessionUser(null)).toBeNull();
    expect(toSessionUser("usr_123")).toBeNull();
  });

  it("ignores a creator field that is not an object", () => {
    expect(toSessionUser({ creator: "amara", id: "usr_123" })).toEqual({
      displayName: null,
      email: null,
      id: "usr_123",
      mode: "live",
      requiresOnboarding: true,
      username: null,
    });
  });

  it("treats a payload without an onboarding signal as incomplete", () => {
    expect(
      toSessionUser({
        creator: { displayName: "Amara", username: "amara" },
        id: "usr_123",
      })?.requiresOnboarding,
    ).toBe(true);
  });
});

describe("toPreviewSessionUser", () => {
  const subject = "a".repeat(64);

  it("labels a local identity as preview and incomplete without a profile", () => {
    expect(
      toPreviewSessionUser({
        v: 1,
        subject,
        accountType: null,
        contactName: null,
        displayName: null,
        username: null,
      }),
    ).toEqual({
      accountType: null,
      contactName: null,
      displayName: null,
      email: null,
      id: `preview_${subject}`,
      mode: "preview",
      requiresOnboarding: true,
      username: null,
    });
  });

  it("treats a stored preview profile as complete", () => {
    expect(
      toPreviewSessionUser({
        v: 1,
        subject,
        accountType: "individual",
        contactName: null,
        displayName: "Amara",
        username: "amara",
      }),
    ).toMatchObject({
      accountType: "individual",
      displayName: "Amara",
      requiresOnboarding: false,
      username: "amara",
    });
  });

  it("still asks for an account type when an older cookie has none", () => {
    expect(
      toPreviewSessionUser({
        v: 1,
        subject,
        accountType: null,
        contactName: null,
        displayName: "Amara",
        username: "amara",
      }).requiresOnboarding,
    ).toBe(true);
  });

  it("keeps a business contact out of the public fields", () => {
    expect(
      toPreviewSessionUser({
        v: 1,
        subject,
        accountType: "business",
        contactName: "Amara Okonkwo",
        displayName: "Amara Studio",
        username: "amara-studio",
      }),
    ).toMatchObject({
      accountType: "business",
      contactName: "Amara Okonkwo",
      displayName: "Amara Studio",
      requiresOnboarding: false,
    });
  });
});
