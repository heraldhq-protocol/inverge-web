import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContributionPreview } from "@/features/campaigns/components/contribution-preview";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

/**
 * The backing flow, driven the way a backer drives it.
 *
 * These are the acceptance scenarios for reward selection and fulfilment: a
 * posted reward priced differently in Nigeria, the United Kingdom, and North
 * America; a digital reward with no postage at all; a destination the creator
 * excluded; one their policy never covered; an extra item that adds a parcel and
 * one that does not; and a creator who bills postage later. What each asserts is
 * the *absence* as much as the presence — no invented figure, no confirmation,
 * no unrequested destination.
 */
afterEach(cleanup);

const DIGITAL = "sungrid-tier-community";
const LANTERN = "sungrid-tier-lantern";
const SITE = "sungrid-tier-site";
const DATA_PACK = "sungrid-addon-data-pack";

function sungrid(): Campaign {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  if (!campaign) throw new Error("Expected the sungrid fixture");
  return campaign;
}

function renderFlow(
  campaign: Campaign = sungrid(),
  options: { country?: string; tierId?: string | null } = {},
) {
  return render(
    <ContributionPreview
      campaign={campaign}
      initialCountry={options.country ?? ""}
      initialTierId={options.tierId ?? null}
    />,
  );
}

function next() {
  fireEvent.click(screen.getByRole("button", { name: /^Continue/ }));
}

function stepHeading(name: string) {
  return screen.getByRole("heading", { name });
}

function chooseReward(name: RegExp) {
  fireEvent.click(screen.getByRole("radio", { name }));
}

/**
 * The lantern kit specifically. Anchored, because another reward lists
 * "Everything in the Lantern kit" and would otherwise match too.
 */
function lanternRadio() {
  return screen.getByRole("radio", { name: /^Lantern kit/ });
}

function withoutRewardRadio() {
  return screen.getByRole("radio", { name: /Contribute without a reward/ });
}

/** Types a country into the destination picker and takes the first match. */
function chooseDestination(search: string, option: RegExp) {
  const box = screen.getByRole("combobox", {
    name: "Where should it be sent?",
  });
  fireEvent.focus(box);
  fireEvent.change(box, { target: { value: search } });
  fireEvent.click(screen.getByRole("option", { name: option }));
}

function chooseOption(fieldName: string, optionName: string) {
  fireEvent.click(screen.getByRole("combobox", { name: fieldName }));
  fireEvent.click(screen.getByRole("option", { name: optionName }));
}

/** Both variant answers the lantern kit asks for. */
function answerVariants() {
  fireEvent.click(screen.getByRole("radio", { name: "Amber" }));
  fireEvent.click(screen.getByRole("radio", { name: "UK type G" }));
}

function acceptTerms() {
  fireEvent.click(
    screen.getByRole("checkbox", { name: /I have read the terms above/ }),
  );
}

function acknowledgePreview() {
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: /I understand this is a preview/,
    }),
  );
}

function digitalRewardWithExtra(campaign: Campaign): Campaign {
  const digital = campaign.supportTiers.find((tier) => tier.id === DIGITAL);
  const dataPack = campaign.supportTiers
    .find((tier) => tier.id === LANTERN)
    ?.addOns.find((addOn) => addOn.id === DATA_PACK);

  if (!digital || !dataPack) throw new Error("Expected the digital fixtures");

  return {
    ...campaign,
    supportTiers: [{ ...digital, addOns: [dataPack] }],
  };
}

