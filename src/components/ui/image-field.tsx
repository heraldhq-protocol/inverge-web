'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = 'image/png,image/jpeg,image/webp';

/**
 * Cover image picker.
 *
 * **There is no upload endpoint** (API gap backlog item 3), so this does the two things that are honest
 * without one: it takes a URL a creator already hosts, and it previews a local file so the crop and the
 * card can be judged before upload exists. The local preview is an object URL held in memory and is
 * revoked on change and unmount — it is explicitly labelled as not yet saved, because silently losing an
 * image a creator thinks they uploaded is worse than not offering the control.
 *
 * The frame is 3:2 and identical to the card cover, so what a creator crops here is what appears in the
 * feed. Without a cover the card falls back to its deterministic typographic band, which is a real
 * design rather than a placeholder.
 */
export function ImageField({
  value,
  onChange,
  onLocalPreview,
}: {
  /** A remote https URL, or null. */
  value: string | null;
  onChange: (next: string | null) => void;
  /** Local object URL, for preview only. Never persisted. */
  onLocalPreview?: (objectUrl: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    },
    [localUrl]
  );

  const preview = localUrl ?? value;

  const clearLocal = () => {
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalUrl(null);
    onLocalPreview?.(null);
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!ACCEPTED.split(',').includes(file.type)) {
      setError('That file type is not supported. Use a PNG, JPG or WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That image is over 5MB. A smaller one loads faster on a slow connection.');
      return;
    }

    clearLocal();
    const objectUrl = URL.createObjectURL(file);
    setLocalUrl(objectUrl);
    onLocalPreview?.(objectUrl);
    onChange(null);
  };

  const applyUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    if (!/^https:\/\//i.test(trimmed)) {
      setError('Use an address starting with https://');
      return;
    }
    setError(null);
    clearLocal();
    onChange(trimmed);
    setUrlDraft('');
  };

  return (
    <div>
      <div
        className={cn(
          'relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-dashed',
          preview ? 'border-border' : 'border-border bg-paper'
        )}
      >
        {preview ? (
          // `unoptimized`: an object URL cannot go through the image optimiser, and a creator's own host
          // is not in `images.remotePatterns` yet.
          <Image
            src={preview}
            alt="Cover preview"
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
            <p className="text-sm font-medium text-ink">No cover yet</p>
            <p className="text-xs leading-relaxed text-ink-muted">
              Ideas without one get a plain typed cover, which is fine. A photo of the thing, or a
              screenshot, does better than a logo.
            </p>
          </div>
        )}
      </div>

      {localUrl && (
        <p className="mt-2 rounded-lg border border-border bg-paper px-3 py-2 text-[11px] leading-relaxed text-ink-muted">
          This preview is on your device only and is not saved yet. Uploading is not connected in this
          build, so use an image address below if you need the cover to stick.
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <Button variant="outline" size="sm" type="button" onClick={() => fileRef.current?.click()}>
          Choose an image
        </Button>
        {preview && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => {
              clearLocal();
              onChange(null);
              setError(null);
            }}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="url"
          inputMode="url"
          value={urlDraft}
          placeholder="or paste an image address (https://…)"
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyUrl();
            }
          }}
          aria-label="Image address"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        />
        <Button variant="outline" size="sm" type="button" onClick={applyUrl}>
          Use image
        </Button>
      </div>

      {error && <p className="mt-1.5 text-xs font-medium text-danger-700">{error}</p>}
    </div>
  );
}
