//init
var spend = localStorage.getItem('spend') || 10;
var made = localStorage.getItem('made') || 0;
var PriceFactor = 25;
var debug = localStorage.getItem('debug') || 0;

// voorbereiding voor debug mogelijkheden.
function turnDebug() {
    if (localStorage.getItem('debug') == 0) {
        localStorage.setItem("debug", 1);
    } else {
        localStorage.setItem("debug", 0)
    }

};



// guid vastleggen
function identUser() {
    var uuid = localStorage.getItem('guid') || guid();
    localStorage.setItem('guid', uuid);

    var newUser = localStorage.getItem('onlineUserID') || 0;

    // In het geval van een nog niet online geregistreerde user:
    if (newUser == 0) {
        var uuid = guid()
        localStorage.setItem('guid', uuid);
        var progress = saveProgress();

        var data = "id=" + uuid + "&savegame=" + progress + "&type=save_initial";

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState == 4 && this.status == 200) {
                objSaveGame = JSON.parse(this.responseText);
                //localStorage.setItem('onlineUserID', objSaveGame._id);
            }
        });

        xhr.open("POST", "/inc/connector.php");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("Cache-Control", "no-cache");

        xhr.send(data);

        newUser = 1;
        localStorage.setItem('newUser', newUser);
    }
}


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


// initialisatie
window.onload = function () {
    // Zetten vars
    identUser();
    document.getElementById("sellMenu").style.display = "none";
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
    showQuickSell(0);
    // Initialiseren overige gegevens en display
    showPrice();
}

// Functie voor het goed weergeven van bedragen
function FixMoney(InputMoney) {
    InputMoney = parseFloat(+InputMoney);
    return InputMoney.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
}

// Functie voor het goed weergeven van hoeveelheden
function FixNumber(InputNumber) {
    InputNumber = parseFloat(+InputNumber);
    return InputNumber.toLocaleString();
}

// Functie van het goed weergeven van afgeronde gewichten
function AfrondenGewicht(InputGewicht) {
    var afgerond = Math.round(+InputGewicht * 100) / 100;
    return afgerond;
}

// Player object
var objPlayerInfo = {
    level: localStorage.getItem('PlayerLevel') || 1,
    nextlevel: 3000,
    show: function () {
        document.getElementById('currentlevel').innerHTML = "Huidig level is: " + objPlayerInfo.level;
        document.getElementById('nextlevel').innerHTML = "Drempel voor volgend level: " + FixMoney(objPlayerInfo.nextlevel);
    },
    proceslevel: function (reason) {
        var c = "none";
        var d = "";
        if (+objPlayerInfo.level == 1) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, c, c, c, c, c, c, c, c, c, c);
        }
        if (+objPlayerInfo.level == 2) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, c, c, c, c, c, c, c, c, c);
        }
        if (+objPlayerInfo.level == 3) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, d, c, c, c, c, c, c, c, c);
        }
        if (+objPlayerInfo.level == 4) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, d, d, c, c, c, c, c, c, c);
        }
        if (+objPlayerInfo.level == 5) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 4;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, c, c, c, c, c, c);
        }
        if (+objPlayerInfo.level == 6) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 3;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, d, d, c, c, c, c);
        }
        if (+objPlayerInfo.level == 7) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 4;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, d, d, d, c, c, c);
        }
        if (+objPlayerInfo.level == 8) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, d, d, d, d, c, c);
            objResearch.show();
        }
        if (+objPlayerInfo.level == 9) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, d, d, d, d, c, c);
            objResearch.show();
        }
        if (+objPlayerInfo.level == 10) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, d, d, d, d, d, c);
            objResearch.show();
        }
        if (+objPlayerInfo.level > 10) {
            if (reason == "levelup") {
                objPlayerInfo.nextlevel = +objPlayerInfo.nextlevel * 5;
            }
            objPlayerInfo.levelFunction(d, d, d, d, d, d, d, d, d, d, d);
            objResearch.show();
        }
        localStorage.setItem('NextLevel', objPlayerInfo.nextlevel);
    },
    levelup: function () {
        if (+objMoney.amount > +objPlayerInfo.nextlevel) {
            +objPlayerInfo.level++;
            localStorage.setItem('PlayerLevel', objPlayerInfo.level);
            objPlayerInfo.proceslevel("levelup");
            notificationOverlay("Levelup! je bent nu level: " + objPlayerInfo.level, "Level", "fa-arrow-circle-up");
        }
        objPlayerInfo.show();
    },
    levelFunction: function (a, b, c, d, e, f, g, h, i, j, k) {
        document.getElementById("landbouw-col").style.display = a;
        document.getElementById("grain-col").style.display = a;
        document.getElementById("flour-col").style.display = b;
        document.getElementById("windmills").style.display = b;
        document.getElementById("Flourstock").style.display = b;
        document.getElementById("graanopbrengst-col").style.display = c;
        document.getElementById("olie-col").style.display = c;
        document.getElementById("Oilstock").style.display = c;
        // /document.getElementById("research-menu").style.display = d;
        document.getElementById("pomp-col").style.display = d;
        document.getElementById("energieproductie-col").style.display = d;
        document.getElementById("EnergyStatsLevel").style.disabled = d;
        document.getElementById("energy-col").style.display = d;
        document.getElementById("farmland-automation").style.display = e;
        document.getElementById("WindmillController").style.display = f;
        document.getElementById("chicken-col").style.display = g;
        document.getElementById("pasta-col").style.display = h;
        document.getElementById("AutoSell-col").style.display = h;
        document.getElementById("plastic-row").style.display = g
        document.getElementById("MiningResearch-col").style.display = i;
        document.getElementById("mijnbouw-row").style.display = i;
        document.getElementById("mijnen-row").style.display = i;
        document.getElementById("mijnen-row2").style.display = i;
        document.getElementById("Uranium-col").style.display = j;
        document.getElementById("nuclearFuel-row").style.display = k;
    },
    init: function () {
        objPlayerInfo.level = localStorage.getItem('PlayerLevel') || 1;
        objPlayerInfo.nextlevel = localStorage.getItem('NextLevel') || 3000;
        objPlayerInfo.proceslevel("init");
        objPlayerInfo.show();
    }
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
        localStorage.setItem('made', made);
        registerSale(tt, amount, moneyProfit);
        if (quickSell == 1) {
            quickSellMenu();
        }
    },
    use: function (moneyUsed) {
        moneyUsed = parseFloat(moneyUsed);
        objMoney.amount = +objMoney.amount - +moneyUsed;
        spend = +spend + +moneyUsed;
        localStorage.setItem('spend', spend);
        objMoney.show();
    },
    show: function () {
        MoneyRound = Math.round(+objMoney.amount * 100) / 100;
        document.getElementById("MoneyAmount").innerHTML = "<p>Beschikbaar vermogen: " + FixMoney(MoneyRound) + "</p>";
        document.getElementById("MoneyTop").innerHTML = "Vermogen: <kbd2>" + FixMoney(MoneyRound) + "</kbd2>";
        localStorage.setItem('Money', +MoneyRound);
    },
    showUpdate: function (description, moneyProfit) {
        profitRound = Math.round(+moneyProfit * 100) / 100;
        showHistory(description + " " + FixMoney(profitRound));
    },
    init: function () {
        objMoney.amount = localStorage.getItem('Money') || 2000;
        objMoney.show();
    }
};


//Oil object
var objOil = {
    price: localStorage.getItem('OilPrice') || 10,
    tempUsage: 0,
    sellOil: function () {
        var amount = +objOilTank.contents - (+objPowerPlant.amount * 5);
        var Profit = +objOilTank.use((+objOilTank.contents - (+objPowerPlant.amount * 5))) * +objOil.price;
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
        if (objOilPump.amount > 0) {
            objOilTank.fill(+objEnergy.use(+objOilPump.amount, "Oliepomp"));
        }
        if (objOilPumpAdv.amount > 0) {
            objOilTank.fill(objOilPumpAdv.produce());
        }
        objEnergy.show();
    },
    priceCalc: function () {
        objOil.price = Math.floor(Math.random() * 21);
        localStorage.setItem('OilPrice', +objOil.price);
    },
    init: function () {
        objOil.price = localStorage.getItem('Oilprice') || 10;
    }
};

// FarmRobot object
var objFarmRobot = {
    robots: 0,
    robotCost: 5000,
    robotEnergy: 15,
    robotCap: 10,
    robotTimer: 10,
    activeRobots: 0,
    add: function () {
        if (+objMoney.amount > +objFarmRobot.robotCost) {
            objMoney.use(objFarmRobot.robotCost);
            objFarmRobot.robots = +objFarmRobot.robots + 1;
            if ((+objFarmRobot.robotCap * +objFarmRobot.robots) >= objFarmland.amount) {
                objFarmland.automatedAmount = objFarmland.amount;
            } else {
                objFarmland.automatedAmount = +objFarmRobot.robotCap * +objFarmRobot.robots;
            };
            localStorage.setItem('FarmRobots', objFarmRobot.robots);
            localStorage.setItem('AutomatedFarms', objFarmland.automatedAmount);
            objFarmRobot.show();
            if (+objFarmRobot.robots == 1) {
                objFarmRobot.work();
            };
            objEnergy.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Farmrobot", "fa-euro-sign");
        }
    },
    sell: function () {
        if (+objFarmRobot.robots > 0) {
            objMoney.add((+objFarmRobot.robotCost * 0.75), "Verkoop farmrobot", 2, 1);
            objFarmRobot.robots = +objFarmRobot.robots - 1;
            if ((+objFarmRobot.robotCap * +objFarmRobot.robots) >= objFarmland.amount) {
                objFarmland.automatedAmount = objFarmland.amount;
            } else {
                objFarmland.automatedAmount = +objFarmRobot.robotCap * +objFarmRobot.robots;
            };
            localStorage.setItem('FarmRobots', objFarmRobot.robots);
            localStorage.setItem('AutomatedFarms', objFarmland.automatedAmount);
            objFarmRobot.show();
            objEnergy.show();
        }
    },
    timerCountdown: function () {
        document.getElementById("RobotTimer").innerHTML = "De oogst is klaar over: " + objFarmRobot.robotTimer + " Ticks";
    },
    work: function () {
        if (objFarmRobot.amount == 0) {
            return 0;
        };
        var tempEnergy = +objEnergy.available;
        objFarmRobot.activeRobots = Math.floor(+tempEnergy / +objFarmRobot.robotEnergy);
        if (+objFarmRobot.activeRobots > +objFarmRobot.robots) {
            objFarmRobot.activeRobots = +objFarmRobot.robots;
        };
        var robotEnergyUsage = +objFarmRobot.activeRobots * +objFarmRobot.robotEnergy;
        objEnergy.use(+robotEnergyUsage, "Farmrobot");
        if ((+objFarmRobot.activeRobots * +objFarmRobot.robotCap) > +objFarmland.amount) {
            var activeFields = +objFarmland.amount;
        } else {
            var activeFields = +objFarmRobot.activeRobots * +objFarmRobot.robotCap;
        }
        var robotLoop = setInterval(
            function () {
                objFarmRobot.robotTimer--;
                objFarmRobot.timerCountdown();
                if (objFarmRobot.robotTimer < 1) {
                    clearInterval(robotLoop);
                    //nog rekening houden met max aan de hand van aanwezige velden.
                    var production = (+activeFields * +objFarmland.harvest);
                    objGrainSilo.fill(production);
                    objGrainSilo.show();
                    objFarmRobot.robotTimer = 10;
                    objFarmRobot.work();
                }
            }, 1000)
    },
    show: function () {
        document.getElementById("ShowFarmRobot").innerHTML = "<p>Op dit moment zijn er: " + objFarmRobot.robots + " Robots die " +
            (+objFarmRobot.robots * +objFarmRobot.robotCap) + " velden bewerken (voor " + FixNumber(AfrondenGewicht((+objFarmland.harvest * (+objFarmRobot.robots * +objFarmRobot.robotCap)))) + "kg graan per run). Dit kost " +
            (+objFarmRobot.robots * +objFarmRobot.robotEnergy) + " Energie per run</p>";
        document.getElementById("FarmRobotPrice").innerHTML = "<p>Een FarmRobot kopen kost: " + FixMoney(objFarmRobot.robotCost) + ".<br>Een robot verkopen levert: " + FixMoney((+objFarmRobot.robotCost * 0.75)) + " op.</p>";
        objFarmland.manualFarm();
    },
    init: function () {
        objFarmRobot.robots = localStorage.getItem('FarmRobots') || 0;
        objFarmRobot.show();
        if ((+objFarmRobot.robotCap * +objFarmRobot.robots) >= objFarmland.amount) {
            objFarmland.automatedAmount = objFarmland.amount;
        } else {
            objFarmland.automatedAmount = +objFarmRobot.robotCap * +objFarmRobot.robots;
        };
        objFarmland.manualFarm();
        if (+objFarmRobot.robots >= 1) {
            objFarmRobot.work();
        };
    }
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
            localStorage.setItem('GrainSiloAmount', objGrainSilo.amount);
            localStorage.setItem('GrainSiloPrice', objGrainSilo.price);
            objGrainSilo.show();
        }
    },
    fill: function (InputAmount) {
        var neededFarms = (+objChickenFarm.amount * +objChickenFarm.grainSiloCap) - +objChickenFarm.grainReserve;
        if (neededFarms > InputAmount) {
            objChickenFarm.grain(+InputAmount, "in");
            return 0;
        }
        objChickenFarm.grain(+neededFarms, "in");
        InputAmount = +InputAmount - +neededFarms;
        InputAmount = Math.round(InputAmount * 100) / 100;
        var SpaceLeft = ((+objGrainSilo.amount * +objGrainSilo.cap) - +objGrainSilo.contents);
        if (+InputAmount > +SpaceLeft) {
            objGrainSilo.contents = +objGrainSilo.contents + +SpaceLeft;
            var Rest = +InputAmount - +SpaceLeft;
            objGrain.sellRest(Rest);
        } else {
            objGrainSilo.contents = +objGrainSilo.contents + +InputAmount;
        };
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
        var percentageFilled = (+objGrainSilo.contents / (+objGrainSilo.amount * +objGrainSilo.cap)) * 100;
        percentageFilled = Math.round(percentageFilled * 100) / 100;
        document.getElementById("Grainstock").innerHTML = '<p>Graan:</p><div class="progress"><div class="progress-bar" style="width:' + percentageFilled + '%">' + FixNumber(objGrainSilo.contents) + 'kg (' + percentageFilled + '%)</div></div>'
    },
    show: function () {
        objGrainSilo.contents = Math.round(+objGrainSilo.contents * 100) / 100;
        var TempCap = (+objGrainSilo.amount * +objGrainSilo.cap) - +objGrainSilo.contents;
        document.getElementById("GrainSilo").innerHTML = "Er zijn " + objGrainSilo.amount + " silo's beschikbaar met nog " + FixNumber(TempCap) + "KG aan restcapaciteit. Eventueel overschot wordt direct verkocht voor 80% onder de huidige marktprijs.";
        document.getElementById("GrainAmount").innerHTML = "<p>Hoeveelheid graan op voorraad: " + FixNumber(objGrainSilo.contents) + "kg</p>";
        localStorage.setItem('GrainSiloContents', objGrainSilo.contents);
        document.getElementById("GrainSiloPrice").innerHTML = "<p>Een silo kost " + FixMoney(objGrainSilo.price) + " en kan " + FixNumber(objGrainSilo.cap) + "KG graan bevatten</p>";
        document.getElementById("GrainTop").innerHTML = "Graan: <kbd2>" + FixNumber(objGrainSilo.contents) + "/" + FixNumber((objGrainSilo.amount * objGrainSilo.cap)) + "</kbd2>";
        objGrainSilo.visual();
    },
    init: function () {
        objGrainSilo.amount = localStorage.getItem('GrainSiloAmount') || 1;
        objGrainSilo.cap = localStorage.getItem('GrainSiloCap') || 5000;
        objGrainSilo.price = localStorage.getItem('GrainSiloPrice') || 2000;
        objGrainSilo.contents = localStorage.getItem('GrainSiloContents') || 0;
        objGrainSilo.show();
    }
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
            localStorage.setItem('FlourSiloAmount', objFlourSilo.amount);
            localStorage.setItem('FlourSiloPrice', objFlourSilo.price);
        }
    },
    fill: function (InputAmount) {
        var SpaceLeft = ((+objFlourSilo.amount * +objFlourSilo.cap) - +objFlourSilo.contents);
        if (+InputAmount > +SpaceLeft) {
            objFlourSilo.contents = +objFlourSilo.contents + +SpaceLeft;
            var Rest = +InputAmount - +SpaceLeft;
            objFlour.sellRest(Rest);
        } else {
            objFlourSilo.contents = +objFlourSilo.contents + +InputAmount;
        };
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
        var percentageFilled = (+objFlourSilo.contents / (+objFlourSilo.amount * +objFlourSilo.cap)) * 100;
        percentageFilled = Math.round(percentageFilled * 100) / 100;
        document.getElementById("Flourstock").innerHTML = '<p>Bloem:</p><div class="progress"><div class="progress-bar" style="width:' + percentageFilled + '%">' + FixNumber(objFlourSilo.contents) + 'kg (' + percentageFilled + '%)</div></div>'
    },
    show: function () {
        document.getElementById("Flour").innerHTML = "<p>Hoeveelheid bloem op voorraad: " + FixNumber(objFlourSilo.contents) + "kg</p>";
        var TempCap = (+objFlourSilo.amount * +objFlourSilo.cap) - +objFlourSilo.contents;
        document.getElementById("FlourSilo").innerHTML = "Er zijn " + FixNumber(objFlourSilo.amount) + " silo's beschikbaar met nog " + FixNumber(TempCap) + "KG aan restcapaciteit. Eventueel overschot wordt direct verkocht voor 20% onder de huidige marktprijs.";
        localStorage.setItem('FlourSiloContents', objFlourSilo.contents);
        document.getElementById("FlourSiloPrice").innerHTML = "<p>Een silo kost " + FixMoney(objFlourSilo.price) + " en kan " + FixNumber(objFlourSilo.cap) + "KG bloem bevatten</p>";
        document.getElementById("FlourTop").innerHTML = "Bloem: <kbd2>" + FixNumber(objFlourSilo.contents) + "/" + FixNumber((objFlourSilo.amount * objFlourSilo.cap)) + "</kbd2>";
        objFlourSilo.visual();
    },
    init: function () {
        objFlourSilo.amount = localStorage.getItem('FlourSiloAmount') || 1;
        objFlourSilo.contents = localStorage.getItem('FlourSiloContents') || 0;
        objFlourSilo.cap = localStorage.getItem('FlourSiloCap') || 10000;
        objFlourSilo.price = localStorage.getItem('FlourSiloPrice') || 5000;
        objFlourSilo.show();
    }
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
        if (+objOilTank.amount > 0) {
            if (+objOilTank.contents > (+objOilTank.contents - +objOilTank.cap)) {
                objOilTank.use(objOilTank.cap);
            };
            objOilTank.amount = +objOilTank.amount - 1;
            objMoney.add((+objOilTank.price * 0.5), "Verkoop olietank", 20, 1)
            objOilTank.price = +objOilTank.price / 1.01;
            localStorage.setItem('OilTankPrice', objOilTank.price);
            localStorage.setItem('OilTankAmount', objOilTank.amount);
            objOilTank.totalCap = +(+objOilTank.amount * +objOilTank.cap) + +(+objOilTank.amountBig * +objOilTank.capBig);
            localStorage.setItem('OilTankCapTotal', objOilTank.totalCap);
            objOilTank.show();
        } else {
            notificationOverlay("Geen tanks om te verkopen!", "Olietanks", "fa-industry");
        }
    },
    add: function (type) {
        if (type == 0) {
            if (+objMoney.amount > +objOilTank.price) {
                objMoney.use(objOilTank.price);
                objOilTank.price = +objOilTank.price * 1.01;
                localStorage.setItem('OilTankPrice', objOilTank.price);
                objOilTank.amount = +objOilTank.amount + 1;
                localStorage.setItem('OilTankAmount', objOilTank.amount);
                objOilTank.totalCap = +(+objOilTank.amount * +objOilTank.cap) + +(+objOilTank.amountBig * +objOilTank.capBig);
                localStorage.setItem('OilTankCapTotal', objOilTank.totalCap);
                objOilTank.show();
            } else {
                notificationOverlay("Niet genoeg doekoe!", "Olietank", "fa-euro-sign");
            }
        } else {
            if (+objMoney.amount > +objOilTank.priceBig) {
                objMoney.use(objOilTank.priceBig);
                objOilTank.priceBig = +objOilTank.priceBig * 1.01;
                localStorage.setItem('OilTankPriceBig', objOilTank.priceBig);
                objOilTank.amountBig = +objOilTank.amountBig + 1;
                localStorage.setItem('OilTankAmountBig', objOilTank.amountBig);
                objOilTank.totalCap = +(+objOilTank.amount * +objOilTank.cap) + +(+objOilTank.amountBig * +objOilTank.capBig);
                localStorage.setItem('OilTankCapTotal', objOilTank.totalCap);
                objOilTank.show();
            } else {
                notificationOverlay("Niet genoeg doekoe!", "Olietank", "fa-euro-sign");
            }
        }

    },
    fill: function (InputAmount) {
        var SpaceLeft = (+objOilTank.totalCap - +objOilTank.contents);
        if (+InputAmount > +SpaceLeft) {
            objOilTank.contents = +objOilTank.contents + +SpaceLeft;
            var Rest = +InputAmount - +SpaceLeft;
            objOil.sellRest(Rest);
        } else {
            objOilTank.contents = +objOilTank.contents + +InputAmount;
        };
        objOilTank.show();
    },
    use: function (used) {
        if (+objOilTank.contents < +used) {
            var oilAvailabe = +objOilTank.contents;
            objOilTank.contents = +objOilTank.contents - +oilAvailabe;
            objOilTank.show();
            return oilAvailabe;
        } else {
            objOilTank.contents = +objOilTank.contents - +used;
            objOilTank.show();
            return +used;
        }
    },
    visual: function () {
        var percentageFilled = (+objOilTank.contents / +objOilTank.totalCap) * 100;
        percentageFilled = Math.round(percentageFilled * 100) / 100;
        document.getElementById("Oilstock").innerHTML = '<p>Olie:</p><div class="progress"><div class="progress-bar" style="width:' + percentageFilled + '%">' + FixNumber(objOilTank.contents) + 'l (' + percentageFilled + '%)</div></div>'
    },
    show: function () {
        var TempCap = +objOilTank.totalCap - +objOilTank.contents;

        if (+objPlayerInfo.level > 9) {
            document.getElementById("OilTankPrice").innerHTML = "<p>Een extra olietank (klein) kan " + FixNumber(objOilTank.cap) + " vaten bevatten en kost: " + FixMoney(objOilTank.price) + "<br>Een grote olietank kan " + FixNumber(objOilTank.capBig) +
                " vaten bevatten en kost " + FixMoney(objOilTank.priceBig) + "</p><p>Kleine olietanks kunnen verkocht worden voor 50% van de aanschafwaarde, eventuele olie in deze tanks wordt weggespoeld!</p>";
            document.getElementById('oilTankBig').style.display = "";
            document.getElementById('sellOilTank').style.display = "";

            if (+objOilTank.amount == 0 && +objOilTank.amountBig > 0) {
                document.getElementById('oilTankSmall').style.display = "none";
                document.getElementById('sellOilTank').style.display = "none";
                document.getElementById('buySmallOilTank').style.display = "none";
                document.getElementById("oilTank").innerHTML = "Er zijn " + FixNumber(objOilTank.amountBig) + " tanks (groot) beschikbaar met nog " + FixNumber(TempCap) + "l aan restcapaciteit. Eventueel overschot wordt direct verkocht voor 20% onder de huidige marktprijs.";
            }
            if (+objOilTank.amount > 0 && +objOilTank.amountBig > 0) {
                document.getElementById('oilTankSmall').style.display = "";
                document.getElementById("oilTank").innerHTML = "Er zijn " + FixNumber(objOilTank.amountBig) + " grote tanks en " + FixNumber(objOilTank.amount) + " kleine tanks beschikbaar met nog " + FixNumber(TempCap) +
                    " vaten aan restcapaciteit. Eventueel overschot wordt direct verkocht voor 20% onder de huidige marktprijs.";
            }
        } else {
            document.getElementById("OilTankPrice").innerHTML = "<p>Een extra olietank kan " + FixNumber(objOilTank.cap) + " vaten bevatten en kost: " + FixMoney(objOilTank.price) + "</p>";
            document.getElementById("oilTank").innerHTML = "Er zijn " + FixNumber(objOilTank.amount) + " tanks (klein) beschikbaar met nog " + FixNumber(TempCap) + "l aan restcapaciteit. Eventueel overschot wordt direct verkocht voor 20% onder de huidige marktprijs.";
            document.getElementById('oilTankSmall').style.display = "";
            document.getElementById('oilTankBig').style.display = "none";
        }


        var clicksRound = Math.round(objOilTank.contents * 100) / 100;
        document.getElementById("clickCount").innerHTML = "<p>Aantal vaten olie op voorraad: " + FixNumber(clicksRound) + "</p>";

        localStorage.setItem('Oil', clicksRound);
        document.getElementById("OilTop").innerHTML = "Olie: <kbd2>" + FixNumber(objOilTank.contents) + "/" + FixNumber(objOilTank.totalCap) + "</kbd2>";
        objOilTank.visual();
    },
    init: function () {
        objOilTank.contents = localStorage.getItem('Oil') || 1;
        objOilTank.amount = localStorage.getItem('OilTankAmount') || 1;
        objOilTank.cap = localStorage.getItem('OilTankCap') || 1000;
        objOilTank.price = localStorage.getItem('OilTankPrice') || 1000;
        objOilTank.priceBig = localStorage.getItem('OilTankPriceBig') || 1000000;
        objOilTank.amountBig = localStorage.getItem('OilTankAmountBig') || 1;
        console.log((+objOilTank.amount * +objOilTank.cap));
        console.log((+objOilTank.amountBig * +objOilTank.capBig));
        objOilTank.totalCap = ((+objOilTank.amount * +objOilTank.cap) + (+objOilTank.amountBig * +objOilTank.capBig));
        objOilTank.show();
    }
};



