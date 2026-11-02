import { describe, expect, it } from "vitest";

import { mapApiSettings } from "@/features/settings/server/settings";

const payload = {
  account: {
    email: "amara@example.test",
    emailVerified: true,
    emailVerifiedAt: "2026-09-14T10:30:00.000Z",
    accountType: "INDIVIDUAL",
    role: "USER",
    memberSince: "2026-08-02T09:00:00.000Z",
  },
  profile: {
    username: "amara",
    displayName: "Amara Okonkwo",
    bio: null,
    location: "Lagos, Nigeria",
    avatarUrl: null,
    links: [],
  },
  feed: {
    region: "west-africa",
    showPromoted: false,
    topics: ["technology", "agritech"],
  },
  notifications: {
    emailUpdates: true,
    milestoneReviews: true,
    creatorUpdates: false,
    discoveryDigest: false,
  },
  verification: {
    kycStatus: "VERIFIED",
    amlStatus: "CLEAR",
    latestCaseStatus: "APPROVED",
    latestCaseAt: "2026-09-15T12:00:00.000Z",
  },
  wallet: {
    connected: true,
    provider: "web3auth",
    embedded: true,
  },
  requests: [
    {
      id: "request-1",
      type: "DATA_EXPORT",
      status: "PENDING",
      createdAt: "2026-10-01T00:00:00.000Z",
    },
  ],
  emailChallenge: null,
  pendingEmail: null,
};

describe("mapApiSettings", () => {
  it("maps the API aggregate without borrowing sample values", () => {
    const view = mapApiSettings(payload);

    expect(view?.source).toBe("api");
    expect(view?.account.emailVerified).toBe(true);
    expect(view?.feed).toEqual({
      region: "west-africa",
      showPromoted: false,
      topics: ["technology", "agritech"],
    });
    expect(view?.notifications["creator-updates"]).toBe(false);
    expect(view?.wallet.connected).toBe(true);
    expect(view?.requests[0]?.type).toBe("DATA_EXPORT");
  });

  it("rejects a non-object payload", () => {
    expect(mapApiSettings(null)).toBeNull();
    expect(mapApiSettings("no")).toBeNull();
  });
});
