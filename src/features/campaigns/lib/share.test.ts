import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import {
  campaignSharePath,
  campaignSharePayload,
  campaignShareUrl,
  isAbortError,
  shareCampaign,
  shareOutcomeMessage,
  shareOutcomeRevealsLink,
  type ShareOutcome,
} from "@/features/campaigns/lib/share";

const abortError = () => {
  const error = new Error("The user dismissed the sheet");
  error.name = "AbortError";
  return error;
};

function sunGridPayload() {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  if (!campaign) throw new Error("Expected the sungrid fixture");
  return campaignSharePayload(campaign);
}

describe("campaignSharePath and campaignShareUrl", () => {
  it("builds the canonical campaign path from the slug", () => {
    expect(campaignSharePath("sungrid-community-power")).toBe(
      "/campaigns/sungrid-community-power",
    );
  });

  it("resolves to an absolute URL that ends at that path", () => {
    const url = campaignShareUrl("sungrid-community-power");

    expect(url.startsWith("http")).toBe(true);
    expect(url.endsWith("/campaigns/sungrid-community-power")).toBe(true);
  });
});

describe("campaignSharePayload", () => {
  it("uses the campaign's own title and summary, not a rewrite", () => {
    const campaign = findPreviewCampaignById("campaign-sungrid");
    if (!campaign) throw new Error("Expected the sungrid fixture");

    const payload = campaignSharePayload(campaign);

    expect(payload.title).toBe(campaign.title);
    expect(payload.text).toBe(campaign.summary);
    expect(payload.url).toBe(campaignShareUrl(campaign.slug));
  });
});

describe("shareCampaign", () => {
  it("reports a share that the platform took over, with no copy behind it", async () => {
    let copied = 0;
    const outcome = await shareCampaign(sunGridPayload(), {
      copy: async () => {
        copied += 1;
      },
      share: async () => undefined,
    });

    expect(outcome).toBe("shared");
    expect(copied).toBe(0);
  });

  it("treats a dismissed sheet as cancelled and copies nothing", async () => {
    let copied = 0;
    const outcome = await shareCampaign(sunGridPayload(), {
      copy: async () => {
        copied += 1;
      },
      share: async () => {
        throw abortError();
      },
    });

    expect(outcome).toBe("cancelled");
    expect(copied).toBe(0);
  });

  it("falls back to the clipboard when the share sheet genuinely fails", async () => {
    const copied: string[] = [];
    const outcome = await shareCampaign(sunGridPayload(), {
      copy: async (text) => {
        copied.push(text);
      },
      share: async () => {
        throw new Error("NotAllowedError");
      },
    });

    expect(outcome).toBe("copied");
    expect(copied).toEqual([sunGridPayload().url]);
  });

  it("copies when there is no share API at all", async () => {
    const outcome = await shareCampaign(sunGridPayload(), {
      copy: async () => undefined,
    });

    expect(outcome).toBe("copied");
  });

  it("reports failure when neither route is available", async () => {
    expect(await shareCampaign(sunGridPayload(), {})).toBe("failed");
  });

  it("reports failure when the clipboard itself refuses", async () => {
    const outcome = await shareCampaign(sunGridPayload(), {
      copy: async () => {
        throw new Error("Clipboard is blocked");
      },
    });

    expect(outcome).toBe("failed");
  });
});

describe("isAbortError", () => {
  it("recognises the platform's dismissal signal and nothing else", () => {
    expect(isAbortError(abortError())).toBe(true);
    expect(isAbortError(new Error("anything else"))).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);
  });
});

describe("shareOutcomeMessage", () => {
  it("announces a copy and a failure, and stays silent for the share sheet", () => {
    expect(shareOutcomeMessage("copied")).toContain("copied");
    expect(shareOutcomeMessage("failed")).toContain("Select the link");
    expect(shareOutcomeMessage("shared")).toBeNull();
    expect(shareOutcomeMessage("cancelled")).toBeNull();
  });
});

describe("shareOutcomeRevealsLink", () => {
  it("only offers the raw link when there is nothing else to press", () => {
    const outcomes: ShareOutcome[] = [
      "shared",
      "cancelled",
      "copied",
      "failed",
    ];

    expect(outcomes.filter(shareOutcomeRevealsLink)).toEqual(["failed"]);
  });
});
