// Energiekaart: "Productie per tick" telt alleen wat de centrales met de huidige brandstof
// kunnen leveren, de piekvraag telt alle automatische verbruikers mee en de beta toont
// de werkelijke verandering van de opslag (#116).
const { test, expect } = require("@playwright/test");
const { startGame, tick, game } = require("./helpers/game");
const { threshold } = require("./levels.data");

const level = (n, extra = {}) => ({ PlayerLevel: n, NextLevel: threshold(n), ...extra });
const production = (page) => page.locator("#TotalEnergyProduction dd").first();
// Twee kerncentrales met tien reactoren
const nuclear = (extra = {}) => level(12, { nppAmount: 2, nrAmount: 10, EnergyAvailable: 0, ...extra });
// Oliepompen met genoeg energie: verbruiken iedere tick energie
const pumps = level(4, { Factory: 5, EnergyAvailable: 50000, Capacitors: 1000, OilTankAmount: 5 });

test.describe("Energie: productie en piekvraag (#116)", () => {
  for (const beta of [false, true]) {
    test(`${beta ? "beta" : "gewoon spel"}: reactoren zonder splijtstof tellen niet mee`, async ({ page }) => {
      await startGame(page, { beta, state: nuclear() });
      await expect(production(page)).toHaveText("0");
      await expect(page.locator("#TotalEnergyProduction .hint:not(.hint-reserve)")).toContainText(
        "10 van 10 reactoren staan stil: geen splijtstof."
      );
      await tick(page, 2);
      await expect(production(page)).toHaveText("0");
    });
  }

  test("reactoren met splijtstof tellen mee, gelijk aan de kerncentralekaart", async ({ page }) => {
    await startGame(page, { state: nuclear({ pelletsActive: 100 }) });
    await expect(production(page)).toHaveText("50.000");
    await expect(page.locator("#TotalEnergyProduction .hint:not(.hint-reserve)")).toHaveCount(0);
    await tick(page, 1);
    await expect(production(page)).toHaveText("50.000");
    await expect(page.locator("#nppsum")).toContainText("50.000");
  });

  test("beta: de besturingsbonus geldt alleen voor reactoren die draaien", async ({ page }) => {
    // 4 bestuurde reactoren, maar pellets voor maar 2 reactoren
    await startGame(page, { beta: true, state: nuclear({ PlayerLevel: 14, NextLevel: threshold(13) * 5, reactorControls: 4, pelletsActive: 2 }) });
    expect(await game(page, () => objEnergy.capacity())).toBe(2 * 5000 + 2 * 5000);
    await expect(page.locator("#TotalEnergyProduction .hint:not(.hint-reserve)")).toContainText("8 van 10 reactoren staan stil");
  });

  test("olie- en kolencentrales tellen alleen mee voor zover er brandstof is", async ({ page }) => {
    await startGame(page, { state: level(12, { PowerPlants: 50, Oil: 20, CoalPowerPlants: 5, coalAmount: 2500 }) });
    // 20 vaten olie: 20 oliecentrales; 2.500 ton steenkool: 3 kolencentrales (zoals produce())
    expect(await game(page, () => objEnergy.capacity())).toBe(20 * 10 + 3 * 750);
    await game(page, () => {
      objOilTank.contents = 0;
      objCoal.amount = 0;
    });
    expect(await game(page, () => objEnergy.capacity())).toBe(0);
  });

  test("de piekvraag telt pastahelpers en kunststofmedewerkers mee", async ({ page }) => {
    await startGame(page, {
      state: level(12, {
        pastaHelper: 1,
        PastaFactoryAmount: 10,
        PastaFactoryAmountAutomated: 4,
        plasticFactories: 6,
        plasticWorkers: 3,
      }),
    });
    const extra = await game(page, () => {
      const all = objEnergy.demand();
      objPastaHelper.amount = 0;
      objPlasticFactory.workers = 0;
      return all - objEnergy.demand();
    });
    expect(extra).toBe(4 * 50 + 3 * 500);
  });
});

test.describe("Energie: netto per tick (beta, #116)", () => {
  test("een leeglopende opslag toont ▼ en hoe lang hij het nog volhoudt", async ({ page }) => {
    await startGame(page, { beta: true, state: pumps });
    await expect(page.locator("#TotalEnergyProduction")).toContainText("Netto per tick–");
    await tick(page, 16);
    const netto = page.locator("#TotalEnergyProduction .stats-down");
    await expect(netto).toHaveText("▼ −5");
    await expect(page.locator("#TotalEnergyProduction .hint:not(.hint-reserve)")).toContainText("Je opslag is over ongeveer 2u 4");
  });

  test("een volle opslag toont 'opslag vol'", async ({ page }) => {
    await startGame(page, {
      beta: true,
      state: level(4, { Factory: 5, PowerPlants: 5, Oil: 500, EnergyAvailable: 1000, Capacitors: 10, OilTankAmount: 5 }),
    });
    await tick(page, 5);
    expect(await game(page, () => objEnergy.full())).toBe(true);
    await expect(page.locator("#TotalEnergyProduction")).toContainText("0 (opslag vol)");
    await expect(page.locator("#TotalEnergyProduction .hint:not(.hint-reserve)")).toHaveCount(0);
    await expect(page.locator("#TotalEnergyProduction .hint-reserve")).toBeHidden();
  });

  test("de energiekaart verspringt niet als de hint komt en gaat (#120)", async ({ page }) => {
    await startGame(page, { beta: true, state: pumps });
    const card = page.locator("#TotalEnergyProduction");
    await tick(page, 1);
    await expect(card.locator(".hint-reserve")).toHaveCount(1);
    const before = (await card.boundingBox()).height;
    await tick(page, 16);
    await expect(card.locator(".hint:not(.hint-reserve)")).toBeVisible();
    expect((await card.boundingBox()).height).toBe(before);
  });
});
