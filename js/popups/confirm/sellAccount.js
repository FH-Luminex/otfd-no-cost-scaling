popups.confirm.sellAccount = {
    call() {
        let popup = makePopup();
        let i18n = str.popups.confirm.sellAccount;
        popup.$body.style.maxWidth = "700px";

        popup.$body.append($make("h3.header", i18n.title()));
        popup.$body.append($makeHTML("p", i18n.desc1()));
        popup.$body.append($makeHTML("p", i18n.desc2()));

        let gain = getSellValue();

        popup.$body.insertAdjacentHTML("beforeend", `
            <hr>
            <div class="split-list">
                <div>
                    <h4>${i18n.list_lose()}</h4>
                    <ul>
                        <li>${i18n.list_lose1()}</li>
                        <li>${i18n.list_lose2()}</li>
                        <li>${i18n.list_lose3()}</li>
                    </ul>
                </div>
                <div>
                    <h4>${i18n.list_gain()}</h4>
                    <ul>
                        <li>${i18n.list_gainMoney(_number(format.currency("money", gain.money)))}</li>
                        <li>${i18n.list_gainExp(_number(format.currency("exp", gain.exp)))}</li>
                    </ul>
                </div>
            </div>
            <hr>
            <p>
                <div class="input-group">
                    <input type="checkbox" checked id="confirm-checkbox">
                    <label for="confirm-checkbox">${i18n.confirm()}</label>
                </div>
            </p>
            <hr>
        `)

        let actions = $make("div.actions");
        popup.$body.append(actions);

        let button;

        button = $make("button", i18n.action_no());
        button.onclick = () => popup.close();
        actions.append(button)

        actions.append($make("div.flex-fill"));

        button = $make("button.primary", i18n.action_yes());
        button.onclick = () => {
            game.option.confirm.sellAccount = popup.$body.querySelector("#confirm-checkbox").checked;
            sellAccount(true);
            popup.close();
        }
        actions.append(button);

        return popup;
    },
}