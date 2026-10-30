import {
  ACCEPTED_IMAGE_TYPES,
  DEFAULT_IMAGE_MAX_BYTES,
} from "@/features/media/lib/media-ref";

/**
 * The browser half of the upload protocol.
 *
 * Three steps, each with one job:
 *
 * 1. ask the BFF for a target (the server picks the key and the limits);
 * 2. PUT the bytes to storage with real progress (`XMLHttpRequest`, because
 *    `fetch` cannot report upload progress);
 * 3. ask the server to verify what arrived.
 *
 * Nothing here imports a storage vendor or knows a bucket name: the target is an
 * opaque `{ url, method, headers }`. Progress is reported from bytes actually
 * sent, and an upload is only "done" after step 3 succeeds - a bar that reaches
 * 100% while verification is still running would be a lie.
 */

export type UploadTarget = {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresAt: string;
  key: string;
};

export type UploadedAsset = {
  id: string;
  src: string;
  status: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  displayName: string;
  altText: string | null;
  caption: string | null;
  /** Short-lived signed URL for an immediate preview. Never stored. */
  previewUrl?: string;
};

export type UploadPhase = "requesting" | "uploading" | "verifying";

export type UploadProgress = {
  phase: UploadPhase;
  /** Bytes sent. Equals `total` once the PUT has finished. */
  loaded: number;
  total: number;
  /** Only meaningful while `phase === "uploading"`; never reaches 100 early. */
  percent: number;
};

export type UploadPurpose =
  | "AVATAR"
  | "IDEA_COVER"
  | "IDEA_GALLERY"
  | "CAMPAIGN_COVER"
  | "CAMPAIGN_HERO"
  | "CAMPAIGN_STORY"
  | "REWARD"
  | "OTHER";

export class MediaUploadError extends Error {
  readonly code: string;
  readonly status: number;
  /**
   * Set once an upload row exists. A caller can then retry only the failed step
   * or discard the orphaned asset instead of uploading the bytes again.
   */
  readonly assetId: string | undefined;

  constructor(
    message: string,
    code: string,
    status = 0,
    assetId?: string,
  ) {
    super(message);
    this.name = "MediaUploadError";
    this.code = code;
    this.status = status;
    this.assetId = assetId;
  }
}

const MESSAGES: Record<string, string> = {
  API_NOT_CONFIGURED: "Uploads are not connected on this deployment.",
  API_REQUIRED: "Preview sign-in has no account behind it.",
  API_UNREACHABLE: "The server could not be reached. Check your connection.",
  MEDIA_CONTENT_UNSUPPORTED:
    "That file is not a JPEG, PNG or WebP image. SVG and other formats are not accepted.",
  MEDIA_FILE_TOO_LARGE: "That image is larger than this deployment accepts.",
  MEDIA_FILE_EMPTY: "That file is empty.",
  MEDIA_STORAGE_NOT_CONFIGURED: "Uploads are not enabled on this deployment.",
  MEDIA_TYPE_MISMATCH: "The file's content does not match its type.",
  MEDIA_TYPE_NOT_ALLOWED:
    "That file is not a JPEG, PNG or WebP image.",
  MEDIA_UPLOAD_LIMIT_REACHED: "You have reached the daily upload limit.",
  MEDIA_UPLOAD_NOT_RECEIVED:
    "The upload did not reach storage. Check your connection and try again.",
  MEDIA_VIDEO_NOT_UPLOADED:
    "Videos are not uploaded here. Put the demo on YouTube and link it instead.",
  NOT_SIGNED_IN: "Sign in to upload an image.",
};

function messageFor(code: string, fallback: string): string {
  return MESSAGES[code] ?? fallback;
}

async function readError(
  response: Response,
): Promise<{ code: string; message: string }> {
  const body = (await response.json().catch(() => null)) as {
    error?: { code?: unknown; message?: unknown };
  } | null;

  const code =
    typeof body?.error?.code === "string" ? body.error.code : "UPLOAD_FAILED";
  const message =
    typeof body?.error?.message === "string" && body.error.message.trim()
      ? body.error.message
      : "The upload could not be completed.";

  return { code, message: messageFor(code, message) };
}

/** Local pre-flight. Advisory; the server validates again. */
export function validateImage(file: File, maxBytes = DEFAULT_IMAGE_MAX_BYTES): void {
  // A video is the one refusal worth naming: the fix is not "try another file",
  // it is "put it on YouTube and link it", and the hero plays that link.
  if (file.type.startsWith("video/")) {
    throw new MediaUploadError(
      messageFor("MEDIA_VIDEO_NOT_UPLOADED", ""),
      "MEDIA_VIDEO_NOT_UPLOADED",
      415,
    );
  }
  if (file.size === 0) {
    throw new MediaUploadError(messageFor("MEDIA_FILE_EMPTY", ""), "MEDIA_FILE_EMPTY", 400);
  }
  if (file.size > maxBytes) {
    throw new MediaUploadError(
      `That image is ${Math.ceil(file.size / (1024 * 1024))} MB. The limit is ${Math.floor(
        maxBytes / (1024 * 1024),
      )} MB.`,
      "MEDIA_FILE_TOO_LARGE",
      413,
    );
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new MediaUploadError(
      messageFor("MEDIA_TYPE_NOT_ALLOWED", "That file type is not accepted."),
      "MEDIA_TYPE_NOT_ALLOWED",
      415,
    );
  }
}

