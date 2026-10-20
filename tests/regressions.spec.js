// Regressietests voor eerder opgeloste bugs en exploits.
// Iedere test noemt de commit waarin het probleem is opgelost.
const { test, expect } = require("@playwright/test");
const { startGame, reload, tick, game, shownMap, storage, stat } = require("./helpers/game");
const { threshold } = require("./levels.data");

const atLevel = (level, extra = {}) => ({ PlayerLevel: level, NextLevel: threshold(level), ...extra });
// Level 8 met afgerond mijnbouwonderzoek: steenkool en mijnen zichtbaar
const miningUnlocked = (extra = {}) => atLevel(8, { Rlevel: 4, ...extra });

test.describe("Exploits (2b48be9)", () => {
  test("steenkool kopen kost de prijs per ton, niet per 1.000 ton", async ({ page }) => {
    await startGame(page, { state: miningUnlocked({ Money: 10000000, coalAmount: 0 }) });
    const price = await game(page, () => +objCoal.price);
    await page.getByRole("button", { name: "Koop 50.000 ton steenkool" }).click();
    expect(await game(page, () => +objCoal.amount)).toBe(50000);
    expect(await game(page, () => objMoney.amount)).toBe(10000000 - 50000 * price * 1.5);
  });

  test("steenkool kopen kan niet zonder genoeg geld", async ({ page }) => {
    await startGame(page, { state: miningUnlocked({ Money: 100000, coalAmount: 0 }) });
    await expect(page.getByRole("button", { name: "Koop 50.000 ton steenkool" })).toBeDisabled();
    await game(page, () => objCoal.buy(50000));
    await expect(page.locator("#notif")).toContainText("Niet genoeg doekoe!");
    expect(await game(page, () => +objCoal.amount)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBe(100000);
  });

  test("steenkool verkopen bij tekort voor de centrales doet niets", async ({ page }) => {
    await startGame(page, {
      state: miningUnlocked({ Money: 100, coalAmount: 500, CoalPowerPlants: 1 }),
    });
    await page.getByRole("button", { name: "Verkoop steenkool", exact: true }).click();
    expect(await game(page, () => +objCoal.amount)).toBe(500);
    expect(await game(page, () => objMoney.amount)).toBe(100);
  });

  test("steenkool verkopen houdt de voorraad voor de centrales achter", async ({ page }) => {
    await startGame(page, {
      state: miningUnlocked({ Money: 100, coalAmount: 5000, CoalPowerPlants: 1 }),
    });
    const price = await game(page, () => +objCoal.price);
    await page.getByRole("button", { name: "Verkoop steenkool", exact: true }).click();
    expect(await game(page, () => +objCoal.amount)).toBe(1000);
    expect(await game(page, () => objMoney.amount)).toBe(100 + 4000 * price);
  });

  test("olie verkopen met minder olie dan de centrales nodig hebben geeft geen negatieve verkoop", async ({ page }) => {
    await startGame(page, { state: atLevel(4, { Money: 1000, Oil: 20, PowerPlants: 10 }) });
    await page.getByRole("button", { name: "Verkoop olie", exact: true }).click();
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
    await expect(stat(page, "#OilUsage", "Olieverbruik per tick")).toHaveText("2 vaten");
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
    await expect(stat(page, "#landbouw-col", "Prijs per veld")).toHaveText("€ 10,50");
  });

  test("#43 ieder id komt maar één keer voor in de pagina", async ({ page }) => {
    // Level 12 met afgerond onderzoek, ijzer/hoogoven en pastahelpers: alle gegenereerde knoppen staan erop
    await startGame(page, {
      state: atLevel(12, { Rlevel: 4, ironAmountProspected: 1, ironSmelters: 1, coalAmountProspected: 1 }),
    });
    await expect(page.getByRole("button", { name: "Maak staal" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Ontsla pastahelper" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Bouw steenkoolsilo" })).toBeAttached();
    const duplicates = await page.evaluate(() => {
      const counts = {};
      document.querySelectorAll("[id]").forEach((el) => (counts[el.id] = (counts[el.id] || 0) + 1));
      return Object.keys(counts).filter((id) => counts[id] > 1);
    });
    expect(duplicates).toEqual([]);
  });

  test("#45 bovenbalk toont alleen voorraden die al vrijgespeeld zijn", async ({ page }) => {
    await startGame(page);
    const topBar = ["MoneyTop", "GrainTop", "FlourTop", "OilTop", "EnergyStats"];
    expect(await shownMap(page, topBar)).toEqual({
      MoneyTop: true,
      GrainTop: true,
      FlourTop: false,
      OilTop: false,
      EnergyStats: false,
    });
    // Na een level up naar 2 verschijnt bloem direct
    await game(page, () => objMoney.add(1000, "test"));
    await tick(page, 1);
    expect((await shownMap(page, ["FlourTop"])).FlourTop).toBe(true);
  });

  test("#47 verkooptab kan pas vanaf level 9 aangezet worden", async ({ page }) => {
    await startGame(page, { state: atLevel(8) });
    await page.locator("#navbarOptionDropdown").click();
    await expect(page.locator("#verkooptabBTN")).toBeDisabled();
    // Ook direct aanroepen toont de balk niet, maar geeft een melding
    await game(page, () => showQuickSell(1));
    await expect(page.locator("#notif")).toContainText("De verkooptab is beschikbaar vanaf level 9");
    expect((await shownMap(page, ["sellMenu"])).sellMenu).toBe(false);

    // Bij level 9 komt de optie beschikbaar
    await game(page, (target) => objMoney.add(target - objMoney.amount, "test"), threshold(8));
    await tick(page, 1);
    await expect(page.locator("#verkooptabBTN")).toBeEnabled();
    await page.locator("#verkooptabBTN").click();
    expect((await shownMap(page, ["sellMenu"])).sellMenu).toBe(true);
  });

  test("#47 oude save met verkooptab aan onder level 9 toont geen lege balk", async ({ page }) => {
    await startGame(page, { state: atLevel(3, { QS: 1 }) });
    expect((await shownMap(page, ["sellMenu"])).sellMenu).toBe(false);
  });

  test("#46 geen lege rijen zichtbaar, ook niet na levelen", async ({ page }) => {
    const emptyVisibleRows = () =>
      page.evaluate(() =>
        [...document.querySelectorAll(".rows")]
          .filter((row) => row.checkVisibility() && row.innerText.trim() === "")
          .map((row) => row.id)
      );
    await startGame(page);
    expect(await emptyVisibleRows()).toEqual([]);
    for (let level = 1; level < 13; level++) {
      await game(page, (target) => objMoney.add(target - objMoney.amount, "test"), threshold(level));
      await tick(page, 1);
      expect(await emptyVisibleRows(), `level ${level + 1}`).toEqual([]);
    }
  });

  test("#46 staalrij verschijnt zodra er ijzer gevonden is", async ({ page }) => {
    await startGame(page, { state: miningUnlocked() });
    expect((await shownMap(page, ["production2-row"]))["production2-row"]).toBe(false);
    await game(page, () => {
      objMines.ironAmountProspected = 1;
      objIronMelter.show();
    });
    await tick(page, 1);
    expect((await shownMap(page, ["production2-row"]))["production2-row"]).toBe(true);
  });

  test("#43 knop steenkoolmijn wordt uit- en aangezet, niet de siloknop", async ({ page }) => {
    await startGame(page, { state: atLevel(8, { Rlevel: 4, Money: 1000000000, coalAmountProspected: 1 }) });
    await expect(page.locator("#coalMineButton")).toHaveText("Bouw steenkoolmijn");
    await page.locator("#coalMineButton").click();
    await expect(page.locator("#coalMineButton")).toBeDisabled();
    await expect(page.locator("#coalSiloButton")).toBeEnabled();
  });
});

test.describe("Personeel en besturing per gebouw", () => {
  test("niet meer pastahelpers dan pastafabrieken", async ({ page }) => {
    await startGame(page, { state: atLevel(7, { Money: 1e8, PastaFactoryAmount: 2 }) });
    const hire = page.locator("#addPastaHelper");
    await hire.click();
    await hire.click();
    expect(await game(page, () => +objPastaHelper.amount)).toBe(2);
    await expect(page.locator("#addPastaHelper")).toBeDisabled();
    await expect(stat(page, "#pasta-col", "Fabrieken zonder helper")).toHaveText("0");

    await game(page, () => objPastaHelper.add(1));
    await expect(page.locator("#notif")).toContainText("Iedere pastafabriek heeft al een helper");
    expect(await game(page, () => +objPastaHelper.amount)).toBe(2);
    expect(await game(page, () => objMoney.amount)).toBe(1e8 - 2 * 1000000);

    // Een extra fabriek maakt weer ruimte voor een helper
    await page.getByRole("button", { name: "Bouw pastafabriek" }).click();
    await expect(page.locator("#addPastaHelper")).toBeEnabled();
  });

  test("een pastafabriek met een helper erop kan niet verkocht worden", async ({ page }) => {
    await startGame(page, {
      state: atLevel(7, { PastaFactoryAmount: 1, pastaHelper: 1, PastaFactoryAmountAutomated: 1 }),
    });
    await page.getByRole("button", { name: "Verkoop pastafabriek" }).click();
    await expect(page.locator("#notif")).toContainText("Ontsla eerst een pastahelper");
    expect(await game(page, () => +objPastaFactory.amount)).toBe(1);

    await page.locator("#removePastaHelper").click();
    await page.getByRole("button", { name: "Verkoop pastafabriek" }).click();
    expect(await game(page, () => +objPastaFactory.amount)).toBe(0);
  });

  test("oude save met meer pastahelpers dan fabrieken: handmatig pasta maken doet niets geks", async ({ page }) => {
    await startGame(page, {
      state: atLevel(7, {
        PastaFactoryAmount: 1, pastaHelper: 3, PastaFactoryAmountAutomated: 3,
        FlourSiloContents: 5000, Eggs: 50000, EnergyAvailable: 500, Pasta: 10,
      }),
    });
    await game(page, () => objPastaFactory.produce("manual"));
    expect(await game(page, () => +objStorehouse.pasta)).toBe(10);
    expect(await game(page, () => +objFlourSilo.contents)).toBe(5000);
    expect(await game(page, () => +objEnergy.available)).toBe(500);
  });

  test("niet meer kunststofmedewerkers dan kunststoffabrieken", async ({ page }) => {
    await startGame(page, { state: atLevel(7, { Money: 1e8, plasticFactories: 1 }) });
    await page.locator("#hireWorker").click();
    expect(await game(page, () => +objPlasticFactory.workers)).toBe(1);
    await expect(page.locator("#hireWorker")).toBeDisabled();
    await game(page, () => objPlasticFactory.addWorker(1));
    await expect(page.locator("#notif")).toContainText("Iedere kunststoffabriek heeft al een medewerker");
    expect(await game(page, () => +objPlasticFactory.workers)).toBe(1);
    expect(await game(page, () => objMoney.amount)).toBe(1e8 - 100000);
  });

  test("oude save met meer kunststofmedewerkers dan fabrieken: kunststof maken geeft geen olie of energie", async ({ page }) => {
    await startGame(page, {
      state: atLevel(8, { plasticFactories: 1, plasticWorkers: 3, Oil: 500, EnergyAvailable: 0, Pasta: 0 }),
    });
    await expect(stat(page, "#platicFactory-col", "Pasta per 15 ticks")).toHaveText("50 dozen");
    await game(page, () => objPlasticFactory.produce(0));
    expect(await game(page, () => +objOilTank.contents)).toBe(500);
    expect(await game(page, () => +objEnergy.available)).toBe(0);
    expect(await game(page, () => +objPlastic.amount)).toBe(0);
  });

  test("niet meer windmolencontrollers dan windmolens", async ({ page }) => {
    await startGame(page, { state: atLevel(6, { Money: 1e6, WindmillAmount: 2 }) });
    const add = page.getByRole("button", { name: "Bouw windmolencontroller" });
    await add.click();
    await add.click();
    expect(await game(page, () => +objWindmillController.amount)).toBe(2);
    await expect(add).toBeDisabled();
    await game(page, () => objWindmillController.add());
    await expect(page.locator("#notif")).toContainText("Iedere windmolen heeft al een controller");
    expect(await game(page, () => +objWindmillController.amount)).toBe(2);

    await page.getByRole("button", { name: "Bouw windmolen", exact: true }).click();
    await expect(add).toBeEnabled();
  });

  test("niet meer farmrobots dan nodig voor alle velden", async ({ page }) => {
    // 15 velden: twee robots (10 velden per robot) zijn genoeg
    await startGame(page, { state: atLevel(5, { Money: 1e6, Farmland: 15 }) });
    const buy = page.getByRole("button", { name: "Koop robot", exact: true });
    await buy.click();
    await buy.click();
    expect(await game(page, () => +objFarmRobot.robots)).toBe(2);
    await expect(buy).toBeDisabled();
    await game(page, () => objFarmRobot.add());
    await expect(page.locator("#notif")).toContainText("Je robots bewerken al al je velden");
    expect(await game(page, () => +objFarmRobot.robots)).toBe(2);

    for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Koop landbouwgrond" }).click();
    await expect(buy).toBeEnabled();
  });

  test("een high-tech oliepomp verkopen levert 75% op, net als andere gebouwen", async ({ page }) => {
    await startGame(page, { state: atLevel(10, { Money: 1, oilPumpAmount: 2 }) });
    await expect(stat(page, "#pomp-col", "Verkoopwaarde").last()).toHaveText("€ 750.000,00");
    await page.locator("#o2sell").click();
    expect(await game(page, () => +objOilPumpAdv.amount)).toBe(1);
    expect(await game(page, () => objMoney.amount)).toBe(750001);
  });

  test("oude save met te veel farmrobots gebruikt alleen energie voor robots met werk", async ({ page }) => {
    await startGame(page, { state: atLevel(5, { Farmland: 5, FarmRobots: 4, EnergyAvailable: 1000 }) });
    expect(await game(page, () => objFarmRobot.activeRobots)).toBe(1);
    expect(await game(page, () => +objEnergy.available)).toBe(985);
    await expect(stat(page, "#farmland-automation", "Velden bewerkt")).toHaveText("5");
    await expect(stat(page, "#farmland-automation", "Energie per run")).toHaveText("15");
  });
});

test.describe("Levelup werkt kaarten direct bij (#85)", () => {
  for (const beta of [false, true]) {
    test(`high-tech oliepompen verschijnen meteen op level 10${beta ? " (beta)" : ""}`, async ({ page }) => {
      await startGame(page, { beta, state: { PlayerLevel: 9, NextLevel: threshold(9), Money: threshold(9) - 1000 } });
      await expect(page.locator("#oil2")).toBeHidden();
      await game(page, () => objMoney.add(5000, "test"));
      await tick(page, 2);
      expect(await game(page, () => +objPlayerInfo.level)).toBe(10);
      await expect(page.locator("#oil2")).toBeVisible();
    });
  }

  test("pastahelpers verschijnen meteen op level 7", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 6, NextLevel: threshold(6), Money: threshold(6) - 1000 } });
    await expect(page.locator("#pastaHelperDiv")).toBeEmpty();
    await game(page, () => objMoney.add(5000, "test"));
    await tick(page, 2);
    expect(await game(page, () => +objPlayerInfo.level)).toBe(7);
    await expect(page.locator("#pastaHelperDiv")).toContainText("Pastahelpers");
  });
});

