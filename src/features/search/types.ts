export type SearchHitKind = "idea" | "campaign";

/**
 * One content result rendered by the command palette.
 *
 * The shape is deliberately flat: the server resolves the canonical path,
 * status label, and ownership claim, so the client never reconstructs a route
 * or guesses whether a record belongs to the viewer.
 */
export type SearchHit = {
  id: string;
  kind: SearchHitKind;
  title: string;
  subtitle: string;
  href: string;
  status: string | null;
  statusLabel: string | null;
  isOwn: boolean;
};

export type SearchPayload = {
  ideas: SearchHit[];
  campaigns: SearchHit[];
  meta: {
    query: string;
    /** True only when an authenticated token was used for the own-content read. */
    ownIncluded: boolean;
  };
};
