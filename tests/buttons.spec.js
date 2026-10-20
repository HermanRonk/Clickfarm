// Knoppen die nu niets kunnen doen zijn grijs: te weinig geld of grondstoffen, of alle
// fabrieken worden al automatisch bestuurd. Een grijze knop doet niets bij klikken.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game } = require("./helpers/game");
const { threshold } = require("./levels.data");

const atLevel = (level, extra = {}) => ({ PlayerLevel: level, NextLevel: threshold(level), ...extra });

test.describe("Handmatige productie met alles geautomatiseerd", () => {
  test("Maak pasta is grijs als alle pastafabrieken een helper hebben", async ({ page }) => {
    await startGame(page, {
      state: atLevel(7, {
        Money: 1e8, PastaFactoryAmount: 2, pastaHelper: 2, PastaFactoryAmountAutomated: 2,
        FlourSiloContents: 5000, eggs: 50000, EnergyAvailable: 500,
      }),
    });
    const make = page.getByRole("button", { name: "Maak pasta" });
    await expect(make).toBeDisabled();
    await expect(make).toHaveAttribute("title", "Alle pastafabrieken worden bestuurd door pastahelpers");
    await make.click({ force: true });
    await expect(page.locator("#notif .notification")).toHaveCount(0);

    // Een extra fabriek zonder helper: weer te gebruiken
    await page.getByRole("button", { name: "Bouw pastafabriek" }).click();
    await expect(make).toBeEnabled();
    await expect(make).not.toHaveAttribute("title");
  });

  test("Maak pasta is grijs zonder pastafabrieken", async ({ page }) => {
    await startGame(page, { state: atLevel(7) });
    await expect(page.getByRole("button", { name: "Maak pasta" })).toHaveAttribute("title", "Geen pastafabrieken");
  });

  test("Maal graan is grijs als alle windmolens een controller hebben", async ({ page }) => {
    await startGame(page, {
      state: atLevel(6, { Money: 1e6, WindmillAmount: 2, WindmillControllerAmount: 2, WindmillAutomated: 2, GrainSiloContents: 5000, EnergyAvailable: 1000 }),
    });
    const grind = page.locator("#GrindGrain");
    await expect(grind).toBeDisabled();
    await expect(grind).toHaveAttribute("title", "Alle windmolens worden bestuurd door controllers");
    await page.getByRole("button", { name: "Bouw windmolen", exact: true }).click();
    await expect(grind).not.toHaveClass(/btn-blocked/);
  });

  test("Maak staal is grijs als alle hoogovens besturing hebben", async ({ page }) => {
    await startGame(page, {
      beta: true,
      state: atLevel(13, { Rlevel: 4, Money: 1e12, ironAmountProspected: 1, ironSmelters: 2, smelterControls: 2 }),
    });
    await expect(page.locator("#makeSteelButton")).toHaveAttribute("title", /Al je hoogovens hebben besturing/);
  });
});

test.describe("Koopknoppen zonder geld of grondstoffen", () => {
  test("zonder geld grijs met de prijs als tooltip, met geld weer bruikbaar", async ({ page }) => {
    await startGame(page, { state: { Money: 5 } });
    const farm = page.getByRole("button", { name: "Koop landbouwgrond" });
    const silo = page.getByRole("button", { name: "Koop graansilo" });
    await expect(farm).toBeDisabled();
    await expect(farm).toHaveAttribute("title", /^Niet genoeg geld \(€\s10,00\)$/);
    await expect(silo).toBeDisabled();

    await game(page, () => objMoney.add(10000, "Test"));
    await tick(page, 1);
    await expect(farm).toBeEnabled();
    await expect(silo).toBeEnabled();
    await farm.click();
    expect(await game(page, () => objFarmland.amount)).toBe(2);
  });

  test("precies genoeg geld telt zoals de koopfunctie: de graansilo vraagt meer dan de prijs", async ({ page }) => {
    await startGame(page, { state: { Money: 2000 } });
    await expect(page.getByRole("button", { name: "Koop graansilo" })).toBeDisabled();
  });

  test("energieopslag: alleen de knoppen die je kunt betalen", async ({ page }) => {
    await startGame(page, { state: atLevel(4, { Money: 60000 }) });
    const capa = (label) => page.locator("#energy-col").getByRole("button", { name: label, exact: true });
    await expect(capa("+1")).toBeEnabled();
    await expect(capa("+10")).toBeEnabled();
    await expect(capa("+100")).toBeDisabled();
  });

  test("opslag kopen volgt de opslagprijs", async ({ page }) => {
    await startGame(page, { state: atLevel(7, { Money: 1000000 }) });
    await expect(page.locator("#addPlasticStorage")).toBeDisabled();
    await game(page, () => objMoney.add(1000000, "Test"));
    await tick(page, 1);
    await expect(page.locator("#addPlasticStorage")).toBeEnabled();
  });

  test("verkoopknoppen blijven gewoon bruikbaar", async ({ page }) => {
    await startGame(page, { state: atLevel(7, { Money: 0, PastaFactoryAmount: 1 }) });
    await expect(page.getByRole("button", { name: "Verkoop pastafabriek" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Verkoop graan" })).toBeEnabled();
  });

  test("beta: te weinig staal maakt de bouwknop en de bulkknoppen grijs", async ({ page }) => {
    await startGame(page, {
      beta: true,
      state: atLevel(12, { Rlevel: 4, Money: 1e12, copperAmountProspected: 5, steelAmount: 1000 }),
    });
    await expect(page.locator("#copperMineButton")).toHaveAttribute("title", "Niet genoeg staal");
    await expect(page.locator("[data-bulk='copper-10']")).toBeDisabled();
    await expect(page.locator("[data-bulk='copper-max']")).toBeDisabled();

    await game(page, () => objSteel.add(100000));
    await tick(page, 1);
    await expect(page.locator("#copperMineButton")).toBeEnabled();
    await expect(page.locator("[data-bulk='copper-10']")).toBeEnabled();
  });
});
