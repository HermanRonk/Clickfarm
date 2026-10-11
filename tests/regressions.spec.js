// Regressietests voor eerder opgeloste bugs en exploits.
// Iedere test noemt de commit waarin het probleem is opgelost.
const { test, expect } = require("@playwright/test");
const { startGame, reload, tick, game, storage } = require("./helpers/game");
const { threshold } = require("./levels.data");

const atLevel = (level, extra = {}) => ({ PlayerLevel: level, NextLevel: threshold(level), ...extra });
// Level 8 met afgerond mijnbouwonderzoek: steenkool en mijnen zichtbaar
const miningUnlocked = (extra = {}) => atLevel(8, { Rlevel: 4, ...extra });

test.describe("Exploits (2b48be9)", () => {
  test("steenkool kopen kost de prijs per ton, niet per 1.000 ton", async ({ page }) => {
    await startGame(page, { state: miningUnlocked({ Money: 10000000, coalAmount: 0 }) });
    const price = await game(page, () => +objCoal.price);
    await page.getByRole("button", { name: "Koop 50k steenkool" }).click();
    expect(await game(page, () => +objCoal.amount)).toBe(50000);
    expect(await game(page, () => objMoney.amount)).toBe(10000000 - 50000 * price * 1.5);
  });

  test("steenkool kopen kan niet zonder genoeg geld", async ({ page }) => {
    await startGame(page, { state: miningUnlocked({ Money: 100000, coalAmount: 0 }) });
    await page.getByRole("button", { name: "Koop 50k steenkool" }).click();
    await expect(page.locator("#notif")).toContainText("Niet genoeg doekoe!");
    expect(await game(page, () => +objCoal.amount)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBe(100000);
  });

  test("steenkool verkopen bij tekort voor de centrales doet niets", async ({ page }) => {
    await startGame(page, {
      state: miningUnlocked({ Money: 100, coalAmount: 500, CoalPowerPlants: 1 }),
    });
    await page.getByRole("button", { name: "Verkoop steenkool!" }).click();
    expect(await game(page, () => +objCoal.amount)).toBe(500);
    expect(await game(page, () => objMoney.amount)).toBe(100);
  });

  test("steenkool verkopen houdt de voorraad voor de centrales achter", async ({ page }) => {
    await startGame(page, {
      state: miningUnlocked({ Money: 100, coalAmount: 5000, CoalPowerPlants: 1 }),
    });
    const price = await game(page, () => +objCoal.price);
    await page.getByRole("button", { name: "Verkoop steenkool!" }).click();
    expect(await game(page, () => +objCoal.amount)).toBe(1000);
    expect(await game(page, () => objMoney.amount)).toBe(100 + 4000 * price);
  });

  test("olie verkopen met minder olie dan de centrales nodig hebben geeft geen negatieve verkoop", async ({ page }) => {
    await startGame(page, { state: atLevel(4, { Money: 1000, Oil: 20, PowerPlants: 10 }) });
    await page.getByRole("button", { name: "Verkoop olie!" }).click();
    expect(await game(page, () => objMoney.amount)).toBe(1000);
    expect(await game(page, () => +objOilTank.contents)).toBe(20);
  });
});

test.describe("Productieberekeningen (c96de1e)", () => {
  test("mijnen draaien gedeeltelijk bij een energietekort", async ({ page }) => {
    // 3 mijnen hebben 750 energie nodig, met 600 energie kunnen er 2 draaien
    await startGame(page, { state: { coalAmountActive: 3, EnergyAvailable: 600 } });
    await tick(page, 1);
    expect(await game(page, () => +objCoal.amount)).toBe(2 * 3500);
    expect(await game(page, () => +objEnergy.available)).toBe(100);
  });

  test("energie gaat niet verloren als er te weinig is", async ({ page }) => {
    await startGame(page, { state: { EnergyAvailable: 30 } });
    expect(await game(page, () => objEnergy.use(50, "test"))).toBe(0);
    expect(await game(page, () => +objEnergy.available)).toBe(30);
  });

  test("olietank verkopen spoelt alleen de olie weg die niet meer past", async ({ page }) => {
    await startGame(page, { state: atLevel(3, { OilTankAmount: 2, Oil: 1500 }) });
    await page.getByRole("button", { name: "Verkoop olietank" }).click();
    expect(await game(page, () => +objOilTank.amount)).toBe(1);
    expect(await game(page, () => +objOilTank.contents)).toBe(1000);
  });

  test("de laatste olietank kan niet verkocht worden", async ({ page }) => {
    await startGame(page, { state: atLevel(3) });
    await page.getByRole("button", { name: "Verkoop olietank" }).click();
    await expect(page.locator("#notif")).toContainText("Je hebt minimaal één olietank nodig!");
    expect(await game(page, () => +objOilTank.amount)).toBe(1);
  });

  test("upgraden naar v2-oliepompen betaalt iedere oude pomp uit", async ({ page }) => {
    await startGame(page, {
      state: atLevel(8, { Money: 5000000, Factory: 3, FactoryCost: 13.31, steelAmount: 30000 }),
    });
    await game(page, () => objOilPumpAdv.upgrade(3));
    // Oude pompen: 13,31 → 12,10 → 11,00, elk verkocht voor 75%
    const refund = (13.31 + 12.1 + 11) * 0.75;
    expect(await game(page, () => objMoney.amount)).toBeCloseTo(5000000 - 3 * 1000000 + refund, 2);
    expect(await game(page, () => +objOilPump.amount)).toBe(0);
    expect(await game(page, () => +objOilPumpAdv.amount)).toBe(3);
    expect(await game(page, () => +objSteel.amount)).toBe(0);
  });

  test("windmolencontrollers malen met de energie die er is", async ({ page }) => {
    await startGame(page, {
      state: atLevel(6, { WindmillAmount: 3, WindmillControllerAmount: 3, GrainSiloContents: 5000, EnergyAvailable: 1000 }),
    });
    await tick(page, 12);
    expect(await game(page, () => +objFlourSilo.contents)).toBeGreaterThan(0);
  });
});

test.describe("Knoppen en weergave (6dc6102)", () => {
  test("olieverbruik wordt opgeteld, niet als tekst aan elkaar geplakt", async ({ page }) => {
    await startGame(page, { state: atLevel(4, { PowerPlants: 2 }) });
    await expect(page.locator("#OilUsage")).toHaveText("Olieverbruik: 2");
  });

  test("kunststofopslag controleert het saldo tegen de eigen prijs", async ({ page }) => {
    await startGame(page, { state: atLevel(7, { Money: 2000000 }) });
    await page.locator("#addPlasticStorage").click();
    expect(await game(page, () => +objPlastic.storage)).toBe(2);
    expect(await game(page, () => objMoney.amount)).toBe(500000);
  });

  test("mijn bouwen zonder vrije locatie wordt geweigerd, verkopen kan wel", async ({ page }) => {
    await startGame(page, {
      state: miningUnlocked({ Money: 1000000000, coalAmountProspected: 1, coalAmountActive: 1 }),
    });
    const build = page.getByRole("button", { name: "Bouw steenkoolmijn" });
    const sell = page.getByRole("button", { name: "Verkoop steenkoolmijn" });

    // Knop staat uit, en ook direct aanroepen wordt geweigerd
    await expect(build).toBeDisabled();
    await game(page, () => objMines.addMine(2, 1));
    await expect(page.locator("#notif")).toContainText("Geen locaties meer beschikbaar");
    expect(await game(page, () => +objMines.coalAmountActive)).toBe(1);

    // Verkopen mag wel, ook als alle locaties in gebruik zijn
    await sell.click();
    expect(await game(page, () => +objMines.coalAmountActive)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBeGreaterThan(1000000000);

    // Daarna is de locatie weer vrij
    await expect(build).toBeEnabled();
    await build.click();
    expect(await game(page, () => +objMines.coalAmountActive)).toBe(1);
  });
});

test.describe("Opslaan en laden (740c603)", () => {
  test("vermogen en graanopbrengst behouden hun decimalen", async ({ page }) => {
    await startGame(page, { state: { Money: 2500.75, Harvest: 110.5 } });
    await reload(page);
    expect(await game(page, () => objMoney.amount)).toBe(2500.75);
    expect(await game(page, () => objFarmland.harvest)).toBe(110.5);
  });

  test("olieprijs wordt met dezelfde sleutel geladen als opgeslagen", async ({ page }) => {
    await startGame(page, { state: { OilPrice: 17 } });
    expect(await game(page, () => +objOil.price)).toBe(17);
  });

  test("staalvoorraad blijft bewaard zonder hoogovens", async ({ page }) => {
    await startGame(page, { state: atLevel(8, { steelAmount: 500 }) });
    expect(await game(page, () => +objSteel.amount)).toBe(500);
    await tick(page, 10);
    await reload(page);
    expect(await storage(page, "steelAmount")).toBe("500");
  });

  test("verkoopprijs van steenkoolcentrales wordt opgeslagen", async ({ page }) => {
    await startGame(page, { state: atLevel(8, { Money: 200000000 }) });
    await game(page, () => objCoalPowerPlant.add());
    const price = await game(page, () => +objCoalPowerPlant.price);
    expect(price).toBeGreaterThan(50000000);
    expect(+(await storage(page, "CoalPowerPlantPrice"))).toBe(price);
    await reload(page);
    expect(await game(page, () => +objCoalPowerPlant.price)).toBe(price);
  });

  test("verbruikt kippenvoer wordt direct opgeslagen", async ({ page }) => {
    await startGame(page, { state: atLevel(6, { ChickenFarms: 1, Chickens: 100, GrainReserve: 1000 }) });
    await tick(page, 5);
    const reserve = await game(page, () => +objChickenFarm.grainReserve);
    expect(reserve).toBeLessThan(1000);
    expect(+(await storage(page, "GrainReserve"))).toBe(reserve);
  });
});

test.describe("Bekende problemen opgelost", () => {
  test("#44 prijs van landbouwgrond behoudt decimalen na herladen", async ({ page }) => {
    await startGame(page);
    await page.getByRole("button", { name: "Koop landbouwgrond" }).click();
    expect(await game(page, () => objFarmland.cost)).toBe(10.5);
    await reload(page);
    expect(await game(page, () => objFarmland.cost)).toBe(10.5);
    await expect(page.locator("#FarmlandPrice")).toHaveText("Kosten landbouwgrond: € 10,50");
  });
});
