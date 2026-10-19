// Voorraadwaarden in de kaarten kleuren in de beta van groen (leeg) via oranje (half vol)
// naar rood (vol); de voortgangsbalk naar het volgende level niet.
const { test, expect } = require("@playwright/test");
const { startGame, game, stat } = require("./helpers/game");

// Graanopslag: 2 silo's van 5.000 kg
const grain = (contents) => ({ GrainSiloAmount: 2, GrainSiloContents: contents });
const value = (page) => stat(page, "#GrainAmount", "Voorraad").locator(".stock-level");
const color = (locator) => locator.evaluate((el) => getComputedStyle(el).color);

test.describe("Voorraadkleuren", () => {
  test("het gewone spel kleurt niets", async ({ page }) => {
    await startGame(page, { state: grain(5000) });
    await expect(page.locator(".stock-level")).toHaveCount(0);
  });

  test("leeg is groen, half vol oranje en vol rood", async ({ page }) => {
    await startGame(page, { beta: true, state: grain(0) });
    await expect(value(page)).toHaveAttribute("style", /var\(--stock-mid\) 0%, var\(--stock-empty\)/);
    await expect(value(page)).toHaveAttribute("title", "0% vol");
    const empty = await color(value(page));

    await game(page, () => {
      objGrainSilo.contents = 5000;
      objGrainSilo.show();
    });
    await expect(value(page)).toHaveAttribute("style", /var\(--stock-mid\) 100%, var\(--stock-empty\)/);
    const half = await color(value(page));

    await game(page, () => {
      objGrainSilo.contents = 10000;
      objGrainSilo.show();
    });
    await expect(value(page)).toHaveAttribute("style", /var\(--stock-full\) 100%, var\(--stock-mid\)/);
    const full = await color(value(page));

    expect(new Set([empty, half, full]).size).toBe(3);
  });

  test("ook de balken in de voorraadkaart kleuren mee, de levelvoortgang niet", async ({ page }) => {
    await startGame(page, { beta: true, state: grain(7500) });
    await expect(page.locator("#Grainstock .stock-level")).toHaveAttribute("title", "75% vol");
    await expect(page.locator("#nextlevel .stock-level")).toHaveCount(0);
  });
});
