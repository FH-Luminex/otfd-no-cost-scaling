/** @type {ReturnType<typeof getNewGame>} */
let game = {}
let lastSaveTime = Date.now();
let lastCloudSaveTime = Date.now();
let lastCloudCheckTime = Date.now();
let cloudStatus = "";
let cloudSaveSafe = false;

function loadGame() {
    let newGame = getNewGame();
    try {
        game = JSON.parse(LZString.decompress(localStorage.getItem(SAVE_KEY)))
        fixSave(game, newGame);
    } catch {
        game = newGame;
    }
}

function checkCloudSave(explicit = false) {
    if (!cloud.listSaves || cloudStatus) return;
    let saveTime = game.time.now;
    cloudStatus = "checking";
    cloud.listSaves().then(data => {
        cloudStatus = "";
        cloud.state.loggedOut = false;
        console.log(data[0]?.timestamp, saveTime);
        if (data[0]) {
            cloudSaveSafe = false;
            if (data[0].id == game.id && data[0].timestamp - 10000 > saveTime) loadFromCloud(0, "cloudcheck");
            else if (data[0].id != game.id) loadFromCloud(0, "cloudavail");
            else cloudSaveSafe = true;
        } else {
            cloudSaveSafe = true;
            if (data[0]) lastCloudSaveTime = data[0].timestamp;
            lastCloudCheckTime = game.time.now;
        }
    }).catch(e => {
        console.log(e);
        cloudStatus = "";
        if (e instanceof NoAccountError) {
            cloud.state.loggedOut = true;
            if (explicit) callPopup("dialog", str.popups.common.title_error(), str.popups.save.strings.error_loggedOut());
        } else {
            if (explicit) callPopup("dialog", str.popups.common.title_error(), str.popups.common.desc_error(e.message));
        }
    })
}

function saveGame() {
    if (popups.draw.elms.list && popups.draw.state.phase != "done") return;
    if (popups.drawLegacy.elms.list && !popups.sell.state.canSave) return;
    if (popups.sell.elms.popup && !popups.sell.state.canSave) return;
    try {
        localStorage.setItem(SAVE_KEY, LZString.compress(JSON.stringify(game)));
        lastSaveTime = Date.now();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function saveToCloud(slot = 0, func, forced) {
    if (!cloud.save || cloudStatus || (!cloudSaveSafe && !forced)) return;
    cloudStatus = "saving";
    cloud.save(slot).then(() => {
        cloudStatus = "";
        lastCloudSaveTime = Date.now();
        func?.(true);
    }).catch(e => {
        cloudStatus = "";
        if (e instanceof NoAccountError) {
            cloud.state.loggedOut = true;
        }
        func?.(false);
    })
}

function loadFromCloud(slot = 0, type = null) {
    if (!cloud.save || cloudStatus) return;
    cloudStatus = "loading";
    cloud.load(slot).then((data) => {
        cloudStatus = "";
        popups.save.showImportPopup(data, type);
    }).catch(e => {
        cloudStatus = "";
        if (e instanceof NoAccountError) {
            cloud.state.loggedOut = true;
        }
    })
}

function getTextSaveString() {
    return LZString.compressToBase64(JSON.stringify(game));
}

function hardReset(keepOptions = true) {
    navigator.clipboard.writeText(LZString.compressToBase64(JSON.stringify(game)));
    if (keepOptions) localStorage.setItem(SAVE_KEY, LZString.compress(JSON.stringify({options: game.options})));
    else localStorage.removeItem(SAVE_KEY);
    saveGame = () => {};
    if (cloud.clearSave) cloud.clearSave(0).then(() => document.location.reload()).catch(() => document.location.reload());
    else document.location.reload();
}

function fixSave(game, newGame) {
    for (let thing in newGame) {
        if (!(thing in game)) game[thing] = newGame[thing];
        else if (typeof newGame[thing] == "object") fixSave(game[thing], newGame[thing]);
    }
}