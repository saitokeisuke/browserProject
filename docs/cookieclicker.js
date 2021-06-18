
//const fs = require('fs')

function isArray (item) {
    return Object.prototype.toString.call(item) === '[object Array]';
  }
function isObject (item) {
return typeof item === 'object' && item !== null && !isArray(item);
}

/*function b64_to_utf8( str ) {
    d = new Buffer.from(str, 'base64');
    return d.toString('utf8');
}*/
let b64_to_utf8 = function(str) {
    //console.log(str)
    return decodeURIComponent(escape(atob(str)));
}
let lumptype = ['Normal','Bifurcated','Golden','Meaty','Caramelized']
Game = {}
Game.CountsAsAchievementOwned = ()=>{}
Game.CountsAsUpgradeOwned = ()=>{}
Game.bounds={right:5*document.documentElement.clientWidth,left:0,top:32,bottom:5*document.documentElement.clientHeight-32}
Game.permanentUpgrades = []
Game.buffTypes = []
Game.modSaveData = {}
Game.Objects = {}
Game.Objects['Cursor'] = {}
Game.Objects['Grandma'] = {}
BeautifyAll = function(){}
Game.LoadMinigames = function(){}
Game.killBuffs = function(){}
Game.ResetWrinklers = function(){}
Game.safeLoadString=function(str)
{
    //str=str.replaceAll('[P]','|');
    //str=str.replaceAll('[S]',';');
    return str;
}
Game.LoadWrinklers = function(){}
Game.Has = function(){return true}
Game.computeSeasonPrices = function(){}
Game.HowMuchPrestige = function(){return 1}
Game.loadModData = function(){}
Game.addClass = function(){}
Game.CalculateGains = function(){}
Game.auraMult = function(){return 0}
Game.canLumps=function()//grammatically pleasing function name
{
    if (Game.lumpsTotal>-1 || (Game.ascensionMode!=1 && (Game.cookiesEarned+Game.cookiesReset)>=1000000000)) return true;
    return false;
}
Game.computeLumpTimes=function()
{
    var hour=1000*60*60;
    Game.lumpMatureAge=hour*20;
    Game.lumpRipeAge=hour*23;
    if (Game.Has('Stevia Caelestis')) Game.lumpRipeAge-=hour;
    if (Game.Has('Diabetica Daemonicus')) Game.lumpMatureAge-=hour;
    if (Game.Has('Ichor syrup')) Game.lumpMatureAge-=1000*60*7;
    if (Game.Has('Sugar aging process')) Game.lumpRipeAge-=6000*Math.min(600,Game.Objects['Grandma'].amount);//capped at 600 grandmas
    if (Game.hasGod && Game.BuildingsOwned%10==0)
    {
        var godLvl=Game.hasGod('order');
        if (godLvl==1) Game.lumpRipeAge-=hour;
        else if (godLvl==2) Game.lumpRipeAge-=(hour/3)*2;
        else if (godLvl==3) Game.lumpRipeAge-=(hour/3);
    }
    //if (Game.hasAura('Dragon\'s Curve')) {Game.lumpMatureAge/=1.05;Game.lumpRipeAge/=1.05;}
    Game.lumpMatureAge/=1+Game.auraMult('Dragon\'s Curve')*0.05;Game.lumpRipeAge/=1+Game.auraMult('Dragon\'s Curve')*0.05;
    Game.lumpOverripeAge=Game.lumpRipeAge+hour;
    if (Game.Has('Glucose-charged air')) {Game.lumpMatureAge/=2000;Game.lumpRipeAge/=2000;Game.lumpOverripeAge/=2000;}
}
Game.loadLumps=function(time)
{
    Game.computeLumpTimes();
    //Game.computeLumpType();
    if (!Game.canLumps()) Game.removeClass('lumpsOn');
    else
    {
        if (Game.ascensionMode!=1) Game.addClass('lumpsOn');
        Game.lumpT=Math.min(Date.now(),Game.lumpT);
        var age=Math.max(Date.now()-Game.lumpT,0);
        var amount=Math.floor(age/Game.lumpOverripeAge);//how many lumps did we harvest since we closed the game?
        if (amount>=1)
        {
            Game.harvestLumps(1,true);
            Game.lumpCurrentType=0;//all offline lumps after the first one have a normal type
            if (amount>1) Game.harvestLumps(amount-1,true);
            if (Game.prefs.popups) Game.Popup('Harvested '+Beautify(amount)+' sugar lump'+(amount==1?'':'s')+' while you were away');
            else Game.Notify('','You harvested <b>'+Beautify(amount)+'</b> sugar lump'+(amount==1?'':'s')+' while you were away.',[29,14]);
            Game.lumpT=Date.now()-(age-amount*Game.lumpOverripeAge);
            Game.computeLumpType();
        }
    }
}
Game.bakeryNameRefresh = function(){}
Game.RebuildUpgrades = function(){}
Game.killShimmers = function(){}
Game.Popup = console.log
Game.Notify = console.log
Game.Prompt = console.log
Game.prefs = {}
Game.ObjectsById = []
for (let i = 0;i < 18;i++){
    Game.ObjectsById[i] = {}
}
Game.AchievementsById = []
for (let i = 0;i < 538;i++){
    Game.AchievementsById[i] = {}
}
Game.UpgradesById = []
for (let i = 0;i < 729;i++) {
    Game.UpgradesById[i] = {}
}
Game.LoadSave=function(data)
{
    var str='';
    if (data) {
        str=unescape(data);
    }
    if (str!='')
    {
        var version=0;
        var oldstr=str.split('|');
        if (oldstr[0]<1) {}
        else
        {
            str=str.split('!END!')[0];
            str=b64_to_utf8(str);
        }
        if (str!='')
        {
            var spl='';
            str=str.split('|');
            version=parseFloat(str[0]);

            if (isNaN(version) || str.length<5)
            {
                if (Game.prefs.popups) Game.Popup('Oops, looks like the import string is all wrong!');
                else Game.Notify('Error importing save','Oops, looks like the import string is all wrong!','',6,1);
                return false;
            }
            if (version>=1 && version>Game.version)
            {
                if (Game.prefs.popups) Game.Popup('Error : you are attempting to load a save from a future version (v. '+version+'; you are using v. '+Game.version+').');
                else Game.Notify('Error importing save','You are attempting to load a save from a future version (v. '+version+'; you are using v. '+Game.version+').','',6,1);
                return false;
            }
            if (version==1.0501)//prompt if we loaded from the 2014 beta
            {
                setTimeout(function(){Game.Prompt('<h3>New beta</h3><div class="block">Hey there! Unfortunately, your old beta save won\'t work here anymore; you\'ll have to start fresh or import your save from the live version.<div class="line"></div>Thank you for beta-testing Cookie Clicker, we hope you\'ll enjoy it and find strange and interesting bugs!</div>',[['Alright then!','Game.ClosePrompt();']]);},200);
                return false;
            }
            else if (version<1.0501)//prompt if we loaded from the 2014 live version
            {
                setTimeout(function(){Game.Prompt('<h3>Update</h3><div class="block"><b>Hey there!</b> Cookie Clicker just received a pretty substantial update, and you might notice that some things have been moved around. Don\'t panic!<div class="line"></div>Your building numbers may look strange, making it seem like you own buildings you\'ve never bought; this is because we\'ve added <b>3 new buildings</b> after factories (and swapped mines and factories), offsetting everything after them. Likewise, some building-related upgrades and achievements may look a tad shuffled around. This is all perfectly normal!<div class="line"></div>We\'ve also rebalanced Heavenly Chips amounts and behavior. Your amount of chips might be lower or higher than before.<br>You can now ascend through the <b>Legacy button</b> at the top!<div class="line"></div>Thank you for playing Cookie Clicker. We\'ve put a lot of work and care into this update and we hope you\'ll enjoy it!</div>',[['Neat!','Game.ClosePrompt();']]);},200);
            }
            if (version>=1)
            {
                Game.T=0;

                spl=str[2].split(';');//save stats
                Game.startDate=parseInt(spl[0]);
                Game.fullDate=parseInt(spl[1]);
                Game.lastDate=parseInt(spl[2]);
                //Game.bakeryNameSet(spl[3]?spl[3]:Game.GetBakeryName());
                Game.seed=spl[4]?spl[4]:Game.makeSeed();
                //prefs
                if (version<1.0503) spl=str[3].split('');
                else if (version<2.0046) spl=unpack2(str[3]).split('');
                else spl=(str[3]).split('');
                Game.prefs.particles=parseInt(spl[0]);
                Game.prefs.numbers=parseInt(spl[1]);
                Game.prefs.autosave=parseInt(spl[2]);
                Game.prefs.autoupdate=spl[3]?parseInt(spl[3]):1;
                Game.prefs.milk=spl[4]?parseInt(spl[4]):1;
                //Game.prefs.fancy=parseInt(spl[5]);if (Game.prefs.fancy) Game.removeClass('noFancy'); else if (!Game.prefs.fancy) Game.addClass('noFancy');
                Game.prefs.warn=spl[6]?parseInt(spl[6]):0;
                Game.prefs.cursors=spl[7]?parseInt(spl[7]):0;
                Game.prefs.focus=spl[8]?parseInt(spl[8]):0;
                Game.prefs.format=spl[9]?parseInt(spl[9]):0;
                Game.prefs.notifs=spl[10]?parseInt(spl[10]):0;
                Game.prefs.wobbly=spl[11]?parseInt(spl[11]):0;
                Game.prefs.monospace=spl[12]?parseInt(spl[12]):0;
                //Game.prefs.filters=parseInt(spl[13]);if (Game.prefs.filters) Game.removeClass('noFilters'); else if (!Game.prefs.filters) Game.addClass('noFilters');
                Game.prefs.cookiesound=spl[14]?parseInt(spl[14]):1;
                Game.prefs.crates=spl[15]?parseInt(spl[15]):0;
                Game.prefs.showBackupWarning=spl[16]?parseInt(spl[16]):1;
                //Game.prefs.extraButtons=spl[17]?parseInt(spl[17]):1;if (!Game.prefs.extraButtons) Game.removeClass('extraButtons'); else if (Game.prefs.extraButtons) Game.addClass('extraButtons');
                Game.prefs.askLumps=spl[18]?parseInt(spl[18]):0;
                Game.prefs.customGrandmas=spl[19]?parseInt(spl[19]):1;
                Game.prefs.timeout=spl[20]?parseInt(spl[20]):0;
                BeautifyAll();
                spl=str[4].split(';');//cookies and lots of other stuff
                Game.cookies=parseFloat(spl[0]);
                Game.cookiesEarned=parseFloat(spl[1]);
                Game.cookieClicks=spl[2]?parseInt(spl[2]):0;
                Game.goldenClicks=spl[3]?parseInt(spl[3]):0;
                Game.handmadeCookies=spl[4]?parseFloat(spl[4]):0;
                Game.missedGoldenClicks=spl[5]?parseInt(spl[5]):0;
                Game.bgType=spl[6]?parseInt(spl[6]):0;
                Game.milkType=spl[7]?parseInt(spl[7]):0;
                Game.cookiesReset=spl[8]?parseFloat(spl[8]):0;
                Game.elderWrath=spl[9]?parseInt(spl[9]):0;
                Game.pledges=spl[10]?parseInt(spl[10]):0;
                Game.pledgeT=spl[11]?parseInt(spl[11]):0;
                Game.nextResearch=spl[12]?parseInt(spl[12]):0;
                Game.researchT=spl[13]?parseInt(spl[13]):0;
                Game.resets=spl[14]?parseInt(spl[14]):0;
                Game.goldenClicksLocal=spl[15]?parseInt(spl[15]):0;
                Game.cookiesSucked=spl[16]?parseFloat(spl[16]):0;
                Game.wrinklersPopped=spl[17]?parseInt(spl[17]):0;
                Game.santaLevel=spl[18]?parseInt(spl[18]):0;
                Game.reindeerClicked=spl[19]?parseInt(spl[19]):0;
                Game.seasonT=spl[20]?parseInt(spl[20]):0;
                Game.seasonUses=spl[21]?parseInt(spl[21]):0;
                Game.season=spl[22]?spl[22]:Game.baseSeason;
                var wrinklers={amount:spl[23]?parseFloat(spl[23]):0,number:spl[24]?parseInt(spl[24]):0};
                Game.prestige=spl[25]?parseFloat(spl[25]):0;
                Game.heavenlyChips=spl[26]?parseFloat(spl[26]):0;
                Game.heavenlyChipsSpent=spl[27]?parseFloat(spl[27]):0;
                Game.heavenlyCookies=spl[28]?parseFloat(spl[28]):0;
                Game.ascensionMode=spl[29]?parseInt(spl[29]):0;
                Game.permanentUpgrades[0]=spl[30]?parseInt(spl[30]):-1;Game.permanentUpgrades[1]=spl[31]?parseInt(spl[31]):-1;Game.permanentUpgrades[2]=spl[32]?parseInt(spl[32]):-1;Game.permanentUpgrades[3]=spl[33]?parseInt(spl[33]):-1;Game.permanentUpgrades[4]=spl[34]?parseInt(spl[34]):-1;
                //if (version<1.05) {Game.heavenlyChipsEarned=Game.HowMuchPrestige(Game.cookiesReset);Game.heavenlyChips=Game.heavenlyChipsEarned;}
                Game.dragonLevel=spl[35]?parseInt(spl[35]):0;
                if (version<2.0041 && Game.dragonLevel==Game.dragonLevels.length-2) {Game.dragonLevel=Game.dragonLevels.length-1;}
                Game.dragonAura=spl[36]?parseInt(spl[36]):0;
                Game.dragonAura2=spl[37]?parseInt(spl[37]):0;
                Game.chimeType=spl[38]?parseInt(spl[38]):0;
                Game.volume=spl[39]?parseInt(spl[39]):50;
                wrinklers.shinies=spl[40]?parseInt(spl[40]):0;
                wrinklers.amountShinies=spl[41]?parseFloat(spl[41]):0;
                Game.lumps=spl[42]?parseFloat(spl[42]):-1;
                Game.lumpsTotal=spl[43]?parseFloat(spl[43]):-1;
                Game.lumpT=spl[44]?parseInt(spl[44]):Date.now();
                Game.lumpRefill=spl[45]?parseInt(spl[45]):0;
                if (version<2.022) Game.lumpRefill=Game.fps*60;
                Game.lumpCurrentType=spl[46]?parseInt(spl[46]):0;
                Game.vault=spl[47]?spl[47].split(','):[];
                    for (var i in Game.vault){Game.vault[i]=parseInt(Game.vault[i]);}
                var actualHeralds=Game.heralds;//we store the actual amount of heralds to restore it later; here we used the amount present in the save to compute offline CpS
                Game.heralds=spl[48]?parseInt(spl[48]):Game.heralds;
                Game.fortuneGC=spl[49]?parseInt(spl[49]):0;
                Game.fortuneCPS=spl[50]?parseInt(spl[50]):0;
                Game.cookiesPsRawHighest=spl[51]?parseFloat(spl[51]):0;

                spl=str[5].split(';');//buildings
                Game.BuildingsOwned=0;
                for (var i in Game.ObjectsById)
                {
                    var me=Game.ObjectsById[i];
                    //me.switchMinigame(false);
                    me.pics=[];
                    if (spl[i])
                    {
                        var mestr=spl[i].toString().split(',');
                        me.amount=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);me.totalCookies=parseFloat(mestr[2]);me.level=parseInt(mestr[3]||0);me.highest=(version>=2.024?parseInt(mestr[6]):me.amount);
                        if (me.minigame && me.minigameLoaded && me.minigame.reset) {me.minigame.reset(true);me.minigame.load(mestr[4]||'');} else me.minigameSave=(mestr[4]||0);
                        me.muted=parseInt(mestr[5])||0;
                        Game.BuildingsOwned+=me.amount;
                        if (version<2.003) me.level=0;
                    }
                    else
                    {
                        me.amount=0;me.unlocked=0;me.bought=0;me.highest=0;me.totalCookies=0;me.level=0;
                    }
                    if (i == 7) {
                        me.switchMinigame = () => {}
                        let M = {}
                        M.computeMagicM = () => {
                            var towers=Math.max(me.amount,1);
                            var lvl=Math.max(me.level,1);
                            M.magicM=Math.floor(4+Math.pow(towers,0.6)+Math.log((towers+(lvl-1)*10)/15+1)*15);
                            //old formula :
                            /*
                            M.magicM=8+Math.min(M.parent.amount,M.parent.level*5)+Math.ceil(M.parent.amount/10);
                            if (M.magicM>200)
                            {
                                //diminishing returns starting at 200, being 5% as fast by 400
                                var x=M.magicM;
                                var top=x-200;
                                top/=200;
                                var top2=top;
                                top*=(1-top/2);
                                if (top2>=1) top=0.5;
                                top=top*0.95+top2*0.05;
                                top*=200;
                                x=top+200;
                                M.magicM=x;
                            }
                            */
                            M.magic=Math.min(M.magicM,M.magic);
                        }
                        let load=function(str)
                        {
                            //interpret str; called after .init
                            //note : not actually called in the Game's load; see "minigameSave" in main.js
                            if (!str) return false;
                            var i=0;
                            var spl=str.split(' ');
                            M.computeMagicM();
                            M.magic=parseFloat(spl[i++]||M.magicM);
                            M.spellsCast=parseInt(spl[i++]||0);
                            M.spellsCastTotal=parseInt(spl[i++]||0);
                            var on=parseInt(spl[i++]||0);if (on && Game.ascensionMode!=1) me.switchMinigame(1);
                        }
                        load(me.minigameSave)
                        me.M = M
                    }
                }

                Game.LoadMinigames();

                if (version<1.035)//old non-binary algorithm
                {
                    spl=str[6].split(';');//upgrades
                    Game.UpgradesOwned=0;
                    for (var i in Game.UpgradesById)
                    {
                        var me=Game.UpgradesById[i];
                        if (spl[i])
                        {
                            var mestr=spl[i].split(',');
                            me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
                            if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
                        }
                        else
                        {
                            me.unlocked=0;me.bought=0;
                        }
                    }
                    if (str[7]) spl=str[7].split(';'); else spl=[];//achievements
                    Game.AchievementsOwned=0;
                    for (var i in Game.AchievementsById)
                    {
                        var me=Game.AchievementsById[i];
                        if (spl[i])
                        {
                            var mestr=spl[i].split(',');
                            me.won=parseInt(mestr[0]);
                        }
                        else
                        {
                            me.won=0;
                        }
                        if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
                    }
                }
                else if (version<1.0502)//old awful packing system
                {
                    if (str[6]) spl=str[6]; else spl=[];//upgrades
                    if (version<1.05) spl=UncompressLargeBin(spl);
                    else spl=unpack(spl);
                    Game.UpgradesOwned=0;
                    for (var i in Game.UpgradesById)
                    {
                        var me=Game.UpgradesById[i];
                        if (spl[i*2])
                        {
                            var mestr=[spl[i*2],spl[i*2+1]];
                            me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
                            if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
                        }
                        else
                        {
                            me.unlocked=0;me.bought=0;
                        }
                    }
                    if (str[7]) spl=str[7]; else spl=[];//achievements
                    if (version<1.05) spl=UncompressLargeBin(spl);
                    else spl=unpack(spl);
                    Game.AchievementsOwned=0;
                    for (var i in Game.AchievementsById)
                    {
                        var me=Game.AchievementsById[i];
                        if (spl[i])
                        {
                            var mestr=[spl[i]];
                            me.won=parseInt(mestr[0]);
                        }
                        else
                        {
                            me.won=0;
                        }
                        if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
                    }
                }
                else
                {
                    if (str[6]) spl=str[6]; else spl=[];//upgrades
                    if (version<2.0046) spl=unpack2(spl).split('');
                    else spl=(spl).split('');
                    Game.UpgradesOwned=0;
                    for (var i in Game.UpgradesById)
                    {
                        var me=Game.UpgradesById[i];
                        if (spl[i*2])
                        {
                            var mestr=[spl[i*2],spl[i*2+1]];
                            me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
                            if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
                        }
                        else
                        {
                            me.unlocked=0;me.bought=0;
                        }
                    }
                    if (str[7]) spl=str[7]; else spl=[];//achievements
                    if (version<2.0046) spl=unpack2(spl).split('');
                    else spl=(spl).split('');
                    Game.AchievementsOwned=0;
                    for (var i in Game.AchievementsById)
                    {
                        var me=Game.AchievementsById[i];
                        if (spl[i])
                        {
                            var mestr=[spl[i]];
                            me.won=parseInt(mestr[0]);
                        }
                        else
                        {
                            me.won=0;
                        }
                        if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
                    }
                }

                Game.killBuffs();
                var buffsToLoad=[];
                spl=(str[8]||'').split(';');//buffs
                for (var i in spl)
                {
                    if (spl[i])
                    {
                        var mestr=spl[i].toString().split(',');
                        buffsToLoad.push(mestr);
                    }
                }


                spl=(str[9]||'').split(';');//mod data

                for (var i in spl)
                {
                    if (spl[i])
                    {
                        var data=spl[i].split(':');
                        var modId=data[0];
                        data.shift();
                        data=Game.safeLoadString(data.join(':'));
                        Game.modSaveData[modId]=data;
                    }
                }

                for (var i in Game.ObjectsById)
                {
                    var me=Game.ObjectsById[i];
                    if (me.buyFunction) me.buyFunction();
                    //me.refresh();
                    if (me.id>0)
                    {
                        if (me.muted) me.mute(1);
                    }
                }

                if (version<1.0503)//upgrades that used to be regular, but are now heavenly
                {
                    var me=Game.Upgrades['Persistent memory'];me.unlocked=0;me.bought=0;
                    var me=Game.Upgrades['Season switcher'];me.unlocked=0;me.bought=0;
                }

                if (Game.bgType==-1) Game.bgType=0;
                if (Game.milkType==-1) Game.milkType=0;


                //advance timers
                var framesElapsed=Math.ceil(((Date.now()-Game.lastDate)/1000)*Game.fps);
                if (Game.pledgeT>0) Game.pledgeT=Math.max(Game.pledgeT-framesElapsed,1);
                if (Game.seasonT>0) Game.seasonT=Math.max(Game.seasonT-framesElapsed,1);
                if (Game.researchT>0) Game.researchT=Math.max(Game.researchT-framesElapsed,1);


                Game.ResetWrinklers();
                Game.LoadWrinklers(wrinklers.amount,wrinklers.number,wrinklers.shinies,wrinklers.amountShinies);

                //recompute season trigger prices
                if (Game.Has('Season switcher')) {for (var i in Game.seasons) {Game.Unlock(Game.seasons[i].trigger);}}
                Game.computeSeasonPrices();

                //recompute prestige
                Game.prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset));
                //if ((Game.heavenlyChips+Game.heavenlyChipsSpent)<Game.prestige)
                //{Game.heavenlyChips=Game.prestige;Game.heavenlyChipsSpent=0;}//chips owned and spent don't add up to total prestige? set chips owned to prestige


                Game.loadModData();


                if (version==1.037 && Game.beta)//are we opening the new beta? if so, save the old beta to /betadungeons
                {
                    window.localStorage.setItem('CookieClickerGameBetaDungeons',window.localStorage.getItem('CookieClickerGameBeta'));
                    Game.Notify('Beta save data','Your beta save data has been safely exported to /betadungeons.',20);
                }
                else if (version==1.0501 && Game.beta)//are we opening the newer beta? if so, save the old beta to /oldbeta
                {
                    window.localStorage.setItem('CookieClickerGameOld',window.localStorage.getItem('CookieClickerGameBeta'));
                    //Game.Notify('Beta save data','Your beta save data has been safely exported to /oldbeta.',20);
                }
                if (version<=1.0466 && !Game.beta)//export the old 2014 version to /v10466
                {
                    window.localStorage.setItem('CookieClickerGamev10466',window.localStorage.getItem('CookieClickerGame'));
                    //Game.Notify('Beta save data','Your save data has been safely exported to /v10466.',20);
                }
                if (version==1.9)//are we importing from the 1.9 beta? remove all heavenly upgrades and refund heavenly chips
                {
                    for (var i in Game.UpgradesById)
                    {
                        var me=Game.UpgradesById[i];
                        if (me.bought && me.pool=='prestige')
                        {
                            me.unlocked=0;
                            me.bought=0;
                        }
                    }
                    Game.heavenlyChips=Game.prestige;
                    Game.heavenlyChipsSpent=0;

                    setTimeout(function(){Game.Prompt('<h3>Beta patch</h3><div class="block">We\'ve tweaked some things and fixed some others, please check the update notes!<div class="line"></div>Of note : due to changes in prestige balancing, all your heavenly upgrades have been removed and your heavenly chips refunded; you\'ll be able to reallocate them next time you ascend.<div class="line"></div>Thank you again for beta-testing Cookie Clicker!</div>',[['Alright then!','Game.ClosePrompt();']]);},200);
                }
                if (version<=1.0466)//are we loading from the old live version? reset HCs
                {
                    Game.heavenlyChips=Game.prestige;
                    Game.heavenlyChipsSpent=0;
                }

                if (Game.ascensionMode!=1)
                {
                    if (Game.Has('Starter kit')) Game.Objects['Cursor'].free=10;
                    if (Game.Has('Starter kitchen')) Game.Objects['Grandma'].free=5;
                }

                Game.CalculateGains();

                var timeOffline=(Date.now()-Game.lastDate)/1000;

                if (Math.random()<1/10000) Game.TOYS=1;//teehee!

                //compute cookies earned while the game was closed
                if (Game.mobile || Game.Has('Perfect idling') || Game.Has('Twin Gates of Transcendence'))
                {
                    if (Game.Has('Perfect idling'))
                    {
                        var maxTime=60*60*24*1000000000;
                        var percent=100;
                    }
                    else
                    {
                        var maxTime=60*60;
                        if (Game.Has('Belphegor')) maxTime*=2;
                        if (Game.Has('Mammon')) maxTime*=2;
                        if (Game.Has('Abaddon')) maxTime*=2;
                        if (Game.Has('Satan')) maxTime*=2;
                        if (Game.Has('Asmodeus')) maxTime*=2;
                        if (Game.Has('Beelzebub')) maxTime*=2;
                        if (Game.Has('Lucifer')) maxTime*=2;

                        var percent=5;
                        if (Game.Has('Angels')) percent+=10;
                        if (Game.Has('Archangels')) percent+=10;
                        if (Game.Has('Virtues')) percent+=10;
                        if (Game.Has('Dominions')) percent+=10;
                        if (Game.Has('Cherubim')) percent+=10;
                        if (Game.Has('Seraphim')) percent+=10;
                        if (Game.Has('God')) percent+=10;

                        if (Game.Has('Chimera')) {maxTime+=60*60*24*2;percent+=5;}

                        if (Game.Has('Fern tea')) percent+=3;
                        if (Game.Has('Ichor syrup')) percent+=7;
                        if (Game.Has('Fortune #102')) percent+=1;
                    }

                    var timeOfflineOptimal=Math.min(timeOffline,maxTime);
                    var timeOfflineReduced=Math.max(0,timeOffline-timeOfflineOptimal);
                    var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);

                    if (amount>0)
                    {
                        if (Game.prefs.popups) Game.Popup('Earned '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s')+' while you were away');
                        else Game.Notify('Welcome back!','You earned <b>'+Beautify(amount)+'</b> cookie'+(Math.floor(amount)==1?'':'s')+' while you were away.<br>('+Game.sayTime(timeOfflineOptimal*Game.fps,-1)+' at '+Math.floor(percent)+'% CpS'+(timeOfflineReduced?', plus '+Game.sayTime(timeOfflineReduced*Game.fps,-1)+' at '+(Math.floor(percent*10)/100)+'%':'')+'.)',[Math.floor(Math.random()*16),11]);
                        Game.Earn(amount);
                    }
                }

                //we load buffs after everything as we do not want them to interfer with offline CpS
                /*for (var i in buffsToLoad)
                {
                    var mestr=buffsToLoad[i];
                    var type=Game.buffTypes[parseInt(mestr[0])];
                    Game.gainBuff(type.name,parseFloat(mestr[1])/Game.fps,parseFloat(mestr[3]||0),parseFloat(mestr[4]||0),parseFloat(mestr[5]||0)).time=parseFloat(mestr[2]);
                }*/


                Game.loadLumps(timeOffline);

                Game.bakeryNameRefresh();

            }
            else//importing old version save
            {
                Game.Notify('Error importing save','Sorry, you can\'t import saves from the old version anymore.','',6,1);
                return false;
            }


            Game.RebuildUpgrades();

            Game.TickerAge=0;
            Game.TickerEffect=0;

            Game.elderWrathD=0;
            Game.recalculateGains=1;
            Game.storeToRefresh=1;
            Game.upgradesToRebuild=1;

            Game.buyBulk=1;Game.buyMode=1;//Game.storeBulkButton(-1);

            Game.specialTab='';
            //Game.ToggleSpecialMenu(0);

            Game.killShimmers();

            if (Game.T>Game.fps*5 && Game.ReincarnateTimer==0)//fade out of black and pop the cookie
            {
                Game.ReincarnateTimer=1;
                Game.addClass('reincarnating');
                Game.BigCookieSize=0;
            }

            if (version<Game.version) l('logButton').classList.add('hasUpdate');

            if (Game.season!='' && Game.season==Game.baseSeason)
            {
                if (Game.season=='valentines') Game.Notify('Valentine\'s Day!','It\'s <b>Valentine\'s season</b>!<br>Love\'s in the air and cookies are just that much sweeter!',[20,3],60*3);
                else if (Game.season=='fools') Game.Notify('Business Day!','It\'s <b>Business season</b>!<br>Don\'t panic! Things are gonna be looking a little more corporate for a few days.',[17,6],60*3);
                else if (Game.season=='halloween') Game.Notify('Halloween!','It\'s <b>Halloween season</b>!<br>Everything is just a little bit spookier!',[13,8],60*3);
                else if (Game.season=='christmas') Game.Notify('Christmas time!','It\'s <b>Christmas season</b>!<br>Bring good cheer to all and you just may get cookies in your stockings!',[12,10],60*3);
                else if (Game.season=='easter') Game.Notify('Easter!','It\'s <b>Easter season</b>!<br>Keep an eye out and you just might click a rabbit or two!',[0,12],60*3);
            }

            Game.heralds=actualHeralds;

            if (Game.prefs.popups) {}//Game.Popup('Game loaded');
            else {}//Game.Notify('Game loaded','','',1,1);

            if (Game.prefs.showBackupWarning==1) Game.showBackupWarning();
        }
    }
    else return false;
    return true;
}

