// Speler-bot voor de balanssimulator. Draait in de pagina en bedient het spel via dezelfde
// functies als de knoppen (obj*.add, objMines.prospect, objIronMelter.produce, ...).
// Iedere aanroep telt als één klik, zodat we ook de klikdruk kunnen meten.
//
// Profielen:
// - optimaal: handelt elke tick, investeert steeds in wat het meest oplevert
// - casual:   handelt eens per 30 ticks, maximaal één aankoop per soort per keer
(function () {
  var bot = {
    profile: "optimaal",
    tick: 0,
    clicks: 0,
    clicksBy: {},
    levels: [],
    samples: [],
    firsts: {},
    stalls: {},
    madeHistory: [],
    plan: { reactors: 0 },
    reserve: 0,
  };

  function act(name, fn) {
    bot.clicks++;
    bot.clicksBy[name] = (bot.clicksBy[name] || 0) + 1;
    return fn();
  }

  function stall(reason) {
    bot.stalls[reason] = (bot.stalls[reason] || 0) + 1;
  }

  function first(name) {
    if (bot.firsts[name] === undefined) bot.firsts[name] = bot.tick;
  }

  // ---- Toestand van het spel ----
  function level() {
    return +objPlayerInfo.level;
  }
  function money() {
    return +objMoney.amount;
  }
  function income() {
    // gemiddeld verdiend per tick over de laatste 120 ticks (made = totaal verdiend)
    var h = bot.madeHistory;
    if (h.length < 2) return 0;
    return (h[h.length - 1] - h[0]) / (h.length - 1);
  }
  function saving() {
    // Vlak voor het volgende level niet meer investeren: het geld moet op de rekening staan
    var gap = +objPlayerInfo.nextlevel - money();
    return gap > 0 && income() * 600 >= gap;
  }
  function canSpend(cost, share) {
    // share: welk deel van het vermogen maximaal aan één aankoop op mag gaan.
    // Geld dat gereserveerd is voor iets belangrijkers (stroom, mijnen) blijft staan.
    var spendable = money() - bot.reserve;
    return !saving() && spendable >= cost && cost <= spendable * (share || 1);
  }
  // Iets belangrijks is (nog) niet betaalbaar: daar sparen we voor
  function reserve(cost) {
    if (!saving()) bot.reserve += cost;
  }

  function energyProduction() {
    return (
      +objPowerPlant.amount * +objPowerPlant.yield +
      +objCoalPowerPlant.amount * +objCoalPowerPlant.yield +
      fueledReactors() * +objNuclearPowerPlant.reactorProduction
    );
  }
  // Alleen reactoren met splijtstof leveren stroom (een reactor zonder staaf staat stil)
  function fueledReactors() {
    return Math.min(
      +objNuclearPowerPlant.reactors,
      Math.ceil(+objNuclearPowerPlant.pelletsActive / +objNuclearPowerPlant.reactorFuelUsage)
    );
  }
  function energyDemand() {
    return (
      objEnergy.demand() +
      // Een hoogoven draait zo vaak als er erts is (10.000 t per run)
      Math.min(
        +objIronMelter.amount,
        (+objMines.ironAmountActive * +objIronMine.production) / +objIronMelter.ironOreNeeded
      ) *
        +objIronMelter.energy +
      (+objPastaHelper.amount * +objPastaFactory.energy) / 15 +
      (+objPlasticFactory.workers * +objPlasticFactory.energy) / 15 +
      // Een splijtstoffabriek vraagt 150.000 stroom in één keer bij de start van een batch:
      // reken met een buffer zodat de opslag zich daarvoor kan vullen. In de beta zit die
      // stroom al per tick in objEnergy.demand().
      (window.BETA ? 0 : (+objFuelCellFactory.amount * +objFuelCellFactory.energy) / 20)
    );
  }
  function coalProduction() {
    return +objMines.coalAmountActive * +objCoalMine.production;
  }
  function coalUse() {
    return (
      +objCoalPowerPlant.amount * +objCoalPowerPlant.CoalUsageTons +
      +objIronMelter.amount * +objIronMelter.coalNeeded
    );
  }
  function pastaDemand() {
    // dozen per tick
    return (
      (+objPlasticFactory.workers * +objPlasticFactory.workerFood) / 15 +
      (+objMines.uraniumAmountActive *
        +objUraniumMine.workers *
        +objUraniumMine.workerFood) /
        (+objUraniumMine.period || 10)
    );
  }
  function free(type) {
    return (
      +objMines[type + "AmountProspected"] - +objMines[type + "AmountActive"]
    );
  }
  function fill(amount, storage, cap) {
    return +amount / (+storage * +cap);
  }

  // ---- Onderdelen van de strategie ----

  function research() {
    if (
      level() >= 8 &&
      objResearch.level <= 3 &&
      objResearch.running !== 1 &&
      money() > objResearch.research_tree[objResearch.level - 1].cost * 1.5
    ) {
      act("mijnbouwonderzoek", function () {
        objResearch.doResearch();
      });
    }
    if (
      objFarmland.GrainResearchTimer <= 0 &&
      money() > +objFarmland.GrainResearchCostVar * 20
    ) {
      act("graanonderzoek", function () {
        objFarmland.research();
      });
    }
  }

  function prospect() {
    if (objResearch.level <= 2 || +objMines.prospecting === 1) return;
    // Eerst sparen voor een mijn op een gevonden ijzer- of steenkoollocatie (als die stroom krijgt)
    var energyShort = energyDemand() > energyProduction();
    if (
      objResearch.level > 3 &&
      !energyShort &&
      (free("iron") > 0 || (free("coal") > 0 && coalWanted()))
    )
      return;
    var cost = objMines.prospectPrice ? objMines.prospectPrice() : +objMines.prospectCost;
    if (money() - bot.reserve < cost * 1.05) return stall("geld (prospecting)");
    if (saving() && money() < +objPlayerInfo.nextlevel + cost)
      return;
    act("prospecting", function () {
      objMines.prospect();
    });
  }

  // Stroom die kernenergie nodig heeft om op gang te komen: een splijtstofbatch (150.000 per
  // fabriek) en de uraniummijnen (2.500 per mijn, eens per 10 ticks)
  function nuclearStartup() {
    if (window.BETA || +objFuelCellFactory.amount === 0) return 0;
    if (fueledReactors() >= +objNuclearPowerPlant.reactors && +objFuelRod.amount > 0) return 0;
    return (
      +objFuelCellFactory.amount * +objFuelCellFactory.energy +
      +objMines.uraniumAmountActive * +objUraniumMine.energy
    );
  }

  function steel() {
    if (+objIronMelter.amount < 1) return;
    // Staal maken is handwerk: even overslaan laat stroom over voor de opstart van kernenergie
    var startup = nuclearStartup();
    if (startup > 0 && +objEnergy.available < startup) return stall("staal wacht op stroom voor kernenergie");
    if (
      +objIronOre.amount >= +objIronMelter.ironOreNeeded &&
      +objCoal.amount >= +objIronMelter.coalNeeded &&
      +objEnergy.available >= +objIronMelter.energy
    ) {
      act("maak staal", function () {
        objIronMelter.produce();
      });
      first("staal");
    }
  }

  function steelNeeded() {
    // Staal dat we vasthouden voor geplande bouw (kerncentrale, reactoren, splijtstof)
    var need = 0;
    if (bot.plan.reactors > +objNuclearPowerPlant.reactors) {
      if (+objNuclearPowerPlant.amount * 5 <= +objNuclearPowerPlant.reactors)
        need += +objNuclearPowerPlant.plantSteelNeeded;
      need += +objNuclearPowerPlant.reactorSteelNeeded;
    }
    if (+objFuelCellFactory.amount > 0)
      need += +objFuelCellFactory.amount * +objFuelCellFactory.steelNeeded * 2;
    // Voor high-tech oliepompen (kunststof) een kleine voorraad aanhouden
    if (oilProduction() <= plasticOilUse() + 67) need += +objOilPumpAdv.steelNeeded;
    return need;
  }

  function sell() {
    var keep = steelNeeded();
    if (+objSteel.amount > keep + 1000 && (keep === 0 || +objSteel.amount > keep * 3)) {
      act("verkoop staal", function () {
        objSteel.sell(0);
      });
    }
    var periodic = bot.tick % 60 === 0;
    // Steenkool: overschot verkopen als de mijnen meer leveren dan centrales en hoogovens gebruiken
    if (
      +objCoal.amount > 0 &&
      ((periodic && coalProduction() > coalUse() * 1.2) ||
        fill(objCoal.amount, objCoal.storage, objCoal.storageCap) > 0.9)
    ) {
      act("verkoop steenkool", function () {
        objCoal.sell(0);
      });
    }
    // IJzererts: verkopen zolang er geen (of te weinig) hoogovens zijn
    var oreUse = +objIronMelter.amount * +objIronMelter.ironOreNeeded;
    if (
      +objIronOre.amount > 0 &&
      ((periodic && +objIronOre.amount > oreUse * 3) ||
        fill(objIronOre.amount, objIronOre.storage, objIronOre.storageCap) > 0.9)
    ) {
      act("verkoop ijzererts", function () {
        objIronOre.sell(0);
      });
    }
    // Kunststof bij een goede prijs, of als de opslag vol raakt
    if (
      +objPlastic.amount > 0 &&
      (+objPlastic.price >= 180 ||
        +objPlastic.amount > +objPlastic.storage * +objPlastic.storageCap * 0.7)
    ) {
      act("verkoop kunststof", function () {
        objPlastic.sell(0, "Handmatige verkoop kunststof");
      });
    }
    // Pasta houden we voor het personeel; een overschot verkopen bij een goede prijs
    var pastaReserve = Math.max(2000, pastaDemand() * 600);
    if (
      +objStorehouse.pasta > pastaReserve * 2 &&
      (objPasta.price() >= 150 || +objStorehouse.pasta > pastaReserve * 10)
    ) {
      act("verkoop pasta", function () {
        objPasta.sell("Handmatige verkoop");
      });
    }
  }

  // Kunststof: de geldmotor van het middenspel. Grenzen: olie, stroom, medewerkers (pasta).
  function oilProduction() {
    return (
      +objOilPump.amount +
      +objOilPumpAdv.amount * +objOilPumpAdv.production -
      +objPowerPlant.amount
    );
  }
  function plasticOilUse() {
    return (
      (+objPlasticFactory.amount * +objPlasticFactory.oilNeededProduction) / 15
    );
  }
  // Kosten van één extra doos pasta per tick: land, kippen, boerderijen, helpers
  function pastaUnitCost() {
    var grainPerBox =
      +objPasta.recipe + (+objPasta.recipeEggs / (+objChicken.eggProduction / 5)) * (+objChicken.foodIntake / 5);
    var fields = grainPerBox / (+objFarmland.harvest / 10);
    var chickens = +objPasta.recipeEggs / (+objChicken.eggProduction / 5);
    var perHelper = ((+objPastaFactory.cap / +objPasta.recipe / 15) * 0.95);
    return (
      fields * +objFarmland.cost * 1.1 +
      chickens * +objChicken.cost +
      (chickens / +objChickenFarm.cap) * +objChickenFarm.cost +
      (+objPastaHelper.cost + +objPastaFactory.cost) / perHelper
    );
  }
  function plastic() {
    var unitValue = 180; // gemiddelde kunststofprijs, ook de waarde van 1 vat olie in kunststof
    var perTick = (+objPlasticFactory.production / 15) * unitValue;
    var workerPasta = +objPlasticFactory.workerFood / 15;
    var oilCost = +objIronMelter.amount > 0
      ? (+objOilPumpAdv.price + +objOilPumpAdv.steelNeeded * +objSteel.price) / 1.5
      : +objOilPump.price * 67;
    var cost =
      +objPlasticFactory.cost + +objPlasticFactory.workerCost + oilCost + workerPasta * pastaUnitCost();
    // Alleen uitbreiden als het zich binnen 30 minuten terugverdient en er stroom over is
    var worthIt = cost / perTick < 1800 && energyProduction() > energyDemand() * 1.1 + 50;
    // Fabriek + medewerker zolang er olie over is
    if (oilProduction() > plasticOilUse() + 67) {
      if (+objPlasticFactory.workers < +objPlasticFactory.amount) {
        if (pastaProductionCapacity() >= pastaDemand() + workerPasta && canSpend(+objPlasticFactory.workerCost, 0.5))
          act("kunststofmedewerker", function () {
            objPlasticFactory.addWorker(1);
          });
      } else if (worthIt && canSpend(+objPlasticFactory.cost, 0.5)) {
        act("kunststoffabriek", function () {
          objPlasticFactory.addFactory(1);
        });
      }
    } else if (worthIt) {
      // Meer olie: high-tech pomp (met staal) of een gewone pomp die zich binnen een uur terugverdient
      if (
        +objIronMelter.amount > 0 &&
        +objSteel.amount >= +objOilPumpAdv.steelNeeded &&
        canSpend(+objOilPumpAdv.price, 0.5)
      ) {
        act("high-tech oliepomp", function () {
          objOilPumpAdv.add(1, 0);
        });
      } else if (
        +objOilPump.price < unitValue * 3600 &&
        canSpend(+objOilPump.price, 0.2)
      ) {
        act("oliepomp", function () {
          objOilPump.add();
        });
      }
    }
    if (
      +objPlastic.amount > +objPlastic.storage * +objPlastic.storageCap * 0.5 &&
      canSpend(+objPlastic.storagePrice, 0.05)
    ) {
      act("kunststofopslag", function () {
        objPlastic.addStorage();
      });
    }
    // Olietank groot genoeg voor een productieronde van alle fabrieken
    var oilNeeded = +objPlasticFactory.amount * +objPlasticFactory.oilNeededProduction * 1.5;
    var tankCap = +objOilTank.amount * +objOilTank.cap + +objOilTank.amountBig * +objOilTank.capBig;
    if (tankCap < oilNeeded) {
      if (oilNeeded - tankCap > 20000 && canSpend(+objOilTank.priceBig, 0.2))
        act("grote olietank", function () {
          objOilTank.add(1);
        });
      else if (canSpend(+objOilTank.price, 0.2))
        act("olietank", function () {
          objOilTank.add(0);
        });
    }
  }

  function energy() {
    var production = energyProduction();
    var demand = energyDemand();
    // Opslag: minimaal drie ticks productie (en de batch van een splijtstoffabriek, niet in de beta)
    var storageNeeded = Math.max(
      production * 3,
      window.BETA ? 0 : +objFuelCellFactory.amount * +objFuelCellFactory.energy * 1.2
    );
    var capacitorsNeeded = Math.ceil(storageNeeded / +objEnergy.storageCap);
    var extra = capacitorsNeeded - +objEnergy.capacitors;
    if (extra > 0 && money() > extra * +objEnergy.capaCost * 2) {
      while (extra > 0) {
        var n = Math.min(100, extra);
        act("energieopslag", function () {
          objEnergy.addCapa(n);
        });
        extra -= n;
      }
    }
    if (demand * 1.1 <= production) return;
    stall("stroom");

    // Goedkoopste stroom: kolencentrale (oplopende prijs) of, vanaf level 11, kernenergie
    var coalPerE = +objCoalPowerPlant.price / +objCoalPowerPlant.yield;
    var nuclearPerE =
      (+objNuclearPowerPlant.plantCost / 5 +
        +objNuclearPowerPlant.reactorCost +
        +objFuelCellFactory.cost / 10) /
      +objNuclearPowerPlant.reactorProduction;
    // Kernenergie pas als de splijtstof loopt: een batch vraagt 150.000 stroom in één keer,
    // en die is er niet zolang de vraag groter is dan de productie. Tot dan kolencentrales.
    var fuelFlowing =
      +objNuclearPowerPlant.reactors === 0 ||
      fueledReactors() >= +objNuclearPowerPlant.reactors - 5;
    if (level() >= 11 && nuclearPerE < coalPerE && fuelFlowing) {
      bot.plan.reactors = Math.max(
        bot.plan.reactors,
        +objNuclearPowerPlant.reactors + 1
      );
      return;
    }
    var coalOk =
      +objMines.coalAmountActive > 0 &&
      coalProduction() >= coalUse() + +objCoalPowerPlant.CoalUsageTons;
    if (coalOk) {
      if (canSpend(+objCoalPowerPlant.price)) {
        act("kolencentrale", function () {
          objCoalPowerPlant.add();
        });
        first("kolencentrale");
      } else {
        stall("geld (stroom)");
        reserve(+objCoalPowerPlant.price);
      }
    } else if (oilProduction() < 5) {
      // Een oliecentrale verbrandt 1 vat per tick: eerst een extra pomp
      if (canSpend(+objOilPump.price)) {
        act("oliepomp", function () {
          objOilPump.add();
        });
      }
    } else if (canSpend(+objPowerPlant.price)) {
      act("oliecentrale", function () {
        objPowerPlant.add();
      });
    }
  }

  function nuclear() {
    if (bot.plan.reactors <= +objNuclearPowerPlant.reactors) return;
    // Niet meer reactoren dan er splijtstof voor is (de eerste vijf mogen vooruit)
    if (+objNuclearPowerPlant.reactors >= fueledReactors() + 5) return stall("wacht op splijtstof");
    // Centrale nodig?
    if (
      +objNuclearPowerPlant.reactors >=
      +objNuclearPowerPlant.amount * +objNuclearPowerPlant.plantReactorCap
    ) {
      if (
        canSpend(+objNuclearPowerPlant.plantCost) &&
        +objSteel.amount >= +objNuclearPowerPlant.plantSteelNeeded
      ) {
        act("kerncentrale", function () {
          objNuclearPowerPlant.buildPlant();
        });
        first("kerncentrale");
      } else {
        stall("geld/staal (kernenergie)");
        reserve(+objNuclearPowerPlant.plantCost);
      }
      return;
    }
    if (
      canSpend(+objNuclearPowerPlant.reactorCost) &&
      +objSteel.amount >= +objNuclearPowerPlant.reactorSteelNeeded
    ) {
      act("kernreactor", function () {
        objNuclearPowerPlant.buildReactor();
      });
      first("kernreactor");
    } else {
      stall("geld/staal (kernenergie)");
      reserve(+objNuclearPowerPlant.reactorCost);
    }
  }

  function fuel() {
    // Splijtstof: één fabriek per 10 reactoren, 10 uraniummijnen per fabriek
    var reactors = Math.max(bot.plan.reactors, +objNuclearPowerPlant.reactors);
    if (reactors === 0) return;
    var factories = Math.ceil(reactors / 10);
    if (+objFuelCellFactory.amount < factories) {
      if (canSpend(+objFuelCellFactory.cost)) {
        act("splijtstoffabriek", function () {
          objFuelCellFactory.addFactory(1);
        });
      } else stall("geld (splijtstof)");
    }
    var minesNeeded = +objFuelCellFactory.amount * 10;
    if (+objMines.uraniumAmountActive < minesNeeded) {
      if (free("uranium") < 1) return stall("geen uraniumlocatie");
      if (pastaProductionCapacity() < pastaDemand() + 20)
        return stall("pasta voor uraniummijnen");
      if (canSpend(+objMines.uraniumMineCost)) {
        act("uraniummijn", function () {
          objMines.addMine(3, 1);
        });
        first("uranium");
      }
    }
    if (
      fill(objUraniumOre.amount, objUraniumOre.storage, objUraniumOre.storageCap) >
        0.8 &&
      canSpend(+objUraniumOre.storagePrice, 0.1)
    ) {
      act("uraniumsilo", function () {
        objUraniumOre.addSilo();
      });
    }
  }

  // Steenkool voor centrales en hoogovens is altijd nodig; als bron van inkomen alleen
  // zolang er nog geen staal is of er ruim stroom over is (ijzer levert per stroom veel meer op)
  function coalWanted() {
    return (
      coalProduction() < coalUse() * 1.2 + 1000 ||
      +objMines.ironAmountActive === 0 ||
      energyProduction() > energyDemand() * 1.3
    );
  }

  function mines() {
    if (objResearch.level <= 3) return;
    // Bij een stroomtekort alleen steenkoolmijnen (voor kolencentrales); een ijzermijn zou stilstaan
    var energyShort = energyDemand() > energyProduction();
    // IJzer en steenkool leveren allebei direct geld op (erts verkopen); ijzer via staal het meest
    var types = [
      ["iron", 1, "ijzerertsmijn", "ijzererts"],
      ["coal", 2, "steenkoolmijn", "steenkool"],
    ];
    types.forEach(function (t) {
      if (t[0] === "coal" && !coalWanted()) return;
      if (energyShort && t[0] !== "coal") return stall("stroom (mijnen wachten)");
      if (free(t[0]) < 1) return stall("geen locatie " + t[3]);
      if (canSpend(+objMines[t[0] + "MineCost"] * 1.05)) {
        act(t[2], function () {
          objMines.addMine(t[1], 1);
        });
        first(t[3]);
      } else {
        stall("geld (mijnen)");
        reserve(+objMines[t[0] + "MineCost"] * 1.05);
      }
    });
    // Hoogovens: één per 10 ijzermijnen (een run is 10.000 t erts)
    var needed = Math.ceil(
      (+objMines.ironAmountActive * +objIronMine.production) /
        +objIronMelter.ironOreNeeded
    );
    if (+objIronMelter.amount < needed) {
      if (canSpend(+objIronMelter.cost * 1.05)) {
        act("hoogoven", function () {
          objIronMelter.add(1);
        });
        first("hoogoven");
      } else reserve(+objIronMelter.cost * 1.05);
    }
  }

  function storage() {
    var silos = [
      [objCoal, "steenkoolsilo"],
      [objIronOre, "ijzerertssilo"],
    ];
    silos.forEach(function (s) {
      var o = s[0];
      if (fill(o.amount, o.storage, o.storageCap) > 0.7 && canSpend(+o.storagePrice, 0.05)) {
        act(s[1], function () {
          o.addSilo();
        });
      }
    });
    if (
      steelNeeded() > 0 &&
      +objSteel.storage * +objSteel.storageCap < steelNeeded() * 3 &&
      canSpend(+objSteel.storagePrice, 0.1)
    ) {
      act("staalopslag", function () {
        objSteel.addStorage();
      });
    }
  }

  // Pasta per tick die de helpers kunnen maken (zonder rekening te houden met grondstoffen)
  function pastaProductionCapacity() {
    return (
      ((+objPastaHelper.amount * +objPastaFactory.cap) / +objPasta.recipe / 15) *
      (1 - +objPastaHelper.cut)
    );
  }

  // Voedselketen meeschalen met wat het personeel eet: graan -> bloem + kippenvoer, eieren -> pasta
  function food() {
    var target = pastaDemand() * 1.25 + 5 + (bot.plan.reactors > 0 ? 20 : 0);
    var helpersNeeded = Math.ceil(
      target / ((+objPastaFactory.cap / +objPasta.recipe / 15) * 0.95)
    );
    var flourNeeded = target * +objPasta.recipe; // kg per tick
    var eggsNeeded = target * +objPasta.recipeEggs; // per tick
    // Vanaf level 12 koopt de bot eieren op de markt (gemiddeld ~8.000 per tick te koop)
    var marketEggs = level() >= 12 ? 8000 : 0;
    var chickensNeeded = Math.ceil(
      Math.max(0, eggsNeeded - marketEggs) / (+objChicken.eggProduction / 5)
    );
    var grainNeeded =
      flourNeeded + (chickensNeeded * +objChicken.foodIntake) / 5; // kg per tick
    var fieldsNeeded = Math.ceil(grainNeeded / (+objFarmland.harvest / 10));
    var millsNeeded = Math.ceil(flourNeeded / (+objWindmill.cap / 10));

    function buy(name, have, want, cost, fn) {
      if (+have >= want) return;
      if (!canSpend(cost, 0.05)) return stall("geld (" + name + ")");
      act(name, fn);
    }
    buy("pastafabriek", objPastaFactory.amount, helpersNeeded, +objPastaFactory.cost, function () {
      objPastaFactory.add();
    });
    buy("pastahelper", objPastaHelper.amount, Math.min(helpersNeeded, +objPastaFactory.amount), +objPastaHelper.cost, function () {
      objPastaHelper.add(1);
    });
    buy("landbouwgrond", objFarmland.amount, fieldsNeeded, +objFarmland.cost, function () {
      objFarmland.addfarm();
    });
    buy("farmrobot", objFarmRobot.robots, objFarmRobot.needed(), +objFarmRobot.robotCost, function () {
      objFarmRobot.add();
    });
    buy("windmolen", objWindmill.amount, millsNeeded, +objWindmill.cost, function () {
      objWindmill.add();
    });
    buy("windmolencontroller", objWindmillController.amount, +objWindmill.amount, +objWindmillController.price, function () {
      objWindmillController.add();
    });
    buy("kippenboerderij", +objChickenFarm.amount * +objChickenFarm.cap, chickensNeeded, +objChickenFarm.cost, function () {
      objChickenFarm.add();
    });
    var room = +objChickenFarm.amount * +objChickenFarm.cap - +objChicken.amount;
    if (+objChicken.amount < chickensNeeded && room > 0) {
      var n = Math.min(room, chickensNeeded - +objChicken.amount);
      var step = n >= 100000 ? 100000 : n >= 10000 ? 10000 : n >= 1000 ? 1000 : n >= 100 ? 100 : n >= 10 ? 10 : 1;
      if (canSpend(step * +objChicken.cost, 0.05))
        act("kippen", function () {
          objChicken.add(step);
        });
    }
    // Eieropslag voor één productieronde van de helpers
    buy("eieropslag", +objEgg.storageUnits * +objEgg.storageCap, eggsNeeded * 20, +objEgg.storageUnitCost, function () {
      objEgg.addStorageUnit();
    });
    // Graan- en bloemsilo's voor één maalronde
    buy("graansilo", +objGrainSilo.amount * +objGrainSilo.cap, grainNeeded * 20, +objGrainSilo.price, function () {
      objGrainSilo.add();
    });
    buy("bloemsilo", +objFlourSilo.amount * +objFlourSilo.cap, flourNeeded * 30, +objFlourSilo.price, function () {
      objFlourSilo.add();
    });
  }

  // Markt: eieren bijkopen voor de pasta (pas vanaf level 12 zichtbaar)
  function market() {
    if (level() < 12 || bot.tick % 30 !== 0) return;
    var room = +objEgg.storageUnits * +objEgg.storageCap - +objEgg.amount;
    var amount = Math.min(+objSalesInfo.eggs || 0, room);
    if (amount > 1000 && canSpend(amount * +objEgg.price * 1.5, 0.05)) {
      act("markt: eieren", function () {
        objMarket.buy("eggs", amount);
      });
    }
  }

  function recordLevel(lvl) {
    bot.levels.push({
      level: lvl,
      tick: bot.tick,
      money: money(),
      clicks: bot.clicks,
      stalls: Object.assign({}, bot.stalls),
      energyProduction: energyProduction(),
      energyDemand: energyDemand(),
      pastaDemand: pastaDemand(),
      pastaCapacity: pastaProductionCapacity(),
      counts: {
        ijzermijnen: +objMines.ironAmountActive,
        steenkoolmijnen: +objMines.coalAmountActive,
        uraniummijnen: +objMines.uraniumAmountActive,
        hoogovens: +objIronMelter.amount,
        kolencentrales: +objCoalPowerPlant.amount,
        oliecentrales: +objPowerPlant.amount,
        kerncentrales: +objNuclearPowerPlant.amount,
        reactoren: +objNuclearPowerPlant.reactors,
        splijtstoffabrieken: +objFuelCellFactory.amount,
        landbouwgrond: +objFarmland.amount,
        kippen: +objChicken.amount,
        pastahelpers: +objPastaHelper.amount,
        energieopslag: +objEnergy.capacitors,
      },
      sites: {
        ijzer: +objMines.ironAmountProspected,
        steenkool: +objMines.coalAmountProspected,
        uranium: +objMines.uraniumAmountProspected,
        koper: +objMines.copperAmountProspected,
        goud: +objMines.goldAmountProspected,
        diamant: +objMines.diamondAmountProspected,
      },
    });
    bot.stalls = {};
  }

  var lastLevel = null;
  bot.step = function () {
    bot.tick++;
    bot.madeHistory.push(+made);
    if (bot.madeHistory.length > 121) bot.madeHistory.shift();
    if (lastLevel === null) lastLevel = level();
    if (level() !== lastLevel) {
      for (var l = lastLevel + 1; l <= level(); l++) recordLevel(l);
      lastLevel = level();
    }
    if (bot.tick % 300 === 0) {
      bot.samples.push({
        tick: bot.tick,
        level: level(),
        money: Math.round(money()),
        income: Math.round(income()),
        energy: [Math.round(energyProduction()), Math.round(energyDemand())],
        oil: [oilProduction(), Math.round(plasticOilUse())],
        plastic: [+objPlasticFactory.amount, +objPlasticFactory.workers],
        pasta: [Math.round(pastaProductionCapacity()), Math.round(pastaDemand())],
        mines: [+objMines.ironAmountActive, +objMines.coalAmountActive, +objMines.uraniumAmountActive],
        build: {
          hoogovens: +objIronMelter.amount,
          kolencentrales: +objCoalPowerPlant.amount,
          kerncentrales: +objNuclearPowerPlant.amount,
          reactoren: +objNuclearPowerPlant.reactors,
          actief: +objNuclearPowerPlant.activeReactors,
          splijtstof: +objFuelCellFactory.amount,
          velden: +objFarmland.amount,
          staal: Math.round(+objSteel.amount),
          reserve: bot.reserve,
        },
        nuclear: {
          beschikbaar: Math.round(+objEnergy.available),
          opslag: +objEnergy.capacitors * +objEnergy.storageCap,
          staven: +objFuelRod.amount,
          inReactoren: +objNuclearPowerPlant.fuelRods,
          pellets: +objNuclearPowerPlant.pelletsActive,
          actief: +objNuclearPowerPlant.activeReactors,
          teller: +objFuelCellFactory.counter,
          fabriekenActief: +objFuelCellFactory.activeFactories,
          uranium: Math.round(+objUraniumOre.amount),
          pasta: Math.round(+objStorehouse.pasta),
          staal: Math.round(+objSteel.amount),
        },
        sites: [+objMines.ironAmountProspected, +objMines.coalAmountProspected, +objMines.uraniumAmountProspected],
      });
    }
    var every = bot.profile === "casual" ? 30 : 1;
    if (bot.tick % every !== 0) return;

    bot.reserve = 0;
    research();
    // Eerst verkopen, dan smelten: zo staat er na de stap staal klaar voor de splijtstoffabrieken
    sell();
    steel();
    energy();
    nuclear();
    fuel();
    mines();
    prospect();
    plastic();
    storage();
    food();
    market();
  };

  window.__bot = bot;
  // De bot handelt na iedere tick van het spel (de nep-klok loopt de intervals op volgorde af)
  setInterval(bot.step, 1000);
})();
