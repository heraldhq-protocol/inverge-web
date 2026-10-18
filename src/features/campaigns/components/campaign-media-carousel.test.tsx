import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignMediaCarousel } from "@/features/campaigns/components/campaign-media-carousel";
import type { CampaignMedia } from "@/features/campaigns/types";

afterEach(cleanup);

const photo = (id: string, alt: string): CampaignMedia => ({
  alt,
  caption: null,
  id,
  kind: "image",
  src: "/images/ideas/sungrid-community-power.jpg",
});

const video: CampaignMedia = {
  alt: "A walkthrough of the first installation",
  caption: null,
  id: "clip",
  kind: "video",
  poster: null,
  source: { kind: "youtube", videoId: "dQw4w9WgXcQ" },
};

function renderCarousel(media: readonly CampaignMedia[]) {
  return render(
    <CampaignMediaCarousel
      media={media}
      label="Clean energy"
      title="SunGrid community power"
      sizes="640px"
    />,
  );
}

describe("CampaignMediaCarousel", () => {
  it("renders one item as a plain image, with no carousel chrome", () => {
    renderCarousel([photo("one", "A solar array beside a water tank")]);

    expect(
      screen.getByAltText("A solar array beside a water tank"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /show the next media/i }),
    ).toBeNull();
    expect(screen.queryByText(/1 of 1/)).toBeNull();
  });

  it("shows the position and advances with the next control", () => {
    renderCarousel([
      photo("one", "A solar array beside a water tank"),
      photo("two", "A market stall lit by a small panel"),
    ]);

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(
      screen.getByAltText("A solar array beside a water tank"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /show the next media/i }),
    );

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(
      screen.getByAltText("A market stall lit by a small panel"),
    ).toBeInTheDocument();
  });

  it("disables the previous control on the first item", () => {
    renderCarousel([
      photo("one", "A solar array beside a water tank"),
      photo("two", "A market stall lit by a small panel"),
    ]);

    expect(
      screen.getByRole("button", { name: /show the previous media/i }),
    ).toBeDisabled();
  });

  it("jumps to an item from its thumbnail", () => {
    renderCarousel([
      photo("one", "A solar array beside a water tank"),
      photo("two", "A market stall lit by a small panel"),
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: /show media 2 of 2: a market stall/i,
      }),
    );

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
  });

  it("mounts only the active item, so a gallery cannot leave a video playing behind a slide", () => {
    renderCarousel([photo("one", "A solar array beside a water tank"), video]);

    expect(
      screen.queryByRole("button", { name: /play the youtube/i }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /show the next media/i }),
    );

    expect(
      screen.getByRole("button", { name: /play the youtube video/i }),
    ).toBeInTheDocument();
  });

  it("moves between items with the arrow keys while a control has focus", () => {
    renderCarousel([
      photo("one", "A solar array beside a water tank"),
      photo("two", "A market stall lit by a small panel"),
    ]);

    const next = screen.getByRole("button", { name: /show the next media/i });
    fireEvent.keyDown(next, { key: "ArrowRight" });

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
  });

  it("names the gallery and each slide for assistive technology", () => {
    renderCarousel([
      photo("one", "A solar array beside a water tank"),
      photo("two", "A market stall lit by a small panel"),
    ]);

    expect(
      screen.getByRole("group", { name: "SunGrid community power media" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "1 of 2" })).toBeInTheDocument();
  });
});
