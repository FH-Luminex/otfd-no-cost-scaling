popups.buff = {
    state: {},
    elms: {},
    call(type, buff) {
        this.state = {type, buff};
        let popup = makePopup();

        let i18n = str.buffs[type][buff];
        let popupI18n = str.popups.buff;

        let holder = $makeHTML("div.info", `
            <div class="header">
                <h2>${i18n.name()}</h2>
                <small>
                    ${game.debug ? `(ID: ${type}/${buff})<br>` : ""}
                    ${popupI18n.strings.buff()}
                </small>
            </div>
        `)
        popup.$body.append(holder);

        let info = this.elms.info = $make("div");
        holder.append(info);

        let actions = $make("div.actions");
        popup.$body.append(actions);

        let close = $make("button.primary", str.popups.common.action_close());
        close.onclick = () => popup.close();
        actions.append(close);

        let event = this.state.event = getBuffEvent(type);

        addEvent(event, this.onUpdate);
        this.onUpdate();
        this.state.popup = popup;
        return popup;
    },
    onUpdate() {
        let self = popups.buff;
        let {type, buff, event} = self.state;
        let data = buffs[type][buff];
        let state = game.buffs.active[type][buff];
        let i18n = str.buffs[type][buff];

        let curFx = [];
        fx = (x) => curFx[x];
        for (let f of data.effects) curFx.push(f(state));

        self.elms.info.innerHTML = verbify(format.effect(i18n.desc(), curFx));
    },
    onClose() {
        removeEvent(this.state.event, this.onUpdate);
        this.state = {};
        this.elms = {};
    }
}