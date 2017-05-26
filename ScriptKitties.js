var autoCheck = ['true', 'true', 'true', 'true', 'true', 'false', 'false'];
var autoName = ['build', 'craft', 'hunt', 'trade', 'praise', 'science', 'upgrade'];

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

'<a id="scriptOptions" onclick="selectOptions()"> | ScriptKitties </a>' + 

'<div id="optionSelect" style="display:none; margin-top:-400px; margin-left:-600px;" class="dialog help">' + 
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' + 

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br>' +
'<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button></br></br>' +
'<button id="autoBuild" onclick="autoSwitch(autoCheck[0], 0, autoName[0], \'autoBuild\');"> Auto Build </button></br>' + 
'<button id="bldSelect" onclick="selectBuildings()">Select Building</button></br>' +

'<button id="autoCraft" onclick="autoSwitch(autoCheck[1], 1, autoName[1], \'autoCraft\')"> Auto Craft </button>' +
'<select id="craftFur" size="1" onclick="setFurValue()">' +
'<option value="1" selected="selected">Parchment</option>' +
'<option value="2">Manuscript</option>' +
'<option value="3">Compendium</option>' +
'<option value="4">Blueprint</option>' +
'</select></br>' +

'<button id="autoHunt" onclick="autoSwitch(autoCheck[2], 2, autoName[2], \'autoHunt\')"> Auto Hunt </button></br>' + 
'<button id="autoTrade" onclick="autoSwitch(autoCheck[3], 3, autoName[3], \'autoTrade\')"> Auto Trade </button></br>' +
'<button id="autoPraise" onclick="autoSwitch(autoCheck[4], 4, autoName[4], \'autoPraise\')"> Auto Praise </button></br></br>' +
'<button id="autoScience" style="color:red" onclick="autoSwitch(autoCheck[5], 5, autoName[5], \'autoScience\')"> Auto Science </button></br>' +
'<button id="autoUpgrade" style="color:red" onclick="autoSwitch(autoCheck[6], 6, autoName[6], \'autoUpgrade\')"> Auto Upgrade </button></br></br>' +
'</ br><text id="tickDownTime"></text>' +
'</div>' +
'</div>'

$("#footerLinks").append(htmlMenuAddition);

var bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-400px" class="dialog help">' + 
'<a href="#" onclick="clearHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' + 

'	<br><input type="checkbox" id="hutChecker"><label for="hutChecker" onclick="$(\'.hutCheck\').prop(\'checked\', !$(\'.hutCheck\').prop(\'checked\'));"><b>Kitten Housing</b></label><br>' + 
'	<input type="checkbox" id="hutBld" class="hutCheck" onclick="verifyBuildingSelected(\'0\', \'hutBld\')"><label for="hutBld">Hut</label><br>' + 
'	<input type="checkbox" id="houseBld" class="hutCheck" onclick="verifyBuildingSelected(\'1\', \'houseBld\')"><label for="houseBld">Log House</label><br>' + 
'	<input type="checkbox" id="mansionBld" class="hutCheck" onclick="verifyBuildingSelected(\'2\', \'mansionBld\')"><label for="mansionBld">Mansion</label><br><br>' + 

'	<input type="checkbox" id="craftChecker"><label for="craftChecker" onclick="$(\'.craftCheck\').prop(\'checked\', !$(\'.craftCheck\').prop(\'checked\'));"><b>Craft Bonuses</b></label><br>' + 
'	<input type="checkbox" id="workshopBld" class="craftCheck" onclick="verifyBuildingSelected(\'3\', \'workshopBld\')"><label for="workshopBld">Workshop</label><br>' + 
'	<input type="checkbox" id="factoryBld" class="craftCheck" onclick="verifyBuildingSelected(\'4\', \'factoryBld\')"><label for="factoryBld">Factory</label><br><br>' + 

'	<input type="checkbox" id="prodChecker"><label for="prodChecker" onclick="$(\'.prodCheck\').prop(\'checked\', !$(\'.prodCheck\').prop(\'checked\'));"><b>Production</b></label><br>' + 
'	<input type="checkbox" id="fieldBld" class="prodCheck" onclick="verifyBuildingSelected(\'5\', \'fieldBld\')"><label for="fieldBld">Catnip Field</label><br>' + 
'	<input type="checkbox" id="pastureBld" class="prodCheck" onclick="verifyBuildingSelected(\'6\', \'pastureBld\')"><label for="pastureBld">Pasture</label><br>' + 
'	<input type="checkbox" id="solarBld" class="prodCheck" onclick="verifyBuildingSelected(\'7\', \'solarBld\')"><label for="solarBld">Solar Farm</label><br>' + 
'	<input type="checkbox" id="mineBld" class="prodCheck" onclick="verifyBuildingSelected(\'8\', \'mineBld\')"><label for="mineBld">Mine</label><br>' + 
'	<input type="checkbox" id="lumberBld" class="prodCheck" onclick="verifyBuildingSelected(\'9\', \'lumberBld\')"><label for="lumberBld">Lumber Mill</label><br>' + 
'	<input type="checkbox" id="aqueductBld" class="prodCheck" onclick="verifyBuildingSelected(\'10\', \'aqueductBld\')"><label for="aqueductBld">Aqueduct</label><br>' + 
'	<input type="checkbox" id="hydroBld" class="prodCheck" onclick="verifyBuildingSelected(\'11\', \'hydroBld\')"><label for="hydroBld">Hydro Plant</label><br>' + 
'	<input type="checkbox" id="oilBld" class="prodCheck" onclick="verifyBuildingSelected(\'12\', \'oilBld\')"><label for="oilBld">Oil Well</label><br>' + 
'	<input type="checkbox" id="quarryBld" class="prodCheck" onclick="verifyBuildingSelected(\'13\', \'quarryBld\')"><label for="quarryBld">Quarry</label><br><br>' + 

