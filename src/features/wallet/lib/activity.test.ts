import { describe, expect, it } from "vitest";

import { previewContributions } from "@/features/campaigns/content/preview-contributions";
import {
  activityCounts,
  filterWalletActivity,
  isPendingActivity,
  isWalletActivityFilter,
  needsAttention,
  sortWalletActivity,
  walletActivityFromContributions,
} from "@/features/wallet/lib/activity";

const activity = walletActivityFromContributions(previewContributions);

describe("walletActivityFromContributions", () => {
  it("derives one contribution row plus a separate row for each refund", () => {
    expect(activity).toHaveLength(previewContributions.length + 2);
    expect(
      activity.filter((item) => item.kind === "contribution"),
    ).toHaveLength(previewContributions.length);
    expect(activity.filter((item) => item.kind === "refund")).toHaveLength(2);
  });

  it("labels every derived record as demo data and invents no transaction", () => {
    expect(activity.every((item) => item.demo)).toBe(true);
    expect(activity.every((item) => item.transaction === null)).toBe(true);
  });

  it("moves no money for a failed payment and says so", () => {
    const failed = activity.find(
      (item) =>
        item.reference.kind === "contribution" &&
        item.reference.id === "contrib-farmlink-03",
    );

    expect(failed?.status).toBe("failed");
    expect(failed?.direction).toBe("none");
    expect(failed?.amount).toBeNull();
    expect(failed?.description).toMatch(/No money moved/);
  });

  it("keeps an available refund as attention without pretending it is paid", () => {
    const refund = activity.find(
      (item) =>
        item.reference.kind === "refund" &&
        item.reference.id === "contrib-lagos-kitchen-01",
    );

    expect(refund?.status).toBe("available");
    expect(refund?.direction).toBe("none");
    expect(refund?.amount?.assetId).toBe("USDC");
    expect(refund?.description).toMatch(/not connected in this build/);
    expect(refund && needsAttention(refund)).toBe(true);
  });

  it("marks a confirmed refund as money returning to the wallet", () => {
    const refund = activity.find(
      (item) =>
        item.reference.kind === "refund" &&
        item.reference.id === "contrib-lagos-kitchen-02",
    );

    expect(refund?.status).toBe("confirmed");
    expect(refund?.direction).toBe("in");
    expect(refund && needsAttention(refund)).toBe(false);
  });

  it("treats pending and reconciling records as still settling", () => {
    const pending = activity.filter(isPendingActivity);

    expect(pending).toHaveLength(4);
    expect(
      pending.every(
        (item) => item.status === "pending" || item.status === "reconciling",
      ),
    ).toBe(true);
  });
});

describe("activityCounts", () => {
  it("counts each filter bucket from the unified history", () => {
    expect(activityCounts(activity)).toEqual({
      all: 15,
      attention: 4,
      contributions: 13,
      pending: 4,
      refunds: 2,
    });
  });
});

describe("filterWalletActivity", () => {
  it("filters by kind", () => {
    const refunds = filterWalletActivity({
      filter: "refunds",
      items: activity,
      query: "",
    });

    expect(refunds).toHaveLength(2);
    expect(refunds.every((item) => item.kind === "refund")).toBe(true);
  });

  it("keeps failed and available records under attention", () => {
    const attention = filterWalletActivity({
      filter: "attention",
      items: activity,
      query: "",
    });

    expect(attention.every(needsAttention)).toBe(true);
    expect(attention.some((item) => item.status === "failed")).toBe(true);
    expect(attention.some((item) => item.status === "available")).toBe(true);
  });

  it("searches the campaign title case-insensitively", () => {
    const results = filterWalletActivity({
      filter: "all",
      items: activity,
      query: "  SUNGRID ",
    });

    expect(results).toHaveLength(2);
    expect(results.every((item) => /sungrid/i.test(item.title))).toBe(true);
  });

  it("combines a filter and a search without widening either", () => {
    expect(
      filterWalletActivity({
        filter: "refunds",
        items: activity,
        query: "sungrid",
      }),
    ).toHaveLength(0);
  });
});

describe("filter validation and sorting", () => {
  it("accepts only the declared filter ids", () => {
    expect(isWalletActivityFilter("attention")).toBe(true);
    expect(isWalletActivityFilter("refunds")).toBe(true);
    expect(isWalletActivityFilter("everything")).toBe(false);
    expect(isWalletActivityFilter("")).toBe(false);
  });

  it("sorts newest first without mutating the input", () => {
    const input = activity.slice(0, 3);
    const before = input.map((item) => item.id);
    const sorted = sortWalletActivity(input);

    expect(input.map((item) => item.id)).toEqual(before);
    expect(sorted).not.toBe(input);
    expect(
      sorted.every((item, index) => {
        const previous = sorted[index - 1];
        return previous === undefined
          ? true
          : previous.occurredAt.localeCompare(item.occurredAt) >= 0;
      }),
    ).toBe(true);
  });
});
