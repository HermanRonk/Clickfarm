// Beta: dezelfde code onder /beta/, met eigen saves (voorvoegsel "beta:") en de balanswijzigingen
// die eerst getest worden. Het gewone spel moet precies hetzelfde blijven.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, storage, reload } = require("./helpers/game");
const { threshold } = require("./levels.data");

const level = (n, extra = {}) => ({ PlayerLevel: n, NextLevel: threshold(n), ...extra });

test.describe("Beta: pagina's en saves", () => {
  test("het gewone spel heeft een link naar de beta en geen beta-label", async ({ page }) => {
    await startGame(page);
    await expect(page.locator(".beta-badge")).toHaveCount(0);
    await expect(page.locator("#betaLink")).toHaveAttribute("href", "/beta/");
    await expect(page.locator("#mainGameLink")).toBeHidden();
  });

  test("de beta toont een label en de weg terug naar het gewone spel", async ({ page }) => {
    await startGame(page, { beta: true });
    await expect(page.locator(".topbar .beta-badge")).toHaveText("beta");
    await expect(page).toHaveTitle("Clickfarm.nl (beta)");
    await page.locator("#navbarOptionDropdown").click();
    await expect(page.locator("#mainGameLink")).toBeVisible();
    await expect(page.locator("#mainGameLink")).toHaveAttribute("href", "/");
    await expect(page.locator("#betaLink")).toContainText("spel meenemen of opnieuw beginnen");
  });

  test("de beta bewaart onder beta: en laat het gewone spel met rust", async ({ page }) => {
    await startGame(page, { beta: true, state: { Money: 5000 } });
    await game(page, () => localStorage.setItem("Money", "777"));
    await game(page, () => objMoney.add(1000, "test"));
    expect(await storage(page, "beta:Money")).toBe("6000");
    expect(await storage(page, "Money")).toBe("777");
  });

  test("een reset in de beta wist alleen het beta-spel", async ({ page }) => {
    await startGame(page, { beta: true, state: { Money: 5000 } });
    await game(page, () => localStorage.setItem("Money", "777"));
    page.on("dialog", (dialog) => dialog.accept());
    await Promise.all([page.waitForEvent("load"), game(page, () => resetGame())]);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toContain("Money");
    expect(await storage(page, "Money")).toBe("777");
  });

  test("een reset in het gewone spel wist de beta niet", async ({ page }) => {
    await startGame(page, { state: { Money: 5000 } });
    await game(page, () => localStorage.setItem("beta:Money", "888"));
    page.on("dialog", (dialog) => dialog.accept());
    await Promise.all([page.waitForEvent("load"), game(page, () => resetGame())]);
    expect(await storage(page, "beta:Money")).toBe("888");
  });

  test("de save-code bevat alleen de eigen sleutels, zonder voorvoegsel", async ({ page }) => {
    await startGame(page, { beta: true, state: { Money: 5000 } });
    await game(page, () => localStorage.setItem("AlleenGewoon", "1"));
    const { exported, own } = await game(page, () => ({
      exported: JSON.parse(atob(saveProgress())).map((item) => item.slice(0, item.indexOf(":"))),
      own: Object.keys(localStorage)
        .filter((k) => k.startsWith("beta:"))
        .map((k) => k.slice(5)),
    }));
    expect(exported).toContain("Money");
    expect(exported.sort()).toEqual(own.sort());
  });
});

