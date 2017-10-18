 // These control the button statuses
var autoCheck = ['false', 'false', 'false', 'false', 'false', 'false', 'false', 'false', 'false', 'false'];
var autoName = ['build', 'craft', 'hunt', 'trade', 'praise', 'science', 'upgrade', 'party', 'assign', 'energy'];

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
			]

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

'<a id="scriptOptions" onclick="selectOptions()"> | ScriptKitties </a>' + 

'<div id="optionSelect" style="display:none; margin-top:-400px; margin-left:-100px; width:200px" class="dialog help">' + 
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' + 

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br>' +
'<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button></br></br>' +
'<button id="autoBuild" style="color:red" onclick="autoSwitch(autoCheck[0], 0, autoName[0], \'autoBuild\');"> Auto Build </button></br>' + 
'<button id="bldSelect" onclick="selectBuildings()">Select Building</button></br>' +

'<button id="autoAssign" style="color:red" onclick="autoSwitch(autoCheck[8], 8, autoName[8], \'autoAssign\')"> Auto Assign </button>' +
'<select id="autoAssignChoice" size="1" onclick="setAutoAssignValue()">' +
'<option value="farmer" selected="selected">Farmer</option>' +
'<option value="woodcutter">Woodcutter</option>' +
'<option value="scholar">Scholar</option>' +
'<option value="priest">Priest</option>' +
'<option value="miner">Miner</option>' +
'<option value="hunter">Hunter</option>' +
'<option value="engineer">Engineer</option>' +
'</select></br>' +

'<button id="autoCraft" style="color:red" onclick="autoSwitch(autoCheck[1], 1, autoName[1], \'autoCraft\')"> Auto Craft </button>' +
'<select id="craftFur" size="1" onclick="setFurValue()">' +
'<option value="1" selected="selected">Parchment</option>' +
'<option value="2">Manuscript</option>' +
'<option value="3">Compendium</option>' +
'<option value="4">Blueprint</option>' +
'</select></br></br>' +

'<label id="secResLabel"> Secondary Craft % </label>' + 
'<span id="secResSpan" title="Between 0 and 100"><input id="secResText" type="text" style="width:25px" onchange="secResRatio = this.value" value="30"></span></br></br>' + 


'<button id="autoHunt" style="color:red" onclick="autoSwitch(autoCheck[2], 2, autoName[2], \'autoHunt\')"> Auto Hunt </button></br>' + 
'<button id="autoTrade" style="color:red" onclick="autoSwitch(autoCheck[3], 3, autoName[3], \'autoTrade\')"> Auto Trade </button></br>' +
'<button id="autoPraise" style="color:red" onclick="autoSwitch(autoCheck[4], 4, autoName[4], \'autoPraise\')"> Auto Praise </button></br></br>' +
'<button id="autoScience" style="color:red" onclick="autoSwitch(autoCheck[5], 5, autoName[5], \'autoScience\')"> Auto Science </button></br>' +
'<button id="autoUpgrade" style="color:red" onclick="autoSwitch(autoCheck[6], 6, autoName[6], \'autoUpgrade\')"> Auto Upgrade </button></br>' +
'<button id="autoEnergy" style="color:red" onclick="autoSwitch(autoCheck[9], 9, autoName[9], \'autoEnergy\')"> Energy Control </button></br>' +
'<button id="autoParty" style="color:red" onclick="autoSwitch(autoCheck[7], 7, autoName[7], \'autoParty\')"> Auto Party </button></br></br>' + 
'</div>' +
'</div>'

$("#footerLinks").append(htmlMenuAddition);

var bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-400px; width:200px" class="dialog help">' + 
'<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; left: 15px;">space</a>' + 
'<a href="#" onclick="$(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' + 

