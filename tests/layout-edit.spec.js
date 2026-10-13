// Indeling bewerken: kaarten inklappen en verplaatsen (alleen op desktop, alleen in de bewerkstand).
const { test, expect } = require("@playwright/test");
const { startGame, reload, tick, game, isShown, stat, storage } = require("./helpers/game");
const { threshold } = require("./levels.data");

const level = (n, extra = {}) => ({ PlayerLevel: n, NextLevel: threshold(n), ...extra });

async function openEditMode(page) {
  await page.locator("#navbarOptionDropdown").click();
  await page.locator("#editLayoutBTN").click();
  await expect(page.locator("#editBar")).toBeVisible();
}

function rowOrder(page, rowId) {
  return page.evaluate((rowId) => [...document.getElementById(rowId).children].map((c) => c.id), rowId);
}

test.describe("Indeling bewerken", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("buiten de bewerkstand is er niets te verslepen of in te klappen", async ({ page }) => {
    await startGame(page, { state: level(2) });
    await expect(page.locator("#grain-col .card-tools")).toBeHidden();
    expect(await page.locator("#grain-col").getAttribute("draggable")).not.toBe("true");
    await game(page, () => objLayout.toggleCollapse("grain-col"));
    await game(page, () => objLayout.move("grain-col", -1));
    expect(await rowOrder(page, "tier1-row")).toEqual(["landbouw-col", "grain-col", "flour-col", "graanopbrengst-col"]);
    await expect(page.locator("#grain-col")).not.toHaveClass(/card-collapsed/);
  });

  test("pijlen verplaatsen een kaart binnen de rij en dat blijft bewaard", async ({ page }) => {
    await startGame(page, { state: level(2) });
    await openEditMode(page);
    await page.getByRole("button", { name: "Graan naar links" }).click();
    expect(await rowOrder(page, "tier1-row")).toEqual(["grain-col", "landbouw-col", "flour-col", "graanopbrengst-col"]);
    await page.getByRole("button", { name: "Landbouw naar rechts" }).click();
    expect(await rowOrder(page, "tier1-row")).toEqual(["grain-col", "flour-col", "landbouw-col", "graanopbrengst-col"]);

    await reload(page);
    expect(await rowOrder(page, "tier1-row")).toEqual(["grain-col", "flour-col", "landbouw-col", "graanopbrengst-col"]);
    // Na herladen speel je weer gewoon, de bewerkstand staat uit
    await expect(page.locator("#editBar")).toBeHidden();
  });

  test("pijlen slaan verborgen kaarten over", async ({ page }) => {
    // Level 1: de bloemkaart (level 2) staat verborgen rechts van graan
    await startGame(page, { state: level(1) });
    await openEditMode(page);
    await page.getByRole("button", { name: "Graan naar rechts" }).click();
    expect(await rowOrder(page, "tier1-row")).toEqual(["landbouw-col", "grain-col", "flour-col", "graanopbrengst-col"]);
  });

  test("slepen werkt binnen een rij, maar niet naar een andere rij", async ({ page }) => {
    await startGame(page, { state: level(6) });
    await openEditMode(page);
    await page.locator("#flour-col .drag-handle").dragTo(page.locator("#landbouw-col"));
    expect(await rowOrder(page, "tier1-row")).toEqual(["flour-col", "landbouw-col", "grain-col", "graanopbrengst-col"]);

    await page.locator("#windmills-col .drag-handle").dragTo(page.locator("#grain-col"));
    expect(await rowOrder(page, "tier1-row")).toEqual(["flour-col", "landbouw-col", "grain-col", "graanopbrengst-col"]);
    expect(await rowOrder(page, "automation-row")).toEqual(["farmland-automation", "windmills-col", "WindmillController"]);

    await reload(page);
    expect(await rowOrder(page, "tier1-row")).toEqual(["flour-col", "landbouw-col", "grain-col", "graanopbrengst-col"]);
  });

  test("inklappen toont alleen de titel, ook buiten de bewerkstand en na herladen", async ({ page }) => {
    await startGame(page);
    await openEditMode(page);
    await page.getByRole("button", { name: "Klap Landbouw in" }).click();
    await expect(page.locator("#farmlandWorkBTN")).toBeHidden();
    await expect(page.locator("#landbouw-col .collapsed-title")).toContainText("Landbouw");

    await page.getByRole("button", { name: "Klaar" }).click();
    await expect(page.locator("#landbouw-col .collapsed-title")).toBeVisible();
    await expect(page.locator("#landbouw-col .card-tools")).toBeHidden();

    await reload(page);
    await expect(page.locator("#farmlandWorkBTN")).toBeHidden();
    await expect(page.locator("#landbouw-col .collapsed-title")).toBeVisible();

    // Uitklappen kan alleen in de bewerkstand
    await openEditMode(page);
    await page.getByRole("button", { name: "Klap Landbouw uit" }).click();
    await expect(page.locator("#farmlandWorkBTN")).toBeVisible();
  });

  test("ingeklapte kaarten blijven gewoon bijwerken", async ({ page }) => {
    await startGame(page, { state: { Farmland: 3 } });
    await openEditMode(page);
    await page.getByRole("button", { name: "Klap Graan in" }).click();
    await game(page, () => objFarmland.work());
    await tick(page, 10);
    await page.getByRole("button", { name: "Klap Graan uit" }).click();
    await expect(stat(page, "#grain-col", "Voorraad")).toHaveText("300 kg");
  });

  test("standaardindeling herstellen zet alles terug", async ({ page }) => {
    await startGame(page, { state: level(2) });
    await openEditMode(page);
    await page.getByRole("button", { name: "Graan naar links" }).click();
    await page.getByRole("button", { name: "Klap Bloem in" }).click();
    await page.getByRole("button", { name: "Standaardindeling herstellen" }).click();
    expect(await rowOrder(page, "tier1-row")).toEqual(["landbouw-col", "grain-col", "flour-col", "graanopbrengst-col"]);
    await expect(page.locator("#flour-col")).not.toHaveClass(/card-collapsed/);
    expect(await storage(page, "layout")).toBeNull();
  });

  test("de indeling gaat mee in de save-code", async ({ page }) => {
    await startGame(page, { state: level(2) });
    await openEditMode(page);
    await page.getByRole("button", { name: "Graan naar links" }).click();
    await page.getByRole("button", { name: "Klap Bloem in" }).click();
    const code = await game(page, () => saveProgress());

    await page.getByRole("button", { name: "Klaar" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#navbarOptionDropdown").click();
    await page.getByRole("button", { name: "Reset Game" }).click();
    await expect(page.locator("#currentlevel dd")).toHaveText("1");
    expect(await storage(page, "layout")).toBeNull();

    page.once("dialog", (dialog) => dialog.accept(code));
    await page.locator("#navbarOptionDropdown").click();
    await page.getByRole("button", { name: "Importeer save-code" }).click();
    await expect(page.locator("#currentlevel dd")).toHaveText("2");
    expect(await rowOrder(page, "tier1-row")).toEqual(["grain-col", "landbouw-col", "flour-col", "graanopbrengst-col"]);
    await expect(page.locator("#flour-col")).toHaveClass(/card-collapsed/);
  });

  test("verplaatsen en inklappen veranderen niets aan wat vrijgespeeld is", async ({ page }) => {
    await startGame(page, {
      state: level(1, { layout: JSON.stringify({ order: {}, collapsed: ["flour-col"] }) }),
    });
    await openEditMode(page);
    await page.getByRole("button", { name: "Graan naar links" }).click();
    expect(await isShown(page, "flour-col")).toBe(false);

    // Bij level 2 verschijnt bloem, ingeklapt
    await game(page, () => objMoney.add(1000, "test"));
    await tick(page, 1);
    expect(await isShown(page, "flour-col")).toBe(true);
    await expect(page.locator("#flour-col")).toHaveClass(/card-collapsed/);
  });

  test("een lege kaart blijft verborgen in de bewerkstand", async ({ page }) => {
    await startGame(page, { state: level(12, { Rlevel: 4 }) });
    await openEditMode(page);
    await tick(page, 1);
    expect(await isShown(page, "SteelProduction-col")).toBe(false);
    expect(await isShown(page, "coalPower")).toBe(false);
  });

  test("een kapotte of gemanipuleerde indeling geeft de standaardindeling", async ({ page }) => {
    const { pageErrors } = await startGame(page, { state: level(6, { layout: "{kapot" }) });
    expect(await rowOrder(page, "tier1-row")).toEqual(["landbouw-col", "grain-col", "flour-col", "graanopbrengst-col"]);
    expect(pageErrors).toEqual([]);
  });

  test("een save kan geen kaart naar een andere rij verplaatsen", async ({ page }) => {
    await startGame(page, {
      state: level(6, {
        layout: JSON.stringify({ order: { "tier1-row": ["windmills-col", "flour-col", "landbouw-col"] }, collapsed: [] }),
      }),
    });
    expect(await rowOrder(page, "tier1-row")).toEqual(["flour-col", "landbouw-col", "grain-col", "graanopbrengst-col"]);
    expect(await rowOrder(page, "automation-row")).toContain("windmills-col");
  });

  test("een oude indeling met Onderzoek in de onderzoeksrij blijft werken", async ({ page }) => {
    // Onderzoek stond vroeger naast de salescomputer en staat nu in de rij met landbouw
    const { pageErrors } = await startGame(page, {
      state: level(7, {
        layout: JSON.stringify({ order: { "onderzoek-row": ["AutoSell-col", "graanopbrengst-col"] }, collapsed: [] }),
      }),
    });
    expect(await rowOrder(page, "tier1-row")).toContain("graanopbrengst-col");
    expect(await rowOrder(page, "onderzoek-row")).toEqual(["AutoSell-col"]);
    expect(await isShown(page, "graanopbrengst-col")).toBe(true);
    expect(pageErrors).toEqual([]);
  });
});

test.describe("Indeling bewerken op mobiel", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("de optie staat niet in het menu, een bewaarde indeling geldt wel", async ({ page }) => {
    await startGame(page, {
      state: level(2, { layout: JSON.stringify({ order: { "tier1-row": ["flour-col"] }, collapsed: ["grain-col"] }) }),
    });
    await page.locator("#navbarOptionDropdown").click();
    await expect(page.locator("#editLayoutBTN")).toBeHidden();
    expect(await rowOrder(page, "tier1-row")).toEqual(["flour-col", "landbouw-col", "grain-col", "graanopbrengst-col"]);
    await expect(page.locator("#grain-col .collapsed-title")).toBeVisible();
  });
});