'	<input type="checkbox" id="conversionChecker"><label for="conversionChecker" onclick="$(\'.convertCheck\').prop(\'checked\', !$(\'.convertCheck\').prop(\'checked\'));"><b>Conversion</b></label><br>' + 
'	<input type="checkbox" id="smelterBld" class="convertCheck" onclick="verifyBuildingSelected(\'14\', \'smelterBld\')"><label for="smelterBld">Smelter</label><br>' + 
'	<input type="checkbox" id="labBld" class="convertCheck" onclick="verifyBuildingSelected(\'15\', \'labBld\')"><label for="labBld">Bio Lab</label><br>' + 
'	<input type="checkbox" id="calcinerBld" class="convertCheck" onclick="verifyBuildingSelected(\'16\', \'calcinerBld\')"><label for="calcinerBld">Calciner</label><br>' + 
'	<input type="checkbox" id="reactorBld" class="convertCheck" onclick="verifyBuildingSelected(\'17\', \'reactorBld\')"><label for="reactorBld">Reactor</label><br>' + 
'	<input type="checkbox" id="acceleratorBld" class="convertCheck" onclick="verifyBuildingSelected(\'18\', \'acceleratorBld\')"><label for="acceleratorBld">Accelerator</label><br>' + 
'	<input type="checkbox" id="steamBld" class="convertCheck" onclick="verifyBuildingSelected(\'19\', \'steamBld\')"><label for="steamBld">Steamworks</label><br>' + 
'	<input type="checkbox" id="magnetoBld" class="convertCheck" onclick="verifyBuildingSelected(\'20\', \'magnetoBld\')"><label for="magnetoBld">Magneto</label><br><br>' + 

'	<input type="checkbox" id="scienceChecker"><label for="scienceChecker" onclick="$(\'.scienceCheck\').prop(\'checked\', !$(\'.scienceCheck\').prop(\'checked\'));"><b>Science</b></label><br>' + 
'	<input type="checkbox" id="libraryBld" class="scienceCheck" onclick="verifyBuildingSelected(\'21\', \'libraryBld\')"><label for="libraryBld">Library</label><br>' + 
'	<input type="checkbox" id="academyBld" class="scienceCheck" onclick="verifyBuildingSelected(\'22\', \'academyBld\')"><label for="academyBld">Academy</label><br>' + 
'	<input type="checkbox" id="obervatoryBld" class="scienceCheck" onclick="verifyBuildingSelected(\'23\', \'obervatoryBld\')"><label for="obervatoryBld">Observatory</label><br><br>' + 

'	<input type="checkbox" id="storageChecker"><label for="storageChecker" onclick="$(\'.storageCheck\').prop(\'checked\', !$(\'.storageCheck\').prop(\'checked\'));"><b>Storage</b></label><br>' + 
'	<input type="checkbox" id="barnBld" class="storageCheck" onclick="verifyBuildingSelected(\'24\', \'barnBld\')"><label for="barnBld">Barn</label><br>' + 
'	<input type="checkbox" id="harborBld" class="storageCheck" onclick="verifyBuildingSelected(\'25\', \'harborBld\')"><label for="harborBld">Harbor</label><br>' + 
'	<input type="checkbox" id="warehouseBld" class="storageCheck" onclick="verifyBuildingSelected(\'26\', \'warehouseBld\')"><label for="warehouseBld">Warehouse</label><br><br>' + 

