import { Tabs } from "@/components/ui/tabs";

/**
 * Creator Studio's sections.
 *
 * Only routes that exist become tabs: the overview, the idea list, the
 * feedback inbox, analytics, and the campaign list. "Audience" is still absent
 * because this web client has no data model for it yet, and a tab that opens
 * nothing is worse than a shorter bar.
 */
export function CreatorStudioTabs({
  active,
}: {
  active: "analytics" | "campaigns" | "feedback" | "ideas" | "overview";
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
          active: active === "campaigns",
          href: "/d/creator/campaigns",
          label: "Campaigns",
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
