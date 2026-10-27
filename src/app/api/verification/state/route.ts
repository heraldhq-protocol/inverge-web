import { verificationResponse } from "@/app/api/verification/http";
import { getVerificationState } from "@/features/verification/server/api";

export async function GET() {
  return verificationResponse(await getVerificationState());
}