describe("ContributionPreview reward step", () => {
  it("offers the campaign's rewards alongside a way to contribute without one", () => {
    renderFlow();

    expect(lanternRadio()).toBeInTheDocument();
    expect(withoutRewardRadio()).toBeInTheDocument();
  });

  it("preselects a reward the campaign page passed in", () => {
    renderFlow(sungrid(), { tierId: LANTERN });

    expect(lanternRadio()).toBeChecked();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("selects the reward the backer clicks, and moves the choice when they change it", () => {
    renderFlow();

    chooseReward(/^Lantern kit/);
    chooseReward(/^Site partner/);

    expect(screen.getByRole("radio", { name: /^Site partner/ })).toBeChecked();
    expect(lanternRadio()).not.toBeChecked();
  });

  it("ignores a reward id the campaign does not publish", () => {
    renderFlow(sungrid(), { tierId: "not-a-tier" });

    expect(withoutRewardRadio()).toBeChecked();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("requires an amount when no reward is chosen", () => {
    renderFlow();
    next();

    expect(
      screen.getByText("Enter an amount to continue."),
    ).toBeInTheDocument();
  });

  it("shows the reward's own amount, its listed contents, and its classification", () => {
    renderFlow(sungrid(), { tierId: LANTERN });

    expect(screen.getAllByText("$150").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /One solar reading lantern kit, assembled and tested by the operator cohort/,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Physical").length).toBeGreaterThan(0);
  });

  it("adds optional support on top of a reward and shows the new amount", () => {
    renderFlow(sungrid(), { tierId: DIGITAL });
    fireEvent.change(screen.getByLabelText("Additional support (optional)"), {
      target: { value: "15" },
    });

    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
  });

  it("reports an unreadable extra under its own field", () => {
    renderFlow(sungrid(), { tierId: DIGITAL });
    fireEvent.change(screen.getByLabelText("Additional support (optional)"), {
      target: { value: "abc" },
    });
    next();

    expect(screen.getByText(/at most two decimals/)).toBeInTheDocument();
  });
});

describe("ContributionPreview options and delivery step", () => {
  it("adds no options step for a reward that only exists online", () => {
    renderFlow(sungrid(), { tierId: DIGITAL });

    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    next();

    expect(stepHeading("How you'll pay")).toBeInTheDocument();
  });

  it("keeps a digital reward free of postage even when it carries an extra item", () => {
    renderFlow(digitalRewardWithExtra(sungrid()), { tierId: DIGITAL });
    next();

    expect(stepHeading("Options and delivery")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Site data pack/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Nothing is posted for this reward/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Where should it be sent?" }),
    ).toBeNull();

    next();

    expect(stepHeading("How you'll pay")).toBeInTheDocument();
  });

  it("asks every variant the creator requires before letting the backer continue", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    next();

    expect(
      screen.getByText("Choose lantern colour for this reward."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Choose plug for this reward."),
    ).toBeInTheDocument();
    expect(stepHeading("Options and delivery")).toBeInTheDocument();
  });

  it("will not continue until a destination is chosen, for a reward that posts", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    next();

    expect(
      screen.getByText("Choose the country this reward should be sent to."),
    ).toBeInTheDocument();
  });

  it("prices the creator's own rate for the backer's own country", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("NG", /Nigeria/);

    expect(screen.getByText("Shipping to Nigeria")).toBeInTheDocument();
    expect(
      screen.getByText(/The creator's own rate for this destination is \$8/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("$158").length).toBeGreaterThan(0);
  });

  it("prices a different region at the creator's different rate", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("GB", /United Kingdom/);

    expect(screen.getByText("Shipping to United Kingdom")).toBeInTheDocument();
    expect(
      screen.getByText(/The creator's own rate for this destination is \$22/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("$172").length).toBeGreaterThan(0);
  });

  it("multiplies a per-item rate by the number of items the backer takes", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("US", /United States/);
    chooseOption("How many?", "2");

    // $150 × 2 for the kits, plus $24 an item for North America.
    expect(
      screen.getByText(/The creator's own rate for this destination is \$48/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("$348").length).toBeGreaterThan(0);
  });

  it("refuses a destination the creator excluded, in their own words", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("BR", /Brazil/);

    expect(screen.getByText("Shipping to Brazil")).toBeInTheDocument();
    expect(
      screen.getByText(/Two parcels were held in customs there last year/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Choose another destination, or contribute without/),
    ).toBeInTheDocument();

    next();

    expect(screen.getByText(/Brazil is not a destination/)).toBeInTheDocument();
  });

  it("refuses a destination the creator's policy never covered", () => {
    renderFlow(sungrid(), { tierId: SITE });
    next();
    chooseDestination("PT", /Portugal/);

    expect(
      screen.getByText(/shipping does not cover Portugal/),
    ).toBeInTheDocument();

    next();

    // The refusal blocks the step and repeats the reason under the field, so it
    // appears both as the verdict and as the error.
    expect(stepHeading("Options and delivery")).toBeInTheDocument();
    expect(screen.getAllByText(/does not cover Portugal/)).toHaveLength(2);
  });

  it("says postage is not known yet when the creator bills it later, and states no total", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("JP", /Japan/);

    expect(
      screen.getByText(
        /Postage is not charged now: We will send you a courier quote/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Pending — postage is not known yet").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
  });

  it("adds a chosen extra item to the contribution, at the creator's price", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("NG", /Nigeria/);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /Signed field guide/ }),
    );

    // $150 of kit plus $25 of guide; Nigeria is charged per order, so the guide
    // still travels for the same $8.
    expect(screen.getAllByText("$175").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$183").length).toBeGreaterThan(0);
    expect(screen.getByText("Added")).toBeInTheDocument();
  });

  it("adds a parcel for an extra item that posts separately, and none for a digital one", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("DE", /Germany/);

    expect(screen.getAllByText("$172").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("checkbox", { name: /Site data pack/ }));

    // The digital add-on is $10 and needs no postage: $160 of reward, and the
    // same single parcel, so Europe's per-item $22 is unchanged.
    expect(screen.getAllByText("$182").length).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /Signed field guide/ }),
    );

    // The printed guide is $25 and posts separately, so Europe's per-item rate
    // now covers two parcels: $185 of reward plus $44 of postage.
    expect(screen.getAllByText("$229").length).toBeGreaterThan(0);
  });

  it("explains how every named destination is priced, without a carrier quote", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("GH", /Ghana/);

    expect(
      screen.getByText("What the creator charges, and where"),
    ).toBeInTheDocument();
    expect(screen.getByText("Inside Nigeria")).toBeInTheDocument();
    expect(screen.getByText("Europe")).toBeInTheDocument();
    expect(screen.getByText(/not a carrier quote/)).toBeInTheDocument();
  });

  it("states what happens at the border without calculating a duty", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();

    expect(screen.getByText("At the border")).toBeInTheDocument();
    expect(screen.getByText(/cannot mark one as a gift/)).toBeInTheDocument();
    expect(
      screen.getByText(/does not calculate, collect, or remit import duty/),
    ).toBeInTheDocument();
  });
});

