import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignStoryBlocks } from "@/features/campaigns/components/campaign-story-blocks";
import type { StoryBlock } from "@/features/campaigns/types";

afterEach(cleanup);

const image = {
  alt: "A solar array beside a water tank",
  caption: null,
  id: "story-image",
  kind: "image",
  src: "/images/ideas/sungrid-community-power.jpg",
} as const;

describe("CampaignStoryBlocks", () => {
  it("renders nothing when the creator published no narrative", () => {
    const { container } = render(<CampaignStoryBlocks blocks={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a heading and a paragraph in the creator's order", () => {
    const blocks: readonly StoryBlock[] = [
      { id: "h", kind: "heading", text: "Why water first" },
      { id: "p", kind: "paragraph", text: "The borehole failed in 2019." },
    ];

    render(<CampaignStoryBlocks blocks={blocks} />);

    expect(
      screen.getByRole("heading", { name: "Why water first" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The borehole failed in 2019."),
    ).toBeInTheDocument();
  });

  it("renders a list as a real list and drops blank entries", () => {
    render(
      <CampaignStoryBlocks
        blocks={[
          {
            id: "l",
            items: ["Survey the site", "   ", "Order the pumps"],
            kind: "list",
            ordered: true,
          },
        ]}
      />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Order the pumps")).toBeInTheDocument();
  });

  it("shows an attribution only when the quote carries one", () => {
    render(
      <CampaignStoryBlocks
        blocks={[
          {
            attribution: "Ade, site operator",
            id: "q",
            kind: "quote",
            text: "We fetched water from the next village.",
          },
          {
            attribution: null,
            id: "q2",
            kind: "quote",
            text: "The pump now runs every morning.",
          },
        ]}
      />,
    );

    expect(screen.getByText("Ade, site operator")).toBeInTheDocument();
    expect(
      screen.queryByText("The pump now runs every morning."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(2);
  });

  it("labels a note with its own title", () => {
    render(
      <CampaignStoryBlocks
        blocks={[
          {
            id: "n",
            kind: "note",
            text: "Figures are from the 2025 survey.",
            title: "Note",
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Figures are from the 2025 survey."),
    ).toBeInTheDocument();
  });

  it("renders creator text as text, never as markup the page would trust", () => {
    const hostile = "<script>alert('xss')</script>";
    const { container } = render(
      <CampaignStoryBlocks
        blocks={[{ id: "p", kind: "paragraph", text: hostile }]}
      />,
    );

    expect(screen.getByText(hostile)).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders an image block with its description", () => {
    render(
      <CampaignStoryBlocks blocks={[{ id: "i", image, kind: "image" }]} />,
    );

    expect(screen.getByRole("img", { name: image.alt })).toBeInTheDocument();
  });
});
