import { verificationResponse } from "@/app/api/verification/http";
import { listAdminCases } from "@/features/verification/server/api";

const ALLOWED = new Set([
  "status",
  "risk",
  "type",
  "requiresReview",
  "cursor",
  "limit",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query: Record<string, string | undefined> = {};
  for (const key of ALLOWED) {
    const value = url.searchParams.get(key);
    if (value) query[key] = value;
  }
  return verificationResponse(await listAdminCases(query));
}
