import { discoveryCategories, isDiscoveryCategory } from "@/features/home/discovery-categories";
import { validateCommunityUrl, validateFeedbackForm } from "@/features/feedback/lib/feedback";
import type { BuilderStep } from "@/features/idea-builder/types";
import type { IdeaDraft } from "@/features/idea-builder/types";

export type DraftIssue = { field: string; message: string };

export function validateDraftStep(
  draft: IdeaDraft,
  step: BuilderStep,
): DraftIssue[] {
  const issues: DraftIssue[] = [];

  switch (step) {
    case "basics":
      if (!draft.title.trim()) {
        issues.push({ field: "title", message: "Add an idea title." });
      } else if (draft.title.trim().length > 140) {
        issues.push({ field: "title", message: "Keep the title under 140 characters." });
      }
      if (!draft.summary.trim()) {
        issues.push({ field: "summary", message: "Add a short summary." });
      } else if (draft.summary.length > 300) {
        issues.push({ field: "summary", message: "Keep the summary under 300 characters." });
      }
      if (!draft.category || !isDiscoveryCategory(draft.category)) {
        issues.push({ field: "category", message: "Choose a category." });
      }
      if (draft.coverUrl.trim()) {
        const cover = new URL(draft.coverUrl, "https://placeholder.invalid");
        if (cover.protocol !== "https:") {
          issues.push({ field: "coverUrl", message: "Use an https:// image link." });
        }
      }
      break;

    case "problem":
      if (!draft.problem.trim()) {
        issues.push({ field: "problem", message: "Describe the problem." });
      }
      if (!draft.targetUser.trim()) {
        issues.push({ field: "targetUser", message: "Name who the problem affects." });
      }
      if (!draft.currentAlternative.trim()) {
        issues.push({
          field: "currentAlternative",
          message: "Describe what those people do today.",
        });
      }
      break;

    case "solution":
      if (!draft.solution.trim()) {
        issues.push({ field: "solution", message: "Describe the proposed solution." });
      }
      break;

    case "roadmap": {
      // Roadmap is optional in the creation flow. If a step is started, both
      // halves must be present; an empty list is allowed.
      for (const entry of draft.roadmapSteps) {
        const hasDate = Boolean(entry.date.trim());
        const hasDescription = Boolean(entry.description.trim());
        if (!hasDate && !hasDescription) continue;
        if (!hasDate) {
          issues.push({ field: `roadmap:${entry.id}`, message: "Add a date." });
        }
        if (!hasDescription) {
          issues.push({
            field: `roadmap:${entry.id}`,
            message: "Describe what happens at this step.",
          });
        }
      }
      break;
    }

    case "goals": {
      const selected = Object.values(draft.goals).filter(Boolean).length;
      if (selected === 0) {
        issues.push({
          field: "goals",
          message: "Choose at least one kind of support you are looking for.",
        });
      }
      if (draft.goals.funding) {
        const amount = Number.parseFloat(draft.funding.askAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
          issues.push({
            field: "funding.askAmount",
            message: "Enter an indicative amount, or turn the funding goal off.",
          });
        }
      }
      break;
    }

    case "feedback": {
      if (draft.goals.feedback && draft.feedback.enabled) {
        for (const issue of validateFeedbackForm(draft.feedback)) {
          issues.push({ field: issue.field, message: issue.message });
        }
      }
      if (draft.goals.community && draft.community.enabled) {
        if (!draft.community.title.trim()) {
          issues.push({
            field: "community.title",
            message: "Add a title for the community invitation.",
          });
        }
        const destinations = draft.community.destinations.filter(
          (destination) => destination.enabled,
        );
        if (destinations.length === 0) {
          issues.push({
            field: "community.destinations",
            message: "Add at least one community link, or turn the invitation off.",
          });
        }
        for (const destination of destinations) {
          const result = validateCommunityUrl(destination.url);
          if ("error" in result) {
            issues.push({
              field: `community.${destination.id}`,
              message: `${destination.label || "Link"}: ${result.error}`,
            });
          }
        }
      }
      break;
    }

    case "review":
    default:
      break;
  }

  return issues;
}

export function validateDraft(draft: IdeaDraft): DraftIssue[] {
  return (
    [
      "basics",
      "problem",
      "solution",
      "roadmap",
      "goals",
      "feedback",
    ] as BuilderStep[]
  ).flatMap((step) => validateDraftStep(draft, step));
}

export function categoryLabel(value: IdeaDraft["category"]): string {
  return (
    discoveryCategories.find((category) => category.value === value)?.label ??
    "Category not set"
  );
}

export function draftCompleteness(draft: IdeaDraft): {
  completed: number;
  total: number;
  percent: number;
} {
  const checks = [
    draft.title.trim().length > 0,
    draft.summary.trim().length > 0,
    Boolean(draft.category),
    draft.problem.trim().length > 0,
    draft.targetUser.trim().length > 0,
    draft.currentAlternative.trim().length > 0,
    draft.solution.trim().length > 0,
    Object.values(draft.goals).some(Boolean),
  ];
  const completed = checks.filter(Boolean).length;
  return {
    completed,
    total: checks.length,
    percent: Math.round((completed / checks.length) * 100),
  };
}
