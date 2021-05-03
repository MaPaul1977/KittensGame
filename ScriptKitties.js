var SK = class {
    constructor() {
        this.model = new SK.Model();
        this.scripts = new SK.Scripts(this.model);
        this.tasks = new SK.Tasks(this.model, this.scripts);
        this.gui = new SK.Gui(this.model, this.tasks);
        this.loadOptions();
    }

    clearScript() {
        this.tasks.halt();
        this.model.wipe();
        this.gui.destroy();
        sk = null;
        delete(LCstorage['net.sagefault.ScriptKittens.savedata']);
        game.msg('Script is dead');
    }

    hook1(...args) {
        console.log('hook1', args);
    }

    hook2(...args) {
        console.log('hook2', args);
    }

    setres(name, adj = 1) {
        if (! name) { console.log('No resource given'); return };
        const res = game.resPool.get(name);
        const newval = (adj <= 1 ? adj * res.maxValue : adj);
        res.value = newval;
    }

    whenslip() {
        console.log('Next paradox in ' + game.calendar.futureSeasonTemporalParadox + ' seasons');
    }

    // Note: this function is deliberately not exposed in the gui.
    // Reloading is for people already playing around in console.
    reloadScript() {
        // unload and save
        this.tasks.halt();
        this.saveOptions();
        this.model.wipe();
        this.gui.destroy();
        sk = null;
        // reload
        let src = null;
        const origins = $('#SK_origin');
        for (let i=0; i<origins.length; i+=1) {
            if (origins[i].src) src = origins[i].src;
            origins[i].remove();
        }
        if (src) {
            const script = document.createElement('script');
            script.src = src;
            script.id = 'SK_origin';
            document.body.appendChild(script);
        } else {
            console.error('No <script> found with id=="SK_origin"');
        }
    }

    saveOptions() {
        const options = {};
        this.model.save(options);
        this.scripts.save(options);
        LCstorage['net.sagefault.ScriptKittens.savedata'] = JSON.stringify(options);
    }

    loadOptions() {
        const dataString = LCstorage['net.sagefault.ScriptKittens.savedata'];
        if (dataString) {
            try {
                var options = JSON.parse(dataString);
            } catch (ex) {
                console.error('Unable to load game data: ', ex);
                console.log(dataString);
                game.msg('Unable to load script settings. Settings were logged to console.', 'important');
                delete(LCstorage['net.sagefault.ScriptKittens.loaddata']);
                game.msg('Settings deleted.');
            }
            this.model.load(options);
            this.scripts.load(options);
            this.gui.refresh();
        }
    }
};

/**
 * These are the data structures that govern the automation scripts
 **/
SK.Model = class {
    constructor() {
        // Is a toggle holder. Use like ``auto.craft = true; if (auto.craft) { ...
        this.auto = {};

        // These are the assorted variables
        this.books = ['parchment', 'manuscript', 'compedium', 'blueprint'];
        this.option = {};

        // These control the selections under [Minor Options]
        this.minor = {};
        this.minorNames = {
            program: 'Space Programs',
            observe: 'Auto Observe',
            feed: 'Auto Feed Elders',
            promote: 'Auto Promote Leader',
            wait4void: 'Only Shatter at Season Start',
            praiseAfter: 'Praise After Religion',
            unicornIvory: 'Unicorn Ivory Optimization',
            conserveExotic: 'Conserve Exotic Resources',
            elderTrade: 'Auto Trade with the Elders',
            permitReset: 'Permit AutoPlay to Reset',
        };

        // These will allow quick selection of the buildings which consume energy
        this.power = {};
        for (const b of ['biolab', 'oilWell', 'factory', 'calciner', 'accelerator']) {
            this.power[b] = game.bld.get(b);
        }

        // Note: per game: uncommon==luxuries==(trade goods), rare==unicorns+karma, exotic==relics+void+bc+bs
        this.exoticResources = [
            'antimatter', // how is AM not exotic?
            'blackcoin',
            'bloodstone',
            'relic',
            'temporalFlux', // honorary
            'void',
        ];

        this.setDefaults();
        this.populateDataStructures();
    }

    setDefaults() {
        this.option = {
            book: 'default',
            assign: 'smart',
            cycle: 'redmoon',
            minSecResRatio: 1,
            maxSecResRatio: 25,
            script: 'none',
        };
        this.minor = {
            observe: true,
            conserveExotic: true,
            partyLimit: 10,
            elderTrade: true,
        };
    }

    wipe() {
        this.auto = {}; // wipe fields
        this.minor = {};
        this.option = {};
        for (const buildset of [this.cathBuildings, this.spaceBuildings, this.timeBuildings]) {
            for (const bid in buildset) {
                delete buildset[bid].limit;
                buildset[bid].enabled = false;
            }
        }
    }

    save(options) {
        for (const key of ['auto', 'minor', 'option', 'cathBuildings', 'spaceBuildings', 'timeBuildings']) {
            options[key] = this[key];
        }
    }

    load(options) {
        for (const key of ['auto', 'minor', 'option', 'cathBuildings', 'spaceBuildings', 'timeBuildings']) {
            if (options[key]) this[key] = options[key];
        }
    }

    populateDataStructures() {
        // Building lists for controlling Auto Build/Space/Time
        this.cathBuildings = {/* list is auto-generated, looks like:
            field:{label:'Catnip Field', enabled:false},
            ...
            */};
        this.cathGroups = [/*
            ['Food Production', ['field', 'pasture', 'aqueduct']],
            ...
            */];
        for (const group of game.bld.buildingGroups) {
            const buildings = group.buildings.map((n) => game.bld.get(n));
            this.cathGroups.push([group.title, this.buildGroup(buildings, this.cathBuildings)]);
        }

        this.spaceBuildings = {/*
            spaceElevator:{label:'Space Elevator', enabled:false},
            ...
            */};
        this.spaceGroups = [/*
            ['Cath', ['spaceElevator', 'sattelite', 'spaceStation']],
            ...
            */];
        for (const planet of game.space.planets) {
            this.spaceGroups.push([planet.label, this.buildGroup(planet.buildings, this.spaceBuildings)]);
        }

        this.timeBuildings = {/*
            // As above, but for Ziggurats, Cryptotheology, Chronoforge, Void Space
            ...
            */};
        this.timeGroups = [/*
            // As above
            ...
            */];
        this.timeGroups.push(['Ziggurats', this.buildGroup(game.religion.zigguratUpgrades, this.timeBuildings)]);
        this.timeGroups.push(['Cryptotheology', this.buildGroup(game.religion.transcendenceUpgrades, this.timeBuildings)]);
        this.timeGroups.push(['Chronoforge', this.buildGroup(game.time.chronoforgeUpgrades, this.timeBuildings)]);
        this.timeGroups.push(['Void Space', this.buildGroup(game.time.voidspaceUpgrades, this.timeBuildings)]);
    }

    buildGroup(buildings, dict) {
        const group = [];
        for (const building of buildings) {
            if (buildings==game.religion.zigguratUpgrades && building.effects.unicornsRatioReligion) continue; // covered by autoUnicorn()
            let label = building.stages?.map((x) => x.label).join(' / '); // for 'Library / Data Center', etc
            label ||= building.label;
            dict[building.name] = {label: label, enabled: false};
            group.push(building.name);
        }
        return group;
    }
};

/**
 * This subclass contains the code that lays out the GUI elements
 **/
