// These control the button statuses
var autoCheck = ['false', 'false', 'false', 'false', 'false', 'false', 'false', 'false', 'false', 'false'];
var autoName = ['build', 'craft', 'hunt', 'trade', 'praise', 'science', 'upgrade', 'party', 'assign', 'energy'];

var tradeMax = {uranium: false, coal: false, iron: false};

// These will allow quick selection of the buildings which consume energy
var bldSmelter = gamePage.bld.buildingsData[15];
var bldBioLab = gamePage.bld.buildingsData[9];
var bldOilWell = gamePage.bld.buildingsData[20];
var bldFactory = gamePage.bld.buildingsData[22];
var bldCalciner = gamePage.bld.buildingsData[16];
var bldAccelerator = gamePage.bld.buildingsData[24];

// These are the assorted variables
var proVar = gamePage.resPool.energyProd;
var conVar = gamePage.resPool.energyCons;
var tickDownCounter = 1;
var deadScript = "Script is dead";
var furDerVal = 3;
var autoChoice = "farmer";
var resList = [];
var secResRatio = 0;
var steamOn = 0;
var programBuild = false;


var buildings = [
	["Hut", false],
	["Log House", false],
	["Mansion", false],
	["Workshop", false],
	["Factory", false],
	["Catnip field", false],
	["Pasture", false],
	["Mine", false],
	["Lumber Mill", false],
	["Aqueduct", false],
	["Oil Well", false],
	["Quarry", false],
	["Smelter", false],
	["Bio Lab", false],
	["Calciner", false],
	["Reactor", false],
	["Accelerator", false],
	["Steamworks", false],
	["Magneto", false],
	["Library", false],
	["Academy", false],
	["Observatory", false],
	["Barn", false],
	["Harbour", false],
	["Warehouse", false],
	["Amphitheatre", false],
	["Tradepost", false],
	["Chapel", false],
	["Temple", false],
	["Mint", false],
	["Ziggurat", false],
	["Unicorn Pasture", false],
	["Space Elevator", false, 0],
	["Satellite", false, 0],
	["Space Station", false, 0],
	["Moon Outpost", false, 1],
	["Moon Base", false, 1],
	["Planet Cracker", false, 2],
	["Hydro Fracturer", false, 2],
	["Spice Refinery", false, 2],
	["Research Vessel", false, 3],
	["Orbital Array", false, 3],
	["Sunlifter", false, 4],
	["Containment Chamber", false, 4],
	["Cryostation", false, 5],
	["Space Beacon", false, 6],
	["Terraforming Station", false, 7],
	["Hydroponics", false, 7],
	["Tectonic", false, 8]
];

var buildingsList = [
	["hut"],
	["logHouse"],
	["mansion"],
	["workshop"],
	["factory"],
	["field"],
	["pasture"],
	["mine"],
	["lumberMill"],
	["aqueduct"],
	["oilWell"],
	["quarry"],
	["smelter"],
	["biolab"],
	["calciner"],
	["reactor"],
	["accelerator"],
	["steamworks"],
	["magneto"],
	["library"],
	["academy"],
	["observatory"],
	["barn"],
	["harbor"],
	["warehouse"],
	["amphitheatre"],
	["tradepost"],
	["chapel"],
	["temple"],
	["mint"],
	["ziggurat"],
	["unicornPasture"],
	["spaceElevator"],
	["sattelite"],
	["spaceStation"],
	["moonOutpost"],
	["moonBase"],
	["planetCracker"],
	["hydrofracturer"],
	["spiceRefinery"],
	["researchVessel"],
	["orbitalArray"],
	["sunlifter"],
	["containmentChamber"],
	["cryostation"],
	["spaceBeacon"],
	["terraformingStation"],
	["hydroponics"],
	["tectonic"]
];

var resources = [
	["catnip", "wood", 50],
	["wood", "beam", 175],
	["minerals", "slab", 250],
	["coal", "steel", 100],
	["iron", "plate", 125],
	["oil", "kerosene", 7500],
	["uranium", "thorium", 250],
	["unobtainium", "eludium", 1000]
];

var secondaryResources = [
	["beam", "scaffold", 50],
	["steel", "alloy", 75],
	["steel", "gear", 15],
	["slab", "concrate", 2500]
];

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

'<a id="scriptOptions" onclick="selectOptions()"> | ScriptKitties </a>' +

'<div id="optionSelect" style="display:none; margin-top:-600px; margin-left:-100px; width:200px" class="dialog help">' +
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> <br />' +
'<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button><br /><br />' +

'<button id="autoBuild" style="color:red" onclick="autoSwitch(autoCheck[0], 0, autoName[0], \'autoBuild\');"> Auto Build </button><br />' +
'<button id="bldSelect" onclick="selectBuildings()">Select Building</button><br />' +

'<button id="autoAssign" style="color:red" onclick="autoSwitch(autoCheck[8], 8, autoName[8], \'autoAssign\')"> Auto Assign </button>' +
'<select id="autoAssignChoice" size="1" onclick="setAutoAssignValue()">' +
'<option value="farmer" selected="selected">Farmer</option>' +
'<option value="woodcutter">Woodcutter</option>' +
'<option value="scholar">Scholar</option>' +
'<option value="priest">Priest</option>' +
'<option value="miner">Miner</option>' +
'<option value="hunter">Hunter</option>' +
'<option value="engineer">Engineer</option>' +
'</select><br />' +

'<button id="autoCraft" style="color:red" onclick="autoSwitch(autoCheck[1], 1, autoName[1], \'autoCraft\')"> Auto Craft </button>' +
'<select id="craftFur" size="1" onclick="setFurValue()">' +
'<option value="1" selected="selected">Parchment</option>' +
'<option value="2">Manuscript</option>' +
'<option value="3">Compendium</option>' +
'<option value="4">Blueprint</option>' +
'</select><br /><br />' +

'<label id="secResLabel"> Secondary Craft % </label>' +
'<span id="secResSpan" title="Between 0 and 100"><input id="secResText" type="text" style="width:25px" onchange="secResRatio = this.value" value="30"></span><br /><br />' +

