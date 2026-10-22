import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AdDismissButton } from "@/features/advertising/components/ad-dismiss-button";
import { AdLabel } from "@/features/advertising/components/ad-label";
import { AdSlot } from "@/features/advertising/components/ad-slot";
import { AdvertisingPreferences } from "@/features/advertising/components/advertising-preferences";
import { SponsoredBanner } from "@/features/advertising/components/sponsored-banner";
import { SponsoredContentCard } from "@/features/advertising/components/sponsored-content-card";
import { ThirdPartyAdSlot } from "@/features/advertising/components/third-party-ad-slot";
import {
  clearDismissedAds,
  dismissAd,
} from "@/features/advertising/lib/dismissed-store";
import {
  resetAdConsentForTests,
  saveAdConsent,
} from "@/features/advertising/lib/consent-store";
import { AD_CONSENT_STORAGE_KEY } from "@/features/advertising/lib/consent";
import type { AdCreative } from "@/features/advertising/types";

const NOW = "2026-10-22T12:00:00.000Z";

const nativeCreative: AdCreative = {
  advertiser: "Northstar Tools",
  body: "A workspace for small teams that need invoices, stock, and receipts in one place.",
  categories: [],
  createdAt: "2026-10-01T09:00:00.000Z",
  ctaLabel: "See the workspace",
  destination: "https://example.com/northstar",
  endsAt: "2026-12-31T23:59:59.000Z",
  format: "native-card",
  headline: "Run the shop without the spreadsheet",
  id: "northstar-test",
  kind: "first-party",
  placements: ["campaign-feed-inline"],
  priority: 60,
  regions: [],
  startsAt: "2026-10-01T00:00:00.000Z",
  status: "approved",
  updatedAt: "2026-10-01T09:00:00.000Z",
};

const bannerCreative: AdCreative = {
  ...nativeCreative,
  destination: "/campaigns/sungrid",
  format: "banner",
  headline: "Keep the launch online",
  id: "sahel-test",
  placements: ["campaign-detail-inline"],
};

beforeEach(() => {
  window.localStorage.clear();
  clearDismissedAds();
  resetAdConsentForTests();
  process.env.INVERGE_ADS_ENABLED = "true";
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  clearDismissedAds();
  delete process.env.INVERGE_ADS_ENABLED;
  delete process.env.INVERGE_ADS_THIRD_PARTY_ENABLED;
  delete process.env.NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID;
  delete process.env.NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID;
});

