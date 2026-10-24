// Landbouwkaart: in de beta de opbrengst van alle velden samen per oogstronde, het deel
// van de robots en de waarde tegen de huidige graanprijs (#123).
const { test, expect } = require("@playwright/test");
const { startGame, game, stat } = require("./helpers/game");

const farm = { Farmland: 12, Harvest: 100, FarmlandCost: 500, Money: 1e6 };
const card = "#landbouw-col";

test.describe("Landbouw: opbrengst per ronde (#123)", () => {
  test("de beta telt alle velden samen en rekent de waarde uit", async ({ page }) => {
    await startGame(page, { beta: true, state: farm });
    await expect(stat(page, card, "Opbrengst per ronde")).toHaveText("1.200 kg");
    await expect(page.locator(card)).not.toContainText("Waarvan robots");
    const price = await game(page, () => objGrain.price);
    expect(await stat(page, card, "Waarde per ronde").textContent()).toBe(
      await game(page, (p) => FixMoney(1.2 * p), price)
    );
  });

  test("een extra veld en robots werken het totaal bij", async ({ page }) => {
    await startGame(page, { beta: true, state: { ...farm, FarmRobots: 1 } });
    await expect(stat(page, card, "Waarvan robots")).toHaveText("1.000 kg");
    await page.getByRole("button", { name: "Koop landbouwgrond" }).click();
    await expect(stat(page, card, "Opbrengst per ronde")).toHaveText("1.300 kg");
  });

  test("de waarde volgt een nieuwe graanprijs", async ({ page }) => {
    await startGame(page, { beta: true, state: farm });
    await game(page, () => {
      objPrijslijst.GrainLow = 250;
      objPrijslijst.GrainHigh = 250;
    });
    await game(page, () => objGrain.priceCalc());
    await expect(stat(page, card, "Waarde per ronde")).toHaveText(/^€\s300,00$/);
  });

  test("graanveredeling verhoogt de opbrengst per ronde", async ({ page }) => {
    await startGame(page, { beta: true, state: farm });
    await game(page, () => {
      objFarmland.GrainResearchTimer = 1;
      objFarmland.research_loop();
    });
    await expect(stat(page, card, "Opbrengst per ronde")).toHaveText("1.320 kg");
  });
});
