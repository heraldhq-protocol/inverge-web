"use client";

import { Globe2, Megaphone, Tags } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { discoveryCategories } from "@/features/home/discovery-categories";
import { SettingsCard } from "@/features/settings/components/settings-section";
import { SettingsRow } from "@/features/settings/components/settings-row";
import type { SettingsData } from "@/features/settings/types";

const regionOptions = [
  { value: "west-africa", label: "Nigeria & West Africa" },
  { value: "africa", label: "All Africa" },
  { value: "global", label: "Global" },
] as const;

export function FeedSettings({ feed }: { feed: SettingsData["feed"] }) {
  const [selectedTopics, setSelectedTopics] = useState(
    () => new Set(feed.topics),
  );
  const [isEditingTopics, setIsEditingTopics] = useState(false);
  const [region, setRegion] = useState(feed.region);
  const [showPromoted, setShowPromoted] = useState(feed.showPromoted);

  function toggleTopic(value: string) {
    setSelectedTopics((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const visibleTopics = isEditingTopics
    ? discoveryCategories
    : discoveryCategories.filter((topic) => selectedTopics.has(topic.value));

  return (
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
                disabled={!isEditingTopics}
                aria-pressed={selected}
                onClick={() => toggleTopic(topic.value)}
                className={`min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default ${
                  selected
                    ? "border-brand/20 bg-brand/[0.08] text-brand-strong"
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
            options={regionOptions}
            onValueChange={setRegion}
          />
        }
      />

      <SettingsRow
        icon={Megaphone}
        mobileAction="inline"
        title="Show promoted ideas"
        description="Paid placement may affect visibility, but it never changes an idea's validation score."
        action={
          <Switch
            aria-label="Show promoted ideas"
            checked={showPromoted}
            onCheckedChange={setShowPromoted}
          />
        }
      />
    </SettingsCard>
  );
}
