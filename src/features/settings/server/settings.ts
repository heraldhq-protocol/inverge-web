import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionUser } from "@/features/auth/server/session-user";
import { settingsPreviewData } from "@/features/settings/content/preview-data";
import type { SettingsData } from "@/features/settings/types";
import { isApiConfigured } from "@/lib/api/server";

export type SettingsView = {
  data: SettingsData;
  dataSource: "live" | "preview";
};

export type SettingsResult =
  | { status: "ready"; view: SettingsView }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

export async function getSettingsView(): Promise<SettingsResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    return {
      status: "ready",
      view: { data: settingsPreviewData, dataSource: "preview" },
    };
  }

  const user = await readSessionUser();
  if (!user) return { status: "signed_out" };

  return {
    status: "ready",
    view: {
      data: {
        // Only fields the API actually stores are populated. Location, feed
        // preferences, and notification preferences have no endpoint yet, so
        // the page does not render their preview controls in live mode.
        profile: {
          avatarUrl: user.avatarUrl,
          bio: user.bio ?? "",
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          location: "",
          username: user.username ?? "",
        },
        connections: user.email
          ? [
              {
                actionLabel: "Manage",
                detail: user.email,
                id: "email",
                label: "Email address",
                status: "verified",
              },
            ]
          : [],
        feed: { region: "global", showPromoted: true, topics: [] },
        notifications: {
          "creator-updates": false,
          "discovery-digest": false,
          "email-updates": false,
          "milestone-reviews": false,
        },
      },
      dataSource: "live",
    },
  };
}
