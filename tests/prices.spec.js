// Marktprijzen: in de beta een groen, rood of geel driehoekje met de richting van de prijs
// sinds de vorige prijswissel (#122).
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, stat } = require("./helpers/game");
const { threshold } = require("./levels.data");

const state = { PlayerLevel: 9, NextLevel: threshold(9), Factory: 1, plasticFactories: 1, SalesComputerCPU: 1 };

// Zet de prijslijst vast en voer een prijswissel uit zoals de hoofdloop dat doet
const setPrices = (page, oil, grain, flour) =>
  game(
    page,
    ([oil, grain, flour]) => {
      Object.assign(objPrijslijst, { Oil: oil, GrainHigh: grain, GrainLow: grain, FlourHigh: flour, FlourLow: flour });
      objOil.priceCalc();
      objPlastic.showPrice();
      objGrain.priceCalc();
      showPrice();
    },
    [oil, grain, flour]
  );

const trend = (page, scope) => page.locator(scope).locator(".trend");

test.describe("Prijstrend (#122)", () => {
  test("het gewone spel toont geen driehoekjes", async ({ page }) => {
    await startGame(page, { state });
    await setPrices(page, 10, 100, 200);
    await setPrices(page, 15, 50, 200);
    await tick(page, 1);
    await expect(page.locator(".trend")).toHaveCount(0);
  });

  test("direct na het laden staat er nog geen driehoekje bij graan en bloem", async ({ page }) => {
    await startGame(page, { beta: true, state });
    await expect(trend(page, "#GrainPrice")).toHaveCount(0);
    await expect(trend(page, "#FlourPrice")).toHaveCount(0);
  });

  test("omhoog is groen ▲, omlaag rood ▼ en gelijk geel ■", async ({ page }) => {
    await startGame(page, { beta: true, state });
    await setPrices(page, 10, 100, 200);
    await setPrices(page, 15, 50, 200);
    await expect(trend(page, "#Oilprice")).toHaveText("▲");
    await expect(trend(page, "#Oilprice")).toHaveClass(/trend-up/);
    await expect(trend(page, "#Oilprice")).toHaveAttribute("title", "Prijs gestegen");
    await expect(trend(page, "#GrainPrice")).toHaveText("▼");
    await expect(trend(page, "#GrainPrice")).toHaveClass(/trend-down/);
    await expect(trend(page, "#FlourPrice")).toHaveText("■");
    await expect(trend(page, "#FlourPrice")).toHaveClass(/trend-same/);
    // De kleuren verschillen van elkaar
    const colors = await page.evaluate(() =>
      ["#Oilprice", "#GrainPrice", "#FlourPrice"].map(
        (id) => getComputedStyle(document.querySelector(id + " .trend")).color
      )
    );
    expect(new Set(colors).size).toBe(3);
  });

  test("kunststof volgt olie en pasta volgt bloem", async ({ page }) => {
    await startGame(page, { beta: true, state });
    await setPrices(page, 10, 100, 400);
    await setPrices(page, 5, 100, 600);
    await expect(trend(page, "#plasticPrice")).toHaveText("▼");
    expect(await game(page, () => [objPlastic.previousPrice(), objPasta.previousPrice()])).toEqual([180, 200]);
    await game(page, () => objPasta.show());
    await expect(trend(page, "#SellPasta")).toHaveText("▲");
  });

  test("de salescomputer toont de trend bij de huidige prijs", async ({ page }) => {
    await startGame(page, { beta: true, state });
    await setPrices(page, 10, 100, 200);
    await setPrices(page, 12, 100, 100);
    await game(page, () => objSalesComputer.show());
    await expect(stat(page, "#autoSellOil", "Huidige prijs").locator(".trend")).toHaveText("▲");
    await expect(stat(page, "#autoSellFlour", "Huidige prijs").locator(".trend")).toHaveText("▼");
  });
});
