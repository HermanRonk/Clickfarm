// Uitleg per kaart: "?"-knop rechtsboven iedere kaart.
const { test, expect } = require("@playwright/test");
const { startGame, tick, isShown } = require("./helpers/game");
const { threshold } = require("./levels.data");

// Alles vrijgespeeld, zodat alle kaarten zichtbaar zijn
const everything = {
  PlayerLevel: 12,
  NextLevel: threshold(12),
  Rlevel: 4,
  ironAmountProspected: 1,
  ironSmelters: 1,
  coalAmountActive: 1,
  CoalPowerPlants: 1,
  steelAmount: 100,
};

// Kaarten zonder eigen uitleg: de verkooptab-blokjes en de nog niet bestaande mijnen (#48)
const withoutHelp = ["Gold-col", "Diamond-col", "Copper-col"];

test.describe("Uitleg per kaart", () => {
  test("iedere zichtbare kaart heeft een ?-knop", async ({ page }) => {
    await startGame(page, { state: everything });
    await tick(page, 2);
    const missing = await page.evaluate((withoutHelp) =>
      [...document.querySelectorAll(".rows:not(#sellMenu) > [id]")]
        .filter((card) => card.checkVisibility() && !withoutHelp.includes(card.id))
        .filter((card) => !card.querySelector(":scope > .help-toggle"))
        .map((card) => card.id),
    withoutHelp);
    expect(missing).toEqual([]);
  });

  test("iedere uitlegtekst hoort bij een bestaande kaart", async ({ page }) => {
    await startGame(page);
    const unknown = await page.evaluate(() =>
      Object.keys(helpTexts).filter((id) => !document.getElementById(id)?.closest(".rows"))
    );
    expect(unknown).toEqual([]);
  });

  test("de knop opent en sluit de uitleg", async ({ page }) => {
    await startGame(page);
    const button = page.getByRole("button", { name: "Uitleg over Landbouw" });
    const panel = page.locator("#help-landbouw-col");

    await expect(panel).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Bewerk landbouwgrond");
    await expect(button).toHaveAttribute("aria-expanded", "true");

    // De uitleg staat onder de kop van de kaart
    const headingBox = await page.locator("#landbouw-col > h2").boundingBox();
    const panelBox = await panel.boundingBox();
    expect(panelBox.y).toBeGreaterThan(headingBox.y);

    await button.click();
    await expect(panel).toBeHidden();
  });

  test("de uitleg blijft staan als de kaart bijgewerkt wordt", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 4, NextLevel: threshold(4), PowerPlants: 1, Oil: 100 } });
    await page.getByRole("button", { name: "Uitleg over Energie" }).click();
    await tick(page, 5);
    await expect(page.locator("#help-energy-col")).toBeVisible();
  });

  test("een ?-knop maakt een nog lege kaart of rij niet zichtbaar", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 12, NextLevel: threshold(12), Rlevel: 4 } });
    await tick(page, 2);
    // Zonder ijzer of staal blijven hoogovens en staal leeg en dus verborgen
    expect(await isShown(page, "SteelProduction-col")).toBe(false);
    expect(await isShown(page, "SteelInfo-col")).toBe(false);
    expect(await isShown(page, "production2-row")).toBe(false);
    // Kolencentrales verschijnen pas met een actieve steenkoolmijn
    expect(await isShown(page, "coalPower")).toBe(false);
  });
});
