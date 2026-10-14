// Balanssimulator: speelt het echte spel met een bot en meet hoe lang ieder level duurt.
// Niet onderdeel van `npm test`; draaien met `npm run balance` (zie tests/README.md).
//
// Instellingen via omgevingsvariabelen:
//   BALANCE_PROFILES  optimaal,casual   welke speelstijlen
//   BALANCE_SEEDS     3                 aantal willekeurige reeksen per speelstijl
//   BALANCE_HOURS     10                maximale speeltijd in uren
//   BALANCE_UNTIL     15                stoppen bij dit level
//   BALANCE_BETA      1                 de beta spelen (/beta/spel.html) in plaats van het gewone spel
const fs = require("fs");
const path = require("path");
const { test } = require("@playwright/test");
const { startGame, game } = require("../helpers/game");
const { LEVEL_8 } = require("./start");

const PROFILES = (process.env.BALANCE_PROFILES || "optimaal,casual").split(",");
const SEEDS = +(process.env.BALANCE_SEEDS || 3);
const HOURS = +(process.env.BALANCE_HOURS || 10);
const UNTIL = +(process.env.BALANCE_UNTIL || 15);
const OUT = path.join(__dirname, "..", "..", "test-results", "balance");
const BETA = process.env.BALANCE_BETA === "1";
const VARIANT = BETA ? "beta" : "gewoon";
const CHUNK = 300; // seconden speltijd per stap

for (const profile of PROFILES) {
  for (let seed = 1; seed <= SEEDS; seed++) {
    test(`${VARIANT}, ${profile}, reeks ${seed}`, async ({ page }) => {
      test.setTimeout(HOURS * 3600 * 25 + 60000);
      const { pageErrors } = await startGame(page, {
        state: { ...LEVEL_8, showFlows: 0, notifications_autoclose: 1 },
        seed,
        beta: BETA,
      });
      await page.addScriptTag({ path: path.join(__dirname, "bot.js") });
      await game(page, (profile) => (window.__bot.profile = profile), profile);

      const started = Date.now();
      let result;
      for (let t = 0; t < HOURS * 3600; t += CHUNK) {
        await page.clock.runFor(CHUNK * 1000);
        result = await game(page, () => ({
          level: +objPlayerInfo.level,
          tick: window.__bot.tick,
          levels: window.__bot.levels,
          firsts: window.__bot.firsts,
          clicksBy: window.__bot.clicksBy,
          stalls: window.__bot.stalls,
          samples: window.__bot.samples,
          money: +objMoney.amount,
        }));
        if ((t + CHUNK) % 3600 === 0)
          console.log(`${profile} ${seed}: ${(t + CHUNK) / 3600} uur, level ${result.level}, geld ${result.money.toExponential(2)}`);
        if (result.level >= UNTIL) break;
      }
      result.profile = profile;
      result.variant = VARIANT;
      result.seed = seed;
      result.startLevel = LEVEL_8.PlayerLevel;
      result.realSeconds = Math.round((Date.now() - started) / 1000);
      result.pageErrors = pageErrors.slice(0, 20);
      fs.mkdirSync(OUT, { recursive: true });
      fs.writeFileSync(path.join(OUT, `${VARIANT}-${profile}-${seed}.json`), JSON.stringify(result, null, 2));
    });
  }
}