/*Game.LoadSave(
    
    'Mi4wMzF8fDE2MTg1ODU3Mzk0NjA7MTU1MzQ0NDkwMDk3ODsxNjE4NjUxMjUwMDY4O0RJQUwgV09SS1M7aHJsa218MDExMTAwMDAxMTEwMDAxMTAxMDEwfDIuMTE0MjkzMzg5MTg3OTVlKzU5OzEuODgxNzM3NzAyNzk3NTA4NGUrNjE7MjQ3NjY7Mjg4MjQ7MS42NDE2NzU0Mjc0ODM3MmUrNjE7NjQ2MDg7NDswOzkuOTExNjA2Mzg5MTQxNzQyZSs3NzswOzExOzA7MDstMTsxMDA0Ozg0OzEuMjM5MTAyMDI2ODgzMDkxOGUrNTk7NzE7MTQ7Mzg7MjQxNjg0OTs0O2Vhc3RlcjswOzA7OS45NzA0NDgyMTgyOTMwMTllKzIxOzkuOTcwNDQ4MjE2MTA2MTdlKzIxOzIxODY4NTAxODgwOTI7MDswOzUzOzUyOzIyNjs2Mzc7NjQyOzI1OzE4OzE3OzA7NTA7MDswOzEyNDsxMTQ2OzE2MTg1Nzk3MjIxNzQ7MDswOzs0MTswOzE7Ni4xMzU2NTk3NDQwNzYxNjVlKzU0O3w5NDYsMTYyMSw0LjQ5MjA2ODY4ODkyNzYyMzRlKzU3LDEyLCwwLDk0Njs5MjgsMTU4Niw0LjgzMTQyNTIyNzI3Mjk2MTVlKzU4LDEwLCwxLDkyODs5MDUsMTU0MCwxLjkxMDMyNDQ4Nzc5NTIyNTJlKzU0LDEwLDE2MTg2NTEzMTY5OTM6MDoxNjE4NTg1NzM5NDY4OjA6MTI6NDYyODoxOjM6MTYxODU4NTczOTQ2ODogMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMSAwOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDosMCw5MDU7ODg4LDE1MTAsMi4xNzI0NjQ3NjgyMjMwNTdlKzU2LDEwLCwxLDg4ODs4NzIsMTQ3MiwyLjQzNzYwMzE0NTg5NTMwOWUrNTUsMTAsLDEsODcyOzg1NSwxNDQyLDQuNjIxMzQxOTIzOTEyOTE3NGUrNTQsMTAsMDowOjE6MDowOiA0Mzg6NDotODI6MzQ3OjA6MDowITQ3ODE6MToyNjozNjI6MDowOjAhMTkzNjoyOi01NTozNTI6MDowOjAhNDMxNzo1Oi04MToxMjowOjA6MCE4NDk2OjE6NTE6NzAwOjA6MTowITg4Njk6MToyMDo1MDc6MDoxOjAhNzQ4OTowOjE6NzczOjA6MTowITg3MTM6MDotODoyMzQ6MDoxOjAhNzU5NzoyOi0zMjo1MDA6MDoxOjAhMTAwMTI6MjotNDg6ODgwOjA6MTowITk3MDE6MjotMjQ6MTc2OjA6MTowITEwMzYzOjI6LTYxOjQ1NDowOjE6MCExMTk5MzoyOi0zNzoxMTQ6MDoxOjAhMTI1ODU6MjotNDY6MTQ4OjA6MTowITE2NzgwOjE6MjQ6MjUzOjA6MTowITE0NjM5OjI6LTE4OjQyMjowOjE6MCEgMCwwLDg1NTs4MzYsMTQwNSwxLjk2MzYyODgxNDc0NzE3NDdlKzU1LDEwLC0xLy0xLy0xIDMgMTYxODU4NTczOTQ3MCAwLDAsODM2OzgxNiwxMzYzLDUuNDk2NzA3NTg5NzM0MzA0ZSs1NCwxMCwxMjEgMCAzMTUzIDEsMCw4MTY7Nzk2LDE4MzYsMS4zNjM4OTY0Nzc0NDgxMDQ2ZSs1NCwxMCwsMSw3OTY7Nzc3LDE3OTYsNy4xNTg1NTI0NDU5MTQxNjNlKzU0LDEwLCwxLDc3Nzs3NTIsMTc1NSwxLjMxNjk0MjM2NjkxMDAzMTNlKzU3LDEwLCwxLDc1Mjs3MzUsMTcxNywyLjQ2NjA3Njc1MDQwMDA1MWUrNTYsMTAsLDEsNzM1OzcyMCwxNjg1LDIuNjE2MjAxNTY5MTg4MDc0NGUrNTcsMTAsLDEsNzIwOzcwMCwxNjQ1LDEuNTE3MzYxMjY5ODIyMzk5ZSs1OCwxMCwsMSw3MDA7Njk0LDE2MTksMy42MDcxNzE4MDIyMjQwMmUrNTgsMTAsLDEsNjk0OzY4MiwxNTg4LDIuMjY0MDY1NTU4Nzg5MDU5ZSs1OSwyLCwxLDY4Mjs2NTgsMTUyMSw1LjU2ODYxMDg1OTE2NTQ5NGUrNTgsMTAsLDEsNjU4OzYzMCwxNDY1LDMuMzkwODcxMzY5NTk0NzgzNWUrNTksMTAsLDEsNjMwO3wxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTAwMTExMTExMDAxMTEwMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDEwMTAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAxMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMDAwMDExMTExMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTExMTExMTExMDAxMTExMTEwMDAwMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTF8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMXwwLDUzNDAsMjQ0Niw3O3wAADo7%21END%21'

)

Game

lumptype[Game.lumpCurrentType]*/

