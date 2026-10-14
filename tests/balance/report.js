// Vat de resultaten van de balanssimulator samen in test-results/balance.md.
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "..", "test-results", "balance");
const OUT = path.join(__dirname, "..", "..", "test-results", "balance.md");

const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".json")) : [];
if (!files.length) {
  console.log("Geen resultaten gevonden in", DIR);
  process.exit(0);
}
const runs = files.map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));

const min = (ticks) => Math.round(ticks / 60);
const fmt = (n) => {
  const units = [
    [1e15, " bld"],
    [1e12, " bln"],
    [1e9, " mrd"],
    [1e6, " mln"],
    [1e3, "k"],
  ];
  for (const [v, u] of units) if (Math.abs(n) >= v) return (n / v).toFixed(1).replace(".", ",") + u;
  return String(Math.round(n));
};
const range = (values) => {
  if (!values.length) return "–";
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? String(lo) : `${lo}–${hi}`;
};

const lines = ["# Balanssimulator", ""];
lines.push(
  `Start: level ${runs[0].startLevel} (zie tests/balance/start.js). Tijden zijn speeltijd; een tick is een seconde.`,
  ""
);

for (const profile of [...new Set(runs.map((r) => r.profile))]) {
  const group = runs.filter((r) => r.profile === profile);
  lines.push(`## ${profile} (${group.length} reeksen)`, "");

  // Duur per level
  const levels = [...new Set(group.flatMap((r) => r.levels.map((l) => l.level)))].sort((a, b) => a - b);
  lines.push("| Level | Gehaald na (min) | Duur van het level (min) | Reeksen | Klikken/min | Stroom productie / vraag |");
  lines.push("|---|---|---|---|---|---|");
  for (const level of levels) {
    const at = [];
    const dur = [];
    const cpm = [];
    const energy = [];
    for (const r of group) {
      const i = r.levels.findIndex((l) => l.level === level);
      if (i < 0) continue;
      const l = r.levels[i];
      const prev = i > 0 ? r.levels[i - 1] : { tick: 0, clicks: 0 };
      at.push(min(l.tick));
      dur.push(min(l.tick - prev.tick));
      cpm.push(Math.round(((l.clicks - prev.clicks) / Math.max(1, l.tick - prev.tick)) * 60));
      energy.push(`${fmt(l.energyProduction)} / ${fmt(l.energyDemand)}`);
    }
    lines.push(`| ${level} | ${range(at)} | ${range(dur)} | ${at.length}/${group.length} | ${range(cpm)} | ${energy[0]} |`);
  }
  const notReached = group.filter((r) => r.level < Math.max(...levels, 0));
  lines.push("");
  lines.push(
    `Eindstand na de maximale speeltijd: ${group
      .map((r) => `reeks ${r.seed}: level ${r.level} na ${min(r.tick)} min`)
      .join("; ")}${notReached.length ? "" : ""}.`,
    ""
  );

  // Gebouwen per level (eerste reeks)
  const r0 = group[0];
  if (r0.levels.length) {
    const keys = Object.keys(r0.levels[0].counts);
    lines.push(`Gebouwen bij het bereiken van een level (reeks ${r0.seed}):`, "");
    lines.push("| Level | " + keys.join(" | ") + " |");
    lines.push("|---|" + keys.map(() => "---").join("|") + "|");
    for (const l of r0.levels) lines.push(`| ${l.level} | ` + keys.map((k) => fmt(l.counts[k])).join(" | ") + " |");
    lines.push("");
    lines.push("Knelpunten per level (aantal ticks dat de bot iets wilde maar niet kon, top 4):", "");
    for (const l of r0.levels) {
      const top = Object.entries(l.stalls)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k, v]) => `${k} (${v})`)
        .join(", ");
      lines.push(`- Level ${l.level}: ${top || "geen"}`);
    }
    lines.push("");
  }

  // Doorlooptijden: eerste keer dat een keten iets opleverde
  const firstKeys = [...new Set(group.flatMap((r) => Object.keys(r.firsts)))];
  if (firstKeys.length) {
    lines.push("Eerste keer (min na de start):", "");
    for (const k of firstKeys) {
      lines.push(`- ${k}: ${range(group.filter((r) => r.firsts[k] !== undefined).map((r) => min(r.firsts[k])))}`);
    }
    lines.push("");
  }
  const errors = group.flatMap((r) => r.pageErrors);
  if (errors.length) lines.push("Fouten in de pagina:", "", ...errors.slice(0, 10).map((e) => "- `" + e + "`"), "");
}

fs.writeFileSync(OUT, lines.join("\n"));
console.log("Rapport geschreven naar", OUT);
