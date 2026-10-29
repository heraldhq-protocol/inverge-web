import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(async () => null),
}));

import {
  apiBaseUrl,
  toPreviewSessionUser,
  toSessionUser,
} from "@/features/auth/server/session-user";

describe("apiBaseUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("appends the API version to an origin", () => {
    vi.stubEnv("INVERGE_API_URL", "http://127.0.0.1:3001");

    expect(apiBaseUrl()).toBe("http://127.0.0.1:3001/api/v1");
  });

  it("tolerates a trailing slash on the origin", () => {
    vi.stubEnv("INVERGE_API_URL", "http://127.0.0.1:3001/");

    expect(apiBaseUrl()).toBe("http://127.0.0.1:3001/api/v1");
  });

  it("does not double the prefix when the base is already versioned", () => {
    vi.stubEnv("INVERGE_API_URL", "http://127.0.0.1:3001/api/v1/");

    expect(apiBaseUrl()).toBe("http://127.0.0.1:3001/api/v1");
  });

  it("reports a missing configuration instead of guessing a port", () => {
    vi.stubEnv("INVERGE_API_URL", "   ");

    expect(apiBaseUrl()).toBeNull();
  });
});

describe("toSessionUser", () => {
  it("projects the identity the shell needs", () => {
    expect(
      toSessionUser({
        creator: { displayName: "Amara Okonkwo", username: "amaraokonkwo" },
        email: "amara@example.test",
        emailVerified: true,
        id: "usr_123",
        requiresEmailVerification: false,
        requiresOnboarding: false,
        role: "USER",
      }),
    ).toEqual({
      avatarUrl: null,
      displayName: "Amara Okonkwo",
      email: "amara@example.test",
      emailVerified: true,
      id: "usr_123",
      mode: "live",
      requiresEmailVerification: false,
      requiresOnboarding: false,
      role: "USER",
      username: "amaraokonkwo",
    });
  });

  it("keeps a user whose provider did not supply an email", () => {
    expect(
      toSessionUser({
        creator: { displayName: null, username: "usr_123" },
        email: null,
        id: "usr_123",
        requiresEmailVerification: true,
        requiresOnboarding: true,
      }),
    ).toEqual({
      avatarUrl: null,
      displayName: null,
      email: null,
      emailVerified: false,
      id: "usr_123",
      mode: "live",
      requiresEmailVerification: true,
      requiresOnboarding: true,
      role: "USER",
      username: null,
    });
  });

  it("accepts an allowlisted provider avatar", () => {
    const user = toSessionUser({
      creator: {
        avatarUrl: "https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c",
        displayName: "Amara",
        username: "amaraokonkwo",
      },
      id: "usr_123",
      requiresOnboarding: false,
    });

    expect(user?.avatarUrl).toBe(
      "https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c",
    );
  });

  it("drops an avatar outside the public image allowlist", () => {
    const user = toSessionUser({
      creator: {
        avatarUrl: "https://evil.test/avatar.png",
        displayName: "Amara",
        username: "amaraokonkwo",
      },
      id: "usr_123",
      requiresOnboarding: false,
    });

    expect(user?.avatarUrl).toBeNull();
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
      avatarUrl: null,
      displayName: null,
      email: null,
      emailVerified: false,
      id: "usr_123",
      mode: "live",
      requiresEmailVerification: false,
      requiresOnboarding: true,
      role: "USER",
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

  it("keeps the API role available to server-side gates", () => {
    expect(toSessionUser({ id: "usr_123", role: "ADMIN" })?.role).toBe("ADMIN");
    expect(
      toSessionUser({ id: "usr_123", role: "COMPLIANCE_REVIEWER" })?.role,
    ).toBe("COMPLIANCE_REVIEWER");
  });

  it("defaults an unknown or absent role to USER", () => {
    expect(toSessionUser({ id: "usr_123" })?.role).toBe("USER");
    expect(toSessionUser({ id: "usr_123", role: "SUPERUSER" })?.role).toBe(
      "USER",
    );
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
      avatarUrl: null,
      displayName: null,
      email: null,
      emailVerified: false,
      id: `preview_${subject}`,
      mode: "preview",
      requiresEmailVerification: false,
      requiresOnboarding: true,
      role: "USER",
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
