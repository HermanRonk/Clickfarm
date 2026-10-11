// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// Met BASE_URL draaien de tests tegen een al draaiende omgeving (bijv. de container),
// anders start Playwright zelf een lokale statische server.
const externalBaseURL = process.env.BASE_URL;
const port = 8081;

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: externalBaseURL || `http://localhost:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "nl-NL",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `node tests/helpers/serve.js`,
        env: { PORT: String(port) },
        url: `http://localhost:${port}/healthz`,
        reuseExistingServer: !process.env.CI,
      },
});
