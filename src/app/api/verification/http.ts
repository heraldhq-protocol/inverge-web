import { NextResponse } from "next/server";

import type { VerificationResult } from "@/features/verification/server/api";

/** Forwards the API failure intact so the client can switch on `code`. */
export function verificationResponse<T>(result: VerificationResult<T>) {
  if (result.ok) return NextResponse.json(result.data);
  return NextResponse.json(
    {
      error: {
        code: result.code,
        message: result.message,
        ...(result.details === undefined ? {} : { blockers: result.details }),
      },
    },
    { status: result.status === 0 ? 502 : result.status },
  );
}
