"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Award01Icon,
  Cancel01Icon,
  CheckListIcon,
  CloudUploadIcon,
  InformationCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Amount } from "@/components/ui/amount";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/ui/location-picker";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaImage } from "@/features/campaigns/components/media-image";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import { StepRail } from "@/features/campaigns/components/step-rail";
import { WizardMediaList } from "@/features/campaigns/components/wizard-media-list";
import { WizardShippingEditor } from "@/features/campaigns/components/wizard-shipping-editor";
import {
  describeMediaCount,
  parseImageSource,
} from "@/features/campaigns/lib/media";
import {
  draftAllocationTotalBps,
  createDraftMilestone,
  createDraftTier,
  draftTarget,
  draftUseOfFundsTotal,
  draftWorkingCapitalFor,
  nextDraftId,
  submissionPreconditions,
  tierNeedsShipping,
  toCampaignMedia,
  toSupportTiers,
  validateCampaignStep,
  type CampaignDraft,
  type DraftIssue,
  type DraftSupportTier,
  type SubmissionGate,
} from "@/features/campaigns/lib/wizard";
import { formatBps, parsePercentToBps } from "@/features/campaigns/lib/amounts";
import {
  PLATFORM_SUCCESS_FEE_BPS,
  WORKING_CAPITAL_BPS,
} from "@/features/campaigns/lib/escrow";
import {
  campaignCategories,
  findCampaignCategory,
} from "@/features/campaigns/lib/taxonomy";
import { formatMoney } from "@/lib/money";
import {
  campaignWizardSteps,
  type CampaignWizardStepId,
} from "@/features/campaigns/lib/wizard";
import {
  useCampaignDraftAutosave,
  type DraftSaveInitial,
  type DraftSaveState,
} from "@/features/campaigns/lib/use-campaign-draft-autosave";

/**
 * The campaign authoring wizard.
 *
 * It validates the things the product actually enforces — a target, a future
 * deadline, a 2–6 milestone plan whose weights total 100% of the post-tranche
 * pool (FR-301, FR-302),
 * media whose links parse and whose descriptions are written, and published
 * disclosures — and it refuses to pretend the campaign was submitted.
 * Submission needs identity verification and a paid application fee (FR-103,
 * FR-311), neither of which exists in this build, so the final step lists what is
 * outstanding instead of showing a success screen.
 *
 * In edit mode the plan is locked (FR-303): a published campaign's milestones and
 * their evidence definitions cannot be rewritten, because backers agreed to them.
 *
 * In create mode the draft is autosaved to Inverge once it is a document the API
 * can create (the plan, funding and milestones steps are complete). The save
 * carries a version, so a second tab cannot silently overwrite this one.
 */

/** What the save indicator says while the draft is not yet persistable. */
const UNSAVED_NOTE =
  "Saving starts once the funding and milestone steps are complete. Until then this draft lives in this tab.";

function SaveStatus({ save }: { save: DraftSaveState }) {
  const text =
    save.status === "saved"
      ? `Draft saved${save.version === null ? "" : ` · version ${save.version}`}`
      : save.status === "saving"
        ? "Saving…"
        : save.status === "waiting"
          ? (save.message ?? UNSAVED_NOTE)
          : save.status === "conflict" ||
              save.status === "error" ||
              save.status === "signed-out"
            ? (save.message ?? "This draft could not be saved.")
            : UNSAVED_NOTE;

  const tone =
    save.status === "saved"
      ? "text-brand-strong"
      : save.status === "conflict" ||
          save.status === "error" ||
          save.status === "signed-out"
        ? "text-warning-strong"
        : "text-muted";

  return (
    <p
      className={`mt-3 hidden text-xs leading-5 lg:block ${tone}`}
      role="status"
      aria-live="polite"
    >
      {text}
      {save.status === "conflict" ? (
        <>
          {" "}
          <Link
            href=""
            className="font-semibold underline underline-offset-2"
            onClick={(event) => {
              event.preventDefault();
              window.location.reload();
            }}
          >
            Reload
          </Link>
        </>
      ) : null}
    </p>
  );
}

/** The fixed working-capital share (FR-503a). */
const WORKING_CAPITAL_LABEL = formatBps(WORKING_CAPITAL_BPS);

/**
 * What a reward sends. "Not stated" is the empty value rather than a label, so
 * the rewards step can require a real choice while still showing the field as
 * untouched when a creator has not answered yet.
 */
const FULFILMENT_OPTIONS = [
  { label: "Not stated yet", value: "" },
  { label: "Digital", value: "digital" },
  { label: "Physical", value: "physical" },
  { label: "Digital and physical", value: "mixed" },
] as const;

function cloneDraft(draft: CampaignDraft): CampaignDraft {
  return {
    ...draft,
    milestones: draft.milestones.map((milestone) => ({ ...milestone })),
    supportTiers: draft.supportTiers.map((tier) => ({ ...tier })),
    useOfFunds: draft.useOfFunds.map((line) => ({ ...line })),
  };
}

