"use client";

import { Globe2, Megaphone, Tags } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { settingsFeedCategories } from "@/features/settings/content/feed-categories";
import { SettingsRow } from "@/features/settings/components/settings-row";
import { SettingsCard } from "@/features/settings/components/settings-section";
import {
  SettingsSaveBar,
  type SettingsSaveState,
} from "@/features/settings/components/settings-save-bar";
import type { SettingsData } from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

const regionOptions = [
  { value: "west-africa", label: "Nigeria & West Africa" },
  { value: "africa", label: "All Africa" },
  { value: "global", label: "Global" },
] as const;

function sameTopics(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  return Array.from(a).every((topic) => b.has(topic));
}

export function FeedSettings({
  feed,
  source,
}: {
  feed: SettingsData["feed"];
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState(
    () => new Set(feed.topics),
  );
  const [savedTopics, setSavedTopics] = useState(() => new Set(feed.topics));
  const [isEditingTopics, setIsEditingTopics] = useState(false);
  const [region, setRegion] = useState(feed.region);
  const [savedRegion, setSavedRegion] = useState(feed.region);
  const [showPromoted, setShowPromoted] = useState(feed.showPromoted);
  const [savedShowPromoted, setSavedShowPromoted] = useState(feed.showPromoted);
  const [status, setStatus] = useState<SettingsSaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const readOnly = source !== "api";
  const dirty =
    !sameTopics(selectedTopics, savedTopics) ||
    region !== savedRegion ||
    showPromoted !== savedShowPromoted;
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

  function changed() {
    setStatus("idle");
    setErrorMessage("");
  }

  function toggleTopic(value: string) {
    setSelectedTopics((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    changed();
  }

  async function save() {
    if (!dirty || readOnly) return;
    setStatus("saving");
    setErrorMessage("");
    const result = await sendJson<{
      feed: { region: string; showPromoted: boolean; topics: string[] };
    }>("/api/settings/feed", {
      body: {
        region,
        showPromoted,
        topics: Array.from(selectedTopics),
      },
      method: "PUT",
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.message);
      return;
    }

    const nextTopics = new Set(result.data.feed.topics);
    setSelectedTopics(nextTopics);
    setSavedTopics(nextTopics);
    setSavedRegion(result.data.feed.region);
    setShowPromoted(result.data.feed.showPromoted);
    setSavedShowPromoted(result.data.feed.showPromoted);
    setStatus("saved");
    router.refresh();
  }

  const visibleTopics = isEditingTopics
    ? settingsFeedCategories
    : settingsFeedCategories.filter((topic) => selectedTopics.has(topic.value));

  return (
    <>
      <SettingsCard>
        <SettingsRow
          icon={Tags}
          title="Topics you follow"
          description="Choose the idea categories Inverge should prioritize."
          action={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingTopics((current) => !current)}
            >
              {isEditingTopics ? "Done" : "Edit interests"}
            </Button>
          }
        >
          <div className="mt-3 flex flex-wrap gap-2">
            {visibleTopics.map((topic) => {
              const selected = selectedTopics.has(topic.value);
              return (
                <button
                  key={topic.value}
                  type="button"
                  disabled={!isEditingTopics || readOnly}
                  aria-pressed={selected}
                  onClick={() => toggleTopic(topic.value)}
                  className={`min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default ${
                    selected
                      ? "border-brand/25 bg-brand/[0.08] text-brand-strong"
                      : "border-border bg-canvas text-muted"
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
            {visibleTopics.length === 0 ? (
              <p className="text-xs text-muted">
                No topics selected. Edit interests to add one.
              </p>
            ) : null}
          </div>
        </SettingsRow>

        <SettingsRow
          icon={Globe2}
          title="Region preference"
          description="Used to prioritize relevant ideas; it does not hide other regions."
          action={
            <Select
              aria-label="Region preference"
              className="w-full sm:w-56"
              value={region}
              disabled={readOnly}
              options={regionOptions}
              onValueChange={(next) => {
                setRegion(next);
                changed();
              }}
            />
          }
        />

        <SettingsRow
          icon={Megaphone}
          actionPlacement="inline"
          title="Show promoted ideas"
          description="Paid placement may affect visibility, but it never changes an idea's validation score."
          action={
            <Switch
              aria-label="Show promoted ideas"
              checked={showPromoted}
              disabled={readOnly}
              onCheckedChange={(checked) => {
                setShowPromoted(checked);
                changed();
              }}
            />
          }
        />
      </SettingsCard>
      <SettingsSaveBar
        state={saveState}
        errorMessage={errorMessage}
        idleMessage={
          readOnly
            ? "Feed preferences need a live account. This preview is read-only."
            : "Feed preferences are saved to your account."
        }
        savedMessage="Feed preferences saved"
      >
        <Button
          type="button"
          size="md"
          disabled={!dirty || saveState === "saving" || readOnly}
          onClick={save}
        >
          Save feed preferences
        </Button>
      </SettingsSaveBar>
    </>
  );
}
