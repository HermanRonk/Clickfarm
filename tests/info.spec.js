// Informatiepagina met uitleg per level (ingeklapt om spoilers te voorkomen).
const { test, expect } = require("@playwright/test");
const { startGame } = require("./helpers/game");
const { LEVELS } = require("./levels.data");

// Bedrag zoals in het spel, met een gewone spatie na het euroteken
const euro = (amount) =>
  amount.toLocaleString("nl-NL", { style: "currency", currency: "EUR" }).replace(/\s/g, " ");

test.describe("Spelinformatie", () => {
  test("is te openen vanuit het menu in een nieuw tabblad", async ({ page, context }) => {
    await startGame(page);
    await page.locator("#navbarOptionDropdown").click();
    const link = page.getByRole("link", { name: "Spelinformatie" });
    await expect(link).toHaveAttribute("target", "_blank");
    const [info] = await Promise.all([context.waitForEvent("page"), link.click()]);
    await info.waitForLoadState();
    await expect(info.getByRole("heading", { name: "Spelinformatie" })).toBeVisible();
    // Het spel zelf blijft open
    await expect(page.locator("#currentlevel")).toBeVisible();
  });

  test("levels zijn standaard ingeklapt en verklappen in de titel niets", async ({ page }) => {
    await page.goto("/info.html");
    const levels = page.locator("details[id^='level-']");
    await expect(levels).toHaveCount(12);
    for (let i = 0; i < 12; i++) {
      await expect(levels.nth(i)).not.toHaveAttribute("open", /.*/);
      await expect(levels.nth(i).locator("summary")).toHaveText(`Level ${i + 1}`);
    }
    // Inhoud van een dicht level is niet zichtbaar
    await expect(page.locator("#level-8 ul")).toBeHidden();
  });

  test("een level openen toont wat er vrijkomt", async ({ page }) => {
    await page.goto("/info.html");
    await page.locator("#level-8 summary").click();
    await expect(page.locator("#level-8")).toContainText("Mijnbouwonderzoek");
  });

  test("de drempels kloppen met het spel", async ({ page }) => {
    await page.goto("/info.html");
    for (const { level, threshold } of LEVELS.filter((l) => l.level <= 12)) {
      const text = await page.locator(`#level-${level}`).textContent();
      expect(text, `level ${level}`).toContain(`Volgend level bij ${euro(threshold)}`);
    }
  });

  test("laadt niets van andere domeinen en heeft een weg terug", async ({ page, baseURL }) => {
    const external = [];
    page.on("request", (req) => {
      if (!req.url().startsWith(baseURL)) external.push(req.url());
    });
    await page.goto("/info.html");
    await expect(page.getByRole("link", { name: "Terug naar het spel" })).toHaveAttribute("href", "./");
    expect(external).toEqual([]);
  });
});
