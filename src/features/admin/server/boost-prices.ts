import "server-only";

import {
  boostPricesResponseSchema,
  boostPricesWireUpdate,
  boostPriceUpdateSchema,
  matchesBoostPriceUpdate,
  type BoostPrices,
} from "@/features/admin/lib/boost-prices";
import {
  adminReadUnavailable,
  adminWriteFailure,
  requireAdminApiSession,
  type AdminRead,
} from "@/features/admin/server/admin-api";
import {
  fetchApiJson,
  sendApiJson,
  type ApiWriteFailure,
} from "@/lib/api/server";

export async function getBoostPrices(): Promise<AdminRead<BoostPrices>> {
  const session = await requireAdminApiSession();
  if (!session.ok) return { status: "unavailable", message: session.message };
  try {
    const response = await fetchApiJson<unknown>("/admin/boost-prices", {
      token: session.token,
    });
    return { status: "ready", data: boostPricesResponseSchema.parse(response) };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}

function unconfirmedPrices(
  status = 502,
  code = "INVALID_RESPONSE",
): ApiWriteFailure {
  return {
    ok: false,
    status: status || 503,
    code,
    message:
      "The service did not confirm all changes. Some prices or durations may already have been saved. Reload prices before trying again.",
  };
}

/** FR-206 / FR-904: the API owns prices and their audit; no on-chain parameter is sent. */
export async function updateBoostPrices(
  input: unknown,
): Promise<{ ok: true; prices: BoostPrices } | ApiWriteFailure> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  const parsed = boostPriceUpdateSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message:
        "Provide a positive USD price in exact cents or a whole duration from 1 to 365 days.",
    };
  const response = await sendApiJson("/admin/boost-prices", {
    method: "PATCH",
    token: session.token,
    body: boostPricesWireUpdate(parsed.data),
  });
  if (!response.ok) {
    if (response.status === 0 || response.status >= 500)
      return unconfirmedPrices(response.status, response.code);
    return adminWriteFailure(response);
  }
  const receipt = boostPricesResponseSchema.safeParse(response.data);
  if (!receipt.success || !matchesBoostPriceUpdate(receipt.data, parsed.data))
    return unconfirmedPrices();
  return { ok: true, prices: receipt.data };
}
