tabs.infobook = {
    name: "Infobook",
    icon: "mdi:notebook-outline",

    subtab: "stats",
    state: {},
    items: {},
    elms: {},

    onInit() {
        let holder = $make("div.subtab-holder.infobook-holder");
        elms.tab.append(holder);

        let tabButtons = createChoiceGroup({
            stats: [$icon("tabler:chart-bar"), " " + str.tabs.infobook.subtabs.stats()],
            // breakdown: [$icon("uil:apps"), " " + str.tabs.infobook.subtabs.breakdown()],
            gallery: [$icon("tabler:slideshow"), " " + str.tabs.infobook.subtabs.gallery()],
        }, this.subtab, (x) => {
            this.subtab = x;
            if (x == "gallery") {
                awardBadge(21);
                saveGame();
            }
            this.elms.cards.scrollLeft = 0;
            this.updateSubtab();
        });
        tabButtons.className = "tab-buttons";
        registerHorizontalScrollWheel(tabButtons);
        holder.append(tabButtons);

        let indicator = this.elms.indicator = $make("div.page-indicators");
        holder.append(indicator);

        let cards = this.elms.cards = $make("div.infobook-cards.no-scroll-bar");
        holder.append(cards);

        let btnLeft = this.elms.btnLeft = $make("button.page-button.left", $icon("tabler:chevron-left"));
        btnLeft.onclick = () => cards.scrollBy({left: -this.state.colWidth, behavior: "smooth"});
        holder.append(btnLeft);

        let btnRight = this.elms.btnRight = $make("button.page-button.right", $icon("tabler:chevron-right"));
        btnRight.onclick = () => cards.scrollBy({left: this.state.colWidth, behavior: "smooth"});
        holder.append(btnRight);

        this.updateSubtab();
        addEvent("anim-frame", this.onFrame);
        addEvent("effect-update", this.updateItems);
    },
    onDestroy() {
        this.clearItems();
        this.elms = {};
        this.items = {};
        this.state = {};
        removeEvent("anim-frame", this.onFrame);
        removeEvent("effect-update", this.updateItems);
    },
    onFrame() {
        let localElms = tabs.infobook.elms;
        let state = tabs.infobook.state;
        let viewWidth = localElms.cards.clientWidth;
        let viewStyle;
        if (state.viewWidth != viewWidth) {
            state.viewWidth = viewWidth;
            viewStyle ||= getComputedStyle(localElms.cards);
            viewWidth -= parseFloat(viewStyle.getPropertyValue("--inline-padding")) * 2;
            let gap = parseFloat(viewStyle.gap);
            let cols = state.cols = Math.max(1, Math.floor((viewWidth + gap) / 300));
            let width = state.colWidth = (viewWidth - gap * (cols - 1)) / cols;
            console.log(gap, cols, width);
            localElms.cards.style.setProperty("--item-width", width + "px");
            state.viewDirty = true;
        }

        let viewX = localElms.cards.scrollLeft;
        let viewW = localElms.cards.scrollWidth;
        if (state.viewX != viewX || state.viewW != viewW || state.viewDirty) {
            state.viewX = viewX;
            state.viewW = viewW;
            state.viewDirty = false;
            viewStyle ||= getComputedStyle(localElms.cards);
            let gap = parseFloat(viewStyle.gap);
            let pos = viewX / (state.colWidth + gap);
            let cols = state.cols;

            let len = 0;
            for (let card of localElms.cards.childNodes) {
                if (!card.style.display) {
                    card.style.setProperty("--index", len);
                    len++;
                }
            }

            localElms.btnLeft.disabled = pos < 0.5;
            localElms.btnRight.disabled = pos + cols > len - 0.5;

            while (localElms.indicator.childElementCount < len) {
                let index = localElms.indicator.childElementCount;
                let newDiv = $make("div.indicator");
                newDiv.onclick = () => localElms.cards.childNodes[index].scrollIntoView({behavior: "smooth"});
                localElms.indicator.append(newDiv);
            }
            while (localElms.indicator.childElementCount > len) {
                localElms.indicator.lastElementChild.remove();
            }
            localElms.cards.style.setProperty("--length", len);
            for (let a = 0; a < len; a++) {
                localElms.indicator.childNodes[a].style.setProperty("--lit", 
                    Math.max(Math.min((cols + 1) / 2 - Math.abs(a - (cols - 1) / 2 - pos), 1), 0)
                );
            }
        }
    },
    updateSubtab() {
        this.clearItems();
        this.elms.cards.innerText = "";
        if (this.subtab == "stats") {
            for (let group in statEntries) {
                let card = this.makeCard(group, statEntries[group]);
                this.elms.cards.append(card);
                for (let id in statEntries[group].items) {
                    card.$content.append(this.makeItem(group, id, statEntries[group].items[id]));
                }
            }
        } else if (this.subtab == "gallery") {
            let badgeContent;
            this.elms.cards.append($make("div.infobook-card",
                $make("h3.header", str.tabs.infobook.strings.badges()),
                $make("div.content", 
                    badgeContent = $make("div.badge-list")
                )
            ));
            badgeContent.$list = {};

            let showContent;
            this.elms.cards.append($make("div.infobook-card",
                $make("h3.header", str.tabs.infobook.strings.story()),
                $make("div.content", 
                    showContent = $make("div.show-list")
                )
            ));
            showContent.$list = {};

            let update = () => {
                for (let badge in badges) {
                    let data = badges[badge];
                    let div;
                    if (badgeContent.$list[badge]) {
                        div = badgeContent.$list[badge];
                    } else {
                        div = $make("div.badge");
                        badgeContent.append(badgeContent.$list[badge] = div);
                        div.append(div.$icon = $make("img"));
                        registerTooltip(div, tooltipTemplates.badge(badge));
                        div.onclick = () => {
                            if (prefersNoTooltips()) callPopup("badge", badge);
                        }
                    
                        if (data.noImage) {
                            div.$icon.src = "res/badges/placeholder.png";
                        } else {
                            div.$icon.src = `res/badges/${badge}.png`;
                            div.$icon.onerror = () => {
                                div.$icon.src = "res/badges/placeholder.png";
                                data.noImage = true;
                                div.$icon.onerror = undefined;
                            };
                        }
                    }
                    
                    let obtained = !!game.badges[badge];
                    div.classList.toggle("locked", !obtained);
                }

                for (let show in slideshows) {
                    let data = slideshows[show];
                    let i18n = str.slideshows[show];
                    let div;
                    if (showContent.$list[show]) {
                        div = showContent.$list[show];
                    } else {
                        div = $make("button", i18n.name());
                        showContent.append(showContent.$list[show] = div);
                        div.onclick = () => {
                            callPopup("slideshow", show)
                        }
                    }
                    
                    div.style.display = game.flags.showSeen[show] ? "" : "none";
                }
            }
            addEvent(undefined, update);
            update();
        }
        this.state.viewDirty = true;
    },

    clearItems() {
        for (let event in this.items) if (event) {
            for (let fn of this.items[event]) {
                removeEvent(event, fn);
            }
        }
        this.items = {};
    },
    updateItems() {
        for (let event in tabs.infobook.items) {
            for (let fn of tabs.infobook.items[event]) {
                fn();
            }
        }
    },
    makeCard(group, item) {
        let div = $make("div.infobook-card.stat-card",
            $make("h3.header", str.stats[group].name()),
        );
        div.append(div.$content = $make("div.content"));

        if (item.condition) {
            let update = () => {
                div.style.display = item.condition() ? "" : "none";
            }

            this.registerEvent(item.event, update);
            update();
        }

        return div;
    },
    makeItem(group, id, item) {
        let elm, update = null;
        if (item.separator) {
            elm = $make("hr");

            if (item.condition) update = () => {
                elm.style.display = item.condition() ? "" : "none";
            }
        } else {
            let content, lock, lockReq;
            elm = $make("div.stat-entry",
                $makeHTML("span", verbify(str.stats[group].items[id].name())),
                content = $make("span.value"),
                lock = $make("button", 
                    $icon("tabler:lock"), " ",
                    lockReq = $make("span")
                )
            );
    
            lock.onclick = () => buyStatEntry(group, id);
    
            update = () => {
                if (item.condition) {
                    if ((elm.style.display = item.condition() ? "" : "none") == "none") return;
                }
                if (game.flags.statUnlocks[group]?.[id]) {
                    lock.style.display = "none";
                    content.innerHTML = item.display();
                } else {
                    lock.style.display = "";
                    lockReq.innerHTML = str.format.joiner.currency(_number(format(item.cost[0])), str.currencies[item.cost[1]].name());
                    lock.style.setProperty("--progress", game.res[item.cost[1]] / item.cost[0])
                    lock.disabled = game.res[item.cost[1]] < item.cost[0];
                }
            }
        }

        if (update) {
            update();
            this.registerEvent(item.event, update);
        }
        return elm;
    },
    registerEvent(event, fn) {
        if (event) addEvent(event, fn);
        if (!this.items[event]) this.items[event] = [];
        this.items[event].push(fn);
    }
}