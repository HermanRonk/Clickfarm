// De pauze van het hele spel blijft bewaard: na herladen of importeren draait het spel niet
// ineens door (#132).
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, reload, waitForInit } = require("./helpers/game");
const { threshold } = require("./levels.data");

// Oliepompen met genoeg energie: zonder pauze komt er iedere tick olie bij
const pumps = { PlayerLevel: 4, NextLevel: threshold(4), Factory: 5, EnergyAvailable: 50000, Capacitors: 1000, OilTankAmount: 5 };
const oil = (page) => game(page, () => +objOilTank.contents);

async function pause(page) {
  await page.locator("#navbarOptionDropdown").click();
  await page.locator("#pauseBTN").click();
}

test.describe("Pauze bewaren (#132)", () => {
  test("na herladen staat het spel nog op pauze", async ({ page }) => {
    await startGame(page, { state: pumps });
    await pause(page);
    await reload(page);
    expect(await game(page, () => paused)).toBe(1);
    await expect(page.locator("#pauseBTN")).toContainText("Continueer spel");
    await expect(page.locator("#notif")).toContainText("Het spel staat op pauze");
    const before = await oil(page);
    await tick(page, 5);
    expect(await oil(page)).toBe(before);
  });

  test("hervatten wordt ook bewaard", async ({ page }) => {
    await startGame(page, { state: { ...pumps, gamePaused: 1 } });
    expect(await game(page, () => paused)).toBe(1);
    await pause(page);
    await reload(page);
    expect(await game(page, () => paused)).toBe(0);
    await expect(page.locator("#pauseBTN")).toContainText("Pauzeer spel");
    const before = await oil(page);
    await tick(page, 3);
    expect(await oil(page)).toBeGreaterThan(before);
  });

  test("de pauze gaat mee in de save-code", async ({ page }) => {
    await startGame(page, { state: pumps });
    await pause(page);
    const code = await game(page, () => saveProgress());
    await game(page, () => {
      changeState();
    });
    await game(page, (code) => getSaveGame(code), code);
    await page.waitForLoadState("load");
    await waitForInit(page);
    expect(await game(page, () => paused)).toBe(1);
  });
});
