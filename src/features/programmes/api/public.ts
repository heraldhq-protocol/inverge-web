import "server-only";

import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
} from "@/lib/api/server";
import type {
  ProgrammeListPage,
  PublicProgramme,
  PublicProgrammeEntries,
} from "./types";

/**
 * Read-only access to the public programme API.
 *
 * A page must render a truthful unavailable state rather than an empty list when
 * the API cannot answer. Every failure below is therefore classified, never
 * swallowed into "there are no programmes".
 */

export type ProgrammeReadFailure = {
  ok: false;
  code:
    | "API_NOT_CONFIGURED"
    | "API_UNREACHABLE"
    | "NOT_PUBLIC"
    | "NOT_FOUND"
    | "API_ERROR";
  message: string;
  status: number;
};

export type ProgrammeReadResult<T> =
  { ok: true; data: T } | ProgrammeReadFailure;

function failure(
  code: ProgrammeReadFailure["code"],
  message: string,
  status = 0,
) {
  return { ok: false, code, message, status } as const;
}

function classify(error: unknown): ProgrammeReadFailure {
  if (error instanceof ApiRequestError) {
    if (error.code === "ENTRIES_NOT_PUBLIC") {
      return failure("NOT_PUBLIC", "Entries are not public yet.", 404);
    }
    if (error.status === 404) {
      return failure("NOT_FOUND", "This programme could not be found.", 404);
    }
    if (error.code === "API_NOT_CONFIGURED") {
      return failure(
        "API_NOT_CONFIGURED",
        "The programme service is not configured for this deployment.",
      );
    }
    if (error.status === 0 || error.code === "API_UNREACHABLE") {
      return failure(
        "API_UNREACHABLE",
        "The programme service could not be reached.",
      );
    }
    return failure("API_ERROR", error.message, error.status);
  }

  return failure(
    "API_ERROR",
    "The programme service returned an unexpected response.",
  );
}

async function read<T>(path: string): Promise<ProgrammeReadResult<T>> {
  if (!isApiConfigured()) {
    return failure(
      "API_NOT_CONFIGURED",
      "The programme service is not configured for this deployment.",
    );
  }

  try {
    return {
      ok: true,
      data: await fetchApiJson<T>(path, { timeoutMs: 8_000 }),
    };
  } catch (error) {
    return classify(error);
  }
}

export type PublicProgrammeQuery = {
  type?: string;
  status?: string;
  category?: string;
  limit?: number;
  cursor?: string;
};

export function fetchProgrammePage(
  query: PublicProgrammeQuery = {},
): Promise<ProgrammeReadResult<ProgrammeListPage>> {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  if (query.status) params.set("status", query.status);
  if (query.category) params.set("category", query.category);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);

  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return read<ProgrammeListPage>(`/programmes${suffix}`);
}

const MAX_PROGRAMME_PAGES = 5;

/** Reads every currently public programme, bounded so a bad cursor cannot loop. */
export async function fetchPublicProgrammes(): Promise<
  ProgrammeReadResult<PublicProgramme[]>
> {
  const programmes: PublicProgramme[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PROGRAMME_PAGES; page += 1) {
    const query: PublicProgrammeQuery = { limit: 50 };
    if (cursor !== undefined) query.cursor = cursor;
    const result = await fetchProgrammePage(query);
    if (!result.ok) return result;

    programmes.push(...result.data.data);
    if (!result.data.page.hasMore || !result.data.page.nextCursor) break;
    cursor = result.data.page.nextCursor;
  }

  return { ok: true, data: programmes };
}

export function fetchPublicProgramme(
  slug: string,
): Promise<ProgrammeReadResult<PublicProgramme>> {
  return read<PublicProgramme>(`/programmes/${encodeURIComponent(slug)}`);
}

export async function fetchPublicEntries(
  slug: string,
): Promise<ProgrammeReadResult<PublicProgrammeEntries>> {
  const result = await read<PublicProgrammeEntries>(
    `/programmes/${encodeURIComponent(slug)}/entries`,
  );
  if (!result.ok && result.code === "NOT_PUBLIC") {
    return { ok: true, data: { data: [], resultsPublic: false } };
  }
  return result;
}
