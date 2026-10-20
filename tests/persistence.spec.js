// Voortgang bewaren: herladen, exporteren/importeren en resetten.
const { test, expect } = require("@playwright/test");
const { startGame, reload, tick, game, storage, levelText } = require("./helpers/game");
const { threshold } = require("./levels.data");

async function openOptions(page) {
  await page.locator("#navbarOptionDropdown").click();
}

test.describe("Voortgang", () => {
  test("na herladen staat alles er nog", async ({ page }) => {
    await startGame(page, { state: { Money: 5000 } });
    await page.getByRole("button", { name: "Koop landbouwgrond" }).click();
    await page.getByRole("button", { name: "Koop graansilo" }).click();
    await page.locator("#farmlandWorkBTN").click();
    await tick(page, 10);

    const before = await game(page, () => ({
      money: objMoney.amount,
      farms: objFarmland.amount,
      silos: +objGrainSilo.amount,
      grain: +objGrainSilo.contents,
    }));

    await reload(page);
    const after = await game(page, () => ({
      money: objMoney.amount,
      farms: objFarmland.amount,
      silos: +objGrainSilo.amount,
      grain: +objGrainSilo.contents,
    }));
    expect(after).toEqual(before);
  });

  test("lopende graanveredeling gaat verder na herladen", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 3, NextLevel: threshold(3), Money: 10000 } });
    await page.locator("#GRButton").click();
    await tick(page, 20);
    await reload(page);
    await expect(page.locator("#GRButton")).toBeDisabled();
    await tick(page, 40);
    // Klaar: niet meer uitgeschakeld, alleen grijs zolang het geld voor de volgende stap ontbreekt
    await expect(page.locator("#GRButton")).not.toHaveAttribute("disabled", "");
    expect(await game(page, () => objFarmland.harvest)).toBe(110);
    expect(await game(page, () => objFarmland.GrainResearchLevel)).toBe(2);
  });

  test("exporteren, resetten en importeren herstelt de savegame", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await startGame(page, {
      state: { PlayerLevel: 5, NextLevel: threshold(5), Money: 1234567.89, Farmland: 42 },
    });

    // Exporteren naar het klembord
    await openOptions(page);
    await page.getByRole("button", { name: "Exporteer save-code" }).click();
    await expect(page.locator("#notif")).toContainText("De save-code staat op je klembord!");
    const code = await page.evaluate(() => navigator.clipboard.readText());
    expect(code.length).toBeGreaterThan(20);

    // Resetten (met bevestiging)
    page.once("dialog", (dialog) => dialog.accept());
    await openOptions(page);
    await page.getByRole("button", { name: "Reset Game" }).click();
    await expect(levelText(page)).toHaveText("1");
    expect(await game(page, () => +objPlayerInfo.level)).toBe(1);
    expect(await game(page, () => objMoney.amount)).toBe(2000);

    // Importeren via de prompt
    page.once("dialog", (dialog) => dialog.accept(code));
    await openOptions(page);
    await page.getByRole("button", { name: "Importeer save-code" }).click();
    await expect(levelText(page)).toHaveText("5");
    expect(await game(page, () => objMoney.amount)).toBe(1234567.89);
    expect(await game(page, () => objFarmland.amount)).toBe(42);
  });

  test("een ongeldige save-code laat de savegame ongemoeid", async ({ page }) => {
    await startGame(page, { state: { Money: 9999 } });
    const messages = [];
    page.on("dialog", async (dialog) => {
      messages.push(dialog.message());
      if (dialog.type() === "prompt") await dialog.accept("dit-is-geen-save");
      else await dialog.accept();
    });
    await openOptions(page);
    await page.getByRole("button", { name: "Importeer save-code" }).click();
    await expect.poll(() => messages).toContain("Ongeldige save-code!");
    expect(await storage(page, "Money")).toBe("9999");
    expect(await game(page, () => objMoney.amount)).toBe(9999);
  });

  test("resetten annuleren laat de savegame ongemoeid", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 4, NextLevel: threshold(4), Money: 400000 } });
    page.once("dialog", (dialog) => dialog.dismiss());
    await openOptions(page);
    await page.getByRole("button", { name: "Reset Game" }).click();
    expect(await storage(page, "PlayerLevel")).toBe("4");
    expect(await game(page, () => objMoney.amount)).toBe(400000);
  });

  test("instellingen (verkooptab, auto-sluiten) blijven bewaard", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 9, NextLevel: threshold(9) } });
    await openOptions(page);
    await page.locator("#verkooptabBTN").click();
    await openOptions(page);
    await page.locator("#autocloseBTN").click();
    await reload(page);
    await expect(page.locator("#sellMenu")).toBeVisible();
    await expect(page.locator("#autocloseBTN")).toContainText("Zet auto-sluit berichten uit");
  });
});