// Farms object
var objFarmland = {
    amount: 1,
    automatedAmount: 0,
    cost: 10,
    harvest: 100,
    timer: 10,
    GrainResearchCostVar: 5000,
    GrainResearchDuration: 60,
    GrainResearchProfit: 10,
    GrainResearchLevel: 1,
    addfarm: function () {
        if (+objMoney.amount > +objFarmland.cost) {
            objMoney.use(objFarmland.cost);
            objFarmland.amount++;
            if ((+objFarmRobot.robotCap * +objFarmRobot.robots) >= objFarmland.amount) {
                objFarmland.automatedAmount = objFarmland.amount;
            } else {
                objFarmland.automatedAmount = +objFarmRobot.robotCap * +objFarmRobot.robots;
            };
            objFarmland.manualFarm();
            objFarmland.calcPrice();
            objFarmland.showPrice();
            objFarmland.showFarms();
        }
    },
    manualFarm: function () {
        if (objFarmland.automatedAmount >= objFarmland.amount) {
            document.getElementById("FarmManual").style.display = "none";
        } else {
            document.getElementById("FarmManual").style.display = "block";
        };
    },
    timerCountdown: function () {
        document.getElementById("FarmlandTimer").innerHTML = "De oogst is klaar over: " + FarmTimer + " Ticks";
    },
    showPrice: function () {
        document.getElementById("FarmlandPrice").innerHTML = "<p>Kosten landbouwgrond: " + FixMoney(objFarmland.cost) + "</p>";
        document.getElementById("FarmHarvestPerField").innerHTML = "<p>Opbrengst per veld: " + objFarmland.harvest + "kg</p>";
        localStorage.setItem('FarmlandCost', objFarmland.cost);
        localStorage.setItem('Harvest', objFarmland.harvest);
    },
    calcPrice: function () {
        objFarmland.cost = objFarmland.cost * 1.05;
        objFarmland.cost = Math.round(objFarmland.cost * 100) / 100;
    },
    showFarms: function () {
        document.getElementById("Farmland").innerHTML = "<p>Hoeveelheid landbouwgrond: " + FixNumber(objFarmland.amount) + "</p>";
        localStorage.setItem('Farmland', objFarmland.amount);
        objFarmland.manualFarm();
    },
    work: function (Button) {
        FarmTimer = objFarmland.timer;
        var WorkingAmount = +objFarmland.amount - +objFarmland.automatedAmount;
        objFarmland.working(WorkingAmount, Button);
    },
    working: function (FarmAmount, button) {
        //button disable
        button.disabled = true;
        var farmLoop = setInterval(
            function () {
                FarmTimer--;
                objFarmland.timerCountdown();
                if (FarmTimer < 1) {
                    clearInterval(farmLoop);
                    var filling = +FarmAmount * +objFarmland.harvest;
                    objGrainSilo.fill(filling);
                    //button enable
                    button.disabled = false;
                }
            }, 1000)
    },
    research: function () {
        if (+objMoney.amount >= +objFarmland.GrainResearchCostVar) {
            StartGrainResearch(objFarmland.GrainResearchDuration, objFarmland.GrainResearchCostVar, objFarmland.GrainResearchProfit);

        } else {
            notificationOverlay("Niet genoeg doekoe!", "Graanveredeling", "fa-euro-sign");
        }
    },
    showResearch: function () {
        if (localStorage.getItem("GrainResearchTimerCount") > 0) {
            var timerStand = localStorage.getItem("GrainResearchTimerCount");
            document.getElementById("GRButton").style.display = "none";
            StartGrainResearch(+timerStand, 0, objFarmland.GrainResearchProfit);
        }

        document.getElementById("GrainResearchCost").innerHTML = "<p>Het onderzoek zal: " + objFarmland.GrainResearchDuration + " ticks duren en kost: " +
            FixMoney(objFarmland.GrainResearchCostVar) + "</p><p>Opbrengstverbetering: " + objFarmland.GrainResearchProfit + "% (voor deze upgrade)</p><p>Je bent nu op research level: " +
            objFarmland.GrainResearchLevel + "</p>";
    },
    init: function () {
        objFarmland.amount = localStorage.getItem('Farmland') || 1;
        objFarmland.cost = localStorage.getItem('FarmlandCost') || 10;
        objFarmland.harvest = localStorage.getItem('Harvest') || 100;
        objFarmland.GrainResearchCostVar = localStorage.getItem("GrainResearchCostVar") || 5000;
        objFarmland.GrainResearchDuration = localStorage.getItem("GrainResearchDuration") || 60;
        objFarmland.GrainResearchProfit = localStorage.getItem('GrainResearchProfit') || 10;
        objFarmland.automatedAmount = localStorage.getItem("AutomatedFarms") || 0;
        objFarmland.GrainResearchLevel = localStorage.getItem("GrainResearchLevel") || 1;
        objFarmland.showFarms();
        objFarmland.showPrice();
        objFarmland.showResearch();
    }
};

//temp clearing function

function clearingFlour() {
    localStorage.removeItem('GrainSiloContents');

    localStorage.setItem('FlourSiloContents', 20000);

    location.reload();
}

// Windmill object
var objWindmill = {
    amount: 1,
    amountAutomated: 0,
    nonAutomatedWindmills: 0,
    cost: 500,
    speed: 1,
    cap: 1000,
    running: 0,
    grindTimer: 10,
    autoGrindTimer: 9,
    add: function () {
        if (+objMoney.amount > +objWindmill.cost) {
            objMoney.use(objWindmill.cost);
            objWindmill.amount++;
            objFarmland.showPrice();
            objWindmill.show();
            localStorage.setItem('WindmillAmount', objWindmill.amount);
        }
    },
    grind: function (button) {
        button.disabled = true;
        objWindmill.nonAutomatedWindmills = +objWindmill.amount - +objWindmill.amountAutomated;
        if (objWindmill.nonAutomatedWindmills == 0) {
            button.disabled = false;
            return 0;
        }
        if (+objGrainSilo.contents == 0) {
            button.disabled = false;
            notificationOverlay("Geen graan beschikbaar", "Windmolens", "fa-tree");
            return 0;
        }
        if (+objGrainSilo.contents <= (+objWindmill.cap * +objWindmill.nonAutomatedWindmills)) {
            var tempAmount = +objGrainSilo.contents;
        } else {
            var tempAmount = (+objWindmill.cap * +objWindmill.nonAutomatedWindmills);
        }
        objGrainSilo.use(+tempAmount);
        objGrainSilo.show();
        var grindLoop = setInterval(
            function () {
                +objWindmill.grindTimer--;
                objWindmill.grindTimerCountdown();
                objFlourSilo.fill((+tempAmount / 10));
                if (objWindmill.grindTimer < 1) {
                    clearInterval(grindLoop);

                    button.disabled = false;
                    objWindmill.grindTimer = 10;
                }
            }, 1000)
    },
    tempAmountAuto: 0,
    autogrind: function () {
        objWindmill.running = 1;
        objWindmill.tempAmountAuto = 0;
        var buttonState = document.getElementById("GrindGrain");

        // controleren of er graan is
        if (objGrainSilo.contents == 0) {
            objWindmill.running = 0;
            return 0;
        }

        // Bepalen hoeveel geautomatiseerde molens we kunnen draaien
        if (+objEnergy.available < ((+objWindmillController.amount * +objWindmillController.energy) / 10)) {
            objWindmill.amountAutomated = Math.floor(+objEnergy.available / ((+objWindmillController.amount * +objWindmillController.energy) / 10));
            if (objWindmill.amountAutomated == 0) {
                objWindmill.running = 0;
                return 0;
            }
        } else {
            if (+objWindmill.amount > +objWindmillController.amount) {
                objWindmill.amountAutomated = +objWindmillController.amount;
                if (buttonState.classList.contains("disabled")) {
                    buttonState.classList.remove("disabled");
                }

            } else {
                objWindmill.amountAutomated = +objWindmill.amount;
                buttonState.classList.add("disabled");
            }
            if (objWindmill.amountAutomated == 0) {
                objWindmill.running = 0;
                return 0;
            }
        };

        // bepalen hoeveel graan we gaan gebruiken
        if (+objGrainSilo.contents <= (+objWindmill.cap * +objWindmill.amountAutomated)) {
            objWindmill.tempAmountAuto = +objGrainSilo.contents;
        } else {
            objWindmill.tempAmountAuto = (+objWindmill.cap * +objWindmill.amountAutomated);
            if (objWindmill.tempAmountAuto == 0) {
                objWindmill.running = 0;
                return 0;
            }
        }

        // Bepalen definitieve energiebehoefte

        var energyNeeded = +objWindmill.amountAutomated * +objWindmillController.energy;

        //start loop
        var grindLoop = setInterval(
            function () {
                var energyNeeded = +objWindmill.amountAutomated * +objWindmillController.energy;
                if (objGrainSilo.use((+objWindmill.tempAmountAuto / 10)) != (+objWindmill.tempAmountAuto / 10)) {
                    objWindmill.autoGrindTimer = 10;
                    objWindmill.running = 0;
                    objWindmill.tempAmountAuto = 0;
                    objWindmill.autoGrindTimerCountdown();
                    clearInterval(grindLoop);
                    return 0;
                };

                if (objEnergy.use((energyNeeded / 10), "Windmolencontrollers") != (energyNeeded / 10)) {
                    objWindmill.autoGrindTimer = 10;
                    objWindmill.running = 0;
                    objWindmill.tempAmountAuto = 0;
                    objWindmill.autoGrindTimerCountdown();
                    clearInterval(grindLoop);
                    return 0;
                }
                objGrainSilo.show();
                +objWindmill.autoGrindTimer--;
                objFlourSilo.fill((+objWindmill.tempAmountAuto / 10));
                objWindmill.autoGrindTimerCountdown();
                if (objWindmill.autoGrindTimer < 1) {
                    objWindmill.autoGrindTimer = 10;
                    objWindmill.running = 0;
                    objWindmill.tempAmountAuto = 0;
                    clearInterval(grindLoop);
                }
            }, 1000)
    },
    grindTimerCountdown: function () {
        document.getElementById("GrindTimer").innerHTML = "De molen is klaar over: " + objWindmill.grindTimer + " Ticks";
    },
    autoGrindTimerCountdown: function () {
        document.getElementById("AutoGrindTimer").innerHTML = "De geautomatiseerde molens zijn klaar over: " + objWindmill.autoGrindTimer + " Ticks";
    },
    show: function () {
        document.getElementById("WindmillCost").innerHTML = "<p>Een windmolen kost: " + FixMoney(objWindmill.cost) + "  en kan " + FixNumber(objWindmill.cap) + "kg per run vermalen</p>";
        document.getElementById("Windmills").innerHTML = "<p>Hoeveelheid windmolens: " + FixNumber(objWindmill.amount) + "</p>";
        document.getElementById("WindmillCap").innerHTML = "<p>Maalcapaciteit per run: " + FixNumber((+objWindmill.amount * +objWindmill.cap)) + "kg</p>";

    },
    init: function () {
        objWindmill.amount = localStorage.getItem('WindmillAmount') || 1;
        objWindmill.amountAutomated = localStorage.getItem('WindmillAutomated') || 0;
        if (objWindmillController.amount >= 1) {
            objWindmill.autogrind();
        }
        objWindmill.show();
    }
}

// Windmill controller object

var objWindmillController = {
    amount: 0,
    price: 10000,
    energy: 80,
    cap: 1,
    add: function () {
        if (+objMoney.amount > +objWindmillController.price) {
            objMoney.use(objWindmillController.price);
            objWindmillController.amount++;
            objWindmill.amountAutomated = +objWindmillController.amount * +objWindmillController.cap;
            localStorage.setItem('WindmillAutomated', objWindmill.amountAutomated);
            localStorage.setItem('WindmillControllerAmount', objWindmillController.amount);
            objWindmillController.show();
            if (objWindmillController.amount == 1 && objWindmill.running == 0) {
                objWindmill.autoGrindTimer = 10;
                objWindmill.autogrind();
            }
        }
    },
    sell: function () {
        if (+objWindmillController.amount > 0) {
            objWindmillController.amount--;
            var SellWMCProfit = +objWindmillController.price * 0.75;
            objMoney.add(SellWMCProfit, "Verkoop windmolencontroller", 3, 1);
            objWindmill.amountAutomated = +objWindmillController.amount * +objWindmillController.cap;
            localStorage.setItem('WindmillAutomated', objWindmill.amountAutomated);
            localStorage.setItem('WindmillControllerAmount', objWindmillController.amount);
            objWindmillController.show()
        } else {
            notificationOverlay("Geen windmolencontrollers om te verkopen", "Windmolencontrollers", "fa-info");
        }
    },
    show: function () {
        document.getElementById("WindmillControllerInfo").innerHTML = "<p>Een windmolencontroller kan " + FixNumber(objWindmillController.cap) + " windmolen(s) aansturen. </p><p>Er zijn op dit moment " +
            FixNumber(objWindmillController.amount) + " controllers actief die samen een energieverbruik hebben van: " + FixNumber((+objWindmillController.amount * +objWindmillController.energy) / 10) + " units per tick";
        document.getElementById("WindmillControllerCost").innerHTML = "Een windmolencontroller kost: " + FixMoney(objWindmillController.price);
        document.getElementById("SellWindmillController").innerHTML = "<p>Verkoop een controller voor: " + FixMoney((+objWindmillController.price * 0.75)) + "</p>";
    },
    init: function () {
        objWindmillController.amount = localStorage.getItem('WindmillControllerAmount') || 0;
        objWindmillController.show();
    }
};