'	<br><input type="checkbox" id="hutChecker"><label for="hutChecker" onclick="$(\'.hutCheck\').click();"><b>Kitten Housing</b></label><br>' + 
'	<input type="checkbox" id="hutBld" class="hutCheck" onchange="verifyBuildingSelected(\'0\', \'hutBld\');"><label for="hutBld">Hut</label><br>' + 
'	<input type="checkbox" id="houseBld" class="hutCheck" onchange="verifyBuildingSelected(\'1\', \'houseBld\')"><label for="houseBld">Log House</label><br>' + 
'	<input type="checkbox" id="mansionBld" class="hutCheck" onchange="verifyBuildingSelected(\'2\', \'mansionBld\')"><label for="mansionBld">Mansion</label><br><br>' + 

'	<input type="checkbox" id="craftChecker"><label for="craftChecker" onclick="$(\'.craftCheck\').click();"><b>Craft Bonuses</b></label><br>' + 
'	<input type="checkbox" id="workshopBld" class="craftCheck" onchange="verifyBuildingSelected(\'3\', \'workshopBld\')"><label for="workshopBld">Workshop</label><br>' + 
'	<input type="checkbox" id="factoryBld" class="craftCheck" onchange="verifyBuildingSelected(\'4\', \'factoryBld\')"><label for="factoryBld">Factory</label><br><br>' + 

'	<input type="checkbox" id="prodChecker"><label for="prodChecker" onclick="$(\'.prodCheck\').click();"><b>Production</b></label><br>' + 
'	<input type="checkbox" id="fieldBld" class="prodCheck" onchange="verifyBuildingSelected(\'5\', \'fieldBld\')"><label for="fieldBld">Catnip Field</label><br>' + 
'	<input type="checkbox" id="pastureBld" class="prodCheck" onchange="verifyBuildingSelected(\'6\', \'pastureBld\')"><label for="pastureBld">Pasture/Solar</label><br>' + 
'	<input type="checkbox" id="mineBld" class="prodCheck" onchange="verifyBuildingSelected(\'7\', \'mineBld\')"><label for="mineBld">Mine</label><br>' + 
'	<input type="checkbox" id="lumberBld" class="prodCheck" onchange="verifyBuildingSelected(\'8\', \'lumberBld\')"><label for="lumberBld">Lumber Mill</label><br>' + 
'	<input type="checkbox" id="aqueductBld" class="prodCheck" onchange="verifyBuildingSelected(\'9\', \'aqueductBld\')"><label for="aqueductBld">Aqueduct/Hydro</label><br>' + 
'	<input type="checkbox" id="oilBld" class="prodCheck" onchange="verifyBuildingSelected(\'10\', \'oilBld\')"><label for="oilBld">Oil Well</label><br>' + 
'	<input type="checkbox" id="quarryBld" class="prodCheck" onchange="verifyBuildingSelected(\'11\', \'quarryBld\')"><label for="quarryBld">Quarry</label><br><br>' + 

'	<input type="checkbox" id="conversionChecker"><label for="conversionChecker" onclick="$(\'.convertCheck\').click();"><b>Conversion</b></label><br>' + 
'	<input type="checkbox" id="smelterBld" class="convertCheck" onchange="verifyBuildingSelected(\'12\', \'smelterBld\')"><label for="smelterBld">Smelter</label><br>' + 
'	<input type="checkbox" id="labBld" class="convertCheck" onchange="verifyBuildingSelected(\'13\', \'labBld\')"><label for="labBld">Bio Lab</label><br>' + 
'	<input type="checkbox" id="calcinerBld" class="convertCheck" onchange="verifyBuildingSelected(\'14\', \'calcinerBld\')"><label for="calcinerBld">Calciner</label><br>' + 
'	<input type="checkbox" id="reactorBld" class="convertCheck" onchange="verifyBuildingSelected(\'15\', \'reactorBld\')"><label for="reactorBld">Reactor</label><br>' + 
'	<input type="checkbox" id="acceleratorBld" class="convertCheck" onchange="verifyBuildingSelected(\'16\', \'acceleratorBld\')"><label for="acceleratorBld">Accelerator</label><br>' + 
'	<input type="checkbox" id="steamBld" class="convertCheck" onchange="verifyBuildingSelected(\'17\', \'steamBld\')"><label for="steamBld">Steamworks</label><br>' + 
'	<input type="checkbox" id="magnetoBld" class="convertCheck" onchange="verifyBuildingSelected(\'18\', \'magnetoBld\')"><label for="magnetoBld">Magneto</label><br><br>' + 

