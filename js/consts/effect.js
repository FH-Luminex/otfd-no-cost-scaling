const baseEffect = {
    bulk: 1,
    bulkPower: 0,
    bulkMult: 1,
    bulkMultBonus: 1,

    cardRChance: 1e-3,
    cardSRChance: 0.99999e-5,
    cardSSRChance: 0.99999e-7,
    cardURChance: 0.99999e-9,

    energyCap: 10,
    energySpeed: 1,
    
    points: 0,
    pointsExtra: 0,
    pointsMult: 1,

    shredMult: 1,
    shredRMult: 1,
    shredSRMult: 1,
    shredSSRMult: 1,
    shredURMult: 1,
    shredCrownMult: 10,

    fireGain: 1,
    waterGain: 1,
    leafGain: 1,
    sunGain: 1,
    moonGain: 1,
    fireDrawMult: 1,
    waterDrawMult: 1,
    leafDrawMult: 1,
    sunDrawMult: 1,
    moonDrawMult: 1,
    factionMult: 1,
    factionChance: 1e-6,

    cooldownTime: 3,
    breakTime: 5,
    breakSkip: 0.3,
    revealTime: 0.5,
    revealSkip: 1,

    pickitRate: 1,
    pickitMax: 5,
    autobuySpeed: 0,

    skillFireSkip: 60,
    skillFireStack: 1,
    skillFireCooldown: 120,
    skillWaterGain: 2,
    skillWaterCard: 1,
    skillWaterCard2: 1,
    skillWaterWait: 10,
    skillWaterSpeed: 1,
    skillWaterCooldown: 240,
    skillLeafMult: 2,
    skillLeafMultCrown: 1,
    skillLeafMultBase: 1,
    skillLeafCooldown: 600,
    skillSunBuff: 2,
    skillSunDebuff: 10,
    skillSunDup: 0,
    skillSunCooldown: 300,
    skillMoonBuff: 5,
    skillMoonDebuff: 2,
    skillMoonCooldown: 600,

    offlineLimit: 0,
    offlineLimitStrength: 0.4,

    legacyDrawCount: 3,
    legacyPickCount: 1,

    adCooldown: 900,
    adRerollCost: 1,
    adPointBoost: 4,
    adShredBoost: 3,
    adFactionBoost: 2,
    adDrawDurationMult: 1,
    adTimeDurationMult: 1,
}

const flags = {
    unlocked: {
        points: false,
        shreds: false,
        energy: false,
        market: false,
        zip: false,
        faction: false,
        skills: false,
        pickit: false,
        iris: false,
        legacy: false,
        ad: false,
        adReroll: false,
    }
}

const priority = {
    additive_before:       0,
    additive:              1,
    additive_after:        2,
    multiplicative_before: 10,
    multiplicative:        11,
    multiplicative_after:  12,
}