'<button id="autoHunt" style="color:red" onclick="autoSwitch(autoCheck[2], 2, autoName[2], \'autoHunt\')"> Auto Hunt </button><br />' +
'<button id="autoTrade" style="color:red" onclick="autoSwitch(autoCheck[3], 3, autoName[3], \'autoTrade\')"> Auto Trade </button><br />' +
'<input id= "tradeMaxUranium" type="checkbox" onclick="tradeMax.uranium = this.checked" /><label for="tradeMaxUranium">Maximize uranium trades</label><br />' +
'<input id= "tradeMaxCoal" type="checkbox" onclick="tradeMax.coal = this.checked" /><label for="tradeMaxCoal">Maximize coal trades</label><br />' +
'<input id= "tradeMaxIron" type="checkbox" onclick="tradeMax.iron = this.checked" /><label for="tradeMaxIron">Maximize iron trades</label><br />' +
'<button id="autoPraise" style="color:red" onclick="autoSwitch(autoCheck[4], 4, autoName[4], \'autoPraise\')"> Auto Praise </button><br /><br />' +
'<button id="autoScience" style="color:red" onclick="autoSwitch(autoCheck[5], 5, autoName[5], \'autoScience\')"> Auto Science </button><br />' +
'<button id="autoUpgrade" style="color:red" onclick="autoSwitch(autoCheck[6], 6, autoName[6], \'autoUpgrade\')"> Auto Upgrade </button><br />' +
'<button id="autoEnergy" style="color:red" onclick="autoSwitch(autoCheck[9], 9, autoName[9], \'autoEnergy\')"> Energy Control </button><br />' +
'<button id="autoParty" style="color:red" onclick="autoSwitch(autoCheck[7], 7, autoName[7], \'autoParty\')"> Auto Party </button><br /><br />' +
'</div>' +
'</div>';


$("#footerLinks").append(htmlMenuAddition);

var bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-500px; width:200px" class="dialog help">' +
'<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; left: 15px;">space</a>' +
'<a href="#" onclick="$(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'	<br /><input type="checkbox" id="hutChecker"><label for="hutChecker" onclick="$(\'.hutCheck\').click();"><b>Kitten Housing</b></label><br />' +
'	<input type="checkbox" id="hutBld" class="hutCheck" onchange="verifyBuildingSelected(\'0\', \'hutBld\');"><label for="hutBld">Hut</label><br />' +
'	<input type="checkbox" id="houseBld" class="hutCheck" onchange="verifyBuildingSelected(\'1\', \'houseBld\')"><label for="houseBld">Log House</label><br />' +
'	<input type="checkbox" id="mansionBld" class="hutCheck" onchange="verifyBuildingSelected(\'2\', \'mansionBld\')"><label for="mansionBld">Mansion</label><br /><br />' +

'	<input type="checkbox" id="craftChecker"><label for="craftChecker" onclick="$(\'.craftCheck\').click();"><b>Craft Bonuses</b></label><br />' +
'	<input type="checkbox" id="workshopBld" class="craftCheck" onchange="verifyBuildingSelected(\'3\', \'workshopBld\')"><label for="workshopBld">Workshop</label><br />' +
'	<input type="checkbox" id="factoryBld" class="craftCheck" onchange="verifyBuildingSelected(\'4\', \'factoryBld\')"><label for="factoryBld">Factory</label><br /><br />' +

'	<input type="checkbox" id="prodChecker"><label for="prodChecker" onclick="$(\'.prodCheck\').click();"><b>Production</b></label><br />' +
'	<input type="checkbox" id="fieldBld" class="prodCheck" onchange="verifyBuildingSelected(\'5\', \'fieldBld\')"><label for="fieldBld">Catnip Field</label><br />' +
'	<input type="checkbox" id="pastureBld" class="prodCheck" onchange="verifyBuildingSelected(\'6\', \'pastureBld\')"><label for="pastureBld">Pasture/Solar</label><br />' +
'	<input type="checkbox" id="mineBld" class="prodCheck" onchange="verifyBuildingSelected(\'7\', \'mineBld\')"><label for="mineBld">Mine</label><br />' +
'	<input type="checkbox" id="lumberBld" class="prodCheck" onchange="verifyBuildingSelected(\'8\', \'lumberBld\')"><label for="lumberBld">Lumber Mill</label><br />' +
'	<input type="checkbox" id="aqueductBld" class="prodCheck" onchange="verifyBuildingSelected(\'9\', \'aqueductBld\')"><label for="aqueductBld">Aqueduct/Hydro</label><br />' +
'	<input type="checkbox" id="oilBld" class="prodCheck" onchange="verifyBuildingSelected(\'10\', \'oilBld\')"><label for="oilBld">Oil Well</label><br />' +
'	<input type="checkbox" id="quarryBld" class="prodCheck" onchange="verifyBuildingSelected(\'11\', \'quarryBld\')"><label for="quarryBld">Quarry</label><br /><br />' +

'	<input type="checkbox" id="conversionChecker"><label for="conversionChecker" onclick="$(\'.convertCheck\').click();"><b>Conversion</b></label><br />' +
'	<input type="checkbox" id="smelterBld" class="convertCheck" onchange="verifyBuildingSelected(\'12\', \'smelterBld\')"><label for="smelterBld">Smelter</label><br />' +
'	<input type="checkbox" id="labBld" class="convertCheck" onchange="verifyBuildingSelected(\'13\', \'labBld\')"><label for="labBld">Bio Lab</label><br />' +
'	<input type="checkbox" id="calcinerBld" class="convertCheck" onchange="verifyBuildingSelected(\'14\', \'calcinerBld\')"><label for="calcinerBld">Calciner</label><br />' +
'	<input type="checkbox" id="reactorBld" class="convertCheck" onchange="verifyBuildingSelected(\'15\', \'reactorBld\')"><label for="reactorBld">Reactor</label><br />' +
'	<input type="checkbox" id="acceleratorBld" class="convertCheck" onchange="verifyBuildingSelected(\'16\', \'acceleratorBld\')"><label for="acceleratorBld">Accelerator</label><br />' +
'	<input type="checkbox" id="steamBld" class="convertCheck" onchange="verifyBuildingSelected(\'17\', \'steamBld\')"><label for="steamBld">Steamworks</label><br />' +
'	<input type="checkbox" id="magnetoBld" class="convertCheck" onchange="verifyBuildingSelected(\'18\', \'magnetoBld\')"><label for="magnetoBld">Magneto</label><br /><br />' +

