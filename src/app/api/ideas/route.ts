import { NextResponse } from "next/server";

import { forwardIdeaWrite } from "@/features/idea-builder/server/forward";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  return forwardIdeaWrite(request, { body, method: "POST", path: "/ideas" });
}
