tabs.collection = {
    name: "Collection",
    icon: "tabler:stack-2",

    subtab: "regular",
    cards: {},
    cardList: [],
    elms: {},
    filters: {
        rarity: "",
        faction: "any",
        pickit: "",
    },
    


    onInit() {
        let holder = $make("div.subtab-holder");
        elms.tab.append(holder);
        let hozHolder;
        let i18n = str.tabs.collection;

        holder.append(this.elms.tabButtons = hozHolder = createChoiceGroup({
            "regular": [$icon("1tfd:card-1"), " " + i18n.filters.type.regular()],
            "legacy": [$icon("1tfd:card-2"), " " + i18n.filters.type.legacy()],
        }, this.subtab, (x) => {
            this.subtab = x;
            this.filters.pickit = "";
            this.updateCards();
        }));
        hozHolder.className = "tab-buttons";
        registerHorizontalScrollWheel(hozHolder);
        holder.append(hozHolder);

        let content = this.elms.content = $make("div.subtab-content");
        content.onscroll = (e) => elms.tab.style.setProperty("--scroll", content.scrollTop + "px")
        holder.append(content);

        let filters = this.elms.filters = $make("div.card-filters");
        registerHorizontalScrollWheel(filters);
        content.append(filters);

        filters.append(this.elms.filterRarity = hozHolder = createChoiceGroup({
            "": $icon("tabler:asterisk"),
            "n": $makeHTML("span", "<rarity rarity='n'>"),
            "r": $makeHTML("span", "<rarity rarity='r'>"),
            "sr": $makeHTML("span", "<rarity rarity='sr'>"),
            "ssr": $makeHTML("span", "<rarity rarity='ssr'>"),
            "ur": $makeHTML("span", "<rarity rarity='ur'>"),
            "ex": $makeHTML("span", "<rarity rarity='ex'>"),
        }, this.filters.rarity, (x) => {
            this.filters.rarity = x;
            this.updateCards();
        }));
        [
            i18n.filters.rarity.any,
            i18n.filters.rarity.n,
            i18n.filters.rarity.r,
            i18n.filters.rarity.sr,
            i18n.filters.rarity.ssr,
            i18n.filters.rarity.ur,
            i18n.filters.rarity.ex,
        ].forEach((x, i) => {
            registerTooltip(hozHolder.childNodes[i], tooltipTemplates.text(x));
        });

        filters.append(this.elms.filterFaction = hozHolder = createChoiceGroup({
            "any": $icon("tabler:asterisk"),
            "": $icon("tabler:circle-dashed"),
            "fire": $icon(currencies.fire.icon),
            "water": $icon(currencies.water.icon),
            "leaf": $icon(currencies.leaf.icon),
            "sun": $icon(currencies.sun.icon),
            "moon": $icon(currencies.moon.icon),
        }, this.filters.faction, (x) => {
            this.filters.faction = x;
            this.updateCards();
        }));
        [
            i18n.filters.faction.any,
            i18n.filters.faction.none,
            i18n.filters.faction.fire,
            i18n.filters.faction.water,
            i18n.filters.faction.leaf,
            i18n.filters.faction.sun,
            i18n.filters.faction.moon,
        ].forEach((x, i) => {
            registerTooltip(hozHolder.childNodes[i], tooltipTemplates.text(x));
        });
        ["fire", "water", "leaf", "sun", "moon"].forEach((x, i) => {
            hozHolder.childNodes[i + 2].classList.add("f-" + x);
        });    

        filters.append(this.elms.pickit = hozHolder = createChoiceGroup({
            "": $icon("tabler:asterisk"),
            "on": $icon("tabler:arrow-big-up"),
        }, this.filters.pickit, (x) => {
            this.filters.pickit = x;
            this.updateCards();
            if (x) doUIFrame();
        }));
        [
            i18n.filters.pickit.off,
            i18n.filters.pickit.on,
        ].forEach((x, i) => {
            registerTooltip(hozHolder.childNodes[i], tooltipTemplates.text(x));
        });
        hozHolder.childNodes[1].classList.add("value");
        hozHolder.append(this.elms.pickit.$clock = $make("div.number", "0s"));

        filters.append(this.elms.iris = $make("div.choice-group"));
        this.elms.iris.append(
            this.elms.iris.$inHand = $make("div.number", "0"),
            this.elms.iris.$inPool = $make("div.number", "0"),
            this.elms.iris.$inGame = $make("div.number", "0")
        )
        registerInfoButton(this.elms.iris, () => `
            <p>${i18n.filters.iris.info1()}</p><ul>
                <li><p>${i18n.filters.iris.infoInHand()}</p></li>
                <li><p>${i18n.filters.iris.infoInPool()}</p></li>
                <li><p>${i18n.filters.iris.infoInGame()}</p></li>
            </ul><p>${i18n.filters.iris.info2()}</p>
        `)

        content.append(this.elms.placeholder = $makeHTML("div.note-container", str.tabs.common.strings.nothing()));

        let list = this.elms.list = $make("div.card-list");
        content.append(list);

        this.updateCards();
        addEvent("frame", this.onFrame);
        addEvent("card-update", this.onCardUpdate);
    },
    onDestroy() {
        this.cards = {};
        this.cardList = [];
        this.elms = {};
        this.filters.pickit = "";
        removeEvent("frame", this.onFrame);
        removeEvent("card-update", this.onCardUpdate);
        elms.tab.style.removeProperty("--scroll");
    },
    onFrame() {
        let localElms = tabs.collection.elms;
        if (flags.unlocked.pickit) {
            localElms.pickit.$clock.innerText = format.time(game.time.pickit, 2, 2);
        }
    },

    updateCards() {
        let destroyingCards = {...this.cards};
        let cardList = this.cardList = [];
        let pack = {
            regular: "standard",
            legacy: "standard_legacy",
        }[this.subtab]

        let canFilter = hasCard("standard", "sr", "c1") || hasCard("standard_legacy", "ex", "pickit")
        let unlocked = {
            regular: {
                filterRarity: canFilter,
                filterFaction: canFilter,
                iris: flags.unlocked.iris,
                pickit: flags.unlocked.pickit,
            },
            legacy: {

            }
        }[this.subtab]

        let inHand = 0, inPool = 0, inGame = 0;
        if (game.cards[pack]) for (let rarity in cards[pack]) for (let id in cards[pack][rarity]) {
            let data = cards[pack][rarity][id];

            if (data.available && !data.available()) continue;
            if (unlocked.filterRarity && this.filters.rarity && this.filters.rarity != rarity) continue;
            if (unlocked.filterFaction && this.filters.faction != "any" && this.filters.faction != (data.faction ?? "")) continue;

            if (flags.unlocked.iris) {
                inGame++;
                if (game.cards[pack][rarity]?.[id]) { inHand++; inPool++; }
                else if (!data.condition || data.condition()) inPool++;
            }

            if (!game.cards[pack][rarity]?.[id]) continue;

            if (this.filters.pickit) {
                let levelCost = getCardLevelCost(pack, rarity, id, 1);
                let starCost = getCardStarCost(pack, rarity, id);
                if (game.res[levelCost[1]] < levelCost[0] && game.cards[pack][rarity]?.[id].amount < starCost) continue;
            }

            cardList.push([pack, rarity, id]);
        }

        if (this.filters.pickit) {
            cardList.map(x => {
                let [pack, rarity, id] = x;
                let levelCost = getCardLevelCost(pack, rarity, id, 1);
                x[3] = (game.res[levelCost[1]] / levelCost[0]) || 0;
                return x;
            });
            cardList.sort((x, y) => y[3] - x[3]);
        }

        let shouldAppend = false;
        let index = 0;
        for (let card of cardList) {
            let [pack, rarity, id] = card;
            let listId = pack + " " + rarity + " " + id;
            delete destroyingCards[listId];
            let div = this.cards[listId] || this.makeCard(pack, rarity, id);
            div.update();
            if (this.elms.list.children[index] != div) shouldAppend = true;
            if (shouldAppend) this.elms.list.append(div);
            index++;
        }
        
        for (let card in destroyingCards) {
            destroyingCards[card].remove();
            delete this.cards[card];
        }

        this.elms.tabButtons.style.display = flags.unlocked.legacy ? "" : "none";
        this.elms.filterRarity.style.display = unlocked.filterRarity ? "" : "none";
        this.elms.filterFaction.style.display = unlocked.filterFaction ? "" : "none";
        this.elms.pickit.style.display = unlocked.pickit ? "" : "none";
        this.elms.iris.style.display = unlocked.iris ? "" : "none";
        this.elms.filters.style.display = unlocked.filterRarity ? "" : "none";
        this.elms.placeholder.style.display = cardList.length > 0 ? "none" : "";
        if (flags.unlocked.iris) {
            this.elms.iris.$inGame.innerText = inGame;
            this.elms.iris.$inPool.innerText = inPool;
            this.elms.iris.$inHand.innerText = inHand;
        }

        this.elms.content.setAttribute("tab-name", str.tabs.collection.filters.type[this.subtab]())
    },
    makeCard(pack, rarity, id) {
        let listId = pack + " " + rarity + " " + id;

        let div = $make("div.card-block");
        
        let card = div.$card = createCardUI(pack, rarity, id);
        registerTooltip(card, tooltipTemplates.card(pack, rarity, id));
        card.onclick = () => { if (prefersNoTooltips()) callPopup("card", pack, rarity, id, "upgrade"); }
        div.append(card);

        let actions = $make("div.card-action");
        div.append(actions);
        
        let levelBtn = div.$levelBtn = $make("button");
        levelBtn.onclick = () => levelUpCard(pack, rarity, id);
        registerTooltip(levelBtn, tooltipTemplates.card(pack, rarity, id, "level-up"))
        actions.append(levelBtn);
        
        let starBtn = div.$levelBtn = $make("button");
        starBtn.onclick = () => starUpCard(pack, rarity, id);
        registerTooltip(starBtn, tooltipTemplates.card(pack, rarity, id, "star-up"))
        actions.append(starBtn);
        
        div.update = () => {
            card.update();
            let data = cards[pack][rarity][id];
            let state = game.cards[pack]?.[rarity]?.[id];
            
            let levelText = "";
            if (!data.levelCost) {
                levelBtn.setAttribute("state", "off");
                levelBtn.disabled = true;
                levelText = _icon("tabler:minus");
            } else if (data.maxLevel && state.level >= data.maxLevel) {
                levelBtn.setAttribute("state", "max");
                levelBtn.disabled = true;
                levelText = _icon("tabler:check");
            } else {
                let levelCost = getCardLevelCost(pack, rarity, id);
                levelBtn.style.setProperty("--progress", game.res[levelCost[1]] / levelCost[0]);
                let canLevelUp = game.res[levelCost[1]] >= levelCost[0];
                levelBtn.disabled = !canLevelUp;
                levelBtn.setAttribute("state", canLevelUp ? "" : "noafford");
                levelText = _icon(levelCost[1] == "points" ? "tabler:arrow-big-up" : currencies[levelCost[1]].icon);
            }
            if (levelBtn.innerHTML != levelText) levelBtn.innerHTML = levelText;
            
            let starText = "";
            if (data.crown) {
                starBtn.setAttribute("state", "off");
                starBtn.disabled = true;
                starText = _icon("tabler:minus");
            } else if (state.stars >= 5) {
                starBtn.setAttribute("state", "max");
                starBtn.disabled = true;
                starText = _icon("tabler:check");
            } else {
                let starCost = getCardStarCost(pack, rarity, id);
                starBtn.style.setProperty("--progress", state.amount / starCost);
                let canStarUp = state.amount >= starCost;
                starBtn.disabled = !canStarUp;
                starBtn.setAttribute("state", canStarUp ? "" : "noafford");
                starText = _icon("tabler:star");
            }
            if (starBtn.innerHTML != starText) starBtn.innerHTML = starText;
        }

        this.cards[listId] = div;

        return div;
    },
    onCardUpdate() {
        tabs.collection.updateCards();
    }
}