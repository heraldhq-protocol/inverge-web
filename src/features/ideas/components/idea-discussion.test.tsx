import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IdeaDiscussion } from "@/features/ideas/components/idea-discussion";
import type { IdeaComment } from "@/features/ideas/types";

const comment: IdeaComment = {
  author: "Ada Obi",
  authorId: "user-2",
  authorInitials: "AO",
  body: "The pilot timeline is realistic.",
  createdAt: "2026-10-02T00:00:00.000Z",
  id: "comment-1",
  pinned: true,
};

const signedInViewer = {
  avatarUrl: null,
  displayName: "Ada Obi",
  id: "user-2",
  signedIn: true,
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
  } as Response;
}

function renderLive(overrides: Record<string, unknown> = {}) {
  return render(
    <IdeaDiscussion
      comments={[comment]}
      ideaId="idea-1"
      source="live"
      viewer={signedInViewer}
      {...overrides}
    />,
  );
}

describe("IdeaDiscussion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders persisted comments with author, timestamp and creator mark", () => {
    // #given / #when
    renderLive();

    // #then
    expect(screen.getByText(comment.body)).toBeInTheDocument();
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText("Creator's pick")).toBeInTheDocument();
    expect(screen.getByText(/2 Oct 2026/)).toBeInTheDocument();
  });

  it("shows an empty state rather than pretending a failed thread is empty", () => {
    // #given / #when
    renderLive({ comments: [] });

    // #then
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post comment/i })).toBeDisabled();
  });

  it("reports a thread outage with a retry action", async () => {
    // #given
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: [], page: { hasMore: false, nextCursor: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    // #when
    renderLive({ comments: [], unavailable: true });

    // #then
    expect(
      screen.getByText(/discussion could not be loaded right now/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("sends a signed-out visitor to sign in with the thread as the destination", () => {
    // #given / #when
    renderLive({ viewer: { avatarUrl: null, displayName: null, id: null, signedIn: false } });

    // #then
    const signIn = screen.getByRole("link", { name: /^sign in$/i });
    expect(signIn.getAttribute("href")).toBe(
      "/auth?next=%2Fideas%2Fidea-1%3Fcompose%3D1",
    );
    expect(screen.queryByRole("button", { name: /post comment/i })).toBeNull();
  });

  it("posts through the BFF and re-reads the first page without a reload", async () => {
    // #given
    const posted = {
      author: {
        avatarUrl: null,
        displayName: "Ada Obi",
        id: "user-2",
        isCreator: false,
      },
      body: "A new question.",
      createdAt: "2026-11-02T10:00:00.000Z",
      id: "comment-2",
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
    renderLive({ comments: [] });
    fireEvent.change(screen.getByLabelText(/add a comment/i), {
      target: { value: "A new question." },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    // #then
    expect(await screen.findByText("A new question.")).toBeInTheDocument();
    expect(await screen.findByText(/your comment is posted/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/ideas/idea-1/comments",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ideas/idea-1/comments?limit=20",
      expect.any(Object),
    );
  });

  it("keeps the submitted row and reports a refresh failure honestly", async () => {
    // #given
    const posted = {
      author: {
        avatarUrl: null,
        displayName: "Ada Obi",
        id: "user-2",
        isCreator: false,
      },
      body: "Still here after a refresh failure.",
      createdAt: "2026-11-02T10:00:00.000Z",
      id: "comment-3",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(posted, 201))
      .mockResolvedValueOnce(jsonResponse({ error: "down" }, 503));
    vi.stubGlobal("fetch", fetchMock);

    // #when
    renderLive({ comments: [] });
    fireEvent.change(screen.getByLabelText(/add a comment/i), {
      target: { value: "Still here after a refresh failure." },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    // #then
    expect(
      await screen.findByText("Still here after a refresh failure."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/comment posted, but the thread could not refresh/i),
    ).toBeInTheDocument();
  });

  it("reports a rejected submission and keeps the text", async () => {
    // #given
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { error: { code: "BAD_REQUEST", message: "That comment was rejected." } },
        400,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    // #when
    renderLive({ comments: [] });
    fireEvent.change(screen.getByLabelText(/add a comment/i), {
      target: { value: "Keep me" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    // #then
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That comment was rejected.",
    );
    expect(screen.getByLabelText(/add a comment/i)).toHaveValue("Keep me");
  });

  it("asks for sign-in again when the session has ended", async () => {
    // #given
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ error: { code: "NOT_SIGNED_IN" } }, 401),
    );
    vi.stubGlobal("fetch", fetchMock);

    // #when
    renderLive({ comments: [] });
    fireEvent.change(screen.getByLabelText(/add a comment/i), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    // #then
    expect(
      await screen.findByRole("link", { name: /sign in again/i }),
    ).toHaveAttribute(
      "href",
      "/auth?next=%2Fideas%2Fidea-1%3Fcompose%3D1",
    );
    expect(screen.queryByRole("button", { name: /post comment/i })).toBeNull();
  });

  it("explains an email-verification requirement without losing the destination", async () => {
    // #given
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { error: { code: "EMAIL_VERIFICATION_REQUIRED" } },
        403,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    // #when
    renderLive({ comments: [] });
    fireEvent.change(screen.getByLabelText(/add a comment/i), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    // #then
    expect(
      await screen.findByText(/verify your email address before commenting/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /verify email in settings/i }),
    ).toHaveAttribute(
      "href",
      "/d/settings?next=%2Fideas%2Fidea-1",
    );
  });

  it("lets the author delete their own comment after confirmation", async () => {
    // #given
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ deleted: true }));
    vi.stubGlobal("fetch", fetchMock);

    // #when
    renderLive();
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    // #then
    await waitFor(() =>
      expect(screen.queryByText(comment.body)).not.toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ideas/idea-1/comments/comment-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("does not offer delete on someone else's comment", () => {
    // #given / #when
    renderLive({ viewer: { ...signedInViewer, id: "someone-else" } });

    // #then
    expect(screen.queryByRole("button", { name: /^delete$/i })).toBeNull();
  });

  it("keeps a preview composer local and labels it", () => {
    // #given / #when
    render(<IdeaDiscussion comments={[]} />);

    // #then
    expect(screen.getByText(/· Preview/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create an account/i }).getAttribute("href"),
    ).toMatch(/^\/auth\?next=/);
  });
});
