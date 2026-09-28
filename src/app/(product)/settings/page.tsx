import type { Metadata } from "next";

import { SettingsDashboard } from "@/features/settings/components/settings-dashboard";
import { settingsPreviewData } from "@/features/settings/content/preview-data";

export const metadata: Metadata = {
  title: "Settings | Inverge",
  description: "Manage your Inverge profile and account preferences.",
};

export default function SettingsPage() {
  return <SettingsDashboard data={settingsPreviewData} />;
}