// Grain object
var objGrain = {
    amount: 0,
    price: 10,
    priceCalc: function () {
        if (objPlayerInfo.level > 3) {
            objGrain.price = Math.round((Math.floor(Math.random() * 250)) * 100) / 100;
            objFlour.price = Math.round((+objGrain.price * 3.5) * 100) / 100;
        } else {
            objGrain.price = Math.round((Math.floor(Math.random() * 500)) * 100) / 100;
            objFlour.price = Math.round((+objGrain.price * 1.5) * 100) / 100;
        }

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
    }
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
    localStorage.clear();
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
            localStorage.setItem('Factory', objOilPump.amount);
            objOilPump.show();
            objEnergy.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Oliepompen", "fa-euro-sign");
        }
    },
    remove: function (amount) {
        if (objOilPump.amount > 0) {
            objOilPump.amount = +objOilPump.amount - +amount;
            localStorage.setItem('Factory', objOilPump.amount);
            objMoney.add((objOilPump.price * 0.75),"Verkoop oliepomp", 99, +amount);
            objOilPump.price = Math.round((+objOilPump.price / 1.1) * 100) / 100;
            localStorage.setItem('FactoryCost', objOilPump.price);
            objOilPump.show();
        }
    },
    priceCalc: function () {
        objOilPump.price = +objOilPump.price * 1.1;
        objOilPump.price = Math.round(objOilPump.price * 100) / 100;
        localStorage.setItem('FactoryCost', objOilPump.price);
    },
    show: function () {
        if (+objOilPump.amount == 0) {
            document.getElementById("sellOilPump").disabled = true;
        } else {
            document.getElementById("sellOilPump").disabled = false;
        };

        document.getElementById("FactoryCount").innerHTML = "<p>Aantal pompen: " + FixNumber(objOilPump.amount) + "</p>";
        document.getElementById("FactoryCost").innerHTML = "<p>Kosten van een pomp: " + FixMoney(objOilPump.price) + "</p>";
        objOilPumpAdv.show();
        localStorage.setItem('FactoryCost', objOilPump.price);
    },
    init: function () {
        objOilPump.amount = localStorage.getItem('Factory') || 0;
        objOilPump.price = localStorage.getItem('FactoryCost') || 10;
        objOilPump.show();
    }
};

// negatief olieverbruik zorgt nu toch voor weergave enegrieopbrengst (fictief)
var objEnergy = {
    available: 0,
    capacitors: 10,
    storageCap: 100,
    capaCost: 5000,
    addCapa: function (amount) {
        if (+objMoney.amount >= (+objEnergy.capaCost * +amount)) {
            objMoney.use((+objEnergy.capaCost * +amount));
            objEnergy.capacitors = +objEnergy.capacitors + +amount;
            localStorage.setItem('Capacitors', objEnergy.capacitors);
            objOilPump.show();
            objEnergy.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Energieopslag", "fa-euro-sign");
        }
    },
    use: function (requestedAmount, reason) {
        if (+requestedAmount <= +objEnergy.available) {
            objEnergy.available = +objEnergy.available - +requestedAmount;
            localStorage.setItem('EnergyAvailable', +objEnergy.available);
            objEnergy.show();
            return +requestedAmount;
        } else {
            objEnergy.available = +objEnergy.available - +objEnergy.available;
            objEnergy.show();
            return +objEnergy.available;
        }
        localStorage.setItem('EnergyAvailable', +objEnergy.available);
    },
    produce: function () {
        // Nuclear
        if (+objNuclearPowerPlant.reactors > 0) {
            var capLeft = (+objEnergy.storageCap * +objEnergy.capacitors) - +objEnergy.available;
            var nucProduction = +objNuclearPowerPlant.produce();

            if (+capLeft < +nucProduction) {
                objEnergy.available = +objEnergy.available + +capLeft;
            } else {
                objEnergy.available = +objEnergy.available + nucProduction;
            };

            var capLeft = (+objEnergy.storageCap * +objEnergy.capacitors) - +objEnergy.available;

            if (capLeft == 0) {
                return 0;
            }
        }

        // Olie
        var producedAmount = +objPowerPlant.amount * 10;
        var capLeft = (+objEnergy.storageCap * +objEnergy.capacitors) - +objEnergy.available;
        if (+producedAmount > +capLeft) {
            var activePlants = Math.ceil(+capLeft / 10);
            objOilTank.use(+activePlants);
            objEnergy.available = +objEnergy.available + +capLeft;
            localStorage.setItem('EnergyAvailable', +objEnergy.available);
            objEnergy.show();
        } else {
            objEnergy.available = +objEnergy.available + +producedAmount;
            objOilTank.use(+objPowerPlant.amount);
            localStorage.setItem('EnergyAvailable', +objEnergy.available);
            objEnergy.show();
        }
        // Steenkool
        var capLeft = (+objEnergy.storageCap * +objEnergy.capacitors) - +objEnergy.available;
        var activePlants = Math.ceil(+capLeft / +objCoalPowerPlant.yield);

        if (+activePlants > +objCoalPowerPlant.amount) {
            activePlants = +objCoalPowerPlant.amount;
        }

        var coalUsage = +activePlants * +objCoalPowerPlant.CoalUsageTons;
        if (+coalUsage > +objCoal.amount) {
            var activePlants = Math.ceil(+objCoal.amount / +objCoalPowerPlant.CoalUsageTons);
            coalUsage = +activePlants * +objCoalPowerPlant.CoalUsageTons;
        }

        if (+actualUsed == 0) {
            return 0;
        }

        var actualUsed = objCoal.use(+coalUsage);

        var activePlants = Math.ceil(+actualUsed / +objCoalPowerPlant.CoalUsageTons);
        if (+activePlants == 0) {
            return 0;
        }

        var producedAmount = +activePlants * +objCoalPowerPlant.yield;
        if ((+objEnergy.available + +producedAmount) > ((+objEnergy.storageCap * +objEnergy.capacitors))) {
            objEnergy.available = +objEnergy.storageCap * +objEnergy.capacitors;
        } else {
            objEnergy.available = +objEnergy.available + +producedAmount;
        }

        localStorage.setItem('EnergyAvailable', +objEnergy.available);
        objEnergy.show();

    },
    show: function () {
        document.getElementById("EnergieOpslag").innerHTML = "<p>Op dit moment is er maximaal " + FixNumber((+objEnergy.capacitors * +objEnergy.storageCap)) + " units opslag beschikbaar</p>" +
            "<p>Iedere unit kan " + FixNumber(objEnergy.storageCap) + " energie opslaan en kost: " + FixMoney(objEnergy.capaCost) + "</p>";
        document.getElementById("EnergyStats").innerHTML = "Energie: <kbd2>" + FixNumber(objEnergy.available) + "/" + FixNumber((objEnergy.capacitors * objEnergy.storageCap)) + "</kbd2>";
        document.getElementById("TotalEnergyProduction").innerHTML = "<p>De huidige energieproductie: " + FixNumber(((+objPowerPlant.amount * +objPowerPlant.yield) +
            (+objCoalPowerPlant.amount * + objCoalPowerPlant.yield) +
            (+objNuclearPowerPlant.reactors * +objNuclearPowerPlant.reactorProduction))) + "</p>";
        document.getElementById("OilUsage").innerHTML = "<p>Olieverbruik: " + FixNumber((objPowerPlant.amount) +
            (+objPlasticFactory.activeFactories * +objPlasticFactory.oilNeededProduction)) + "</p>";
        document.getElementById("CurrentEnergyUsage").innerHTML = "<p>De huidige piekenergievraag: " +
            FixNumber((+objOilPump.amount + (+objFarmRobot.activeRobots * +objFarmRobot.robotEnergy) +
                ((+objWindmillController.amount * +objWindmillController.energy) / 10) +
                ((+objMines.coalAmountActive * +objCoalMine.energy)) +
                ((+objMines.uraniumAmountActive * +objUraniumMine.energy)) +
                ((+objOilPumpAdv.amount * +objOilPumpAdv.energy)) +
                (+objMines.ironAmountActive * +objIronMine.energy))) + "</p>";
    },
    init: function () {
        objEnergy.available = localStorage.getItem('EnergyAvailable') || 0;
        objEnergy.capacitors = localStorage.getItem('Capacitors') || 10;
        objEnergy.show();
    }
}

// Kippen
var objChicken = {
    amount: 0,
    lifetime: 10,
    eggProduction: 0.4,
    cost: 10,
    foodIntake: 0.15,
    eat: function () {
        var asked = (+objChicken.amount * +objChicken.foodIntake);
        var gotten = objChickenFarm.grain(+asked, "Out");
        if (asked != gotten) {
            if (+objGrainSilo.contents > (+asked - +gotten)) {
                var restGotten = objGrainSilo.use((+asked - +gotten));
                var gotten = +gotten + +restGotten;
            }
            objChicken.amount = Math.round((+gotten / +objChicken.foodIntake));
            localStorage.setItem('Chickens', objChicken.amount);
        };
        objChickenFarm.show();
    },
    makeEggs: function () {
        objChicken.eat();
        var aantalEieren = (+objChicken.amount * +objChicken.eggProduction);
        objEgg.add(AfrondenGewicht(aantalEieren));
        objChicken.show();
    },
    add: function (aantal) {
        aantal = parseInt(aantal);
        if (+objMoney.amount >= (+aantal * +objChicken.cost) && (+objChickenFarm.amount * +objChickenFarm.cap) >= (+objChicken.amount + +aantal)) {
            objMoney.use(+aantal * +objChicken.cost);
            objChicken.amount = +objChicken.amount + +aantal;
            localStorage.setItem('Chickens', objChicken.amount);
            objChicken.show();
            objChickenFarm.show();
        } else {
            if (+objMoney.amount <= (+aantal * +objChicken.cost)) {
                notificationOverlay("Niet genoeg doekoe!", "Kippenboerderij", "fa-euro-sign");
            } else {
                notificationOverlay("Er is geen plek meer in de kippenboerderij", "Kippenboerderij", "fa-info");
            }
        }
    },
    show: function () {
        document.getElementById("Chickens").innerHTML = "<p>Je hebt op dit moment " + FixNumber(objChicken.amount) + " kippen rondlopen. Deze kippen leggen: " +
            FixNumber((+objChicken.eggProduction * +objChicken.amount)) + " eieren per 5 ticks. In deze periode eten ze " + FixNumber((+objChicken.foodIntake * +objChicken.amount)) +
            "kg graan</p><p>Een kip kost: " + FixMoney(objChicken.cost) + "</p> <h3>Koop kippen</h3>";
    },
    init: function () {
        objChicken.amount = Math.round(localStorage.getItem("Chickens")) || 0;
        objChicken.show();
    }
}

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
                return +beschikbaar;
            };

            objChickenFarm.grainReserve = +objChickenFarm.grainReserve - +amount;
            return +amount;
        };
        localStorage.setItem('GrainReserve', objChickenFarm.grainReserve);
        objChickenFarm.show();
        objChicken.show();
    },
    add: function () {
        if (+objMoney.amount >= +objChickenFarm.cost) {
            objMoney.use(objChickenFarm.cost);
            objChickenFarm.amount++;
            localStorage.setItem('ChickenFarms', objChickenFarm.amount);
            objChickenFarm.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Kippenboerderij", "fa-euro-sign");
        }
    },
    show: function () {
        document.getElementById("ChickenFarm").innerHTML = "<p>Je hebt op dit moment " + objChickenFarm.amount + " kippenboerderijen met nog plek voor " +
            ((+objChickenFarm.amount * +objChickenFarm.cap) - +objChicken.amount) + " kippen. Een extra kippenboerderij kost: " + FixMoney(objChickenFarm.cost) + "</p><p>" +
            "Er is opslag voor " + FixNumber((+objEgg.storageCap * +objEgg.storageUnits)) + " eieren. Extra opslag bied plaats voor " + FixNumber(objEgg.storageCap) +
            " eieren en kost: " + FixMoney(objEgg.storageUnitCost) + "</p><p>Iedere farm heeft opslag voor " + FixNumber(objChickenFarm.grainSiloCap) + "kg voer. Er is nog " +
            FixNumber(objChickenFarm.grainReserve) + "kg voer voor de kippen beschikbaar";
    },
    init: function () {
        objChickenFarm.grainReserve = localStorage.getItem('GrainReserve') || 0;
        objChickenFarm.amount = localStorage.getItem('ChickenFarms') || 0;
        objChickenFarm.show();
    }
}

// Eieren
var objEgg = {
    amount: 0,
    storageUnits: 1,
    storageCap: 100000,
    storageUnitCost: 500000,
    price: 0.1,
    add: function (aantal) {
        aantal = parseInt(aantal);
        var eieren = parseInt(objEgg.amount);
        var opslag = parseInt((+objEgg.storageUnits * +objEgg.storageCap));
        var SpaceLeft = parseInt((opslag - eieren));
        if (+aantal > +SpaceLeft) {
            objEgg.amount = +eieren + +SpaceLeft;
            var Rest = +aantal - +SpaceLeft;
            objEgg.sell(Rest, "Overschot Eieren");
        } else {
            objEgg.amount = +eieren + +aantal
        };
        localStorage.setItem('eggs', objEgg.amount);
        objEgg.show();
    },
    use: function (amountEggs) {
        if (+amountEggs > +objEgg.amount) {
            amountEggs = +objEgg.amount;
        }
        objEgg.amount = +objEgg.amount - +amountEggs
        localStorage.setItem('eggs', objEgg.amount)
        objEgg.show();
        return +amountEggs;
    },
    sell: function (aantal, reden) {
        if (isNaN(aantal)) {
            aantal = +objEgg.amount;
            reden = "Reguliere verkoop eieren";
            objEgg.amount = +objEgg.amount - +aantal
            localStorage.setItem('eggs', objEgg.amount);
            objEgg.show();
        };
        var Profit = +aantal * +objEgg.price;
        objMoney.add(+Profit, reden, 6, aantal);
    },
    addStorageUnit: function () {
        if (+objMoney.amount >= +objEgg.storageUnitCost) {
            objMoney.use(objEgg.storageUnitCost);
            objEgg.storageUnits++;
            localStorage.setItem('EggStorage', objEgg.storageUnits);
            objEgg.show();
            objChickenFarm.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Eieropslag", "fa-euro-sign");
        }
    },
    visual: function () {
        var percentageFilled = (+objEgg.amount / (+objEgg.storageUnits * +objEgg.storageCap)) * 100;
        percentageFilled = Math.round(percentageFilled * 100) / 100;
        document.getElementById("eggStock").innerHTML = '<p>Eieren:</p><div class="progress"><div class="progress-bar" style="width:' + percentageFilled + '%">' + FixNumber(objEgg.amount) + 'stk (' + percentageFilled + '%)</div></div><br>'
    },
    show: function () {
        document.getElementById("eggs").innerHTML = "<p> Je hebt op dit moment nog plek voor: " + FixNumber(((+objEgg.storageUnits * +objEgg.storageCap) - +objEgg.amount)) +
            " eieren. Eventueel overschot wordt direct verkocht voor de helft van de huidge prijs. De huidige prijs is: " + FixMoney(+objEgg.price) + "</p>";
        objEgg.visual();
    },
    init: function () {
        objEgg.amount = localStorage.getItem('eggs') || 0;
        objEgg.storageUnits = localStorage.getItem('EggStorage') || 1;
        objEgg.show();
        objChickenFarm.show();
    }
}



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
            localStorage.setItem('PastaFactoryAmount', objPastaFactory.amount);
            objPastaFactory.show();
            objEnergy.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Pastafabriek", "fa-euro-sign");
        }
    },
    sell: function () {
        if (+objPastaFactory.amount > 0) {
            objMoney.add((objPastaFactory.cost * 0.75), "Verkoop pastafabriek", 7, 1);
            objPastaFactory.amount--;
            localStorage.setItem('PastaFactoryAmount', objPastaFactory.amount);
            objPastaFactory.show();
            objEnergy.show();
        } else {
            notificationOverlay("Geen fabrieken om te verkopen", "Pastafabrieken", "fa-info");
        }
    },
    produce: function (typeAction) {

        function errorMessagebox(inputText) {
            if (typeAction == 'manual') {
                notificationOverlay(inputText, "Pastafabriek", "fa-exclamation-triangle");
            }
            return 0;
        }

        if (typeAction == 'manual') {

            usableFactories = (+objPastaFactory.amount - +objPastaFactory.amountAutomated);
        } else {
            if (+objPastaFactory.amountAutomated <= +objPastaFactory.amount) {
                usableFactories = +objPastaFactory.amountAutomated;
            } else {
                usableFactories = +objPastaFactory.amount;
            }
        }
        // aantal actieve fabrieken op basis van energie
        if (+objEnergy.available < (+usableFactories * +objPastaFactory.energy)) {
            objPastaFactory.activeFactories = Math.floor(+objEnergy.available / +objPastaFactory.energy);
            if (objPastaFactory.activeFactories == 0) {
                errorMessagebox("Niet genoeg energie!")
                return 0;
            }
        } else {
            objPastaFactory.activeFactories = +usableFactories;
            if (+objPastaFactory.activeFactories == 0) {

                if (objPastaFactory.amountAutomated > 0) {
                    errorMessagebox("Alle pastafabrieken worden bestuurd door pastahelpers");
                } else {
                    errorMessagebox("Geen pastafabrieken actief");
                }
            }
        }

        var maxPastaFlour = +objFlourSilo.contents / +objPasta.recipe;
        var maxPastaEggs = +objEgg.amount / +objPasta.recipeEggs;

        if (maxPastaFlour < maxPastaEggs) {
            if ((+objPastaFactory.activeFactories * +objPastaFactory.cap) > +objFlourSilo.contents) {
                var InputAmount = +objFlourSilo.contents;
            }
            else {
                var InputAmount = +objPastaFactory.activeFactories * +objPastaFactory.cap;
            };
            var pasta = Math.floor(+InputAmount / +objPasta.recipe);
            if (pasta == 0) {
                errorMessagebox("Niet genoeg bloem!")
                return 0;
            }
            var flourUsed = +pasta * +objPasta.recipe;
            var eggsNeeded = +pasta * +objPasta.recipeEggs;
        } else {
            if (((+objPastaFactory.activeFactories * +objPastaFactory.cap) * 10) > (+objEgg.amount)) {
                var InputAmount = (+objEgg.amount);
            }
            else {
                var InputAmount = (+objPastaFactory.activeFactories * +objPastaFactory.cap) * 10;
            };
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
            objEnergy.use((+objPastaFactory.activeFactories * +objPastaFactory.energy), "Pastafabriek");
            objFlourSilo.use(flourUsed);
            objEgg.use(eggsNeeded);
            if (typeAction == 'automated') {
                pasta = +pasta * (1 - +objPastaHelper.cut);
            }
            objStorehouse.addPasta(pasta);
        }
    },
    show: function () {
        document.getElementById("PastaFactory").innerHTML =
            "<p>Aantal pastafabrieken: " + FixNumber(objPastaFactory.amount) + "<br>" +
            "Een pastafabriek kost: " + FixMoney(objPastaFactory.cost) + "<br>" +
            "Een pastafabriek kan verkocht worden voor: " + FixMoney((objPastaFactory.cost * 0.75)) + "<br>";

        var flour = objPastaFactory.amount * objPastaFactory.cap;
        var eggs = flour * (objPasta.recipeEggs / objPasta.recipe);
        document.getElementById("PastaInstruction").innerHTML = "<p>Op dit moment kunnen we per run " + FixNumber(flour) + "kg bloem en " + FixNumber(eggs) +
            " eieren verwerken tot pasta. Iedere run verbruikt " + FixNumber((objPastaFactory.amount * objPastaFactory.energy)) + " energie. Dit levert " + FixNumber(Math.floor(flour / objPasta.recipe)) + " dozen pasta op.</p>Recept: " +
            FixNumber(objPasta.recipe) + "kg bloem gemixt met " + FixNumber(objPasta.recipeEggs) + " eieren levert één doos pasta op.</p>"

    },
    init: function () {
        objPastaFactory.amount = localStorage.getItem('PastaFactoryAmount') || 0;
        objPastaFactory.amountAutomated = localStorage.getItem('PastaFactoryAmountAutomated') || 0;
        objPastaFactory.cost = localStorage.getItem('PastaFactoryCost') || 50000;
        objPastaFactory.cap = localStorage.getItem('PastaFactoryCap') || 2000;
        objPastaFactory.show();
    }
};

// Pasta
var objPasta = {
    price: function () {
        var PastaTempPrice = ((+objFlour.price * 5) / 10);
        return PastaTempPrice;
    },
    recipe: 10,
    recipeEggs: 100,
    sell: function () {
        var amount = +objStorehouse.pasta;
        var ProfitPasta = +objStorehouse.pasta * +objPasta.price();
        var text = "Regulier verkoop pasta";
        objMoney.add(ProfitPasta, text, 8, amount);
        objStorehouse.removePasta(+objStorehouse.pasta);
    },
    show: function () {
        document.getElementById("SellPasta").innerHTML = "<p>Verkoop de pasta voor " + FixMoney(objPasta.price()) + " per doos";
    },
    init: function () {
        objPasta.show();
    }
};

