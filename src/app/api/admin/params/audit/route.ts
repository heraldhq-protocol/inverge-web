import { NextResponse } from "next/server";

import { getPlatformParamsAudit } from "@/features/admin/server/params";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? undefined;
  const limit = url.searchParams.get("limit") ?? undefined;
  const offset = url.searchParams.get("offset") ?? undefined;

  const result = await getPlatformParamsAudit({ key, limit, offset });
  if (result.status !== "ready") {
    return NextResponse.json(
      {
        ok: false,
        status: 503,
        code: "UNAVAILABLE",
        message: result.message,
      },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  return NextResponse.json(
    { ok: true, items: result.data },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
