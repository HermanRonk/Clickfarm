// Bekende problemen die (nog) niet opgelost zijn.
//
// Deze tests beschrijven het GEWENSTE gedrag en zijn gemarkeerd met test.fail():
// zolang de bug bestaat is de test groen. Wordt de bug opgelost, dan meldt Playwright
// "expected to fail, but passed" — haal dan de test.fail()-regel weg zodat de test
// voortaan als gewone regressietest meedraait.
const { test, expect } = require("@playwright/test");
const { startGame, reload, game, shownMap } = require("./helpers/game");
const { threshold } = require("./levels.data");

test.describe("Bekende problemen", () => {
  test("ieder id komt maar één keer voor in de pagina", async ({ page }) => {
    test.fail(true, "Dubbele ids: coalMineButton (steenkoolmijn én -silo) en addPastaHelper");
    await startGame(page, { state: { PlayerLevel: 12, NextLevel: threshold(12), Rlevel: 4 } });
    const duplicates = await page.evaluate(() => {
      const counts = {};
      document.querySelectorAll("[id]").forEach((el) => (counts[el.id] = (counts[el.id] || 0) + 1));
      return Object.keys(counts).filter((id) => counts[id] > 1);
    });
    expect(duplicates).toEqual([]);
  });

  test("statusbalk toont alleen voorraden die al vrijgespeeld zijn", async ({ page }) => {
    test.fail(true, "Bloem, olie en energie staan al op level 1 in de navigatiebalk");
    await startGame(page);
    const shown = await shownMap(page, ["FlourTop", "OilTop", "EnergyStats"]);
    expect(shown).toEqual({ FlourTop: false, OilTop: false, EnergyStats: false });
  });

  test("geen lege rijen zichtbaar op level 1", async ({ page }) => {
    test.fail(true, "Rijen zonder zichtbare inhoud worden als lege kaders getoond");
    await startGame(page);
    const emptyRows = await page.evaluate(() =>
      [...document.querySelectorAll(".rows")]
        .filter((row) => row.checkVisibility() && row.innerText.trim() === "")
        .map((row) => row.id)
    );
    expect(emptyRows).toEqual([]);
  });

  test("verkooptab kan pas vanaf level 9 aangezet worden", async ({ page }) => {
    test.fail(true, "Onder level 9 toont de verkooptab een lege balk");
    await startGame(page);
    await page.locator("#navbarOptionDropdown").click();
    await page.locator("#verkooptabBTN").click();
    expect((await shownMap(page, ["sellMenu"])).sellMenu).toBe(false);
  });

  test("koper-, goud- en diamantmijnen kunnen gebouwd worden", async ({ page }) => {
    test.fail(true, "README: resterende mijnen implementeren (knoppen staan uitgecommentarieerd)");
    await startGame(page, { state: { PlayerLevel: 12, NextLevel: threshold(12), Rlevel: 4 } });
    for (const name of ["Bouw kopermijn", "Bouw goudmijn", "Bouw diamantmijn"]) {
      await expect(page.getByRole("button", { name }), name).toBeVisible({ timeout: 1000 });
    }
  });
});
