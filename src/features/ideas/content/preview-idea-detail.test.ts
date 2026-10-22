import { describe, expect, it } from "vitest";

import { previewCompetition } from "@/features/ideathon/content/preview-competition";
import { summariseFeedback } from "@/features/analytics/lib/feedback-summary";
import { getPreviewFeedbackForm } from "@/features/feedback/content/preview-feedback";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";

describe("preview feedback configuration", () => {
  it("gives every catalogue idea a merged record", () => {
    const idea = getPreviewIdeaDetail("campus-konekt");

    expect(idea?.cover).toBeTruthy();
    expect(idea?.goals?.feedback).toBe(true);
    expect(idea?.feedbackForm?.enabled).toBe(true);
  });

  it("keeps one idea with feedback deliberately disabled", () => {
    expect(getPreviewIdeaDetail("zippy-campus")?.feedbackForm?.enabled).toBe(
      false,
    );
  });

  it("does not attach funding intent to an idea that is not seeking funding", () => {
    expect(getPreviewIdeaDetail("skill-circle")?.fundingIntent).toBeUndefined();
    expect(getPreviewIdeaDetail("campus-konekt")?.fundingIntent).toBeDefined();
  });

  it("only exposes community destinations that are valid", () => {
    const community = getPreviewIdeaDetail("campus-konekt")?.community;

    expect(community?.enabled).toBe(true);
    for (const destination of community?.destinations ?? []) {
      expect(
        destination.url.startsWith("https://") ||
          destination.url.startsWith("/"),
      ).toBe(true);
    }
  });

  it("summarises the analytics idea's own form and current-version answers", () => {
    const form = getPreviewFeedbackForm("skill-circle");
    const summary = form ? summariseFeedback(form, []) : undefined;

    expect(form?.questions.length).toBeGreaterThan(0);
    expect(summary?.configured).toBe(true);
    expect(summary?.responseCount).toBe(0);
  });

  it("keeps competition standings tied to real catalogue ideas", () => {
    for (const entry of previewCompetition.entries) {
      expect(getPreviewIdeaDetail(entry.idea.id)).toBeDefined();
      expect(entry.rank).toBeGreaterThan(0);
    }
  });
});
