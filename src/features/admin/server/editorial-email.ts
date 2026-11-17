import "server-only";

import {
  emailTemplateListSchema,
  previewEditorialResultSchema,
  previewEditorialSchema,
  previewEmailTemplates,
  previewEditorialPreviewResult,
  sendEditorialResultSchema,
  sendEditorialSchema,
  type EmailTemplateItem,
  type PreviewEditorialResult,
  type SendEditorialResult,
} from "@/features/admin/lib/editorial-email";
import {
  adminReadUnavailable,
  adminWriteFailure,
  requireAdminApiSession,
  type AdminRead,
} from "@/features/admin/server/admin-api";
import {
  fetchApiJson,
  sendApiJson,
  type ApiWriteFailure,
} from "@/lib/api/server";

export async function getEmailTemplates(): Promise<
  AdminRead<EmailTemplateItem[]>
> {
  const session = await requireAdminApiSession();
  if (!session.ok) return { status: "unavailable", message: session.message };
  if (session.token === "preview") {
    return { status: "ready", data: previewEmailTemplates };
  }

  try {
    const response = await fetchApiJson<unknown>("/admin/email/templates", {
      token: session.token,
    });
    return { status: "ready", data: emailTemplateListSchema.parse(response) };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}

export async function previewEditorialEmail(
  input: unknown,
): Promise<{ ok: true; preview: PreviewEditorialResult } | ApiWriteFailure> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  if (session.token === "preview") {
    return { ok: true, preview: previewEditorialPreviewResult };
  }

  const parsed = previewEditorialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message:
        parsed.error.issues[0]?.message ?? "Check template ID and variables.",
    };
  }

  const response = await sendApiJson("/admin/email/editorial/preview", {
    method: "POST",
    token: session.token,
    body: parsed.data,
  });

  if (!response.ok) {
    return adminWriteFailure(response);
  }

  const result = previewEditorialResultSchema.safeParse(response.data);
  if (!result.success) {
    return {
      ok: false,
      status: 502,
      code: "INVALID_RESPONSE",
      message: "The service returned an unrecognised template preview format.",
    };
  }

  return { ok: true, preview: result.data };
}

function unconfirmedEmailSend(
  status = 502,
  code = "INVALID_RESPONSE",
): ApiWriteFailure {
  return {
    ok: false,
    status: status || 503,
    code,
    message:
      "The service did not confirm email dispatch. Messages may already have been queued; check delivery logs before resending.",
  };
}

export async function sendEditorialEmail(
  input: unknown,
): Promise<{ ok: true; result: SendEditorialResult } | ApiWriteFailure> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  if (session.token === "preview") {
    return {
      ok: false,
      status: 403,
      code: "PREVIEW_MODE",
      message: "Preview mode: live editorial email dispatch is disabled.",
    };
  }

  const parsed = sendEditorialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message:
        parsed.error.issues[0]?.message ??
        "Template ID, issue ID, and recipient user IDs are required.",
    };
  }

  const response = await sendApiJson("/admin/email/editorial/send", {
    method: "POST",
    token: session.token,
    body: parsed.data,
  });

  if (!response.ok) {
    if (response.status === 0 || response.status >= 500) {
      return unconfirmedEmailSend(response.status, response.code);
    }
    return adminWriteFailure(response);
  }

  const result = sendEditorialResultSchema.safeParse(response.data);
  if (!result.success) {
    return unconfirmedEmailSend();
  }

  return { ok: true, result: result.data };
}
