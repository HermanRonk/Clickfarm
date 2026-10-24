// Save-codes importeren en het spel resetten: na het herladen staat precies wat er in de
// save stond. Het lopende spel mag de opslag tijdens het herladen niet meer overschrijven (#131).
const { test, expect } = require("@playwright/test");
const { startGame, game, waitForInit, storage } = require("./helpers/game");

const code = (items) => Buffer.from(JSON.stringify(items)).toString("base64");

test.describe("Save-code importeren (#131)", () => {
  test("het lopende spel overschrijft de geïmporteerde energie niet", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 4, EnergyAvailable: 1000, Capacitors: 1000 } });
    const save = code(["PlayerLevel:4", "Capacitors:5000000000", "EnergyAvailable:21007049740", "Money:5000"]);
    // Zoals een tick van de hoofdloop die nog draait voordat de pagina echt herlaadt
    await page.evaluate((save) => {
      getSaveGame(save);
      objEnergy.available = 1000;
      objEnergy.save();
      objMoney.add(1, "test");
    }, save);
    await page.waitForLoadState("load");
    await waitForInit(page);
    expect(await game(page, () => +objEnergy.available)).toBe(21007049740);
    expect(await game(page, () => +objMoney.amount)).toBe(5000);
  });

  test("na een reset begint het spel echt opnieuw", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 4, Money: 123456 } });
    page.on("dialog", (dialog) => dialog.accept());
    await page.evaluate(() => {
      resetGame();
      objMoney.add(1, "test");
    });
    await page.waitForLoadState("load");
    await waitForInit(page);
    expect(await game(page, () => +objPlayerInfo.level)).toBe(1);
    expect(await storage(page, "Money")).not.toBe("123457");
  });
});
