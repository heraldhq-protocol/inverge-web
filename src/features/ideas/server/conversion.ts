import "server-only";

import { readSessionToken } from "@/features/auth/server/session";
import { readSessionUser } from "@/features/auth/server/session-user";
import {
  getLiveIdea,
  toIdeaDetail,
  type ApiIdea,
} from "@/features/ideas/server/live-ideas";
import type { IdeaConversionOffer, IdeaDetail } from "@/features/ideas/types";
import { fetchApiJson } from "@/lib/api/server";

/**
 * Creator-only reads for the idea → campaign handoff.
 *
 * The API owns eligibility and ownership. This module only asks it for the
 * signed-in creator's own idea and projects the answer for the two surfaces that
 * need it: the public idea page (an action or nothing) and the campaign wizard
 * (a prefilled plan or an explanation).
 *
 * Every failure returns `null` rather than throwing. A public idea page must
 * still render when the conversion read fails; a wizard entry point can then
 * report that the idea could not be opened instead of crashing the route.
 */

type ApiCampaignRow = {
  id?: unknown;
  ideaId?: unknown;
};

async function readOwnedIdea(
  id: string,
): Promise<{ idea: ApiIdea; token: string } | null> {
  const user = await readSessionUser();
  if (!user || user.mode !== "live") return null;

  const token = await readSessionToken();
  if (!token) return null;

  try {
    const idea = await getLiveIdea(id, { includeDraft: true, token });
    if (!idea || idea.creatorId !== user.id) return null;
    return { idea, token };
  } catch {
    return null;
  }
}

async function findCampaignIdForIdea(
  token: string,
  ideaId: string,
): Promise<string | null> {
  try {
    const page = await fetchApiJson<{ data?: unknown }>(
      "/campaigns?mine=true&limit=50",
      { token },
    );
    if (!Array.isArray(page.data)) return null;

    for (const row of page.data) {
      if (!row || typeof row !== "object") continue;
      const record = row as ApiCampaignRow;
      if (record.ideaId === ideaId && typeof record.id === "string") {
        return record.id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function eligibleForConversion(idea: ApiIdea): boolean {
  if (idea.status === "CONVERTED" || idea.status === "DRAFT") return false;
  if (idea.status === "ARCHIVED") return false;
  return idea.gateProgress?.meetsThreshold === true;
}

/**
 * The action the public idea page may show. `null` means "not this creator",
 * which includes anonymous visitors, so no owner-only affordance leaks.
 */
export async function getIdeaConversionOffer(
  id: string,
): Promise<IdeaConversionOffer | null> {
  const owned = await readOwnedIdea(id);
  if (!owned) return null;

  const { idea, token } = owned;
  if (idea.status === "CONVERTED") {
    return {
      alreadyConverted: true,
      campaignId: await findCampaignIdForIdea(token, idea.id),
      canConvert: false,
    };
  }

  return {
    alreadyConverted: false,
    campaignId: null,
    canConvert: eligibleForConversion(idea),
  };
}

export type IdeaConversionSource = {
  idea: IdeaDetail;
  canConvert: boolean;
  alreadyConvertedCampaignId: string | null;
  /** Why conversion is unavailable; `null` when it is available. */
  reason: string | null;
};

/**
 * The idea a wizard may convert, with the exact reason it cannot when the API
 * says no. A converted idea resolves to its draft so a stale link resumes work
 * instead of creating a second campaign.
 */
export async function getIdeaConversionSource(
  id: string,
): Promise<IdeaConversionSource | null> {
  const owned = await readOwnedIdea(id);
  if (!owned) return null;

  const { idea, token } = owned;
  const detail = toIdeaDetail(idea);

  if (idea.status === "CONVERTED") {
    return {
      alreadyConvertedCampaignId: await findCampaignIdForIdea(token, idea.id),
      canConvert: false,
      idea: detail,
      reason: "This idea has already been turned into a campaign draft.",
    };
  }

  if (idea.status === "DRAFT") {
    return {
      alreadyConvertedCampaignId: null,
      canConvert: false,
      idea: detail,
      reason: "Publish the idea before turning it into a campaign.",
    };
  }

  if (idea.status === "ARCHIVED") {
    return {
      alreadyConvertedCampaignId: null,
      canConvert: false,
      idea: detail,
      reason: "This idea is archived and can no longer become a campaign.",
    };
  }

  if (idea.gateProgress?.meetsThreshold !== true) {
    return {
      alreadyConvertedCampaignId: null,
      canConvert: false,
      idea: detail,
      reason:
        "This idea has not cleared the validation threshold yet. Keep gathering support and feedback.",
    };
  }

  return {
    alreadyConvertedCampaignId: null,
    canConvert: true,
    idea: detail,
    reason: null,
  };
}
