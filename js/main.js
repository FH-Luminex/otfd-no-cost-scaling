let elms = {}

document.addEventListener("DOMContentLoaded", () => {
    initCloud();
    loadGame();
    initUI();
    updatePrefs();
    updateEffects();
    updateUnlocks();
    updateMusic();
    handleOfflineProgress();
    setTab("collection");
    animTime = time = performance.now();
    requestAnimationFrame(loop);
    requestAnimationFrame(animLoop);
    setTimeout(() => checkCloudSave(), 1000);
    
    $("#loading").remove();
    awardShow(1);
});

let time = 0;
let delta = 0;

function loop() {
    delta = performance.now() - time;
    time += delta;
    game.time.now = Date.now();

    onFrame();
    updateNotifs();

    if (game.option.updateRate) setTimeout(loop, 1000 / game.option.updateRate);
    else requestAnimationFrame(loop);
}

let animTime = 0;
let animDelta = 0;

function animLoop() {
    animDelta = performance.now() - animTime;
    animTime += animDelta;
    emit("anim-frame");
    requestAnimationFrame(animLoop);
}