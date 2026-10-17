/**
 * The stored shape of a rich pitch: a ProseMirror JSON document.
 *
 * Deliberately structural rather than imported from Tiptap. Fixtures, the API
 * payload, and the server-side reader all need this type, and none of them may
 * depend on the editor package — a browser-only editor dependency has no place
 * in a Server Component's render path.
 *
 * Mirrors the editor's own JSON types, so the document flows in and out of
 * the editor without a cast: every node declares its `type` (a ProseMirror
 * node without one does not exist) and the rest is optional. `TiptapNode.attrs`
 * carries `| undefined` because the editor types an absent attribute map that
 * way — under this project's `exactOptionalPropertyTypes`, matching that
 * exactly is what makes both directions assignable.
 */
export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown> | undefined;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

export type TiptapDoc = TiptapNode;

/**
 * Normalise a user-supplied address before it becomes a link.
 *
 * Accepts the schemes a pitch is allowed to cite and rejects anything else
 * outright: `javascript:` and `data:` are how a link becomes a script-injection
 * vector in a reader that renders anchors straight from the document.
 */
export function sanitizeUrl(raw: string): string | null {
  const value = raw.trim();

  if (/^https?:\/\/\S+$/i.test(value)) return value;
  if (/^(?:mailto:|tel:)\S+$/i.test(value)) return value;
  if (/^www\.[\w-]+(?:\.[\w-]+)+\S*$/i.test(value)) return `https://${value}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;

  return null;
}
