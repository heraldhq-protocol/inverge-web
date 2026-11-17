"use client";

import { useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { adminFieldClass } from "@/features/admin/components/admin-workspace-ui";
import type {
  ParamAuditEntry,
  PlatformParams,
  PlatformParamValue,
} from "@/features/admin/lib/params";
import { sendJson } from "@/lib/api/client";

type ParamType = "string" | "number" | "boolean" | "null";

function inferType(val: PlatformParamValue | undefined): ParamType {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "number";
  return "string";
}

function parseValueByType(raw: string, type: ParamType): PlatformParamValue {
  switch (type) {
    case "number": {
      const num = Number(raw);
      if (Number.isNaN(num)) throw new Error("Value must be a valid number");
      return num;
    }
    case "boolean":
      return raw.toLowerCase() === "true" || raw === "1";
    case "null":
      return null;
    case "string":
    default:
      return raw;
  }
}

interface PlatformParamsEditorProps {
  initialParams: PlatformParams;
  initialAudit: ParamAuditEntry[];
}

export function PlatformParamsEditor({
  initialParams,
  initialAudit,
}: PlatformParamsEditorProps) {
  const [params, setParams] = useState<PlatformParams>(initialParams);
  const audit = initialAudit;
  const [filter, setFilter] = useState("");

  // Editor form state
  const [selectedKey, setSelectedKey] = useState("");
  const [paramKey, setParamKey] = useState("");
  const [paramType, setParamType] = useState<ParamType>("string");
  const [paramValue, setParamValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const filteredKeys = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const keys = Object.keys(params).sort();
    if (!q) return keys;
    return keys.filter((k) => k.toLowerCase().includes(q));
  }, [params, filter]);

  const handleSelectToEdit = (key: string) => {
    setSelectedKey(key);
    setParamKey(key);
    const val = params[key];
    const type = inferType(val);
    setParamType(type);
    setParamValue(val === null ? "" : String(val));
    setFeedback(null);
  };

  const handleResetForm = () => {
    setSelectedKey("");
    setParamKey("");
    setParamType("string");
    setParamValue("");
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = paramKey.trim();
    if (!cleanKey) {
      setFeedback({ tone: "error", message: "Parameter key is required." });
      return;
    }

    let parsedVal: PlatformParamValue;
    try {
      parsedVal = parseValueByType(paramValue, paramType);
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error ? err.message : "Invalid parameter value",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await sendJson<{ ok: true; params: PlatformParams }>(
        "/api/admin/params",
        {
          method: "PATCH",
          body: {
            params: {
              [cleanKey]: parsedVal,
            },
          },
        },
      );

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message:
            response.message || "Failed to update platform parameter.",
        });
        setIsSubmitting(false);
        feedbackRef.current?.focus();
        return;
      }

      setParams(response.data.params);
      setSelectedKey("");
      setParamKey("");
      setParamType("string");
      setParamValue("");
      setFeedback({
        tone: "success",
        message: `Parameter "${cleanKey}" successfully updated.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "Network error while saving parameter.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-8">
      {/* Informational banner about non-transactional application */}
      <div className="rounded-xl border border-border bg-surface p-4 text-xs leading-5 text-ink-soft sm:text-sm">
        <span className="font-semibold text-ink">Operational note:</span> Changes
        applied to platform parameters take effect immediately across all
        services. Updates apply sequentially; verify changes below or review
        the audit trail.
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Left: Parameter Directory & Filter */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Active Parameters</h2>
            <div className="w-full sm:w-64">
              <input
                type="search"
                placeholder="Search parameter key..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={adminFieldClass}
                aria-label="Filter parameter keys"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table
              aria-label="Active runtime parameters"
              className="min-w-full divide-y divide-border text-left text-sm"
            >
              <thead className="bg-canvas text-xs font-semibold uppercase tracking-wider text-ink-soft">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Key
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Current Value
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {filteredKeys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center font-sans text-sm text-ink-soft"
                    >
                      No parameters matching &quot;{filter}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((key) => {
                    const val = params[key];
                    const type = inferType(val);
                    return (
                      <tr
                        key={key}
                        className="transition-colors hover:bg-canvas/50"
                      >
                        <td className="px-4 py-3 font-semibold text-ink [overflow-wrap:anywhere]">
                          {key}
                        </td>
                        <td className="px-4 py-3 font-sans">
                          <Pill tone="neutral" size="sm">
                            {type}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 text-ink [overflow-wrap:anywhere]">
                          {val === null ? (
                            <span className="italic text-ink-soft">null</span>
                          ) : typeof val === "boolean" ? (
                            <span
                              className={
                                val
                                  ? "font-bold text-success-strong"
                                  : "font-bold text-ink-soft"
                              }
                            >
                              {String(val)}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => handleSelectToEdit(key)}
                            className="cursor-pointer text-xs font-medium text-brand-strong hover:underline focus-visible:outline-brand-strong"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Parameter Editor Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-surface p-5 sm:p-6"
            aria-busy={isSubmitting}
          >
            <h2 className="text-lg font-semibold text-ink">
              {selectedKey ? "Edit Parameter" : "Set Parameter"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              {selectedKey
                ? `Updating "${selectedKey}". Value will be applied directly.`
                : "Add or override a runtime parameter key and value."}
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
                  htmlFor={`${formId}-key`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Parameter Key
                </label>
                <input
                  id={`${formId}-key`}
                  type="text"
                  required
                  value={paramKey}
                  onChange={(e) => setParamKey(e.target.value)}
                  disabled={Boolean(selectedKey) || isSubmitting}
                  placeholder="e.g. platform.successFeeBps"
                  className={`mt-1 font-mono text-xs sm:text-sm ${adminFieldClass}`}
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-type`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Type
                </label>
                <select
                  id={`${formId}-type`}
                  value={paramType}
                  onChange={(e) => setParamType(e.target.value as ParamType)}
                  disabled={isSubmitting}
                  className={`mt-1 ${adminFieldClass}`}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="null">Null</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-value`}
                  className="block text-xs font-medium text-ink sm:text-sm"
                >
                  Value
                </label>
                {paramType === "boolean" ? (
                  <select
                    id={`${formId}-value`}
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    disabled={isSubmitting}
                    className={`mt-1 ${adminFieldClass}`}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : paramType === "null" ? (
                  <input
                    id={`${formId}-value`}
                    type="text"
                    disabled
                    value="null"
                    className={`mt-1 bg-canvas italic text-ink-soft ${adminFieldClass}`}
                  />
                ) : (
                  <input
                    id={`${formId}-value`}
                    type={paramType === "number" ? "number" : "text"}
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    disabled={isSubmitting}
                    placeholder={
                      paramType === "number" ? "e.g. 500" : "Value text..."
                    }
                    className={`mt-1 font-mono text-xs sm:text-sm ${adminFieldClass}`}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Parameter"}
                </Button>
                {selectedKey && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetForm}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Audit History Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Change Audit History</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-canvas text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Timestamp
                </th>
                <th scope="col" className="px-4 py-3">
                  Key
                </th>
                <th scope="col" className="px-4 py-3">
                  Old Value
                </th>
                <th scope="col" className="px-4 py-3">
                  New Value
                </th>
                <th scope="col" className="px-4 py-3">
                  Changed By
                </th>
                <th scope="col" className="px-4 py-3">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {audit.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center font-sans text-sm text-ink-soft"
                  >
                    No audit records available.
                  </td>
                </tr>
              ) : (
                audit.map((entry, index) => (
                  <tr
                    key={entry.id ?? `audit-${index}`}
                    className="transition-colors hover:bg-canvas/50"
                  >
                    <td className="px-4 py-3 text-ink-soft">
                      {entry.changedAt || entry.createdAt
                        ? new Date(
                            (entry.changedAt || entry.createdAt)!,
                          ).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {entry.key}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {entry.oldValue !== undefined
                        ? String(entry.oldValue)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {entry.newValue !== undefined
                        ? String(entry.newValue)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-sans text-ink">
                      {entry.actorName || entry.actorId || "System"}
                    </td>
                    <td className="px-4 py-3 font-sans text-ink-soft">
                      {entry.reason || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
