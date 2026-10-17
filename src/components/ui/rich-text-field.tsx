"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from "lucide-react";

import { sanitizeUrl, type TiptapDoc } from "@/lib/rich-text";

const DEFAULT_PLACEHOLDER =
  "Tell readers what you are building, who it is for, and why it will work.";

const EMPTY_DOC: TiptapDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function ToolButton({
  label,
  active = false,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40 ${
        active
          ? "bg-brand/10 text-brand-strong"
          : "text-muted hover:bg-ink/[0.06] hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ToolSeparator() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />;
}

function promptForUrl(title: string, initial: string): string | null {
  const answer = window.prompt(title, initial);
  if (answer === null || !answer.trim()) return null;
  return sanitizeUrl(answer);
}

function setLink(editor: Editor) {
  const current =
    (editor.getAttributes("link").href as string | undefined) ?? "";
  const href = current
    ? promptForUrl("Link address", current)
    : promptForUrl("Link address", "https://");

  if (href === null) {
    if (!current) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
}

function insertImage(editor: Editor) {
  const href = promptForUrl("Image address (https://…)", "https://");
  if (!href) return;
  editor.chain().focus().setImage({ src: href, alt: "" }).run();
}

function ToolBar({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled?: boolean;
}) {
  const off = disabled || !editor;

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5"
    >
      <ToolButton
        label="Bold"
        disabled={off}
        active={editor?.isActive("bold") ?? false}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton
        label="Italic"
        disabled={off}
        active={editor?.isActive("italic") ?? false}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolButton>

      <ToolSeparator />

      <ToolButton
        label="Section heading"
        disabled={off}
        active={editor?.isActive("heading", { level: 2 }) ?? false}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Subheading"
        disabled={off}
        active={editor?.isActive("heading", { level: 3 }) ?? false}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="size-4" />
      </ToolButton>

      <ToolSeparator />

      <ToolButton
        label="Bulleted list"
        disabled={off}
        active={editor?.isActive("bulletList") ?? false}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        disabled={off}
        active={editor?.isActive("orderedList") ?? false}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolButton>

      <ToolSeparator />

      <ToolButton
        label="Add link"
        disabled={off}
        active={editor?.isActive("link") ?? false}
        onClick={() => editor && setLink(editor)}
      >
        <Link2 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Insert image"
        disabled={off}
        onClick={() => editor && insertImage(editor)}
      >
        <ImageIcon className="size-4" />
      </ToolButton>

      <ToolSeparator />

      <ToolButton
        label="Undo"
        disabled={off || !editor?.can().chain().focus().undo().run()}
        onClick={() => editor?.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Redo"
        disabled={off || !editor?.can().chain().focus().redo().run()}
        onClick={() => editor?.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" />
      </ToolButton>
    </div>
  );
}

/**
 * Rich pitch editor.
 *
 * Uncontrolled after mount: the document passed in seeds the editor once and
 * every change flows back out through `onChange`. The parent may replace `value`
 * wholesale (a "start over" reset) — that is the only time the editor rewrites
 * its own contents, guarded by referential identity so a value this editor just
 * emitted never re-applies itself.
 *
 * `immediatelyRender: false` keeps Tiptap out of the server render and the first
 * client render, which is what a Next.js app needs to stay hydration-safe.
 *
 * The field draws no chrome of its own label — wrap it in `Field` and pass
 * `id`/`describedBy` down so the label and errors actually reach the editor.
 *
 * Uses the `useEditor` + `<EditorContent />` hook API rather than the newer
 * Composable API: the toolbar lives beside the editor in one component, so
 * there is no tree to thread context through.
 */
export function RichTextField({
  value,
  onChange,
  id,
  describedBy,
  invalid = false,
  placeholder = DEFAULT_PLACEHOLDER,
  target,
  className = "",
}: {
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  id?: string;
  describedBy?: string;
  invalid?: boolean;
  placeholder?: string;
  /** Soft character target for the counter. Omit to hide it. */
  target?: number;
  className?: string;
}) {
  const [chars, setChars] = useState(0);
  const emitted = useRef<TiptapDoc | null>(value);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value ?? EMPTY_DOC,
    editorProps: {
      // Tiptap's attribute map is `Record<string, string>`, so optional wiring
      // has to be omitted rather than passed as undefined.
      attributes: {
        class:
          "inv-prose min-h-40 px-4 py-3 text-[0.9375rem] leading-relaxed text-ink focus:outline-none",
        ...(id ? { id } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
    },
    onCreate: ({ editor: instance }) => setChars(instance.getText().length),
    onUpdate: ({ editor: instance }) => {
      const doc: TiptapDoc = instance.getJSON();
      emitted.current = doc;
      setChars(instance.getText().length);
      onChange(doc);
    },
  });

  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(value ?? EMPTY_DOC);
  }, [editor, value]);

  return (
    <div className={className}>
      <div
        className={`overflow-hidden rounded-xl border bg-surface transition focus-within:ring-3 ${
          invalid
            ? "border-danger focus-within:border-danger focus-within:ring-danger/12"
            : "border-border hover:border-muted/45 focus-within:border-brand focus-within:ring-brand/12"
        }`}
      >
        <ToolBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {target !== undefined ? (
        <p
          className={`mt-1.5 text-right text-xs tabular-nums ${
            chars > target ? "font-semibold text-ink" : "text-muted/70"
          }`}
          title={
            chars > target
              ? `Aim for about ${target} characters. Longer is allowed — readers expand the pitch.`
              : undefined
          }
        >
          {chars}/{target}
        </p>
      ) : null}
    </div>
  );
}
