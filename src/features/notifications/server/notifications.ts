import "server-only";

import { cache } from "react";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { notificationsPreviewData } from "@/features/notifications/content/preview-data";
import type {
  NotificationKind,
  NotificationRecord,
} from "@/features/notifications/types";
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";

type ApiNotification = {
  id: string;
  template: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

type ApiNotificationPage = {
  data: ApiNotification[];
  page: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type NotificationsView = {
  dataSource: "live" | "preview";
  items: NotificationRecord[];
  truncated: boolean;
};

export type NotificationsResult =
  | { status: "ready"; view: NotificationsView }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

type TemplateCopy = {
  kind: NotificationKind;
  title: string;
  message: string;
  actionLabel: string;
};

const TEMPLATE_COPY: Readonly<Record<string, TemplateCopy>> = {
  CAMPAIGN_FUNDED: {
    actionLabel: "View campaign",
    kind: "campaigns",
    message: "The campaign reached its funding target and is moving into delivery.",
    title: "Campaign funded successfully",
  },
  MILESTONE_APPROVED: {
    actionLabel: "View progress",
    kind: "milestones",
    message: "A milestone was approved and the campaign is moving to its next delivery stage.",
    title: "Milestone approved",
  },
  MILESTONE_REVIEW_OPEN: {
    actionLabel: "Review milestone",
    kind: "milestones",
    message: "Submitted evidence is ready for review. The objection window is open.",
    title: "A milestone is ready for review",
  },
  MILESTONE_SUBMITTED: {
    actionLabel: "View proof",
    kind: "milestones",
    message: "A creator submitted evidence for a milestone on a campaign you follow.",
    title: "New milestone evidence",
  },
  REFUND_AVAILABLE: {
    actionLabel: "View refund",
    kind: "refunds",
    message: "A campaign did not complete as planned. Check whether you have an eligible refund.",
    title: "A refund is available",
  },
  WAITLIST_CONVERSION: {
    actionLabel: "View campaign",
    kind: "campaigns",
    message: "An idea you supported moved into a campaign. Follow it to see the next milestone.",
    title: "An idea you supported became a campaign",
  },
};

function stringData(
  data: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function humanizeTemplate(template: string): string {
  const words = template.replace(/[_-]+/g, " ").trim().toLocaleLowerCase();
  return words ? words[0]!.toLocaleUpperCase() + words.slice(1) : "Update";
}

function dateFor(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function groupFor(date: Date, now: Date): NotificationRecord["group"] {
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const startOfCreated = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  if (startOfCreated === startOfToday) return "today";
  if (startOfToday - startOfCreated < 7 * 86_400_000) return "this-week";
  return "older";
}

function timeLabelFor(date: Date, now: Date): string {
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (hours < 48) return "Yesterday";

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/**
 * Projects one API notification without trusting template parameters as prose.
 *
 * Only opaque ids are read from `data`; titles and messages come from the
 * template table, so a malformed or hostile parameter cannot become page copy.
 * An unknown template still renders as a generic update rather than being
 * dropped.
 */
export function toNotificationRecord(
  row: ApiNotification,
  now = new Date(),
): NotificationRecord {
  const createdAt = dateFor(row.createdAt) ?? now;
  const copy = TEMPLATE_COPY[row.template] ?? {
    actionLabel: "View updates",
    kind: "campaigns" as const,
    message: "You have a new update from Inverge.",
    title: humanizeTemplate(row.template),
  };
  const campaignId = stringData(row.data, "campaignId");
  const ideaId = stringData(row.data, "ideaId");
  const actionHref = campaignId
    ? `/campaigns/${encodeURIComponent(campaignId)}`
    : ideaId
      ? `/ideas/${encodeURIComponent(ideaId)}`
      : "/d/notifications";

  return {
    actionHref,
    actionLabel: copy.actionLabel,
    artwork: copy.kind === "refunds" ? "refund" : "community",
    group: groupFor(createdAt, now),
    id: row.id,
    isRead: row.readAt !== null,
    kind: copy.kind,
    message: copy.message,
    occurredAt: createdAt.toISOString(),
    timeLabel: timeLabelFor(createdAt, now),
    title: copy.title,
  };
}

function unavailable(error: unknown): NotificationsResult {
  const status = error instanceof ApiRequestError ? error.status : null;
  return {
    reason:
      status !== null && status >= 500
        ? "The notification service is temporarily unavailable. Try again."
        : "We could not load your notifications. Try again.",
    status: "unavailable",
  };
}

export const getNotificationsView = cache(
  async (): Promise<NotificationsResult> => {
    if (isPreviewAuth() || !isApiConfigured()) {
      return {
        status: "ready",
        view: {
          dataSource: "preview",
          items: notificationsPreviewData,
          truncated: false,
        },
      };
    }

    const token = await readSessionToken();
    if (!token) return { status: "signed_out" };

    try {
      const page = await fetchApiJson<ApiNotificationPage>(
        "/me/notifications?limit=50",
        { token },
      );
      const now = new Date();

      return {
        status: "ready",
        view: {
          dataSource: "live",
          items: page.data.map((row) => toNotificationRecord(row, now)),
          truncated: page.page.hasMore,
        },
      };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        return { status: "signed_out" };
      }
      return unavailable(error);
    }
  },
);