SK.Gui = class {
    constructor(model, tasks) {
        this.model = model;
        this.tasks = tasks;
        this.switches = {};
        this.dropdowns = {};
        $('#footerLinks').append('<div id="SK_footerLink" class="column">'
            + ' | <a href="#" onclick="$(\'#SK_mainOptions\').toggle();"> ScriptKitties </a>'
            + '</div>');
        $('#game').append(this.generateMenu());
        $('#SK_mainOptions').hide(); // only way I can find to have display:grid but start hidden
        $('#game').append(this.generateBuildingMenu());
        this.switchTab('cath'); // default
        $('#game').append(this.generateMinorOptionsMenu());
    }

    destroy() {
        $('#SK_footerLink').remove();
        $('#SK_mainOptions').remove();
        $('#SK_buildingOptions').remove();
        $('#SK_minorOptions').remove();
    }

    generateMenu() {
        const grid = [ // Grid Layout
            [this.autoButton('Kill Switch', 'sk.clearScript()')],
            [this.autoButton('Check Efficiency', 'sk.tasks.kittenEfficiency()'), this.autoButton('Minor Options', '$(\'#SK_minorOptions\').toggle();')],
            [this.autoSwitchButton('Auto Build', 'build'), this.autoButton('Select Building', '$(\'#SK_buildingOptions\').toggle();')],
            [this.autoSwitchButton('Auto Assign', 'assign'), this.autoDropdown('assign', ['smart'], game.village.jobs)],
            [this.autoSwitchButton('Auto Craft', 'craft'), this.autoDropdown('book', ['default'].concat(this.model.books), [])],
            ['<label style="{{grid}}">Secondary Craft %</label>',
                `<span style="display:flex; justify-content:space-around; {{grid}}" title="Between 0 and 100">`
                + `<label>min:</label><input id="SK_minSRS" type="text" style="width:25px" onchange="sk.model.option.minSecResRatio=this.value" value="${this.model.option.minSecResRatio}">`
                + `<label>max:</label><input id="SK_maxSRS" type="text" style="width:25px" onchange="sk.model.option.maxSecResRatio=this.value" value="${this.model.option.maxSecResRatio}">`
                + `</span>`
            ],
            ['<span style="height:10px;{{grid}}"></span>'],

            [this.autoSwitchButton('Auto Hunt', 'hunt'), this.autoSwitchButton('Auto Praise', 'praise')],
            [this.autoSwitchButton('Auto Trade', 'trade'), this.autoSwitchButton('Auto Embassy', 'embassy')],
            [this.autoSwitchButton('Auto Party', 'party'), this.autoSwitchButton('Auto Explore', 'explore')],
            ['<span style="height:10px;{{grid}}"></span>'],

            [this.autoSwitchButton('Auto Cycle', 'cycle'), this.autoDropdown('cycle', [], game.calendar.cycles)],
            [this.autoSwitchButton('Shatterstorm', 'shatter'), this.autoSwitchButton('Auto BCoin', 'bcoin')],
            [this.autoSwitchButton('Auto Play', 'play'), this.autoDropdown('script', ['none'], SK.Scripts.listScripts(), 'sk.gui.scriptChange(this.value)')],
            ['<span style="height:10px;{{grid}}"></span>'],

            [this.autoSwitchButton('Auto Science', 'research'), this.autoSwitchButton('Auto Upgrade', 'workshop')],
            [this.autoSwitchButton('Auto Religion', 'religion'), this.autoSwitchButton('Auto Unicorn', 'unicorn')],
            [this.autoSwitchButton('Energy Control', 'energy'), this.autoSwitchButton('Auto Flux', 'flux')],
        ];
        this.dropdowns.minSecResRatio = 'SK_minSRS';
        this.dropdowns.maxSecResRatio = 'SK_maxSRS';

        let menu = '<div id="SK_mainOptions" class="dialog" style="display:grid; grid-template-columns:177px 177px; column-gap:5px; row-gap:5px; left:auto; top:auto !important; right:30px; bottom: 30px; padding:10px">';
        menu += '<a href="#" onclick="$(\'#SK_mainOptions\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>';
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (!grid[row][col].includes('{{grid}}')) console.warn(`Cell at [${row+1},${col+1}] does not have position marker`);
                menu += grid[row][col].replace('{{grid}}', `grid-row:${row+1}; grid-column:${col+1};`);
            }
        }
        menu += '</div>';
        return menu;
    }

    generateMinorOptionsMenu() {
        let menu = '';
        menu += '<div id="SK_minorOptions" class="dialog help" style="border: 1px solid gray; display:none;">';
        menu += '<a href="#" onclick="$(\'#SK_minorOptions\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>';
        for (const opt in this.model.minorNames) {
            menu += `<input type="checkbox" id="SK_${opt}" onchange="sk.model.minor.${opt}=this.checked"${this.model.minor[opt]?' checked':''}>`;
            menu += `<label style="padding-left:10px;" for="SK_${opt}">${this.model.minorNames[opt]}</label><br>`;
        }
        menu += '</div>';
        return menu;
    }

    generateBuildingMenu() {
        let menu = '';
        menu += '<div id="SK_buildingOptions" class="dialog help" style="border: 1px solid gray; display:none; margin-top:-333px; margin-left:-200px;">';
        menu +=   '<a href="#" onclick="$(\'#SK_buildingOptions\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>';
        menu +=   '<div class="tabsContainer" style="position: static;">';
        menu +=     '<a href="#" id="SK_cathTab" class="tab" onclick="sk.gui.switchTab(\'cath\')" style="white-space: nowrap;">Cath</a>';
        menu +=     '<span> | </span>';
        menu +=     '<a href="#" id="SK_spaceTab" class="tab" onclick="sk.gui.switchTab(\'space\')" style="white-space: nowrap;">Space</a>';
        menu +=     '<span> | </span>';
        menu +=     '<a href="#" id="SK_timeTab" class="tab" onclick="sk.gui.switchTab(\'time\')" style="white-space: nowrap;">Time</a>';
        menu +=   '</div>';
        menu +=   '<div id="SK_BuildingFrame" class="tabInner">';
        menu +=     this.generateBuildingPane(this.model.cathGroups, 'cathBuildings');
        menu +=     this.generateBuildingPane(this.model.spaceGroups, 'spaceBuildings');
        menu +=     this.generateBuildingPane(this.model.timeGroups, 'timeBuildings');
        menu +=   '</div>';
        menu += '</div>';
        return menu;
    }

    switchTab(name) {
        $('#SK_cathTab').removeClass('activeTab');
        $('#SK_spaceTab').removeClass('activeTab');
        $('#SK_timeTab').removeClass('activeTab');
        $('#SK_cathBuildingsPane').hide();
        $('#SK_spaceBuildingsPane').hide();
        $('#SK_timeBuildingsPane').hide();

        switch (name) {
            case 'cath':
                $('#SK_cathTab').addClass('activeTab');
                $('#SK_cathBuildingsPane').show();
                break;
            case 'space':
                $('#SK_spaceTab').addClass('activeTab');
                $('#SK_spaceBuildingsPane').show();
                break;
            case 'time':
                $('#SK_timeTab').addClass('activeTab');
                $('#SK_timeBuildingsPane').show();
                break;
        }
    }

    generateBuildingPane(groups, elementsName) {
        let menu = '';
        menu += `<div id="SK_${elementsName}Pane" style="display:none; columns:2; column-gap:20px;">\n`;
        const tab = elementsName.substring(0, 4); // tab prefix
        menu += `<input type="checkbox" id="SK_${tab}TabChecker" onchange="sk.gui.selectChildren('SK_${tab}TabChecker','SK_${tab}Check');">`;
        menu += `<label for="SK_${tab}TabChecker">SELECT ALL</label><br>\n`;
        for (const group of groups) {
            const label = group[0];
            const lab = label.substring(0, 3); // used for prefixes, "lab" is prefix of "label"
            menu += '<p style="break-inside: avoid;">'; // we want grouping to avoid widows/orphans
            menu += `<input type="checkbox" id="SK_${lab}Checker" class="SK_${tab}Check" onchange="sk.gui.selectChildren('SK_${lab}Checker','SK_${lab}Check');">`;
            menu += `<label for="SK_${lab}Checker"><b>${label}</b></label><br>\n`;

            for (const bld of group[1]) {
                menu += `<input type="checkbox" id="SK_${bld}" class="SK_${lab}Check" onchange="sk.model.${elementsName}.${bld}.enabled=this.checked; sk.model.${elementsName}.${bld}.limit=false">`;
                menu += `<label style="padding-left:10px;" for="SK_${bld}">${this.model[elementsName][bld].label}</label><br>\n`;
            }
            menu += '</p>\n';
        }
        menu += '</div>\n';
        return menu;
    }

    selectChildren(checker, checkee) {
        $('.'+checkee).prop('checked', document.getElementById(checker).checked).change();
    }

    autoSwitch(id, element) {
        this.model.auto[id] = !this.model.auto[id];
        game.msg(`${element} is now ${(this.model.auto[id] ? 'on' : 'off')}`);
        $(`#${element}`).toggleClass('disabled', !this.model.auto[id]);
    }

    autoButton(label, script, id=null) {
        let cssClass = 'btn nosel modern';
        if (id) cssClass += ' disabled';
        const content = `<div class="btnContent" style="padding:unset"><span class="btnTitle">${label}</span></div>`;
        const button = `<div ${id?'id="'+id+'"':''} class="${cssClass}" style="width:auto; {{grid}}" onclick="${script}">${content}</div>`;
        return button;
    }

    autoSwitchButton(label, auto) {
        const element = 'SK_auto' + auto[0].toUpperCase() + auto.slice(1);
        this.switches[auto] = element;
        const script = `sk.gui.autoSwitch('${auto}', '${element}');`;
        return this.autoButton(label, script, element);
    }

    autoDropdown(option, extras, items, script) {
        const element = `SK_${option}Choice`;
        this.dropdowns[option] = element;
        script ||= `sk.model.option.${option}=this.value;`;
        let dropdown = `<select id="${element}" style="{{grid}}" onchange="${script}">`;
        for (const name of extras) {
            const sel = (name == this.model.option[option]) ? ' selected="selected"' : '';
            const title = name[0].toUpperCase() + name.slice(1);
            dropdown += `<option value="${name}"${sel}>${title}</option>`;
        }
        for (const item of items) {
            const sel = (item.name == this.model.option[option]) ? ' selected="selected"' : '';
            let title = item.title;
            if (item.glyph) title = item.glyph + ' ' + title;
            dropdown += `<option value="${item.name}"${sel}>${title}</option>`;
        }
        dropdown += '</select>';
        return dropdown;
    }

    scriptChange(value) {
        this.model.option.script = value;
        sk.scripts.init();
        if (this.model.auto.play) this.autoSwitch('play', 'SK_autoPlay');
    }

    refresh() {
        for (const auto in this.switches) {
            const element = this.switches[auto];
            $('#'+element).toggleClass('disabled', !this.model.auto[auto]);
        }
        for (const option in this.model.option) {
            const element = this.dropdowns[option];
            $('#'+element).val(this.model.option[option]);
        }
        for (const minor in this.model.minor) {
            $('#SK_'+minor).prop('checked', this.model.minor[minor]);
        }
        for (const menu of ['cathBuildings', 'spaceBuildings', 'timeBuildings']) {
            for (const entry in this.model[menu]) {
                $('#SK_'+entry).prop('checked', this.model[menu][entry].enabled);
            }
        }
    }
};

/**
 * These are the functions which are launched by the runAllAutomation timer
 **/