describe("ContributionPreview settlement step", () => {
  function toSettlement(campaign: Campaign, tierId: string) {
    renderFlow(campaign, { tierId });
    next();
  }

  it("offers both ways to pay, with the card route named but not usable yet", () => {
    toSettlement(sungrid(), DIGITAL);

    expect(
      screen.getByRole("radio", { name: /USDC from your wallet/ }),
    ).toBeEnabled();
    expect(
      screen.getByRole("radio", { name: /Card or bank transfer/ }),
    ).toBeDisabled();
    expect(
      screen.getByText(/needs a live conversion quote/),
    ).toBeInTheDocument();
  });

  it("starts on the wallet route and says no platform fee is charged to the backer", () => {
    toSettlement(sungrid(), DIGITAL);

    expect(
      screen.getByRole("radio", { name: /USDC from your wallet/ }),
    ).toBeChecked();
    expect(
      screen.getAllByText(/Inverge's fee comes out of each released tranche/)
        .length,
    ).toBeGreaterThan(0);
  });

  it("mentions the naira rails only where the campaign can settle in them", () => {
    const campaign = sungrid();
    toSettlement(
      {
        ...campaign,
        funding: {
          ...campaign.funding,
          supportedSettlementAssets: ["USDC", "cNGN"],
        },
      },
      DIGITAL,
    );

    expect(
      screen.getByRole("radio", { name: /Card or bank transfer/ }),
    ).toBeDisabled();
    expect(screen.getByText(/converts it to USDC or cNGN/)).toBeInTheDocument();
  });

  it("names the postage as paid to the creator and outside the escrow", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("GH", /Ghana/);
    next();

    expect(stepHeading("How you'll pay")).toBeInTheDocument();
    next();
    acceptTerms();

    expect(
      screen.getByText(/Postage is paid to the creator for fulfilment/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /not part of what an all-or-nothing refund would return/,
      ),
    ).toBeInTheDocument();
  });
});

describe("ContributionPreview review and handoff", () => {
  function toReview(campaign: Campaign, tierId: string) {
    renderFlow(campaign, { tierId });
    next();
  }

  it("reviews the reward, the destination, and both amounts, kept apart", () => {
    renderFlow(sungrid(), { tierId: LANTERN });
    next();
    answerVariants();
    chooseDestination("GH", /Ghana/);
    next();
    next();
    acceptTerms();
    next();

    expect(stepHeading("Review")).toBeInTheDocument();
    expect(screen.getAllByText("Lantern kit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ghana").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Contribution (escrowed)").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("$150").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$165").length).toBeGreaterThan(0);
    expect(screen.getAllByText("USDC").length).toBeGreaterThan(0);
  });

  it("will not leave the review until the preview is acknowledged", () => {
    toReview(sungrid(), DIGITAL);
    next();
    acceptTerms();
    next();

    expect(stepHeading("Review")).toBeInTheDocument();

    next();

    expect(
      screen.getByText(/Confirm you understand this is a preview/),
    ).toBeInTheDocument();
    expect(stepHeading("Review")).toBeInTheDocument();
  });

  it("ends on an unconnected-payment state instead of confirming a contribution", () => {
    toReview(sungrid(), DIGITAL);
    next();
    acceptTerms();
    next();
    acknowledgePreview();
    next();

    expect(
      stepHeading("Payment is not connected in this build"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no transaction was\s+created/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /confirmed/i })).toBeNull();
    expect(screen.getByText(/Quote expired/)).toBeInTheDocument();
    expect(screen.getByText(/Payment cancelled or failed/)).toBeInTheDocument();
  });
});

describe("ContributionPreview destination from the link", () => {
  function destinationValue() {
    return screen.getByRole("combobox", {
      name: "Where should it be sent?",
    });
  }

  it("accepts a real country code in any case and prices it straight away", () => {
    renderFlow(sungrid(), { country: "gh", tierId: LANTERN });
    next();

    expect(destinationValue()).toHaveValue("Ghana");
    expect(
      screen.getByText(/The creator's own rate for this destination is \$15/),
    ).toBeInTheDocument();
  });

  it("ignores a code that is not a destination", () => {
    renderFlow(sungrid(), { country: "ZZ", tierId: LANTERN });
    next();

    expect(destinationValue()).toHaveValue("");
    expect(
      screen.getByText(/Choose a country to see how it applies to you/),
    ).toBeInTheDocument();
  });
});
