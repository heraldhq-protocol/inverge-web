import { NextResponse } from "next/server";

import { requireApiToken } from "@/features/auth/server/api-token";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { toConvertIdeaPayload } from "@/features/campaigns/lib/idea-conversion";
import {
  apiFailureResponse,
  invalidJsonBodyResponse,
  previewAuthResponse,
} from "@/lib/api/route";
import { sendApiJson, type ApiWriteFailure } from "@/lib/api/server";

type RouteContext = { params: Promise<{ id: string }> };

type CampaignRow = { id?: unknown; ideaId?: unknown };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function campaignIdFrom(value: unknown): string | null {
  const record = asRecord(value);
  return typeof record?.id === "string" ? record.id : null;
}

function draftVersionFrom(value: unknown): number | null {
  const record = asRecord(value);
  return typeof record?.version === "number" ? record.version : null;
}

function alreadyConverted(failure: ApiWriteFailure): boolean {
  return failure.status === 400 && /already converted/i.test(failure.message);
}

async function findCampaignIdForIdea(
  token: string,
  ideaId: string,
): Promise<string | null> {
  const page = await sendApiJson("/campaigns?mine=true&limit=50", {
    method: "GET",
    token,
  });
  if (!page.ok) return null;

  const rows = asRecord(page.data)?.data;
  if (!Array.isArray(rows)) return null;

  for (const row of rows) {
    const record = row as CampaignRow;
    if (record.ideaId === ideaId && typeof record.id === "string") {
      return record.id;
    }
  }

  return null;
}

/**
 * Converts one eligible idea and persists the authored campaign plan.
 *
 * The API's conversion endpoint creates the linked draft; the draft save that
 * follows fills in everything conversion does not carry (story, media, tiers,
 * disclosures). Splitting it this way keeps the idea lifecycle transition in one
 * API call while reusing the wizard's existing draft payload and validation.
 *
 * A retry after a lost response is safe: "already converted" resolves to the
 * existing draft and resumes from its current version instead of creating a
 * second campaign.
 */
export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        error: {
          code: "ORIGIN_NOT_ALLOWED",
          message: "Cross-origin request refused.",
        },
      },
      { status: 403 },
    );
  }

  if (isPreviewAuth()) return previewAuthResponse();

  const auth = await requireApiToken("Sign in before converting an idea.");
  if (!auth.ok) return apiFailureResponse(auth);

  const body = await request.json().catch(() => null);
  if (body === null) return invalidJsonBodyResponse();

  const record = asRecord(body);
  if (!record) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "Send the campaign plan as a JSON object.",
        },
      },
      { status: 400 },
    );
  }

  const plan = toConvertIdeaPayload(record);
  if (!plan.ok) {
    return NextResponse.json(
      {
        error: { code: "INVALID_CONVERSION_PLAN", message: plan.message },
      },
      { status: 400 },
    );
  }

  const { id: ideaId } = await context.params;
  const convert = await sendApiJson(
    `/ideas/${encodeURIComponent(ideaId)}/convert`,
    { body: plan.payload, method: "POST", token: auth.token },
  );

  let campaignId: string | null = null;
  let version = 0;

  if (convert.ok) {
    campaignId = campaignIdFrom(convert.data);
    if (!campaignId) {
      return NextResponse.json(
        {
          error: {
            code: "CONVERSION_RESPONSE_UNREADABLE",
            message:
              "Inverge converted the idea but returned no campaign. Reload the idea page before trying again.",
          },
        },
        { status: 502 },
      );
    }
  } else if (alreadyConverted(convert)) {
    campaignId = await findCampaignIdForIdea(auth.token, ideaId);
    if (!campaignId) {
      return apiFailureResponse(convert);
    }

    const existing = await sendApiJson(
      `/campaigns/${encodeURIComponent(campaignId)}/draft`,
      { method: "GET", token: auth.token },
    );
    if (!existing.ok) return apiFailureResponse(existing);

    version = draftVersionFrom(existing.data) ?? 0;
  } else {
    return apiFailureResponse(convert);
  }

  const saved = await sendApiJson(
    `/campaigns/${encodeURIComponent(campaignId)}`,
    {
      body: { ...record, version },
      method: "PATCH",
      token: auth.token,
    },
  );
  if (!saved.ok) return apiFailureResponse(saved);

  const draft = await sendApiJson(
    `/campaigns/${encodeURIComponent(campaignId)}/draft`,
    { method: "GET", token: auth.token },
  );
  if (!draft.ok) return apiFailureResponse(draft);

  return NextResponse.json(draft.data, { status: 201 });
}
