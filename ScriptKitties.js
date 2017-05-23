var autoCheck = ['true', 'true', 'true', 'true', 'true'];
var autoName = ['build', 'craft', 'hunt', 'trade', 'praise'];

var tickDownCounter = 30;
var deadScript = "Script is dead";
var furDerVal = 3;

var buildings = [
		["Hut", false], // 0
		["Log House", false], // 1
		["Mansion", false], // 2
		["Workshop", false], // 3
		["Factory", false], // 4
		["Catnip field", false], // 5
		["Pasture", false], // 6
		["Solar Farm", false], // 7
		["Mine", false], // 8
		["Lumber Mill", false], // 9
		["Aqueduct", false], // 10
		["Hydro Plant", false], // 11
		["Oil Well", false], // 12
		["Quarry", false], // 13
		["Smelter", false], // 14
		["Bio Lab", false], // 15
		["Calciner", false], // 16
		["Reactor", false], // 17
		["Accelerator", false], // 18
		["Steamworks", false], // 19
		["Magneto", false], // 20
		["Library", false], // 21
		["Academy", false], // 22
		["Observatory", false], // 23
		["Barn", false], // 24
		["Harbour", false], // 25
		["Warehouse", false], // 26
		["Amphitheatre", false], // 27
		["Broadcast Tower", false], // 28
		["Tradepost", false], // 29
		["Chapel", false], // 30
		["Temple", false], // 31
		["Mint", false], // 32
		["Ziggurat", false], // 33
		["Chronosphere", false] // 34
		];	

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +
'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button>' +
'<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button>' +
'<button id="autoBuild" onclick="autoSwitch(autoCheck[0], 0, autoName[0])"> Auto Build </button>' + 
'<button id="bldSelect" onclick="selectBuildings()">Select Building</button>' +

'<button id="autoCraft" onclick="autoSwitch(autoCheck[1], 1, autoName[1])"> Auto Craft </button>' +
'<select id="craftFur" size="1" onclick="setFurValue()">' +
'<option value="1">Parchment</option>' +
'<option value="2">Manuscript</option>' +
'<option value="3">Compendium</option>' +
'<option value="4">Blueprint</option>' +
'</select>' +

'<button id="autoHunt" onclick="autoSwitch(autoCheck[2], 2, autoName[2])"> Auto Hunt </button>' + 
'<button id="autoTrade" onclick="autoSwitch(autoCheck[3], 3, autoName[3])"> Auto Trade </button>' +
'<button id="autoPraise" onclick="autoSwitch(autoCheck[4], 4, autoName[4])"> Auto Praise </button>' +
'<text id="tickDownTime"></text>' +
'</div>' 

$("#footerLinks").append(htmlMenuAddition);

var bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-400px" class="dialog help">' + 
'<a href="#" onclick="clearHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' + 

'	<br><b>Kitten Housing</b><br>' + 
'	<input type="checkbox" id="hutBld" onclick="verifyBuildingSelected(\'0\', \'hutBld\')"><label for="hutBld">Hut</label><br>' + 
'	<input type="checkbox" id="houseBld" onclick="verifyBuildingSelected(\'1\', \'houseBld\')"><label for="houseBld">Log House</label><br>' + 
'	<input type="checkbox" id="mansionBld" onclick="verifyBuildingSelected(\'2\', \'mansionBld\')"><label for="mansionBld">Mansion</label><br><br>' + 

'	Craft Bonuses<br>' + 
'	<input type="checkbox" id="workshopBld" onclick="verifyBuildingSelected(\'3\', \'workshopBld\')"><label for="workshopBld">Workshop</label><br>' + 
'	<input type="checkbox" id="factoryBld" onclick="verifyBuildingSelected(\'4\', \'factoryBld\')"><label for="factoryBld">Factory</label><br><br>' + 

'	Production<br>' + 
'	<input type="checkbox" id="fieldBld" onclick="verifyBuildingSelected(\'5\', \'fieldBld\')"><label for="fieldBld">Catnip Field</label><br>' + 
'	<input type="checkbox" id="pastureBld" onclick="verifyBuildingSelected(\'6\', \'pastureBld\')"><label for="pastureBld">Pasture</label><br>' + 
'	<input type="checkbox" id="solarBld" onclick="verifyBuildingSelected(\'7\', \'solarBld\')"><label for="solarBld">Solar Farm</label><br>' + 
'	<input type="checkbox" id="mineBld" onclick="verifyBuildingSelected(\'8\', \'mineBld\')"><label for="mineBld">Mine</label><br>' + 
'	<input type="checkbox" id="lumberBld" onclick="verifyBuildingSelected(\'9\', \'lumberBld\')"><label for="lumberBld">Lumber Mill</label><br>' + 
'	<input type="checkbox" id="aqueductBld" onclick="verifyBuildingSelected(\'10\', \'aqueductBld\')"><label for="aqueductBld">Aqueduct</label><br>' + 
'	<input type="checkbox" id="hydroBld" onclick="verifyBuildingSelected(\'11\', \'hydroBld\')"><label for="hydroBld">Hydro Plant</label><br>' + 
'	<input type="checkbox" id="oilBld" onclick="verifyBuildingSelected(\'12\', \'oilBld\')"><label for="oilBld">Oil Well</label><br>' + 
'	<input type="checkbox" id="quarryBld" onclick="verifyBuildingSelected(\'13\', \'quarryBld\')"><label for="quarryBld">Quarry</label><br><br>' + 

