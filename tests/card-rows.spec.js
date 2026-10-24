// Kaarten verspringen niet als getallen groeien: iedere regel in een kaart blijft één regel
// hoog, ook op een smal scherm en met volledige getallen (#133).
const { test, expect } = require("@playwright/test");
const { startGame, game } = require("./helpers/game");
const { threshold } = require("./levels.data");

const big = {
  PlayerLevel: 12,
  NextLevel: threshold(12),
  Rlevel: 4,
  shortNumbers: "0", // volledige getallen: het zwaarste geval
  Money: 123456789012345.67,
  GrainSiloAmount: 100000,
  GrainSiloContents: 499999999,
  Capacitors: 50000000,
  EnergyAvailable: 4999999999,
  Factory: 5000,
  PowerPlants: 4000,
  ChickenFarms: 9000,
  Chickens: 9000000,
};

// Regels in .stats-list die op meer dan één regel uitkomen
const wrapped = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".stats-list dt, .stats-list dd")]
      .filter((el) => el.checkVisibility())
      .filter((el) => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5)
      .map((el) => el.closest("[id]").id + ": " + el.textContent)
  );

test.describe("Kaartregels (#133)", () => {
  for (const width of [375, 1280]) {
    test(`geen regel loopt over twee regels bij ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await startGame(page, { state: big });
      expect(await wrapped(page)).toEqual([]);
      // Geen horizontale scroll
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }

  test("een afgekapte omschrijving heeft de volledige tekst als tooltip", async ({ page }) => {
    await startGame(page);
    const title = await game(page, () => {
      const box = document.createElement("div");
      box.innerHTML = renderStats([["Een omschrijving", "1"], ["<em>met opmaak</em>", "2"]]);
      return [...box.querySelectorAll("dt")].map((dt) => dt.getAttribute("title"));
    });
    expect(title).toEqual(["Een omschrijving", null]);
  });
});
