import { verificationResponse } from "@/app/api/verification/http";
import { getAdminQueues } from "@/features/verification/server/api";

export async function GET() {
  return verificationResponse(await getAdminQueues());
}
