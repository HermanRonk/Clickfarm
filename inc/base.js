// Beta: dezelfde code, maar met de wijzigingen die eerst getest worden (zie /beta/).
// De beta bewaart zijn spel los van het gewone spel, met "beta:" voor iedere sleutel.
// Nieuwe onderdelen zet je achter `if (BETA)`; bij het overzetten naar het gewone spel
// verdwijnen die controles weer.
var BETA = /^\/beta\//.test(location.pathname);

// Opslag van het spel. Alleen de eigen sleutels tellen mee: een reset of save-code
// in het gewone spel raakt de beta niet, en andersom.
var store = {
  prefix: BETA ? "beta:" : "",
  own: function (fullKey) {
    var isBeta = fullKey.indexOf("beta:") === 0;
    return BETA ? isBeta : !isBeta;
  },
  getItem: function (key) {
    return localStorage.getItem(store.prefix + key);
  },
  setItem: function (key, value) {
    localStorage.setItem(store.prefix + key, value);
  },
  removeItem: function (key) {
    localStorage.removeItem(store.prefix + key);
  },
  keys: function () {
    return Object.keys(localStorage)
      .filter(store.own)
      .map(function (fullKey) {
        return fullKey.slice(store.prefix.length);
      });
  },
  clear: function () {
    Object.keys(localStorage)
      .filter(store.own)
      .forEach(function (fullKey) {
        localStorage.removeItem(fullKey);
      });
  },
};

// Korte getallen (#124): vanaf 1 miljoen "1,23 mln" in plaats van "1.234.567".
// Standaard aan; de volledige waarde in de bovenbalk staat in de tooltip.
var shortNumbers = store.getItem("shortNumbers") !== "0";

var spend = parseInt(store.getItem("spend")) || 10;
var made = parseInt(store.getItem("made")) || 0;
var PriceFactor = 25;
var debug = parseInt(store.getItem("debug")) || 0;
var CSStransitionEnd = whichTransitionEvent();

// voorbereiding voor debug mogelijkheden.
function turnDebug(inputDB) {
  var eldebugBTN = document.getElementById("debugBTN");
  if (inputDB === 1) debug = 1 - debug;

  store.setItem("debug", debug);
  if (debug === 1) {
    eldebugBTN.innerHTML = icon("check-square") + " Zet debug uit";
  } else {
    eldebugBTN.innerHTML = icon("square") + " Zet debug aan";
  }
}

// In de beta: label bij de naam, en in het menu de weg terug naar het gewone spel
function showBeta() {
  if (!BETA) return;
  document.title = "Clickfarm.nl (beta)";
  var badge = document.createElement("span");
  badge.className = "beta-badge";
  badge.textContent = "beta";
  document.querySelector(".topbar .brand").append(" ", badge);
  var betaLink = document.getElementById("betaLink");
  betaLink.lastChild.textContent = " Beta: spel meenemen of opnieuw beginnen";
  document.getElementById("mainGameLink").hidden = false;
}

// Opruimen sleutels van de oude online koppeling (er is geen backend meer)
function cleanupLegacyKeys() {
  ["onlineUserID", "newUser", "guid"].forEach((storageKey) =>
    store.removeItem(storageKey)
  );
}

// initialisatie
window.onload = function () {
  // Zetten vars
  Display.hide([
    "flour-col",
    "windmills-col",
    "Flourstock",
    "graanopbrengst-col",
    "olie-col",
    "Oilstock",
    "Pastastock",
    "pomp-col",
    "energieproductie-col",
    "energy-col",
    "farmland-automation",
    "WindmillController",
    "chicken-col",
    "plastic-row",
    "pasta-col",
    "AutoSell-col",
    "MiningResearch-col",
    "mijnbouw-row",
    "mijnen-row",
    "mijnen-row2",
    "Uranium-col",
    "nuclearFuel-row",
    "market-row",
    "FlourTop",
    "OilTop",
    "EnergyStats",
  ]);
  cleanupLegacyKeys();
  showBeta();
  initHelp();
  objLayout.init();
  objPause.init();
  objBulk.init();
  objFlows.init();
  document.getElementById("sellMenu").style.display = "none";
  getPrice();
  objMoney.init();
  objEnergy.init();
  objGrainSilo.init();
  objFarmland.init();
  objOil.init();
  objGrainSilo.show();
  objPlayerInfo.init();
  objWindmillController.init();
  objWindmill.init();
  objFarmRobot.init();
  objOilPumpAdv.init();
  objOilTank.init();
  objFlourSilo.init();
  objOilPump.init();
  objPastaHelper.init();
  objPastaFactory.init();
  objStorehouse.init();
  objResearch.init();
  objPowerPlant.init();
  objMines.init();
  objCoal.init();
  objIronOre.init();
  objUraniumOre.init();
  objCopperOre.init();
  objCopperSmelter.init();
  objCopper.init();
  objElectronics.init();
  objPCB.init();
  objSolar.init();
  objScanner.init();
  objGoldOre.init();
  objGoldRefinery.init();
  objGold.init();
  objRoughDiamond.init();
  objDiamondCutter.init();
  objDiamondVault.init();
  objDiamondDrill.init();
  objChipFactory.init();
  objChips.init();
  objDatacenter.init();
  objIsotopeLab.init();
  objIsotopes.init();
  objAICoin.init();
  objFusion.init();
  objIronMelter.init();
  objSteel.init();
  objCoalPowerPlant.init();
  objChickenFarm.init();
  objChicken.init();
  objEgg.init();
  objPasta.init();
  objSalesComputer.init();
  objPlasticFactory.init();
  objPlastic.init();
  objResearch.init();
  objFuelCellFactory.init();
  objNuclearPowerPlant.init();
  // Opnieuw tonen nu alle centrales en voorraden geladen zijn (#116)
  objEnergy.show();
  objStats.init();
  objGrain.priceCalc();
  objMarket.init();
  showQuickSell(0);
  turnAutoClose(0);
  turnShortNumbers(0);
  turnDebug(0);
  // Initialiseren overige gegevens en display
  showPrice();
  objButtons.init();
};

// Functie voor het onzichtbaar maken van DOM elementen
var Display = {
  convertStringToArray: function (object) {
    return typeof object === "string" ? Array(object) : object;
  },
  show: function (Identifier, bHide) {
    var cDisplay = bHide === undefined ? "" : "none";

    aIdentifier = this.convertStringToArray(Identifier);
    for (i = 0; i < aIdentifier.length; i++)
      if ((el = document.getElementById(aIdentifier[i])))
        el.style.display = cDisplay;
      else console.error("Could not find element " + aIdentifier[i]);
    this.updateRows();
  },
  hide: function (cIdentifier) {
    this.show(cIdentifier, false);
  },
  // Rijen en kolommen zonder zichtbare inhoud verbergen, los van de weergave per level/onderzoek
  updateRows: function () {
    var changed = false;
    var toggle = function (el, name, on) {
      if (el.classList.contains(name) !== on) {
        el.classList.toggle(name, on);
        changed = true;
      }
    };
    document.querySelectorAll(".rows").forEach(function (row) {
      var filled = false;
      Array.from(row.children).forEach(function (child) {
        if (child.classList.contains("row-ui")) return;
        var text = child.textContent;
        child.querySelectorAll(".help-ui, .card-ui").forEach(function (help) {
          text = text.replace(help.textContent, "");
        });
        var hasContent = text.trim() !== "";
        toggle(child, "col-empty", !hasContent);
        if (hasContent && child.style.display !== "none") filled = true;
      });
      toggle(row, "row-empty", !filled);
      if (typeof objLayout !== "undefined") objLayout.updateRowLabel(row);
    });
    // Productieketen alleen opnieuw tekenen als er een kaart of rij verschijnt of verdwijnt;
    // groottewijzigingen vangt de ResizeObserver in objFlows al op
    if (changed && typeof objFlows !== "undefined") objFlows.schedule();
  },
};

// SVG-icoon uit de sprite in index.html ("fa-euro-sign" en "euro-sign" werken allebei)
function icon(name) {
  return (
    '<svg class="icon" aria-hidden="true"><use href="#i-' +
    String(name).replace(/^fa-/, "") +
    '"></use></svg>'
  );
}

// Dropdownmenu's: openen/sluiten met de knop, sluiten bij een keuze, ernaast klikken of Escape
function closeDropdowns(except) {
  document.querySelectorAll(".dropdown.open").forEach(function (dropdown) {
    if (dropdown === except) return;
    dropdown.classList.remove("open");
    dropdown
      .querySelector(".dropdown-toggle")
      .setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", function (event) {
  var toggle = event.target.closest(".dropdown-toggle");
  if (toggle) {
    var dropdown = toggle.closest(".dropdown");
    closeDropdowns(dropdown);
    var open = dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    return;
  }
  if (
    event.target.closest(".dropdown-item") ||
    !event.target.closest(".dropdown")
  ) {
    closeDropdowns();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  var open = document.querySelector(".dropdown.open .dropdown-toggle");
  closeDropdowns();
  if (open) open.focus();
});

// Uitleg per kaart: de "?"-knop rechtsboven toont deze tekst
var helpTexts = {
  "geld-col": [
    "Financiën",
    "Je vermogen is al het geld dat je hebt. Je verdient door producten te verkopen; bouwen en kopen kost geld. Haal je de drempel van het volgende level, dan ga je een level omhoog; dat kost niets.",
  ],
  "level-col": [
    "Level",
    "Ieder level geeft nieuwe onderdelen vrij. Je stijgt zodra je vermogen de drempel haalt, maximaal één level per seconde. De drempel wordt daarna 3 tot 5 keer zo hoog.",
  ],
  "opslag-col": [
    "Voorraden",
    "Hoe vol je silo's en olietanks zijn. Wat niet meer past wordt automatisch verkocht, maar voor minder dan de marktprijs.",
  ],
  "energy-col": [
    "Energie",
    "Centrales maken iedere seconde (tick) energie; die wordt opgeslagen tot de opslag vol is. Hier koop je ook extra energieopslag. Pompen, robots, controllers, mijnen en fabrieken gebruiken energie. Is er te weinig, dan draaien ze maar gedeeltelijk. Met de productieketen aan hebben verbruikers een ⚡-poortje: blauw als ze energie gebruiken, rood als er te weinig is.",
  ],
  "landbouw-col": [
    "Landbouw",
    "Klik op Bewerk landbouwgrond: na 10 seconden levert ieder veld de opbrengst per veld aan graan. Ieder extra veld is 5% duurder dan het vorige. Velden die door farmrobots bewerkt worden, oogsten vanzelf.",
  ],
  "grain-col": [
    "Graan",
    "Graan komt van je velden en gaat eerst naar de voeropslag van de kippen, daarna naar de silo's. De prijs verandert iedere 10 seconden; verkoop als hij hoog is. Wat niet in de silo's past, wordt verkocht voor 20% van de prijs.",
  ],
  "flour-col": [
    "Bloem",
    "Windmolens malen graan tot bloem (1 kg graan wordt 1 kg bloem). Bloem is meer waard dan graan en is nodig voor pasta. Wat niet past, wordt verkocht voor 80% van de prijs.",
  ],
  "farmland-automation": [
    "Farmrobots",
    "Een robot bewerkt 10 velden en oogst iedere 10 seconden vanzelf. Iedere run kost 15 energie per robot; zonder energie staan de robots stil. Verkopen levert 75% van de prijs op.",
  ],
  "windmills-col": [
    "Windmolens",
    "Met Maal graan vermaalt iedere windmolen tot 1.000 kg graan in 10 seconden; de bloem komt geleidelijk binnen. Meer windmolens malen meer tegelijk.",
  ],
  WindmillController: [
    "Windmolencontrollers",
    "Een controller laat één windmolen automatisch malen zolang er graan en energie is. Iedere controller gebruikt 8 energie per maalrun van 10 ticks (0,8 per tick).",
  ],
  "olie-col": [
    "Olie",
    "Pomp olie met de hand of met oliepompen. Bij verkopen blijft er 5 vaten per oliecentrale achter als brandstof. Wat niet in je tanks past, wordt verkocht voor 80% van de prijs.",
  ],
  "pomp-col": [
    "Oliepompen",
    "Een oliepomp maakt iedere tick 1 vat olie en gebruikt daarvoor 1 energie. Iedere pomp is 10% duurder dan de vorige. Vanaf level 10 zijn er high-tech pompen: 100 vaten per tick voor 75 energie, maar ze kosten ook staal.",
  ],
  "energieproductie-col": [
    "Oliecentrales",
    "Een oliecentrale verbrandt 1 vat olie per tick en levert 10 energie. Wat niet in je energieopslag (in de kaart Energie) past, gaat verloren.",
  ],
  coalPower: [
    "Kolencentrales",
    "Een kolencentrale verbruikt 1.000 ton steenkool per tick en levert 750 energie. Bij het verkopen van steenkool blijft de voorraad voor je centrales achter.",
  ],
  "chicken-col": [
    "Eieren",
    "Iedere 5 ticks leggen kippen eieren en eten ze graan uit de voeropslag van de kippenboerderij (aangevuld met je oogst). Is er te weinig voer, dan sterven er kippen. Een boerderij biedt plek aan 1.000 kippen.",
  ],
  "pasta-col": [
    "Pasta",
    "Een doos pasta maak je van 10 kg bloem en 100 eieren. Iedere fabriek verwerkt per run tot 2.000 kg bloem en gebruikt 50 energie. Pasta kost de helft van de bloemprijs per doos. Vanaf level 7 kunnen pastahelpers de fabrieken bedienen.",
  ],
  "graanopbrengst-col": [
    "Onderzoek",
    "Graanveredeling verhoogt de opbrengst per veld; iedere stap is duurder en duurt langer. Vanaf level 8 kun je mijnbouw onderzoeken; na drie fases kun je naar mijnlocaties zoeken en mijnen openen.",
  ],
  "AutoSell-col": [
    "Salescomputer",
    "Iedere CPU zet automatisch verkopen voor één product vrij: olie, bloem, pasta en kunststof. Zet het vinkje aan en kies met de schuif vanaf welke prijs er verkocht wordt; de computer kijkt iedere 5 seconden.",
  ],
  "platicFactory-col": [
    "Kunststoffabrieken",
    "Een kunststoffabriek maakt per run 1.000 eenheden kunststof van 1.000 vaten olie en 500 energie. Klik zelf op Maak kunststof of neem medewerkers aan; die eten pasta.",
  ],
  "plasticStorage-col": [
    "Kunststof",
    "De prijs van kunststof volgt de olieprijs (8 keer de olieprijs plus € 100). Breid de opslag uit als je meer wilt bewaren.",
  ],
  "Prospecting-col": [
    "Prospecting",
    "Een zoektocht duurt 15 seconden en vindt een willekeurige mijnlocatie. Hij kost € 10 miljoen op level 8, € 25 miljoen op level 9 en daarna € 50 miljoen. Steenkool vind je het vaakst, goud en diamant het minst. Kopermijnen bouw je vanaf level 12, goudmijnen vanaf level 14 en diamantmijnen vanaf level 15.",
  ],
  "MiningSites-col": [
    "Mijnlocaties",
    "Per grondstof hoeveel locaties je gevonden hebt en hoeveel mijnen er actief zijn. Op iedere gevonden locatie kun je één mijn bouwen.",
  ],
  "Coal-col": [
    "Steenkool",
    "Een steenkoolmijn levert 3.500 ton per tick voor 250 energie. Steenkool is brandstof voor kolencentrales en hoogovens. Heb je bijna niets meer, dan kun je steenkool bijkopen voor 150% van de prijs.",
  ],
  "Iron-col": [
    "IJzererts",
    "Een ijzerertsmijn levert 1.000 ton per tick voor 450 energie. IJzererts is nodig voor staal. Is de opslag vol, dan stoppen de mijnen.",
  ],
  "SteelProduction-col": [
    "Hoogovens",
    "Een hoogoven maakt per run 10.000 ton staal van 10.000 ton ijzererts, 1.000 ton steenkool en 5.000 energie. Klik op Maak staal om een run te starten.",
  ],
  "SteelInfo-col": [
    "Staal",
    "Staal wordt in loodsen opgeslagen. De prijs is (ijzerertsprijs × 10 + steenkoolprijs) × 1,25. Staal heb je nodig voor high-tech pompen en kernenergie.",
  ],
  "Uranium-col": [
    "Uranium",
    "Een uraniummijn levert iedere 10 ticks (een dienst) 100 ton uranium voor 2.500 energie. Het personeel eet 20 dozen pasta per dienst. Uranium is de grondstof voor splijtstofstaven en, vanaf level 16, voor het isotopenlab.",
  ],
  fuelRodFactory: [
    "Splijtstofstaven",
    "Een fabriek maakt in 100 ticks één splijtstofstaaf van 10.000 ton uranium en 1.000 ton staal (bij de start van een run afgeschreven) en 150.000 energie: 1.500 per tick. Is er een tick te weinig stroom, dan wacht de fabriek. Fabrieken draaien altijd door.",
  ],
  fuelRodStorage: [
    "Opslag en afval",
    "Nieuwe staven gaan naar je kerncentrales. Verbruikte staven worden afval; opslag kost iedere 60 ticks geld per staaf. Je kunt afval laten opruimen; de prijs daarvan wisselt.",
  ],
  nuclearPower: [
    "Kerncentrales",
    "Een kerncentrale biedt plek aan 5 reactoren. Een reactor verbruikt 1 pellet per tick (1.000 pellets per staaf) en levert 5.000 energie. Reactoren kunnen niet verkocht worden.",
  ],
  marketEggs: [
    "Markt: eieren",
    "Op de markt koop je extra grondstoffen in; het aanbod verandert iedere 30 seconden. Eieren kosten hier 150% van de normale prijs. Wat niet in je opslag past, wordt direct weer verkocht voor 50% van de normale prijs.",
  ],
  marketSteel: [
    "Markt: staal",
    "Staal kost op de markt 125% van de normale prijs. Wat niet in je loodsen past, wordt direct weer verkocht.",
  ],
  marketWasteFuel: [
    "Markt: afval splijtstofstaven",
    "Je kunt afvalstaven opkopen voor de helft van de opruimprijs. Let op: ook voor dit afval betaal je opslagkosten.",
  ],
};

// Kaarten vanaf level 12, en uitleg die daarmee verder gaat
helpTexts["SteelProduction-col"] = [
  "Hoogovens",
  helpTexts["SteelProduction-col"][1] +
    " Vanaf level 13 kun je een hoogoven besturing geven (5.000 printplaten): die maakt dan iedere tick zelf staal.",
];
helpTexts["Prospecting-col"] = [
  "Prospecting",
  helpTexts["Prospecting-col"][1] +
    " Vanaf level 13 zoeken seismische scanners (20.000 printplaten) vanzelf door, eventueel gericht op één grondstof.",
];
Object.assign(helpTexts, {
  "Copper-col": [
    "Koper",
    "Een kopermijn kost geld en staal. Hij levert 1.000 ton kopererts per tick voor 600 energie, en het personeel eet 1 doos pasta per 5 ticks. Is de pasta bijna op, dan gaat het personeel van de uraniummijnen voor. Kopererts wordt in de smelterij koper.",
  ],
  "CopperSmelter-col": [
    "Kopersmelterij",
    "Een smelterij maakt iedere tick 200 ton koper van 2.000 ton kopererts, 200 ton steenkool en 2.000 energie. Hij draait vanzelf zolang alles er is.",
  ],
  "Electronics-col": [
    "Elektronicafabriek",
    "Een elektronicafabriek kost geld en staal en maakt iedere tick 100 printplaten van 50 ton koper, 200 kunststof en 3.000 energie. Hij draait vanzelf zolang alles er is.",
  ],
  "PCB-col": [
    "Printplaten",
    "Printplaten zijn € 60.000 per stuk waard. Je hebt ze nodig voor hoogovenbesturing (5.000 per hoogoven), seismische scanners (20.000 per scanner) en zonneparken (1.000 per park).",
  ],
  solarPark: [
    "Zonneparken",
    "Een zonnepark kost geld, printplaten en staal en levert 3.000 energie per tick zonder brandstof. Ieder park is 3% duurder dan het vorige.",
  ],
  "Gold-col": [
    "Goud",
    "Een goudmijn kost geld en 100.000 ton staal. Hij levert 500 ton gouderts per tick voor 3.000 energie; het personeel eet 1 doos pasta per 2 ticks (het uraniumpersoneel gaat voor).",
  ],
  "GoldRefinery-col": [
    "Goudraffinaderij",
    "Een raffinaderij maakt iedere tick 5 kg goud van 2.500 ton gouderts, 500 vaten olie en 20.000 energie. Hij draait vanzelf zolang alles er is.",
  ],
  "GoldInfo-col": [
    "Goud",
    "Goud wordt in kluizen bewaard en levert € 30 miljoen per kg op. Je hebt het ook nodig voor de reactorbesturing.",
  ],
  "Diamond-col": [
    "Diamant",
    "Een diamantmijn kost geld en 200.000 ton staal. Hij levert 10 karaat ruwe diamant per tick voor 5.000 energie; het personeel eet 1 doos pasta per tick (het uraniumpersoneel gaat voor).",
  ],
  "DiamondCutter-col": [
    "Slijperij",
    "Een slijperij slijpt iedere tick 50 karaat ruwe diamant voor 25.000 energie. Daarvan wordt willekeurig 50 tot 70% edelsteen en de rest industriële diamant. Af en toe vind je een topsteen, die meteen € 5 miljard oplevert.",
  ],
  "DiamondInfo-col": [
    "Diamanten",
    "Edelstenen leveren € 6 miljoen per karaat op, industriële diamant € 500.000. Beide liggen in diamantkluizen; iedere kluis heeft ruimte voor 50.000 karaat van elke soort.",
  ],
  "DiamondDrill-col": [
    "Diamantboren",
    "Een diamantboor koop je één keer per soort mijn, met industriële diamant. Alle mijnen van die soort maken daarna 50% meer voor dezelfde energie en pasta.",
  ],
  "ChipFactory-col": [
    "Chipfabriek",
    "Een chipfabriek maakt iedere tick 5 chips van 50 printplaten, 0,2 kg goud, 1 karaat industriële diamant en 50.000 energie. Hij draait vanzelf zolang alles er is. Met 0,05 industriële isotoop per tick maakt hij 25% meer chips.",
  ],
  "Chips-col": [
    "Chips",
    "Chips zijn € 20 miljoen per stuk waard. Je hebt ze nodig voor datacenterrekken (1.000 per rek) en fusiecentrales (2.000 per centrale), en ieder rek verbruikt 0,1 chip per tick.",
  ],
  "Datacenter-col": [
    "Datacenter",
    "Een rek gebruikt 250.000 energie en 0,1 chip per tick en levert daarvoor € 1 miljard en 0,1 AICoin. De opbrengst wordt iedere 10 ticks uitbetaald. Ieder rek is 5% duurder dan het vorige.",
  ],
  "IsotopeLab-col": [
    "Isotopenlab",
    "Een lab gebruikt iedere tick 20 ton uranium en 50.000 energie. Het maakt medische isotopen, die meteen aan ziekenhuizen worden verkocht voor € 250 miljoen per lab per tick (uitbetaald iedere 10 ticks), en 0,1 industriële isotoop. Ieder lab is 5% duurder dan het vorige.",
  ],
  "Isotopes-col": [
    "Industriële isotopen",
    "Industriële isotopen komen uit het isotopenlab. Een chipfabriek die er 0,05 per tick van krijgt, maakt 25% meer chips (materiaalinspectie). Ongebruikte isotopen vervallen: na 10 minuten (600 ticks) is de helft over, en wat niet in de opslag past, is meteen verloren. Verkopen levert € 100 miljoen per stuk op.",
  ],
  "AICoin-col": [
    "AICoin",
    "AICoin komt uit het datacenter. De koers verandert bij iedere prijswissel, met uitschieters naar boven en beneden. Verkoop als de koers hoog is, of bewaar ze.",
  ],
  "Fusion-col": [
    "Fusiecentrale",
    "Een fusiecentrale kost geld, chips en staal en levert 2.000.000 energie per tick zonder brandstof. Zorg voor genoeg energieopslag. Iedere centrale is 15% duurder dan de vorige.",
  ],
  "CopperInfo-col": [
    "Koper",
    "Koper wordt in loodsen opgeslagen en levert € 40.000 per ton op. Zijn de loodsen vol, dan stoppen de smelterijen tot er weer ruimte is.",
  ],
});

// Voeg aan iedere kaart met uitleg een "?"-knop en een (verborgen) uitlegblok toe
function initHelp() {
  Object.keys(helpTexts).forEach(function (cardId) {
    var card = document.getElementById(cardId);
    if (!card) return;
    var title = helpTexts[cardId][0];
    var panel = document.createElement("div");
    panel.className = "help help-ui";
    panel.id = "help-" + cardId;
    panel.hidden = true;
    panel.innerHTML = "<p>" + helpTexts[cardId][1] + "</p>";
    var button = document.createElement("button");
    button.type = "button";
    button.className = "help-toggle help-ui";
    button.textContent = "?";
    button.setAttribute("aria-label", "Uitleg over " + title);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", panel.id);
    button.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", String(!panel.hidden));
    });
    // Uitleg direct onder de kop van de kaart (of bovenaan als de kop later wordt opgebouwd)
    var heading = card.querySelector(":scope > h2");
    if (heading) heading.after(panel);
    else card.prepend(panel);
    card.prepend(button);
  });
}

// Bulk bouwen: +10 en Max bouwen één voor één met de gewone bouwfunctie, tot het
// aantal bereikt is of het niet meer lukt (geld, staal, locaties of ruimte op). Zo gelden alle
// gewone regels en oplopende prijzen.
var objBulk = {
  max: 1000, // veiligheidsgrens voor Max
  targets: {
    iron: [
      "ijzerertsmijnen",
      function () {
        return +objMines.ironAmountActive;
      },
      function () {
        objMines.addMine(1, 1);
      },
    ],
    coal: [
      "steenkoolmijnen",
      function () {
        return +objMines.coalAmountActive;
      },
      function () {
        objMines.addMine(2, 1);
      },
    ],
    uranium: [
      "uraniummijnen",
      function () {
        return +objMines.uraniumAmountActive;
      },
      function () {
        objMines.addMine(3, 1);
      },
    ],
    copper: [
      "kopermijnen",
      function () {
        return +objMines.copperAmountActive;
      },
      function () {
        objMines.addMine(4, 1);
      },
    ],
    coalPlant: [
      "kolencentrales",
      function () {
        return +objCoalPowerPlant.amount;
      },
      function () {
        objCoalPowerPlant.add();
      },
    ],
    nuclearPlant: [
      "kerncentrales",
      function () {
        return +objNuclearPowerPlant.amount;
      },
      function () {
        objNuclearPowerPlant.buildPlant();
      },
    ],
    reactor: [
      "kernreactoren",
      function () {
        return +objNuclearPowerPlant.reactors;
      },
      function () {
        objNuclearPowerPlant.buildReactor();
      },
    ],
    smelter: [
      "hoogovens",
      function () {
        return +objIronMelter.amount;
      },
      function () {
        objIronMelter.add(1);
      },
    ],
    copperSmelter: [
      "kopersmelterijen",
      function () {
        return +objCopperSmelter.amount;
      },
      function () {
        objCopperSmelter.add(1);
      },
    ],
    electronics: [
      "elektronicafabrieken",
      function () {
        return +objElectronics.amount;
      },
      function () {
        objElectronics.add(1);
      },
    ],
    solar: [
      "zonneparken",
      function () {
        return +objSolar.amount;
      },
      function () {
        objSolar.add();
      },
    ],
    gold: [
      "goudmijnen",
      function () {
        return +objMines.goldAmountActive;
      },
      function () {
        objMines.addMine(5, 1);
      },
    ],
    goldRefinery: [
      "goudraffinaderijen",
      function () {
        return +objGoldRefinery.amount;
      },
      function () {
        objGoldRefinery.add(1);
      },
    ],
    diamond: [
      "diamantmijnen",
      function () {
        return +objMines.diamondAmountActive;
      },
      function () {
        objMines.addMine(6, 1);
      },
    ],
    diamondCutter: [
      "slijperijen",
      function () {
        return +objDiamondCutter.amount;
      },
      function () {
        objDiamondCutter.add(1);
      },
    ],
    chipFactory: [
      "chipfabrieken",
      function () {
        return +objChipFactory.amount;
      },
      function () {
        objChipFactory.add(1);
      },
    ],
    isotopeLab: [
      "isotopenlabs",
      function () {
        return +objIsotopeLab.amount;
      },
      function () {
        objIsotopeLab.add();
      },
    ],
    datacenter: [
      "datacenterrekken",
      function () {
        return +objDatacenter.racks;
      },
      function () {
        objDatacenter.add();
      },
    ],
    fusion: [
      "fusiecentrales",
      function () {
        return +objFusion.amount;
      },
      function () {
        objFusion.add();
      },
    ],
    reactorControl: [
      "reactorbesturingen",
      function () {
        return +objNuclearPowerPlant.controlled;
      },
      function () {
        objNuclearPowerPlant.addControl();
      },
    ],
  },
  // Bouw er maximaal n; geeft het aantal gebouwde terug
  build: function (key, n) {
    var target = objBulk.targets[key];
    if (!target) return 0;
    var limit = Math.min(+n || 0, objBulk.max);
    var built = 0;
    for (var i = 0; i < limit; i++) {
      var before = target[1]();
      target[2]();
      if (target[1]() <= before) break;
      built++;
    }
    if (built > 1) {
      notificationOverlay(
        FixNumber(built) + " " + target[0] + " gebouwd",
        "Bulk bouwen",
        "fa-industry"
      );
    }
    return built;
  },
  // Knoppen +10 en Max achter een gewone bouwknop
  buttons: function (key) {
    return (
      " <button type='button' class='btn btn-primary btn-bulk' onClick='objBulk.build(\"" +
      key +
      "\", 10);' data-bulk='" +
      key +
      "-10' aria-label='Bouw 10 " +
      objBulk.targets[key][0] +
      "'>+10</button>" +
      " <button type='button' class='btn btn-primary btn-bulk' onClick='objBulk.build(\"" +
      key +
      "\", objBulk.max);' data-bulk='" +
      key +
      "-max' aria-label='Bouw zoveel mogelijk " +
      objBulk.targets[key][0] +
      "'>Max</button>"
    );
  },
  // Knoppen in de vaste HTML (kerncentrales): <span data-bulk-slot="...">
  init: function () {
    document.querySelectorAll("[data-bulk-slot]").forEach(function (slot) {
      slot.outerHTML = objBulk.buttons(slot.dataset.bulkSlot);
    });
  },
};

// Pauzeren per kaart: een energieverbruiker even stilzetten, bijvoorbeeld om stroom
// vrij te maken voor de opstart van kernenergie. Een gepauzeerde kaart gebruikt geen
// stroom en produceert niets automatisch; handmatige knoppen blijven werken.
var objPause = {
  cards: [
    "pomp-col",
    "farmland-automation",
    "WindmillController",
    "pasta-col",
    "platicFactory-col",
    "Coal-col",
    "Iron-col",
    "Uranium-col",
    "fuelRodFactory",
    "Copper-col",
    "CopperSmelter-col",
    "Electronics-col",
    "SteelProduction-col",
    "Prospecting-col",
    "Gold-col",
    "GoldRefinery-col",
    "Diamond-col",
    "DiamondCutter-col",
    "ChipFactory-col",
    "Datacenter-col",
    "IsotopeLab-col",
  ],
  paused: [],
  // Kaarten waarop pauzeren pas zin heeft als er iets automatisch draait
  relevant: {
    "SteelProduction-col": function () {
      return +objIronMelter.controlled > 0;
    },
    "Prospecting-col": function () {
      return +objScanner.amount > 0;
    },
  },
  is: function (cardId) {
    return objPause.paused.indexOf(cardId) !== -1;
  },
  // 0 als de kaart gepauzeerd is, anders 1 (voor de piekvraag)
  factor: function (cardId) {
    return objPause.is(cardId) ? 0 : 1;
  },
  toggle: function (cardId) {
    if (objPause.cards.indexOf(cardId) === -1) return;
    if (objPause.is(cardId)) {
      objPause.paused = objPause.paused.filter(function (id) {
        return id !== cardId;
      });
    } else {
      objPause.paused.push(cardId);
    }
    store.setItem("paused", JSON.stringify(objPause.paused));
    objPause.update(cardId);
    objEnergy.show();
    objFlows.updateActivity();
  },
  update: function (cardId) {
    var card = document.getElementById(cardId);
    var button = card && card.querySelector(":scope > .pause-toggle");
    if (!button) return;
    var paused = objPause.is(cardId);
    var title = helpTexts[cardId] ? helpTexts[cardId][0] : cardId;
    var relevant = objPause.relevant[cardId];
    button.hidden = !!relevant && !relevant() && !paused;
    card.classList.toggle("card-paused", paused);
    button.innerHTML = icon(paused ? "play" : "pause");
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute(
      "aria-label",
      (paused ? "Hervat " : "Pauzeer ") + title
    );
    button.title = paused ? "Hervat" : "Pauzeer";
  },
  init: function () {
    var saved = [];
    try {
      saved = JSON.parse(store.getItem("paused") || "[]");
    } catch (error) {
      saved = [];
    }
    objPause.paused = (Array.isArray(saved) ? saved : []).filter(function (id) {
      return objPause.cards.indexOf(id) !== -1;
    });
    objPause.cards.forEach(function (cardId) {
      var card = document.getElementById(cardId);
      if (!card) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "pause-toggle card-ui";
      button.addEventListener("click", function () {
        objPause.toggle(cardId);
      });
      card.classList.add("has-pause");
      card.prepend(button);
      objPause.update(cardId);
    });
  },
};

// Indeling van de kaarten: volgorde per rij en ingeklapte kaarten.
// Aanpassen kan alleen in de bewerkstand (Game opties > Indeling bewerken, alleen op desktop).
// Kaarten verplaatsen kan alleen binnen hun eigen rij, zodat de volgorde van vrijspelen intact blijft.
var objLayout = {
  editing: false,
  collapsed: [],
  collapsedRows: [],
  defaultOrder: {},
  dragging: null,
  canEdit: function () {
    return window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
  },
  cards: function () {
    return Object.keys(helpTexts)
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(function (card) {
        return card && card.parentElement.classList.contains("rows");
      });
  },
  rows: function () {
    return Array.from(document.querySelectorAll(".rows[id]"));
  },
  // Rijen die ingeklapt kunnen worden (de verkooptab heeft een eigen knop in het menu)
  collapsibleRows: function () {
    return objLayout.rows().filter(function (row) {
      return row.id !== "sellMenu";
    });
  },
  childIds: function (row) {
    return Array.from(row.children)
      .map(function (child) {
        return child.id;
      })
      .filter(Boolean);
  },
  // Zet de kaarten van een rij in de gegeven volgorde; onbekende kaarten komen achteraan
  applyOrder: function (row, ids) {
    var children = Array.from(row.children);
    var position = function (child) {
      var index = ids.indexOf(child.id);
      return index === -1 ? ids.length + children.indexOf(child) : index;
    };
    children
      .slice()
      .sort(function (a, b) {
        return position(a) - position(b);
      })
      .forEach(function (child) {
        row.appendChild(child);
      });
  },
  load: function () {
    try {
      var saved = JSON.parse(store.getItem("layout") || "{}") || {};
      return {
        order:
          saved.order && typeof saved.order === "object" ? saved.order : {},
        collapsed: Array.isArray(saved.collapsed) ? saved.collapsed : [],
        rows: Array.isArray(saved.rows) ? saved.rows : [],
      };
    } catch (error) {
      return { order: {}, collapsed: [], rows: [] };
    }
  },
  save: function () {
    var order = {};
    objLayout.rows().forEach(function (row) {
      order[row.id] = objLayout.childIds(row);
    });
    store.setItem(
      "layout",
      JSON.stringify({
        order: order,
        collapsed: objLayout.collapsed,
        rows: objLayout.collapsedRows,
      })
    );
    objFlows.schedule();
  },
  setCollapsed: function (card, collapsed) {
    card.classList.toggle("card-collapsed", collapsed);
    var button = card.querySelector(".collapse-toggle");
    var title = helpTexts[card.id][0];
    button.innerHTML = icon(collapsed ? "chevron-down" : "chevron-up");
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute(
      "aria-label",
      collapsed ? "Klap " + title + " uit" : "Klap " + title + " in"
    );
  },
  toggleCollapse: function (cardId) {
    if (!objLayout.editing) return;
    var card = document.getElementById(cardId);
    var collapsed = !card.classList.contains("card-collapsed");
    objLayout.collapsed = objLayout.collapsed.filter(function (id) {
      return id !== cardId;
    });
    if (collapsed) objLayout.collapsed.push(cardId);
    objLayout.setCollapsed(card, collapsed);
    objLayout.save();
    Display.updateRows();
  },
  // Namen van de zichtbare kaarten in een rij, voor de ingeklapte rij en de knop
  rowTitles: function (row) {
    return Array.from(row.children)
      .filter(function (child) {
        return (
          helpTexts[child.id] &&
          child.style.display !== "none" &&
          !child.classList.contains("col-empty")
        );
      })
      .map(function (child) {
        return helpTexts[child.id][0];
      });
  },
  updateRowLabel: function (row) {
    var button = row.querySelector(":scope > .row-toggle");
    if (!button) return;
    var collapsed = row.classList.contains("row-collapsed");
    var titles = objLayout.rowTitles(row);
    var label =
      (collapsed ? "Klap rij uit: " : "Klap rij in: ") + titles.join(", ");
    if (button.getAttribute("aria-label") !== label) {
      button.setAttribute("aria-label", label);
      button.title = collapsed ? "Rij uitklappen" : "Rij inklappen";
      row.querySelector(":scope > .row-summary").textContent =
        titles.join(" · ");
    }
  },
  setRowCollapsed: function (row, collapsed) {
    row.classList.toggle("row-collapsed", collapsed);
    var button = row.querySelector(":scope > .row-toggle");
    button.textContent = collapsed ? "+" : "\u2212";
    button.setAttribute("aria-expanded", String(!collapsed));
    objLayout.updateRowLabel(row);
  },
  // Rij in- of uitklappen; werkt los van de bewerkstand, op desktop en op mobiel
  toggleRow: function (rowId) {
    var row = document.getElementById(rowId);
    var collapsed = !row.classList.contains("row-collapsed");
    objLayout.collapsedRows = objLayout.collapsedRows.filter(function (id) {
      return id !== rowId;
    });
    if (collapsed) objLayout.collapsedRows.push(rowId);
    objLayout.setRowCollapsed(row, collapsed);
    objLayout.save();
  },
  addRowTools: function (row) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "row-toggle row-ui";
    var summary = document.createElement("button");
    summary.type = "button";
    summary.className = "row-summary row-ui";
    summary.tabIndex = -1;
    row.prepend(summary);
    row.prepend(button);
    [button, summary].forEach(function (el) {
      el.addEventListener("click", function () {
        objLayout.toggleRow(row.id);
      });
    });
  },
  // Schuif een kaart één zichtbare plek naar links (-1) of rechts (+1) binnen zijn rij
  move: function (cardId, direction) {
    if (!objLayout.editing) return;
    var card = document.getElementById(cardId);
    var sibling = card;
    do {
      sibling =
        direction < 0
          ? sibling.previousElementSibling
          : sibling.nextElementSibling;
    } while (sibling && !sibling.checkVisibility());
    if (!sibling) return;
    if (direction < 0) card.parentElement.insertBefore(card, sibling);
    else card.parentElement.insertBefore(sibling, card);
    objLayout.save();
  },
  reset: function () {
    objLayout.rows().forEach(function (row) {
      objLayout.applyOrder(row, objLayout.defaultOrder[row.id] || []);
    });
    objLayout.collapsed = [];
    objLayout.cards().forEach(function (card) {
      objLayout.setCollapsed(card, false);
    });
    objLayout.collapsedRows = [];
    objLayout.collapsibleRows().forEach(function (row) {
      objLayout.setRowCollapsed(row, false);
    });
    store.removeItem("layout");
    Display.updateRows();
  },
  toggleEdit: function () {
    if (!objLayout.editing && !objLayout.canEdit()) return;
    objLayout.editing = !objLayout.editing;
    document.body.classList.toggle("edit-mode", objLayout.editing);
    document.getElementById("editBar").hidden = !objLayout.editing;
    objLayout.cards().forEach(function (card) {
      card.draggable = objLayout.editing;
    });
    document.getElementById("editLayoutBTN").innerHTML =
      icon(objLayout.editing ? "check-square" : "square") +
      " Indeling bewerken";
  },
  // Balk met sleepgreep, pijlen en inklapknop, plus de titel die een ingeklapte kaart toont
  addTools: function (card) {
    var title = helpTexts[card.id][0];
    var tools = document.createElement("div");
    tools.className = "card-tools card-ui";
    tools.innerHTML =
      '<span class="drag-handle" title="Sleep om te verplaatsen">' +
      icon("grip-vertical") +
      "</span>" +
      '<button type="button" class="tool-button" data-move="-1" aria-label="' +
      title +
      ' naar links">' +
      icon("arrow-left") +
      "</button>" +
      '<button type="button" class="tool-button" data-move="1" aria-label="' +
      title +
      ' naar rechts">' +
      icon("arrow-right") +
      "</button>" +
      '<button type="button" class="tool-button collapse-toggle"></button>';
    var collapsedTitle = document.createElement("div");
    collapsedTitle.className = "collapsed-title card-ui";
    collapsedTitle.innerHTML =
      "<h2>" + title + '</h2><span class="hint">ingeklapt</span>';
    card.prepend(collapsedTitle);
    card.prepend(tools);
    tools.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.move) objLayout.move(card.id, +button.dataset.move);
      else objLayout.toggleCollapse(card.id);
    });
  },
  initDragAndDrop: function () {
    var sameRow = function (target) {
      return (
        objLayout.dragging &&
        target &&
        target !== objLayout.dragging &&
        target.parentElement === objLayout.dragging.parentElement
      );
    };
    var cardOf = function (element) {
      return element.closest && element.closest(".rows > [id]");
    };
    document.addEventListener("dragstart", function (event) {
      var card = cardOf(event.target);
      if (!objLayout.editing || !card || !card.draggable) return;
      objLayout.dragging = card;
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.id);
    });
    document.addEventListener("dragover", function (event) {
      var target = cardOf(event.target);
      document.querySelectorAll(".drop-target").forEach(function (el) {
        if (el !== target) el.classList.remove("drop-target");
      });
      if (!sameRow(target)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      target.classList.add("drop-target");
    });
    document.addEventListener("drop", function (event) {
      var target = cardOf(event.target);
      if (!sameRow(target)) return;
      event.preventDefault();
      var row = target.parentElement;
      var children = Array.from(row.children);
      if (children.indexOf(objLayout.dragging) < children.indexOf(target)) {
        row.insertBefore(objLayout.dragging, target.nextElementSibling);
      } else {
        row.insertBefore(objLayout.dragging, target);
      }
      objLayout.save();
    });
    document.addEventListener("dragend", function () {
      document
        .querySelectorAll(".dragging, .drop-target")
        .forEach(function (el) {
          el.classList.remove("dragging", "drop-target");
        });
      objLayout.dragging = null;
    });
  },
  init: function () {
    objLayout.rows().forEach(function (row) {
      objLayout.defaultOrder[row.id] = objLayout.childIds(row);
    });
    var saved = objLayout.load();
    objLayout.rows().forEach(function (row) {
      // Alleen kaarten die echt in deze rij horen; zo kan een save geen kaart naar een andere rij verplaatsen
      if (Array.isArray(saved.order[row.id])) {
        objLayout.applyOrder(row, saved.order[row.id]);
      }
    });
    objLayout.collapsed = saved.collapsed.filter(function (id) {
      return helpTexts[id] && document.getElementById(id);
    });
    objLayout.cards().forEach(function (card) {
      objLayout.addTools(card);
      objLayout.setCollapsed(card, objLayout.collapsed.indexOf(card.id) !== -1);
    });
    var rowIds = objLayout.collapsibleRows().map(function (row) {
      return row.id;
    });
    objLayout.collapsedRows = saved.rows.filter(function (id) {
      return rowIds.indexOf(id) !== -1;
    });
    objLayout.collapsibleRows().forEach(function (row) {
      objLayout.addRowTools(row);
      objLayout.setRowCollapsed(
        row,
        objLayout.collapsedRows.indexOf(row.id) !== -1
      );
    });
    objLayout.initDragAndDrop();

    // De optie staat alleen in het menu op desktop
    var media = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    var updateMenu = function () {
      document.getElementById("editLayoutBTN").style.display = media.matches
        ? ""
        : "none";
      if (!media.matches && objLayout.editing) objLayout.toggleEdit();
    };
    media.addEventListener("change", updateMenu);
    updateMenu();
  },
};

// Productieketen: gekleurde lijnen tussen de kaarten die laten zien waar grondstoffen heen gaan.
// Alleen op desktop. Lijnen lopen achter de kaarten; het looplicht beweegt alleen als een stroom actief is.
var objFlows = {
  enabled: true,
  pulses: {},
  groups: {},
  pending: false,
  // [van, naar, grondstof, actief]; handmatige acties gebruiken daarnaast pulse()
  edges: [
    // Landbouw
    [
      "landbouw-col",
      "grain-col",
      "graan",
      function () {
        return objFarmland.FarmTimer > 0;
      },
    ],
    [
      "farmland-automation",
      "grain-col",
      "graan",
      function () {
        return objFarmRobot.robotTimer > 0;
      },
    ],
    [
      "grain-col",
      "windmills-col",
      "graan",
      function () {
        return objWindmill.GrindTimer > 0;
      },
    ],
    [
      "grain-col",
      "WindmillController",
      "graan",
      function () {
        return objWindmill.autoGrindTimer > 0;
      },
    ],
    [
      "grain-col",
      "chicken-col",
      "graan",
      function () {
        return +objChicken.amount > 0;
      },
    ],
    [
      "windmills-col",
      "flour-col",
      "bloem",
      function () {
        return objWindmill.GrindTimer > 0;
      },
    ],
    [
      "WindmillController",
      "flour-col",
      "bloem",
      function () {
        return objWindmill.autoGrindTimer > 0;
      },
    ],
    [
      "flour-col",
      "pasta-col",
      "bloem",
      function () {
        return +objPastaHelper.amount > 0 && +objPastaFactory.amount > 0;
      },
    ],
    [
      "chicken-col",
      "pasta-col",
      "eieren",
      function () {
        return +objPastaHelper.amount > 0 && +objPastaFactory.amount > 0;
      },
    ],
    [
      "pasta-col",
      "platicFactory-col",
      "pasta",
      function () {
        return +objPlasticFactory.workers > 0;
      },
    ],
    [
      "pasta-col",
      "Uranium-col",
      "pasta",
      function () {
        return +objMines.uraniumAmountActive > 0;
      },
    ],
    // Olie en kunststof
    [
      "pomp-col",
      "olie-col",
      "olie",
      function () {
        return (
          (+objOilPump.amount > 0 || +objOilPumpAdv.amount > 0) &&
          +objEnergy.available > 0
        );
      },
    ],
    [
      "olie-col",
      "energieproductie-col",
      "olie",
      function () {
        return +objPowerPlant.amount > 0 && +objOilTank.contents > 0;
      },
    ],
    [
      "olie-col",
      "platicFactory-col",
      "olie",
      function () {
        return +objPlasticFactory.workers > 0 && +objPlasticFactory.amount > 0;
      },
    ],
    [
      "platicFactory-col",
      "plasticStorage-col",
      "kunststof",
      function () {
        return +objPlasticFactory.workers > 0 && +objPlasticFactory.amount > 0;
      },
    ],
    // Mijnbouw en staal
    [
      "Coal-col",
      "coalPower",
      "steenkool",
      function () {
        return +objCoalPowerPlant.amount > 0 && +objCoal.amount > 0;
      },
    ],
    [
      "Coal-col",
      "SteelProduction-col",
      "steenkool",
      function () {
        return false;
      },
    ],
    [
      "Iron-col",
      "SteelProduction-col",
      "ijzererts",
      function () {
        return false;
      },
    ],
    [
      "SteelProduction-col",
      "SteelInfo-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "pomp-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "fuelRodFactory",
      "staal",
      function () {
        return +objFuelCellFactory.activeFactories > 0;
      },
    ],
    [
      "SteelInfo-col",
      "nuclearPower",
      "staal",
      function () {
        return false;
      },
    ],
    // Kernenergie
    [
      "Uranium-col",
      "fuelRodFactory",
      "uranium",
      function () {
        return +objFuelCellFactory.activeFactories > 0;
      },
    ],
    [
      "fuelRodFactory",
      "fuelRodStorage",
      "splijtstof",
      function () {
        return +objFuelCellFactory.activeFactories > 0;
      },
    ],
    [
      "fuelRodStorage",
      "nuclearPower",
      "splijtstof",
      function () {
        return +objNuclearPowerPlant.activeReactors > 0;
      },
    ],
    [
      "nuclearPower",
      "fuelRodStorage",
      "afval",
      function () {
        return +objNuclearPowerPlant.activeReactors > 0;
      },
    ],
    // Energie naar de Energie-kaart
    [
      "energieproductie-col",
      "energy-col",
      "energie",
      function () {
        return +objPowerPlant.amount > 0 && +objOilTank.contents > 0;
      },
    ],
    [
      "coalPower",
      "energy-col",
      "energie",
      function () {
        return +objCoalPowerPlant.amount > 0 && +objCoal.amount > 0;
      },
    ],
    [
      "nuclearPower",
      "energy-col",
      "energie",
      function () {
        return +objNuclearPowerPlant.activeReactors > 0;
      },
    ],
    // Markt
    [
      "marketEggs",
      "chicken-col",
      "eieren",
      function () {
        return false;
      },
    ],
    [
      "marketSteel",
      "SteelInfo-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "marketWasteFuel",
      "fuelRodStorage",
      "afval",
      function () {
        return false;
      },
    ],
  ],
  // Stromen vanaf level 12 (zie init)
  edges12: [
    [
      "Copper-col",
      "CopperSmelter-col",
      "koper",
      function () {
        return objCopperSmelter.active > 0;
      },
    ],
    [
      "Coal-col",
      "CopperSmelter-col",
      "steenkool",
      function () {
        return objCopperSmelter.active > 0;
      },
    ],
    [
      "CopperSmelter-col",
      "CopperInfo-col",
      "koper",
      function () {
        return objCopperSmelter.active > 0;
      },
    ],
    [
      "pasta-col",
      "Copper-col",
      "pasta",
      function () {
        return objCopperMine.activeMines > 0;
      },
    ],
    [
      "SteelInfo-col",
      "Copper-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "CopperSmelter-col",
      "staal",
      function () {
        return false;
      },
    ],
  ],
  // Stromen van level 13: elektronica, printplaten en zonneparken
  edges13: [
    [
      "CopperInfo-col",
      "Electronics-col",
      "koper",
      function () {
        return objElectronics.active > 0;
      },
    ],
    [
      "plasticStorage-col",
      "Electronics-col",
      "kunststof",
      function () {
        return objElectronics.active > 0;
      },
    ],
    [
      "Electronics-col",
      "PCB-col",
      "printplaten",
      function () {
        return objElectronics.active > 0;
      },
    ],
    [
      "PCB-col",
      "SteelProduction-col",
      "printplaten",
      function () {
        return false;
      },
    ],
    [
      "PCB-col",
      "Prospecting-col",
      "printplaten",
      function () {
        return false;
      },
    ],
    [
      "PCB-col",
      "solarPark",
      "printplaten",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "Electronics-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "solarPark",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "solarPark",
      "energy-col",
      "energie",
      function () {
        return +objSolar.amount > 0;
      },
    ],
  ],
  // Stromen van level 14: goud en de reactorbesturing
  edges14: [
    [
      "Gold-col",
      "GoldRefinery-col",
      "goud",
      function () {
        return objGoldRefinery.active > 0;
      },
    ],
    [
      "olie-col",
      "GoldRefinery-col",
      "olie",
      function () {
        return objGoldRefinery.active > 0;
      },
    ],
    [
      "GoldRefinery-col",
      "GoldInfo-col",
      "goud",
      function () {
        return objGoldRefinery.active > 0;
      },
    ],
    [
      "pasta-col",
      "Gold-col",
      "pasta",
      function () {
        return objGoldMine.activeMines > 0;
      },
    ],
    [
      "SteelInfo-col",
      "Gold-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "GoldRefinery-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "GoldInfo-col",
      "nuclearPower",
      "goud",
      function () {
        return false;
      },
    ],
    [
      "PCB-col",
      "nuclearPower",
      "printplaten",
      function () {
        return false;
      },
    ],
  ],
  // Stromen van level 15: diamant en diamantboren
  edges15: [
    [
      "Diamond-col",
      "DiamondCutter-col",
      "diamant",
      function () {
        return objDiamondCutter.active > 0;
      },
    ],
    [
      "DiamondCutter-col",
      "DiamondInfo-col",
      "diamant",
      function () {
        return objDiamondCutter.active > 0;
      },
    ],
    [
      "pasta-col",
      "Diamond-col",
      "pasta",
      function () {
        return objDiamondMine.activeMines > 0;
      },
    ],
    [
      "SteelInfo-col",
      "Diamond-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "DiamondCutter-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "DiamondInfo-col",
      "DiamondDrill-col",
      "diamant",
      function () {
        return false;
      },
    ],
  ],
  // Stromen van level 16: chips, datacenter, AICoin en fusie
  edges16: [
    [
      "PCB-col",
      "ChipFactory-col",
      "printplaten",
      function () {
        return objChipFactory.active > 0;
      },
    ],
    [
      "GoldInfo-col",
      "ChipFactory-col",
      "goud",
      function () {
        return objChipFactory.active > 0;
      },
    ],
    [
      "DiamondInfo-col",
      "ChipFactory-col",
      "diamant",
      function () {
        return objChipFactory.active > 0;
      },
    ],
    [
      "ChipFactory-col",
      "Chips-col",
      "chips",
      function () {
        return objChipFactory.active > 0;
      },
    ],
    [
      "Chips-col",
      "Datacenter-col",
      "chips",
      function () {
        return objDatacenter.active > 0;
      },
    ],
    [
      "Datacenter-col",
      "AICoin-col",
      "chips",
      function () {
        return objDatacenter.active > 0;
      },
    ],
    [
      "Fusion-col",
      "energy-col",
      "energie",
      function () {
        return +objFusion.amount > 0;
      },
    ],
    [
      "Chips-col",
      "Fusion-col",
      "chips",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "ChipFactory-col",
      "staal",
      function () {
        return false;
      },
    ],
    // Isotopenlab (#118): uranium wordt medische en industriële isotopen
    [
      "Uranium-col",
      "IsotopeLab-col",
      "uranium",
      function () {
        return objIsotopeLab.active > 0;
      },
    ],
    [
      "IsotopeLab-col",
      "Isotopes-col",
      "uranium",
      function () {
        return objIsotopeLab.active > 0;
      },
    ],
    [
      "Isotopes-col",
      "ChipFactory-col",
      "uranium",
      function () {
        return objChipFactory.inspected > 0;
      },
    ],
    [
      "SteelInfo-col",
      "IsotopeLab-col",
      "staal",
      function () {
        return false;
      },
    ],
    [
      "PCB-col",
      "IsotopeLab-col",
      "printplaten",
      function () {
        return false;
      },
    ],
    [
      "GoldInfo-col",
      "IsotopeLab-col",
      "goud",
      function () {
        return false;
      },
    ],
    [
      "SteelInfo-col",
      "Fusion-col",
      "staal",
      function () {
        return false;
      },
    ],
  ],
  // Energieverbruikers: benodigde energie per tick/run (0 = staat stil)
  energyUsers: {
    "pomp-col": function () {
      return +objOilPump.amount + +objOilPumpAdv.amount * +objOilPumpAdv.energy;
    },
    "farmland-automation": function () {
      return +objFarmRobot.robots * +objFarmRobot.robotEnergy;
    },
    WindmillController: function () {
      return (
        (+objWindmillController.amount * objWindmillController.energy) / 10
      );
    },
    "pasta-col": function () {
      return +objPastaFactory.amount * +objPastaFactory.energy;
    },
    "platicFactory-col": function () {
      return +objPlasticFactory.amount * +objPlasticFactory.energy;
    },
    "Coal-col": function () {
      return +objMines.coalAmountActive * +objCoalMine.energy;
    },
    "Iron-col": function () {
      return +objMines.ironAmountActive * +objIronMine.energy;
    },
    "Uranium-col": function () {
      return +objMines.uraniumAmountActive * +objUraniumMine.energy;
    },
    "SteelProduction-col": function () {
      return +objIronMelter.amount * +objIronMelter.energy;
    },
    fuelRodFactory: function () {
      return +objFuelCellFactory.amount * +objFuelCellFactory.energy;
    },
    "Copper-col": function () {
      return +objMines.copperAmountActive * objCopperMine.energy;
    },
    "CopperSmelter-col": function () {
      return +objCopperSmelter.amount * objCopperSmelter.energy;
    },
    "Electronics-col": function () {
      return +objElectronics.amount * objElectronics.energy;
    },
    "Gold-col": function () {
      return +objMines.goldAmountActive * objGoldMine.energy;
    },
    "GoldRefinery-col": function () {
      return +objGoldRefinery.amount * objGoldRefinery.energy;
    },
    "Diamond-col": function () {
      return +objMines.diamondAmountActive * objDiamondMine.energy;
    },
    "DiamondCutter-col": function () {
      return +objDiamondCutter.amount * objDiamondCutter.energy;
    },
    "ChipFactory-col": function () {
      return +objChipFactory.amount * objChipFactory.energy;
    },
    "Datacenter-col": function () {
      return +objDatacenter.racks * objDatacenter.energy;
    },
    "IsotopeLab-col": function () {
      return +objIsotopeLab.amount * objIsotopeLab.energy;
    },
  },
  key: function (edge) {
    return edge[0] + ">" + edge[1];
  },
  canShow: function () {
    return window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
  },
  isOn: function () {
    return objFlows.enabled && objFlows.canShow();
  },
  // Een eenmalige actie (bijvoorbeeld handmatig pasta maken) laat de stroom 3 seconden lopen
  pulse: function (from, to) {
    objFlows.pulses[from + ">" + to] = Date.now() + 3000;
    objFlows.updateActivity();
  },
  // Pad door de gegeven punten met afgeronde hoeken
  roundedPath: function (points, radius) {
    var d = "M" + points[0][0] + "," + points[0][1];
    for (var i = 1; i < points.length - 1; i++) {
      var prev = points[i - 1];
      var corner = points[i];
      var next = points[i + 1];
      var r = Math.min(
        radius,
        Math.hypot(corner[0] - prev[0], corner[1] - prev[1]) / 2,
        Math.hypot(next[0] - corner[0], next[1] - corner[1]) / 2
      );
      var towards = function (from, to) {
        var len = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
        return [
          from[0] + ((to[0] - from[0]) / len) * r,
          from[1] + ((to[1] - from[1]) / len) * r,
        ];
      };
      var a = towards(corner, prev);
      var b = towards(corner, next);
      d +=
        " L" +
        a[0] +
        "," +
        a[1] +
        " Q" +
        corner[0] +
        "," +
        corner[1] +
        " " +
        b[0] +
        "," +
        b[1];
    }
    var last = points[points.length - 1];
    return d + " L" + last[0] + "," + last[1];
  },
  pulseAll: function (pairs) {
    pairs.forEach(function (pair) {
      objFlows.pulses[pair[0] + ">" + pair[1]] = Date.now() + 3000;
    });
    objFlows.updateActivity();
  },
  // Tekenen bundelen tot één keer per frame
  schedule: function () {
    if (objFlows.pending) return;
    objFlows.pending = true;
    requestAnimationFrame(function () {
      objFlows.pending = false;
      objFlows.draw();
    });
  },
  svg: function (tag, attributes) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attributes || {}).forEach(function (name) {
      el.setAttribute(name, attributes[name]);
    });
    return el;
  },
  group: function (edge) {
    var key = objFlows.key(edge);
    if (!objFlows.groups[key]) {
      var g = objFlows.svg("g", {
        class: "flow flow-" + edge[2],
        "data-from": edge[0],
        "data-to": edge[1],
      });
      var title = objFlows.svg("title");
      title.textContent = helpTexts[edge[0]][0] + " → " + helpTexts[edge[1]][0];
      g.appendChild(title);
      g.appendChild(objFlows.svg("path", { class: "flow-base" }));
      g.appendChild(objFlows.svg("path", { class: "flow-run" }));
      g.appendChild(objFlows.svg("circle", { class: "flow-port", r: 4 }));
      g.appendChild(objFlows.svg("circle", { class: "flow-port", r: 4 }));
      document.getElementById("flowLayer").appendChild(g);
      objFlows.groups[key] = g;
    }
    return objFlows.groups[key];
  },
  draw: function () {
    var layer = document.getElementById("flowLayer");
    var on = objFlows.isOn();
    document.body.classList.toggle("flows-on", on);
    if (!on) {
      layer.style.display = "none";
      return;
    }
    layer.style.display = "";
    var container = document.getElementById("FirstTab");
    var origin = container.getBoundingClientRect();
    layer.setAttribute("width", container.scrollWidth);
    layer.setAttribute("height", container.scrollHeight);
    var rowStyle = getComputedStyle(document.querySelector(".rows"));
    var rowGap = parseFloat(rowStyle.rowGap) || 12;
    var colGap = parseFloat(rowStyle.columnGap) || 12;
    var rect = function (el) {
      var r = el.getBoundingClientRect();
      return {
        left: r.left - origin.left,
        right: r.right - origin.left,
        top: r.top - origin.top,
        bottom: r.bottom - origin.top,
        cx: (r.left + r.right) / 2 - origin.left,
        cy: (r.top + r.bottom) / 2 - origin.top,
      };
    };

    // Welke stromen zijn zichtbaar en via welke zijden lopen ze
    var routes = [];
    objFlows.edges.forEach(function (edge) {
      var from = document.getElementById(edge[0]);
      var to = document.getElementById(edge[1]);
      var g = objFlows.group(edge);
      if (!from || !to || !from.checkVisibility() || !to.checkVisibility()) {
        g.style.display = "none";
        return;
      }
      g.style.display = "";
      var a = rect(from);
      var b = rect(to);
      var route = { edge: edge, g: g, a: a, b: b };
      if (Math.abs(a.top - b.top) < 4) {
        route.kind = "side";
        route.fromSide = b.cx > a.cx ? "right" : "left";
        route.toSide = b.cx > a.cx ? "left" : "right";
      } else {
        route.kind = b.top >= a.bottom ? "down" : "up";
        route.fromSide = "bottom";
        route.toSide = "top";
      }
      routes.push(route);
    });

    // Poorten per kaartzijde verdelen, gesorteerd op de positie van de andere kaart
    var ports = {};
    var addPort = function (cardId, side, route, end, other) {
      var id = cardId + ":" + side;
      (ports[id] = ports[id] || []).push({
        route: route,
        end: end,
        other: other,
      });
    };
    routes.forEach(function (route) {
      addPort(route.edge[0], route.fromSide, route, "from", route.b);
      addPort(route.edge[1], route.toSide, route, "to", route.a);
    });
    Object.keys(ports).forEach(function (id) {
      var side = id.split(":")[1];
      var list = ports[id];
      var horizontal = side === "top" || side === "bottom";
      list.sort(function (p, q) {
        return horizontal ? p.other.cx - q.other.cx : p.other.cy - q.other.cy;
      });
      list.forEach(function (port, i) {
        var r = port.end === "from" ? port.route.a : port.route.b;
        var f = list.length === 1 ? 0.5 : 0.25 + (0.5 * i) / (list.length - 1);
        var point = horizontal
          ? {
              x: r.left + (r.right - r.left) * f,
              y: side === "top" ? r.top : r.bottom,
            }
          : {
              x: side === "left" ? r.left : r.right,
              y: r.top + 24 + (Math.min(r.bottom - r.top, 160) - 48) * f,
            };
        port.route[port.end] = point;
      });
    });

    // Lanes: lijnen die dezelfde goot of tussenruimte delen schuiven iets uit elkaar
    var lanes = {};
    var lane = function (axis, value) {
      var id = axis + Math.round(value);
      lanes[id] = (lanes[id] || 0) + 1;
      var n = lanes[id] - 1;
      return value + (n % 2 ? -1 : 1) * Math.ceil(n / 2) * 5;
    };
    routes.forEach(function (route) {
      var p = route.from;
      var q = route.to;
      var d;
      if (route.kind === "side") {
        var k = Math.max(20, Math.abs(q.x - p.x) / 2);
        var dir = q.x > p.x ? 1 : -1;
        d =
          "M" +
          p.x +
          "," +
          p.y +
          " C" +
          (p.x + dir * k) +
          "," +
          p.y +
          " " +
          (q.x - dir * k) +
          "," +
          q.y +
          " " +
          q.x +
          "," +
          q.y;
      } else if (route.kind === "down" && q.y - p.y <= rowGap + 2) {
        // Direct de volgende rij in: een vloeiende S-boog
        var kd = Math.max(12, (q.y - p.y) / 2);
        d =
          "M" +
          p.x +
          "," +
          p.y +
          " C" +
          p.x +
          "," +
          (p.y + kd) +
          " " +
          q.x +
          "," +
          (q.y - kd) +
          " " +
          q.x +
          "," +
          q.y;
      } else {
        // Verder weg (of omhoog): als metrolijn door de tussenruimtes en een goot tussen de kolommen
        var y1 = lane("y", p.y + rowGap / 2);
        var y2 = lane("y", q.y - rowGap / 2);
        var gx = lane(
          "x",
          route.b.cx > route.a.cx
            ? route.a.right + colGap / 2
            : route.a.left - colGap / 2
        );
        d = objFlows.roundedPath(
          [
            [p.x, p.y],
            [p.x, y1],
            [gx, y1],
            [gx, y2],
            [q.x, y2],
            [q.x, q.y],
          ],
          12
        );
      }
      var paths = route.g.querySelectorAll("path");
      paths[0].setAttribute("d", d);
      paths[1].setAttribute("d", d);
      var circles = route.g.querySelectorAll("circle");
      circles[0].setAttribute("cx", p.x);
      circles[0].setAttribute("cy", p.y);
      circles[1].setAttribute("cx", q.x);
      circles[1].setAttribute("cy", q.y);
    });
    objFlows.updateActivity();
  },
  updateActivity: function () {
    var now = Date.now();
    objFlows.edges.forEach(function (edge) {
      var g = objFlows.groups[objFlows.key(edge)];
      if (!g) return;
      var active = false;
      try {
        active = edge[3]() || (objFlows.pulses[objFlows.key(edge)] || 0) > now;
      } catch (error) {
        active = false;
      }
      g.classList.toggle("active", active);
    });
    Object.keys(objFlows.energyUsers).forEach(function (cardId) {
      var port = document.querySelector("#" + cardId + " > .energy-port");
      if (!port) return;
      var paused = objPause.is(cardId);
      var need = paused ? 0 : +objFlows.energyUsers[cardId]() || 0;
      port.classList.toggle("active", need > 0);
      port.classList.toggle(
        "shortage",
        need > 0 && +objEnergy.available < need
      );
      port.title = paused
        ? "Gepauzeerd"
        : need > 0
        ? +objEnergy.available < need
          ? "Te weinig energie"
          : "Gebruikt energie"
        : "Gebruikt energie (staat stil)";
    });
  },
  setFocus: function (cardId) {
    var layer = document.getElementById("flowLayer");
    layer.classList.toggle("has-focus", !!cardId);
    Object.keys(objFlows.groups).forEach(function (key) {
      var g = objFlows.groups[key];
      g.classList.toggle(
        "focus",
        !!cardId && (g.dataset.from === cardId || g.dataset.to === cardId)
      );
    });
  },
  toggle: function () {
    objFlows.enabled = !objFlows.enabled;
    store.setItem("showFlows", objFlows.enabled ? 1 : 0);
    objFlows.showMenu();
    objFlows.schedule();
  },
  showMenu: function () {
    var button = document.getElementById("flowsBTN");
    button.innerHTML =
      icon(objFlows.enabled ? "check-square" : "square") +
      " Productieketen tonen";
    button.style.display = objFlows.canShow() ? "" : "none";
  },
  init: function () {
    objFlows.edges = objFlows.edges.concat(
      objFlows.edges12,
      objFlows.edges13,
      objFlows.edges14,
      objFlows.edges15,
      objFlows.edges16
    );
    objFlows.enabled = store.getItem("showFlows") !== "0";
    // Bliksempoortjes op energieverbruikers
    Object.keys(objFlows.energyUsers).forEach(function (cardId) {
      var card = document.getElementById(cardId);
      if (!card) return;
      var port = document.createElement("span");
      port.className = "energy-port card-ui";
      port.innerHTML = icon("bolt");
      card.prepend(port);
    });
    // Aanwijzen of focus op een kaart licht haar stromen op
    var cardOf = function (el) {
      return el.closest && el.closest(".rows > [id]");
    };
    var container = document.getElementById("FirstTab");
    ["mouseover", "focusin"].forEach(function (type) {
      container.addEventListener(type, function (event) {
        var card = cardOf(event.target);
        objFlows.setFocus(card ? card.id : null);
      });
    });
    ["mouseleave", "focusout"].forEach(function (type) {
      container.addEventListener(type, function () {
        objFlows.setFocus(null);
      });
    });
    // Opnieuw tekenen als kaarten van grootte of plek veranderen
    var observer = new ResizeObserver(objFlows.schedule);
    observer.observe(container);
    document.querySelectorAll(".rows > [id]").forEach(function (card) {
      observer.observe(card);
    });
    window
      .matchMedia("(min-width: 1024px) and (pointer: fine)")
      .addEventListener("change", function () {
        objFlows.showMenu();
        objFlows.schedule();
      });
    objFlows.showMenu();
    objFlows.schedule();
  },
};

// Functie voor het goed weergeven van bedragen
function FixMoney(InputMoney, full) {
  InputMoney = parseFloat(+InputMoney);
  if (!full && shortNumbers && Math.abs(InputMoney) >= 1e6)
    return FixShort(InputMoney, true);
  return InputMoney.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
}

// Functie voor het goed weergeven van hoeveelheden
function FixNumber(InputNumber, full) {
  InputNumber = parseFloat(+InputNumber);
  if (!full && shortNumbers && Math.abs(InputNumber) >= 1e6)
    return FixShort(InputNumber);
  return InputNumber.toLocaleString("nl-NL");
}

// Hoeveelheid met eenheid, bijvoorbeeld FixUnit(1500, "kg") -> "1.500 kg"
function FixUnit(InputNumber, unit) {
  return FixNumber(InputNumber) + " " + unit;
}

// Waarde in de bovenbalk als "Label: voorraad/capaciteit", met de volledige getallen als tooltip
function renderTop(id, label, amount, capacity) {
  var el = document.getElementById(id);
  el.innerHTML =
    label +
    ": <kbd2>" +
    FixNumber(amount) +
    "/" +
    FixNumber(capacity) +
    "</kbd2>";
  el.title = FixNumber(amount, true) + " / " + FixNumber(capacity, true);
}

// Compacte lijst met waardes: renderStats([["Voorraad", "1.500 kg"], ...]).
// Lege regels (null/false) worden overgeslagen.
function renderStats(rows) {
  return (
    '<dl class="stats-list">' +
    rows
      .filter(Boolean)
      .map(function (row) {
        // Gewone tekst als tooltip, voor als de omschrijving wordt afgekapt (#133)
        var title = /[<>"]/.test(row[0]) ? "" : ' title="' + row[0] + '"';
        return "<dt" + title + ">" + row[0] + "</dt><dd>" + row[1] + "</dd>";
      })
      .join("") +
    "</dl>"
  );
}

// Voorraadwaarde met een kleur naar hoe vol de opslag is: groen als hij leeg is,
// oranje half vol en rood vol.
function renderStock(valueText, percentage) {
  var p = Math.round(Math.max(0, Math.min(100, +percentage || 0)));
  var color =
    p <= 50
      ? "color-mix(in oklch, var(--stock-mid) " +
        p * 2 +
        "%, var(--stock-empty))"
      : "color-mix(in oklch, var(--stock-full) " +
        (p - 50) * 2 +
        "%, var(--stock-mid))";
  return (
    '<span class="stock-level" style="color: ' +
    color +
    '" title="' +
    p +
    '% vol">' +
    valueText +
    "</span>"
  );
}

// Voorraadbalk met label en waarde boven de balk (percentage wordt begrensd op 0-100).
// progress = true voor een balk die geen voorraad is (zoals de voortgang naar het volgende level).
function renderBar(label, valueText, percentage, progress) {
  var width = Math.max(0, Math.min(100, +percentage || 0));
  return (
    '<div class="bar-label"><span>' +
    label +
    "</span><span>" +
    (progress ? valueText : renderStock(valueText, width)) +
    '</span></div><div class="progress"><div class="progress-bar" style="width:' +
    width +
    '%"></div></div>'
  );
}

// Instellingen van automatisch verkopen voor één product
function renderAutoSell(product, active, minimumPrice, currentPrice, locked) {
  return (
    "<h3>" +
    product +
    "</h3>" +
    renderStats([
      ["Status", locked || (active ? "Aan" : "Uit")],
      ["Verkopen vanaf", FixMoney(+minimumPrice)],
      ["Huidige prijs", currentPrice],
    ])
  );
}

// Voorraad, productie en opslag van een grondstof uit mijnen (steenkool, ijzererts, uranium)
function renderResource(o) {
  var capacity = +o.silos * +o.siloCap;
  var unit = o.unit || "ton";
  return (
    renderBar(
      "Voorraad",
      FixUnit(o.amount, unit),
      (+o.amount / capacity) * 100
    ) +
    renderStats([
      ["Productie", FixUnit(o.production, unit + " per " + o.period)],
      ["Energie", FixNumber(o.energy) + " per " + o.period],
      o.extra,
      ["Prijs per " + unit, FixMoney(o.price)],
      [
        o.siloLabel || "Silo's",
        FixNumber(o.silos) + " (" + FixUnit(capacity, unit) + ")",
      ],
      [
        "Prijs extra " + (o.siloLabel ? o.siloLabel.toLowerCase() : "silo"),
        FixMoney(o.siloPrice),
      ],
    ]) +
    renderHint(o.hint)
  );
}

// Driehoekje met de richting van een marktprijs sinds de vorige prijswissel (#122):
// groen omhoog, rood omlaag, geel gelijk. Zonder vorige prijs (net geladen) niets.
function renderTrend(current, previous) {
  if (previous == null) return "";
  var trend =
    +current > +previous
      ? ["up", "▲", "gestegen"]
      : +current < +previous
      ? ["down", "▼", "gedaald"]
      : ["same", "■", "gelijk"];
  return (
    ' <span class="trend trend-' +
    trend[0] +
    '" title="Prijs ' +
    trend[2] +
    '" aria-label="Prijs ' +
    trend[2] +
    '">' +
    trend[1] +
    "</span>"
  );
}

// Korte uitleg onder een lijst
function renderHint(text) {
  return '<p class="hint">' + text + "</p>";
}

// Functie van het goed weergeven van afgeronde gewichten
function AfrondenGewicht(InputGewicht) {
  var afgerond = Math.round(+InputGewicht * 100) / 100;
  return afgerond;
}

// Player object
var objPlayerInfo = {
  level: store.getItem("PlayerLevel") || 1,
  level_multiplier: [0, 5, 5, 5, 5, 4, 3, 4, 5, 5, 5, 5, 5, 5],
  nextlevel: store.getItem("NextLevel") || 3000,
  show: function () {
    document.getElementById("currentlevel").innerHTML = renderStats([
      ["Level", objPlayerInfo.level],
    ]);
    document.getElementById("nextlevel").innerHTML =
      renderStats([["Volgend level", FixMoney(objPlayerInfo.nextlevel)]]) +
      renderBar(
        "Voortgang",
        Math.floor(
          Math.min(100, (+objMoney.amount / +objPlayerInfo.nextlevel) * 100)
        ) + "%",
        (+objMoney.amount / +objPlayerInfo.nextlevel) * 100,
        true
      );
  },
  proceslevel: function (reason) {
    // Wanneer level hoger, bereken nieuw gelddoel voor next level
    if (reason === "levelup") {
      objPlayerInfo.nextlevel =
        +objPlayerInfo.nextlevel *
        this.level_multiplier[
          Math.min(objPlayerInfo.level, this.level_multiplier.length - 1)
        ];
      store.setItem("NextLevel", objPlayerInfo.nextlevel);
      // Kaartdelen die zelf naar het level kijken, direct bijwerken (anders pas na herladen):
      // pastahelpers (level 7) en high-tech oliepompen (level 10)
      objPastaHelper.show();
      objOilPumpAdv.show();
    }

    // Verkooptab is pas vanaf level 9 beschikbaar
    var elverkooptabBTN = document.getElementById("verkooptabBTN");
    elverkooptabBTN.disabled = +objPlayerInfo.level < 9;
    elverkooptabBTN.classList.toggle("disabled", +objPlayerInfo.level < 9);

    // Maak tabs zichtbaar op basis van level (gebruikmakende van Switch' fallthrough)
    switch (+objPlayerInfo.level) {
      default: // Hoger dan level 12

      case 12: // Level 12 behaald
        Display.show("market-row");

      case 11: // Level 11 behaald
        Display.show("nuclearFuel-row");

      case 10: // Level 10 behaald
        Display.show("Uranium-col");

      case 9: // Level 9 behaald
      // Verkooptab beschikbaar (zie hierboven)

      case 8: // Level 8 behaald
        Display.show([
          "MiningResearch-col",
          "mijnbouw-row",
          "mijnen-row",
          "mijnen-row2",
        ]);
        objResearch.show();

      case 7: // Level 7 behaald
        Display.show(["AutoSell-col", "plastic-row"]);

      case 6: // Level 6 behaald
        Display.show([
          "WindmillController",
          "chicken-col",
          "pasta-col",
          "Pastastock",
        ]);

      case 5: // Level 5 behaald
        Display.show("farmland-automation");

      case 4: // Level 4 behaald
        Display.show([
          "pomp-col",
          "energieproductie-col",
          "energy-col",
          "EnergyStats",
        ]);

      case 3: // Level 3 behaald
        Display.show(["graanopbrengst-col", "olie-col", "Oilstock", "OilTop"]);

      case 2: // Level 2 behaald
        Display.show(["flour-col", "windmills-col", "Flourstock", "FlourTop"]);

      case 1: // Level 1 behaald
        Display.show(["landbouw-col", "grain-col"]);
    }
  },
  levelup: function () {
    if (+objMoney.amount >= +objPlayerInfo.nextlevel) {
      +objPlayerInfo.level++;
      store.setItem("PlayerLevel", objPlayerInfo.level);
      objStats.levelup(objPlayerInfo.level);
      objPlayerInfo.proceslevel("levelup");
      notificationOverlay(
        "Levelup! je bent nu level: " + objPlayerInfo.level,
        "Level",
        "fa-arrow-circle-up"
      );
    }
    objPlayerInfo.show();
  },
  init: function () {
    objPlayerInfo.proceslevel("init");
    objPlayerInfo.show();
  },
};

// Money object
var objMoney = {
  amount: 1,
  add: function (moneyProfit, description, tt, amount) {
    moneyProfit = parseFloat(moneyProfit);
    objMoney.amount = +objMoney.amount + +moneyProfit;
    objMoney.show();
    objMoney.showUpdate(description, moneyProfit);
    made = +made + +moneyProfit;
    store.setItem("made", made);
    if (quickSell === 1) {
      quickSellMenu();
    }
  },
  use: function (moneyUsed) {
    moneyUsed = parseFloat(moneyUsed);
    objMoney.amount = +objMoney.amount - +moneyUsed;
    spend = +spend + +moneyUsed;
    store.setItem("spend", spend);
    objMoney.show();
  },
  show: function () {
    MoneyRound = Math.round(+objMoney.amount * 100) / 100;
    document.getElementById("MoneyAmount").innerHTML = renderStats([
      ["Vermogen", FixMoney(MoneyRound)],
    ]);
    document.getElementById("MoneyTop").innerHTML =
      "Vermogen: <kbd2>" + FixMoney(MoneyRound) + "</kbd2>";
    document.getElementById("MoneyTop").title = FixMoney(MoneyRound, true);
    store.setItem("Money", +MoneyRound);
  },
  showUpdate: function (description, moneyProfit) {
    profitRound = Math.round(+moneyProfit * 100) / 100;
    showHistory(description, FixMoney(profitRound));
  },
  init: function () {
    objMoney.amount = parseFloat(store.getItem("Money")) || 2000;
    objMoney.show();
  },
};

// placeholder object prijs
var objPrijslijst = {
  used_fuelrod: 0,
  steel: 0,
  eggs: 0,
  GrainLow: 0,
  FlourHigh: 0,
  FlourLow: 0,
  GrainHigh: 0,
  Pasta: 0,
  Coal: 0,
  Oil: 0,
};

// Willekeurig geheel getal tussen min en max (inclusief)
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Itemprijzen bepalen (voorheen centraal in de database)
function getPrice() {
  objPrijslijst.Oil = randomBetween(0, 20);
  objPrijslijst.GrainLow = randomBetween(1, 500);
  objPrijslijst.GrainHigh = randomBetween(1, 250);
  objPrijslijst.FlourLow = randomBetween(100, 900);
  objPrijslijst.FlourHigh = randomBetween(100, 450);
  objAICoin.newPrice();
  showMessage("Prijzen bepaald", JSON.stringify(objPrijslijst));
}

//Oil object
var objOil = {
  price: store.getItem("OilPrice") || 10,
  tempUsage: 0,
  sellOil: function () {
    var amount = +objOilTank.contents - +objPowerPlant.amount * 5;
    if (+amount <= 0) {
      return 0;
    }
    var Profit =
      +objOilTank.use(parseInt(amount), "Handmatige verkoop Olie") *
      +objOil.price;
    var text = "Verkoop Olie";
    objMoney.add(Profit, text, 1, amount);
  },
  sellRest: function (Rest) {
    var Profit = +Rest * (+objOil.price * 0.8);
    var text = "Verkoop Olie Restant";
    objMoney.add(Profit, text, 1, Rest);
    objOilTank.show();
  },
  produceOil: function () {
    if (objPause.is("pomp-col")) return 0;
    if (objOilPump.amount > 0) {
      if (+objEnergy.available >= objOilPump.amount) {
        objEnergy.use(+objOilPump.amount, "Oliepomp");
        objOilTank.fill(objStats.count("olie", +objOilPump.amount));
      } else {
        var activePumps = +objEnergy.available;
        objEnergy.use(+activePumps, "Oliepomp");
        objOilTank.fill(objStats.count("olie", +activePumps));
      }
    }
    if (objOilPumpAdv.amount > 0) {
      objOilTank.fill(objStats.count("olie", objOilPumpAdv.produce()));
    }
    objEnergy.show();
  },
  previous: null, // prijs voor de vorige wissel, voor de trendpijl (#122)
  priceCalc: function () {
    objOil.previous = +objOil.price;
    objOil.price = +objPrijslijst.Oil;
    store.setItem("OilPrice", objOil.price);
  },
  init: function () {
    objOil.price = store.getItem("OilPrice") || 10;
  },
};

// FarmRobot object
var objFarmRobot = {
  robots: 0,
  robotCost: 5000,
  robotEnergy: 15,
  robotCap: 10,
  robotTimer: 0,
  activeRobots: 0,
  activeFields: 0,
  // Een robot bewerkt 10 velden: zoveel robots zijn er nodig voor alle velden
  needed: function () {
    return Math.ceil(+objFarmland.amount / +objFarmRobot.robotCap);
  },
  add: function () {
    if (+objFarmRobot.robots >= objFarmRobot.needed()) {
      notificationOverlay(
        "Je robots bewerken al al je velden. Koop eerst extra landbouwgrond.",
        "Farmrobot",
        "fa-info"
      );
      return 0;
    }
    if (+objMoney.amount >= +objFarmRobot.robotCost) {
      objMoney.use(objFarmRobot.robotCost);
      objFarmRobot.robots = +objFarmRobot.robots + 1;
      if (+objFarmRobot.robotCap * +objFarmRobot.robots >= objFarmland.amount) {
        objFarmland.automatedAmount = objFarmland.amount;
      } else {
        objFarmland.automatedAmount =
          +objFarmRobot.robotCap * +objFarmRobot.robots;
      }
      store.setItem("FarmRobots", objFarmRobot.robots);
      store.setItem("AutomatedFarms", objFarmland.automatedAmount);
      objFarmRobot.show();
      if (objFarmRobot.robots === 1) {
        objFarmRobot.work();
      }
      objEnergy.show();
    } else {
      notificationOverlay("Niet genoeg doekoe!", "Farmrobot", "fa-euro-sign");
    }
  },
  sell: function () {
    if (+objFarmRobot.robots > 0) {
      objMoney.add(+objFarmRobot.robotCost * 0.75, "Verkoop farmrobot", 2, 1);
      objFarmRobot.robots = +objFarmRobot.robots - 1;
      if (+objFarmRobot.robotCap * +objFarmRobot.robots >= objFarmland.amount) {
        objFarmland.automatedAmount = objFarmland.amount;
      } else {
        objFarmland.automatedAmount =
          +objFarmRobot.robotCap * +objFarmRobot.robots;
      }
      store.setItem("FarmRobots", objFarmRobot.robots);
      store.setItem("AutomatedFarms", objFarmland.automatedAmount);
      objFarmRobot.show();
      objEnergy.show();
    }
  },
  timerCountdown: function () {
    document.getElementById("RobotTimer").innerHTML =
      "Oogst klaar over " + objFarmRobot.robotTimer + " seconden";
  },
  work: function () {
    if (+objFarmRobot.robots === 0) return 0;
    if (objPause.is("farmland-automation")) {
      objFarmRobot.activeRobots = 0;
      return 0;
    }
    let tempEnergy = objEnergy.available;
    objFarmRobot.activeRobots = Math.floor(
      tempEnergy / objFarmRobot.robotEnergy
    );
    // Niet meer robots laten draaien (en energie laten gebruiken) dan er velden zijn
    objFarmRobot.activeRobots = Math.min(
      objFarmRobot.activeRobots,
      +objFarmRobot.robots,
      objFarmRobot.needed()
    );
    if (objFarmRobot.activeRobots === 0) return 0;
    let robotEnergyUsage = objFarmRobot.activeRobots * objFarmRobot.robotEnergy;
    objEnergy.use(robotEnergyUsage, "Farmrobot");
    if (
      objFarmRobot.activeRobots * objFarmRobot.robotCap >
      objFarmland.amount
    ) {
      objFarmRobot.activeFields = objFarmland.amount;
    } else {
      objFarmRobot.activeFields =
        objFarmRobot.activeRobots * objFarmRobot.robotCap;
    }

    objFarmRobot.robotTimer = 10;
  },
  work_loop: function () {
    objFarmRobot.robotTimer--;
    objFarmRobot.timerCountdown();
    if (objFarmRobot.robotTimer < 1) {
      //nog rekening houden met max aan de hand van aanwezige velden.
      var production = objFarmRobot.activeFields * +objFarmland.harvest;
      objGrainSilo.fill(objStats.count("graan", production));
      objGrainSilo.show();
      objFarmRobot.work();
    }
  },
  show: function () {
    var working = Math.min(+objFarmRobot.robots, objFarmRobot.needed());
    var fields = Math.min(
      working * +objFarmRobot.robotCap,
      +objFarmland.amount
    );
    objFarmland.showHarvest();
    document.getElementById("ShowFarmRobot").innerHTML = renderStats([
      ["Robots", FixNumber(objFarmRobot.robots)],
      ["Velden bewerkt", FixNumber(fields)],
      [
        "Opbrengst per run",
        FixUnit(AfrondenGewicht(+objFarmland.harvest * fields), "kg"),
      ],
      ["Energie per run", FixNumber(working * +objFarmRobot.robotEnergy)],
    ]);
    document.getElementById("buyFarmRobot").disabled =
      +objFarmRobot.robots >= objFarmRobot.needed();
    document.getElementById("FarmRobotPrice").innerHTML = renderStats([
      ["Prijs per robot", FixMoney(objFarmRobot.robotCost)],
      ["Verkoopwaarde", FixMoney(+objFarmRobot.robotCost * 0.75)],
    ]);
    objFarmland.manualFarm();
  },
  init: function () {
    objFarmRobot.robots = parseInt(store.getItem("FarmRobots")) || 0;
    objFarmRobot.show();
    if (+objFarmRobot.robotCap * +objFarmRobot.robots >= objFarmland.amount) {
      objFarmland.automatedAmount = objFarmland.amount;
    } else {
      objFarmland.automatedAmount =
        +objFarmRobot.robotCap * +objFarmRobot.robots;
    }
    objFarmland.manualFarm();
    if (+objFarmRobot.robots >= 1) objFarmRobot.work();
  },
};

// Grain Silo
var objGrainSilo = {
  amount: 1,
  cap: 5000,
  price: 2000,
  contents: 0,
  add: function () {
    if (+objMoney.amount > +objGrainSilo.price) {
      objMoney.use(objGrainSilo.price);
      objGrainSilo.amount++;
      objGrainSilo.price *= 1.01;
      objGrainSilo.price = Math.round(objGrainSilo.price * 100) / 100;
      store.setItem("GrainSiloAmount", objGrainSilo.amount);
      store.setItem("GrainSiloPrice", objGrainSilo.price);
      objGrainSilo.show();
    }
  },
  fill: function (InputAmount) {
    var neededFarms =
      +objChickenFarm.amount * +objChickenFarm.grainSiloCap -
      +objChickenFarm.grainReserve;
    if (neededFarms > InputAmount) {
      objChickenFarm.grain(+InputAmount, "in");
      return 0;
    }
    objChickenFarm.grain(+neededFarms, "in");
    InputAmount = +InputAmount - +neededFarms;
    InputAmount = Math.round(InputAmount * 100) / 100;
    var SpaceLeft =
      +objGrainSilo.amount * +objGrainSilo.cap - +objGrainSilo.contents;
    if (+InputAmount > +SpaceLeft) {
      objGrainSilo.contents = +objGrainSilo.contents + +SpaceLeft;
      var Rest = +InputAmount - +SpaceLeft;
      objGrain.sellRest(Rest);
    } else {
      objGrainSilo.contents = +objGrainSilo.contents + +InputAmount;
    }
    objGrainSilo.show();
  },
  use: function (amount) {
    if (+amount > +objGrainSilo.contents) {
      amount = +objGrainSilo.contents;
    }
    objGrainSilo.contents = +objGrainSilo.contents - +amount;
    objGrainSilo.show();
    return +amount;
  },
  visual: function () {
    var percentageFilled =
      (+objGrainSilo.contents / (+objGrainSilo.amount * +objGrainSilo.cap)) *
      100;
    percentageFilled = Math.round(percentageFilled * 100) / 100;
    document.getElementById("Grainstock").innerHTML = renderBar(
      "Graan",
      FixUnit(objGrainSilo.contents, "kg"),
      percentageFilled
    );
  },
  show: function () {
    objGrainSilo.contents = Math.round(+objGrainSilo.contents * 100) / 100;
    var TempCap =
      +objGrainSilo.amount * +objGrainSilo.cap - +objGrainSilo.contents;
    document.getElementById("GrainSilo").innerHTML =
      renderStats([
        ["Silo's", FixNumber(objGrainSilo.amount)],
        ["Vrije ruimte", FixUnit(TempCap, "kg")],
      ]) +
      renderHint("Wat niet past wordt verkocht voor 20% van de marktprijs.");
    document.getElementById("GrainAmount").innerHTML = renderStats([
      [
        "Voorraad",
        renderStock(
          FixUnit(objGrainSilo.contents, "kg"),
          (+objGrainSilo.contents /
            (+objGrainSilo.amount * +objGrainSilo.cap)) *
            100
        ),
      ],
    ]);
    store.setItem("GrainSiloContents", objGrainSilo.contents);
    document.getElementById("GrainSiloPrice").innerHTML = renderStats([
      ["Prijs per silo", FixMoney(objGrainSilo.price)],
      ["Capaciteit per silo", FixUnit(objGrainSilo.cap, "kg")],
    ]);
    renderTop(
      "GrainTop",
      "Graan",
      objGrainSilo.contents,
      objGrainSilo.amount * objGrainSilo.cap
    );
    objGrainSilo.visual();
  },
  init: function () {
    objGrainSilo.amount = store.getItem("GrainSiloAmount") || 1;
    objGrainSilo.cap = store.getItem("GrainSiloCap") || 5000;
    objGrainSilo.price = store.getItem("GrainSiloPrice") || 2000;
    objGrainSilo.contents = store.getItem("GrainSiloContents") || 0;
    objGrainSilo.show();
  },
};

// Flour Silo
var objFlourSilo = {
  amount: 1,
  cap: 10000,
  contents: 0,
  price: 5000,
  add: function () {
    if (+objMoney.amount > +objFlourSilo.price) {
      objMoney.use(objFlourSilo.price);
      objFlourSilo.amount++;
      objFlourSilo.price *= 1.01;
      objFlourSilo.price = Math.round(objFlourSilo.price * 100) / 100;
      objFlourSilo.show();
      store.setItem("FlourSiloAmount", objFlourSilo.amount);
      store.setItem("FlourSiloPrice", objFlourSilo.price);
    }
  },
  fill: function (InputAmount) {
    var SpaceLeft =
      +objFlourSilo.amount * +objFlourSilo.cap - +objFlourSilo.contents;
    if (+InputAmount > +SpaceLeft) {
      objFlourSilo.contents = +objFlourSilo.contents + +SpaceLeft;
      var Rest = +InputAmount - +SpaceLeft;
      objFlour.sellRest(Rest);
    } else {
      objFlourSilo.contents = +objFlourSilo.contents + +InputAmount;
    }
    objFlourSilo.show();
  },
  use: function (amountUsed) {
    if (+amountUsed > objFlourSilo.contents) {
      amountUsed = +objFlourSilo.contents;
    }
    objFlourSilo.contents = +objFlourSilo.contents - +amountUsed;
    objFlourSilo.show();
    return amountUsed;
  },
  visual: function () {
    var percentageFilled =
      (+objFlourSilo.contents / (+objFlourSilo.amount * +objFlourSilo.cap)) *
      100;
    percentageFilled = Math.round(percentageFilled * 100) / 100;
    document.getElementById("Flourstock").innerHTML = renderBar(
      "Bloem",
      FixUnit(objFlourSilo.contents, "kg"),
      percentageFilled
    );
  },
  show: function () {
    document.getElementById("Flour").innerHTML = renderStats([
      [
        "Voorraad",
        renderStock(
          FixUnit(objFlourSilo.contents, "kg"),
          (+objFlourSilo.contents /
            (+objFlourSilo.amount * +objFlourSilo.cap)) *
            100
        ),
      ],
    ]);
    var TempCap =
      +objFlourSilo.amount * +objFlourSilo.cap - +objFlourSilo.contents;
    document.getElementById("FlourSilo").innerHTML =
      renderStats([
        ["Silo's", FixNumber(objFlourSilo.amount)],
        ["Vrije ruimte", FixUnit(TempCap, "kg")],
      ]) +
      renderHint("Wat niet past wordt verkocht voor 80% van de marktprijs.");
    store.setItem("FlourSiloContents", objFlourSilo.contents);
    document.getElementById("FlourSiloPrice").innerHTML = renderStats([
      ["Prijs per silo", FixMoney(objFlourSilo.price)],
      ["Capaciteit per silo", FixUnit(objFlourSilo.cap, "kg")],
    ]);
    renderTop(
      "FlourTop",
      "Bloem",
      objFlourSilo.contents,
      objFlourSilo.amount * objFlourSilo.cap
    );
    objFlourSilo.visual();
  },
  init: function () {
    objFlourSilo.amount = store.getItem("FlourSiloAmount") || 1;
    objFlourSilo.contents = store.getItem("FlourSiloContents") || 0;
    objFlourSilo.cap = store.getItem("FlourSiloCap") || 10000;
    objFlourSilo.price = store.getItem("FlourSiloPrice") || 5000;
    objFlourSilo.show();
  },
};

// Oil Tank
var objOilTank = {
  amount: 1,
  amountBig: 0,
  totalCap: 0,
  cap: 1000,
  contents: 0,
  price: 1000,
  priceBig: 1000000,
  capBig: 1000000,
  remove: function () {
    if (+objOilTank.amount == 1 && +objOilTank.amountBig == 0) {
      notificationOverlay(
        "Je hebt minimaal één olietank nodig!",
        "Olietanks",
        "fa-industry"
      );
      return 0;
    }
    if (+objOilTank.amount > 0) {
      // Alleen de olie die niet meer in de overige tanks past wordt weggespoeld
      var capAfterSale = +objOilTank.totalCap - +objOilTank.cap;
      if (+objOilTank.contents > +capAfterSale) {
        objOilTank.use(
          +objOilTank.contents - +capAfterSale,
          "Verkoop olietank"
        );
      }
      objOilTank.amount = +objOilTank.amount - 1;
      objMoney.add(+objOilTank.price * 0.5, "Verkoop olietank", 20, 1);
      objOilTank.price = +objOilTank.price / 1.01;
      store.setItem("OilTankPrice", objOilTank.price);
      store.setItem("OilTankAmount", objOilTank.amount);
      objOilTank.totalCap =
        +(+objOilTank.amount * +objOilTank.cap) +
        +(+objOilTank.amountBig * +objOilTank.capBig);
      store.setItem("OilTankCapTotal", objOilTank.totalCap);
      objOilTank.show();
    } else {
      notificationOverlay(
        "Geen tanks om te verkopen!",
        "Olietanks",
        "fa-industry"
      );
    }
  },
  add: function (type) {
    if (type == 0) {
      if (+objMoney.amount > +objOilTank.price) {
        objMoney.use(objOilTank.price);
        objOilTank.price = +objOilTank.price * 1.01;
        store.setItem("OilTankPrice", objOilTank.price);
        objOilTank.amount = +objOilTank.amount + 1;
        store.setItem("OilTankAmount", objOilTank.amount);
        objOilTank.totalCap =
          +(+objOilTank.amount * +objOilTank.cap) +
          +(+objOilTank.amountBig * +objOilTank.capBig);
        store.setItem("OilTankCapTotal", objOilTank.totalCap);
        objOilTank.show();
      } else {
        notificationOverlay("Niet genoeg doekoe!", "Olietank", "fa-euro-sign");
      }
    } else {
      if (+objMoney.amount > +objOilTank.priceBig) {
        objMoney.use(objOilTank.priceBig);
        objOilTank.priceBig = +objOilTank.priceBig * 1.01;
        store.setItem("OilTankPriceBig", objOilTank.priceBig);
        objOilTank.amountBig = +objOilTank.amountBig + 1;
        store.setItem("OilTankAmountBig", objOilTank.amountBig);
        objOilTank.totalCap =
          +(+objOilTank.amount * +objOilTank.cap) +
          +(+objOilTank.amountBig * +objOilTank.capBig);
        store.setItem("OilTankCapTotal", objOilTank.totalCap);
        objOilTank.show();
      } else {
        notificationOverlay("Niet genoeg doekoe!", "Olietank", "fa-euro-sign");
      }
    }
  },
  fill: function (InputAmount) {
    var SpaceLeft = +objOilTank.totalCap - +objOilTank.contents;
    if (+InputAmount > +SpaceLeft) {
      objOilTank.contents = +objOilTank.contents + +SpaceLeft;
      var Rest = +InputAmount - +SpaceLeft;
      objOil.sellRest(Rest);
    } else {
      objOilTank.contents = +objOilTank.contents + +InputAmount;
    }
    objOilTank.saveAmount();
    objOilTank.show();
  },
  use: function (used, reason) {
    if (+objOilTank.contents < +used) {
      var oilAvailabe = +objOilTank.contents;
      objOilTank.contents = +objOilTank.contents - +objOilTank.contents;
      objOilTank.saveAmount();
      objOilTank.show();
      return +oilAvailabe;
    } else {
      objOilTank.contents = parseInt(objOilTank.contents) - parseInt(used);
      objOilTank.saveAmount();
      objOilTank.show();
      return +used;
    }
  },
  saveAmount: function () {
    store.setItem("Oil", Math.round(objOilTank.contents * 100) / 100);
  },
  visual: function () {
    var percentageFilled = (+objOilTank.contents / +objOilTank.totalCap) * 100;
    percentageFilled = Math.round(percentageFilled * 100) / 100;
    document.getElementById("Oilstock").innerHTML = renderBar(
      "Olie",
      FixUnit(objOilTank.contents, "vaten"),
      percentageFilled
    );
  },
  show: function () {
    var TempCap = +objOilTank.totalCap - +objOilTank.contents;
    var bigTanks = +objPlayerInfo.level > 9;
    var onlyBig =
      bigTanks && +objOilTank.amount == 0 && +objOilTank.amountBig > 0;

    document.getElementById("oilTank").innerHTML =
      renderStats([
        ["Tanks", FixNumber(objOilTank.amount)],
        bigTanks && ["Grote tanks", FixNumber(objOilTank.amountBig)],
        ["Vrije ruimte", FixUnit(TempCap, "vaten")],
      ]) +
      renderHint("Wat niet past wordt verkocht voor 80% van de marktprijs.");
    document.getElementById("OilTankPrice").innerHTML =
      renderStats([
        ["Prijs per tank", FixMoney(objOilTank.price)],
        ["Capaciteit per tank", FixUnit(objOilTank.cap, "vaten")],
        bigTanks && ["Prijs grote tank", FixMoney(objOilTank.priceBig)],
        bigTanks && [
          "Capaciteit grote tank",
          FixUnit(objOilTank.capBig, "vaten"),
        ],
      ]) +
      renderHint(
        "Een tank verkopen levert 50% van de prijs op; olie die daarna niet meer past gaat verloren."
      );
    document.getElementById("oilTankBig").style.display = bigTanks
      ? ""
      : "none";
    document.getElementById("oilTankSmall").style.display = onlyBig
      ? "none"
      : "";

    document.getElementById("clickCount").innerHTML = renderStats([
      [
        "Voorraad",
        renderStock(
          FixUnit(objOilTank.contents, "vaten"),
          (+objOilTank.contents / +objOilTank.totalCap) * 100
        ),
      ],
    ]);

    renderTop("OilTop", "Olie", objOilTank.contents, objOilTank.totalCap);
    objOilTank.visual();
  },
  init: function () {
    objOilTank.contents = store.getItem("Oil") || 1;
    objOilTank.amount = store.getItem("OilTankAmount") || 1;
    objOilTank.cap = store.getItem("OilTankCap") || 1000;
    objOilTank.price = store.getItem("OilTankPrice") || 1000;
    objOilTank.priceBig = store.getItem("OilTankPriceBig") || 1000000;
    objOilTank.amountBig = store.getItem("OilTankAmountBig") || 0;
    objOilTank.totalCap =
      +objOilTank.amount * +objOilTank.cap +
      +objOilTank.amountBig * +objOilTank.capBig;
    objOilTank.show();
  },
};

// Farms object
var objFarmland = {
  amount: 1,
  automatedAmount: 0,
  cost: 10,
  harvest: 100,
  timer: 10,
  FarmTimer: 0,
  FarmAmount: 0,
  GrainResearchCostVar: 5000,
  GrainResearchTimer: 0,
  GrainResearchDuration: 60,
  GrainResearchProfit: 10,
  GrainResearchLevel: 1,
  addfarm: function () {
    if (+objMoney.amount > +objFarmland.cost) {
      objMoney.use(objFarmland.cost);
      objFarmland.amount++;
      if (+objFarmRobot.robotCap * +objFarmRobot.robots >= objFarmland.amount) {
        objFarmland.automatedAmount = objFarmland.amount;
      } else {
        objFarmland.automatedAmount =
          +objFarmRobot.robotCap * +objFarmRobot.robots;
      }
      objFarmland.manualFarm();
      objFarmland.calcPrice();
      objFarmland.showPrice();
      objFarmland.showFarms();
      objFarmRobot.show();
    }
  },
  manualFarm: function () {
    if (objFarmland.automatedAmount >= objFarmland.amount) {
      document.getElementById("FarmManual").style.display = "none";
    } else {
      document.getElementById("FarmManual").style.display = "block";
    }
  },
  timerCountdown: function () {
    if (this.FarmTimer > 0) {
      document.getElementById("FarmlandTimer").innerHTML =
        "Oogst klaar over " + this.FarmTimer + " seconden";
    } else {
      document.getElementById("FarmlandTimer").innerHTML = "";
    }
  },
  showPrice: function () {
    document.getElementById("FarmlandPrice").innerHTML = renderStats([
      ["Prijs per veld", FixMoney(objFarmland.cost)],
    ]);
    objFarmland.showHarvest();
    store.setItem("FarmlandCost", objFarmland.cost);
    store.setItem("Harvest", objFarmland.harvest);
  },
  // Opbrengst per veld, en ook van alle velden samen per oogstronde,
  // met de waarde tegen de huidige graanprijs (#123)
  showHarvest: function () {
    var total = +objFarmland.amount * +objFarmland.harvest;
    var robotFields = Math.min(
      +objFarmRobot.robots * +objFarmRobot.robotCap,
      +objFarmland.amount
    );
    document.getElementById("FarmHarvestPerField").innerHTML = renderStats([
      ["Opbrengst per veld", FixUnit(objFarmland.harvest, "kg")],
      ["Opbrengst per ronde", FixUnit(total, "kg")],
      robotFields > 0 && [
        "Waarvan robots",
        FixUnit(robotFields * +objFarmland.harvest, "kg"),
      ],
      ["Waarde per ronde", FixMoney((total / 1000) * objGrain.price)],
    ]);
  },
  calcPrice: function () {
    objFarmland.cost = objFarmland.cost * 1.05;
    objFarmland.cost = Math.round(objFarmland.cost * 100) / 100;
  },
  showFarms: function () {
    document.getElementById("Farmland").innerHTML = renderStats([
      ["Velden", FixNumber(objFarmland.amount)],
    ]);
    store.setItem("Farmland", objFarmland.amount);
    objFarmland.manualFarm();
  },
  work: function () {
    this.FarmTimer = this.timer;
    objFarmland.timerCountdown();
    this.FarmAmount = +objFarmland.amount - +objFarmland.automatedAmount;
    document.getElementById("farmlandWorkBTN").disabled = true;
  },
  working_loop: function () {
    this.FarmTimer--;
    objFarmland.timerCountdown();
    if (this.FarmTimer < 1) {
      var filling = +this.FarmAmount * +objFarmland.harvest;
      objGrainSilo.fill(objStats.count("graan", filling));

      //button enable
      document.getElementById("farmlandWorkBTN").disabled = false;
    }
  },
  research: function () {
    if (+objMoney.amount >= objFarmland.GrainResearchCostVar) {
      document.getElementById("GRButton").disabled = true;
      objMoney.use(objFarmland.GrainResearchCostVar);
      objFarmland.GrainResearchTimer = objFarmland.GrainResearchDuration;
      store.setItem("GrainResearchTimerCount", objFarmland.GrainResearchTimer);
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Graanveredeling",
        "fa-euro-sign"
      );
    }
  },
  research_loop: function () {
    objFarmland.GrainResearchTimer--;
    store.setItem("GrainResearchTimerCount", objFarmland.GrainResearchTimer);
    document.getElementById("GrainResearchTimer").innerHTML =
      "Onderzoek klaar over " + objFarmland.GrainResearchTimer + " seconden";
    if (objFarmland.GrainResearchTimer < 1) {
      objFarmland.harvest =
        Math.round(
          objFarmland.harvest *
            (1 + objFarmland.GrainResearchProfit / 100) *
            100
        ) / 100;
      objFarmland.GrainResearchDuration = Math.round(
        objFarmland.GrainResearchDuration * 1.1
      );
      objFarmland.GrainResearchCostVar = Math.round(
        objFarmland.GrainResearchCostVar * 1.1
      );
      objFarmland.GrainResearchProfit =
        Math.round(objFarmland.GrainResearchProfit * 0.99 * 100) / 100;
      objFarmland.GrainResearchLevel++;
      store.setItem("GrainResearchLevel", objFarmland.GrainResearchLevel);
      store.setItem("GrainResearchProfit", objFarmland.GrainResearchProfit);
      store.setItem("GrainResearchCostVar", objFarmland.GrainResearchCostVar);
      store.setItem("GrainResearchDuration", objFarmland.GrainResearchDuration);
      objFarmland.showResearch();
      objFarmRobot.show();
      objFarmland.showPrice();
      document.getElementById("GrainResearchTimer").innerHTML = "";
      //button enable
      document.getElementById("GRButton").disabled = false;
    }
  },
  showResearch: function () {
    document.getElementById("GrainResearchCost").innerHTML = renderStats([
      ["Onderzoekslevel", FixNumber(objFarmland.GrainResearchLevel)],
      [
        "Volgende stap",
        "+" + FixNumber(objFarmland.GrainResearchProfit) + "% opbrengst",
      ],
      ["Kosten", FixMoney(objFarmland.GrainResearchCostVar)],
      ["Duur", FixNumber(objFarmland.GrainResearchDuration) + " seconden"],
    ]);
  },
  init: function () {
    objFarmland.amount = parseInt(store.getItem("Farmland")) || 1;
    objFarmland.cost = parseFloat(store.getItem("FarmlandCost")) || 10;
    objFarmland.harvest = parseFloat(store.getItem("Harvest")) || 100;
    objFarmland.GrainResearchCostVar =
      parseInt(store.getItem("GrainResearchCostVar")) || 5000;
    objFarmland.GrainResearchDuration =
      parseInt(store.getItem("GrainResearchDuration")) || 60;
    objFarmland.GrainResearchProfit =
      parseFloat(store.getItem("GrainResearchProfit")) || 10;
    objFarmland.automatedAmount =
      parseInt(store.getItem("AutomatedFarms")) || 0;
    objFarmland.GrainResearchLevel =
      parseInt(store.getItem("GrainResearchLevel")) || 1;
    objFarmland.GrainResearchTimer = parseInt(
      store.getItem("GrainResearchTimerCount")
    );
    if (objFarmland.GrainResearchTimer > 0) {
      document.getElementById("GRButton").disabled = true;
      document.getElementById("GrainResearchTimer").innerHTML =
        "Onderzoek klaar over " + objFarmland.GrainResearchTimer + " seconden";
    }
    objFarmland.showFarms();
    objFarmland.showPrice();
    objFarmland.showResearch();
  },
};

// Windmill object
var objWindmill = {
  amount: 1,
  amountAutomated: 0,
  nonAutomatedWindmills: 0,
  cost: 500,
  speed: 1,
  cap: 1000,
  running: 0,
  GrindTimer: 0,
  GrindAmount: 0,
  autoGrindTimer: 0,
  add: function () {
    if (+objMoney.amount > objWindmill.cost) {
      objMoney.use(objWindmill.cost);
      objWindmill.amount++;
      objFarmland.showPrice();
      objWindmill.show();
      store.setItem("WindmillAmount", objWindmill.amount);
    }
  },
  grind_buttonstate: function () {
    let bDisabled = false;

    if (
      objWindmill.amountAutomated === objWindmill.amount &&
      objWindmill.autoGrindTimer > 0
    )
      bDisabled = true;
    if (objWindmill.GrindTimer > 0) bDisabled = true;

    document.getElementById("GrindGrain").disabled = bDisabled;
  },
  grind: function () {
    objWindmill.nonAutomatedWindmills =
      objWindmill.amount - objWindmill.amountAutomated;
    if (objWindmill.nonAutomatedWindmills === 0) {
      notificationOverlay(
        "Geen windmolens beschikbaar",
        "Windmolens",
        "fa-tree"
      );
      return 0;
    }
    if (+objGrainSilo.contents === 0) {
      notificationOverlay("Geen graan beschikbaar", "Windmolens", "fa-tree");
      return 0;
    }

    // Start grinding
    if (
      +objGrainSilo.contents <=
      objWindmill.cap * objWindmill.nonAutomatedWindmills
    ) {
      this.GrindAmount = objGrainSilo.contents;
    } else {
      this.GrindAmount = objWindmill.cap * objWindmill.nonAutomatedWindmills;
    }
    objGrainSilo.use(this.GrindAmount);
    objGrainSilo.show();

    objWindmill.GrindTimer = 10;
    objWindmill.grind_buttonstate();
    objWindmill.grindTimerCountdown();
  },
  grind_loop: function () {
    objWindmill.GrindTimer--;
    objWindmill.grindTimerCountdown();
    objFlourSilo.fill(objStats.count("bloem", this.GrindAmount / 10));
    if (objWindmill.GrindTimer < 1) objWindmill.grind_buttonstate();
  },
  tempAmountAuto: 0,
  autogrind: function () {
    if (objPause.is("WindmillController")) return 0;
    objWindmill.running = 1;
    objWindmill.tempAmountAuto = 0;

    // controleren of er graan is
    if (objGrainSilo.contents === 0) {
      objWindmill.running = 0;
      return 0;
    }

    // Bepalen hoeveel geautomatiseerde molens we kunnen draaien
    if (
      +objEnergy.available <
      (objWindmillController.amount * objWindmillController.energy) / 10
    ) {
      objWindmill.amountAutomated = Math.min(
        Math.floor(objEnergy.available / (objWindmillController.energy / 10)),
        objWindmill.amount
      );
      if (objWindmill.amountAutomated === 0) {
        objWindmill.running = 0;
        return 0;
      }
    } else {
      if (objWindmill.amount > objWindmillController.amount) {
        objWindmill.amountAutomated = objWindmillController.amount;
      } else {
        objWindmill.amountAutomated = objWindmill.amount;
      }
      if (objWindmill.amountAutomated === 0) {
        objWindmill.running = 0;
        return 0;
      }
    }

    // bepalen hoeveel graan we gaan gebruiken
    if (
      objGrainSilo.contents <=
      objWindmill.cap * objWindmill.amountAutomated
    ) {
      objWindmill.tempAmountAuto = objGrainSilo.contents;
    } else {
      objWindmill.tempAmountAuto =
        objWindmill.cap * objWindmill.amountAutomated;
      if (objWindmill.tempAmountAuto === 0) {
        objWindmill.running = 0;
        return 0;
      }
    }

    // Start grinding
    objWindmill.autoGrindTimer = 10;
    objWindmill.grind_buttonstate();
  },
  autogrind_loop: function () {
    let energyNeeded =
      objWindmill.amountAutomated * objWindmillController.energy;
    // Eerst controleren of er genoeg graan is, daarna pas energie en graan gebruiken
    if (+objGrainSilo.contents < objWindmill.tempAmountAuto / 10) {
      objWindmill.running = 0;
      objWindmill.tempAmountAuto = 0;
      objWindmill.autoGrindTimer = 0;
      objWindmill.grind_buttonstate();
      objWindmill.autoGrindTimerCountdown();
      return 0;
    }

    if (
      objEnergy.use(energyNeeded / 10, "Windmolencontrollers") !==
      energyNeeded / 10
    ) {
      objWindmill.running = 0;
      objWindmill.tempAmountAuto = 0;
      objWindmill.autoGrindTimer = 0;
      objWindmill.grind_buttonstate();
      objWindmill.autoGrindTimerCountdown();
      return 0;
    }
    objGrainSilo.use(objWindmill.tempAmountAuto / 10);
    objWindmill.autoGrindTimer--;
    objWindmill.autoGrindTimerCountdown();
    objFlourSilo.fill(objStats.count("bloem", objWindmill.tempAmountAuto / 10));
    if (objWindmill.autoGrindTimer < 1) {
      objWindmill.autoGrindTimer = 0;
      objWindmill.running = 0;
      objWindmill.tempAmountAuto = 0;
      objWindmill.grind_buttonstate();
    }
  },
  grindTimerCountdown: function () {
    if (objWindmill.GrindTimer > 0) {
      document.getElementById("GrindTimer").innerHTML =
        "Malen klaar over " + objWindmill.GrindTimer + " seconden";
    } else {
      document.getElementById("GrindTimer").innerHTML = "";
    }
  },
  autoGrindTimerCountdown: function () {
    if (objWindmill.autoGrindTimer > 0) {
      document.getElementById("AutoGrindTimer").innerHTML =
        "Automatisch malen klaar over " +
        objWindmill.autoGrindTimer +
        " seconden";
    } else {
      document.getElementById("AutoGrindTimer").innerHTML = "";
    }
  },
  show: function () {
    document.getElementById("Windmills").innerHTML = renderStats([
      ["Windmolens", FixNumber(objWindmill.amount)],
    ]);
    document.getElementById("WindmillCap").innerHTML = renderStats([
      [
        "Maalcapaciteit per run",
        FixUnit(objWindmill.amount * objWindmill.cap, "kg"),
      ],
    ]);
    document.getElementById("WindmillCost").innerHTML = renderStats([
      ["Prijs per windmolen", FixMoney(objWindmill.cost)],
      ["Capaciteit per windmolen", FixUnit(objWindmill.cap, "kg")],
    ]);
    objWindmillController.show();
  },
  init: function () {
    objWindmill.amount = parseInt(store.getItem("WindmillAmount")) || 1;
    objWindmill.amountAutomated =
      parseInt(store.getItem("WindmillAutomated")) || 0;
    if (objWindmillController.amount >= 1) objWindmill.autogrind();
    objWindmill.show();
  },
};

// Windmill controller object
var objWindmillController = {
  amount: 0,
  price: 10000,
  // Energie per maalrun van 10 ticks: 8 (0,8 per tick, issue #64). Eerst kostte
  // aansturen van een molen bijna evenveel stroom als het bewerken van 50 velden.
  energy: 8,
  cap: 1,
  add: function () {
    // Een controller bedient één windmolen
    if (+objWindmillController.amount >= +objWindmill.amount) {
      notificationOverlay(
        "Iedere windmolen heeft al een controller. Bouw eerst een extra windmolen.",
        "Windmolencontrollers",
        "fa-info"
      );
      return 0;
    }
    if (+objMoney.amount > objWindmillController.price) {
      objMoney.use(objWindmillController.price);
      objWindmillController.amount++;
      objWindmill.amountAutomated =
        objWindmillController.amount * objWindmillController.cap;
      store.setItem("WindmillAutomated", objWindmill.amountAutomated);
      store.setItem("WindmillControllerAmount", objWindmillController.amount);
      objWindmillController.show();
      if (objWindmillController.amount === 1 && objWindmill.running === 0)
        objWindmill.autogrind();
    }
  },
  sell: function () {
    if (objWindmillController.amount > 0) {
      objWindmillController.amount--;
      var SellWMCProfit = objWindmillController.price * 0.75;
      objMoney.add(SellWMCProfit, "Verkoop windmolencontroller", 3, 1);
      objWindmill.amountAutomated =
        objWindmillController.amount * objWindmillController.cap;
      store.setItem("WindmillAutomated", objWindmill.amountAutomated);
      store.setItem("WindmillControllerAmount", objWindmillController.amount);
      objWindmillController.show();
    } else {
      notificationOverlay(
        "Geen windmolencontrollers om te verkopen",
        "Windmolencontrollers",
        "fa-info"
      );
    }
  },
  show: function () {
    document.getElementById("WindmillControllerInfo").innerHTML = renderStats([
      ["Controllers", FixNumber(objWindmillController.amount)],
      [
        "Molens zonder controller",
        FixNumber(
          Math.max(0, +objWindmill.amount - +objWindmillController.amount)
        ),
      ],
      [
        "Energie per tick",
        FixNumber(
          (objWindmillController.amount * objWindmillController.energy) / 10
        ),
      ],
    ]);
    document.getElementById("WindmillControllerCost").innerHTML = renderStats([
      ["Prijs per controller", FixMoney(objWindmillController.price)],
    ]);
    document.getElementById("SellWindmillController").innerHTML = renderStats([
      ["Verkoopwaarde", FixMoney(objWindmillController.price * 0.75)],
    ]);
    document.getElementById("addWindmillController").disabled =
      +objWindmillController.amount >= +objWindmill.amount;
  },
  init: function () {
    objWindmillController.amount =
      store.getItem("WindmillControllerAmount") || 0;
    objWindmillController.show();
  },
};

// Grain object
var objGrain = {
  amount: 0,
  price: 10,
  previous: null, // prijs voor de vorige wissel, voor de trendpijl (#122)
  priced: false,
  priceCalc: function () {
    // De eerste prijs na het laden heeft geen vorige
    objGrain.previous = objGrain.priced ? +objGrain.price : null;
    objFlour.previous = objGrain.priced ? +objFlour.price : null;
    objGrain.priced = true;
    if (objPlayerInfo.level > 3) {
      objGrain.price = +objPrijslijst.GrainHigh;
      objFlour.price = +objPrijslijst.FlourHigh;
    } else {
      objGrain.price = +objPrijslijst.GrainLow;
      objFlour.price = +objPrijslijst.FlourLow;
    }
    objFarmland.showHarvest();

    objPasta.show();
  },
  sell: function () {
    var amount = +objGrainSilo.contents;
    var Profit = +objGrainSilo.contents * (objGrain.price / 1000);
    var text = "Verkoop Graan";
    objMoney.add(Profit, text, 4, amount);
    objGrainSilo.use(objGrainSilo.contents);
  },
  sellRest: function (Rest) {
    var Profit = +Rest * ((objGrain.price / 1000) * 0.2);
    var text = "Verkoop restant graan";
    objMoney.add(Profit, text, 4, Rest);
    objGrainSilo.show();
  },
};

// Flour object
var objFlour = {
  amount: 0,
  price: 0,
  sell: function () {
    var amount = +objFlourSilo.contents;
    var Profit = objFlourSilo.contents * (objFlour.price / 1000);
    var text = "Regulier verkoop bloem";
    objMoney.add(Profit, text, 5, amount);
    objFlourSilo.use(objFlourSilo.contents);
  },
  sellRest: function (Rest) {
    var SellRestProfit = +Rest * ((+objFlour.price / 1000) * 0.8);
    var text = "Restant verkoop bloem";
    objMoney.add(SellRestProfit, text, 5, Rest);
  },
};

// Game settings knoppen
function resetGame() {
  if (
    !confirm(
      "Weet je zeker dat je het spel wilt resetten? Je voortgang gaat verloren!"
    )
  ) {
    return;
  }
  objStats.stop();
  store.clear();
  location.reload();
}

// Oilpump object
var objOilPump = {
  amount: 0,
  price: 10,
  cap: 0,
  pricefactor: 30,
  add: function () {
    if (+objMoney.amount >= +objOilPump.price) {
      objMoney.use(objOilPump.price);
      objOilPump.amount++;
      objOilPump.priceCalc();
      store.setItem("Factory", objOilPump.amount);
      objOilPump.show();
      objEnergy.show();
    } else {
      notificationOverlay("Niet genoeg doekoe!", "Oliepompen", "fa-euro-sign");
    }
  },
  remove: function (amount) {
    if (objOilPump.amount > 0) {
      objOilPump.amount = +objOilPump.amount - +amount;
      store.setItem("Factory", objOilPump.amount);
      objMoney.add(objOilPump.price * 0.75, "Verkoop oliepomp", 99, +amount);
      objOilPump.price = Math.round((+objOilPump.price / 1.1) * 100) / 100;
      store.setItem("FactoryCost", objOilPump.price);
      objOilPump.show();
    }
  },
  priceCalc: function () {
    objOilPump.price = +objOilPump.price * 1.1;
    objOilPump.price = Math.round(objOilPump.price * 100) / 100;
    store.setItem("FactoryCost", objOilPump.price);
  },
  show: function () {
    if (+objOilPump.amount == 0) {
      document.getElementById("sellOilPump").disabled = true;
    } else {
      document.getElementById("sellOilPump").disabled = false;
    }

    document.getElementById("FactoryCount").innerHTML = renderStats([
      ["Oliepompen", FixNumber(objOilPump.amount)],
    ]);
    document.getElementById("FactoryCost").innerHTML = renderStats([
      ["Prijs per pomp", FixMoney(objOilPump.price)],
    ]);
    objOilPumpAdv.show();
    store.setItem("FactoryCost", objOilPump.price);
  },
  init: function () {
    objOilPump.amount = store.getItem("Factory") || 0;
    objOilPump.price = store.getItem("FactoryCost") || 10;
    objOilPump.show();
  },
};

// negatief olieverbruik zorgt nu toch voor weergave enegrieopbrengst (fictief)
var objEnergy = {
  available: 0,
  capacitors: 10,
  storageCap: 100,
  capaCost: 5000,
  addCapa: function (amount) {
    if (+objMoney.amount >= +objEnergy.capaCost * +amount) {
      objMoney.use(+objEnergy.capaCost * +amount);
      objEnergy.capacitors = +objEnergy.capacitors + +amount;
      store.setItem("Capacitors", objEnergy.capacitors);
      objOilPump.show();
      objEnergy.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Energieopslag",
        "fa-euro-sign"
      );
    }
  },
  use: function (requestedAmount, reason) {
    showMessage(reason, requestedAmount);
    if (+requestedAmount <= +objEnergy.available) {
      objEnergy.available = +objEnergy.available - +requestedAmount;
      objStats.count("energieVerbruik", requestedAmount);
      store.setItem("EnergyAvailable", +objEnergy.available);
      objEnergy.show();
      return +requestedAmount;
    }
    // Niet genoeg energie: niets afboeken, zodat de energie niet verloren gaat
    return 0;
  },
  save: function () {
    store.setItem("EnergyAvailable", +objEnergy.available);
    objEnergy.show();
  },
  produce: function () {
    // Zonneparken: zonder brandstof, tot de opslag vol is
    if (+objSolar.amount > 0) {
      objEnergy.available = Math.min(
        +objEnergy.storageCap * +objEnergy.capacitors,
        +objEnergy.available + +objSolar.amount * objSolar.production
      );
    }
    // Fusiecentrales: zonder brandstof, tot de opslag vol is
    if (+objFusion.amount > 0) {
      objEnergy.available = Math.min(
        +objEnergy.storageCap * +objEnergy.capacitors,
        +objEnergy.available + +objFusion.amount * objFusion.production
      );
    }
    // Nuclear
    if (+objNuclearPowerPlant.reactors > 0) {
      var capLeft =
        +objEnergy.storageCap * +objEnergy.capacitors - +objEnergy.available;
      var nucProduction = +objNuclearPowerPlant.produce();

      if (+capLeft < +nucProduction) {
        objEnergy.available = +objEnergy.available + +capLeft;
      } else {
        objEnergy.available = +objEnergy.available + nucProduction;
      }

      var capLeft =
        +objEnergy.storageCap * +objEnergy.capacitors - +objEnergy.available;

      if (capLeft == 0) {
        // Opslag vol: wel bewaren, anders gaat zonne-, fusie- en kernenergie verloren bij herladen (#110)
        objEnergy.save();
        return 0;
      }
    }

    // Olie
    // Bepalen of er genoeg olie is om Energie te maken.
    var activePlants = 0;
    if (+objOilTank.contents < +objPowerPlant.amount) {
      activePlants = +objOilTank.contents;
    } else {
      activePlants = +objPowerPlant.amount;
    }

    var producedAmount = activePlants * 10;
    var capLeft =
      +objEnergy.storageCap * +objEnergy.capacitors - +objEnergy.available;

    if (+producedAmount > +capLeft) {
      var activePlants = Math.ceil(+capLeft / 10);
      if (+activePlants > 0) {
        objOilTank.use(
          +activePlants,
          "Energiecentrales - Productie groter dan restcap"
        );
        objEnergy.available = +objEnergy.available + +capLeft;
        objEnergy.save();
      }
    } else {
      objEnergy.available = +objEnergy.available + +producedAmount;
      objOilTank.use(
        +activePlants,
        "Energiecentrales - Productie kleiner dan restcap"
      );
      objEnergy.save();
    }
    // Steenkool
    var capLeft =
      +objEnergy.storageCap * +objEnergy.capacitors - +objEnergy.available;
    var activePlants = Math.ceil(+capLeft / +objCoalPowerPlant.yield);

    if (+activePlants > +objCoalPowerPlant.amount) {
      activePlants = +objCoalPowerPlant.amount;
    }

    var coalUsage = +activePlants * +objCoalPowerPlant.CoalUsageTons;
    if (+coalUsage > +objCoal.amount) {
      var activePlants = Math.ceil(
        +objCoal.amount / +objCoalPowerPlant.CoalUsageTons
      );
      coalUsage = +activePlants * +objCoalPowerPlant.CoalUsageTons;
    }

    var actualUsed = objCoal.use(+coalUsage);

    var activePlants = Math.ceil(
      +actualUsed / +objCoalPowerPlant.CoalUsageTons
    );
    if (+activePlants == 0) {
      return 0;
    }

    var producedAmount = +activePlants * +objCoalPowerPlant.yield;
    if (
      +objEnergy.available + +producedAmount >
      +objEnergy.storageCap * +objEnergy.capacitors
    ) {
      objEnergy.available = +objEnergy.storageCap * +objEnergy.capacitors;
    } else {
      objEnergy.available = +objEnergy.available + +producedAmount;
    }

    objEnergy.save();
  },
  show: function () {
    document.getElementById("EnergieOpslag").innerHTML = renderStats([
      [
        "Opslagcapaciteit",
        FixNumber(+objEnergy.capacitors * +objEnergy.storageCap),
      ],
      ["Prijs per opslagunit", FixMoney(objEnergy.capaCost)],
      ["Capaciteit per unit", FixNumber(objEnergy.storageCap)],
    ]);
    // Grote opslagknoppen: pas nodig met fusiecentrales (#110)
    var bigCapa = !objChipFactory.unlocked();
    document.getElementById("capaButton100k").hidden = bigCapa;
    document.getElementById("capaButton1m").hidden = bigCapa;
    renderTop(
      "EnergyStats",
      "Energie",
      objEnergy.available,
      objEnergy.capacitors * objEnergy.storageCap
    );
    document.getElementById("AvailableEnergy").innerHTML = renderStats([
      [
        "Opgeslagen",
        FixNumber(objEnergy.available) +
          " / " +
          FixNumber(objEnergy.capacitors * objEnergy.storageCap),
      ],
    ]);
    // Reactoren zonder splijtstof leveren niets (#116)
    var idleReactors =
      +objNuclearPowerPlant.reactors - +objNuclearPowerPlant.activeReactors;
    document.getElementById("TotalEnergyProduction").innerHTML =
      renderStats([
        ["Productie per tick", FixNumber(objEnergy.capacity())],
        objEnergy.nettoRow(),
      ]) +
      (idleReactors > 0
        ? renderHint(
            FixNumber(idleReactors) +
              " van " +
              FixNumber(objNuclearPowerPlant.reactors) +
              " reactoren staan stil: geen splijtstof."
          )
        : "") +
      objEnergy.nettoHint();
    document.getElementById("OilUsage").innerHTML = renderStats([
      [
        "Olieverbruik per tick",
        FixUnit(
          +objPowerPlant.amount +
            +objPlasticFactory.activeFactories *
              +objPlasticFactory.oilNeededProduction,
          "vaten"
        ),
      ],
    ]);
    document.getElementById("CurrentEnergyUsage").innerHTML = renderStats([
      ["Piekvraag per tick", FixNumber(objEnergy.demand())],
    ]);
  },
  // Productie: wat de centrales nu per tick kunnen leveren met de brandstof die er is,
  // op dezelfde manier als produce() (#116). Olie- en kolencentrales draaien alleen
  // zolang zon, fusie en kernenergie de opslag niet vol krijgen.
  capacity: function () {
    var oilPlants = Math.min(+objPowerPlant.amount, +objOilTank.contents);
    var coalPlants = Math.min(
      +objCoalPowerPlant.amount,
      Math.ceil(+objCoal.amount / +objCoalPowerPlant.CoalUsageTons)
    );
    return (
      oilPlants * +objPowerPlant.yield +
      coalPlants * +objCoalPowerPlant.yield +
      +objNuclearPowerPlant.activeReactors *
        +objNuclearPowerPlant.reactorProduction +
      objNuclearPowerPlant.controlBonus() +
      +objSolar.amount * objSolar.production +
      +objFusion.amount * objFusion.production
    );
  },
  // Netto per tick: de werkelijke verandering van de opslag over de laatste
  // ticks, zodat ook verbruikers die eens per 15 ticks draaien meetellen (#116)
  history: [],
  track: function () {
    objEnergy.history.push(+objEnergy.available);
    if (objEnergy.history.length > 16) objEnergy.history.shift();
  },
  netto: function () {
    var h = objEnergy.history;
    if (h.length < 2) return null;
    return (h[h.length - 1] - h[0]) / (h.length - 1);
  },
  full: function () {
    return (
      +objEnergy.available >= +objEnergy.storageCap * +objEnergy.capacitors
    );
  },
  nettoRow: function () {
    var netto = objEnergy.netto();
    if (netto === null) return ["Netto per tick", "–"];
    if (objEnergy.full() && netto >= 0)
      return ["Netto per tick", "0 (opslag vol)"];
    var rounded = Math.round(netto);
    if (rounded === 0) return ["Netto per tick", "0"];
    return [
      "Netto per tick",
      '<span class="' +
        (rounded > 0 ? "stats-up" : "stats-down") +
        '">' +
        (rounded > 0 ? "▲ +" : "▼ −") +
        FixNumber(Math.abs(rounded)) +
        "</span>",
    ];
  },
  nettoHint: function () {
    var netto = objEnergy.netto();
    // Zonder tekort blijft de ruimte gereserveerd, zodat de kaart niet steeds
    // groter en kleiner wordt en de pagina niet verspringt (#120)
    if (netto === null || Math.round(netto) >= 0)
      return (
        '<p class="hint hint-reserve" aria-hidden="true">' +
        "Je opslag is over ongeveer 23u 59m leeg: je verbruikt meer dan je centrales leveren." +
        "</p>"
      );
    // Eén tick per seconde: zoveel minuten tot de opslag leeg is
    var minutes = +objEnergy.available / -netto / 60;
    return renderHint(
      minutes < 1
        ? "Je opslag is binnen een minuut leeg: je verbruikt meer dan je centrales leveren."
        : "Je opslag is over ongeveer " +
            FixDuration(minutes) +
            " leeg: je verbruikt meer dan je centrales leveren."
    );
  },
  // Piekvraag: wat alle verbruikers samen per tick kunnen vragen
  demand: function () {
    // Gepauzeerde kaarten tellen niet mee
    var f = objPause.factor;
    return (
      (+objOilPump.amount + +objOilPumpAdv.amount * +objOilPumpAdv.energy) *
        f("pomp-col") +
      +objFarmRobot.activeRobots *
        +objFarmRobot.robotEnergy *
        f("farmland-automation") +
      ((objWindmillController.amount * objWindmillController.energy) / 10) *
        f("WindmillController") +
      +objMines.coalAmountActive * +objCoalMine.energy * f("Coal-col") +
      +objMines.uraniumAmountActive *
        +objUraniumMine.energy *
        f("Uranium-col") +
      +objMines.ironAmountActive * +objIronMine.energy * f("Iron-col") +
      +objMines.copperAmountActive * objCopperMine.energy * f("Copper-col") +
      +objCopperSmelter.amount *
        objCopperSmelter.energy *
        f("CopperSmelter-col") +
      // Level 14: goud
      +objMines.goldAmountActive * objGoldMine.energy * f("Gold-col") +
      +objGoldRefinery.amount * objGoldRefinery.energy * f("GoldRefinery-col") +
      // Level 15: diamant
      +objMines.diamondAmountActive * objDiamondMine.energy * f("Diamond-col") +
      +objDiamondCutter.amount *
        objDiamondCutter.energy *
        f("DiamondCutter-col") +
      // Level 16: chips en datacenter
      +objChipFactory.amount * objChipFactory.energy * f("ChipFactory-col") +
      +objDatacenter.racks * objDatacenter.energy * f("Datacenter-col") +
      +objIsotopeLab.amount * objIsotopeLab.energy * f("IsotopeLab-col") +
      // Level 13: elektronica, scanners en bestuurde hoogovens
      +objElectronics.amount * objElectronics.energy * f("Electronics-col") +
      +objScanner.amount * objScanner.energy * f("Prospecting-col") +
      +objIronMelter.controlled *
        +objIronMelter.energy *
        f("SteelProduction-col") +
      // Pastahelpers en kunststofmedewerkers draaien de fabrieken iedere 15 ticks (#116)
      (+objPastaHelper.amount > 0
        ? Math.min(+objPastaFactory.amountAutomated, +objPastaFactory.amount) *
          +objPastaFactory.energy *
          f("pasta-col")
        : 0) +
      Math.min(+objPlasticFactory.workers, +objPlasticFactory.amount) *
        +objPlasticFactory.energy *
        f("platicFactory-col") +
      // Splijtstoffabrieken gebruiken hun stroom per tick
      +objFuelCellFactory.amount *
        objFuelCellFactory.energyPerTick() *
        f("fuelRodFactory")
    );
  },
  init: function () {
    objEnergy.available = store.getItem("EnergyAvailable") || 0;
    objEnergy.capacitors = store.getItem("Capacitors") || 10;
    objEnergy.show();
  },
};

// Kippen
var objChicken = {
  amount: 0,
  lifetime: 10,
  eggProduction: 0.4,
  cost: 10,
  foodIntake: 0.15,
  eat: function () {
    var asked = +objChicken.amount * +objChicken.foodIntake;
    var gotten = objChickenFarm.grain(+asked, "Out");
    if (asked != gotten) {
      if (+objGrainSilo.contents > +asked - +gotten) {
        var restGotten = objGrainSilo.use(+asked - +gotten);
        var gotten = +gotten + +restGotten;
      }
      objChicken.amount = Math.round(+gotten / +objChicken.foodIntake);
      store.setItem("Chickens", objChicken.amount);
    }
    objChickenFarm.show();
  },
  makeEggs: function () {
    objChicken.eat();
    var aantalEieren = +objChicken.amount * +objChicken.eggProduction;
    objEgg.add(objStats.count("eieren", AfrondenGewicht(aantalEieren)));
    objChicken.show();
  },
  add: function (aantal) {
    aantal = parseInt(aantal);
    if (
      +objMoney.amount >= +aantal * +objChicken.cost &&
      +objChickenFarm.amount * +objChickenFarm.cap >=
        +objChicken.amount + +aantal
    ) {
      objMoney.use(+aantal * +objChicken.cost);
      objChicken.amount = +objChicken.amount + +aantal;
      store.setItem("Chickens", objChicken.amount);
      objChicken.show();
      objChickenFarm.show();
    } else {
      if (+objMoney.amount <= +aantal * +objChicken.cost) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Kippenboerderij",
          "fa-euro-sign"
        );
      } else {
        notificationOverlay(
          "Er is geen plek meer in de kippenboerderij",
          "Kippenboerderij",
          "fa-info"
        );
      }
    }
  },
  show: function () {
    document.getElementById("Chickens").innerHTML = renderStats([
      ["Kippen", FixNumber(objChicken.amount)],
      [
        "Eieren per 5 ticks",
        FixNumber(+objChicken.eggProduction * +objChicken.amount),
      ],
      [
        "Voer per 5 ticks",
        FixUnit(+objChicken.foodIntake * +objChicken.amount, "kg"),
      ],
      ["Prijs per kip", FixMoney(objChicken.cost)],
    ]);
  },
  init: function () {
    objChicken.amount = Math.round(store.getItem("Chickens")) || 0;
    objChicken.show();
  },
};

// Kippenboerderij
var objChickenFarm = {
  amount: 0,
  cap: 1000,
  densityFactor: 0,
  level: 1,
  grainSiloCap: 2000,
  grainReserve: 0,
  cost: 1000000,
  grain: function (amount, handeling) {
    if (handeling == "in") {
      objChickenFarm.grainReserve = +objChickenFarm.grainReserve + +amount;
    } else {
      if (+amount > +objChickenFarm.grainReserve) {
        var beschikbaar = +objChickenFarm.grainReserve;
        objChickenFarm.grainReserve = 0;
        store.setItem("GrainReserve", objChickenFarm.grainReserve);
        return +beschikbaar;
      }

      objChickenFarm.grainReserve = +objChickenFarm.grainReserve - +amount;
      store.setItem("GrainReserve", objChickenFarm.grainReserve);
      return +amount;
    }
    store.setItem("GrainReserve", objChickenFarm.grainReserve);
    objChickenFarm.show();
    objChicken.show();
  },
  add: function () {
    if (+objMoney.amount >= +objChickenFarm.cost) {
      objMoney.use(objChickenFarm.cost);
      objChickenFarm.amount++;
      store.setItem("ChickenFarms", objChickenFarm.amount);
      objChickenFarm.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Kippenboerderij",
        "fa-euro-sign"
      );
    }
  },
  showButtons: function (a, b, c, d, e, f) {
    // functie voor het aan/uit zetten van de koop kippen knoppen
    document.getElementById("CickenAnd1").disabled = a;
    document.getElementById("CickenAnd10").disabled = b;
    document.getElementById("CickenAnd100").disabled = c;
    document.getElementById("CickenAnd1000").disabled = d;
    document.getElementById("CickenAnd10000").disabled = e;
    document.getElementById("CickenAnd100000").disabled = f;
  },
  show: function () {
    document.getElementById("ChickenFarm").innerHTML =
      renderStats([
        ["Kippenboerderijen", FixNumber(objChickenFarm.amount)],
        [
          "Plek voor kippen",
          FixNumber(
            +objChickenFarm.amount * +objChickenFarm.cap - +objChicken.amount
          ),
        ],
        ["Voer in voorraad", FixUnit(objChickenFarm.grainReserve, "kg")],
        [
          "Voeropslag per boerderij",
          FixUnit(objChickenFarm.grainSiloCap, "kg"),
        ],
        ["Prijs per boerderij", FixMoney(objChickenFarm.cost)],
        [
          "Eieropslag",
          FixNumber(+objEgg.storageCap * +objEgg.storageUnits) + " eieren",
        ],
        ["Prijs extra eieropslag", FixMoney(objEgg.storageUnitCost)],
        ["Extra eieropslag", FixNumber(objEgg.storageCap) + " eieren"],
      ]) + renderHint("Het voer wordt uit je graansilo's aangevuld.");
    // Eventueel de knoppen voor het kopen van kippen uitschakelen als er geen plek meer is.
    ChickenSpace =
      +objChickenFarm.amount * +objChickenFarm.cap - +objChicken.amount;
    showMessage("cp", ChickenSpace);
    switch (true) {
      case ChickenSpace == 0:
        showMessage("cp", "CP-1");
        objChickenFarm.showButtons(1, 1, 1, 1, 1, 1);
        break;
      case ChickenSpace < 10:
        showMessage("cp", "CP-2");
        objChickenFarm.showButtons(0, 1, 1, 1, 1, 1);
        break;
      case ChickenSpace < 100:
        showMessage("cp", "CP-3");
        objChickenFarm.showButtons(0, 0, 1, 1, 1, 1);
        break;
      case ChickenSpace < 1000:
        showMessage("cp", "CP-4");
        objChickenFarm.showButtons(0, 0, 0, 1, 1, 1);
        break;
      case ChickenSpace < 10000:
        showMessage("cp", "CP-5");
        objChickenFarm.showButtons(0, 0, 0, 0, 1, 1);
        break;
      case ChickenSpace < 100000:
        showMessage("cp", "CP-6");
        objChickenFarm.showButtons(0, 0, 0, 0, 0, 1);
        break;
      case ChickenSpace < 1000000:
        showMessage("cp", "CP-7");
        objChickenFarm.showButtons(0, 0, 0, 0, 0, 0);
        break;
      default:
        break;
    }
  },
  init: function () {
    objChickenFarm.grainReserve = store.getItem("GrainReserve") || 0;
    objChickenFarm.amount = store.getItem("ChickenFarms") || 0;
    objChickenFarm.show();
  },
};

// Eieren
var objEgg = {
  amount: 0,
  storageUnits: 1,
  storageCap: 100000,
  storageUnitCost: 500000,
  price: 0.1,
  // Overschot (wat niet in de opslag past) levert de helft op, zoals de kaart
  // vroeger al beloofde (#96)
  overflowFactor: 0.5,
  add: function (aantal) {
    aantal = parseInt(aantal);
    var eieren = parseInt(objEgg.amount);
    var opslag = parseInt(+objEgg.storageUnits * +objEgg.storageCap);
    var SpaceLeft = parseInt(opslag - eieren);
    if (+aantal > +SpaceLeft) {
      objEgg.amount = +eieren + +SpaceLeft;
      var Rest = +aantal - +SpaceLeft;
      objEgg.sell(Rest, "Overschot eieren", true);
    } else {
      objEgg.amount = +eieren + +aantal;
    }
    store.setItem("eggs", objEgg.amount);
    objEgg.show();
  },
  use: function (amountEggs) {
    if (+amountEggs > +objEgg.amount) {
      amountEggs = +objEgg.amount;
    }
    objEgg.amount = +objEgg.amount - +amountEggs;
    store.setItem("eggs", objEgg.amount);
    objEgg.show();
    return +amountEggs;
  },
  sell: function (aantal, reden, overflow) {
    if (isNaN(aantal)) {
      aantal = +objEgg.amount;
      reden = "Reguliere verkoop eieren";
      objEgg.amount = +objEgg.amount - +aantal;
      store.setItem("eggs", objEgg.amount);
      objEgg.show();
    }
    var Profit =
      +aantal * +objEgg.price * (overflow ? objEgg.overflowFactor : 1);
    objMoney.add(+Profit, reden, 6, aantal);
  },
  addStorageUnit: function () {
    if (+objMoney.amount >= +objEgg.storageUnitCost) {
      objMoney.use(objEgg.storageUnitCost);
      objEgg.storageUnits++;
      store.setItem("EggStorage", objEgg.storageUnits);
      objEgg.show();
      objChickenFarm.show();
    } else {
      notificationOverlay("Niet genoeg doekoe!", "Eieropslag", "fa-euro-sign");
    }
  },
  visual: function () {
    var percentageFilled =
      (+objEgg.amount / (+objEgg.storageUnits * +objEgg.storageCap)) * 100;
    percentageFilled = Math.round(percentageFilled * 100) / 100;
    document.getElementById("eggStock").innerHTML = renderBar(
      "Voorraad",
      FixNumber(objEgg.amount) + " eieren",
      percentageFilled
    );
  },
  show: function () {
    document.getElementById("eggs").innerHTML =
      renderStats([
        [
          "Vrije ruimte",
          FixNumber(
            +objEgg.storageUnits * +objEgg.storageCap - +objEgg.amount
          ) + " eieren",
        ],
        ["Prijs per ei", FixMoney(+objEgg.price)],
      ]) +
      renderHint("Wat niet past wordt direct verkocht voor 50% van de prijs.");
    objEgg.visual();
  },
  init: function () {
    objEgg.amount = store.getItem("eggs") || 0;
    objEgg.storageUnits = store.getItem("EggStorage") || 1;
    objEgg.show();
    objChickenFarm.show();
  },
};

// Pasta Factory
var objPastaFactory = {
  amount: 0,
  amountAutomated: 0,
  cost: 50000,
  cap: 2000,
  energy: 50,
  activeFactories: 0,
  add: function () {
    if (+objMoney.amount >= +objPastaFactory.cost) {
      objMoney.use(objPastaFactory.cost);
      objPastaFactory.amount++;
      store.setItem("PastaFactoryAmount", objPastaFactory.amount);
      objPastaFactory.show();
      objEnergy.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Pastafabriek",
        "fa-euro-sign"
      );
    }
  },
  sell: function () {
    if (+objPastaFactory.amount > 0 && objPastaHelper.freeFactories() < 1) {
      notificationOverlay(
        "Ontsla eerst een pastahelper: iedere helper bedient één fabriek.",
        "Pastafabriek",
        "fa-info"
      );
    } else if (+objPastaFactory.amount > 0) {
      objMoney.add(objPastaFactory.cost * 0.75, "Verkoop pastafabriek", 7, 1);
      objPastaFactory.amount--;
      store.setItem("PastaFactoryAmount", objPastaFactory.amount);
      objPastaFactory.show();
      objEnergy.show();
    } else {
      notificationOverlay(
        "Geen fabrieken om te verkopen",
        "Pastafabriek",
        "fa-info"
      );
    }
  },
  produce: function (typeAction) {
    function errorMessagebox(inputText) {
      if (typeAction == "manual") {
        notificationOverlay(
          inputText,
          "Pastafabriek",
          "fa-exclamation-triangle"
        );
      }
      return 0;
    }

    var usableFactories;
    if (typeAction == "manual") {
      usableFactories = Math.max(
        0,
        +objPastaFactory.amount - +objPastaFactory.amountAutomated
      );
    } else {
      if (+objPastaFactory.amountAutomated <= +objPastaFactory.amount) {
        usableFactories = +objPastaFactory.amountAutomated;
      } else {
        usableFactories = +objPastaFactory.amount;
      }
    }
    // aantal actieve fabrieken op basis van energie
    if (+objEnergy.available < +usableFactories * +objPastaFactory.energy) {
      objPastaFactory.activeFactories = Math.floor(
        +objEnergy.available / +objPastaFactory.energy
      );
      if (objPastaFactory.activeFactories == 0) {
        errorMessagebox("Niet genoeg energie!");
        return 0;
      }
    } else {
      objPastaFactory.activeFactories = +usableFactories;
      if (+objPastaFactory.activeFactories == 0) {
        if (objPastaFactory.amountAutomated > 0) {
          errorMessagebox(
            "Alle pastafabrieken worden bestuurd door pastahelpers"
          );
        } else {
          errorMessagebox("Geen pastafabrieken actief");
        }
      }
    }

    var maxPastaFlour = +objFlourSilo.contents / +objPasta.recipe;
    var maxPastaEggs = +objEgg.amount / +objPasta.recipeEggs;

    if (maxPastaFlour < maxPastaEggs) {
      if (
        +objPastaFactory.activeFactories * +objPastaFactory.cap >
        +objFlourSilo.contents
      ) {
        var InputAmount = +objFlourSilo.contents;
      } else {
        var InputAmount =
          +objPastaFactory.activeFactories * +objPastaFactory.cap;
      }
      var pasta = Math.floor(+InputAmount / +objPasta.recipe);
      if (pasta == 0) {
        errorMessagebox("Niet genoeg bloem!");
        return 0;
      }
      var flourUsed = +pasta * +objPasta.recipe;
      var eggsNeeded = +pasta * +objPasta.recipeEggs;
    } else {
      if (
        +objPastaFactory.activeFactories * +objPastaFactory.cap * 10 >
        +objEgg.amount
      ) {
        var InputAmount = +objEgg.amount;
      } else {
        var InputAmount =
          +objPastaFactory.activeFactories * +objPastaFactory.cap * 10;
      }
      var pasta = Math.floor(+InputAmount / +objPasta.recipeEggs);
      if (pasta == 0) {
        if (objPastaFactory.activeFactories > 0) {
          errorMessagebox("Niet genoeg eieren!");
          return 0;
        }
      }
      var flourUsed = +pasta * +objPasta.recipe;
      var eggsNeeded = +pasta * +objPasta.recipeEggs;
    }

    if (+objPastaFactory.activeFactories >= 1 && +objFlourSilo.contents > 0) {
      objEnergy.use(
        +objPastaFactory.activeFactories * +objPastaFactory.energy,
        "Pastafabriek"
      );
      objFlourSilo.use(flourUsed);
      objEgg.use(eggsNeeded);
      if (typeAction == "automated") {
        pasta = +pasta * (1 - +objPastaHelper.cut);
      }
      objStorehouse.addPasta(objStats.count("pasta", pasta));
      objFlows.pulseAll([
        ["flour-col", "pasta-col"],
        ["chicken-col", "pasta-col"],
      ]);
    }
  },
  show: function () {
    document.getElementById("PastaFactory").innerHTML = renderStats([
      ["Pastafabriek", FixNumber(objPastaFactory.amount)],
      ["Prijs per fabriek", FixMoney(objPastaFactory.cost)],
      ["Verkoopwaarde", FixMoney(objPastaFactory.cost * 0.75)],
    ]);

    var flour = objPastaFactory.amount * objPastaFactory.cap;
    var eggs = flour * (objPasta.recipeEggs / objPasta.recipe);
    document.getElementById("PastaInstruction").innerHTML =
      renderStats([
        ["Bloem per run", FixUnit(flour, "kg")],
        ["Eieren per run", FixNumber(eggs)],
        [
          "Energie per run",
          FixNumber(objPastaFactory.amount * objPastaFactory.energy),
        ],
        [
          "Opbrengst per run",
          FixNumber(Math.floor(flour / objPasta.recipe)) + " dozen",
        ],
      ]) +
      renderHint(
        "Recept: " +
          FixUnit(objPasta.recipe, "kg") +
          " bloem en " +
          FixNumber(objPasta.recipeEggs) +
          " eieren maken één doos pasta."
      );
    objStorehouse.show();
    objPastaHelper.show();
  },
  init: function () {
    objPastaFactory.amount = store.getItem("PastaFactoryAmount") || 0;
    objPastaFactory.amountAutomated =
      store.getItem("PastaFactoryAmountAutomated") || 0;
    objPastaFactory.cost = store.getItem("PastaFactoryCost") || 50000;
    objPastaFactory.cap = store.getItem("PastaFactoryCap") || 2000;
    objPastaFactory.show();
  },
};

// Pasta
var objPasta = {
  price: function () {
    var PastaTempPrice = (+objFlour.price * 5) / 10;
    return PastaTempPrice;
  },
  // Pasta volgt de bloemprijs, dus ook de trend (#122)
  previousPrice: function () {
    return objFlour.previous == null ? null : (+objFlour.previous * 5) / 10;
  },
  recipe: 10,
  recipeEggs: 100,
  sell: function (reason) {
    if (reason == null) {
      var reason = "Handmatige verkoop";
    }
    var amount = +objStorehouse.pasta;
    var ProfitPasta = +amount * +objPasta.price();
    objStorehouse.removePasta(+amount);
    objMoney.add(ProfitPasta, reason, 8, amount);
  },
  show: function () {
    document.getElementById("SellPasta").innerHTML = renderStats([
      [
        "Prijs per doos",
        FixMoney(objPasta.price()) +
          renderTrend(objPasta.price(), objPasta.previousPrice()),
      ],
    ]);
  },
  init: function () {
    objPasta.show();
  },
};

// Pasta helper

var objPastaHelper = {
  amount: 0,
  cost: 1000000,
  cut: 0.05,
  // Een helper bedient één fabriek: meer helpers dan fabrieken heeft geen zin
  freeFactories: function () {
    return Math.max(0, +objPastaFactory.amount - +objPastaHelper.amount);
  },
  add: function (actionType) {
    if (actionType == 1) {
      if (objPastaHelper.freeFactories() < 1) {
        notificationOverlay(
          "Iedere pastafabriek heeft al een helper. Bouw eerst een extra fabriek.",
          "Pastahelper",
          "fa-info"
        );
        return 0;
      }
      if (+objMoney.amount >= +objPastaHelper.cost) {
        objMoney.use(objPastaHelper.cost);
        objPastaHelper.amount++;
        store.setItem("pastaHelper", objPastaHelper.amount);
        objPastaFactory.amountAutomated++;
        store.setItem(
          "PastaFactoryAmountAutomated",
          objPastaFactory.amountAutomated
        );
        objPastaHelper.show();
        return 0;
      } else {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Pastahelper",
          "fa-euro-sign"
        );
        return 0;
      }
    } else if (+objPastaHelper.amount > 0) {
      objPastaHelper.amount--;
      store.setItem("pastaHelper", objPastaHelper.amount);
      objPastaFactory.amountAutomated--;
      store.setItem(
        "PastaFactoryAmountAutomated",
        objPastaFactory.amountAutomated
      );
      objPastaHelper.show();
      return 0;
    } else {
      notificationOverlay(
        "Er is niemand om te ontslaan!",
        "Pastahelper",
        "fa-address-card"
      );
      return 0;
    }
  },
  action: function () {
    if (objPause.is("pasta-col")) return 0;
    if (objPastaHelper.amount > 0) {
      objPastaFactory.produce("automated");
    } else {
      return 0;
    }
  },
  show: function () {
    if (objPlayerInfo.level > 6) {
      document.getElementById("pastaHelperDiv").innerHTML =
        "<h3>Pastahelpers</h3>" +
        renderStats([
          ["Pastahelpers", FixNumber(objPastaHelper.amount)],
          [
            "Fabrieken zonder helper",
            FixNumber(objPastaHelper.freeFactories()),
          ],
          ["Prijs per helper", FixMoney(objPastaHelper.cost)],
        ]) +
        renderHint(
          "Een helper bedient één fabriek en maakt elke 15 seconden pasta. Hij neemt 5% mee naar huis; ontslaan levert niets op."
        ) +
        "<div class='actions'>" +
        "<button type='button' class='btn btn-primary' onClick='objPastaHelper.add(1);' id='addPastaHelper'" +
        (objPastaHelper.freeFactories() < 1 ? " disabled" : "") +
        ">Neem pastahelper aan</button> " +
        "<button type='button' class='btn btn-outline-danger' onClick='objPastaHelper.add(0);' id='removePastaHelper'>Ontsla pastahelper</button>" +
        "</div>";
    }
  },
  init: function () {
    objPastaHelper.amount = store.getItem("pastaHelper") || 0;
    objPastaHelper.show();
  },
};

// Storehouse
var objStorehouse = {
  amount: 1,
  cap: 1000000,
  pasta: 0,
  addPasta: function (pasta) {
    objStorehouse.pasta = +objStorehouse.pasta + +pasta;
    objStorehouse.show();
    store.setItem("Pasta", objStorehouse.pasta);
  },
  removePasta: function (pasta) {
    objStorehouse.pasta = +objStorehouse.pasta - +pasta;
    objStorehouse.show();
    store.setItem("Pasta", objStorehouse.pasta);
  },
  show: function () {
    document.getElementById("StorehousePasta").innerHTML = renderStats([
      ["Voorraad", FixNumber(objStorehouse.pasta) + " dozen"],
    ]);
    // Ook in de kaart Voorraden (vanaf level 6); pasta heeft geen maximum, dus geen balk
    document.getElementById("Pastastock").innerHTML = renderStats([
      ["Pasta", FixNumber(Math.floor(objStorehouse.pasta)) + " dozen"],
    ]);
  },
  init: function () {
    objStorehouse.amount = store.getItem("Storehouses") || 0;
    objStorehouse.pasta = store.getItem("Pasta") || 0;
    objStorehouse.show();
  },
};

// Objecten voor energiecentrales
var objPowerPlant = {
  amount: 0,
  price: 100,
  yield: 10,
  add: function () {
    if (+objMoney.amount > +objPowerPlant.price) {
      objMoney.use(+objPowerPlant.price);
      objPowerPlant.amount++;
      store.setItem("PowerPlants", objPowerPlant.amount);
      objPowerPlant.priceCalc();
      objPowerPlant.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Oliecentrale",
        "fa-euro-sign"
      );
    }
  },
  sell: function () {
    if (+objPowerPlant.amount > 0) {
      objPowerPlant.price = (+objPowerPlant.price / 110) * 100;
      objPowerPlant.price = Math.round(+objPowerPlant.price * 100) / 100;
      objPowerPlant.amount--;
      objMoney.add(
        objPowerPlant.price * 0.75,
        "Energie centrale verkocht",
        9,
        1
      );
      store.setItem("PowerPlants", objPowerPlant.amount);
      store.setItem("PowerPlantPrice", objPowerPlant.price);
      objPowerPlant.show();
    } else {
      notificationOverlay(
        "Geen energiecentrales om te verkopen",
        "Oliecentrale",
        "fa-info"
      );
    }
  },
  priceCalc: function () {
    objPowerPlant.price = +objPowerPlant.price * 1.1;
    objPowerPlant.price = Math.round(+objPowerPlant.price * 100) / 100;
    store.setItem("PowerPlantPrice", objPowerPlant.price);
    objPowerPlant.show();
  },
  show: function () {
    document.getElementById("PowerPlantAmount").innerHTML = renderStats([
      ["Centrales", FixNumber(objPowerPlant.amount)],
    ]);
    document.getElementById("PowerPlantPrice").innerHTML = renderStats([
      ["Prijs per centrale", FixMoney(objPowerPlant.price)],
    ]);
    document.getElementById("SellPowerPlant").innerHTML = renderStats([
      ["Verkoopwaarde", FixMoney((+objPowerPlant.price / 110) * 100 * 0.75)],
    ]);
    objEnergy.show();
  },
  init: function () {
    objPowerPlant.price = store.getItem("PowerPlantPrice") || 100;
    objPowerPlant.amount = store.getItem("PowerPlants") || 0;
    objPowerPlant.show();
  },
};

var objCoalPowerPlant = {
  amount: 0,
  price: 50000000,
  yield: 750,
  CoalUsageTons: 1000,
  add: function () {
    if (+objMoney.amount > +objCoalPowerPlant.price) {
      objMoney.use(+objCoalPowerPlant.price);
      objCoalPowerPlant.amount++;
      store.setItem("CoalPowerPlants", objCoalPowerPlant.amount);
      objCoalPowerPlant.priceCalc();
      objCoalPowerPlant.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Kolencentrale",
        "fa-euro-sign"
      );
    }
  },
  sell: function () {
    if (+objCoalPowerPlant.amount > 0) {
      objCoalPowerPlant.price = (+objCoalPowerPlant.price / 105) * 100;
      objCoalPowerPlant.price =
        Math.round(+objCoalPowerPlant.price * 100) / 100;
      objCoalPowerPlant.amount--;
      objMoney.add(
        objCoalPowerPlant.price * 0.75,
        "Energie centrale verkocht",
        10,
        1
      );
      store.setItem("CoalPowerPlants", objCoalPowerPlant.amount);
      store.setItem("CoalPowerPlantPrice", objCoalPowerPlant.price);
      objCoalPowerPlant.show();
    } else {
      notificationOverlay(
        "Geen centrales om te verkopen",
        "Kolencentrale",
        "fa-info"
      );
    }
  },
  priceCalc: function () {
    objCoalPowerPlant.price = +objCoalPowerPlant.price * 1.05;
    objCoalPowerPlant.price = Math.round(+objCoalPowerPlant.price * 100) / 100;
    store.setItem("CoalPowerPlantPrice", objCoalPowerPlant.price);
    objCoalPowerPlant.show();
  },

  show: function () {
    if (objMines.coalAmountActive >= 1) {
      document.getElementById("CoalPowerPlantAmount").innerHTML =
        "<h2>Kolencentrales</h2>" +
        renderStats([["Centrales", FixNumber(objCoalPowerPlant.amount)]]);
      document.getElementById("CoalPowerPlantPrice").innerHTML = renderStats([
        ["Prijs per centrale", FixMoney(objCoalPowerPlant.price)],
        [
          "Verkoopwaarde",
          FixMoney((+objCoalPowerPlant.price / 105) * 100 * 0.75),
        ],
        [
          "Steenkool per centrale",
          FixUnit(objCoalPowerPlant.CoalUsageTons, "ton per tick"),
        ],
        [
          "Energie per centrale",
          FixNumber(objCoalPowerPlant.yield) + " per tick",
        ],
      ]);
      document.getElementById("CoalSellPowerPlant").innerHTML =
        "<div class='actions'>" +
        "<button type='button' class='btn btn-primary' onClick='objCoalPowerPlant.add();' id='pushOne'>Bouw kolencentrale</button>" +
        objBulk.buttons("coalPlant") +
        " <button type='button' class='btn btn-warning' onClick='objCoalPowerPlant.sell();' id='CoalpowerPlantSell'>Verkoop kolencentrale</button>" +
        "</div>";
      objEnergy.show();
      objCoal.show();
    }
  },
  init: function () {
    if (store.getItem("CoalPowerPlantPrice") < 50000000) {
      store.setItem("CoalPowerPlantPrice", 50000000);
    }
    objCoalPowerPlant.price = store.getItem("CoalPowerPlantPrice") || 50000000;
    objCoalPowerPlant.amount = store.getItem("CoalPowerPlants") || 0;
    objCoalPowerPlant.show();
  },
};

// Automatiseren verkoop
var objSalesComputer = {
  amount: 0,
  cpu: 0,
  cpuCost: 400000,
  oilValue: 20,
  flourValue: 875,
  pastaValue: 450,
  kunststofValue: 240,
  autoSellOil: false,
  autoSellFlour: false,
  autoSellPasta: false,
  autoSellKunststof: false,
  // [product, schuif, aantal CPU's dat het product vrijzet]
  products: [
    ["Olie", "SliderOil", 1],
    ["Bloem", "SliderFlour", 2],
    ["Pasta", "SliderPasta", 3],
    ["Kunststof", "SliderKunststof", 4],
  ],
  // "Vanaf 2 CPU's" zolang het product op slot zit
  lockedText: function (product) {
    var needed = objSalesComputer.products.find(function (p) {
      return p[0] === product;
    })[2];
    if (+objSalesComputer.cpu >= needed) return null;
    return "Vanaf " + needed + (needed > 1 ? " CPU's" : " CPU");
  },
  add: function () {
    if (+objMoney.amount > +objSalesComputer.cpuCost) {
      objMoney.use(+objSalesComputer.cpuCost);
      objSalesComputer.cpu++;
      objSalesComputer.cpuCost *= 1;
      store.setItem("scCPU", objSalesComputer.cpu);
      objSalesComputer.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Salescomputer",
        "fa-euro-sign"
      );
    }
  },
  remove: function () {
    if (+objSalesComputer.cpu > 0) {
      objSalesComputer.cpuCost /= 1;
      objMoney.add(+objSalesComputer.cpuCost * 0.75, "Verkoop CPU", 11, 1);
      objSalesComputer.cpu--;
      store.setItem("scCPU", objSalesComputer.cpu);
      objSalesComputer.show();
    } else {
      notificationOverlay(
        "Geen CPU's om te verkopen",
        "Salescomputer",
        "fa-info"
      );
    }
  },
  show: function () {
    var maxCpu = +objSalesComputer.cpu > 3;
    document.getElementById("autoSellIntro").innerHTML =
      renderStats([
        ["CPU's", FixNumber(objSalesComputer.cpu) + " van 4"],
        !maxCpu && ["Prijs per CPU", FixMoney(objSalesComputer.cpuCost)],
        ["Verkoopwaarde", FixMoney(objSalesComputer.cpuCost * 0.75)],
      ]) +
      renderHint(
        "Iedere CPU zet het volgende product vrij: olie, bloem, pasta en kunststof."
      );
    document.getElementById("addCPU").disabled = maxCpu;
    switch (+objSalesComputer.cpu) {
      case 0:
        document.getElementById("autoOilCheck").disabled = true;
        document.getElementById("autoFlourCheck").disabled = true;
        document.getElementById("autoPastaCheck").disabled = true;
        document.getElementById("autoKunststofCheck").disabled = true;
        break;
      case 1:
        document.getElementById("autoOilCheck").disabled = false;
        document.getElementById("autoFlourCheck").disabled = true;
        document.getElementById("autoPastaCheck").disabled = true;
        document.getElementById("autoKunststofCheck").disabled = true;
        break;
      case 2:
        document.getElementById("autoOilCheck").disabled = false;
        document.getElementById("autoFlourCheck").disabled = false;
        document.getElementById("autoPastaCheck").disabled = true;
        document.getElementById("autoKunststofCheck").disabled = true;
        break;
      case 3:
        document.getElementById("autoOilCheck").disabled = false;
        document.getElementById("autoFlourCheck").disabled = false;
        document.getElementById("autoPastaCheck").disabled = false;
        document.getElementById("autoKunststofCheck").disabled = true;
        break;
      case 4:
        document.getElementById("autoOilCheck").disabled = false;
        document.getElementById("autoFlourCheck").disabled = false;
        document.getElementById("autoPastaCheck").disabled = false;
        document.getElementById("autoKunststofCheck").disabled = false;
        break;
    }
    // producten die nog op slot zitten duidelijk tonen, met de schuif uit (issue #67)
    objSalesComputer.products.forEach(function (p) {
      var locked = +objSalesComputer.cpu < p[2];
      var slider = document.getElementById(p[1]);
      slider.disabled = locked;
      slider
        .closest(".autosell-item")
        .classList.toggle("autosell-locked", locked);
    });
    var inputOil = document.getElementById("SliderOil").value;
    objSalesComputer.showOil(inputOil);
    var inputFlour = document.getElementById("SliderFlour").value;
    objSalesComputer.showFlour(inputFlour);
    var inputPasta = document.getElementById("SliderPasta").value;
    objSalesComputer.showPasta(inputPasta);
    var inputKunststof = document.getElementById("SliderKunststof").value;
    objSalesComputer.showKunststof(inputKunststof);
  },
  showOil: function (inputwaarde) {
    store.setItem("autoOil", inputwaarde);
    objSalesComputer.oilValue = inputwaarde;
    document.getElementById("autoSellOil").innerHTML = renderAutoSell(
      "Olie",
      objSalesComputer.autoSellOil == true,
      inputwaarde,
      FixMoney(objOil.price) + renderTrend(objOil.price, objOil.previous),
      objSalesComputer.lockedText("Olie")
    );
  },
  showFlour: function (inputwaarde) {
    store.setItem("autoFlour", inputwaarde);
    objSalesComputer.flourValue = inputwaarde;
    document.getElementById("autoSellFlour").innerHTML = renderAutoSell(
      "Bloem",
      objSalesComputer.autoSellFlour == true,
      inputwaarde,
      FixMoney(objFlour.price) + renderTrend(objFlour.price, objFlour.previous),
      objSalesComputer.lockedText("Bloem")
    );
  },
  showPasta: function (inputwaarde) {
    store.setItem("autoPasta", inputwaarde);
    objSalesComputer.pastaValue = inputwaarde;
    document.getElementById("autoSellPasta").innerHTML = renderAutoSell(
      "Pasta",
      objSalesComputer.autoSellPasta == true,
      inputwaarde,
      FixMoney(objPasta.price()) +
        renderTrend(objPasta.price(), objPasta.previousPrice()),
      objSalesComputer.lockedText("Pasta")
    );
  },
  showKunststof: function (inputwaarde) {
    store.setItem("autoKunststof", inputwaarde);
    objSalesComputer.kunststofValue = inputwaarde;
    document.getElementById("autoSellKunststof").innerHTML = renderAutoSell(
      "Kunststof",
      objSalesComputer.autoSellKunststof == true,
      inputwaarde,
      FixMoney(objPlastic.price) +
        renderTrend(objPlastic.price, objPlastic.previousPrice()),
      objSalesComputer.lockedText("Kunststof")
    );
  },
  checkOil: function (checkState) {
    store.setItem("autoOilCheck", checkState);
    objSalesComputer.autoSellOil = JSON.parse(store.getItem("autoOilCheck"));
    objSalesComputer.showOil(parseInt(store.getItem("autoOil")));
  },
  checkFlour: function (checkState) {
    store.setItem("autoFlourCheck", checkState);
    objSalesComputer.autoSellFlour = JSON.parse(
      store.getItem("autoFlourCheck")
    );
    objSalesComputer.showFlour(parseInt(store.getItem("autoFlour")));
  },
  checkPasta: function (checkState) {
    store.setItem("autoPastaCheck", checkState);
    objSalesComputer.autoSellPasta = JSON.parse(
      store.getItem("autoPastaCheck")
    );
    objSalesComputer.showPasta(parseInt(store.getItem("autoPasta")));
  },
  checkKunststof: function (checkState) {
    store.setItem("autoKunststofCheck", checkState);
    objSalesComputer.autoSellKunststof = JSON.parse(
      store.getItem("autoKunststofCheck")
    );
    objSalesComputer.showKunststof(parseInt(store.getItem("autoKunststof")));
  },
  autoSell: function () {
    if (objSalesComputer.autoSellOil == true && +objSalesComputer.cpu > 0) {
      if (
        +objOil.price >= +objSalesComputer.oilValue &&
        +objOilTank.contents > +objPowerPlant.amount * 10
      ) {
        var oilUsed = objOilTank.use(
          +objOilTank.contents - +objPowerPlant.amount * 5,
          "Autosell olie"
        );
        objMoney.add(
          +oilUsed * +objOil.price,
          "Computerverkoop olie",
          1,
          oilUsed
        );
      }
    }
    if (objSalesComputer.autoSellFlour == true && +objSalesComputer.cpu > 1) {
      // Niet "verkopen" als er niets is (issue #66)
      var hasFlour = +objFlourSilo.contents > 0;
      if (+objFlour.price >= +objSalesComputer.flourValue && hasFlour) {
        var amount = +objFlourSilo.contents;
        objMoney.add(
          (+objFlourSilo.contents / 1000) * +objFlour.price,
          "Computerverkoop bloem",
          5,
          amount
        );
        objFlourSilo.use(+objFlourSilo.contents);
      }
    }
    if (objSalesComputer.autoSellPasta == true && +objSalesComputer.cpu > 2) {
      var pp = objPasta.price();
      if (+pp >= +objSalesComputer.pastaValue && objStorehouse.pasta > 0) {
        objPasta.sell("Computerverkoop Pasta");
      }
    }
    if (
      objSalesComputer.autoSellKunststof == true &&
      +objSalesComputer.cpu > 3
    ) {
      var pp = objPlastic.price;
      var hasPlastic = +objPlastic.amount > 0;
      if (+pp >= +objSalesComputer.kunststofValue && hasPlastic) {
        objPlastic.sell(0, "Computerverkoop Plastic");
      }
    }
  },
  init: function () {
    objSalesComputer.cpu = store.getItem("scCPU") || 0;

    //olie
    objSalesComputer.oilValue = parseInt(store.getItem("autoOil")) || 20;
    objSalesComputer.autoSellOil =
      JSON.parse(store.getItem("autoOilCheck")) || false;
    document.getElementById("autoOilCheck").checked =
      objSalesComputer.autoSellOil;
    document.getElementById("SliderOil").value = +objSalesComputer.oilValue;

    // de schuiven voor bloem en pasta volgen de prijzen vanaf level 4 (issue #65).
    // Een eerder bewaarde, te hoge drempel wordt begrensd.
    var flourMax = 450;
    var pastaMax = 225;
    document.getElementById("SliderFlour").max = flourMax;
    document.getElementById("SliderPasta").max = pastaMax;
    document.getElementById("SliderPasta").step = 5;

    //bloem
    objSalesComputer.flourValue = Math.min(
      parseInt(store.getItem("autoFlour")) || flourMax,
      flourMax
    );
    objSalesComputer.autoSellFlour =
      JSON.parse(store.getItem("autoFlourCheck")) || false;
    document.getElementById("autoFlourCheck").checked =
      objSalesComputer.autoSellFlour;
    document.getElementById("SliderFlour").value = +objSalesComputer.flourValue;

    //Pasta
    objSalesComputer.pastaValue = Math.min(
      parseInt(store.getItem("autoPasta")) || pastaMax,
      pastaMax
    );
    objSalesComputer.autoSellPasta =
      JSON.parse(store.getItem("autoPastaCheck")) || false;
    document.getElementById("autoPastaCheck").checked =
      objSalesComputer.autoSellPasta;
    document.getElementById("SliderPasta").value = +objSalesComputer.pastaValue;

    //Kunststof
    objSalesComputer.kunststofValue =
      parseInt(store.getItem("autoKunststof")) || 240;
    objSalesComputer.autoSellKunststof =
      JSON.parse(store.getItem("autoKunststofCheck")) || false;
    document.getElementById("autoKunststofCheck").checked =
      objSalesComputer.autoSellKunststof;
    document.getElementById("SliderKunststof").value =
      +objSalesComputer.kunststofValue;

    objSalesComputer.show();
  },
};

function showPrice() {
  document.getElementById("Oilprice").innerHTML = renderStats([
    [
      "Prijs per vat",
      FixMoney(objOil.price) + renderTrend(objOil.price, objOil.previous),
    ],
  ]);
  document.getElementById("GrainPrice").innerHTML = renderStats([
    [
      "Prijs per 1.000 kg",
      FixMoney(objGrain.price) + renderTrend(objGrain.price, objGrain.previous),
    ],
  ]);
  document.getElementById("FlourPrice").innerHTML = renderStats([
    [
      "Prijs per 1.000 kg",
      FixMoney(objFlour.price) + renderTrend(objFlour.price, objFlour.previous),
    ],
  ]);
}

// research voor mijnbouw
var objResearch = {
  level: 1,
  research_tree: [
    {
      time: 180,
      cost: 5000000,
      phase: "eerste",
      description: "Je leert de basiskennis over mijnbouw!",
    },
    {
      time: 360,
      cost: 5000000,
      phase: "tweede",
      description: "Je leert alles over prospecting!",
    },
    {
      time: 720,
      cost: 5000000,
      phase: "derde",
      description: "Je leert alles over het werkelijk openen van een mijn!",
    },
  ],
  running: 0,
  timer: 0,
  doResearch: function (button) {
    if (objResearch.running !== 1) {
      if (objResearch.level <= objResearch.research_tree.length) {
        objResearch.timer =
          objResearch.research_tree[objResearch.level - 1].time;
      } else {
        document.getElementById("MiningResearch").disabled = true;
        return 0;
      }

      if (
        objMoney.amount < objResearch.research_tree[objResearch.level - 1].cost
      ) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Mijnbouwonderzoek",
          "fa-euro-sign"
        );
        return 0;
      }

      objMoney.use(objResearch.research_tree[objResearch.level - 1].cost);
    }
    document.getElementById("MiningResearch").disabled = true;
    objResearch.running = 1;
    store.setItem("Rrunning", objResearch.running);
    document.getElementById("ResearchTimer").style.display = "";
  },
  Research_loop: function () {
    objResearch.timer--;
    store.setItem("rTimer", objResearch.timer);
    document.getElementById("ResearchTimer").innerHTML =
      "Onderzoek klaar over " + objResearch.timer + " seconden";
    if (objResearch.timer < 1 && objResearch.running === 1) {
      objResearch.level++;
      store.setItem("Rlevel", objResearch.level);
      document.getElementById("MiningResearch").disabled = false;
      objResearch.show();
      objResearch.running = 0;
      store.setItem("rTimer", objResearch.timer);
      store.setItem("Rrunning", objResearch.running);
      document.getElementById("ResearchTimer").style.display = "none";
    }
  },
  show: function () {
    if (objResearch.level <= objResearch.research_tree.length) {
      var phase = objResearch.research_tree[objResearch.level - 1];
      document.getElementById("ResDesc").innerHTML =
        renderStats([
          [
            "Fase",
            objResearch.level + " van " + objResearch.research_tree.length,
          ],
          ["Kosten", FixMoney(phase.cost)],
          ["Duur", FixNumber(phase.time) + " seconden"],
        ]) + renderHint(phase.description);
    } else {
      document.getElementById("ResDesc").innerHTML = renderHint(
        "Onderzoek afgerond: je kunt nu naar mijnlocaties zoeken en mijnen openen."
      );
      document.getElementById("MiningResearch").disabled = true;
      document.getElementById("MiningResearch").style.display = "none";
      document.getElementById("ResearchTimer").style.display = "none";
    }

    if (+objPlayerInfo.level < 8) {
      document.getElementById("MiningLevel").innerHTML = renderHint(
        "Beschikbaar vanaf level 8."
      );
      document.getElementById("MiningResearch").disabled = true;
    } else {
      document.getElementById("MiningLevel").innerHTML = "";
      if (objResearch.running === 0) {
        document.getElementById("MiningResearch").disabled = false;
      }
    }
    // weergeven beschikbare opties in de mining row
    objMines.showProspecting();
    objMines.showMining();
  },
  init: function () {
    objResearch.level = parseInt(store.getItem("Rlevel")) || 1;
    objResearch.running = parseInt(store.getItem("Rrunning")) || 0;
    objResearch.show();
    if (+objPlayerInfo.level > 7) {
      if (+objResearch.running === 1) {
        objResearch.timer = parseInt(store.getItem("rTimer"));
        showMessage("Research timer", objResearch.timer);
        document.getElementById("ResearchTimer").innerHTML =
          "Onderzoek klaar over " + objResearch.timer + " seconden";
        document.getElementById("MiningResearch").disabled = true;
      }
      if (objResearch.level > 3) {
        document.getElementById("MiningResearch").disabled = true;
      }
    }
  },
};

// Mijnbouw

var objMines = {
  ironAmountProspected: 0,
  coalAmountProspected: 0,
  uraniumAmountProspected: 0,
  copperAmountProspected: 0,
  goldAmountProspected: 0,
  diamondAmountProspected: 0,
  ironAmountActive: 0,
  coalAmountActive: 0,
  uraniumAmountActive: 0,
  copperAmountActive: 0,
  goldAmountActive: 0,
  diamondAmountActive: 0,
  ironMineCost: 200000000,
  coalMineCost: 75000000,
  uraniumMineCost: 200000000,
  copperMineCost: 150000000,
  goldMineCost: 600000000,
  diamondMineCost: 600000000,
  prospectCost: 50000000,
  // goedkoper beginnen met mijnbouw (10 mln op level 8, 25 mln op level 9)
  prospectPrice: function () {
    if (+objPlayerInfo.level <= 8) return 10000000;
    if (+objPlayerInfo.level === 9) return 25000000;
    return +objMines.prospectCost;
  },
  prospectTimer: 15,
  prospectTimerActive: 0,
  prospecting: 0,
  priceFactor: 1.01,
  items: [1, 2, 3, 4, 5, 6],
  weight: ["20", "35", "15", "20", "5", "5"],
  prospect: function () {
    // Eerst bepalen of er al een prospecting actie liep
    if (+objMines.prospecting !== 1) {
      if (+objMoney.amount < objMines.prospectPrice()) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Prospecting",
          "fa-euro-sign"
        );
        return 0;
      } else {
        objMoney.use(objMines.prospectPrice());
      }
      objMines.prospectTimerActive = parseInt(objMines.prospectTimer);
      objMines.prospecting = 1;
    }
    document.getElementById("ProspectingButton").disabled = true;
    // prospect loop

    store.setItem("prospecting", objMines.prospecting);
    document.getElementById("ProspectingProgress").style.display = "";
  },
  prospect_loop: function () {
    objMines.prospectTimerActive--;
    store.setItem("pTimer", objMines.prospectTimerActive);
    document.getElementById("ProspectingProgress").innerHTML =
      "Zoeken klaar over " + objMines.prospectTimerActive + " seconden";
    if (objMines.prospectTimerActive < 1) {
      var selectedItem = objMines.findSite(objMines.weight);
      objMines.prospecting = 0;
      store.setItem("prospecting", objMines.prospecting);
      document.getElementById("ProspectingProgress").style.display = "none";
      document.getElementById("ProspectingButton").disabled = false;
      document.getElementById("ProspectingResult").innerHTML = renderStats([
        ["Laatste vondst", selectedItem],
      ]);
      objMines.showProspecting();
      objMines.showMining();
    }
  },
  siteNames: ["", "Ijzer", "Steenkool", "Uranium", "Koper", "Goud", "Diamant"],
  siteTypes: ["", "iron", "coal", "uranium", "copper", "gold", "diamond"],
  // Een willekeurige locatie vinden met de gegeven gewichten (gebaseerd op
  // http://codetheory.in/weighted-biased-random-number-generation-with-javascript-based-on-probability/)
  findSite: function (weights) {
    let weighed_list = generateWeighedList(objMines.items, weights);
    let random_num = randomSelect(0, weighed_list.length - 1);
    let item = parseInt(weighed_list[random_num]);
    var key = objMines.siteTypes[item] + "AmountProspected";
    objMines[key]++;
    store.setItem(key, objMines[key]);
    return objMines.siteNames[item];
  },
  showProspecting: function () {
    if (+objResearch.level > 2) {
      document.getElementById("Prospecting-col").style.display = "";
      document.getElementById("Prospecting").style.display = "";
      document.getElementById("minesites").style.display = "";
    } else {
      document.getElementById("Prospecting").style.display = "none";
      document.getElementById("minesites").style.display = "none";
    }
    document.getElementById("Prospecting").innerHTML =
      renderStats([
        ["Kosten", FixMoney(objMines.prospectPrice())],
        ["Duur", FixNumber(objMines.prospectTimer) + " seconden"],
      ]) +
      renderHint(
        "Je vindt een willekeurige locatie: ijzererts, steenkool, uranium, koper, goud of diamant."
      );
    var site = function (label, type) {
      return [
        label,
        FixNumber(objMines[type + "AmountProspected"]) +
          " gevonden, " +
          FixNumber(objMines[type + "AmountActive"]) +
          " actief",
      ];
    };
    document.getElementById("minesites").innerHTML = renderStats([
      site("IJzererts", "iron"),
      site("Steenkool", "coal"),
      site("Uranium", "uranium"),
      site("Koper", "copper"),
      site("Goud", "gold"),
      site("Diamant", "diamond"),
    ]);
  },
  addMine: function (typeMine, amount) {
    //functie voor werkelijk toevoegen mijn
    function addMineFunction(mineType, amountAdded) {
      var mCost = mineType + "MineCost";
      var mActive = mineType + "AmountActive";
      var mProspected = mineType + "AmountProspected";
      if (
        +amountAdded == 1 &&
        +objMines[mProspected] - +objMines[mActive] < 1
      ) {
        notificationOverlay(
          "Geen locaties meer beschikbaar",
          "Mijnbouw",
          "fa-info"
        );
        return 0;
      }
      if (+objMines[mActive] == 0 && +amountAdded == 0) {
        notificationOverlay("Geen mijnen om te sluiten", "Mijnbouw", "fa-info");
        return 0;
      } else {
      }
      if (moneyCheck(objMines[mCost]) == 0 && +amountAdded == 1) {
        notificationOverlay("Niet genoeg doekoe!", "Mijnbouw", "fa-euro-sign");
        return 0;
      }
      // Sommige mijnen kosten ook staal (dat komt bij verkopen niet terug)
      var steel = objMines.steelNeeded(mineType);
      if (+amountAdded == 1 && +objSteel.amount < steel) {
        notificationOverlay(
          "Niet genoeg staal! Een mijn kost " + FixUnit(steel, "ton") + ".",
          "Mijnbouw",
          "fa-box"
        );
        return 0;
      }

      if (+amountAdded == 1) {
        objMines[mActive]++;
        objMoney.use(+objMines[mCost]);
        if (steel > 0) {
          objSteel.use(steel);
          objSteel.show();
          objFlows.pulse(
            "SteelInfo-col",
            { gold: "Gold-col", diamond: "Diamond-col" }[mineType] ||
              "Copper-col"
          );
        }
        objMines[mCost] = +objMines[mCost] * +objMines.priceFactor;
      } else {
        objMines[mActive] = +objMines[mActive] - 1;
        objMoney.add(+objMines[mCost] * 0.75, "Verkopen mijn", 12, 1);
        objMines[mCost] = +objMines[mCost] / +objMines.priceFactor;
      }

      store.setItem(mCost, objMines[mCost]);

      //Aantal actieve mijnen opslaan in LS en weergeven
      store.setItem(mActive, objMines[mActive]);
      objMines.showAll();
    }
    // switch voor bepalen welke mijn er toegevoegd wordt.
    switch (typeMine) {
      case 1:
        var mineType = "iron";
        addMineFunction(mineType, amount);
        objIronMelter.show();
        break;
      case 2:
        var mineType = "coal";
        addMineFunction(mineType, amount);
        objCoalPowerPlant.show();
        break;
      case 3:
        var mineType = "uranium";
        addMineFunction(mineType, amount);
        break;
      case 4:
        if (!objCopperMine.unlocked()) return 0;
        var mineType = "copper";
        addMineFunction(mineType, amount);
        objCopperMine.show();
        objCopperSmelter.show();
        break;
      case 5:
        if (!objGoldMine.unlocked()) return 0;
        var mineType = "gold";
        addMineFunction(mineType, amount);
        objGoldMine.show();
        objGoldRefinery.show();
        break;
      case 6:
        if (!objDiamondMine.unlocked()) return 0;
        var mineType = "diamond";
        addMineFunction(mineType, amount);
        objDiamondMine.show();
        objDiamondCutter.show();
        break;
    }
  },
  // Staal dat een nieuwe mijn kost (in ton)
  steelNeeded: function (mineType) {
    if (mineType === "copper") return +objCopperMine.steelNeeded;
    if (mineType === "gold") return +objGoldMine.steelNeeded;
    if (mineType === "diamond") return +objDiamondMine.steelNeeded;
    return 0;
  },
  showAll: function () {
    objMines.showProspecting();
    objMines.showMining();
  },
  showMining: function () {
    if (+objResearch.level > 3) {
      document.getElementById("mijnen-row").style.display = "";
      document.getElementById("mijnen-row2").style.display = "";
    } else {
      document.getElementById("mijnen-row").style.display = "none";
      document.getElementById("mijnen-row2").style.display = "none";
      document.getElementById("MiningResearch-col").style.display = "";
    }

    if (+objPlayerInfo.level < 8) {
      Display.hide("MiningResearch-col");
    }

    function generateText(
      htmlfield,
      typeMine,
      mineCost,
      active,
      mineName,
      mineCode,
      mineButton,
      title
    ) {
      var steel = objMines.steelNeeded(
        typeMine.replace("AmountProspected", "")
      );
      document.getElementById(htmlfield).innerHTML =
        "<h2>" +
        title +
        "</h2>" +
        renderStats([
          ["Locaties gevonden", FixNumber(objMines[typeMine])],
          ["Mijnen actief", FixNumber(objMines[active])],
          [
            "Vrije locaties",
            FixNumber(+objMines[typeMine] - +objMines[active]),
          ],
          ["Prijs per mijn", FixMoney(objMines[mineCost])],
          steel > 0 && ["Staal per mijn", FixUnit(steel, "ton")],
          ["Verkoopwaarde", FixMoney(objMines[mineCost] * 0.75)],
        ]) +
        "<div class='actions'>" +
        "<button type='button' class='btn btn-primary' onClick='objMines.addMine(" +
        mineCode +
        ", 1);' id='" +
        mineButton +
        "'>Bouw " +
        mineName +
        "</button>" +
        objBulk.buttons(typeMine.replace("AmountProspected", "")) +
        " <button type='button' class='btn btn-danger' onClick='objMines.addMine(" +
        mineCode +
        ", 0);' id='" +
        mineButton +
        "Sell'>Verkoop " +
        mineName +
        "</button></div>";
      return 0;
    }

    generateText(
      "iron-mines",
      "ironAmountProspected",
      "ironMineCost",
      "ironAmountActive",
      "ijzerertsmijn",
      1,
      "ironMineButton",
      "IJzerertsmijnen"
    );
    generateText(
      "coal-mines",
      "coalAmountProspected",
      "coalMineCost",
      "coalAmountActive",
      "steenkoolmijn",
      2,
      "coalMineButton",
      "Steenkoolmijnen"
    );
    generateText(
      "uranium-mines",
      "uraniumAmountProspected",
      "uraniumMineCost",
      "uraniumAmountActive",
      "uraniummijn",
      3,
      "uraniumMineButton",
      "Uraniummijnen"
    );
    // Kopermijnen: vanaf level 12
    if (objCopperMine.unlocked()) {
      generateText(
        "copper-mines",
        "copperAmountProspected",
        "copperMineCost",
        "copperAmountActive",
        "kopermijn",
        4,
        "copperMineButton",
        "Kopermijnen"
      );
    } else {
      document.getElementById("copper-mines").innerHTML = "";
    }
    // Goudmijnen: vanaf level 14
    if (objGoldMine.unlocked()) {
      generateText(
        "gold-mines",
        "goldAmountProspected",
        "goldMineCost",
        "goldAmountActive",
        "goudmijn",
        5,
        "goldMineButton",
        "Goudmijnen"
      );
    } else {
      document.getElementById("gold-mines").innerHTML = "";
    }
    // Diamantmijnen: vanaf level 15
    if (objDiamondMine.unlocked()) {
      generateText(
        "diamond-mines",
        "diamondAmountProspected",
        "diamondMineCost",
        "diamondAmountActive",
        "diamantmijn",
        6,
        "diamondMineButton",
        "Diamantmijnen"
      );
    } else {
      document.getElementById("diamond-mines").innerHTML = "";
    }

    var updateMineButtons = function (mineTypes) {
      for (let i = 0; i < mineTypes.length; i++) {
        var activeMines = mineTypes[i] + "AmountActive";
        var prospectedMines = mineTypes[i] + "AmountProspected";
        var buttonMine = mineTypes[i] + "MineButton";
        var full = objMines[prospectedMines] <= +objMines[activeMines];
        document.getElementById(buttonMine).disabled = full;
        document
          .querySelectorAll("[data-bulk^='" + mineTypes[i] + "-']")
          .forEach(function (button) {
            button.disabled = full;
          });
      }
    };

    var mineTypes = ["iron", "coal", "uranium"];
    if (objCopperMine.unlocked()) mineTypes.push("copper");
    if (objGoldMine.unlocked()) mineTypes.push("gold");
    if (objDiamondMine.unlocked()) mineTypes.push("diamond");
    updateMineButtons(mineTypes);
    Display.updateRows();
  },
  init: function () {
    objMines.ironAmountProspected =
      parseInt(store.getItem("ironAmountProspected")) || 0;
    objMines.coalAmountProspected =
      parseInt(store.getItem("coalAmountProspected")) || 0;
    objMines.uraniumAmountProspected =
      parseInt(store.getItem("uraniumAmountProspected")) || 0;
    objMines.copperAmountProspected =
      parseInt(store.getItem("copperAmountProspected")) || 0;
    objMines.goldAmountProspected =
      parseInt(store.getItem("goldAmountProspected")) || 0;
    objMines.diamondAmountProspected =
      parseInt(store.getItem("diamondAmountProspected")) || 0;
    objMines.ironAmountActive =
      parseInt(store.getItem("ironAmountActive")) || 0;
    objMines.coalAmountActive =
      parseInt(store.getItem("coalAmountActive")) || 0;
    objMines.uraniumAmountActive =
      parseInt(store.getItem("uraniumAmountActive")) || 0;
    objMines.copperAmountActive =
      parseInt(store.getItem("copperAmountActive")) || 0;
    objMines.goldAmountActive =
      parseInt(store.getItem("goldAmountActive")) || 0;
    objMines.diamondAmountActive =
      parseInt(store.getItem("diamondAmountActive")) || 0;
    objMines.ironMineCost =
      parseInt(store.getItem("ironMineCost")) || 100000000;
    objMines.coalMineCost =
      parseInt(store.getItem("coalMineCost")) || 125000000;
    objMines.uraniumMineCost =
      parseInt(store.getItem("uraniumMineCost")) || 200000000;
    objMines.copperMineCost =
      parseInt(store.getItem("copperMineCost")) || 150000000;
    objMines.goldMineCost =
      parseInt(store.getItem("goldMineCost")) || 2000000000;
    objMines.diamondMineCost =
      parseInt(store.getItem("diamondMineCost")) || 5000000000;
    objMines.prospectTimerActive = parseInt(store.getItem("pTimer")) || 0;
    objMines.prospecting = parseInt(store.getItem("prospecting")) || 0;
    document.getElementById("Prospecting-col").style.display = "none";
    if (+objMines.prospecting === 1) {
      document.getElementById("ProspectingButton").disabled = true;
      document.getElementById("ProspectingProgress").innerHTML =
        "Zoeken klaar over " + objMines.prospectTimerActive + " seconden";
    } else {
      document.getElementById("ProspectingButton").disabled = false;
    }
    objMines.showProspecting();
    objMines.showMining();
  },
};

// Steenkool

var objCoalMine = {
  production: 3500,
  energy: 250,
  produce: function () {
    if (objPause.is("Coal-col")) return 0;
    if (
      +objEnergy.available <
      +objMines.coalAmountActive * +objCoalMine.energy
    ) {
      var activeMines = Math.floor(+objEnergy.available / +objCoalMine.energy);
    } else {
      var activeMines = +objMines.coalAmountActive;
    }
    var remainingStorage =
      +objCoal.storage * +objCoal.storageCap - +objCoal.amount;
    if (+activeMines * +objCoalMine.production > remainingStorage) {
      activeMines = Math.floor(+remainingStorage / +objCoalMine.production);
    }
    if (+activeMines == 0) {
      return 0;
    }
    objEnergy.use(+activeMines * +objCoalMine.energy, "Steenkoolmijn");
    objCoal.add(
      objStats.count("steenkool", +activeMines * +objCoalMine.production)
    );
    objCoal.show();
  },
  show: function () {
    document.getElementById("coalMine").innerHTML =
      renderResource({
        amount: objCoal.amount,
        production: +objMines.coalAmountActive * +objCoalMine.production,
        energy: +objMines.coalAmountActive * +objCoalMine.energy,
        period: "tick",
        price: objCoal.price,
        silos: objCoal.storage,
        siloCap: objCoal.storageCap,
        siloPrice: objCoal.storagePrice,
        hint:
          "Een mijn levert " +
          FixUnit(objCoalMine.production, "ton") +
          " per tick voor " +
          FixNumber(objCoalMine.energy) +
          " energie. Bijkopen kan alleen onder 5% voorraad, voor " +
          FixMoney(+objCoal.price * 1.5) +
          " per ton.",
      }) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objCoal.sell(0)' id='sellCoalButton'>Verkoop steenkool</button> " +
      "<button type='button' class='btn btn-primary' onClick='objCoal.buy(50000)' id='buyCoalButton'>Koop 50.000 ton steenkool</button> " +
      "<button type='button' class='btn btn-primary' onClick='objCoal.addSilo();' id='coalSiloButton'>Bouw steenkoolsilo</button>" +
      "</div>";
  },
};

var objCoal = {
  amount: 0,
  storage: 1,
  storageCap: 1000000,
  storagePrice: 1000000,
  price: 50,
  add: function (amountAdded) {
    fillStorage("objCoal", amountAdded, "coalAmount");
  },
  use: function (amount) {
    if (+amount >= +objCoal.amount) {
      delivered = objCoal.amount;
      objCoal.amount = 0;
      store.setItem("coalAmount", +objCoal.amount);
      objCoal.show();
      return delivered;
    }
    objCoal.amount = +objCoal.amount - +amount;
    store.setItem("coalAmount", +objCoal.amount);
    objCoal.show();
    return amount;
  },
  sell: function (amountSold) {
    var coalNeeded =
      +objCoalPowerPlant.amount * +objCoalPowerPlant.CoalUsageTons;
    var reason = "Verkoop overschot steenkool";
    if (+amountSold == 0) {
      amountSold = objCoal.amount;
      reason = "Handmatige verkoop steenkool";
      if (+amountSold <= +coalNeeded) {
        return 0;
      }
      objCoal.use(+amountSold - +coalNeeded);
    }
    if (+amountSold <= +coalNeeded) {
      return 0;
    }
    amountSold = +amountSold - +coalNeeded;
    var profit = +amountSold * +objCoal.price;
    objMoney.add(+profit, reason, 13, amountSold);

    return 0;
  },
  buy: function (amountBought) {
    if (objCoal.amount < +objCoal.storage * +objCoal.storageCap * 0.05) {
      var cost = +amountBought * (+objCoal.price * 1.5);
      if (+cost > +objMoney.amount) {
        notificationOverlay("Niet genoeg doekoe!", "Steenkool", "fa-euro-sign");
        return 0;
      }
      objMoney.use(+cost);
      objCoal.add(+amountBought);
    }
  },
  addSilo: function () {
    if (moneyCheck(+objCoal.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Steenkoolopslag",
        "fa-euro-sign"
      );
      return 0;
    } else {
      objMoney.use(+objCoal.storagePrice);
      objCoal.storage++;
      store.setItem("coalSilos", +objCoal.storage);
      objCoal.show();
    }
  },
  show: function () {
    objCoalMine.show();
    var percentageFilled =
      (+objCoal.amount / (+objCoal.storageCap * +objCoal.storage)) * 100;
    percentageFilled = Math.round(percentageFilled * 100) / 100;
    if (objCoalPowerPlant.amount > 0) {
      document.getElementById("CoalStock").innerHTML = renderBar(
        "Steenkool",
        FixUnit(objCoal.amount, "ton"),
        percentageFilled
      );
    }
  },
  init: function () {
    objCoal.amount = store.getItem("coalAmount") || 0;
    objCoal.storage = store.getItem("coalSilos") || 1;
    objCoal.storageCap = store.getItem("coalSiloCap") || 1000000;
    objCoal.show();
  },
};

// Ijzer

var objIronMine = {
  production: 1000,
  energy: 450,
  produce: function () {
    if (objPause.is("Iron-col")) return 0;
    if (
      +objEnergy.available <
      +objMines.ironAmountActive * +objIronMine.energy
    ) {
      var activeMines = Math.floor(+objEnergy.available / +objIronMine.energy);
    } else {
      var activeMines = +objMines.ironAmountActive;
    }
    var remainingStorage =
      +objIronOre.storage * +objIronOre.storageCap - +objIronOre.amount;
    if (+activeMines * +objIronMine.production > remainingStorage) {
      activeMines = Math.floor(+remainingStorage / +objIronMine.production);
    }
    if (+activeMines == 0) {
      return 0;
    }
    objEnergy.use(+activeMines * +objIronMine.energy, "IJzermijn");
    objIronOre.add(
      objStats.count("ijzererts", +activeMines * +objIronMine.production)
    );
    objIronOre.show();
  },
  show: function () {
    document.getElementById("IronMine").innerHTML =
      renderResource({
        amount: objIronOre.amount,
        production: +objMines.ironAmountActive * +objIronMine.production,
        energy: +objMines.ironAmountActive * +objIronMine.energy,
        period: "tick",
        price: objIronOre.price,
        silos: objIronOre.storage,
        siloCap: objIronOre.storageCap,
        siloPrice: objIronOre.storagePrice,
        hint:
          "Een mijn levert " +
          FixUnit(objIronMine.production, "ton") +
          " per tick voor " +
          FixNumber(objIronMine.energy) +
          " energie. Is de opslag vol, dan stoppen de mijnen.",
      }) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objIronOre.sell(0)' id='sellIronButton'>Verkoop ijzererts</button> " +
      "<button type='button' class='btn btn-primary' onClick='objIronOre.addSilo();' id='ironOreSiloButton'>Bouw ijzererts-silo</button>" +
      "</div>";
  },
};

var objIronOre = {
  amount: 0,
  storage: 1,
  storageCap: 1000000,
  storagePrice: 1000000,
  price: 175,
  add: function (amountAdded) {
    fillStorage("objIronOre", amountAdded, "ironOreAmount");
  },
  use: function (amount) {
    useResource("objIronOre", amount, "ironOreAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot ijzererts";
    priceValue = +objIronOre.price * 0.2;
    if (+amountSold == 0) {
      amountSold = objIronOre.amount;
      objIronOre.use(+amountSold);
      reason = "Handmatige verkoop ijzererts";
      priceValue = +objIronOre.price;
    }
    var profit = +amountSold * +priceValue;
    objMoney.add(+profit, reason, 14, amountSold);
    return 0;
  },
  addSilo: function () {
    if (moneyCheck(+objIronOre.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "IJzerertsopslag",
        "fa-euro-sign"
      );
      return 0;
    } else {
      objMoney.use(+objIronOre.storagePrice);
      objIronOre.storage++;
      store.setItem("ironOreSilos", +objIronOre.storage);
      objIronOre.show();
    }
  },
  show: function () {
    objIronMine.show();
  },
  init: function () {
    objIronOre.amount = store.getItem("ironOreAmount") || 0;
    objIronOre.storage = store.getItem("ironOreSilos") || 1;
    objIronOre.storageCap = store.getItem("ironOreSiloCap") || 1000000;
    objIronOre.show();
  },
};

var objIronMelter = {
  amount: 0,
  cost: 250000000,
  production: 10000,
  ironOreNeeded: 10000,
  coalNeeded: 1000,
  energy: 5000,
  activeSmelters: 0,
  // Hoogovenbesturing (vanaf level 13): bestuurde hoogovens maken iedere tick zelf staal
  controlled: 0,
  controlPCB: 5000,
  autoActive: 0,
  add: function (amount) {
    if (amount < 0) {
      imPrice = +objIronMelter.cost * 0.75;
      if (objIronMelter.amount == 0) {
        notificationOverlay(
          "Geen hoogovens om te verkopen",
          "Hoogoven",
          "fa-industry"
        );
        return 0;
      }
    } else {
      imPrice = +objIronMelter.cost;
    }
    if (+objMoney.amount > +imPrice * +amount) {
      objMoney.use(+imPrice * +amount);
      objIronMelter.amount = +objIronMelter.amount + +amount;
      if (+objIronMelter.controlled > +objIronMelter.amount) {
        objIronMelter.controlled = +objIronMelter.amount;
        store.setItem("smelterControls", objIronMelter.controlled);
      }
    } else {
      notificationOverlay("Niet genoeg doekoe!", "Hoogoven", "fa-euro-sign");
    }
    store.setItem("ironSmelters", objIronMelter.amount);
    objIronMelter.show();
    objSteel.show();
  },
  produce: function () {
    if (objIronMelter.amount == 0) {
      notificationOverlay("Geen hoogovens!", "Hoogovens", "fa-industry");
      return 0;
    }
    // Met de hand: alleen de hoogovens zonder besturing
    var smelters = +objIronMelter.amount - +objIronMelter.controlled;
    if (smelters < 1) {
      notificationOverlay(
        "Al je hoogovens hebben besturing en maken zelf staal.",
        "Hoogovens",
        "fa-industry"
      );
      return 0;
    }
    var coalNeededT = smelters * +objIronMelter.coalNeeded;
    var ironOreNeededT = smelters * +objIronMelter.ironOreNeeded;
    var energyNeededT = smelters * +objIronMelter.energy;
    objIronMelter.activeSmelters = smelters;

    function setProductionMax(selectedResource) {
      coalNeededT = +objIronMelter.activeSmelters * +objIronMelter.coalNeeded;
      ironOreNeededT =
        +objIronMelter.activeSmelters * +objIronMelter.ironOreNeeded;
      energyNeededT = +objIronMelter.activeSmelters * +objIronMelter.energy;
      if (+objIronMelter.activeSmelters == 0) {
        notificationOverlay(
          "Niet genoeg " + selectedResource,
          "Hoogovens",
          "fa-industry"
        );
        return 0;
      }
    }
    if (+coalNeededT > +objCoal.amount) {
      objIronMelter.activeSmelters = Math.floor(
        +objCoal.amount / +objIronMelter.coalNeeded
      );
      if (setProductionMax("steenkool") == 0) {
        return 0;
      }
    }
    if (+ironOreNeededT > +objIronOre.amount) {
      objIronMelter.activeSmelters = Math.floor(
        +objIronOre.amount / +objIronMelter.ironOreNeeded
      );
      if (setProductionMax("ijzererts") == 0) {
        return 0;
      }
    }
    if (+energyNeededT > +objEnergy.available) {
      objIronMelter.activeSmelters = Math.floor(
        +objEnergy.available / +objIronMelter.energy
      );
      if (setProductionMax("energie") == 0) {
        return 0;
      }
    }
    objCoal.use(+coalNeededT);
    objIronOre.use(+ironOreNeededT);
    objEnergy.use(+energyNeededT, "Staalproductie");
    objSteel.add(
      objStats.count(
        "staal",
        +objIronMelter.activeSmelters * +objIronMelter.production
      )
    );
    objFlows.pulseAll([
      ["Coal-col", "SteelProduction-col"],
      ["Iron-col", "SteelProduction-col"],
      ["SteelProduction-col", "SteelInfo-col"],
    ]);
    objSteel.show();
  },
  addControl: function () {
    if (!objElectronics.unlocked()) return 0;
    if (+objIronMelter.controlled >= +objIronMelter.amount) {
      notificationOverlay(
        "Iedere hoogoven heeft al besturing. Bouw eerst een extra hoogoven.",
        "Hoogovenbesturing",
        "fa-info"
      );
      return 0;
    }
    if (!objPCB.has(objIronMelter.controlPCB, "Hoogovenbesturing")) return 0;
    objPCB.use(objIronMelter.controlPCB);
    objFlows.pulse("PCB-col", "SteelProduction-col");
    objIronMelter.controlled++;
    store.setItem("smelterControls", objIronMelter.controlled);
    objIronMelter.show();
    objPause.update("SteelProduction-col");
  },
  // Bestuurde hoogovens: iedere tick zoveel runs als er ijzererts, steenkool en energie is
  autoProduce: function () {
    objIronMelter.autoActive = 0;
    if (+objIronMelter.controlled < 1 || objPause.is("SteelProduction-col"))
      return 0;
    var active = Math.min(
      +objIronMelter.controlled,
      Math.floor(+objIronOre.amount / +objIronMelter.ironOreNeeded),
      Math.floor(+objCoal.amount / +objIronMelter.coalNeeded),
      Math.floor(+objEnergy.available / +objIronMelter.energy)
    );
    if (active < 1) return 0;
    objIronMelter.autoActive = active;
    objIronOre.use(active * +objIronMelter.ironOreNeeded);
    objCoal.use(active * +objIronMelter.coalNeeded);
    objEnergy.use(active * +objIronMelter.energy, "Hoogovenbesturing");
    objSteel.add(objStats.count("staal", active * +objIronMelter.production));
    objSteel.show();
  },
  showControl: function () {
    var el = document.getElementById("steelControl");
    if (!objElectronics.unlocked() || +objMines.ironAmountProspected < 1) {
      el.innerHTML = "";
      return;
    }
    var free = +objIronMelter.amount - +objIronMelter.controlled;
    el.innerHTML =
      "<h3>Besturing</h3>" +
      renderStats([
        [
          "Bestuurde hoogovens",
          FixNumber(objIronMelter.controlled) +
            " van " +
            FixNumber(objIronMelter.amount),
        ],
        ["Nu actief", FixNumber(objIronMelter.autoActive)],
        ["Printplaten per besturing", FixNumber(objIronMelter.controlPCB)],
      ]) +
      renderHint(
        "Een hoogoven met besturing maakt iedere tick zelf staal zolang er ijzererts, steenkool en energie is. Maak staal gebruikt alleen de hoogovens zonder besturing."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objIronMelter.addControl();' id='addSmelterControl'" +
      (free < 1 ? " disabled" : "") +
      ">Installeer besturing</button>" +
      "</div>";
  },
  show: function () {
    objIronMelter.showControl();
    if (+objMines.ironAmountProspected > 0) {
      document.getElementById("steelProduction").innerHTML =
        "<h2>Hoogovens</h2>" +
        renderStats([
          ["Hoogovens", FixNumber(objIronMelter.amount)],
          ["Prijs per hoogoven", FixMoney(objIronMelter.cost)],
          ["Verkoopwaarde", FixMoney(objIronMelter.cost * 0.75)],
        ]) +
        "<h3>Per hoogoven per run</h3>" +
        renderStats([
          ["IJzererts", FixUnit(objIronMelter.ironOreNeeded, "ton")],
          ["Steenkool", FixUnit(objIronMelter.coalNeeded, "ton")],
          ["Energie", FixNumber(objIronMelter.energy)],
          ["Staal", FixUnit(objIronMelter.production, "ton")],
        ]) +
        "<div class='actions'>" +
        "<button type='button' class='btn btn-primary' onClick='objIronMelter.add(1);' id='buyIronMelter'>Bouw hoogoven</button>" +
        objBulk.buttons("smelter") +
        " " +
        "<button type='button' class='btn btn-danger' onClick='objIronMelter.add(-1);' id='sellIronMelter'>Verkoop hoogoven</button>" +
        "</div>";
      // Maak staal gebruikt alleen de hoogovens zonder besturing
      var manual = +objIronMelter.amount - +objIronMelter.controlled;
      document.getElementById("steelProductionStats").innerHTML =
        "<h3>Totaal per run" +
        (+objIronMelter.controlled > 0 ? " (zonder besturing)" : "") +
        "</h3>" +
        renderStats([
          ["Staal", FixUnit(manual * +objIronMelter.production, "ton")],
          ["IJzererts", FixUnit(manual * objIronMelter.ironOreNeeded, "ton")],
          ["Steenkool", FixUnit(manual * objIronMelter.coalNeeded, "ton")],
          ["Energie", FixNumber(manual * objIronMelter.energy)],
        ]) +
        "<div class='actions'>" +
        "<button type='button' class='btn btn-success' onClick='objIronMelter.produce();' id='makeSteelButton'>Maak staal</button>" +
        "</div>";
    }
  },
  init: function () {
    objIronMelter.amount = store.getItem("ironSmelters") || 0;
    objIronMelter.controlled = Math.min(
      +store.getItem("smelterControls") || 0,
      +objIronMelter.amount
    );
    objIronMelter.show();
  },
};

var objSteel = {
  amount: 0,
  price: 0,
  storage: 1,
  storageCap: 1000000,
  storagePrice: 15000000,
  addStorage: function () {
    if (moneyCheck(+objSteel.storagePrice) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Staalopslag", "fa-euro-sign");
      return 0;
    } else {
      objMoney.use(+objSteel.storagePrice);
      objSteel.storage++;
      store.setItem("steelStorage", objSteel.storage);
      objSteel.show();
    }
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot staal";
    if (+amountSold == 0) {
      amountSold = +objSteel.amount;
      reason = "Handmatige verkoop staal";
      objSteel.use(+amountSold);
      var profit = +amountSold * +objSteel.price;
      objMoney.add(+profit, reason, 15, amountSold);
    } else {
      var profit = +amountSold * (+objSteel.price * 0.2);
      objMoney.add(+profit, reason, 15, amountSold);
    }
    return 0;
  },
  add: function (amountAdded) {
    fillStorage("objSteel", amountAdded, "steelAmount");
  },
  use: function (amount) {
    useResource("objSteel", amount, "steelAmount");
  },
  show: function () {
    var steelCapacity = +objSteel.storage * +objSteel.storageCap;
    document.getElementById("Steel").innerHTML =
      "<h2>Staal</h2>" +
      renderBar(
        "Voorraad",
        FixUnit(objSteel.amount, "ton"),
        (+objSteel.amount / steelCapacity) * 100
      ) +
      renderStats([
        ["Vrije ruimte", FixUnit(steelCapacity - +objSteel.amount, "ton")],
      ]);
    // Verkopen links en opslag rechts, net als bij kunststof (zie de brede kaarten in index.html)
    document.getElementById("steelStats").innerHTML =
      renderHint("Wat niet past wordt verkocht voor 20% van de marktprijs.") +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objSteel.sell(0)' id='sellSteel'>Verkoop staal</button>" +
      "</div>";
    document.getElementById("steelStorage").innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Loodsen",
          FixNumber(objSteel.storage) +
            " (" +
            FixUnit(steelCapacity, "ton") +
            ")",
        ],
        ["Prijs extra loods", FixMoney(objSteel.storagePrice)],
        ["Capaciteit per loods", FixUnit(objSteel.storageCap, "ton")],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objSteel.addStorage();' id='addSteelStorage'>Koop staalopslag</button>" +
      "</div>";
  },
  showPrice: function () {
    document.getElementById("steelPrice").innerHTML = renderStats([
      ["Prijs per ton", FixMoney(objSteel.price)],
    ]);
  },
  init: function () {
    objSteel.amount = store.getItem("steelAmount") || 0;
    objSteel.storage = store.getItem("steelStorage") || 1;
    if (+objIronMelter.amount < 1 && +objSteel.amount < 1) {
      return 0;
    }
    objSteel.show();
  },
};

// Kunststoffabrieken
var objPlasticFactory = {
  amount: 0,
  cost: 2500000,
  production: 1000,
  steelNeededBuild: 100000,
  oilNeededProduction: 1000,
  energy: 500,
  activeFactories: 0,
  workers: 0,
  workerFood: 50,
  workerCost: 100000,
  addFactory: function (amount) {
    if (amount <= 0) {
      Price = +objPlasticFactory.cost * 0.75;
      if (objPlasticFactory.amount == 0) {
        notificationOverlay(
          "Geen kunststoffabrieken om te verkopen",
          "Kunststoffabriek",
          "fa-industry"
        );
        return 0;
      }
    } else {
      Price = +objPlasticFactory.cost;
    }
    if (+objMoney.amount > +Price * +amount) {
      objMoney.use(+Price * +amount);
      objPlasticFactory.amount = +objPlasticFactory.amount + +amount;
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Kunststoffabriek",
        "fa-euro-sign"
      );
    }
    store.setItem("plasticFactories", objPlasticFactory.amount);
    objPlasticFactory.show();
  },
  addWorker: function (amount) {
    if (amount == 0) {
      Price = 0;
      amount = -1;
      if (objPlasticFactory.workers < 1) {
        notificationOverlay(
          "Geen medewerkers om te ontslaan",
          "Kunststoffabriek",
          "fa-industry"
        );
        return 0;
      }
    } else {
      Price = +objPlasticFactory.workerCost;
      // Een medewerker bedient één fabriek
      if (+objPlasticFactory.workers >= +objPlasticFactory.amount) {
        notificationOverlay(
          "Iedere kunststoffabriek heeft al een medewerker. Bouw eerst een extra fabriek.",
          "Kunststoffabriek",
          "fa-industry"
        );
        return 0;
      }
    }
    if (+objMoney.amount > +Price * +amount) {
      objMoney.use(+Price * +amount);
      objPlasticFactory.workers = +objPlasticFactory.workers + +amount;
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Kunststoffabriek",
        "fa-euro-sign"
      );
    }
    store.setItem("plasticWorkers", objPlasticFactory.workers);
    objPlasticFactory.show();
  },
  produce: function (typeProduction) {
    // Gepauzeerd: de medewerkers werken niet (zelf op Maak kunststof klikken kan wel)
    if (typeProduction == 1 && objPause.is("platicFactory-col")) return 0;
    var factoriesActive = +objPlasticFactory.amount;
    if (typeProduction == 1) {
      if (
        +objStorehouse.pasta <
        +objPlasticFactory.workers * +objPlasticFactory.workerFood
      ) {
        factoriesActive = Math.floor(
          +objStorehouse.pasta / +objPlasticFactory.workerFood
        );
        if (factoriesActive == 0) {
          return 0;
        }
      } else {
        factoriesActive = objPlasticFactory.workers;
      }
      if (+factoriesActive > +objPlasticFactory.amount) {
        factoriesActive = +objPlasticFactory.amount;
      }
    }
    if (objPlasticFactory.amount == 0) {
      if (typeProduction == 0) {
        notificationOverlay(
          "Geen kunststoffabrieken!",
          "Kunststoffabriek",
          "fa-industry"
        );
      }
      return 0;
    }
    if (typeProduction == 0) {
      factoriesActive = Math.max(
        0,
        +objPlasticFactory.amount - +objPlasticFactory.workers
      );
      if (factoriesActive == 0) {
        notificationOverlay(
          "Alle kunststoffabrieken worden bediend door medewerkers",
          "Kunststoffabriek",
          "fa-industry"
        );
        return 0;
      }
    }

    if (+objEnergy.available < +factoriesActive * +objPlasticFactory.energy) {
      factoriesActive = Math.floor(
        +objEnergy.available / +objPlasticFactory.energy
      );
      if (factoriesActive == 0) {
        if (typeProduction == 0) {
          notificationOverlay(
            "Niet genoeg energie!",
            "Kunststoffabriek",
            "fa-industry"
          );
        }
        return 0;
      }
    }
    if (
      +objOilTank.contents <
      +factoriesActive * +objPlasticFactory.oilNeededProduction
    ) {
      factoriesActive = Math.floor(
        +objOilTank.contents / +objPlasticFactory.oilNeededProduction
      );
      if (factoriesActive == 0) {
        if (typeProduction == 0) {
          notificationOverlay(
            "Niet genoeg olie!",
            "Kunststoffabriek",
            "fa-industry"
          );
        }
        return 0;
      }
    }
    var SpaceLeft =
      +objPlastic.storage * +objPlastic.storageCap - +objPlastic.amount;
    if (+SpaceLeft < +factoriesActive * +objPlasticFactory.production) {
      factoriesActive = Math.floor(+SpaceLeft / +objPlasticFactory.production);
      if (factoriesActive == 0) {
        if (typeProduction == 0) {
          notificationOverlay(
            "Niet genoeg opslagruimte!",
            "Kunststoffabriek",
            "fa-industry"
          );
        }
        return 0;
      }
    }
    objOilTank.use(
      +factoriesActive * +objPlasticFactory.oilNeededProduction,
      "Plasticfabriek"
    );
    objEnergy.use(+factoriesActive * +objPlasticFactory.energy, "Factories");
    if (typeProduction == 1) {
      objStorehouse.removePasta(
        +factoriesActive * +objPlasticFactory.workerFood
      );
    }
    objPlastic.add(
      objStats.count(
        "kunststof",
        +factoriesActive * +objPlasticFactory.production
      )
    );
    objFlows.pulseAll([
      ["olie-col", "platicFactory-col"],
      ["platicFactory-col", "plasticStorage-col"],
    ]);
  },
  show: function () {
    document.getElementById("pFactory1").innerHTML =
      renderStats([
        ["Fabrieken", FixNumber(objPlasticFactory.amount)],
        ["Prijs per fabriek", FixMoney(objPlasticFactory.cost)],
      ]) +
      "<h3>Per fabriek per run</h3>" +
      renderStats([
        ["Energie", FixNumber(objPlasticFactory.energy)],
        ["Olie", FixUnit(objPlasticFactory.oilNeededProduction, "vaten")],
        ["Opbrengst", FixUnit(objPlasticFactory.production, "eenheden")],
      ]);
    document.getElementById("pFactory2").innerHTML =
      objPlasticFactory.amount > 0
        ? "<h3>Totaal per run</h3>" +
          renderStats([
            [
              "Energie",
              FixNumber(+objPlasticFactory.amount * +objPlasticFactory.energy),
            ],
            [
              "Olie",
              FixUnit(
                +objPlasticFactory.amount *
                  +objPlasticFactory.oilNeededProduction,
                "vaten"
              ),
            ],
            [
              "Opbrengst",
              FixUnit(
                +objPlasticFactory.amount * +objPlasticFactory.production,
                "eenheden"
              ),
            ],
          ])
        : "";
    var staffed = Math.min(
      +objPlasticFactory.workers,
      +objPlasticFactory.amount
    );
    document.getElementById("plasticAuto").innerHTML =
      renderStats([
        ["Medewerkers", FixNumber(objPlasticFactory.workers)],
        [
          "Fabrieken zonder medewerker",
          FixNumber(+objPlasticFactory.amount - staffed),
        ],
        [
          "Pasta per 15 ticks",
          FixNumber(staffed * objPlasticFactory.workerFood) + " dozen",
        ],
        ["Prijs per medewerker", FixMoney(objPlasticFactory.workerCost)],
      ]) +
      renderHint(
        "Een medewerker bedient één fabriek en eet " +
          FixNumber(objPlasticFactory.workerFood) +
          " dozen pasta per 15 ticks. Ontslaan levert niets op."
      );
    var allStaffed = +objPlasticFactory.workers >= +objPlasticFactory.amount;
    document.getElementById("makePlastic").disabled = allStaffed;
    document.getElementById("hireWorker").disabled = allStaffed;
  },
  init: function () {
    objPlasticFactory.amount = store.getItem("plasticFactories") || 0;
    objPlasticFactory.workers = store.getItem("plasticWorkers") || 0;
    // objPlastic.init();
    objPlasticFactory.show();
  },
};

var objPlastic = {
  amount: 0,
  price: 0,
  storage: 1,
  storageCap: 100000,
  storagePrice: 1500000,
  addStorage: function () {
    if (moneyCheck(+objPlastic.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Kunststofopslag",
        "fa-euro-sign"
      );
      return 0;
    } else {
      objMoney.use(+objPlastic.storagePrice);
      objPlastic.storage++;
      store.setItem("plasticStorage", objPlastic.storage);
      objPlastic.show();
    }
  },
  sell: function (amountSold, reason) {
    if (reason == null) {
      var reason = "Verkoop overschot kunststof";
    }
    if (+amountSold == 0) {
      amountSold = +objPlastic.amount;
      objPlastic.use(+amountSold);
      var profit = +amountSold * +objPlastic.price;
      objMoney.add(+profit, reason, 16, amountSold);
    } else {
      var profit = +amountSold * (+objPlastic.price * 0.2);
      objMoney.add(+profit, reason, 16, amountSold);
    }

    return 0;
  },
  add: function (amountAdded) {
    fillStorage("objPlastic", amountAdded, "plasticAmount");
  },
  use: function (amount) {
    useResource("objPlastic", amount, "plasticAmount");
  },
  show: function () {
    document.getElementById("plasticStorage").innerHTML = renderStats([
      [
        "Voorraad",
        renderStock(
          FixUnit(objPlastic.amount, "eenheden"),
          (+objPlastic.amount /
            (+objPlastic.storage * +objPlastic.storageCap)) *
            100
        ),
      ],
      [
        "Vrije ruimte",
        FixUnit(
          +objPlastic.storage * +objPlastic.storageCap - +objPlastic.amount,
          "eenheden"
        ),
      ],
    ]);
    document.getElementById("plasticStoragePrice").innerHTML = renderStats([
      [
        "Opslagcapaciteit",
        FixUnit(+objPlastic.storage * +objPlastic.storageCap, "eenheden"),
      ],
      ["Prijs extra opslag", FixMoney(objPlastic.storagePrice)],
      ["Extra capaciteit", FixUnit(objPlastic.storageCap, "eenheden")],
    ]);
  },
  // Kunststof volgt de olieprijs, dus ook de trend (#122)
  previousPrice: function () {
    return objOil.previous == null ? null : +objOil.previous * 8 + 100;
  },
  showPrice: function () {
    objPlastic.price = +objOil.price * 8 + 100;
    document.getElementById("plasticPrice").innerHTML = renderStats([
      [
        "Prijs per eenheid",
        FixMoney(objPlastic.price) +
          renderTrend(objPlastic.price, objPlastic.previousPrice()),
      ],
    ]);
  },
  init: function () {
    objPlastic.amount = store.getItem("plasticAmount") || 0;
    objPlastic.storage = store.getItem("plasticStorage") || 1;
    objPlastic.show();
    if (+objPlasticFactory.amount > 0 || +objPlastic.amount > 0) {
      objPlastic.showPrice();
    }
  },
};

// Uranium

// Uraniummijn: draait in diensten van `period` ticks. Het personeel eet een
// tiende van de oorspronkelijke pasta: 20 dozen per dienst in plaats van 200 (#82).
var objUraniumMine = {
  period: 10,
  production: 100,
  energy: 2500,
  workers: 20,
  workerFood: 1,
  produce: function () {
    if (objPause.is("Uranium-col")) return 0;
    var activeMines = objMines.uraniumAmountActive;
    if (
      +objStorehouse.pasta <
      activeMines * (+objUraniumMine.workers * +objUraniumMine.workerFood)
    ) {
      activeMines = Math.floor(
        +objStorehouse.pasta /
          (+objUraniumMine.workers * +objUraniumMine.workerFood)
      );
      if (+activeMines == 0) {
        return 0;
      }
    }
    if (+objEnergy.available < +activeMines * +objUraniumMine.energy) {
      activeMines = Math.floor(+objEnergy.available / +objUraniumMine.energy);
      if (+activeMines == 0) {
        return 0;
      }
    }
    var remainingStorage =
      +objUraniumOre.storage * +objUraniumOre.storageCap -
      +objUraniumOre.amount;
    if (+activeMines * +objUraniumMine.production > remainingStorage) {
      activeMines = Math.floor(+remainingStorage / +objUraniumMine.production);
      if (+activeMines == 0) {
        return 0;
      }
    }

    objEnergy.use(+activeMines * +objUraniumMine.energy, "Uraniummijn");
    objStorehouse.removePasta(
      activeMines * (+objUraniumMine.workers * +objUraniumMine.workerFood)
    );
    objUraniumOre.add(
      objStats.count("uranium", +activeMines * +objUraniumMine.production)
    );
    objUraniumOre.show();
  },
  show: function () {
    document.getElementById("UraniumMine1").innerHTML = renderResource({
      amount: objUraniumOre.amount,
      production: +objMines.uraniumAmountActive * +objUraniumMine.production,
      energy: +objMines.uraniumAmountActive * +objUraniumMine.energy,
      period: objUraniumMine.periodText(),
      extra: [
        "Pasta",
        FixNumber(
          +objUraniumMine.workerFood *
            (+objUraniumMine.workers * +objMines.uraniumAmountActive)
        ) +
          " dozen per " +
          objUraniumMine.periodText(),
      ],
      price: objUraniumOre.price,
      silos: objUraniumOre.storage,
      siloCap: objUraniumOre.storageCap,
      siloPrice: objUraniumOre.storagePrice,
      hint:
        "Een mijn levert " +
        FixUnit(objUraniumMine.production, "ton") +
        " per " +
        objUraniumMine.periodText() +
        " voor " +
        FixNumber(objUraniumMine.energy) +
        " energie; het personeel eet pasta. Is de opslag vol, dan stoppen de mijnen.",
    });
    document.getElementById("UraniumMine").innerHTML = "";
  },
  periodText: function () {
    return objUraniumMine.period === 1
      ? "tick"
      : objUraniumMine.period + " ticks";
  },
};

var objUraniumOre = {
  amount: 0,
  storage: 1,
  storageCap: 100000,
  storagePrice: 1000000,
  price: 175,
  add: function (amountAdded) {
    fillStorage("objUraniumOre", amountAdded, "uraniumOreAmount");
  },
  use: function (amount) {
    useResource("objUraniumOre", amount, "uraniumOreAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot uranium";
    priceValue = +objUraniumOre.price * 0.2;
    if (+amountSold == 0) {
      amountSold = objUraniumOre.amount;
      objUraniumOre.use(+amountSold);
      reason = "Handmatige verkoop uranium";
      priceValue = +objUraniumOre.price;
    }
    var profit = +amountSold * +priceValue;
    objMoney.add(+profit, reason, 17, amountSold);
    return 0;
  },
  addSilo: function () {
    if (moneyCheck(+objUraniumOre.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Uraniumopslag",
        "fa-euro-sign"
      );
      return 0;
    } else {
      objMoney.use(+objUraniumOre.storagePrice);
      objUraniumOre.storage++;
      store.setItem("uraniumOreSilos", +objUraniumOre.storage);
      objUraniumOre.show();
    }
  },
  show: function () {
    objUraniumMine.show();
  },
  init: function () {
    objUraniumOre.amount = store.getItem("uraniumOreAmount") || 0;
    objUraniumOre.storage = store.getItem("uraniumOreSilos") || 1;
    objUraniumOre.storageCap = store.getItem("uraniumOreSiloCap") || 100000;
    objUraniumOre.show();
  },
};

// Koper (vanaf level 12): kopermijn -> kopererts -> kopersmelterij -> koper
var objCopperMine = {
  production: 1000,
  energy: 600,
  pasta: 0.2, // dozen per tick per mijn
  steelNeeded: 25000,
  activeMines: 0,
  unlocked: function () {
    return +objPlayerInfo.level >= 12 && +objResearch.level > 3;
  },
  // Pasta die de kopermijnen laten liggen: het uraniumpersoneel gaat voor (60 ticks voorraad),
  // anders vallen bij een tekort de kerncentrales stil
  pastaReserve: function () {
    return (
      ((+objMines.uraniumAmountActive *
        +objUraniumMine.workers *
        +objUraniumMine.workerFood) /
        +objUraniumMine.period) *
      60
    );
  },
  produce: function () {
    if (objPause.is("Copper-col")) {
      objCopperMine.activeMines = 0;
      return 0;
    }
    var pasta = Math.max(
      0,
      +objStorehouse.pasta - objCopperMine.pastaReserve()
    );
    var active = Math.min(
      +objMines.copperAmountActive,
      Math.floor(pasta / objCopperMine.pasta),
      Math.floor(+objEnergy.available / objCopperMine.energy),
      Math.floor(objCopperOre.space() / objCopperMine.production)
    );
    objCopperMine.activeMines = Math.max(0, active);
    if (active < 1) return 0;
    objEnergy.use(active * objCopperMine.energy, "Kopermijn");
    objStorehouse.removePasta(active * objCopperMine.pasta);
    objCopperOre.add(
      objStats.count("kopererts", active * objCopperMine.production)
    );
  },
  show: function () {
    var el = document.getElementById("CopperMine");
    if (!objCopperMine.unlocked()) {
      el.innerHTML = "";
      return;
    }
    var mines = +objMines.copperAmountActive;
    el.innerHTML =
      "<h3>Kopererts</h3>" +
      renderResource({
        amount: objCopperOre.amount,
        production: mines * objCopperMine.production,
        energy: mines * objCopperMine.energy,
        period: "tick",
        extra: [
          "Pasta",
          FixNumber(mines * objCopperMine.pasta) + " dozen per tick",
        ],
        price: objCopperOre.price,
        silos: objCopperOre.storage,
        siloCap: objCopperOre.storageCap,
        siloPrice: objCopperOre.storagePrice,
        hint:
          "Een mijn levert " +
          FixUnit(objCopperMine.production, "ton") +
          " erts per tick voor " +
          FixNumber(objCopperMine.energy) +
          " energie; het personeel eet 1 doos pasta per 5 ticks (het uraniumpersoneel gaat voor). Is de opslag vol, dan stoppen de mijnen.",
      }) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objCopperOre.sell(0)' id='sellCopperOreButton'>Verkoop kopererts</button> " +
      "<button type='button' class='btn btn-primary' onClick='objCopperOre.addSilo();' id='copperOreSiloButton'>Bouw kopererts-silo</button>" +
      "</div>";
  },
};

var objCopperOre = {
  amount: 0,
  storage: 1,
  storageCap: 1000000,
  storagePrice: 1000000,
  price: 250,
  space: function () {
    return (
      +objCopperOre.storage * +objCopperOre.storageCap - +objCopperOre.amount
    );
  },
  add: function (amountAdded) {
    fillStorage("objCopperOre", amountAdded, "copperOreAmount");
  },
  use: function (amount) {
    return useResource("objCopperOre", amount, "copperOreAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot kopererts";
    var priceValue = +objCopperOre.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objCopperOre.amount;
      if (amountSold <= 0) return 0;
      objCopperOre.use(amountSold);
      reason = "Handmatige verkoop kopererts";
      priceValue = +objCopperOre.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 21, amountSold);
  },
  addSilo: function () {
    if (moneyCheck(+objCopperOre.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Koperertsopslag",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(+objCopperOre.storagePrice);
    objCopperOre.storage++;
    store.setItem("copperOreSilos", objCopperOre.storage);
    objCopperOre.show();
  },
  show: function () {
    objCopperMine.show();
  },
  init: function () {
    objCopperOre.amount = +store.getItem("copperOreAmount") || 0;
    objCopperOre.storage = +store.getItem("copperOreSilos") || 1;
    objCopperOre.show();
  },
};

var objCopperSmelter = {
  amount: 0,
  cost: 250000000,
  steelNeeded: 25000,
  oreNeeded: 2000,
  coalNeeded: 200,
  energy: 2000,
  production: 200,
  active: 0,
  add: function (amount) {
    if (+amount < 0) {
      if (+objCopperSmelter.amount < 1) {
        notificationOverlay(
          "Geen smelterijen om te verkopen",
          "Kopersmelterij",
          "fa-industry"
        );
        return 0;
      }
      objCopperSmelter.amount--;
      objMoney.add(
        +objCopperSmelter.cost * 0.75,
        "Verkoop kopersmelterij",
        22,
        1
      );
    } else {
      if (moneyCheck(+objCopperSmelter.cost) == 0) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Kopersmelterij",
          "fa-euro-sign"
        );
        return 0;
      }
      if (+objSteel.amount < +objCopperSmelter.steelNeeded) {
        notificationOverlay("Niet genoeg staal!", "Kopersmelterij", "fa-box");
        return 0;
      }
      objMoney.use(+objCopperSmelter.cost);
      objSteel.use(+objCopperSmelter.steelNeeded);
      objSteel.show();
      objFlows.pulse("SteelInfo-col", "CopperSmelter-col");
      objCopperSmelter.amount++;
    }
    store.setItem("copperSmelters", objCopperSmelter.amount);
    objCopperSmelter.show();
  },
  // Draait iedere tick zolang er erts, steenkool, stroom en opslagruimte is
  produce: function () {
    if (objPause.is("CopperSmelter-col")) {
      objCopperSmelter.active = 0;
      return 0;
    }
    var active = Math.min(
      +objCopperSmelter.amount,
      Math.floor(+objCopperOre.amount / objCopperSmelter.oreNeeded),
      Math.floor(+objCoal.amount / objCopperSmelter.coalNeeded),
      Math.floor(+objEnergy.available / objCopperSmelter.energy),
      Math.floor(objCopper.space() / objCopperSmelter.production)
    );
    objCopperSmelter.active = Math.max(0, active);
    if (active < 1) return 0;
    objCopperOre.use(active * objCopperSmelter.oreNeeded);
    objCoal.use(active * objCopperSmelter.coalNeeded);
    objEnergy.use(active * objCopperSmelter.energy, "Kopersmelterij");
    objCopper.add(
      objStats.count("koper", active * objCopperSmelter.production)
    );
  },
  show: function () {
    var left = document.getElementById("copperSmelter");
    var right = document.getElementById("copperSmelterStats");
    if (!objCopperMine.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objCopperSmelter.amount;
    left.innerHTML =
      "<h2>Kopersmelterij</h2>" +
      renderStats([
        ["Smelterijen", FixNumber(n)],
        ["Prijs per smelterij", FixMoney(objCopperSmelter.cost)],
        ["Staal per smelterij", FixUnit(objCopperSmelter.steelNeeded, "ton")],
        ["Verkoopwaarde", FixMoney(objCopperSmelter.cost * 0.75)],
      ]) +
      "<h3>Per smelterij per tick</h3>" +
      renderStats([
        ["Kopererts", FixUnit(objCopperSmelter.oreNeeded, "ton")],
        ["Steenkool", FixUnit(objCopperSmelter.coalNeeded, "ton")],
        ["Energie", FixNumber(objCopperSmelter.energy)],
        ["Koper", FixUnit(objCopperSmelter.production, "ton")],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objCopperSmelter.add(1);' id='buyCopperSmelter'>Bouw kopersmelterij</button>" +
      objBulk.buttons("copperSmelter") +
      " " +
      "<button type='button' class='btn btn-danger' onClick='objCopperSmelter.add(-1);' id='sellCopperSmelter'>Verkoop kopersmelterij</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(objCopperSmelter.active) + " van " + FixNumber(n)],
        [
          "Koper",
          FixUnit(
            objCopperSmelter.active * objCopperSmelter.production,
            "ton per tick"
          ),
        ],
        [
          "Kopererts",
          FixUnit(
            objCopperSmelter.active * objCopperSmelter.oreNeeded,
            "ton per tick"
          ),
        ],
        [
          "Steenkool",
          FixUnit(
            objCopperSmelter.active * objCopperSmelter.coalNeeded,
            "ton per tick"
          ),
        ],
        [
          "Energie",
          FixNumber(objCopperSmelter.active * objCopperSmelter.energy) +
            " per tick",
        ],
      ]) +
      renderHint(
        "Een smelterij draait vanzelf iedere tick zolang er kopererts, steenkool, energie en ruimte in je koperopslag is."
      );
  },
  init: function () {
    objCopperSmelter.amount = +store.getItem("copperSmelters") || 0;
    objCopperSmelter.show();
  },
};

var objCopper = {
  amount: 0,
  price: 40000,
  storage: 1,
  storageCap: 100000,
  storagePrice: 15000000,
  space: function () {
    return +objCopper.storage * +objCopper.storageCap - +objCopper.amount;
  },
  add: function (amountAdded) {
    fillStorage("objCopper", amountAdded, "copperAmount");
  },
  use: function (amount) {
    return useResource("objCopper", amount, "copperAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot koper";
    var priceValue = +objCopper.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objCopper.amount;
      if (amountSold <= 0) return 0;
      objCopper.use(amountSold);
      reason = "Handmatige verkoop koper";
      priceValue = +objCopper.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 23, amountSold);
  },
  addStorage: function () {
    if (moneyCheck(+objCopper.storagePrice) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Koperopslag", "fa-euro-sign");
      return 0;
    }
    objMoney.use(+objCopper.storagePrice);
    objCopper.storage++;
    store.setItem("copperStorage", objCopper.storage);
    objCopper.show();
  },
  show: function () {
    var left = document.getElementById("Copper");
    var right = document.getElementById("copperStorage");
    if (!objCopperMine.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var capacity = +objCopper.storage * +objCopper.storageCap;
    left.innerHTML =
      "<h2>Koper</h2>" +
      renderBar(
        "Voorraad",
        FixUnit(objCopper.amount, "ton"),
        (+objCopper.amount / capacity) * 100
      ) +
      renderStats([
        ["Vrije ruimte", FixUnit(objCopper.space(), "ton")],
        ["Prijs per ton", FixMoney(objCopper.price)],
      ]) +
      renderHint(
        "Is de opslag vol, dan stoppen de smelterijen tot er weer ruimte is."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objCopper.sell(0)' id='sellCopper'>Verkoop koper</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Loodsen",
          FixNumber(objCopper.storage) + " (" + FixUnit(capacity, "ton") + ")",
        ],
        ["Prijs extra loods", FixMoney(objCopper.storagePrice)],
        ["Capaciteit per loods", FixUnit(objCopper.storageCap, "ton")],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objCopper.addStorage();' id='addCopperStorage'>Koop koperopslag</button>" +
      "</div>";
  },
  init: function () {
    objCopper.amount = +store.getItem("copperAmount") || 0;
    objCopper.storage = +store.getItem("copperStorage") || 1;
    objCopper.show();
  },
};

// Elektronica (vanaf level 13): koper + kunststof + energie -> printplaten.
// Printplaten zijn te verkopen en nodig voor de hoogovenbesturing, de seismische scanner
// en zonneparken.
var objElectronics = {
  amount: 0,
  cost: 5000000000,
  steelNeeded: 250000,
  copperNeeded: 50,
  plasticNeeded: 200,
  energy: 3000,
  production: 100,
  active: 0,
  unlocked: function () {
    return +objPlayerInfo.level >= 13;
  },
  add: function (amount) {
    if (!objElectronics.unlocked()) return 0;
    if (+amount < 0) {
      if (+objElectronics.amount < 1) {
        notificationOverlay(
          "Geen fabrieken om te verkopen",
          "Elektronicafabriek",
          "fa-industry"
        );
        return 0;
      }
      objElectronics.amount--;
      objMoney.add(
        +objElectronics.cost * 0.75,
        "Verkoop elektronicafabriek",
        24,
        1
      );
    } else {
      if (moneyCheck(+objElectronics.cost) == 0) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Elektronicafabriek",
          "fa-euro-sign"
        );
        return 0;
      }
      if (+objSteel.amount < +objElectronics.steelNeeded) {
        notificationOverlay(
          "Niet genoeg staal!",
          "Elektronicafabriek",
          "fa-box"
        );
        return 0;
      }
      objMoney.use(+objElectronics.cost);
      objSteel.use(+objElectronics.steelNeeded);
      objSteel.show();
      objFlows.pulse("SteelInfo-col", "Electronics-col");
      objElectronics.amount++;
    }
    store.setItem("electronicsFactories", objElectronics.amount);
    objElectronics.show();
  },
  // Draait iedere tick zolang er koper, kunststof, energie en opslagruimte is
  produce: function () {
    if (objPause.is("Electronics-col")) {
      objElectronics.active = 0;
      return 0;
    }
    var active = Math.min(
      +objElectronics.amount,
      Math.floor(+objCopper.amount / objElectronics.copperNeeded),
      Math.floor(+objPlastic.amount / objElectronics.plasticNeeded),
      Math.floor(+objEnergy.available / objElectronics.energy),
      Math.floor(objPCB.space() / objElectronics.production)
    );
    objElectronics.active = Math.max(0, active);
    if (active < 1) return 0;
    objCopper.use(active * objElectronics.copperNeeded);
    objPlastic.use(active * objElectronics.plasticNeeded);
    objPlastic.show();
    objEnergy.use(active * objElectronics.energy, "Elektronicafabriek");
    objPCB.add(
      objStats.count("printplaten", active * objElectronics.production)
    );
  },
  show: function () {
    var left = document.getElementById("electronicsFactory");
    var right = document.getElementById("electronicsStats");
    if (!objElectronics.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objElectronics.amount;
    var a = objElectronics.active;
    left.innerHTML =
      "<h2>Elektronicafabriek</h2>" +
      renderStats([
        ["Fabrieken", FixNumber(n)],
        ["Prijs per fabriek", FixMoney(objElectronics.cost)],
        ["Staal per fabriek", FixUnit(objElectronics.steelNeeded, "ton")],
        ["Verkoopwaarde", FixMoney(objElectronics.cost * 0.75)],
      ]) +
      "<h3>Per fabriek per tick</h3>" +
      renderStats([
        ["Koper", FixUnit(objElectronics.copperNeeded, "ton")],
        ["Kunststof", FixUnit(objElectronics.plasticNeeded, "eenheden")],
        ["Energie", FixNumber(objElectronics.energy)],
        ["Printplaten", FixNumber(objElectronics.production)],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objElectronics.add(1);' id='buyElectronics'>Bouw elektronicafabriek</button>" +
      objBulk.buttons("electronics") +
      " " +
      "<button type='button' class='btn btn-danger' onClick='objElectronics.add(-1);' id='sellElectronics'>Verkoop elektronicafabriek</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(a) + " van " + FixNumber(n)],
        ["Printplaten", FixNumber(a * objElectronics.production) + " per tick"],
        ["Koper", FixUnit(a * objElectronics.copperNeeded, "ton per tick")],
        [
          "Kunststof",
          FixNumber(a * objElectronics.plasticNeeded) + " per tick",
        ],
        ["Energie", FixNumber(a * objElectronics.energy) + " per tick"],
      ]) +
      renderHint(
        "Een fabriek draait vanzelf iedere tick zolang er koper, kunststof, energie en ruimte voor printplaten is."
      );
  },
  init: function () {
    objElectronics.amount = +store.getItem("electronicsFactories") || 0;
    objElectronics.show();
  },
};

var objPCB = {
  amount: 0,
  price: 60000,
  storage: 1,
  storageCap: 100000,
  storagePrice: 1000000000,
  space: function () {
    return +objPCB.storage * +objPCB.storageCap - +objPCB.amount;
  },
  add: function (amountAdded) {
    fillStorage("objPCB", amountAdded, "pcbAmount");
  },
  use: function (amount) {
    return useResource("objPCB", amount, "pcbAmount");
  },
  // Genoeg printplaten? Zo niet, dan een melding
  has: function (amount, title) {
    if (+objPCB.amount >= +amount) return true;
    notificationOverlay(
      "Niet genoeg printplaten! Nodig: " + FixNumber(amount) + ".",
      title,
      "fa-box"
    );
    return false;
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot printplaten";
    var priceValue = +objPCB.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objPCB.amount;
      if (amountSold <= 0) return 0;
      objPCB.use(amountSold);
      reason = "Handmatige verkoop printplaten";
      priceValue = +objPCB.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 25, amountSold);
  },
  addStorage: function () {
    if (moneyCheck(+objPCB.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Printplatenopslag",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(+objPCB.storagePrice);
    objPCB.storage++;
    store.setItem("pcbStorage", objPCB.storage);
    objPCB.show();
  },
  show: function () {
    var left = document.getElementById("PCB");
    var right = document.getElementById("pcbStorage");
    if (!objElectronics.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var capacity = +objPCB.storage * +objPCB.storageCap;
    left.innerHTML =
      "<h2>Printplaten</h2>" +
      renderBar(
        "Voorraad",
        FixNumber(objPCB.amount),
        (+objPCB.amount / capacity) * 100
      ) +
      renderStats([
        ["Vrije ruimte", FixNumber(objPCB.space())],
        ["Prijs per printplaat", FixMoney(objPCB.price)],
      ]) +
      renderHint(
        "Nodig voor hoogovenbesturing, seismische scanners en zonneparken. Is de opslag vol, dan stoppen de elektronicafabrieken tot er weer ruimte is."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objPCB.sell(0)' id='sellPCB'>Verkoop printplaten</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Magazijnen",
          FixNumber(objPCB.storage) + " (" + FixNumber(capacity) + ")",
        ],
        ["Prijs extra magazijn", FixMoney(objPCB.storagePrice)],
        ["Capaciteit per magazijn", FixNumber(objPCB.storageCap)],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objPCB.addStorage();' id='addPCBStorage'>Koop magazijn</button>" +
      "</div>";
  },
  init: function () {
    objPCB.amount = +store.getItem("pcbAmount") || 0;
    objPCB.storage = +store.getItem("pcbStorage") || 1;
    objPCB.show();
  },
};

// Zonnepark (vanaf level 13): stroom zonder brandstof
var objSolar = {
  amount: 0,
  price: 2000000000,
  priceFactor: 1.03,
  pcbNeeded: 1000,
  steelNeeded: 50000,
  production: 3000,
  add: function () {
    if (!objElectronics.unlocked()) return 0;
    if (moneyCheck(+objSolar.price) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Zonnepark", "fa-euro-sign");
      return 0;
    }
    if (+objSteel.amount < +objSolar.steelNeeded) {
      notificationOverlay("Niet genoeg staal!", "Zonnepark", "fa-box");
      return 0;
    }
    if (!objPCB.has(objSolar.pcbNeeded, "Zonnepark")) return 0;
    objMoney.use(+objSolar.price);
    objSteel.use(+objSolar.steelNeeded);
    objSteel.show();
    objPCB.use(objSolar.pcbNeeded);
    objFlows.pulseAll([
      ["SteelInfo-col", "solarPark"],
      ["PCB-col", "solarPark"],
    ]);
    objSolar.amount++;
    objSolar.price = +objSolar.price * objSolar.priceFactor;
    store.setItem("solarParks", objSolar.amount);
    store.setItem("solarPrice", objSolar.price);
    objSolar.show();
    objEnergy.show();
  },
  sell: function () {
    if (+objSolar.amount < 1) {
      notificationOverlay(
        "Geen zonneparken om te verkopen",
        "Zonnepark",
        "fa-info"
      );
      return 0;
    }
    objSolar.price = +objSolar.price / objSolar.priceFactor;
    objSolar.amount--;
    objMoney.add(+objSolar.price * 0.75, "Verkoop zonnepark", 26, 1);
    store.setItem("solarParks", objSolar.amount);
    store.setItem("solarPrice", objSolar.price);
    objSolar.show();
    objEnergy.show();
  },
  show: function () {
    var el = document.getElementById("solarParkInfo");
    if (!objElectronics.unlocked()) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML =
      "<h2>Zonneparken</h2>" +
      renderStats([
        ["Zonneparken", FixNumber(objSolar.amount)],
        [
          "Energie",
          FixNumber(objSolar.amount * objSolar.production) + " per tick",
        ],
        ["Prijs per park", FixMoney(objSolar.price)],
        ["Printplaten per park", FixNumber(objSolar.pcbNeeded)],
        ["Staal per park", FixUnit(objSolar.steelNeeded, "ton")],
        [
          "Verkoopwaarde",
          FixMoney((+objSolar.price / objSolar.priceFactor) * 0.75),
        ],
      ]) +
      renderHint(
        "Een zonnepark levert " +
          FixNumber(objSolar.production) +
          " energie per tick, zonder brandstof. Ieder park is 3% duurder dan het vorige."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objSolar.add();' id='buySolar'>Bouw zonnepark</button>" +
      objBulk.buttons("solar") +
      " " +
      "<button type='button' class='btn btn-danger' onClick='objSolar.sell();' id='sellSolar'>Verkoop zonnepark</button>" +
      "</div>";
  },
  init: function () {
    objSolar.amount = +store.getItem("solarParks") || 0;
    objSolar.price = +store.getItem("solarPrice") || objSolar.price;
    objSolar.show();
  },
};

// Seismische scanner (vanaf level 13): prospect automatisch achter elkaar
// door, eventueel gericht op één grondstof (kans x4). Iedere zoektocht kost nog steeds geld;
// een scanner gebruikt energie zolang hij zoekt.
var objScanner = {
  amount: 0,
  pcbNeeded: 20000,
  energy: 1000,
  targetFactor: 4,
  target: 0, // 0 = geen voorkeur, anders het nummer uit objMines.items
  timers: [],
  found: [],
  unlocked: function () {
    return objElectronics.unlocked() && +objResearch.level > 2;
  },
  weights: function () {
    return objMines.weight.map(function (w, i) {
      return objMines.items[i] === +objScanner.target
        ? +w * objScanner.targetFactor
        : +w;
    });
  },
  add: function () {
    if (!objScanner.unlocked()) return 0;
    if (!objPCB.has(objScanner.pcbNeeded, "Seismische scanner")) return 0;
    objPCB.use(objScanner.pcbNeeded);
    objFlows.pulse("PCB-col", "Prospecting-col");
    objScanner.amount++;
    objScanner.timers.push(0);
    objScanner.save();
    objScanner.show();
    objPause.update("Prospecting-col");
  },
  setTarget: function (value) {
    objScanner.target = +value || 0;
    store.setItem("scannerTarget", objScanner.target);
    objScanner.show();
  },
  save: function () {
    store.setItem("scanners", objScanner.amount);
    store.setItem("scannerTimers", JSON.stringify(objScanner.timers));
  },
  // Iedere tick: lopende zoektochten een tick verder (als er energie is), klare scanners
  // starten een nieuwe zoektocht (als er geld is)
  tick: function () {
    if (+objScanner.amount < 1 || objPause.is("Prospecting-col")) return 0;
    var price = objMines.prospectPrice();
    for (var i = 0; i < objScanner.timers.length; i++) {
      if (objScanner.timers[i] <= 0) {
        if (+objMoney.amount < price) continue;
        objMoney.use(price);
        objScanner.timers[i] = +objMines.prospectTimer;
      }
      if (
        objEnergy.use(objScanner.energy, "Seismische scanner") !==
        objScanner.energy
      )
        continue;
      objScanner.timers[i]--;
      if (objScanner.timers[i] <= 0) {
        objScanner.found.unshift(objMines.findSite(objScanner.weights()));
        objScanner.found = objScanner.found.slice(0, 5);
        objMines.showAll();
      }
    }
    objScanner.save();
  },
  show: function () {
    var el = document.getElementById("scanner");
    if (!objScanner.unlocked()) {
      el.innerHTML = "";
      return;
    }
    // De keuzelijst en de knop één keer opbouwen (anders klapt de lijst iedere tick dicht);
    // daarna alleen de cijfers bijwerken
    if (!document.getElementById("scannerStats")) {
      var options = [0].concat(objMines.items).map(function (item) {
        return (
          "<option value='" +
          item +
          "'>" +
          (item === 0 ? "geen voorkeur" : objMines.siteNames[item]) +
          "</option>"
        );
      });
      el.innerHTML =
        "<h3>Seismische scanner</h3>" +
        "<div id='scannerStats'></div>" +
        "<label class='scanner-target'>Zoek vooral naar " +
        "<select id='scannerTarget' onchange='objScanner.setTarget(this.value)'>" +
        options.join("") +
        "</select></label>" +
        renderHint(
          "Iedere scanner zoekt vanzelf achter elkaar door en betaalt per zoektocht. Kies je een grondstof, dan is de kans daarop 4 keer zo groot. Met de pauzeknop stoppen de scanners."
        ) +
        "<div class='actions'>" +
        "<button type='button' class='btn btn-primary' onClick='objScanner.add();' id='buyScanner'>Koop scanner</button>" +
        "</div>";
    }
    var select = document.getElementById("scannerTarget");
    if (select.value !== String(+objScanner.target))
      select.value = String(+objScanner.target);
    var busy = objScanner.timers.filter(function (t) {
      return t > 0;
    }).length;
    document.getElementById("scannerStats").innerHTML = renderStats([
      ["Scanners", FixNumber(objScanner.amount)],
      ["Nu aan het zoeken", FixNumber(busy)],
      [
        "Energie per zoekende scanner",
        FixNumber(objScanner.energy) + " per tick",
      ],
      ["Printplaten per scanner", FixNumber(objScanner.pcbNeeded)],
      objScanner.found.length && [
        "Laatste vondsten",
        objScanner.found.join(", "),
      ],
    ]);
  },
  init: function () {
    objScanner.amount = +store.getItem("scanners") || 0;
    objScanner.target = +store.getItem("scannerTarget") || 0;
    var timers = [];
    try {
      timers = JSON.parse(store.getItem("scannerTimers") || "[]");
    } catch (error) {
      timers = [];
    }
    if (!Array.isArray(timers)) timers = [];
    objScanner.timers = [];
    for (var i = 0; i < objScanner.amount; i++) {
      objScanner.timers.push(
        Math.max(0, Math.min(+timers[i] || 0, +objMines.prospectTimer))
      );
    }
    objScanner.show();
  },
};

// Goud (vanaf level 14): goudmijn -> gouderts -> goudraffinaderij -> goud.
// Goud is te verkopen en nodig voor de reactorbesturing.
var objGoldMine = {
  production: 500,
  energy: 3000,
  pasta: 0.5, // dozen per tick per mijn
  steelNeeded: 100000,
  activeMines: 0,
  unlocked: function () {
    return +objPlayerInfo.level >= 14 && +objResearch.level > 3;
  },
  produce: function () {
    if (objPause.is("Gold-col")) {
      objGoldMine.activeMines = 0;
      return 0;
    }
    // Net als bij koper gaat het uraniumpersoneel voor
    var pasta = Math.max(
      0,
      +objStorehouse.pasta - objCopperMine.pastaReserve()
    );
    var active = Math.min(
      +objMines.goldAmountActive,
      Math.floor(pasta / objGoldMine.pasta),
      Math.floor(+objEnergy.available / objGoldMine.energy),
      Math.floor(objGoldOre.space() / objGoldMine.production)
    );
    objGoldMine.activeMines = Math.max(0, active);
    if (active < 1) return 0;
    objEnergy.use(active * objGoldMine.energy, "Goudmijn");
    objStorehouse.removePasta(active * objGoldMine.pasta);
    objGoldOre.add(objStats.count("gouderts", active * objGoldMine.production));
  },
  show: function () {
    var el = document.getElementById("GoldMine");
    if (!objGoldMine.unlocked()) {
      el.innerHTML = "";
      return;
    }
    var mines = +objMines.goldAmountActive;
    el.innerHTML =
      "<h3>Gouderts</h3>" +
      renderResource({
        amount: objGoldOre.amount,
        production: mines * objGoldMine.production,
        energy: mines * objGoldMine.energy,
        period: "tick",
        extra: [
          "Pasta",
          FixNumber(mines * objGoldMine.pasta) + " dozen per tick",
        ],
        price: objGoldOre.price,
        silos: objGoldOre.storage,
        siloCap: objGoldOre.storageCap,
        siloPrice: objGoldOre.storagePrice,
        hint:
          "Een mijn levert " +
          FixUnit(objGoldMine.production, "ton") +
          " erts per tick voor " +
          FixNumber(objGoldMine.energy) +
          " energie; het personeel eet 1 doos pasta per 2 ticks (het uraniumpersoneel gaat voor). Is de opslag vol, dan stoppen de mijnen.",
      }) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objGoldOre.sell(0)' id='sellGoldOreButton'>Verkoop gouderts</button> " +
      "<button type='button' class='btn btn-primary' onClick='objGoldOre.addSilo();' id='goldOreSiloButton'>Bouw gouderts-silo</button>" +
      "</div>";
  },
};

var objGoldOre = {
  amount: 0,
  storage: 1,
  storageCap: 1000000,
  storagePrice: 10000000,
  price: 5000,
  space: function () {
    return +objGoldOre.storage * +objGoldOre.storageCap - +objGoldOre.amount;
  },
  add: function (amountAdded) {
    fillStorage("objGoldOre", amountAdded, "goldOreAmount");
  },
  use: function (amount) {
    return useResource("objGoldOre", amount, "goldOreAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot gouderts";
    var priceValue = +objGoldOre.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objGoldOre.amount;
      if (amountSold <= 0) return 0;
      objGoldOre.use(amountSold);
      reason = "Handmatige verkoop gouderts";
      priceValue = +objGoldOre.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 27, amountSold);
  },
  addSilo: function () {
    if (moneyCheck(+objGoldOre.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Goudertsopslag",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(+objGoldOre.storagePrice);
    objGoldOre.storage++;
    store.setItem("goldOreSilos", objGoldOre.storage);
    objGoldOre.show();
  },
  show: function () {
    objGoldMine.show();
  },
  init: function () {
    objGoldOre.amount = +store.getItem("goldOreAmount") || 0;
    objGoldOre.storage = +store.getItem("goldOreSilos") || 1;
    objGoldOre.show();
  },
};

var objGoldRefinery = {
  amount: 0,
  cost: 40000000000,
  steelNeeded: 500000,
  oreNeeded: 2500,
  oilNeeded: 500,
  energy: 20000,
  production: 5, // kg goud per tick
  active: 0,
  add: function (amount) {
    if (!objGoldMine.unlocked()) return 0;
    if (+amount < 0) {
      if (+objGoldRefinery.amount < 1) {
        notificationOverlay(
          "Geen raffinaderijen om te verkopen",
          "Goudraffinaderij",
          "fa-industry"
        );
        return 0;
      }
      objGoldRefinery.amount--;
      objMoney.add(
        +objGoldRefinery.cost * 0.75,
        "Verkoop goudraffinaderij",
        28,
        1
      );
    } else {
      if (moneyCheck(+objGoldRefinery.cost) == 0) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Goudraffinaderij",
          "fa-euro-sign"
        );
        return 0;
      }
      if (+objSteel.amount < +objGoldRefinery.steelNeeded) {
        notificationOverlay("Niet genoeg staal!", "Goudraffinaderij", "fa-box");
        return 0;
      }
      objMoney.use(+objGoldRefinery.cost);
      objSteel.use(+objGoldRefinery.steelNeeded);
      objSteel.show();
      objFlows.pulse("SteelInfo-col", "GoldRefinery-col");
      objGoldRefinery.amount++;
    }
    store.setItem("goldRefineries", objGoldRefinery.amount);
    objGoldRefinery.show();
  },
  // Draait iedere tick zolang er gouderts, olie, energie en ruimte in de kluis is
  produce: function () {
    if (objPause.is("GoldRefinery-col")) {
      objGoldRefinery.active = 0;
      return 0;
    }
    var active = Math.min(
      +objGoldRefinery.amount,
      Math.floor(+objGoldOre.amount / objGoldRefinery.oreNeeded),
      Math.floor(+objOilTank.contents / objGoldRefinery.oilNeeded),
      Math.floor(+objEnergy.available / objGoldRefinery.energy),
      Math.floor(objGold.space() / objGoldRefinery.production)
    );
    objGoldRefinery.active = Math.max(0, active);
    if (active < 1) return 0;
    objGoldOre.use(active * objGoldRefinery.oreNeeded);
    objOilTank.use(active * objGoldRefinery.oilNeeded, "Goudraffinaderij");
    objEnergy.use(active * objGoldRefinery.energy, "Goudraffinaderij");
    objGold.add(objStats.count("goud", active * objGoldRefinery.production));
  },
  show: function () {
    var left = document.getElementById("goldRefinery");
    var right = document.getElementById("goldRefineryStats");
    if (!objGoldMine.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objGoldRefinery.amount;
    var a = objGoldRefinery.active;
    left.innerHTML =
      "<h2>Goudraffinaderij</h2>" +
      renderStats([
        ["Raffinaderijen", FixNumber(n)],
        ["Prijs per raffinaderij", FixMoney(objGoldRefinery.cost)],
        ["Staal per raffinaderij", FixUnit(objGoldRefinery.steelNeeded, "ton")],
        ["Verkoopwaarde", FixMoney(objGoldRefinery.cost * 0.75)],
      ]) +
      "<h3>Per raffinaderij per tick</h3>" +
      renderStats([
        ["Gouderts", FixUnit(objGoldRefinery.oreNeeded, "ton")],
        ["Olie", FixUnit(objGoldRefinery.oilNeeded, "vaten")],
        ["Energie", FixNumber(objGoldRefinery.energy)],
        ["Goud", FixUnit(objGoldRefinery.production, "kg")],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objGoldRefinery.add(1);' id='buyGoldRefinery'>Bouw goudraffinaderij</button>" +
      objBulk.buttons("goldRefinery") +
      " <button type='button' class='btn btn-danger' onClick='objGoldRefinery.add(-1);' id='sellGoldRefinery'>Verkoop goudraffinaderij</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(a) + " van " + FixNumber(n)],
        ["Goud", FixUnit(a * objGoldRefinery.production, "kg per tick")],
        ["Gouderts", FixUnit(a * objGoldRefinery.oreNeeded, "ton per tick")],
        ["Olie", FixUnit(a * objGoldRefinery.oilNeeded, "vaten per tick")],
        ["Energie", FixNumber(a * objGoldRefinery.energy) + " per tick"],
      ]) +
      renderHint(
        "Een raffinaderij draait vanzelf iedere tick zolang er gouderts, olie, energie en ruimte in je kluizen is."
      );
  },
  init: function () {
    objGoldRefinery.amount = +store.getItem("goldRefineries") || 0;
    objGoldRefinery.show();
  },
};

var objGold = {
  amount: 0,
  price: 30000000, // per kg
  storage: 1,
  storageCap: 10000, // kg per kluis
  storagePrice: 5000000000,
  space: function () {
    return +objGold.storage * +objGold.storageCap - +objGold.amount;
  },
  add: function (amountAdded) {
    fillStorage("objGold", amountAdded, "goldAmount");
  },
  use: function (amount) {
    return useResource("objGold", amount, "goldAmount");
  },
  has: function (amount, title) {
    if (+objGold.amount >= +amount) return true;
    notificationOverlay(
      "Niet genoeg goud! Nodig: " + FixUnit(amount, "kg") + ".",
      title,
      "fa-box"
    );
    return false;
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot goud";
    var priceValue = +objGold.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objGold.amount;
      if (amountSold <= 0) return 0;
      objGold.use(amountSold);
      reason = "Handmatige verkoop goud";
      priceValue = +objGold.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 29, amountSold);
  },
  addStorage: function () {
    if (moneyCheck(+objGold.storagePrice) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Goudkluis", "fa-euro-sign");
      return 0;
    }
    objMoney.use(+objGold.storagePrice);
    objGold.storage++;
    store.setItem("goldStorage", objGold.storage);
    objGold.show();
  },
  show: function () {
    var left = document.getElementById("Gold");
    var right = document.getElementById("goldStorage");
    if (!objGoldMine.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var capacity = +objGold.storage * +objGold.storageCap;
    left.innerHTML =
      "<h2>Goud</h2>" +
      renderBar(
        "Voorraad",
        FixUnit(objGold.amount, "kg"),
        (+objGold.amount / capacity) * 100
      ) +
      renderStats([
        ["Vrije ruimte", FixUnit(objGold.space(), "kg")],
        ["Prijs per kg", FixMoney(objGold.price)],
      ]) +
      renderHint(
        "Nodig voor de reactorbesturing. Zijn de kluizen vol, dan stoppen de raffinaderijen tot er weer ruimte is."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objGold.sell(0)' id='sellGold'>Verkoop goud</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Kluizen",
          FixNumber(objGold.storage) + " (" + FixUnit(capacity, "kg") + ")",
        ],
        ["Prijs extra kluis", FixMoney(objGold.storagePrice)],
        ["Capaciteit per kluis", FixUnit(objGold.storageCap, "kg")],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objGold.addStorage();' id='addGoldStorage'>Koop kluis</button>" +
      "</div>";
  },
  init: function () {
    objGold.amount = +store.getItem("goldAmount") || 0;
    objGold.storage = +store.getItem("goldStorage") || 1;
    objGold.show();
  },
};

// Diamant (vanaf level 15): diamantmijn -> ruwe diamant -> slijperij ->
// edelstenen (om te verkopen) en industriële diamant (voor diamantboren).
var objDiamondMine = {
  production: 10, // karaat ruwe diamant per tick
  energy: 5000,
  pasta: 1, // dozen per tick per mijn
  steelNeeded: 200000,
  activeMines: 0,
  unlocked: function () {
    return +objPlayerInfo.level >= 15 && +objResearch.level > 3;
  },
  produce: function () {
    if (objPause.is("Diamond-col")) {
      objDiamondMine.activeMines = 0;
      return 0;
    }
    // Net als bij koper en goud gaat het uraniumpersoneel voor
    var pasta = Math.max(
      0,
      +objStorehouse.pasta - objCopperMine.pastaReserve()
    );
    var active = Math.min(
      +objMines.diamondAmountActive,
      Math.floor(pasta / objDiamondMine.pasta),
      Math.floor(+objEnergy.available / objDiamondMine.energy),
      Math.floor(objRoughDiamond.space() / objDiamondMine.production)
    );
    objDiamondMine.activeMines = Math.max(0, active);
    if (active < 1) return 0;
    objEnergy.use(active * objDiamondMine.energy, "Diamantmijn");
    objStorehouse.removePasta(active * objDiamondMine.pasta);
    objRoughDiamond.add(
      objStats.count("ruwediamant", active * objDiamondMine.production)
    );
  },
  show: function () {
    var el = document.getElementById("DiamondMine");
    if (!objDiamondMine.unlocked()) {
      el.innerHTML = "";
      return;
    }
    var mines = +objMines.diamondAmountActive;
    el.innerHTML =
      "<h3>Ruwe diamant</h3>" +
      renderResource({
        amount: objRoughDiamond.amount,
        unit: "karaat",
        siloLabel: "Opslag",
        production: mines * objDiamondMine.production,
        energy: mines * objDiamondMine.energy,
        period: "tick",
        extra: [
          "Pasta",
          FixNumber(mines * objDiamondMine.pasta) + " dozen per tick",
        ],
        price: objRoughDiamond.price,
        silos: objRoughDiamond.storage,
        siloCap: objRoughDiamond.storageCap,
        siloPrice: objRoughDiamond.storagePrice,
        hint:
          "Een mijn levert " +
          FixUnit(objDiamondMine.production, "karaat") +
          " ruwe diamant per tick voor " +
          FixNumber(objDiamondMine.energy) +
          " energie; het personeel eet 1 doos pasta per tick (het uraniumpersoneel gaat voor). Is de opslag vol, dan stoppen de mijnen.",
      }) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objRoughDiamond.sell(0)' id='sellRoughDiamondButton'>Verkoop ruwe diamant</button> " +
      "<button type='button' class='btn btn-primary' onClick='objRoughDiamond.addSilo();' id='roughDiamondSiloButton'>Bouw diamantopslag</button>" +
      "</div>";
  },
};

var objRoughDiamond = {
  amount: 0,
  storage: 1,
  storageCap: 100000, // karaat
  storagePrice: 100000000,
  price: 200000, // per karaat
  space: function () {
    return (
      +objRoughDiamond.storage * +objRoughDiamond.storageCap -
      +objRoughDiamond.amount
    );
  },
  add: function (amountAdded) {
    fillStorage("objRoughDiamond", amountAdded, "roughDiamondAmount");
  },
  use: function (amount) {
    return useResource("objRoughDiamond", amount, "roughDiamondAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot ruwe diamant";
    var priceValue = +objRoughDiamond.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objRoughDiamond.amount;
      if (amountSold <= 0) return 0;
      objRoughDiamond.use(amountSold);
      reason = "Handmatige verkoop ruwe diamant";
      priceValue = +objRoughDiamond.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 30, amountSold);
  },
  addSilo: function () {
    if (moneyCheck(+objRoughDiamond.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Diamantopslag",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(+objRoughDiamond.storagePrice);
    objRoughDiamond.storage++;
    store.setItem("roughDiamondSilos", objRoughDiamond.storage);
    objRoughDiamond.show();
  },
  show: function () {
    objDiamondMine.show();
  },
  init: function () {
    objRoughDiamond.amount = +store.getItem("roughDiamondAmount") || 0;
    objRoughDiamond.storage = +store.getItem("roughDiamondSilos") || 1;
    objRoughDiamond.show();
  },
};

// De slijperij verdeelt iedere batch willekeurig: 50 tot 70% wordt edelsteen, de rest
// industriële diamant. Soms zit er een topsteen tussen, die meteen veel geld oplevert.
var objDiamondCutter = {
  amount: 0,
  cost: 100000000000,
  steelNeeded: 1000000,
  roughNeeded: 50, // karaat per tick
  energy: 25000,
  gemShareMin: 0.5,
  gemShareMax: 0.7,
  topChance: 0.002, // per actieve slijperij per tick
  topValue: 5000000000,
  active: 0,
  topStones: 0,
  add: function (amount) {
    if (!objDiamondMine.unlocked()) return 0;
    if (+amount < 0) {
      if (+objDiamondCutter.amount < 1) {
        notificationOverlay(
          "Geen slijperijen om te verkopen",
          "Slijperij",
          "fa-industry"
        );
        return 0;
      }
      objDiamondCutter.amount--;
      objMoney.add(+objDiamondCutter.cost * 0.75, "Verkoop slijperij", 31, 1);
    } else {
      if (moneyCheck(+objDiamondCutter.cost) == 0) {
        notificationOverlay("Niet genoeg doekoe!", "Slijperij", "fa-euro-sign");
        return 0;
      }
      if (+objSteel.amount < +objDiamondCutter.steelNeeded) {
        notificationOverlay("Niet genoeg staal!", "Slijperij", "fa-box");
        return 0;
      }
      objMoney.use(+objDiamondCutter.cost);
      objSteel.use(+objDiamondCutter.steelNeeded);
      objSteel.show();
      objFlows.pulse("SteelInfo-col", "DiamondCutter-col");
      objDiamondCutter.amount++;
    }
    store.setItem("diamondCutters", objDiamondCutter.amount);
    objDiamondCutter.show();
  },
  // Draait iedere tick zolang er ruwe diamant, energie en ruimte in de kluizen is
  produce: function () {
    if (objPause.is("DiamondCutter-col")) {
      objDiamondCutter.active = 0;
      return 0;
    }
    var space = Math.min(objGems.space(), objIndustrialDiamond.space());
    var active = Math.min(
      +objDiamondCutter.amount,
      Math.floor(+objRoughDiamond.amount / objDiamondCutter.roughNeeded),
      Math.floor(+objEnergy.available / objDiamondCutter.energy),
      Math.floor(space / objDiamondCutter.roughNeeded)
    );
    objDiamondCutter.active = Math.max(0, active);
    if (active < 1) return 0;
    var rough = active * objDiamondCutter.roughNeeded;
    var share =
      objDiamondCutter.gemShareMin +
      Math.random() *
        (objDiamondCutter.gemShareMax - objDiamondCutter.gemShareMin);
    var gems = Math.round(rough * share);
    objRoughDiamond.use(rough);
    objEnergy.use(active * objDiamondCutter.energy, "Slijperij");
    objGems.add(objStats.count("edelstenen", gems));
    objIndustrialDiamond.add(objStats.count("industriediamant", rough - gems));
    for (var i = 0; i < active; i++) {
      if (Math.random() < objDiamondCutter.topChance) {
        objDiamondCutter.topStones++;
        store.setItem("diamondTopStones", objDiamondCutter.topStones);
        objMoney.add(objDiamondCutter.topValue, "Topsteen verkocht", 32, 1);
      }
    }
  },
  show: function () {
    var left = document.getElementById("diamondCutter");
    var right = document.getElementById("diamondCutterStats");
    if (!objDiamondMine.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objDiamondCutter.amount;
    var a = objDiamondCutter.active;
    var rough = a * objDiamondCutter.roughNeeded;
    left.innerHTML =
      "<h2>Slijperij</h2>" +
      renderStats([
        ["Slijperijen", FixNumber(n)],
        ["Prijs per slijperij", FixMoney(objDiamondCutter.cost)],
        ["Staal per slijperij", FixUnit(objDiamondCutter.steelNeeded, "ton")],
        ["Verkoopwaarde", FixMoney(objDiamondCutter.cost * 0.75)],
      ]) +
      "<h3>Per slijperij per tick</h3>" +
      renderStats([
        ["Ruwe diamant", FixUnit(objDiamondCutter.roughNeeded, "karaat")],
        ["Energie", FixNumber(objDiamondCutter.energy)],
        ["Edelsteen", "50 tot 70%"],
        ["Industriële diamant", "de rest"],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objDiamondCutter.add(1);' id='buyDiamondCutter'>Bouw slijperij</button>" +
      objBulk.buttons("diamondCutter") +
      " <button type='button' class='btn btn-danger' onClick='objDiamondCutter.add(-1);' id='sellDiamondCutter'>Verkoop slijperij</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(a) + " van " + FixNumber(n)],
        ["Ruwe diamant", FixUnit(rough, "karaat per tick")],
        ["Energie", FixNumber(a * objDiamondCutter.energy) + " per tick"],
        ["Topstenen gevonden", FixNumber(objDiamondCutter.topStones)],
      ]) +
      renderHint(
        "Een slijperij draait vanzelf iedere tick zolang er ruwe diamant, energie en ruimte in je kluizen is. Gemiddeld 1 op de 500 ticks vindt een slijperij een topsteen; die wordt meteen verkocht voor " +
          FixMoney(objDiamondCutter.topValue) +
          "."
      );
  },
  init: function () {
    objDiamondCutter.amount = +store.getItem("diamondCutters") || 0;
    objDiamondCutter.topStones = +store.getItem("diamondTopStones") || 0;
    objDiamondCutter.show();
  },
};

// Edelstenen en industriële diamant liggen samen in diamantkluizen
var objGems = {
  amount: 0,
  storage: 1,
  storageCap: 50000, // karaat per kluis
  price: 6000000, // per karaat
  space: function () {
    return +objGems.storage * +objGems.storageCap - +objGems.amount;
  },
  add: function (amountAdded) {
    fillStorage("objGems", amountAdded, "gemsAmount");
  },
  use: function (amount) {
    return useResource("objGems", amount, "gemsAmount");
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot edelstenen";
    var priceValue = +objGems.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objGems.amount;
      if (amountSold <= 0) return 0;
      objGems.use(amountSold);
      reason = "Handmatige verkoop edelstenen";
      priceValue = +objGems.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 33, amountSold);
  },
  show: function () {
    objDiamondVault.show();
  },
};

var objIndustrialDiamond = {
  amount: 0,
  storage: 1,
  storageCap: 50000, // karaat per kluis
  price: 500000, // per karaat
  space: function () {
    return (
      +objIndustrialDiamond.storage * +objIndustrialDiamond.storageCap -
      +objIndustrialDiamond.amount
    );
  },
  add: function (amountAdded) {
    fillStorage("objIndustrialDiamond", amountAdded, "industrialDiamondAmount");
  },
  use: function (amount) {
    return useResource(
      "objIndustrialDiamond",
      amount,
      "industrialDiamondAmount"
    );
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot industriële diamant";
    var priceValue = +objIndustrialDiamond.price * 0.2;
    if (+amountSold == 0) {
      amountSold = +objIndustrialDiamond.amount;
      if (amountSold <= 0) return 0;
      objIndustrialDiamond.use(amountSold);
      reason = "Handmatige verkoop industriële diamant";
      priceValue = +objIndustrialDiamond.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 34, amountSold);
  },
  show: function () {
    objDiamondVault.show();
  },
};

var objDiamondVault = {
  storage: 1,
  price: 10000000000,
  add: function () {
    if (moneyCheck(+objDiamondVault.price) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Diamantkluis",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(+objDiamondVault.price);
    objDiamondVault.set(+objDiamondVault.storage + 1);
    store.setItem("diamondVaults", objDiamondVault.storage);
    objDiamondVault.show();
  },
  set: function (amount) {
    objDiamondVault.storage = amount;
    objGems.storage = amount;
    objIndustrialDiamond.storage = amount;
  },
  show: function () {
    var left = document.getElementById("Diamonds");
    var right = document.getElementById("diamondStorage");
    if (!objDiamondMine.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var capacity = +objDiamondVault.storage * +objGems.storageCap;
    left.innerHTML =
      "<h2>Diamanten</h2>" +
      renderBar(
        "Edelstenen",
        FixUnit(objGems.amount, "karaat"),
        (+objGems.amount / capacity) * 100
      ) +
      renderBar(
        "Industriële diamant",
        FixUnit(objIndustrialDiamond.amount, "karaat"),
        (+objIndustrialDiamond.amount / capacity) * 100
      ) +
      renderStats([
        ["Prijs edelsteen", FixMoney(objGems.price) + " per karaat"],
        [
          "Prijs industriële diamant",
          FixMoney(objIndustrialDiamond.price) + " per karaat",
        ],
      ]) +
      renderHint(
        "Industriële diamant heb je nodig voor diamantboren. Wat niet past wordt verkocht voor 20% van de prijs."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objGems.sell(0)' id='sellGems'>Verkoop edelstenen</button> " +
      "<button type='button' class='btn btn-danger' onClick='objIndustrialDiamond.sell(0)' id='sellIndustrialDiamond'>Verkoop industriële diamant</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Kluizen",
          FixNumber(objDiamondVault.storage) +
            " (" +
            FixUnit(capacity, "karaat") +
            " per soort)",
        ],
        ["Prijs extra kluis", FixMoney(objDiamondVault.price)],
        [
          "Capaciteit per kluis",
          FixUnit(objGems.storageCap, "karaat") + " per soort",
        ],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objDiamondVault.add();' id='addDiamondVault'>Koop kluis</button>" +
      "</div>";
  },
  init: function () {
    objGems.amount = +store.getItem("gemsAmount") || 0;
    objIndustrialDiamond.amount =
      +store.getItem("industrialDiamondAmount") || 0;
    objDiamondVault.set(+store.getItem("diamondVaults") || 1);
    objDiamondVault.show();
  },
};

// Diamantboren (#79): eenmalig per mijntype, betaald in industriële diamant. Alle mijnen van
// dat type maken daarna 50% meer voor dezelfde energie (en hetzelfde pasta).
var objDiamondDrill = {
  bonus: 1.5,
  types: ["iron", "coal", "uranium", "copper", "gold", "diamond"],
  names: {
    iron: "IJzerertsmijnen",
    coal: "Steenkoolmijnen",
    uranium: "Uraniummijnen",
    copper: "Kopermijnen",
    gold: "Goudmijnen",
    diamond: "Diamantmijnen",
  },
  cost: {
    iron: 2000,
    coal: 2000,
    uranium: 5000,
    copper: 5000,
    gold: 10000,
    diamond: 20000,
  },
  owned: [],
  base: null,
  mine: function (type) {
    return {
      iron: objIronMine,
      coal: objCoalMine,
      uranium: objUraniumMine,
      copper: objCopperMine,
      gold: objGoldMine,
      diamond: objDiamondMine,
    }[type];
  },
  has: function (type) {
    return objDiamondDrill.owned.indexOf(type) !== -1;
  },
  // Zet de productie per mijn op basis van de gekochte boren
  apply: function () {
    if (!objDiamondDrill.base) {
      objDiamondDrill.base = {};
      objDiamondDrill.types.forEach(function (type) {
        objDiamondDrill.base[type] = objDiamondDrill.mine(type).production;
      });
    }
    objDiamondDrill.types.forEach(function (type) {
      objDiamondDrill.mine(type).production =
        objDiamondDrill.base[type] *
        (objDiamondDrill.has(type) ? objDiamondDrill.bonus : 1);
    });
  },
  buy: function (type) {
    if (!objDiamondMine.unlocked()) return 0;
    if (objDiamondDrill.types.indexOf(type) === -1) return 0;
    if (objDiamondDrill.has(type)) return 0;
    var cost = objDiamondDrill.cost[type];
    if (+objIndustrialDiamond.amount < cost) {
      notificationOverlay(
        "Niet genoeg industriële diamant! Nodig: " +
          FixUnit(cost, "karaat") +
          ".",
        "Diamantboren",
        "fa-box"
      );
      return 0;
    }
    objIndustrialDiamond.use(cost);
    objDiamondDrill.owned.push(type);
    store.setItem("diamondDrills", JSON.stringify(objDiamondDrill.owned));
    objDiamondDrill.apply();
    objDiamondVault.show();
    objDiamondDrill.show();
    objMines.showAll();
    objCoalMine.show();
    objIronMine.show();
    objUraniumMine.show();
  },
  show: function () {
    var el = document.getElementById("DiamondDrill");
    if (!objDiamondMine.unlocked()) {
      el.innerHTML = "";
      return;
    }
    var rows = objDiamondDrill.types
      .map(function (type) {
        var name = objDiamondDrill.names[type];
        if (objDiamondDrill.has(type)) {
          return (
            "<div class='drill-row'><span>" +
            name +
            "</span><span class='drill-done'>+50%</span></div>"
          );
        }
        var cost = objDiamondDrill.cost[type];
        return (
          "<div class='drill-row'><span>" +
          name +
          "</span><button type='button' class='btn btn-primary' onClick='objDiamondDrill.buy(\"" +
          type +
          "\");' id='drill-" +
          type +
          "'" +
          (+objIndustrialDiamond.amount < cost ? " disabled" : "") +
          ">" +
          FixUnit(cost, "karaat") +
          "</button></div>"
        );
      })
      .join("");
    el.innerHTML =
      "<h2>Diamantboren</h2>" +
      rows +
      renderHint(
        "Een diamantboor koop je één keer per soort mijn, met industriële diamant. Alle mijnen van die soort maken daarna 50% meer voor dezelfde energie."
      );
  },
  init: function () {
    var owned = [];
    try {
      owned = JSON.parse(store.getItem("diamondDrills") || "[]");
    } catch (e) {
      owned = [];
    }
    objDiamondDrill.owned = Array.isArray(owned)
      ? owned.filter(function (type) {
          return objDiamondDrill.types.indexOf(type) !== -1;
        })
      : [];
    objDiamondDrill.apply();
    objDiamondDrill.show();
  },
};

// Level 16: chipfabriek -> chips -> datacenter (geld en AICoin),
// en de fusiecentrale die de stroom voor het datacenter levert.
var objChipFactory = {
  amount: 0,
  cost: 200000000000,
  steelNeeded: 1000000,
  pcbNeeded: 50,
  goldNeeded: 0.2, // kg
  diamondNeeded: 1, // karaat industriële diamant
  energy: 50000,
  production: 5, // chips per tick
  active: 0,
  // Materiaalinspectie met industriële isotopen (#118): 25% meer chips
  isotopeUse: 0.05, // isotopen per fabriek per tick
  isotopeBonus: 0.25,
  inspected: 0,
  unlocked: function () {
    return +objPlayerInfo.level >= 16 && +objResearch.level > 3;
  },
  add: function (amount) {
    if (!objChipFactory.unlocked()) return 0;
    if (+amount < 0) {
      if (+objChipFactory.amount < 1) {
        notificationOverlay(
          "Geen chipfabrieken om te verkopen",
          "Chipfabriek",
          "fa-industry"
        );
        return 0;
      }
      objChipFactory.amount--;
      objMoney.add(+objChipFactory.cost * 0.75, "Verkoop chipfabriek", 35, 1);
    } else {
      if (moneyCheck(+objChipFactory.cost) == 0) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Chipfabriek",
          "fa-euro-sign"
        );
        return 0;
      }
      if (+objSteel.amount < +objChipFactory.steelNeeded) {
        notificationOverlay("Niet genoeg staal!", "Chipfabriek", "fa-box");
        return 0;
      }
      objMoney.use(+objChipFactory.cost);
      objSteel.use(+objChipFactory.steelNeeded);
      objSteel.show();
      objFlows.pulse("SteelInfo-col", "ChipFactory-col");
      objChipFactory.amount++;
    }
    store.setItem("chipFactories", objChipFactory.amount);
    objChipFactory.show();
  },
  // Draait iedere tick zolang er printplaten, goud, industriële diamant, energie en ruimte is
  produce: function () {
    objChipFactory.inspected = 0;
    if (objPause.is("ChipFactory-col")) {
      objChipFactory.active = 0;
      return 0;
    }
    var active = Math.min(
      +objChipFactory.amount,
      Math.floor(+objPCB.amount / objChipFactory.pcbNeeded),
      Math.floor(+objGold.amount / objChipFactory.goldNeeded),
      Math.floor(+objIndustrialDiamond.amount / objChipFactory.diamondNeeded),
      Math.floor(+objEnergy.available / objChipFactory.energy),
      Math.floor(objChips.space() / objChipFactory.production)
    );
    objChipFactory.active = Math.max(0, active);
    if (active < 1) return 0;
    objPCB.use(active * objChipFactory.pcbNeeded);
    objGold.use(active * objChipFactory.goldNeeded);
    objIndustrialDiamond.use(active * objChipFactory.diamondNeeded);
    objEnergy.use(active * objChipFactory.energy, "Chipfabriek");
    // Fabrieken met isotopen maken extra chips, zolang die nog in de opslag passen
    var extra = objChipFactory.production * objChipFactory.isotopeBonus;
    var inspected = Math.max(
      0,
      Math.min(
        active,
        Math.floor(+objIsotopes.amount / objChipFactory.isotopeUse + 1e-9),
        Math.floor(
          (objChips.space() - active * objChipFactory.production) / extra
        )
      )
    );
    objChipFactory.inspected = inspected;
    if (inspected > 0) {
      objIsotopes.use(inspected * objChipFactory.isotopeUse);
      objIsotopes.show();
    }
    objChips.add(
      objStats.count(
        "chips",
        active * objChipFactory.production + inspected * extra
      )
    );
  },
  show: function () {
    var left = document.getElementById("chipFactory");
    var right = document.getElementById("chipFactoryStats");
    if (!objChipFactory.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objChipFactory.amount;
    var a = objChipFactory.active;
    left.innerHTML =
      "<h2>Chipfabriek</h2>" +
      renderStats([
        ["Chipfabrieken", FixNumber(n)],
        ["Prijs per fabriek", FixMoney(objChipFactory.cost)],
        ["Staal per fabriek", FixUnit(objChipFactory.steelNeeded, "ton")],
        ["Verkoopwaarde", FixMoney(objChipFactory.cost * 0.75)],
      ]) +
      "<h3>Per fabriek per tick</h3>" +
      renderStats([
        ["Printplaten", FixNumber(objChipFactory.pcbNeeded)],
        ["Goud", FixUnit(objChipFactory.goldNeeded, "kg")],
        [
          "Industriële diamant",
          FixUnit(objChipFactory.diamondNeeded, "karaat"),
        ],
        ["Energie", FixNumber(objChipFactory.energy)],
        ["Chips", FixNumber(objChipFactory.production)],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objChipFactory.add(1);' id='buyChipFactory'>Bouw chipfabriek</button>" +
      objBulk.buttons("chipFactory") +
      " <button type='button' class='btn btn-danger' onClick='objChipFactory.add(-1);' id='sellChipFactory'>Verkoop chipfabriek</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(a) + " van " + FixNumber(n)],
        [
          "Chips",
          FixNumber(
            a * objChipFactory.production +
              objChipFactory.inspected *
                objChipFactory.production *
                objChipFactory.isotopeBonus
          ) + " per tick",
        ],
        [
          "Met inspectie",
          FixNumber(objChipFactory.inspected) +
            " van " +
            FixNumber(a) +
            " (" +
            FixNumber(objChipFactory.inspected * objChipFactory.isotopeUse) +
            " isotopen per tick)",
        ],
        ["Printplaten", FixNumber(a * objChipFactory.pcbNeeded) + " per tick"],
        ["Goud", FixUnit(a * objChipFactory.goldNeeded, "kg per tick")],
        [
          "Industriële diamant",
          FixUnit(a * objChipFactory.diamondNeeded, "karaat per tick"),
        ],
        ["Energie", FixNumber(a * objChipFactory.energy) + " per tick"],
      ]) +
      renderHint(
        "Een chipfabriek draait vanzelf iedere tick zolang er printplaten, goud, industriële diamant, energie en ruimte in je chipopslag is. Met industriële isotopen uit het isotopenlab maakt hij 25% meer chips."
      );
  },
  init: function () {
    objChipFactory.amount = +store.getItem("chipFactories") || 0;
    objChipFactory.show();
  },
};

var objChips = {
  amount: 0,
  storage: 1,
  storageCap: 10000,
  storagePrice: 10000000000,
  price: 20000000,
  space: function () {
    return +objChips.storage * +objChips.storageCap - +objChips.amount;
  },
  add: function (amountAdded) {
    fillStorage("objChips", amountAdded, "chipsAmount");
  },
  use: function (amount) {
    return useResource("objChips", amount, "chipsAmount");
  },
  has: function (amount, title) {
    if (+objChips.amount >= +amount) return true;
    notificationOverlay(
      "Niet genoeg chips! Nodig: " + FixNumber(amount) + ".",
      title,
      "fa-box"
    );
    return false;
  },
  sell: function (amountSold) {
    var reason = "Verkoop overschot chips";
    var priceValue = +objChips.price * 0.2;
    if (+amountSold == 0) {
      amountSold = Math.floor(+objChips.amount);
      if (amountSold <= 0) return 0;
      objChips.use(amountSold);
      reason = "Handmatige verkoop chips";
      priceValue = +objChips.price;
    }
    objMoney.add(+amountSold * priceValue, reason, 36, amountSold);
  },
  addStorage: function () {
    if (moneyCheck(+objChips.storagePrice) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Chipopslag", "fa-euro-sign");
      return 0;
    }
    objMoney.use(+objChips.storagePrice);
    objChips.storage++;
    store.setItem("chipsStorage", objChips.storage);
    objChips.show();
  },
  show: function () {
    var left = document.getElementById("Chips");
    var right = document.getElementById("chipsStorage");
    if (!objChipFactory.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var capacity = +objChips.storage * +objChips.storageCap;
    left.innerHTML =
      "<h2>Chips</h2>" +
      renderBar(
        "Voorraad",
        FixNumber(Math.floor(objChips.amount)),
        (+objChips.amount / capacity) * 100
      ) +
      renderStats([
        ["Vrije ruimte", FixNumber(Math.floor(objChips.space()))],
        ["Prijs per chip", FixMoney(objChips.price)],
      ]) +
      renderHint(
        "Nodig voor datacenterrekken en fusiecentrales; een rek verbruikt ook chips. Is de opslag vol, dan stoppen de chipfabrieken tot er weer ruimte is."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objChips.sell(0)' id='sellChips'>Verkoop chips</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Opslagen",
          FixNumber(objChips.storage) + " (" + FixNumber(capacity) + " chips)",
        ],
        ["Prijs extra opslag", FixMoney(objChips.storagePrice)],
        ["Capaciteit per opslag", FixNumber(objChips.storageCap) + " chips"],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objChips.addStorage();' id='addChipsStorage'>Koop opslag</button>" +
      "</div>";
  },
  init: function () {
    objChips.amount = +store.getItem("chipsAmount") || 0;
    objChips.storage = +store.getItem("chipsStorage") || 1;
    objChips.show();
  },
};

// Het datacenter verkoopt rekenkracht en levert AICoin. De opbrengst wordt iedere
// 10 ticks in één keer uitbetaald, zodat de lijst met inkomsten leesbaar blijft.
var objDatacenter = {
  racks: 0,
  price: 2000000000000,
  priceFactor: 1.05,
  chipsNeeded: 1000,
  energy: 250000,
  chipUse: 0.1, // chips per rek per tick (onderhoud)
  income: 1000000000, // per rek per tick
  coins: 0.1, // AICoin per rek per tick
  payPeriod: 10,
  active: 0,
  pending: 0,
  counter: 0,
  add: function () {
    if (!objChipFactory.unlocked()) return 0;
    if (moneyCheck(+objDatacenter.price) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Datacenter", "fa-euro-sign");
      return 0;
    }
    if (!objChips.has(objDatacenter.chipsNeeded, "Datacenter")) return 0;
    objMoney.use(+objDatacenter.price);
    objChips.use(objDatacenter.chipsNeeded);
    objFlows.pulse("Chips-col", "Datacenter-col");
    objDatacenter.racks++;
    objDatacenter.price = +objDatacenter.price * objDatacenter.priceFactor;
    store.setItem("datacenterRacks", objDatacenter.racks);
    store.setItem("datacenterPrice", objDatacenter.price);
    objDatacenter.show();
  },
  sell: function () {
    if (+objDatacenter.racks < 1) {
      notificationOverlay(
        "Geen rekken om te verkopen",
        "Datacenter",
        "fa-info"
      );
      return 0;
    }
    objDatacenter.price = +objDatacenter.price / objDatacenter.priceFactor;
    objDatacenter.racks--;
    objMoney.add(+objDatacenter.price * 0.75, "Verkoop datacenterrek", 37, 1);
    store.setItem("datacenterRacks", objDatacenter.racks);
    store.setItem("datacenterPrice", objDatacenter.price);
    objDatacenter.show();
  },
  produce: function () {
    if (objPause.is("Datacenter-col")) {
      objDatacenter.active = 0;
    } else {
      var active = Math.min(
        +objDatacenter.racks,
        Math.floor(+objEnergy.available / objDatacenter.energy),
        Math.floor(+objChips.amount / objDatacenter.chipUse)
      );
      objDatacenter.active = Math.max(0, active);
      if (active >= 1) {
        objEnergy.use(active * objDatacenter.energy, "Datacenter");
        objChips.use(active * objDatacenter.chipUse);
        objDatacenter.pending += active * objDatacenter.income;
        objAICoin.add(objStats.count("aicoin", active * objDatacenter.coins));
      }
    }
    objDatacenter.counter++;
    if (objDatacenter.counter >= objDatacenter.payPeriod) {
      objDatacenter.counter = 0;
      if (objDatacenter.pending > 0) {
        objMoney.add(objDatacenter.pending, "Rekenkracht datacenter", 38, 1);
        objDatacenter.pending = 0;
      }
    }
  },
  show: function () {
    var left = document.getElementById("datacenter");
    var right = document.getElementById("datacenterStats");
    if (!objChipFactory.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objDatacenter.racks;
    var a = objDatacenter.active;
    left.innerHTML =
      "<h2>Datacenter</h2>" +
      renderStats([
        ["Rekken", FixNumber(n)],
        ["Prijs per rek", FixMoney(objDatacenter.price)],
        ["Chips per rek", FixNumber(objDatacenter.chipsNeeded)],
        [
          "Verkoopwaarde",
          FixMoney((+objDatacenter.price / objDatacenter.priceFactor) * 0.75),
        ],
      ]) +
      "<h3>Per rek per tick</h3>" +
      renderStats([
        ["Energie", FixNumber(objDatacenter.energy)],
        ["Chips (onderhoud)", FixNumber(objDatacenter.chipUse)],
        ["Opbrengst", FixMoney(objDatacenter.income)],
        ["AICoin", FixNumber(objDatacenter.coins)],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objDatacenter.add();' id='buyRack'>Bouw rek</button>" +
      objBulk.buttons("datacenter") +
      " <button type='button' class='btn btn-danger' onClick='objDatacenter.sell();' id='sellRack'>Verkoop rek</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(a) + " van " + FixNumber(n)],
        ["Energie", FixNumber(a * objDatacenter.energy) + " per tick"],
        ["Chips", FixNumber(a * objDatacenter.chipUse) + " per tick"],
        ["Opbrengst", FixMoney(a * objDatacenter.income) + " per tick"],
        ["AICoin", FixNumber(a * objDatacenter.coins) + " per tick"],
      ]) +
      renderHint(
        "Een rek draait vanzelf zolang er energie en chips zijn. De opbrengst wordt iedere " +
          objDatacenter.payPeriod +
          " ticks uitbetaald. Ieder rek is 5% duurder dan het vorige."
      );
  },
  init: function () {
    objDatacenter.racks = +store.getItem("datacenterRacks") || 0;
    objDatacenter.price =
      +store.getItem("datacenterPrice") || objDatacenter.price;
    objDatacenter.show();
  },
};

// AICoin: een eigen munt met een grillige koers. Je kunt hem verkopen of bewaren.
var objAICoin = {
  amount: 0,
  price: 1000000000,
  previous: 1000000000,
  base: 1000000000, // de koers wordt hier langzaam naartoe getrokken
  minPrice: 100000000,
  maxPrice: 10000000000,
  add: function (amount) {
    objAICoin.amount = +objAICoin.amount + +amount;
    store.setItem("aicoinAmount", objAICoin.amount);
  },
  // Voor later: onderzoek betalen met AICoin
  use: function (amount) {
    if (+objAICoin.amount < +amount) return 0;
    objAICoin.amount = +objAICoin.amount - +amount;
    store.setItem("aicoinAmount", objAICoin.amount);
    objAICoin.show();
    return +amount;
  },
  // Nieuwe koers bij iedere prijswissel: willekeurig tot 25% op of neer, met een lichte trek naar de basiskoers
  newPrice: function () {
    if (!objChipFactory.unlocked()) return;
    var change = 0.75 + Math.random() * 0.5;
    var pull = Math.pow(objAICoin.base / objAICoin.price, 0.1);
    objAICoin.previous = objAICoin.price;
    objAICoin.price = Math.round(
      Math.max(
        objAICoin.minPrice,
        Math.min(objAICoin.maxPrice, objAICoin.price * change * pull)
      )
    );
    store.setItem("aicoinPrice", objAICoin.price);
    store.setItem("aicoinPrevious", objAICoin.previous);
  },
  sell: function (amount) {
    var coins =
      +amount > 0 ? Math.min(+amount, +objAICoin.amount) : +objAICoin.amount;
    if (coins <= 0) {
      notificationOverlay("Geen AICoin om te verkopen", "AICoin", "fa-info");
      return 0;
    }
    objAICoin.use(coins);
    objMoney.add(coins * objAICoin.price, "Verkoop AICoin", 39, coins);
  },
  show: function () {
    var top = document.getElementById("AICoinTop");
    var el = document.getElementById("AICoin");
    var visible = objChipFactory.unlocked();
    top.style.display = visible && +objAICoin.amount > 0 ? "" : "none";
    top.innerHTML = visible
      ? "AICoin: <kbd2>" + FixNumber(objAICoin.amount) + "</kbd2>"
      : "";
    top.title = FixNumber(objAICoin.amount, true);
    if (!visible) {
      el.innerHTML = "";
      return;
    }
    var change = (objAICoin.price / objAICoin.previous - 1) * 100;
    el.innerHTML =
      "<h2>AICoin</h2>" +
      renderStats([
        ["In bezit", FixNumber(objAICoin.amount)],
        ["Koers", FixMoney(objAICoin.price)],
        [
          "Verandering",
          renderTrend(objAICoin.price, objAICoin.previous).trim() +
            " " +
            (change >= 0 ? "+" : "") +
            FixNumber(Math.round(change * 10) / 10) +
            "%",
        ],
        ["Waarde", FixMoney(objAICoin.amount * objAICoin.price)],
      ]) +
      renderHint(
        "Het datacenter levert AICoin. De koers verandert bij iedere prijswissel en schommelt rond " +
          FixMoney(objAICoin.base) +
          ". Verkoop als de koers hoog is, of bewaar ze."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objAICoin.sell(1)' id='sellAICoinOne'>Verkoop 1 AICoin</button> " +
      "<button type='button' class='btn btn-danger' onClick='objAICoin.sell(0)' id='sellAICoin'>Verkoop alles</button>" +
      "</div>";
  },
  init: function () {
    objAICoin.amount = +store.getItem("aicoinAmount") || 0;
    objAICoin.price = +store.getItem("aicoinPrice") || objAICoin.base;
    objAICoin.previous = +store.getItem("aicoinPrevious") || objAICoin.price;
    objAICoin.show();
  },
};

// Isotopenlab (level 16): maakt van uranium medische isotopen, die vervallen en
// dus meteen aan ziekenhuizen worden verkocht, en industriële isotopen voor de
// materiaalinspectie in de chipfabrieken (#118). De opbrengst wordt net als bij het
// datacenter iedere 10 ticks in één keer uitbetaald.
var objIsotopeLab = {
  amount: 0,
  price: 500000000000,
  priceFactor: 1.05,
  steelNeeded: 1000000,
  pcbNeeded: 2000,
  goldNeeded: 50, // kg
  uraniumUse: 20, // ton per lab per tick
  energy: 50000,
  income: 250000000, // medische isotopen per lab per tick
  production: 0.1, // industriële isotopen per lab per tick
  payPeriod: 10,
  active: 0,
  pending: 0,
  counter: 0,
  add: function () {
    if (!objChipFactory.unlocked()) return 0;
    if (moneyCheck(+objIsotopeLab.price) == 0) {
      notificationOverlay("Niet genoeg doekoe!", "Isotopenlab", "fa-euro-sign");
      return 0;
    }
    if (+objSteel.amount < +objIsotopeLab.steelNeeded) {
      notificationOverlay("Niet genoeg staal!", "Isotopenlab", "fa-box");
      return 0;
    }
    if (!objPCB.has(objIsotopeLab.pcbNeeded, "Isotopenlab")) return 0;
    if (!objGold.has(objIsotopeLab.goldNeeded, "Isotopenlab")) return 0;
    objMoney.use(+objIsotopeLab.price);
    objSteel.use(+objIsotopeLab.steelNeeded);
    objPCB.use(objIsotopeLab.pcbNeeded);
    objGold.use(objIsotopeLab.goldNeeded);
    objSteel.show();
    objFlows.pulseAll([
      ["SteelInfo-col", "IsotopeLab-col"],
      ["PCB-col", "IsotopeLab-col"],
      ["GoldInfo-col", "IsotopeLab-col"],
    ]);
    objIsotopeLab.amount++;
    objIsotopeLab.price = +objIsotopeLab.price * objIsotopeLab.priceFactor;
    objIsotopeLab.save();
  },
  sell: function () {
    if (+objIsotopeLab.amount < 1) {
      notificationOverlay("Geen labs om te verkopen", "Isotopenlab", "fa-info");
      return 0;
    }
    objIsotopeLab.price = +objIsotopeLab.price / objIsotopeLab.priceFactor;
    objIsotopeLab.amount--;
    objMoney.add(+objIsotopeLab.price * 0.75, "Verkoop isotopenlab", 39, 1);
    objIsotopeLab.save();
  },
  save: function () {
    store.setItem("isotopeLabs", objIsotopeLab.amount);
    store.setItem("isotopeLabPrice", objIsotopeLab.price);
    objIsotopeLab.show();
  },
  // Draait iedere tick zolang er uranium en energie is. Passen de industriële isotopen
  // niet meer in de opslag, dan vervalt het overschot en loopt het lab gewoon door.
  produce: function () {
    if (objPause.is("IsotopeLab-col")) {
      objIsotopeLab.active = 0;
    } else {
      var active = Math.min(
        +objIsotopeLab.amount,
        Math.floor(+objUraniumOre.amount / objIsotopeLab.uraniumUse),
        Math.floor(+objEnergy.available / objIsotopeLab.energy)
      );
      objIsotopeLab.active = Math.max(0, active);
      if (active >= 1) {
        objUraniumOre.use(active * objIsotopeLab.uraniumUse);
        objUraniumOre.show();
        objEnergy.use(active * objIsotopeLab.energy, "Isotopenlab");
        objIsotopeLab.pending += active * objIsotopeLab.income;
        objIsotopes.add(
          objStats.count("isotopen", active * objIsotopeLab.production)
        );
      }
    }
    objIsotopeLab.counter++;
    if (objIsotopeLab.counter >= objIsotopeLab.payPeriod) {
      objIsotopeLab.counter = 0;
      if (objIsotopeLab.pending > 0) {
        objMoney.add(objIsotopeLab.pending, "Medische isotopen", 40, 1);
        objIsotopeLab.pending = 0;
      }
    }
  },
  show: function () {
    var left = document.getElementById("isotopeLab");
    var right = document.getElementById("isotopeLabStats");
    if (!objChipFactory.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var n = +objIsotopeLab.amount;
    var a = objIsotopeLab.active;
    left.innerHTML =
      "<h2>Isotopenlab</h2>" +
      renderStats([
        ["Labs", FixNumber(n)],
        ["Prijs per lab", FixMoney(objIsotopeLab.price)],
        ["Staal per lab", FixUnit(objIsotopeLab.steelNeeded, "ton")],
        ["Printplaten per lab", FixNumber(objIsotopeLab.pcbNeeded)],
        ["Goud per lab", FixUnit(objIsotopeLab.goldNeeded, "kg")],
        [
          "Verkoopwaarde",
          FixMoney((+objIsotopeLab.price / objIsotopeLab.priceFactor) * 0.75),
        ],
      ]) +
      "<h3>Per lab per tick</h3>" +
      renderStats([
        ["Uranium", FixUnit(objIsotopeLab.uraniumUse, "ton")],
        ["Energie", FixNumber(objIsotopeLab.energy)],
        ["Medische isotopen", FixMoney(objIsotopeLab.income)],
        ["Industriële isotopen", FixNumber(objIsotopeLab.production)],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objIsotopeLab.add();' id='buyIsotopeLab'>Bouw lab</button>" +
      objBulk.buttons("isotopeLab") +
      " <button type='button' class='btn btn-danger' onClick='objIsotopeLab.sell();' id='sellIsotopeLab'>Verkoop lab</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Nu</h3>" +
      renderStats([
        ["Actief", FixNumber(a) + " van " + FixNumber(n)],
        ["Uranium", FixUnit(a * objIsotopeLab.uraniumUse, "ton per tick")],
        ["Energie", FixNumber(a * objIsotopeLab.energy) + " per tick"],
        ["Medische isotopen", FixMoney(a * objIsotopeLab.income) + " per tick"],
        [
          "Industriële isotopen",
          FixNumber(a * objIsotopeLab.production) + " per tick",
        ],
      ]) +
      renderHint(
        "Een lab draait vanzelf zolang er uranium en energie is. Medische isotopen vervallen snel en gaan meteen naar ziekenhuizen; de opbrengst wordt iedere " +
          objIsotopeLab.payPeriod +
          " ticks uitbetaald. Ieder lab is 5% duurder dan het vorige."
      );
  },
  init: function () {
    objIsotopeLab.amount = +store.getItem("isotopeLabs") || 0;
    objIsotopeLab.price =
      +store.getItem("isotopeLabPrice") || objIsotopeLab.price;
    objIsotopeLab.show();
  },
};

// Industriële isotopen (level 16): een chipfabriek die er 0,05 per tick van krijgt,
// maakt 25% meer chips (materiaalinspectie). Isotopen die niet gebruikt worden vervallen
// (halveringstijd 600 ticks); wat niet in de opslag past, is meteen verloren.
var objIsotopes = {
  amount: 0,
  storage: 1,
  storageCap: 100,
  storagePrice: 10000000000,
  price: 100000000,
  halfLife: 600, // ticks
  decayed: 0, // vervallen in de laatste tick
  space: function () {
    return +objIsotopes.storage * +objIsotopes.storageCap - +objIsotopes.amount;
  },
  add: function (amountAdded) {
    objIsotopes.amount =
      +objIsotopes.amount + Math.min(+amountAdded, objIsotopes.space());
    store.setItem("isotopesAmount", +objIsotopes.amount);
    objIsotopes.show();
  },
  use: function (amount) {
    return useResource("objIsotopes", amount, "isotopesAmount");
  },
  // Iedere tick vervalt een deel van de voorraad
  decay: function () {
    if (+objIsotopes.amount <= 0) {
      objIsotopes.decayed = 0;
      return;
    }
    var left = +objIsotopes.amount * Math.pow(0.5, 1 / objIsotopes.halfLife);
    if (left < 0.001) left = 0;
    objIsotopes.decayed = +objIsotopes.amount - left;
    objIsotopes.amount = left;
    store.setItem("isotopesAmount", +objIsotopes.amount);
  },
  sell: function () {
    var amountSold = Math.floor(+objIsotopes.amount);
    if (amountSold <= 0) return 0;
    objIsotopes.use(amountSold);
    objMoney.add(
      +amountSold * +objIsotopes.price,
      "Verkoop industriële isotopen",
      41,
      amountSold
    );
  },
  addStorage: function () {
    if (moneyCheck(+objIsotopes.storagePrice) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Isotopenopslag",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(+objIsotopes.storagePrice);
    objIsotopes.storage++;
    store.setItem("isotopesStorage", objIsotopes.storage);
    objIsotopes.show();
  },
  show: function () {
    var left = document.getElementById("isotopes");
    var right = document.getElementById("isotopesStorage");
    if (!objChipFactory.unlocked()) {
      left.innerHTML = "";
      right.innerHTML = "";
      return;
    }
    var capacity = +objIsotopes.storage * +objIsotopes.storageCap;
    left.innerHTML =
      "<h2>Industriële isotopen</h2>" +
      renderBar(
        "Voorraad",
        FixNumber(Math.floor(objIsotopes.amount * 100) / 100),
        (+objIsotopes.amount / capacity) * 100
      ) +
      renderStats([
        ["Vrije ruimte", FixNumber(Math.floor(objIsotopes.space()))],
        ["Prijs per isotoop", FixMoney(objIsotopes.price)],
        [
          "Verval",
          FixNumber(Math.round(objIsotopes.decayed * 1000) / 1000) +
            " per tick",
        ],
        [
          "Chipfabrieken met inspectie",
          FixNumber(objChipFactory.inspected) +
            " van " +
            FixNumber(objChipFactory.amount),
        ],
      ]) +
      renderHint(
        "Een chipfabriek die " +
          FixNumber(objChipFactory.isotopeUse) +
          " isotoop per tick krijgt, maakt 25% meer chips. Isotopen die je niet gebruikt vervallen: na " +
          FixDuration(objIsotopes.halfLife / 60) +
          " is de helft over. Wat niet in de opslag past, is meteen verloren."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-danger' onClick='objIsotopes.sell()' id='sellIsotopes'>Verkoop isotopen</button>" +
      "</div>";
    right.innerHTML =
      "<h3>Opslag</h3>" +
      renderStats([
        [
          "Opslagen",
          FixNumber(objIsotopes.storage) +
            " (" +
            FixNumber(capacity) +
            " isotopen)",
        ],
        ["Prijs extra opslag", FixMoney(objIsotopes.storagePrice)],
        [
          "Capaciteit per opslag",
          FixNumber(objIsotopes.storageCap) + " isotopen",
        ],
      ]) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objIsotopes.addStorage();' id='addIsotopesStorage'>Koop opslag</button>" +
      "</div>";
  },
  init: function () {
    objIsotopes.amount = +store.getItem("isotopesAmount") || 0;
    objIsotopes.storage = +store.getItem("isotopesStorage") || 1;
    objIsotopes.show();
  },
};

// Fusiecentrale: heel veel energie zonder brandstof, voor het datacenter
var objFusion = {
  amount: 0,
  price: 5000000000000,
  priceFactor: 1.15,
  chipsNeeded: 2000,
  steelNeeded: 2000000,
  production: 2000000,
  add: function () {
    if (!objChipFactory.unlocked()) return 0;
    if (moneyCheck(+objFusion.price) == 0) {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Fusiecentrale",
        "fa-euro-sign"
      );
      return 0;
    }
    if (+objSteel.amount < +objFusion.steelNeeded) {
      notificationOverlay("Niet genoeg staal!", "Fusiecentrale", "fa-box");
      return 0;
    }
    if (!objChips.has(objFusion.chipsNeeded, "Fusiecentrale")) return 0;
    objMoney.use(+objFusion.price);
    objSteel.use(+objFusion.steelNeeded);
    objSteel.show();
    objChips.use(objFusion.chipsNeeded);
    objFlows.pulseAll([
      ["SteelInfo-col", "Fusion-col"],
      ["Chips-col", "Fusion-col"],
    ]);
    objFusion.amount++;
    objFusion.price = +objFusion.price * objFusion.priceFactor;
    store.setItem("fusionPlants", objFusion.amount);
    store.setItem("fusionPrice", objFusion.price);
    objFusion.show();
    objEnergy.show();
  },
  sell: function () {
    if (+objFusion.amount < 1) {
      notificationOverlay(
        "Geen fusiecentrales om te verkopen",
        "Fusiecentrale",
        "fa-info"
      );
      return 0;
    }
    objFusion.price = +objFusion.price / objFusion.priceFactor;
    objFusion.amount--;
    objMoney.add(+objFusion.price * 0.75, "Verkoop fusiecentrale", 40, 1);
    store.setItem("fusionPlants", objFusion.amount);
    store.setItem("fusionPrice", objFusion.price);
    objFusion.show();
    objEnergy.show();
  },
  show: function () {
    var el = document.getElementById("fusion");
    if (!objChipFactory.unlocked()) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML =
      "<h2>Fusiecentrales</h2>" +
      renderStats([
        ["Fusiecentrales", FixNumber(objFusion.amount)],
        [
          "Energie",
          FixNumber(objFusion.amount * objFusion.production) + " per tick",
        ],
        ["Prijs per centrale", FixMoney(objFusion.price)],
        ["Chips per centrale", FixNumber(objFusion.chipsNeeded)],
        ["Staal per centrale", FixUnit(objFusion.steelNeeded, "ton")],
        [
          "Verkoopwaarde",
          FixMoney((+objFusion.price / objFusion.priceFactor) * 0.75),
        ],
      ]) +
      renderHint(
        "Een fusiecentrale levert " +
          FixNumber(objFusion.production) +
          " energie per tick, zonder brandstof. Zorg voor genoeg energieopslag: wat niet past, gaat verloren. Iedere centrale is 15% duurder dan de vorige."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objFusion.add();' id='buyFusion'>Bouw fusiecentrale</button>" +
      objBulk.buttons("fusion") +
      " <button type='button' class='btn btn-danger' onClick='objFusion.sell();' id='sellFusion'>Verkoop fusiecentrale</button>" +
      "</div>";
  },
  init: function () {
    objFusion.amount = +store.getItem("fusionPlants") || 0;
    objFusion.price = +store.getItem("fusionPrice") || objFusion.price;
    objFusion.show();
  },
};

// Splijtstofstavenfabriek
var objFuelCellFactory = {
  amount: 0,
  activeFactories: 0,
  production: 1,
  energy: 150000,
  urianiumOreNeeded: 10000,
  steelNeeded: 1000,
  timeNeeded: 100,
  counter: 0,
  cost: 15000000000,
  energyPerTick: function () {
    return +objFuelCellFactory.energy / +objFuelCellFactory.timeNeeded;
  },
  addFactory: function (actie) {
    if (+actie == 1) {
      if (moneyCheck(+objFuelCellFactory.cost) == 0) {
        notificationOverlay(
          "Niet genoeg doekoe!",
          "Splijtstofstavenfabriek",
          "fa-euro-sign"
        );
        return 0;
      } else {
        objMoney.use(+objFuelCellFactory.cost);
        objFuelCellFactory.amount++;
        store.setItem("fuellCellFactory", objFuelCellFactory.amount);
        objFuelRod.storage =
          +objFuelRod.storageFactor * +objFuelCellFactory.amount;
        objFuelCellFactory.show();
      }
    } else {
      objMoney.add(
        +objFuelCellFactory.cost * 0.75,
        "Splijtstofstavenfabriek verkocht",
        18,
        1
      );
      objFuelCellFactory.amount--;
      store.setItem("fuellCellFactory", objFuelCellFactory.amount);
      objFuelRod.storage =
        +objFuelRod.storageFactor * +objFuelCellFactory.amount;
      if (+objFuelRod.amount > +objFuelRod.storage) {
        var waste = +objFuelRod.amount - +objFuelRod.storage;
        objFuelRod.wasteFunction(+waste);
        objFuelRod.amount =
          +objFuelRod.storageFactor * +objFuelCellFactory.amount;
      }
      store.setItem("frAmount", +objFuelRod.amount);
      objFuelCellFactory.show();
    }
  },
  produce: function () {
    if (objPause.is("fuelRodFactory")) {
      document.getElementById("fuelRodCounter").innerHTML = "Gepauzeerd";
      return 0;
    }
    if (objFuelCellFactory.amount == 0) {
      return 0;
    }
    // Controleren of het de start van een nieuwe batch is
    if (objFuelCellFactory.counter == 0) {
      objFuelCellFactory.activeFactories = objFuelCellFactory.amount;

      // Beschikbaarheid opslag bepalen
      var availableSpace = +objFuelRod.storage - +objFuelRod.amount;
      if (
        +objFuelCellFactory.activeFactories * +objFuelCellFactory.production >
        +availableSpace
      ) {
        objFuelCellFactory.activeFactories = Math.floor(
          +availableSpace / +objFuelCellFactory.production
        );
        if (+objFuelCellFactory.activeFactories == 0) {
          store.setItem(
            "fuellCellFactoryActive",
            objFuelCellFactory.activeFactories
          );
          objFuelCellFactory.counter = 0;
          return 0;
        }
      }

      // Beschikbaarheid energie bepalen (genoeg voor de eerste tick)
      var batchEnergy = objFuelCellFactory.energyPerTick();
      if (
        +objFuelCellFactory.activeFactories * batchEnergy >
        +objEnergy.available
      ) {
        objFuelCellFactory.activeFactories = Math.floor(
          +objEnergy.available / batchEnergy
        );
        if (+objFuelCellFactory.activeFactories == 0) {
          store.setItem(
            "fuellCellFactoryActive",
            objFuelCellFactory.activeFactories
          );
          objFuelCellFactory.counter = 0;
          return 0;
        }
      }
      // Beschikbaarheid staal bepalen
      if (
        +objFuelCellFactory.activeFactories * +objFuelCellFactory.steelNeeded >
        +objSteel.amount
      ) {
        objFuelCellFactory.activeFactories = Math.floor(
          +objSteel.amount / +objFuelCellFactory.steelNeeded
        );
        if (+objFuelCellFactory.activeFactories == 0) {
          store.setItem(
            "fuellCellFactoryActive",
            objFuelCellFactory.activeFactories
          );
          objFuelCellFactory.counter = 0;
          return 0;
        }
      }
      // Beschikbaarheid uranium bepalen
      if (
        +objFuelCellFactory.activeFactories *
          +objFuelCellFactory.urianiumOreNeeded >
        +objUraniumOre.amount
      ) {
        objFuelCellFactory.activeFactories = Math.floor(
          +objUraniumOre.amount / +objFuelCellFactory.urianiumOreNeeded
        );
        if (+objFuelCellFactory.activeFactories == 0) {
          store.setItem(
            "fuellCellFactoryActive",
            objFuelCellFactory.activeFactories
          );
          objFuelCellFactory.counter = 0;
          return 0;
        }
      }
      store.setItem(
        "fuellCellFactoryActive",
        objFuelCellFactory.activeFactories
      );
      // Werkelijk benodigde hoeveelheden bepalen
      var UN =
        +objFuelCellFactory.urianiumOreNeeded *
        +objFuelCellFactory.activeFactories;
      var SN =
        +objFuelCellFactory.steelNeeded * +objFuelCellFactory.activeFactories;

      // Werkelijk gebruiken resources (de stroom komt per tick, zie hieronder)
      objUraniumOre.use(UN);
      objSteel.use(SN);
    }

    // Iedere tick een deel van de stroom; is die er niet, dan wacht de batch
    var tickEnergy =
      objFuelCellFactory.energyPerTick() * +objFuelCellFactory.activeFactories;
    if (objEnergy.use(tickEnergy, "Fuelcellfactory") !== tickEnergy) {
      document.getElementById("fuelRodCounter").innerHTML =
        "Wacht op stroom (" + FixNumber(tickEnergy) + " per tick)";
      return 0;
    }

    // Aflopen productie timer
    objFuelCellFactory.counter++;
    if (+objFuelCellFactory.counter == +objFuelCellFactory.timeNeeded) {
      objFuelRod.add(
        objStats.count(
          "splijtstof",
          +objFuelCellFactory.activeFactories * +objFuelCellFactory.production
        )
      );
      objFuelCellFactory.counter = 0;
    }
    store.setItem("fcfCounter", +objFuelCellFactory.counter);
    document.getElementById("fuelRodCounter").innerHTML =
      "Productie klaar over " +
      FixNumber(100 - +objFuelCellFactory.counter) +
      " ticks";
  },
  show: function () {
    document.getElementById("fuelRod").innerHTML =
      "<h2>Splijtstofstaven</h2>" +
      renderStats([
        ["Fabrieken", FixNumber(objFuelCellFactory.amount)],
        ["Prijs per fabriek", FixMoney(objFuelCellFactory.cost)],
        ["Verkoopwaarde", FixMoney(objFuelCellFactory.cost * 0.75)],
      ]) +
      "<h3>Per fabriek per run</h3>" +
      renderStats([
        ["Uranium", FixUnit(objFuelCellFactory.urianiumOreNeeded, "ton")],
        ["Staal", FixUnit(objFuelCellFactory.steelNeeded, "ton")],
        ["Energie", FixNumber(objFuelCellFactory.energy)],
        ["Duur", FixNumber(objFuelCellFactory.timeNeeded) + " ticks"],
        ["Opbrengst", "1 staaf"],
      ]) +
      renderHint(
        "Fabrieken draaien altijd door. Uranium en staal worden aan het begin van een run afgeschreven, de stroom per tick."
      );
    document.getElementById("fuelRod2").innerHTML =
      "<h3>Totaal per run</h3>" +
      renderStats([
        [
          "Uranium",
          FixUnit(
            objFuelCellFactory.amount * +objFuelCellFactory.urianiumOreNeeded,
            "ton"
          ),
        ],
        [
          "Staal",
          FixUnit(
            objFuelCellFactory.amount * +objFuelCellFactory.steelNeeded,
            "ton"
          ),
        ],
        [
          "Energie",
          FixNumber(objFuelCellFactory.amount * +objFuelCellFactory.energy),
        ],
      ]);
    if (+objFuelCellFactory.amount == 0) {
      document.getElementById("fcfSellButton").disabled = true;
    } else {
      document.getElementById("fcfSellButton").disabled = false;
    }
    objFuelRod.show();
  },
  init: function () {
    objFuelCellFactory.amount = store.getItem("fuellCellFactory") || 0;
    objFuelCellFactory.activeFactories =
      store.getItem("fuellCellFactoryActive") || 0;
    objFuelCellFactory.counter = store.getItem("fcfCounter") || 0;
    objFuelCellFactory.show();
    objFuelRod.init();
  },
};

// Splijtstofstaven
var objFuelRod = {
  amount: 0,
  storage: 0,
  storageFactor: 5,
  waste: 0,
  wasteCost: 100000,
  wastePrice: 0,
  calculateWastePrice: function (max, min) {
    objFuelRod.wastePrice = Math.random() * (max - min) + min;
    document.getElementById("sellWaste").innerHTML = renderStats([
      ["Laten opruimen per staaf", FixMoney(objFuelRod.wastePrice)],
    ]);
    return 0;
  },
  sellWaste: function () {
    var totalcost = +objFuelRod.waste * +objFuelRod.wastePrice;
    if (+totalcost <= +objMoney.amount) {
      objMoney.use(+totalcost);
      var wasted = parseInt(objFuelRod.waste);
      objFuelRod.waste = 0;
      store.setItem("frWaste", objFuelRod.waste);
      objFuelRod.show();
    } else {
      notificationOverlay(
        "Niet genoeg doekoe!",
        "Verkoop radioactief afval",
        "fa-euro-sign"
      );
    }
  },
  add: function (amount) {
    objFuelRod.amount = +objFuelRod.amount + +amount;
    if (+objFuelRod.amount > +objFuelRod.storage) {
      objFuelRod.wasteFunction(+objFuelRod.amount - +objFuelRod.storage);
      objFuelRod.amount =
        +objFuelRod.storageFactor * +objFuelCellFactory.amount;
    }
    store.setItem("frAmount", +objFuelRod.amount);
    objFuelRod.show();
  },
  remove: function (amount) {
    if (objFuelRod.amount == 0) {
      return 0;
    } else {
      if (+amount <= +objFuelRod.amount) {
        objFuelRod.amount = +objFuelRod.amount - +amount;
        objFuelRod.show();
        return amount;
      } else {
        var availableRods = +objFuelRod.amount;
        objFuelRod.amount = 0;
        objFuelRod.show();
        return availableRods;
      }
    }
  },
  wasteFunction: function (amount) {
    objFuelRod.waste = +objFuelRod.waste + +amount;
    store.setItem("frWaste", objFuelRod.waste);
    objFuelRod.show();
  },
  wastePayment: function () {
    objMoney.use(+objFuelRod.waste * +objFuelRod.wasteCost);
  },
  show: function () {
    var factoryStorage = +objFuelCellFactory.amount * +objFuelRod.storageFactor;
    document.getElementById("fuelStorage").innerHTML =
      "<h2>Opslag splijtstofstaven</h2>" +
      renderStats([
        [
          "Voorraad",
          renderStock(
            FixNumber(objFuelRod.amount) + " staven",
            (+objFuelRod.amount / factoryStorage) * 100
          ),
        ],
        [
          "Vrije ruimte",
          FixNumber(factoryStorage - +objFuelRod.amount) + " staven",
        ],
        ["Opslag per fabriek", FixNumber(objFuelRod.storageFactor) + " staven"],
      ]);
    document.getElementById("fuelStoragePlant").innerHTML = renderHint(
      "Staven gaan uit de fabrieken direct naar de kerncentrales."
    );
    document.getElementById("fuelWaste").innerHTML =
      "<h3>Afval</h3>" +
      renderStats([
        ["Afvalstaven", FixNumber(objFuelRod.waste)],
        [
          "Opslagkosten per staaf",
          FixMoney(objFuelRod.wasteCost) + " per 60 ticks",
        ],
        [
          "Totaal per 60 ticks",
          FixMoney(+objFuelRod.waste * +objFuelRod.wasteCost),
        ],
      ]) +
      renderHint(
        "Verbruikte staven, en staven uit een gesloten fabriek of centrale, gaan naar het afval en kunnen niet hergebruikt worden."
      );
    // Hier en niet bij de prijs: die wordt zonder fabrieken niet altijd berekend (#107)
    document.getElementById("fcSellWasteButton").disabled =
      +objFuelRod.waste == 0;
  },
  init: function () {
    objFuelRod.waste = store.getItem("frWaste") || 0;
    objFuelRod.amount = store.getItem("frAmount") || 0;
    objFuelRod.storage = +objFuelRod.storageFactor * +objFuelCellFactory.amount;
    if (+objFuelRod.amount > +objFuelRod.storage) {
      var waste = +objFuelRod.amount - +objFuelRod.storage;
      objFuelRod.wasteFunction(+waste);
      objFuelRod.amount =
        +objFuelRod.storageFactor * +objFuelCellFactory.amount;
      store.setItem("frAmount", +objFuelRod.amount);
    }
    objFuelRod.calculateWastePrice(50000, 99999);
    objFuelRod.show();
  },
};

// Kerncentrale
var objNuclearPowerPlant = {
  amount: 0,
  plantCost: 50000000000,
  plantSteelNeeded: 500000,
  reactors: 0,
  reactorCost: 10000000000,
  reactorSteelNeeded: 500000,
  plantReactorCap: 5,
  reactorProduction: 5000,
  // Reactorbesturing (vanaf level 14): een bestuurde reactor levert het dubbele
  controlled: 0,
  controlPCB: 2000,
  controlGold: 50,
  controlUnlocked: function () {
    return +objPlayerInfo.level >= 14;
  },
  // Extra energie door besturing: alleen voor reactoren die draaien
  controlBonus: function () {
    return (
      Math.min(
        +objNuclearPowerPlant.controlled,
        +objNuclearPowerPlant.activeReactors
      ) * +objNuclearPowerPlant.reactorProduction
    );
  },
  addControl: function () {
    if (!objNuclearPowerPlant.controlUnlocked()) return 0;
    if (+objNuclearPowerPlant.controlled >= +objNuclearPowerPlant.reactors) {
      notificationOverlay(
        "Iedere reactor heeft al besturing. Bouw eerst een extra reactor.",
        "Reactorbesturing",
        "fa-info"
      );
      return 0;
    }
    if (!objPCB.has(objNuclearPowerPlant.controlPCB, "Reactorbesturing"))
      return 0;
    if (!objGold.has(objNuclearPowerPlant.controlGold, "Reactorbesturing"))
      return 0;
    objPCB.use(objNuclearPowerPlant.controlPCB);
    objGold.use(objNuclearPowerPlant.controlGold);
    objFlows.pulseAll([
      ["PCB-col", "nuclearPower"],
      ["GoldInfo-col", "nuclearPower"],
    ]);
    objNuclearPowerPlant.controlled++;
    store.setItem("reactorControls", objNuclearPowerPlant.controlled);
    objNuclearPowerPlant.showControl();
    objEnergy.show();
  },
  showControl: function () {
    var el = document.getElementById("reactorControl");
    if (!objNuclearPowerPlant.controlUnlocked()) {
      el.innerHTML = "";
      return;
    }
    var free =
      +objNuclearPowerPlant.reactors - +objNuclearPowerPlant.controlled;
    el.innerHTML =
      "<h3>Reactorbesturing</h3>" +
      renderStats([
        [
          "Bestuurde reactoren",
          FixNumber(objNuclearPowerPlant.controlled) +
            " van " +
            FixNumber(objNuclearPowerPlant.reactors),
        ],
        [
          "Extra energie",
          FixNumber(objNuclearPowerPlant.controlBonus()) + " per tick",
        ],
        [
          "Printplaten per besturing",
          FixNumber(objNuclearPowerPlant.controlPCB),
        ],
        ["Goud per besturing", FixUnit(objNuclearPowerPlant.controlGold, "kg")],
      ]) +
      renderHint(
        "Een reactor met besturing levert het dubbele aan energie (10.000 per tick) voor dezelfde pellets."
      ) +
      "<div class='actions'>" +
      "<button type='button' class='btn btn-primary' onClick='objNuclearPowerPlant.addControl();' id='addReactorControl'" +
      (free < 1 ? " disabled" : "") +
      ">Installeer besturing</button>" +
      objBulk.buttons("reactorControl") +
      "</div>";
  },
  reactorFuelUsage: 1,
  reactorFuelCap: 3,
  fuelRodPellets: 1000,
  fuelRods: 0,
  pelletsActive: 0,
  pelletsUsed: 0,
  activeReactors: 0,
  buildPlant: function () {
    if (+objSteel.amount < +objNuclearPowerPlant.plantSteelNeeded) {
      notificationOverlay("Niet genoeg staal!", "Kerncentrale", "fa-box");
      return 0;
    }
    if (+objMoney.amount < +objNuclearPowerPlant.plantCost) {
      notificationOverlay(
        "Niet genoeg centjes!",
        "Kerncentrale",
        "fa-euro-sign"
      );
      return 0;
    }
    objMoney.use(objNuclearPowerPlant.plantCost);
    objSteel.use(objNuclearPowerPlant.plantSteelNeeded);
    objFlows.pulse("SteelInfo-col", "nuclearPower");
    objNuclearPowerPlant.amount++;
    store.setItem("nppAmount", objNuclearPowerPlant.amount);
    objNuclearPowerPlant.show();
    objNuclearPowerPlant.showUsage();
  },
  buildReactor: function () {
    if (+objSteel.amount < +objNuclearPowerPlant.reactorSteelNeeded) {
      notificationOverlay("Niet genoeg staal!", "Kerncentrale", "fa-box");
      return 0;
    }
    if (+objMoney.amount < +objNuclearPowerPlant.reactorCost) {
      notificationOverlay(
        "Niet genoeg centjes!",
        "Kerncentrale",
        "fa-euro-sign"
      );
      return 0;
    }
    if (
      +objNuclearPowerPlant.amount < 1 ||
      +objNuclearPowerPlant.reactors ==
        +objNuclearPowerPlant.amount * +objNuclearPowerPlant.plantReactorCap
    ) {
      notificationOverlay(
        "Geen centrale (of geen ruimte) om de reactor te bouwen!",
        "Kerncentrale",
        "fa-euro-sign"
      );
      return 0;
    }

    objMoney.use(objNuclearPowerPlant.reactorCost);
    objSteel.use(objNuclearPowerPlant.reactorSteelNeeded);
    objFlows.pulse("SteelInfo-col", "nuclearPower");
    objNuclearPowerPlant.reactors++;
    store.setItem("nrAmount", objNuclearPowerPlant.reactors);
    objNuclearPowerPlant.show();
    objNuclearPowerPlant.showUsage();
  },
  addFuel: function () {
    if (
      +objNuclearPowerPlant.fuelRods <
      +objNuclearPowerPlant.reactorFuelCap * +objNuclearPowerPlant.reactors
    ) {
      var maxCap =
        +objNuclearPowerPlant.reactorFuelCap * +objNuclearPowerPlant.reactors;
      var addedRods = objFuelRod.remove(
        +maxCap - +objNuclearPowerPlant.fuelRods
      );
      objNuclearPowerPlant.fuelRods =
        +objNuclearPowerPlant.fuelRods + +addedRods;
      objNuclearPowerPlant.pelletsActive =
        +objNuclearPowerPlant.pelletsActive +
        +addedRods * +objNuclearPowerPlant.fuelRodPellets;
      store.setItem("pelletsActive", +objNuclearPowerPlant.pelletsActive);
      store.setItem("ppFuelRods", +objNuclearPowerPlant.fuelRods);
      objFuelRod.show();
      objNuclearPowerPlant.showUsage();
    }
  },
  removeFuel: function (amount) {
    objNuclearPowerPlant.pelletsUsed =
      +objNuclearPowerPlant.pelletsUsed + +amount;
    objNuclearPowerPlant.pelletsActive =
      +objNuclearPowerPlant.pelletsActive - +amount;
    while (+objNuclearPowerPlant.pelletsUsed > 999) {
      if (+objNuclearPowerPlant.fuelRods > 0) {
        objNuclearPowerPlant.fuelRods = +objNuclearPowerPlant.fuelRods - 1;
      }
      objNuclearPowerPlant.pelletsUsed =
        +objNuclearPowerPlant.pelletsUsed - 1000;
      objFuelRod.wasteFunction(1);
      //objNuclearPowerPlant.addFuel();
      objFuelRod.show();
      objNuclearPowerPlant.showUsage();
    }
    store.setItem("pelletsUsed", +objNuclearPowerPlant.pelletsUsed);
    store.setItem("pelletsActive", +objNuclearPowerPlant.pelletsActive);
    store.setItem("ppFuelRods", +objNuclearPowerPlant.fuelRods);
    objNuclearPowerPlant.show();
  },
  produce: function () {
    objNuclearPowerPlant.addFuel();
    objNuclearPowerPlant.activeReactors = Math.min(
      +objNuclearPowerPlant.reactors,
      Math.floor(
        +objNuclearPowerPlant.pelletsActive /
          +objNuclearPowerPlant.reactorFuelUsage
      )
    );
    objNuclearPowerPlant.removeFuel(
      +(
        +objNuclearPowerPlant.activeReactors *
        +objNuclearPowerPlant.reactorFuelUsage
      )
    );
    var nppProduction =
      +objNuclearPowerPlant.activeReactors *
        +objNuclearPowerPlant.reactorProduction +
      objNuclearPowerPlant.controlBonus();
    objNuclearPowerPlant.showUsage();
    return +nppProduction;
  },
  show: function () {
    document.getElementById("npp").innerHTML =
      "<h2>Kerncentrales</h2>" +
      renderStats([
        ["Prijs per centrale", FixMoney(objNuclearPowerPlant.plantCost)],
        [
          "Staal per centrale",
          FixUnit(objNuclearPowerPlant.plantSteelNeeded, "ton"),
        ],
        [
          "Reactoren per centrale",
          FixNumber(objNuclearPowerPlant.plantReactorCap),
        ],
      ]);
    if (
      +objNuclearPowerPlant.amount < 1 ||
      +objNuclearPowerPlant.reactors ==
        +objNuclearPowerPlant.amount * +objNuclearPowerPlant.plantReactorCap
    ) {
      document.getElementById("npprBuild").disabled = true;
    } else {
      document.getElementById("npprBuild").disabled = false;
    }
    document.getElementById("nppr").innerHTML =
      "<h3>Reactoren</h3>" +
      renderStats([
        ["Prijs per reactor", FixMoney(objNuclearPowerPlant.reactorCost)],
        [
          "Staal per reactor",
          FixUnit(objNuclearPowerPlant.reactorSteelNeeded, "ton"),
        ],
        [
          "Verbruik per reactor",
          FixNumber(objNuclearPowerPlant.reactorFuelUsage) +
            (+objNuclearPowerPlant.reactorFuelUsage == 1
              ? " pellet"
              : " pellets") +
            " per tick",
        ],
      ]) +
      renderHint(
        "Een staaf bevat 1.000 pellets. Reactoren kunnen niet verkocht worden; stroom die niet past gaat verloren."
      );
  },
  showUsage: function () {
    document.getElementById("nppsum").innerHTML =
      "<h3>Overzicht</h3>" +
      renderStats([
        ["Kerncentrales", FixNumber(objNuclearPowerPlant.amount)],
        [
          "Reactoren actief",
          FixNumber(objNuclearPowerPlant.activeReactors) +
            " van " +
            FixNumber(objNuclearPowerPlant.reactors),
        ],
        [
          "Staven in centrales",
          FixNumber(objNuclearPowerPlant.fuelRods) +
            " van " +
            FixNumber(
              +objNuclearPowerPlant.reactors *
                +objNuclearPowerPlant.reactorFuelCap
            ),
        ],
        [
          "Energie per tick",
          FixNumber(
            +objNuclearPowerPlant.activeReactors *
              +objNuclearPowerPlant.reactorProduction +
              objNuclearPowerPlant.controlBonus()
          ),
        ],
        [
          "Pellets per tick",
          FixNumber(
            +objNuclearPowerPlant.activeReactors *
              +objNuclearPowerPlant.reactorFuelUsage
          ),
        ],
        ["Verbruikte pellets", FixNumber(objNuclearPowerPlant.pelletsUsed)],
      ]);
  },
  init: function () {
    objNuclearPowerPlant.fuelRods = store.getItem("ppFuelRods") || 0;
    objNuclearPowerPlant.amount = store.getItem("nppAmount") || 0;
    objNuclearPowerPlant.reactors = store.getItem("nrAmount") || 0;
    objNuclearPowerPlant.controlled = Math.min(
      +store.getItem("reactorControls") || 0,
      +objNuclearPowerPlant.reactors
    );
    objNuclearPowerPlant.pelletsActive = store.getItem("pelletsActive") || 0;
    // Schatting tot de eerste tick, zodat de energiekaart direct klopt (#116)
    objNuclearPowerPlant.activeReactors = Math.min(
      +objNuclearPowerPlant.reactors,
      Math.floor(
        +objNuclearPowerPlant.pelletsActive /
          +objNuclearPowerPlant.reactorFuelUsage
      )
    );
    objNuclearPowerPlant.pelletsUsed = store.getItem("pelletsUsed") || 0;
    objNuclearPowerPlant.show();
    objNuclearPowerPlant.showControl();
  },
};

// Geadvanseerde oliepompen

var objOilPumpAdv = {
  amount: 0,
  price: 1000000,
  energy: 75,
  steelNeeded: 10000,
  production: 100,
  upgrade: function (amount) {
    var upgradable = +objOilPump.amount;
    if (+amount > +upgradable) {
      amount = +upgradable;
    }
    if (+amount == 0) {
      notificationOverlay(
        "Geen pompen om te upgraden!",
        "High-tech oliepomp",
        "fa-info-circle"
      );
      return 0;
    }
    var amountResult = objOilPumpAdv.buildCheck(+amount);
    if (+amountResult > 0) {
      // Iedere oude pomp afzonderlijk verkopen, zodat elke pomp wordt uitbetaald
      for (let i = 0; i < +amountResult; i++) {
        objOilPump.remove(1);
      }
      objOilPumpAdv.add(+amountResult, 1);
    } else {
      return 0;
    }
  },
  buildCheck: function (amount) {
    if (+amount * +objOilPumpAdv.price > +objMoney.amount) {
      amount = Math.floor(+objMoney.amount / +objOilPumpAdv.price);
    }
    if (+amount == 0) {
      notificationOverlay(
        "Niet genoeg monnies!",
        "High-tech oliepomp",
        "fa-euro-sign"
      );
    }
    if (+amount * objOilPumpAdv.steelNeeded > +objSteel.amount) {
      amount = Math.floor(+objSteel.amount / +objOilPumpAdv.steelNeeded);
    }
    if (+amount == 0) {
      notificationOverlay("Niet genoeg staal!", "High-tech oliepomp", "fa-box");
    }
    return +amount;
  },
  add: function (amount, checked) {
    if (+checked == 0) {
      amount = objOilPumpAdv.buildCheck(amount);
    }
    if (+amount == 0) {
      return 0;
    } else {
      objMoney.use(+objOilPumpAdv.price * +amount);
      objSteel.use(+objOilPumpAdv.steelNeeded * +amount);
      objFlows.pulse("SteelInfo-col", "pomp-col");
      objOilPumpAdv.amount = +objOilPumpAdv.amount + +amount;
    }
    store.setItem("oilPumpAmount", objOilPumpAdv.amount);
    objOilPumpAdv.show();
  },
  sell: function () {
    if (+objOilPumpAdv.amount > 0) {
      // Net als andere gebouwen levert verkopen 75% van de prijs op (het staal komt niet terug)
      objMoney.add(+objOilPumpAdv.price * 0.75, "Verkoop oliepomp", 19, 1);
      objOilPumpAdv.amount = +objOilPumpAdv.amount - 1;
      store.setItem("oilPumpAmount", objOilPumpAdv.amount);
      objOilPumpAdv.show();
    } else {
      document.getElementById("o2sell").disabled = true;
      notificationOverlay(
        "Geen pompen om te verkopen!",
        "High-tech oliepomp",
        "fa-box"
      );
    }
  },
  produce: function () {
    var pumpsActive = objOilPumpAdv.amount;
    if (+objOilPumpAdv.amount * +objOilPumpAdv.energy > +objEnergy.available) {
      pumpsActive = Math.floor(+objEnergy.available / +objOilPumpAdv.energy);
    }
    objEnergy.use(+pumpsActive * +objOilPumpAdv.energy, "Oliepompen");
    var productionTemp = +pumpsActive * objOilPumpAdv.production;
    objOilPumpAdv.showStats();
    return +productionTemp;
  },
  show: function () {
    if (+objOilPump.amount == 0 && +objOilPumpAdv.amount > 0) {
      document.getElementById("oil1").style.display = "none";
    }
    if (+objPlayerInfo.level > 9) {
      document.getElementById("oil2").style.display = "";
    } else {
      document.getElementById("oil2").style.display = "none";
    }
    document.getElementById("o2intro").innerHTML =
      "<h3>High-tech oliepompen</h3>" +
      renderStats([
        [
          "Productie per pomp",
          FixUnit(objOilPumpAdv.production, "vaten per tick"),
        ],
        ["Energie per pomp", FixNumber(objOilPumpAdv.energy) + " per tick"],
        ["Prijs per pomp", FixMoney(objOilPumpAdv.price)],
        ["Staal per pomp", FixUnit(objOilPumpAdv.steelNeeded, "ton")],
        ["Verkoopwaarde", FixMoney(+objOilPumpAdv.price * 0.75)],
      ]);
    if (+objOilPump.amount > 0) {
      document.getElementById("o2upgrade").innerHTML = renderHint(
        "Upgraden verkoopt een gewone pomp voor 75% (" +
          FixMoney(+objOilPump.price * 0.75) +
          ") en plaatst er een high-tech pomp voor terug."
      );
    } else {
      document.getElementById("o2upgradeButton").style.display = "none";
    }
    if (objOilPumpAdv.amount == 0) {
      document.getElementById("o2sell").disabled = true;
    } else {
      document.getElementById("o2sell").disabled = false;
    }
    objOilPumpAdv.showStats();
  },
  showStats: function () {
    document.getElementById("o2stats").innerHTML = renderStats([
      ["High-tech pompen", FixNumber(objOilPumpAdv.amount)],
      [
        "Productie per tick",
        FixUnit(+objOilPumpAdv.amount * +objOilPumpAdv.production, "vaten"),
      ],
      [
        "Energie per tick",
        FixNumber(+objOilPumpAdv.amount * +objOilPumpAdv.energy),
      ],
    ]);
  },
  init: function () {
    objOilPumpAdv.amount = store.getItem("oilPumpAmount") || 0;
  },
};

// Detect which transitionEnd is supported by browser
function whichTransitionEvent() {
  let t,
    el = document.createElement("fakeelement");

  let transitions = {
    transition: "transitionend",
    OTransition: "oTransitionEnd",
    MozTransition: "transitionend",
    WebkitTransition: "webkitTransitionEnd",
  };

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}

// Notificatie functie
function notificationOverlay(messageText, messageTitle, messageIcon) {
  let container = document.getElementById("notif");
  while (container.children.length >= 3) container.firstElementChild.remove();

  let dNotification = document.createElement("div");
  dNotification.setAttribute("class", "notification");
  dNotification.innerHTML =
    '<div class="notification-tooltip">' +
    '<div class="notification-icon">' +
    icon(messageIcon) +
    "</div>" +
    '<div class="text"><h5>' +
    messageTitle +
    "</h5><p>" +
    messageText +
    "</p></div>" +
    '<div class="close-notification"></div>' +
    "</div>";
  container.appendChild(dNotification);

  dNotification.style.height = dNotification.offsetHeight + "px";

  dNotification.addEventListener("click", function () {
    clearTimeout(notificationTimer);
    container.removeChild(dNotification);
  });

  let notificationTimer = setTimeout(function () {
    if (closeNotifications === 1) {
      dNotification.style.height = 0;
      dNotification.style.opacity = 0;

      let notificationClose = function () {
        if (dNotification.parentNode === container)
          container.removeChild(dNotification);
      };

      dNotification.addEventListener(CSStransitionEnd, notificationClose);
    }
  }, 10000);
}

// History functie voor inkomsten
var messages = [];
function showHistory(description, amount) {
  if (messages.length > 4) {
    messages.pop();
  }
  messages.unshift([description, amount]);
  document.getElementById("HistoryMessages").innerHTML =
    "<h3>Laatste inkomsten</h3>" + renderStats(messages);
}

//Gebruiken resources
function useResource(typeResource, amountUsed, lsValue) {
  var scope = this;
  if (+amountUsed >= +scope[typeResource].amount) {
    delivered = scope[typeResource].amount;
    scope[typeResource].amount = 0;
    store.setItem(lsValue, +scope[typeResource].amount);
    scope[typeResource].show();
    return delivered;
  }
  scope[typeResource].amount = +scope[typeResource].amount - +amountUsed;

  store.setItem(lsValue, +scope[typeResource].amount);
  scope[typeResource].show();
  return amountUsed;
}

// Vullen storage / silos
function fillStorage(typeStorage, amountAdded, lsValue) {
  var scope = this;
  var SpaceLeft =
    +scope[typeStorage].storage * +scope[typeStorage].storageCap -
    +scope[typeStorage].amount;
  if (+amountAdded > +SpaceLeft) {
    scope[typeStorage].amount = +scope[typeStorage].amount + +SpaceLeft;
    var Rest = +amountAdded - +SpaceLeft;
    scope[typeStorage].sell(+Rest);
  } else {
    scope[typeStorage].amount = +scope[typeStorage].amount + +amountAdded;
  }
  store.setItem(lsValue, +scope[typeStorage].amount);
  scope[typeStorage].show();
}

// Korte weergave van grote getallen voor het dashboard: 5200000000 -> "5,2 mld"
function FixShort(value, money) {
  value = +value || 0;
  var units = [
    [1e18, "trln"],
    [1e15, "bld"],
    [1e12, "bln"],
    [1e9, "mld"],
    [1e6, "mln"],
  ];
  var text = Math.round(value).toLocaleString("nl-NL");
  for (var i = 0; i < units.length; i++) {
    if (Math.abs(value) >= units[i][0]) {
      text =
        (value / units[i][0]).toLocaleString("nl-NL", {
          maximumSignificantDigits: 3,
        }) +
        " " +
        units[i][1];
      break;
    }
  }
  return money ? "€ " + text : text;
}

// Speeltijd in minuten als "45m", "5u 12m" of "3d 4u"
function FixDuration(minutes) {
  minutes = Math.max(0, Math.round(+minutes || 0));
  if (minutes < 60) return minutes + "m";
  var hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "u " + (minutes % 60) + "m";
  return Math.floor(hours / 24) + "d " + (hours % 24) + "u";
}

// Statistieken: speeltijd, mijlpalen, totale productie en een compacte geschiedenis
// voor het dashboard (Game opties → Statistieken). De geschiedenis heeft een vaste omvang,
// hoe lang er ook gespeeld wordt, en gaat gewoon mee in de save-code.
var objStats = {
  enabled: true,
  budget: 20000, // maximale lengte van statsHistory in tekens
  ticks: 0, // speeltijd: ticks waarin het spel niet gepauzeerd was
  start: 0, // begin van de statistieken, in seconden
  startLevel: 1,
  base: [0, 0, 0, 0], // verdiend, uitgegeven, energie gemaakt en verbruikt bij het vorige meetpunt
  totals: {},
  levels: [], // mijlpalen: [level, speeltijd in ticks, datum in seconden]
  // Meetpunten per laag: per minuut (1 uur), per kwartier (24 uur) en alles. De laatste laag voegt
  // steeds twee punten samen als hij vol is. Een meetpunt is
  // [minuut, vermogen, verdiend, uitgegeven, energie gemaakt, energie verbruikt, energievoorraad, level],
  // waarbij verdiend t/m energie verbruikt optellen over de periode van het punt.
  tiers: [],
  range: 0, // gekozen periode in het dashboard (index in tiers)
  open: false,
  failed: false,
  newTiers: function () {
    return [
      [1, 60, false],
      [15, 96, false],
      [1, 120, true],
    ].map(function (t) {
      return {
        step: t[0],
        max: t[1],
        merge: t[2],
        n: 0,
        acc: [0, 0, 0, 0],
        pts: [],
      };
    });
  },
  // Productie optellen. Geeft de hoeveelheid terug, zodat het om bestaande aanroepen heen past.
  count: function (key, amount) {
    if (objStats.enabled && +amount > 0)
      objStats.totals[key] = (+objStats.totals[key] || 0) + +amount;
    return amount;
  },
  tick: function () {
    if (!objStats.enabled) return;
    objStats.ticks++;
    if (objStats.ticks % 60 === 0) objStats.snapshot();
    else if (objStats.open && objStats.ticks % 5 === 0) objStats.render();
  },
  snapshot: function () {
    var now = [
      +made,
      +spend,
      +objStats.totals.energie || 0,
      +objStats.totals.energieVerbruik || 0,
    ];
    var delta = now.map(function (value, i) {
      return Math.max(0, value - objStats.base[i]);
    });
    objStats.base = now;
    var minute = Math.round(objStats.ticks / 60);
    objStats.tiers.forEach(function (tier) {
      tier.n++;
      tier.acc = tier.acc.map(function (value, i) {
        return value + delta[i];
      });
      if (tier.n < tier.step) return;
      tier.pts.push(
        [minute, +objMoney.amount].concat(tier.acc, [
          +objEnergy.available,
          +objPlayerInfo.level,
        ])
      );
      tier.n = 0;
      tier.acc = [0, 0, 0, 0];
      if (tier.pts.length <= tier.max) return;
      if (tier.merge) objStats.merge(tier);
      else tier.pts.shift();
    });
    objStats.save();
    if (objStats.open) objStats.render();
  },
  // Twee punten worden één: de bedragen tellen op, de standen komen van het laatste punt
  merge: function (tier) {
    var merged = [];
    for (var i = 0; i < tier.pts.length; i += 2) {
      var a = tier.pts[i];
      var b = tier.pts[i + 1];
      if (!b) {
        merged.push(a);
        break;
      }
      merged.push(
        b.map(function (value, k) {
          return k >= 2 && k <= 5 ? a[k] + value : value;
        })
      );
    }
    tier.pts = merged;
    tier.step *= 2;
  },
  levelup: function (level) {
    if (!objStats.enabled) return;
    objStats.levels.push([
      +level,
      objStats.ticks,
      Math.round(Date.now() / 1000),
    ]);
    objStats.save();
  },
  // Getal op 3 significante cijfers, zo kort mogelijk: 1234567 -> "1.23e6"
  num: function (value) {
    value = +(+value || 0).toPrecision(3);
    var plain = String(value);
    var exp = value.toExponential().replace("+", "");
    return exp.length < plain.length ? exp : plain;
  },
  // Lagen gescheiden door "|", regels door ";": eerst stap, teller en de lopende som, dan de punten.
  // Minuut en level blijven exact, de rest wordt afgerond.
  encode: function () {
    return objStats.tiers
      .map(function (tier) {
        var head = [tier.step, tier.n].concat(tier.acc.map(objStats.num));
        return [head.join(",")]
          .concat(
            tier.pts.map(function (p) {
              return [p[0]]
                .concat(p.slice(1, 7).map(objStats.num), [p[7]])
                .join(",");
            })
          )
          .join(";");
      })
      .join("|");
  },
  decode: function (text) {
    var tiers = objStats.newTiers();
    if (!text) return tiers;
    var parts = text.split("|");
    for (var i = 0; i < tiers.length; i++) {
      if (!parts[i]) continue;
      var rows = parts[i].split(";").map(function (row) {
        return row.split(",").map(Number);
      });
      var head = rows.shift();
      var valid =
        head.length === 6 &&
        head[0] >= 1 &&
        rows.every(function (row) {
          return row.length === 8 && row.every(isFinite);
        }) &&
        head.every(isFinite);
      // Onleesbaar: dan begint de geschiedenis opnieuw, het spel zelf werkt gewoon door
      if (!valid) return objStats.newTiers();
      tiers[i].step = head[0];
      tiers[i].n = head[1];
      tiers[i].acc = head.slice(2);
      tiers[i].pts = rows;
    }
    return tiers;
  },
  parse: function (text, fallback) {
    try {
      var value = JSON.parse(text);
      return value && typeof value === "object" ? value : fallback;
    } catch (error) {
      return fallback;
    }
  },
  save: function () {
    if (!objStats.enabled || objStats.failed) return;
    var history = objStats.encode();
    // Vangnet: past de geschiedenis niet in het budget, dan gaan de oudste punten van de grootste laag eraf
    while (history.length > objStats.budget) {
      var biggest = objStats.tiers.reduce(function (a, b) {
        return b.pts.length > a.pts.length ? b : a;
      });
      biggest.pts.shift();
      history = objStats.encode();
    }
    try {
      objStats.write(history);
    } catch (error) {
      // Opslag van de browser vol: zonder de laag per minuut nog één keer, anders stopt de statistiek
      objStats.tiers[0].pts = [];
      try {
        objStats.write(objStats.encode());
      } catch (error2) {
        objStats.failed = true;
      }
    }
  },
  write: function (history) {
    var totals = {};
    Object.keys(objStats.totals).forEach(function (key) {
      totals[key] = Math.round(objStats.totals[key]);
    });
    store.setItem(
      "statsPlay",
      JSON.stringify({
        t: objStats.ticks,
        s: objStats.start,
        l: objStats.startLevel,
        b: objStats.base,
      })
    );
    store.setItem("statsTotals", JSON.stringify(totals));
    store.setItem("statsLevels", JSON.stringify(objStats.levels));
    store.setItem("statsHistory", history);
  },
  // Voor een reset of import: daarna niets meer wegschrijven, anders komt de oude stand terug
  stop: function () {
    objStats.enabled = false;
  },
  init: function () {
    if (!objStats.enabled) return;
    document.getElementById("statsBTN").hidden = false;
    var play = objStats.parse(store.getItem("statsPlay"), null);
    if (play && Array.isArray(play.b) && play.b.length === 4) {
      objStats.ticks = +play.t || 0;
      objStats.start = +play.s || 0;
      objStats.startLevel = +play.l || 1;
      objStats.base = play.b.map(Number);
    } else {
      objStats.start = Math.round(Date.now() / 1000);
      objStats.startLevel = +objPlayerInfo.level;
      objStats.base = [+made, +spend, 0, 0];
    }
    objStats.totals = objStats.parse(store.getItem("statsTotals"), {});
    var levels = objStats.parse(store.getItem("statsLevels"), []);
    objStats.levels = Array.isArray(levels) ? levels : [];
    objStats.tiers = objStats.decode(store.getItem("statsHistory"));
    objStats.range = Math.min(2, +store.getItem("statsRange") || 0);
    window.addEventListener("pagehide", objStats.save);
    window.addEventListener("resize", function () {
      if (objStats.open) objStats.render();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && objStats.open) objStats.close();
    });
  },
  show: function () {
    if (objLayout.editing) objLayout.toggleEdit();
    objStats.open = true;
    document.getElementById("FirstTab").hidden = true;
    document.querySelector(".site-footer").hidden = true;
    document.getElementById("statsView").hidden = false;
    window.scrollTo(0, 0);
    objStats.render();
    document.getElementById("statsTitle").focus();
  },
  close: function () {
    objStats.open = false;
    document.getElementById("statsView").hidden = true;
    document.getElementById("FirstTab").hidden = false;
    document.querySelector(".site-footer").hidden = false;
    objFlows.schedule();
  },
  setRange: function (range) {
    objStats.range = range;
    store.setItem("statsRange", range);
    objStats.render();
  },
  // Grondstoffen in de productietabel: [sleutel, naam, eenheid, kleur, [voorraad, opslag]]
  resources: function () {
    var stock = function (o) {
      return [o.amount, o.storage * o.storageCap];
    };
    return [
      [
        "graan",
        "Graan",
        "kg",
        "graan",
        [objGrainSilo.contents, objGrainSilo.amount * objGrainSilo.cap],
      ],
      [
        "bloem",
        "Bloem",
        "kg",
        "bloem",
        [objFlourSilo.contents, objFlourSilo.amount * objFlourSilo.cap],
      ],
      [
        "eieren",
        "Eieren",
        "eieren",
        "eieren",
        [objEgg.amount, objEgg.storageUnits * objEgg.storageCap],
      ],
      [
        "pasta",
        "Pasta",
        "dozen",
        "pasta",
        [objStorehouse.pasta, objStorehouse.amount * objStorehouse.cap],
      ],
      [
        "olie",
        "Olie",
        "vaten",
        "olie",
        [objOilTank.contents, objOilTank.totalCap],
      ],
      ["kunststof", "Kunststof", "eenheden", "kunststof", stock(objPlastic)],
      ["steenkool", "Steenkool", "ton", "steenkool", stock(objCoal)],
      ["ijzererts", "IJzererts", "ton", "ijzererts", stock(objIronOre)],
      ["staal", "Staal", "ton", "staal", stock(objSteel)],
      ["uranium", "Uranium", "ton", "uranium", stock(objUraniumOre)],
      [
        "splijtstof",
        "Splijtstofstaven",
        "staven",
        "splijtstof",
        [
          objFuelRod.amount,
          objFuelCellFactory.amount * objFuelRod.storageFactor,
        ],
      ],
      ["kopererts", "Kopererts", "ton", "koper", stock(objCopperOre)],
      ["koper", "Koper", "ton", "koper", stock(objCopper)],
      ["printplaten", "Printplaten", "", "printplaten", stock(objPCB)],
      ["gouderts", "Gouderts", "ton", "goud", stock(objGoldOre)],
      ["goud", "Goud", "kg", "goud", stock(objGold)],
      [
        "ruwediamant",
        "Ruwe diamant",
        "karaat",
        "diamant",
        stock(objRoughDiamond),
      ],
      ["edelstenen", "Edelstenen", "karaat", "diamant", stock(objGems)],
      [
        "industriediamant",
        "Industriële diamant",
        "karaat",
        "diamant",
        stock(objIndustrialDiamond),
      ],
      ["chips", "Chips", "", "chips", stock(objChips)],
      ["isotopen", "Industriële isotopen", "", "uranium", stock(objIsotopes)],
      ["aicoin", "AICoin", "", "chips", [objAICoin.amount, 0]],
      [
        "energie",
        "Energie",
        "",
        "energie",
        [objEnergy.available, objEnergy.storageCap * objEnergy.capacitors],
      ],
    ];
  },
  // Gebouwen per groep, zoals de rijen in het spel
  company: function () {
    var mines = ["coal", "iron", "uranium", "copper", "gold", "diamond"].reduce(
      function (sum, type) {
        return sum + (+objMines[type + "AmountActive"] || 0);
      },
      0
    );
    return [
      [
        "Landbouw",
        [
          ["Velden", objFarmland.amount],
          ["Farmrobots", objFarmRobot.robots],
          ["Windmolens", objWindmill.amount],
          ["Windmolencontrollers", objWindmillController.amount],
          ["Kippenboerderijen", objChickenFarm.amount],
          ["Kippen", objChicken.amount],
          ["Pastafabrieken", objPastaFactory.amount],
        ],
      ],
      [
        "Olie en energie",
        [
          ["Oliepompen", objOilPump.amount],
          ["High-tech oliepompen", objOilPumpAdv.amount],
          ["Olietanks", objOilTank.amount],
          ["Oliecentrales", objPowerPlant.amount],
          ["Kolencentrales", objCoalPowerPlant.amount],
          ["Kerncentrales", objNuclearPowerPlant.amount],
          ["Kernreactoren", objNuclearPowerPlant.reactors],
          ["Zonneparken", objSolar.amount],
          ["Fusiecentrales", objFusion.amount],
          ["Energieopslag", objEnergy.capacitors],
        ],
      ],
      [
        "Industrie",
        [
          ["Mijnen", mines],
          ["Hoogovens", objIronMelter.amount],
          ["Kunststoffabrieken", objPlasticFactory.amount],
          ["Splijtstofstavenfabrieken", objFuelCellFactory.amount],
          ["Kopersmelterijen", objCopperSmelter.amount],
          ["Elektronicafabrieken", objElectronics.amount],
          ["Goudraffinaderijen", objGoldRefinery.amount],
          ["Slijperijen", objDiamondCutter.amount],
          ["Chipfabrieken", objChipFactory.amount],
          ["Datacenterrekken", objDatacenter.racks],
          ["Isotopenlabs", objIsotopeLab.amount],
          ["Seismische scanners", objScanner.amount],
          ["CPU's salescomputer", objSalesComputer.cpu],
        ],
      ],
    ];
  },
  // Per punt het aantal minuten dat het beslaat (voor bedragen per minuut)
  minutes: function (pts, i) {
    if (i > 0) return Math.max(1, pts[i][0] - pts[i - 1][0]);
    return pts.length > 1 ? Math.max(1, pts[1][0] - pts[0][0]) : 1;
  },
  perMinute: function (pts, field) {
    return pts.map(function (p, i) {
      return p[field] / objStats.minutes(pts, i);
    });
  },
  render: function () {
    var pts = objStats.tiers[objStats.range].pts;
    var xs = pts.map(function (p) {
      return p[0];
    });
    document
      .querySelectorAll("#statsRange button")
      .forEach(function (button, i) {
        button.setAttribute("aria-pressed", String(i === objStats.range));
      });
    document.getElementById("statsTiles").innerHTML = objStats.renderTiles();
    var money = function (v) {
      return FixShort(v, true);
    };
    var levelMarks = objStats.levels.map(function (l) {
      return [l[1] / 60, "L" + l[0]];
    });
    objStats.chart(
      document.getElementById("statsChartMoney"),
      xs,
      [
        {
          name: "Vermogen",
          color: "var(--accent)",
          values: pts.map(function (p) {
            return p[1];
          }),
        },
      ],
      { log: true, format: money, marks: levelMarks }
    );
    objStats.chart(
      document.getElementById("statsChartIncome"),
      xs,
      [
        {
          name: "Inkomsten",
          color: "var(--accent)",
          values: objStats.perMinute(pts, 2),
        },
        {
          name: "Uitgaven",
          color: "var(--danger)",
          values: objStats.perMinute(pts, 3),
        },
      ],
      { format: money, unit: "per minuut", log: "auto" }
    );
    var perTick = function (field) {
      return objStats.perMinute(pts, field).map(function (v) {
        return v / 60;
      });
    };
    objStats.chart(
      document.getElementById("statsChartEnergy"),
      xs,
      [
        { name: "Productie", color: "var(--flow-energie)", values: perTick(4) },
        { name: "Verbruik", color: "var(--warning)", values: perTick(5) },
      ],
      { format: FixShort, unit: "per tick", log: "auto" }
    );
    document.getElementById("statsLevels").innerHTML = objStats.renderLevels();
    document.getElementById("statsProduction").innerHTML =
      objStats.renderProduction();
    document.getElementById("statsCompany").innerHTML =
      objStats.renderCompany();
  },
  tile: function (label, value, sub, title) {
    return (
      '<div class="stats-tile"><div class="stats-tile-label">' +
      label +
      '</div><div class="stats-tile-value"' +
      (title ? ' title="' + title + '"' : "") +
      ">" +
      value +
      '</div><div class="stats-tile-sub">' +
      sub +
      "</div></div>"
    );
  },
  renderTiles: function () {
    var minute = objStats.tiers[0].pts;
    var sum = function (pts, field) {
      return pts.reduce(function (total, p) {
        return total + p[field];
      }, 0);
    };
    var span = function (pts) {
      return pts.length
        ? Math.max(1, pts[pts.length - 1][0] - pts[0][0] + 1)
        : 0;
    };
    // Inkomsten per minuut over het laatste half uur, vergeleken met het half uur ervoor
    var recent = minute.slice(-30);
    var before = minute.slice(-60, -30);
    var income = recent.length ? sum(recent, 2) / span(recent) : null;
    var change = "";
    if (income !== null && before.length >= 5) {
      var previous = sum(before, 2) / span(before);
      if (previous > 0) {
        var pct = Math.round((income / previous - 1) * 100);
        change =
          '<span class="' +
          (pct >= 0 ? "stats-up" : "stats-down") +
          '">' +
          (pct >= 0 ? "▲ " : "▼ ") +
          Math.abs(pct) +
          "%</span> t.o.v. het half uur ervoor";
      }
    }
    var peak = objStats.tiers.reduce(function (max, tier) {
      return tier.pts.reduce(function (m, p) {
        return Math.max(m, p[1]);
      }, max);
    }, +objMoney.amount);
    var progress = Math.max(
      0,
      Math.min(100, (+objMoney.amount / +objPlayerInfo.nextlevel) * 100)
    );
    var last = minute[minute.length - 1];
    var netto = last
      ? (last[4] - last[5]) / objStats.minutes(minute, minute.length - 1) / 60
      : null;
    var capacity = +objEnergy.storageCap * +objEnergy.capacitors;
    var since = objStats.start
      ? new Date(objStats.start * 1000).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    return [
      objStats.tile(
        "Vermogen",
        FixShort(objMoney.amount, true),
        "Hoogste: " + FixShort(peak, true),
        FixMoney(objMoney.amount)
      ),
      objStats.tile(
        "Inkomsten per minuut",
        income === null ? "–" : FixShort(income, true),
        change ||
          (income === null
            ? "Na de eerste minuut zichtbaar"
            : "Gemiddeld, laatste half uur")
      ),
      objStats.tile(
        "Level",
        objPlayerInfo.level,
        '<div class="progress"><div class="progress-bar" style="width:' +
          progress +
          '%"></div></div>Volgend level bij ' +
          FixShort(objPlayerInfo.nextlevel, true)
      ),
      objStats.tile(
        "Speeltijd",
        FixDuration(objStats.ticks / 60),
        since ? "Bijgehouden sinds " + since : ""
      ),
      objStats.tile(
        "Totaal verdiend",
        FixShort(made, true),
        "Uitgegeven: " + FixShort(spend, true),
        FixMoney(made)
      ),
      objStats.tile(
        "Energie per tick",
        netto === null ? "–" : (netto > 0 ? "+" : "") + FixShort(netto),
        "Opslag " +
          Math.round(capacity ? (+objEnergy.available / capacity) * 100 : 0) +
          "% vol"
      ),
    ].join("");
  },
  renderLevels: function () {
    var date = function (seconds) {
      var d = new Date(seconds * 1000);
      return (
        d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) +
        ", " +
        d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
      );
    };
    var items = objStats.levels.map(function (l, i) {
      var prev = objStats.levels[i - 1];
      var detail = "speeltijd " + FixDuration(l[1] / 60);
      if (prev && prev[0] === l[0] - 1)
        detail +=
          " · " + FixDuration((l[1] - prev[1]) / 60) + " na level " + prev[0];
      return (
        '<li><span class="stats-level">Level ' +
        l[0] +
        '</span><span class="stats-when">' +
        date(l[2]) +
        '</span><span class="hint">' +
        detail +
        "</span></li>"
      );
    });
    items.unshift(
      '<li class="stats-start"><span class="stats-level">' +
        (objStats.startLevel > 1
          ? "Level 1–" + objStats.startLevel
          : "Level 1") +
        '</span><span class="stats-when">' +
        (objStats.start ? date(objStats.start) : "") +
        '</span><span class="hint">' +
        (objStats.startLevel > 1
          ? "Bereikt voordat de statistieken begonnen"
          : "Begin van je bedrijf") +
        "</span></li>"
    );
    return items.reverse().join("");
  },
  renderProduction: function () {
    var rows = objStats
      .resources()
      .map(function (r) {
        var total = +objStats.totals[r[0]] || 0;
        var amount = +r[4][0] || 0;
        var cap = +r[4][1] || 0;
        if (!total && !amount) return "";
        var unit = r[2] ? " " + r[2] : "";
        var bar = cap
          ? '<div class="progress" title="' +
            Math.round((amount / cap) * 100) +
            '% vol"><div class="progress-bar" style="width:' +
            Math.min(100, (amount / cap) * 100) +
            '%"></div></div>'
          : "";
        return (
          '<tr><th scope="row"><span class="stats-dot flow-' +
          r[3] +
          '"></span>' +
          r[1] +
          '</th><td title="' +
          FixNumber(Math.round(total)) +
          unit +
          '">' +
          FixShort(total) +
          unit +
          "</td><td>" +
          FixShort(amount) +
          unit +
          bar +
          "</td></tr>"
        );
      })
      .join("");
    if (!rows)
      return '<p class="stats-empty">Zodra je iets produceert, zie je het hier.</p>';
    return (
      '<table class="stats-table"><thead><tr><th scope="col">Grondstof</th>' +
      '<th scope="col">Totaal gemaakt</th><th scope="col">Voorraad</th></tr></thead><tbody>' +
      rows +
      "</tbody></table>" +
      '<p class="hint">Totaal gemaakt telt sinds het begin van de statistieken. Gekocht op de markt telt niet mee.</p>'
    );
  },
  renderCompany: function () {
    return objStats
      .company()
      .map(function (group) {
        var rows = group[1].filter(function (row) {
          return +row[1] > 0;
        });
        if (!rows.length) return "";
        return (
          "<h3>" +
          group[0] +
          "</h3>" +
          renderStats(
            rows.map(function (row) {
              return [row[0], FixNumber(row[1])];
            })
          )
        );
      })
      .join("");
  },
  // Lijngrafiek als inline SVG. series: [{ name, color, values }],
  // opts: { log, format, unit, marks: [[minuut, label]] }
  chart: function (el, xs, series, opts) {
    if (xs.length < 2) {
      el._chart = null;
      el.innerHTML =
        '<p class="stats-empty">We houden je statistieken bij vanaf nu. Na twee meetpunten (een paar minuten spelen) verschijnt hier een lijn.</p>';
      return;
    }
    var width = Math.max(260, el.clientWidth || 600);
    var height = 200;
    var pad = { l: 70, r: 12, t: 12, b: 26 };
    var innerW = width - pad.l - pad.r;
    var innerH = height - pad.t - pad.b;
    var all = [];
    series.forEach(function (s) {
      s.values.forEach(function (v) {
        if (isFinite(v)) all.push(v);
      });
    });
    var max = Math.max.apply(null, all.concat([0]));
    var ticks = [];
    var y;
    var positive = all.filter(function (v) {
      return v > 0;
    });
    // "auto": logaritmisch zodra de waarden meer dan een factor 100 uiteenlopen (exponentiële groei)
    var log =
      opts.log === "auto"
        ? positive.length > 1 && max / Math.min.apply(null, positive) > 100
        : opts.log;
    if (log) {
      var lo = Math.pow(
        10,
        Math.floor(Math.log10(Math.min.apply(null, positive.concat([1]))))
      );
      var hi = Math.pow(10, Math.ceil(Math.log10(Math.max(max, lo * 10))));
      var decades = Math.log10(hi / lo);
      y = function (v) {
        var r = (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / decades;
        return pad.t + (1 - r) * innerH;
      };
      var every = Math.ceil(decades / 5);
      for (var d = 0; d <= decades; d += every)
        ticks.push(lo * Math.pow(10, d));
    } else {
      // Ronde bovengrens: 1, 2, 2,5 of 5 maal een macht van 10
      var magnitude = Math.pow(10, Math.floor(Math.log10(max || 1)));
      var top = [1, 2, 2.5, 5, 10]
        .map(function (f) {
          return f * magnitude;
        })
        .filter(function (v) {
          return v >= max;
        })[0];
      y = function (v) {
        return pad.t + (1 - Math.max(0, v) / top) * innerH;
      };
      for (var t = 0; t <= 4; t++) ticks.push((top / 4) * t);
    }
    var x0 = xs[0];
    var x1 = xs[xs.length - 1];
    var x = function (m) {
      return pad.l + ((m - x0) / (x1 - x0)) * innerW;
    };
    var svg =
      '<svg class="stats-svg" width="' +
      width +
      '" height="' +
      height +
      '" viewBox="0 0 ' +
      width +
      " " +
      height +
      '">';
    ticks.forEach(function (v) {
      svg +=
        '<line class="stats-gridline" x1="' +
        pad.l +
        '" x2="' +
        (width - pad.r) +
        '" y1="' +
        y(v) +
        '" y2="' +
        y(v) +
        '"/>' +
        '<text class="stats-axis" x="' +
        (pad.l - 6) +
        '" y="' +
        (y(v) + 4) +
        '" text-anchor="end">' +
        opts.format(v) +
        "</text>";
    });
    for (var i = 0; i <= 4; i++) {
      var m = x0 + ((x1 - x0) * i) / 4;
      svg +=
        '<text class="stats-axis" x="' +
        x(m) +
        '" y="' +
        (height - 6) +
        '" text-anchor="' +
        (i === 0 ? "start" : i === 4 ? "end" : "middle") +
        '">' +
        FixDuration(m) +
        "</text>";
    }
    (opts.marks || []).forEach(function (mark) {
      if (mark[0] < x0 || mark[0] > x1) return;
      svg +=
        '<line class="stats-mark" x1="' +
        x(mark[0]) +
        '" x2="' +
        x(mark[0]) +
        '" y1="' +
        pad.t +
        '" y2="' +
        (pad.t + innerH) +
        '"/>' +
        '<text class="stats-mark-label" x="' +
        (x(mark[0]) + 3) +
        '" y="' +
        (pad.t + 10) +
        '">' +
        mark[1] +
        "</text>";
    });
    series.forEach(function (s) {
      var d = s.values
        .map(function (v, i) {
          return (i ? "L" : "M") + x(xs[i]).toFixed(1) + "," + y(v).toFixed(1);
        })
        .join("");
      svg +=
        '<path class="stats-line" style="stroke:' +
        s.color +
        '" d="' +
        d +
        '"/>';
    });
    svg +=
      '<line class="stats-cursor" y1="' +
      pad.t +
      '" y2="' +
      (pad.t + innerH) +
      '" visibility="hidden"/></svg>';
    var legend =
      series.length > 1 || opts.unit
        ? '<div class="stats-legend">' +
          series
            .map(function (s) {
              return (
                '<span><i style="background:' +
                s.color +
                '"></i>' +
                s.name +
                "</span>"
              );
            })
            .join("") +
          (opts.unit
            ? '<span class="hint">' +
              opts.unit +
              (log && opts.log === "auto" ? ", logaritmisch" : "") +
              "</span>"
            : "") +
          "</div>"
        : "";
    var summary = series
      .map(function (s) {
        return (
          s.name +
          " van " +
          opts.format(s.values[0]) +
          " naar " +
          opts.format(s.values[s.values.length - 1])
        );
      })
      .join(", ");
    el.innerHTML =
      legend +
      '<div class="stats-plot" role="img" aria-label="' +
      summary +
      " (" +
      FixDuration(x1 - x0) +
      ' speeltijd)">' +
      svg +
      '<div class="stats-tip" hidden></div></div>';
    el._chart = { xs: xs, series: series, opts: opts, x: x, width: width };
    var plot = el.querySelector(".stats-plot");
    plot.addEventListener("pointermove", function (event) {
      el._hover = event.clientX - plot.getBoundingClientRect().left;
      objStats.hover(el);
    });
    plot.addEventListener("pointerleave", function () {
      el._hover = null;
      objStats.hover(el);
    });
    objStats.hover(el);
  },
  // Kruisdraad met de waarden van het dichtstbijzijnde meetpunt
  hover: function (el) {
    var c = el._chart;
    var cursor = el.querySelector(".stats-cursor");
    var tip = el.querySelector(".stats-tip");
    if (!c || !cursor) return;
    if (el._hover === null || el._hover === undefined) {
      cursor.setAttribute("visibility", "hidden");
      tip.hidden = true;
      return;
    }
    var best = 0;
    c.xs.forEach(function (m, i) {
      if (Math.abs(c.x(m) - el._hover) < Math.abs(c.x(c.xs[best]) - el._hover))
        best = i;
    });
    var px = c.x(c.xs[best]);
    cursor.setAttribute("x1", px);
    cursor.setAttribute("x2", px);
    cursor.setAttribute("visibility", "visible");
    tip.innerHTML =
      "<strong>" +
      FixDuration(c.xs[best]) +
      " speeltijd</strong>" +
      c.series
        .map(function (s) {
          return (
            '<span><i style="background:' +
            s.color +
            '"></i>' +
            s.name +
            ": " +
            c.opts.format(s.values[best]) +
            "</span>"
          );
        })
        .join("");
    tip.hidden = false;
    var left = px + 12;
    if (left + tip.offsetWidth > c.width) left = px - 12 - tip.offsetWidth;
    tip.style.left = Math.max(0, left) + "px";
  },
};

// Debug functie
function showMessage(description, value) {
  if (store.getItem("debug") == 1) {
    console.log(description + ": " + value);
  }
  return 0;
}

// LS omzetten in base64 string
function saveProgress() {
  objStats.save();
  let lsExport = [];
  store.keys().forEach((storageKey) => {
    lsExport.push(`${storageKey}:${store.getItem(storageKey)}`);
  });
  return btoa(JSON.stringify(lsExport));
}

// Savegame-code exporteren naar het klembord
async function saveFixed() {
  const code = saveProgress();
  try {
    await navigator.clipboard.writeText(code);
    notificationOverlay(
      "De save-code staat op je klembord!",
      "Savegame",
      "fa-upload"
    );
  } catch (error) {
    prompt("Kopieer de save-code hieronder:", code);
  }
}

// Savegame-code importeren
function importFile() {
  const code = prompt("Voer de geëxporteerde save-code in:");
  if (code) getSaveGame(code.trim());
}

// Savegame-code terugzetten in de opslag
function getSaveGame(code) {
  let decodedFile;
  try {
    decodedFile = JSON.parse(atob(code));
    if (!Array.isArray(decodedFile)) throw new Error("Geen lijst");
  } catch (error) {
    alert("Ongeldige save-code!");
    return;
  }
  objStats.stop();
  store.clear();
  decodedFile.forEach((item) => {
    const split = item.indexOf(":");
    if (split > 0) {
      store.setItem(item.slice(0, split), item.slice(split + 1));
    }
  });
  location.reload();
}

// Marktvoorraad (voorheen centraal in de database, nu gesimuleerd)
var objSalesInfo = {};

function getSaleInfo() {
  objSalesInfo = {
    eggs: randomBetween(0, 500000),
    steel: randomBetween(0, 250000),
    used_fuelrod: randomBetween(0, 100000),
  };
  showMessage("Marktvoorraad", JSON.stringify(objSalesInfo));
  objMarket.show();
}

// Genoeg geld functie
function moneyCheck(amountNeeded) {
  if (+amountNeeded <= +objMoney.amount) {
    return 1;
  } else {
    return 0;
  }
}

// Knoppen die nu niets kunnen doen grijs maken: te weinig geld of grondstoffen, of (bij de
// handmatige productie) alle fabrieken worden al automatisch bestuurd. Iedere regel geeft de
// reden terug (als tooltip), of "" als de knop werkt. De regels volgen de controles in de
// koopfuncties zelf; een grijze knop doet niets bij klikken.
var objButtons = {
  money: function (cost, strict) {
    var ok = strict ? +objMoney.amount > +cost : +objMoney.amount >= +cost;
    return ok ? "" : "Niet genoeg geld (" + FixMoney(cost) + ")";
  },
  need: function (have, amount, label) {
    return +have >= +amount ? "" : "Niet genoeg " + label;
  },
  steel: function (amount) {
    return objButtons.need(objSteel.amount, amount, "staal");
  },
  pcb: function (amount) {
    return objButtons.need(objPCB.amount, amount, "printplaten");
  },
  gold: function (amount) {
    return objButtons.need(objGold.amount, amount, "goud");
  },
  chips: function (amount) {
    return objButtons.need(objChips.amount, amount, "chips");
  },
  // Per functie (uit onClick) een controle; args zijn de argumenten van de aanroep
  rules: {
    "objEnergy.addCapa": function (args) {
      return objButtons.money(+objEnergy.capaCost * +args[0]);
    },
    "objFarmland.addfarm": function () {
      return objButtons.money(objFarmland.cost, true);
    },
    "objFarmland.research": function () {
      return objButtons.money(objFarmland.GrainResearchCostVar);
    },
    "objGrainSilo.add": function () {
      return objButtons.money(objGrainSilo.price, true);
    },
    "objFlourSilo.add": function () {
      return objButtons.money(objFlourSilo.price, true);
    },
    "objResearch.doResearch": function () {
      var step = objResearch.research_tree[objResearch.level - 1];
      if (objResearch.running === 1 || !step) return "";
      return objButtons.money(step.cost);
    },
    "objFarmRobot.add": function () {
      return objButtons.money(objFarmRobot.robotCost);
    },
    "objWindmill.add": function () {
      return objButtons.money(objWindmill.cost, true);
    },
    "objWindmill.grind": function () {
      return +objWindmill.amount - +objWindmill.amountAutomated < 1
        ? "Alle windmolens worden bestuurd door controllers"
        : "";
    },
    "objWindmillController.add": function () {
      return objButtons.money(objWindmillController.price, true);
    },
    "objOilTank.add": function (args) {
      return +args[0] == 0
        ? objButtons.money(objOilTank.price, true)
        : objButtons.money(objOilTank.priceBig, true);
    },
    "objOilPump.add": function () {
      return objButtons.money(objOilPump.price);
    },
    "objOilPumpAdv.add": function () {
      return (
        objButtons.money(objOilPumpAdv.price) ||
        objButtons.steel(objOilPumpAdv.steelNeeded)
      );
    },
    "objOilPumpAdv.upgrade": function () {
      if (+objOilPump.amount < 1) return "Geen pompen om te upgraden";
      return objButtons.rules["objOilPumpAdv.add"]();
    },
    "objPowerPlant.add": function () {
      return objButtons.money(objPowerPlant.price, true);
    },
    "objCoalPowerPlant.add": function () {
      return objButtons.money(objCoalPowerPlant.price, true);
    },
    "objChicken.add": function (args) {
      return objButtons.money(+args[0] * +objChicken.cost);
    },
    "objChickenFarm.add": function () {
      return objButtons.money(objChickenFarm.cost);
    },
    "objEgg.addStorageUnit": function () {
      return objButtons.money(objEgg.storageUnitCost);
    },
    "objPastaFactory.add": function () {
      return objButtons.money(objPastaFactory.cost);
    },
    "objPastaFactory.produce": function () {
      if (+objPastaFactory.amount < 1) return "Geen pastafabrieken";
      return +objPastaFactory.amount - +objPastaFactory.amountAutomated < 1
        ? "Alle pastafabrieken worden bestuurd door pastahelpers"
        : "";
    },
    "objPastaHelper.add": function (args) {
      return +args[0] == 1 ? objButtons.money(objPastaHelper.cost) : "";
    },
    "objSalesComputer.add": function () {
      return objButtons.money(objSalesComputer.cpuCost, true);
    },
    "objPlasticFactory.addFactory": function (args) {
      return +args[0] > 0 ? objButtons.money(objPlasticFactory.cost, true) : "";
    },
    "objPlasticFactory.addWorker": function (args) {
      return +args[0] > 0
        ? objButtons.money(objPlasticFactory.workerCost, true)
        : "";
    },
    "objMines.prospect": function () {
      if (+objMines.prospecting === 1) return "";
      return objButtons.money(objMines.prospectPrice());
    },
    "objMines.addMine": function (args) {
      if (+args[1] != 1) return "";
      var type = [null, "iron", "coal", "uranium", "copper", "gold", "diamond"][
        +args[0]
      ];
      if (
        +objMines[type + "AmountProspected"] -
          +objMines[type + "AmountActive"] <
        1
      )
        return "Geen locaties meer beschikbaar";
      return (
        objButtons.money(objMines[type + "MineCost"]) ||
        objButtons.steel(objMines.steelNeeded(type))
      );
    },
    "objCoal.buy": function (args) {
      if (+objCoal.amount >= +objCoal.storage * +objCoal.storageCap * 0.05)
        return "Bijkopen kan alleen onder 5% voorraad";
      return objButtons.money(+args[0] * +objCoal.price * 1.5);
    },
    "objIronMelter.add": function (args) {
      return +args[0] > 0 ? objButtons.money(objIronMelter.cost, true) : "";
    },
    "objIronMelter.produce": function () {
      if (+objIronMelter.amount < 1) return "Geen hoogovens";
      return +objIronMelter.amount - +objIronMelter.controlled < 1
        ? "Al je hoogovens hebben besturing en maken zelf staal"
        : "";
    },
    "objIronMelter.addControl": function () {
      return objButtons.pcb(objIronMelter.controlPCB);
    },
    "objCopperSmelter.add": function (args) {
      if (+args[0] < 0) return "";
      return (
        objButtons.money(objCopperSmelter.cost) ||
        objButtons.steel(objCopperSmelter.steelNeeded)
      );
    },
    "objElectronics.add": function (args) {
      if (+args[0] < 0) return "";
      return (
        objButtons.money(objElectronics.cost) ||
        objButtons.steel(objElectronics.steelNeeded)
      );
    },
    "objSolar.add": function () {
      return (
        objButtons.money(objSolar.price) ||
        objButtons.steel(objSolar.steelNeeded) ||
        objButtons.pcb(objSolar.pcbNeeded)
      );
    },
    "objScanner.add": function () {
      return objButtons.pcb(objScanner.pcbNeeded);
    },
    "objGoldRefinery.add": function (args) {
      if (+args[0] < 0) return "";
      return (
        objButtons.money(objGoldRefinery.cost) ||
        objButtons.steel(objGoldRefinery.steelNeeded)
      );
    },
    "objDiamondCutter.add": function (args) {
      if (+args[0] < 0) return "";
      return (
        objButtons.money(objDiamondCutter.cost) ||
        objButtons.steel(objDiamondCutter.steelNeeded)
      );
    },
    "objDiamondVault.add": function () {
      return objButtons.money(objDiamondVault.price);
    },
    "objDiamondDrill.buy": function (args) {
      return objButtons.need(
        objIndustrialDiamond.amount,
        objDiamondDrill.cost[args[0]],
        "industriële diamant"
      );
    },
    "objChipFactory.add": function (args) {
      if (+args[0] < 0) return "";
      return (
        objButtons.money(objChipFactory.cost) ||
        objButtons.steel(objChipFactory.steelNeeded)
      );
    },
    "objDatacenter.add": function () {
      return (
        objButtons.money(objDatacenter.price) ||
        objButtons.chips(objDatacenter.chipsNeeded)
      );
    },
    "objIsotopeLab.add": function () {
      return (
        objButtons.money(objIsotopeLab.price) ||
        objButtons.steel(objIsotopeLab.steelNeeded) ||
        objButtons.pcb(objIsotopeLab.pcbNeeded) ||
        objButtons.gold(objIsotopeLab.goldNeeded)
      );
    },
    "objFusion.add": function () {
      return (
        objButtons.money(objFusion.price) ||
        objButtons.steel(objFusion.steelNeeded) ||
        objButtons.chips(objFusion.chipsNeeded)
      );
    },
    "objFuelCellFactory.addFactory": function (args) {
      return +args[0] == 1 ? objButtons.money(objFuelCellFactory.cost) : "";
    },
    "objFuelRod.sellWaste": function () {
      return objButtons.money(+objFuelRod.waste * +objFuelRod.wastePrice);
    },
    "objNuclearPowerPlant.buildPlant": function () {
      return (
        objButtons.steel(objNuclearPowerPlant.plantSteelNeeded) ||
        objButtons.money(objNuclearPowerPlant.plantCost)
      );
    },
    "objNuclearPowerPlant.buildReactor": function () {
      return (
        objButtons.steel(objNuclearPowerPlant.reactorSteelNeeded) ||
        objButtons.money(objNuclearPowerPlant.reactorCost) ||
        (+objNuclearPowerPlant.reactors >=
        +objNuclearPowerPlant.amount * +objNuclearPowerPlant.plantReactorCap
          ? "Geen ruimte in een kerncentrale"
          : "")
      );
    },
    "objNuclearPowerPlant.addControl": function () {
      return (
        objButtons.pcb(objNuclearPowerPlant.controlPCB) ||
        objButtons.gold(objNuclearPowerPlant.controlGold)
      );
    },
    "objMarket.buy": function (args) {
      var cost = {
        eggs: +objEgg.price * 1.5,
        steel: +objSteel.price * 1.25,
        used_fuelrod: +objFuelRod.wastePrice * 0.5,
      }[args[0]];
      return objButtons.money(+cost * +args[1]);
    },
  },
  // Bulkknoppen (+10, Max) volgen de gewone bouwknop: grijs als er niet één bij kan
  bulk: {
    iron: "objMines.addMine(1, 1)",
    coal: "objMines.addMine(2, 1)",
    uranium: "objMines.addMine(3, 1)",
    copper: "objMines.addMine(4, 1)",
    gold: "objMines.addMine(5, 1)",
    diamond: "objMines.addMine(6, 1)",
    coalPlant: "objCoalPowerPlant.add()",
    nuclearPlant: "objNuclearPowerPlant.buildPlant()",
    reactor: "objNuclearPowerPlant.buildReactor()",
    smelter: "objIronMelter.add(1)",
    copperSmelter: "objCopperSmelter.add(1)",
    electronics: "objElectronics.add(1)",
    solar: "objSolar.add()",
    goldRefinery: "objGoldRefinery.add(1)",
    diamondCutter: "objDiamondCutter.add(1)",
    chipFactory: "objChipFactory.add(1)",
    isotopeLab: "objIsotopeLab.add()",
    datacenter: "objDatacenter.add()",
    fusion: "objFusion.add()",
    reactorControl: "objNuclearPowerPlant.addControl()",
  },
  // Opslag kopen: objX.addSilo() / objX.addStorage() kost objX.storagePrice
  storage: /^(obj\w+)\.(addSilo|addStorage)$/,
  reason: function (code) {
    var call = /^\s*([\w.]+)\((.*)\)/.exec(code || "");
    if (!call) return "";
    var args = call[2].split(",").map(function (arg) {
      return arg.trim().replace(/^["']|["']$/g, "");
    });
    var rule = objButtons.rules[call[1]];
    if (rule) return rule(args);
    var storage = objButtons.storage.exec(call[1]);
    if (storage && window[storage[1]])
      return objButtons.money(window[storage[1]].storagePrice);
    return "";
  },
  update: function () {
    document
      .querySelectorAll("button[onclick], button[data-bulk]")
      .forEach(function (button) {
        var code = button.dataset.bulk
          ? objButtons.bulk[button.dataset.bulk.replace(/-(10|max)$/, "")]
          : button.getAttribute("onclick");
        var reason = objButtons.reason(code);
        if (
          button.classList.contains("btn-blocked") === !!reason &&
          (button.dataset.blocked || "") === reason
        )
          return;
        button.classList.toggle("btn-blocked", !!reason);
        if (reason) {
          button.setAttribute("aria-disabled", "true");
          button.dataset.blocked = reason;
          button.title = reason;
        } else {
          button.removeAttribute("aria-disabled");
          delete button.dataset.blocked;
          button.removeAttribute("title");
        }
      });
  },
  init: function () {
    // Een grijze knop doet niets (ook niet met het toetsenbord); na iedere klik bijwerken
    document.addEventListener(
      "click",
      function (event) {
        var button =
          event.target.closest && event.target.closest(".btn-blocked");
        if (button) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
      true
    );
    document.addEventListener("click", objButtons.update);
    objButtons.update();
  },
};

// Inkopen resources
var objMarket = {
  marketState: 0,
  take: function (resType, amount) {
    objSalesInfo[resType] = Math.max(0, +objSalesInfo[resType] - +amount);
    objMarket.show();
  },
  buy: function (resType, amount) {
    amount = parseInt(amount);
    var cost = 0;

    if (resType === "eggs") {
      cost = +objEgg.price * 1.5;
      if (moneyCheck(+cost * +amount) === 0) {
        notificationOverlay("Niet genoeg doekoe!", "Markt", "fa-euro-sign");
        return 0;
      } else {
        objMoney.use(+cost * amount);
        objEgg.add(+amount);
        objFlows.pulse("marketEggs", "chicken-col");
        objMarket.take("eggs", amount);
      }
    }
    if (resType === "steel") {
      cost = +objSteel.price * 1.25;
      if (moneyCheck(+cost * +amount) === 0) {
        notificationOverlay("Niet genoeg doekoe!", "Markt", "fa-euro-sign");
        return 0;
      } else {
        objMoney.use(+cost * amount);
        objSteel.add(+amount);
        objFlows.pulse("marketSteel", "SteelInfo-col");
        objMarket.take("steel", amount);
      }
    }
    if (resType === "used_fuelrod") {
      cost = +objFuelRod.wastePrice * 0.5;
      if (moneyCheck(+cost * +amount) === 0) {
        notificationOverlay("Niet genoeg doekoe!", "Markt", "fa-euro-sign");
        return 0;
      } else {
        objMoney.use(+cost * amount);
        objFuelRod.wasteFunction(+amount);
        objFlows.pulse("marketWasteFuel", "fuelRodStorage");
        objMarket.take("used_fuelrod", amount);
      }
    }
  },
  show: function () {
    document.getElementById("buyEggs").innerHTML =
      renderStats([
        ["Prijs per ei", FixMoney(+objEgg.price * 1.5)],
        ["Te koop", FixNumber(objSalesInfo.eggs) + " eieren"],
        [
          "Jouw vrije ruimte",
          FixNumber(
            +objEgg.storageUnits * +objEgg.storageCap - +objEgg.amount
          ) + " eieren",
        ],
      ]) +
      renderHint(
        "Wat niet past wordt direct weer verkocht, voor 50% van de normale prijs."
      );
    document.getElementById("buySteel").innerHTML =
      renderStats([
        ["Prijs per ton", FixMoney(+objSteel.price * 1.25)],
        ["Te koop", FixUnit(objSalesInfo.steel, "ton")],
        [
          "Jouw vrije ruimte",
          FixUnit(
            +objSteel.storage * +objSteel.storageCap - +objSteel.amount,
            "ton"
          ),
        ],
      ]) + renderHint("Wat niet past wordt direct weer verkocht.");
    document.getElementById("buyWasteFuell").innerHTML =
      renderStats([
        ["Prijs per staaf", FixMoney(+objFuelRod.wastePrice * 0.5)],
        ["Te koop", FixNumber(objSalesInfo.used_fuelrod) + " staven"],
      ]) + renderHint("Voor afval heb je onbeperkt ruimte.");
    objMarket.showButtonState();
  },
  showButtons: function () {
    objMarket.generateBuyButtons("eggs", "buyEggsBTN");
    objMarket.generateBuyButtons("steel", "buySteelBTN");
    objMarket.generateBuyButtons("used_fuelrod", "buyWasteFuellBTN");
  },
  showButtonState: function () {
    if (parseInt(objSalesInfo.steel) > 0) {
      objMarket.buttonState("steel", parseInt(objSalesInfo.steel));
    }
    if (parseInt(objSalesInfo.eggs) > 0) {
      objMarket.buttonState("eggs", parseInt(objSalesInfo.eggs));
    }
    if (parseInt(objSalesInfo.used_fuelrod) > 0) {
      objMarket.buttonState(
        "used_fuelrod",
        parseInt(objSalesInfo.used_fuelrod)
      );
    }
  },
  generateBuyButtons: function (resType, buttonName) {
    var html = "<div class='actions'>";
    for (var scale = 100; scale <= 1000000; scale *= 10) {
      html +=
        "<button type='button' class='btn btn-primary' onClick='objMarket.buy(\"" +
        resType +
        '", ' +
        scale +
        ")' id='BB" +
        resType +
        scale +
        "'>+" +
        FixNumber(scale) +
        "</button> ";
    }
    document.getElementById(buttonName).innerHTML = html + "</div>";
  },
  buttonState: function (resType, amountMarket) {
    var i = 100;
    do {
      if (amountMarket < i) {
        document.getElementById("BB" + resType + i).disabled = true;
      } else {
        document.getElementById("BB" + resType + i).disabled = false;
      }
      i = i * 10;
    } while (i < 1000001);
  },
  init: function () {
    objMarket.showButtons();
    getSaleInfo();
  },
};

// Verkoopmenu
var quickSell = parseInt(store.getItem("QS")) || 0;

function showQuickSell(inputQS) {
  var elverkooptabBTN = document.getElementById("verkooptabBTN");
  if (+objPlayerInfo.level < 9) {
    document.getElementById("sellMenu").style.display = "none";
    if (inputQS === 1) {
      notificationOverlay(
        "De verkooptab is beschikbaar vanaf level 9",
        "Verkooptab",
        "fa-info"
      );
    }
    return;
  }
  if (inputQS === 1) quickSell = 1 - quickSell;

  if (quickSell === 1) {
    document.getElementById("sellMenu").style.display = "";
    elverkooptabBTN.innerHTML =
      icon("check-square") + " Zet verkooptab uit (lvl9)";
    store.setItem("QS", quickSell);
    quickSellMenu();
    quickSellButtons();
    Display.updateRows();
  } else {
    document.getElementById("sellMenu").style.display = "none";
    elverkooptabBTN.innerHTML = icon("square") + " Zet verkooptab aan (lvl9)";
    store.setItem("QS", quickSell);
  }
}

// Auto sluit notificaties
var closeNotifications =
  parseInt(store.getItem("notifications_autoclose")) || 0;

function turnAutoClose(input) {
  if (input) closeNotifications = 1 - closeNotifications;
  store.setItem("notifications_autoclose", closeNotifications);

  elAutoCloseBTN = document.getElementById("autocloseBTN");
  if (closeNotifications === 1) {
    elAutoCloseBTN.innerHTML =
      icon("check-square") + " Zet auto-sluit berichten uit";
  } else {
    elAutoCloseBTN.innerHTML = icon("square") + " Zet auto-sluit berichten aan";
  }
}

function turnShortNumbers(input) {
  var btn = document.getElementById("shortNumbersBTN");
  if (input) {
    store.setItem("shortNumbers", shortNumbers ? "0" : "1");
    // Alles opnieuw tekenen gaat het eenvoudigst via herladen; de voortgang staat al in de opslag
    location.reload();
    return;
  }
  btn.innerHTML =
    icon(shortNumbers ? "check-square" : "square") +
    " Korte getallen (mln, mld)";
}

function quickSellMenu() {
  if (objPlayerInfo.level < 9) {
    return 0;
  }
  var items = [
    [
      "quickGrain",
      "Graan",
      FixUnit(objGrainSilo.contents, "kg"),
      FixMoney(objGrain.price) +
        " / 1.000 kg" +
        renderTrend(objGrain.price, objGrain.previous),
    ],
    [
      "quickFlour",
      "Bloem",
      FixUnit(objFlourSilo.contents, "kg"),
      FixMoney(objFlour.price) +
        " / 1.000 kg" +
        renderTrend(objFlour.price, objFlour.previous),
    ],
    [
      "quickPasta",
      "Pasta",
      FixNumber(objStorehouse.pasta) + " dozen",
      FixMoney(objPasta.price()) +
        " / doos" +
        renderTrend(objPasta.price(), objPasta.previousPrice()),
    ],
    [
      "quickOil",
      "Olie",
      FixUnit(objOilTank.contents, "vaten"),
      FixMoney(objOil.price) +
        " / vat" +
        renderTrend(objOil.price, objOil.previous),
    ],
    [
      "quickCoal",
      "Steenkool",
      FixUnit(objCoal.amount, "ton"),
      FixMoney(objCoal.price) + " / ton",
    ],
    [
      "quickIronOre",
      "IJzererts",
      FixUnit(objIronOre.amount, "ton"),
      FixMoney(objIronOre.price) + " / ton",
    ],
    [
      "quickSteel",
      "Staal",
      FixUnit(objSteel.amount, "ton"),
      FixMoney(objSteel.price) + " / ton",
    ],
  ];
  items.forEach(function (item) {
    document.getElementById(item[0]).innerHTML =
      "<h2>" +
      item[1] +
      "</h2>" +
      renderStats([
        ["Voorraad", item[2]],
        ["Prijs", item[3]],
      ]);
  });
}

function quickSellButtons() {
  if (objPlayerInfo.level < 9) {
    return;
  }

  const items = [
    { elementId: "quickGrainBTN", object: "objGrain", action: "sell" },
    { elementId: "quickFlourBTN", object: "objFlour", action: "sell" },
    { elementId: "quickPastaBTN", object: "objPasta", action: "sell" },
    { elementId: "quickOilBTN", object: "objOil", action: "sellOil" },
    {
      elementId: "quickCoalBTN",
      object: "objCoal",
      action: "sell",
      params: [0],
    },
    {
      elementId: "quickIronOreBTN",
      object: "objIronOre",
      action: "sell",
      params: [0],
    },
    {
      elementId: "quickSteelBTN",
      object: "objSteel",
      action: "sell",
      params: [0],
    },
  ];

  items.forEach(({ elementId, object, action, params }) => {
    let button = document.createElement("button");
    button.type = "button";
    button.classList.add("btn", "btn-danger");
    button.textContent = "Verkoop";
    button.addEventListener("click", () =>
      window[object][action](...(params || []))
    );

    let actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(button);

    document.getElementById(elementId).replaceChildren(actions);
  });
}

// Random en wegingsfuncties voor prospecting
var randomSelect = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1));
};

var generateWeighedList = function (list, weight) {
  var weighed_list = [];
  // Loop over weights
  for (var i = 0; i < weight.length; i++) {
    var multiples = weight[i] * 100;

    // Loop over the list of items
    for (var j = 0; j < multiples; j++) {
      weighed_list.push(list[i]);
    }
  }
  return weighed_list;
};

// Pauzeer functie
function changeState() {
  var elpauseBTN = document.getElementById("pauseBTN");
  if (paused === 0) {
    elpauseBTN.innerHTML = icon("play") + " Continueer spel";
    paused = 1;
  } else {
    elpauseBTN.innerHTML = icon("pause") + " Pauzeer spel";
    paused = 0;
  }
}

// Loops voor counters
var timerCounter = 0;
var paused = 0;
var NaNMarket = 0;
var loopsProduction = setInterval(function () {
  Display.updateRows();
  objFlows.updateActivity();
  if (paused === 0) {
    if (objFarmland.FarmTimer > 0) objFarmland.working_loop();
    if (objFarmland.GrainResearchTimer > 0) objFarmland.research_loop();
    if (objWindmill.GrindTimer > 0) objWindmill.grind_loop();
    if (objWindmill.autoGrindTimer > 0) objWindmill.autogrind_loop();
    if (objResearch.running === 1) objResearch.Research_loop();
    if (objMines.prospectTimerActive > 0) objMines.prospect_loop();

    if (+objOilPump.amount > 0 || +objOilPumpAdv.amount > 0)
      objOil.produceOil();
    if (+objMines.coalAmountActive >= 1) objCoalMine.produce();
    if (+objMines.ironAmountActive >= 1) objIronMine.produce();
    if (objCopperMine.unlocked()) {
      objCopperMine.produce();
      objCopperSmelter.produce();
      objCopperMine.show();
      objCopperSmelter.show();
      objCopper.show();
    }
    if (objGoldMine.unlocked()) {
      objGoldMine.produce();
      objGoldRefinery.produce();
      objGoldMine.show();
      objGoldRefinery.show();
      objGold.show();
      objNuclearPowerPlant.showControl();
    }
    if (objDiamondMine.unlocked()) {
      objDiamondMine.produce();
      objDiamondCutter.produce();
      objDiamondMine.show();
      objDiamondCutter.show();
      objDiamondVault.show();
      objDiamondDrill.show();
    }
    if (objChipFactory.unlocked()) {
      // Eerst het lab, zodat de chipfabrieken de nieuwe isotopen kunnen gebruiken
      objIsotopeLab.produce();
      objChipFactory.produce();
      objIsotopes.decay();
      objDatacenter.produce();
      objChipFactory.show();
      objChips.show();
      objDatacenter.show();
      objIsotopeLab.show();
      objIsotopes.show();
      objAICoin.show();
      objFusion.show();
    }
    if (objElectronics.unlocked()) {
      objElectronics.produce();
      objIronMelter.autoProduce();
      objScanner.tick();
      objElectronics.show();
      objPCB.show();
      objSolar.show();
      objScanner.show();
      objIronMelter.showControl();
      objPause.update("SteelProduction-col");
      objPause.update("Prospecting-col");
    }

    var energyBefore = +objEnergy.available;
    objEnergy.produce();
    objStats.count("energie", +objEnergy.available - energyBefore);
    objEnergy.track();
    objEnergy.show();
    if (objFarmRobot.robotTimer > 0) objFarmRobot.work_loop();
    if (objFarmRobot.robots > 0 && objFarmRobot.robotTimer === 0)
      objFarmRobot.work();

    objPlayerInfo.levelup();

    if (objWindmill.running === 0 && objWindmillController.amount >= 1)
      objWindmill.autogrind();

    timerCounter++;
    if (+timerCounter % 5 === 0) {
      if (+objSalesComputer.cpu > 0) objSalesComputer.autoSell();
      objOil.priceCalc();
      if (+objPlasticFactory.amount > 0 || +objPlastic.amount > 0)
        objPlastic.showPrice();
      objGrain.priceCalc();
      objSteel.price = (objIronOre.price * 10 + +objCoal.price) * 1.25;
      if (+objIronMelter.amount > 0) {
        objSteel.showPrice();
      }
      showPrice();

      if (+objSalesComputer.cpu > 0) {
        objSalesComputer.showOil(store.getItem("autoOil"));
        objSalesComputer.showFlour(store.getItem("autoFlour"));
        objSalesComputer.showPasta(store.getItem("autoPasta"));
        objSalesComputer.showKunststof(store.getItem("autoKunststof"));
      }
      if (objChicken.amount >= 1) objChicken.makeEggs();
      if (+objFuelCellFactory.amount > 0 || +objFuelRod.waste > 0)
        objFuelRod.calculateWastePrice(50000, 99999);
    }
    // Nieuwe marktprijzen iedere 5 seconden, zoals in de oorspronkelijke versie (#83)
    if (+timerCounter % 5 === 0) getPrice();
    if (
      +timerCounter % objUraniumMine.period === 0 &&
      +objMines.uraniumAmountActive >= 1
    )
      objUraniumMine.produce();
    if (+timerCounter % 15 === 0) {
      objPastaHelper.action();
      if (objPlasticFactory.workers > 0) objPlasticFactory.produce(1);
    }
    if (!isNaN(objSalesInfo.eggs) && +timerCounter % 30 === 0) getSaleInfo();
    if (+timerCounter % 60 === 0 && +objFuelRod.waste > 0)
      objFuelRod.wastePayment();
    if (quickSell === 1) quickSellMenu();
    if (objFuelCellFactory.amount > 0) objFuelCellFactory.produce();
    objStats.tick();
  }
  objButtons.update();
}, 1000);
