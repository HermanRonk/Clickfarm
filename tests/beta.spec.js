// Beta: dezelfde code onder /beta/, met eigen saves (voorvoegsel "beta:") en de balanswijzigingen
// die eerst getest worden. Het gewone spel moet precies hetzelfde blijven.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, storage } = require("./helpers/game");
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