// Pasta helper

var objPastaHelper = {
    amount: 0,
    cost: 1000000,
    cut: 0.05,
    add: function (actionType) {
        if (actionType == 1) {
            if (+objMoney.amount >= +objPastaHelper.cost) {
                objMoney.use(objPastaHelper.cost);
                objPastaHelper.amount++;
                localStorage.setItem('pastaHelper', objPastaHelper.amount);
                objPastaFactory.amountAutomated++;
                localStorage.setItem('PastaFactoryAmountAutomated', objPastaFactory.amountAutomated);
                objPastaHelper.show();
                return 0;
            } else {
                notificationOverlay("Niet genoeg doekoe!", "Pastahelper", "fa-euro-sign");
                return 0;
            }
        } else if (+objPastaHelper.amount > 0) {
            objPastaHelper.amount--;
            localStorage.setItem('pastaHelper', objPastaHelper.amount);
            objPastaFactory.amountAutomated--;
            localStorage.setItem('PastaFactoryAmountAutomated', objPastaFactory.amountAutomated);
            objPastaHelper.show();
            return 0;
        } else {
            notificationOverlay("Er is iemand om te ontslaan!", "Ontslag pastahelper", "fa-address-card");
            return 0;
        }

    },
    action: function () {
        if (objPastaHelper.amount > 0) {
            objPastaFactory.produce('automated');
        } else {
            return 0;
        }
    },
    show: function () {
        if (objPlayerInfo.level > 8) {
            document.getElementById('pastaHelperDiv').innerHTML = "<p>Je kan iemand in dienst nemen om een pastafabriek voor je te bedienen. Hij/Zij drukt iedere 15 ticks op de knop om pasta voor je te maken.</p>" +
                "<p>Iedere pastahelper pakt 5% van de pasta mee naar huis om zijn familie te laten eten. Het aannemen van een pastahelper kost je: " + FixMoney(objPastaHelper.cost) + ", " +
                "je kan hem ook weer ontslaan, je krijgt hier geen geld voor terug! Iedere pastahelper kan 1 fabriek aansturen</p>" +
                "<p>Je hebt op dit moment " + FixNumber(objPastaHelper.amount) + " pastahelper(s) in dienst</p>" +
                "<button type='button' class='btn btn-primary' onClick='objPastaHelper.add(1);' id='addPastaHelper'>Neem een pastahelper aan!</button> " +
                "<button type='button' class='btn btn-outline-danger' onClick='objPastaHelper.add(0);' id='addPastaHelper'>Ontsla een pastahelper!</button> ";
        }
    },
    init: function () {
        objPastaHelper.amount = localStorage.getItem('pastaHelper') || 0;
        objPastaHelper.show();
    }
}

// Storehouse
var objStorehouse = {
    amount: 1,
    cap: 1000000,
    pasta: 0,
    addPasta: function (pasta) {
        objStorehouse.pasta = +objStorehouse.pasta + +pasta;
        objStorehouse.show();
        localStorage.setItem('Pasta', objStorehouse.pasta)
    },
    removePasta: function (pasta) {
        if ((+objStorehouse.pasta - +pasta) > 0) {
            objStorehouse.pasta = +objStorehouse.pasta - +pasta;
            objStorehouse.show();
            localStorage.setItem('Pasta', objStorehouse.pasta)
            return objStorehouse.pasta;
        } else{
            var tempUsed = +objStorehouse.pasta;
            objStorehouse.pasta = +objStorehouse.pasta - +objStorehouse.pasta;
            return tempUsed;
        }

    },
    show: function () {
        document.getElementById("StorehousePasta").innerHTML = "<p>Aantal dozen pasta op voorraad: " + FixNumber(objStorehouse.pasta) + "</p>";
    },
    init: function () {
        objStorehouse.amount = localStorage.getItem('Storehouses') || 0;
        objStorehouse.pasta = localStorage.getItem('Pasta') || 0;
        objStorehouse.show();
    }
}


// Functies ten behoeve van Productie knoppen
function StartGrainResearch(Researchtimer, ResearchCost, ResearchProfit) {
    document.getElementById("GRButton").style.display = "none";
    objMoney.use(ResearchCost);
    var ResearchLoop = setInterval(
        function () {

            Researchtimer--;
            localStorage.setItem('GrainResearchTimerCount', +Researchtimer);
            document.getElementById("GrainResearchTimer").innerHTML = "<p>Het onderzoek is klaar over: " + (Researchtimer) + " Ticks</p>";
            if (Researchtimer < 1) {
                clearInterval(ResearchLoop);
                objFarmland.harvest = Math.round((+objFarmland.harvest * (1 + (+ResearchProfit / 100))) * 100) / 100;
                objFarmland.GrainResearchDuration = Math.round(+objFarmland.GrainResearchDuration * 1.1);
                objFarmland.GrainResearchCostVar = Math.round(+objFarmland.GrainResearchCostVar * 1.1);
                objFarmland.GrainResearchProfit = Math.round((+objFarmland.GrainResearchProfit * 0.99) * 100) / 100;
                objFarmland.GrainResearchLevel++;
                localStorage.setItem('GrainResearchLevel', +objFarmland.GrainResearchLevel);
                localStorage.setItem('GrainResearchProfit', +objFarmland.GrainResearchProfit);
                localStorage.setItem('GrainResearchCostVar', +objFarmland.GrainResearchCostVar);
                localStorage.setItem('GrainResearchDuration', +objFarmland.GrainResearchDuration);
                objFarmland.showResearch();
                objFarmRobot.show();
                objFarmland.showPrice();
                document.getElementById("GrainResearchTimer").innerHTML = "";
                //button enable
                document.getElementById("GRButton").style.display = "";
            }
        }, 1000)
}

// Objecten voor energiecentrales
var objPowerPlant = {
    amount: 0,
    price: 100,
    yield: 10,
    add: function () {
        if (+objMoney.amount > +objPowerPlant.price) {
            objMoney.use(+objPowerPlant.price);
            objPowerPlant.amount++;
            localStorage.setItem('PowerPlants', objPowerPlant.amount);
            objPowerPlant.priceCalc();
            objPowerPlant.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Energiecentrale", "fa-euro-sign");
        }
    },
    sell: function () {
        if (+objPowerPlant.amount > 0) {
            objPowerPlant.price = (+objPowerPlant.price / 110) * 100;
            objPowerPlant.price = Math.round(+objPowerPlant.price * 100) / 100;
            objPowerPlant.amount--;
            objMoney.add((objPowerPlant.price * 0.75), "Energie centrale verkocht", 9, 1);
            localStorage.setItem('PowerPlants', objPowerPlant.amount);
            localStorage.setItem('PowerPlantPrice', objPowerPlant.price);
            objPowerPlant.show();
        } else {
            notificationOverlay("Geen energiecentrales om te verkopen", "Energiecentrale", "fa-info");
        };
    },
    priceCalc: function () {
        objPowerPlant.price = +objPowerPlant.price * 1.1;
        objPowerPlant.price = Math.round(+objPowerPlant.price * 100) / 100;
        localStorage.setItem('PowerPlantPrice', objPowerPlant.price);
        objPowerPlant.show();
    },
    show: function () {
        document.getElementById("PowerPlantAmount").innerHTML = "<p>Op dit moment zijn er " + FixNumber(objPowerPlant.amount) + " energiecentrales.";
        document.getElementById("PowerPlantPrice").innerHTML = "<p>Kosten eenvoudige energiecentrale: " + FixMoney(objPowerPlant.price) + "</p>";
        document.getElementById("SellPowerPlant").innerHTML = "<p>Je kan een energiecentrale verkopen voor 75% van de prijs van de vorige centrale (" + FixMoney(((+objPowerPlant.price / 110) * 100) * 0.75) + ")</p>"
        objEnergy.show();
    },
    init: function () {
        objPowerPlant.price = localStorage.getItem("PowerPlantPrice") || 100;
        objPowerPlant.amount = localStorage.getItem("PowerPlants") || 0;
        objPowerPlant.show();
    }
}

var objCoalPowerPlant = {
    amount: 0,
    price: 50000000,
    yield: 750,
    CoalUsageTons: 1000,
    add: function () {
        if (+objMoney.amount > +objCoalPowerPlant.price) {
            objMoney.use(+objCoalPowerPlant.price);
            objCoalPowerPlant.amount++;
            localStorage.setItem('CoalPowerPlants', objCoalPowerPlant.amount);
            objCoalPowerPlant.priceCalc();
            objCoalPowerPlant.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Steenkool energiecentrale", "fa-euro-sign");
        }
    },
    sell: function () {
        if (+objCoalPowerPlant.amount > 0) {
            objCoalPowerPlant.price = (+objCoalPowerPlant.price / 105) * 100;
            objCoalPowerPlant.price = Math.round(+objCoalPowerPlant.price * 100) / 100;
            objCoalPowerPlant.amount--;
            objMoney.add((objCoalPowerPlant.price * 0.75), "Energie centrale verkocht", 10, 1);
            localStorage.setItem('CoalPowerPlants', objCoalPowerPlant.amount);
            objCoalPowerPlant.show();
        } else {
            notificationOverlay("Geen centrales om te verkopen", "Steenkool energiecentrale", "fa-info");
        };
    },
    priceCalc: function () {
        objCoalPowerPlant.price = +objCoalPowerPlant.price * 1.05;
        objCoalPowerPlant.price = Math.round(+objCoalPowerPlant.price * 100) / 100;
        localStorage.setItem('CoalPowerPlantPrice', objCoalPowerPlant.price);
        objCoalPowerPlant.show();
    },

    show: function () {
        if (objMines.coalAmountActive >= 1) {
            document.getElementById("CoalPowerPlantAmount").innerHTML = "<h2>Energie (steenkool):</h2><p>Op dit moment zijn er " + FixNumber(objCoalPowerPlant.amount) + " energiecentrales.</p>";
            document.getElementById("CoalPowerPlantPrice").innerHTML = "<p>Kosten steenkool energiecentrale: " + FixMoney(objCoalPowerPlant.price) + "</p>  <p>Deze centrale gebruikt " + FixNumber(objCoalPowerPlant.CoalUsageTons) +
                " ton steenkool per tick en levert daarvoor " + FixNumber(objCoalPowerPlant.yield) + " eenheden energie</p>";
            document.getElementById("CoalSellPowerPlant").innerHTML = "<p>Je kan een steenkool energiecentrale verkopen voor 75% van de prijs van de vorige centrale (" + FixMoney(((+objCoalPowerPlant.price / 110) * 100) * 0.75) + ")</p>" +
                "<p>Bouw (of verkoop) een steenkoolenergiecentrale:</p>" +
                "<button type='button' class='btn btn-primary' onClick='objCoalPowerPlant.add();' id='pushOne'>Bouw!</button>" +
                " <button type='button' class='btn btn-warning' onClick='objCoalPowerPlant.sell();' id='CoalpowerPlantSell'>Verkoop!</button>";
            objEnergy.show();
            objCoal.show();
        }
    },
    init: function () {
        if (localStorage.getItem("CoalPowerPlantPrice") < 50000000) {
            localStorage.setItem('CoalPowerPlantPrice', 50000000);
        }
        objCoalPowerPlant.price = localStorage.getItem("CoalPowerPlantPrice") || 50000000;
        objCoalPowerPlant.amount = localStorage.getItem("CoalPowerPlants") || 0;
        objCoalPowerPlant.show();
    }
}

// Automatiseren verkoop
var objSalesComputer = {
    amount: 0,
    cpu: 0,
    cpuCost: 400000,
    oilValue: 19,
    flourValue: 749,
    pastaValue: 450,
    kunstsofValue: 246,
    autoSellOil: false,
    autoSellFlour: false,
    autoSellPasta: false,
    autoSellKunststof: false,
    add: function () {
        if (+objMoney.amount > +objSalesComputer.cpuCost) {
            objMoney.use(+objSalesComputer.cpuCost);
            objSalesComputer.cpu++;
            objSalesComputer.cpuCost *= 1;
            objSalesComputer.cpuCost = Math.round(objSalesComputer.cpuCost * 100) / 100;
            localStorage.setItem('scCPU', objSalesComputer.cpu);
            objSalesComputer.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Sales Computer", "fa-euro-sign");
        }
    },
    remove: function () {
        if (+objSalesComputer.cpu > 0) {
            objMoney.add((+objSalesComputer.cpuCost * 0.75), "Verkoop CPU", 11, 1);
            objSalesComputer.cpu--;
            localStorage.setItem('scCPU', objSalesComputer.cpu);
            objSalesComputer.show();
        } else {
            notificationOverlay("Geen CPUs om te verkopen", "Salescomputer", "fa-info");
        }
    },
    show: function () {
        if (objSalesComputer.cpu == 1) {
            var cpus = " CPU ";
        } else {
            var cpus = " CPU's ";
        };
        if (objSalesComputer.cpu <= 3) {
            document.getElementById("autoSellIntro").innerHTML = "<p>Je salescomputer heeft CPU's nodig om te werken. Voor iedere CPU komt het volgende item beschikbaar. Je hebt op dit moment " +
                + objSalesComputer.cpu + cpus + ". Koop een extra CPU voor: " + FixMoney(objSalesComputer.cpuCost) + ". Je kan een CPU ook weer verkopen voor: " + FixMoney((objSalesComputer.cpuCost * 0.75)) + "</p>";
            document.getElementById("addCPU").disabled = false;
        } else {
            document.getElementById("autoSellIntro").innerHTML = "<p>Je hebt het maximale niveau bereikt! (" + objSalesComputer.cpu + " stuks) </p>";
            document.getElementById("addCPU").disabled = true;
        };
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
        localStorage.setItem("autoOil", inputwaarde);
        objSalesComputer.oilValue = inputwaarde;
        var autoSellOilOn = " niet ";
        if (objSalesComputer.autoSellOil == true) {
            var autoSellOilOn = " ";
        }
        document.getElementById("autoSellOil").innerHTML = "<h3>Automatisch verkopen olie</h3><p>Olie wordt op dit moment" + autoSellOilOn + "automatisch verkocht als de prijs " +
            FixMoney(+inputwaarde) + " of hoger is! De huidige prijs is op dit moment: " + FixMoney(objOil.price) + "</p>";
    },
    showFlour: function (inputwaarde) {
        localStorage.setItem("autoFlour", inputwaarde);
        objSalesComputer.flourValue = inputwaarde;
        var autoSellFlourOn = " niet ";
        if (objSalesComputer.autoSellFlour == true) {
            var autoSellFlourOn = " ";
        };
        document.getElementById("autoSellFlour").innerHTML = "<h3>Automatisch verkopen bloem</h3><p>Bloem wordt op dit moment" + autoSellFlourOn + "automatisch verkocht als de prijs " +
            FixMoney(+inputwaarde) + " of hoger is! De huidige prijs is op dit moment: " + FixMoney(objFlour.price) + "</p>";
    },
    showPasta: function (inputwaarde) {
        localStorage.setItem("autoPasta", inputwaarde);
        objSalesComputer.pastaValue = inputwaarde;
        var autoSellPastaOn = " niet ";
        if (objSalesComputer.autoSellPasta == true) {
            var autoSellPastaOn = " ";
        };
        document.getElementById("autoSellPasta").innerHTML = "<h3>Automatisch verkopen pasta</h3><p>Pasta wordt op dit moment" + autoSellPastaOn + "automatisch verkocht als de prijs " +
            FixMoney(+inputwaarde) + " of hoger is! De huidige prijs is op dit moment: " + FixMoney(objPasta.price()) + "</p>";
    },
    showKunststof: function (inputwaarde) {
        localStorage.setItem("autoKunststof", inputwaarde);
        objSalesComputer.kunstsofValue = inputwaarde;
        var autoSellKunststofOn = " niet ";
        if (objSalesComputer.autoSellKunststof == true) {
            var autoSellKunststofOn = " ";
        };
        document.getElementById("autoSellKunststof").innerHTML = "<h3>Automatisch verkopen kunststof</h3><p>Kunststof wordt op dit moment" + autoSellKunststofOn + "automatisch verkocht als de prijs " +
            FixMoney(+inputwaarde) + " of hoger is! De huidige prijs is op dit moment: " + FixMoney(objPlastic.price) + "</p>";
    },
    checkOil: function (checkState) {
        localStorage.setItem("autoOilCheck", checkState);
        objSalesComputer.autoSellOil = JSON.parse(localStorage.getItem('autoOilCheck'));
        objSalesComputer.showOil(localStorage.getItem('autoOil'));
    },
    checkFlour: function (checkState) {
        localStorage.setItem("autoFlourCheck", checkState);
        objSalesComputer.autoSellFlour = JSON.parse(localStorage.getItem('autoFlourCheck'));
        objSalesComputer.showFlour(localStorage.getItem('autoFlour'));
    },
    checkPasta: function (checkState) {
        localStorage.setItem("autoPastaCheck", checkState);
        objSalesComputer.autoSellPasta = JSON.parse(localStorage.getItem('autoPastaCheck'));
        objSalesComputer.showPasta(localStorage.getItem('autoPasta'));
    },
    checkKunststof: function (checkState) {
        localStorage.setItem("autoKunststofCheck", checkState);
        objSalesComputer.autoSellKunststof = JSON.parse(localStorage.getItem('autoKunststofCheck'));
        objSalesComputer.showKunststof(localStorage.getItem('autoKunststof'));
    },
    autoSell: function () {
        if (objSalesComputer.autoSellOil == true && +objSalesComputer.cpu > 0) {
            if (+objOil.price >= +objSalesComputer.oilValue && +objOilTank.contents > (+objPowerPlant.amount * 10)) {
                var oilUsed = objOilTank.use((+objOilTank.contents - (+objPowerPlant.amount * 5)));
                objMoney.add((+oilUsed * +objOil.price), "Computerverkoop olie", 1, oilUsed);
            }
        };
        if (objSalesComputer.autoSellFlour == true && +objSalesComputer.cpu > 1) {
            if (+objFlour.price >= +objSalesComputer.flourValue) {
                var amount = +objFlourSilo.contents;
                objMoney.add(((+objFlourSilo.contents / 1000) * +objFlour.price), "Computerverkoop bloem", 5, amount);
                objFlourSilo.use(+objFlourSilo.contents);
            }
        };
        if (objSalesComputer.autoSellPasta == true && +objSalesComputer.cpu > 2) {
            var pp = objPasta.price();
            if (+pp >= +objSalesComputer.pastaValue) {
                objPasta.sell();
            }
        };
        if (objSalesComputer.autoSellKunststof == true && +objSalesComputer.cpu > 3) {
            var pp = objPlastic.price;
            if (+pp >= +objSalesComputer.kunststofValue) {
                objPlastic.sell(0);
            }
        };

    },
    init: function () {
        objSalesComputer.cpu = localStorage.getItem("scCPU") || 0;

        //olie
        objSalesComputer.oilValue = localStorage.getItem('autoOil') || 21;
        objSalesComputer.autoSellOil = JSON.parse(localStorage.getItem('autoOilCheck')) || false;
        document.getElementById("autoOilCheck").checked = objSalesComputer.autoSellOil;
        document.getElementById("SliderOil").value = +objSalesComputer.oilValue;

        //bloem
        objSalesComputer.flourValue = localStorage.getItem('autoFlour') || 876;
        objSalesComputer.autoSellFlour = JSON.parse(localStorage.getItem('autoFlourCheck')) || false;
        document.getElementById("autoFlourCheck").checked = objSalesComputer.autoSellFlour;
        document.getElementById("SliderFlour").value = +objSalesComputer.flourValue;

        //Pasta
        objSalesComputer.pastaValue = localStorage.getItem('autoPasta') || 876;
        objSalesComputer.autoSellPasta = JSON.parse(localStorage.getItem('autoPastaCheck')) || false;
        document.getElementById("autoPastaCheck").checked = objSalesComputer.autoSellPasta;
        document.getElementById("SliderPasta").value = +objSalesComputer.pastaValue;

        //Kunststof
        objSalesComputer.kunststofValue = localStorage.getItem('autoKunststof') || 876;
        objSalesComputer.autoSellKunststof = JSON.parse(localStorage.getItem('autoKunststofCheck')) || false;
        document.getElementById("autoKunststofCheck").checked = objSalesComputer.autoSellKunststof;
        document.getElementById("SliderKunststof").value = +objSalesComputer.KunststofValue;

        objSalesComputer.show();
    }
}

