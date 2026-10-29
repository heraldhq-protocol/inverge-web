import "server-only";

import { readSessionUser } from "@/features/auth/server/session-user";
import type { ProgrammeRole } from "@/features/programmes/types";

export type ProgrammeAdminAccess =
  | {
      allowed: true;
      actor: { id: string; name: string; role: ProgrammeRole };
      preview: boolean;
      reason: string;
    }
  | { allowed: false; preview: false; reason: string };

function denied(reason: string): ProgrammeAdminAccess {
  return { allowed: false, preview: false, reason };
}

/**
 * Server-side gate for the programme workspace.
 *
 * Authentication is necessary but not sufficient: the account must hold the
 * API's `ADMIN` role. The API (`AdminGuard`) remains the authority for every
 * privileged operation; this gate only decides whether the workspace shell is
 * allowed to render. A preview identity is accepted only in development and is
 * clearly labelled, because it has no backend authority.
 */
export async function getProgrammeAdminAccess(): Promise<ProgrammeAdminAccess> {
  const user = await readSessionUser();

  if (!user) {
    return denied(
      "Programme administration requires an authenticated Inverge admin session. Sign in with an admin account to continue.",
    );
  }

  if (user.mode === "preview") {
    if (process.env.NODE_ENV === "production") {
      return denied(
        "Programme administration requires an authenticated Inverge admin session.",
      );
    }

    return {
      actor: {
        id: user.id,
        name: user.displayName ?? "Preview admin",
        role: "platform_admin",
      },
      allowed: true,
      preview: true,
      reason:
        "Development preview. Changes stay in this browser and are never sent to the API.",
    };
  }

  if (user.role !== "ADMIN") {
    return denied(
      "Programme administration requires an administrator account. Ask an Inverge administrator for access.",
    );
  }

  return {
    actor: {
      id: user.id,
      name: user.displayName ?? "Inverge admin",
      role: "platform_admin",
    },
    allowed: true,
    preview: false,
    reason: "Signed in with an Inverge administrator account.",
  };
}
