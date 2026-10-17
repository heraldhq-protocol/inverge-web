import "server-only";

import type { DashboardViewer } from "@/features/app-shell/types";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

/**
 * Who the shell believes it is rendering for, and what they may see.
 *
 * This is the single seam between the dashboard and authentication. Today the
 * web app has no session — no provider package is installed, no middleware
 * gates `/d`, and `docs/programmes-audit.md` §4 records the same finding — so
 * the values below are a clearly labelled preview identity. Nothing here is
 * authorization: when the API session lands, `getDashboardViewer()` becomes the
 * only function that changes, and it must read a server session and the API's
 * own permission projection.
 *
 * Capabilities are derived on the server, never trusted from the client. A
 * route that needs a capability re-checks it; a component only decides what to
 * render.
 */
export function getDashboardViewer(): DashboardViewer {
  const access = getProgrammeAdminAccess();

  return {
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
