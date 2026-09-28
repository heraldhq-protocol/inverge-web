"use client";

import { Globe2, Mail, Smartphone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SettingsCard } from "@/features/settings/components/settings-section";
import { SettingsRow } from "@/features/settings/components/settings-row";
import type { SignInConnection } from "@/features/settings/types";

const icons = {
  apple: Smartphone,
  email: Mail,
  google: Globe2,
} as const;

export function SignInSettings({
  connections,
}: {
  connections: SignInConnection[];
}) {
  const [notice, setNotice] = useState("");

  return (
    <>
      <SettingsCard>
        {connections.map((connection) => (
          <SettingsRow
            key={connection.id}
            icon={icons[connection.id]}
            title={connection.label}
            description={connection.detail}
            action={
              <div className="flex items-center gap-2 sm:gap-3">
                <StatusBadge
                  variant={
                    connection.status === "not-connected"
                      ? "neutral"
                      : "success"
                  }
                >
                  {connection.status === "not-connected"
                    ? "Not connected"
                    : connection.status === "verified"
                      ? "Verified"
                      : "Connected"}
                </StatusBadge>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setNotice(
                      `${connection.label} account management will be available when authentication is connected.`,
                    )
                  }
                >
                  {connection.actionLabel}
                </Button>
              </div>
            }
          />
        ))}
      </SettingsCard>
      <p aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
        {notice ||
          "Sensitive account changes may require you to verify your identity again."}
      </p>
    </>
  );
}
