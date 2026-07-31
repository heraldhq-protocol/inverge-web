'use client';

import { useCallback } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import type { TiptapDoc } from '@/lib/ideas/rich-content';

/**
 * The pitch editor, on Tiptap.
 *
 * **Stores JSON, not HTML.** `editor.getJSON()` is what goes to the API, and the reader renders that
 * tree server-side (`lib/ideas/rich-content.tsx`). Two things fall out of that: readers never download
 * an editor bundle for static prose, and there is no author-controlled HTML string anywhere, so the page
 * has no injection surface to sanitise.
 *
 * The toolbar is deliberately six controls. A creator needs to break up a wall of text, link a demo and
 * show a photo; tables, colours and font pickers would only produce pitches that look worse and read
 * slower, and the reference's own editor is famously restricted for exactly that reason
 * (pitch-narrative-playbook.md §4).
 */
export function RichTextField({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  placeholder,
  minHeight = '12rem',
}: {
  id: string;
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc, plainText: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  minHeight?: string;
}) {
  const editor = useEditor({
    // Rendering the editor on the server produces markup React then has to reconcile against the
    // browser's; Tiptap's own guidance is to render it client-side only.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // A pitch is prose. Horizontal rules and code blocks are noise here, and the reader drops what
        // it does not know anyway — better not to offer them at all.
        horizontalRule: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https'],
        HTMLAttributes: { rel: 'noreferrer nofollow', target: '_blank' },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write your pitch…' }),
    ],
    content: value ?? undefined,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(invalid ? { 'aria-invalid': 'true' } : {}),
        class: 'inv-prose focus-visible:outline-none',
        style: `min-height:${minHeight}`,
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as TiptapDoc, e.getText()),
    onBlur: () => onBlur?.(),
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link address (https://…)', existing ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      window.alert('Links must start with http:// or https://');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    // No upload endpoint exists yet (API gap backlog item 3), so an image is a URL the creator already
    // hosts. When upload lands, this opens the picker instead and nothing else here changes.
    const src = window.prompt('Image address (https://…)');
    if (!src) return;
    if (!/^https:\/\//i.test(src)) {
      window.alert('Image addresses must start with https://');
      return;
    }
    const alt = window.prompt('Describe the image for people who cannot see it') ?? '';
    editor.chain().focus().setImage({ src, alt }).run();
  }, [editor]);

  if (!editor) {
    // Reserve the field's height so the form does not jump when the editor mounts.
    return (
      <div
        className={cn('rounded-lg border bg-surface', invalid ? 'border-danger/50' : 'border-border')}
        style={{ minHeight }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border transition-colors focus-within:ring-2 focus-within:ring-accent-500',
        invalid ? 'border-danger/50 bg-danger-50' : 'border-border bg-surface'
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-paper px-2 py-1.5">
        <ToolButton
          editor={editor}
          hint="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">B</span>
        </ToolButton>
        <ToolButton
          editor={editor}
          hint="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolButton>
        <ToolButton
          editor={editor}
          hint="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H
        </ToolButton>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

        <ToolButton
          editor={editor}
          hint="Bulleted list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          ••
        </ToolButton>
        <ToolButton
          editor={editor}
          hint="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolButton>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

        <ToolButton editor={editor} hint="Insert a link" active={editor.isActive('link')} onClick={addLink}>
          Link
        </ToolButton>
        <ToolButton editor={editor} hint="Insert an image" active={false} onClick={addImage}>
          Image
        </ToolButton>
      </div>

      <EditorContent editor={editor} className="px-3 py-2.5 text-sm leading-relaxed text-ink" />
    </div>
  );
}

function ToolButton({
  hint,
  active,
  onClick,
  children,
}: {
  editor: Editor;
  hint: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={hint}
      aria-label={hint}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
        active ? 'bg-accent-100 text-accent-900' : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}
