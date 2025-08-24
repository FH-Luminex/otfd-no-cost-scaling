popups.card = {
    state: {},
    elms: {},
    call(pack, rarity, id, mode, args) {
        this.state = {pack, rarity, id, mode, args};
        let popup = makePopup();

        let info = this.elms.info = $make("div.info");
        popup.$body.append(info);

        if (mode) {
            let actions = this.elms.actions = $make("div.popup-card-actions");

            popup.$body.append(actions);
            popup.$body.append($make("hr"));
        }

        let actions = $make("div.actions");
        popup.$body.append(actions);

        let close = $make("button", str.popups.common.action_close());
        if (!["legacy-draw"].includes(mode)) close.classList.add("primary");
        close.onclick = () => popup.close();
        actions.append(close);

        addEvent("card-update", this.onUpdate);
        this.onUpdate();
        this.state.popup = popup;
        return popup;
    },
    onUpdate() {
        let localElms = popups.card.elms;
        let {pack, rarity, id, mode, viewType} = popups.card.state;
        let data = cards[pack][rarity][id];
        let i18n = str.cards[pack][rarity][id];
        let state = game.cards[pack]?.[rarity]?.[id];
        let popupI18n = str.popups.card;

        let level = 1, stars = 1;
        if (state) ({level, stars} = state);
        let curFx = [], newFx = null;
        fx = (x) => curFx[x];
        for (let f of data.effects) curFx.push(f(level, stars));

        if (viewType == "level-up") {
            if (data.maxLevel && level >= data.maxLevel) {
                viewType = "";
            } else {
                newFx = [];
                fx = (x) => newFx[x];
                for (let f of data.effects) newFx.push(f(level + 1, stars));
            }
        } else if (viewType == "star-up") {
            if (stars >= 5) {
                viewType = "";
            } else {
                newFx = [];
                fx = (x) => newFx[x];
                for (let f of data.effects) newFx.push(f(level, stars + 1));
            }
        }

        function setViewType(type) {
            popups.card.state.viewType = popups.card.state.viewType == type ? "" : type;
            popups.card.onUpdate();
        }

        localElms.info.innerHTML = `
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
            <div class="quote">
                ${str.format.marks.quote(verbify(i18n.quote()))}
            </div>
        `

        if (mode == "upgrade") {
            localElms.actions.innerHTML = "";

            if (!data.levelCost) {
                localElms.actions.insertAdjacentHTML("beforeend", `
                    <div class="formula" style="padding-inline: 10px">
                        <h4>${popupI18n.strings.level_title()}</h4>
                    </div>
                    <div class="actions popup-upg-actions">
                        <button class="popup-upg-main-action" disabled>${popupI18n.strings.level_button_cant()}</button>
                    </div>
                `);
            } else if (data.maxLevel && state.level >= data.maxLevel) {
                localElms.actions.insertAdjacentHTML("beforeend", `
                    <div class="formula" style="padding-inline: 10px">
                        <h4>${popupI18n.strings.level_title()}</h4>
                    </div>
                    <div class="actions popup-upg-actions">
                        <button class="popup-upg-main-action" disabled>${popupI18n.strings.level_button_max()}</button>
                    </div>
                `);
            } else {
                let levelCost = getCardLevelCost(pack, rarity, id);
                let name = str.currencies[levelCost[1]].name();
                let canBuy = game.res[levelCost[1]] >= levelCost[0];
                localElms.actions.insertAdjacentHTML("beforeend", `
                    <div class="formula" style="padding-inline: 10px">
                        <h4>${popupI18n.strings.level_cost()}</h4>
                        <div><span>${name}</span>${_number(format.currency(levelCost[1], game.res[levelCost[1]]) + " / " + format.currency(levelCost[1], levelCost[0]))}</div>
                    </div>
                    <div class="actions popup-upg-actions"></div>
                `);
                let actions = localElms.actions.querySelector(".popup-upg-actions:last-child");
                let upBtn = $make("button.popup-upg-main-action", canBuy ? popupI18n.strings.level_button() : popupI18n.strings.level_button_cant());
                if (canBuy) upBtn.classList.add("value");
                else upBtn.disabled = true;
                upBtn.onclick = () => levelUpCard(pack, rarity, id);
                actions.append(upBtn);
                let viewBtn = $make("button");
                viewBtn.innerHTML = _icon(viewType == "level-up" ? "tabler:eye-filled" : "tabler:eye");
                viewBtn.onclick = () => setViewType("level-up");
                actions.append(viewBtn);
            }
            
            if (data.crown) {
                localElms.actions.insertAdjacentHTML("beforeend", `
                    <div class="formula" style="padding-inline: 10px">
                        <h4>${popupI18n.strings.star_title()}</h4>
                    </div>
                    <div class="actions popup-upg-actions">
                        <button class="popup-upg-main-action" disabled>${popupI18n.strings.star_button_cant()}</button>
                    </div>
                `);
            } else if (state.stars >= 5) {
                localElms.actions.insertAdjacentHTML("beforeend", `
                    <div class="formula" style="padding-inline: 10px">
                        <h4>${popupI18n.strings.star_title()}</h4>
                    </div>
                    <div class="actions popup-upg-actions">
                        <button class="popup-upg-main-action" disabled>${popupI18n.strings.star_button_max()}</button>
                    </div>
                `);
            } else {
                let starCost = getCardStarCost(pack, rarity, id);
                let canBuy = state.amount >= starCost;
                localElms.actions.insertAdjacentHTML("beforeend", `
                    <div class="formula" style="padding-inline: 10px">
                        <h4>${popupI18n.strings.star_cost()}</h4>
                        <div><span>${popupI18n.strings.star_cost_copies(i18n.name)}</span>${_number(format(state.amount) + " / " + format(starCost))}</div>
                    </div>
                    <div class="actions popup-upg-actions"></div>
                `);
                let actions = localElms.actions.querySelector(".popup-upg-actions:last-child");
                let upBtn = $make("button.popup-upg-main-action", canBuy ? popupI18n.strings.star_button() : popupI18n.strings.star_button_cant());
                if (canBuy) upBtn.classList.add("value");
                else upBtn.disabled = true;
                upBtn.onclick = () => starUpCard(pack, rarity, id);
                actions.append(upBtn);
                let viewBtn = $make("button");
                viewBtn.innerHTML = _icon(viewType == "star-up" ? "tabler:eye-filled" : "tabler:eye");
                viewBtn.onclick = () => setViewType("star-up");
                actions.append(viewBtn);
            }
        } else if (mode == "purchase") {
            let buyCost = unwrapFn(data.buyCost);
            let name = str.currencies[buyCost[1]].name();
            let canBuy = game.res[buyCost[1]] >= buyCost[0];
            localElms.actions.insertAdjacentHTML("beforeend", `
                <div class="formula" style="padding-inline: 10px">
                    <h4>${popupI18n.strings.buy_cost()}</h4>
                    <div><span>${name}</span>${_number(format.currency(buyCost[1], game.res[buyCost[1]]) + " / " + format.currency(buyCost[1], buyCost[0]))}</div>
                </div>
                <div class="actions popup-upg-actions"></div>
            `);
            let actions = localElms.actions.querySelector(".popup-upg-actions:last-child");
            let upBtn = $make("button.popup-upg-main-action", canBuy ? popupI18n.strings.buy_button() : popupI18n.strings.buy_button_cant());
            if (canBuy) upBtn.classList.add("value");
            else upBtn.disabled = true;
            upBtn.onclick = () => { buyCard(pack, rarity, id); popups.card.state.popup.close(); }
            actions.append(upBtn);
        } else if (mode == "legacy-draw") {
            let { args } = popups.card.state;
            localElms.actions.insertAdjacentHTML("beforeend", `
                <div class="actions popup-upg-actions"></div>
            `);
            let actions = localElms.actions.querySelector(".popup-upg-actions:last-child");
            let pickBtn = $make("button.popup-upg-main-action.primary", popupI18n.strings.legacyDraw_button());
            pickBtn.onclick = () => {
                args();
                popups.card.state.popup.close();
            }
            actions.append(pickBtn);
        }
    },
    onClose() {
        this.state = {};
        this.elms = {};
        removeEvent("card-update", this.onUpdate);
    }
}