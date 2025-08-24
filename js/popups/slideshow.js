popups.slideshow = {
    state: {},
    elms: {},
    call(show) {
        this.state = {
            show,
            state: "next",
            index: 0,
            progress: 0,
            skip: false,
        };
        let data = slideshows[show];
        let i18n = str.popups.slideshow;

        let popup = makePopup();
        this.state.popup = popup;
        popup.classList.add("opaque", "theatre");

        popup.$body.append(
            this.elms.images = $make("div.show-image"),
            this.elms.text = $make("div.show-text")
        )

        let actions;
        popup.$body.append(popup.$actions = actions = $make("div.actions"));

        let close = $make("button", i18n.strings.action_skip())
        close.onclick = () => popup.close();
        actions.append(close, $make("div.flex-fill"));

        let next = this.elms.next = $make("button.primary", i18n.strings.action_next())
        next.onclick = () => {
            if (this.state.state == "done") {
                this.state.index++;
                this.state.state = "next";
            }
            if (!this.state.skip) this.state.skip = true;
        }
        actions.append(next);


        addEvent("frame", this.onFrame);
        return popup;
    },
    onFrame() {
        let state = popups.slideshow.state;
        let localElms = popups.slideshow.elms;
        let data = i18nStrings[game.option.language]?.slideshows?.[state.show]
            ?? i18nStrings.en.slideshows[state.show];
        let directive = data.directives[state.index];

        switch (state.state) {
            case "next": {
                state.skip = false;
                if (!directive) {
                    state.popup.close();
                } else if (directive[0] == "image") {
                    localElms.newImage = $make("img");
                    localElms.newImage.src = `res/slideshows/${state.show}/${directive[1]}.png`;
                    localElms.newImage.onerror = () => {
                        localElms.newImage.src = `res/slideshows/placeholder.png`;
                        delete localElms.newImage.onerror;
                    }
                    localElms.newImage.style.opacity = 0;
                    localElms.images.append(localElms.newImage);
                    state.state = "fade";
                    state.text = null;
                    state.progress = 0;
                } else if (directive[0] == "text") {
                    localElms.text.innerHTML = "";
                    state.state = "type";
                    state.text = verbify(directive[1]);
                    state.progress = 0;
                    state.delay = 0;
                }
            } break;
            case "fade": {
                if (localElms.newImage.complete) {
                    if (state.skip) state.progress = 1;
                    else state.progress += delta / 1000;
                    localElms.newImage.style.opacity = state.progress;
                    if (state.progress >= 1) {
                        localElms.image?.remove();
                        localElms.image = localElms.newImage;
                        localElms.image.style.opacity = "";
                        state.index++;
                        state.state = "next";
                    }
                }
            } break;
            case "type": {
                state.delay -= delta;
                if (state.skip) {
                    state.delay = -1000;
                    state.progress = state.text.length - 1;
                }

                while (state.delay < 0) {
                    state.delay += 20;
                    if (state.progress >= state.text.length) {
                        state.state = "done";
                        state.progress = 0;
                        break;
                    }

                    if (state.text[state.progress] == "<") {
                        while (directive[1][state.progress] != ">" && state.progress < state.text.length) state.progress++;
                    }
                    state.progress++;

                    if (state.progress >= state.text.length) {
                        state.delay += 150;
                    } else if (directive[1][state.progress] == ".") {
                        state.delay += 60;
                    } else if (directive[1][state.progress] == ",") {
                        state.delay += 20;
                    }

                    localElms.text.innerHTML = state.text.substring(0, state.progress);
                }
            } break;
        }
    },
    onClose() {
        this.state = {};
        this.elms = {};
        removeEvent("frame", this.onFrame);
    }
}