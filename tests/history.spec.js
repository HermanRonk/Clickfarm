// Laatste inkomsten: korte omschrijvingen en een kaart die niet verspringt (#134)
const { test, expect } = require("@playwright/test");
const { startGame, game } = require("./helpers/game");

const card = (page) => page.locator("#HistoryMessages");
const height = (page) => card(page).evaluate((el) => el.getBoundingClientRect().height);

test.describe("Laatste inkomsten (#134)", () => {
  test("omschrijvingen zijn kort", async ({ page }) => {
    await startGame(page);
    const cases = {
      "Handmatige verkoop steenkool": "Steenkool (hand)",
      "Handmatige verkoop Olie": "Olie (hand)",
      "Computerverkoop bloem": "Bloem (computer)",
      "Verkoop overschot goud": "Goud (overschot)",
      "Overschot eieren": "Eieren (overschot)",
      "Verkoop restant graan": "Graan (restant)",
      "Restant verkoop bloem": "Bloem (restant)",
      "Verkoop Olie Restant": "Olie (restant)",
      "Reguliere verkoop eieren": "Eieren",
      "Regulier verkoop bloem": "Bloem",
      "Reguliere verkoop Pasta": "Pasta",
      "Verkoop Graan": "Graan",
      "Verkoop AICoin": "AICoin",
      "Verkoop farmrobot": "Farmrobot verkocht",
      "Verkopen mijn": "Mijn verkocht",
      "Topsteen verkocht": "Topsteen",
      "Medische isotopen": "Medische isotopen",
    };
    const result = await game(page, (cases) => Object.keys(cases).map((d) => shortHistory(d)), cases);
    expect(result).toEqual(Object.values(cases));
  });

  test("een verkoop verschijnt kort in de kaart", async ({ page }) => {
    await startGame(page, { state: { GrainSiloContents: 5000 } });
    await page.getByRole("button", { name: "Verkoop graan" }).click();
    await expect(card(page).locator("dt").first()).not.toContainText(/verkoop/i);
  });

  test("de kaart blijft even hoog, van 0 tot 5 regels en met grote bedragen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await startGame(page);
    const empty = await height(page);
    await game(page, () => objMoney.add(10, "Handmatige verkoop steenkool"));
    expect(await height(page)).toBe(empty);
    await game(page, () => {
      for (let i = 0; i < 6; i++) objMoney.add(99999999999999, "Verkoop overschot industriële diamant");
    });
    expect(await height(page)).toBe(empty);
    expect(await card(page).locator("dt").count()).toBe(5);
    // Iedere regel één regel hoog
    const tall = await card(page).evaluate((el) =>
      [...el.querySelectorAll("dt, dd")].filter((x) => x.getBoundingClientRect().height > parseFloat(getComputedStyle(x).lineHeight) * 1.5).length
    );
    expect(tall).toBe(0);
  });
});