describe("paid-placement labelling", () => {
  it("names the advertiser beside the Sponsored label", () => {
    render(<AdLabel advertiser="Northstar Tools" />);

    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(screen.getByText("Northstar Tools")).toBeInTheDocument();
    expect(screen.getByText(/Paid placement by/)).toBeInTheDocument();
  });

  it("states that the card is paid and does not change Inverge metrics", () => {
    render(
      <SponsoredContentCard
        creative={nativeCreative}
        placementId="campaign-feed-inline"
      />,
    );

    expect(
      screen.getByText(/Paid placement\. It does not change organic ranking/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/raised/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backers/i)).not.toBeInTheDocument();
  });

  it("marks an external CTA as sponsored and opens it safely", () => {
    render(
      <SponsoredContentCard
        creative={nativeCreative}
        placementId="campaign-feed-inline"
      />,
    );

    const link = screen.getByRole("link", { name: /See the workspace/ });
    expect(link).toHaveAttribute("href", "https://example.com/northstar");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("sponsored"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveTextContent(/opens in a new tab/);
  });

  it("keeps an internal CTA in the same tab without a sponsored rel", () => {
    render(
      <SponsoredBanner
        creative={bannerCreative}
        placementId="campaign-detail-inline"
      />,
    );

    const link = screen.getByRole("link", {
      name: /Keep the launch online|Read the guide|See the workspace/,
    });
    expect(link).toHaveAttribute("href", "/campaigns/sungrid");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });
});

describe("dismissal", () => {
  it("removes the creative from the page without touching consent", () => {
    render(
      <SponsoredContentCard
        creative={nativeCreative}
        placementId="campaign-feed-inline"
      />,
    );

    expect(
      screen.getByRole("heading", { name: nativeCreative.headline }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss ad" }));

    expect(
      screen.queryByRole("heading", { name: nativeCreative.headline }),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(AD_CONSENT_STORAGE_KEY)).toBeNull();
    expect(
      window.localStorage.getItem("inverge:advertising-dismissed:v1"),
    ).toContain(nativeCreative.id);
  });

  it("renders no button for a creative that was already dismissed", () => {
    dismissAd(nativeCreative.id);
    render(<AdDismissButton creativeId={nativeCreative.id} />);

    expect(
      screen.queryByRole("button", { name: "Dismiss ad" }),
    ).not.toBeInTheDocument();
  });
});

describe("AdSlot", () => {
  it("renders nothing when advertising is disabled", () => {
    process.env.INVERGE_ADS_ENABLED = "false";

    const { container } = render(
      <AdSlot
        now={NOW}
        page={{ kind: "campaigns", organicResultCount: 12 }}
        placementId="campaign-feed-inline"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the feed has too few organic results", () => {
    const { container } = render(
      <AdSlot
        now={NOW}
        page={{ kind: "campaigns", organicResultCount: 3 }}
        placementId="campaign-feed-inline"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a labelled feed card after enough organic results", () => {
    const { container } = render(
      <AdSlot
        now={NOW}
        page={{ kind: "campaigns", organicResultCount: 12 }}
        placementId="campaign-feed-inline"
      />,
    );

    expect(container.querySelector("[data-ad-slot]")).not.toBeNull();
    expect(screen.getByText("Sponsored")).toBeInTheDocument();
  });

  it("hides a desktop rail below lg without reserving space on mobile", () => {
    const { container } = render(
      <AdSlot
        now={NOW}
        page={{ kind: "campaign" }}
        placementId="campaign-detail-rail"
      />,
    );

    const slot = container.querySelector("[data-ad-slot]");
    expect(slot).not.toBeNull();
    expect(slot).toHaveClass("hidden", "lg:block");
  });

  it("does not render a third-party slot before consent", () => {
    process.env.INVERGE_ADS_THIRD_PARTY_ENABLED = "true";
    process.env.NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID = "ca-pub-123";
    process.env.NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID = "456";

    const { container } = render(
      <ThirdPartyAdSlot clientId="ca-pub-123" slotId="456" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the isolated provider only after personalised consent", () => {
    saveAdConsent({ measurement: false, personalisedAds: true }, NOW);

    const { container } = render(
      <ThirdPartyAdSlot clientId="ca-pub-123" slotId="456" />,
    );

    expect(
      screen.getByLabelText("Third-party advertisement"),
    ).toBeInTheDocument();
    expect(container.querySelector("ins.adsbygoogle")).not.toBeNull();
  });
});

describe("advertising preferences", () => {
  it("starts with both optional purposes off", () => {
    render(<AdvertisingPreferences />);

    expect(
      screen.getByRole("checkbox", { name: /Measure paid placements/ }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: /Allow third-party personalised advertising/,
      }),
    ).not.toBeChecked();
    expect(
      screen.getByText(/No optional advertising choice has been saved/),
    ).toBeInTheDocument();
  });

  it("saves an explicit measurement choice on this device", () => {
    render(<AdvertisingPreferences />);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /Measure paid placements/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save choices" }));

    const stored = window.localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toMatchObject({
      measurement: true,
      personalisedAds: false,
      version: 2,
    });
    expect(screen.getByText(/Advertising choices updated/)).toBeInTheDocument();
  });

  it("turns both optional purposes off in one action", () => {
    saveAdConsent({ measurement: true, personalisedAds: true }, NOW);
    render(<AdvertisingPreferences />);

    fireEvent.click(
      screen.getByRole("button", { name: "Turn off optional advertising" }),
    );

    expect(
      JSON.parse(window.localStorage.getItem(AD_CONSENT_STORAGE_KEY)!),
    ).toMatchObject({ measurement: false, personalisedAds: false, version: 2 });
  });
});
