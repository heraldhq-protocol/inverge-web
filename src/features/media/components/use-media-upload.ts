"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  discardUpload,
  uploadImage,
  type UploadProgress,
  type UploadPurpose,
  type UploadedAsset,
} from "@/features/media/lib/upload";
import { MediaUploadError } from "@/features/media/lib/upload";

/**
 * The upload state machine, in one place.
 *
 * Rules this hook exists to enforce:
 *
 * - an upload starts only from a user action, never from an effect or a render,
 *   so a re-render cannot re-send a file;
 * - the local object URL is created for the preview and revoked on completion,
 *   cancellation and unmount, so a long editing session does not leak file
 *   handles;
 * - "busy" and "done" are different states: the control never shows a completed
 *   upload until the server has verified the bytes;
 * - cancel aborts the request in flight and discards the half-written object.
 */

export type MediaUploadState =
  | { status: "idle" }
  | {
      status: "busy";
      phase: UploadProgress["phase"];
      percent: number;
      fileName: string;
    }
  | { status: "error"; message: string; fileName: string; retryable: boolean };

export type UseMediaUpload = {
  state: MediaUploadState;
  /** A local preview while the upload runs, or null. */
  localPreviewUrl: string | null;
  start: (file: File) => void;
  cancel: () => void;
  retry: () => void;
  reset: () => void;
};

export function useMediaUpload(options: {
  purpose: UploadPurpose;
  maxBytes?: number | undefined;
  onUploaded: (asset: UploadedAsset) => void;
}): UseMediaUpload {
  const { maxBytes, onUploaded, purpose } = options;

  const [state, setState] = useState<MediaUploadState>({ status: "idle" });
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const fileRef = useRef<File | null>(null);
  const assetIdRef = useRef<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const uploadedRef = useRef(onUploaded);
  uploadedRef.current = onUploaded;

  const releasePreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    if (mountedRef.current) setLocalPreviewUrl(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const run = useCallback(
    (file: File) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      fileRef.current = file;
      assetIdRef.current = null;
      setState({ fileName: file.name, percent: 0, phase: "requesting", status: "busy" });

      void uploadImage(file, {
        maxBytes,
        onProgress: (progress) => {
          if (!mountedRef.current || controller.signal.aborted) return;
          setState({
            fileName: file.name,
            percent: progress.phase === "verifying" ? 100 : progress.percent,
            phase: progress.phase,
            status: "busy",
          });
        },
        purpose,
        signal: controller.signal,
      })
        .then((asset) => {
          if (!mountedRef.current) return;
          releasePreview();
          assetIdRef.current = null;
          setState({ status: "idle" });
          uploadedRef.current(asset);
        })
        .catch((error: unknown) => {
          if (!mountedRef.current) return;
          const upload = error instanceof MediaUploadError ? error : null;

          if (upload?.assetId) assetIdRef.current = upload.assetId;

          if (upload?.code === "UPLOAD_ABORTED") {
            releasePreview();
            setState({ status: "idle" });
            return;
          }

          setState({
            fileName: file.name,
            message:
              upload?.message ?? "The upload could not be completed. Try again.",
            retryable: true,
            status: "error",
          });
        });
    },
    [maxBytes, purpose, releasePreview],
  );

  const start = useCallback(
    (file: File) => {
      releasePreview();
      const objectUrl = URL.createObjectURL(file);
      previewRef.current = objectUrl;
      setLocalPreviewUrl(objectUrl);
      run(file);
    },
    [releasePreview, run],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (assetIdRef.current) {
      const assetId = assetIdRef.current;
      assetIdRef.current = null;
      void discardUpload(assetId);
    }
    releasePreview();
    setState({ status: "idle" });
  }, [releasePreview]);

  const retry = useCallback(() => {
    const file = fileRef.current;
    if (!file) {
      setState({ status: "idle" });
      return;
    }
    if (assetIdRef.current) {
      const assetId = assetIdRef.current;
      assetIdRef.current = null;
      // The previous attempt left a half-written object; remove it before
      // uploading again so retention does not accumulate one per retry.
      void discardUpload(assetId);
    }
    run(file);
  }, [run]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    fileRef.current = null;
    releasePreview();
    setState({ status: "idle" });
  }, [releasePreview]);

  return { cancel, localPreviewUrl, reset, retry, start, state };
}
