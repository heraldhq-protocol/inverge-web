import { forwardIdeaWrite } from "@/features/idea-builder/server/forward";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return forwardIdeaWrite(request, {
    method: "POST",
    path: `/ideas/${encodeURIComponent(id)}/publish`,
  });
}