'	<input type="checkbox" id="scienceChecker"><label for="scienceChecker" onclick="$(\'.scienceCheck\').click();"><b>Science</b></label><br>' + 
'	<input type="checkbox" id="libraryBld" class="scienceCheck" onchange="verifyBuildingSelected(\'19\', \'libraryBld\')"><label for="libraryBld">Library</label><br>' + 
'	<input type="checkbox" id="academyBld" class="scienceCheck" onchange="verifyBuildingSelected(\'20\', \'academyBld\')"><label for="academyBld">Academy</label><br>' + 
'	<input type="checkbox" id="obervatoryBld" class="scienceCheck" onchange="verifyBuildingSelected(\'21\', \'obervatoryBld\')"><label for="obervatoryBld">Observatory</label><br><br>' + 

'	<input type="checkbox" id="storageChecker"><label for="storageChecker" onclick="$(\'.storageCheck\').click();"><b>Storage</b></label><br>' + 
'	<input type="checkbox" id="barnBld" class="storageCheck" onchange="verifyBuildingSelected(\'22\', \'barnBld\')"><label for="barnBld">Barn</label><br>' + 
'	<input type="checkbox" id="harborBld" class="storageCheck" onchange="verifyBuildingSelected(\'23\', \'harborBld\')"><label for="harborBld">Harbor</label><br>' + 
'	<input type="checkbox" id="warehouseBld" class="storageCheck" onchange="verifyBuildingSelected(\'24\', \'warehouseBld\')"><label for="warehouseBld">Warehouse</label><br><br>' + 

'	<input type="checkbox" id="otherChecker"><label for="otherChecker" onclick="$(\'.otherCheck\').click();"><b>Other</b></label><br>' + 
'	<input type="checkbox" id="ampBld" class="otherCheck" onchange="verifyBuildingSelected(\'25\', \'ampBld\')"><label for="ampBld">Amphitheatre/Broadcast</label><br>' + 
'	<input type="checkbox" id="tradeBld" class="otherCheck" onchange="verifyBuildingSelected(\'26\', \'tradeBld\')"><label for="tradeBld">Tradepost</label><br>' + 
'	<input type="checkbox" id="chapelBld" class="otherCheck" onchange="verifyBuildingSelected(\'27\', \'chapelBld\')"><label for="chapelBld">Chapel</label><br>' + 
'	<input type="checkbox" id="templeBld" class="otherCheck" onchange="verifyBuildingSelected(\'28\', \'templeBld\')"><label for="templeBld">Temple</label><br>' + 
'	<input type="checkbox" id="mintBld" class="otherCheck" onchange="verifyBuildingSelected(\'29\', \'mintBld\')"><label for="mintBld">Mint</label><br>' + 
'	<input type="checkbox" id="zigguratBld" class="otherCheck" onchange="verifyBuildingSelected(\'30\', \'zigguratBld\')"><label for="zigguratBld">Ziggurat</label><br>' + 
'	<input type="checkbox" id="unicBld" class="otherCheck" onchange="verifyBuildingSelected(\'31\', \'unicBld\')"><label for="unicBld">Unicorn Pasture</label><br></br>' + 

'</div>'

var spaceSelectAddition = '<div id="spaceSelect" style="display:none; margin-top:-400px; width:200px" class="dialog help">' + 
'<a href="#" onclick="$(\'#spaceSelect\').hide(); $(\'#buildingSelect\').toggle();" style="position: absolute; top: 10px; left: 15px;">cath</a>' + 
'<a href="#" onclick="$(\'#spaceSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' + 

