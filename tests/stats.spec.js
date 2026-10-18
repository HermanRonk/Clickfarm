// Statistieken (beta): speeltijd, mijlpalen, totale productie en een begrensde geschiedenis,
// met een dashboard onder Game opties → Statistieken. Het gewone spel houdt niets bij.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, storage, reload } = require("./helpers/game");
const { threshold } = require("./levels.data");

const level = (n, extra = {}) => ({ PlayerLevel: n, NextLevel: threshold(n), ...extra });
// Oliepompen met genoeg energie: produceren olie en verbruiken energie
const oil = level(4, { Factory: 5, EnergyAvailable: 50000, Capacitors: 1000, OilTankAmount: 5 });

const history = (page) => game(page, () => objStats.tiers.map((tier) => tier.pts.length));
const statKeys = (page) =>
  game(page, () => Object.keys(localStorage).filter((key) => /(^|:)stats/.test(key)));

test.describe("Statistieken", () => {
  test("het gewone spel houdt geen statistieken bij en heeft geen menuknop", async ({ page }) => {
    await startGame(page, { state: oil });
    await tick(page, 120);
    expect(await statKeys(page)).toEqual([]);
    await page.locator("#navbarOptionDropdown").click();
    await expect(page.locator("#statsBTN")).toBeHidden();
  });

  test("de beta maakt iedere minuut speeltijd een meetpunt, niet tijdens pauze", async ({ page }) => {
    await startGame(page, { beta: true, state: oil });
    await tick(page, 59);
    expect(await history(page)).toEqual([0, 0, 0]);
    await tick(page, 1);
    expect(await history(page)).toEqual([1, 0, 1]);
    expect(JSON.parse(await storage(page, "beta:statsPlay")).t).toBe(60);
    expect(await storage(page, "statsPlay")).toBeNull();

    await game(page, () => changeState());
    await tick(page, 120);
    expect(await game(page, () => objStats.ticks)).toBe(60);
    await game(page, () => changeState());
    await tick(page, 60);
    expect(await history(page)).toEqual([2, 0, 2]);
  });

  test("productie en energie worden geteld en overleven herladen", async ({ page }) => {
    await startGame(page, { beta: true, state: oil });
    await tick(page, 60);
    const totals = JSON.parse(await storage(page, "beta:statsTotals"));
    expect(totals.olie).toBeGreaterThan(0);
    expect(totals.energieVerbruik).toBeGreaterThan(0);

    await reload(page);
    const after = await game(page, () => objStats.totals);
    expect(after.olie).toBe(totals.olie);
    expect(await game(page, () => objStats.ticks)).toBe(60);
  });

  test("markt-aankopen tellen niet als productie", async ({ page }) => {
    await startGame(page, { beta: true, state: level(12, { Money: 1e9 }) });
    await game(page, () => objSteel.add(500));
    expect(await game(page, () => objStats.totals.staal || 0)).toBe(0);
  });

  test("een levelup wordt een mijlpaal", async ({ page }) => {
    const current = threshold(5);
    await startGame(page, { beta: true, state: level(5, { Money: current }) });
    await tick(page, 1);
    const levels = await game(page, () => objStats.levels);
    expect(levels.map((l) => l[0])).toEqual([6]);
    expect(levels[0][1]).toBe(0); // in de eerste tick, voordat die als speeltijd telt
    expect(JSON.parse(await storage(page, "beta:statsLevels"))[0][0]).toBe(6);
    expect(await game(page, () => objStats.startLevel)).toBe(5);
  });

  test("de statistieken gaan mee in de save-code en overleven een import", async ({ page }) => {
    await startGame(page, { beta: true, state: oil });
    await tick(page, 90);
    const code = await game(page, () => saveProgress());
    const keys = JSON.parse(atob(code)).map((item) => item.slice(0, item.indexOf(":")));
    expect(keys).toEqual(expect.arrayContaining(["statsPlay", "statsTotals", "statsLevels", "statsHistory"]));
    // De save-code bevat de stand van nu, ook tussen twee meetpunten in
    expect(JSON.parse(await storage(page, "beta:statsPlay")).t).toBe(90);
  });

  test("een import zet de statistieken uit de save-code terug", async ({ page }) => {
    await startGame(page, { beta: true, state: oil });
    await tick(page, 60);
    const code = await game(page, () => {
      objStats.totals.olie = 123456;
      return saveProgress();
    });
    await tick(page, 60);
    await Promise.all([page.waitForEvent("load"), game(page, (code) => getSaveGame(code), code)]);
    await expect(page.locator("#currentlevel dd")).toHaveText("4");
    expect(await game(page, () => objStats.totals.olie)).toBe(123456);
    expect(await game(page, () => objStats.ticks)).toBe(60);
  });

  test("een reset wist de statistieken, ook als de pagina daarna nog bewaart", async ({ page }) => {
    await startGame(page, { beta: true, state: oil });
    await tick(page, 60);
    page.on("dialog", (dialog) => dialog.accept());
    await Promise.all([page.waitForEvent("load"), game(page, () => resetGame())]);
    await expect(page.locator("#currentlevel dd")).toHaveText("1");
    expect(await game(page, () => objStats.ticks)).toBe(0);
    expect(await game(page, () => objStats.levels)).toEqual([]);
  });

  test("de geschiedenis blijft binnen het budget, hoe lang er ook gespeeld wordt", async ({ page }) => {
    // threshold() kent levels tot 13; de drempel van level 16 is 125 keer die van 13
    await startGame(page, { beta: true, state: { PlayerLevel: 16, NextLevel: threshold(13) * 125, Money: 1e15 } });
    const result = await game(page, () => {
      for (let i = 0; i < 3000; i++) {
        objStats.ticks += 60;
        objMoney.amount = 1.23456e15 * (1 + Math.random());
        made += 9.87654e12 * Math.random();
        spend += 1.2345e12 * Math.random();
        objStats.totals.energie = (objStats.totals.energie || 0) + 1.2e11 * Math.random();
        objStats.totals.energieVerbruik = (objStats.totals.energieVerbruik || 0) + 1.1e11 * Math.random();
        objStats.snapshot();
      }
      const all = objStats.tiers[2];
      return {
        history: localStorage.getItem("beta:statsHistory").length,
        code: saveProgress().length,
        tiers: objStats.tiers.map((tier) => tier.pts.length),
        step: all.step,
        first: all.pts[0][0],
        last: all.pts[all.pts.length - 1][0],
      };
    });
    expect(result.history).toBeLessThanOrEqual(20000);
    expect(result.code).toBeLessThanOrEqual(40000);
    expect(result.tiers[0]).toBe(60);
    expect(result.tiers[1]).toBe(96);
    expect(result.tiers[2]).toBeLessThanOrEqual(120);
    expect(result.step).toBeGreaterThan(1);
    // "Alles" loopt nog steeds van het begin tot nu (het laatste punt hoogstens één stap terug)
    expect(result.first).toBeLessThanOrEqual(result.step);
    expect(result.last).toBeGreaterThan(3000 - result.step);

    // Na herladen is de geschiedenis gelijk (op afronding na)
    const before = await history(page);
    await reload(page);
    expect(await history(page)).toEqual(before);
  });

  test("een volle browseropslag laat het spel gewoon doorlopen", async ({ page }) => {
    const { pageErrors } = await startGame(page, { beta: true, state: oil });
    await game(page, () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (/stats/.test(key)) throw new DOMException("vol", "QuotaExceededError");
        return original.call(this, key, value);
      };
    });
    await tick(page, 130);
    expect(await game(page, () => objStats.failed)).toBe(true);
    expect(await game(page, () => objStats.ticks)).toBe(130);
    expect(pageErrors).toEqual([]);
  });

  test("onleesbare statistieken beginnen opnieuw zonder fouten", async ({ page }) => {
    const { pageErrors } = await startGame(page, {
      beta: true,
      state: { ...oil, statsHistory: "kapot|;;", statsPlay: "{", statsTotals: "[1", statsLevels: "x" },
    });
    expect(await history(page)).toEqual([0, 0, 0]);
    await tick(page, 60);
    expect(await history(page)).toEqual([1, 0, 1]);
    expect(pageErrors).toEqual([]);
  });

  test.describe("Dashboard", () => {
    test("opent vanuit het menu, toont alles en sluit met Esc", async ({ page }) => {
      const { pageErrors } = await startGame(page, { beta: true, state: oil });
      await tick(page, 180);
      await page.locator("#navbarOptionDropdown").click();
      await page.locator("#statsBTN").click();

      await expect(page.locator("#statsView")).toBeVisible();
      await expect(page.locator("#FirstTab")).toBeHidden();
      await expect(page.locator(".stats-tile")).toHaveCount(6);
      await expect(page.locator("#statsChartMoney svg")).toBeVisible();
      await expect(page.locator("#statsChartIncome svg")).toBeVisible();
      await expect(page.locator("#statsChartEnergy svg")).toBeVisible();
      await expect(page.locator("#statsProduction")).toContainText("Olie");
      await expect(page.locator("#statsLevels li")).toHaveCount(1);
      await expect(page.locator("#statsLevels")).toContainText("Level 1–4");
      await expect(page.locator("#statsCompany")).toContainText("Oliepompen");
      await expect(page.locator(".stats-tile").nth(3)).toContainText("3m");

      // Het dashboard loopt mee met het spel
      await tick(page, 60);
      await expect(page.locator(".stats-tile").nth(3)).toContainText("4m");

      await page.keyboard.press("Escape");
      await expect(page.locator("#statsView")).toBeHidden();
      await expect(page.locator("#FirstTab")).toBeVisible();
      expect(pageErrors).toEqual([]);
    });

    test("de periode is te kiezen en wordt onthouden", async ({ page }) => {
      await startGame(page, { beta: true, state: oil });
      await tick(page, 180);
      await game(page, () => objStats.show());
      const range = page.locator("#statsRange button");
      await expect(range.nth(0)).toHaveAttribute("aria-pressed", "true");
      await range.nth(1).click();
      await expect(range.nth(1)).toHaveAttribute("aria-pressed", "true");
      // Nog geen kwartier gespeeld: geen lijn, wel uitleg
      await expect(page.locator("#statsChartMoney .stats-empty")).toBeVisible();
      await range.nth(2).click();
      await expect(page.locator("#statsChartMoney svg")).toBeVisible();

      await reload(page);
      await game(page, () => objStats.show());
      await expect(range.nth(2)).toHaveAttribute("aria-pressed", "true");
    });

    test("zonder meetpunten een uitleg in plaats van een lege grafiek", async ({ page }) => {
      await startGame(page, { beta: true });
      await game(page, () => objStats.show());
      await expect(page.locator("#statsChartMoney .stats-empty")).toContainText("vanaf nu");
      await expect(page.locator(".stats-tile").nth(1)).toContainText("–");
    });
  });
});
