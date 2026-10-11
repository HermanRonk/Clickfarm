// Opmaak en bediening: header, menu, meldingen, mobiel en donker thema.
const { test, expect } = require("@playwright/test");
const { startGame, tick, game, isShown } = require("./helpers/game");
const { threshold } = require("./levels.data");

test.describe("Opmaak", () => {
  test("de pagina laadt niets van andere domeinen", async ({ page, baseURL }) => {
    const external = [];
    page.on("request", (req) => {
      if (!req.url().startsWith(baseURL) && !req.url().startsWith("data:")) external.push(req.url());
    });
    await startGame(page, { state: { PlayerLevel: 12, NextLevel: threshold(12), Rlevel: 4 } });
    await tick(page, 5);
    expect(external).toEqual([]);
  });

  test("iconen worden getekend vanuit de sprite", async ({ page }) => {
    await startGame(page);
    const icon = page.locator("#pauseBTN svg.icon use");
    await expect(icon).toHaveAttribute("href", "#i-pause");
    const box = await page.locator("#i-pause").evaluate((el) => el.getAttribute("viewBox"));
    expect(box).toBe("0 0 448 512");
  });

  test("menu opent en sluit met de knop, een keuze, ernaast klikken en Escape", async ({ page }) => {
    await startGame(page);
    const toggle = page.locator("#navbarOptionDropdown");
    const menu = page.locator("#optionsMenu");

    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(menu).toBeHidden();

    await toggle.click();
    await page.locator("#landbouw-col h2").click();
    await expect(menu).toBeHidden();

    await toggle.click();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.locator("#autocloseBTN").click();
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("hoogstens drie meldingen, rechtsonder en niet over de header", async ({ page }) => {
    await startGame(page);
    for (let i = 1; i <= 5; i++) await game(page, (i) => notificationOverlay("Bericht " + i, "Test", "fa-info"), i);
    const items = page.locator("#notif .notification");
    await expect(items).toHaveCount(3);
    await expect(items.first()).toContainText("Bericht 3");
    await expect(items.last()).toContainText("Bericht 5");

    const header = await page.locator(".topbar").boundingBox();
    const first = await items.first().boundingBox();
    expect(first.y).toBeGreaterThan(header.y + header.height);
  });

  test("getallen gebruiken de Nederlandse notatie, ook in een Engelstalige browser", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await startGame(page, { state: { GrainSiloContents: 12345, GrainSiloAmount: 4 } });
    await expect(page.locator("#GrainTop")).toContainText("12.345/20.000");
    await context.close();
  });

  test("voortgangsbalken lopen niet over de 100%", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 3, NextLevel: threshold(3), Oil: 5000 } });
    const { bar, track } = await page.evaluate(() => {
      const el = document.querySelector("#Oilstock .progress-bar");
      return { bar: el.getBoundingClientRect().width, track: el.parentElement.getBoundingClientRect().width };
    });
    expect(bar).toBeLessThanOrEqual(track);
  });

  test("lege kolommen nemen geen ruimte in", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 12, NextLevel: threshold(12), Rlevel: 4 } });
    for (const id of ["Gold-col", "Diamond-col", "Copper-col"]) {
      expect(await isShown(page, id), id).toBe(false);
    }
  });

  test("donker thema werkt zonder fouten", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark", locale: "nl-NL" });
    const page = await context.newPage();
    const { pageErrors } = await startGame(page, { state: { PlayerLevel: 6, NextLevel: threshold(6) } });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe("rgb(255, 255, 255)");
    expect(pageErrors).toEqual([]);
    await context.close();
  });
});

test.describe("Mobiel (390 px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("vermogen en voorraden blijven zichtbaar en er is geen horizontale scroll", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 4, NextLevel: threshold(4) } });
    for (const id of ["MoneyTop", "GrainTop", "FlourTop", "OilTop", "EnergyStats"]) {
      await expect(page.locator(`#${id}`), id).toBeInViewport();
    }
    await expect(page.locator("#navbarOptionDropdown")).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("de header blijft bovenaan bij scrollen", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 6, NextLevel: threshold(6) } });
    await page.mouse.wheel(0, 2000);
    await expect(page.locator("#MoneyTop")).toBeInViewport();
  });
});
