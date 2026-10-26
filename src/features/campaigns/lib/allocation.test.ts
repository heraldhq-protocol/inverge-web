import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  allocationFor,
  splitRemaining,
} from "@/features/campaigns/lib/allocation";
import { usd } from "@/features/campaigns/lib/amounts";
import { WORKING_CAPITAL_BPS } from "@/features/campaigns/lib/escrow";
import type { Campaign, CampaignMilestone } from "@/features/campaigns/types";

const base = previewCampaigns[0]!;

function milestone(index: number, allocationBps: number): CampaignMilestone {
  return {
    ...base.milestones[0]!,
    allocationBps,
    id: `test-m${index + 1}`,
    sequence: index + 1,
  };
}

function campaignWith({
  raised,
  target = "100000",
  weights = [5_000, 5_000],
  workingCapitalBps = WORKING_CAPITAL_BPS,
}: {
  raised: string | null;
  target?: string;
  weights?: number[];
  workingCapitalBps?: number | null;
}): Campaign {
  return {
    ...base,
    escrow: { ...base.escrow, workingCapitalBps },
    funding: {
      ...base.funding,
      raised: raised === null ? null : usd(raised),
      target: usd(target),
    },
    milestones: weights.map(milestone),
  };
}

describe("allocationFor", () => {
  it("releases 20% of the target when the campaign raises exactly its target", () => {
    // #given a $1,000 target raised in full
    const allocation = allocationFor(campaignWith({ raised: "100000" }));

    // #when allocated
    // #then the tranche is $200 and milestones divide the other $800
    expect(allocation.initialTranche?.atomic).toBe("20000");
    expect(allocation.remaining.atomic).toBe("80000");
    expect(allocation.surplus?.atomic).toBe("0");
  });

  it("does not grow the initial tranche at 150% funding", () => {
    // #given $1,500 raised against a $1,000 target
    const allocation = allocationFor(campaignWith({ raised: "150000" }));

    // #when allocated
    // #then the tranche is still $200 and the $500 surplus stays in escrow
    expect(allocation.initialTranche?.atomic).toBe("20000");
    expect(allocation.remaining.atomic).toBe("130000");
    expect(allocation.surplus?.atomic).toBe("50000");
  });

  it("does not grow the initial tranche at 200% funding", () => {
    // #given $2,000 raised against a $1,000 target
    const allocation = allocationFor(campaignWith({ raised: "200000" }));

    // #when allocated
    // #then the tranche is still $200 and the pool is $1,800
    expect(allocation.initialTranche?.atomic).toBe("20000");
    expect(allocation.remaining.atomic).toBe("180000");
    expect(allocation.surplus?.atomic).toBe("100000");
  });

  it("flags a raise that cannot cover the fixed tranche", () => {
    // #given only $50 raised
    const allocation = allocationFor(campaignWith({ raised: "5000" }));

    // #when allocated
    // #then the insufficient flag is set and no negative pool is shown
    expect(allocation.insufficient).toBe(true);
    expect(allocation.remaining.atomic).toBe("0");
  });

  it("projects from the target before an indexed raise exists", () => {
    // #given no reported total
    const allocation = allocationFor(campaignWith({ raised: null }));

    // #when allocated
    // #then the projection uses the target and is labelled as such
    expect(allocation.projected).toBe(true);
    expect(allocation.surplus).toBeNull();
    expect(allocation.remaining.atomic).toBe("80000");
  });

  it("does not invent a tranche when terms are not published", () => {
    // #given a campaign with no working-capital term
    const allocation = allocationFor(
      campaignWith({ raised: "100000", workingCapitalBps: null }),
    );

    // #when allocated
    // #then there is no tranche and the milestones divide the whole raise
    expect(allocation.initialTranche).toBeNull();
    expect(allocation.remaining.atomic).toBe("100000");
  });
});

describe("splitRemaining", () => {
  it("gives the last milestone the integer remainder", () => {
    // #given an amount that does not divide by the weights
    const remaining = usd("801");
    const plan = [
      { allocationBps: 3_333, id: "m1" },
      { allocationBps: 3_333, id: "m2" },
      { allocationBps: 3_334, id: "m3" },
    ];

    // #when split
    const amounts = splitRemaining(remaining, plan);

    // #then every cent is allocated exactly once
    const total = amounts.reduce(
      (sum, item) => sum + BigInt(item.amount.atomic),
      0n,
    );
    expect(total).toBe(801n);
    expect(amounts.map((item) => item.amount.atomic)).toEqual([
      "266",
      "266",
      "269",
    ]);
  });

  it("returns no rows for an empty plan", () => {
    expect(splitRemaining(usd("100"), [])).toEqual([]);
  });
});
