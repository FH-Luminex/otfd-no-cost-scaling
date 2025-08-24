
let tooltip = {
    timeout: 0,
    element: null,
    contentFunc: null,
}
function registerTooltip(element, contentFunc) {
    element.addEventListener("pointerenter", (ev) => {
        clearTimeout(tooltip.timeout);
        if (prefersNoTooltips()) return;
        document.body.addEventListener("pointermove", updateTooltipPos);
        tooltip.element = element;
        tooltip.contentFunc = contentFunc;
        updateTooltipPos(ev);
        tooltip.timeout = setTimeout(() => {
            elms.tooltip.innerHTML = "";
            contentFunc(elms.tooltip);
            elms.tooltip.classList.add("active");
        }, elms.tooltip.classList.contains("active") ? 0 : 300);
    });
    element.addEventListener("pointerleave", () => {
        clearTimeout(tooltip.timeout);
        document.body.removeEventListener("pointermove", updateTooltipPos);
        tooltip.element = tooltip.contentFunc = null
        tooltip.timeout = setTimeout(() => {
            elms.tooltip.classList.remove("active");
        }, 100);
    });
}
let registeredTooltipEvents = {};
function registerTooltipEvent(event) {
    if (!tooltip.element || registeredTooltipEvents[event]) return;
    registeredTooltipEvents[event] = true;
    let elm = tooltip.element;
    let func = tooltip.contentFunc;
    let callback = () => {
        if (!elm.parent) leave();
        requestAnimationFrame(() => func(elms.tooltip));
    }
    let leave = () => {
        removeEvent(event, callback);
        delete registeredTooltipEvents[event];
        elm.removeEventListener("pointerleave", leave);
    }
    addEvent(event, callback);
    elm.addEventListener("pointerleave", leave);
}

function prefersNoTooltips() {
    return window.innerWidth < 800 || window.matchMedia("(hover: none)").matches;
}


function updateTooltipPos(ev) {
    let inset = { top: "auto", left: "auto", bottom: "auto", right: "auto" };

    if (ev.clientX < window.innerWidth / 2) inset.left = ev.clientX + "px";
    else inset.right = window.innerWidth - ev.clientX + "px";
    if (ev.clientY < window.innerHeight / 2) inset.top = ev.clientY + "px";
    else inset.bottom = window.innerHeight - ev.clientY + "px";

    elms.tooltip.style.inset = inset.top + " " + inset.right + " " + inset.bottom + " " + inset.left;
}

