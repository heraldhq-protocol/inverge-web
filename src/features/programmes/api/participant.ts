import "server-only";

import { sendApiJson } from "@/lib/api/server";
import type { ParticipantProgramme, PublicProgramme } from "./types";

/**
 * Authenticated reads for the participant workspace.
 *
 * These deliberately use `sendApiJson` rather than `fetchApiJson` so an expired
 * session (401) is distinguishable from an empty workspace. A participant must
 * see "sign in again", never "you have no entries".
 */

export type ParticipantReadResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; message: string };

export type MyIdea = {
  id: string;
  slug: string;
  title: string;
  status: string;
  category: string;
  qualityScore: number | null;
  coverImageUrl: string | null;
};

type IdeaListResponse = {
  data?: unknown;
};

function asMyIdea(value: unknown): MyIdea | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.title !== "string") return null;
  const quality = row.qualityScore;
  return {
    id: row.id,
    slug: typeof row.slug === "string" ? row.slug : row.id,
    title: row.title,
    status: typeof row.status === "string" ? row.status : "DRAFT",
    category: typeof row.category === "string" ? row.category : "",
    qualityScore:
      typeof quality === "number"
        ? quality
        : typeof quality === "string" && quality.trim()
          ? Number(quality)
          : null,
    coverImageUrl:
      typeof row.coverImageUrl === "string" ? row.coverImageUrl : null,
  };
}

export async function fetchMyIdeas(
  token: string,
): Promise<ParticipantReadResult<MyIdea[]>> {
  const result = await sendApiJson("/ideas?mine=true&limit=50", {
    method: "GET",
    token,
  });
  if (!result.ok) return result;

  const body = result.data as IdeaListResponse | null;
  const rows = Array.isArray(body?.data) ? body.data : [];
  return {
    ok: true,
    data: rows.flatMap((row) => {
      const idea = asMyIdea(row);
      return idea ? [idea] : [];
    }),
  };
}

export function fetchParticipantProgramme(
  token: string,
  slug: string,
): Promise<ParticipantReadResult<ParticipantProgramme>> {
  return sendApiJson(`/programmes/${encodeURIComponent(slug)}/me`, {
    method: "GET",
    token,
  }).then((result) =>
    result.ok
      ? { ok: true, data: result.data as ParticipantProgramme }
      : result,
  );
}

/**
 * Public programmes the participant can act on. The workspace shows open and
 * upcoming editions; closed editions remain reachable through the archive.
 */
export async function fetchOpenCatalog(
  token: string | null,
): Promise<ParticipantReadResult<PublicProgramme[]>> {
  const result = await sendApiJson("/programmes?limit=50", {
    method: "GET",
    token,
  });
  if (!result.ok) return result;

  const body = result.data as { data?: unknown } | null;
  const rows = Array.isArray(body?.data) ? body.data : [];
  return { ok: true, data: rows as PublicProgramme[] };
}
