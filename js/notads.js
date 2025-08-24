let ads = {
    videos: {},
    minigames: {},
}

let adOffers = {
    points_draw: {
        getOffer(args) {
            return {
                mult: effects.adPointBoost,
                duration: (adFuncs.drawMult(6 + args.rng * 2) + 920) * effects.adDrawDurationMult,
            }
        },
        onAward(offer) {
            addBuff("draw", "pointsMult", offer);
        },
        getDisplayArgs: (offer) => [offer.mult, offer.duration],
    },
    shreds_draw: {
        condition: () => flags.unlocked.shreds,
        getOffer(args) {
            return {
                mult: effects.adShredBoost,
                duration: (adFuncs.drawMult(5 + args.rng * 2) + 64000) * effects.adDrawDurationMult,
            }
        },
        onAward(offer) {
            addBuff("draw", "shredsMult", offer);
        },
        getDisplayArgs: (offer) => [offer.mult, offer.duration],
    },
    faction_draw: {
        condition: () => flags.unlocked.faction,
        getOffer(args) {
            return {
                mult: effects.adFactionBoost,
                duration: (adFuncs.drawMult(4 + args.rng * 2) + 1000000) * effects.adDrawDurationMult,
            }
        },
        onAward(offer) {
            addBuff("draw", "factionMult", offer);
        },
        getDisplayArgs: (offer) => [offer.mult, offer.duration],
    },
    energy_time: {
        condition: () => effects.bulkPower > 0,
        getOffer(args) {
            return {
                mult: 2,
                duration: 300 * effects.adTimeDurationMult,
            }
        },
        onAward(offer) {
            addBuff("time", "energySpeed", offer);
        },
        getDisplayArgs: (offer) => [offer.mult, offer.duration],
    },
}

let adFuncs = {
    drawMult: (mins) => Math.ceil((effects.bulk / effects.cooldownTime * 60 + effects.bulkPower) * effects.bulkMult * mins)
}

function playAd() {
    let ad = Math.random() < 0 ? ads.videos : ads.minigames;
    ad = ad[Object.keys(ad).pick()]

    callPopup("ad", ad);
}

function rerollAd() {
    game.time.adCooldown = effects.adRerollCost;
    game.buffs.adOffer = "";
    saveGame();
    doUIFrame();
}