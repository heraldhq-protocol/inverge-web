"use client";

import { Flag, LayoutGrid, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "@/features/settings/components/settings-section";
import { SettingsRow } from "@/features/settings/components/settings-row";
import type {
  NotificationPreferenceId,
  SettingsData,
} from "@/features/settings/types";

const preferences: {
  description: string;
  icon: typeof Mail;
  id: NotificationPreferenceId;
  title: string;
}[] = [
  {
    id: "email-updates",
    icon: Mail,
    title: "Email updates",
    description: "Important activity from ideas and campaigns you follow.",
  },
  {
    id: "milestone-reviews",
    icon: Flag,
    title: "Milestone reviews",
    description:
      "Time-sensitive evidence and review-window reminders. We recommend keeping these on.",
  },
  {
    id: "creator-updates",
    icon: UserRound,
    title: "Creator updates",
    description: "New posts from creators you follow or back.",
  },
  {
    id: "discovery-digest",
    icon: LayoutGrid,
    title: "Discovery digest",
    description: "An occasional collection of ideas gaining momentum.",
  },
];

export function NotificationSettings({
  initialPreferences,
}: {
  initialPreferences: SettingsData["notifications"];
}) {
  const [values, setValues] = useState(initialPreferences);

  return (
    <SettingsCard>
      {preferences.map((preference) => (
        <SettingsRow
          key={preference.id}
          icon={preference.icon}
          mobileAction="inline"
          title={preference.title}
          description={preference.description}
          action={
            <Switch
              aria-label={preference.title}
              checked={values[preference.id]}
              onCheckedChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  [preference.id]: checked,
                }))
              }
            />
          }
        />
      ))}
    </SettingsCard>
  );
}
