var autoCheck = ['true', 'true', 'true', 'true', 'true'];
var autoName = ['build', 'craft', 'hunt', 'trade', 'praise'];

var tickDownCounter = 30;
var deadScript = "Script is dead";
var furDerVal = 3;

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +
'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button>' +
'<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button>' +
'<button id="autoBuild" onclick="autoSwitch(autoCheck[0], 0, autoName[0])"> Auto Build </button>' + 
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

	var buildings = [
        ["Catnip field"],
		["Hut"],
		["Library"],
		["Workshop"],
		["Mine"],
		["Barn"],
		["Pasture"],
		["Lumber Mill"],
		["Smelter"],
		["Log House"],
		["Academy"],
		["Observatory"],
		// ["Bio Lab"],
		["Harbour"],
		["Warehouse"],
		["Quarry"],
		["Oil Well"],
		["Amphitheatre"],
		["Chapel"],
		["Calciner"],
		// ["Temple"],
		// ["Tradepost"],
		// ["Broadcast Tower"],
		// ["Solar Farm"],
		["Aqueduct"]
		];	
	
	var resources = [
        	["catnip", "wood", 50],
		["wood", "beam", 175],
        	["minerals", "slab", 250],
       		["coal", "steel", 100],
        	["iron", "plate", 125],
		["oil", "kerosene", 1000],
		["titanium", "alloy", 75]
		];
		
		// Build buildings automatically
if (autoCheck[0] != "false") {
	for (var i = 0; i < buildings.length; i++) {
		$(".btnContent:contains('" + (buildings[i]) + "')").click();
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

if (autoCheck[2] != "false") {		
		// Hunt automatically
	var catpower = gamePage.resPool.get('manpower');
	var catpowerOneTwenty = gamePage.getResourcePerTick('manpower') * 200;
		if (catpower.value > (catpower.maxValue - catpowerOneTwenty)) {
			gamePage.village.huntMultiple(catpowerOneTwenty / 100);
		}
}

if (autoCheck[3] != "false") {
		// Trade automatically
	var goldResource = gamePage.resPool.get('gold');
    var goldOneTwenty = gamePage.getResourcePerTick('gold') * 200;
		if (goldResource.value > (goldResource.maxValue - goldOneTwenty) && gamePage.diplomacy.get('zebras').unlocked) {
			gamePage.diplomacy.tradeMultiple(game.diplomacy.get("zebras"), (goldOneTwenty / 15));
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