test.describe("Afval opruimen zonder splijtstofstavenfabriek (#107)", () => {
  const nuclear = (extra = {}) =>
    atLevel(12, { Rlevel: 4, Money: 1e9, nppAmount: 1, nrAmount: 1, fuellCellFactory: 1, frWaste: 0, ...extra });

  test("na verkoop van de laatste fabriek gaat de knop weer aan zodra er afval is", async ({ page }) => {
    await startGame(page, { state: nuclear() });
    const button = page.locator("#fcSellWasteButton");
    await expect(button).toBeDisabled();
    await page.locator("#fcfSellButton").click();
    expect(await game(page, () => +objFuelCellFactory.amount)).toBe(0);
    await game(page, () => objFuelRod.wasteFunction(1));
    await expect(button).toBeEnabled();
    await button.click();
    expect(await game(page, () => +objFuelRod.waste)).toBe(0);
    await expect(button).toBeDisabled();
  });

  test("de opruimprijs wordt ook zonder fabrieken opnieuw berekend als er afval is", async ({ page }) => {
    await startGame(page, { state: nuclear({ fuellCellFactory: 0, frWaste: 3 }) });
    await expect(page.locator("#fcSellWasteButton")).toBeEnabled();
    await game(page, () => (objFuelRod.wastePrice = 1));
    await tick(page, 10);
    expect(await game(page, () => objFuelRod.wastePrice)).toBeGreaterThanOrEqual(50000);
  });
});

