import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignDiscussion } from "@/features/campaigns/components/campaign-discussion";
import type { CampaignComment } from "@/features/campaigns/types";

const comment: CampaignComment = {
  author: {
    avatarUrl: null,
    displayName: "Ada Obi",
    id: "user-2",
    isCreator: false,
  },
  body: "When does the first milestone release?",
  createdAt: "2026-11-01T10:00:00.000Z",
  id: "comment-1",
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
  } as Response;
}

describe("CampaignDiscussion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the campaign thread and marks the creator", () => {
    // #given / #when
    render(
      <CampaignDiscussion
        campaignId="campaign-1"
        comments={[
          comment,
          {
            ...comment,
            author: { ...comment.author, id: "creator-1", isCreator: true },
            body: "After the evidence is verified.",
            id: "comment-2",
          },
        ]}
        slug="community-power"
        viewer={{
          avatarUrl: null,
          displayName: null,
          id: null,
          signedIn: false,
        }}
      />,
    );

    // #then
    expect(screen.getByText(comment.body)).toBeInTheDocument();
    expect(screen.getByText("Campaign creator")).toBeInTheDocument();
    expect(screen.getAllByText(/1 Nov 2026/)).toHaveLength(2);
  });

  it("sends a logged-out visitor to sign in with the discussion tab preserved", () => {
    // #given / #when
    render(
      <CampaignDiscussion
        campaignId="campaign-1"
        comments={[]}
        slug="community-power"
        viewer={{
          avatarUrl: null,
          displayName: null,
          id: null,
          signedIn: false,
        }}
      />,
    );

    // #then
    expect(screen.getByRole("link", { name: /^sign in$/i })).toHaveAttribute(
      "href",
      "/auth?next=%2Fcampaigns%2Fcommunity-power%3Ftab%3Ddiscussion%26compose%3D1",
    );
  });

  it("posts to the campaign's own endpoint", async () => {
    // #given
    const posted = {
      author: {
        avatarUrl: null,
        displayName: "Ada Obi",
        id: "user-2",
        isCreator: false,
      },
      body: "A follow-up.",
      createdAt: "2026-11-02T10:00:00.000Z",
      id: "comment-3",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(posted, 201))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [posted],
          page: { hasMore: false, nextCursor: null },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    // #when
    render(
      <CampaignDiscussion
        campaignId="campaign-1"
        comments={[]}
        slug="community-power"
        viewer={{
          avatarUrl: null,
          displayName: "Ada Obi",
          id: "user-2",
          signedIn: true,
        }}
      />,
    );
    fireEvent.change(screen.getByLabelText(/add a comment/i), {
      target: { value: "A follow-up." },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    // #then
    expect(await screen.findByText("A follow-up.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/campaigns/campaign-1/comments",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("does not fake a thread in a preview deployment", () => {
    // #given / #when
    render(
      <CampaignDiscussion
        campaignId="campaign-1"
        comments={[]}
        slug="community-power"
        source="preview"
      />,
    );

    // #then
    expect(
      screen.getByText(/discussion is not available in this preview/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/add a comment/i)).toBeNull();
  });

  it("offers a retry when the thread fails to load", async () => {
    // #given
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: [], page: { hasMore: false, nextCursor: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    // #when
    render(
      <CampaignDiscussion
        campaignId="campaign-1"
        comments={[]}
        slug="community-power"
        unavailable
        viewer={{
          avatarUrl: null,
          displayName: null,
          id: null,
          signedIn: false,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // #then
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});
