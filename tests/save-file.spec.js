// Save als bestand downloaden en weer importeren (#135)
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const { startGame, game, waitForInit } = require("./helpers/game");

test.describe("Save als bestand (#135)", () => {
  test("downloaden geeft een bestand met de save-code en het level in de naam", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 5, Money: 4242 } });
    await page.locator("#navbarOptionDropdown").click();
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#downloadSaveBTN").click()]);
    expect(download.suggestedFilename()).toMatch(/^clickfarm-level-5-\d{4}-\d{2}-\d{2}\.txt$/);
    const content = fs.readFileSync(await download.path(), "utf8");
    const items = JSON.parse(Buffer.from(content, "base64").toString());
    expect(items).toContain("PlayerLevel:5");
    expect(items).toContain("Money:4242");
    await expect(page.locator("#notif")).toContainText("Save gedownload");
  });

  test("in de beta staat beta in de bestandsnaam", async ({ page }) => {
    await startGame(page, { beta: true, state: { PlayerLevel: 3 } });
    const [download] = await Promise.all([page.waitForEvent("download"), game(page, () => downloadSave())]);
    expect(download.suggestedFilename()).toMatch(/^clickfarm-beta-level-3-/);
  });

  test("importeren uit een bestand zet het spel terug", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 2, Money: 10 } });
    const save = Buffer.from(JSON.stringify(["PlayerLevel:6", "Money:777777"])).toString("base64");
    await page.locator("#saveFileInput").setInputFiles({ name: "save.txt", mimeType: "text/plain", buffer: Buffer.from(save + "\n") });
    await page.waitForLoadState("load");
    await waitForInit(page);
    expect(await game(page, () => [+objPlayerInfo.level, +objMoney.amount])).toEqual([6, 777777]);
  });

  test("een ongeldig bestand geeft een melding en laat het spel staan", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 2, Money: 10 } });
    const dialogs = [];
    page.on("dialog", (dialog) => {
      dialogs.push(dialog.message());
      dialog.accept();
    });
    await page.locator("#saveFileInput").setInputFiles({ name: "x.txt", mimeType: "text/plain", buffer: Buffer.from("geen save") });
    await expect.poll(() => dialogs).toEqual(["Ongeldige save-code!"]);
    expect(await game(page, () => [+objPlayerInfo.level, +objMoney.amount])).toEqual([2, 10]);
  });
});
