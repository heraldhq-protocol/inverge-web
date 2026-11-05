import { describe, expect, it } from "vitest";

import { commandsFor } from "@/features/command-palette/lib/commands";
import {
  filterCommands,
  normalizeSearchText,
  scoreCommand,
} from "@/features/command-palette/lib/fuzzy";

describe("normalizeSearchText", () => {
  it("folds accents, case, and punctuation", () => {
    expect(normalizeSearchText("  Café  Ideas!! ")).toBe("cafe ideas");
    expect(normalizeSearchText("⌘K")).toBe("k");
  });
});

describe("command matching", () => {
  it("matches an exact label ahead of an alias", () => {
    const commands = commandsFor({ context: "product", signedIn: true });
    const results = filterCommands(commands, "saved");

    expect(results[0]?.label).toBe("Saved");
  });

  it("resolves the bookmark alias", () => {
    const commands = commandsFor({ context: "product", signedIn: true });
    const results = filterCommands(commands, "bookmarks");

    expect(results.some((command) => command.label === "Saved")).toBe(true);
  });

  it("resolves 'my campaigns' to the creator campaign list, not the public feed", () => {
    const commands = commandsFor({ context: "product", signedIn: true });
    const results = filterCommands(commands, "my campaigns");

    expect(results[0]?.href).toBe("/d/creator/campaigns");
  });

  it("survives a character subsequence as the last resort", () => {
    const score = scoreCommand("stgs", {
      keywords: [],
      label: "Settings",
    });

    expect(score).not.toBeNull();
  });

  it("drops a command that shares no token or subsequence", () => {
    const score = scoreCommand("zzzz", {
      keywords: ["bookmarks"],
      label: "Saved",
    });

    expect(score).toBeNull();
  });
});