'	Conversion<br>' + 
'	<input type="checkbox" id="smelterBld" onclick="verifyBuildingSelected(\'14\', \'smelterBld\')"><label for="smelterBld">Smelter</label><br>' + 
'	<input type="checkbox" id="labBld" onclick="verifyBuildingSelected(\'15\', \'labBld\')"><label for="labBld">Bio Lab</label><br>' + 
'	<input type="checkbox" id="calcinerBld" onclick="verifyBuildingSelected(\'16\', \'calcinerBld\')"><label for="calcinerBld">Calciner</label><br>' + 
'	<input type="checkbox" id="reactorBld" onclick="verifyBuildingSelected(\'17\', \'reactorBld\')"><label for="reactorBld">Reactor</label><br>' + 
'	<input type="checkbox" id="acceleratorBld" onclick="verifyBuildingSelected(\'18\', \'acceleratorBld\')"><label for="acceleratorBld">Accelerator</label><br>' + 
'	<input type="checkbox" id="steamBld" onclick="verifyBuildingSelected(\'19\', \'steamBld\')"><label for="steamBld">Steamworks</label><br>' + 
'	<input type="checkbox" id="magnetoBld" onclick="verifyBuildingSelected(\'20\', \'magnetoBld\')"><label for="magnetoBld">Magneto</label><br><br>' + 

'	Science<br>' + 
'	<input type="checkbox" id="libraryBld" onclick="verifyBuildingSelected(\'21\', \'libraryBld\')"><label for="libraryBld">Library</label><br>' + 
'	<input type="checkbox" id="academyBld" onclick="verifyBuildingSelected(\'22\', \'academyBld\')"><label for="academyBld">Academy</label><br>' + 
'	<input type="checkbox" id="obervatoryBld" onclick="verifyBuildingSelected(\'23\', \'obervatoryBld\')"><label for="obervatoryBld">Observatory</label><br><br>' + 

'	Storage<br>' + 
'	<input type="checkbox" id="barnBld" onclick="verifyBuildingSelected(\'24\', \'barnBld\')"><label for="barnBld">Barn</label><br>' + 
'	<input type="checkbox" id="harborBld" onclick="verifyBuildingSelected(\'25\', \'harborBld\')"><label for="harborBld">Harbor</label><br>' + 
'	<input type="checkbox" id="warehouseBld" onclick="verifyBuildingSelected(\'26\', \'warehouseBld\')"><label for="warehouseBld">Warehouse</label><br><br>' + 

'	Other<br>' + 
'	<input type="checkbox" id="ampBld" onclick="verifyBuildingSelected(\'27\', \'ampBld\')"><label for="ampBld">Amphitheatre</label><br>' + 
'	<input type="checkbox" id="towerBld" onclick="verifyBuildingSelected(\'28\', \'towerBld\')"><label for="towerBld">Broadcast Tower</label><br>' + 
'	<input type="checkbox" id="tradeBld" onclick="verifyBuildingSelected(\'29\', \'tradeBld\')"><label for="tradeBld">Tradepost</label><br>' + 
'	<input type="checkbox" id="chapelBld" onclick="verifyBuildingSelected(\'30\', \'chapelBld\')"><label for="chapelBld">Chapel</label><br>' + 
'	<input type="checkbox" id="templeBld" onclick="verifyBuildingSelected(\'31\', \'templeBld\')"><label for="templeBld">Temple</label><br>' + 
'	<input type="checkbox" id="mintBld" onclick="verifyBuildingSelected(\'32\', \'mintBld\')"><label for="mintBld">Mint</label><br>' + 
'	<input type="checkbox" id="zigguratBld" onclick="verifyBuildingSelected(\'33\', \'zigguratBld\')"><label for="zigguratBld">Ziggurat</label><br>' + 
'	<input type="checkbox" id="chronoBld" onclick="verifyBuildingSelected(\'34\', \'chronoBld\')"><label for="chronoBld">Chronosphere</label><br><br>' + 

'</div>'

function verifyBuildingSelected(buildingNumber, buildingCheckID) {
	var bldIsChecked = document.getElementById(buildingCheckID).checked;
	buildings[buildingNumber][1] = bldIsChecked;
	console.log(buildings[buildingNumber][0]);
}

$("#game").append(bldSelectAddition);

