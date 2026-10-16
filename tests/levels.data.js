// Verwachte voortgang per level, afgeleid van objPlayerInfo (inc/base.js):
// - unlocks: welke onderdelen (ook in de bovenbalk) bij het bereiken van dat level zichtbaar worden (proceslevel)
// - threshold: het geldbedrag dat nodig is voor het volgende level (NextLevel),
//   beginnend bij 3.000 en daarna vermenigvuldigd met level_multiplier.
//
// Wordt de balans aangepast, dan hoeft alleen deze tabel bijgewerkt te worden.

const START_MONEY = 2000;

const LEVELS = [
  { level: 1, threshold: 3000, unlocks: ["landbouw-col", "grain-col", "Grainstock"] },
  { level: 2, threshold: 15000, unlocks: ["flour-col", "windmills-col", "Flourstock", "FlourTop"] },
  { level: 3, threshold: 75000, unlocks: ["graanopbrengst-col", "olie-col", "Oilstock", "OilTop"] },
  { level: 4, threshold: 375000, unlocks: ["pomp-col", "energieproductie-col", "energy-col", "EnergyStats"] },
  { level: 5, threshold: 1500000, unlocks: ["farmland-automation"] },
  { level: 6, threshold: 4500000, unlocks: ["WindmillController", "chicken-col", "pasta-col", "Pastastock"] },
  { level: 7, threshold: 18000000, unlocks: ["AutoSell-col", "plastic-row"] },
  // Vanaf level 8 is het mijnbouwonderzoek beschikbaar; de mijnen zelf komen pas na het onderzoek
  { level: 8, threshold: 90000000, unlocks: ["MiningResearch-col", "mijnbouw-row"] },
  { level: 9, threshold: 450000000, unlocks: [] }, // verkooptab (optie in het menu)
  { level: 10, threshold: 2250000000, unlocks: [] }, // uranium: alleen zichtbaar na mijnbouwonderzoek
  { level: 11, threshold: 11250000000, unlocks: ["nuclearFuel-row"] },
  { level: 12, threshold: 56250000000, unlocks: ["market-row"] },
  { level: 13, threshold: 281250000000, unlocks: [] },
];

// Onderdelen die afhangen van het mijnbouwonderzoek (Rlevel) in plaats van alleen het level
const RESEARCH_GATED = {
  // Rlevel > 2: prospecting
  prospecting: ["Prospecting-col"],
  // Rlevel > 3: mijnen (uranium daarbinnen vanaf level 10)
  mines: ["mijnen-row", "mijnen-row2"],
  uranium: "Uranium-col",
};

const ALL_GATED = LEVELS.flatMap((l) => l.unlocks);

// Wat moet zichtbaar zijn op een bepaald level
function expectedShown(level) {
  return LEVELS.filter((l) => l.level <= level).flatMap((l) => l.unlocks);
}

// Wat moet (nog) verborgen zijn op een bepaald level
function expectedHidden(level) {
  return LEVELS.filter((l) => l.level > level).flatMap((l) => l.unlocks);
}

function threshold(level) {
  return LEVELS.find((l) => l.level === level).threshold;
}

module.exports = {
  START_MONEY,
  LEVELS,
  RESEARCH_GATED,
  ALL_GATED,
  expectedShown,
  expectedHidden,
  threshold,
};
