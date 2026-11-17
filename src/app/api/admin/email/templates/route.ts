import { NextResponse } from "next/server";

import { getEmailTemplates } from "@/features/admin/server/editorial-email";

export async function GET() {
  const result = await getEmailTemplates();
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
    { ok: true, templates: result.data },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