test.describe("Energie wordt bewaard als de opslag vol raakt (#110)", () => {
  // Kerncentrale met reactor; de opslag (10 units = 1.000) raakt in één tick vol
  const nuclearFull = (extra = {}) =>
    atLevel(12, {
      Rlevel: 4, nppAmount: 1, nrAmount: 1, frAmount: 50, fuellCellFactory: 10,
      Capacitors: 10, EnergyAvailable: 900, ...extra,
    });

  test("na een tick staat de energie ook in de opslag, en blijft na herladen", async ({ page }) => {
    await startGame(page, { state: nuclearFull() });
    await tick(page, 1);
    const available = await game(page, () => +objEnergy.available);
    expect(available).toBe(1000);
    expect(await game(page, () => +store.getItem("EnergyAvailable"))).toBe(available);
    await reload(page);
    expect(await game(page, () => +objEnergy.available)).toBe(available);
  });

  test("in het gewone spel geen opslagknoppen van +100.000 en +1.000.000", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 16, NextLevel: threshold(13) * 125, Rlevel: 4 } });
    await expect(page.locator("#capaButton100k")).toBeHidden();
    await expect(page.locator("#capaButton1m")).toBeHidden();
  });

  test("de save-code bevat de actuele energie", async ({ page }) => {
    await startGame(page, { state: nuclearFull() });
    await tick(page, 1);
    const saved = await game(page, () =>
      JSON.parse(atob(saveProgress())).find((item) => item.startsWith("EnergyAvailable:"))
    );
    expect(saved).toBe(`EnergyAvailable:${await game(page, () => objEnergy.available)}`);
  });
});
