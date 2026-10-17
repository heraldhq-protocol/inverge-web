import "server-only";

import type { ProgrammeRole } from "@/features/programmes/types";

export type ProgrammeAdminAccess =
  | {
      allowed: true;
      actor: { id: string; name: string; role: ProgrammeRole };
      preview: boolean;
      reason: string;
    }
  | { allowed: false; preview: false; reason: string };

/**
 * Server-side gate for the programme workspace.
 *
 * The API (`AdminGuard`) is the real authority. This web repository has no
 * authenticated session yet, so production access is denied rather than
 * simulated. Development runs as a clearly labelled preview so the workspace can
 * be reviewed, and the denial state is a real page rather than a hidden button.
 */
export function getProgrammeAdminAccess(): ProgrammeAdminAccess {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return {
      allowed: false,
      preview: false,
      reason:
        "Programme administration requires an authenticated Inverge admin session. Sign in with an admin account to continue.",
    };
  }

  return {
    actor: { id: "preview-admin", name: "Ada Admin", role: "platform_admin" },
    allowed: true,
    preview: true,
    reason:
      "Development preview. Changes stay in this browser and are never sent to the API.",
  };
}
