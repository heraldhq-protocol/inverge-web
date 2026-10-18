import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import { MAX_HERO_MEDIA } from "@/features/campaigns/lib/media";
import {
  campaignWizardSteps,
  createDraftMedia,
  createDraftMilestone,
  draftFromCampaign,
  emptyCampaignDraft,
  toCampaignMedia,
  validateCampaignStep,
  type CampaignDraft,
  type DraftMedia,
} from "@/features/campaigns/lib/wizard";

function draftWith(media: Partial<CampaignDraft>): CampaignDraft {
  return { ...emptyCampaignDraft, ...media };
}

function heroItem(overrides: Partial<DraftMedia> = {}): DraftMedia {
  return {
    alt: "",
    caption: "",
    id: "hero-1",
    kind: "image",
    posterInput: "",
    srcInput: "",
    ...overrides,
  };
}

describe("campaignWizardSteps", () => {
  it("places Media directly after the campaign basics", () => {
    expect(campaignWizardSteps.map((step) => step.id)).toEqual([
      "basics",
      "media",
      "funding",
      "milestones",
      "terms",
      "review",
    ]);
  });
});

describe("createDraftMedia", () => {
  it("starts empty, defaults to a photo, and gives every item its own id", () => {
    const photo = createDraftMedia();
    const video = createDraftMedia("video");

    expect(photo).toMatchObject({ alt: "", kind: "image", srcInput: "" });
    expect(video.kind).toBe("video");
    expect(photo.id).not.toBe(video.id);
  });
});