/*for (let i = 1;i<=100;i++){
    console.log(i)
    let txt = ''
    try{txt = fs.readFileSync('../../Users/saito keisuke/Downloads/DIALWORKSBakery ('+i+').txt','utf-8')}
    catch(err){
        console.log('end')
        break
    }
    Game.LoadSave(txt)
    if(Game.lumpCurrentType == 2 ) {
        console.log(i,lumptype[Game.lumpCurrentType],Game.lumps,txt)
    }
    if(Game.lumpCurrentType == 4 ) {
        console.log(i,lumptype[Game.lumpCurrentType],Game.lumps,txt)
    }
    console.log('\n')
}*/





/*fs.readdir('../../Users/saito keisuke/Downloads', function(err, files){
    if (err) throw err;
    for (let i of files) {
        if (i.slice(0,15)=='DIALWORKSBakery') {
            let txt = ''
            try{txt = fs.readFileSync('../../Users/saito keisuke/Downloads/'+i,'utf-8')}
            catch(err){
                continue
            }
            Game.LoadSave(txt)
            if(Game.lumpCurrentType == 2 ) {
                console.log(i,lumptype[Game.lumpCurrentType],Game.lumps,txt)
            }
            if(Game.lumpCurrentType == 4 ) {
                console.log(i,lumptype[Game.lumpCurrentType],Game.lumps,txt)
            }
        }
    }
    console.log("end")
})*/





