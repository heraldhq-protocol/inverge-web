import { NextResponse } from "next/server";

import { forwardIdeaWrite } from "@/features/idea-builder/server/forward";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  return forwardIdeaWrite(request, {
    body,
    method: "PUT",
    path: `/ideas/${encodeURIComponent(id)}/survey`,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  return forwardIdeaWrite(request, {
    body,
    method: "POST",
    path: `/ideas/${encodeURIComponent(id)}/survey/responses`,
  });
}
