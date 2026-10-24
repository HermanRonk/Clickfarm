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
    await page.locator("#landbouw-col > h2").click();
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
    await startGame(page, { state: { PlayerLevel: 11, NextLevel: threshold(11), Rlevel: 4 } });
    for (const id of ["Gold-col", "Diamond-col", "Copper-col"]) {
      expect(await isShown(page, id), id).toBe(false);
    }
  });

  test("alle waardes in de lijstjes zijn gevuld, ook met alles vrijgespeeld", async ({ page }) => {
    const { pageErrors } = await startGame(page, {
      state: {
        PlayerLevel: 12,
        NextLevel: threshold(12),
        Rlevel: 4,
        ironAmountProspected: 1,
        ironSmelters: 1,
        coalAmountActive: 1,
        CoalPowerPlants: 1,
        scCPU: 2,
        plasticFactories: 1,
        fuellCellFactory: 1,
        nppAmount: 1,
        QS: 1,
      },
    });
    await tick(page, 30);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll(".stats-list")].flatMap((list) =>
        [...list.querySelectorAll("dd")]
          .filter((dd) => !dd.textContent.trim() || /NaN|undefined|Infinity/.test(dd.textContent))
          .map((dd) => `${dd.previousElementSibling.textContent}: "${dd.textContent}"`)
      )
    );
    expect(bad).toEqual([]);
    expect(pageErrors).toEqual([]);
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

for (const width of [1440, 1920]) {
  test.describe(`Breed scherm (${width} px)`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("losse kaarten rekken niet uit en labels staan dicht bij hun waarde", async ({ page }) => {
      // Level 4: in de rij met windmolens is alleen de windmolenkaart zichtbaar
      await startGame(page, { state: { PlayerLevel: 4, NextLevel: threshold(4), Money: 300000 } });
      const card = await page.locator("#windmills-col").boundingBox();
      const row = await page.locator("#automation-row").boundingBox();
      expect(card.width).toBeLessThan(row.width / 2);

      const far = await page.evaluate(() =>
        [...document.querySelectorAll(".stats-list dt")]
          .filter((dt) => dt.checkVisibility())
          .map((dt) => {
            const dd = dt.nextElementSibling;
            return [dt.textContent, dd.getBoundingClientRect().right - dt.getBoundingClientRect().left];
          })
          .filter(([, distance]) => distance > 560)
      );
      expect(far).toEqual([]);
    });

    test("onderzoek staat naast de landbouwkaarten", async ({ page }) => {
      await startGame(page, { state: { PlayerLevel: 7, NextLevel: threshold(7) } });
      const landbouw = await page.locator("#landbouw-col").boundingBox();
      const research = await page.locator("#graanopbrengst-col").boundingBox();
      expect(Math.round(research.y)).toBe(Math.round(landbouw.y));
    });

    test("de salescomputer is één lage kaart over de hele rij", async ({ page }) => {
      await startGame(page, { state: { PlayerLevel: 7, NextLevel: threshold(7) } });
      const card = await page.locator("#AutoSell-col").boundingBox();
      const row = await page.locator("#onderzoek-row").boundingBox();
      expect(card.width).toBeGreaterThan(row.width - 2);
      expect(card.height).toBeLessThan(300);
      // CPU's en de vier producten staan naast elkaar
      const tops = await page
        .locator("#AutoSell-col .autosell-grid > *")
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
      expect(new Set(tops).size).toBe(1);
    });
  });
}

// Brede kaarten: twee kolommen breed, met hun onderdelen in twee helften naast elkaar
const wideRows = {
  "productie-row": ["chicken-col", "pasta-col"],
  "plastic-row": ["platicFactory-col", "plasticStorage-col"],
  "mijnen-row": ["Coal-col", "Iron-col"],
  "production2-row": ["SteelProduction-col", "SteelInfo-col"],
  "mijnen-row2": ["Uranium-col"],
};
const allUnlocked = {
  PlayerLevel: 13,
  NextLevel: threshold(13),
  Rlevel: 4,
  ironAmountProspected: 1,
  ironSmelters: 1,
  coalAmountActive: 1,
  plasticFactories: 1,
  PastaFactory: 1,
};

// Per kaart: [links, boven] van beide helften
const halves = (page, id) =>
  page
    .locator(`#${id} .card-half`)
    .evaluateAll((els) => els.map((el) => [el.getBoundingClientRect().left, el.getBoundingClientRect().top]));

