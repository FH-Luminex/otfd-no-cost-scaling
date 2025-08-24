const buffs = {
    draw: {
        pointsMult: {
            icons: [
                "mynaui:fat-arrow-up-solid",
                "mdi:star-four-points-circle-outline",
            ],
            effects: [
                (args) => args.mult,
                (args) => args.duration,
            ],
            effectors: {
                pointsMult: [priority.multiplicative, (x) => x * fx(0)],
            }
        },
        shredsMult: {
            icons: [
                "mynaui:fat-arrow-up-solid",
                "lucide:shredder",
            ],
            effects: [
                (args) => args.mult,
                (args) => args.duration,
            ],
            effectors: {
                shredMult: [priority.multiplicative, (x) => x * fx(0)],
            }
        },
        factionMult: {
            icons: [
                "mynaui:fat-arrow-up-solid",
                "majesticons:bookmark-line",
            ],
            effects: [
                (args) => args.mult,
                (args) => args.duration,
            ],
            effectors: {
                factionMult: [priority.multiplicative, (x) => x * fx(0)],
            }
        }
    },
    time: {
        energySpeed: {
            icons: [
                "mdi:radar",
                "material-symbols:bolt-outline-rounded",
            ],
            effects: [
                (args) => args.mult,
                (args) => args.duration,
            ],
            effectors: {
                energySpeed: [priority.multiplicative, (x) => x * fx(0)],
            }
        },
    },
}

function addBuff(type, name, args) {
    if (!game.buffs.active[type]) game.buffs.active[type] = {}
    game.buffs.active[type][name] = {
        ...args,
        timeAdded: Date.now(),
        maxDuration: args.duration
    }
    
    updateEffects();
    updateUnlocks();
    updateBuffUI();
}

let buffButtons = {}

function updateBuffUI() {
    let buttonList = [];
    for (let type in game.buffs.active) {
        for (let buff in game.buffs.active[type]) {
            let id = type + "/" + buff;
            if (!buffButtons[id]) {
                let button = buffButtons[id] = createBuffUI(type, buff);
                button.$event = getBuffEvent(type);
                button.$update = () => {
                    let state = game.buffs.active[type]?.[buff]
                    if (!state) {
                        removeEvent(button.$event, button.$update);
                        button.remove();
                        delete buffButtons[id];
                    } else {
                        button.update();
                    }
                }
                addEvent(button.$event, button.$update);
            }
            buffButtons[id].update();
            buttonList.push([type, buff]);
        }
    }
    buttonList.sort((x, y) => game.buffs.active[x[0]][x[1]].timeAdded - game.buffs.active[y[0]][y[1]].timeAdded);
    for (let [type, buff] of buttonList) {
        let id = type + "/" + buff;
        elms.draw.$buffs.append(buffButtons[id]);
    }
}

function getBuffEvent(type) {
    return ["time"].includes(type) ? "frame" : "card-update";
}