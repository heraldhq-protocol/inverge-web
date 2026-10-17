import { Fragment, type ReactNode } from "react";

import type { TiptapDoc, TiptapNode } from "@/lib/rich-text";

/**
 * Render a stored pitch document.
 *
 * Deliberately a small reader rather than a Tiptap render: the pitch arrives as
 * ProseMirror JSON and a Server Component must not pull a browser-only editor
 * into its render path. It handles the nodes the editor can produce — headings,
 * paragraphs, lists, bold, italic, code — and renders anything it does not know
 * as its children, so an unexpected node degrades to its text rather than
 * disappearing.
 */

function renderText(node: TiptapNode, key: number): ReactNode {
  let content: ReactNode = node.text ?? "";
  const marks = node.marks ?? [];

  if (marks.some((mark) => mark.type === "code")) {
    content = (
      <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
        {content}
      </code>
    );
  }
  if (marks.some((mark) => mark.type === "italic")) {
    content = <em>{content}</em>;
  }
  if (marks.some((mark) => mark.type === "bold")) {
    content = <strong className="font-semibold text-ink">{content}</strong>;
  }

  return <Fragment key={key}>{content}</Fragment>;
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  const children = node.content?.map((child, index) => renderNode(child, index));

  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{children}</Fragment>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading":
      return node.attrs?.level === 3 ? (
        <h3 key={key}>{children}</h3>
      ) : (
        <h2 key={key}>{children}</h2>
      );
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "hardBreak":
      return <br key={key} />;
    case "text":
      return renderText(node, key);
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

export function RichText({
  doc,
  className = "",
}: {
  doc: TiptapDoc;
  className?: string;
}) {
  return (
    <div
      className={`text-[1.02rem] leading-8 text-muted [&>*+*]:mt-5 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6 ${className}`}
    >
      {doc.content?.map((child, index) => renderNode(child, index))}
    </div>
  );
}
