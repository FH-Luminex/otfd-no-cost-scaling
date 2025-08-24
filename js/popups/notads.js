popups.ad = {
    state: {},
    elms: {},

    call(ad) {
        let popup = makePopup();
        popup.classList.add("clear", "notad-popup");
        let isVideo = !!ad.video;
        let i18n = str.popups.ad;

        this.state = { ad }
        this.elms = {}

        if (!isVideo) {
            let taunt = this.elms.taunt = $make('div.taunt');
            popup.$body.append(taunt);

            let content = $make('div.content');
            popup.$body.append(content);
            ad.onAdInit(content);
            ad.onPlay(content);

            this.state.skipTimerMax = this.state.skipTimer = 30.999;

            setTimeout(() => {
                this.elms.splash.classList.add("hidden");
                setTimeout(() => {this.state.canTick = true}, 500)
            }, 1500)
        }

        this.state.name = ad.getName();
        let makeAppIcon = () => $make('div.app-icon', 
            $make('img')
        )

        let info = $make('div.info',
            $make('div',
                makeAppIcon(),
                $make('span', this.state.name)
            ),
            $make('div', 
                this.elms.closeBtn = $make("button")
            ),
        );
        this.elms.closeBtn.onclick = () => popup.close();
        popup.$body.append(info);

        let splash = this.elms.splash = $make('div.splash',
            makeAppIcon(),
            $make('h3', this.state.name),
            $make('p', i18n.strings.sponsored.pick())
        );
        popup.$body.append(splash);

        addEvent("frame", this.onFrame);
        this.updateUI();

        return popup;
    },
    updateUI() {
        let i18n = str.popups.ad;
        let closeHTML;
        if (this.state.skipTimer > 0) {
            this.elms.closeBtn.disabled = true;
            closeHTML = i18n.action_closeIn(format(this.state.skipTimer));
        } else {
            this.elms.closeBtn.disabled = false;
            closeHTML = i18n.action_close();
        }

        if (closeHTML && this.elms.closeBtn.innerHTML != closeHTML) {
            this.elms.closeBtn.innerHTML = closeHTML;
        }
    },
    onFrame() {
        let self = popups.ad;
        if (self.state.canTick) {
            self.state.skipTimer -= delta / 1000;
            self.updateUI();
        }
    },
    onClose() {
        this.state.ad.onClose();
        this.state = {};
        this.elms = {};
        removeEvent("frame", this.onFrame);

        game.time.adCooldown = 1;
        let offer = adOffers[game.buffs.adOffer.type];
        offer.onAward(offer.getOffer(game.buffs.adOffer.args));
        game.buffs.adOffer = "";
        awardBadge(32);
        saveGame();
    }
}
