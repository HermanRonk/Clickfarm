// Levelen: drempels, meldingen en welke onderdelen per level vrijkomen.
const { test, expect } = require("@playwright/test");
const {
  startGame,
  reload,
  tick,
  game,
  shownMap,
  expectNoBrokenNumbers,
  storage,
  notifications,
} = require("./helpers/game");
const { LEVELS, ALL_GATED, RESEARCH_GATED, expectedShown, expectedHidden, threshold } = require("./levels.data");

async function expectSections(page, level) {
  const shown = await shownMap(page, ALL_GATED);
  for (const id of expectedShown(level)) expect(shown[id], `level ${level}: #${id} zichtbaar`).toBe(true);
  for (const id of expectedHidden(level)) expect(shown[id], `level ${level}: #${id} verborgen`).toBe(false);
}

test.describe("Level up", () => {
  for (const { level } of LEVELS.filter((l) => l.level < 13)) {
    test(`level ${level} → ${level + 1}`, async ({ page }) => {
      const current = threshold(level);
      const { pageErrors } = await startGame(page, {
        state: { PlayerLevel: level, NextLevel: current, Money: current - 1 },
      });

      // Net onder de drempel: geen level up
      await tick(page, 1);
      expect(await game(page, () => +objPlayerInfo.level)).toBe(level);
      await expectSections(page, level);

      // Drempel bereikt: level up met melding en nieuwe drempel
      await game(page, () => objMoney.add(1, "test"));
      await tick(page, 1);
      expect(await game(page, () => +objPlayerInfo.level)).toBe(level + 1);
      await expect(page.locator("#currentlevel")).toHaveText(`Huidig level is: ${level + 1}`);
      await expect(notifications(page).last()).toContainText(`Levelup! je bent nu level: ${level + 1}`);
      expect(+(await storage(page, "PlayerLevel"))).toBe(level + 1);
      expect(+(await storage(page, "NextLevel"))).toBe(threshold(level + 1));
      await expectSections(page, level + 1);

      // Geld wordt niet afgeschreven bij een level up
      expect(await game(page, () => objMoney.amount)).toBe(current);

      // Na herladen is alles nog hetzelfde (init-pad in plaats van levelup-pad)
      await reload(page);
      expect(await game(page, () => +objPlayerInfo.level)).toBe(level + 1);
      expect(await game(page, () => +objPlayerInfo.nextlevel)).toBe(threshold(level + 1));
      await expectSections(page, level + 1);

      await tick(page, 30);
      await expectNoBrokenNumbers(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test("volledige doorloop van level 1 tot 13 in één sessie", async ({ page }) => {
    const { pageErrors } = await startGame(page);
    for (let level = 1; level < 13; level++) {
      await game(page, (target) => objMoney.add(target - objMoney.amount, "test"), threshold(level));
      await tick(page, 1);
      expect(await game(page, () => +objPlayerInfo.level), `na drempel van level ${level}`).toBe(level + 1);
      await expectSections(page, level + 1);
    }
    await expect(page.locator("#nextlevel")).toHaveText("Drempel voor volgend level: € 281.250.000.000,00");
    expect(pageErrors).toEqual([]);
  });

  test("maximaal één level per tick, ook bij een grote som geld", async ({ page }) => {
    await startGame(page, { state: { Money: threshold(5) } });
    await tick(page, 1);
    expect(await game(page, () => +objPlayerInfo.level)).toBe(2);
    await tick(page, 3);
    expect(await game(page, () => +objPlayerInfo.level)).toBe(5);
  });
});

test.describe("Mijnbouwonderzoek (level 8+)", () => {
  test("onderzoek ontgrendelt stap voor stap prospecting en mijnen", async ({ page }) => {
    await startGame(page, {
      state: { PlayerLevel: 8, NextLevel: threshold(8), Money: 20000000 },
    });
    const research = page.locator("#MiningResearch");
    await expect(research).toBeEnabled();

    const shownNow = () => shownMap(page, [...RESEARCH_GATED.prospecting, ...RESEARCH_GATED.mines]);
    expect(Object.values(await shownNow())).toEqual([false, false, false]);

    const phases = [180, 360, 720];
    for (let i = 0; i < phases.length; i++) {
      await research.click();
      await expect(research).toBeDisabled();
      expect(await game(page, () => objMoney.amount)).toBe(20000000 - (i + 1) * 5000000);
      await tick(page, phases[i]);
      expect(await game(page, () => objResearch.level)).toBe(i + 2);
    }

    // Na drie fasen: prospecting en mijnen zichtbaar, onderzoek afgerond.
    // De tweede mijnenrij bevat op level 8 alleen nog verborgen uranium en blijft dus weg (#46).
    expect(await shownNow()).toEqual({ "Prospecting-col": true, "mijnen-row": true, "mijnen-row2": false });
    await expect(research).toBeDisabled();
    await expect(page.locator("#ResDesc")).toContainText("helemaal klaar met de research");

    // Uranium pas vanaf level 10
    expect((await shownMap(page, [RESEARCH_GATED.uranium]))[RESEARCH_GATED.uranium]).toBe(false);
  });

  test("uranium is zichtbaar op level 10 na het onderzoek", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 10, NextLevel: threshold(10), Rlevel: 4 } });
    expect((await shownMap(page, [RESEARCH_GATED.uranium]))[RESEARCH_GATED.uranium]).toBe(true);
    expect((await shownMap(page, ["mijnen-row2"]))["mijnen-row2"]).toBe(true);
  });

  test("onderzoek kan niet gestart worden onder level 8", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 7, NextLevel: threshold(7), Money: 20000000 } });
    await expect(page.locator("#MiningResearch")).toBeDisabled();
  });

  test("lopend onderzoek gaat verder na herladen", async ({ page }) => {
    await startGame(page, { state: { PlayerLevel: 8, NextLevel: threshold(8), Money: 6000000 } });
    await page.locator("#MiningResearch").click();
    await tick(page, 100);
    await reload(page);
    await expect(page.locator("#MiningResearch")).toBeDisabled();
    expect(await game(page, () => objResearch.timer)).toBe(80);
    await tick(page, 80);
    expect(await game(page, () => objResearch.level)).toBe(2);
  });
});
