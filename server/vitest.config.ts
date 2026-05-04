import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "server",
  test: {
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    clearMocks: true,
  },
});
