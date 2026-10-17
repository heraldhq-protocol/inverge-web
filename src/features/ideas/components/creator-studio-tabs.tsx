import { Tabs } from "@/components/ui/tabs";

/**
 * Creator Studio's sections.
 *
 * Only routes that exist become tabs: the overview, the idea list, the
 * feedback inbox, and analytics. "Audience", "Milestones", and "Campaigns" are
 * absent because this web client has no data model for them yet, and a tab
 * that opens nothing is worse than a shorter bar.
 */
export function CreatorStudioTabs({
  active,
}: {
  active: "analytics" | "feedback" | "ideas" | "overview";
}) {
  return (
    <Tabs
      items={[
        {
          active: active === "overview",
          href: "/d/creator",
          label: "Overview",
        },
        {
          active: active === "ideas",
          href: "/d/creator/ideas",
          label: "My ideas",
        },
        {
          active: active === "feedback",
          href: "/d/creator/feedback",
          label: "Feedback",
        },
        {
          active: active === "analytics",
          href: "/d/creator/analytics",
          label: "Analytics",
        },
      ]}
    />
  );
}
