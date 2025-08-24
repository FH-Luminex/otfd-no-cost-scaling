

const SAVE_KEY = "gacha";

function getNewGame() {
    return {
        id: randomStr(16),
        version: 0,
        res: {
            points: 0,
            shreds: 0,
            energy: 0,

            fire: 0,
            water: 0,
            leaf: 0,
            sun: 0,
            moon: 0,

            money: 0,
            exp: 0,
        },
        flags: {
            statUnlocks: {},
            showSeen: {},
            boughtPacks: {},
        },
        time: {
            now: Date.now(),
            drawCooldown: 0,
            skillCooldowns: {},
            skillStacks: {},
            pickit: 5,
            adCooldown: 0,
        },
        stats: {
            timePlayed: 0,
            timeProgress: 0,

            cardsDrawn: 0,
            skillsUsed: {},
            reactionCount: 0,
            autobuyBought: 0,

            accountsSold: 0,
            legacyCardsDrawn: 0,
        },
        buffs: {
            active: {},
            adOffer: "",
        },
        cards: {},
        badges: {},
        drawPref: {
            faction: "",
            skills: {}
        },
        option: {
            language: "en",
            updateRate: 20,
            notation: "default",
            cardImages: 1,
            cardSize: 100,
            verb: "draw",
            music: "",
            volume: {
                music: 0,
            },
            confirm: {
                sellAccount: true,
            }
        },
    }
}