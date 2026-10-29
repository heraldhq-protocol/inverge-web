import { forwardIdeaWrite } from "@/features/idea-builder/server/forward";

/**
 * Requests an assistant grant. The API is idempotent and an admin decides the
 * request; this route cannot approve anything.
 */
export function POST(request: Request) {
  return forwardIdeaWrite(request, {
    method: "POST",
    path: "/ai/access-requests",
    timeoutMs: 10_000,
  });
}
