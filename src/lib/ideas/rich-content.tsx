import React from 'react';
import Image from 'next/image';

/**
 * Renders a Tiptap document.
 *
 * **The editor is Tiptap; the reader is not.** A pitch is written once and read thousands of times, so
 * shipping ProseMirror to every reader to display static prose would put an editor bundle on the
 * critical path of the most-visited page in the product, on the mid-range Android and metered data this
 * audience actually uses (conventions §10). Instead the editor stores Tiptap's JSON and this walks that
 * tree on the server, emitting React elements.
 *
 * That also closes the injection question. There is no `dangerouslySetInnerHTML` anywhere: a node type
 * this renderer does not know is dropped, a mark it does not know is ignored, and link and image URLs
 * are scheme-checked, so a hostile pitch cannot inject markup into a page that also shows money.
 */

export type TiptapMark = { type: string; attrs?: Record<string, unknown> };

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

export type TiptapDoc = { type: 'doc'; content?: TiptapNode[] };

const SAFE_SCHEME = /^https?:\/\//i;

function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return SAFE_SCHEME.test(trimmed) ? trimmed : null;
}

function attrString(attrs: Record<string, unknown> | undefined, key: string): string {
  const value = attrs?.[key];
  return typeof value === 'string' ? value : '';
}

/** Applies the marks on a text node, innermost first. Unknown marks fall through as plain text. */
function withMarks(text: string, marks: TiptapMark[] | undefined, key: string): React.ReactNode {
  if (!marks?.length) return text;

  return marks.reduce<React.ReactNode>((node, mark, i) => {
    const markKey = `${key}-m${i}`;
    switch (mark.type) {
      case 'bold':
        return (
          <strong key={markKey} className="font-semibold text-ink">
            {node}
          </strong>
        );
      case 'italic':
        return <em key={markKey}>{node}</em>;
      case 'strike':
        return (
          <s key={markKey} className="text-ink-muted">
            {node}
          </s>
        );
      case 'code':
        return (
          <code key={markKey} className="rounded bg-ink/6 px-1 py-0.5 font-mono text-[0.9em]">
            {node}
          </code>
        );
      case 'link': {
        const href = safeUrl(mark.attrs?.href);
        if (!href) return node;
        return (
          <a
            key={markKey}
            href={href}
            target="_blank"
            // A pitch is user-submitted content, so links do not pass authority or referrer.
            rel="noreferrer nofollow"
            className="rounded font-medium text-accent-700 underline decoration-accent-700/30 underline-offset-2 hover:decoration-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            {node}
          </a>
        );
      }
      default:
        return node;
    }
  }, text);
}

function renderNodes(nodes: TiptapNode[] | undefined, keyPrefix: string): React.ReactNode[] {
  if (!nodes?.length) return [];
  return nodes.map((node, i) => renderNode(node, `${keyPrefix}-${i}`));
}

function renderNode(node: TiptapNode, key: string): React.ReactNode {
  switch (node.type) {
    case 'text':
      return <React.Fragment key={key}>{withMarks(node.text ?? '', node.marks, key)}</React.Fragment>;

    case 'paragraph': {
      // Tiptap emits an empty paragraph for a blank line; rendering it would add stray vertical space.
      if (!node.content?.length) return null;
      return (
        <p key={key} className="my-3 first:mt-0 last:mb-0">
          {renderNodes(node.content, key)}
        </p>
      );
    }

    case 'heading': {
      const level = Number(node.attrs?.level ?? 2);
      // The page owns h1 and the section owns h2, so a pitch heading starts at h3: a creator cannot
      // break the document outline from inside the editor (conventions §8, heading levels never skip).
      const Tag = (level <= 2 ? 'h3' : 'h4') as 'h3' | 'h4';
      return (
        <Tag
          key={key}
          className={
            level <= 2
              ? 'mt-6 mb-2 font-display text-base font-bold tracking-tight text-ink'
              : 'mt-5 mb-2 font-display text-sm font-bold tracking-tight text-ink'
          }
        >
          {renderNodes(node.content, key)}
        </Tag>
      );
    }

    case 'bulletList':
      return (
        <ul key={key} className="my-3 list-disc space-y-1 pl-5">
          {renderNodes(node.content, key)}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={key} className="my-3 list-decimal space-y-1 pl-5">
          {renderNodes(node.content, key)}
        </ol>
      );

    case 'listItem':
      return (
        <li key={key} className="[&>p]:my-0">
          {renderNodes(node.content, key)}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote key={key} className="my-4 border-l-2 border-accent-500/40 pl-3 text-ink-muted">
          {renderNodes(node.content, key)}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre
          key={key}
          className="my-4 overflow-x-auto rounded-lg border border-border bg-paper p-3 font-mono text-xs text-ink"
        >
          <code>{renderNodes(node.content, key)}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={key} className="my-6 border-border" />;

    case 'hardBreak':
      return <br key={key} />;

    case 'image': {
      const src = safeUrl(node.attrs?.src);
      if (!src) return null;
      const alt = attrString(node.attrs, 'alt');
      const caption = attrString(node.attrs, 'title');
      return (
        <figure key={key} className="my-5 overflow-hidden rounded-xl border border-border">
          {/* Explicit dimensions plus `h-auto` keep the aspect ratio without reserving the wrong box,
              which is the single biggest CLS lever on a page like this (conventions §10). */}
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
            unoptimized
          />
          {caption && (
            <figcaption className="border-t border-border bg-paper px-3 py-2 text-xs text-ink-muted">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      // Unknown node: render its children if it has any, drop it otherwise. Never emit raw markup.
      return node.content?.length ? (
        <React.Fragment key={key}>{renderNodes(node.content, key)}</React.Fragment>
      ) : null;
  }
}

export function RichContent({ doc, className }: { doc: TiptapDoc | null | undefined; className?: string }) {
  if (!doc?.content?.length) return null;
  return <div className={className}>{renderNodes(doc.content, 'n')}</div>;
}

/** Flattens a document to plain text, for card summaries, meta descriptions and OpenGraph. */
export function tiptapToPlainText(doc: TiptapDoc | null | undefined): string {
  if (!doc?.content) return '';
  const out: string[] = [];
  const walk = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'text' && node.text) out.push(node.text);
      if (node.content) walk(node.content);
      if (node.type === 'paragraph' || node.type === 'heading') out.push(' ');
    }
  };
  walk(doc.content);
  return out.join('').replace(/\s+/g, ' ').trim();
}

/** Wraps plain text as a minimal document, so existing plain-string fixtures still render. */
export function plainTextToDoc(text: string): TiptapDoc {
  return {
    type: 'doc',
    content: text
      .split(/\n{2,}/)
      .filter((block) => block.trim())
      .map((block) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: block.trim() }],
      })),
  };
}
