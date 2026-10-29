import { forwardAiAccess } from "@/features/ai/server/access";

/** The caller's server-decided assistant entitlement and today's usage. */
export function GET() {
  return forwardAiAccess();
}
