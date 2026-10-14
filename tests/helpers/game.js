// Hulpfuncties om het spel in een voorspelbare toestand te starten en te bedienen.
const { expect } = require("@playwright/test");

const START_TIME = new Date("2026-01-01T12:00:00Z").getTime();

/**
 * Start het spel met een nep-klok (zodat de hoofdloop van 1 seconde te versnellen is),
 * een vaste random-seed en optioneel een vooraf ingevulde localStorage.
 *
 * De savegame wordt alleen bij de eerste paginalading gezet: bij een reload (of een
 * import/reset die zelf herlaadt) blijft de toestand van het spel staan.
 *
 * Met beta: true start de beta (/beta/spel.html) en komt de savegame onder "beta:".
 */
async function startGame(page, { state = {}, seed = 42, errors = true, beta = false } = {}) {
  const pageErrors = [];
  if (errors) {
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(msg.text());
    });
  }

  // Klok stilzetten: de tijd loopt alleen door via tick(), niet vanzelf in real time
  // (anders draait de hoofdloop tijdens het wachten mee en worden tests onvoorspelbaar)
  await page.clock.install({ time: START_TIME });
  await page.clock.pauseAt(START_TIME + 1000);
  await page.addInitScript(
    ({ state, seed, prefix }) => {
      // Deterministische Math.random (mulberry32)
      let s = seed >>> 0;
      Math.random = function () {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      if (!sessionStorage.getItem("__clickfarmSeeded")) {
        sessionStorage.setItem("__clickfarmSeeded", "1");
        localStorage.clear();
        for (const [key, value] of Object.entries(state)) {
          localStorage.setItem(prefix + key, String(value));
        }
      }
    },
    { state, seed, prefix: beta ? "beta:" : "" }
  );

  await page.goto(beta ? "/beta/spel.html" : "/");
  await waitForInit(page);
  return { pageErrors };
}

// Wacht tot window.onload klaar is (het level wordt dan getoond)
async function waitForInit(page) {
  await expect(stat(page, "#currentlevel", "Level")).toHaveText(/^\d+$/);
}

// Het getoonde level als locator
function levelText(page) {
  return stat(page, "#currentlevel", "Level");
}

// Herlaad de pagina en wacht tot het spel weer geïnitialiseerd is
async function reload(page) {
  await page.reload();
  await waitForInit(page);
}

// Laat de hoofdloop n seconden draaien
async function tick(page, seconds = 1) {
  await page.clock.runFor(seconds * 1000);
}

// Lees een waarde uit het spel (globale obj*-objecten)
function game(page, fn, arg) {
  return page.evaluate(fn, arg);
}

// Is het element (inclusief alle ouders) zichtbaar volgens de CSS display/visibility?
function isShown(page, id) {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} bestaat niet`);
    return el.checkVisibility();
  }, id);
}

async function shownMap(page, ids) {
  return page.evaluate((ids) => {
    const result = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      result[id] = el ? el.checkVisibility() : "ontbreekt";
    }
    return result;
  }, ids);
}

// Zichtbare tekst mag nergens NaN, undefined of Infinity bevatten
async function expectNoBrokenNumbers(page) {
  const text = await page.evaluate(() => document.body.innerText);
  const bad = text
    .split("\n")
    .filter((line) => /\bNaN\b|\bundefined\b|Infinity/.test(line));
  expect(bad, "regels met NaN/undefined/Infinity").toEqual([]);
}

// Waarde (dd) bij een label (dt) uit een renderStats-lijst binnen scope, als locator
function stat(page, scope, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return page
    .locator(scope)
    .locator("dt")
    .filter({ hasText: new RegExp(`^${escaped}$`) })
    .locator("xpath=following-sibling::dd[1]");
}

function storage(page, key) {
  return page.evaluate((key) => localStorage.getItem(key), key);
}

// Tekst van de meest recente notificatie(s)
function notifications(page) {
  return page.locator("#notif .notification");
}

module.exports = {
  startGame,
  waitForInit,
  reload,
  tick,
  game,
  isShown,
  shownMap,
  expectNoBrokenNumbers,
  storage,
  stat,
  levelText,
  notifications,
};