function showPrice() {
    document.getElementById("Oilprice").innerHTML = "<p>De huidige olieprijs: " + FixMoney(objOil.price) + "</p>";
    document.getElementById("GrainPrice").innerHTML = "<p>De huidige graanprijs: " + FixMoney(objGrain.price) + " per 1.000kg</p>";
    document.getElementById("FlourPrice").innerHTML = "<p>De huidige bloemprijs: " + FixMoney(objFlour.price) + " per 1.000kg</p>";
}


// research voor mijnbouw
var objResearch = {
    level: 1,
    cost: 5000000,
    t1: 180,
    t2: 360,
    t3: 720,
    running: 0,
    timer: 0,
    description: function () {
        switch (+objResearch.level) {
            case 1:
                return "Je leert de basiskennis over mijnbouw!";
                break;
            case 2:
                return "Je leert alles over prospecting!";
                break;
            case 3:
                return "Je leert alles over het werkelijk openen van een mijn!";
                break;
        }
    },
    doResearch: function (button) {
        if (objResearch.running != 1) {
            switch (+objResearch.level) {
                case 1:
                    objResearch.timer = +objResearch.t1;
                    break;
                case 2:
                    objResearch.timer = +objResearch.t2;
                    break;
                case 3:
                    objResearch.timer = +objResearch.t3;
                    break;
                case 4:
                    document.getElementById("MiningResearch").disabled = true;
                    return 0;
                    break;
            };

            if (+objMoney.amount < +objResearch.cost) {
                notificationOverlay("Niet genoeg doekoe!", "Mijnbouw onderzoek", "fa-euro-sign");
                return 0;
            };
            objMoney.use(+objResearch.cost);

        }
        document.getElementById("MiningResearch").disabled = true;
        objResearch.running = 1;
        localStorage.setItem('Rrunning', +objResearch.running)
        document.getElementById("ResearchTimer").style.display = "";
        var ResearchLoop = setInterval(
            function () {
                +objResearch.timer--;
                localStorage.setItem("rTimer", +objResearch.timer)
                document.getElementById("ResearchTimer").innerHTML = "<p>Het onderzoek is klaar over: " + (objResearch.timer) + " Ticks</p>";
                if (objResearch.timer < 1 && objResearch.running == 1) {
                    objResearch.level++;
                    localStorage.setItem('Rlevel', objResearch.level)
                    document.getElementById("MiningResearch").disabled = false;
                    objResearch.show();
                    objResearch.running = 0;
                    localStorage.setItem("rTimer", objResearch.timer)
                    localStorage.setItem('Rrunning', objResearch.running)
                    document.getElementById("ResearchTimer").style.display = "none";
                    clearInterval(ResearchLoop);
                }
            }, 1000)
    },
    show: function () {
        switch (+objResearch.level) {
            case 1:
                document.getElementById("ResDesc").innerHTML = "<p>De eerste fase in het onderzoek naar mijnbouw kost: " + FixMoney(objResearch.cost) +
                    " en zal " + FixNumber(objResearch.t1) + " ticks duren. " + objResearch.description() + "</p>";
                break;
            case 2:
                document.getElementById("ResDesc").innerHTML = "<p>De tweede fase in het onderzoek naar mijnbouw kost: " + FixMoney(objResearch.cost) +
                    " en zal " + FixNumber(objResearch.t2) + " ticks duren. " + objResearch.description() + "</p>";
                break;
            case 3:
                document.getElementById("ResDesc").innerHTML = "<p>De derde fase in het onderzoek naar mijnbouw kost: " + FixMoney(objResearch.cost) +
                    " en zal " + FixNumber(objResearch.t3) + " ticks duren. " + objResearch.description() + "</p>";
                break;
            case 4:
                document.getElementById("ResDesc").innerHTML = "<p>Je bent helemaal klaar voor het volgende level, succes met het vinden van een goed mijngebied! " +
                    "Je hebt al onderzocht: Mijnbouw algemeen, prospecting en het daadwerkelijk openen van een mijn.</p>";
                document.getElementById("MiningResearch").disabled = true;
                document.getElementById("ResearchTimer").style.display = "none";
                break;
            default:
                break;
        }
        if (+objPlayerInfo.level < 8) {
            document.getElementById("MiningLevel").innerHTML = "<p> Vanaf level 8 mag je dit onderzoek starten!</p>";

            document.getElementById("MiningResearch").disabled = true;
        } else {
            // document.getElementById("MiningLevel").style.display = "none";
            if (objResearch.running == 0) {
                document.getElementById("MiningResearch").disabled = false;
            }

        };
        // weergeven beschikbare opties in de minging row
        objMines.showProspecting();
        objMines.showMining();
    },
    init: function () {
        objResearch.timer = localStorage.getItem('rTimer') || 100;
        objResearch.level = localStorage.getItem('Rlevel') || 1;
        objResearch.running = localStorage.getItem('Rrunning') || 0;
        objResearch.show();
        if (+objPlayerInfo.level > 7) {
            if (+objResearch.running == 1) {
                objResearch.timer = localStorage.getItem('rTimer');
                document.getElementById("MiningResearch").disabled = true;
                objResearch.doResearch();
            }
            if (objResearch.level > 3) {
                document.getElementById("MiningResearch").disabled = true;
            }
        }
    }

}

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
    prospectTimer: 15,
    prospectTimerActive: 15,
    prospecting: 0,
    priceFactor: 1.01,
    items: [1, 2, 3, 4, 5, 6],
    weight: ['20', '35', '15', '20', '5', '5'],
    prospect: function () {
        // Eerst bepalen of er al een prospecting actie liep
        if (+objMines.prospecting != 1) {
            if (+objMoney.amount < +objMines.prospectCost) {
                notificationOverlay("Niet genoeg doekoe!", "Prospecting", "fa-euro-sign");
                return 0;
            } else {
                objMoney.use(+objMines.prospectCost);
            };
            objMines.prospectTimerActive = parseInt(+objMines.prospectTimer);
            objMines.prospecting = 1;
        }
        document.getElementById("ProspectingButton").disabled = true;
        // prospect loop

        localStorage.setItem('prospecting', objMines.prospecting);
        document.getElementById("ProspectingProgress").style.display = "";
        var ProspectLoop = setInterval(
            function () {
                objMines.prospectTimerActive--;
                localStorage.setItem("pTimer", +objMines.prospectTimerActive);
                document.getElementById("ProspectingProgress").innerHTML = "<p>De zoektocht naar een nieuwe mijnlocatie is klaar over: " +
                    objMines.prospectTimerActive + " Ticks</p>";
                if (objMines.prospectTimerActive < 1) {
                    //bepalen welke resource er gevonden wordt: (geinspireerd door: http://codetheory.in/weighted-biased-random-number-generation-with-javascript-based-on-probability/)

                    var weighed_list = generateWeighedList(objMines.items, objMines.weight);
                    var random_num = randomSelect(0, weighed_list.length - 1);
                    var selectedItem = parseInt(weighed_list[random_num]);

                    //verwerken resultaat
                    switch (selectedItem) {
                        case 1:
                            objMines.ironAmountProspected++;
                            localStorage.setItem('ironAmountProspected', objMines.ironAmountProspected);
                            selectedItem = "Ijzer";
                            break;
                        case 2:
                            objMines.coalAmountProspected++;
                            localStorage.setItem('coalAmountProspected', objMines.coalAmountProspected);
                            selectedItem = "Steenkool";
                            break;
                        case 3:
                            objMines.uraniumAmountProspected++;
                            localStorage.setItem('uraniumAmountProspected', objMines.uraniumAmountProspected);
                            selectedItem = "Uranium";
                            break;
                        case 4:
                            objMines.copperAmountProspected++;
                            localStorage.setItem('copperAmountProspected', objMines.copperAmountProspected);
                            selectedItem = "Koper";
                            break;
                        case 5:
                            objMines.goldAmountProspected++;
                            localStorage.setItem('goldAmountProspected', objMines.goldAmountProspected);
                            selectedItem = "Goud";
                            break;
                        case 6:
                            objMines.diamondAmountProspected++;
                            localStorage.setItem('diamondAmountProspected', objMines.diamondAmountProspected);
                            selectedItem = "Diamant";
                            break;
                    };
                    objMines.prospecting = 0;
                    localStorage.setItem('prospecting', objMines.prospecting);
                    document.getElementById("ProspectingProgress").style.display = "none";
                    document.getElementById("ProspectingButton").disabled = false;
                    document.getElementById("ProspectingResult").innerHTML = "<p>Laatst gevonden resource: " + selectedItem + "</p>";
                    objMines.showProspecting();
                    objMines.showMining();
                    clearInterval(ProspectLoop);
                }
            }, 1000)


    },
    showProspecting: function () {
        if (+objResearch.level > 2) {
            document.getElementById("Prospecting-col").style.display = "";
            document.getElementById("Prospecting").style.display = "";
            document.getElementById("minesites").style.display = "";
        } else {
            document.getElementById("Prospecting").style.display = "none";
            document.getElementById("minesites").style.display = "none";
        };
        document.getElementById("Prospecting").innerHTML = "<p>Zoek hier naar nieuwe gebieden om je mijnen te kunnen openen. De zoektocht duurt: " +
            objMines.prospectTimer + " ticks en hiervoor betaal je: " + FixMoney(+objMines.prospectCost) + "</p>";
        document.getElementById("minesites").innerHTML =
            "<p>Aantal ijzermijn locaties/mijnen: " + FixNumber(objMines.ironAmountProspected) + "/" + FixNumber(objMines.ironAmountActive) + "</p>" +
            "<p>Aantal steenkoolmijn locaties/mijnen: " + FixNumber(objMines.coalAmountProspected) + "/" + FixNumber(objMines.coalAmountActive) + "</p>" +
            "<p>Aantal uraniummijn locaties/mijnen: " + FixNumber(objMines.uraniumAmountProspected) + "/" + FixNumber(objMines.uraniumAmountActive) + "</p>" +
            "<p>Aantal kopermijn locaties/mijnen: " + FixNumber(objMines.copperAmountProspected) + "/" + FixNumber(objMines.copperAmountActive) + "</p>" +
            "<p>Aantal goudmijn locaties/mijnen: " + FixNumber(objMines.goldAmountProspected) + "/" + FixNumber(objMines.goldAmountActive) + "</p>" +
            "<p>Aantal diamantmijn locaties/mijnen: " + FixNumber(objMines.diamondAmountProspected) + "/" + FixNumber(objMines.diamondAmountActive) + "</p>";
    },
    addMine: function (typeMine, amount) {
        //functie voor werkelijk toevoegen mijn
        function addMineFunction(mineType, amountAdded) {
            var mCost = mineType + "MineCost";
            var mActive = mineType + "AmountActive";
            var mProspected = mineType + "AmountProspected";
            if (+mProspected - +mActive < 1) {
                notificationOverlay("Geen locaties meer beschikbaar", "Mijnbouw", "fa-info");
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
            };

            if (+amountAdded == 1) {
                objMines[mActive]++;
                objMoney.use(+objMines[mCost]);
                objMines[mCost] = +objMines[mCost] * +objMines.priceFactor;
            } else {
                objMines[mActive] = +objMines[mActive] - 1;
                objMoney.add((+objMines[mCost] * 0.75), "Verkopen mijn", 12, 1);
                objMines[mCost] = +objMines[mCost] / +objMines.priceFactor;
            }

            localStorage.setItem(mCost, objMines[mCost]);

            //Aantal actieve mijnen opslaan in LS en weergeven
            localStorage.setItem(mActive, objMines[mActive]);
            objMines.showAll();
        };
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
                var mineType = "copper";
                addMineFunction(mineType, amount);
                break;
            case 5:
                var mineType = "gold";
                addMineFunction(mineType, amount);
                break;
            case 6:
                var mineType = "diamond";
                addMineFunction(mineType, amount);
                break;
        }

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
        };

        function generateText(htmlfield, typeMine, mineCost, active, mineName, mineCode, mineButton) {
            document.getElementById(htmlfield).innerHTML = "<h2>" + mineName + "en</h2><p>Je hebt in totaal " + FixNumber(objMines[typeMine]) + " " + mineName +
                " locaties gevonden. Hiervan zijn er " + FixNumber(objMines[active]) + " actief in gebruik.</p>" +
                "Je kan nog " + FixNumber((+objMines[typeMine] - +objMines[active])) + " " + mineName + " openen. Een " + mineName + " kost nu " +
                FixMoney(objMines[mineCost]) + ". Je kan een mijn ook verkopen voor 75% van de aanschafwaarde.</p>" +
                "<button type='button' class='btn btn-primary' onClick='objMines.addMine(" + mineCode + ", 1);' id='" + mineButton + "'>Bouw " + mineName + "</button>" +
                " <button type='button' class='btn btn-danger' onClick='objMines.addMine(" + mineCode + ", 0);' id='" + mineButton + "'>Verkoop " + mineName + "</button>";
            return 0;
        };

        generateText("iron-mines", "ironAmountProspected", "ironMineCost", "ironAmountActive", "ijzerertsmijn", 1, "ironMineButton");
        generateText("coal-mines", "coalAmountProspected", "coalMineCost", "coalAmountActive", "steenkoolmijn", 2, "coalMineButton");
        generateText("uranium-mines", "uraniumAmountProspected", "uraniumMineCost", "uraniumAmountActive", "uraniummijn", 3, "uraniumMineButton");
        //generateText("copper-mines", "copperAmountProspected", "copperMineCost","copperAmountActive", "kopermijn", 4, "copperMineButton);
        //generateText("gold-mines", "goldAmountProspected", "goldMineCost","goldAmountActive", "goudmijn", 5, "goldMineButton");
        //generateText("diamond-mines", "diamondAmountProspected", "diamondMineCost","diamondAmountActive", "diamantmijn", 6, "diamondMineButton");

        var updateMineButtons = function (mineTypes) {
            for (var i = 0; i < mineTypes.length; i++) {
                var activeMines = mineTypes[i] + "AmountActive";
                var prospectedMines = mineTypes[i] + "AmountProspected";
                var buttonMine = mineTypes[i] + "MineButton";
                if (objMines[prospectedMines] <= +objMines[activeMines]) {
                    document.getElementById(buttonMine).disabled = true;
                } else {
                    document.getElementById(buttonMine).disabled = false;
                }
            }
        }

        //var mineTypes = ["iron","coal","uranium","copper","gold","diamond"];
        var mineTypes = ["iron", "coal", "uranium"];
        updateMineButtons(mineTypes);

    },
    init: function () {
        objMines.ironAmountProspected = localStorage.getItem('ironAmountProspected') || 0;
        objMines.coalAmountProspected = localStorage.getItem('coalAmountProspected') || 0;
        objMines.uraniumAmountProspected = localStorage.getItem('uraniumAmountProspected') || 0;
        objMines.copperAmountProspected = localStorage.getItem('copperAmountProspected') || 0;
        objMines.goldAmountProspected = localStorage.getItem('goldAmountProspected') || 0;
        objMines.diamondAmountProspected = localStorage.getItem('diamondAmountProspected') || 0;
        objMines.ironAmountActive = localStorage.getItem('ironAmountActive') || 0;
        objMines.coalAmountActive = localStorage.getItem('coalAmountActive') || 0;
        objMines.uraniumAmountActive = localStorage.getItem('uraniumAmountActive') || 0;
        objMines.copperAmountActive = localStorage.getItem('copperAmountActive') || 0;
        objMines.goldAmountActive = localStorage.getItem('goldAmountActive') || 0;
        objMines.diamondAmountActive = localStorage.getItem('diamondAmountActive') || 0;
        objMines.ironMineCost = localStorage.getItem('ironMineCost') || 100000000;
        objMines.coalMineCost = localStorage.getItem('coalMineCost') || 125000000;
        objMines.uraniumMineCost = localStorage.getItem('uraniumMineCost') || 200000000;
        objMines.copperMineCost = localStorage.getItem('copperMineCost') || 150000000;
        objMines.goldMineCost = localStorage.getItem('goldMineCost') || 600000000;
        objMines.diamondMineCost = localStorage.getItem('diamondMineCost') || 600000000;
        objMines.prospectTimerActive = localStorage.getItem('pTimer') || 15;
        objMines.prospecting = localStorage.getItem('prospecting') || 0;
        document.getElementById("Prospecting-col").style.display = "none";
        if (+objMines.prospecting == 1) {
            objMines.prospect();
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
        if (+objEnergy.available < (+objMines.coalAmountActive * +objCoalMine.energy)) {
            var activeMines = Math.floor((+objEnergy.available / (+objMines.coalAmountActive * +objCoalMine.energy)));
        } else {
            var activeMines = +objMines.coalAmountActive;
        };
        var remainingStorage = (+objCoal.storage * +objCoal.storageCap) - +objCoal.amount;
        if ((+activeMines * +objCoalMine.production) > remainingStorage) {
            activeMines = Math.floor(+remainingStorage / +objCoalMine.production)
        }
        if (+activeMines == 0) {
            return 0;
        }
        objEnergy.use((+activeMines * +objCoalMine.energy), "Steenkoolmijn");
        objCoal.add((+activeMines * +objCoalMine.production));
        objCoal.show();
    },
    show: function () {
        document.getElementById("coalMine").innerHTML = "<p>Een steenkoolmijn produceert: " + FixNumber(+objCoalMine.production) + " ton steenkool per tick." +
            " Dit kost je " + FixNumber(objCoalMine.energy) + " energie per tick</p><p>Je produceert op dit moment " + FixNumber((+objMines.coalAmountActive * +objCoalMine.production)) +
            " ton steenkool per tick, dit kost " + FixNumber((+objMines.coalAmountActive * +objCoalMine.energy)) + " energie.</p>" +
            "<p>Je hebt nu: " + FixNumber(objCoal.storage) + " steenkool silo's" +
            "<br>Totale opslag capaciteit: " + FixNumber((+objCoal.storage * +objCoal.storageCap)) +
            "<br>Steenkool voorraad / capaciteit: " + FixNumber(objCoal.amount) + "/" + FixNumber((+objCoal.storage * +objCoal.storageCap)) + " ton</p>" +
            "<p>Je kan steenkool verkopen voor: " + FixMoney(objCoal.price) + " per ton. In geval van nood kan je steenkool ook kopen voor: " + FixMoney((+objCoal.price * 1.5)) +
            " per ton (alleen als je minder dan 5% van je maximale steenkool capaciteit beschikbaar hebt)</p>" +
            "<button type='button' class='btn btn-danger' onClick='objCoal.sell(0)' id='sellCoalButton'>Verkoop steenkool!</button> " +
            "<button type='button' class='btn btn-outline-success' onClick='objCoal.buy(50000)' id='buyCoalButton'>Koop 50k steenkool</button>" +
            "<p>Koop een extra silo voor: " + FixMoney(objCoal.storagePrice) + "</p>";
        ;
    }

}