test.describe("Beta: keuzepagina", () => {
  // Zet sleutels direct in de opslag en laad de keuzepagina opnieuw
  async function openChoice(page, items) {
    await page.goto("/beta/");
    await page.evaluate((items) => {
      localStorage.clear();
      for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
    }, items);
    await page.reload();
  }

  test("je huidige spel meenemen kopieert het naar de beta", async ({ page }) => {
    await openChoice(page, { PlayerLevel: "5", Money: "123456" });
    const copy = page.getByRole("button", { name: "Neem mijn huidige spel mee (level 5)" });
    await expect(page.locator("#betaContinue")).toBeHidden();
    await copy.click();
    await page.waitForURL("**/beta/spel.html");
    expect(await storage(page, "beta:PlayerLevel")).toBe("5");
    expect(await storage(page, "PlayerLevel")).toBe("5");
    await expect(page.locator(".topbar .beta-badge")).toBeVisible();
  });

  test("met een beta-spel kun je verder, en opnieuw beginnen vraagt eerst bevestiging", async ({ page }) => {
    await openChoice(page, { PlayerLevel: "5", "beta:PlayerLevel": "7", "beta:Money": "1" });
    await expect(page.locator("#betaContinue")).toHaveText("Ga verder met je beta-spel (level 7)");

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.locator("#betaNew").click();
    expect(await storage(page, "beta:PlayerLevel")).toBe("7");

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#betaNew").click();
    await page.waitForURL("**/beta/spel.html");
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toContain("PlayerLevel");
    expect(await storage(page, "beta:Money")).not.toBe("1");
  });

  test("zonder gewoon spel valt er niets mee te nemen", async ({ page }) => {
    await openChoice(page, {});
    await expect(page.locator("#betaCopy")).toBeDisabled();
    await expect(page.locator("#betaStatus")).toContainText("nog geen gewoon spel");
  });
});

test.describe("Beta: balans", () => {
  for (const [lvl, beta, price] of [
    [8, true, 10000000],
    [9, true, 25000000],
    [10, true, 50000000],
    [8, false, 50000000],
  ]) {
    test(`prospecten kost ${price / 1e6} mln op level ${lvl} (${beta ? "beta" : "gewoon spel"})`, async ({ page }) => {
      await startGame(page, { beta, state: level(lvl, { Rlevel: 3, Money: 1e9 }) });
      await game(page, () => objMines.prospect());
      expect(await game(page, () => +objMoney.amount)).toBe(1e9 - price);
    });
  }

  const uranium = level(10, {
    Rlevel: 4,
    uraniumAmountProspected: 1,
    uraniumAmountActive: 1,
    Pasta: 1000,
    Capacitors: 1000,
    EnergyAvailable: 50000,
  });

  test("beta: een uraniummijn draait iedere tick en eet 2 dozen pasta per tick", async ({ page }) => {
    await startGame(page, { beta: true, state: uranium });
    await tick(page, 1);
    expect(await game(page, () => [+objUraniumOre.amount, +objStorehouse.pasta])).toEqual([10, 998]);
    await tick(page, 9);
    expect(await game(page, () => [+objUraniumOre.amount, +objStorehouse.pasta])).toEqual([100, 980]);
  });

  test("gewoon spel: een uraniummijn draait eens per 10 ticks en eet 200 dozen", async ({ page }) => {
    await startGame(page, { state: uranium });
    await tick(page, 9);
    expect(await game(page, () => +objUraniumOre.amount)).toBe(0);
    await tick(page, 1);
    expect(await game(page, () => [+objUraniumOre.amount, +objStorehouse.pasta])).toEqual([100, 800]);
  });

  // 100.000 stroom op voorraad: minder dan de 150.000 die een batch in één keer vroeg
  const fuel = level(11, {
    Rlevel: 4,
    fuellCellFactory: 1,
    uraniumOreAmount: 20000,
    steelAmount: 5000,
    Capacitors: 1000,
    EnergyAvailable: 100000,
  });

  test("beta: een splijtstoffabriek gebruikt 1.500 stroom per tick", async ({ page }) => {
    await startGame(page, { beta: true, state: fuel });
    await tick(page, 50);
    const [counter, energy, uraniumLeft] = await game(page, () => [
      +objFuelCellFactory.counter,
      +objEnergy.available,
      +objUraniumOre.amount,
    ]);
    expect(counter).toBe(50);
    expect(energy).toBe(100000 - 50 * 1500);
    expect(uraniumLeft).toBe(10000);
  });

  test("beta: zonder stroom wacht de splijtstoffabriek, daarna gaat hij verder", async ({ page }) => {
    await startGame(page, { beta: true, state: { ...fuel, EnergyAvailable: 3000 } });
    await tick(page, 5);
    expect(await game(page, () => +objFuelCellFactory.counter)).toBe(2);
    await expect(page.locator("#fuelRodCounter")).toContainText("Wacht op stroom");
    await game(page, () => (objEnergy.available = 30000));
    await tick(page, 5);
    expect(await game(page, () => +objFuelCellFactory.counter)).toBe(7);
  });

  test("gewoon spel: de splijtstoffabriek start pas met 150.000 stroom in één keer", async ({ page }) => {
    await startGame(page, { state: fuel });
    await tick(page, 50);
    expect(await game(page, () => [+objFuelCellFactory.counter, +objEnergy.available])).toEqual([0, 100000]);
  });
});

