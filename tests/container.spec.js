// Controles op de productie-container (nginx). Draaien alleen met BASE_URL,
// bijvoorbeeld via `npm run test:docker` of de container-job in GitHub Actions.
const { test, expect } = require("@playwright/test");

test.describe("Container", () => {
  test.skip(!process.env.BASE_URL, "Alleen tegen de container (BASE_URL)");

  test("health check antwoordt", async ({ request }) => {
    const res = await request.get("/healthz");
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe("ok\n");
  });

  test("beveiligingsheaders staan aan", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["cache-control"]).toBe("no-cache");
    expect(headers["server"]).not.toMatch(/\d/);
  });

  test("de informatiepagina wordt meegeleverd", async ({ request }) => {
    const res = await request.get("/info.html");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Spelinformatie");
  });

  test("de beta wordt meegeleverd: keuzepagina en spel", async ({ request }) => {
    const choice = await request.get("/beta/");
    expect(choice.status()).toBe(200);
    expect(await choice.text()).toContain("Clickfarm beta");
    const game = await request.get("/beta/spel.html");
    expect(game.status()).toBe(200);
    expect(await game.text()).toContain('id="FirstTab"');
    expect(game.headers()["content-type"]).toContain("text/html");
  });

  test("test- en buildbestanden zitten niet in de container", async ({ request }) => {
    for (const path of [
      "/package.json",
      "/playwright.config.js",
      "/playwright.balance.config.js",
      "/tests/levels.data.js",
      "/tests/helpers/game.js",
      "/Dockerfile",
      "/nginx.conf",
      "/README.md",
      "/.github/workflows/tests.yml",
    ]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
    }
  });

  test("Content-Security-Policy blokkeert geen onderdelen van het spel", async ({ page }) => {
    const violations = [];
    page.on("console", (msg) => {
      if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
    });
    await page.goto("/");
    await expect(page.locator("#currentlevel dd")).toHaveText("1");
    // Iconen komen uit de sprite in de pagina zelf
    await expect(page.locator("#i-pause")).toBeAttached();
    expect(violations).toEqual([]);
  });

  test("CSP staat geen externe bronnen meer toe", async ({ request }) => {
    const csp = (await request.get("/")).headers()["content-security-policy"];
    expect(csp).not.toContain("http");
  });
});
