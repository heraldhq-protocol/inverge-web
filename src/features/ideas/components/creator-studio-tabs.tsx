import { Tabs } from "@/components/ui/tabs";

/**
 * Creator Studio's sections.
 *
 * Only routes that exist become tabs. "Milestones" and "Campaigns" are absent
 * because this web client has no milestone or campaign surface yet, and a tab
 * that opens nothing is worse than a shorter bar.
 */
export function CreatorStudioTabs({
  active,
}: {
  active: "analytics" | "ideas" | "overview";
}) {
  return (
    <Tabs
      items={[
        {
          active: active === "overview",
          href: "/d/creator",
          label: "Overview",
        },
        { active: active === "ideas", href: "/d/ideas", label: "My ideas" },
        {
          active: active === "analytics",
          href: "/d/ideas/insights",
          label: "Analytics",
        },
      ]}
    />
  );
}