//(function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);
function choose(arr) {return arr[Math.floor(Math.random()*arr.length)];}


function check_cookies(spells, season, onsc ,$scope){
		Math.seedrandom($scope.seed+'/'+spells);
		roll = Math.random()
		if (roll<(1 - 0.15 * (onsc + 1))) {
			/* Random is called a few times in setting up the golden cookie */
			if (season=='valentines' || season=='easter')
			{
				Math.random();
			}
            cookie = {}
			cookie.x=Math.floor(Math.random()*Math.max(0,(Game.bounds.right-300)-Game.bounds.left-128)+Game.bounds.left+64)-64;
			cookie.y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-128)+Game.bounds.top+64)-64;
			/**/
			
			var choices=[];
			choices.push('Frenzy','Lucky');
			if (!$scope.dragonflight) choices.push('ClickFrenzy');
			if (Math.random()<0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
			if (Math.random()<0.25) choices.push('Building Special');
			if (Math.random()<0.15) choices=['Cookie Storm Drop'];
			if (Math.random()<0.0001) choices.push('Free Sugar Lump');
			cookie.wrath = false
			cookie.type = choose(choices);
			if(cookie.type == 'Frenzy') cookie.description = "Gives x7 cookie production for 77 seconds.";
			if(cookie.type == 'Lucky') cookie.description = "Gain 13 cookies plus the lesser of 15% of bank or 15 minutes of production.";
			if(cookie.type == 'ClickFrenzy') cookie.description = "Gives x777 cookies per click for 13 seconds.";
			if(cookie.type == 'Blab') cookie.description = "Does nothing but has a funny message.";
			if(cookie.type == 'Cookie Storm') cookie.description = "A massive amount of Golden Cookies appears for 7 seconds, each granting you 1窶�7 minutes worth of cookies.";
			if(cookie.type == 'Cookie Storm Drop') cookie.description = "Gain cookies equal to 1-7 minutes production";
			if(cookie.type == 'Building Special') cookie.description = "Get a variable bonus to cookie production for 30 seconds.";
			if(cookie.type == 'Free Sugar Lump') cookie.description = "Add a free sugar lump to the pool";
			return cookie;
		} else {
			/* Random is called a few times in setting up the golden cookie */
			if (season=='valentines' || season=='easter')
			{
				Math.random();
			}
            cookie = {}
            cookie.x=Math.floor(Math.random()*Math.max(0,(Game.bounds.right-300)-Game.bounds.left-128)+Game.bounds.left+64)-64;
			cookie.y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-128)+Game.bounds.top+64)-64;
			/**/
			
			var choices=[];
			choices.push('Clot','Ruin');
			if (Math.random()<0.1) choices.push('Cursed Finger','ElderFrenzy');
			if (Math.random()<0.003) choices.push('Free Sugar Lump');
			if (Math.random()<0.1) choices=['Blab'];
			cookie.wrath = true
			cookie.type = choose(choices);
			if(cookie.type == 'Clot') cookie.description = "Reduce production by 50% for 66 seconds.";
			if(cookie.type == 'Ruin') cookie.description = "Lose 13 cookies plus the lesser of 5% of bank or 15 minutes of production";
			if(cookie.type == 'Cursed Finger') cookie.description = "Cookie production halted for 10 seconds, but each click is worth 10 seconds of production.";
			if(cookie.type == 'Blab') cookie.description = "Does nothing but has a funny message.";
			if(cookie.type == 'ElderFrenzy') cookie.description = "Gives x666 cookie production for 6 seconds";
			if(cookie.type == 'Free Sugar Lump') cookie.description = "Add a free sugar lump to the pool";
			return cookie;
		}
	}