SK.Tasks = class {
    constructor(model, scripts) {
        this.model = model;
        this.scripts = scripts;

        /** This governs how frequently tasks are run
         *   fn: what function to run
         *   interval: how often to run, in ticks, that's 0.2 seconds
         *   offset: small value to stagger runs, MUST be less than interval
         *   override: force run next tick, dynamic, used to take sequences of actions
         **/
        this.schedule = [
            // every tick
            {fn:'autoNip',      interval:1,  offset:0,   override:false},
            {fn:'autoPraise',   interval:1,  offset:0,   override:false},
            {fn:'autoBuild',    interval:1,  offset:0,   override:false},

            // every 3 ticks == 0.6 seconds
            {fn:'autoCraft',    interval:3,  offset:0,   override:false},
            {fn:'autoMinor',    interval:3,  offset:1,   override:false},
            {fn:'autoHunt',     interval:3,  offset:2,   override:false},

            // every 5 ticks == 1 second
            {fn:'autoPlay',     interval:5,  offset:0,   override:false},

            // every 2 seconds == every game-day
            {fn:'autoSpace',    interval:10, offset:2,   override:false},
            {fn:'autoTime',     interval:10, offset:4,   override:false},
            {fn:'autoParty',    interval:10, offset:6,   override:false},
            {fn:'energyControl',interval:10, offset:8,   override:false},

            // every 4 seconds; schedule on odd numbers to avoid the interval:10
            {fn:'autoFlux',     interval:20, offset:1,   override:false},
            {fn:'autoAssign',   interval:20, offset:3,   override:false},
            {fn:'autoResearch', interval:20, offset:7,   override:false},
            {fn:'autoWorkshop', interval:20, offset:9,   override:false},
            {fn:'autoReligion', interval:20, offset:11,  override:false},
            {fn:'autoTrade',    interval:10, offset:7,  override:false},
            {fn:'autoShatter',  interval:20, offset:17,  override:false},
            {fn:'autoEmbassy',  interval:20, offset:19,  override:false},

            // every minute, schedule == 10%20 to avoid both above
            {fn:'autoExplore',  interval:300, offset:70,  override:false},
            {fn:'autoUnicorn',  interval:300, offset:130, override:false},
            {fn:'autoBCoin',    interval:300, offset:230, override:false},

            // every 90 seconds, because KG does 80, but that timing bothers me
            {fn:'autoSave',     interval:450, offset:90, override:false},
        ];

        // This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
        // Offsets are staggered to spread out the load. (Not that there is much).
        this.runAllAutomation = setInterval(this.taskRunner.bind(this), 200);
    }

    halt() {
        clearInterval(this.runAllAutomation);
    }

    taskRunner() {
        if (game.isPaused) return; // we pause too
        const ticks = game.timer.ticksTotal;
        for (const task of this.schedule) {
            if (task.override || ticks % task.interval == task.offset) {
                task.override = this[task.fn](task.interval, task.override);
            }
        }
    }

    // Show current kitten efficiency in the in-game log
    kittenEfficiency() {
        const secondsPlayed = game.calendar.trueYear() * game.calendar.seasonsPerYear * game.calendar.daysPerSeason * game.calendar.ticksPerDay / game.ticksPerSecond;
        const numberKittens = game.resPool.get('kittens').value;
        const curEfficiency = (numberKittens - 70) / (secondsPlayed / 3600);
        game.msg('Your current efficiency is ' + parseFloat(curEfficiency).toFixed(2) + ' Paragon per hour.');
    }

    energyReport() {
        // TODO solar panels
        // "solarFarmRatio" -- PV is 0.5
        // "summerSolarFarmRatio" -- challenge: 0.05
        // "solarFarmSeasonRatio" -- thinFilm:1, qdot:1
        // game.bld.getBuildingExt("pasture").get("calculateEnergyProduction")(game, currentSeason)
        //      - base: 2, 3 with PV
        //      0. spring: 1.00 * sFSR:{1,1,1.30}
        //      1. summer: 1.33 * (summer)
        //      2. autumn: 1.00 * sFSR:{1,1,1.30}
        //      3. winter: 0.75 * sFSR:{1, 1.15, 1.30}
        // Looks like:
        //  season 3: no change
        //
        //
        //
        const total = {};
        for (const effect of ['energyProduction', 'energyConsumption']) {
            const sign = effect == 'energyProduction' ? '+' : '-';
            total[effect] = 0;
            for (const source of [game.bld.buildingsData, game.space.planets, game.time.chronoforgeUpgrades, game.time.voidspaceUpgrades]) {
                for (let shim of source) {
                    shim = shim.buildings ? shim.buildings : [shim];
                    for (const building of shim) {
                        const stage = building.stage ? building.stages[building.stage] : building;
                        if (! stage.effects || building.val == 0) continue;
                        let eper = stage.effects[effect];
                        if (building.name == 'pasture' && effect == 'energyProduction') {
                            // deal with Solar Farms. Peak is in summer(1), Low in winter(3). Report low, mention high.
                            const cep = building.stages[building.stage].calculateEnergyProduction;
                            eper = cep(game, 3);
                            total.summer = (cep(game, 1) - eper) * building.on;
                        }
                        if (eper) {
                            console.log(`${stage.label} (${building.on}/${building.val}): ${sign}${eper * building.on}`);
                            total[effect] += eper * building.on;
                        }
                    }
                }
            }
        }
        const energyProdRatio = 1 + game.getEffect("energyProductionRatio");
        const energyConsRatio = 1 + game.getLimitedDR(game.getEffect("energyConsumptionRatio"), 1) + game.getEffect("energyConsumptionIncrease");
        total.summer *= energyProdRatio;
        total.energyProduction *= energyProdRatio;
        total.energyConsumption *= energyConsRatio;
        total.winterSurplus = total.energyProduction - total.energyConsumption;
        console.log(total);
        return total;
    }

    ensureContentExists(tabId) {
        // only work for visible tabs
        const tab = game.tabs.find((tab) => tab.tabId==tabId);
        if (! tab.visible) return false;

        let doRender = false;
        switch (tabId) {
            case 'Science':
                doRender = (tab.buttons.length == 0 || ! tab.policyPanel);
                break;
            case 'Workshop':
                doRender = (tab.buttons.length == 0);
                break;
            case 'Trade':
                doRender = (tab.racePanels.length == 0 || ! tab.exploreBtn);
                break;
            case 'Religion':
                doRender = (tab.zgUpgradeButtons.length == 0 && game.bld.get('ziggurat').on > 0
                    || tab.rUpgradeButtons.length == 0 && !game.challenges.isActive("atheism"));
                // ctPanel is set during constructor, if it's not there we're pooched
                break;
            case 'Space':
                doRender = (! tab.planetPanels || ! tab.GCPanel);
                if (tab.planetPanels) {
                    let planetCount = 0;
                    for (const planet of game.space.planets) {
                        if (planet.unlocked) planetCount += 1;
                    }
                    doRender ||= tab.planetPanels.length < planetCount;
                }
                break;
            case 'Time':
                doRender = (! tab.cfPanel.children[0].children[0].model || ! tab.vsPanel.children[0].children[0].model);
                // both cfPanel and vsPanel are created in constructor.
                break;
            default:
                console.error(`ensureContentExists(${tab}) isn't handled.`);
                break;
        }

        if (doRender) {
            // create and get DOM element
            let div = $(`div.tabInner.${tabId}`)[0];
            let oldTab = null;
            if (! div) {
                oldTab = game.ui.activeTabId;
                game.ui.activeTabId = tabId;
                game.ui.render();
                div = $(`div.tabInner.${tabId}`)[0];
            }

            tab.render(div);
            console.log(`[DEBUG] rendering children of ${tabId}`);

            if (oldTab) {
                game.ui.activeTabId = oldTab;
                game.ui.render();
            }
        }

        // For things we need to do post-render()
        switch (tabId) {
            case 'Time':
                // cfPanel only becomes "visible" on an update()
                if (!game.timeTab.cfPanel.visible && game.workshop.get('chronoforge').researched) game.timeTab.update();
                break;
        }
    }

    /*** Individual Auto Scripts start here ***/
    /*** These scripts run every tick ***/

    // Collection of Minor Auto Tasks
    autoNip(ticksPerCycle) {
        if (this.model.auto.build && game.bld.get('field').val < 20) {
            $(`.btnContent:contains(${$I('buildings.gatherCatnip.label')})`).trigger('click');
        }
        if (this.model.auto.craft && game.bld.get('workshop').val < 1 && game.bld.get('hut').val < 5) {
            if (game.bldTab.children[1].model.enabled) {
                $(`.btnContent:contains(${$I('buildings.refineCatnip.label')})`).trigger('click');
            }
        }
        return false;
    }

    // Auto praise the sun
    autoPraise(ticksPerCycle) {
        if (this.model.auto.praise && game.bld.get('temple').val > 0) {
       	    var currFaith = gamePage.resPool.get('faith').value;
       	    var maxFaith  = gamePage.resPool.get('faith').maxValue;
       	    // console.log( gamePage.resPool.get('faith'));
            if ((currFaith > 1200) || (currFaith >= 0.9 * maxFaith)) {
              game.religion.praise();
            }
        }
    }


    // Build buildings automatically
    autoBuild(ticksPerCycle) {
        let built = false;
        if (this.model.auto.build && game.ui.activeTabId == 'Bonfire') {
            const cb = this.model.cathBuildings;
            for (var button of game.bldTab.children) {
                if (! button.model.metadata) continue;
                const name = button.model.metadata.name;
                if (button.model.enabled && cb[name].enabled
                        && (!cb[name].limit || button.model.metadata.val < cb[name].limit)) {
                            // game.msg('Can build a ' + button.model.metadata.name);
                    button.controller.buyItem(button.model, {}, function(result) {
                        if (result) {
                            game.msg('Built a ' + button.model.metadata.name);
                            built = true; button.update();
                        }
                    });
                }
            }
        }
        // if (built) game.render(); // update tooltip, is kinda slow
        return built;
    }

    /*** These scripts run every three ticks ***/

    // Craft primary resources automatically
    autoCraft(ticksPerCycle) {
        /* Note: In this function, rounding gives us grief.
         * If we have enough resource to craft 3.75 of of something, and ask for
         * that, the game rounds up to 4 and then fails because we don't have
         * enough.
         *
         * However, we mostly craft "off the top", making space for production,
         * so we'll usually have the slack. But when we don't, it effectively turns
         * off autoCraft for that resource.
         *
         * On the other hand, we don't want to always round down, or else we'll be
         * wasting resources, and in some cases *cough*eludium*cough*, we'll be
         * rounding down to zero.
         */

        // TODO: We need a special case for catnip->wood.
        // In particular, we need to only craft wood if there's room
        // AND we need to make room by crafting
        if (this.model.auto.craft && game.workshopTab.visible) {
            for (const res of game.workshop.crafts) {
                const output = res.name;
                const inputs = res.prices;
                const outRes = game.resPool.get(output);
                if (! res.unlocked) continue;
                if (outRes.type != 'common') continue; // mostly to prevent relic+tc->bloodstone
                // pk4
                // megalith|gear|alloy|concrete|kerosene|eludium|thorium|tanker
                if (/thorium|tanker/.test(output)) { continue; }

                let craftCount = Infinity;
                let minimumReserve = Infinity;
                for (const input of inputs) {

                    // pk4
                    if (output === 'steel'   && input.name === 'iron'  && craftCount > 0) { if (Math.random() < 0.35) { continue } };
                    if (output === 'eludium' && input.name === 'alloy' && craftCount > 0) { continue };

                    const inRes = game.resPool.get(input.name);
                    const outVal = outRes.value / game.getCraftRatio(outRes.tag);
                    const inVal = inRes.value / input.val;
                    craftCount = Math.min(craftCount, Math.floor(inVal)); // never try to use more than we have

                    if (this.model.books.includes(output) && this.model.option.book != 'default') {
                        // secondary resource: fur, parchment, manuscript, compendium
                        const outputIndex = this.model.books.indexOf(output);
                        const choiceIndex = this.model.books.indexOf(this.model.option.book);
                        if (outputIndex > choiceIndex) craftCount = 0;
                    } else if (inRes.maxValue != 0) {
                        // primary resource
                        const resourcePerCycle = game.getResourcePerTick(input.name, 0) * ticksPerCycle;
                        if (inRes.value >= (inRes.maxValue - resourcePerCycle) || resourcePerCycle >= inRes.maxValue) {
                            craftCount = Math.min(craftCount, resourcePerCycle / input.val);
                        } else {
                            craftCount = 0;
                        }
                    } else {
                        // secondary resource: general
                        const inMSRR = inVal * (this.model.option.maxSecResRatio / 100);
                        if (outVal > inMSRR) {
                            craftCount = 0;
                        } else {
                            craftCount = Math.min(craftCount, inMSRR - outVal);
                        }
                    }
                    // for when our capacity gets large compared to production
                    minimumReserve = Math.min(minimumReserve, inVal * (this.model.option.minSecResRatio / 100) - outVal);
                }

                craftCount = Math.max(craftCount, minimumReserve);
                if (craftCount == 0 || craftCount == Infinity) {
                    // nothing to do, or no reason to act
                } else if (this.model.option.book == 'blueprint' && output == 'compedium' && game.resPool.get('compedium').value > 25) {
                    // save science for making blueprints
                } else if (this.model.auto.party && (output === 'manuscript') && (game.resPool.get('parchment').value < 10000)) {
                    // leave some for partying
                } else {
                    game.craft(output, craftCount);
                }
            }
        }
        return false; // we scale action to need, re-run never required
    }

    autoMinor(ticksPerCycle) {
        if (this.model.minor.feed) {
            if (game.resPool.get('necrocorn').value >= 1 && game.diplomacy.get('leviathans').unlocked) {
                const energy = game.diplomacy.get('leviathans').energy || 0;
                if (energy < game.diplomacy.getMarkerCap()) {
                    game.diplomacy.feedElders();
                }
            }
        }
        if (this.model.minor.observe) {
            const checkObserveBtn = game.calendar.observeBtn;
            if (checkObserveBtn) checkObserveBtn.click();
        }
        if (this.model.minor.promote) {
            const leader = game.village.leader;
            if (leader) {
                const expToPromote = game.village.getRankExp(leader.rank);
                const goldToPromote = 25 * (leader.rank + 1);
                if (leader.exp >= expToPromote && game.resPool.get('gold').value >= goldToPromote) {
                    if (game.village.sim.promote(leader) > 0) {
                        const census = game.villageTab.censusPanel.census;
                        census.renderGovernment(census.container);
                        census.update();
                    }
                }
            }
        }
    }

    // Hunt automatically
    autoHunt(ticksPerCycle) {
        if (this.model.auto.hunt && game.villageTab.visible) {
            const catpower = game.resPool.get('manpower');
            if (catpower.value > (catpower.maxValue - 1)) {
                game.village.huntAll();
            }
        }
        return false; // we huntAll(), should never need to run again
    }

    /*** These scripts run every game day (2 seconds) ***/

    // Build space stuff automatically
    autoSpace(ticksPerCycle) {
        let built = false;
        if (this.model.auto.build && game.spaceTab.visible) {
            this.ensureContentExists('Space');

            // Build space buildings
            const sb = this.model.spaceBuildings;
            for (const planet of game.spaceTab.planetPanels) {
                for (var spBuild of planet.children) {
                    if (sb[spBuild.id].enabled && game.space.getBuilding(spBuild.id).unlocked
                            && (!sb[spBuild.id].limit || spBuild.model.metadata.val < sb[spBuild.id].limit)) {
                        // .enabled doesn't update automatically unless the tab is active, force it
                        if (! spBuild.model.enabled) spBuild.controller.updateEnabled(spBuild.model);
                        if (spBuild.model.enabled) {
                            spBuild.controller.buyItem(spBuild.model, {}, function(result) {
                                if (result) {
                                    game.msg('Astrobuilt a ' + spBuild.model.name);
                                    built = true; spBuild.update();
                                }
                            });
                        }
                    }
                }
            }
        }

        // Build space programs
        if (this.model.minor.program && game.spaceTab.visible) {
            this.ensureContentExists('Space');
            for (var program of game.spaceTab.GCPanel.children) {
                if (program.model.metadata.unlocked && program.model.on == 0) {
                    // hack to allow a limit on how far out to go
                    if (typeof(this.model.minor.program) == 'number') {
                        const chart = program.model.metadata.prices.find((p) => p.name === 'starchart');
                        if (this.model.minor.program < chart.val) continue;
                    }
                    // normal path
                    if (! program.model.enabled) program.controller.updateEnabled(program.model);
                    if (program.model.enabled) {
                        program.controller.buyItem(program.model, {}, function(result) {
                            if (result) {
                                built = true; program.update();
                            }
                        });
                    }
                }
            }
        }

        return built;
    }

    // Build religion/time stuff automatically
    autoTime(ticksPerCycle) {
        let built = false;
        if (this.model.auto.build) {
            const buttonGroups = [
                game.religionTab?.zgUpgradeButtons,
                game.religionTab?.ctPanel?.children[0]?.children,
                game.timeTab?.cfPanel?.children[0]?.children,
                game.timeTab?.vsPanel?.children[0]?.children,
            ];
            this.ensureContentExists('Religion');
            this.ensureContentExists('Time');

            // TODO: special case for Markers and Tears
            const tb = this.model.timeBuildings;
            for (const buttons of buttonGroups) {
                if (buttons) {
                    for (const button of buttons) {
                        if (tb[button.id]?.enabled && button.model.metadata.unlocked
                                && (!tb[button.id].limit || button.model.metadata.val < tb[button.id].limit)) {
                            if (! button.model.enabled) button.controller.updateEnabled(button.model);
                            if (button.model.enabled) {
                                button.controller.buyItem(button.model, {}, function(result) {
                                    if (result) {
                                        built = true; button.update();
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        return built;
    }

    // Festival automatically
    autoParty(ticksPerCycle) {
        if (this.model.auto.party && game.science.get('drama').researched && game.villageTab.visible) {
            const catpower = game.resPool.get('manpower').value;
            const culture = game.resPool.get('culture').value;
            const parchment = game.resPool.get('parchment').value;

            if (catpower >= 1500 && culture >= 5000 && parchment >= 2500) {
                if (game.prestige.getPerk('carnivals').researched && game.calendar.festivalDays <= 400*(this.model.minor.partyLimit - 1)) {
                    game.village.holdFestival(1);
                } else if (game.calendar.festivalDays == 0) {
                    game.village.holdFestival(1);
                }
            }
        }
        return false; // there is never a need to re-run
    }

    // Control Energy Consumption
    energyControl(ticksPerCycle) {
        if (this.model.auto.energy) {
            const proVar = game.resPool.energyProd;
            let conVar = game.resPool.energyCons;

            // TODO:
            // generally when I have to turn things off:
            // 1. off go the biolabs
            // 2. off go the pumpjack
            // 3. off goes the accelerators
            // ---
            // now we turn something on...
            // T. enable thorium reactors
            // ---
            // now things I care about start going off:
            // 4. factory
            // 5. calciner
            // 6. orbital array
            // 7. lunar outposts
            // 8. moon bases
            // ---
            // finals:
            // X. Entanglement Station
            // X. Chronocontrol
            // X. Containment chambers
            // Y. Space Stations -- note, never auto enable space stations
            // ---
            if (this.model.power.accelerator.val > this.model.power.accelerator.on && proVar > (conVar + 3)) {
                this.model.power.accelerator.on++;
                conVar++;
            } else if (this.model.power.calciner.val > this.model.power.calciner.on && proVar > (conVar + 3)) {
                this.model.power.calciner.on++;
                conVar++;
            } else if (this.model.power.factory.val > this.model.power.factory.on && proVar > (conVar + 3)) {
                this.model.power.factory.on++;
                conVar++;
            } else if (this.model.power.oilWell.val > this.model.power.oilWell.on && proVar > (conVar + 3)) {
                // pumpjack is optional, we should reduce wells.on until we'd get more production
                // from all on and pumpjack off
                this.model.power.oilWell.on++;
                conVar++;
            } else if (this.model.power.biolab.val > this.model.power.biolab.on && proVar > (conVar + 3)) {
                // only if we have the tech that makes them cost power
                this.model.power.biolab.on++;
                conVar++;
            } else if (this.model.power.biolab.on > 0 && proVar < conVar) {
                this.model.power.biolab.on--;
                conVar--;
            } else if (this.model.power.oilWell.on > 0 && proVar < conVar) {
                this.model.power.oilWell.on--;
                conVar--;
            } else if (this.model.power.factory.on > 0 && proVar < conVar) {
                this.model.power.factory.on--;
                conVar--;
            } else if (this.model.power.calciner.on > 0 && proVar < conVar) {
                this.model.power.calciner.on--;
                conVar--;
            } else if (this.model.power.accelerator.on > 0 && proVar < conVar) {
                this.model.power.accelerator.on--;
                conVar--;
            }
            // other things that cost energy: orbital arrays, moon bases, lunar outposts
            // also spacestations, but I don't think we should auto turn them off
        }
        return false;
    }

    /*** These scripts run every 4 seconds ***/

    smartAssign() {
        if (game.calendar.day < 0) return false; // temporal paradox messes up the cache
        const limits={};
        const kittens = game.village.getKittens();
        const fugit = game.time.isAccelerated ? 1.5 : 1;

        // Default Job Ratio. Will try to aim for this.
        const jobRatio = {
            'farmer':    0.05,
            'woodcutter':0.20,
            'miner':     0.20,
            'geologist': 0.20,
            'hunter':    0.15,
            'scholar':   0.10,
            'priest':    0.10,
        };

        // first calculate (and enforce) "hard" limits:
        for (const job of game.village.jobs) {
            // We need a better way of finding out what a kitten produces in each job
            let res = null;
            let ticksToFull = null;
            if (! job.unlocked) continue;
            if (job.value === 0) {
                if (jobRatio[job.name]) limits[job.name] = 1; // can't calculate without at least one worker
                continue;
            }
            switch (job.name) {
                case 'farmer':
                    // no limit.
                    break;
                case 'woodcutter':
                    res = game.resPool.get('wood');
                    if (res.value >= res.maxValue * 1.1) limits[job.name] = 1; // bail if overcapped
                    else ticksToFull = 3; // Limit production to what autoCraft can consume
                    break;
                case 'miner':
                    res = game.resPool.get('minerals');
                    if (res.value >= res.maxValue * 1.1) limits[job.name] = 1; // bail if overcapped
                    else ticksToFull = 3; // As Lumbercats
                    break;
                case 'geologist':
                    var coalRes = game.resPool.get('coal');
                    var ironRes = game.resPool.get('iron');
                    if (coalRes.value >= coalRes.maxValue * 1.1 && ironRes.value >= ironRes.maxValue * 1.1) {
                        limits[job.name] = 1; // bail if overcapped
                    } else {
                        limits[job.name] = Math.round((ironRes.perTickCached * (2 / 3) / coalRes.perTickCached) * job.value);
                    }
                    break;
                case 'hunter':
                    res = game.resPool.get('manpower');
                    if (! sk.model.auto.hunt && res.value >= res.maxValue) limits[job.name] = 1;
                    else ticksToFull = 10;
                    break;
                case 'scholar':
                    res = game.resPool.get('science');
                    if (res.value >= res.maxValue) limits[job.name] = 1;
                    else ticksToFull = 20;
                    break;
                case 'priest':
                    // no hard limit, excess goes here
                    break;
            }
            if (res && ticksToFull) {
                const perKittenSec = res.perTickCached * fugit * 5 / job.value;
                if (perKittenSec > 0) {
                    limits[job.name] = Math.round((res.maxValue / perKittenSec) / (ticksToFull / 5));
                }
            }
            if (limits[job.name] && job.value > limits[job.name]) {
                game.village.sim.removeJob(job.name, job.value - limits[job.name]);
            }
        }

        /**
         * As a general guideline, smartAssign should only "assign" kittens to
         * jobs, not remove them. However, we make some exceptions:
         *     1. (above) if there are so many in a job that resources are going to waste
         *     2. (above) we're at science or hunting cap
         *     3. (this) if we're starving, or a job has less than half expected
         *         - this last point means the player the player can't allocate more than ~60%
         * Note: assignJob and removeJob are fairly slow functions, because
         * they try to "optimize" kittens, (which mostly means adding the most
         * skilled and removing the least skilled) so we try to batch assign/remove.
         **/

        // find jobs with less than half target
        const needs = {};
        for (const job of game.village.jobs) {
            if (! job.unlocked || ! jobRatio[job.name]) continue;
            let minimum = Math.floor(jobRatio[job.name] * kittens / 2);
            if (limits[job.name]) minimum = Math.min(minimum, limits[job.name]);
            if (job.value < minimum) needs[job.name] = minimum - job.value;
            if (job.name === 'farmer' && game.resPool.get('catnip').perTickCached < 0) {
                needs[job.name] ||= 1; // if we're starving, add a farmer
            }
        }

        // try to satisfy from free kittens
        let avails = game.village.getFreeKittens();
        let totalNeed = 0;
        for (const need in needs) totalNeed += needs[need];

        // figure current distribution
        let distribution = [];
        for (const job of game.village.jobs) {
            if (! job.unlocked || ! jobRatio[job.name]) continue;
            distribution.push({
                name: job.name,
                count: job.value,
                expected: kittens * jobRatio[job.name],
                cpe: Math.max(job.value, 0.01)/(kittens * jobRatio[job.name]), // count per expected
            });
        }

        // allocate necessary losses to the most over-allocated
        distribution.sort((a, b) => b.cpe - a.cpe);
        untilNeed: while (avails < totalNeed) {
            for (let i=0; i<distribution.length; i+=1) {
                if (i+1 >= distribution.length || distribution[i].cpe > distribution[i+1].cpe) {
                    distribution[i].count -= 1;
                    distribution[i].cpe = distribution[i].count / distribution[i].expected;
                    totalNeed -= 1;
                    continue untilNeed;
                }
            }
            console.log('smartAssign: warning: could not satisfy needs');
            break; // should very rarely happen, but infinite loops are really bad
        }
        // lose them
        for (const job of game.village.jobs) {
            const dist = distribution.find((d) => job.name === d.name);
            if (dist && job.value > dist.count) {
                game.village.sim.removeJob(job.name, job.value - dist.count);
            }
        }

        // do the needful
        for (const job of game.village.jobs) {
            const need = needs[job.name];
            if (need) {
                const assign = Math.min(need, avails);
                game.village.assignJob(job, assign);
                avails -= assign;
                const dist = distribution.find((d) => job.name === d.name);
                if (dist) {
                    dist.count += assign;
                    dist.cpe = dist.count / dist.expected;
                }
                // possible this is the first assign, that's ok, we don't need it in the dist then
            }
        }

        // use up any remaining space
        delete distribution.farmer;
        distribution.reverse();
        distribution = distribution.filter(function(x) {
            return x.name !== 'farmer' && (!limits[x.name] || x.count < limits[x.name]);
        });
        untilAvail: while (avails > 0) {
            for (let i=0; i<distribution.length; i+=1) {
                if (i+1 >= distribution.length || distribution[i].cpe < distribution[i+1].cpe) {
                    distribution[i].count += 1;
                    avails -= 1; // haven't done it yet, it's in "add them"
                    distribution[i].cpe = distribution[i].count / distribution[i].expected;
                    continue untilAvail;
                }
            }
            console.log(`smartAssign: warning: ${avails} unused kittens`); // happens mostly when distribution is totally empty.
            break;
        }
        // add them
        for (const job of game.village.jobs) {
            const dist = distribution.find((d) => job.name === d.name);
            if (dist) {
                const hire = dist.count - job.value;
                if (hire) game.village.assignJob(job, hire);
            }
        }
        return false;
    }

    // Auto assign new kittens to selected job
    autoAssign(ticksPerCycle) {
        let assigned = false;
        if (this.model.auto.assign) { // && game.villageTab.visible) {
            if (this.model.option.assign === 'smart') {
                assigned = this.smartAssign();
            } else if (game.village.getJob(this.model.option.assign).unlocked && game.village.hasFreeKittens()) {
                // console.log('assign', game.village.getJob(this.model.option.assign))
                game.msg('Assigned a ' + this.model.option.assign);
                game.village.assignJob(game.village.getJob(this.model.option.assign), 1);
                assigned = true;
            }
        }
        return assigned;
    }

    // Auto Research
    autoResearch(ticksPerCycle, consecutive) {
        if (this.model.auto.research && game.libraryTab.visible) {
            this.ensureContentExists('Science');
            return this.autoTechHelper(game.libraryTab.buttons, consecutive);
        }
        return false;
    }

    // Auto buy workshop upgrades
    autoWorkshop(ticksPerCycle, consecutive) {
        if (this.model.auto.workshop && game.workshopTab.visible) {
            this.ensureContentExists('Workshop');
            return this.autoTechHelper(game.workshopTab.buttons, consecutive);
        }
        return false;
    }

    autoTechHelper(buttons, skipUpdate) {
        let acted = false;
        const science = game.resPool.get('science').value;
        let bestButton = null;
        let bestCost = Infinity;
        techloop: for (const button of buttons) {
            if (button.model.metadata.researched || ! button.model.metadata.unlocked) continue;
            let cost = 0;
            for (const price of button.model.prices) {
                if (price.name == 'science') {
                    cost = price.val;
                } else if (this.model.minor.conserveExotic && this.model.exoticResources.includes(price.name)) {
                    continue techloop;
                }
            }
            if (cost < science && cost < bestCost) {
                if (! skipUpdate && ! button.model.enabled) button.controller.updateEnabled(button.model);
                if (button.model.enabled) {
                    bestButton = button;
                    bestCost = cost;
                }
            }
        }
        if (bestButton) {
            bestButton.controller.buyItem(bestButton.model, {}, function(result) {
                if (result) {
                    acted = true; bestButton.update();
                } else {
                    console.log(`Failed to build ${bestButton.model.metadata.name}`);
                }
            });
        }
        return acted;
    }

    // Auto buy religion upgrades
    autoReligion(ticksPerCycle) {
        let bought = false;
        let futureBuy = false;
        if (this.model.auto.religion && game.religionTab.visible) {
            this.ensureContentExists('Religion');

            for (const button of game.religionTab.rUpgradeButtons) {
                if (! button.model.enabled) button.update();
                if (button.model.enabled) {
                    button.controller.buyItem(button.model, {}, function(result) {
                        if (result) {
                            bought = true; button.update();
                        }
                    });
                }
                // only things with a priceRatio cap, check if they have
                futureBuy ||= (button.model.metadata.priceRatio && ! button.model.resourceIsLimited);
            }
            if (! futureBuy && this.model.minor.praiseAfter && ! this.model.auto.praise) {
                sk.gui.autoSwitch('praise', 'SK_autoPraise');
            }
        }
        return bought;
    }

    // Trade automatically
    autoTrade(ticksPerCycle) {
        let traded = false;
        if (this.model.auto.trade) { // && game.diplomacyTab.visible) {
            const goldResource = game.resPool.get('gold');
            const goldPerCycle = Math.max(14, game.getResourcePerTick('gold') * ticksPerCycle);
            const powerResource = game.resPool.get('manpower');
            let powerPerCycle = game.getResourcePerTick('manpower') * ticksPerCycle;
            powerPerCycle = Math.min(powerPerCycle, powerResource.value); // don't try to spend more than we have
            let sellCount = Math.floor(Math.min(goldPerCycle/14, powerPerCycle/50));

            // TODO: capping gold can take too long, use SRS to compensate
            // fuck that noise. Write a proper autoTrade, with per civ toggles in the Options menu
            let maxTrades = 0;
            if (goldResource.value > (goldResource.maxValue - goldPerCycle)) { // don't check catpower
                maxTrades = 0.6 * goldResource.value / 14;
            } else {
                maxTrades = goldPerCycle * this.model.option.minSecResRatio / 100 / 15; // consume up to mSRR% of production
            }

            if (maxTrades > 0) {

                const tiRes = game.resPool.get('titanium');
                const irRes = game.resPool.get('iron');
                const unoRes = game.resPool.get('unobtainium');

                if (irRes.maxValue > 1e6) {
                    const plates = 0.1 * irRes.value / 150;
                    console.log('Force-crafting ' + Math.round(plates) + ' plates');
                    game.craft('plate', plates);
                }

                if (unoRes.value > 5000 && game.diplomacy.get('leviathans').unlocked && this.model.minor.elderTrade) {
                    game.diplomacy.tradeAll(game.diplomacy.get('leviathans'));
                    traded = true;
                } else if (tiRes.value < (tiRes.maxValue * 0.97) && game.diplomacy.get('zebras').unlocked) {
                    game.craft('slab', 9);
                    // don't waste the iron, make some space for it.
                    const ironRes = game.resPool.get('iron');
                    const sellIron = game.diplomacy.get('zebras').sells[0];
                    const expectedIron = sellIron.value * sellCount *
                        (1 + (sellIron.seasons ? sellIron.seasons[game.calendar.getCurSeason().name] : 0)) *
                        (1 + game.diplomacy.getTradeRatio() + game.diplomacy.calculateTradeBonusFromPolicies('zebras', game));
                    if (ironRes.value > (ironRes.maxValue - expectedIron)) {
                        game.craft('plate', (ironRes.value - (ironRes.maxValue - expectedIron))/125); // 125 is iron per plate
                    }

                    // don't overdo it
                    const deltaTi = tiRes.maxValue - tiRes.value;
                    const expectedTi = game.resPool.get('ship').value * 0.03;

                    sellCount = Math.ceil(Math.min(maxTrades, sellCount, deltaTi / expectedTi));
                    //
                    game.diplomacy.tradeMultiple(game.diplomacy.get('zebras'), sellCount);
                    // game.diplomacy.tradeMultiple(game.diplomacy.get('dragons'), 20);
                    traded = false; // don't back-to-back zebra trade
                } else if (irRes.value < (irRes.maxValue * 0.9) && game.diplomacy.get('griffins').unlocked) {
                    // pk4
                    game.diplomacy.tradeMultiple(game.diplomacy.get('griffins'), Math.min(maxTrades, 200));
                } else if (tiRes.value > (tiRes.maxValue * 0.95) && game.diplomacy.get('dragons').unlocked) {
                    // pk4
                    game.diplomacy.tradeMultiple(game.diplomacy.get('dragons'), Math.min(maxTrades, 200));
                }

            }
        }
        return traded;
    }

    // auxiliary function for autoShatter
    autoDoShatter(years) {
        // limit to 5 years per tick, mostly to allow crafting time
        let timeslip = false;
        if (years > 5) {
            years = 5;
            timeslip = true;
        }

        // mass craft
        const shatterTCGain = game.getEffect('shatterTCGain') * (1 + game.getEffect('rrRatio'));
        const cal = game.calendar;
        const ticksPassing = years * cal.seasonsPerYear * cal.daysPerSeason * cal.ticksPerDay;
        this.autoCraft(shatterTCGain * ticksPassing);
        this.autoHunt(shatterTCGain * ticksPassing);

        // do shatter
        const btn = game.timeTab.cfPanel.children[0].children[0]; // no idea why there's two layers in the code
        btn.controller.doShatterAmt(btn.model, years);
        return timeslip;
    }

    // Keep Shattering as long as Space-Time is cool enough
    autoShatter(ticksPerCycle, shattering) {
        let timeslip = false;
        if (this.model.auto.shatter || this.model.auto.cycle) {
            this.ensureContentExists('Time');
            if (game.timeTab.cfPanel.visible && game.calendar.day >= 0) { // avoid shattering DURING paradox
                const startOfSeason = game.calendar.day * game.calendar.ticksPerDay < 3 * ticksPerCycle;
                const lowHeat = game.time.heat < Math.max(5, ticksPerCycle * game.getEffect('heatPerTick'));
                const startStorm = shattering || (this.model.minor.wait4void ? startOfSeason : true) && lowHeat;

                // find length of shatter storm
                let shatter = 0;
                if (this.model.auto.shatter && startStorm) {
                    // how many shatters worth of heat can we afford?
                    const factor = game.challenges.getChallenge('1000Years').researched ? 5 : 10;
                    shatter = Math.ceil((game.getEffect('heatMax') - game.time.heat) / factor);
                    shatter = Math.max(shatter, 0);
                }

                // adjust to end in the right cycle
                const cyclename = this.model.option.cycle;
                const cycle = game.calendar.cycles.findIndex((c) => c.name === cyclename);
                if (this.model.auto.cycle && game.calendar.cycle != cycle) {
                    // desired cycle: sk.model.option.cycle
                    // current cycle: game.calendar.cycle
                    // year in cycle: game.calendar.cycleYear
                    const deltaCycle = (cycle - game.calendar.cycle + game.calendar.cycles.length) % game.calendar.cycles.length;
                    const yearsToCycle = deltaCycle*5 - game.calendar.cycleYear;
                    shatter = Math.floor(shatter / 50)*50 + yearsToCycle;
                }

                // click the button
                if (shatter != 0 && shatter < game.resPool.get('timeCrystal').value) {
                    timeslip = this.autoDoShatter(shatter);
                }
            }
        }
        return timeslip;
    }

    // Build Embassies automatically
    autoEmbassy(ticksPerCycle) {
        // TODO: something in this function is damaging responsiveness
        let built = false;
        if (this.model.auto.embassy && game.science.get('writing').researched && game.diplomacyTab.racePanels && game.diplomacyTab.racePanels[0]) {
            const culture = game.resPool.get('culture');
            // console.log(culture);
            if (culture.value >= culture.maxValue * 0.9) { // will often exceed due to MS fluctuations
                const panels = game.diplomacyTab.racePanels;
                let btn = panels[0].embassyButton;
                for (let z = 1; z < panels.length; z++) {
                    const candidate = panels[z].embassyButton;
                    candidate.update();
                    if (candidate && candidate.model.prices[0].val < btn.model.prices[0].val) {
                        btn = candidate;
                    }
                }
                btn.controller.buyItem(btn.model, {}, function(result) {
                    if (result) {
                        console.log(btn.model);
                        const friends = btn.model && btn.model.options && btn.model.options.race && btn.model.options.race.name;
                        game.msg('Sent Embassy to ' + friends);
                        built = true; btn.update();
                    }
                });
            }
        }
        return built;
    }

    /*** These scripts run every minute ***/

    // Explore for new Civs
    autoExplore(ticksPerCycle) {
        let available = false;
        if (this.model.auto.explore && game.diplomacyTab.visible && game.resPool.get('manpower').value >= 1000) {
            this.ensureContentExists('Trade');

            for (const race of game.diplomacy.races) {
                if (race.unlocked) continue;
                switch (race.name) {
                    case 'lizards': case 'sharks': case 'griffins':
                        available = true;
                        break;
                    case 'nagas':
                        available = game.resPool.get('culture').value >= 1500;
                        break;
                    case 'zebras':
                        available = game.resPool.get('ship').value >= 1;
                        break;
                    case 'spiders':
                        available = game.resPool.get('ship').value >= 100 && game.resPool.get('science').maxValue > 125000;
                        break;
                    case 'dragons':
                        available = game.science.get('nuclearFission').researched;
                        break;
                    case 'leviathans':
                        break;
                    default:
                        console.log(`WARNING: unrecognized race: ${race.name} in minor/Explore`);
                }
                if (available) break;
            }
            if (available) {
                const button = game.diplomacyTab.exploreBtn;
                button.controller.buyItem(button.model, {}, function(result) {
                    if (result) {
                        available = true;
                        game.diplomacyTab.render($('div.tabInner.Trade')[0]); // create race panel
                    }
                });
            }
        }
        return available;
    }

    // Auto buy unicorn upgrades
    autoUnicorn(ticksPerCycle) {
        let acted = false;
        if (this.model.auto.unicorn && game.religionTab.visible) {
            this.ensureContentExists('Religion');

            /* About Unicorn Rifts
             * Each Tower causes a 0.05% chance for a rift per game-day
             * Each rift produces 500 Unicorns * (Unicorn Production Bonus)/10
             */
            const riftUnicorns = 500 * (1 + game.getEffect('unicornsRatioReligion') * 0.1);
            const unicornChanceRatio = 1.1 * (1 + game.getEffect('timeRatio') * 0.25);
            const upsprc = riftUnicorns * unicornChanceRatio / 2; // unicorns per second per riftChance
            const ups = 5 * game.getResourcePerTick('unicorns') / (1 + game.getEffect('unicornsRatioReligion'));
            // Constants for Ivory Meteors
            const meteorChance = game.getEffect('ivoryMeteorChance') * unicornChanceRatio / 2;
            const ivoryPerMeteor = 250 + 749.5 * (1 + game.getEffect('ivoryMeteorRatio'));

            // find which is the best value
            let bestButton = null;
            let bestValue = 0.0;
            for (const button of game.religionTab.zgUpgradeButtons) {
                if (button.model.metadata.unlocked) {
                    let value = 0;
                    if (! this.model.minor.unicornIvory) {
                        const tearCost = button.model.prices.find((element) => element.name==='tears');
                        if (tearCost == null) continue;
                        const ratio = button.model.metadata.effects.unicornsRatioReligion;
                        const rifts = button.model.metadata.effects.riftChance || 0;
                        value = (ratio * ups + rifts * upsprc) / tearCost.val;
                    } else {
                        const ivoryCost = button.model.prices.find((element) => element.name==='ivory');
                        if (ivoryCost == null) continue;
                        const ratio = button.model.metadata.effects.ivoryMeteorRatio || 0;
                        const chance = button.model.metadata.effects.ivoryMeteorChance || 0;
                        value = (meteorChance * ratio * 749.5 + chance * unicornChanceRatio/2 * ivoryPerMeteor) / ivoryCost.val;
                    }
                    if (value > bestValue) {
                        bestButton = button;
                        bestValue = value;
                    }
                }
            }

            // can we afford it?
            if (bestButton != null) {
                let tearCost = 0;
                let otherCosts = true;
                for (const price of bestButton.model.prices) {
                    if (price.name == 'tears') {
                        tearCost = price.val;
                    } else if (price.val > game.resPool.get(price.name).value) {
                        otherCosts = false;
                    }
                }
                if (otherCosts) {
                    const sufficient = this.sacForTears(tearCost);
                    if (sufficient) {
                        if ( ! bestButton.model.enabled) bestButton.update();
                        bestButton.controller.buyItem(bestButton.model, {}, function(result) {
                            if (result) {
                                acted = true; bestButton.update();
                            }
                        });
                    }
                }
            }

            // extension. If we're building markers, try to get enough tears for them.
            if (this.model.timeBuildings.marker.enabled) {
                let marker = game.religionTab.zgUpgradeButtons.find((z)=>z.id === 'marker');
                if (marker) {
                    let price = marker.model.prices.find((p)=>p.name === 'tears');
                    if (price) this.sacForTears(price.val);
                }
            }
        }
        return acted;
    }

    sacForTears(tearCost) {
        const unicorns = game.resPool.get('unicorns').value;
        const tears = game.resPool.get('tears').value;
        const zigs = game.bld.get('ziggurat').on;
        const available = tears + Math.floor(unicorns / 2500) * zigs;
        if (available >= tearCost) {
            if (tears < tearCost) {
                const sacButton = game.religionTab.sacrificeBtn;
                // XXX: I don't like calling an internal function like _transform
                // But it's the only way to request a specific number of Unicorn sacrifices, instead of spam-clicking...
                sacButton.controller._transform(sacButton.model, Math.ceil((tearCost - tears) / zigs));
            }
            return true;
        } else {
            return false;
        }
    }

    // Auto buys and sells bcoins optimally
    autoBCoin(ticksPerCycle) {
        // When the price is > 1100 it loses 20-30% of its value
        // 880+ε is the highest it could be after an implosion
        if (this.model.auto.bcoin && game.diplomacy.get('leviathans').unlocked && game.resPool.get('relic').value > 0) {
            const eldersPanel = game.diplomacyTab.racePanels.find((p) => p.race.name === 'leviathans');
            if (! eldersPanel || ! eldersPanel.buyBcoin) return false;
            if (game.calendar.cryptoPrice < 1090) {
                game.diplomacy.buyBcoin();
            } else if (game.resPool.get('blackcoin').value > 0) {
                game.diplomacy.sellBcoin();
            }
        }
        return false;
    }

    // Automatically use flux for fixing CCs and tempus fugit
    autoFlux(ticksPerCycle) {
        if (this.model.auto.flux && game.timeTab.visible) {
            const flux = game.resPool.get('temporalFlux').value;
            const reserve = 10000 + 2 * ticksPerCycle; // actual is 9500; round numbers and margin of error
            const fixcost = 3000;
            const forfugit = game.time.heat / game.getEffect('heatPerTick');
            if (flux > reserve + forfugit + fixcost) {
                this.fixCryochamber();
                if (flux > 0) game.time.isAccelerated = true;
            } else if (flux > reserve) {
                // clicking the toggle-switch is HARD, this is fine as long as flux > 0
                if (flux > 0) game.time.isAccelerated = true;
            } else {
                game.time.isAccelerated = false;
            }
            this.model.managedFugit = game.time.isAccelerated;
        } else if (this.model.managedFugit) {
            // if it was turned off while Fugit was on, turn off Fugit
            game.time.isAccelerated = false;
            this.model.managedFugit = false;
        }
        return false;
    }

    fixCryochamber() {
        const button = game.timeTab.vsPanel.children[0].children[0];
        if (button.model) {
            button.controller.buyItem(button.model, {}, function(result) {
                if (result) button.update();
            });
        }
    }

    autoPlay(ticksPerCycle) {
        if (this.model.auto.play) {
            this.scripts.run(this.model.option.script);
        }
    }

    autoSave(ticksPerCycle) {
        sk.saveOptions();
    }
};

/**
 * These are the autoPlay scripts. Highly Experimental
 **/
SK.Scripts = class {
    constructor(model) {
        this.model = model;
        this.init();
    }

    init() {
        this.state = ['init'];
    }

    save(options) {
        options.scripts_state = this.state;
    }

    load(options) {
        if (options.scripts_state) this.state = options.scripts_state;
    }


    static listScripts() {
        return [ // format is chosen to match things like game.calendar.cycles
            {name:'test',        title:'Test Script'},
            {name:'fastParagon', title:'Fast Reset'},
            {name:'slowloop',    title:'DF ChronoExpo'},
            {name:'fastloop',    title:'Short ChronoExpo'},
            {name:'hoglaHunt',   title:'Hoglagame - Hunt'},
            {name:'doReset',     title:'Reset Now'},
        ];
    }

    run(script) {
        if (this.state.length == 0) return;

        // prep
        const oldConfirm = game.ui.confirm; // for policies and building upgrades
        game.ui.confirm = this.alwaysYes;

        // action
        const action = this.state.shift();
        console.log(`Doing ${action}  --  [${this.state}]`);
        const done = this[script](action);
        if (done) {
            sk.gui.refresh();
        } else {
            this.state.push(action);
        }

        // cleanup
        if (action != 'init') { // init is allowed to change tab
            game.ui.confirm = oldConfirm;
        }
    }

    alwaysYes(title, msg, fn) {
        fn();
    }

    /*** These are utility functions to simplify scripts below ***/

    singleBuild(buttons, building) {
        let built = false;
        for (var button of buttons) {
            if (button.model.metadata?.name != building) continue;
            if (button.model.on > 0) return true; // we've already got one
            if (button.model.enabled) {
                button.controller.buyItem(button.model, {}, function(result) {
                    if (result) {
                        built = true; button.update();
                    }
                });
            }
        }
        return built;
    }

    singleTech(buttons, targets) {
        let count = 0;
        for (var button of buttons) {
            const metadata = button.model.metadata;
            if (metadata.blocked) continue;
            if (targets.includes(metadata.name)) {
                if (metadata.researched || metadata.on) {
                    count += 1;
                    continue;
                }
                if (! button.model.enabled) button.controller.updateEnabled(button.model);
                if (button.model.enabled) { // TODO testing
                    button.controller.buyItem(button.model, {}, function(result) {
                        if (result) button.update();
                    });
                    return false;
                }
            }
        }
        return count == targets.length;
    }

    singleUpgrade(buildings) {
        let count = 0;
        for (const button of game.bldTab.buttons) {
            if (! button.controller.upgrade) continue; // easy filter for upgradable buildings
            const metadata = button.model.metadata;
            if (buildings.includes(metadata.name)) {
                if (metadata.stage == metadata.stages.length - 1) {
                    count += 1;
                } else if (metadata.stages[metadata.stage+1].stageUnlocked) {
                    button.controller.upgrade(button.model);
                    return false;
                }
            }
        }
        return count == buildings.length;
    }

    craftFor(manager, buildings) {
        for (const bName of buildings) {
            const building = manager.get(bName);
            if (building.researched) continue;
            for (const price of building.prices) {
                const res = game.resPool.get(price.name);
                if (res.value >= price.val) continue; // we have enough

                const craft = game.workshop.getCraft(price.name);
                if (! craft) continue; // not craftable

                let need = Math.ceil((price.val - res.value) / (1 + game.getEffect('craftRatio')));
                for (const craftPrice of craft.prices) {
                    const craftRes = game.resPool.get(craftPrice.name);
                    need = Math.min(need, Math.floor(craftRes.value / craftPrice.val));
                }
                if (need > 0) game.craft(price.name, need);
            }
        }
    }

    isCapped(buttons, target) {
        for (const button of buttons) {
            if (button.model.metadata?.name != target) continue;
            return button.model.resourceIsLimited == true;
        }
        return false; // if we can't find it, we haven't even begun to build it
    }

    buildingCount(building, resource, fraction) {
        const data = game.bld.buildingsData.find((b) => b.name === building);
        if (! data) {
            console.error(`buildingCount: ${building} does not exist!`);
            return 0;
        }
        const ratio = game.bld.getPriceRatio(building);

        let costs = [];
        for (let price of data.prices) {
            if (resource === 'all' || resource === price.name) {
                costs.push({
                    total: 0,
                    next: price.val,
                    limit: fraction * game.resPool.get(price.name).value
                });
            }
        }

        if (costs.length <= 0) {
            console.error(`buildingCount: ${building} does not use ${resource}`);
            return 0;
        }

        let count = 0;
        while (true) {
            for (let cost of costs) {
                cost.total += cost.next;
                cost.next *= ratio;
                if (cost.total > cost.limit) return count;
            }
            count += 1;
        }
    }

    sellout() {
        // sac alicorns
        let button = game.religionTab.sacrificeAlicornsBtn;
        if (button) {
            button.controller._transform(button.model, Math.floor(button.controller._canAfford(button.model)));
        }

        // Adore, user can Transcend manually
        button = game.religionTab.adoreBtn;
        if (button) {
            button.controller.buyItem(button.model, {}, function(result) {
                if (result) {
                    button.update();
                }
            });
        }

        // sell a bunch of buildings, reset.
        const sellAll = {'shiftKey': true};
        let moonButton = null;
        for (button of game.bldTab.buttons.concat(game.spaceTab.planetPanels.reduce(function(base, pp) {
            return base.concat(pp.children);
        }, []))) {
            if (! button.model.metadata) continue;
            if (button.model.metadata.name == 'chronosphere') continue; // never sell
            if (button.model.metadata.name == 'moonBase') moonButton = button;
            var sell = true;
            for (const effect in button.model.metadata.effects) {
                if (effect.substr(-3, 3) == 'Max' || effect == 'maxKittens') {
                    sell = false;
                    break;
                }
            }
            if (sell == true) button.controller.sell(sellAll, button.model);
        }
        // and sell Moon Bases, because it's worth it for the UO boost
        if (sell == true && moonButton) moonButton.controller.sell(sellAll, moonButton.model);
    }

    reset() {
        const reset = this.model.minor.permitReset;
        const script = this.model.option.script;

        // reset settings to initial state, except for script metasettings
        // note that autoPlay will be off, this is the last time we'll get in.
        this.model.wipe();
        this.model.setDefaults();
        this.init();
        if (script !== 'doReset') {
            this.model.option.script = script;
            this.model.minor.permitReset = reset;
        }

        if (reset || script === 'doReset') {
            sk.tasks.halt();
            this.sellout();
            this.model.auto.play = true;
            sk.saveOptions();
            game.reset();
        } else {
            sk.gui.refresh();
            game.msg('AutoPlay Reset not permitted. Script Terminating.');
        }
    }

    /*** This is where scripts start ***/

    slowloop(action) {
        switch (action) {
            case 'init': // -> workshop-start, science-end, build-upgrade, trade-zebras, trade-hunt, policy
                this.model.auto.explore = true;
                this.model.auto.party = true;
                this.model.auto.research = true;
                this.model.auto.unicorn = true;
                this.model.auto.workshop = true;
                this.model.minor.program = true;
                this.model.minor.feed = true;
                this.model.minor.promote = true;
                this.model.minor.praiseAfter = true;
                this.model.minor.conserveExotic = true;
                this.state.push('workshop-start');
                this.state.push('science-end');
                this.state.push('build-upgrade');
                this.state.push('trade-zebras');
                this.state.push('trade-hunt');
                this.state.push('policy');
                game.ui.activeTabId = 'Bonfire';
                game.render();
                return true;

            case 'workshop-start': // -> workshop-mid
                if (this.singleBuild(game.bldTab.buttons, 'workshop')) {
                    this.model.auto.workshop = true;
                    this.state.push('workshop-mid');
                    return true;
                }
                return false;

            case 'workshop-mid': // -> workshop-end
                // this is just a reasonable sample:
                var requiredWorkshop = ['spaceManufacturing', 'thoriumReactors', 'tachyonAccelerators', 'eludiumHuts'];
                for (const upgrade of requiredWorkshop) {
                    if (! game.workshop.get(upgrade).researched) return false;
                }
                this.model.auto.workshop = false;
                this.model.minor.conserveExotic = false;
                this.state.push('workshop-end');
                return true;

            case 'workshop-end': // -|
                var extraWorkshop = ['caravanserai', 'chronoforge', 'turnSmoothly', 'amBases', 'aiBases'];
                if (this.singleTech(game.workshopTab.buttons, extraWorkshop)) {
                    this.singleBuild(game.timeTab.vsPanel.children[0].children, 'cryochambers'); // try to grow at 1 per reset
                    this.model.auto.flux = true;
                    return true;
                }
                return false;

            case 'science-end': // -|
                var extraTechs = ['tachyonTheory', 'voidSpace', 'paradoxalKnowledge', 'antimatter'];
                return this.singleTech(game.libraryTab.buttons, extraTechs);

            case 'build-upgrade': // -> build-start
                var upgrades = ['pasture', 'aqueduct', 'library', 'amphitheatre'];
                if (this.singleUpgrade(upgrades)) {
                    this.state.push('build-start');
                    return true;
                }
                return false;

            case 'build-start': // -> religion, steamworks, build-end
                /** cath **/
                var climit = {
                    'library': 200, // actually data center
                    'observatory': 1000,
                    'warehouse': 200,
                    'harbor': 200,
                    'quarry': 200,
                    'oilWell': 200,
                    'calciner': 200,
                    'magneto': 150,
                    'steamworks': 150,
                    'ziggurat': 100,
                    'aiCore': this.buildingCount('aiCore', 'antimatter', 0.01), // spend up to 1% of antimatter
                };
                for (const bname in this.model.cathBuildings) {
                    if (bname.slice(0, 5) == 'zebra') continue;
                    this.model.cathBuildings[bname].enabled = true;
                }
                for (const bname in climit) this.model.cathBuildings[bname].limit = climit[bname];
                /** space **/
                var space = [
                    'sattelite', 'moonOutpost', 'moonBase',
                    'planetCracker', 'hydrofracturer', 'spiceRefinery',
                    'sunforge', 'cryostation',
                ];
                for (const bname of space) this.model.spaceBuildings[bname].enabled = true;
                var slimit = {'sunforge': 20};
                for (const bname in slimit) this.model.spaceBuildings[bname].limit = slimit[bname];
                /** time **/
                var tlimit = {
                    'marker': false,
                    'blackPyramid': false,
                    'temporalBattery': 30,
                    'blastFurnace': 37,
                    'temporalImpedance': 10,
                    'ressourceRetrieval': 20,
                    'chronocontrol': 1,
                };
                for (const bname in tlimit) {
                    this.model.timeBuildings[bname].enabled = true;
                    this.model.timeBuildings[bname].limit = tlimit[bname];
                }
                this.model.auto.build = true;
                /** children **/
                this.state.push('religion');
                this.state.push('steamworks');
                this.state.push('build-end');
                return true;

            case 'build-end': // -> time-end
                if (game.calendar.year < game.calendar.darkFutureBeginning) {
                    const resNames = ['wood', 'minerals', 'unobtainium'];
                    for (const resName of resNames) {
                        const res = game.resPool.get(resName);
                        if (res.value > res.maxValue) return false; // still overcapped
                    }
                }
                var lateSpace = {'spaceElevator': false, 'orbitalArray': 50};
                for (const bname in lateSpace) {
                    this.model.spaceBuildings[bname].enabled = true;
                    this.model.spaceBuildings[bname].limit = lateSpace[bname];
                }
                this.model.auto.craft = true;
                this.state.push('time-end');
                return true;

            case 'religion': // -> assign
                sk.tasks.ensureContentExists('Religion'); // create button
                if (this.singleTech(game.religionTab.rUpgradeButtons, ['solarRevolution'])) {
                    this.model.auto.religion = true;
                    this.state.push('assign');
                    return true;
                }
                return false;

            case 'steamworks': // -|
                if (game.bld.get('steamworks').val != 0) {
                    game.bld.get('steamworks').on = game.bld.get('steamworks').val;
                    game.bld.get('steamworks').isAutomationEnabled = false;
                    return true;
                } else {
                    return false;
                }

            case 'policy': // -|
                var policies = [
                    'liberty', 'republic', 'liberalism',
                    'diplomacy', 'culturalExchange', 'zebraRelationsBellicosity',
                    'outerSpaceTreaty', 'expansionism', 'necrocracy',
                    'epicurianism', 'mysticism',
                    'environmentalism', 'conservation',
                ];
                return this.singleTech(game.libraryTab.policyPanel.children, policies);

            case 'assign': // -|
                if (game.village.getFreeKittens() > 0 || game.village.leader.job) {
                    game.village.assignJob(game.village.getJob('priest'), 1); // assign leader
                    this.model.auto.assign = true;
                    return true;
                }
                return false;

            case 'trade-zebras': // -> trade-on
                var zebraPanel = game.diplomacyTab?.racePanels?.find((panel) => panel.race.name=='zebras');
                if (!zebraPanel) return false;
                var button = zebraPanel.embassyButton;
                while (button.model.enabled) {
                    button.controller.buyItem(button.model, {}, function(result) {
                        if (result) {
                            button.update();
                        }
                    });
                }
                this.model.auto.embassy = true;
                this.state.push('trade-on');
                return true;

            case 'trade-hunt': // -|
                if (game.getEffect('hunterRatio') > 4
                        && game.calendar.festivalDays >= 400*5
                        && game.diplomacy.get('zebras').unlocked) {
                    this.model.auto.hunt = true;
                    return true;
                }
                return false;

            case 'trade-on': // -> trade-off
                if (game.calendar.year > game.calendar.darkFutureBeginning) {
                    return true; // stop in DF.
                } else if (this.isCapped(game.bldTab.buttons, 'chronosphere')) {
                    this.model.auto.trade = true;
                    this.state.push('trade-off');
                    return true;
                }
                return false;

            case 'trade-off': // -> trade-on
                if (! this.isCapped(game.bldTab.buttons, 'chronosphere')) {
                    this.model.auto.trade = false;
                    this.state.push('trade-on');
                    return true;
                }
                return false;

            case 'time-end': // |-> dark-future
                var tlimits = ['ressourceRetrieval', 'blastFurnace'];
                for (const tlimit of tlimits) {
                    // cap all limited time buildings
                    if (! this.model.timeBuildings[tlimit].limit) continue;
                    if (game.time.getCFU(tlimit).val < this.model.timeBuildings[tlimit].limit) {
                        return false;
                    }
                }
                this.model.auto.cycle = true;
                this.model.auto.shatter = true;
                this.model.auto.bcoin = true;
                this.state.push('dark-future');
                return true;

            case 'dark-future': // |-> dark-future
                if (game.calendar.year > game.calendar.darkFutureBeginning) {
                    this.model.spaceBuildings.spaceStation.enabled = true;
                    this.model.spaceBuildings.spaceElevator.enabled = false; // conserve UO for CS
                    this.model.auto.trade = false;
                    this.state.push('endgame');
                    return true;
                }
                return false;

            case 'endgame': // |-> cooldown
                if (game.calendar.cycle == 3) return false; // Helios cycle lowers UO cap
                if (! this.isCapped(game.bldTab.buttons, 'chronosphere')) return false;
                this.model.auto.bcoin = false;
                this.state.push('ensure-relics');
                return true;

            case 'ensure-relics': // |-> dark-future
                var relicsRequired = 0;
                relicsRequired += 40; // 20 sunforges
                relicsRequired += 77020; // Furnaces
                relicsRequired += 5662; // Tech/Workshop
                relicsRequired *= 1.1; // margin for error
                var relics = game.resPool.get('relic').value;
                if (relics < relicsRequired) {
                    const button = game.religionTab.refineTCBtn;
                    const mult = game.religionTab.refineTCBtn.controller.controllerOpts.gainMultiplier.call(button);
                    const delta = Math.max(1, relicsRequired - relics);
                    button.controller._transform(button.model, Math.ceil(delta / mult));
                    return false; // run the check again next cycle
                }
                return this.doReset('init');

            default:
                return this.doReset(action); // in endgame we pass off.
        }
    }

    fastloop(action) {
        switch (action) {
            case 'build-start':
                this.slowloop(action);
                this.model.spaceBuildings.spaceElevator.enabled = true;
                this.model.timeBuildings.marker.enabled = false;
                this.model.timeBuildings.blackPyramid.enabled = false;
                return true;

            case 'build-end':
                // elevator is already on, OA isn't helpful enough, and we shouldn't hit DF
                // space station pulled from DF to here
                var resNames = ['wood', 'minerals', 'unobtainium'];
                for (const resName of resNames) {
                    const res = game.resPool.get(resName);
                    if (res.value > res.maxValue) return false; // still overcapped
                }
                this.model.spaceBuildings.spaceStation.enabled = true;
                this.model.auto.craft = true;
                this.state.push('time-end');
                return true;

            case 'dark-future':
                // don't wait for DF, skip it.
                this.state.push('endgame');
                return true;

            case 'trade-on':
                this.model.minor.elderTrade = false;
                this.model.auto.trade = true;
                return true;

            default:
                // is mostly the same a slow, but we stop and reset instead of waiting for DF.
                return this.slowloop(action);
        }
    }

    fastParagon(action) {
        // Goal: 5 chronospheres, Flux Condenator, Eludium Huts
        // Estimate of ~1000 paragon per hour.
        switch (action) {
            case 'init': // -> build-start, build-upgrade, workshop-mid, trade-zebras, trade-hunt, policy
                this.model.auto.explore = true;
                this.model.auto.hunt = true;
                this.model.auto.party = true;
                this.model.auto.research = true;
                this.model.auto.unicorn = true;
                this.model.auto.workshop = true;
                this.model.option.minSecResRatio = 10; // more alloy
                this.model.minor.program = 1000; // starchart<=1000: orbit,moon,dune,piscine
                this.model.minor.feed = true;
                this.model.minor.promote = true;
                this.model.minor.praiseAfter = true;
                this.state.push('build-start');
                this.state.push('build-upgrade');
                this.state.push('workshop-mid');
                this.state.push('trade-zebras');
                this.state.push('policy');
                return true;

            case 'build-start': // -> religion, steamworks, pop-max-cath
                /** cath **/
                for (const bname in this.model.cathBuildings) {
                    let limit = false;
                    switch (bname) {
                        case 'oilWell': case 'quarry': case 'harbor': case 'amphitheatre': case 'calciner':
                            limit = 100;
                            break;
                        case 'warehouse': case 'observatory': case 'lumberMill':
                            limit = 200;
                            break;
                        case 'chronosphere':
                            limit = 5;
                            break;
                        case 'biolab': case 'mint': case 'ziggurat': case 'aiCore':
                        case 'zebraForge': case 'zebraOutpost': case 'zebraWorkshop':
                            continue; // don't enable
                    }
                    this.model.cathBuildings[bname].enabled = true;
                    if (limit) this.model.cathBuildings[bname].limit = limit;
                }
                /** space **/
                var slimit = {
                    spaceElevator: 5, sattelite: false, moonOutpost: false,
                    hydrofracturer: 10, spiceRefinery: 10,
                    researchVessel: 40,
                };
                for (const bname in slimit) {
                    this.model.spaceBuildings[bname].enabled = true;
                    this.model.spaceBuildings[bname].limit = slimit[bname];
                }
                /** turn it on **/
                this.model.auto.build = true;
                this.model.auto.assign = true;
                /** children **/
                this.state.push('religion');
                this.state.push('steamworks');
                this.state.push('pop-max-cath');
                return true;

            case 'build-upgrade': // -|
                var upgrades = ['pasture', 'amphitheatre'];
                if (this.singleUpgrade(upgrades)) {
                    this.model.auto.craft = true; // we should be in far enough for this to make sense
                    return true;
                }
                return false;

            case 'workshop-start': // -> workshop-mid
                var requiredWorkshop = ['railgun', 'concreteHuts', 'caravanserai', 'orbitalGeodesy', 'seti', 'cadSystems', 'hubbleTelescope'];
                for (const upgrade of requiredWorkshop) {
                    if (! game.workshop.get(upgrade).researched) return false;
                }
                this.model.auto.workshop = false;
                this.state.push('workshop-mid');
                return true;

            case 'workshop-mid': // -> workshop-end
                var extraWorkshop = ['spaceManufacturing', 'factoryLogistics', 'unobtainiumHuts'];
                if (this.singleTech(game.workshopTab.buttons, extraWorkshop)) {
                    this.state.push('workshop-end');
                    return true;
                }
                return false;

            case 'workshop-end': // -|
                var finalWorkshop = ['mWReactor', 'eludiumHuts', 'fluxCondensator'];
                this.craftFor(game.workshop, finalWorkshop);
                if (this.singleTech(game.workshopTab.buttons, finalWorkshop)) {
                    return true;
                }
                return false;

            case 'religion': // -|
                sk.tasks.ensureContentExists('Religion'); // create button
                if (this.singleTech(game.religionTab.rUpgradeButtons, ['solarRevolution'])) {
                    this.model.auto.religion = true;
                    return true;
                }
                return false;

            case 'steamworks': // -|
                if (game.bld.get('steamworks').val != 0) {
                    game.bld.get('steamworks').on = game.bld.get('steamworks').val;
                    game.bld.get('steamworks').isAutomationEnabled = false;
                    return true;
                } else {
                    return false;
                }

            case 'policy': // -|
                var policies = [
                    'liberty', 'republic', 'liberalism',
                    'diplomacy', 'culturalExchange', 'zebraRelationsBellicosity',
                    'outerSpaceTreaty', 'expansionism', 'necrocracy',
                    'epicurianism', 'mysticism',
                    'environmentalism', 'conservation',
                ];
                return this.singleTech(game.libraryTab.policyPanel.children, policies);

            case 'trade-zebras': // -|
                var zebraPanel = game.diplomacyTab?.racePanels?.find((panel) => panel.race.name=='zebras');
                if (!zebraPanel) return false;
                var button = zebraPanel.embassyButton;
                while (button.model.enabled) {
                    button.controller.buyItem(button.model, {}, function(result) {
                        if (result) {
                            button.update();
                        }
                    });
                }
                this.model.auto.embassy = true;
                this.model.auto.trade = true;
                return true;

            case 'pop-max-cath': // -> pop-max-space
                var cathKittens = game.resPool.get('kittens');
                if (cathKittens.value == cathKittens.maxValue) {
                    this.model.cathBuildings.magneto.enabled = false; // conserve alloy for stations
                    this.model.spaceBuildings.spaceStation.enabled = true;
                    this.model.auto.religion = false; // start accumulating faith
                    this.model.auto.praise = false;
                    this.state.push('pop-max-space');
                    return true;
                }
                return false;

            case 'pop-max-space': // -> endgame-stockpile
                var spaceKittens = game.resPool.get('kittens');
                // We want more than five space stations, but once we have a few,
                // we will build them faster than we fill them. Just need to
                // prime the pump
                if (spaceKittens.value >= spaceKittens.maxValue
                    && game.bld.get('chronosphere').val >= 5
                    && game.space.getBuilding('spaceStation').val >= 5
                    && game.workshop.get('fluxCondensator').researched) {
                    // disable auto tech,
                    for (const auto in this.model.auto) {
                        if (auto != 'play') this.model.auto[auto] = false;
                        game.time.isAccelerated = false;
                    }
                    this.state.push('endgame-stockpile');
                    return true;
                }
                return false;

            case 'endgame-stockpile': // -> endgame-reset!
                // wait for culture to cap, this usually doesn't take long, but
                // gives us enough time to hoard resources for the reset
                var culture = game.resPool.get('culture');
                if (culture.value >= culture.maxValue) {
                    this.reset();
                    return true;
                }
                return false;

            default:
                this.model.auto.play = false;
                console.log(`CRITICAL: unrecognized state ${action}`);
                game.msg(`CRITICAL: unrecognized state ${action}`);
                return true; // to cause refresh
        }
    }

    hoglaHunt(action) {
        var resourceFraction = 0.001;
        var unobtainiumFraction = 0.10;
        var maxFields = 100;
        var maxChronospheres = 78;

        /* Plan:
         *   1. run science/workshop up to standards
         *   2. build housing and craft ratio
         *   3. when upgrades are in, start hunting
         *   4. craft BPs and build CSes
         * Notes:
         *   We carry over a little over 10k parchment, 5k for Drama, 5k for the festival, 250 for the Chapel, no slack.
         */
        switch (action) {
            case 'init': // -> build-start, solar-start, hunt-start
                this.model.auto.assign = true;
                this.model.auto.craft = true;
                this.model.auto.party = true;
                this.model.auto.research = true;
                this.model.auto.workshop = true;
                this.model.minor.conserveExotic = true;
                this.model.minor.partyLimit = 1;
                this.model.option.assign = 'hunter';
                this.model.option.book = 'default';
                this.model.option.minSecResRatio = 0.01;
                this.state.push('build-start');
                this.state.push('solar-start');
                this.state.push('hunt-start');
                game.ui.activeTabId = 'Bonfire';
                game.render();
                return true;

            case 'build-start': // -> build-end
                var buildings = [ 'field', 'logHouse', 'mansion', 'factory', 'workshop', 'zebraOutpost' ];
                for (const bname of buildings) {
                    let limit = this.buildingCount(bname, 'all', resourceFraction);
                    if (limit) { // important because limit == 0 means unlimited
                        this.model.cathBuildings[bname].enabled = true;
                        this.model.cathBuildings[bname].limit = limit;
                    }
                }
                if (this.model.cathBuildings['field'].limit > maxFields) {
                    this.model.cathBuildings['field'].limit = maxFields;
                }
                this.model.auto.build = true;
                this.state.push('build-end');
                return true;

            case 'build-end': // -|
                var requiredWorkshop = ['ironwood', 'concreteHuts', 'unobtainiumHuts', 'eludiumHuts'];
                for (const upgrade of requiredWorkshop) {
                    if (! game.workshop.get(upgrade).researched) return false;
                }
                this.model.cathBuildings['hut'].enabled = true;
                this.model.cathBuildings['hut'].limit = this.buildingCount('hut', 'all', resourceFraction);
                return true;

            case 'solar-start': // -> solar-end, craft-start
                if (this.singleBuild(game.bldTab.buttons, 'chapel')) {
                    this.state.push('solar-end');
                    this.state.push('craft-start');
                    return true;
                }
                return false;

            case 'solar-end': // -|
                if (this.singleTech(game.religionTab.rUpgradeButtons, ['solarRevolution'])) {
                    return true;
                }
                return false;

            case 'craft-start': // -|
                if (game.calendar.festivalDays > 0
                        && this.model.cathBuildings['hut'].enabled
                        && this.model.auto.hunt) {
                    this.model.option.book = 'blueprint';
                    return true;
                }
                return false;

            case 'hunt-start': // -> hunt-end
                if (game.getEffect('hunterRatio') > 4) { // max is 4.5, but 4 is enough to get started.
                    this.model.auto.hunt = true;
                    this.model.cathBuildings['chronosphere'].enabled = true;
                    this.model.cathBuildings['chronosphere'].limit = Math.min(maxChronospheres,
                        this.buildingCount('chronosphere', 'unobtainium', unobtainiumFraction));
                    this.state.push('hunt-end');
                    return true;
                }
                return false;

            case 'hunt-end': // -> paper-blueprint
                if (game.bld.get('chronosphere').val >= this.model.cathBuildings['chronosphere'].limit
                        && game.workshop.get('fluxCondensator').researched) {
                    this.model.auto.build = false;
                    this.state.push('paper-blueprint');
                    return true;
                }
                return false;

            case 'paper-blueprint': // -> paper-compedium
                if (game.resPool.get('blueprint').value < 10000) return false; // 10k is near the asymptote for carried-over crafted resources
                this.model.option.book = 'compedium';
                this.state.push('paper-compedium');
                return true;

            case 'paper-compedium': // -> paper-manuscript
                if (game.resPool.get('compedium').value < 10000) return false;
                this.model.option.book = 'manuscript';
                this.state.push('paper-manuscript');
                return true;

            case 'paper-manuscript': // -> paper-parchment
                if (game.resPool.get('manuscript').value < 10000) return false;
                this.model.option.book = 'parchment';
                this.state.push('paper-parchment');
                return true;

            case 'paper-parchment': // -> endgame-reset!
                if (game.resPool.get('parchment').value < 10000) return false;
                this.model.option.book = 'default';
                this.model.auto.craft = false;
                this.model.auto.hunt = false;
                this.state.push('endgame-stockpile');
                return true;

            case 'endgame-stockpile': // -> endgame-reset!
                var manpower = game.resPool.get('manpower');
                if (manpower.value >= manpower.maxValue) {
                    this.reset();
                    return true;
                }
                return false;

            default:
                this.model.auto.play = false;
                console.log(`CRITICAL: unrecognized state ${action}`);
                game.msg(`CRITICAL: unrecognized state ${action}`);
                return true; // to cause refresh
        }
    }

    doReset(action) {
        switch (action) {
            case 'init': // |-> cooldown
                // disable all automation except craft, and use up chronoheat
                for (const auto in this.model.auto) this.model.auto[auto] = false;
                this.model.auto.craft = true;
                this.model.auto.play = true;
                game.time.isAccelerated = false;
                this.state.push('cooldown');
                return true;

            case 'cooldown': // |-> ensure-relics
                if (game.time.getCFU('blastFurnace').heat >= 100) {
                    game.time.getCFU('blastFurnace').isAutomationEnabled = true; // spend chronoheat
                    return false;
                }
                this.reset();
                return true;

            default:
                this.model.auto.play = false;
                console.log(`CRITICAL: unrecognized state ${action}`);
                game.msg(`CRITICAL: unrecognized state ${action}`);
                return true; // to cause refresh
        }
    }
};

var sk;
if (game && game.bld) {
    sk = new SK();
    game.sk = sk;
} else { // we were loaded before the game was, wait for it.
    dojo.subscribe('game/start', function() {
        sk = new SK();
        game.sk = sk;
    });
}

// function res(rn)          { return game.resPool.get(rn); }
//
// function resPerTick(rn)   { return game.getResourcePerTick(rn); }
//
// function resValue(rn)     { return res(rn).value; }
//
// function resNextValue(rn) { return resValue(rn) + resPerTick(rn); }
//
// const goldPerTrade = 15;
