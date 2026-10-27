import { cache } from "react";

import {
  getCampaignDiscoveryView,
  type CampaignDiscoveryView,
} from "@/features/campaigns/server/campaigns";
import {
  getLiveCampaignPage,
  parseCampaignFeedParams,
  type LiveCampaign,
  type LiveCampaignFeedParams,
} from "@/features/campaigns/server/live-campaigns";
import { isApiConfigured } from "@/lib/api/server";

/**
 * The campaign discovery index.
 *
 * A deployment with no API renders the editorial preview grid, unchanged and
 * labelled as preview. A deployment with an API renders the live catalogue and
 * only the controls that API can honour. It never mixes the two: preview
 * fixtures must not appear in a production catalogue.
 */
export type CampaignFeedSurface =
  | {
      dataSource: "preview";
      params: LiveCampaignFeedParams;
      view: CampaignDiscoveryView;
    }
  | {
      campaigns: readonly LiveCampaign[];
      dataSource: "live";
      hasMore: boolean;
      nextCursor: string | null;
      now: string;
      params: LiveCampaignFeedParams;
    };

export const getCampaignFeedSurface = cache(
  async (
    query: Record<string, string | string[] | undefined>,
  ): Promise<CampaignFeedSurface> => {
    const params = parseCampaignFeedParams(query);

    if (!isApiConfigured()) {
      return {
        dataSource: "preview",
        params,
        view: getCampaignDiscoveryView(),
      };
    }

    const page = await getLiveCampaignPage({
      cursor: params.cursor,
      sort: params.sort,
      status: params.status,
    });

    return {
      campaigns: page.campaigns,
      dataSource: "live",
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
      now: new Date().toISOString(),
      params,
    };
  },
);
