"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type IdeaViewer = "visitor" | "signed-in";

type IdeaViewerContextValue = {
  viewer: IdeaViewer;
  setViewer: (viewer: IdeaViewer) => void;
};

const IdeaViewerContext = createContext<IdeaViewerContextValue>({
  viewer: "visitor",
  setViewer: () => {},
});

export function useIdeaViewer(): IdeaViewerContextValue {
  return useContext(IdeaViewerContext);
}

/**
 * Preview-only viewer state for the public idea page.
 *
 * The app has no session yet, so the public page defaults to `visitor` and the
 * gated actions show a sign-in prompt. This provider lets a reviewer flip to
 * `signed-in` to inspect the interactive forms and the discussion input. It is
 * a development affordance, not an auth mechanism — when a real session lands,
 * the provider is replaced by server-derived viewer state.
 */
export function IdeaViewerProvider({
  children,
  initialViewer = "visitor",
}: {
  children: ReactNode;
  initialViewer?: IdeaViewer;
}) {
  const [viewer, setViewer] = useState<IdeaViewer>(initialViewer);

  return (
    <IdeaViewerContext.Provider value={{ viewer, setViewer }}>
      {children}
    </IdeaViewerContext.Provider>
  );
}

export function ViewerToggle() {
  const { viewer, setViewer } = useIdeaViewer();

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-canvas px-3 py-2">
      <span className="text-xs font-semibold text-muted">Preview as</span>
      <div role="group" aria-label="Preview viewer" className="flex gap-1">
        {(
          [
            ["visitor", "Visitor"],
            ["signed-in", "Signed in"],
          ] as const
        ).map(([value, label]) => {
          const selected = viewer === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => setViewer(value)}
              className={`inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                selected
                  ? "bg-brand text-white"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