test.describe("Beta: koper (level 12)", () => {
  const copper = (extra = {}) =>
    level(12, {
      Rlevel: 4,
      Money: 1e11,
      copperAmountProspected: 3,
      steelAmount: 500000,
      Pasta: 10000,
      Capacitors: 2000,
      EnergyAvailable: 200000,
      coalAmount: 100000,
      ...extra,
    });
  const state = (page) =>
    game(page, () => ({
      mines: +objMines.copperAmountActive,
      ore: +objCopperOre.amount,
      copper: +objCopper.amount,
      steel: +objSteel.amount,
      pasta: +objStorehouse.pasta,
    }));

  test("kopermijnen zijn er alleen in de beta en vanaf level 12", async ({ page }) => {
    await startGame(page, { state: copper() });
    await game(page, () => objMines.addMine(4, 1));
    expect(await game(page, () => +objMines.copperAmountActive)).toBe(0);
    expect(await game(page, () => document.getElementById("Copper-col").checkVisibility())).toBe(false);
    expect(await game(page, () => document.getElementById("koper-row").checkVisibility())).toBe(false);
  });

  test("op level 11 nog niet, ook niet in de beta", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ PlayerLevel: 11, NextLevel: threshold(11) }) });
    await game(page, () => objMines.addMine(4, 1));
    expect(await game(page, () => +objMines.copperAmountActive)).toBe(0);
    expect(await game(page, () => document.getElementById("koper-row").checkVisibility())).toBe(false);
  });

  test("een kopermijn kost geld en staal, en zonder staal lukt het niet", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ steelAmount: 30000 }) });
    await expect(page.locator("#Copper-col")).toContainText("Staal per mijn");
    await page.locator("#copperMineButton").click();
    let s = await state(page);
    expect(s.mines).toBe(1);
    expect(s.steel).toBe(5000);
    expect(await game(page, () => +objMoney.amount)).toBe(1e11 - 150000000);

    await page.locator("#copperMineButton").click();
    expect((await state(page)).mines).toBe(1);
    await expect(page.locator("#notif")).toContainText("Niet genoeg staal");
  });

  test("een mijn levert 1.000 ton erts per tick en het personeel eet 1 doos pasta per 5 ticks", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperAmountActive: 2 }) });
    await tick(page, 5);
    const s = await state(page);
    expect(s.ore).toBe(10000);
    expect(s.pasta).toBeCloseTo(10000 - 2, 6);
  });

  test("zonder pasta staan de mijnen stil", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperAmountActive: 2, Pasta: 0 }) });
    await tick(page, 3);
    expect((await state(page)).ore).toBe(0);
  });

  test("bij weinig pasta gaat het uraniumpersoneel voor", async ({ page }) => {
    // Eén uraniummijn eet 2 dozen per tick: de kopermijnen laten 120 dozen (60 ticks) liggen
    await startGame(page, {
      beta: true,
      state: copper({ copperAmountActive: 2, uraniumAmountProspected: 1, uraniumAmountActive: 1, Pasta: 100 }),
    });
    await tick(page, 3);
    const s = await state(page);
    expect(s.ore).toBe(0);
    expect(await game(page, () => +objUraniumOre.amount)).toBe(30);
    expect(s.pasta).toBeCloseTo(94, 6);
  });

  test("zonder stroom staan de mijnen stil", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperAmountActive: 2, EnergyAvailable: 0 }) });
    await tick(page, 3);
    expect((await state(page)).ore).toBe(0);
  });

  test("de smelterij maakt iedere tick koper van erts, steenkool en stroom", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperOreAmount: 5000 }) });
    await page.locator("#buyCopperSmelter").click();
    expect((await state(page)).steel).toBe(500000 - 25000);
    const coal = await game(page, () => +objCoal.amount);
    await tick(page, 3);
    const s = await state(page);
    // 5.000 ton erts is genoeg voor twee ticks
    expect(s.copper).toBe(400);
    expect(s.ore).toBe(1000);
    expect(await game(page, () => +objCoal.amount)).toBe(coal - 400);
    await expect(page.locator("#CopperSmelter-col")).toContainText("0 van 1");
  });

  test("onder Nu staat ook het steenkoolverbruik van de smelterij (#86)", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperOreAmount: 50000, copperSmelters: 2 }) });
    await tick(page, 1);
    // 2 actieve smelterijen x 200 ton
    await expect(page.locator("#copperSmelterStats dt:text-is('Steenkool') + dd")).toHaveText("400 ton per tick");
  });

  test("koper verkopen levert de volle prijs op; wat niet past 20%", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperAmount: 1000 }) });
    await page.locator("#sellCopper").click();
    expect(await game(page, () => +objMoney.amount)).toBe(1e11 + 1000 * 40000);
    expect((await state(page)).copper).toBe(0);

    await game(page, () => objCopper.add(+objCopper.storageCap + 10));
    expect((await state(page)).copper).toBe(100000);
    expect(await game(page, () => +objMoney.amount)).toBe(1e11 + 1000 * 40000 + 10 * 40000 * 0.2);
  });

  test("de koperketen blijft staan na herladen", async ({ page }) => {
    await startGame(page, { beta: true, state: copper({ copperAmountActive: 2, copperSmelters: 1 }) });
    await tick(page, 4);
    const before = await state(page);
    await reload(page);
    expect(await state(page)).toEqual(before);
    expect(await game(page, () => +objCopperSmelter.amount)).toBe(1);
  });

  test("de stromen van de koperketen verwijzen naar bestaande kaarten", async ({ page }) => {
    await startGame(page, { beta: true, state: copper() });
    const unknown = await page.evaluate(() =>
      objFlows.edges.flatMap((edge) => [edge[0], edge[1]]).filter((id) => !document.getElementById(id) || !helpTexts[id])
    );
    expect(unknown).toEqual([]);
    expect(await game(page, () => objFlows.edges.some((e) => e[2] === "koper"))).toBe(true);
  });
});

