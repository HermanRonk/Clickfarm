// Spelen zoals een speler: klikken op knoppen en de tijd laten lopen.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, isShown, expectNoBrokenNumbers, stat } = require("./helpers/game");
const { threshold } = require("./levels.data");

const button = (page, name) => page.getByRole("button", { name, exact: true });

test.describe("Landbouw (level 1)", () => {
  test("land bewerken levert na 10 seconden graan op", async ({ page }) => {
    await startGame(page);
    const work = page.locator("#farmlandWorkBTN");

    await work.click();
    await expect(work).toBeDisabled();
    await tick(page, 1);
    await expect(page.locator("#FarmlandTimer")).toHaveText("Oogst klaar over 9 seconden");
    await tick(page, 9);
    await expect(work).toBeEnabled();
    expect(await game(page, () => +objGrainSilo.contents)).toBe(100);
    await expect(stat(page, "#grain-col", "Voorraad")).toHaveText("100 kg");
  });

  test("landbouwgrond kopen kost geld en verhoogt de prijs met 5%", async ({ page }) => {
    await startGame(page);
    await button(page, "Koop landbouwgrond").click();
    expect(await game(page, () => objFarmland.amount)).toBe(2);
    expect(await game(page, () => objMoney.amount)).toBe(1990);
    await expect(stat(page, "#landbouw-col", "Prijs per veld")).toHaveText("€ 10,50");
    await expect(stat(page, "#landbouw-col", "Velden")).toHaveText("2");
  });

  test("graan verkopen levert geld op tegen de marktprijs", async ({ page }) => {
    await startGame(page, { state: { GrainSiloContents: 4000 } });
    const price = await game(page, () => objGrain.price);
    expect(price).toBeGreaterThan(0);
    await button(page, "Verkoop graan").click();
    expect(await game(page, () => +objGrainSilo.contents)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBeCloseTo(2000 + 4 * price, 2);
  });

  test("overschot boven de silocapaciteit wordt direct (goedkoper) verkocht", async ({ page }) => {
    await startGame(page, { state: { GrainSiloContents: 4950, Farmland: 2 } });
    const price = await game(page, () => objGrain.price);
    await page.locator("#farmlandWorkBTN").click();
    await tick(page, 10);
    expect(await game(page, () => +objGrainSilo.contents)).toBe(5000);
    // 150kg over, verkocht voor 20% van de prijs
    expect(await game(page, () => objMoney.amount)).toBeCloseTo(2000 + 150 * (price / 1000) * 0.2, 2);
  });

  test("een extra graansilo verhoogt de capaciteit", async ({ page }) => {
    await startGame(page, { state: { Money: 5000 } });
    await button(page, "Koop graansilo").click();
    expect(await game(page, () => +objGrainSilo.amount)).toBe(2);
    await expect(page.locator("#GrainTop")).toContainText("0/10.000");
  });

  test("zonder genoeg geld gebeurt er niets", async ({ page }) => {
    await startGame(page, { state: { Money: 5 } });
    await button(page, "Koop landbouwgrond").click();
    await button(page, "Koop graansilo").click();
    expect(await game(page, () => objFarmland.amount)).toBe(1);
    expect(await game(page, () => +objGrainSilo.amount)).toBe(1);
    expect(await game(page, () => objMoney.amount)).toBe(5);
  });

  test("level 2 halen door gewoon te spelen", async ({ page }) => {
    test.setTimeout(60000);
    const { pageErrors } = await startGame(page);
    const work = page.locator("#farmlandWorkBTN");

    // Investeer in land zolang er een buffer overblijft
    while ((await game(page, () => objMoney.amount - objFarmland.cost)) > 100) {
      await button(page, "Koop landbouwgrond").click();
    }
    expect(await game(page, () => objFarmland.amount)).toBeGreaterThan(30);

    for (let round = 0; round < 40 && (await game(page, () => +objPlayerInfo.level)) < 2; round++) {
      await work.click();
      await tick(page, 10);
      await button(page, "Verkoop graan").click();
      await tick(page, 1);
    }

    expect(await game(page, () => +objPlayerInfo.level)).toBe(2);
    expect(await isShown(page, "flour-col")).toBe(true);
    expect(await isShown(page, "windmills-col")).toBe(true);
    await expectNoBrokenNumbers(page);
    expect(pageErrors).toEqual([]);
  });
});

test.describe("Windmolens en bloem (level 2)", () => {
  const level2 = { PlayerLevel: 2, NextLevel: threshold(2) };

  test("graan malen levert in 10 seconden bloem op", async ({ page }) => {
    await startGame(page, { state: { ...level2, GrainSiloContents: 2500 } });
    const grind = page.locator("#GrindGrain");
    await grind.click();
    await expect(grind).toBeDisabled();
    // Eén molen maalt maximaal 1.000kg per keer
    expect(await game(page, () => +objGrainSilo.contents)).toBe(1500);
    await tick(page, 10);
    expect(await game(page, () => +objFlourSilo.contents)).toBe(1000);
    await expect(grind).toBeEnabled();
  });

  test("meer windmolens malen meer tegelijk", async ({ page }) => {
    await startGame(page, { state: { ...level2, GrainSiloContents: 2500, Money: 1000 } });
    await button(page, "Bouw windmolen").click();
    expect(await game(page, () => objWindmill.amount)).toBe(2);
    await page.locator("#GrindGrain").click();
    await tick(page, 10);
    expect(await game(page, () => +objFlourSilo.contents)).toBe(2000);
  });

  test("malen zonder graan geeft een melding", async ({ page }) => {
    await startGame(page, { state: level2 });
    await page.locator("#GrindGrain").click();
    await expect(page.locator("#notif")).toContainText("Geen graan beschikbaar");
  });

  test("bloem verkopen levert geld op", async ({ page }) => {
    await startGame(page, { state: { ...level2, FlourSiloContents: 3000 } });
    const price = await game(page, () => objFlour.price);
    await button(page, "Verkoop bloem").click();
    expect(await game(page, () => +objFlourSilo.contents)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBeCloseTo(2000 + 3 * price, 2);
  });
});

test.describe("Olie en energie (level 3-4)", () => {
  test("olie pompen en verkopen", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 3, NextLevel: threshold(3), Oil: 0 } });
    for (let i = 0; i < 5; i++) await button(page, "Pomp olie!").click();
    expect(await game(page, () => +objOilTank.contents)).toBe(5);
    const price = await game(page, () => +objOil.price);
    await button(page, "Verkoop olie!").click();
    expect(await game(page, () => +objOilTank.contents)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBeCloseTo(2000 + 5 * price, 2);
  });

  test("energiecentrale zet olie om in energie, oliepompen gebruiken energie", async ({ page }) => {
    await startGame(page, {
      state: { PlayerLevel: 4, NextLevel: threshold(4), Oil: 100, PowerPlants: 1, Factory: 2 },
    });
    // Tick 1: nog geen energie voor de pompen, centrale maakt 10 energie van 1 olie.
    // Daarna per tick: pompen +2 olie / -2 energie, centrale -1 olie / +10 energie.
    await tick(page, 3);
    expect(await game(page, () => +objEnergy.available)).toBe(26);
    expect(await game(page, () => +objOilTank.contents)).toBe(101);
    await expect(page.locator("#EnergyStats")).toContainText("26/1.000");
  });

  test("energieopslag is begrensd door de capaciteit", async ({ page }) => {
    await startGame(page, {
      state: { PlayerLevel: 4, NextLevel: threshold(4), Oil: 1000, PowerPlants: 50 },
    });
    await tick(page, 5);
    expect(await game(page, () => +objEnergy.available)).toBe(1000);
  });
});