for (const width of [1440, 1920]) {
  test.describe(`Brede kaarten (${width} px)`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("de kaarten vullen samen de rij en tonen hun helften naast elkaar", async ({ page }) => {
      await startGame(page, { state: allUnlocked });
      for (const [rowId, cards] of Object.entries(wideRows)) {
        const row = await page.locator(`#${rowId}`).boundingBox();
        for (const id of cards) {
          const card = await page.locator(`#${id}`).boundingBox();
          // twee van de vier kolommen: de helft van de rij
          expect(Math.abs(card.width - (row.width - 24) / 2), id).toBeLessThan(15);
          const [left, right] = await halves(page, id);
          expect(right[0], id).toBeGreaterThan(left[0] + card.width / 3);
          expect(right[1], id).toBeLessThan(card.y + 80);
        }
        if (cards.length === 2) {
          const [a, b] = await Promise.all(cards.map((id) => page.locator(`#${id}`).boundingBox()));
          expect(Math.round(a.y), rowId).toBe(Math.round(b.y));
        }
      }
      // de rij met eieren en pasta was ruim 850 px hoog
      expect((await page.locator("#productie-row").boundingBox()).height).toBeLessThan(600);
    });

    test("bij een kop uit de spelcode begint de rechterhelft onder de kop", async ({ page }) => {
      await startGame(page, { state: allUnlocked });
      for (const id of ["Coal-col", "SteelProduction-col", "SteelInfo-col"]) {
        const heading = await page.locator(`#${id} .card-half h2`).boundingBox();
        const [, right] = await halves(page, id);
        expect(right[1], id).toBeGreaterThanOrEqual(heading.y + heading.height);
      }
    });

    test("een brede kaart klapt in tot alleen de titel", async ({ page }) => {
      await startGame(page, {
        state: { ...allUnlocked, layout: JSON.stringify({ order: {}, collapsed: ["chicken-col"] }) },
      });
      await expect(page.locator("#chicken-col .collapsed-title")).toBeVisible();
      await expect(page.locator("#chicken-col .card-split")).toBeHidden();
      expect((await page.locator("#chicken-col").boundingBox()).height).toBeLessThan(100);
    });
  });
}

test.describe("Brede kaarten op een smallere desktop (1024 px)", () => {
  test.use({ viewport: { width: 1024, height: 900 } });

  test("twee kaarten per rij, met de helften onder elkaar", async ({ page }) => {
    await startGame(page, { state: allUnlocked });
    const tops = await page
      .locator("#productie-row > .card-wide")
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(tops).toHaveLength(2);
    expect(tops[0]).toBe(tops[1]);
    const [left, right] = await halves(page, "chicken-col");
    expect(right[0]).toBe(left[0]);
    expect(right[1]).toBeGreaterThan(left[1]);
  });
});

test.describe("Brede kaarten op mobiel (390 px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("de helften staan onder elkaar, zonder horizontale scroll", async ({ page }) => {
    await startGame(page, { state: allUnlocked });
    const [left, right] = await halves(page, "pasta-col");
    expect(right[0]).toBe(left[0]);
    expect(right[1]).toBeGreaterThan(left[1]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Smallere desktop (1024 px)", () => {
  test.use({ viewport: { width: 1024, height: 900 } });

  test("de salescomputer zet de producten in vier kolommen onder de CPU's", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 7, NextLevel: threshold(7) } });
    const tops = await page
      .locator("#AutoSell-col .autosell-item")
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(tops).toHaveLength(4);
    expect(new Set(tops).size).toBe(1);
    const cpu = await page.locator("#AutoSell-col .autosell-cpu").boundingBox();
    expect(cpu.y + cpu.height).toBeLessThanOrEqual(tops[0]);
  });
});

test.describe("Footer", () => {
  for (const path of ["/", "/info.html"]) {
    test(`donatielink onderaan ${path}`, async ({ page }) => {
      if (path === "/") await startGame(page);
      else await page.goto(path);
      const link = page.locator(".site-footer").getByRole("link", { name: "Buy me a coffee" });
      await expect(link).toHaveAttribute("href", "https://buymeacoffee.com/hermanronk");
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(page.locator(".site-footer")).toContainText("Heb je plezier beleefd aan deze game?");
    });
  }
});
