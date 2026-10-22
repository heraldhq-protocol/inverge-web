import { NextResponse } from "next/server";

import { advertisingAnalyticsEnabled } from "@/features/advertising/lib/flags";
import { ingestAdvertisingEvent } from "@/features/advertising/server/event-intake";

/**
 * Advertising measurement intake.
 *
 * Supports only `ad_impression`, `ad_click`, `ad_dismiss`, and
 * `ad_destination_opened`. It is off unless `INVERGE_ADS_ANALYTICS_ENABLED=true`
 * and the browser has also been built with the matching public flag. There is no
 * event sink, so an accepted event is acknowledged as `persisted: false`; this
 * route must not be described as working analytics.
 *
 * The route never reads or stores an IP address, cookie, account id, or free
 * text. A bot-like or missing user agent is rejected before parsing.
 */

const MAX_BODY_BYTES = 2_048;

export async function POST(request: Request) {
  if (!advertisingAnalyticsEnabled()) {
    return NextResponse.json(
      { accepted: false, persisted: false, reason: "not_configured" },
      { status: 404 },
    );
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return NextResponse.json(
      { accepted: false, persisted: false, reason: "invalid" },
      { status: 400 },
    );
  }

  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { accepted: false, persisted: false, reason: "invalid" },
      { status: 413 },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { accepted: false, persisted: false, reason: "invalid" },
      { status: 400 },
    );
  }

  const result = ingestAdvertisingEvent({
    enabled: true,
    nowIso: new Date().toISOString(),
    raw,
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json(result.body, {
    ...(result.headers === undefined ? {} : { headers: result.headers }),
    status: result.status,
  });
}