function BlockingNote({
  items,
  title,
}: {
  items: readonly {
    description: string;
    id: string;
    label: string;
    met: boolean;
    code?: string;
  }[];
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/[0.07] p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-2.5 space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2.5">
            <HugeiconsIcon
              icon={item.met ? CheckListIcon : Alert02Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
              className={`mt-0.5 shrink-0 ${
                item.met ? "text-brand-strong" : "text-warning-strong"
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                {item.label}
                <span className="ml-1.5 text-xs font-normal text-muted">
                  {item.met ? "done" : "outstanding"}
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {item.description}
              </p>
              {!item.met && item.code ? (
                <p className="mt-1 text-[0.6875rem] leading-5 text-muted">
                  Support reference:{" "}
                  <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[0.6875rem] text-ink">
                    {item.code}
                  </code>
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CampaignWizard({
  draft: initialDraft,
  gate = null,
  mode = "create",
  saved = null,
  loadError = null,
}: {
  draft: CampaignDraft;
  /** Live creator verification gate, read server-side. Null means "not readable". */
  gate?: SubmissionGate | null;
  mode?: "create" | "edit";
  saved?: DraftSaveInitial;
  loadError?: string | null;
}) {
  const locked = mode === "edit";
  const [draft, setDraft] = useState<CampaignDraft>(() =>
    cloneDraft(initialDraft),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [issues, setIssues] = useState<readonly DraftIssue[]>([]);

  const handleCreated = useCallback((id: string) => {
    // Shallow address-bar update: the draft is resumable by URL without a
    // navigation that would remount this form and drop in-flight edits.
    const url = new URL(window.location.href);
    url.searchParams.set("draft", id);
    window.history.replaceState(null, "", url);
  }, []);

  const save = useCampaignDraftAutosave({
    draft,
    enabled: !locked,
    initial: saved,
    onCreated: handleCreated,
  });

  const step = campaignWizardSteps[stepIndex] ?? campaignWizardSteps[0];
  if (!step) throw new Error("Wizard step index out of range");
  const stepId: CampaignWizardStepId = step.id;

  const selectedCategory = draft.category
    ? findCampaignCategory(draft.category)
    : null;
  const subcategoryOptions = (selectedCategory?.subcategories ?? []).map(
    (subcategory) => ({
      label: subcategory.label,
      value: subcategory.slug,
    }),
  );
  const categoryLabelText = selectedCategory?.label ?? "";
  const subcategoryLabelText =
    selectedCategory?.subcategories.find(
      (subcategory) => subcategory.slug === draft.subcategory,
    )?.label ?? "";

  function patch(next: Partial<CampaignDraft>) {
    setDraft((current) => ({ ...current, ...next }));
    setIssues([]);
  }

  function patchTier(id: string, changes: Partial<DraftSupportTier>) {
    patch({
      supportTiers: draft.supportTiers.map((tier) =>
        tier.id === id ? { ...tier, ...changes } : tier,
      ),
    });
  }

  function errorFor(field: string): string | null {
    return issues.find((issue) => issue.field === field)?.message ?? null;
  }

  function next() {
    const found = validateCampaignStep(draft, stepId);
    if (found.length > 0) {
      setIssues(found);
      return;
    }
    setIssues([]);
    if (stepIndex < campaignWizardSteps.length - 1) setStepIndex(stepIndex + 1);
  }

  function back() {
    setIssues([]);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  const target = draftTarget(draft);
  const useOfFundsTotal = draftUseOfFundsTotal(draft);
  const allocationTotal = draftAllocationTotalBps(draft);
  const workingCapital = draftWorkingCapitalFor(draft);
  const preconditions = submissionPreconditions(gate);
  const outstanding = preconditions.filter((item) => !item.met);
  const heroMedia = toCampaignMedia(draft.heroMedia);
  const storyMedia = toCampaignMedia(draft.storyMedia);
  /** What the reward tiers would publish as. Drives the review summary. */
  const publishedTiers = toSupportTiers(draft.supportTiers);
  /**
   * The success fee is Inverge's, not the creator's, so the step shows the rate
   * that would apply instead of a field. A published campaign keeps the rate it
   * was approved at; a new draft shows the platform's current rate (FR-505).
   */
  const platformFeeBps =
    parsePercentToBps(draft.successFeePercent) ?? PLATFORM_SUCCESS_FEE_BPS;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <div className="min-w-0">
        <div className="lg:sticky lg:top-24">
          <StepRail
            currentIndex={stepIndex}
            onGoTo={(index) => setStepIndex(index)}
            steps={campaignWizardSteps}
          />
          <SaveStatus save={save} />
        </div>
      </div>

      <div className="min-w-0">
        {loadError ? (
          <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/[0.07] p-4 text-sm leading-6 text-ink">
            {loadError}
          </div>
        ) : null}
        <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Step {stepIndex + 1} of {campaignWizardSteps.length}
            {locked ? " · editing" : ""}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">
            {step.title}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {step.description}
          </p>

          {stepId === "basics" ? (
            <div className="mt-6 space-y-5">
              <Field
                label="Campaign title"
                help="What you are raising for, in one line."
                error={errorFor("title")}
                counter={{ target: 90, value: draft.title.trim().length }}
              >
                {({ describedBy, id, invalid }) => (
                  <Input
                    id={id}
                    value={draft.title}
                    autoComplete="off"
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) => patch({ title: event.target.value })}
                  />
                )}
              </Field>

              <Field
                label="Summary"
                help="The one paragraph that appears on the campaign card."
                error={errorFor("summary")}
                counter={{ target: 320, value: draft.summary.trim().length }}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={3}
                    value={draft.summary}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) => patch({ summary: event.target.value })}
                  />
                )}
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    id="campaign-category-label"
                    htmlFor="campaign-category"
                    className="text-sm font-medium text-ink"
                  >
                    Category
                  </label>
                  <Select
                    id="campaign-category"
                    aria-labelledby="campaign-category-label"
                    placeholder="Choose a category"
                    value={draft.category}
                    options={campaignCategories.map((category) => ({
                      label: category.label,
                      value: category.slug,
                    }))}
                    onValueChange={(value) =>
                      patch({
                        category: value as CampaignDraft["category"],
                        subcategory: "",
                      })
                    }
                  />
                  {errorFor("category") ? (
                    <p className="text-xs font-medium text-danger">
                      {errorFor("category")}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    id="campaign-subcategory-label"
                    htmlFor="campaign-subcategory"
                    className="text-sm font-medium text-ink"
                  >
                    Subcategory
                  </label>
                  <Select
                    id="campaign-subcategory"
                    aria-labelledby="campaign-subcategory-label"
                    placeholder={
                      draft.category
                        ? "Choose a subcategory (optional)"
                        : "Choose a category first"
                    }
                    value={draft.subcategory}
                    disabled={!draft.category}
                    options={subcategoryOptions}
                    onValueChange={(value) =>
                      patch({
                        subcategory: value as CampaignDraft["subcategory"],
                      })
                    }
                  />
                  {errorFor("subcategory") ? (
                    <p className="text-xs font-medium text-danger">
                      {errorFor("subcategory")}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <LocationPicker
                    label="Where you are"
                    help="Country and region help backers find you. Add a city if you want."
                    error={errorFor("location")}
                    value={draft.location}
                    onChange={(value) => patch({ location: value })}
                  />
                </div>
              </div>

              <Field
                label="The problem"
                help="At least 40 characters. Say what is broken today."
                error={errorFor("problem")}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={4}
                    value={draft.problem}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) => patch({ problem: event.target.value })}
                  />
                )}
              </Field>

              <Field
                label="Your plan"
                help="At least 40 characters. What will change, and how."
                error={errorFor("solution")}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={4}
                    value={draft.solution}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) =>
                      patch({ solution: event.target.value })
                    }
                  />
                )}
              </Field>

              <Field
                label="Who benefits"
                help="At least 20 characters. Name the people and the place."
                error={errorFor("beneficiaries")}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={3}
                    value={draft.beneficiaries}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) =>
                      patch({ beneficiaries: event.target.value })
                    }
                  />
                )}
              </Field>
            </div>
          ) : null}

          {stepId === "media" ? (
            <div className="mt-6 space-y-6">
              <PrototypeNotice title="Uploads are not connected">
                This build has no file storage, so nothing can be uploaded here.
                Link a YouTube or Vimeo video, or an image that is already
                online: the campaign stores the link and a backer loads it from
                the original host.
              </PrototypeNotice>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3">
                <button
                  type="button"
                  disabled
                  aria-describedby="media-upload-blocked"
                  className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted opacity-60"
                >
                  <HugeiconsIcon
                    icon={CloudUploadIcon}
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  Upload a file
                </button>
                <p
                  id="media-upload-blocked"
                  className="text-xs leading-5 text-muted"
                >
                  Disabled until file storage exists, rather than pretending to
                  upload. Use a link for now.
                </p>
              </div>

              <WizardMediaList
                addNote="A video is preferred at the top, but photos are fine."
                emptyNote="No hero media yet. Without any, the campaign falls back to the cover image built from its title."
                error={errorFor("heroMedia")}
                errorFor={errorFor}
                fieldPrefix="heroMedia"
                help="Shown at the top of the campaign page. A link is all this build stores; nothing is uploaded."
                items={draft.heroMedia}
                legend="Hero media"
                onChange={(heroMediaNext) =>
                  patch({ heroMedia: heroMediaNext })
                }
                orderNote="The first item is what a backer sees before pressing play."
              />

              <WizardMediaList
                emptyNote="Nothing in the story. This block is hidden entirely when it is empty."
                error={errorFor("storyMedia")}
                errorFor={errorFor}
                fieldPrefix="storyMedia"
                help="Shown inside the story, under the problem, the plan, and who benefits."
                items={draft.storyMedia}
                legend="In the story"
                onChange={(storyMediaNext) =>
                  patch({ storyMedia: storyMediaNext })
                }
              />
            </div>
          ) : null}

          {stepId === "funding" ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Funding target"
                  help="In USDC, which is 1:1 with the dollar figure backers see."
                  error={errorFor("targetInput")}
                >
                  {({ describedBy, id, invalid }) => (
                    <Input
                      id={id}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      value={draft.targetInput}
                      aria-describedby={describedBy || undefined}
                      aria-invalid={invalid || undefined}
                      onChange={(event) =>
                        patch({ targetInput: event.target.value })
                      }
                    />
                  )}
                </Field>

                <Field
                  label="Funding deadline"
                  help="All or nothing: the target has to be reached by this date."
                  error={errorFor("deadline")}
                >
                  {({ describedBy, id, invalid }) => (
                    <Input
                      id={id}
                      type="date"
                      value={draft.deadline}
                      aria-describedby={describedBy || undefined}
                      aria-invalid={invalid || undefined}
                      onChange={(event) =>
                        patch({ deadline: event.target.value })
                      }
                    />
                  )}
                </Field>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    How the target would be used{" "}
                    <span className="text-xs font-normal text-muted">
                      at least two lines, adding up to the target
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        useOfFunds: [
                          ...draft.useOfFunds,
                          {
                            amountInput: "",
                            id: nextDraftId("funds"),
                            label: "",
                          },
                        ],
                      })
                    }
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="text-muted"
                    />
                    Add a line
                  </button>
                </div>

                {errorFor("useOfFunds") ? (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {errorFor("useOfFunds")}
                  </p>
                ) : null}

                {draft.useOfFunds.length === 0 ? (
                  <p className="mt-2 rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
                    Add at least two lines so backers can see where the money
                    goes before they contribute.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {draft.useOfFunds.map((line, index) => (
                      <li
                        key={line.id}
                        className="rounded-xl border border-border bg-canvas p-3.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                            Line {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              patch({
                                useOfFunds: draft.useOfFunds.filter(
                                  (item) => item.id !== line.id,
                                ),
                              })
                            }
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          >
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              size={13}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            Remove
                          </button>
                        </div>
                        <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                          <Field
                            label="What it pays for"
                            error={errorFor(`useOfFunds.${line.id}`)}
                          >
                            {({ describedBy, id, invalid }) => (
                              <Input
                                id={id}
                                autoComplete="off"
                                value={line.label}
                                aria-describedby={describedBy || undefined}
                                aria-invalid={invalid || undefined}
                                onChange={(event) =>
                                  patch({
                                    useOfFunds: draft.useOfFunds.map((item) =>
                                      item.id === line.id
                                        ? { ...item, label: event.target.value }
                                        : item,
                                    ),
                                  })
                                }
                              />
                            )}
                          </Field>
                          <Field
                            label="Amount"
                            error={errorFor(`useOfFunds.${line.id}`)}
                          >
                            {({ describedBy, id, invalid }) => (
                              <Input
                                id={id}
                                inputMode="decimal"
                                autoComplete="off"
                                value={line.amountInput}
                                aria-describedby={describedBy || undefined}
                                aria-invalid={invalid || undefined}
                                onChange={(event) =>
                                  patch({
                                    useOfFunds: draft.useOfFunds.map((item) =>
                                      item.id === line.id
                                        ? {
                                            ...item,
                                            amountInput: event.target.value,
                                          }
                                        : item,
                                    ),
                                  })
                                }
                              />
                            )}
                          </Field>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <dl className="mt-3 space-y-1.5 rounded-xl border border-border bg-canvas p-3.5 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Lines total</dt>
                    <dd className="font-semibold tabular-nums text-ink">
                      {useOfFundsTotal ? (
                        <Amount value={useOfFundsTotal} />
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Target</dt>
                    <dd className="font-semibold tabular-nums text-ink">
                      {target ? <Amount value={target} /> : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}

          {stepId === "milestones" ? (
            <div className="mt-6 space-y-5">
              {locked ? (
                <p className="flex gap-2 rounded-xl border border-border bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    size={14}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                  />
                  Backers agreed to this plan, so its milestones, tranches, and
                  evidence definitions are locked (FR-303). You can change the
                  story, the disclosures, and the dates around them.
                </p>
              ) : null}

              {errorFor("milestones") ? (
                <p className="text-xs font-medium text-danger">
                  {errorFor("milestones")}
                </p>
              ) : null}

              <div className="rounded-xl border border-border bg-canvas p-3.5">
                <p className="text-sm font-medium text-ink">
                  Working capital · {WORKING_CAPITAL_LABEL} of the target
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {workingCapital
                    ? `${formatMoney(workingCapital.amount)} is released to you at funding close, before any milestone is verified, and is never refundable (FR-503a, FR-506).`
                    : "Enter a target to see the amount released at funding close."}{" "}
                  It is fixed, separate from the milestone plan, and it does not
                  grow when a campaign overfunds. The weights below divide
                  whatever remains after it.
                </p>
              </div>

              <ul className="space-y-3">
                {draft.milestones.map((milestone, index) => (
                  <li
                    key={milestone.id}
                    className="rounded-xl border border-border bg-canvas p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                        Milestone {index + 1}
                      </p>
                      {draft.milestones.length > 2 && !locked ? (
                        <button
                          type="button"
                          onClick={() =>
                            patch({
                              milestones: draft.milestones.filter(
                                (item) => item.id !== milestone.id,
                              ),
                            })
                          }
                          className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={13}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-2 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <Field
                          label="Title"
                          error={errorFor(`milestones.${milestone.id}`)}
                        >
                          {({ describedBy, id, invalid }) => (
                            <Input
                              id={id}
                              disabled={locked}
                              autoComplete="off"
                              value={milestone.title}
                              aria-describedby={describedBy || undefined}
                              aria-invalid={invalid || undefined}
                              onChange={(event) =>
                                patch({
                                  milestones: draft.milestones.map((item) =>
                                    item.id === milestone.id
                                      ? { ...item, title: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                            />
                          )}
                        </Field>

                        <Field
                          label="Share of escrow"
                          help="Percent of the target."
                          error={errorFor(`milestones.${milestone.id}`)}
                        >
                          {({ describedBy, id, invalid }) => (
                            <Input
                              id={id}
                              disabled={locked}
                              inputMode="decimal"
                              autoComplete="off"
                              placeholder="50"
                              value={milestone.allocationPercent}
                              aria-describedby={describedBy || undefined}
                              aria-invalid={invalid || undefined}
                              onChange={(event) =>
                                patch({
                                  milestones: draft.milestones.map((item) =>
                                    item.id === milestone.id
                                      ? {
                                          ...item,
                                          allocationPercent: event.target.value,
                                        }
                                      : item,
                                  ),
                                })
                              }
                            />
                          )}
                        </Field>
                      </div>

                      <Field
                        label="What it delivers"
                        error={errorFor(`milestones.${milestone.id}`)}
                      >
                        {({ describedBy, id, invalid }) => (
                          <Textarea
                            id={id}
                            rows={2}
                            disabled={locked}
                            value={milestone.deliverable}
                            aria-describedby={describedBy || undefined}
                            aria-invalid={invalid || undefined}
                            onChange={(event) =>
                              patch({
                                milestones: draft.milestones.map((item) =>
                                  item.id === milestone.id
                                    ? {
                                        ...item,
                                        deliverable: event.target.value,
                                      }
                                    : item,
                                ),
                              })
                            }
                          />
                        )}
                      </Field>

                      <Field
                        label="Evidence you will submit"
                        help="Fixed at approval. Describe exactly what proves this deliverable, so it can be judged without asking you."
                        error={errorFor(`milestones.${milestone.id}`)}
                      >
                        {({ describedBy, id, invalid }) => (
                          <Textarea
                            id={id}
                            rows={2}
                            disabled={locked}
                            value={milestone.evidence}
                            aria-describedby={describedBy || undefined}
                            aria-invalid={invalid || undefined}
                            onChange={(event) =>
                              patch({
                                milestones: draft.milestones.map((item) =>
                                  item.id === milestone.id
                                    ? {
                                        ...item,
                                        evidence: event.target.value,
                                      }
                                    : item,
                                ),
                              })
                            }
                          />
                        )}
                      </Field>

                      <Field
                        label="Expected date"
                        optional
                        help="When backers should expect this milestone."
                      >
                        {({ describedBy, id }) => (
                          <Input
                            id={id}
                            type="date"
                            disabled={locked}
                            value={milestone.expectedAt}
                            aria-describedby={describedBy || undefined}
                            onChange={(event) =>
                              patch({
                                milestones: draft.milestones.map((item) =>
                                  item.id === milestone.id
                                    ? {
                                        ...item,
                                        expectedAt: event.target.value,
                                      }
                                    : item,
                                ),
                              })
                            }
                          />
                        )}
                      </Field>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {draft.milestones.length < 6 ? (
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        milestones: [
                          ...draft.milestones,
                          createDraftMilestone(),
                        ],
                      })
                    }
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="text-muted"
                    />
                    Add a milestone
                  </button>
                ) : (
                  <p className="text-xs text-muted">
                    A plan can have at most six milestones.
                  </p>
                )}

                <p className="text-sm text-muted">
                  Milestone weights total{" "}
                  <span
                    className={
                      allocationTotal === 10000
                        ? "font-semibold text-ink"
                        : "font-semibold text-danger"
                    }
                  >
                    {formatBps(allocationTotal)}
                  </span>{" "}
                  of 100% of the post-tranche pool.
                </p>
              </div>
            </div>
          ) : null}

          {stepId === "rewards" ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-border bg-canvas p-4">
                <p className="text-sm font-semibold text-ink">
                  Rewards are optional
                </p>
                <p className="mt-1.5 text-sm leading-6 text-muted">
                  A campaign with no rewards is donation-based, and backers
                  contribute any amount. A reward changes what you promise to
                  send — never what is charged, and never the published
                  milestone plan (FR-301).
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    Reward tiers{" "}
                    <span className="text-xs font-normal text-muted">
                      optional, as many as you like
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        supportTiers: [
                          ...draft.supportTiers,
                          createDraftTier(),
                        ],
                      })
                    }
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="text-muted"
                    />
                    Add a reward
                  </button>
                </div>

                {draft.supportTiers.length === 0 ? (
                  <p className="mt-2 rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
                    No rewards yet. Leave it that way for a donation-based
                    campaign, or add one to promise something back.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {draft.supportTiers.map((tier, index) => {
                      const preview = parseImageSource(tier.imageInput);
                      const ships = tierNeedsShipping(tier);

                      return (
                        <li
                          key={tier.id}
                          className="rounded-xl border border-border bg-canvas p-3.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                              Reward {index + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                patch({
                                  supportTiers: draft.supportTiers.filter(
                                    (item) => item.id !== tier.id,
                                  ),
                                })
                              }
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                              <HugeiconsIcon
                                icon={Cancel01Icon}
                                size={13}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              Remove
                            </button>
                          </div>

                          <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)]">
                            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border bg-brand/[0.06]">
                              {preview.ok ? (
                                <MediaImage
                                  alt=""
                                  className="object-cover"
                                  sizes="112px"
                                  src={preview.src}
                                />
                              ) : (
                                <span className="absolute inset-0 grid place-items-center text-brand-strong/55">
                                  <HugeiconsIcon
                                    icon={Award01Icon}
                                    size={22}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </div>

                            <div className="grid gap-3">
                              <Field
                                label="Title"
                                error={errorFor(`supportTiers.${tier.id}`)}
                              >
                                {({ describedBy, id, invalid }) => (
                                  <Input
                                    id={id}
                                    autoComplete="off"
                                    value={tier.title}
                                    aria-describedby={describedBy || undefined}
                                    aria-invalid={invalid || undefined}
                                    onChange={(event) =>
                                      patchTier(tier.id, {
                                        title: event.target.value,
                                      })
                                    }
                                  />
                                )}
                              </Field>
                              <Field
                                label="Minimum"
                                help="The lowest contribution that selects this reward. A contribution below it is still valid — the reward is simply not selected."
                                error={errorFor(
                                  `supportTiers.${tier.id}.minimum`,
                                )}
                              >
                                {({ describedBy, id, invalid }) => (
                                  <Input
                                    id={id}
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder="0.00"
                                    value={tier.minimumInput}
                                    aria-describedby={describedBy || undefined}
                                    aria-invalid={invalid || undefined}
                                    onChange={(event) =>
                                      patchTier(tier.id, {
                                        minimumInput: event.target.value,
                                      })
                                    }
                                  />
                                )}
                              </Field>
                            </div>
                          </div>

                          <div className="mt-3">
                            <Field
                              label="What the backer receives"
                              error={errorFor(
                                `supportTiers.${tier.id}.description`,
                              )}
                            >
                              {({ describedBy, id, invalid }) => (
                                <Textarea
                                  id={id}
                                  rows={2}
                                  value={tier.description}
                                  aria-describedby={describedBy || undefined}
                                  aria-invalid={invalid || undefined}
                                  onChange={(event) =>
                                    patchTier(tier.id, {
                                      description: event.target.value,
                                    })
                                  }
                                />
                              )}
                            </Field>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field
                              label="Included items"
                              help="Optional. One item per line, shown as a list on the reward card."
                            >
                              {({ describedBy, id, invalid }) => (
                                <Textarea
                                  id={id}
                                  rows={3}
                                  placeholder={
                                    "One per line\ne.g. signed field guide"
                                  }
                                  value={tier.includesInput}
                                  aria-describedby={describedBy || undefined}
                                  aria-invalid={invalid || undefined}
                                  onChange={(event) =>
                                    patchTier(tier.id, {
                                      includesInput: event.target.value,
                                    })
                                  }
                                />
                              )}
                            </Field>
                            <Field
                              label="Quantity limit"
                              help="Optional. How many one backer may take. Blank means one: Inverge holds no stock count, so it never promises availability it cannot check."
                              error={errorFor(
                                `supportTiers.${tier.id}.quantity`,
                              )}
                            >
                              {({ describedBy, id, invalid }) => (
                                <Input
                                  id={id}
                                  inputMode="numeric"
                                  autoComplete="off"
                                  placeholder="1"
                                  value={tier.quantityLimitInput}
                                  aria-describedby={describedBy || undefined}
                                  aria-invalid={invalid || undefined}
                                  onChange={(event) =>
                                    patchTier(tier.id, {
                                      quantityLimitInput: event.target.value,
                                    })
                                  }
                                />
                              )}
                            </Field>
                          </div>

                          <div className="mt-3">
                            <Field
                              label="Reward image link"
                              help="An https image link, or an asset path starting with /. Leave it blank and Inverge's own reward mark is shown instead."
                              error={errorFor(`supportTiers.${tier.id}.image`)}
                            >
                              {({ describedBy, id, invalid }) => (
                                <Input
                                  id={id}
                                  inputMode="url"
                                  autoComplete="off"
                                  placeholder="https://…"
                                  value={tier.imageInput}
                                  aria-describedby={describedBy || undefined}
                                  aria-invalid={invalid || undefined}
                                  onChange={(event) =>
                                    patchTier(tier.id, {
                                      imageInput: event.target.value,
                                    })
                                  }
                                />
                              )}
                            </Field>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <label
                                className="text-sm font-medium text-ink"
                                htmlFor={`tier-type-${tier.id}`}
                              >
                                Type
                              </label>
                              <div className="mt-1.5">
                                <Select
                                  id={`tier-type-${tier.id}`}
                                  placeholder="Not stated yet"
                                  value={tier.fulfilment}
                                  options={FULFILMENT_OPTIONS.map((option) => ({
                                    label: option.label,
                                    value: option.value,
                                  }))}
                                  onValueChange={(value) =>
                                    patchTier(tier.id, {
                                      fulfilment:
                                        value as DraftSupportTier["fulfilment"],
                                    })
                                  }
                                />
                              </div>
                              {errorFor(`supportTiers.${tier.id}.type`) ? (
                                <p className="mt-1.5 text-xs font-medium text-danger">
                                  {errorFor(`supportTiers.${tier.id}.type`)}
                                </p>
                              ) : null}
                            </div>
                            <Field
                              label="Estimated delivery"
                              help="Your own estimate. It is shown as an estimate, never a promise."
                            >
                              {({ describedBy, id, invalid }) => (
                                <Input
                                  id={id}
                                  autoComplete="off"
                                  placeholder="e.g. 4 weeks after the deadline"
                                  value={tier.estimatedDelivery}
                                  aria-describedby={describedBy || undefined}
                                  aria-invalid={invalid || undefined}
                                  onChange={(event) =>
                                    patchTier(tier.id, {
                                      estimatedDelivery: event.target.value,
                                    })
                                  }
                                />
                              )}
                            </Field>
                          </div>

                          {ships ? (
                            <WizardShippingEditor
                              base={`supportTiers.${tier.id}`}
                              issues={issues}
                              tier={tier}
                              onChange={(changes) =>
                                patchTier(tier.id, changes)
                              }
                            />
                          ) : null}

                          {tier.variants.length > 0 ||
                          tier.addOns.length > 0 ? (
                            <div className="mt-3 rounded-xl border border-border bg-surface p-3.5">
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                                Carried from the published reward
                              </p>
                              <p className="mt-1.5 text-xs leading-5 text-muted">
                                {tier.variants.length > 0
                                  ? `${tier.variants.length} variant group${tier.variants.length === 1 ? "" : "s"}`
                                  : ""}
                                {tier.variants.length > 0 &&
                                tier.addOns.length > 0
                                  ? " and "
                                  : ""}
                                {tier.addOns.length > 0
                                  ? `${tier.addOns.length} add-on${tier.addOns.length === 1 ? "" : "s"}`
                                  : ""}{" "}
                                are kept as published. This build has no editor
                                for creating them, and dropping what a backer
                                was already offered would change the reward
                                under them.
                              </p>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : null}

          {stepId === "terms" ? (
            <div className="mt-6 space-y-5">
              <Field
                label="Who can contribute"
                help="Any age, region, or eligibility limit a backer needs to know."
                error={errorFor("eligibility")}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={3}
                    value={draft.eligibility}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) =>
                      patch({ eligibility: event.target.value })
                    }
                  />
                )}
              </Field>

              <Field
                label="Risks"
                help="What has to be true for this plan to work, and what could stop it."
                error={errorFor("risks")}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={4}
                    value={draft.risks}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) => patch({ risks: event.target.value })}
                  />
                )}
              </Field>

              <Field
                label="If the target is not reached"
                help="All-or-nothing means the escrow is refunded. Say how backers get it back."
                error={errorFor("failurePlan")}
              >
                {({ describedBy, id, invalid }) => (
                  <Textarea
                    id={id}
                    rows={3}
                    value={draft.failurePlan}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) =>
                      patch({ failurePlan: event.target.value })
                    }
                  />
                )}
              </Field>

              <Field
                label="Objection window"
                help="Days backers have to object to a claim (FR-602)."
                error={errorFor("objectionWindowDays")}
              >
                {({ describedBy, id, invalid }) => (
                  <Input
                    id={id}
                    inputMode="numeric"
                    autoComplete="off"
                    value={draft.objectionWindowDays}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={invalid || undefined}
                    onChange={(event) =>
                      patch({ objectionWindowDays: event.target.value })
                    }
                  />
                )}
              </Field>

              <div className="rounded-xl border border-border bg-canvas px-3.5 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-ink">
                    Platform success fee
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {formatBps(platformFeeBps)}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Set by Inverge and taken from each released tranche at the
                  moment it is released, including the working-capital tranche
                  (FR-505). It is not editable here, and it is never charged to
                  a backer on top of their contribution.
                </p>
              </div>
            </div>
          ) : null}

          {stepId === "review" ? (
            <div className="mt-6 space-y-5">
              <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Title</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {draft.title.trim() || "Not set"}
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Category and place</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {categoryLabelText || "No category"}
                    {subcategoryLabelText
                      ? ` / ${subcategoryLabelText}`
                      : ""} · {draft.location.trim() || "No location"}
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Target and deadline</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {target ? formatMoney(target) : "No target"}
                    {draft.deadline ? ` · closes ${draft.deadline}` : ""}
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Milestones</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {draft.milestones.length} milestones, weights totalling{" "}
                    {formatBps(allocationTotal)} of the remainder
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Rewards</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {publishedTiers.length === 0
                      ? "Donation-based — no reward tiers"
                      : `${publishedTiers.length} reward${publishedTiers.length === 1 ? "" : "s"}${
                          draft.supportTiers.length > publishedTiers.length
                            ? ` (${draft.supportTiers.length - publishedTiers.length} incomplete, so not counted)`
                            : ""
                        }`}
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Hero media</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {describeMediaCount(heroMedia)}
                    {heroMedia.at(0)
                      ? ` · ${
                          heroMedia.at(0)?.kind === "video"
                            ? "video first"
                            : "photo first"
                        }`
                      : ""}
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Media in the story</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {describeMediaCount(storyMedia)}
                  </dd>
                </div>
                <div className="bg-surface px-4 py-3 text-sm">
                  <dt className="text-xs text-muted">Working capital</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {workingCapital
                      ? `${WORKING_CAPITAL_LABEL} of the target (${formatMoney(workingCapital.amount)}) released at funding close`
                      : `${WORKING_CAPITAL_LABEL} of the target, released at funding close`}
                  </dd>
                </div>
              </dl>

              {issues.length > 0 ? (
                <div className="rounded-2xl border border-danger/40 bg-danger/[0.06] p-4">
                  <p className="text-sm font-semibold text-ink">
                    Something is incomplete
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                    {issues.map((issue, index) => (
                      <li key={`${issue.field}-${index}`}>{issue.message}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-2xl border border-border bg-canvas p-4 text-sm leading-6 text-muted">
                  Every step validates. The campaign is complete on its own
                  terms — what remains is outside your control.
                </p>
              )}

              {save.readiness && save.readiness.blockers.length > 0 ? (
                <div className="rounded-2xl border border-warning/30 bg-warning/[0.07] p-4">
                  <p className="text-sm font-semibold text-ink">
                    What the escrow server still needs
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    These are the server&apos;s checks against the escrow
                    programme. The draft is saved; deployment cannot start until
                    they pass.
                  </p>
                  <ul className="mt-2.5 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                    {save.readiness.blockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <BlockingNote
                items={preconditions}
                title="Before this can enter the review queue"
              />

              <PrototypeNotice title="Application fee is not connected">
                Your draft is saved to Inverge. This build still has no payment
                provider for the application fee, so the button below stays
                disabled rather than showing a success screen.
              </PrototypeNotice>

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  disabled
                  aria-describedby="submit-blocked"
                  className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white opacity-50"
                >
                  Submit for review
                </button>
                <p id="submit-blocked" className="text-xs leading-5 text-muted">
                  {outstanding.length === 0
                    ? "Everything the server checks has passed."
                    : `Still required: ${outstanding
                        .map((item) => item.label.toLowerCase())
                        .join(", ")}.`}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={ArrowLeft02Icon}
                  size={16}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                Back
              </button>
            ) : null}

            {stepIndex < campaignWizardSteps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Continue
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </button>
            ) : null}

            <Link
              href="/d/creator/campaigns"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
