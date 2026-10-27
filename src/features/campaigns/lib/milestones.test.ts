import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import { usd } from "@/features/campaigns/lib/amounts";
import { WORKING_CAPITAL_BPS } from "@/features/campaigns/lib/escrow";
import { escrowLedger } from "@/features/campaigns/lib/milestones";
import type {
  Campaign,
  CampaignMilestone,
  CampaignPhase,
  MilestoneState,
} from "@/features/campaigns/types";

const base = previewCampaigns[0]!;

function milestone(
  index: number,
  allocationBps: number,
  state: MilestoneState,
): CampaignMilestone {
  return {
    ...base.milestones[0]!,
    allocationBps,
    id: `test-m${index + 1}`,
    sequence: index + 1,
    state,
  };
}

function campaignWith({
  phase = "delivering",
  raised,
  states = ["released", "released"],
  target = "100000",
  weights = [5_000, 5_000],
}: {
  phase?: CampaignPhase;
  raised: string | null;
  states?: MilestoneState[];
  target?: string;
  weights?: number[];
}): Campaign {
  return {
    ...base,
    escrow: { ...base.escrow, workingCapitalBps: WORKING_CAPITAL_BPS },
    funding: {
      ...base.funding,
      raised: raised === null ? null : usd(raised),
      target: usd(target),
    },
    milestones: weights.map((bps, index) =>
      milestone(index, bps, states[index] ?? "upcoming"),
    ),
    phase,
  };
}

function atomicTotal(rows: readonly { tranche: { atomic: string } }[]): bigint {
  return rows.reduce((sum, row) => sum + BigInt(row.tranche.atomic), 0n);
}

describe("escrowLedger", () => {
  it("shows the initial tranche as a released stage at 100% funding", () => {
    // #given a delivered campaign funded exactly at target
    const ledger = escrowLedger(campaignWith({ raised: "100000" }));

    // #when the ledger is built
    // #then the $200 tranche is separate and the $800 milestones add up
    expect(ledger.initial?.kind).toBe("initial");
    expect(ledger.initial?.tranche.atomic).toBe("20000");
    expect(ledger.initial?.bucket).toBe("released");
    expect(ledger.remaining.atomic).toBe("80000");
    expect(atomicTotal(ledger.rows)).toBe(80_000n);
    expect(ledger.released.atomic).toBe("100000");
    expect(ledger.surplus?.atomic).toBe("0");
  });

  it("keeps the initial tranche fixed and puts the 150% surplus in escrow", () => {
    // #given $1,500 raised against a $1,000 target
    const ledger = escrowLedger(campaignWith({ raised: "150000" }));

    // #when the ledger is built
    // #then the tranche is still $200 and the milestone pool includes the surplus
    expect(ledger.initial?.tranche.atomic).toBe("20000");
    expect(ledger.remaining.atomic).toBe("130000");
    expect(atomicTotal(ledger.rows)).toBe(130_000n);
    expect(ledger.surplus?.atomic).toBe("50000");
  });

  it("keeps the initial tranche fixed at 200% funding", () => {
    // #given $2,000 raised against a $1,000 target
    const ledger = escrowLedger(campaignWith({ raised: "200000" }));

    // #when the ledger is built
    // #then the tranche is still $200 and the surplus stays under the plan
    expect(ledger.initial?.tranche.atomic).toBe("20000");
    expect(ledger.remaining.atomic).toBe("180000");
    expect(ledger.surplus?.atomic).toBe("100000");
  });

  it("does not release the tranche before funding closes", () => {
    // #given a campaign still raising
    const ledger = escrowLedger(
      campaignWith({
        phase: "funding",
        raised: "100000",
        states: ["upcoming", "upcoming"],
      }),
    );

    // #when the ledger is built
    // #then the tranche is still in escrow, not released
    expect(ledger.initial?.bucket).toBe("unreleased");
    expect(ledger.released.atomic).toBe("0");
  });

  it("labels target-based figures as projected when no raise is indexed", () => {
    // #given a campaign with no reported total
    const ledger = escrowLedger(
      campaignWith({
        phase: "funding",
        raised: null,
        states: ["upcoming", "upcoming"],
      }),
    );

    // #when the ledger is built
    // #then the amounts are clearly a projection, not a confirmed raise
    expect(ledger.projected).toBe(true);
    expect(ledger.remaining.atomic).toBe("80000");
    expect(ledger.surplus).toBeNull();
  });

  it("makes the tranche refundable when funding failed", () => {
    // #given a campaign below its target
    const ledger = escrowLedger(
      campaignWith({
        phase: "funding-failed",
        raised: "100000",
        states: ["upcoming", "upcoming"],
      }),
    );

    // #when the ledger is built
    // #then nothing was released and every stage is refundable
    expect(ledger.initial?.bucket).toBe("refundable");
    expect(ledger.released.atomic).toBe("0");
    expect(ledger.refundable.atomic).toBe("100000");
  });

  it("gives the last milestone the remainder so rows sum to the pool", () => {
    // #given a target that does not divide evenly by the weights
    const ledger = escrowLedger(
      campaignWith({
        raised: "1001",
        states: ["upcoming", "upcoming", "upcoming"],
        target: "1001",
        weights: [3_333, 3_333, 3_334],
      }),
    );

    // #when the ledger is built
    // #then every cent of the $8.01 pool is allocated
    expect(ledger.remaining.atomic).toBe("801");
    expect(atomicTotal(ledger.rows)).toBe(801n);
  });
});
