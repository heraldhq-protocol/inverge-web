import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CampaignShareButton } from "@/features/campaigns/components/campaign-share-button";
import type { CampaignSharePayload } from "@/features/campaigns/lib/share";

const payload: CampaignSharePayload = {
  text: "Solar-powered water systems for six rural communities.",
  title: "SunGrid community power",
  url: "https://inverge.example/campaigns/sungrid-community-power",
};

function setShare(value: unknown) {
  Object.defineProperty(window.navigator, "share", {
    configurable: true,
    value,
  });
}

function setClipboard(value: unknown) {
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window.navigator, "share");
  Reflect.deleteProperty(window.navigator, "clipboard");
});

function renderButton() {
  return render(<CampaignShareButton payload={payload} />);
}

describe("CampaignShareButton", () => {
  it("hands the campaign to the platform share sheet and says nothing else", async () => {
    const share = vi.fn(async () => undefined);
    setShare(share);
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: "Share campaign" }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share).toHaveBeenCalledWith({
      text: payload.text,
      title: payload.title,
      url: payload.url,
    });
    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.queryByLabelText("Campaign link")).toBeNull();
  });

  it("does not claim success, and does not copy, when the user dismisses the sheet", async () => {
    const abort = new Error("dismissed");
    abort.name = "AbortError";
    const copy = vi.fn(async () => undefined);
    setShare(async () => {
      throw abort;
    });
    setClipboard({ writeText: copy });
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: "Share campaign" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Share campaign" }),
      ).not.toBeDisabled(),
    );
    expect(screen.getByRole("status").textContent).toBe("");
    expect(copy).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Campaign link")).toBeNull();
  });

  it("reports a real copy when the clipboard is the route that worked", async () => {
    const copy = vi.fn(async () => undefined);
    setClipboard({ writeText: copy });
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: "Share campaign" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Link copied to your clipboard.",
      ),
    );
    expect(copy).toHaveBeenCalledWith(payload.url);
  });

  it("offers the link by hand when neither route is available", async () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: "Share campaign" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Sharing is not available here.",
      ),
    );
    expect(screen.getByLabelText("Campaign link")).toHaveValue(payload.url);
  });

  it("falls back to the clipboard when the share sheet genuinely fails", async () => {
    setShare(async () => {
      throw new Error("NotAllowedError");
    });
    setClipboard({ writeText: vi.fn(async () => undefined) });
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: "Share campaign" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("copied"),
    );
  });
});
