import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const previewMode = vi.hoisted(() => ({ value: false }));
const campaignDraftToken = vi.hoisted(() => vi.fn());
const submitCampaignDraft = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/server/auth-mode", () => ({
  isPreviewAuth: () => previewMode.value,
}));
vi.mock("@/features/campaigns/server/drafts", () => ({
  campaignDraftToken,
  submitCampaignDraft,
}));

import { POST } from "@/app/api/campaigns/[campaignId]/submit/route";

const APP_ORIGIN = "https://inverge.africa";

function request(
  body: string | null = "{}",
  origin: string | null = APP_ORIGIN,
): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  if (body !== null) headers.set("content-type", "application/json");

  return new Request(`${APP_ORIGIN}/api/campaigns/cmp_1/submit`, {
    body,
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
  submitCampaignDraft.mockReset();
  submitCampaignDraft.mockResolvedValue({
    data: { id: "cmp_1", reviewStatus: "IN_REVIEW", status: "IN_REVIEW" },
    ok: true,
    status: 201,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/campaigns/:id/submit", () => {
  it("refuses a cross-site submission", async () => {
    // #given a request from another origin
    // #when the route runs
    // #then it refuses before the API changes review state
    const response = await POST(request("{}", "https://evil.test"), context());

    expect(response.status).toBe(403);
    expect(submitCampaignDraft).not.toHaveBeenCalled();
  });

  it("refuses preview sign-in because it has no backend account", async () => {
    // #given preview auth
    previewMode.value = true;

    // #when the route runs
    // #then it reports that the API is required
    const response = await POST(request(), context());

    expect(response.status).toBe(503);
    expect(submitCampaignDraft).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before calling the API", async () => {
    // #given a body that is not JSON
    // #when the route parses it
    // #then it returns a structured 400
    const response = await POST(request("{"), context());

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: "INVALID_BODY" },
    });
    expect(submitCampaignDraft).not.toHaveBeenCalled();
  });

  it("rejects a charge id that is not a non-empty string", async () => {
    // #given a body with an invalid charge reference
    // #when the route validates it
    // #then it refuses instead of forwarding an arbitrary field
    const response = await POST(
      request('{"applicationFeeChargeId": 42}'),
      context(),
    );

    expect(response.status).toBe(400);
    expect(submitCampaignDraft).not.toHaveBeenCalled();
  });

  it("forwards an empty body as an empty submit DTO", async () => {
    // #given no named charge
    // #when the route runs
    // #then the API receives only the campaign id
    const response = await POST(request(null), context("cmp_7"));

    expect(submitCampaignDraft).toHaveBeenCalledWith(
      "session-jwt",
      "cmp_7",
      {},
    );
    expect(response.status).toBe(201);
  });

  it("forwards the trimmed paid charge id", async () => {
    // #given the charge the creator just paid
    // #when the route runs
    // #then the id is trimmed and the API's status is preserved
    const response = await POST(
      request('{"applicationFeeChargeId":"  fee_1  "}'),
      context(),
    );

    expect(submitCampaignDraft).toHaveBeenCalledWith("session-jwt", "cmp_1", {
      applicationFeeChargeId: "fee_1",
    });
    expect(response.status).toBe(201);
  });

  it("passes the API's gate refusal through", async () => {
    // #given the API refuses because the fee is not paid
    submitCampaignDraft.mockResolvedValue({
      code: "APPLICATION_FEE_REQUIRED",
      details: { blockers: ["Application fee: not paid"] },
      message: "Campaign cannot enter review yet",
      ok: false,
      status: 400,
    });

    // #when the route runs
    // #then the same refusal reaches the browser
    const response = await POST(request(), context());

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: {
        code: "APPLICATION_FEE_REQUIRED",
        details: { blockers: ["Application fee: not paid"] },
      },
    });
  });
});
