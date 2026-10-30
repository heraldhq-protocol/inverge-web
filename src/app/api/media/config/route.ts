import { NextResponse } from "next/server";

import { readMediaCapabilities } from "@/features/media/server/media";

/**
 * What this deployment accepts, so the uploader can state the real limit and
 * hide a control that would only fail.
 *
 * `no-store`: enabling storage is a deploy-time change, and a cached "disabled"
 * would outlive it.
 */
export async function GET() {
  const capabilities = await readMediaCapabilities();

  if (!capabilities) {
    return NextResponse.json(
      {
        allowedImageTypes: [],
        maxImageBytes: 0,
        provider: "disabled",
        uploadsEnabled: false,
        videoUploadEnabled: false,
        youtubeMetadataEnabled: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(capabilities, {
    headers: { "Cache-Control": "no-store" },
  });
}
