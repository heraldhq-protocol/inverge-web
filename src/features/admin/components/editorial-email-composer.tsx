"use client";

import { useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { adminFieldClass } from "@/features/admin/components/admin-workspace-ui";
import {
  isEditorialTemplate,
  type EmailTemplateItem,
  type PreviewEditorialResult,
  type SendEditorialResult,
} from "@/features/admin/lib/editorial-email";
import { sendJson } from "@/lib/api/client";

interface EditorialEmailComposerProps {
  templates: EmailTemplateItem[];
}

export function EditorialEmailComposer({
  templates,
}: EditorialEmailComposerProps) {
  // Only marketing templates can be previewed or sent through this route; the
  // API rejects transactional templates, so they are not offered here.
  const editorialTemplates = useMemo(
    () => templates.filter(isEditorialTemplate),
    [templates],
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    editorialTemplates[0]?.templateId || "",
  );
  const [issueId, setIssueId] = useState("");
  const [userIdsText, setUserIdsText] = useState("");
  const [variablesJson, setVariablesJson] = useState("{\n  \n}");

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [preview, setPreview] = useState<PreviewEditorialResult | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendEditorialResult | null>(
    null,
  );

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const activeTemplate = useMemo(() => {
    return (
      editorialTemplates.find((t) => t.templateId === selectedTemplateId) ||
      editorialTemplates[0] || {
        templateId: selectedTemplateId,
        category: "marketing",
        name: selectedTemplateId,
        requiredVariables: [],
        optionalVariables: [],
      }
    );
  }, [editorialTemplates, selectedTemplateId]);

  const parseVariables = (): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(variablesJson);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setFeedback({
          tone: "error",
          message: "Variables must be a valid JSON object.",
        });
        return null;
      }
      return parsed as Record<string, unknown>;
    } catch {
      setFeedback({
        tone: "error",
        message: "Malformed JSON in template variables.",
      });
      return null;
    }
  };

  const parseUserIds = (): string[] => {
    return userIdsText
      .split(/[\n,]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  };

  const handlePreview = async () => {
    const vars = parseVariables();
    if (!vars) return;

    setIsPreviewing(true);
    setFeedback(null);

    try {
      const response = await sendJson<{
        ok: true;
        preview: PreviewEditorialResult;
      }>("/api/admin/email/editorial/preview", {
        method: "POST",
        body: {
          templateId: selectedTemplateId,
          variables: vars,
        },
      });

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message: response.message || "Failed to render template preview.",
        });
        setPreview(null);
        feedbackRef.current?.focus();
        return;
      }

      setPreview(response.data.preview);
      setFeedback({
        tone: "success",
        message: "Template rendered successfully.",
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "Network error rendering preview.",
      });
      setPreview(null);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIssueId = issueId.trim();
    if (!cleanIssueId) {
      setFeedback({
        tone: "error",
        message: "Issue ID is required to dispatch.",
      });
      return;
    }

    const userIds = parseUserIds();
    if (userIds.length === 0) {
      setFeedback({
        tone: "error",
        message: "Provide at least one recipient user ID.",
      });
      return;
    }

    const vars = parseVariables();
    if (!vars) return;

    setIsSending(true);
    setFeedback(null);
    setSendResult(null);

    try {
      const response = await sendJson<{
        ok: true;
        result: SendEditorialResult;
      }>("/api/admin/email/editorial/send", {
        method: "POST",
        body: {
          issueId: cleanIssueId,
          templateId: selectedTemplateId,
          userIds,
          variables: vars,
        },
      });

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message: response.message || "Email dispatch refused or failed.",
        });
        feedbackRef.current?.focus();
        return;
      }

      setSendResult(response.data.result);
      setFeedback({
        tone: "success",
        message: `Dispatched issue "${cleanIssueId}". Sent: ${
          response.data.result.sentCount ?? response.data.result.sent ?? 0
        }, Suppressed: ${
          response.data.result.suppressedCount ??
          response.data.result.suppressed ??
          0
        }, Duplicate: ${response.data.result.duplicate ?? 0}, Failed: ${
          response.data.result.failed ?? 0
        }`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "Network error during email dispatch.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-6 space-y-8">
      {/* Regulatory & Safety notice */}
      <div className="rounded-xl border border-border bg-surface p-4 text-xs leading-5 text-ink-soft sm:text-sm">
        <span className="font-semibold text-ink">Editorial Policy:</span>{" "}
        Dispatch is refused unless{" "}
        <code className="font-mono text-xs">EDITORIAL_EMAILS_ENABLED=true</code>{" "}
        on the platform. Recipients without an active subscription or verified
        email address are automatically suppressed and never silently
        subscribed.
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Left: Email Composer Form */}
        <div className="space-y-6 lg:col-span-6">
          <form
            onSubmit={handleSend}
            className="rounded-xl border border-border bg-surface p-5 sm:p-6"
            aria-busy={isSending || isPreviewing}
          >
            <h2 className="text-lg font-semibold text-ink">
              Compose Editorial Dispatch
            </h2>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Select an approved editorial template, populate required
              variables, and test render before sending.
            </p>

            {feedback && (
              <div
                ref={feedbackRef}
                tabIndex={-1}
                role="alert"
                className={`mt-4 rounded-lg p-3 text-sm ${
                  feedback.tone === "success"
                    ? "bg-success/10 text-success-strong"
                    : "bg-error/10 text-error-strong"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor={`${formId}-template`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Template
                </label>
                <select
                  id={`${formId}-template`}
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setPreview(null);
                  }}
                  className={`mt-1 ${adminFieldClass}`}
                >
                  {editorialTemplates.map((tmpl) => (
                    <option key={tmpl.templateId} value={tmpl.templateId}>
                      {tmpl.name
                        ? `${tmpl.name} (${tmpl.templateId})`
                        : tmpl.templateId}
                    </option>
                  ))}
                </select>
                {editorialTemplates.length === 0 ? (
                  <p className="mt-2 text-xs leading-5 text-ink-soft">
                    No editorial templates are available on the connected
                    service.
                  </p>
                ) : null}
                {activeTemplate.requiredVariables &&
                  activeTemplate.requiredVariables.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
                      <span className="font-medium">Variables:</span>
                      {activeTemplate.requiredVariables.map((v) => (
                        <Pill key={v} tone="neutral" size="sm">
                          {v}
                        </Pill>
                      ))}
                    </div>
                  )}
              </div>

              <div>
                <label
                  htmlFor={`${formId}-issue`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Issue ID
                </label>
                <input
                  id={`${formId}-issue`}
                  type="text"
                  placeholder="e.g. editorial-2026-w46"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  className={`mt-1 font-mono text-xs sm:text-sm ${adminFieldClass}`}
                />
                <p className="mt-1 text-xs text-ink-soft">
                  Stable issue id. Repeating a send with the same issue id is
                  idempotent.
                </p>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-users`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Recipient User IDs
                </label>
                <textarea
                  id={`${formId}-users`}
                  rows={3}
                  placeholder="usr_1, usr_2 or one per line"
                  value={userIdsText}
                  onChange={(e) => setUserIdsText(e.target.value)}
                  className={`mt-1 font-mono text-xs sm:text-sm ${adminFieldClass} min-h-20 py-2`}
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-vars`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Template Variables (JSON)
                </label>
                <textarea
                  id={`${formId}-vars`}
                  rows={5}
                  value={variablesJson}
                  onChange={(e) => setVariablesJson(e.target.value)}
                  className={`mt-1 font-mono text-xs sm:text-sm ${adminFieldClass} min-h-28 py-2`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={
                    isPreviewing || isSending || editorialTemplates.length === 0
                  }
                  className="cursor-pointer"
                >
                  {isPreviewing ? "Rendering..." : "Generate Preview"}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSending || isPreviewing || editorialTemplates.length === 0
                  }
                  className="cursor-pointer"
                >
                  {isSending ? "Dispatching..." : "Send Editorial Dispatch"}
                </Button>
              </div>
            </div>
          </form>

          {sendResult && (
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-ink">
              <h3 className="font-semibold text-success-strong">
                Dispatch Confirmation
              </h3>
              <p className="mt-1 font-mono text-xs">
                Issue ID: {sendResult.issueId || issueId}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium">
                <div>
                  Sent:{" "}
                  <span className="font-bold text-success-strong">
                    {sendResult.sentCount ?? sendResult.sent ?? 0}
                  </span>
                </div>
                <div>
                  Suppressed:{" "}
                  <span className="font-bold text-ink-soft">
                    {sendResult.suppressedCount ?? sendResult.suppressed ?? 0}
                  </span>
                </div>
                <div>
                  Duplicate:{" "}
                  <span className="font-bold text-ink-soft">
                    {sendResult.duplicate ?? 0}
                  </span>
                </div>
                <div>
                  Failed:{" "}
                  <span className="font-bold text-ink">
                    {sendResult.failed ?? 0}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-ink-soft">
                Repeating a dispatch with the same issue id and recipient is a
                no-op. Suppressed recipients did not have an active editorial
                subscription or a verified address.
              </p>
            </div>
          )}
        </div>

        {/* Right: Preview Window */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-ink">Template Preview</h2>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Live rendering of the subject and content without creating
              delivery rows.
            </p>

            {preview ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-border bg-canvas p-3">
                  <span className="text-xs font-medium text-ink-soft">
                    Subject Line:
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-ink">
                    {preview.subject}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-medium text-ink-soft">
                    HTML Preview:
                  </span>
                  <div className="mt-1 min-h-64 overflow-auto rounded-lg border border-border bg-white p-4 text-ink">
                    <div dangerouslySetInnerHTML={{ __html: preview.html }} />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-ink-soft">
                    Plain Text Version:
                  </span>
                  <pre className="mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-canvas p-3 font-mono text-xs text-ink-soft whitespace-pre-wrap">
                    {preview.text}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-sm text-ink-soft">
                Click &quot;Generate Preview&quot; to inspect rendered subject
                and email layout.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
