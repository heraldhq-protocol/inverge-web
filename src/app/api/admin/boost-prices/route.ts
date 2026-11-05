import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { updateBoostPrices } from "@/features/admin/server/boost-prices";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

/** FR-904: only validated off-chain boost prices/durations reach the API. */
export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request))
    return apiFailureResponse({
      ok: false,
      status: 403,
      code: "ORIGIN_NOT_ALLOWED",
      message: "Cross-site request refused.",
    });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }
  const result = await updateBoostPrices(body);
  if (!result.ok) return apiFailureResponse(result);
  revalidatePath("/admin/boost-prices");
  return NextResponse.json(
    { mode: "live", prices: result.prices },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