/** Step 1: a server-chosen key and a short-lived upload target. */
export async function requestUpload(
  file: File,
  options: { purpose: UploadPurpose; altText?: string; caption?: string },
): Promise<{ asset: UploadedAsset; upload: UploadTarget }> {
  let response: Response;
  try {
    response = await fetch("/api/media/uploads", {
      body: JSON.stringify({
        altText: options.altText?.trim() || undefined,
        byteSize: file.size,
        caption: options.caption?.trim() || undefined,
        category: options.purpose,
        contentType: file.type,
        displayName: file.name,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  } catch {
    throw new MediaUploadError(
      messageFor("API_UNREACHABLE", ""),
      "API_UNREACHABLE",
      0,
    );
  }

  if (!response.ok) {
    const { code, message } = await readError(response);
    throw new MediaUploadError(message, code, response.status);
  }

  const payload = (await response.json()) as {
    asset?: UploadedAsset;
    upload?: UploadTarget;
  };
  if (!payload.asset?.id || !payload.upload?.url) {
    throw new MediaUploadError(
      "The server did not return an upload target.",
      "UPLOAD_TARGET_MISSING",
      502,
    );
  }

  return { asset: payload.asset, upload: payload.upload };
}

/**
 * Step 2: the bytes, straight to storage.
 *
 * `XMLHttpRequest` is used only for its upload progress events, which `fetch`
 * does not expose. The request carries exactly the headers the server issued.
 */
export function putFile(
  target: UploadTarget,
  file: File,
  options: {
    onProgress?: ((progress: UploadProgress) => void) | undefined;
    signal?: AbortSignal | undefined;
  } = {},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new MediaUploadError("Upload cancelled.", "UPLOAD_ABORTED", 0));
      return;
    }

    const request = new XMLHttpRequest();
    request.open(target.method, target.url, true);
    for (const [name, value] of Object.entries(target.headers)) {
      request.setRequestHeader(name, value);
    }

    const abort = () => request.abort();
    options.signal?.addEventListener("abort", abort, { once: true });

    const cleanup = () => options.signal?.removeEventListener("abort", abort);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      options.onProgress?.({
        loaded: event.loaded,
        percent: Math.min(100, Math.round((event.loaded / event.total) * 100)),
        phase: "uploading",
        total: event.total,
      });
    };

    request.onload = () => {
      cleanup();
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(
        new MediaUploadError(
          "Storage refused the upload. Try again.",
          "UPLOAD_REJECTED",
          request.status,
        ),
      );
    };

    request.onerror = () => {
      cleanup();
      reject(
        new MediaUploadError(
          messageFor("MEDIA_UPLOAD_NOT_RECEIVED", ""),
          "UPLOAD_NETWORK_ERROR",
          0,
        ),
      );
    };

    request.onabort = () => {
      cleanup();
      reject(new MediaUploadError("Upload cancelled.", "UPLOAD_ABORTED", 0));
    };

    request.send(file);
  });
}

/** Step 3: the server reads the object back and verifies it. */
export async function verifyUpload(assetId: string): Promise<UploadedAsset> {
  let response: Response;
  try {
    response = await fetch(
      `/api/media/uploads/${encodeURIComponent(assetId)}/complete`,
      { method: "POST" },
    );
  } catch {
    throw new MediaUploadError(
      messageFor("API_UNREACHABLE", ""),
      "API_UNREACHABLE",
      0,
      assetId,
    );
  }

  if (!response.ok) {
    const { code, message } = await readError(response);
    throw new MediaUploadError(message, code, response.status, assetId);
  }

  return (await response.json()) as UploadedAsset;
}

/**
 * Best-effort removal of a half-finished upload.
 *
 * Called when a creator cancels or when verification fails, so an abandoned
 * object does not wait for the retention sweep. Failure is swallowed: the sweep
 * exists precisely for the case where this cannot run.
 */
export async function discardUpload(assetId: string): Promise<void> {
  await fetch(`/api/media/${encodeURIComponent(assetId)}`, {
    method: "DELETE",
  }).catch(() => undefined);
}

/** All three steps, with a real phase and real progress. */
export async function uploadImage(
  file: File,
  options: {
    purpose: UploadPurpose;
    altText?: string;
    caption?: string;
    maxBytes?: number | undefined;
    onProgress?: (progress: UploadProgress) => void;
    signal?: AbortSignal;
  },
): Promise<UploadedAsset> {
  validateImage(file, options.maxBytes);

  options.onProgress?.({ loaded: 0, percent: 0, phase: "requesting", total: file.size });
  const { asset, upload } = await requestUpload(file, options);

  try {
    await putFile(upload, file, {
      onProgress: options.onProgress,
      signal: options.signal,
    });
  } catch (error) {
    // The object may be partially written, and the row is still PENDING. Do not
    // leave it for the sweep when the creator is right here and waiting.
    await discardUpload(asset.id);
    if (error instanceof MediaUploadError) {
      throw new MediaUploadError(error.message, error.code, error.status, asset.id);
    }
    throw error;
  }

  options.onProgress?.({
    loaded: file.size,
    percent: 100,
    phase: "verifying",
    total: file.size,
  });

  return verifyUpload(asset.id);
}
