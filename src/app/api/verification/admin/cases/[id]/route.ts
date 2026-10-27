import { verificationResponse } from "@/app/api/verification/http";
import { getAdminCase } from "@/features/verification/server/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return verificationResponse(await getAdminCase(id));
}
