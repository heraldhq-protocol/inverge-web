/**
 * Serialisable view models shared between the server layout and the client
 * shell components.
 *
 * Kept out of `server/viewer.ts` because `server-only` cannot be imported by a
 * Client Component or a unit test, while the shell needs the same shapes.
 */

export type ViewerCapabilities = {
  /** Owns at least one idea, so creator modules are relevant. */
  creator: boolean;
  /** Has an ideathon entry or registration confirmed by the backend. */
  ideathonParticipant: boolean;
  /** May administer at least one programme. Server gate, never a client flag. */
  programmeOrganizer: boolean;
};

export type DashboardViewer = {
  /** Display name. Falls back to a neutral greeting, never an internal id. */
  displayName: string | null;
  /** Public handle without the leading `@`, when one exists. */
  handle: string | null;
  /** Allowlisted provider or creator avatar; `null` renders initials. */
  avatarUrl: string | null;
  /** Copy shown wherever the UI states where its data comes from. */
  dataSource: "preview" | "live";
  /**
   * True when the live API still wants the account email confirmed. Preview
   * identities never reach the API and therefore never carry this prompt.
   */
  requiresEmailVerification: boolean;
  /**
   * True when a session exists, including a local preview session. The preview
   * identity rendered while signed out leaves this false.
   */
  authenticated?: boolean;
  capabilities: ViewerCapabilities;
};

/** One row in the header notification menu. */
export type ShellNotification = {
  href: string;
  id: string;
  isRead: boolean;
  message: string;
  timeLabel: string;
  title: string;
};

/** Everything the shell needs. The layout assembles it on the server. */
export type ShellData = {
  notifications: ShellNotification[];
  unreadCount: number;
  viewer: DashboardViewer;
};
