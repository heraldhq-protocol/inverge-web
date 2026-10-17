import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { IdeaDetail } from "@/features/ideas/components/idea-detail";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";

afterEach(cleanup);

/** The full detail page is a heavy render; give each case room to settle. */
const RENDER_TIMEOUT_MS = 20_000;

/**
 * The public page composes one merged record with its story, goals, feedback and
 * community settings, exactly as `ideas/[id]/page.tsx` does.
 */
function renderDetail(id: string) {
  const idea = getPreviewIdeaDetail(id);
  if (!idea) throw new Error(`Missing preview fixture: ${id}`);

  return render(
    <IdeaDetail
      idea={idea}
      ideas={allPublicIdeas(ideasPreviewData)}
      topics={previewTopics}
    />,
  );
}

describe("IdeaDetail", () => {
  it(
    "derives the stage and launch meter from the FR-204 thresholds",
    () => {
      // #given an idea that clears both gate thresholds
      renderDetail("campus-konekt");

      // #then — the stage is earned from evidence, and both checks report met
      expect(screen.getByText("Ready to launch")).toBeInTheDocument();
      expect(screen.getByText("Progress to launch")).toBeInTheDocument();
      expect(screen.getAllByText("Met")).toHaveLength(2);
    },
    RENDER_TIMEOUT_MS,
  );

  it(
    "shows quality signals, not only raw totals",
    () => {
      // #given an idea with verified supporters and a located base
      renderDetail("campus-konekt");

      // #then — verified count and the local/diaspora split are both visible
      expect(screen.getByText("287 identity-verified")).toBeInTheDocument();
      expect(screen.getByText("Where supporters are")).toBeInTheDocument();
      expect(screen.getByText("Local")).toBeInTheDocument();
      expect(screen.getByText("Diaspora")).toBeInTheDocument();
    },
    RENDER_TIMEOUT_MS,
  );

  it(
    "surfaces the demo, the creator's credibility, and the change log",
    () => {
      renderDetail("campus-konekt");

      expect(screen.getByText("See it before you back it")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "About the creator" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Replies to \d+% of feedback/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Changed after feedback" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Support this idea" }),
      ).toBeInTheDocument();
    },
    RENDER_TIMEOUT_MS,
  );

  it(
    "frames the meter as readiness, never as money raised",
    () => {
      renderDetail("campus-konekt");

      expect(
        screen.getByText(/tracks launch readiness, not money raised/i),
      ).toBeInTheDocument();
    },
    RENDER_TIMEOUT_MS,
  );

  it(
    "omits the change log when nothing has changed yet",
    () => {
      // #given an idea below the gate with an empty change log
      renderDetail("farmlink-coldbox");

      // #then — the stage reflects the shortfall and no log is invented
      expect(screen.getByText("Collecting feedback")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Changed after feedback" }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText("Not met yet")).toHaveLength(1);
    },
    RENDER_TIMEOUT_MS,
  );
});