'	</br></br><input type="checkbox" id="programs" class="programs" onchange="programBuild = this.checked; console.log(this.checked);"><label for="programs">Programs</label></br></br>' + 

'	<input type="checkbox" id="spaceChecker"><label for="spaceChecker" onclick="$(\'.spaceCheck\').click();"><b>Space</b></label></br>' + 

'	<input type="checkbox" id="elevSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'32\', \'elevSBld\');"><label for="elevSBld">Space Elevator</label></br>' + 
'	<input type="checkbox" id="satSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'33\', \'satSBld\');"><label for="satSBld">Satellite</label></br>' + 
'	<input type="checkbox" id="statSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'34\', \'statSBld\');"><label for="statSBld">Space Station</label></br></br>' + 

'	<input type="checkbox" id="moonChecker"><label for="moonChecker" onclick="$(\'.moonCheck\').click();"><b>Moon</b></label></br>' + 

'	<input type="checkbox" id="outSBld" class="moonCheck" onchange="verifyBuildingSelected(\'35\', \'outSBld\');"><label for="outSBld">Lunar Outpost</label></br>' + 
'	<input type="checkbox" id="baseSBld" class="moonCheck" onchange="verifyBuildingSelected(\'36\', \'baseSBld\');"><label for="baseSBld">Moon Base</label></br></br>' + 

'	<input type="checkbox" id="duneChecker"><label for="duneChecker" onclick="$(\'.duneCheck\').click();"><b>Dune</b></label></br>' + 


'	<input type="checkbox" id="crackSBld" class="duneCheck" onchange="verifyBuildingSelected(\'37\', \'crackSBld\');"><label for="crackSBld">Planet Cracker</label></br>' + 
'	<input type="checkbox" id="fracSBld" class="duneCheck" onchange="verifyBuildingSelected(\'38\', \'fracSBld\');"><label for="fracSBld">Hydro Fracturer</label></br>' + 
'	<input type="checkbox" id="spiceSBld" class="duneCheck" onchange="verifyBuildingSelected(\'39\', \'spiceSBld\');"><label for="spiceSBld">Spice Refinery</label></br></br>' + 

'	<input type="checkbox" id="piscineChecker"><label for="piscineChecker" onclick="$(\'piscineCheck\').click();"><b>Piscine</b></label></br>' + 

'	<input type="checkbox" id="reVeSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'40\', \'reVeSBld\');"><label for="reVeSBld">Research Vessel</label></br>' + 
'	<input type="checkbox" id="orbSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'41\', \'orbSBld\');"><label for="orbSBld">Orbital Array</label></br></br>' + 

'	<input type="checkbox" id="heliosChecker"><label for="heliosChecker" onclick="$(\'.heliosCheck\').click();"><b>Helios</b></label></br>' + 

'	<input type="checkbox" id="sunSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'42\', \'sunSBld\');"><label for="sunSBld">Sunlifter</label></br>' + 
'	<input type="checkbox" id="contSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'43\', \'contSBld\');"><label for="contSBld">Containment Chamber</label></br></br>' + 

'	<input type="checkbox" id="terminusChecker"><label for="terminusChecker" onclick="$(\'.terminusCheck\').click();"><b>Terminus</b></label></br>' + 

'	<input type="checkbox" id="crySBld" class="terminusCheck" onchange="verifyBuildingSelected(\'44\', \'crySBld\');"><label for="crySBld">Cryostation</label></br></br>' + 

'	<input type="checkbox" id="kairoChecker"><label for="kairoChecker" onclick="$(\'.kairoCheck\').click();"><b>Kairo</b></label></br>' + 

'	<input type="checkbox" id="beacSBld" class="kairoCheck" onchange="verifyBuildingSelected(\'45\', \'beacSBld\');"><label for="beacSBld">Space Beacon</label></br></br>' + 

