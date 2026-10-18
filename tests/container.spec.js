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

  test("robots.txt en sitemap.xml worden meegeleverd voor zoekmachines", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(robots.headers()["content-type"]).toContain("text/plain");
    expect(await robots.text()).toContain("Sitemap: https://clickfarm.nl/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toContain("application/xml");
    const locs = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    // Het spel zelf (/beta/spel.html) hoort er niet in
    expect(locs).toEqual(["https://clickfarm.nl/", "https://clickfarm.nl/info.html", "https://clickfarm.nl/beta/"]);
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
      "/docker/40-umami.sh",
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

  test("zonder Umami-variabelen staat er geen statistiekenscript in de pagina", async ({ request }) => {
    for (const path of ["/", "/beta/", "/beta/spel.html", "/info.html"]) {
      expect(await (await request.get(path)).text(), path).not.toContain("data-website-id");
    }
  });
});

// Dezelfde container, gestart met UMAMI_HOST, UMAMI_WEBSITE_ID en UMAMI_DOMAINS (docker/40-umami.sh)
test.describe("Container met bezoekersstatistieken (Umami)", () => {
  test.skip(!process.env.UMAMI_BASE_URL, "Alleen tegen de container met Umami (UMAMI_BASE_URL)");
  const base = process.env.UMAMI_BASE_URL;
  const host = process.env.UMAMI_HOST;
  const id = process.env.UMAMI_WEBSITE_ID;

  test("iedere pagina krijgt precies één Umami-script", async ({ request }) => {
    for (const path of ["/", "/beta/", "/beta/spel.html", "/info.html"]) {
      const html = await (await request.get(base + path)).text();
      expect(html.split(`src="${host}/script.js"`).length - 1, path).toBe(1);
      expect(html, path).toContain(`data-website-id="${id}"`);
      expect(html, path).toContain('data-domains="clickfarm.nl"');
      expect(html, path).toContain('data-do-not-track="true"');
    }
  });

  test("de CSP staat alleen de Umami-host toe voor scripts en verbindingen", async ({ request }) => {
    const csp = (await request.get(base + "/")).headers()["content-security-policy"];
    expect(csp).toContain(`script-src 'self' 'unsafe-inline' ${host};`);
    expect(csp).toContain(`connect-src 'self' ${host};`);
    expect(csp.match(/https?:\/\/[^\s;]+/g)).toEqual([host, host]);
  });

  test("het spel start zonder CSP-meldingen", async ({ page }) => {
    const violations = [];
    page.on("console", (msg) => {
      if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
    });
    await page.route(`${host}/**`, (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
    await page.goto(base + "/");
    await expect(page.locator("#currentlevel dd")).toHaveText("1");
    expect(violations).toEqual([]);
  });

  test("een ongeldige website-ID zet de statistieken uit", async ({ request }) => {
    test.skip(!process.env.UMAMI_BAD_BASE_URL, "Alleen met UMAMI_BAD_BASE_URL");
    const res = await request.get(process.env.UMAMI_BAD_BASE_URL + "/");
    expect(await res.text()).not.toContain("data-website-id");
    expect(res.headers()["content-security-policy"]).not.toContain("http");
  });
});
