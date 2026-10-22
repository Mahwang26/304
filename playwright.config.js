// @ts-check
import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (tests/*.spec.js). By default they run against the local dev server,
// which Playwright starts if it isn't up; PLAYWRIGHT_BASE_URL points them at another copy,
// e.g. the published site:
//   npm run test:e2e
//   PLAYWRIGHT_BASE_URL=https://hytank-next.vercel.app npm run test:e2e
// .env.local has the test admin account (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD), if any.
try {
  process.loadEnvFile(".env.local");
} catch {}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const local = baseURL.startsWith("http://localhost");

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // The dev server compiles each page on first visit: a few browsers at a time keep it responsive.
  workers: local ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "es-AR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // The Chrome already installed on the machine, so no browser download is needed.
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "celular", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: local
    ? { command: "npm run dev", url: baseURL, reuseExistingServer: true, timeout: 120_000 }
    : undefined,
});
