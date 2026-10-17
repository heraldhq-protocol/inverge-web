import { Tabs } from "@/components/ui/tabs";

/**
 * The sections of one idea's workspace.
 *
 * Tabs appear only for routes that resolve for this idea: a draft with no
 * public page has no feedback setup to open, and only the idea with an
 * analytics dataset gets an analytics tab. Each section is a route, so a tab
 * is shareable and works without JavaScript.
 */
export function IdeaWorkspaceTabs({
  active,
  analyticsHref,
  feedbackHref,
  ideaId,
}: {
  active: "analytics" | "feedback" | "overview";
  analyticsHref: string | null;
  feedbackHref: string | null;
  ideaId: string;
}) {
  const items = [
    {
      active: active === "overview",
      href: `/d/creator/ideas/${ideaId}`,
      label: "Overview",
    },
    ...(feedbackHref
      ? [
          {
            active: active === "feedback",
            href: feedbackHref,
            label: "Feedback",
          },
        ]
      : []),
    ...(analyticsHref
      ? [
          {
            active: active === "analytics",
            href: analyticsHref,
            label: "Analytics",
          },
        ]
      : []),
  ];

  return <Tabs items={items} />;
}
