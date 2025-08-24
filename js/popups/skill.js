popups.skill = {
    state: {},
    elms: {},
    call(skill) {
        this.state = {skill};
        let data = skills[skill];
        let i18n = str.skills[skill];
        let popupI18n = str.popups.skill;
        let popup = makePopup();

        let info = this.elms.info = $make("div.info");
        info.innerHTML = `
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
        popup.$body.append(info);

        let actions = $make("div.actions");
        popup.$body.append(actions);

        let close = $make("button.primary", str.popups.common.action_close());
        close.onclick = () => popup.close();
        actions.append(close);

        let fire = this.elms.fire = $make("button");
        fire.onclick = () => activateSkill(skill);
        actions.append(fire);


        addEvent("frame", this.onUpdate);
        this.onUpdate();
        this.state.popup = popup;
        return popup;
    },
    onUpdate() {
        let state = popups.skill.state;
        let localElms = popups.skill.elms;
        let skill = state.skill;
        let popupI18n = str.popups.skill;
        if (game.drawPref.skills[skill]) {
            localElms.fire.disabled = true;
            localElms.fire.innerHTML = popupI18n.strings.action_activated();
        } else if (game.time.skillCooldowns[skill] > 0 && (game.time.skillStacks[skill] ?? 0) <= 0) {
            localElms.fire.disabled = true;
            localElms.fire.innerHTML = popupI18n.strings.action_inCooldown(_number(format.time(game.time.skillCooldowns[skill])));
        } else {
            localElms.fire.disabled = false;
            localElms.fire.innerHTML = popupI18n.strings.action_activate();
        }
        localElms.fire.classList.toggle("value", !localElms.fire.disabled);
    },
    onClose() {
        this.state = {};
        this.elms = {};
        removeEvent("frame", this.onUpdate);
    }
}