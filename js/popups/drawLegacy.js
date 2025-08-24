popups.drawLegacy = {
    state: {},
    elms: {},
    call(options) {
        let i18n = str.popups.draw;
        let i18nLegacy = str.popups.drawLegacy;
        let popup = makePopup();
        popup.classList.add("clear", "draw-popup", "draw-legacy-popup");
        popup.onpointerdown = () => {
            if (this.state.phase == "breaking") {
                this.state.timer -= effects.breakSkip;
            } else if (this.state.phase == "revealing") {
                this.state.timer = effects.revealTime * (1 - effects.revealSkip);
            }
        }

        this.state = {
            options,
            phase: "breaking",
            timer: effects.breakTime,
            picksLeft: effects.legacyPickCount,
            index: 0,
        };
        this.elms = {
            popup
        };

        let bigCard = this.elms.bigCard = $make("div.big-card.legacy");
        bigCard.innerHTML = `
            <div class="out-flex">
                <span class="number">DTCGco.™</span>
                <div class="flex-fill"></div>
                <small style="text-align: end;">
                    ${
                        "LEGACY<br>EDITION"
                    }
                </small>
            </div>
            <div class="in-flex flex-fill">
                <div class="number" style="font-size:4em">Ω</div>
                <h1 class="number">${i18n.strings.pack_title()}</h1>
                <div>${i18n.strings.pack_subtitle()}</div>
            </div>
            <small class="out-flex" style="align-items: end">
                <div class="flex-fill"></div>
                <small style="text-align: end; font-size: 0.5em">
                    ${i18n.strings.brand_full()} 
                </small>
            </small>
        `
        popup.$body.append(bigCard);

        let header = this.elms.header = $makeHTML("h2.card-header", i18nLegacy.title(_number(format(effects.legacyPickCount))));
        header.style.opacity = 0;
        popup.$body.append(header);

        let list = this.elms.list = $make("div.card-list");
        popup.$body.append(list);

        addEvent("frame", this.onFrame);
        return popup;
    },
    onFrame() {
        let state = popups.drawLegacy.state;
        let localElms = popups.drawLegacy.elms;

        state.timer -= delta / 1000;
        if (state.phase == "breaking") {
            if (state.timer <= 0) {
                localElms.bigCard.classList.add("broken");
                state.phase = "revealing";
                state.timer = effects.revealTime;
            }
            if (effects.breakTime - state.timer > .1) localElms.bigCard.style.setProperty("--timer", 1 - state.timer / effects.breakTime);
            
            let anim = str.verbs[game.option.verb]?._anim?.();
            if (anim == "spin") {
                localElms.bigCard.style.setProperty("--rotate", Math.floor((1 - state.timer / effects.breakTime) ** 5 * 3600) + "deg");
                localElms.bigCard.style.setProperty("--shake", "0px, 0px");
            } else {
                localElms.bigCard.style.setProperty("--rotate", Math.random() * 2 - 1 + "deg");
                localElms.bigCard.style.setProperty("--shake", (Math.random() * 6 - 3) + "px, " + (Math.random() * 6 - 3) + "px");
            }
        } else if (state.phase == "revealing") {
            function pick(choice, card) {
                let [pack, rarity, id, count, info] = choice;
                addCard(pack, rarity, id, count);
                delete card,onclick;
                card.classList.add("picked");
                game.stats.legacyCardsDrawn += count;
                state.picksLeft--;

                if (state.picksLeft <= 0) {
                    localElms.list.classList.remove("done");
                    localElms.list.classList.add("pick-done");
                    localElms.header.style.opacity = 0;
                    
                    setTimeout(() => {
                        popups.drawLegacy.onDone();
                        localElms.popup.close();
                    }, 1000)
                } else {
                    localElms.header.innerHTML = i18nLegacy.title(_number(format(effects.legacyPickCount)));
                }
            }
            for (let option of state.options) {
                let [pack, rarity, id, count, info] = option;
                let card = createCardUI(pack, rarity, id);
                registerTooltip(card, tooltipTemplates.card(pack, rarity, id, "legacy-draw"));

                if (info.isNew) {
                    card.prepend($make("div.new-banner-holder", 
                        $make("div.new-banner", str.common.new())
                    ));
                }
                if (count > 1) {
                    let holder = $make("div.draw-amount.number", "×" + format(count));
                    card.append(holder);
                }

                card.onclick = () => {
                    if (state.picksLeft <= 0) return;

                    if (prefersNoTooltips()) {
                        callPopup("card", pack, rarity, id, "legacy-draw", () => pick(option, card));
                        return;
                    }

                    pick(option, card);
                }

                card.classList.add("anim-draw-in");
                localElms.list.append(card);
            }
            setTimeout(() => {
                localElms.list.classList.add("done");
                localElms.header.style.opacity = "";
            }, 1000)
            state.phase = "done";
        }
    },
    onDone() {
        updateEffects();
        updateUnlocks();
        emit("card-update");

        this.state.canSave = true;
        saveGame();
    },
    onClose() {
        this.state = {};
        this.elms = {};
        removeEvent("frame", this.onFrame);
    }
}