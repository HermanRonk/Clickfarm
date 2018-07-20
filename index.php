<!DOCTYPE html>
<html lang="en">

<head>
<!-- Matomo -->

<!-- End Matomo Code -->
    <title>Clickfarm.nl</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <script src="./inc/base.js?<?= filemtime('./inc/base.js')?>"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous">
    <link rel="stylesheet" href="./css/style.css?<?= filemtime('./css/style.css')?>">
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <a class="navbar-brand" href="#">Clickfarm.nl</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                    <a class="nav-link" href="#">Home
                        <span class="sr-only">(current)</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://hermanronk.nl">hermanronk.nl</a>
                </li>

                <li class="nav-item dropdown">
                    <button class="btn btn-link nav-link dropdown-toggle" id="navbarDonateDropdown" role="button" data-toggle="dropdown" aria-haspopup="true"
                        aria-expanded="false">
                        Donatie
                    </button>
                    <div class="dropdown-menu" aria-labelledby="navbarDonateDropdown">
                        <a class="dropdown-item" target="_blank" href="https://paypal.me/clickfarmgame"><i class="fab fa-fw fa-paypal"></i> Donatie PayPal</a>
                        <a class="dropdown-item" target="_blank" href="https://bunq.me/game"><i class="far fa-fw fa-credit-card"></i> Donatie Overig</a>
                    </div>

                </li>

                <li class="nav-item dropdown">
                    <button class="btn btn-link nav-link dropdown-toggle" id="navbarOptionDropdown" data-toggle="dropdown" aria-haspopup="true"
                        aria-expanded="false">
                        Game opties
                    </button>
                    <div class="dropdown-menu" aria-labelledby="navbarOptionDropdown">
                        <button onclick="resetGame()" class="dropdown-item"><i class="fas fa-fw fa-power-off"></i> Reset Game</button>
                        <hr>
                        <button id="pauseBTN" onclick="changeState()" class="dropdown-item"><i class="fas fa-fw fa-pause"></i> Pauzeer spel</button>
                        <button id="verkooptabBTN" onclick="showQuickSell(1)" class="dropdown-item"><i class="far fa-fw fa-square"></i> Zet verkooptab aan (lvl9)</button>
                        <button id="debugBTN" onclick="turnDebug(1)" class="dropdown-item"><i class="far fa-fw fa-square"></i> Zet debug aan</button>
                        <hr>
                        <button onclick="saveFixed()" class="dropdown-item"><i class="fas fa-fw fa-upload"></i> Exporteer save ID</button>
                        <button onclick="importFile()" class="dropdown-item"><i class="fas fa-fw fa-download"></i> Importeer game/save ID</button>
                    </div>

                </li>
                <li class="nav-item statsbar" id="MoneyTop"> </li>
                <li class="nav-item statsbar" id="GrainTop"> </li>
                <li class="nav-item statsbar" id="FlourTop"> </li>
                <li class="nav-item statsbar" id="OilTop"> </li>
                <li class="nav-item statsbar" id="EnergyStats"></li>
            </ul>

        </div>
    </nav>


    <div class="container-fluid" id="FirstTab">
        <div class="row border border-success rows" id="stats-row">
            <div class="container col-sm" id="geld-col">
                <div id="debug"></div>
                <h2>Financiën:</h2>
                <div id="MoneyAmount"></div>
                <div id="HistoryMessages"></div>
            </div>
            <div class="container col-sm" id="level-col">
                <h2>Level:</h2>
                <div id="currentlevel"></div>
                <div id="nextlevel"></div>
            </div>
            <div class="container col-sm" id="opslag-col">
                <h2>Voorraden:</h2>
                <div id="Grainstock"></div>
                <div id="Flourstock"></div>
                <div id="Oilstock"></div>
            </div>
            <div class="container col-sm" id="energy-col">
                <h2>Energie:</h2>
                <div id="TotalEnergyProduction"></div>
                <div id="CurrentEnergyUsage"></div>
                <div id="AvailableEnergy"></div>
                <div id="OilUsage"></div>
            </div>
        </div>

        <div class="row border border-warning rows" id="sellMenu">
            <div class="container col-sm">
                <div id="quickGrain"></div>
                <div id="quickGrainBTN"></div>
            </div>
            <div class="container col-sm">
                <div id="quickFlour"></div>
                <div id="quickFlourBTN"></div>
            </div>
            <div class="container col-sm">
                <div id="quickPasta"></div>
                <div id="quickPastaBTN"></div>
            </div>
            <div class="container col-sm">
                <div id="quickOil"></div>
                <div id="quickOilBTN"></div>
            </div>
            <div class="container col-sm">
                <div id="quickCoal"></div>
                <div id="quickCoalBTN"></div>
            </div>
            <div class="container col-sm">
                <div id="quickIronOre"></div>
                <div id="quickIronOreBTN"></div>
            </div>
            <div class="container col-sm">
                <div id="quickSteel"></div>
                <div id="quickSteelBTN"></div>
            </div>
        </div>

        <div class="row border border-warning rows" id="tier1-row">
            <div class="container col-sm" id="landbouw-col">
                <h2>Landbouw:</h2>
                <div id="Farmland"></div>
                <div id="FarmManual">
                    <button id="farmlandWorkBTN" type="button" class="btn btn-success" onClick="objFarmland.work()">Bewerk landbouwgrond</button>
                    <div id="FarmlandTimer"></div>
                </div>
                <div id="FarmHarvestPerField"></div>
                <h3>Uitbreiden:</h3>
                <div id="FarmlandPrice"></div>
                <button type="button" class="btn btn-primary" onClick="objFarmland.addfarm()">Koop landbouwgrond</button>
            </div>

            <div class="container col-sm" id="grain-col">
                <h2>Graan:</h2>
                <div id="GrainAmount"></div>
                <div id="GrainPrice"></div>
                <button type="button" class="btn btn-danger" onClick="objGrain.sell()">Verkoop graan!</button>
                <div id="GrainSilo"></div>
                <h2>Koop extra silo's:</h2>
                <div id="GrainSiloPrice"></div>
                <button type="button" class="btn btn-primary" onClick="objGrainSilo.add();">Koop graan silo</button>
            </div>
            <div class="container col-sm" id="flour-col">
                <h2>Bloem:</h2>
                <div id="FlourSilo"></div>

                <div id="Flour"></div>
                <div id="FlourPrice"></div>
                <button type="button" class="btn btn-danger" onClick="objFlour.sell()">Verkoop bloem!</button>
                <h2>Koop extra silo's</h2>
                <div id="FlourSiloPrice"></div>
                <button type="button" class="btn btn-primary" onClick="objFlourSilo.add();">Koop bloem silo</button>

            </div>
        </div>
        <div class="row border border-warning rows" id="automation-row">
            <div class="container col-sm" id="farmland-automation">
                <h2>Automatiseer:</h2>
                <p>Farm robots verbruiken 15 energie en kunnen 10 velden bewerken.</p>
                <div id="ShowFarmRobot"></div>
                <div id="FarmRobotPrice"></div>
                <button type="button" class="btn btn-primary" onClick="objFarmRobot.add();">Koop robot</button>
                <button type="button" class="btn btn-warning" onClick="objFarmRobot.sell();" id="SellFarmRobot">Verkoop robot</button>
                <div id="RobotTimer"></div>
            </div>
            <div class="container col-sm" id="windmills-col">
                <h2>Windmolens</h2>
                <div id="WindmillCost"></div>
                <button type="button" class="btn btn-primary" onClick="objWindmill.add(this)">Bouw windmolen</button>
                <div id="Windmills"></div>
                <div id="WindmillCap"></div>
                <h2>Maal graan tot bloem</h2>
                <button type="button" class="btn btn-success" onClick="objWindmill.grind()" id="GrindGrain">Vermaal graan!</button>
                <div id="GrindTimer"></div>
            </div>
            <div class="container col-sm" id="WindmillController">
                <h2>Robotiseren windmolens:</h2>
                <div id="WindmillControllerInfo"></div>
                <div id="WindmillControllerCost"></div>
                <div id="SellWindmillController"></div>
                <button type="button" class="btn btn-primary" onClick="objWindmillController.add(this)">Bouw windmolencontroller</button>
                <button type="button" class="btn btn-warning" onClick="objWindmillController.sell(this)">Verkoop windmolencontroller</button>
                <div id="AutoGrindTimer"></div>


            </div>
        </div>
        <div class="row border border-dark rows" id="tier2-row">
            <div class="container col-sm" id="olie-col">
                <h2>Olie:</h2>
                <button type="button" class="btn btn-dark" onClick="objOilTank.fill(1)">Pomp olie!</button>
                <div id="clickCount"></div>
                <div id="Oilprice"></div>
                <button type="button" class="btn btn-danger" onClick="objOil.sellOil()">Verkoop olie!</button>
                <h2>Koop extra olietanks:</h2>
                <div id="OilTankPrice"></div>
                <div id="oilTank"></div>
                <div id="oilTankSmall">
                    <p><button type="button" class="btn btn-primary" onClick="objOilTank.add(0);" id="buySmallOilTank">Koop olietank</button> <button type="button" class="btn btn-danger" onClick="objOilTank.remove();" id="sellOilTank">Verkoop olietank</button> </p>
                </div>
                <div id="oilTankBig">
                    <p><button type="button" class="btn btn-primary" onClick="objOilTank.add(1);" id="oilTankAddBig">Koop olietank (groot)</button></p>
                    
                </div>
                 
                <div id="pomp-col">
                    <h2>Automatiseer:</h2>
                    <div id="oil1">
                        <p>Een oliepomp verbruikt 1 energie per tick (en produceert 1 olie per tick</p>
                        <button type="button" class="btn btn-primary" onClick="objOilPump.add();">Bouw!</button> <button type="button" class="btn btn-warning" onClick="objOilPump.remove(1);" id="sellOilPump">Verkoop!</button>
                        <div id="FactoryCost"></div>
                        <div id="FactoryCount"></div>
                    </div>
                    <div id="oil2">
                    <div id="o2intro"></div> 
                    <div id="o2buttons">
                            <button type='button' class='btn btn-primary' onClick='objOilPumpAdv.add(1,0);' id='v2buy'>Koop v2 oliepomp</button> <button type='button' class='btn btn-warning' onClick='objOilPumpAdv.sell();' id='o2sell'>Verkoop v2 oliepomp</button>
                    </div><br>
                    <div id="o2upgrade"></div>
                    <div id="o2upgradeButton">
                            <button type='button' class='btn btn-primary' onClick='objOilPumpAdv.upgrade(1);' id='v2upgrade'>Upgrade 1x</button> <button type='button' class='btn btn-primary' onClick='objOilPumpAdv.upgrade(10);' id='o2buy'>Upgrade 10x</button>
                    </div>

                    <div id="o2stats"></div>   
                    </div>
                </div>
            </div>
            <div class="container col-sm" id="energieproductie-col">
                <h2>Energie (olie):</h2>
                <div id="PowerPlantAmount"></div>
                <div id="PowerPlantPrice"></div>
                <p>Bouw een simpele energiecentrale:</p>
                <p>(Gebruikt 1 olie per tick, levert 10 energie)</p>
                <div id="SellPowerPlant"></div>
                <button type="button" class="btn btn-primary" onClick="objPowerPlant.add();">Bouw!</button>
                <button type="button" class="btn btn-warning" onClick="objPowerPlant.sell();" id="powerPlantSell">Verkoop!</button>

                <h2>Energieopslag:</h2>
                <div id="EnergieOpslag"></div>
                <button type="button" class="btn btn-primary" onClick="objEnergy.addCapa(1);">Bouw opslag!</button>
                <button type="button" class="btn btn-primary" onClick="objEnergy.addCapa(10);">x10</button>
                <button type="button" class="btn btn-primary" onClick="objEnergy.addCapa(100);">x100</button>
                <button type="button" class="btn btn-primary" onClick="objEnergy.addCapa(1000);">x1000</button>
                <button type="button" class="btn btn-primary" onClick="objEnergy.addCapa(10000);">x10000</button>
            </div>
            <div class="container col-sm" id="coalPower">
                <div id="CoalPowerPlantAmount"></div>
                <div id="CoalPowerPlantPrice"></div>
                <div id="CoalStock"></div>
                <div id="CoalSellPowerPlant"></div>
            </div>
        </div>
        <div class="row border border-dark rows" id="productie-row">
            <div class="container col-sm" id="chicken-col">
                <h2>Eieren:</h2>
                <h3>Kippenboerderij:</h3>
                <div id="ChickenFarm"></div>
                <button type="button" class="btn btn-primary" onclick="objChickenFarm.add();" id="purchaseChickenFarm">Bouw een kippenboerderij</button>
                <button type="button" class="btn btn-primary" onclick="objEgg.addStorageUnit();" id="purchaseEggStorage">Bouw een eieropslag</button>
                <h3>Kippen:</h3>
                <div id="Chickens"></div>
                <button type="button" class="btn btn-outline-success" onclick="objChicken.add(1);">+1</button>
                <button type="button" class="btn btn-outline-success" onclick="objChicken.add(100);">+100</button>
                <button type="button" class="btn btn-outline-success" onclick="objChicken.add(1000);">+1.000</button>
                <button type="button" class="btn btn-outline-success" onclick="objChicken.add(10000);">+10.000</button>
                <button type="button" class="btn btn-outline-success" onclick="objChicken.add(100000);">+100.000</button>
                <h3>Verkopen:</h3>
                <div id="eggs"></div>
                <div id="eggStock"></div>
                <button type="button" class="btn btn-danger" onClick="objEgg.sell('Alles','-')">Verkoop alle eieren</button>
            </div>
            <div class="container col-sm" id="pasta-col">
                <h2>Pasta:</h2>
                <div id="PastaFactory"></div>
                <button type="button" class="btn btn-primary" onClick="objPastaFactory.add();">Bouw pastafabriek</button>
                <button type="button" class="btn btn-warning" onClick="objPastaFactory.sell();">Verkoop pastafabriek</button>
                <h3>Maak pasta:</h3>
                <div id="PastaInstruction"></div>
                <button type="button" class="btn btn-dark" onClick="objPastaFactory.produce('manual');">Maak pasta</button>
                <div id="pastaHelperDiv"></div>
                <h2>Voorraden:</h2>
                <div id="StorehousePasta"></div>
                <h2>Verkopen:</h2>
                <div id="SellPasta"></div>
                <button type="button" class="btn btn-danger" onClick="objPasta.sell('Reguliere verkoop Pasta')">Verkoop Pasta!</button>
            </div>
        </div>
        <div class="row border border-dark rows" id="onderzoek-row">
            <div class="container col-sm" id="graanopbrengst-col">
                <h2>Onderzoek:</h2>
                <h3>Veredeling graan:</h3>
                <div id="GrainResearchCost"></div>
                <button type="button" class="btn btn-primary" onClick="objFarmland.research();" id="GRButton">Start onderzoek</button>
                <div id="GrainResearchTimer"></div>

                <div id="MiningResearch-col">
                    <h3>Onderzoek mijnbouw:</h3>
                    <div id="MiningLevel"></div>
                    <div id="ResDesc"></div>
                    <button type="button" class="btn btn-primary" onClick="objResearch.doResearch(this);" id="MiningResearch">Start onderzoek</button>
                    <div id="ResearchTimer"></div>
                </div>
            </div>
            <div class="container col-sm" id="AutoSell-col">
                <h2>Automatisch verkopen resources:</h2>
                <div id="autoSellIntro"></div>
                <button type="button" class="btn btn-primary" onClick="objSalesComputer.add();" id="addCPU">Implementeer extra CPU</button>
                <button type="button" class="btn btn-warning" onClick="objSalesComputer.remove();" id="sellCPU">Verkoop CPU</button>
                <div id="autoSellOil"></div>
                Actief:
                <input type="checkbox" id="autoOilCheck" onchange="objSalesComputer.checkOil(this.checked)">
                <input class="custom-range " id="SliderOil" type="range" min="0" max="20" step="1" value="20" onchange="objSalesComputer.showOil(this.value)" oninput="objSalesComputer.showOil(this.value)"
                />
                <div id="autoSellFlour"> </div>
                Actief:
                <input type="checkbox" id="autoFlourCheck" onchange="objSalesComputer.checkFlour(this.checked)">
                <input class="custom-range " id="SliderFlour" type="range" min="0" max="875" step="25" value="875" onchange="objSalesComputer.showFlour(this.value)" oninput="objSalesComputer.showFlour(this.value)"
                />
                <div id="autoSellPasta"> </div>
                Actief:
                <input type="checkbox" id="autoPastaCheck" onchange="objSalesComputer.checkPasta(this.checked)">
                <input class="custom-range " id="SliderPasta" type="range" min="0" max="450" step="25" value="450" onchange="objSalesComputer.showPasta(this.value)" oninput="objSalesComputer.showPasta(this.value)"
                />
                <div id="autoSellKunststof"> </div>
                Actief:
                <input type="checkbox" id="autoKunststofCheck" onchange="objSalesComputer.checkKunststof(this.checked)">
                <input class="custom-range " id="SliderKunststof" type="range" min="0" max="260" step="10" value="260" onchange="objSalesComputer.showKunststof(this.value)" oninput="objSalesComputer.showKunststof(this.value)"
                />

            </div>
        </div>
        <div class="row border border-dark rows" id="plastic-row">
            <div class="container col-sm" id="platicFactory-col">
                <div id="pFactory1"></div>
                <div>
                    <button type="button" class="btn btn-primary" onClick="objPlasticFactory.addFactory(1);" id="addPlasticFactory">Bouw kunststoffabriek</button>
                </div>
                <div id="pFactory2"></div>
                <div>
                    <button type="button" class="btn btn-dark" onClick="objPlasticFactory.produce(0);" id="makePlastic">Maak kunststof</button>
                </div>
            </div>
            <div class="container col-sm" id="plasticStorage-col">
                <div id="plasticStorage"></div>
                <button type="button" class="btn btn-primary" onClick="objPlastic.addStorage();" id="addPlasticStorage">Bouw kunststofopslag</button>
                <div id="plasticPrice"></div>
                <button type="button" class="btn btn-danger" onClick="objPlastic.sell(0);" id="sellPlastic">Verkoop kunststof</button>
                <div id="plasticAuto"></div>
                <button type="button" class="btn btn-danger" onClick="objPlasticFactory.addWorker(1);" id="hireWorker">Neem aan</button>
                <button type="button" class="btn btn-primary" onClick="objPlasticFactory.addWorker(0);"
                    id="fireWorker">Ontsla</button>
            </div>
        </div>
        <div class="row border border-dark rows" id="mijnbouw-row">
            <div class="container col-sm" id="Prospecting-col">
                <h2>Prospecting:</h2>
                <div id="Prospecting"></div>
                <button type="button" class="btn btn-primary" onClick="objMines.prospect();" id="ProspectingButton">Start prospecting</button>
                <div id="ProspectingProgress"></div>
                <div id="ProspectingResult"></div>
            </div>
            <div class="container col-sm" id="MiningSites-col">
                <h2>Overzicht mijnen:</h2>
                <div id="minesites"></div>
            </div>
        </div>
        <div class="row border border-dark rows" id="mijnen-row">
            <div id="Coal-col" class="container col-sm">
                <div id="coal-mines"></div>
                <!-- <button type="button" class="btn btn-primary" onClick="objMines.addMine(2);" id="coalMineButton">Bouw steenkoolmijn</button> -->
                <div id="coalMine"></div>
                <button type="button" class="btn btn-primary" onClick="objCoal.addSilo();" id="coalMineButton">Bouw steenkoolsilo</button>
            </div>
            <div id="Iron-col" class="container col-sm">
                <div id="iron-mines"></div>
                <div id="IronMine"></div>
            </div>

            <div id="Gold-col">
                <div id="gold-mines"></div>
                <!-- <button type="button" class="btn btn-primary" onClick="objMines.addMine(5);" id="goldMineButton">Bouw goudmijn</button> -->
            </div>
            <div id="Diamond-col">
                <div id="diamond-mines"></div>
                <!-- <button type="button" class="btn btn-primary" onClick="objMines.addMine(6);" id="diamondMineButton">Bouw diamantmijn</button> -->
            </div>
        </div>

        <div class="row border border-dark rows" id="production2-row">
            <div id="SteelProduction-col" class="container col-sm">
                <div id="steelProduction"></div>
                <div id="steelProductionStats"></div>
            </div>
            <div id="SteelInfo-col" class="container col-sm">
                <div id="Steel"></div>
                <div id="steelStats"></div>
                <div id="steelStorage"></div>
                <div id="steelPrice"></div>
            </div>

        </div>
        <div class="row border border-dark rows" id="mijnen-row2">
            <div id="Uranium-col">
                <div id="uranium-mines"></div>
                <!-- <button type="button" class="btn btn-primary" onClick="objMines.addMine(3);" id="uraniumMineButton">Bouw uraniummijn</button> -->
                <div id="UraniumMine1"></div>
                <div>
                    <button type='button' class='btn btn-danger' onClick='objUraniumOre.sell(0)' id='sellUraniumButton'>Verkoop uranium!</button>
                </div>
                <div id="UraniumMine"></div>
                <div>
                    <button type='button' class='btn btn-primary' onClick='objUraniumOre.addSilo();' id='uraniumOreSiloButton'>Bouw uranium-silo</button>
                </div>
            </div>
            <div id="Copper-col">
                <div id="copper-mines"></div>
                <!-- <button type="button" class="btn btn-primary" onClick="objMines.addMine(4);" id="copperMineButton">Bouw kopermijn</button> -->
            </div>
        </div>
        <div class="row border border-dark rows" id="nuclearFuel-row">
            <div class="container col-sm" id="fuelRodFactory">
                <div id="fuelRod"></div>
                <div>
                    <button type='button' class='btn btn-primary' onClick='objFuelCellFactory.addFactory(1);' id='fcfBuildButton'>Bouw fabriek</button>
                    <button type='button' class='btn btn-danger' onClick='objFuelCellFactory.addFactory(0);' id='fcfSellButton'>Verkoop fabriek</button>
                    <br>
                </div>
                <div id="fuelRod2"></div>
                <div id="fuelRodCounter"></div>
            </div>
            <div class="container col-sm" id="fuelRodStorage">
                <div id="fuelStorage"></div>
                <div id="fuelStoragePlant"></div>
                <div id="fuelWaste"></div>
                <div id="sellWaste"></div>
                <div id="sellWasteButton">
                    <button type='button' class='btn btn-danger' onClick='objFuelRod.sellWaste();' id='fcSellWasteButton'>Verkoop afval splijtstofstaven</button>
                </div>

            </div>
            <div class="container col-sm" id="nuclearPower">
                <div id="npp"></div>
                <button type='button' class='btn btn-primary' onClick='objNuclearPowerPlant.buildPlant();' id='nppBuild'>Bouw kerncentrale</button>
                <div id="nppr"></div>
                <button type='button' class='btn btn-primary' onClick='objNuclearPowerPlant.buildReactor();' id='npprBuild'>Bouw kernreactor</button>
                <div id="nppsum"></div>

            </div>
        </div>
    </div>
    <div class="notification-container" id="notif">
    </div>
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js" integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>

    <script defer src="https://use.fontawesome.com/releases/v5.0.7/js/all.js"></script>

</body>

</html>
