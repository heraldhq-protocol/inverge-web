import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IdeaDiscussion } from "@/features/ideas/components/idea-discussion";
import type { IdeaComment } from "@/features/ideas/types";

const comment: IdeaComment = {
  author: "Ada Obi",
  authorInitials: "AO",
  body: "The pilot timeline is realistic.",
  createdAt: "2026-10-02T00:00:00.000Z",
  id: "comment-1",
  pinned: true,
};

describe("IdeaDiscussion", () => {
  it("renders a live thread read-only without pretending to post", () => {
    // #given
    render(
      <IdeaDiscussion canPost={false} comments={[comment]} source="live" />,
    );

    // #then
    expect(screen.getByText(comment.body)).toBeInTheDocument();
    expect(screen.getByText("Creator's pick")).toBeInTheDocument();
    expect(
      screen.getByText("Posting from this public page is not available yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /post comment/i })).toBeNull();
    expect(screen.queryByText(/· Preview/)).toBeNull();
  });

  it("does not report an outage as an empty discussion", () => {
    // #given
    render(
      <IdeaDiscussion
        canPost={false}
        comments={[]}
        source="live"
        unavailable
      />,
    );

    // #then
    expect(
      screen.getByText(/The discussion could not be loaded right now/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Posting is unavailable until the thread loads/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No comments yet/i)).toBeNull();
  });

  it("keeps the preview composer gated behind the preview viewer", () => {
    // #given
    render(<IdeaDiscussion comments={[]} />);

    // #then
    expect(
      screen.getByRole("link", { name: /Create an account/i }),
    ).toHaveAttribute("href", "/auth");
    expect(screen.queryByRole("button", { name: /post comment/i })).toBeNull();
  });
});
