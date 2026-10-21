import "server-only";

import type { DashboardViewer } from "@/features/app-shell/types";
import { readSessionUser } from "@/features/auth/server/session-user";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

/**
 * Who the shell believes it is rendering for, and what they may see.
 *
 * This is the single seam between the dashboard and authentication. A real
 * session (an HttpOnly cookie exchanged for the API's `/auth/me`) supplies the
 * identity; `dataSource` is only `live` when that lookup succeeded. Otherwise
 * the shell renders the clearly labelled preview identity, so a missing API or
 * an expired session degrades to something honest instead of a blank dashboard.
 *
 * Capabilities are derived on the server, never trusted from the client. A route
 * that needs a capability re-checks it; a component only decides what to render.
 * The API's own permission projection is not exposed yet, so `creator` stays
 * available to every member — Inverge is two-sided by design — and
 * `programmeOrganizer` remains the existing development preview gate.
 */
export async function getDashboardViewer(): Promise<DashboardViewer> {
  const user = await readSessionUser();
  const access = getProgrammeAdminAccess();

  if (!user) {
    return {
      authenticated: false,
      capabilities: {
        creator: true,
        // No registration exists to confirm, so participation is never claimed.
        ideathonParticipant: false,
        programmeOrganizer: access.allowed,
      },
      dataSource: "preview",
      displayName: "Amara Okonkwo",
      handle: "amaraokonkwo",
    };
  }

  // A preview identity is local to the browser. It selects the preview data
  // source even though the visitor completed a real provider sign-in, so no
  // surface can mistake it for an Inverge account.
  if (user.mode === "preview") {
    return {
      authenticated: true,
      capabilities: {
        creator: true,
        ideathonParticipant: false,
        programmeOrganizer: access.allowed,
      },
      dataSource: "preview",
      displayName: user.displayName,
      handle: user.username,
    };
  }

  return {
    authenticated: true,
    capabilities: {
      creator: true,
      ideathonParticipant: false,
      programmeOrganizer: access.allowed,
    },
    dataSource: "live",
    displayName: user.displayName,
    handle: user.username,
  };
}