test.describe("Productie (level 6)", () => {
  test("pastafabriek is te koop zodra pasta zichtbaar is", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 6, NextLevel: threshold(6), Money: 100000 } });
    expect(await isShown(page, "pasta-col")).toBe(true);
    await button(page, "Bouw pastafabriek").click();
    expect(await game(page, () => +objPastaFactory.amount)).toBe(1);
  });

  test("kippenboerderij kan gebouwd worden", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 6, NextLevel: threshold(6), Money: 10000000 } });
    expect(await isShown(page, "chicken-col")).toBe(true);
    await page.locator("#purchaseChickenFarm").click();
    expect(await game(page, () => +objChickenFarm.amount)).toBe(1);
  });
});

test.describe("Spelopties", () => {
  test("pauzeren stopt de productie, hervatten laat hem doorlopen", async ({ page }) => {
    await startGame(page);
    await page.locator("#farmlandWorkBTN").click();
    await tick(page, 3);

    await page.locator("#navbarOptionDropdown").click();
    await page.locator("#pauseBTN").click();
    await expect(page.locator("#pauseBTN")).toContainText("Continueer spel");
    await tick(page, 30);
    expect(await game(page, () => objFarmland.FarmTimer)).toBe(7);
    expect(await game(page, () => +objGrainSilo.contents)).toBe(0);

    await page.locator("#navbarOptionDropdown").click();
    await page.locator("#pauseBTN").click();
    await tick(page, 7);
    expect(await game(page, () => +objGrainSilo.contents)).toBe(100);
  });

  test("verkooptab (level 9) verkoopt met één klik", async ({ page }) => {
    await startGame(page, {
      state: { PlayerLevel: 9, NextLevel: threshold(9), GrainSiloContents: 5000 },
    });
    await page.locator("#navbarOptionDropdown").click();
    await page.locator("#verkooptabBTN").click();
    await expect(page.locator("#sellMenu")).toBeVisible();
    await expect(page.locator("#quickGrain")).toContainText("Voorraad: 5.000");

    await page.locator("#quickGrainBTN button").click();
    expect(await game(page, () => +objGrainSilo.contents)).toBe(0);
    expect(await game(page, () => objMoney.amount)).toBeGreaterThan(2000);
  });
});
