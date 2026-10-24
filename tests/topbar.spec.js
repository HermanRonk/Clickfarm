// Bovenbalk: "Game opties" blijft op zijn plek en er komt geen horizontale scrollbalk,
// ook niet met lange waarden; in de beta staan grote getallen standaard kort (#124).
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, reload } = require("./helpers/game");
const { threshold } = require("./levels.data");

const rich = (extra = {}) => ({
  PlayerLevel: 12,
  NextLevel: threshold(12),
  Money: 1234567890123.45,
  EnergyAvailable: 98765432,
  Capacitors: 1000000,
  ...extra,
});

const menuTop = (page) => page.locator("#navbarOptionDropdown").evaluate((el) => el.getBoundingClientRect().top);
const noHorizontalScroll = (page) =>
  page.evaluate(() => {
    const stats = document.querySelector(".topbar .stats");
    return stats.scrollWidth <= stats.clientWidth && document.documentElement.scrollWidth <= window.innerWidth;
  });

test.describe("Bovenbalk (#124)", () => {
  for (const width of [1280, 900, 400]) {
    test(`geen horizontale scroll en het menu blijft boven bij ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await startGame(page, { state: rich() });
      const before = await menuTop(page);
      // Nog veel langere waarden: het menu mag niet verschuiven
      await game(page, () => {
        objMoney.amount = 123456789012345678;
        objMoney.show();
      });
      expect(await menuTop(page)).toBe(before);
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }

  test("de beta toont korte getallen, met de volledige waarde als tooltip", async ({ page }) => {
    await startGame(page, { beta: true, state: rich() });
    await expect(page.locator("#MoneyTop kbd2")).toHaveText("€ 1,23 bln");
    await expect(page.locator("#MoneyTop")).toHaveAttribute("title", /^€\s1\.234\.567\.890\.123,45$/);
    await expect(page.locator("#EnergyStats kbd2")).toHaveText("98,8 mln/100 mln");
    await expect(page.locator("#EnergyStats")).toHaveAttribute("title", "98.765.432 / 100.000.000");
    // Onder het miljoen blijft alles volledig
    expect(await game(page, () => [FixNumber(999999), FixMoney(12.5)])).toEqual(["999.999", "€\u00a012,50"]);
  });

  test("de keuze schakelt om en blijft bewaard", async ({ page }) => {
    await startGame(page, { beta: true, state: rich() });
    await page.locator("#navbarOptionDropdown").click();
    const btn = page.locator("#shortNumbersBTN");
    await expect(btn).toContainText("Korte getallen");
    await expect(btn.locator("use")).toHaveAttribute("href", "#i-check-square");
    await btn.click();
    await page.waitForLoadState("load");
    await expect(page.locator("#MoneyTop kbd2")).toHaveText("€ 1.234.567.890.123,45");
    await expect(page.locator("#shortNumbersBTN use")).toHaveAttribute("href", "#i-square");
    await reload(page);
    await tick(page, 1);
    await expect(page.locator("#MoneyTop kbd2")).toHaveText(/^€\s1\.234\.567\.890\.\d{3},\d{2}$/);
  });
});