'	<input type="checkbox" id="scienceChecker"><label for="scienceChecker" onclick="$(\'.scienceCheck\').click();"><b>Science</b></label><br />' +
'	<input type="checkbox" id="libraryBld" class="scienceCheck" onchange="verifyBuildingSelected(\'19\', \'libraryBld\')"><label for="libraryBld">Library</label><br />' +
'	<input type="checkbox" id="academyBld" class="scienceCheck" onchange="verifyBuildingSelected(\'20\', \'academyBld\')"><label for="academyBld">Academy</label><br />' +
'	<input type="checkbox" id="obervatoryBld" class="scienceCheck" onchange="verifyBuildingSelected(\'21\', \'obervatoryBld\')"><label for="obervatoryBld">Observatory</label><br /><br />' +

'	<input type="checkbox" id="storageChecker"><label for="storageChecker" onclick="$(\'.storageCheck\').click();"><b>Storage</b></label><br />' +
'	<input type="checkbox" id="barnBld" class="storageCheck" onchange="verifyBuildingSelected(\'22\', \'barnBld\')"><label for="barnBld">Barn</label><br />' +
'	<input type="checkbox" id="harborBld" class="storageCheck" onchange="verifyBuildingSelected(\'23\', \'harborBld\')"><label for="harborBld">Harbor</label><br />' +
'	<input type="checkbox" id="warehouseBld" class="storageCheck" onchange="verifyBuildingSelected(\'24\', \'warehouseBld\')"><label for="warehouseBld">Warehouse</label><br /><br />' +

'	<input type="checkbox" id="otherChecker"><label for="otherChecker" onclick="$(\'.otherCheck\').click();"><b>Other</b></label><br />' +
'	<input type="checkbox" id="ampBld" class="otherCheck" onchange="verifyBuildingSelected(\'25\', \'ampBld\')"><label for="ampBld">Amphitheatre/Broadcast</label><br />' +
'	<input type="checkbox" id="tradeBld" class="otherCheck" onchange="verifyBuildingSelected(\'26\', \'tradeBld\')"><label for="tradeBld">Tradepost</label><br />' +
'	<input type="checkbox" id="chapelBld" class="otherCheck" onchange="verifyBuildingSelected(\'27\', \'chapelBld\')"><label for="chapelBld">Chapel</label><br />' +
'	<input type="checkbox" id="templeBld" class="otherCheck" onchange="verifyBuildingSelected(\'28\', \'templeBld\')"><label for="templeBld">Temple</label><br />' +
'	<input type="checkbox" id="mintBld" class="otherCheck" onchange="verifyBuildingSelected(\'29\', \'mintBld\')"><label for="mintBld">Mint</label><br />' +
'	<input type="checkbox" id="zigguratBld" class="otherCheck" onchange="verifyBuildingSelected(\'30\', \'zigguratBld\')"><label for="zigguratBld">Ziggurat</label><br />' +
'	<input type="checkbox" id="unicBld" class="otherCheck" onchange="verifyBuildingSelected(\'31\', \'unicBld\')"><label for="unicBld">Unicorn Pasture</label><br /><br />' +

'</div>';


var spaceSelectAddition = '<div id="spaceSelect" style="display:none; margin-top:-400px; width:200px" class="dialog help">' +
'<a href="#" onclick="$(\'#spaceSelect\').hide(); $(\'#buildingSelect\').toggle();" style="position: absolute; top: 10px; left: 15px;">cath</a>' +
'<a href="#" onclick="$(\'#spaceSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'	<br /><br /><input type="checkbox" id="programs" class="programs" onchange="programBuild = this.checked; console.log(this.checked);"><label for="programs">Programs</label><br /><br />' +

'	<input type="checkbox" id="spaceChecker"><label for="spaceChecker" onclick="$(\'.spaceCheck\').click();"><b>Space</b></label><br />' +

'	<input type="checkbox" id="elevSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'32\', \'elevSBld\');"><label for="elevSBld">Space Elevator</label><br />' +
'	<input type="checkbox" id="satSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'33\', \'satSBld\');"><label for="satSBld">Satellite</label><br />' +
'	<input type="checkbox" id="statSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'34\', \'statSBld\');"><label for="statSBld">Space Station</label><br /><br />' +

'	<input type="checkbox" id="moonChecker"><label for="moonChecker" onclick="$(\'.moonCheck\').click();"><b>Moon</b></label><br />' +

'	<input type="checkbox" id="outSBld" class="moonCheck" onchange="verifyBuildingSelected(\'35\', \'outSBld\');"><label for="outSBld">Lunar Outpost</label><br />' +
'	<input type="checkbox" id="baseSBld" class="moonCheck" onchange="verifyBuildingSelected(\'36\', \'baseSBld\');"><label for="baseSBld">Moon Base</label><br /><br />' +

'	<input type="checkbox" id="duneChecker"><label for="duneChecker" onclick="$(\'.duneCheck\').click();"><b>Dune</b></label><br />' +


'	<input type="checkbox" id="crackSBld" class="duneCheck" onchange="verifyBuildingSelected(\'37\', \'crackSBld\');"><label for="crackSBld">Planet Cracker</label><br />' +
'	<input type="checkbox" id="fracSBld" class="duneCheck" onchange="verifyBuildingSelected(\'38\', \'fracSBld\');"><label for="fracSBld">Hydro Fracturer</label><br />' +
'	<input type="checkbox" id="spiceSBld" class="duneCheck" onchange="verifyBuildingSelected(\'39\', \'spiceSBld\');"><label for="spiceSBld">Spice Refinery</label><br /><br />' +

'	<input type="checkbox" id="piscineChecker"><label for="piscineChecker" onclick="$(\'piscineCheck\').click();"><b>Piscine</b></label><br />' +

'	<input type="checkbox" id="reVeSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'40\', \'reVeSBld\');"><label for="reVeSBld">Research Vessel</label><br />' +
'	<input type="checkbox" id="orbSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'41\', \'orbSBld\');"><label for="orbSBld">Orbital Array</label><br /><br />' +

'	<input type="checkbox" id="heliosChecker"><label for="heliosChecker" onclick="$(\'.heliosCheck\').click();"><b>Helios</b></label><br />' +

'	<input type="checkbox" id="sunSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'42\', \'sunSBld\');"><label for="sunSBld">Sunlifter</label><br />' +
'	<input type="checkbox" id="contSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'43\', \'contSBld\');"><label for="contSBld">Containment Chamber</label><br /><br />' +

'	<input type="checkbox" id="terminusChecker"><label for="terminusChecker" onclick="$(\'.terminusCheck\').click();"><b>Terminus</b></label><br />' +

'	<input type="checkbox" id="crySBld" class="terminusCheck" onchange="verifyBuildingSelected(\'44\', \'crySBld\');"><label for="crySBld">Cryostation</label><br /><br />' +

