// Isotopenlab (beta, level 16): uranium wordt medische isotopen (directe inkomsten) en
// industriële isotopen, die de chipfabrieken 25% meer chips laten maken (#118).
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, reload } = require("./helpers/game");
const { threshold } = require("./levels.data");

// Level 16: na level 15 (multiplier 5)
const l16 = (extra = {}) => ({
  PlayerLevel: 16,
  NextLevel: threshold(13) * 125,
  Rlevel: 4,
  Money: 1e14,
  steelAmount: 5000000,
  steelStorage: 10,
  Capacitors: 100000,
  EnergyAvailable: 9000000,
  Pasta: 100000,
  ...extra,
});
const val = (page, fn) => game(page, fn);

test.describe("Beta: isotopenlab (#118)", () => {
  test("in het gewone spel en op level 15 bestaat het lab niet", async ({ page }) => {
    await startGame(page, { state: l16({ pcbAmount: 2000, goldAmount: 50 }) });
    await game(page, () => objIsotopeLab.add());
    expect(await val(page, () => +objIsotopeLab.amount)).toBe(0);
    expect(await game(page, () => document.getElementById("isotopen-row").checkVisibility())).toBe(false);
  });

  test("beta op level 15: nog geen lab", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ PlayerLevel: 15, NextLevel: threshold(13) * 25, pcbAmount: 2000, goldAmount: 50 }) });
    await game(page, () => objIsotopeLab.add());
    expect(await val(page, () => +objIsotopeLab.amount)).toBe(0);
    expect(await game(page, () => document.getElementById("isotopen-row").checkVisibility())).toBe(false);
  });

  test("een lab kost geld, staal, printplaten en goud; het volgende is 5% duurder en verkopen levert 75% op", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ pcbAmount: 2500, goldAmount: 60 }) });
    await expect(page.locator("#isotopen-row")).toBeVisible();
    await page.locator("#buyIsotopeLab").click();
    expect(
      await val(page, () => [+objIsotopeLab.amount, +objMoney.amount, +objSteel.amount, +objPCB.amount, +objGold.amount])
    ).toEqual([1, 1e14 - 5e11, 4000000, 500, 10]);
    expect(await val(page, () => +objIsotopeLab.price)).toBeCloseTo(5e11 * 1.05, 0);
    // Te weinig printplaten voor een tweede lab
    await page.locator("#buyIsotopeLab").click();
    expect(await val(page, () => +objIsotopeLab.amount)).toBe(1);

    await page.locator("#sellIsotopeLab").click();
    expect(await val(page, () => +objIsotopeLab.amount)).toBe(0);
    expect(await val(page, () => +objMoney.amount)).toBeCloseTo(1e14 - 5e11 + 5e11 * 0.75, 0);
    expect(await val(page, () => +objIsotopeLab.price)).toBeCloseTo(5e11, 0);
  });

  test("een lab gebruikt uranium en energie en betaalt de medische isotopen iedere 10 ticks uit", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ isotopeLabs: 2, uraniumOreAmount: 1000 }) });
    const money = await val(page, () => +objMoney.amount);
    await tick(page, 9);
    expect(await val(page, () => +objMoney.amount)).toBe(money);
    await tick(page, 1);
    expect((await val(page, () => +objMoney.amount)) - money).toBe(2 * 2.5e8 * 10);
    expect(await val(page, () => [+objUraniumOre.amount, +objEnergy.available])).toEqual([1000 - 2 * 20 * 10, 9000000 - 2 * 50000 * 10]);
    // 0,2 per tick erbij, en iedere tick vervalt een deel (halveringstijd 600 ticks)
    const keep = Math.pow(0.5, 1 / 600);
    let expected = 0;
    for (let i = 0; i < 10; i++) expected = (expected + 0.2) * keep;
    expect(await val(page, () => +objIsotopes.amount)).toBeCloseTo(expected, 9);
    await expect(page.locator("#IsotopeLab-col")).toContainText("2 van 2");
  });

  test("zonder uranium of energie staat het lab stil", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ isotopeLabs: 1, uraniumOreAmount: 0 }) });
    const money = await val(page, () => +objMoney.amount);
    await tick(page, 10);
    expect(await val(page, () => [+objMoney.amount, +objIsotopes.amount, objIsotopeLab.active])).toEqual([money, 0, 0]);

    await game(page, () => {
      objUraniumOre.amount = 1000;
      objEnergy.available = 0;
    });
    await tick(page, 10);
    expect(await val(page, () => [+objMoney.amount, +objUraniumOre.amount])).toEqual([money, 1000]);
  });

  test("een volle isotopenopslag zet het lab niet stil: het overschot vervalt", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ isotopeLabs: 1, uraniumOreAmount: 1000, isotopesAmount: 100 }) });
    const money = await val(page, () => +objMoney.amount);
    await tick(page, 10);
    expect(await val(page, () => +objIsotopes.amount)).toBeLessThanOrEqual(100);
    expect(await val(page, () => +objUraniumOre.amount)).toBe(800);
    // Alleen de medische isotopen leveren geld op; het overschot wordt niet verkocht
    expect((await val(page, () => +objMoney.amount)) - money).toBe(10 * 2.5e8);
  });

  test("een chipfabriek met industriële isotopen maakt 25% meer chips", async ({ page }) => {
    const chips = { chipFactories: 2, pcbAmount: 1000, goldAmount: 100, industrialDiamondAmount: 100 };
    // Isotopen voor één van de twee fabrieken
    await startGame(page, { beta: true, state: l16({ ...chips, isotopesAmount: 0.05 }) });
    await tick(page, 1);
    expect(await val(page, () => [+objChips.amount, objChipFactory.inspected])).toEqual([11.25, 1]);
    expect(await val(page, () => +objIsotopes.amount)).toBeCloseTo(0, 9);
    await expect(page.locator("#ChipFactory-col")).toContainText("Met inspectie");
    await tick(page, 1);
    expect(await val(page, () => [+objChips.amount, objChipFactory.inspected])).toEqual([21.25, 0]);
  });

  test("ongebruikte isotopen vervallen: na 600 ticks is de helft over", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ isotopesAmount: 80 }) });
    await tick(page, 600);
    expect(await val(page, () => +objIsotopes.amount)).toBeCloseTo(40, 6);
    await expect(page.locator("#Isotopes-col")).toContainText("Verval");
    await page.locator("#sellIsotopes").click();
    // Verkopen gaat per hele isotoop, tegen de volle prijs
    expect(await val(page, () => +objIsotopes.amount)).toBeLessThan(1);
  });

  test("het lab is te pauzeren en telt mee in de piekvraag", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ isotopeLabs: 3, uraniumOreAmount: 1000 }) });
    const demand = await val(page, () => objEnergy.demand());
    await game(page, () => objPause.toggle("IsotopeLab-col"));
    expect(demand - (await val(page, () => objEnergy.demand()))).toBe(3 * 50000);
    await tick(page, 3);
    expect(await val(page, () => [+objUraniumOre.amount, objIsotopeLab.active])).toEqual([1000, 0]);
  });

  test("labs, prijs en isotopen overleven herladen en gaan mee in de save-code", async ({ page }) => {
    await startGame(page, { beta: true, state: l16({ pcbAmount: 2000, goldAmount: 50, uraniumOreAmount: 1000 }) });
    await page.locator("#buyIsotopeLab").click();
    await tick(page, 5);
    await reload(page);
    expect(await val(page, () => [+objIsotopeLab.amount, Math.round(+objIsotopeLab.price)])).toEqual([1, Math.round(5e11 * 1.05)]);
    expect(await val(page, () => +objIsotopes.amount)).toBeGreaterThan(0.49);
    expect(await val(page, () => +objIsotopes.amount)).toBeLessThan(0.5);
    const keys = await game(page, () => JSON.parse(atob(saveProgress())).map((item) => item.slice(0, item.indexOf(":"))));
    expect(keys).toEqual(expect.arrayContaining(["isotopeLabs", "isotopeLabPrice", "isotopesAmount"]));
  });

  test("de stromen van het lab verwijzen naar bestaande kaarten", async ({ page }) => {
    await startGame(page, { beta: true, state: l16() });
    const unknown = await page.evaluate(() =>
      objFlows.edges.flatMap((edge) => [edge[0], edge[1]]).filter((id) => !document.getElementById(id) || !helpTexts[id])
    );
    expect(unknown).toEqual([]);
    expect(await game(page, () => objFlows.edges.some((e) => e[1] === "IsotopeLab-col" && e[2] === "uranium"))).toBe(true);
  });
});
