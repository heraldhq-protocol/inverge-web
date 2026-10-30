import { NextResponse } from "next/server";

import { forwardIdeaWrite } from "@/features/idea-builder/server/forward";

type RouteContext = { params: Promise<{ id: string }> };

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
    path: `/ideas/${encodeURIComponent(id)}/pre-pledge`,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return forwardIdeaWrite(request, {
    method: "DELETE",
    path: `/ideas/${encodeURIComponent(id)}/pre-pledge`,
  });
}
