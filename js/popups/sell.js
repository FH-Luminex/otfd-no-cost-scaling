popups.sell = {
    state: {},
    elms: {},
    call(sellValue) {
        let popup = makePopup();
        let i18n = str.popups.sell;
        popup.classList.add("clear", "sell-popup");
        $("#main-container").classList.add("selling");

        this.state.popup = popup;
        this.state.sellValue = sellValue;

        let accountCard = this.elms.accountCard = $make("div.account-card");
        accountCard.innerHTML = `
            <h4>
                ${i18n.decor.accountSelling()}
            </h4>
            <div class="field">
                <div>${i18n.decor.username()}</div>
                <div><div>××××××××××××××××&nbsp;&nbsp;</div></div>
            </div>
            <div class="field">
                <div>${i18n.decor.password()}</div>
                <div><div>••••••••••••••••&nbsp;&nbsp;</div></div>
            </div>
        `
        popup.$body.append(accountCard);

        setTimeout(() => {
            let title = accountCard.querySelector("h4");
            title.innerText = i18n.decor.accountSold();
            title.animate(
                [{ background: "currentColor" }, {}],
                {
                    duration: 200,
                },
            );
        }, 4000);

        setTimeout(() => {
            callPopup("sellResult", sellValue);
        }, 5000);

        return popup;
    },
    resume() {
        if (!this.state.popup) this.resume;
        let title = this.elms.accountCard.querySelector("h4");
        let i18n = str.popups.sell;
        title.innerText = i18n.decor.accountNew();
        title.animate(
            [{ background: "currentColor" }, {}],
            {
                duration: 200,
            },
        );
        this.state.popup.classList.add("new-account");
        $("#main-container").classList.remove("selling");
        $("#main-container").classList.add("selling-new");

        updateUnlocks();
        setTab("collection");
        tabs.marketplace.subtab = "ingame";

        this.state.canSave = true;
        saveGame();

        setTimeout(() => {
            title.innerText = i18n.decor.accountLogIn();
            title.animate(
                [{ background: "currentColor" }, {}],
                {
                    duration: 200,
                },
            );
        }, 1500);

        setTimeout(() => {
            $("#main-container").classList.remove("selling-new");
            this.state.popup.close();
        }, 4500);
    },
    onClose() {
        this.state = {};
        this.elms = {};
    }
}