'	<input type="checkbox" id="otherChecker"><label for="otherChecker" onclick="$(\'.otherCheck\').prop(\'checked\', !$(\'.otherCheck\').prop(\'checked\'));"><b>Other</b></label><br>' + 
'	<input type="checkbox" id="ampBld" class="otherCheck" onclick="verifyBuildingSelected(\'27\', \'ampBld\')"><label for="ampBld">Amphitheatre</label><br>' + 
'	<input type="checkbox" id="towerBld" class="otherCheck" onclick="verifyBuildingSelected(\'28\', \'towerBld\')"><label for="towerBld">Broadcast Tower</label><br>' + 
'	<input type="checkbox" id="tradeBld" class="otherCheck" onclick="verifyBuildingSelected(\'29\', \'tradeBld\')"><label for="tradeBld">Tradepost</label><br>' + 
'	<input type="checkbox" id="chapelBld" class="otherCheck" onclick="verifyBuildingSelected(\'30\', \'chapelBld\')"><label for="chapelBld">Chapel</label><br>' + 
'	<input type="checkbox" id="templeBld" class="otherCheck" onclick="verifyBuildingSelected(\'31\', \'templeBld\')"><label for="templeBld">Temple</label><br>' + 
'	<input type="checkbox" id="mintBld" class="otherCheck" onclick="verifyBuildingSelected(\'32\', \'mintBld\')"><label for="mintBld">Mint</label><br>' + 
'	<input type="checkbox" id="zigguratBld" class="otherCheck" onclick="verifyBuildingSelected(\'33\', \'zigguratBld\')"><label for="zigguratBld">Ziggurat</label><br>' + 
'	<input type="checkbox" id="chronoBld" class="otherCheck" onclick="verifyBuildingSelected(\'34\', \'chronoBld\')"><label for="chronoBld">Chronosphere</label><br><br>' + 

'</div>'

$("#hutChecker").click(function() {
        $(".hutCheck").prop("checked", !checkBoxes.prop("checked"));
    });   

function verifyBuildingSelected(buildingNumber, buildingCheckID) {
	var bldIsChecked = document.getElementById(buildingCheckID).checked;
	buildings[buildingNumber][1] = bldIsChecked;
	console.log(buildings[buildingNumber][0]);
}

$("#game").append(bldSelectAddition);

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
	$("#killSwitch").remove();
	$("#efficiencyButton").remove();
	$("#tickDownTime").remove();
	$("#autoBuild").remove();
	$("#autoCraft").remove();
	$("#autoHunt").remove();
	$("#autoTrade").remove();
	$("#autoPraise").remove();
	$("#autoScience").remove();
	$("#autoUpgrade").remove();
	$("#farRightColumn").remove();
	$("#craftFur").remove();
	$("#buildingSelect").remove();
	$("#scriptOptions").remove();
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

clearInterval(autoObserve);
var autoObserve = setInterval(function() {
		// Auto Observe Astronomical Events

		var checkObserveBtn = document.getElementById("observeBtn");
		if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
		document.getElementById('observeBtn').click();
				
} else {
}

if (autoCheck[4] != "false") {
		// Auto praise the sun
			gamePage.religion.praise();
}

}, 500);

clearInterval(tickTimer);
var tickTimer = setInterval(function() {

	tickDownCounter = tickDownCounter - 1;
	$('#tickDownTime').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; There are ' + tickDownCounter + ' seconds left till the script executes again.');
	
}, 1000);

clearInterval(autoRun);
var autoRun = setInterval(function() {
	tickDownCounter = 30;
	
        var resources = [
       		["catnip", "wood", 50],
            ["wood", "beam", 175],
        	["minerals", "slab", 250],
            ["coal", "steel", 100],
        	["iron", "plate", 125],
            ["oil", "kerosene", 1000],
            ["titanium", "alloy", 75],
            ["uranium", "thorium", 250],
			["unobtainium", "eludium", 1000]
                ];
		
		// Build buildings automatically
if (autoCheck[0] != "false" && gamePage.ui.activeTabId == 'Bonfire') {
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
				gamePage.diplomacy.tradeAll(game.diplomacy.get("zebras"), (goldOneTwenty / 15));
			} else if (gamePage.diplomacy.get('dragons').unlocked) {
				gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"), (goldOneTwenty / 15));
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
	
		// Test auto Research capabilities!
if (autoCheck[5] != "false" && gamePage.libraryTab.visible != false) {
	var origTab = gamePage.ui.activeTabId;
      
	gamePage.ui.activeTabId = 'Science'; gamePage.render();
	  
	var techs = gamePage.science.techs;

	 for (var i = 0; i < techs.length; i++) {
		if (techs[i].unlocked && techs[i].researched != true) {
			$(".btnContent:contains('" + techs[i].label + "')").click();

			}
		}
	  
      if (origTab != gamePage.ui.activeTabId) {
        gamePage.ui.activeTabId = origTab; gamePage.render();
      }
}

		// Test auto Workshop upgrade capabilities!
if (autoCheck[6] != "false" && gamePage.workshopTab.visible != false) {
var origTab = gamePage.ui.activeTabId;
      
	gamePage.ui.activeTabId = 'Workshop'; gamePage.render();
	  
	var upgrades = gamePage.workshop.upgrades;
	  
	 for (var i = 0; i < upgrades.length; i++) {
		if (upgrades[i].unlocked && upgrades[i].researched != true) {
			$(".btnContent:contains('" + upgrades[i].label + "')").click();
			}
		}
	 	  
      if (origTab != gamePage.ui.activeTabId) {
        gamePage.ui.activeTabId = origTab; gamePage.render();
      }	
}

}, 30000 );
