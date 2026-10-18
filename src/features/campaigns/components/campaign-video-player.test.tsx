import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import type { CampaignVideo } from "@/features/campaigns/types";

afterEach(cleanup);

function hostedVideo(overrides: Partial<CampaignVideo> = {}): CampaignVideo {
  return {
    alt: "A walkthrough of the first installation",
    caption: null,
    id: "media-1",
    kind: "video",
    poster: null,
    source: { kind: "youtube", videoId: "dQw4w9WgXcQ" },
    ...overrides,
  };
}

describe("CampaignVideoPlayer", () => {
  it("requests nothing from the host until the reader presses play", () => {
    const { container } = render(
      <CampaignVideoPlayer media={hostedVideo()} sizes="640px" />,
    );

    expect(container.querySelector("iframe")).toBeNull();
    expect(
      screen.getByRole("button", {
        name: /play the youtube video: a walkthrough/i,
      }),
    ).toBeInTheDocument();
  });

  it("mounts the privacy-preserving embed once pressed", () => {
    render(<CampaignVideoPlayer media={hostedVideo()} sizes="640px" />);

    fireEvent.click(screen.getByRole("button", { name: /play the youtube/i }));

    const frame = screen.getByTitle("A walkthrough of the first installation");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("builds a Vimeo player URL from the parsed id", () => {
    render(
      <CampaignVideoPlayer
        media={hostedVideo({ source: { kind: "vimeo", videoId: "76979871" } })}
        sizes="640px"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /play the vimeo/i }));

    expect(
      screen.getByTitle("A walkthrough of the first installation"),
    ).toHaveAttribute("src", "https://player.vimeo.com/video/76979871");
  });

  it("shows the poster as an image when the creator supplied one", () => {
    render(
      <CampaignVideoPlayer
        media={hostedVideo({
          poster: "https://images.example.com/poster.jpg",
        })}
        sizes="640px"
      />,
    );

    // Decorative inside a labelled button, so it must not be announced twice.
    const poster = document.querySelector('img[src*="poster.jpg"]');
    expect(poster).not.toBeNull();
    expect(poster).toHaveAttribute("alt", "");
  });

  it("plays a file the browser understands in its own player", () => {
    const { container } = render(
      <CampaignVideoPlayer
        media={hostedVideo({
          poster: "/images/ideas/team.jpg",
          source: { kind: "direct", src: "https://cdn.example.com/clip.mp4" },
        })}
        sizes="640px"
      />,
    );

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("poster", "/images/ideas/team.jpg");
    expect(container.querySelector("source")).toHaveAttribute(
      "src",
      "https://cdn.example.com/clip.mp4",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("treats an uploaded asset the same way as a direct file link", () => {
    const { container } = render(
      <CampaignVideoPlayer
        media={hostedVideo({
          source: { kind: "upload", src: "/media/clip.mp4" },
        })}
        sizes="640px"
      />,
    );

    expect(container.querySelector("source")).toHaveAttribute(
      "src",
      "/media/clip.mp4",
    );
  });
});
