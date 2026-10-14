// Startsituaties voor de balanssimulator.
//
// LEVEL_8: een speler die net level 8 heeft gehaald. Alles van level 1-7 is aanwezig en
// geautomatiseerd (robots, windmolencontrollers, pastahelpers, kunststofmedewerkers),
// in aantallen die je met het geld van level 7 (drempel 18 mln) redelijkerwijs hebt.
// Prijzen die per aankoop oplopen staan op de bijbehorende stand.
const { threshold } = require("../levels.data");

const grow = (base, factor, n) => Math.round(base * Math.pow(factor, n) * 100) / 100;

const LEVEL_8 = {
  PlayerLevel: 8,
  NextLevel: threshold(8),
  Money: 20000000,

  // Landbouw en graanonderzoek (8 onderzoeken gedaan)
  Farmland: 80,
  FarmlandCost: grow(10, 1.05, 79),
  FarmRobots: 8,
  AutomatedFarms: 80,
  Harvest: 200,
  GrainResearchLevel: 8,
  GrainResearchProfit: 9.32,
  GrainResearchCostVar: grow(5000, 1.1, 7),
  GrainResearchDuration: Math.round(60 * Math.pow(1.1, 7)),
  GrainSiloAmount: 30,
  GrainSiloPrice: grow(2000, 1.01, 29),

  // Molens
  WindmillAmount: 20,
  WindmillControllerAmount: 20,
  WindmillAutomated: 20,
  FlourSiloAmount: 20,

  // Olie en stroom (genoeg pompen voor de centrales én de kunststoffabrieken)
  Factory: 110,
  FactoryCost: grow(10, 1.1, 110),
  PowerPlants: 30,
  PowerPlantPrice: grow(100, 1.1, 30),
  Capacitors: 300,
  OilTankAmount: 20,

  // Eieren en pasta
  Chickens: 15000,
  ChickenFarms: 15,
  EggStorage: 3,
  PastaFactoryAmount: 3,
  pastaHelper: 3,
  PastaFactoryAmountAutomated: 3,
  Storehouses: 1,

  // Kunststof en salescomputer
  plasticFactories: 3,
  plasticWorkers: 3,
  plasticStorage: 2,
  scCPU: 1,
};

module.exports = { LEVEL_8 };
