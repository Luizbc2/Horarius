import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "https://schedra.app";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
