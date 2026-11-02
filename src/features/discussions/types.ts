/**
 * One comment as every discussion surface may render it.
 *
 * The API owns the author projection: a comment never carries an email, wallet
 * or address, only the opaque account id and the public profile fields. The
 * client uses `author.id` to decide whether the viewer may delete the row.
 */
export type DiscussionAuthor = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  isCreator: boolean;
};

export type DiscussionComment = {
  id: string;
  body: string;
  createdAt: string;
  author: DiscussionAuthor;
  /** The creator pinned this comment in an idea thread. */
  pinned?: boolean;
  likeCount?: number;
};

/** The signed-in viewer, or the anonymous visitor, as a discussion sees them. */
export type DiscussionViewer = {
  id: string | null;
  signedIn: boolean;
  displayName: string | null;
  avatarUrl: string | null;
};

export type DiscussionPage = {
  comments: DiscussionComment[];
  hasMore: boolean;
  nextCursor: string | null;
};
