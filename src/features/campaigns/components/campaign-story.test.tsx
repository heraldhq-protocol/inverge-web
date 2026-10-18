import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignStoryMedia } from "@/features/campaigns/components/campaign-story";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign, CampaignMedia } from "@/features/campaigns/types";

afterEach(cleanup);

const fixture = findPreviewCampaignById("campaign-sungrid");
if (!fixture) throw new Error("Expected the sungrid fixture");

/** Captured as a definite `Campaign` so the helper below can spread it. */
const sample: Campaign = fixture;

function withStoryMedia(media: readonly CampaignMedia[]): Campaign {
  return { ...sample, story: { ...sample.story, media } };
}

describe("CampaignStoryMedia", () => {
  it("renders nothing when the creator attached none", () => {
    const { container } = render(
      <CampaignStoryMedia campaign={withStoryMedia([])} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a photo with the creator's description and caption", () => {
    render(
      <CampaignStoryMedia
        campaign={withStoryMedia([
          {
            alt: "The site team after a commissioning visit",
            caption: "The operator cohort.",
            id: "story-1",
            kind: "image",
            src: "/images/ideas/team.jpg",
          },
        ])}
      />,
    );

    expect(screen.getByText("From the campaign")).toBeInTheDocument();
    expect(
      screen.getByAltText("The site team after a commissioning visit"),
    ).toBeInTheDocument();
    expect(screen.getByText("The operator cohort.")).toBeInTheDocument();
  });

  it("offers a way out to the host beside a hosted video", () => {
    render(
      <CampaignStoryMedia
        campaign={withStoryMedia([
          {
            alt: "A walkthrough of the first installation",
            caption: null,
            id: "story-2",
            kind: "video",
            poster: null,
            source: { kind: "youtube", videoId: "dQw4w9WgXcQ" },
          },
        ])}
      />,
    );

    expect(
      screen.getByRole("button", { name: /play the youtube video/i }),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Watch on YouTube" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("adds no host link for a file the browser plays itself", () => {
    render(
      <CampaignStoryMedia
        campaign={withStoryMedia([
          {
            alt: "A clip of the installation",
            caption: null,
            id: "story-3",
            kind: "video",
            poster: null,
            source: { kind: "upload", src: "/media/clip.mp4" },
          },
        ])}
      />,
    );

    expect(screen.queryByRole("link", { name: /watch on/i })).toBeNull();
    expect(document.querySelector("video")).not.toBeNull();
  });
});
