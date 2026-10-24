// Alles wat in de beta getest werd, zit sinds oktober 2026 in het gewone spel. De beta zelf
// blijft bestaan (met een eigen save) voor nieuwe onderdelen.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, stat, storage } = require("./helpers/game");
const { threshold } = require("./levels.data");

// Na level 13 wordt iedere drempel 5 keer zo hoog
const next = (n) => (n <= 13 ? threshold(n) : threshold(13) * 5 ** (n - 13));
const level = (n, extra = {}) => ({ PlayerLevel: n, NextLevel: next(n), ...extra });

test.describe("Beta-onderdelen in het gewone spel", () => {
  test("level 12 tot en met 16 zijn er, met de rijen voor koper tot en met chips", async ({ page }) => {
    const { pageErrors } = await startGame(page, { state: level(16, { Rlevel: 4 }) });
    for (const id of ["koper-row", "elektronica-row", "goud-row", "diamant-row", "datacenter-row", "isotopen-row"]) {
      expect(await game(page, (id) => document.getElementById(id).checkVisibility(), id), id).toBe(true);
    }
    await expect(page.locator("#capaButton1m")).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("een kopermijn bouwen kan op level 12, met bulkknoppen erbij", async ({ page }) => {
    await startGame(page, {
      state: level(12, { Rlevel: 4, Money: 1e11, copperAmountProspected: 3, steelAmount: 500000 }),
    });
    await page.locator("#copperMineButton").click();
    expect(await game(page, () => +objMines.copperAmountActive)).toBe(1);
    await expect(page.locator("[data-bulk='copper-10']")).toBeVisible();
    // De gewone save, zonder "beta:"
    expect(await storage(page, "copperAmountActive")).toBe("1");
    expect(await storage(page, "beta:copperAmountActive")).toBeNull();
  });

  test("pauzeknoppen, statistieken en korte getallen", async ({ page }) => {
    await startGame(page, { state: level(4, { Money: 1234567890, Factory: 2, EnergyAvailable: 1000 }) });
    await expect(page.locator("#MoneyTop kbd2")).toHaveText("€ 1,23 mld");
    await expect(page.locator("#pomp-col .pause-toggle")).toBeVisible();
    await page.locator("#navbarOptionDropdown").click();
    await expect(page.locator("#statsBTN")).toBeVisible();
    await expect(page.locator("#shortNumbersBTN")).toBeVisible();
    await tick(page, 60);
    expect(await storage(page, "statsPlay")).not.toBeNull();
  });

  test("netto energie, opbrengst per ronde en voorraadkleuren", async ({ page }) => {
    await startGame(page, { state: level(4, { Farmland: 12, Harvest: 100, GrainSiloContents: 2500 }) });
    await expect(page.locator("#TotalEnergyProduction")).toContainText("Netto per tick");
    await expect(stat(page, "#landbouw-col", "Opbrengst per ronde")).toHaveText("1.200 kg");
    await expect(page.locator("#GrainAmount .stock-level")).toHaveAttribute("title", "50% vol");
  });

  test("balans uit de beta: goedkoper prospecten en eieroverschot voor de helft", async ({ page }) => {
    await startGame(page, { state: level(8, { Rlevel: 3, Money: 1e9 }) });
    await game(page, () => objMines.prospect());
    expect(await game(page, () => +objMoney.amount)).toBe(1e9 - 10000000);
    expect(await game(page, () => objEgg.overflowFactor)).toBe(0.5);
  });

  test("#48 koper-, goud- en diamantmijnen zijn te bouwen", async ({ page }) => {
    await startGame(page, {
      state: level(15, {
        Rlevel: 4,
        copperAmountProspected: 1,
        goldAmountProspected: 1,
        diamondAmountProspected: 1,
      }),
    });
    for (const name of ["Bouw kopermijn", "Bouw goudmijn", "Bouw diamantmijn"]) {
      await expect(page.getByRole("button", { name, exact: true }), name).toBeVisible();
    }
  });

  test("een beta-spel gaat via de save-code mee naar het gewone spel", async ({ page }) => {
    await startGame(page, { beta: true, state: level(14, { Money: 4.2e12, goldAmount: 77 }) });
    const code = await game(page, () => saveProgress());
    await page.goto("/");
    await game(page, (code) => getSaveGame(code), code);
    await page.waitForLoadState("load");
    await expect(page.locator(".topbar .beta-badge")).toHaveCount(0);
    expect(await storage(page, "PlayerLevel")).toBe("14");
    expect(await storage(page, "goldAmount")).toBe("77");
    expect(await game(page, () => +objPlayerInfo.level)).toBe(14);
  });
});