describe("validateCampaignStep for media", () => {
  it("accepts an empty gallery, because a campaign falls back to its cover", () => {
    expect(validateCampaignStep(emptyCampaignDraft, "media")).toEqual([]);
  });

  it("accepts a described photo and a described hosted video", () => {
    const draft = draftWith({
      heroMedia: [
        heroItem({
          alt: "A solar array beside a water tank",
          srcInput: "https://images.example.com/array.jpg",
        }),
        heroItem({
          alt: "A site walkthrough",
          id: "hero-2",
          kind: "video",
          srcInput: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        }),
      ],
    });

    expect(validateCampaignStep(draft, "media")).toEqual([]);
  });

  it("reports a source that cannot be played, under that item's field", () => {
    const draft = draftWith({
      heroMedia: [
        heroItem({
          alt: "A description long enough to pass",
          kind: "video",
          srcInput: "https://example.com/not-a-video",
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("heroMedia.hero-1");
    expect(issues[0]?.message).toContain("YouTube");
  });

  it("requires a description long enough to be read aloud", () => {
    const draft = draftWith({
      heroMedia: [
        heroItem({
          alt: "Short",
          srcInput: "https://images.example.com/array.jpg",
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("screen reader");
  });

  it("rejects a poster that is not an image source", () => {
    const draft = draftWith({
      storyMedia: [
        heroItem({
          alt: "A site walkthrough",
          id: "story-1",
          kind: "video",
          posterInput: "javascript:alert(1)",
          srcInput: "https://vimeo.com/76979871",
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("storyMedia.story-1");
    expect(issues[0]?.message).toContain("poster");
  });

  it("caps the gallery, reporting the limit against the list", () => {
    const draft = draftWith({
      heroMedia: Array.from({ length: MAX_HERO_MEDIA + 1 }, (_, index) =>
        heroItem({
          alt: `A described photo number ${index + 1}`,
          id: `hero-${index + 1}`,
          srcInput: "https://images.example.com/array.jpg",
        }),
      ),
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("heroMedia");
  });
});

describe("validateCampaignStep for terms", () => {
  function termsDraft(workingCapitalPercent: string): CampaignDraft {
    return {
      ...emptyCampaignDraft,
      eligibility: "Open to backers anywhere Inverge operates.",
      failurePlan: "The contribution becomes refundable in full.",
      milestones: [createDraftMilestone("20"), createDraftMilestone("80")],
      risks:
        "Supplier lead times can move, so the plan dates the order rather than the delivery.",
      workingCapitalPercent,
    };
  }

  it("accepts a share inside the published range", () => {
    expect(validateCampaignStep(termsDraft("20"), "terms")).toEqual([]);
  });

  it("rejects a share below the floor", () => {
    const issues = validateCampaignStep(termsDraft("10"), "terms");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("workingCapitalPercent");
    expect(issues[0]?.message).toContain("15%");
  });

  it("rejects a share above the ceiling", () => {
    const issues = validateCampaignStep(termsDraft("30"), "terms");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("25%");
  });

  it("requires a choice when nothing is selected", () => {
    const issues = validateCampaignStep(termsDraft(""), "terms");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toBe(
      "Choose the share released as the first tranche.",
    );
  });

  it("rejects a share that is inside the range but above milestone one", () => {
    const issues = validateCampaignStep(termsDraft("25"), "terms");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("milestone one");
  });
});

describe("toCampaignMedia", () => {
  it("keeps a valid photo and nulls a blank caption", () => {
    const media = toCampaignMedia([
      heroItem({
        alt: "A solar array beside a water tank",
        caption: "   ",
        srcInput: "/images/ideas/sungrid-community-power.jpg",
      }),
    ]);

    expect(media).toEqual([
      {
        alt: "A solar array beside a water tank",
        caption: null,
        id: "hero-1",
        kind: "image",
        src: "/images/ideas/sungrid-community-power.jpg",
      },
    ]);
  });

  it("keeps a hosted video with its poster and drops the source string", () => {
    const media = toCampaignMedia([
      heroItem({
        alt: "A site walkthrough",
        kind: "video",
        posterInput: "https://images.example.com/poster.jpg",
        srcInput: "https://youtu.be/dQw4w9WgXcQ",
      }),
    ]);

    expect(media).toEqual([
      {
        alt: "A site walkthrough",
        caption: null,
        id: "hero-1",
        kind: "video",
        poster: "https://images.example.com/poster.jpg",
        source: { kind: "youtube", videoId: "dQw4w9WgXcQ" },
      },
    ]);
  });

  it("drops an item with no description rather than publishing an undescribed photo", () => {
    const media = toCampaignMedia([
      heroItem({ srcInput: "https://images.example.com/array.jpg" }),
    ]);

    expect(media).toEqual([]);
  });

  it("drops an item whose source does not parse", () => {
    const media = toCampaignMedia([
      heroItem({
        alt: "A description long enough to pass",
        srcInput: "javascript:alert(1)",
      }),
    ]);

    expect(media).toEqual([]);
  });
});

describe("draftFromCampaign", () => {
  it("loads a campaign gallery back into editable draft items", () => {
    const campaign = findPreviewCampaignById("campaign-sungrid");
    if (!campaign) throw new Error("Expected the sungrid fixture");

    const draft = draftFromCampaign(campaign);

    expect(draft.heroMedia).toHaveLength(campaign.media.length);
    expect(draft.storyMedia).toHaveLength(campaign.story.media.length);
    expect(draft.heroMedia.map((item) => item.kind)).toEqual(
      campaign.media.map((item) => item.kind),
    );
    expect(toCampaignMedia(draft.heroMedia)).toEqual(campaign.media);
  });

  it("carries a file source through as its path", () => {
    const campaign = findPreviewCampaignById("campaign-sungrid");
    if (!campaign) throw new Error("Expected the sungrid fixture");

    const [first] = toCampaignMedia(
      draftFromCampaign({
        ...campaign,
        media: [
          {
            alt: "A clip of the site",
            caption: null,
            id: "clip",
            kind: "video",
            poster: null,
            source: { kind: "direct", src: "https://cdn.example.com/clip.mp4" },
          },
        ],
      }).heroMedia,
    );

    expect(first).toMatchObject({
      kind: "video",
      source: { kind: "direct", src: "https://cdn.example.com/clip.mp4" },
    });
  });
});
