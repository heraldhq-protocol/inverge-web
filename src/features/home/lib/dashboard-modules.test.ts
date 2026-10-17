import { describe, expect, it } from "vitest";

import {
  deriveDashboardModules,
  isNewViewer,
} from "@/features/home/lib/dashboard-modules";

const noCapabilities = {
  capabilities: {
    creator: false,
    ideathonParticipant: false,
    programmeOrganizer: false,
  },
};

const creator = {
  capabilities: {
    creator: true,
    ideathonParticipant: false,
    programmeOrganizer: false,
  },
};

describe("deriveDashboardModules", () => {
  it("invites a new viewer to start an idea and join an ideathon", () => {
    expect(
      deriveDashboardModules(noCapabilities, {
        ownedIdeaCount: 0,
        previewEligible: true,
      }),
    ).toEqual({
      creatorCallout: "start",
      ideathons: "join",
      organizerEntry: false,
    });
  });

  it("sends a creator back to work instead of an onboarding pitch", () => {
    expect(
      deriveDashboardModules(creator, {
        ownedIdeaCount: 4,
        previewEligible: true,
      }).creatorCallout,
    ).toBe("continue");
  });

  it("only shows organiser tools when the server capability allows it", () => {
    const organizer = {
      capabilities: {
        creator: true,
        ideathonParticipant: false,
        programmeOrganizer: true,
      },
    };

    expect(
      deriveDashboardModules(organizer, {
        ownedIdeaCount: 4,
        previewEligible: true,
      }).organizerEntry,
    ).toBe(true);
    expect(
      deriveDashboardModules(organizer, {
        ownedIdeaCount: 4,
        previewEligible: false,
      }).organizerEntry,
    ).toBe(false);
  });

  it("marks confirmed ideathon participation as participating", () => {
    const participant = {
      capabilities: {
        creator: false,
        ideathonParticipant: true,
        programmeOrganizer: false,
      },
    };

    expect(
      deriveDashboardModules(participant, {
        ownedIdeaCount: 0,
        previewEligible: true,
      }).ideathons,
    ).toBe("participating");
  });
});

describe("isNewViewer", () => {
  it("treats a viewer with no signals and no ideas as new", () => {
    expect(
      isNewViewer({
        feedbackGiven: 0,
        ownedIdeas: 0,
        prePledges: 0,
        supportedIdeas: 0,
      }),
    ).toBe(true);
  });

  it("does not treat a viewer with any activity as new", () => {
    expect(
      isNewViewer({
        feedbackGiven: 0,
        ownedIdeas: 0,
        prePledges: 1,
        supportedIdeas: 0,
      }),
    ).toBe(false);
  });
});
