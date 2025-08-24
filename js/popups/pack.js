popups.pack = {
    call(pack, id) {
        let popup = makePopup();

        let data = packs[pack][id];
        let i18n = str.packs[pack][id];
        let popupI18n = str.popups.pack;

        let info = $make("div.info");
        popup.$body.append(info);

        info.insertAdjacentHTML("afterend", `
            <div class="header">
                <h2>${i18n.name()}</h2>
                <small>
                    ${game.debug ? `(ID: ${pack}/${id})<br>` : ""}
                    ${popupI18n.strings.pack()}
                </small>
            </div>
            <p>
                ${popupI18n.buy_confirm(i18n.name())}
            </p>
            <p>
                ${popupI18n.perks()}
            </p>
        `);

        let perks = $make("ul");
        popup.$body.append(perks);

        for (let item of i18n.perks) {
            perks.append($makeHTML("li", format.effect(item, data.effects)));
        }

        let actions = $make("div.actions");
        popup.$body.append(actions);

        let close = $make("button", popupI18n.buy_action_no());
        close.onclick = () => popup.close();
        actions.append(close, $make("span.flex-fill"));

        let buyBtn = $makeHTML("button.value", popupI18n.buy_action_yes(_number(format.currency(data.cost[1], data.cost[0]))));
        buyBtn.onclick = () => {
            buyPack(pack, id);
            popup.close();
        }
        actions.append(buyBtn);
            
        buyBtn.style.setProperty("--progress", game.res[data.cost[1]] / data.cost[0]);
        let canBuy = game.res[data.cost[1]] >= data.cost[0];
        buyBtn.disabled = !canBuy;
        levelText = _icon("tabler:shopping-cart") + " " + _number(format.currency(data.cost[1], data.cost[0]));

        return popup;
    },
}