var objCoal = {
    amount: 0,
    storage: 1,
    storageCap: 1000000,
    storagePrice: 1000000,
    price: 50,
    add: function (amountAdded) {
        fillStorage("objCoal", amountAdded, "coalAmount")
    },
    use: function (amount) {
        if (+amount >= +objCoal.amount) {
            delivered = objCoal.amount;
            objCoal.amount = 0;
            return delivered;

        }
        objCoal.amount = +objCoal.amount - +amount;
        localStorage.setItem('coalAmount', +objCoal.amount);
        objCoal.show();
        return amount;
    },
    sell: function (amountSold) {
        var coalNeeded = +objCoalPowerPlant.amount * +objCoalPowerPlant.CoalUsageTons;
        var reason = "Verkoop overschot steenkool";
        if (+amountSold == 0) {
            amountSold = objCoal.amount;
            objCoal.use(+amountSold - +coalNeeded);
            reason = "Handmatige verkoop steenkool";
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
        if (objCoal.amount < ((+objCoal.storage * +objCoal.storageCap) * 0.05)) {
            var cost = +amountBought / 1000 * (+objCoal.price * 1.5);
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
            notificationOverlay("Niet genoeg doekoe!", "Steelkool opslag", "fa-euro-sign");
            return 0;
        } else {
            objMoney.use(+objCoal.storagePrice);
            objCoal.storage++;
            localStorage.setItem('coalSilos', +objCoal.storage);
            objCoal.show();
        }
    },
    show: function () {
        objCoalMine.show();
        var percentageFilled = (+objCoal.amount / (+objCoal.storageCap * +objCoal.storage)) * 100;
        percentageFilled = Math.round(percentageFilled * 100) / 100;
        if (objCoalPowerPlant.amount > 0) {
            document.getElementById("CoalStock").innerHTML = '<p>Steenkool:</p><div class="progress"><div class="progress-bar" style="width:' + percentageFilled + '%">' + FixNumber(objCoal.amount) + 'kg (' + percentageFilled + '%)</div></div>'
        }
    },
    init: function () {
        objCoal.amount = localStorage.getItem('coalAmount') || 0;
        objCoal.storage = localStorage.getItem('coalSilos') || 1;
        objCoal.storageCap = localStorage.getItem('coalSiloCap') || 1000000;
        objCoal.show();

    }
}

// Ijzer

var objIronMine = {
    production: 1000,
    energy: 450,
    produce: function () {
        if (+objEnergy.available < (+objMines.ironAmountActive * +objIronMine.energy)) {
            var activeMines = Math.floor((+objEnergy.available / (+objMines.ironAmountActive * +objIronMine.energy)));
        } else {
            var activeMines = +objMines.ironAmountActive;
        };
        var remainingStorage = (+objIronOre.storage * +objIronOre.storageCap) - +objIronOre.amount;
        if ((+activeMines * +objIronMine.production) > remainingStorage) {
            activeMines = Math.floor(+remainingStorage / +objIronMine.production)
        }
        if (+activeMines == 0) {
            return 0;
        }
        objEnergy.use((+activeMines * +objIronMine.energy), "IJzermijn");
        objIronOre.add((+activeMines * +objIronMine.production));
        objIronOre.show();
    },
    show: function () {
        document.getElementById("IronMine").innerHTML = "<p>Een ijzererts-mijn produceert: " + FixNumber(+objIronMine.production) + " ton ijzererts per tick." +
            " Dit kost je " + FixNumber(objIronMine.energy) + " energie per tick</p><p>Je produceert op dit moment " + FixNumber((+objMines.ironAmountActive * +objIronMine.production)) +
            " ton ijzererts per tick, dit kost " + FixNumber((+objMines.ironAmountActive * +objIronMine.energy)) + " energie.</p>" +
            "<p>Je hebt nu: " + FixNumber(objIronOre.storage) + " ijzererts silo's" +
            "<br>Totale opslag capaciteit: " + FixNumber((+objIronOre.storage * +objIronOre.storageCap)) +
            "ton <br>Ijzererts voorraad / capaciteit: " + FixNumber(objIronOre.amount) + "/" + FixNumber((+objIronOre.storage * +objIronOre.storageCap)) + " ton</p>" +
            "<p>Je kan ijzererts verkopen voor: " + FixMoney(objIronOre.price) + " per ton. Als de opslag vol is stoppen de ijzermijnen met werken (ze kosten dan ook geen energie meer)</p>" +
            "<button type='button' class='btn btn-danger' onClick='objIronOre.sell(0)' id='sellIronButton'>Verkoop ijzererts!</button>" +
            "<p>Koop een extra silo voor: " + FixMoney(objIronOre.storagePrice) + "</p>" +
            "<button type='button' class='btn btn-primary' onClick='objIronOre.addSilo();' id='ironOreSiloButton'>Bouw ijzererts-silo</button>";
        ;
    }

}

var objIronOre = {
    amount: 0,
    storage: 1,
    storageCap: 1000000,
    storagePrice: 1000000,
    price: 175,
    add: function (amountAdded) {
        fillStorage("objIronOre", amountAdded, "ironOreAmount")
    },
    use: function (amount) {
        useResource("objIronOre", amount, "ironOreAmount");
    },
    sell: function (amountSold) {
        var reason = "Verkoop overschot ijzererts";
        priceValue = (+objIronOre.price * 0.2);
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
            notificationOverlay("Niet genoeg doekoe!", "Ijzererts opslag", "fa-euro-sign");
            return 0;
        } else {
            objMoney.use(+objIronOre.storagePrice);
            objIronOre.storage++;
            localStorage.setItem('ironOreSilos', +objIronOre.storage);
            objIronOre.show();
        }
    },
    show: function () {
        objIronMine.show();
    },
    init: function () {
        objIronOre.amount = localStorage.getItem('ironOreAmount') || 0;
        objIronOre.storage = localStorage.getItem('ironOreSilos') || 1;
        objIronOre.storageCap = localStorage.getItem('ironOreSiloCap') || 1000000;
        objIronOre.show();
    }

}

var objIronMelter = {
    amount: 0,
    cost: 250000000,
    production: 10000,
    ironOreNeeded: 10000,
    coalNeeded: 1000,
    energy: 5000,
    activeSmelters: 0,
    add: function (amount) {
        if (amount < 0) {
            imPrice = +objIronMelter.cost * 0.75;
            if (objIronMelter.amount == 0) {
                notificationOverlay("Geen hoogovens om te verkopen", "Hoogoven", "fa-industry");
                return 0;
            }
        } else {
            imPrice = +objIronMelter.cost
        }
        if (+objMoney.amount > (+imPrice * +amount)) {
            objMoney.use((+imPrice * +amount));
            objIronMelter.amount = +objIronMelter.amount + +amount;
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Hoogoven", "fa-euro-sign");
        }
        localStorage.setItem('ironSmelters', objIronMelter.amount);
        objIronMelter.show();
        objSteel.show();
    },
    produce: function () {
        if (objIronMelter.amount == 0) {
            notificationOverlay("Geen hoogovens!", "Hoogovens", "fa-industry")
            return 0;
        }
        var coalNeededT = +objIronMelter.amount * +objIronMelter.coalNeeded;
        var ironOreNeededT = +objIronMelter.amount * +objIronMelter.ironOreNeeded;
        var energyNeededT = +objIronMelter.amount * +objIronMelter.energy;
        objIronMelter.activeSmelters = +objIronMelter.amount;

        function setProductionMax(selectedResource) {
            coalNeededT = +objIronMelter.activeSmelters * +objIronMelter.coalNeeded;
            ironOreNeededT = +objIronMelter.activeSmelters * +objIronMelter.ironOreNeeded;
            energyNeededT = +objIronMelter.activeSmelters * +objIronMelter.energy;
            if (+objIronMelter.activeSmelters == 0) {
                notificationOverlay("Niet genoeg " + selectedResource, "Hoogovens", "fa-industry")
                return 0;
            }
        }
        if (+coalNeededT > +objCoal.amount) {
            objIronMelter.activeSmelters = Math.floor(+objCoal.amount / +objIronMelter.coalNeeded);
            if (setProductionMax("steenkool") == 0) {
                return 0;
            }
            ;
        }
        if (+ironOreNeededT > +objIronOre.amount) {
            objIronMelter.activeSmelters = Math.floor(+objIronOre.amount / +objIronMelter.ironOreNeeded);
            if (setProductionMax("ijzererts") == 0) {
                return 0;
            }
        }
        if (+energyNeededT > +objEnergy.available) {
            objIronMelter.activeSmelters = Math.floor(+objEnergy.available / +objIronMelter.energy);
            if (setProductionMax("energie") == 0) {
                return 0;
            }

        }
        objCoal.use(+coalNeededT);
        objIronOre.use(+ironOreNeededT);
        objEnergy.use(+energyNeededT, "Staalproductie");
        objSteel.add((+objIronMelter.activeSmelters * +objIronMelter.production))
        objSteel.show();

    },
    show: function () {
        if (+objMines.ironAmountProspected > 0) {
            document.getElementById('steelProduction').innerHTML = "<h2>Staal</h2><p>Staal kan geproduceerd worden door het gebruiken van ijzererts, steenkool en een hoop energie. " +
                "Je kan een hoogoven bouwen voor " + FixMoney(objIronMelter.cost) + ". Als je een hoogoven verkoopt levert dat: " + FixMoney((objIronMelter.cost * 0.75)) + " op. " +
                "Iedere hoogoven gebruikt " + FixNumber(objIronMelter.ironOreNeeded) + " ton ijzererts, " +
                FixNumber(objIronMelter.coalNeeded) + " ton steenkool en " + FixNumber(objIronMelter.energy) + " energie</p>" +
                "<p><button type='button' class='btn btn-primary' onClick='objIronMelter.add(1);' id='buyIronMelter'>Bouw hoogoven</button> " +
                "<button type='button' class='btn btn-danger' onClick='objIronMelter.add(-1);' id='sellIronMelter'>verkoop hoogoven</button></p>";
            document.getElementById('steelProductionStats').innerHTML = "<p> Je hebt op dit moment " + FixNumber(objIronMelter.amount) + " hoogovens. Deze hoogovens produceren " +
                FixNumber((+objIronMelter.amount * +objIronMelter.production)) + " ton staal per run</p><p>" +
                "Dit kost per run: <br> Steenkool: " + FixNumber((objIronMelter.amount * objIronMelter.coalNeeded)) +
                "<br> Ijzererts: " + FixNumber((objIronMelter.amount * objIronMelter.ironOreNeeded)) +
                "<br> Energie: " + FixNumber((objIronMelter.amount * objIronMelter.energy)) + "</p><p>" +
                "<button type='button' class='btn btn-primary' onClick='objIronMelter.produce();' id='ironOreSiloButton'>Maak staal</button></p>";
        }

    },
    init: function () {
        objIronMelter.amount = localStorage.getItem('ironSmelters') || 0;
        objIronMelter.show();
    }
}

var objSteel = {
    amount: 0,
    price: 0,
    storage: 1,
    storageCap: 1000000,
    storagePrice: 15000000,
    addStorage: function () {
        if (moneyCheck(+objSteel.storagePrice) == 0) {
            notificationOverlay("Niet genoeg doekoe!", "Ijzererts opslag", "fa-euro-sign");
            return 0;
        } else {
            objMoney.use(+objSteel.storagePrice);
            objSteel.storage++;
            localStorage.setItem('steelStorage', objSteel.storage);
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
        document.getElementById('Steel').innerHTML = "<h2>Staalvoorraden</h2><p>Staal wordt in loodsen opgeslagen. Iedere loods kan " + FixNumber(objSteel.storageCap) +
            " ton staal opslaan</p><p>Info:<br>Aantal loodsen: " + FixNumber(objSteel.storage) + "<br>Totale opslagcapaciteit: " + FixNumber((+objSteel.storage * +objSteel.storageCap)) +
            "<br>Extra loodsen kosten: " + FixMoney(objSteel.storagePrice) + "</P>";
        document.getElementById('steelStats').innerHTML = "<p>Stats:<br>Aantal loodsen: " + FixNumber(objSteel.storage) + "<br>Staal in voorraad: " + FixNumber(objSteel.amount) +
            "<br>Totale ruimte: " + FixNumber((+objSteel.storage * +objSteel.storageCap)) + "<br>Beschikbare ruimte: " + FixNumber(((+objSteel.storage * +objSteel.storageCap) - +objSteel.amount));
        document.getElementById('steelStorage').innerHTML = "<button type='button' class='btn btn-primary' onClick='objSteel.addStorage();' id='steelStorage'>Koop staalopslag</button> " +
            "<button type='button' class='btn btn-danger' onClick='objSteel.sell(0)' id='sellSteel'>Verkoop Staal</button><p>Staal dat niet in de opslag past wordt voor 20% van de marktwaarde verkocht!</p>";

    },
    showPrice: function () {
        document.getElementById('steelPrice').innerHTML = "<p>De huidige staalprijs is: " + FixMoney(objSteel.price) + " per ton</p>";
    },
    init: function () {
        if (+objIronMelter.amount < 1 && objSteel.amount < 1) {
            return 0;
        }
        objSteel.amount = localStorage.getItem('steelAmount') || 0;
        objSteel.storage = localStorage.getItem('steelStorage') || 1;
        objSteel.show();
    }
}

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
                notificationOverlay("Geen plasticfabrieken om te verkopen", "Kunststoffabriek", "fa-industry");
                return 0;
            }
        } else {
            Price = +objPlasticFactory.cost;
        }
        if (+objMoney.amount > (+Price * +amount)) {
            objMoney.use((+Price * +amount));
            objPlasticFactory.amount = +objPlasticFactory.amount + +amount;
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Kunststoffabriek", "fa-euro-sign");
        }
        localStorage.setItem('plasticFactories', objPlasticFactory.amount);
        objPlasticFactory.show();
    },
    addWorker: function (amount) {
        if (amount == 0) {
            Price = 0;
            amount = -1;
            if (objPlasticFactory.workers < 1) {
                notificationOverlay("Geen medewerkers om te ontslaan", "Kunststoffabriek", "fa-industry");
                return 0;
            }
        } else {
            Price = +objPlasticFactory.workerCost;
        }
        if (+objMoney.amount > (+Price * +amount)) {
            objMoney.use((+Price * +amount));
            objPlasticFactory.workers = +objPlasticFactory.workers + +amount;
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Kunststoffabriek", "fa-euro-sign");
        }
        localStorage.setItem('plasticWorkers', objPlasticFactory.workers);
        objPlasticFactory.show();
    },
    produce: function (typeProduction) {
        var factoriesActive = +objPlasticFactory.amount;
        if (typeProduction == 1) {
            if (+objStorehouse.pasta < (+objPlasticFactory.workers * +objPlasticFactory.workerFood)) {
                factoriesActive = Math.floor(+objStorehouse.pasta / +objPlasticFactory.workerFood);
                if (factoriesActive == 0) {
                    return 0;
                }
            } else {
                factoriesActive = objPlasticFactory.workers;
            }
            if (+factoriesActive > +objPlasticFactory.amount) {
                factoriesActive = +objPlasticFactory.amount;
            }
        };
        if (objPlasticFactory.amount == 0) {
            if (typeProduction == 0) {
                notificationOverlay("Geen Kunststoffabrieken!", "Kunststoffabriek", "fa-industry");
            }
            return 0;
        };
        if (typeProduction == 0) {
            factoriesActive = +objPlasticFactory.amount - +objPlasticFactory.workers;
        }

        if (+objEnergy.available < (+factoriesActive * +objPlasticFactory.energy)) {
            factoriesActive = Math.floor(+objEnergy.available / +objPlasticFactory.energy);
            if (factoriesActive == 0) {
                if (typeProduction == 0) {
                    notificationOverlay("Niet genoeg energie!", "Kunststoffabriek", "fa-industry");
                }
                return 0;
            }
        }
        if (+objOilTank.contents < (+factoriesActive * +objPlasticFactory.oilNeededProduction)) {
            factoriesActive = Math.floor(+objOilTank.contents / +objPlasticFactory.oilNeededProduction);
            if (factoriesActive == 0) {
                if (typeProduction == 0) {
                    notificationOverlay("Niet genoeg olie!", "Kunststoffabriek", "fa-industry");
                };
                return 0;
            }
        }
        var SpaceLeft = (+objPlastic.storage * +objPlastic.storageCap) - +objPlastic.amount;
        if (+SpaceLeft < (+factoriesActive * +objPlasticFactory.production)) {
            factoriesActive = Math.floor(+SpaceLeft / +objPlasticFactory.production);
            if (factoriesActive == 0) {
                if (typeProduction == 0) {
                    notificationOverlay("Niet genoeg opslagruimte!", "Kunststoffabriek", "fa-industry");
                };
                return 0;
            }
        }
        objOilTank.use((+factoriesActive * +objPlasticFactory.oilNeededProduction));
        objEnergy.use((+factoriesActive * +objPlasticFactory.energy));
        if (typeProduction == 1) {
            objStorehouse.removePasta((+factoriesActive * +objPlasticFactory.workerFood));
        };
        objPlastic.add((+factoriesActive * +objPlasticFactory.production));
    },
    show: function () {
        document.getElementById('pFactory1').innerHTML = "<h2>Kunststoffabrieken</h2><p>Je hebt op dit moment " + FixNumber(objPlasticFactory.amount) + " fabriek(en) die " +
            "kunststof producten kunnen maken</p><p>Stroomverbruik per fabriek per run: " + FixNumber(objPlasticFactory.energy) +
            " <br>Olieverbruik per fabriek per run: " + FixNumber(objPlasticFactory.oilNeededProduction) + " <br>" +
            "Opbrengst per fabriek per run: " + FixNumber(objPlasticFactory.production) + " eenheden</p><p>Een extra fabriek kost: " + FixMoney(objPlasticFactory.cost) + "<br>";
        if (objPlasticFactory.amount > 0) {
            document.getElementById('pFactory2').innerHTML = "<p>Totaalverbruik per run: <br> Energie: " + FixNumber((+objPlasticFactory.amount * +objPlasticFactory.energy)) +
                " <br>Olie: " + FixNumber((+objPlasticFactory.amount * +objPlasticFactory.oilNeededProduction)) +
                "<br></p><p>Totaal opbrengst per run:<br>Kunststof: " + FixNumber((+objPlasticFactory.amount * +objPlasticFactory.production)) + " eenheden</p>";
        }
        document.getElementById('plasticAuto').innerHTML = "<h3>Automatiseer kunststoffabriek</h3><p>Neem medewerkers aan die kunststof voor je maken. Een medewerker eet: " +
            FixNumber(objPlasticFactory.workerFood) + " eenheden pasta per 15 ticks en kan 1 kunststoffabriek aansturen.</p><p>Aantal medewerkers: " + FixNumber(objPlasticFactory.workers) +
            "<br>Pastaverbruik per 15 ticks: " + FixNumber((+objPlasticFactory.workers * objPlasticFactory.workerFood)) + "<br>Een medewerker kost: " +
            FixMoney(objPlasticFactory.workerCost) + "</p><p>Je krijgt geen geld terug als je een medewerker ontslaat.</p>";
        if (objPlasticFactory.workers >= objPlasticFactory.amount) {
            document.getElementById('makePlastic').disabled = true;
        } else {
            document.getElementById('makePlastic').disabled = false;
        }

    },
    init: function () {
        objPlasticFactory.amount = localStorage.getItem('plasticFactories') || 0;
        objPlasticFactory.workers = localStorage.getItem('plasticWorkers') || 0;
        // objPlastic.init();
        objPlasticFactory.show();

    }
}