function check_gambler(spellsCast,$scope) {
    Math.seedrandom($scope.seed + '/' + spellsCast);
    
    spells = [];
    for (var i in $scope.spells){
      if (i != "gambler's fever dream") 
        spells.push($scope.spells[i]);
    }

    var gfdSpell = choose(spells);
    //simplifying the below cause this isn't patched yet afaict and i'll never be playing with diminished ineptitutde backfire
    var gfdBackfire = 0.5; /*M.getFailChance(gfdSpell);
    
    if(FortuneCookie.detectKUGamblerPatch()) gfdBackfire *= 2;
    else gfdBackfire = Math.max(gfdBackfire, 0.5);*/
    
    gamblerSpell = {};
    gamblerSpell.type = gfdSpell.name;   
    gamblerSpell.hasBs = false;
    gamblerSpell.hasEf = false;
    
    Math.seedrandom($scope.seed + '/' + (spellsCast + 1));
    if(Math.random() < (1 - gfdBackfire)){
      gamblerSpell.backfire = false;
      
      if (gfdSpell.name == "Force the Hand of Fate") {
        gamblerSpell.innerCookie1 = check_cookies(spellsCast + 1, '', false, true,$scope);
        gamblerSpell.innerCookie2 = check_cookies(spellsCast + 1, '', true, true,$scope);
        gamblerSpell.innerCookie3 = check_cookies(spellsCast + 1, 'easter', true, true,$scope);
        
        gamblerSpell.hasBs = gamblerSpell.innerCookie1.type == 'Building Special' || gamblerSpell.innerCookie2.type == 'Building Special' || gamblerSpell.innerCookie3.type == 'Building Special';
      }
        
      //TODO: Do something with edifice to make it clear if it will fail or not. like this:
      //if(gfdSpell.name == "Spontaneous Edifice") spellOutcome += ' (' + FortuneCookie.gamblerEdificeChecker(spellsCast + 1, true) + ')';
    } else {
      gamblerSpell.backfire = true;
      
      if (gfdSpell.name == "Force the Hand of Fate") {
        gamblerSpell.innerCookie1 = check_cookies(spellsCast + 1, '', false, false,$scope);
        gamblerSpell.innerCookie2 = check_cookies(spellsCast + 1, '', true, false,$scope);
        gamblerSpell.innerCookie3 = check_cookies(spellsCast + 1, 'easter', true, false,$scope);
        
        gamblerSpell.hasEf = gamblerSpell.innerCookie1.type == 'ElderFrenzy' || gamblerSpell.innerCookie2.type == 'ElderFrenzy' || gamblerSpell.innerCookie3.type == 'ElderFrenzy';
      }

      //TODO: again, handle spontaneous edifice
      //if(gfdSpell.name == "Spontaneous Edifice") spellOutcome += ' (' + FortuneCookie.gamblerEdificeChecker(spellsCast + 1, false) + ')';
    }
    
    return gamblerSpell;  
  }

