popups.sellResult = {
    state: {},
    elms: {},
    call(sellValue) {
        let i18n = str.popups.sellResult;

        if (game.stats.accountsSold == 1) {
            let popup = callPopup("slideshow", 3);
            return popup;
        }

        this.state = { sellValue, points: [{}], timer: 1000 };
        this.elms = {}

        let popup = makePopup();
        popup.classList.add("clear", "sell-result");

        popup.$body.append($make("h2", i18n.title()));
        popup.$body.append(this.elms.points = $make("div.sell-points"))

        let actions = this.elms.actions = $make("div.actions.hidden");
        popup.$body.append(actions);

        let close = $make("button.primary", str.popups.sellResult.action_continue());
        close.onclick = () => popup.close();
        actions.append(close);

        let makePoint = (type, values, onActivate, condition) => {
            let elm = $makeHTML("div.hidden", i18n.points[type](...values));
            this.elms.points.append(elm);
            this.state.points.push({elm, onActivate, condition});
        }
        let makePointHeader = (type) => {
            let elm = $makeHTML("h3.hidden", i18n.pointHeaders[type]());
            this.elms.points.append(elm);
            this.state.points.push({elm});
        }

        makePointHeader("obtained");
        makePoint("money", [_number(format.currency("money", sellValue.money))]);
        makePoint("exp", [_number(format(sellValue.exp))]);
        if (flags.unlocked.legacy) makePoint("legacyDraw",
            [_number(format(effects.legacyPickCount))], 
            () => doDrawLegacy(), () => !popups.drawLegacy.elms.popup
        );

        addEvent("anim-frame", this.onFrame)
        return popup;
    },
    onFrame() {
        let self = popups.sellResult;
        self.state.timer -= animDelta;
        if (self.state.timer <= 0) {
            let points = self.state.points;
            if (points[0].onActivate) {
                points[0].onActivate();
                delete points[0].onActivate;
            }
            if (points[0].condition) {
                if (points[0].condition()) {
                    delete points[0].condition;
                    self.state.timer = 1000;
                }
                return;
            }
            points.shift();
            if (points[0]) {
                points[0].elm.classList.remove("hidden");
                points[0].elm.scrollIntoView();
                self.state.timer = 1000;
            } else {
                self.elms.actions.classList.remove("hidden");
                self.state.timer = Infinity;
            }
        }
    },
    onClose() {
        this.state = {};
        this.elms = {};
        removeEvent("anim-frame", this.onFrame)
        setTimeout(() => {
            popups.sell.resume();
        }, 500);
    }
}