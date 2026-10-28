import { describe, expect, it } from "vitest";

import {
  normaliseProfileUsername,
  toPublicProfile,
} from "@/features/profile/server/public-profile";

const creator = {
  avatarUrl: "https://images.unsplash.com/photo-1",
  bio: "Building tools for local markets.",
  completedCampaigns: 2,
  displayName: "Amara Okonkwo",
  id: "usr_123",
  ideasPublished: 4,
  identityVerified: true,
  links: [
    { label: "Website", url: "https://amara.example" },
    { label: "Unsafe", url: "javascript:alert(1)" },
  ],
  memberSince: "2025-01-15T00:00:00.000Z",
  tier: "TRUSTED",
  username: "amaraokonkwo",
};

function payload() {
  return {
    creator,
    ideasPublished: [
      {
        id: "idea_1",
        title: "Cold-chain for market traders",
        problem: "Produce spoils before it reaches the market.",
        solution: "Shared cold storage.",
        status: "VALIDATING",
        supporterCount: 12,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    ideasSupported: [
      {
        id: "idea_2",
        title: "Solar irrigation",
        problem: "Diesel pumps are expensive.",
        solution: "Pay-as-you-go solar pumps.",
        status: "THRESHOLD_MET",
        supporterCount: 44,
        createdAt: "2026-02-01T00:00:00.000Z",
        creator: {
          id: "usr_456",
          username: "solargrow",
          displayName: "Solar Grow",
        },
      },
    ],
    email: "amara@example.test",
    providerUserId: "provider_secret",
  };
}

describe("normaliseProfileUsername", () => {
  it("accepts a pasted handle and lowercases it", () => {
    expect(normaliseProfileUsername(" @AmaraOkonkwo ")).toBe("amaraokonkwo");
  });

  it("rejects empty, too-short and path-like values", () => {
    expect(normaliseProfileUsername("")).toBeNull();
    expect(normaliseProfileUsername("ab")).toBeNull();
    expect(normaliseProfileUsername("amara/other")).toBeNull();
    expect(normaliseProfileUsername("amara?next=/d")).toBeNull();
  });
});

describe("toPublicProfile", () => {
  it("projects only the public allowlist", () => {
    const profile = toPublicProfile(payload(), "amaraokonkwo");

    expect(profile).toMatchObject({
      completedCampaigns: 2,
      displayName: "Amara Okonkwo",
      ideasPublished: 1,
      identityVerified: true,
      tier: "TRUSTED",
      username: "amaraokonkwo",
    });
    expect(profile).not.toHaveProperty("email");
    expect(profile).not.toHaveProperty("providerUserId");
  });

  it("drops unsafe profile links and non-allowlisted avatars", () => {
    const profile = toPublicProfile(
      {
        ...payload(),
        creator: {
          ...creator,
          avatarUrl: "https://evil.test/avatar.png",
          links: [{ label: "Unsafe", url: "javascript:alert(1)" }],
        },
      },
      "amaraokonkwo",
    );

    expect(profile?.avatarUrl).toBeNull();
    expect(profile?.links).toEqual([]);
  });

  it("accepts a Google provider avatar", () => {
    const profile = toPublicProfile(
      {
        ...payload(),
        creator: {
          ...creator,
          avatarUrl: "https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c",
        },
      },
      "amaraokonkwo",
    );

    expect(profile?.avatarUrl).toBe(
      "https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c",
    );
  });

  it("only accepts an avatar path the image config serves", () => {
    const profile = toPublicProfile(
      {
        ...payload(),
        creator: {
          ...creator,
          avatarUrl: "https://images.unsplash.com/avatar.png",
        },
      },
      "amaraokonkwo",
    );

    expect(profile?.avatarUrl).toBeNull();
  });

  it("does not serve an internal id or a derived slug as a username", () => {
    expect(
      toPublicProfile(
        {
          ...payload(),
          creator: { ...creator, username: "usr_123" },
        },
        "usr_123",
      ),
    ).toBeNull();
  });

  it("rejects a payload resolved for a different handle", () => {
    expect(toPublicProfile(payload(), "someoneelse")).toBeNull();
  });

  it("maps published and supported ideas without leaking account fields", () => {
    const profile = toPublicProfile(payload(), "amaraokonkwo");

    expect(profile?.ideas).toEqual([
      {
        href: "/ideas/idea_1",
        id: "idea_1",
        publishedAt: "2026-01-01T00:00:00.000Z",
        status: "VALIDATING",
        summary: "Produce spoils before it reaches the market.",
        supporters: 12,
        title: "Cold-chain for market traders",
      },
    ]);
    expect(profile?.supportedIdeas[0]?.creator).toEqual({
      displayName: "Solar Grow",
      username: "solargrow",
    });
  });
});
