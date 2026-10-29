import { describe, expect, it } from "vitest";

import {
  isApplicationFeePaid,
  readApplicationFee,
  safeApplicationFeeRedirect,
} from "@/features/campaigns/lib/application-fee";

describe("readApplicationFee", () => {
  it("reads the API's paid projection", () => {
    // #given a successful application-fee response
    const fee = readApplicationFee({
      amount: 10000,
      chargeId: "fee_1",
      currency: "NGN",
      redirectUrl: null,
      status: "SUCCEEDED",
    });

    // #when read
    // #then the amount and paid state survive
    expect(fee).toEqual({
      amount: 10000,
      chargeId: "fee_1",
      currency: "NGN",
      redirectUrl: null,
      status: "SUCCEEDED",
    });
    expect(isApplicationFeePaid(fee)).toBe(true);
  });

  it("does not turn an unknown status into an unpaid or paid state", () => {
    // #given a status this build does not understand
    // #when read
    // #then the whole projection is refused rather than guessed
    expect(readApplicationFee({ status: "PROCESSING" })).toBeNull();
    expect(readApplicationFee(null)).toBeNull();
    expect(readApplicationFee("SUCCEEDED")).toBeNull();
  });

  it("defaults unsafe amounts and currencies instead of trusting them", () => {
    // #given a malformed amount and currency
    const fee = readApplicationFee({
      amount: Number.NaN,
      chargeId: "",
      currency: "naira",
      status: "PENDING",
    });

    // #when read
    // #then only display-safe defaults remain
    expect(fee).toMatchObject({
      amount: 0,
      chargeId: null,
      currency: "NGN",
      redirectUrl: null,
      status: "PENDING",
    });
  });
});

describe("safeApplicationFeeRedirect", () => {
  it("accepts an absolute HTTP(S) checkout URL", () => {
    expect(safeApplicationFeeRedirect("https://checkout.example/fee")).toBe(
      "https://checkout.example/fee",
    );
    expect(safeApplicationFeeRedirect("http://localhost:4000/pay")).toBe(
      "http://localhost:4000/pay",
    );
  });

  it("refuses a script URL or a malformed value", () => {
    expect(safeApplicationFeeRedirect("javascript:alert(1)")).toBeNull();
    expect(safeApplicationFeeRedirect("not a url")).toBeNull();
    expect(safeApplicationFeeRedirect(null)).toBeNull();
  });
});
