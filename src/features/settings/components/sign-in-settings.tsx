"use client";

import { Globe2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SettingsRow } from "@/features/settings/components/settings-row";
import { SettingsCard } from "@/features/settings/components/settings-section";
import type { SignInConnection } from "@/features/settings/types";

const icons = {
  google: Globe2,
} as const;

/** Sign-in methods other than the account email, which has its own section. */
export function SignInSettings({
  connections,
}: {
  connections: SignInConnection[];
}) {
  const [notice, setNotice] = useState("");
  const methods = connections.filter((connection) => connection.id !== "email");

  return (
    <>
      <SettingsCard>
        {methods.length > 0 ? (
          methods.map((connection) => (
            <SettingsRow
              key={connection.id}
              actionPlacement="inline"
              icon={icons[connection.id as keyof typeof icons] ?? Globe2}
              title={connection.label}
              action={
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
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
                        `${connection.label} connections are managed by the sign-in provider and cannot be changed here yet.`,
                      )
                    }
                  >
                    {connection.actionLabel}
                  </Button>
                </div>
              }
            />
          ))
        ) : (
          <li className="px-4 py-5 text-sm text-muted sm:px-5">
            No additional sign-in methods are connected.
          </li>
        )}
      </SettingsCard>
      <p
        aria-live="polite"
        className="min-h-5 px-4 py-2.5 text-xs leading-5 text-muted sm:px-5"
      >
        {notice ||
          "Sensitive account changes may require you to verify your identity again."}
      </p>
    </>
  );
}
