// Previews bij delen: iedere openbare pagina heeft een beschrijving, Open Graph-tags en een deelafbeelding
const { test, expect } = require("@playwright/test");

const pages = [
  { path: "/", url: "https://clickfarm.nl/", title: /idlegame/ },
  { path: "/info.html", url: "https://clickfarm.nl/info.html", title: /^Spelinformatie/ },
  { path: "/beta/", url: "https://clickfarm.nl/beta/", title: /^Beta/ },
];

const meta = (page, attr, name) => page.locator(`meta[${attr}="${name}"]`).getAttribute("content");

test.describe("Previews bij delen", () => {
  for (const { path, url, title } of pages) {
    test(`${path} heeft een titel, beschrijving en Open Graph-tags`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(url);

      const description = await meta(page, "name", "description");
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(await meta(page, "property", "og:description")).toBe(description);
      expect(await meta(page, "property", "og:title")).toMatch(/Clickfarm/);
      expect(await meta(page, "property", "og:type")).toBe("website");
      expect(await meta(page, "property", "og:url")).toBe(url);
      expect(await meta(page, "property", "og:locale")).toBe("nl_NL");
      expect(await meta(page, "property", "og:image")).toBe("https://clickfarm.nl/img/delen.jpg");
      expect(await meta(page, "name", "twitter:card")).toBe("summary_large_image");
    });
  }

  test("de pagina's hebben ieder een eigen titel en beschrijving", async ({ page }) => {
    const seen = { titles: new Set(), descriptions: new Set() };
    for (const { path } of pages) {
      await page.goto(path);
      seen.titles.add(await page.title());
      seen.descriptions.add(await meta(page, "name", "description"));
    }
    expect(seen.titles.size).toBe(pages.length);
    expect(seen.descriptions.size).toBe(pages.length);
  });

  test("de deelafbeelding is 1200×630 en kleiner dan 300 kB", async ({ page, request }) => {
    const res = await request.get("/img/delen.jpg");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/jpeg");
    expect((await res.body()).length).toBeLessThan(300 * 1024);

    await page.goto("/");
    const size = await page.evaluate(async () => {
      const img = new Image();
      img.src = "/img/delen.jpg";
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    });
    expect(size).toEqual([1200, 630]);
  });
});
