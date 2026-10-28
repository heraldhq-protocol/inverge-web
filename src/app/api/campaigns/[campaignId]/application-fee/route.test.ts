import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const previewMode = vi.hoisted(() => ({ value: false }));
const campaignDraftToken = vi.hoisted(() => vi.fn());
const createApplicationFeeCharge = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/server/auth-mode", () => ({
  isPreviewAuth: () => previewMode.value,
}));
vi.mock("@/features/campaigns/server/drafts", () => ({
  campaignDraftToken,
  createApplicationFeeCharge,
}));

import { POST } from "@/app/api/campaigns/[campaignId]/application-fee/route";

const APP_ORIGIN = "https://inverge.africa";

function request(origin: string | null = APP_ORIGIN): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);

  return new Request(`${APP_ORIGIN}/api/campaigns/cmp_1/application-fee`, {
    headers,
    method: "POST",
  });
}

function context(campaignId = "cmp_1") {
  return { params: Promise.resolve({ campaignId }) };
}

const signedIn = { ok: true as const, token: "session-jwt" };

beforeEach(() => {
  previewMode.value = false;
  campaignDraftToken.mockReset();
  campaignDraftToken.mockResolvedValue(signedIn);
  createApplicationFeeCharge.mockReset();
  createApplicationFeeCharge.mockResolvedValue({
    data: {
      alreadyPaid: false,
      amount: 10000,
      chargeId: "fee_1",
      currency: "NGN",
      redirectUrl: "https://checkout.example/fee_1",
      status: "PENDING",
    },
    ok: true,
    status: 200,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/campaigns/:id/application-fee", () => {
  it("refuses a cross-site payment request", async () => {
    // #given a request from another origin
    // #when the route runs
    // #then it refuses before asking the API to start a charge
    const response = await POST(request("https://evil.test"), context());

    expect(response.status).toBe(403);
    expect(createApplicationFeeCharge).not.toHaveBeenCalled();
  });

  it("refuses preview sign-in because it has no backend account", async () => {
    // #given preview auth
    previewMode.value = true;

    // #when the route runs
    // #then it reports that the API is required
    const response = await POST(request(), context());

    expect(response.status).toBe(503);
    expect(createApplicationFeeCharge).not.toHaveBeenCalled();
  });

  it("requires a session before starting a non-refundable charge", async () => {
    // #given no session cookie
    campaignDraftToken.mockResolvedValue({
      code: "NOT_SIGNED_IN",
      message: "Sign in before saving a campaign draft.",
      ok: false,
      status: 401,
    });

    // #when the route runs
    // #then it returns the failure and does not call the API
    const response = await POST(request(), context());

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: { code: "NOT_SIGNED_IN" },
    });
    expect(createApplicationFeeCharge).not.toHaveBeenCalled();
  });

  it("forwards the owner-scoped request and returns the checkout state", async () => {
    // #given a signed-in creator
    // #when the route runs
    // #then the API is called with the session token and campaign id only
    const response = await POST(request(), context("cmp_9"));

    expect(createApplicationFeeCharge).toHaveBeenCalledWith(
      "session-jwt",
      "cmp_9",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      chargeId: "fee_1",
      status: "PENDING",
    });
  });

  it("passes the API's verification refusal through with its blockers", async () => {
    // #given the API refuses payment until verification is complete
    createApplicationFeeCharge.mockResolvedValue({
      code: "VERIFICATION_REQUIRED",
      details: { blockers: ["Creator: identity verification is pending"] },
      message: "Complete verification before paying the application fee",
      ok: false,
      status: 400,
    });

    // #when the route runs
    // #then the creator sees the same message and blockers
    const response = await POST(request(), context());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "VERIFICATION_REQUIRED",
        details: { blockers: ["Creator: identity verification is pending"] },
        message: "Complete verification before paying the application fee",
      },
    });
  });
});
