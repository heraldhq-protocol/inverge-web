import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const previewMode = vi.hoisted(() => ({ value: false }));
const requireApiToken = vi.hoisted(() => vi.fn());
const sendApiJson = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/server/auth-mode", () => ({
  isPreviewAuth: () => previewMode.value,
}));
vi.mock("@/features/auth/server/api-token", () => ({ requireApiToken }));
vi.mock("@/lib/api/server", () => ({ sendApiJson }));

import { POST } from "@/app/api/ideas/[id]/convert/route";

const APP_ORIGIN = "https://inverge.africa";

function plan(overrides: Record<string, unknown> = {}) {
  return {
    deadline: "2027-06-30T00:00:00.000Z",
    milestones: [
      {
        allocationPercent: "50",
        deliverable: "Verify the first cohort of vendors.",
        evidence: "A signed vendor list.",
        title: "Verify vendors",
      },
      {
        allocationPercent: "50",
        deliverable: "Ship student ordering.",
        evidence: "A live checkout.",
        title: "Ship ordering",
      },
    ],
    targetAmount: "30000.00",
    tokenType: "USDC",
    workingCapitalPercent: "20",
    ...overrides,
  };
}

function request(
  body: unknown = plan(),
  origin: string | null = APP_ORIGIN,
): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  headers.set("content-type", "application/json");

  return new Request(`${APP_ORIGIN}/api/ideas/idea_1/convert`, {
    body: JSON.stringify(body),
    headers,
    method: "POST",
  });
}

function context(ideaId = "idea_1") {
  return { params: Promise.resolve({ id: ideaId }) };
}

function success(data: unknown) {
  return { data, ok: true as const, status: 200 };
}

beforeEach(() => {
  previewMode.value = false;
  requireApiToken.mockReset();
  requireApiToken.mockResolvedValue({ ok: true, token: "session-jwt" });
  sendApiJson.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/ideas/:id/convert", () => {
  it("refuses a cross-site conversion before calling the API", async () => {
    // #given a request from another origin
    // #when the route runs
    // #then it refuses before the idea lifecycle changes
    const response = await POST(
      request(plan(), "https://evil.test"),
      context(),
    );

    expect(response.status).toBe(403);
    expect(sendApiJson).not.toHaveBeenCalled();
  });

  it("refuses preview sign-in because it has no backend account", async () => {
    // #given preview auth
    previewMode.value = true;

    // #when the route runs
    // #then it reports that the API is required
    const response = await POST(request(), context());

    expect(response.status).toBe(503);
    expect(sendApiJson).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before calling the API", async () => {
    // #given a body that is not JSON
    const requestWithBadBody = new Request(
      `${APP_ORIGIN}/api/ideas/idea_1/convert`,
      {
        body: "{",
        headers: {
          "content-type": "application/json",
          origin: APP_ORIGIN,
        },
        method: "POST",
      },
    );

    // #when the route parses it
    const response = await POST(requestWithBadBody, context());

    // #then it returns a structured 400
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: "INVALID_BODY" },
    });
    expect(sendApiJson).not.toHaveBeenCalled();
  });

  it("rejects a plan whose tranches do not total 100", async () => {
    // #given a plan the API would refuse
    const response = await POST(
      request(
        plan({
          milestones: [
            {
              allocationPercent: "40",
              deliverable: "One",
              evidence: "Evidence one",
              title: "One",
            },
            {
              allocationPercent: "40",
              deliverable: "Two",
              evidence: "Evidence two",
              title: "Two",
            },
          ],
        }),
      ),
      context(),
    );

    // #when the route validates it
    // #then it refuses without creating a campaign
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: "INVALID_CONVERSION_PLAN" },
    });
    expect(sendApiJson).not.toHaveBeenCalled();
  });

  it("converts, saves the full plan and returns the resumable draft", async () => {
    // #given the API accepts the conversion and the draft save
    sendApiJson.mockImplementation(
      (path: string, options: { method: string }) => {
        if (path === "/ideas/idea_1/convert") {
          return Promise.resolve(success({ id: "cmp_1" }));
        }
        if (path === "/campaigns/cmp_1" && options.method === "PATCH") {
          return Promise.resolve(success({ id: "cmp_1", version: 1 }));
        }
        if (path === "/campaigns/cmp_1/draft") {
          return Promise.resolve(
            success({ id: "cmp_1", status: "DRAFT", version: 1 }),
          );
        }
        throw new Error(`Unexpected API call ${options.method} ${path}`);
      },
    );

    // #when the route runs
    const response = await POST(request(), context());

    // #then the draft is returned with the version the wizard resumes from
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ id: "cmp_1", version: 1 });

    const patch = sendApiJson.mock.calls.find(
      ([path]) => path === "/campaigns/cmp_1",
    );
    expect(patch?.[1]).toMatchObject({ method: "PATCH", body: { version: 0 } });
  });

  it("resumes an existing draft when the idea was already converted", async () => {
    // #given the API reports a lost first response and the draft is at version 3
    sendApiJson.mockImplementation(
      (path: string, options: { method: string }) => {
        if (path === "/ideas/idea_1/convert") {
          return Promise.resolve({
            code: "BAD_REQUEST",
            message: "Idea already converted",
            ok: false,
            status: 400,
          });
        }
        if (path === "/campaigns?mine=true&limit=50") {
          return Promise.resolve(
            success({ data: [{ id: "cmp_1", ideaId: "idea_1" }] }),
          );
        }
        if (path === "/campaigns/cmp_1/draft") {
          return Promise.resolve(
            success({ id: "cmp_1", status: "DRAFT", version: 3 }),
          );
        }
        if (path === "/campaigns/cmp_1" && options.method === "PATCH") {
          return Promise.resolve(success({ id: "cmp_1", version: 4 }));
        }
        throw new Error(`Unexpected API call ${options.method} ${path}`);
      },
    );

    // #when the route runs
    const response = await POST(request(), context());

    // #then it saves against the existing version instead of creating a second campaign
    expect(response.status).toBe(201);
    const patch = sendApiJson.mock.calls.find(
      ([path]) => path === "/campaigns/cmp_1",
    );
    expect(patch?.[1]).toMatchObject({ method: "PATCH", body: { version: 3 } });
  });
});