function clearHelpDiv() {
	$("#buildingSelect").hide();
}

function selectBuildings() {
	$("#buildingSelect").toggle();
}

function setFurValue() {
	furDerVal = $('#craftFur').val();
}

function autoSwitch(varCheck, varNumber, textChange) {
	if (varCheck == "false") {
		autoCheck[varNumber] = "true";
		gamePage.msg('Auto' + textChange + ' is now on');
	} else if (varCheck == "true") {
		autoCheck[varNumber] = "false";
		gamePage.msg('Auto' + textChange + ' is now off');
	}
}

function clearScript() {
	$("#killSwitch").remove();
	$("#efficiencyButton").remove();
	$("#tickDownTime").remove();
	$("#autoBuild").remove();
	$("#autoCraft").remove();
	$("#autoHunt").remove();
	$("#autoTrade").remove();
	$("#autoPraise").remove();
	$("#farRightColumn").remove();
	$("#craftFur").remove();
	$("#buildingSelect").remove();
	clearInterval(autoObserve);
	clearInterval(autoRun);
	clearInterval(tickTimer);
	autoBuildCheck = null;
}

				// Show current kitten efficiency in the in-game log
function kittenEfficiency() {		
	var timePlayed = gamePage.stats.statsCurrent[3].calculate(game);
	var numberKittens = gamePage.resPool.get('kittens').value;
	var curEfficiency = (numberKittens - 70) / timePlayed;
	gamePage.msg("Your current efficiency is " + parseFloat(curEfficiency).toFixed(2) + " kittens per hour.");
}

clearInterval(tickTimer);
var tickTimer = setInterval(function() {

	tickDownCounter = tickDownCounter - 1;
	$('#tickDownTime').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; There are ' + tickDownCounter + ' seconds left till the script executes again.');
	
	if (tickDownCounter == 0) {
	tickDownCounter = 30;
	}
	
}, 1000);

clearInterval(autoObserve);
var autoObserve = setInterval(function() {
		// Auto Observe Astronomical Events

		var checkObserveBtn = document.getElementById("observeBtn");
		if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
		document.getElementById('observeBtn').click();
		
} else {
}
}, 500);

clearInterval(autoRun);
var autoRun = setInterval(function() {
	
        var resources = [
       		["catnip", "wood", 50],
                ["wood", "beam", 175],
        	["minerals", "slab", 250],
                ["coal", "steel", 100],
        	["iron", "plate", 125],
                ["oil", "kerosene", 1000],
                ["titanium", "alloy", 75],
                ["uranium", "thorium", 250]
                ];
		
		// Build buildings automatically
if (autoCheck[0] != "false") {
	for (var i = 0; i < buildings.length; i++) {
		if (buildings[i][1] != false){
			$(".btnContent:contains('" + (buildings[i][0]) + "')").click();
		}
		else {
		}
	}
}
	
if (autoCheck[3] != "false") {
		// Trade automatically
	var titRes = gamePage.resPool.get('titanium');
	var goldResource = gamePage.resPool.get('gold');
    var goldOneTwenty = gamePage.getResourcePerTick('gold') * 200;
		if (goldResource.value > (goldResource.maxValue - goldOneTwenty)) {
			if (titRes.value != titRes.maxValue  && gamePage.diplomacy.get('zebras').unlocked) {
				gamePage.diplomacy.tradeMultiple(game.diplomacy.get("zebras"), (goldOneTwenty / 15));
			} else if (gamePage.diplomacy.get('dragons').unlocked) {
				gamePage.diplomacy.tradeMultiple(game.diplomacy.get("dragons"), (goldOneTwenty / 15));
			}
		}
}
	
if (autoCheck[2] != "false") {		
		// Hunt automatically
	var catpower = gamePage.resPool.get('manpower');
	var catpowerOneTwenty = gamePage.getResourcePerTick('manpower') * 200;
		if (catpower.value > (catpower.maxValue - catpowerOneTwenty)) {
			gamePage.village.huntMultiple(catpowerOneTwenty / 100);
		}
}	

if (autoCheck[1] != "false") {
		// Craft high level resources automatically
for (var i = 0; i < resources.length; i++) {
    var curRes = gamePage.resPool.get(resources[i][0]);
    var resourcePerTick = gamePage.getResourcePerTick(resources[i][0], 0);
    var resourceOneTwenty = (resourcePerTick * 200);
		if (curRes.value > (curRes.maxValue - resourceOneTwenty) && gamePage.workshop.getCraft(resources[i][1]).unlocked) {
		gamePage.craft(resources[i][1], (resourceOneTwenty / resources[i][2]));
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

if (autoCheck[4] != "false") {
		// Auto praise the sun
if (gamePage.resPool.get('faith').value / gamePage.resPool.get('faith').maxValue > 0.95) {
	gamePage.religion.praise();
	} else {
}
}

}, 30000 );