var objPlastic = {
    amount: 0,
    price: 0,
    storage: 1,
    storageCap: 100000,
    storagePrice: 1500000,
    addStorage: function () {
        if (moneyCheck(+objSteel.storagePrice) == 0) {
            notificationOverlay("Niet genoeg doekoe!", "Kunststof opslag", "fa-euro-sign");
            return 0;
        } else {
            objMoney.use(+objPlastic.storagePrice);
            objPlastic.storage++;
            localStorage.setItem('plasticStorage', objPlastic.storage);
            objPlastic.show();
        }
    },
    sell: function (amountSold) {
        var reason = "Verkoop overschot kunststof";
        if (+amountSold == 0) {
            amountSold = +objPlastic.amount;
            reason = "Handmatige verkoop kunststof";
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
        document.getElementById('plasticStorage').innerHTML = "<h2>Kunststofopslag</h2><p>Je hebt op dit moment plek voor maximaal " + FixNumber((+objPlastic.storage * +objPlastic.storageCap)) +
            " eenheden kunststof.</p><p>Totale hoeveelheid kunststof beschikbaar: " + FixNumber(objPlastic.amount) + " <br>Nog beschikbare ruimte: " + FixNumber(((+objPlastic.storage * +objPlastic.storageCap) - +objPlastic.amount)) +
            "</p><p>Je kan opslag bij kopen voor " + FixNumber(objPlastic.storageCap) + " eenheden kunststof, " +
            "dit kost je " + FixMoney(objPlastic.storagePrice);
    },
    showPrice: function () {
        objPlastic.price = (+objOil.price * 8) + 100;
        document.getElementById('plasticPrice').innerHTML = "<p>De huidige prijs voor kunststof is: " + FixMoney(objPlastic.price) + " per eenheid</p>";
    },
    init: function () {
        objPlastic.amount = localStorage.getItem('plasticAmount') || 0;
        objPlastic.storage = localStorage.getItem('plasticStorage') || 1;
        objPlastic.show();
        if (+objPlasticFactory.amount > 0 || +objPlastic.amount > 0) {
            objPlastic.showPrice();
        }
    }
}

// Uranium

var objUraniumMine = {
    production: 100,
    energy: 2500,
    workers: 20,
    workerFood: 10,
    produce: function () {
        var activeMines = objMines.uraniumAmountActive;
        if (+objStorehouse.pasta < (activeMines * (+objUraniumMine.workers * +objUraniumMine.workerFood))) {
            activeMines = Math.floor((+objStorehouse.pasta / (+objUraniumMine.workers * +objUraniumMine.workerFood)));
            if (+activeMines == 0) {
                return 0;
            }
        }
        if (+objEnergy.available < (+activeMines * +objUraniumMine.energy)) {
            activeMines = Math.floor((+objEnergy.available / (+activeMines * +objUraniumMine.energy)));
            if (+activeMines == 0) {
                return 0;
            }
        };
        var remainingStorage = (+objUraniumOre.storage * +objUraniumOre.storageCap) - +objUraniumOre.amount;
        if ((+activeMines * +objUraniumMine.production) > remainingStorage) {
            activeMines = Math.floor(+remainingStorage / +objUraniumMine.production)
            if (+activeMines == 0) {
                return 0;
            }
        }

        objEnergy.use((+activeMines * +objUraniumMine.energy), "Uraniummijn");
        objStorehouse.removePasta((activeMines * (+objUraniumMine.workers * +objUraniumMine.workerFood)));
        objUraniumOre.add((+activeMines * +objUraniumMine.production));
        objUraniumOre.show();
    },
    show: function () {
        document.getElementById("UraniumMine1").innerHTML = "<p>Een uraniummijn produceert: " + FixNumber(+objUraniumMine.production) + " ton uranium per 10 ticks." +
            " Dit kost je " + FixNumber(objUraniumMine.energy) + " energie per 10 ticks</p><p>Je produceert op dit moment " + FixNumber((+objMines.uraniumAmountActive * +objUraniumMine.production)) +
            " ton uranium per 10 ticks, dit kost " + FixNumber((+objMines.uraniumAmountActive * +objUraniumMine.energy)) + " energie. Daarnaast eet je personeel " + 
            FixNumber((+objUraniumMine.workerFood * (+objUraniumMine.workers * +objMines.uraniumAmountActive))) + " pasta per 10 ticks</p>" +
            "<p>Je hebt nu: " + FixNumber(objUraniumOre.storage) + " uranium silo's" +
            "<br>Totale opslag capaciteit: " + FixNumber((+objUraniumOre.storage * +objUraniumOre.storageCap)) +
            "ton <br>Uranium voorraad / capaciteit: " + FixNumber(objUraniumOre.amount) + "/" + FixNumber((+objUraniumOre.storage * +objUraniumOre.storageCap)) + " ton</p>" +
            "<p>Je kan uranium verkopen voor: " + FixMoney(objUraniumOre.price) + " per ton. Als de opslag vol is stoppen de mijnen met werken (ze kosten dan ook geen energie meer)</p>";
        document.getElementById("UraniumMine").innerHTML = "<p>Koop een extra silo voor: " + FixMoney(objUraniumOre.storagePrice) + "</p>";
    }

}

var objUraniumOre = {
    amount: 0,
    storage: 1,
    storageCap: 100000,
    storagePrice: 1000000,
    price: 175,
    add: function (amountAdded) {
        fillStorage("objUraniumOre", amountAdded, "uraniumOreAmount")
    },
    use: function (amount) {
        useResource("objUraniumOre", amount, "uraniumOreAmount");
    },
    sell: function (amountSold) {
        var reason = "Verkoop overschot uranium";
        priceValue = (+objUraniumOre.price * 0.2);
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
            notificationOverlay("Niet genoeg doekoe!", "Ijzererts opslag", "fa-euro-sign");
            return 0;
        } else {
            objMoney.use(+objUraniumOre.storagePrice);
            objUraniumOre.storage++;
            localStorage.setItem('uraniumOreSilos', +objUraniumOre.storage);
            objUraniumOre.show();
        }
    },
    show: function () {
        objUraniumMine.show();
    },
    init: function () {
        objUraniumOre.amount = localStorage.getItem('uraniumOreAmount') || 0;
        objUraniumOre.storage = localStorage.getItem('uraniumOreSilos') || 1;
        objUraniumOre.storageCap = localStorage.getItem('uraniumOreSiloCap') || 100000;
        objUraniumOre.show();
    }

}

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
    addFactory: function (actie) {
        if (+actie == 1) {
            if (moneyCheck(+objFuelCellFactory.cost) == 0) {
                notificationOverlay("Niet genoeg doekoe!", "Splijtstofstavenfabriek", "fa-euro-sign");
                return 0;
            } else {
                objMoney.use(+objFuelCellFactory.cost);
                objFuelCellFactory.amount++;
                localStorage.setItem('fuellCellFactory', objFuelCellFactory.amount);
                objFuelRod.storage = +objFuelRod.storageFactor * +objFuelCellFactory.amount;
                objFuelCellFactory.show();
            };
        } else {
            objMoney.add((+objFuelCellFactory.cost * 0.75), "Splijtstofstavenfabriek verkocht", 18, 1);
            objFuelCellFactory.amount--;
            localStorage.setItem('fuellCellFactory', objFuelCellFactory.amount);
            objFuelRod.storage = +objFuelRod.storageFactor * +objFuelCellFactory.amount;
            if (+objFuelRod.amount > +objFuelRod.storage) {
                var waste = +objFuelRod.amount - +objFuelRod.storage;
                objFuelRod.wasteFunction(+waste);
                objFuelRod.amount = +objFuelRod.storageFactor * +objFuelCellFactory.amount
            }
            localStorage.setItem('frAmount', +objFuelRod.amount);
            objFuelCellFactory.show();
        }
    },
    produce: function () {
        if (objFuelCellFactory.amount == 0) {
            return 0;
        }
        // Controleren of het de start van een nieuwe batch is
        if (objFuelCellFactory.counter == 0) {
            objFuelCellFactory.activeFactories = objFuelCellFactory.amount;

            // Beschikbaarheid opslag bepalen
            var availableSpace = +objFuelRod.storage - +objFuelRod.amount;
            if ((+objFuelCellFactory.activeFactories * +objFuelCellFactory.production) > +availableSpace) {
                objFuelCellFactory.activeFactories = Math.floor(+availableSpace / +objFuelCellFactory.production)
                if (+objFuelCellFactory.activeFactories == 0) {
                    localStorage.setItem('fuellCellFactoryActive', objFuelCellFactory.activeFactories);
                    objFuelCellFactory.counter = 0;
                    return 0;
                }
            }

            // Beschikbaarheid energie bepalen
            if ((+objFuelCellFactory.activeFactories * +objFuelCellFactory.energy) > +objEnergy.available) {
                objFuelCellFactory.activeFactories = Math.floor(+objEnergy.available / +objFuelCellFactory.energy)
                if (+objFuelCellFactory.activeFactories == 0) {
                    localStorage.setItem('fuellCellFactoryActive', objFuelCellFactory.activeFactories);
                    objFuelCellFactory.counter = 0;
                    return 0;
                }
            }
            // Beschikbaarheid staal bepalen
            if ((+objFuelCellFactory.activeFactories * +objFuelCellFactory.steelNeeded) > +objSteel.amount) {
                objFuelCellFactory.activeFactories = Math.floor(+objSteel.amount / +objFuelCellFactory.steelNeeded)
                if (+objFuelCellFactory.activeFactories == 0) {
                    localStorage.setItem('fuellCellFactoryActive', objFuelCellFactory.activeFactories);
                    objFuelCellFactory.counter = 0;
                    return 0;
                }
            }
            // Beschikbaarheid uranium bepalen
            if ((+objFuelCellFactory.activeFactories * +objFuelCellFactory.urianiumOreNeeded) > +objUraniumOre.amount) {
                objFuelCellFactory.activeFactories = Math.floor(+objUraniumOre.amount / +objFuelCellFactory.urianiumOreNeeded)
                if (+objFuelCellFactory.activeFactories == 0) {
                    localStorage.setItem('fuellCellFactoryActive', objFuelCellFactory.activeFactories);
                    objFuelCellFactory.counter = 0;
                    return 0;
                }
            }
            localStorage.setItem('fuellCellFactoryActive', objFuelCellFactory.activeFactories);
            // Werkelijk benodigde hoeveelheden bepalen
            var EN = +objFuelCellFactory.energy * +objFuelCellFactory.activeFactories;
            var UN = +objFuelCellFactory.urianiumOreNeeded * +objFuelCellFactory.activeFactories;
            var SN = +objFuelCellFactory.steelNeeded * +objFuelCellFactory.activeFactories;

            // Werkelijk gebruiken resources
            objEnergy.use(EN);
            objUraniumOre.use(UN);
            objSteel.use(SN);
        }

        // Aflopen productie timer
        objFuelCellFactory.counter++;
        if (+objFuelCellFactory.counter == +objFuelCellFactory.timeNeeded) {
            objFuelRod.add((+objFuelCellFactory.activeFactories * +objFuelCellFactory.production));
            objFuelCellFactory.counter = 0;
        }
        localStorage.setItem('fcfCounter', +objFuelCellFactory.counter)
        if (+objFuelCellFactory.activeFactories > 1) {
            document.getElementById('fuelRodCounter').innerHTML = "<p>Aantal ticks te gaan voor de splijtstofstaven voltooid zijn: " + FixNumber((100 - +objFuelCellFactory.counter)) + "</p>"
        } else {
            document.getElementById('fuelRodCounter').innerHTML = "<p>Aantal ticks te gaan voor de splijtstofstaaf voltooid is: " + FixNumber((100 - +objFuelCellFactory.counter)) + "</p>"
        }

    },
    show: function () {
        document.getElementById("fuelRod").innerHTML = "<h2>Splijtstofstavenproductie</h2><p>Uranium kan worden omgezet in brandstof voor kencentrales. Dit omzetten kost je de volgende resources (per fabriek): <br>" +
            "Energie: " + FixNumber(objFuelCellFactory.energy) + " <br>Staal: " + FixNumber(objFuelCellFactory.steelNeeded) + "<br>Uranium: " + FixNumber(objFuelCellFactory.urianiumOreNeeded) +
            "<br>Tijd: " + FixNumber(objFuelCellFactory.timeNeeded) + " ticks</p>" +
            "<p>Deze fabrieken kunnen niet stilgelegd worden, dus alle resources die benodigd zijn worden in 1x opgenomen bij de start van een run! Iedere fabriek produceert 1 staaf per keer</p>" +
            "<p>Je hebt momenteel " + FixNumber(objFuelCellFactory.amount) + " fabrieken waar splijtstofstaven kunnen produceren. Een extra fabriek kost: " + FixMoney(objFuelCellFactory.cost) +
            "<br>Je kan een fabriek ook weer verkopen voor 75% van de waarde.</p>";
        document.getElementById("fuelRod2").innerHTML = "<p>Het huidige (maximale) verbruik per batch:<br>Energie: " + FixNumber((objFuelCellFactory.amount * +objFuelCellFactory.energy)) + "<br>Staal: " +
            FixNumber((objFuelCellFactory.amount * +objFuelCellFactory.steelNeeded)) + "<br>Uranium: " + FixNumber((objFuelCellFactory.amount * +objFuelCellFactory.urianiumOreNeeded)) + "</p>";
        if (+objFuelCellFactory.amount == 0) {
            document.getElementById('fcfSellButton').disabled = true;
        } else {
            document.getElementById('fcfSellButton').disabled = false;
        };
        objFuelRod.show();

    },
    init: function () {
        objFuelCellFactory.amount = localStorage.getItem('fuellCellFactory') || 0;
        objFuelCellFactory.activeFactories = localStorage.getItem('fuellCellFactoryActive') || 0;
        objFuelCellFactory.counter = localStorage.getItem('fcfCounter') || 0;
        objFuelCellFactory.show();
        objFuelRod.init();
    }
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
        document.getElementById('sellWaste').innerHTML = "<p>Je kan je afval door een ander op laten ruimen voor: " + FixMoney(objFuelRod.wastePrice) + "  per splijtstofstaaf</p>"
        if (objFuelRod.waste == 0) {
            document.getElementById('fcSellWasteButton').disabled = true;
        } else {
            document.getElementById('fcSellWasteButton').disabled = false;
        }
        return 0;
    },
    sellWaste: function () {
        var totalcost = +objFuelRod.waste * +objFuelRod.wastePrice;
        if (+totalcost < +objMoney.amount) {
            objMoney.use(+totalcost);
            objFuelRod.waste = 0;
            localStorage.setItem('frWaste', objFuelRod.waste);
            objFuelRod.show();
        } else {
            notificationOverlay("Niet genoeg doekoe!", "Verkoop radioactief afval", "fa-euro-sign");
        }
    },
    add: function (amount) {
        objFuelRod.amount = +objFuelRod.amount + +amount;
        if (+objFuelRod.amount > +objFuelRod.storage) {
            objFuelRod.wasteFunction((+objFuelRod.amount - +objFuelRod.storage));
            objFuelRod.amount = +objFuelRod.storageFactor * +objFuelCellFactory.amount
        }
        localStorage.setItem('frAmount', +objFuelRod.amount);
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
        localStorage.setItem('frWaste', objFuelRod.waste);
        objFuelRod.show();
    },
    wastePayment: function () {
        objMoney.use((+objFuelRod.waste * +objFuelRod.wasteCost));
    },
    show: function () {
        document.getElementById('fuelStorage').innerHTML = "<h2>Splijtstofstavenopslag</h2><p>De splijtstofstaven die gemaakt worden kunnen alleen in een centrale of in de " +
            "fabriek worden opgeslagen. Iedere fabriek heeft plek voor " + FixNumber(objFuelRod.storageFactor) + " staven. De totaalcapaciteit in de fabrieken is op dit moment: " +
            FixNumber((+objFuelCellFactory.amount * +objFuelRod.storageFactor)) + " staven</p><p>Restcapaciteit in de fabrieken (opslag): " +
            FixNumber(((+objFuelCellFactory.amount * +objFuelRod.storageFactor) - +objFuelRod.amount)) +
            "<br>Totaalvoorraad splijstsofstaven: " + FixNumber(objFuelRod.amount) + "</p>";
        document.getElementById('fuelStoragePlant').innerHTML = "<p>De opslag in de kerncentrales wordt direct gevuld vanuit de fabrieken.</p>";
        document.getElementById('fuelWaste').innerHTML = "<h3>Afvalopslag</h3><p>Verbruikte splijtstofstaven moeten opgeslagen worden, dit kost geld. Verwerking is op dit moment " +
            "nog niet mogelijk. Ook wanneer je een fabriek of centrale sluit zullen de staven die daar liggen (ook de nieuwe!) naar de afval opslag gebracht worden, deze staven kunnen " +
            "(nog) niet hergebruikt worden!</p><p>Er is onbeperkt ruimte voor de opslag van deze staven. De opslag kost " + FixMoney(objFuelRod.wasteCost) + " per staaf per 60 ticks</p>" +
            "<p>Aantal waste staven in opslag: " + FixNumber(objFuelRod.waste) + "<br>Kosten per 60 ticks: " + FixMoney((+objFuelRod.waste * +objFuelRod.wasteCost)) + "</p>";
    },
    init: function () {
        objFuelRod.waste = localStorage.getItem('frWaste') || 0;
        objFuelRod.amount = localStorage.getItem('frAmount') || 0;
        objFuelRod.storage = +objFuelRod.storageFactor * +objFuelCellFactory.amount;
        if (+objFuelRod.amount > +objFuelRod.storage) {
            var waste = +objFuelRod.amount - +objFuelRod.storage;
            objFuelRod.wasteFunction(+waste);
            objFuelRod.amount = +objFuelRod.storageFactor * +objFuelCellFactory.amount
            localStorage.setItem('frAmount', +objFuelRod.amount)
        };
        objFuelRod.calculateWastePrice(50000,99999);
        objFuelRod.show();
    }
}

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
            notificationOverlay("Niet genoeg centjes!", "Kerncentrale", "fa-euro-sign");
            return 0;
        }
        objMoney.use(objNuclearPowerPlant.plantCost);
        objSteel.use(objNuclearPowerPlant.plantSteelNeeded);
        objNuclearPowerPlant.amount++;
        localStorage.setItem('nppAmount', objNuclearPowerPlant.amount);
        objNuclearPowerPlant.show();
        objNuclearPowerPlant.showUsage();

    },
    buildReactor: function () {
        if (+objSteel.amount < +objNuclearPowerPlant.reactorSteelNeeded) {
            notificationOverlay("Niet genoeg staal!", "Kerncentrale", "fa-box");
            return 0;
        }
        if (+objMoney.amount < +objNuclearPowerPlant.reactorCost) {
            notificationOverlay("Niet genoeg centjes!", "Kerncentrale", "fa-euro-sign");
            return 0;
        }
        if (+objNuclearPowerPlant.amount < 1 || +objNuclearPowerPlant.reactors == (+objNuclearPowerPlant.amount * +objNuclearPowerPlant.plantReactorCap)) {
            notificationOverlay("Geen centrale (of geen ruimte) om de reactor te bouwen!", "Kerncentrale", "fa-euro-sign");
            return 0;
        }

        objMoney.use(objNuclearPowerPlant.reactorCost);
        objSteel.use(objNuclearPowerPlant.reactorSteelNeeded);
        objNuclearPowerPlant.reactors++;
        localStorage.setItem('nrAmount', objNuclearPowerPlant.reactors);
        objNuclearPowerPlant.show();
        objNuclearPowerPlant.showUsage();

    },
    addFuel: function () {
        if (+objNuclearPowerPlant.fuelRods < (+objNuclearPowerPlant.reactorFuelCap * +objNuclearPowerPlant.reactors)) {
            var maxCap = +objNuclearPowerPlant.reactorFuelCap * +objNuclearPowerPlant.reactors;
            var addedRods = objFuelRod.remove((+maxCap - +objNuclearPowerPlant.fuelRods));
            objNuclearPowerPlant.fuelRods = +objNuclearPowerPlant.fuelRods + +addedRods;
            objNuclearPowerPlant.pelletsActive = +objNuclearPowerPlant.pelletsActive + (+addedRods * +objNuclearPowerPlant.fuelRodPellets);
            localStorage.setItem('pelletsActive', +objNuclearPowerPlant.pelletsActive);
            localStorage.setItem('ppFuelRods', +objNuclearPowerPlant.fuelRods);
            objFuelRod.show();
            objNuclearPowerPlant.showUsage();
        }
    },
    removeFuel: function (amount) {
        objNuclearPowerPlant.pelletsUsed = +objNuclearPowerPlant.pelletsUsed + +amount;
        objNuclearPowerPlant.pelletsActive = +objNuclearPowerPlant.pelletsActive - +amount;
        while (+objNuclearPowerPlant.pelletsUsed > 1000) {

            if (+objNuclearPowerPlant.fuelRods > 0) {
                objNuclearPowerPlant.fuelRods = +objNuclearPowerPlant.fuelRods - 1;
            }
            objNuclearPowerPlant.pelletsUsed = +objNuclearPowerPlant.pelletsUsed - 1000;
            objFuelRod.wasteFunction(1);
            //objNuclearPowerPlant.addFuel();
            objFuelRod.show();
            objNuclearPowerPlant.showUsage();
        }
        localStorage.setItem('pelletsUsed', +objNuclearPowerPlant.pelletsUsed)
        objNuclearPowerPlant.show();

    },
    produce: function () {
        objNuclearPowerPlant.addFuel();
        objNuclearPowerPlant.activeReactors = +objNuclearPowerPlant.reactors;
        if (+objNuclearPowerPlant.pelletsActive < +objNuclearPowerPlant.reactors) {
            objNuclearPowerPlant.activeReactors = Math.floor(+objNuclearPowerPlant.pelletsActive / +objNuclearPowerPlant.reactors);
        }
        objNuclearPowerPlant.removeFuel(+(+objNuclearPowerPlant.activeReactors * +objNuclearPowerPlant.reactorFuelUsage));
        var nppProduction = +objNuclearPowerPlant.activeReactors * +objNuclearPowerPlant.reactorProduction;
        objNuclearPowerPlant.showUsage();
        return +nppProduction;

    },
    show: function () {
        document.getElementById('npp').innerHTML = "<h2>Kernenergie</h2><p>Een kerncentrale bestaat uit twee elementen, de centrale zelf en de reactoren. Iedere centrale bied plek aan " +
            FixNumber(objNuclearPowerPlant.plantReactorCap) + " reactoren.</p><p>Het bouwen van een kerncentrale kost: <br>Staal: " + FixNumber(objNuclearPowerPlant.plantSteelNeeded) +
            " <br>Financiën: " + FixMoney(objNuclearPowerPlant.plantCost) + "</p>";
        if (+objNuclearPowerPlant.amount < 1 || +objNuclearPowerPlant.reactors == (+objNuclearPowerPlant.amount * +objNuclearPowerPlant.plantReactorCap)) {
            document.getElementById('npprBuild').disabled = true;
        } else {
            document.getElementById('npprBuild').disabled = false;
        }
        document.getElementById('nppr').innerHTML = "<h3>Reactoren</h3><p>Iedere reactor die je bouwt levert energie (als er brandstof is). Reactoren kunnen niet verkocht worden" +
            " en staan aan of uit, eventueel teveel geproduceerde stroom gaat verloren!</p><p>De kosten van de bouw: <br>Staal: " + FixNumber(objNuclearPowerPlant.reactorSteelNeeded) +
            "<br>Financiën: " + FixMoney(objNuclearPowerPlant.reactorCost) + "</p><p>Een reactor verbruikt: " + FixNumber(objNuclearPowerPlant.reactorFuelUsage) + " uranium pellets per tick " +
            "(er zitten 1000 pellets in een splijtstofstaaf). Verbruikte pellets worden opnieuw verpakt in staven (per 1000) gaan automatisch naar de waste opslag</p>";


    },
    showUsage: function () {
        document.getElementById('nppsum').innerHTML = "<p>Je hebt op dit moment:<br>Kerncentrales: " + FixNumber(objNuclearPowerPlant.amount) + "<br> Kernreactoren (actief/totaal): " +
            FixNumber(objNuclearPowerPlant.activeReactors) + "/" + FixNumber(objNuclearPowerPlant.reactors) + " <br>Splijtstofstaven (aanwezig/max): " +
            FixNumber(objNuclearPowerPlant.fuelRods) + "/" + FixNumber((+objNuclearPowerPlant.reactors * +objNuclearPowerPlant.reactorFuelCap)) +
            "<br>waste pellets: " + FixNumber(objNuclearPowerPlant.pelletsUsed) + " <br></p>" +
            "<p>Energieproductie: " + FixNumber((+objNuclearPowerPlant.activeReactors * +objNuclearPowerPlant.reactorProduction)) + " <br>Pelletverbruik (per tick): " +
            FixNumber((+objNuclearPowerPlant.activeReactors * +objNuclearPowerPlant.reactorFuelUsage)) + "</p>";
    },
    init: function () {
        objNuclearPowerPlant.fuelRods = localStorage.getItem('ppFuelRods') || 0;
        objNuclearPowerPlant.amount = localStorage.getItem('nppAmount') || 0;
        objNuclearPowerPlant.reactors = localStorage.getItem('nrAmount') || 0;
        objNuclearPowerPlant.pelletsActive = localStorage.getItem('pelletsActive') || 0;
        objNuclearPowerPlant.pelletsUsed = localStorage.getItem('pelletsUsed') || 0;
        objNuclearPowerPlant.show();
    }
}

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
            notificationOverlay("Geen pompen om te upgraden!", "High Tech Oliepomp", "fa-info-circle");
        };
        var amountResult = objOilPumpAdv.buildCheck(+amount);
        if (+amountResult > 0) {
            objOilPump.remove(+amountResult);
            objOilPumpAdv.add(+amountResult, 1);
        } else {
            return 0;
        }
    },
    buildCheck: function (amount) {
        if ((+amount * +objOilPumpAdv.price) > +objMoney.amount) {
            amount = Math.floor(+objMoney.amount / +objOilPumpAdv.price);
        };
        if (+amount == 0) {
            notificationOverlay("Niet genoeg monnies!", "High Tech Oliepomp", "fa-euro-sign");
        };
        if ((+amount * objOilPumpAdv.steelNeeded) > +objSteel.amount) {
            amount = Math.floor(+objSteel.amount / +objOilPumpAdv.steelNeeded);
        }
        if (+amount == 0) {
            notificationOverlay("Niet genoeg staal!", "High Tech Oliepomp", "fa-box");
        };
        return +amount;
    },
    add: function (amount, checked) {
        if (+checked == 0) {
            amount = objOilPumpAdv.buildCheck(amount);
        }
        if (+amount == 0) {
            return 0;
        } else {
            objMoney.use((+objOilPumpAdv.price * +amount));
            objSteel.use((+objOilPumpAdv.steelNeeded * +amount));
            objOilPumpAdv.amount = +objOilPumpAdv.amount + +amount;
        }
        localStorage.setItem('oilPumpAmount', objOilPumpAdv.amount);
        objOilPumpAdv.show();
    },
    sell: function(){
        if (+objOilPumpAdv.amount > 0) {
            objMoney.add(+objOilPumpAdv.price, "Verkoop oliepomp", 19, 1);
            objOilPumpAdv.amount = +objOilPumpAdv.amount - 1; 
            localStorage.setItem('oilPumpAmount', objOilPumpAdv.amount);
            objOilPumpAdv.show();
        } else {
            document.getElementById('o2sell').disabled = true;
            notificationOverlay("Geen pompen om te verkopen!", "High Tech Oliepomp", "fa-box");
        }

    },
    produce: function () {
        var pumpsActive = objOilPumpAdv.amount;
        if ((+objOilPumpAdv.amount * +objOilPumpAdv.energy) > +objEnergy.available) {
            pumpsActive = Math.floor(+objEnergy.available / (+pumpsActive * +objOilPumpAdv.energy));
        };
        objEnergy.use((+pumpsActive * +objOilPumpAdv.energy), "Oliepompen");
        var productionTemp = +pumpsActive * objOilPumpAdv.production;
        objOilPumpAdv.showStats();
        return +productionTemp;
    },
    show: function () {
        if (+objOilPump.amount == 0 && +objOilPumpAdv.amount > 0) {
            document.getElementById('oil1').style.display = "none";
        }
        if (+objPlayerInfo.level > 9) {
            document.getElementById('oil2').style.display = "";
        } else {
            document.getElementById('oil2').style.display = "none";
        }
        document.getElementById('o2intro').innerHTML = "<h3>High Tech oliepomp</h3><p>Met een productie van " + FixNumber(objOilPumpAdv.production) + " olie per tick presteren deze " +
            "pompen aanzienlijk beter dan het oude model. Een pomp gebruikt " + FixNumber(objOilPumpAdv.energy) + " energie per tick</p><p>Het bouwen van een nieuwe pomp kost: " +
            FixMoney(objOilPumpAdv.price) + " en " + FixNumber(objOilPumpAdv.steelNeeded) + " ton staal</p>";
        if (+objOilPump.amount > 0) {
            document.getElementById('o2upgrade').innerHTML = "<p>Je kan je oude pompen upgraden. Het oude model wordt verkocht (75% van de aanschafwaarde, " +
                FixMoney((+objOilPump.price * 0.75)) + ") en een nieuwe pomp wordt geplaatst</p>";
        } else {
            document.getElementById('o2upgradeButton').style.display = "none";
        }
        if (objOilPumpAdv.amount == 0) {
            document.getElementById('o2sell').disabled = true;
        } else {
            document.getElementById('o2sell').disabled = false;
        }
        objOilPumpAdv.showStats();

    },
    showStats: function () {
        document.getElementById('o2stats').innerHTML = "<h2>Stats</h2><p>Aantal pompen: " + FixNumber(objOilPumpAdv.amount) +
            "<br>Productie (per tick): " + FixNumber((+objOilPumpAdv.amount * +objOilPumpAdv.production)) +
            "<br>Energieverbruik (per tick):" + FixNumber((+objOilPumpAdv.amount * +objOilPumpAdv.energy)) +
            " </p>";
    },
    init: function () {
        objOilPumpAdv.amount = localStorage.getItem('oilPumpAmount') || 0;
    }
}

