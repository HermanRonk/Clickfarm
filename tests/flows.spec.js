// Productieketen: lijnen tussen de kaarten (alleen desktop).
const { test, expect } = require("@playwright/test");
const { startGame, reload, tick, game } = require("./helpers/game");
const { threshold } = require("./levels.data");

const level = (n, extra = {}) => ({ PlayerLevel: n, NextLevel: threshold(n), ...extra });

// Zichtbare stromen als "van>naar"
function visibleFlows(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".flow")]
      .filter((g) => g.style.display !== "none")
      .map((g) => g.dataset.from + ">" + g.dataset.to)
      .sort()
  );
}

function flow(page, from, to) {
  return page.locator(`.flow[data-from="${from}"][data-to="${to}"]`);
}

test.describe("Productieketen", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("iedere stroom verwijst naar bestaande kaarten met een titel", async ({ page }) => {
    await startGame(page);
    const unknown = await page.evaluate(() =>
      objFlows.edges
        .flatMap((edge) => [edge[0], edge[1]])
        .filter((id) => !document.getElementById(id) || !helpTexts[id])
    );
    expect(unknown).toEqual([]);
  });

  test("alleen stromen tussen vrijgespeelde kaarten", async ({ page }) => {
    await startGame(page);
    await tick(page, 1);
    expect(await visibleFlows(page)).toEqual(["landbouw-col>grain-col"]);

    await game(page, () => objMoney.add(1000, "test"));
    // Level up aan het eind van de tick; het tekenen volgt in het volgende frame
    await tick(page, 2);
    expect(await visibleFlows(page)).toEqual([
      "grain-col>windmills-col",
      "landbouw-col>grain-col",
      "windmills-col>flour-col",
    ]);

    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll(".flow")]
        .filter((g) => g.style.display !== "none")
        .filter((g) => !document.getElementById(g.dataset.from).checkVisibility() || !document.getElementById(g.dataset.to).checkVisibility())
        .map((g) => g.dataset.from + ">" + g.dataset.to)
    );
    expect(hidden).toEqual([]);
  });

  test("lijnen beginnen en eindigen op de rand van de juiste kaart, ook na verplaatsen", async ({ page }) => {
    await startGame(page, { state: level(7) });
    await tick(page, 1);
    const offEdge = () =>
      page.evaluate(() => {
        const layer = document.getElementById("flowLayer").getBoundingClientRect();
        // Op de verwachte zijde: in dezelfde rij van zijkant naar zijkant, anders van onder naar boven
        const onSide = (point, r, side) => {
          const x = point.x + layer.left;
          const y = point.y + layer.top;
          if (side === "top" || side === "bottom") {
            return Math.abs(y - r[side]) <= 2 && x >= r.left - 2 && x <= r.right + 2;
          }
          return Math.abs(x - r[side]) <= 2 && y >= r.top - 2 && y <= r.bottom + 2;
        };
        return [...document.querySelectorAll(".flow")]
          .filter((g) => g.style.display !== "none")
          .filter((g) => {
            const a = document.getElementById(g.dataset.from).getBoundingClientRect();
            const b = document.getElementById(g.dataset.to).getBoundingClientRect();
            const sameRow = Math.abs(a.top - b.top) < 4;
            const right = b.left + b.width / 2 > a.left + a.width / 2;
            const fromSide = sameRow ? (right ? "right" : "left") : "bottom";
            const toSide = sameRow ? (right ? "left" : "right") : "top";
            const path = g.querySelector(".flow-base");
            const start = path.getPointAtLength(0);
            const end = path.getPointAtLength(path.getTotalLength());
            return !onSide(start, a, fromSide) || !onSide(end, b, toSide);
          })
          .map((g) => g.dataset.from + ">" + g.dataset.to);
      });
    expect(await offEdge()).toEqual([]);

    await page.locator("#navbarOptionDropdown").click();
    await page.locator("#editLayoutBTN").click();
    await page.getByRole("button", { name: "Graan naar links" }).click();
    await page.getByRole("button", { name: "Klap Bloem in" }).click();
    await tick(page, 1);
    expect(await offEdge()).toEqual([]);
  });

  test("het looplicht loopt alleen als een stroom actief is", async ({ page }) => {
    await startGame(page);
    await tick(page, 1);
    const harvest = flow(page, "landbouw-col", "grain-col");
    await expect(harvest).not.toHaveClass(/active/);
    await page.locator("#farmlandWorkBTN").click();
    await tick(page, 1);
    await expect(harvest).toHaveClass(/active/);
    await tick(page, 10);
    await expect(harvest).not.toHaveClass(/active/);
  });

  test("een handmatige actie laat de stroom even lopen", async ({ page }) => {
    await startGame(page, {
      state: level(6, { PastaFactoryAmount: 1, FlourSiloContents: 5000, eggs: 50000, EnergyAvailable: 500 }),
    });
    await tick(page, 1);
    const flour = flow(page, "flour-col", "pasta-col");
    await expect(flour).not.toHaveClass(/active/);
    await page.getByRole("button", { name: "Maak pasta" }).click();
    await expect(flour).toHaveClass(/active/);
    await expect(flow(page, "chicken-col", "pasta-col")).toHaveClass(/active/);
    await tick(page, 4);
    await expect(flour).not.toHaveClass(/active/);
  });

  test("een kaart aanwijzen licht alleen haar stromen op", async ({ page }) => {
    await startGame(page, { state: level(6) });
    await tick(page, 1);
    await page.locator("#windmills-col > h2").hover();
    await expect(page.locator("#flowLayer")).toHaveClass(/has-focus/);
    await expect(flow(page, "grain-col", "windmills-col")).toHaveClass(/focus/);
    await expect(flow(page, "windmills-col", "flour-col")).toHaveClass(/focus/);
    await expect(flow(page, "landbouw-col", "grain-col")).not.toHaveClass(/focus/);

    await page.mouse.move(2, 880);
    await page.locator(".topbar").hover();
    await expect(page.locator("#flowLayer")).not.toHaveClass(/has-focus/);
  });

  test("bliksempoortjes tonen energiegebruik en tekort", async ({ page }) => {
    await startGame(page, { state: level(6, { FarmRobots: 2, EnergyAvailable: 0 }) });
    await tick(page, 1);
    const bolt = page.locator("#farmland-automation > .energy-port");
    await expect(bolt).toBeVisible();
    await expect(bolt).toHaveClass(/(^|\s)shortage(\s|$)/);

    await game(page, () => {
      objEnergy.available = 1000;
      objFlows.updateActivity();
    });
    await expect(bolt).toHaveClass(/(^|\s)active(\s|$)/);
    await expect(bolt).not.toHaveClass(/(^|\s)shortage(\s|$)/);
    // Zonder machines staat het poortje stil
    await expect(page.locator("#WindmillController > .energy-port")).not.toHaveClass(/active/);
  });

  test("aan en uit via het menu, bewaard en mee in de save-code", async ({ page }) => {
    await startGame(page, { state: level(2) });
    await tick(page, 1);
    await expect(page.locator("#flowLayer")).toBeVisible();
    await page.locator("#navbarOptionDropdown").click();
    await page.locator("#flowsBTN").click();
    await tick(page, 1);
    await expect(page.locator("#flowLayer")).toBeHidden();
    expect(await page.evaluate(() => document.body.classList.contains("flows-on"))).toBe(false);
    expect(await game(page, () => JSON.parse(atob(saveProgress())))).toContain("showFlows:0");

    await reload(page);
    await tick(page, 1);
    await expect(page.locator("#flowLayer")).toBeHidden();
  });

  test("met alles vrijgespeeld: geen fouten en snel getekend", async ({ page }) => {
    const { pageErrors } = await startGame(page, {
      state: level(12, {
        Rlevel: 4, ironAmountProspected: 1, ironAmountActive: 1, coalAmountProspected: 1, coalAmountActive: 1,
        uraniumAmountProspected: 1, uraniumAmountActive: 1, ironSmelters: 1, CoalPowerPlants: 1, coalAmount: 300000,
        steelAmount: 50000, PowerPlants: 5, Oil: 900, fuellCellFactory: 1, nppAmount: 1, nrAmount: 1,
        plasticFactories: 1, plasticWorkers: 1, PastaFactoryAmount: 1,
      }),
    });
    await tick(page, 2);
    expect((await visibleFlows(page)).length).toBeGreaterThan(25);
    const ms = await page.evaluate(() => {
      const start = performance.now();
      for (let i = 0; i < 10; i++) objFlows.draw();
      return (performance.now() - start) / 10;
    });
    expect(ms).toBeLessThan(50);
    expect(pageErrors).toEqual([]);
  });
});

test.describe("Productieketen zonder animatie", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("bij 'minder beweging' staat het looplicht stil", async ({ page }) => {
    await startGame(page);
    await page.locator("#farmlandWorkBTN").click();
    await tick(page, 1);
    const animation = await flow(page, "landbouw-col", "grain-col")
      .locator(".flow-run")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
  });
});

test.describe("Productieketen op mobiel", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("geen lijnen, geen poortjes en geen menu-optie", async ({ page }) => {
    await startGame(page, { state: level(6, { FarmRobots: 2 }) });
    await tick(page, 1);
    await expect(page.locator("#flowLayer")).toBeHidden();
    await expect(page.locator("#farmland-automation > .energy-port")).toBeHidden();
    await page.locator("#navbarOptionDropdown").click();
    await expect(page.locator("#flowsBTN")).toBeHidden();
  });
});
