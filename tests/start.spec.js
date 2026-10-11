// Een nieuwe speler: wat ziet hij bij de eerste keer openen?
const { test, expect } = require("@playwright/test");
const { startGame, reload, tick, game, shownMap, expectNoBrokenNumbers, storage, stat, levelText } = require("./helpers/game");
const { START_MONEY, ALL_GATED, expectedShown, expectedHidden, threshold } = require("./levels.data");

test.describe("Nieuw spel", () => {
  test("start op level 1 met startkapitaal en alleen landbouw zichtbaar", async ({ page }) => {
    const { pageErrors } = await startGame(page);

    await expect(levelText(page)).toHaveText("1");
    await expect(stat(page, "#nextlevel", "Volgend level")).toHaveText("€ 3.000,00");
    await expect(page.locator("#nextlevel .bar-label")).toHaveText("Voortgang66%");
    await expect(page.locator("#MoneyTop")).toContainText("€ 2.000,00");
    expect(await game(page, () => objMoney.amount)).toBe(START_MONEY);
    expect(await game(page, () => objPlayerInfo.nextlevel)).toBe(threshold(1));

    const shown = await shownMap(page, ALL_GATED);
    for (const id of expectedShown(1)) expect(shown[id], `#${id} zichtbaar`).toBe(true);
    for (const id of expectedHidden(1)) expect(shown[id], `#${id} verborgen`).toBe(false);

    // Verkooptab en mijnbouw zijn niet zichtbaar
    for (const id of ["sellMenu", "mijnen-row", "mijnen-row2", "Prospecting-col"]) {
      expect((await shownMap(page, [id]))[id], `#${id} verborgen`).toBe(false);
    }

    await tick(page, 30);
    await expectNoBrokenNumbers(page);
    expect(pageErrors).toEqual([]);
  });

  test("startwaarden worden opgeslagen in localStorage", async ({ page }) => {
    await startGame(page);
    await tick(page, 1);
    expect(await storage(page, "Money")).toBe(String(START_MONEY));
    expect(await storage(page, "Farmland")).toBe("1");
  });

  test("oude sleutels van de online koppeling worden opgeruimd", async ({ page }) => {
    await startGame(page, { state: { onlineUserID: "123", newUser: "0", guid: "abc" } });
    for (const key of ["onlineUserID", "newUser", "guid"]) {
      expect(await storage(page, key)).toBeNull();
    }
  });

  test("testopzet: de speltijd loopt alleen door via tick(), ook na herladen", async ({ page }) => {
    await startGame(page);
    await page.locator("#farmlandWorkBTN").click();
    await page.waitForTimeout(2500); // echte tijd
    expect(await game(page, () => objFarmland.FarmTimer)).toBe(10);
    await tick(page, 3);
    expect(await game(page, () => objFarmland.FarmTimer)).toBe(7);

    await game(page, () => objMoney.add(500, "test"));
    await reload(page);
    const money = await game(page, () => objMoney.amount);
    await page.waitForTimeout(2500);
    expect(await game(page, () => timerCounter)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBe(money);
  });
});
