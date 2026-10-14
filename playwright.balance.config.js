// @ts-check
// Balanssimulator: speelt het spel met een bot en meet de duur per level (npm run balance).
const { defineConfig } = require("@playwright/test");
const base = require("./playwright.config.js");

module.exports = defineConfig({
  ...base,
  testDir: "./tests/balance",
  testIgnore: [],
  retries: 0,
  reporter: [["list"]],
  use: { ...base.use, trace: "off", screenshot: "off" },
});