'	<input type="checkbox" id="yarnChecker"><label for="yarnChecker" onclick="$(\'.yarnCheck\').click();"><b>Yarn</b></label></br>' + 

'	<input type="checkbox" id="terrSBld" class="yarnCheck" onchange="verifyBuildingSelected(\'46\', \'terrSBld\');"><label for="terrSBld">Terraforming Station</label></br>' + 
'	<input type="checkbox" id="hydrSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'47\', \'hydrSBld\');"><label for="hydrSBld">Hydroponics</label></br></br>' + 

'	<input type="checkbox" id="centaurusChecker"><label for="centaurusChecker" onclick="$(\'.centaurusCheck\').click();"><b>Centaurus System</b></label></br>' + 

'	<input type="checkbox" id="tecSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'48\', \'tecSBld\');"><label for="tecSBld">Tectonic</label></br></br>' + 

'</div>'

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
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */


		// Auto Observe Astronomical Events
function autoObserve() {

		var checkObserveBtn = document.getElementById("observeBtn");
		if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
			document.getElementById('observeBtn').click();
				
		} else {
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
								if (result) {btn[i].update();}
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
				for (i = 0 ;i < spBuild.length; i++) {
					if (spBuild[i].model.metadata.name == buildingsList[z]) {
						
						if (gamePage.ui.activeTabId != "Space") {
							gamePage.ui.activeTabId = 'Space'; gamePage.render(); // Change the tab so that we can build
						}
						
						spBuild[i].controller.buyItem(spBuild[i].model, {}, function(result) {
							if (result) {spBuild[i].update();}
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
					
					if (gamePage.ui.activeTabId != "Space") {
					gamePage.ui.activeTabId = 'Space'; gamePage.render(); // Change the tab so that we can build
					}
					
					spcProg[i].controller.buyItem(spcProg[i].model, {}, function(result) {
						if (result) {spcProg[i].update();}
						});
				} catch(err) {
				console.log(err);
				}
			}
		}
	}
	
	      if (origTab != gamePage.ui.activeTabId) {
        gamePage.ui.activeTabId = origTab; gamePage.render();
		  }
	
}
}			
	
		// Trade automatically
function autoTrade() {
	if (autoCheck[3] != "false") {
		var titRes = gamePage.resPool.get('titanium');
		var unoRes = gamePage.resPool.get('unobtainium');
		var goldResource = gamePage.resPool.get('gold');
		var goldOneTwenty = gamePage.getResourcePerTick('gold') * 200;
			if (goldResource.value > (goldResource.maxValue - goldOneTwenty)) {
				if (unoRes.value > 5000  && gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
					gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
				} else if (titRes.value < (titRes.maxValue * 0.9)  && gamePage.diplomacy.get('zebras').unlocked) {
					gamePage.diplomacy.tradeAll(game.diplomacy.get("zebras"), (goldOneTwenty / 15));
				} else if (gamePage.diplomacy.get('dragons').unlocked) {
					gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"), (goldOneTwenty / 15));
				}
			}
	}
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
    var resourcePerTick = gamePage.getResourcePerTick(resources[i][0], 0);
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
	gamePage.ui.activeTabId = 'Science'; gamePage.render();
	  
	var btn = gamePage.tabs[2].buttons;

	 for (var i = 0; i < btn.length; i++) {
		if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
			try { 			
				btn[i].controller.buyItem(btn[i].model, {}, function(result) {
					if (result) {btn[i].update();}
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
	gamePage.ui.activeTabId = 'Workshop'; gamePage.render();
	  
	var btn = gamePage.tabs[3].buttons;

	 for (var i = 0; i < btn.length; i++) {
		if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
			try { 			
				btn[i].controller.buyItem(btn[i].model, {}, function(result) {
					if (result) {btn[i].update();}
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
		
		if (catpower > 1500 && culture > 5000 && parchment > 2500) {
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