'	<input type="checkbox" id="kairoChecker"><label for="kairoChecker" onclick="$(\'.kairoCheck\').click();"><b>Kairo</b></label><br />' +

'	<input type="checkbox" id="beacSBld" class="kairoCheck" onchange="verifyBuildingSelected(\'45\', \'beacSBld\');"><label for="beacSBld">Space Beacon</label><br /><br />' +

'	<input type="checkbox" id="yarnChecker"><label for="yarnChecker" onclick="$(\'.yarnCheck\').click();"><b>Yarn</b></label><br />' +

'	<input type="checkbox" id="terrSBld" class="yarnCheck" onchange="verifyBuildingSelected(\'46\', \'terrSBld\');"><label for="terrSBld">Terraforming Station</label><br />' +
'	<input type="checkbox" id="hydrSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'47\', \'hydrSBld\');"><label for="hydrSBld">Hydroponics</label><br /><br />' +

'	<input type="checkbox" id="centaurusChecker"><label for="centaurusChecker" onclick="$(\'.centaurusCheck\').click();"><b>Centaurus System</b></label><br />' +

'	<input type="checkbox" id="tecSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'48\', \'tecSBld\');"><label for="tecSBld">Tectonic</label><br /><br />' +

'</div>';


function verifyBuildingSelected(buildingNumber, buildingCheckID) {
	var bldIsChecked = document.getElementById(buildingCheckID).checked;
	buildings[buildingNumber][1] = bldIsChecked;
}

$("#game").append(bldSelectAddition);
$("#game").append(spaceSelectAddition);

function clearOptionHelpDiv() {
	$("#optionSelect").hide();
}

function selectOptions() {
	$("#optionSelect").toggle();
}

function clearHelpDiv() {
	$("#buildingSelect").hide();
}

function selectBuildings() {
	$("#buildingSelect").toggle();
}

function setFurValue() {
	furDerVal = $('#craftFur').val();
}

function setAutoAssignValue() {
	autoChoice = $('#autoAssignChoice').val();
}

function autoSwitch(varCheck, varNumber, textChange, varName) {
	if (varCheck == "false") {
		autoCheck[varNumber] = "true";
		gamePage.msg('Auto' + textChange + ' is now on');
		document.getElementById(varName).style.color = 'black';
	} else if (varCheck == "true") {
		autoCheck[varNumber] = "false";
		gamePage.msg('Auto' + textChange + ' is now off');
		document.getElementById(varName).style.color = 'red';
	}
}

function clearScript() {
	$("#farRightColumn").remove();
	$("#buildingSelect").remove();
	$("#spaceSelect").remove();
	$("#scriptOptions").remove();
	clearInterval(runAllAutomation);
	autoBuildCheck = null;
	bldSelectAddition = null;
	spaceSelectAddition = null;
	htmlMenuAddition = null;
}

// Show current kitten efficiency in the in-game log
function kittenEfficiency() {
	var timePlayed = gamePage.stats.statsCurrent[3].calculate(game);
	var numberKittens = gamePage.resPool.get('kittens').value;
	var curEfficiency = (numberKittens - 70) / timePlayed;
	gamePage.msg("Your current efficiency is " + parseFloat(curEfficiency).toFixed(2) + " kittens per hour.");
}


/* These are the functions which are controlled by the runAllAutomation timer */

// Auto Observe Astronomical Events
function autoObserve() {
	var checkObserveBtn = document.getElementById("observeBtn");
	if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
		document.getElementById('observeBtn').click();
	}
}

// Auto praise the sun
function autoPraise(){
	if (autoCheck[4] != "false" && gamePage.bld.getBuildingExt('temple').meta.val > 0) {
		gamePage.religion.praise();
	}
}

// Build buildings automatically
function autoBuild() {
	if (autoCheck[0] != "false" && gamePage.ui.activeTabId == 'Bonfire') {
		var btn = gamePage.tabs[0].buttons;

		for (var z = 0; z <  32; z++) {
			if (buildings[z][1] != false) {
				if (gamePage.bld.getBuildingExt(buildingsList[z]).meta.unlocked) {
					for (i = 2 ;i < gamePage.tabs[0].buttons.length; i++) {
						try {
							if (btn[i].model.metadata.name == buildingsList[z]) {
								btn[i].controller.buyItem(btn[i].model, {}, function(result) {
									if (result) {
										btn[i].update();
									}
								});
							}
						} catch(err) {
							console.log(err);
						}
					}
				}
			}
		}

		if (gamePage.getResourcePerTick('coal') > 0.01 && steamOn < 1) {
			gamePage.bld.getBuildingExt('steamworks').meta.on = gamePage.bld.getBuildingExt('steamworks').meta.val;
			steamOn = 1;
		}
	}
}

// Build space stuff automatically
function autoSpace() {
	if (autoCheck[0] != "false") {
		var origTab = gamePage.ui.activeTabId;

		// Build space buildings
		for (var z = 32; z < buildings.length; z++) {
			if (buildings[z][1] != false) {
				var spBuild = gamePage.tabs[6].planetPanels[buildings[z][2]].children;

				try {
					for (i = 0; i < spBuild.length; i++) {
						if (spBuild[i].model.metadata.name == buildingsList[z]) {
							// Change the tab so that we can build
							if (gamePage.ui.activeTabId != "Space") {
								gamePage.ui.activeTabId = 'Space';
								gamePage.render();
							}

							spBuild[i].controller.buyItem(spBuild[i].model, {}, function(result) {
								if (result) {
									spBuild[i].update();
								}
							});
						}
					}
				} catch(err) {
					console.log(err);
				}
			}
		}

		// Build space programs
		if (programBuild != false) {
			var spcProg = gamePage.tabs[6].GCPanel.children;
			for (var i = 0; i < spcProg.length; i++) {
				if (spcProg[i].model.metadata.unlocked && spcProg[i].model.on == 0) {
					try {
						// Change the tab so that we can build
						if (gamePage.ui.activeTabId != "Space") {
							gamePage.ui.activeTabId = 'Space';
							gamePage.render();
						}

						spcProg[i].controller.buyItem(spcProg[i].model, {}, function(result) {
							if (result) {
								spcProg[i].update();
							}
						});
					} catch(err) {
						console.log(err);
					}
				}
			}
		}

		if (origTab != gamePage.ui.activeTabId) {
			gamePage.ui.activeTabId = origTab;
			gamePage.render();
		}
	}
}

