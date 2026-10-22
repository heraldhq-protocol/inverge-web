import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { IdeaActions } from "@/features/ideas/components/idea-actions";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import type { IdeaDetail } from "@/features/ideas/types";

afterEach(cleanup);

function ideaFixture(id = "campus-konekt"): IdeaDetail {
  const idea = getPreviewIdeaDetail(id);
  if (!idea) throw new Error(`Missing preview idea: ${id}`);
  return idea;
}

function renderSignedIn(id = "campus-konekt") {
  return render(<IdeaActions idea={ideaFixture(id)} viewer="signed-in" />);
}

describe("IdeaActions", () => {
  it("keeps support reversible with a clear pressed state", () => {
    renderSignedIn();

    const support = screen.getByRole("button", { name: "Support idea" });
    expect(support).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(support);
    expect(screen.getByRole("button", { name: "Supported" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Supported" }));
    expect(
      screen.getByRole("button", { name: "Support idea" }),
    ).toBeInTheDocument();
  });

  it("records, edits, and withdraws a pre-pledge without appending", () => {
    renderSignedIn();

    fireEvent.change(screen.getByPlaceholderText("500"), {
      target: { value: "500" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /I understand this is a non-binding/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Record intent" }));

    expect(screen.getByText(/Your intent:/)).toHaveTextContent("$500");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByPlaceholderText("500"), {
      target: { value: "750" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /I understand this is a non-binding/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Update intent" }));
    expect(screen.getByText(/Your intent:/)).toHaveTextContent("$750");

    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(
      screen.getByRole("button", { name: "Record intent" }),
    ).toBeInTheDocument();
  });

  it("requires a positive amount and the non-binding acknowledgment", () => {
    renderSignedIn();

    fireEvent.click(screen.getByRole("button", { name: "Record intent" }));
    expect(screen.getByText(/Enter a positive amount/)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("500"), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Record intent" }));
    expect(screen.getByText(/Confirm that you understand/)).toBeInTheDocument();
  });

  it("only renders the feedback entry when the creator enabled a form", () => {
    // #given an idea with feedback turned off
    renderSignedIn("zippy-campus");

    // #then — no empty feedback card is invented
    expect(
      screen.queryByRole("button", { name: "Give feedback" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Give feedback" }),
    ).not.toBeInTheDocument();
  });

  it("renders the creator's configured questions and validates required answers", () => {
    renderSignedIn();

    fireEvent.click(screen.getByRole("button", { name: "Give feedback" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Share your feedback");
    expect(
      screen.getByRole("radiogroup", {
        name: "Overall, how promising is this idea?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "What best describes your interest?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "What would stop you backing this?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "Would you trust this service with your details?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "How confident are you that this would work in practice?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^What best describes you\?/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));
    expect(screen.getByText("This question is required.")).toBeInTheDocument();
  });

  it("submits a complete response into a thank-you state", () => {
    renderSignedIn();

    fireEvent.click(screen.getByRole("button", { name: "Give feedback" }));
    const promise = screen.getByRole("radiogroup", {
      name: "Overall, how promising is this idea?",
    });
    fireEvent.click(within(promise).getByRole("radio", { name: "4 of 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(
      screen.getByRole("heading", {
        name: "Thanks for sharing your thoughts.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continue exploring ideas" }),
    ).toBeInTheDocument();
  });

  it("gates submission behind sign-in for a visitor without losing answers", () => {
    render(<IdeaActions idea={ideaFixture()} />);

    fireEvent.click(screen.getByRole("button", { name: "Give feedback" }));
    const promise = screen.getByRole("radiogroup", {
      name: "Overall, how promising is this idea?",
    });
    fireEvent.click(within(promise).getByRole("radio", { name: "5 of 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(
      screen.getByText("Sign in to send your feedback"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /create an account/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("hides funding interest for an idea that is not asking for it", () => {
    renderSignedIn("skill-circle");

    expect(
      screen.queryByRole("heading", { name: "Express funding interest" }),
    ).not.toBeInTheDocument();
  });
});