const statEntries = {
    general: {
        items: {
            timeProgress: {
                display: () => _number(format.time(game.stats.timeProgress, 4)),
                cost: [100, "points"],
                event: "frame",
            },
            timePlayed: {
                display: () => _number(format.time(game.stats.timePlayed, 4)),
                cost: [100000, "points"],
                event: "frame",
            },
        }
    },
    legacy: {
        condition: () => flags.unlocked.legacy,
        items: {
            accountsSold: {
                display: () => _number(format(game.stats.accountsSold)),
                cost: [1, "exp"],
            },
            sep1: {
                separator: true,
                condition: () => flags.unlocked.legacy,
            },
            legacyCardsDrawn: {
                display: () => _number(format(game.stats.legacyCardsDrawn)),
                cost: [1, "exp"],
            },
        }
    },
    cards: { 
        items: {
            cardsDrawn: {
                display: () => _number(format(game.stats.cardsDrawn, 0, 13)),
                cost: [100, "points"],
            },
            sep0: {
                separator: true,
            },
            bulkDraw: {
                display: () => _number(format(effects.bulk, 0, 7)),
                cost: [1e6, "points"],
            },
            bulkPower: {
                display: () => _number(format(effects.bulkPower, 0, 7)),
                cost: [1e8, "points"],
            },
            bulkMult: {
                display: () => _number("×" + format(effects.bulkMult, 2, 7)),
                cost: [1e10, "points"],
            },
            energySpeed: {
                condition: () => flags.unlocked.ad || hasCard("standard", "ur", "n1b"),
                display: () => _number("×" + format(effects.energySpeed, 2, 7)),
                cost: [1e16, "points"],
            },
            sep1: {
                separator: true,
                condition: () => flags.unlocked.shreds,
            },
            cardRChance: {
                condition: () => flags.unlocked.shreds,
                display: () => format.chance(effects.cardRChance, 0, 7),
                cost: [1e3, "shreds"],
            },
            cardSRChance: {
                condition: () => flags.unlocked.shreds,
                display: () => format.chance(effects.cardSRChance, 0, 7),
                cost: [1e5, "shreds"],
            },
            cardSSRChance: {
                condition: () => flags.unlocked.shreds,
                display: () => format.chance(effects.cardSSRChance, 0, 7),
                cost: [1e7, "shreds"],
            },
            cardURChance: {
                condition: () => flags.unlocked.shreds,
                display: () => format.chance(effects.cardURChance, 0, 7),
                cost: [1e9, "shreds"],
            },
        }
    },
    points: { 
        items: {
            base: {
                display: () => _number(format(effects.points, 0, 7)),
                cost: [Math.E ** 20, "points"],
            },
            extra: {
                display: () => _number("0~" + format(effects.pointsExtra, 0, 7)),
                cost: [Math.E ** 28, "points"],
            },
            mult: {
                display: () => _number("×" + format(effects.pointsMult, 2, 7)),
                cost: [Math.E ** 36, "points"],
            },
            calc: {
                display: () => {
                    let bulk = getDrawAmount();
                    return _number("~" + format((effects.points + effects.pointsExtra / 2) * effects.pointsMult * bulk, 0, 7))
                },
                cost: [10000, "energy"],
                event: "frame",
            },
        }
    },
    shreds: { 
        condition: () => flags.unlocked.shreds,
        items: {
            base: {
                display: () => _number(format(effects.shredMult, 0, 7)),
                cost: [1e4, "shreds"],
            },
            crownMult: {
                display: () => _number("×" + format(effects.shredCrownMult, 2, 7)),
                cost: [Math.E ** 12, "shreds"],
            },
            rMult: {
                display: () => _number("×" + format(effects.shredRMult, 2, 7)),
                cost: [Math.E ** 15, "shreds"],
            },
            srMult: {
                display: () => _number("×" + format(effects.shredSRMult, 2, 7)),
                cost: [Math.E ** 20, "shreds"],
            },
            ssrMult: {
                display: () => _number("×" + format(effects.shredSSRMult, 2, 7)),
                cost: [Math.E ** 30, "shreds"],
            },
            urMult: {
                display: () => _number("×" + format(effects.shredURMult, 2, 7)),
                cost: [Math.E ** 50, "shreds"],
            },
        }
    },
    faction: { 
        condition: () => flags.unlocked.faction,
        items: {
            chance: {
                display: () => format.chance(effects.factionChance, 0, 7),
                cost: [1e10, "shreds"],
            },
            sep0: {
                separator: true,
            },
            fire: {
                display: () => _number(format(effects.fireGain, 0, 7)),
                cost: [120, "fire"],
            },
            water: {
                display: () => _number(format(effects.waterGain, 0, 7)),
                cost: [120, "water"],
            },
            leaf: {
                display: () => _number(format(effects.leafGain, 0, 7)),
                cost: [120, "leaf"],
            },
            sun: {
                display: () => _number(format(effects.sunGain, 0, 7)),
                cost: [120, "sun"],
            },
            moon: {
                display: () => _number(format(effects.moonGain, 0, 7)),
                cost: [120, "moon"],
            },
            mult: {
                display: () => _number("×" + format(effects.factionMult, 2, 7)),
                cost: [1e18, "shreds"],
            },
            calc: {
                display: () => {
                    if (!game.drawPref.faction) return "-";
                    let bulk = getDrawAmount();
                    return str.format.joiner.currency(_number("~" + format(effects[game.drawPref.faction + "Gain"] * effects.factionChance * effects.factionMult * bulk))
                        , str.currencies[game.drawPref.faction].name());
                },
                cost: [1000000, "energy"],
                event: "frame",
            },
        }
    },
    skills: { 
        condition: () => flags.unlocked.skills,
        items: {
            fireUse: {
                condition: () => hasCard("standard", "ssr", "s_fire"),
                display: () => _number(format(game.stats.skillsUsed.fire ?? 0)),
                cost: [1e5, "fire"],
            },
            waterUse: {
                condition: () => hasCard("standard", "ssr", "s_water"),
                display: () => _number(format(game.stats.skillsUsed.water ?? 0)),
                cost: [1e5, "water"],
            },
            leafUse: {
                condition: () => hasCard("standard", "ssr", "s_leaf"),
                display: () => _number(format(game.stats.skillsUsed.leaf ?? 0)),
                cost: [1e5, "leaf"],
            },
            sunUse: {
                condition: () => hasCard("standard", "ssr", "s_sun"),
                display: () => _number(format(game.stats.skillsUsed.sun ?? 0)),
                cost: [1e5, "sun"],
            },
            moonUse: {
                condition: () => hasCard("standard", "ssr", "s_moon"),
                display: () => _number(format(game.stats.skillsUsed.moon ?? 0)),
                cost: [1e5, "moon"],
            },
            sep0: {
                separator: true,
                condition: () => game.stats.reactionCount > 0
            },
            reaction: {
                condition: () => game.stats.reactionCount > 0,
                display: () => _number(format(game.stats.reactionCount ?? 0)),
                cost: [1e14, "shreds"],
            },
        }
    }
}