// Trade automatically
var leviathansRace = gamePage.diplomacy.get("leviathans");
var goldResource = gamePage.resPool.get('gold');
var unobtainiumResource = gamePage.resPool.get('unobtainium');
var diplomacyPerk = gamePage.prestige.getPerk("diplomacy");
function autoTrade() {
	// If the auto-trade button is not selected, abort
	if (autoCheck[3] == "false") {
		return;
	}


	// Trading with the Leviathans causes their visit's remaining duration to be reduced to a cap
	// Therefore, to maximize the number of trades we get per visit, we only want to trade if the duration is already under that cap or if our unobtainium stockpile is full
	if (
			leviathansRace.unlocked
			&& (gamePage.diplomacy.getMaxTradeAmt(leviathansRace) > 0)
			&& ((leviathansRace.duration <= 400 + (100 * leviathansRace.energy)) || (unobtainiumResource.value + (gamePage.getResourcePerTick('unobtainium', true) * 26) > unobtainiumResource.maxValue))
	) {
		// When we do trade with the Leviathans, we always trade the maximum amount possible
		gamePage.diplomacy.tradeAll(leviathansRace);
	}


	// Non-Leviathan trades are only performed if we are at or near our gold cap; since autoTrade is checked every 25 ticks, we abort if there's room at least 26 ticks of more gold production to avoid unnecessary waste
	if ((goldResource.value + (gamePage.getResourcePerTick('gold', true) * 26)) < goldResource.maxValue) {
		return;
	}


	// Perform the non-Leviathan trades
	tradeZebras();
	tradeDragons();
	tradeSpiders();
	tradeGriffins();
}


