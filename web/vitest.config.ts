import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "web",
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    clearMocks: true,
  },
});
