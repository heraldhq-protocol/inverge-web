import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  it("renders the error heading and triggers reset when Try Again is clicked", () => {
    const resetMock = vi.fn();
    const testError = Object.assign(new Error("Test error message"), {
      digest: "abcd1234efgh",
    });

    render(<ErrorPage error={testError} reset={resetMock} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /We couldn't load this page\./i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole("button", { name: /Try again/i });
    expect(tryAgainBtn).toBeInTheDocument();

    fireEvent.click(tryAgainBtn);
    expect(resetMock).toHaveBeenCalledTimes(1);

    expect(screen.getByRole("link", { name: /Go to home/i })).toHaveAttribute(
      "href",
      "/",
    );

    expect(screen.getByText(/Reference: IVG-ABCD12/i)).toBeInTheDocument();
  });
});
