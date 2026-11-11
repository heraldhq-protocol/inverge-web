import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({ sendJson: vi.fn() }));
import { sendJson } from "@/lib/api/client";
import type { BoostPrices } from "@/features/admin/lib/boost-prices";
import { BoostPriceEditor } from "./boost-price-editor";

const prices: BoostPrices = {
  basic: {
    price: { atomic: "537", currency: "USD", decimals: 2 },
    durationDays: 7,
  },
  featured: {
    price: { atomic: "2099", currency: "USD", decimals: 2 },
    durationDays: 30,
  },
};
function submit() {
  fireEvent.submit(screen.getByRole("form", { name: "Boost pricing" }));
}
function changePrice(value: string) {
  fireEvent.change(screen.getByLabelText("Basic price (USD)"), {
    target: { value },
  });
}
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

describe("boost price editor (FR-206, FR-904)", () => {
  it("shows supplied cents and durations and discards an unsaved draft", () => {
    render(<BoostPriceEditor prices={prices} />);
    expect(screen.getByLabelText("Basic price (USD)")).toHaveValue("5.37");
    expect(screen.getByLabelText("Featured price (USD)")).toHaveValue("20.99");
    expect(
      screen.getByRole("button", { name: "Save boost pricing" }),
    ).toBeDisabled();
    changePrice("0.29");
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(screen.getByLabelText("Basic price (USD)")).toHaveValue("5.37");
    expect(sendJson).not.toHaveBeenCalled();
  });
  it("waits for confirmation and sends only the edited price in exact cents", async () => {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<typeof sendJson>>>();
    vi.mocked(sendJson).mockReturnValue(pending.promise);
    render(<BoostPriceEditor prices={prices} />);
    changePrice("0.29");
    submit();
    submit();
    expect(screen.getByText("$5.37")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving pricing..." }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Discard changes" }),
    ).toBeDisabled();
    expect(sendJson).toHaveBeenCalledExactlyOnceWith(
      "/api/admin/boost-prices",
      {
        method: "PATCH",
        body: {
          basic: { price: { atomic: "29", currency: "USD", decimals: 2 } },
        },
      },
    );
    pending.resolve({
      ok: true,
      data: {
        mode: "live",
        prices: {
          ...prices,
          basic: {
            ...prices.basic,
            price: { ...prices.basic.price, atomic: "29" },
          },
        },
      },
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Boost pricing saved.",
    );
    expect(screen.getByText("$0.29")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save boost pricing" }),
    ).toBeDisabled();
  });
  it.each(["0", "1.001", "1e2"])(
    "rejects invalid price %s before a write",
    async (value) => {
      render(<BoostPriceEditor prices={prices} />);
      changePrice(value);
      submit();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Basic price:",
      );
      expect(screen.getByLabelText("Basic price (USD)")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(sendJson).not.toHaveBeenCalled();
    },
  );
  it("validates duration bounds before a write", async () => {
    render(<BoostPriceEditor prices={prices} />);
    fireEvent.change(screen.getByLabelText("Featured duration (days)"), {
      target: { value: "366" },
    });
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Featured duration:",
    );
    expect(sendJson).not.toHaveBeenCalled();
  });
  it.each(["timeout", "partial receipt"])(
    "preserves confirmed prices and blocks retries after a %s",
    async (mode) => {
      vi.mocked(sendJson).mockResolvedValue(
        mode === "timeout"
          ? {
              ok: false,
              status: 0,
              code: "NETWORK_ERROR",
              message: "Connection lost.",
            }
          : { ok: true, data: { mode: "live", prices } },
      );
      render(<BoostPriceEditor prices={prices} />);
      changePrice("6.25");
      submit();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "may already have been saved",
      );
      expect(screen.getByText("$5.37")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Save boost pricing" }),
      ).toBeDisabled();
      expect(
        screen.getByRole("link", { name: "Reload prices" }),
      ).toHaveAttribute("href", "/admin/boost-prices");
      submit();
      expect(sendJson).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("status")).toBeNull();
    },
  );
  it("does not save formatting-only edits or report them as saved", async () => {
    render(<BoostPriceEditor prices={prices} />);
    changePrice("05.37");
    submit();
    await waitFor(() =>
      expect(screen.getByLabelText("Basic price (USD)")).toHaveValue("5.37"),
    );
    expect(sendJson).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
