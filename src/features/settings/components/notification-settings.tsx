"use client";

import { Flag, LayoutGrid, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsRow } from "@/features/settings/components/settings-row";
import { SettingsCard } from "@/features/settings/components/settings-section";
import {
  SettingsSaveBar,
  type SettingsSaveState,
} from "@/features/settings/components/settings-save-bar";
import type {
  NotificationPreferenceId,
  SettingsData,
} from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

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
  source,
}: {
  initialPreferences: SettingsData["notifications"];
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialPreferences);
  const [savedValues, setSavedValues] = useState(initialPreferences);
  const [status, setStatus] = useState<SettingsSaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const readOnly = source !== "api";
  const dirty = preferences.some(
    (preference) => values[preference.id] !== savedValues[preference.id],
  );
  const saveState: SettingsSaveState =
    status === "saving"
      ? "saving"
      : status === "error"
        ? "error"
        : dirty
          ? "dirty"
          : status === "saved"
            ? "saved"
            : "idle";

  function update(id: NotificationPreferenceId, checked: boolean) {
    setValues((current) => ({ ...current, [id]: checked }));
    setStatus("idle");
    setErrorMessage("");
  }

  async function save() {
    if (!dirty || readOnly) return;
    setStatus("saving");
    setErrorMessage("");

    const body = {
      creatorUpdates: values["creator-updates"],
      discoveryDigest: values["discovery-digest"],
      emailUpdates: values["email-updates"],
      milestoneReviews: values["milestone-reviews"],
    };
    const result = await sendJson<{
      notifications: {
        creatorUpdates: boolean;
        discoveryDigest: boolean;
        emailUpdates: boolean;
        milestoneReviews: boolean;
      };
    }>("/api/settings/notifications", { body, method: "PUT" });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.message);
      return;
    }

    const next = {
      "creator-updates": result.data.notifications.creatorUpdates,
      "discovery-digest": result.data.notifications.discoveryDigest,
      "email-updates": result.data.notifications.emailUpdates,
      "milestone-reviews": result.data.notifications.milestoneReviews,
    };
    setValues(next);
    setSavedValues(next);
    setStatus("saved");
    router.refresh();
  }

  return (
    <>
      <SettingsCard>
        {preferences.map((preference) => (
          <SettingsRow
            key={preference.id}
            icon={preference.icon}
            actionPlacement="inline"
            title={preference.title}
            description={preference.description}
            action={
              <Switch
                aria-label={preference.title}
                checked={values[preference.id]}
                disabled={readOnly}
                onCheckedChange={(checked) => update(preference.id, checked)}
              />
            }
          />
        ))}
      </SettingsCard>
      <SettingsSaveBar
        state={saveState}
        errorMessage={errorMessage}
        idleMessage={
          readOnly
            ? "Notification preferences need a live account. This preview is read-only."
            : "Changes apply to outbound email; in-app notifications are still recorded."
        }
        savedMessage="Notification preferences saved"
      >
        <Button
          type="button"
          size="md"
          disabled={!dirty || saveState === "saving" || readOnly}
          onClick={save}
        >
          Save notifications
        </Button>
      </SettingsSaveBar>
    </>
  );
}
