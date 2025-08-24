popups.badge = {
    call(badge) {
        let popup = makePopup();

        let data = badges[badge];
        let obtained = !!game.badges[badge];

        let info = $make("div.info");
        info.innerHTML = `
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
        popup.$body.append(info);

        let actions = $make("div.actions");
        popup.$body.append(actions);

        let close = $make("button.primary", str.popups.common.action_close());
        close.onclick = () => popup.close();
        actions.append(close);

        return popup;
    },
    onClose() {
        this.state = {};
        this.elms = {};
    }
}