let tooltipTemplates = {
    text (text) {
        return (tooltip) => {
            tooltip.innerHTML = typeof text == "function" ? text() : text;
        }
    },
    currency (id) {
        return (tooltip) => {
            let data = currencies[id];
            let i18n = str.currencies[id];

            tooltip.innerHTML = `
                <div class="header">
                    <h2>${i18n.name()}</h2>
                    <small></small>
                </div>
                <div class="quote">
                    ${str.format.marks.quote(verbify(i18n.quote()))}
                </div>
            `

            let info = tooltip.querySelector("small");
            let update = () => {
                if (!info.isConnected || !tooltip.classList.contains("active")) removeEvent("frame", update);
                else {
                    info.innerHTML = getCurrencyInfo(id);
                }
            }
            info.innerHTML = getCurrencyInfo(id);
            addEvent("frame", update);  
        }
    },
    card (pack, rarity, id, mode = null) {
        let data = cards[pack][rarity][id];
        return (tooltip) => {
            let i18n = str.cards[pack][rarity][id];
            let popupI18n = str.popups.card;
            registerTooltipEvent("card-update");
            let state = game.cards[pack]?.[rarity]?.[id];

            let level = 1, stars = 1;
            if (state) ({level, stars} = state);
            let curFx = [], newFx = null;
            fx = (x) => curFx[x];
            for (let f of data.effects) curFx.push(f(level, stars));

            if (mode == "level-up") {
                if (!data.maxLevel || level < data.maxLevel) {
                    newFx = [];
                    fx = (x) => newFx[x];
                    for (let f of data.effects) newFx.push(f(level + 1, stars));
                }
            } else if (mode == "star-up") {
                if (stars < 5) {
                    newFx = [];
                    fx = (x) => newFx[x];
                    for (let f of data.effects) newFx.push(f(level, stars + 1));
                }
            }

            tooltip.innerHTML = `
                <div class="header">
                    <h2><rarity rarity="${rarity}"></rarity> ${i18n.name()}</h2>
                    <small>
                        ${game.debug ? `(ID: ${pack}/${rarity}/${id})<br>` : ""}
                        ${state ? `
                            ${data.faction
                                ? `${popupI18n.factions[data.faction]()}<br>`
                                : ``
                            }
                            ${data.crown 
                                ? ``
                                : `${popupI18n.strings.copies(_number(`+${format(state.amount)}`))}<br>`
                            }
                            ${data.crown 
                                ? popupI18n.strings.crown()
                                : popupI18n.strings.stars(_number(`${format(state.stars)}/${format(5)}`))
                            }
                            ${data.levelCost ? data.maxLevel
                                ? popupI18n.strings.level(_number(`${format(state.level)}/${format(data.maxLevel)}`))
                                : popupI18n.strings.level(_number(format(state.level)))
                                : ``
                            }
                        ` : popupI18n.strings.notOwned()}
                    </small>
                </div>
                <div>
                    ${verbify(format.effect(i18n.desc(), curFx, newFx))}
                </div>
            `

            if (mode == "level-up") {
                if (!data.levelCost) {
                    tooltip.innerHTML += `<div class="action">
                        ${popupI18n.strings.level_cant()}
                    </div>`
                } else if (data.maxLevel && state.level >= data.maxLevel) {
                    tooltip.innerHTML += `<div class="action">
                        ${popupI18n.strings.level_cant_max()}
                    </div>`
                } else {
                    let levelCost = getCardLevelCost(pack, rarity, id);
                    let canLevelUp = game.res[levelCost[1]] >= levelCost[0];
                    let name = str.currencies[levelCost[1]].name();
                    tooltip.innerHTML += `<div class="formula"> 
                        <h4>${popupI18n.strings.level_cost()}</h4>
                        <div><span>${name}</span>${_number(format.currency(levelCost[1], game.res[levelCost[1]]) + " / " + format.currency(levelCost[1], levelCost[0]))}</div>
                    </div><div class="action">
                        ${canLevelUp ? popupI18n.strings.level_prompt() : popupI18n.strings.level_cant_cost(name)}
                    </div>`
                }
            } else if (mode == "star-up") {
                if (data.crown) {
                    tooltip.innerHTML += `<div class="action">
                        ${popupI18n.strings.star_cant()}
                    </div>`
                } else if (state.stars >= 5) {
                    tooltip.innerHTML += `<div class="action">
                        ${popupI18n.strings.star_cant_max()}
                    </div>`
                } else {
                    let starCost = getCardStarCost(pack, rarity, id);
                    let canStarUp = state.amount >= starCost;
                    tooltip.innerHTML += `<div class="formula"> 
                        <h4>${popupI18n.strings.star_cost()}</h4>
                        <div><span>${popupI18n.strings.star_cost_copies(i18n.name)}</span>${_number(format(state.amount) + " / " + format(starCost))}</div>
                    </div><div class="action">
                        ${canStarUp ? popupI18n.strings.star_prompt() : popupI18n.strings.star_cant_cost()}
                    </div>`
                }
            } else if (mode == "buy") {
                let buyCost = unwrapFn(data.buyCost);
                let canBuy = game.res[buyCost[1]] >= buyCost[0];
                let name = str.currencies[buyCost[1]].name();
                tooltip.innerHTML += `<div class="formula"> 
                    <h4>Purchase cost:</h4>
                    <div><span>${name}</span>${_number(format.currency(buyCost[1], game.res[buyCost[1]]) + " / " + format.currency(buyCost[1], buyCost[0]))}</div>
                </div><div class="action">
                    ${canBuy ? popupI18n.strings.buy_prompt() : "Insufficient " + name + "."}
                </div>`
            } else if (mode == "legacy-draw") {
                tooltip.innerHTML += `<div class="quote">
                    ${str.format.marks.quote(verbify(i18n.quote()))}
                </div><div class="action">
                    ${popupI18n.strings.legacyDraw_prompt()}
                </div>`
            } else {
                tooltip.innerHTML += `<div class="quote">
                    ${str.format.marks.quote(verbify(i18n.quote()))}
                </div>`
            }
        }
    },
    skill (skill) {
        let data = skills[skill];
        return (tooltip) => {
            let i18n = str.skills[skill];
            let popupI18n = str.popups.skill
            if (hasCard("standard", "ssr", "s_" + skill)) {
                tooltip.innerHTML = `
                    <div class="header">
                        <h2>${i18n.name()}</h2>
                        <small>
                            ${game.debug ? `(ID: ${skill})<br>` : ""}
                            ${popupI18n.strings.skill()}
                        </small>
                    </div>
                    <div>
                        ${verbify(data.desc())}
                    </div>
                `
            } else {
                tooltip.textContent = popupI18n.strings.skill_locked();
            }
        }
    },
    buff (type, buff) {
        return (tooltip) => {
            let data = buffs[type][buff];
            let i18n = str.buffs[type][buff];
            let state = game.buffs.active[type][buff];
            let popupI18n = str.popups.buff;

            let info;
            tooltip.innerHTML = `
                <div class="header">
                    <h2>${i18n.name()}</h2>
                    <small>
                        ${game.debug ? `(ID: ${type}/${buff})<br>` : ""}
                        ${popupI18n.strings.buff()}
                    </small>
                </div>
            `
            tooltip.append(info = $make("div"));

            let event = getBuffEvent(type);
            let check = () => {
                if (!info.isConnected || !tooltip.classList.contains("active")) {
                    removeEvent("frame", check)
                    removeEvent(event, update);
                }
            }
            let update = () => {
                let curFx = [];
                fx = (x) => curFx[x];
                for (let f of data.effects) curFx.push(f(state));
                info.innerHTML = verbify(format.effect(i18n.desc(), curFx));
            }
            update();
            addEvent("frame", check);  
            addEvent(event, update);  
        }
    },
    badge(badge) {
        let data = badges[badge];
        return (tooltip) => {
            let obtained = !!game.badges[badge];
            tooltip.innerHTML = `
                <div class="header">
                    <h2>${verbify(str.badges[badge].name())}</h2>
                    <small>
                        ${game.debug ? `(ID: ${badge})<br>` : ""}
                        ${str.popups.badge.strings["state_" + (obtained ? "obtained" : "locked")]()}
                    </small>
                </div>
                <div>
                    ${obtained ? verbify(str.badges[badge].desc()) : str.popups.badge.strings.lock_desc()}
                </div>
            `
        }
    }
}

function getCurrencyInfo(id) {
    let i18n = str.popups.currency;
    let result = "";

    if (game.debug) result += `(ID: ${id})<br>`;

    if (id == "energy") {
        let eff = addWithCapEfficiency(game.res[id], effects.energyCap, 2);
        result += `
            ${i18n.strings.amount_have(_number(format(game.res[id], 0, 14)))}<br>
            ${i18n.strings.speed_minute(_number(format(effects.bulkPower * eff)))}
            ${effects.bulkPower == 0 ? "" 
                : eff == 1 ? i18n.strings.toCap(_number(format.time((effects.energyCap - game.res[id]) / effects.bulkPower / effects.energySpeed * 60)))
                : i18n.strings.efficiency(_number(format.chance(eff)))
            }
        `
    } else if (id == "cards") {
        result += verbify(i18n.strings.amount_drawn(_number(format(game.stats.cardsDrawn, 0, 14))))
    } else {
        result += i18n.strings.amount_have(_number(format.currency(id, game.res[id], 14)))
    }

    return result;
}