// Notificatie functie
function notificationOverlay(messageText, messageTitle, messageIcon) {
    var container = document.getElementById("notif");
    var length = container.children.length;

    if (length >= 3) {
        container.firstChild.remove();
    }

    container.innerHTML +=
        '<div class="notification-tooltip" onclick="closeNotification(this)">' +
        '<div class="icon">' +
        '<i class="fas ' + messageIcon + '"></i>' +
        '</div>' +
        '<div class="text"><h5>' + messageTitle + '</h5><p>' + messageText + '</p></div>' +
        '<div class="close-notification"></div>' +
        '</div>';
}

function closeNotification(el) {
    el.remove();
}

// History functie voor inkomsten
var messages = [];
function showHistory(messageText) {
    if (messages.length > 4) {
        messages.pop();
    }
    messageHistory = document.getElementById('HistoryMessages');
    messageHistory.innerHTML = "Laatste stortingen: <br>";
    messages.unshift(messageText);
    messages.forEach(displayMessages)
    function displayMessages(item, index) {
        messageHistory.innerHTML = messageHistory.innerHTML + item + "<br>";
    }

}

//Gebruiken resources
function useResource(typeResource, amountUsed, lsValue) {
    var scope = this;
    if (+amountUsed >= +scope[typeResource].amount) {
        delivered = scope[typeResource].amount;
        scope[typeResource].amount = 0;
        localStorage.setItem(lsValue, +scope[typeResource].amount);
        scope[typeResource].show();
        return delivered;
    }
    scope[typeResource].amount = +scope[typeResource].amount - +amountUsed;

    localStorage.setItem(lsValue, +scope[typeResource].amount);
    scope[typeResource].show();
    return amountUsed;
}

// Vullen storage / silos
function fillStorage(typeStorage, amountAdded, lsValue) {
    var scope = this;
    var SpaceLeft = ((+scope[typeStorage].storage * +scope[typeStorage].storageCap) - +scope[typeStorage].amount);
    if (+amountAdded > +SpaceLeft) {
        scope[typeStorage].amount = +scope[typeStorage].amount + +SpaceLeft;
        var Rest = +amountAdded - +SpaceLeft;
        scope[typeStorage].sell(+Rest);
    } else {
        scope[typeStorage].amount = +scope[typeStorage].amount + +amountAdded;
    };
    localStorage.setItem(lsValue, +scope[typeStorage].amount);
    scope[typeStorage].show();
}

// Debug functie
function showMessage(description, value) {
    if (localStorage.getItem('debug') == 1) {
        console.log(description + ": " + value);
    }
    return 0;
}

// LS omzetten in base64 string
function saveProgress() {
    var lsExport = [];
    for (var i = 0, iC = localStorage.length; i < iC; ++i) {
        var storageKey = localStorage.key(i);
        lsExport.push(storageKey + ':' + localStorage.getItem(storageKey));
    };
    var encoded = btoa(JSON.stringify(lsExport));
    return encoded;
}

// Savegame uploaden naar backend
function pushProgress() {
    var progressString = saveProgress();
    var uuid = localStorage.getItem('onlineUserID')

    var data = "id=" + uuid + "&savegame=" + progressString + "&type=save";

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            // ruimte voor debug
        }
    });

    xhr.open("POST", "/inc/connector.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cache-Control", "no-cache");


    xhr.send(data);

}

var objSaveGame = {
    Created_date: 0,
    _id: 0,
    saveGame: 0,
    userId: 0,
    typeSave: 0,
    __v: 0,
}

// Savegame maken-

function saveFixed() {
    var progress = saveProgress();
    var uuid = localStorage.getItem('guid')

    var data = "id=" + uuid + "&savegame=" + progress + "&type=save_pers";

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState == 4 && this.status == 200) {
            objSaveGame = JSON.parse(this.responseText);
            var uuid = objSaveGame._saveid;
            var dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.setAttribute("id", "dummy_id");
            dummy.setAttribute('value', uuid)
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            var onzin = prompt("De savegamecode is naar je clipboard geschreven! Je kan de code hier onder ook handmatig kopieren", uuid);
        }
    });

    xhr.open("POST", "/inc/connector.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cache-Control", "no-cache");

    xhr.send(data);
}

// Importeren LS waardes
function importFile() {
    var gamerCode = prompt("Voor de gexporteerde code in:");
    // ophalen waardes via API
    getSaveGame(gamerCode);
}

// Ophalen savegame via API
function getSaveGame(uuid) {

    var data = "id=" + uuid + "&type=restore";
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            localStorage.setItem('onlineUserID', objSaveGame._id)
            objSaveGame = JSON.parse(this.responseText);
            var encodedFile = objSaveGame.saveGame;
            var decodedFile = JSON.parse(atob(encodedFile));
            var arrayLength = decodedFile.length;
            var counter = 0;
            localStorage.clear;
            for (var i in decodedFile) {
                var lsFields = decodedFile[counter].split(":");
                localStorage.setItem(lsFields[0], lsFields[1]);
                counter++;
            }
            localStorage.setItem('onlineUserID', 0);
            identUser();
            location.reload();
        }
    });

    xhr.open("POST", "/inc/connector.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cache-Control", "no-cache");


    xhr.send(data);

    ;

}

// Registreren verkoop
function registerSale(tt, amount, profit) {
    // var uuid = localStorage.getItem('guid');
    // var data = "id=" + uuid + "&type=" + tt + "&amount=" + amount + "&profit=" + profit;
    // var xhr = new XMLHttpRequest();

    // xhr.open("POST", "/inc/salesconnector.php");
    // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // xhr.setRequestHeader("Cache-Control", "no-cache");

    // xhr.addEventListener("readystatechange", function () {
    //     if (this.readyState === 4) {
    //         // Melding eventueel
    //     }
    // });

    // xhr.send(data);


}

// Genoeg geld functie
function moneyCheck(amountNeeded) {
    if (+amountNeeded <= +objMoney.amount) {
        return 1;
    } else {
        return 0;
    }
}

// Verkoopmenu
var quickSell = localStorage.getItem('QS') || 0;

function showQuickSell(inputQS) {

    if (inputQS == 1) {
        if (quickSell == 0) {
            quickSell = 1;
        } else {
            quickSell = 0;
        }
    }

    if (quickSell == 1) {
        document.getElementById("sellMenu").style.display = "";
        localStorage.setItem('QS', quickSell);
        quickSellMenu();
        quickSellButtons();
    } else {
        document.getElementById("sellMenu").style.display = "none";
        localStorage.setItem('QS', quickSell);
    }

}

function quickSellMenu() {
    if (objPlayerInfo.level < 9) {
        return 0;
    }
    document.getElementById("quickGrain").innerHTML = "<h2>Graan</h2><p>Voorraad: " + FixNumber(objGrainSilo.contents) +
        "<br>En de huidige prijs is: " + FixMoney(objGrain.price) + "</p>";
    document.getElementById("quickFlour").innerHTML = "<h2>Bloem</h2><p>Voorraad: " + FixNumber(objFlourSilo.contents) +
        "<br>En de huidige prijs is: " + FixMoney(objFlour.price) + "</p>";
    document.getElementById("quickPasta").innerHTML = "<h2>Pasta</h2><p>Voorraad: " + FixNumber(objStorehouse.pasta) +
        "<br>En de huidige prijs is: " + FixMoney(objPasta.price()) + "</p>";
    document.getElementById("quickOil").innerHTML = "<h2>Olie</h2><p>Voorraad: " + FixNumber(objOilTank.contents) +
        "<br>En de huidige prijs is: " + FixMoney(objOil.price) + "</p>";
    document.getElementById("quickCoal").innerHTML = "<h2>Steenkool</h2><p>Voorraad: " + FixNumber(objCoal.amount) +
        "<br>En de huidige prijs is: " + FixMoney(objCoal.price) + "</p>";
    document.getElementById("quickIronOre").innerHTML = "<h2>IJzererts</h2><p>Voorraad: " + FixNumber(objIronOre.amount) +
        "<br>En de huidige prijs is: " + FixMoney(objIronOre.price) + "</p>";
    document.getElementById("quickSteel").innerHTML = "<h2>Staal</h2><p>Voorraad: " + FixNumber(objSteel.amount) +
        "<br>En de huidige prijs is: " + FixMoney(objSteel.price) + "</p>";

}

function quickSellButtons() {
    if (objPlayerInfo.level < 9) {
        return 0;
    }
    document.getElementById("quickGrainBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objGrain.sell()' id='QSGrain'>Verkoop</button> </p>";
    document.getElementById("quickFlourBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objFlour.sell()' id='QSFlour'>Verkoop</button> </p>";
    document.getElementById("quickPastaBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objPasta.sell()' id='QSPasta'>Verkoop</button> </p>"
    document.getElementById("quickOilBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objOil.sellOil()' id='QSOil'>Verkoop</button> </p>"
    document.getElementById("quickCoalBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objCoal.sell(0)' id='QSCoal'>Verkoop</button> </p>";
    document.getElementById("quickIronOreBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objIronOre.sell(0)' id='QSIronOre'>Verkoop</button> </p>";
    document.getElementById("quickSteelBTN").innerHTML = "<p><button type='button' class='btn btn-danger' onClick='objSteel.sell(0)' id='QSSteel'>Verkoop</button> </p>";
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
    if (paused == 0) {
        paused = 1;
    } else {
        paused = 0;
    }
}

// Loops voor counters
var timerCounter = 0;
var paused = 0;
var loopsProduction = setInterval(
    function () {
        if (paused == 0) {
            if (+objOilPump.amount > 0 || +objOilPumpAdv.amount > 0) {
                objOil.produceOil();
            }
            if (+objMines.coalAmountActive >= 1) {
                objCoalMine.produce();
            }
            if (+objMines.ironAmountActive >= 1) {
                objIronMine.produce();

            }
            objEnergy.produce();
            objPlayerInfo.levelup();
            if (objWindmill.running == 0 && objWindmillController.amount >= 1) {
                objWindmill.autogrind();
            }

            timerCounter++;
            if (+timerCounter % 5 == 0) {
                if (+objSalesComputer.cpu > 0) {
                    objSalesComputer.autoSell();
                }
                objOil.priceCalc();
                if (+objPlasticFactory.amount > 0 || +objPlastic.amount > 0) {
                    objPlastic.showPrice();
                }
                objGrain.priceCalc();
                if (+objIronMelter.amount > 0) {
                    objSteel.price = ((objIronOre.price * 10) + (+ objCoal.price)) * 1.25;
                    objSteel.showPrice();
                }
                showPrice();

                if (+objSalesComputer.cpu > 0) {
                    objSalesComputer.showOil(localStorage.getItem('autoOil'));
                    objSalesComputer.showFlour(localStorage.getItem('autoFlour'));
                    objSalesComputer.showPasta(localStorage.getItem('autoPasta'));
                    objSalesComputer.showKunststof(localStorage.getItem('autoKunststof'));
                }
                if (objChicken.amount >= 1) {
                    objChicken.makeEggs();
                };
                if (+objFuelCellFactory.amount > 0) {
                    objFuelRod.calculateWastePrice(50000,99999);
                }
            }
            if (+timerCounter % 10 == 0) {
                if (+objMines.uraniumAmountActive >= 1) {
                    objUraniumMine.produce();
                }
            }
            if (+timerCounter % 15 == 0) {
                objPastaHelper.action();
                if (objPlasticFactory.workers > 0) {
                    objPlasticFactory.produce(1);
                }
            }
            if (+timerCounter % 60 == 0) {
                if (+objFuelRod.waste > 0) {
                    objFuelRod.wastePayment();
                }
            }
            if (quickSell == 1) {
                quickSellMenu();
            }
            if (objFuelCellFactory.amount > 0) {
                objFuelCellFactory.produce();
            }
        }
    }, 1000);