// Trade with the Zebras
var titaniumResource = gamePage.resPool.get('titanium');
var ironResource = gamePage.resPool.get('iron');
var shipsResource = gamePage.resPool.get("ship");
var zebrasRace = gamePage.diplomacy.get("zebras");
function tradeZebras() {
	// Check that the zebras are available to trade with
	if (!zebrasRace.unlocked) {
		return;
	}

	// Check that our titanium stockpile isn't already filled beyond its normal capacity
	if (titaniumResource.value > (titaniumResource.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	var maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(zebrasRace);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much titanium we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For titanium, this is purely a function of the number of ships you have with no seasonal or random variations and no effect from your trade ratio
	var expectedTitaniumPerTrade = 1.5 + (1.5  * (shipsResource.value / 100) * 2);

	// Then modify that by the effects of race relations
	// For the Zebras, this is the chance any given trade will fail because they are hostile
	var tradeChance = 70 + gamePage.getEffect("standingRatio") + (diplomacyPerk.researched ? 10 : 0);
	if (tradeChance < 100) {
		expectedTitaniumPerTrade *= tradeChance / 100;
	}

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For titanium, this depends on the number of ships you have
	var titaniumChance = 15 + (shipsResource.value * 0.35);
	if (titaniumChance < 100) {
		expectedTitaniumPerTrade *= titaniumChance / 100;
	}


	// Our target final titanium level is the maximum capacity of our stockpile, minus a buffer of 5 ticks' production to ensure it doesn't overflow before the next autoCraft() (assuming our titanium income is positive)
	var targetTitanium = titaniumResource.maxValue - Math.max(gamePage.getResourcePerTick('titanium', true) * 5, 0);


	// Determine how many trades to perform
	// We want to trade for just enough titanium to fill our stockpile

	// Determine the amount of titanium needed to reach our target
	var titaniumRequired = targetTitanium - titaniumResource.value;

	// Determine how many trades are needed to get that much titanium, rounded down
	var tradesRequired = Math.floor(titaniumRequired / expectedTitaniumPerTrade);

	// The amount of titanium returned by a single trade, being a linear function of the number of ships you have, can potentially be arbitrarily large
	// Therefore, if our titanium stockpile is below 90%, we always perform a minimum of 1 trade, even if some of it will be wasted
	if (titaniumResource.value < (titaniumResource.maxValue * 0.9)) {
		tradesRequired = Math.max(tradesRequired, 1);
	}

	// If no trades are necessary, we're done
	if (tradesRequired < 1) {
		return;
	}

	// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
	var tradesToPerform = Math.min(tradesRequired, maxTradesPossible);


	// Besides the titanium, trading with the Zebras will also return some iron; we need ensure there is enough room in the stockpile for it, if possible
	if (gamePage.workshop.getCraft("plate").unlocked) {
		// Determine the maximum amount of iron we might receive from each trade:
		// A successful trade with the Zebras always returns iron; the amount starts at 300, boosted by your trade ratio and modified by a seasonal modifier and a random factor (-4% to +4%)
		// For this 'worst case' calculation, we will assume the largest possible random modifier and that all trades succeed
		var maxIronPerTrade = 300 * (1 + gamePage.diplomacy.getTradeRatio()) * zebrasRace.sells[0].seasons[gamePage.calendar.getCurSeason().name] * 1.04;


		// Our target final iron level is the maximum capacity of our stockpile, minus a buffer of 5 ticks' production to ensure it doesn't overflow before the next autoCraft() (assuming our iron income is positive)
		var targetIron = ironResource.maxValue - Math.max(gamePage.getResourcePerTick('iron', true) * 5, 0);


		// Determine how much iron those trades might return
		var expectedIron = tradesToPerform * maxIronPerTrade;

		// Determine how much existing iron must be converted to steel to make room (up to a limit of 'all of it', minimum of 0)
		var ironOverflow = Math.max(Math.min((ironResource.value + expectedIron) - targetIron, ironResource.value), 0);

		// Craft the necessary quantity of plates, if any, with each crafting consuming 125 units of iron
		if (ironOverflow > 0) {
			gamePage.craft("plate", ironOverflow / 125);
		}
	}


	// Perform the trades
	gamePage.diplomacy.tradeMultiple(zebrasRace, tradesToPerform);
}

// Trade with the Dragons
var uraniumResource = gamePage.resPool.get('uranium');
var dragonsRace = gamePage.diplomacy.get("dragons");
function tradeDragons() {
	// Check that the Dragons are available to trade with
	if (!dragonsRace.unlocked) {
		return;
	}

	// Check that our uranium stockpile isn't already filled beyond its normal capacity
	if (uraniumResource.value > (uraniumResource.maxValue + 1)) {
		return;
	}


	// Check that our titanium stockpile isn't filled beyond its normal capacity
	// An over-filled resource stockpile, which usually comes from resetting the game with chronospheres, can be used to purchase things that cost more than the stockpile capacity
	// It therefore represents an irreplaceable resource which should not be depleted automatically
	if (titaniumResource.value > (titaniumResource.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	var maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(dragonsRace);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much uranium we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For uranium, this is 1 unit per trade boosted by your trade ratio, with no seasonal modifier
	// There's also what's supposed to be a random variation of +/- 12.5% (which would cancel itself out on average), but, due to a bug in the game code, actually ends up always returning the minimum possible amount
	var expectedUraniumPerTrade = 1 * (1 + gamePage.diplomacy.getTradeRatio()) * 0.875;

	// Then modify that by the effects of race relations
	// For the Dragons, this is nothing; the Dragons are neutral, so trades never fail entirely nor return extra

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For uranium, this is 5%
	expectedUraniumPerTrade *= 0.95;


	// Our target final uranium level is the maximum capacity of our stockpile, minus a buffer of 5 ticks' production to ensure it doesn't overflow before the next autoCraft() (assuming our uranium income is positive)
	var targetUranium = uraniumResource.maxValue - Math.max(gamePage.getResourcePerTick('uranium', true) * 5, 0);


	// Determine how many trades to perform depending on the current trade mode
	if (tradeMax.uranium && gamePage.workshop.getCraft('thorium').unlocked) {
		// We are in maximize mode, which means we want to trade for as much uranium as possible, converting any excess into thorium

		// Calculate the maximum number of trades we can make and fit the results into our target uranium level
		var maxTradesFit = Math.floor(targetUranium / expectedUraniumPerTrade);

		// If possible, we want to perform as many trades as we have the resources for; if we don't have enough space in the stockpile to do that, we just do as many as we can fit
		var tradesToPerform = Math.min(maxTradesPossible, maxTradesFit);


		// Convert the excess uranium:
		// Determine how much uranium those trades will return
		var expectedUranium = tradesToPerform * expectedUraniumPerTrade;

		// Determine how much existing uranium must be converted to steel to make room (up to a limit of 'all of it', minimum of 0)
		var uraniumOverflow = Math.max(Math.min((uraniumResource.value + expectedUranium) - targetUranium, uraniumResource.value), 0);

		// Craft the necessary quantity of thorium, with each crafting consuming 250 units of uranium
		gamePage.craft("thorium", uraniumOverflow / 250);
	} else {
		// We are in normal mode, which means we want to trade for just enough uranium to fill our stockpile

		// Determine the amount of uranium needed to reach our target
		var uraniumRequired = targetUranium - uraniumResource.value;

		// Determine how many trades are needed to get that much uranium, rounded down
		var tradesRequired = Math.floor(uraniumRequired / expectedUraniumPerTrade);

		// If no trades are necessary, we're done
		if (tradesRequired < 1) {
			return;
		}

		// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
		var tradesToPerform = Math.min(tradesRequired, maxTradesPossible);
	}


	// Perform the trades
	gamePage.diplomacy.tradeMultiple(dragonsRace, tradesToPerform);
}

// Trade with the Spiders
var coalResource = gamePage.resPool.get('coal');
var spidersRace = gamePage.diplomacy.get("spiders");
function tradeSpiders() {
	// Check that the Spiders are available to trade with
	if (!spidersRace.unlocked) {
		return;
	}

	// Check that our coal stockpile isn't already filled beyond its normal capacity
	if (coalResource.value > (coalResource.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	var maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(spidersRace);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much coal we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For coal, this is 350 units per trade boosted by your trade ratio, modified by a seasonal modifier; there's a random variation, but it's irrelevant since it cancels itself out
	var expectedCoalPerTrade = 350 * (1 + gamePage.diplomacy.getTradeRatio()) * spidersRace.sells[0].seasons[gamePage.calendar.getCurSeason().name];

	// Then modify that by the effects of race relations
	// For the Spiders, this is the chance any given trade will return 25% extra because they are friendly
	var bonusChance = 15 + ((gamePage.getEffect("standingRatio") + (diplomacyPerk.researched ? 10 : 0)) / 2);
	expectedCoalPerTrade *= 1 + (0.25 * (bonusChance <= 100 ? bonusChance : 100) / 100);

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For coal, this never happens


	// Our target final coal level is the maximum capacity of our stockpile, minus a buffer of 5 ticks' production to ensure it doesn't overflow before the next autoCraft() (assuming our coal income is positive)
	var targetCoal = coalResource.maxValue - Math.max(gamePage.getResourcePerTick('coal', true) * 5, 0);


	// Determine how many trades to perform depending on the current trade mode
	if (tradeMax.coal && gamePage.workshop.getCraft('steel').unlocked) {
		// We are in maximize mode, which means we want to trade for as much coal as possible, converting any excess into steel

		// Determine the maximum amount of coal we can covert to steel right now
		var maxCoalCraftable = Math.min(coalResource.value, ironResource.value);

		// Determine the maximum amount of space that we can make available in our coal stockpile right now
		var maxCoalSpace = targetCoal - (coalResource.value - maxCoalCraftable);

		// Calculate the maximum number of trades we can make and fit the results into that space
		var maxTradesFit = Math.floor(maxCoalSpace / expectedCoalPerTrade);

		// If possible, we want to perform as many trades as we have the resources for; if we don't have enough space in the stockpile to do that, we just do as many as we can fit
		var tradesToPerform = Math.min(maxTradesPossible, maxTradesFit);


		// Convert the excess coal:
		// Determine how much coal those trades will return
		var expectedCoal = tradesToPerform * expectedCoalPerTrade;

		// Determine how much existing coal must be converted to steel to make room (up to a limit of 'all of it', minimum of 0)
		var coalOverflow = Math.max(Math.min((coalResource.value + expectedCoal) - targetCoal, coalResource.value), 0);

		// Craft the necessary quantity of steel, with each crafting consuming 100 units of coal
		gamePage.craft("steel", coalOverflow / 100);
	} else {
		// We are in normal mode, which means we want to trade for just enough coal to fill our stockpile

		// Determine the amount of coal needed to reach our target
		var coalRequired = targetCoal - coalResource.value;

		// Determine how many trades are needed to get that much coal, rounded down
		var tradesRequired = Math.floor(coalRequired / expectedCoalPerTrade);

		// If no trades are necessary, we're done
		if (tradesRequired < 1) {
			return;
		}

		// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
		var tradesToPerform = Math.min(tradesRequired, maxTradesPossible);
	}

	// Perform the trades
	gamePage.diplomacy.tradeMultiple(spidersRace, tradesToPerform);
}

// Trade with the Griffins
var griffinsRace = gamePage.diplomacy.get("griffins");
function tradeGriffins() {
	// Check that the Griffins are available to trade with
	if (!griffinsRace.unlocked) {
		return;
	}

	// Check that our iron stockpile isn't already filled beyond its normal capacity
	if (ironResource.value > (ironResource.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	var maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(griffinsRace);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much iron we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For iron, this is 250 units per trade boosted by your trade ratio, modified by a seasonal modifier; there's a random variation, but it's irrelevant since it cancels itself out
	var expectedIronPerTrade = 250 * (1 + gamePage.diplomacy.getTradeRatio()) * griffinsRace.sells[0].seasons[gamePage.calendar.getCurSeason().name];

	// Then modify that by the effects of race relations
	// For the Griffins, this is the chance any given trade will fail because they are hostile
	var tradeChance = 85 + gamePage.getEffect("standingRatio") + (diplomacyPerk.researched ? 10 : 0);
	if (tradeChance < 100) {
		expectedIronPerTrade *= tradeChance / 100;
	}

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For iron, this never happens


	// Our target final iron level is the maximum capacity of our stockpile, minus a buffer of 5 ticks' production to ensure it doesn't overflow before the next autoCraft() (assuming our iron income is positive)
	var targetIron = ironResource.maxValue - Math.max(gamePage.getResourcePerTick('iron', true) * 5, 0);


	// Determine how many trades to perform depending on the current trade mode
	if (tradeMax.iron && gamePage.workshop.getCraft('steel').unlocked) {
		// We are in maximize mode, which means we want to trade for as much iron as possible, converting any excess into steel

		// Determine the maximum amount of iron we can covert to steel right now
		var maxIronCraftable = Math.min(ironResource.value, ironResource.value);

		// Determine the maximum amount of space that we can make available in our iron stockpile right now
		var maxIronSpace = targetIron - (ironResource.value - maxIronCraftable);

		// Calculate the maximum number of trades we can make and fit the results into that space
		var maxTradesFit = Math.floor(maxIronSpace / expectedIronPerTrade);

		// If possible, we want to perform as many trades as we have the resources for; if we don't have enough space in the stockpile to do that, we just do as many as we can fit
		var tradesToPerform = Math.min(maxTradesPossible, maxTradesFit);


		// Convert the excess iron:
		// Determine how much iron those trades will return
		var expectedIron = tradesToPerform * expectedIronPerTrade;

		// Determine how much existing iron must be converted to steel to make room (up to a limit of 'all of it', minimum of 0)
		var ironOverflow = Math.max(Math.min((ironResource.value + expectedIron) - targetIron, ironResource.value), 0);

		// Craft the necessary quantity of steel, with each crafting consuming 100 units of iron
		gamePage.craft("steel", ironOverflow / 100);
	} else {
		// We are in normal mode, which means we want to trade for just enough iron to fill our stockpile

		// Determine the amount of iron needed to reach our target
		var ironRequired = targetIron - ironResource.value;

		// Determine how many trades are needed to get that much iron, rounded down
		var tradesRequired = Math.floor(ironRequired / expectedIronPerTrade);

		// If no trades are necessary, we're done
		if (tradesRequired < 1) {
			return;
		}

		// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
		var tradesToPerform = Math.min(tradesRequired, maxTradesPossible);
	}

	// Perform the trades
	gamePage.diplomacy.tradeMultiple(griffinsRace, tradesToPerform);
}


// Trade for food to prevent starvation
var catnipResource = gamePage.resPool.get('catnip');
var sharksRace = gamePage.diplomacy.get("sharks");
function emergencyTradeFood() {
	// Check that the Sharks are available to trade with
	if (!sharksRace.unlocked) {
		return;
	}

	// If we have a clearly positive catnip income, there is no possibility of starvation and so no need to trade
	// Alternately, if we have a reserve of at least 5 ticks' consumption or 2% of our maximum stockpile, whichever is larger, there is no need to trade yet
	var catnipPerTick = gamePage.getResourcePerTick('catnip', true);
	if ((catnipPerTick > 1) || (catnipResource.value > Math.max(catnipResource.maxValue * 0.02, catnipPerTick * -5))) {
		return;
	}

	// Sanity check: It is theoretically possible that our catnip stockpile does not contain the 5-tick reserve we are demanding, yet is actually already full, because its simply too small to hold that much catnip, in which case there's nothing more we can do
	if (catnipResource.value > (catnipResource.maxValue - 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	var maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(sharksRace);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much catnip we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For catnip, this is 35000 units per trade boosted by your trade ratio, modified by a seasonal modifier; there's a random variation, but it's irrelevant since it cancels itself out
	var expectedCatnipPerTrade = 35000 * (1 + gamePage.diplomacy.getTradeRatio()) * sharksRace.sells[0].seasons[gamePage.calendar.getCurSeason().name];

	// Then modify that by the effects of race relations
	// For the Sharks, this is nothing; the Sharks are neutral, so trades never fail entirely nor return extra

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For catnip, this never happens


	// We don't want to fill up our catnip stockpile; that would be unnecessarily wasteful and increase the chance that autoBuild will just deplete it again buying catnip fields or pastures
	// Instead, our target amount is 20% of our maximum, or enough to cover our deficit for 50 ticks (i.e. 10 days or 20 real-time seconds), whichever is more
	var targetCatnip = Math.max(catnipResource.maxValue * 0.2, catnipPerTick * -50);

	// Sanity check: 'enough to cover our deficit for 50 ticks' might be larger than our entire stockpile, so cap it at that
	targetCatnip = Math.min(targetCatnip, catnipResource.maxValue);


	// Determine how many trades to perform
	// We want to trade for just enough catnip to fill our stockpile

	// Determine the amount of catnip needed to reach our target
	var catnipRequired = targetCatnip - catnipResource.value;

	// Determine how many trades are needed to get that much catnip, rounded up
	var tradesRequired = Math.ceil(catnipRequired / expectedCatnipPerTrade);

	// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
	var tradesToPerform = Math.min(tradesRequired, maxTradesPossible);


	// Perform the trades
	gamePage.diplomacy.tradeMultiple(sharksRace, tradesToPerform);
}


// Hunt automatically
function autoHunt() {
	if (autoCheck[2] != "false") {
		var catpower = gamePage.resPool.get('manpower');
		if (catpower.value > (catpower.maxValue - 1)) {
			gamePage.village.huntAll();
		}
	}
}

// Craft primary resources automatically
function autoCraft() {
	if (autoCheck[1] != "false") {
		for (var i = 0; i < resources.length; i++) {
			var curRes = gamePage.resPool.get(resources[i][0]);
			var resourcePerTick = gamePage.getResourcePerTick(resources[i][0], true);
			var resourcePerCraft = (resourcePerTick * 3);
			if (curRes.value > (curRes.maxValue - resourcePerCraft) && gamePage.workshop.getCraft(resources[i][1]).unlocked) {
				gamePage.craft(resources[i][1], (resourcePerCraft / resources[i][2]));
			}
		}

		// Craft secondary resources automatically if primary craftable is > secondary craftable
		for (var i = 0; i < secondaryResources.length; i++) {
			var priRes = gamePage.resPool.get(secondaryResources[i][0]);
			var secRes = gamePage.resPool.get(secondaryResources[i][1]);
			var resMath = priRes.value / secondaryResources[i][2];

			if (resMath > 1 && secRes.value < (priRes.value * (secResRatio / 100)) && gamePage.workshop.getCraft(secondaryResources[i][1]).unlocked) {
				gamePage.craft(secondaryResources[i][1], (resMath * (secResRatio / 100)));
			}
		}

		//Craft the fur derivatives
		var furDerivatives = ['parchment', 'manuscript', 'compedium', 'blueprint'];
		for (var i = 0; i < furDerVal; i++) {
			if (gamePage.workshop.getCraft(furDerivatives[i]).unlocked) {
				gamePage.craftAll(furDerivatives[i]);
			}
		}
	}
}

// Auto Research
function autoResearch() {
	if (autoCheck[5] != "false" && gamePage.libraryTab.visible != false) {
		var origTab = gamePage.ui.activeTabId;
		gamePage.ui.activeTabId = 'Science';
		gamePage.render();

		var btn = gamePage.tabs[2].buttons;

		for (var i = 0; i < btn.length; i++) {
			if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
				try {
					btn[i].controller.buyItem(btn[i].model, {}, function(result) {
						if (result) {
							btn[i].update();
						}
					});
				} catch(err) {
					console.log(err);
				}
			}
		}

		if (origTab != gamePage.ui.activeTabId) {
			gamePage.ui.activeTabId = origTab; gamePage.render();
		}
	}
}

// Auto Workshop upgrade , tab 3
function autoWorkshop() {
	if (autoCheck[6] != "false" && gamePage.workshopTab.visible != false) {
		var origTab = gamePage.ui.activeTabId;
		gamePage.ui.activeTabId = 'Workshop';
		gamePage.render();

		var btn = gamePage.tabs[3].buttons;

		for (var i = 0; i < btn.length; i++) {
			if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
				try {
					btn[i].controller.buyItem(btn[i].model, {}, function(result) {
						if (result) {
							btn[i].update();
						}
					});
				} catch(err) {
					console.log(err);
				}
			}
		}

		if (origTab != gamePage.ui.activeTabId) {
			gamePage.ui.activeTabId = origTab; gamePage.render();
		}
	}
}

// Festival automatically
function autoParty() {
	if (autoCheck[7] != "false" && gamePage.science.get("drama").researched) {
		var catpower = gamePage.resPool.get('manpower').value;
		var culture = gamePage.resPool.get('culture').value;
		var parchment = gamePage.resPool.get('parchment').value;

		if ((catpower > 1500) && (culture > 5000) && (parchment > 2500) && (gamePage.calendar.festivalDays < 4000)) {
			if (gamePage.prestige.getPerk("carnivals").researched)
				gamePage.village.holdFestival(1);
			else if (gamePage.calendar.festivalDays = 0) {
				gamePage.village.holdFestival(1);
			}
		}

	}
}

// Auto assign new kittens to selected job
function autoAssign() {
	if (autoCheck[8] != "false" && gamePage.village.getJob(autoChoice).unlocked) {
		gamePage.village.assignJob(gamePage.village.getJob(autoChoice));
	}
}

// Control Energy Consumption
function energyControl() {
	if (autoCheck[9] != "false") {
		proVar = gamePage.resPool.energyProd;
		conVar = gamePage.resPool.energyCons;

		if (bldAccelerator.val > bldAccelerator.on && proVar > (conVar + 3)) {
			bldAccelerator.on++;
			conVar++;
		} else if (bldCalciner.val > bldCalciner.on && proVar > (conVar + 3)) {
			bldCalciner.on++;
			conVar++;
		} else if (bldFactory.val > bldFactory.on && proVar > (conVar + 3)) {
			bldFactory.on++;
			conVar++;
		} else if (bldOilWell.val > bldOilWell.on && proVar > (conVar + 3)) {
			bldOilWell.on++;
			conVar++;
		} else if (bldBioLab.val > bldBioLab.on && proVar > (conVar + 3)) {
			bldBioLab.on++;
			conVar++;
		} else if (bldBioLab.on > 0 && proVar < conVar) {
			bldBioLab.on--;
			conVar--;
		} else if (bldOilWell.on > 0 && proVar < conVar) {
			bldOilWell.on--;
			conVar--;
		} else if (bldFactory.on > 0 && proVar < conVar) {
			bldFactory.on--;
			conVar--;
		} else if (bldCalciner.on > 0 && proVar < conVar) {
			bldCalciner.on--;
			conVar--;
		} else if (bldAccelerator.on > 0 && proVar < conVar) {
			bldAccelerator.on--;
			conVar--;
		}
	}
}

function autoNip() {
	if (autoCheck[0] != "false") {
		if (gamePage.bld.buildingsData[0].val < 30) {
			console.log("taco");
			$(".btnContent:contains('Gather')").trigger("click");
		}
	}
}

// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
clearInterval(runAllAutomation);
var runAllAutomation = setInterval(function() {
	autoNip();
	autoPraise();
	autoBuild();
	emergencyTradeFood();

	if (gamePage.timer.ticksTotal % 3 === 0) {
		autoObserve();
		autoCraft();
		autoHunt();
		autoAssign();
		energyControl();
	}

	if (gamePage.timer.ticksTotal % 10 === 0) {
		autoSpace();
	}

	if (gamePage.timer.ticksTotal % 25 === 0) {
		autoResearch();
		autoWorkshop();
		autoParty();
		autoTrade();
	}

}, 200);

