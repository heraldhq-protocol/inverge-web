import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside a React Server Component. Tests exercise
      // server modules directly, so they resolve to a no-op marker instead.
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Cold runs on Windows re-evaluate the module graph slowly enough that the
    // 5s default times out the first assertion in a file. The tests themselves
    // complete in milliseconds once loaded, so only the ceiling is raised.
    testTimeout: 20_000,
  },
});