test.describe("Beta: pauzeren per kaart", () => {
  const base = (extra = {}) =>
    level(13, { Rlevel: 4, Money: 1e12, Capacitors: 10000, EnergyAvailable: 900000, ...extra });

  // Per verbruiker: begintoestand en een waarde die alleen groeit als de kaart draait
  const consumers = [
    ["pomp-col", { Factory: 50, OilTankAmount: 100 }, () => +objOilTank.contents],
    ["farmland-automation", { Farmland: 20, FarmRobots: 2, AutomatedFarms: 20, GrainSiloAmount: 10 }, () => +objGrainSilo.contents],
    [
      "WindmillController",
      { WindmillAmount: 2, WindmillControllerAmount: 2, WindmillAutomated: 2, GrainSiloAmount: 10, GrainSiloContents: 40000, FlourSiloAmount: 10 },
      () => +objFlourSilo.contents,
    ],
    [
      "pasta-col",
      { PastaFactoryAmount: 1, pastaHelper: 1, PastaFactoryAmountAutomated: 1, FlourSiloAmount: 10, FlourSiloContents: 20000, eggs: 50000 },
      () => +objStorehouse.pasta,
    ],
    [
      "platicFactory-col",
      { plasticFactories: 1, plasticWorkers: 1, Pasta: 1000, Oil: 5000, OilTankAmount: 10 },
      () => +objPlastic.amount,
    ],
    ["Coal-col", { coalAmountProspected: 1, coalAmountActive: 1 }, () => +objCoal.amount],
    ["Iron-col", { ironAmountProspected: 1, ironAmountActive: 1 }, () => +objIronOre.amount],
    ["Uranium-col", { uraniumAmountProspected: 1, uraniumAmountActive: 1, Pasta: 1000 }, () => +objUraniumOre.amount],
    ["fuelRodFactory", { fuellCellFactory: 1, uraniumOreAmount: 20000, steelAmount: 5000 }, () => +objFuelCellFactory.counter],
    ["Copper-col", { copperAmountProspected: 1, copperAmountActive: 1, Pasta: 1000 }, () => +objCopperOre.amount],
    ["CopperSmelter-col", { copperSmelters: 1, copperOreAmount: 50000, coalAmount: 50000 }, () => +objCopper.amount],
  ];

  test("in het gewone spel zijn er geen pauzeknoppen", async ({ page }) => {
    await startGame(page, { state: base({ coalAmountProspected: 1, coalAmountActive: 1 }) });
    await expect(page.locator(".pause-toggle")).toHaveCount(0);
    await game(page, () => objPause.toggle("Coal-col"));
    await tick(page, 2);
    expect(await game(page, () => +objCoal.amount)).toBeGreaterThan(0);
  });

  for (const [cardId, extra, measure] of consumers) {
    test(`${cardId}: gepauzeerd staat hij stil en gebruikt hij geen energie, hervat draait hij weer`, async ({ page }) => {
      await startGame(page, { beta: true, state: base({ ...extra, paused: JSON.stringify([cardId]) }) });
      await expect(page.locator(`#${cardId}`)).toHaveClass(/card-paused/);
      const value0 = await game(page, measure);
      const energy0 = await game(page, () => +objEnergy.available);
      await tick(page, 20);
      expect(await game(page, measure)).toBe(value0);
      expect(await game(page, () => +objEnergy.available)).toBe(energy0);

      await page.locator(`#${cardId} > .pause-toggle`).click();
      await expect(page.locator(`#${cardId}`)).not.toHaveClass(/card-paused/);
      await tick(page, 20);
      expect(await game(page, measure)).toBeGreaterThan(value0);
    });
  }

  test("de knop toont de toestand, en de pauze blijft bewaard en gaat mee in de save-code", async ({ page }) => {
    await startGame(page, { beta: true, state: base({ coalAmountProspected: 1, coalAmountActive: 1 }) });
    const button = page.locator("#Coal-col > .pause-toggle");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAttribute("aria-label", "Pauzeer Steenkool");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveAttribute("aria-label", "Hervat Steenkool");
    expect(await storage(page, "beta:paused")).toBe('["Coal-col"]');
    expect(await game(page, () => JSON.parse(atob(saveProgress())))).toContain('paused:["Coal-col"]');

    await reload(page);
    await expect(page.locator("#Coal-col")).toHaveClass(/card-paused/);
  });

  test("gepauzeerde kaarten tellen niet mee in de piekvraag", async ({ page }) => {
    await startGame(page, { beta: true, state: base({ coalAmountProspected: 2, coalAmountActive: 2 }) });
    expect(await game(page, () => objEnergy.demand())).toBe(500);
    await game(page, () => objPause.toggle("Coal-col"));
    expect(await game(page, () => objEnergy.demand())).toBe(0);
  });

  test("pauzeren maakt stroom vrij: met de mijnen stil loopt de opslag weer op", async ({ page }) => {
    // 20 ijzermijnen vragen 9.000 per tick, 10 kolencentrales leveren 7.500
    await startGame(page, {
      beta: true,
      state: base({
        ironAmountProspected: 20,
        ironAmountActive: 20,
        ironOreSilos: 100,
        CoalPowerPlants: 10,
        coalAmount: 900000,
        EnergyAvailable: 0,
      }),
    });
    await tick(page, 10);
    expect(await game(page, () => +objEnergy.available)).toBeLessThan(9000);
    await game(page, () => objPause.toggle("Iron-col"));
    await tick(page, 10);
    expect(await game(page, () => +objEnergy.available)).toBeGreaterThan(50000);
  });

  test("handmatige knoppen werken ook als de kaart gepauzeerd is", async ({ page }) => {
    await startGame(page, { beta: true, state: base({ Factory: 10, paused: '["pomp-col"]' }) });
    const oil = await game(page, () => +objOilTank.contents);
    await page.getByRole("button", { name: "Pomp olie" }).click();
    expect(await game(page, () => +objOilTank.contents)).toBe(oil + 1);
  });

  test("een kapotte pauzelijst wordt genegeerd", async ({ page }) => {
    const { pageErrors } = await startGame(page, { beta: true, state: base({ paused: '["geld-col", 5, "Coal-col"' }) });
    expect(await game(page, () => objPause.paused)).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("onbekende kaarten in de pauzelijst worden eruit gefilterd", async ({ page }) => {
    await startGame(page, { beta: true, state: base({ paused: '["geld-col", 5, "Coal-col"]' }) });
    expect(await game(page, () => objPause.paused)).toEqual(["Coal-col"]);
  });
});

test.describe("Beta: feedback van spelers (#64-#67)", () => {
  const mills = level(6, {
    Capacitors: 1000,
    EnergyAvailable: 100000,
    GrainSiloAmount: 100,
    GrainSiloContents: 400000,
    WindmillAmount: 4,
    WindmillControllerAmount: 4,
    WindmillAutomated: 4,
    FlourSiloAmount: 10,
  });
  const energyPerTick = async (page) => {
    const before = await game(page, () => +objEnergy.available);
    await tick(page, 20);
    return (before - (await game(page, () => +objEnergy.available))) / 20;
  };

  test("#64 beta: een windmolencontroller kost 8 energie per maalrun", async ({ page }) => {
    await startGame(page, { beta: true, state: mills });
    expect(await energyPerTick(page)).toBeCloseTo(3.2, 6);
    expect(await game(page, () => +objFlourSilo.contents)).toBe(4000 * 2);
  });

  test("#64 gewoon spel: nog 8 energie per tick", async ({ page }) => {
    await startGame(page, { state: mills });
    expect(await energyPerTick(page)).toBe(32);
  });

  test("#65 beta: de schuiven voor bloem en pasta volgen de prijzen vanaf level 4", async ({ page }) => {
    await startGame(page, { beta: true, state: level(7, { scCPU: 4, autoFlour: 875 }) });
    await expect(page.locator("#SliderFlour")).toHaveAttribute("max", "450");
    await expect(page.locator("#SliderPasta")).toHaveAttribute("max", "225");
    // Een te hoge bewaarde drempel wordt begrensd, de standaard is het maximum
    expect(await game(page, () => [+objSalesComputer.flourValue, +objSalesComputer.pastaValue])).toEqual([450, 225]);
  });

  test("#65 gewoon spel: schuiven ongewijzigd", async ({ page }) => {
    await startGame(page, { state: level(7, { scCPU: 4 }) });
    await expect(page.locator("#SliderFlour")).toHaveAttribute("max", "875");
    expect(await game(page, () => +objSalesComputer.flourValue)).toBe(875);
  });

  test("#66 beta: niets op voorraad levert geen verkoopregel op", async ({ page }) => {
    await startGame(page, {
      beta: true,
      state: level(7, {
        scCPU: 4,
        autoFlourCheck: "true",
        autoFlour: 100,
        autoKunststofCheck: "true",
        autoKunststof: 100,
        plasticFactories: 1,
      }),
    });
    await tick(page, 12);
    expect(await game(page, () => messages.filter((m) => /Computerverkoop/.test(m[0])))).toEqual([]);
    // Met voorraad wordt er wel verkocht
    await game(page, () => objPlastic.add(100));
    await tick(page, 5);
    expect(await game(page, () => messages.some((m) => m[0] === "Computerverkoop Plastic"))).toBe(true);
  });

  test("#67 beta: producten die nog op slot zitten zijn herkenbaar en hun schuif staat uit", async ({ page }) => {
    await startGame(page, { beta: true, state: level(7, { scCPU: 1, Money: 1e7 }) });
    const items = page.locator("#AutoSell-col .autosell-item");
    await expect(items.nth(0)).not.toHaveClass(/autosell-locked/);
    await expect(items.nth(1)).toHaveClass(/autosell-locked/);
    await expect(items.nth(1)).toContainText("Vanaf 2 CPU's");
    await expect(items.nth(3)).toContainText("Vanaf 4 CPU's");
    await expect(page.locator("#SliderOil")).toBeEnabled();
    await expect(page.locator("#SliderFlour")).toBeDisabled();

    await game(page, () => {
      objSalesComputer.add();
      objSalesComputer.add();
      objSalesComputer.add();
    });
    await expect(page.locator("#AutoSell-col .autosell-locked")).toHaveCount(0);
    await expect(page.locator("#SliderKunststof")).toBeEnabled();
  });

  test("#67 gewoon spel: geen slot-weergave", async ({ page }) => {
    await startGame(page, { state: level(7, { scCPU: 1 }) });
    await expect(page.locator("#AutoSell-col .autosell-locked")).toHaveCount(0);
    await expect(page.locator("#AutoSell-col")).not.toContainText("Vanaf 2 CPU's");
    await expect(page.locator("#SliderFlour")).toBeEnabled();
  });
});
