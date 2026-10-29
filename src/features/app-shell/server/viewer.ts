import "server-only";

import type { DashboardViewer } from "@/features/app-shell/types";
import { readSessionUser } from "@/features/auth/server/session-user";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

/**
 * Who the shell believes it is rendering for, and what they may see.
 *
 * This is the single seam between the dashboard and authentication. A real
 * session (an HttpOnly cookie exchanged for the API's `/auth/me`) supplies the
 * identity; `dataSource` is only `live` when that lookup succeeded.
 *
 * The product layout redirects before this runs when there is no session. The
 * unauthenticated branch is deliberately empty rather than a preview persona:
 * if a future route forgets the layout, it renders no identity and no creator
 * capability instead of borrowing someone else's name.
 *
 * Capabilities are derived on the server, never trusted from the client. A route
 * that needs a capability re-checks it; a component only decides what to render.
 */
export async function getDashboardViewer(): Promise<DashboardViewer> {
  const user = await readSessionUser();
  const access = await getProgrammeAdminAccess();

  if (!user) {
    return {
      authenticated: false,
      avatarUrl: null,
      capabilities: {
        creator: false,
        ideathonParticipant: false,
        programmeOrganizer: false,
      },
      dataSource: "preview",
      displayName: null,
      handle: null,
      requiresEmailVerification: false,
    };
  }

  // A preview identity is local to the browser. It selects the preview data
  // source even though the visitor completed a real provider sign-in, so no
  // surface can mistake it for an Inverge account.
  if (user.mode === "preview") {
    return {
      authenticated: true,
      avatarUrl: user.avatarUrl,
      capabilities: {
        creator: true,
        ideathonParticipant: false,
        programmeOrganizer: access.allowed,
      },
      dataSource: "preview",
      displayName: user.displayName,
      handle: user.username,
      requiresEmailVerification: false,
    };
  }

  return {
    authenticated: true,
    avatarUrl: user.avatarUrl,
    capabilities: {
      creator: true,
      ideathonParticipant: false,
      programmeOrganizer: access.allowed,
    },
    dataSource: "live",
    displayName: user.displayName,
    handle: user.username,
    requiresEmailVerification: user.requiresEmailVerification,
  };
}
