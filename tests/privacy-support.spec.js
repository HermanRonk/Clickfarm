// Privacyverklaring en support: gelinkt vanuit de iOS-app en de App Store, in het Nederlands en het Engels.
const { test, expect } = require("@playwright/test");

const pages = [
  { path: "/privacy", heading: "Privacy", other: "/support" },
  { path: "/support", heading: "Support", other: "/privacy" },
];

test.describe("Privacy en support", () => {
  for (const { path, heading, other } of pages) {
    test(`${path} noemt het supportadres en linkt naar ${other}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      const mail = page.locator('a[href="mailto:support@clickfarm.nl"]');
      expect(await mail.count()).toBeGreaterThanOrEqual(2);
      await expect(mail.first()).toHaveText("support@clickfarm.nl");
      await expect(page.locator(`a[href="${other}"]`)).toHaveCount(2);
      await expect(page.getByRole("link", { name: "Terug naar het spel" })).toHaveAttribute("href", "/");
    });

    test(`${path} staat in het Nederlands en het Engels`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "nl");
      await expect(page.locator("#nl")).toBeVisible();
      const en = page.locator('[lang="en"] #en');
      await expect(en).toBeVisible();
      await page.getByRole("link", { name: "Read this in English" }).click();
      await expect(page).toHaveURL(/#en$/);
      await page.getByRole("link", { name: "Lees dit in het Nederlands" }).click();
      await expect(page).toHaveURL(/#nl$/);
    });

    test(`${path} laadt niets van andere domeinen en heeft geen donatielink`, async ({ page, baseURL }) => {
      const external = [];
      page.on("request", (req) => {
        if (!req.url().startsWith(baseURL)) external.push(req.url());
      });
      await page.goto(path);
      expect(external).toEqual([]);
      // Apple staat geen link naar betalingen buiten de App Store toe vanuit de app (deze pagina's linkt de app)
      await expect(page.locator('a[href*="buymeacoffee.com"]')).toHaveCount(0);
      await expect(page.locator(".site-footer")).toHaveCount(0);
    });
  }

  test("de privacyverklaring zegt dat de app geen gegevens verzamelt", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("#nl")).toContainText("De app verzamelt geen gegevens.");
    await expect(page.locator("#en")).toContainText("The app collects no data.");
    await expect(page.locator(".info")).toContainText("Umami");
    await expect(page.locator(".info")).toContainText("iCloud");
  });

  test("veelgestelde vragen zijn ingeklapt en gaan open", async ({ page }) => {
    await page.goto("/support");
    const faq = page.locator("details");
    expect(await faq.count()).toBeGreaterThanOrEqual(8);
    for (const item of await faq.all()) await expect(item).not.toHaveAttribute("open", /.*/);
    const icloud = page.locator("details", { hasText: "andere iPhone of iPad" });
    await icloud.locator("summary").click();
    await expect(icloud).toContainText("hetzelfde Apple Account");
  });

  test("de spelinformatie linkt naar privacy en support", async ({ page }) => {
    await page.goto("/info.html");
    const item = page.locator(".info li", { hasText: "Privacy." });
    await expect(item.getByRole("link", { name: "privacyverklaring" })).toHaveAttribute("href", "/privacy");
    await expect(item.getByRole("link", { name: "support" })).toHaveAttribute("href", "/support");
  });
});