let spells={
    'conjure baked goods':{
      name:'Conjure Baked Goods',
      desc:'Summon half an hour worth of your CpS, capped at 15% of your cookies owned.',
      failDesc:'Trigger a 15-minute clot and lose 15 minutes of CpS.',
      icon:[21,11],
      costMin:2,
      costPercent:0.4,
      win:function()
      {
        var val=Math.max(7,Math.min(Game.cookies*0.15,Game.cookiesPs*60*30));
        Game.Earn(val);
        Game.Notify('Conjure baked goods!','You magic <b>'+Beautify(val)+' cookie'+(val==1?'':'s')+'</b> out of thin air.',[21,11],6);
        Game.Popup('<div style="font-size:80%;">+'+Beautify(val)+' cookie'+(val==1?'':'s')+'!</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        var buff=Game.gainBuff('clot',60*15,0.5);
        var val=Math.min(Game.cookies*0.15,Game.cookiesPs*60*15)+13;
        val=Math.min(Game.cookies,val);
        Game.Spend(val);
        Game.Notify(buff.name,buff.desc,buff.icon,6);
        Game.Popup('<div style="font-size:80%;">Backfire!<br>Summoning failed! Lost '+Beautify(val)+' cookie'+(val==1?'':'s')+'!</div>',Game.mouseX,Game.mouseY);
      },
    },
    'hand of fate':{
      name:'Force the Hand of Fate',
      desc:'Summon a random golden cookie. Each existing golden cookie makes this spell +15% more likely to backfire.',
      failDesc:'Summon an unlucky wrath cookie.',
      icon:[22,11],
      costMin:10,
      costPercent:0.6,
      failFunc:function(fail)
      {
        return fail+0.15*Game.shimmerTypes['golden'].n;
      },
      win:function()
      {
        var newShimmer=new Game.shimmer('golden',{noWrath:true});
        var choices=[];
        choices.push('frenzy','multiply cookies');
        if (!Game.hasBuff('Dragonflight')) choices.push('click frenzy');
        if (Math.random()<0.1) choices.push('cookie storm','cookie storm','blab');
        if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push('building special');
        //if (Math.random()<0.2) choices.push('clot','cursed finger','ruin cookies');
        if (Math.random()<0.15) choices=['cookie storm drop'];
        if (Math.random()<0.0001) choices.push('free sugar lump');
        newShimmer.force=choose(choices);
        if (newShimmer.force=='cookie storm drop')
        {
          newShimmer.sizeMult=Math.random()*0.75+0.25;
        }
        Game.Popup('<div style="font-size:80%;">Promising fate!</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        var newShimmer=new Game.shimmer('golden',{wrath:true});
        var choices=[];
        choices.push('clot','ruin cookies');
        if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
        if (Math.random()<0.003) choices.push('free sugar lump');
        if (Math.random()<0.1) choices=['blab'];
        newShimmer.force=choose(choices);
        Game.Popup('<div style="font-size:80%;">Backfire!<br>Sinister fate!</div>',Game.mouseX,Game.mouseY);
      },
    },
    'stretch time':{
      name:'Stretch Time',
      desc:'All active buffs gain 10% more time (up to 5 more minutes).',
      failDesc:'All active buffs are shortened by 20% (up to 10 minutes shorter).',
      icon:[23,11],
      costMin:8,
      costPercent:0.2,
      win:function()
      {
        var changed=0;
        for (var i in Game.buffs)
        {
          var me=Game.buffs[i];
          var gain=Math.min(Game.fps*60*5,me.maxTime*0.1);
          me.maxTime+=gain;
          me.time+=gain;
          changed++;
        }
        if (changed==0){Game.Popup('<div style="font-size:80%;">No buffs to alter!</div>',Game.mouseX,Game.mouseY);return -1;}
        Game.Popup('<div style="font-size:80%;">Zap! Buffs lengthened.</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        var changed=0;
        for (var i in Game.buffs)
        {
          var me=Game.buffs[i];
          var loss=Math.min(Game.fps*60*10,me.time*0.2);
          me.time-=loss;
          me.time=Math.max(me.time,0);
          changed++;
        }
        if (changed==0){Game.Popup('<div style="font-size:80%;">No buffs to alter!</div>',Game.mouseX,Game.mouseY);return -1;}
        Game.Popup('<div style="font-size:80%;">Backfire!<br>Fizz! Buffs shortened.</div>',Game.mouseX,Game.mouseY);
      },
    },
    'spontaneous edifice':{
      name:'Spontaneous Edifice',
      desc:'The spell picks a random building you could afford if you had twice your current cookies, and gives it to you for free. The building selected must be under 400, and cannot be your most-built one (unless it is your only one).',
      failDesc:'Lose a random building.',
      icon:[24,11],
      costMin:20,
      costPercent:0.75,
      win:function()
      {
        var buildings=[];
        var max=0;
        var n=0;
        for (var i in Game.Objects)
        {
          if (Game.Objects[i].amount>max) max=Game.Objects[i].amount;
          if (Game.Objects[i].amount>0) n++;
        }
        for (var i in Game.Objects)
        {if ((Game.Objects[i].amount<max || n==1) && Game.Objects[i].getPrice()<=Game.cookies*2 && Game.Objects[i].amount<400) buildings.push(Game.Objects[i]);}
        if (buildings.length==0){Game.Popup('<div style="font-size:80%;">No buildings to improve!</div>',Game.mouseX,Game.mouseY);return -1;}
        var building=choose(buildings);
        building.buyFree(1);
        Game.Popup('<div style="font-size:80%;">A new '+building.single+'<br>bursts out of the ground.</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        if (Game.BuildingsOwned==0){Game.Popup('<div style="font-size:80%;">Backfired, but no buildings to destroy!</div>',Game.mouseX,Game.mouseY);return -1;}
        var buildings=[];
        for (var i in Game.Objects)
        {if (Game.Objects[i].amount>0) buildings.push(Game.Objects[i]);}
        var building=choose(buildings);
        building.sacrifice(1);
        Game.Popup('<div style="font-size:80%;">Backfire!<br>One of your '+building.plural+'<br>disappears in a puff of smoke.</div>',Game.mouseX,Game.mouseY);
      },
    },
    'haggler\'s charm':{
      name:'Haggler\'s Charm',
      desc:'Upgrades are 2% cheaper for 1 minute.',
      failDesc:'Upgrades are 2% more expensive for an hour.<q>What\'s that spell? Loadsamoney!</q>',
      icon:[25,11],
      costMin:10,
      costPercent:0.1,
      win:function()
      {
        Game.killBuff('Haggler\'s misery');
        var buff=Game.gainBuff('haggler luck',60,2);
        Game.Popup('<div style="font-size:80%;">Upgrades are cheaper!</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        Game.killBuff('Haggler\'s luck');
        var buff=Game.gainBuff('haggler misery',60*60,2);
        Game.Popup('<div style="font-size:80%;">Backfire!<br>Upgrades are pricier!</div>',Game.mouseX,Game.mouseY);
      },
    },
    'summon crafty pixies':{
      name:'Summon Crafty Pixies',
      desc:'Buildings are 2% cheaper for 1 minute.',
      failDesc:'Buildings are 2% more expensive for an hour.',
      icon:[26,11],
      costMin:10,
      costPercent:0.2,
      win:function()
      {
        Game.killBuff('Nasty goblins');
        var buff=Game.gainBuff('pixie luck',60,2);
        Game.Popup('<div style="font-size:80%;">Crafty pixies!<br>Buildings are cheaper!</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        Game.killBuff('Crafty pixies');
        var buff=Game.gainBuff('pixie misery',60*60,2);
        Game.Popup('<div style="font-size:80%;">Backfire!<br>Nasty goblins!<br>Buildings are pricier!</div>',Game.mouseX,Game.mouseY);
      },
    },
    'gambler\'s fever dream':{
      name:'Gambler\'s Fever Dream',
      desc:'Cast a random spell at half the magic cost, with twice the chance of backfiring.',
      icon:[27,11],
      costMin:3,
      costPercent:0.05,
      win:function()
      {
        var spells=[];
        var selfCost=M.getSpellCost(M.spells['gambler\'s fever dream']);
        for (var i in M.spells)
        {if (i!='gambler\'s fever dream' && (M.magic-selfCost)>=M.getSpellCost(M.spells[i])*0.5) spells.push(M.spells[i]);}
        if (spells.length==0){Game.Popup('<div style="font-size:80%;">No eligible spells!</div>',Game.mouseX,Game.mouseY);return -1;}
        var spell=choose(spells);
        var cost=M.getSpellCost(spell)*0.5;
        setTimeout(function(spell,cost,seed){return function(){
          if (Game.seed!=seed) return false;
          var out=M.castSpell(spell,{cost:cost,failChanceMax:0.5,passthrough:true});
          if (!out)
          {
            M.magic+=selfCost;
            setTimeout(function(){
              Game.Popup('<div style="font-size:80%;">That\'s too bad!<br>Magic refunded.</div>',Game.mouseX,Game.mouseY);
            },1500);
          }
        }}(spell,cost,Game.seed),1000);
        Game.Popup('<div style="font-size:80%;">Casting '+spell.name+'<br>for '+Beautify(cost)+' magic...</div>',Game.mouseX,Game.mouseY);
      },
    },
    'resurrect abomination':{
      name:'Resurrect Abomination',
      desc:'Instantly summon a wrinkler if conditions are fulfilled.',
      failDesc:'Pop one of your wrinklers.',
      icon:[28,11],
      costMin:20,
      costPercent:0.1,
      win:function()
      {
        var out=Game.SpawnWrinkler();
        if (!out){Game.Popup('<div style="font-size:80%;">Unable to spawn a wrinkler!</div>',Game.mouseX,Game.mouseY);return -1;}
        Game.Popup('<div style="font-size:80%;">Rise, my precious!</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        var out=Game.PopRandomWrinkler();
        if (!out){Game.Popup('<div style="font-size:80%;">Backfire!<br>But no wrinkler was harmed.</div>',Game.mouseX,Game.mouseY);return -1;}
        Game.Popup('<div style="font-size:80%;">Backfire!<br>So long, ugly...</div>',Game.mouseX,Game.mouseY);
      },
    },
    'diminish ineptitude':{
      name:'Diminish Ineptitude',
      desc:'Spells backfire 10 times less for the next 5 minutes.',
      failDesc:'Spells backfire 5 times more for the next 10 minutes.',
      icon:[29,11],
      costMin:5,
      costPercent:0.2,
      win:function()
      {
        Game.killBuff('Magic inept');
        var buff=Game.gainBuff('magic adept',5*60,10);
        Game.Popup('<div style="font-size:80%;">Ineptitude diminished!</div>',Game.mouseX,Game.mouseY);
      },
      fail:function()
      {
        Game.killBuff('Magic adept');
        var buff=Game.gainBuff('magic inept',10*60,5);
        Game.Popup('<div style="font-size:80%;">Backfire!<br>Ineptitude magnified!</div>',Game.mouseX,Game.mouseY);
      },
    },
  };

let spellchain = function (total,chain,log,$scope) {
    let l = {"Building Special":"&#9632;","ClickFrenzy":"&#9633;","ElderFrenzy":"&#9670;"}//,"Cursed Finger":"&#9671;"}
    let dr = ["Spontaneous Edifice","Resurrect Abomination","Resurrect AbominationB"]
    let t = ""
    let o = function(){return{n:0,onsc:1,"ClickFrenzy":0,"ElderFrenzy":0,FtHoF:0,gamble:0,season:1,pos:[]}}
    let cast = function(now,spell,a,s,x,y){
        x = Math.round(x/5/10)*10
        y = Math.round(y/5/10)*10+120
        let res = {n:0}
        for (let i in now) {
            if (i == "pos") {
                res.pos = []
                for (let j in now.pos){
                    res.pos[j] = now.pos[j]
                }
            }
            else {res[i] = now[i]}
        }
        if (spell == "Building Special") {
            if(now.FtHoF == 2) return false
            if(now["ClickFrenzy"] == 0 && a == 1) return false
            //if(now["Cursed Finger"] != 0 && a == 1) return false
            res.n++
            if(now.onsc >= a){res.onsc = a - 1}
            if(now.FtHoF != 0) res.FtHoF = 0
            if(s == now.season%2) res.season++
            res.onsc++
            res.pos.push([x,y])
        }
        else if (l.hasOwnProperty(spell) && now[spell] == 0) {
            if (spell == "ClickFrenzy") {
                if(now.FtHoF == 2) return false
                if(a == 1) return false
                //if(now["Cursed Finger"] != 0 && (a == 1)) return false
                if(now.onsc >= a){res.onsc = a - 1}
                res.onsc++
                res.n++
                res["ClickFrenzy"] = now.n + 1
                if(s == now.season%2) res.season++
                if(now.FtHoF != 0) res.FtHoF = 0
                res.pos.push([x,y])
            }
            else if (now.onsc < a && now.FtHoF != 2) return false
            else {
                res.onsc++
                res.n++
                res[spell] = now.n + 1
                if(s == now.season%2) res.season++
                if(now.FtHoF != 0) res.FtHoF = 0
                res.pos.push([x,y])
            }
        }
        else if (dr.includes(spell)){
            if (now.FtHoF != 0) return false
            res.gamble++
        }   
        else if (spell == "Force the Hand of Fate") {
            if (now.FtHoF == 0) {
                res.FtHoF = 1
                res.gamble++
            }
            else return false
        }
        else if (spell == "Force the Hand of FateB") {
            if (now.FtHoF == 0) {
                res.FtHoF = 2
                res.gamble++
            }
            else return false
        }
        else return false
        return res
    }
    let res = []
    let err = []
    for (let i = total;i<total+1000;i++){
        let max = {n:0,pos:[]}
        let f = []
        let h = 0
        let a = check_cookies(i,'easter!',0,$scope)
        let b = check_cookies(i,'easter',0,$scope)
        let e = check_gambler(i,$scope)
        if (check_gambler(i,$scope).backfire) e += "B"
        if (l.hasOwnProperty(a.type)) f.push([a,0])
        if (l.hasOwnProperty(b.type)) f.push([b,1])
        if (dr.includes(e.type) || e.type == "Force the Hand of Fate" || e.type == "Force the Hand of FateB")f.push([e,2])
        t += i
        t += l.hasOwnProperty(a.type)?l[a.type]:"&emsp;"
        t += l.hasOwnProperty(b.type)?l[b.type]:"&emsp;"
        for (let j = 0;j < 7;j++){
            if(check_cookies(i,'easter!',j,$scope).wrath){
                let c = check_cookies(i,'easter!',j,$scope)
                let d = check_cookies(i,'easter',j,$scope)
                if (l.hasOwnProperty(c.type)) f.push([c,0])
                if (l.hasOwnProperty(d.type)) f.push([d,0])
                t += l.hasOwnProperty(c.type)?l[c.type]:"&emsp;"
                t += l.hasOwnProperty(d.type)?l[d.type]:"&emsp;"
                t += j
                h = j
                break
            }
        }
        err.push(o())
        let now = []
        for (let i in err) {
            for (let j in f) {
                let g = cast(err[i],f[j][0].type,h,f[j][1],f[j][0].x,f[j][0].y)
                if (g != false) {
                    now.push(g)
                    if (max.n < g.n) max = g
                    else if (max.n == g.n && (max["ClickFrenzy"] == 0 || max["ElderFrenzy"] == 0)) max = g
                }
            }
        }
        err = now
        if(dr.includes(e)) t += "&#9675;&emsp;"
        else if(e=="Force the Hand of Fate"){
            t += "&#9679;&emsp;"
        }
        else if(e=="Force the Hand of FateB"){
            t += "&#9673;&emsp;"
        }
        else t += "&emsp;&emsp;"
        t += max.n
        for (let i = 0 ;i < 8; i++) {
            t += i<max.n?"&#9733;":"&emsp;"
        }
        t += JSON.stringify(max)
        t += "<br>"
        if (max.n >= chain && (max["ClickFrenzy"] != 0 && max["ElderFrenzy"] != 0)) {res.push([i,max])}
    }
    //console.log("\n")
    if(log) return t
    return res
}

/*Game.LoadSave(fs.readFileSync('../../Users/saito keisuke/Downloads/DIALWORKSBakery - 2021-04-17T000901.494.txt','utf-8'))

let $scope

$scope = Game
$scope.spells = spells
console.log($scope)

console.log(spellchain(3153,6,true))*/

/*fs.readdir('../../Users/saito keisuke/Downloads', function(err, files){
    if (err) throw err;
    for (let i of files) {
        if (i.slice(0,15)=='DIALWORKSBakery') {
            let txt = ''
            try{txt = fs.readFileSync('../../Users/saito keisuke/Downloads/'+i,'utf-8')}
            catch(err){
                continue
            }
            Game.LoadSave(txt)
            $scope = Game
            $scope.spells = spells
            let res = spellchain(3075,6,false)
            if(res.length > 0) {
                console.log(i,txt,res)
            }
        }
    }
    console.log("end")
})*/

10**15+1





cost = function (building,k,n) {
    let buildings = {cursor:15,grandma:100,farm:1100,mine:12000,factory:130000,bank:1.4*10**6,
                temple:20*10**6,wizard:330*10**6,shipment:5.1*10**9,alchemy:75*10**9,
                portal:10**12,time:14*10**12,antimatter:170*10**12,prism:2.1*10**15,
                chancemaker:26*10**15,fractal:310*10**15,javascript:71*10**18,idleverse:12*10**21}
    let n0 = n
    if (building == "cursor") n0 -= 10
    else if (building == "grandma") n0 -= 5
    return 1.15**n0*buildings[building]*k
}

gain = function (building,k,o) {
    let buildingsProp = {farm:[1/100,8],mine:[1/200,47],factory:[1/300,260],bank:[1/400,1400],temple:[1/500,7800],
                     wizard:[1/600,44000],shipment:[1/700,260000],alchemy:[1/800,1.6*10**6],portal:[1/900,10**7],
                     time:[1/1000,65*10**6],antimatter:[1/1100,430*10**6],prism:[1/1200,2.9*10**9],
                     chancemaker:[1/1300,21*10**9],fractal:[1/1400,150*10**9],javascript:[1/1500,1.1*10**12],
                     idleverse:[1/1600,8.3*10**12]}
    let synergy = [["cursor","fractal"],["grandma","javascript"],["farm","temple"],["farm","wizard"],["farm","portal"],
                   ["farm","time"],["mine","wizard"],["mine","shipment"],["mine","shipment"],["mine","alchemy"],
                   ["mine","chancemaker"],["factory","bank"],["factory","shipment"],["factory","time"],
                   ["factory","antimatter"],["bank","alchemy"],["bank","portal"],["bank","antimatter"],
                   ["temple","portal"],["temple","antimatter"],["temple","prism"],["wizard","alchemy"],["wizard","prism"],
                   ["shipment","time"],["alchemy","antimatter"],["portal","prism"],["portal","idleverse"],
                   ["time","prism"],["antimatter","chancemaker"],["prism","fractal"],["chancemaker","javascript"],
                   ["fractal","idleverse"]]
    let symult = 19459*10**5 * 1.03*10**20 * 1.01**8 * 1.02**62 * 1.03**22 * 1.04**60 *
                1.05**53 * 1.1**13 * 1.07 * 1.1587 * 2.3474 * 1.127 * 1.07 * 1.41 * 1.03 * 1.006 * k * 3.765
                                            //bbapoc  santa    easter  fortune hareald pet  century
    for (let i of synergy) {
        if (i[0] == building) {
            symult *= 1 + (0.05 * o[i[1]])
        }
        if (i[1] == building){
            symult *= 1 + (0.001 * o[i[0]])
        }
    }
    if (building == "cursor") {
        let whole = 0
        for (let i in o) whole += o[i]
        return 1.07 * (0.8 + 64 * 10 ** 8 * (whole - o["cursor"])) *
            symult * 1.16
    }
    else if (building == "grandma") {
        return symult * (1 + 0.04 * o["grandma"] + 0.05 * o["portal"]) * 2**16 *
            4 * 2 * 2 * 1.02 * 1.29**14 * 2**13 * 1.07 * 30.5 * (1+0.05*518/25*1.05*(1+0.1*0.05))
    }
    else {
        return 2**13 * 1.07 * buildingsProp[building][1] * (1 + buildingsProp[building][0] *
                                                        o["grandma"]) * symult * 1.1
    }
}

let buildingsOwned = function(){
    let res = 
        { cursor: 0,
        grandma: 1,
        farm: 2,
        mine: 3,
        factory: 4,
        bank: 5,
        temple: 6,
        wizard: 7,
        shipment: 8,
        alchemy: 9,
        portal: 10,
        time: 11,
        antimatter: 12,
        prism: 13,
        chancemaker: 14,
        fractal: 15,
        javascript: 16,
        idleverse: 17 }
    for (let i in res) {
        res[i] = Game.ObjectsById[res[i]].amount
    }
    return res
}

cost("farm",0.99**5*0.93,1000)

let mouse = function (buildings,cps) {
    let add = 0.1 *5 * 10 * 20**7
    let num = 0
    for (let i in buildings) {
        if(i != "cursor")num+=buildings[i]
    }
    add*=num
    add+=0.14*cps
    let mult = 1.1 ** 3 * 1.03 * (1 + 0.05 * 12) * (1 + 0.05 * 0.1)
    return (8 + add)*mult
}
/*
{
    let total = 0
    for (let i in maxBuy[0]) {
        let p = gain(i,7,maxBuy[0])
        total += p*maxBuy[0][i]
        console.log(i,cost(i,0.99**5*0.93,maxBuy[0][i]),p,p*maxBuy[0][i])
    }
    console.log(total)
    console.log(mouse(maxBuy[0],total*666*7*80**3))
}


{
    let fill = function(buildingsBuy,inbank,s) {
        let canBuy = []
        let pivot = 0
        let total = 0
        if(s==undefined){s=10000}
        else(s=Math.floor(s*Math.random()))
        let newBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
                temple:0,wizard:0,shipment:0,alchemy:0,
                portal:0,time:0,antimatter:0,prism:0,
                chancemaker:0,fractal:0,javascript:0,idleverse:0}
        for (let i in buildingsBuy) {
            newBuy[i] = buildingsBuy[i]
        }
        for (let q = 0;q<s;q++){
            let pivot = 0
            for (let i in buildingsBuy) {
                if (inbank > total + cost(i,0.99**5*0.93,newBuy[i])&&i!="wizard") {
                    canBuy.push(i)
                    pivot += buildingsRate[i]
                }
            }
            if (canBuy.length == 0) {break}
            let random = pivot * Math.random()
            for (let i in canBuy) {
                random -= buildingsRate[canBuy[i]]
                if(random <= 0) {
                    random = i
                    break
                }
            }
            let aim = canBuy[random]
            total += cost(aim,0.99**5*0.93,newBuy[aim])
            newBuy[aim]++
            canBuy = []
            pivot = 0
        }
        return [newBuy,total]
    }
    let gozamok = false?{}:{farm:0,mine:0,factory:0,bank:0,
                    temple:0,wizard:1,shipment:0,alchemy:0,
                    time:0,antimatter:0,chancemaker:0}
    let buildingsRate = {cursor:1,grandma:1,farm:1,mine:1,factory:1,bank:1,
                temple:1,wizard:Infinity,shipment:1,alchemy:1,
                portal:1,time:1,antimatter:1,prism:1,
                chancemaker:1,fractal:1,javascript:1,idleverse:1}
    for (let q = 0;q < 100;q++){
        console.log(q)
        let buildingsBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
            temple:0,wizard:0,shipment:0,alchemy:0,
            portal:0,time:0,antimatter:0,prism:0,
            chancemaker:0,fractal:0,javascript:0,idleverse:0}
        for (let i in buildingsBuy) {
            buildingsBuy[i] = buildingsOwned[i]
        }
        let sum = 17
        let cps = 0
        let inbank = 4.14*10**67
        let mult = 1
        let count = Math.floor(10*(Math.random()))
        let nani = fill(buildingsBuy,inbank)
        inbank -= nani[1]
        buildingsBuy = nani[0]
        for (let j in buildingsBuy) {
            if(j!="wizard"){buildingsRate[j]=1}
            if(gozamok[j]==undefined){cps += gain(j,1,buildingsBuy)*buildingsBuy[j]}
            else if(gozamok[j]==0){mult+=buildingsBuy[j]/100}
        }
        cps*=mult
        let loop = 100000
        loop:for (let i = 0;i < loop;i++) {
            let random = sum * Math.random()
            for (let j in buildingsRate) {
                random -= 1/buildingsRate[j]
                if (random <= 0) {
                    if (buildingsBuy[j] - buildingsOwned[j] >= 1) {
                        random = Math.floor(2*Math.random()) + 1
                        buildingsBuy[j] -= random
                        let newcost = 0
                        for (let i = 0;i<random;i++){
                            newcost+=cost(j,0.99**5*0.93,buildingsBuy[j]+i)
                        }
                        let newBuy = [buildingsBuy,0]
                        if (count==0||i==loop){
                            let newBuy = fill(buildingsBuy,inbank+newcost)
                            count = Math.floor(10*(Math.random()))
                        }
                        let next = 0
                        mult = 1
                        for (let j in buildingsOwned) {
                            if(gozamok[j]==undefined){next += gain(j,1,newBuy[0])*newBuy[0][j]}
                            else if(gozamok[j]==0&&j!="wizard"){mult+=newBuy[0][j]/100}
                        }
                        if (cps < next*mult) {
                            buildingsBuy = newBuy[0]
                            cps = next*mult
                            inbank += newcost - newBuy[1]
                        }
                        else {
                            sum -= 1/buildingsRate[j]
                            buildingsRate[j] += 1
                            sum += 1/buildingsRate[j]
                        }
                    }
                    if(inbank<0){console.log("error")}
                    continue loop
                }
            }
        }
        if (cps > maxCps) {
            maxBuy = buildingsBuy
            maxCps = cps
        }
        console.log(cps,inbank)
    }
    console.log(maxCps,maxBuy,buildingsRate)
}*/

let howbuy = function (buildingsOwned,tf,count,cpsmult,cpcmult) {
    let maxBuy = {}
    let maxCpc = 0
    let byid = ["cursor","grandma","farm","mine","factory","bank",
                "temple","shipment","alchemy",
                "portal","time","antimatter","prism",
                "chancemaker","fractal","javascript","idleverse"]
    let fill = function(buildingsBuy,inbank) {
        let canBuy = []
        let newBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
                temple:0,wizard:0,shipment:0,alchemy:0,
                portal:0,time:0,antimatter:0,prism:0,
                chancemaker:0,fractal:0,javascript:0,idleverse:0}
        let digit = Math.floor(Math.log10(inbank))-6
        for (let i in buildingsBuy) {
            newBuy[i] = buildingsBuy[i]
        }
        for (let q = 0;q<1000;q++){
            for (let i in buildingsBuy) {
                if (inbank > cost(i,0.99**5*0.93,newBuy[i])&&i!="wizard") {
                    canBuy.push(i)
                }
            }
            if (canBuy.length == 0) {return [newBuy,inbank]}
            let aim = canBuy[Math.floor(canBuy.length*Math.random())]
            inbank -= cost(aim,0.99**5*0.93,newBuy[aim])
            newBuy[aim]++
            canBuy = []
        }
        return [newBuy,inbank]
    }
    let ill = function(buildingsBuy,inbank) {
        let canSell = []
        let newBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
                temple:0,wizard:0,shipment:0,alchemy:0,
                portal:0,time:0,antimatter:0,prism:0,
                chancemaker:0,fractal:0,javascript:0,idleverse:0}
        let digit = Math.floor(Math.log10(inbank))-6
        for (let i in buildingsBuy) {
            newBuy[i] = buildingsBuy[i]
        }
        for (let q = 0;q<1000;q++){
            if (inbank >= 0) {return [newBuy,inbank]}
            for (let i in buildingsBuy) {
                if (newBuy[i]-buildingsOwned[i]>0&&i!="wizard") {
                    canSell.push(i)
                }
            }
            if(canSell.length==0){break}
            let aim = canSell[Math.floor(canSell.length*Math.random())]
            inbank += cost(aim,0.99**5*0.93,--newBuy[aim])
            canSell = []
        }
        return [newBuy,inbank]
    }
    tf = tf&&Game.maxCpc
    let cpc = 0
    let digit = 60
    cpsmult = cpsmult==undefined?1:cpsmult
    cpcmult = cpcmult==undefined?1:cpcmult
    let inbank = tf?Game.maxBuy[1]:Game.cookies
    let gozamok = [{},
                   {farm:0,mine:0,factory:0,bank:0,
                    temple:0,wizard:1,shipment:0,alchemy:0},
                   {farm:0,mine:0,factory:0,bank:0,
                    temple:0,wizard:1,shipment:0,alchemy:0,
                    time:0,antimatter:0,chancemaker:0}][2]
    for (let i = 0;i < count[0];i++) {
        console.log(maxBuy)
        cpc = 0
        mult = 1
        let temp = tf?Game.maxBuy:fill(buildingsOwned,inbank)
        let cocon = {}
        for (let l in temp[0]) {
            cocon[l] = gozamok[l]!=undefined?gozamok[l]:temp[0][l]
        }
        for (let l in temp[0]) {
            if (gozamok[l]==undefined){cpc += gain(l,1,cocon)}
            else if (gozamok[l]==0){mult += temp[0][l]/100}
        }
        cpc = cpcmult * mult * mouse(cocon,cpsmult * cpc)
        if(maxCpc<cpc){
            maxCpc=cpc
            maxBuy=temp
        }
        loop:for (let j = 0;j < count[1];j++){
            let random = Math.floor(2 * Math.random())+1
            let cont = [{},temp[1]]
            for (let l in temp[0]){
                cont[0][l] = temp[0][l]
            }
            for (let k = 0;k < random;k++) {
                let building = byid[Math.floor(17 * Math.random())]
                cont[1] -= cost(building,0.99**5*0.93,cont[0][building]++)
            }
            for (let k = 0;k < count[2];k++) {
                cont = ill(cont[0],cont[1])
                console.log(cont)
                cont[1] = Math.round(cont[1]/10**digit)*10**digit
                if(cont[1]<0){continue loop}
                cont = fill(cont[0],cont[1])
                cont[1] = cont[1]?Math.round(cont[1]/10**digit)*10**digit:cont[1]
                let next = 0
                mult = 1
                for (let l in cont[0]) {
                    cocon[l] = gozamok[l]!=undefined?gozamok[l]:cont[0][l]
                }
                for (let l in cont[0]) {
                    if (gozamok[l]==undefined){next += gain(l,1,cocon)}
                    else if (gozamok[l]==0){mult+=cont[0][l]/100}
                }
                next = cpcmult * mult * mouse(cocon,cpsmult * next)
                if (cpc<next){
                    cpc = next
                    temp = cont
                    continue loop
                }
            }
        }
        if(Number.isInteger(Math.log10(i))){console.log(i)}
        if (cpc>maxCpc) {
            maxCpc = cpc
            maxBuy = temp
            console.log(i,cpc)
        }
    }
    Game.maxBuy = maxBuy
    Game.maxCpc = maxCpc
    console.log(maxCpc,maxBuy,buildingsOwned)
    for (let i in buildingsOwned) {
        console.log(i,buildingsOwned[i],gain(i,1,buildingsOwned))
    }
}
4.915825785241189e+65
/*{
    let fill = function(buildingsBuy,inbank,building) {
        let canBuy = []
        let pivot = 0
        let total = 0
        let newBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
                temple:0,wizard:0,shipment:0,alchemy:0,
                portal:0,time:0,antimatter:0,prism:0,
                chancemaker:0,fractal:0,javascript:0,idleverse:0}
        for (let i in buildingsBuy) {
            newBuy[i] = buildingsBuy[i]
        }
        for (let q = 0;q<1000;q++){
            let pivot = 0
            for (let i in buildingsBuy) {
                if (inbank > total + cost(i,0.99**5*0.93,newBuy[i])&&i!=building&&i!="wizard") {
                    canBuy.push(i)
                }
            }
            if (canBuy.length == 0) {break}
            let random = Math.floor(canBuy.length * Math.random())
            for (let i in canBuy) {
                random -= 1
                if(random <= 0) {
                    random = i
                    break
                }
            }
            let aim = canBuy[random]
            total += cost(aim,0.99**5*0.93,newBuy[aim])
            newBuy[aim]++
            canBuy = []
            pivot = 0
        }
        return [newBuy,total]
    }
    let ill = function(buildingsBuy,inbank,building) {
        let canBuy = []
        let pivot = 0
        let total = 0
        let newBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
                temple:0,wizard:0,shipment:0,alchemy:0,
                portal:0,time:0,antimatter:0,prism:0,
                chancemaker:0,fractal:0,javascript:0,idleverse:0}
        for (let i in buildingsBuy) {
            newBuy[i] = buildingsBuy[i]
        }
        let canSell = []
        for (let q = 0;q<1000;q++){
            if (inbank+total>=0){
                return [newBuy,total]
            }
            for (let i in buildingsBuy) {
                if (i!=building&&i!="wizard"&&newBuy[i]-buildingsOwned[i]>=1) {
                    canSell.push(i)
                }
            }
            if (canSell.length == 0) {break}
            let random = Math.floor(canSell.length * Math.random())
            let aim = canSell[random]
            total += cost(aim,0.99**5*0.93,--newBuy[aim])
            canSell = []
        }
        return [{cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
                temple:0,wizard:0,shipment:0,alchemy:0,
                portal:0,time:0,antimatter:0,prism:0,
                chancemaker:0,fractal:0,javascript:0,idleverse:0},total]
    }
    let gozamok = false?{}:{farm:0,mine:0,factory:0,bank:0,
                    temple:0,wizard:1,shipment:0,alchemy:0,
                    time:0,antimatter:0,chancemaker:0}
    let buildingsRate = {cursor:1,grandma:1,farm:1,mine:1,factory:1,bank:1,
                temple:1,wizard:Infinity,shipment:1,alchemy:1,
                portal:1,time:1,antimatter:1,prism:1,
                chancemaker:1,fractal:1,javascript:1,idleverse:1}
    for (let q = 0;q < 100;q++){
        console.log(q)
        let buildingsBuy = {cursor:0,grandma:0,farm:0,mine:0,factory:0,bank:0,
            temple:0,wizard:0,shipment:0,alchemy:0,
            portal:0,time:0,antimatter:0,prism:0,
            chancemaker:0,fractal:0,javascript:0,idleverse:0}
        for (let i in buildingsBuy) {
            buildingsBuy[i] = buildingsOwned[i]
        }
        let sum = 17
        let cps = 0
        let inbank = 4.14*10**67
        let mult = 1
        let nani = fill(buildingsBuy,inbank,"wizard")
        inbank -= nani[1]
        buildingsBuy = nani[0]
        for (let j in buildingsBuy) {
            if(j!="wizard"){buildingsRate[j]=1}
            if(gozamok[j]==undefined){cps += gain(j,1,buildingsBuy)*buildingsBuy[j]}
            else if(gozamok[j]==0){mult+=buildingsBuy[j]/100}
        }
        cps*=mult
        let loop = 10000
        loop:for (let i = 0;i < loop;i++) {
            let random = sum * Math.random()
            for (let j in buildingsRate) {
                random -= 1/buildingsRate[j]
                if (random <= 0) {
                    if (true) {
                        random =  1
                        buildingsBuy[j] += random
                        let newcost = 0
                        for (let i = 0;i<random;i++){
                            newcost+=cost(j,0.99**5*0.93,buildingsBuy[j]-i-1)
                        }
                        let newBuy = ill(buildingsBuy,inbank-newcost,j)
                        buildingsBuy[j] -= random
                        let next = 0
                        mult = 1
                        for (let j in buildingsOwned) {
                            if(gozamok[j]==undefined){next += gain(j,1,newBuy[0])*newBuy[0][j]}
                            else if(gozamok[j]==0){mult+=newBuy[0][j]/100}
                        }
                        if (cps < next*mult) {
                            buildingsBuy = newBuy[0]
                            cps = next*mult
                            inbank += - newcost + newBuy[1]
                        }
                        else {
                            sum -= 1/buildingsRate[j]
                            buildingsRate[j] += 1
                            sum += 1/buildingsRate[j]
                        }
                    }
                    continue loop
                }
            }
            if(inbank<0){console.log("error")}
        }
        if (cps > maxCps) {
            maxBuy = buildingsBuy
            maxCps = cps
        }
        console.log(cps)
    }
    console.log(maxCps,maxBuy,buildingsRate)
}
(function(){
    let i = {j:0}
    let j = 0
    a=function(){
        i.j+=1
        j+=1
        return i
    }
    a()
    console.log(i,j)
    a=function(i,j){
        i.j+=1
        j+=1
        return i
    }
    a(i)
    console.log(i,j)
}())

(function(){
    let i = 0
    console.log(i++)
}())

(function(i){
    console.log(i)
    console.log(i)
}(Math.random()))

1/Infinity

if(""){console.log("a")}

cost("cursor",0.99**5*0.93,1000)+cost("cursor",0.99**5*0.93,1001)+cost("cursor",0.99**5*0.93,1002)-cost("cursor",0.99**5*0.93,1002)-cost("cursor",0.99**5*0.93,1001)-cost("cursor",0.99**5*0.93,1000)
*/

let showdata = function(Game){
    let data = "<dl>"
    for (let i in Game) {
        if (typeof Game[i] === "function") {continue}
        if (i.slice(-4) === "ById") {continue}
        data += "<dt>" + i + "</dt><dd>"
        if (isObject(Game[i])) {
            data += "<dl>"
            for (let j in Game[i]) {
                data += "<dt>" + j + "</d>"
                data += "<dd>" + showdata(Game[i][j]) + "</dd>"
            }
            data += "</dl></dd>"
        }
        else if (isArray(Game[i])) {
            for (let j in Game[i]) {
                data += "<dd>" + showdata(Game[i][j]) + "</dd>"
            }
            data += "</dd>"
        }
        else {
            data += Game[i] + "</dd>"
        }
    }
    return data
}

let show = function (Game) {
    document.getElementById('text').innerHTML = showdata(Game)
}
