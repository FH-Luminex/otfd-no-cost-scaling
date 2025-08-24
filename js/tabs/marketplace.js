tabs.marketplace = {
    name: "Marketplace",
    icon: "mdi:shop-outline",

    subtab: "ingame",
    cards: {},
    packs: {},
    elms: {},

    onInit() {
        let holder = $make("div.subtab-holder");
        elms.tab.append(holder);

        let tabButtons = this.elms.tabButtons = createChoiceGroup({
            meta: [$icon("iconoir:globe"), " " + str.tabs.marketplace.subtabs.meta()],
            ingame: [$icon("1tfd:app"), " " + str.tabs.marketplace.subtabs.ingame()],
        }, this.subtab, (x) => {
            this.subtab = x;
            this.rebuildUI();
        });
        tabButtons.className = "tab-buttons";
        registerHorizontalScrollWheel(tabButtons);
        holder.append(tabButtons);

        let content = this.elms.content = $make("div.subtab-content");
        content.onscroll = (e) => elms.tab.style.setProperty("--scroll", content.scrollTop + "px")
        holder.append(content);

        this.rebuildUI();
        addEvent("card-update", this.onCardUpdate);
        addEvent("frame", this.onFrame);
    },
    onDestroy() {
        this.cards = {};
        this.elms = {};
        removeEvent("card-update", this.onCardUpdate);
        removeEvent("frame", this.onFrame);
        elms.tab.style.removeProperty("--scroll");
    },
    
    rebuildUI() {
        this.elms.tabButtons.style.display = (
            game.stats.accountsSold > 0 || game.stats.cardsDrawn >= MAX_CARDS
        ) ? "" : "none";

        this.elms.content.setAttribute("tab-name", str.tabs.marketplace.subtabs[this.subtab]());
        this.elms.content.textContent = "";
        let content = this.elms.content;
        let i18n = str.tabs.marketplace

        let list;

        if (this.subtab == "ingame") {
            content.append(this.elms.adHead = $makeHTML("h3.section-header", i18n.headers.cinema()));
            list = this.elms.adList = $make("div.market-list");
            content.append(list);

            let adBox = this.elms.adBox = $makeHTML("div.market-item.long", `
                <h4>${i18n.strings.ad_title()}</h4>
            `)
            adBox.append(adBox.$effect = $make("p"), $make("div.flex-fill"))
            let watchBtn = adBox.$watchBtn = $make("button.value");
            watchBtn.onclick = () => playAd();
            let rerollBtn = adBox.$rerollBtn = $make("button", i18n.strings.ad_reroll());
            rerollBtn.onclick = () => rerollAd();
            let buttons = $make("div.buttons", rerollBtn, $make("span.flex-fill"), watchBtn);
            adBox.append(buttons);
            list.append(adBox);

            content.append(this.elms.packHead = $makeHTML("h3.section-header", i18n.headers.boosterPacks()));
            list = this.elms.packList = $make("div.market-list");
            list.$packs = [];
            content.append(list.$placeholder = $make("div.note-container", str.tabs.common.strings.nothing()));
            content.append(list);

            content.append(this.elms.cardHead = $makeHTML("h3.section-header", i18n.headers.exCards()));
            list = this.elms.cardList = $make("div.card-list");
            list.$cards = [];
            content.append(list.$placeholder = $make("div.note-container", str.tabs.common.strings.nothing()));
            content.append(list);
        } else if (this.subtab == "meta") {
            content.append($makeHTML("h3.section-header", i18n.headers.accountMarket()));

            list = $make("div.market-list");
            content.append(list);
            {
                let card = this.elms.accountSell = $makeHTML("div.market-item.long.account-sell", `
                    <h4>${i18n.strings.sellAccount()}</h4>
                    <p>${i18n.strings.sellAccount_desc()}</p>
                `)
                card.append(card.$info = $make("div.sell-value"));
                card.append($make("div.flex-fill"));
                let button = card.$button = $make("button.value");
                button.onclick = () => sellAccount();
                let buttons = $make("div.buttons", button);
                card.append(buttons);
                list.append(card);
            }

            // content.append($makeHTML("h3.section-header", str.tabs.marketplace.headers.exCards()));
            // let list = this.elms.cardList = $make("div.card-list");
            // list.$cards = [];
            // content.append(list.$placeholder = $make("div.note-container", str.tabs.common.strings.nothing()));
            // content.append(list);
            // this.updateCards("meta", "ex", list, (pack, rarity, id, data) => {
            //     return !hasCard(pack, rarity, id) && (!data.condition || data.condition());
            // });
        }

        this.updateUI();
    },
    updateUI() {
        this.elms.tabButtons.style.display = (
            game.stats.accountsSold > 0 || game.stats.cardsDrawn >= MAX_CARDS
        ) ? "" : "none";

        let content = this.elms.content;
        let i18n = str.tabs.marketplace;

        if (this.subtab == "ingame") {

            let packs = ["standard"];
            if (flags.unlocked.legacy) {
                packs.unshift("standard_legacy");
            }

            let adVisible = flags.unlocked.ad;
            this.elms.adHead.style.display = this.elms.adList.style.display = 
                adVisible ? "" : "none";
            if (adVisible) {
                if (game.time.adCooldown <= 0) {
                    if (!game.buffs.adOffer) {
                        game.buffs.adOffer = {
                            type: Object.keys(adOffers).filter(x => !adOffers[x].condition || adOffers[x].condition()).pick(),
                            args: {
                                rng: Math.random()
                            }
                        }
                        saveGame();
                    }
                    let offer = game.buffs.adOffer;
                    let offerData = adOffers[offer.type].getOffer(offer.args);
                    this.elms.adBox.$effect.innerHTML = verbify(format.effect(i18n.strings.ad_effects[offer.type](), adOffers[offer.type].getDisplayArgs(offerData)));
                }
            } else {
                this.elms.packList.$placeholder.style.display = "none";
            }


            let packVisible = game.stats.accountsSold >= 1;
            this.elms.packHead.style.display = this.elms.packList.style.display = 
                packVisible ? "" : "none";
            if (packVisible) {
                this.updatePacks("standard", this.elms.packList, (pack, data) => {
                    return (!data.condition || data.condition());
                })
            } else {
                this.elms.packList.$placeholder.style.display = "none";
            }

            let cardVisible = game.stats.accountsSold < 1 || hasCard("standard_legacy", "ex", "legacy");
            this.elms.cardHead.style.display = this.elms.cardList.style.display = 
                cardVisible ? "" : "none";
            if (cardVisible) {
                this.updateCards(packs, "ex", this.elms.cardList, (pack, rarity, id, data) => {
                    return !hasCard(pack, rarity, id) && (!data.available || data.available()) && (!data.condition || data.condition());
                });
            } else {
                this.elms.cardList.$placeholder.style.display = "none";
            }
            
        } else if (this.subtab == "meta") {
            if (game.stats.cardsDrawn >= MAX_CARDS) {
                let sellValue = getSellValue();
                this.elms.accountSell.$info.innerHTML = `
                    <p>${i18n.strings.sellAccount_gain()}</p>
                    <ul>
                        <li>${i18n.strings.sellAccount_gain_money(_number(format.currency("money", sellValue.money)))}</li>
                        <li>${i18n.strings.sellAccount_gain_exp(_number(format.currency("exp", sellValue.exp)))}</li>
                    </ul>
                `

                this.elms.accountSell.$button.classList.add("value");
                this.elms.accountSell.$button.disabled = false;
                this.elms.accountSell.$button.innerHTML = _icon("fluent-emoji-high-contrast:money-with-wings") + " " + i18n.strings.sellAccount_action();
            } else {
                this.elms.accountSell.$info.innerHTML = `
                    <p>${verbify(i18n.strings.sellAccount_req(_number(format(MAX_CARDS, 0, 11))))}</p>
                `;

                this.elms.accountSell.$button.classList.remove("value");
                this.elms.accountSell.$button.disabled = true;
                this.elms.accountSell.$button.innerHTML = i18n.strings.sellAccount_actionLocked();
            }
        }
        this.onFrame();
    },

    updateCards(packs, rarity, list, cardCondition) {
        let destroyingCards = {...this.cards};
        let cardList = [];
        for (let pack of packs) for (let id in cards[pack][rarity]) {
            let data = cards[pack][rarity][id];
            if (cardCondition(pack, rarity, id, data)) cardList.push([pack, rarity, id]);
        }

        for (let card of cardList) {
            let [pack, rarity, id] = card;
            let listId = pack + " " + rarity + " " + id;
            delete destroyingCards[listId];
            let div = list.$cards[listId] || this.makeCard(pack, rarity, id);
            div.update();
            list.append(div);
        }
        for (let card in destroyingCards) {
            destroyingCards[card].remove();
            delete this.cards[card];
        }

        list.$placeholder.style.display = cardList.length > 0 ? "none" : "";
    },
    makeCard(pack, rarity, id) {
        let listId = pack + " " + rarity + " " + id;

        let div = $make("div.card-block");
        
        let card = div.$card = createCardUI(pack, rarity, id);
        registerTooltip(card, tooltipTemplates.card(pack, rarity, id))
        card.onclick = () => { if (prefersNoTooltips()) callPopup("card", pack, rarity, id, "purchase"); }
        div.append(card);
        
        let actions = $make("div.card-action");
        div.append(actions);
        
        let buyBtn = div.$levelBtn = $make("button");
        buyBtn.onclick = () => buyCard(pack, rarity, id);
        registerTooltip(buyBtn, tooltipTemplates.card(pack, rarity, id, "buy"))
        actions.append(buyBtn);
        
        div.update = () => {
            card.update();
            let data = cards[pack][rarity][id];
            let buyCost = unwrapFn(data.buyCost);

            buyBtn.style.setProperty("--progress", game.res[buyCost[1]] / buyCost[0]);
            let canBuy = game.res[buyCost[1]] >= buyCost[0];
            buyBtn.setAttribute("state", canBuy ? "" : "noafford");
            buyBtn.disabled = !canBuy;
            levelText = _icon("tabler:shopping-cart");

            if (buyBtn.innerHTML != levelText) buyBtn.innerHTML = levelText;
            
        }

        this.cards[listId] = div;

        return div;
    },
    
    updatePacks(pack, list, packCondition) {
        let destroyingPacks = {...this.packs};
        let packList = [];
        for (let id in packs[pack]) {
            let data = packs[pack][id];
            if (packCondition(pack, data)) packList.push([pack, id]);
        }

        for (let packDef of packList) {
            let [pack, id] = packDef;
            let listId = pack + " " + id;
            delete destroyingPacks[listId];
            let div = list.$packs[listId] || this.makePack(pack, id);
            div.update();
            list.append(div);
        }
        for (let pack in destroyingPacks) {
            destroyingPacks[pack].remove();
            delete this.packs[pack];
        }

        list.$placeholder.style.display = packList.length > 0 ? "none" : "";
    },
    makePack(pack, id) {
        let listId = pack + " " + id;
        let i18n = str.packs[pack][id]

        let desc;

        let div = $make("div.market-item", 
            $makeHTML("h4", i18n.name()),
            desc = $make("p"),
            $make("span.flex-fill")
        );

        let buyBtn = $make("button.value");
        buyBtn.onclick = () => callPopup("pack", pack, id);
        let buttons = $make("div", buyBtn);
        div.append(buttons);

        div.update = () => {
            let data = packs[pack][id];
            
            buyBtn.style.setProperty("--progress", game.res[data.cost[1]] / data.cost[0]);
            let canBuy = game.res[data.cost[1]] >= data.cost[0];
            buyBtn.disabled = !canBuy;
            buyBtn.classList.toggle("value", canBuy);
            levelText = _icon("tabler:shopping-cart") + " " + _number(format.currency(data.cost[1], data.cost[0]));

            desc.innerHTML = format.effect(i18n.desc(), data.effects);

            if (buyBtn.innerHTML != levelText) buyBtn.innerHTML = levelText;
            
        }

        this.packs[listId] = div;

        return div;
    },

    onCardUpdate() {
        tabs.marketplace.rebuildUI();
    },
    onFrame() {
        let self = tabs.marketplace;
        let i18n = str.tabs.marketplace;
        if (self.subtab == "ingame") {
            if (flags.unlocked.ad) {
                let btnHTML, infoHTML;
                let isCooldown = game.time.adCooldown > 0;
                if (isCooldown) {
                    infoHTML = i18n.strings.ad_cooldown(_number(format.time(game.time.adCooldown * effects.adCooldown)));
                    btnHTML = i18n.strings.ad_actionCooldown();
                } else {
                    if (self.elms.adBox.$watchBtn.disabled) {
                        self.elms.adBox.$watchBtn.disabled = false;
                        self.updateUI();
                    }
                    btnHTML = _icon("fluent:filmstrip-play-24-regular") + " " + i18n.strings.ad_action();
                }
                self.elms.adBox.$watchBtn.disabled = isCooldown;
                self.elms.adBox.$watchBtn.classList.toggle("value", !isCooldown);
                if (self.elms.adBox.$watchBtn.innerHTML != btnHTML)
                    self.elms.adBox.$watchBtn.innerHTML = btnHTML;
                if (infoHTML && self.elms.adBox.$effect.innerHTML != infoHTML)
                    self.elms.adBox.$effect.innerHTML = infoHTML;
                self.elms.adBox.$rerollBtn.style.display = isCooldown || !flags.unlocked.adReroll ? "none" : "";
            } 
        }
    }
}