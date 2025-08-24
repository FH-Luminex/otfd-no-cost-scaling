tabs.options = {
    name: "Options",
    icon: "akar-icons:gear",

    subtab: "prefs",
    elms: {},
    

    onInit() {
        let holder = $make("div.subtab-holder");
        elms.tab.append(holder);

        let tabButtons = this.elms.tabButtons = createChoiceGroup({
            prefs: [$icon("mdi:slider"), " " + str.tabs.options.subtabs.prefs()],
            saves: [$icon("material-symbols:save-outline-rounded"), " " + str.tabs.options.subtabs.saves()],
            other: [$icon("mdi:ellipsis-vertical-circle-outline"), " " + str.tabs.options.subtabs.other()],
        }, this.subtab, (x) => {
            this.subtab = x;
            this.rebuildUI();
        });
        tabButtons.className = "tab-buttons";
        registerHorizontalScrollWheel(tabButtons);
        holder.append(tabButtons);

        let content = this.elms.content = $make("div.subtab-content");
        content.onscroll = (e) => elms.tab.style.setProperty("--scroll", content.scrollTop + "px")
        holder.append(content);

        this.rebuildUI();
    },
    rebuildUI() {
        let elms = this.elms;
        elms.content.textContent = "";
        let i18n = str.tabs.options;

        this.elms.content.setAttribute("tab-name", str.tabs.options.subtabs[this.subtab]());

        let container, choiceGroup, sliderGroup, entry;
        function makeEntry(title, ...content) {
            let div = $make("div.opt-entry");
            div.append(div.$title = $make("label", title));
            div.append(div.$content = $make("span", ...content));
            container.append(div);
            if (content[0]?.scrollToChoice) content[0].scrollToChoice();
            return div;
        }

        if (this.subtab == "prefs") {

            elms.content.append(container = $make("div.opt-container"));
            container.append($make("h3", i18n.headers.prefs.i18n()));

            makeEntry([$icon("ic:outline-language"), " " + i18n.items.language()], choiceGroup = createChoiceGroup((
                Object.fromEntries(
                    Object.keys(i18nStrings).map(key => [key, i18nStrings[key].name])
                )
            ), game.option.language, (choice) => {
                setLanguage(choice);
                saveGame();
                doUIFrame();
            }));
            container.append(
                $make("div.opt-entry.before",
                    $make("label", ""),
                    $make("small", 
                        i18n.strings.language_desc()
                    )
                )
            );
            makeEntry([i18n.items.verb() + " ", 
                createInfoButton(() => verbify(i18n.strings.verb_desc()))
            ], choiceGroup = createChoiceGroup((
                Object.fromEntries(Object.entries(
                    i18nStrings[game.option.language].verbs
                ).map(([key, item]) => [key, item[i18nStrings[game.option.language].primaryVerb].toTitleCase()]))
            ), game.option.verb, (choice) => {
                game.option.verb = choice;
                updateVerb();
                saveGame();
                doUIFrame();
            }));

            container.append($make("hr"));

            makeEntry([i18n.items.notation() + " ", 
                createInfoButton(() => verbify(i18n.strings.notation_desc()))
            ], choiceGroup = createChoiceGroup((
                Object.fromEntries([
                    "default", "common", "scientific", "engineering", "si", "alphabet", "chinese", "korean"
                ].map(x => [
                    x, i18n.values.notation[x]()
                ]))
            ), game.option.notation, (choice) => {
                game.option.notation = choice;
                saveGame();
                doUIFrame();
            }));



            elms.content.append(container = $make("div.opt-container"));
            container.append($make("h3", i18n.headers.prefs.logic()));

            let updateRates = [0, 1, 2, 5, 10, 20, 30, 60];
            makeEntry([i18n.items.updateRate(),
            ], sliderGroup = createSliderGroup(0, updateRates.length - 1, 1, updateRates.indexOf(game.option.updateRate), (value) => {
                game.option.updateRate = updateRates[value]
                saveGame();
                doUIFrame();
            }, (value) => {
                return value == 0 ? i18n.values.updateRate.auto() : i18n.values.updateRate.perSec(_number(format(updateRates[value])));
            }));
            sliderGroup.$slider.style.setProperty("--start", 1 / (updateRates.length - 1));
            
            if (game.stats.accountsSold > 0) {

                container.append($make("hr"));

                entry = makeEntry(i18n.items.confirm(), ...(() => {
                    let list = [];
                    let btn;
        
                    let holder = $make("div.choice-group");
                    list.push(holder);
        
                    btn = $make("button", i18n.values.items.showConfirms());
                    btn.onclick = () => {
                        let popup = callPopup("prompt", i18n.popups.confirm.title(), i18n.popups.confirm.desc());
                        let holder = $make("div.info");
                        holder.style.marginTop = "10px";
                        holder.style.gap = "5px";
                        popup.$content.append(holder);
                        function makeItem(id) {
                            let group, checkbox, label;
                            holder.append(group = $make("div.input-group", 
                                checkbox = $make("input"),
                                label = $make("label", i18n.popups.confirm.types[id]())
                            ))
                            checkbox.id = label.htmlFor = Math.random();
                            checkbox.type = "checkbox";
                            checkbox.checked = game.option.confirm[id];
                            checkbox.onchange = () => {
                                game.option.confirm[id] = checkbox.checked;
                                saveGame();
                            }
                        }
                        makeItem("sellAccount");
                    }
                    holder.append(btn);
        
                    return list;
                })());
            }


            elms.content.append(container = $make("div.opt-container"));
            container.append($make("h3", i18n.headers.prefs.video()));

            makeEntry([i18n.items.cardSize(),
            ], sliderGroup = createSliderGroup(50, 150, 5, game.option.cardSize, (value) => {
                game.option.cardSize = value;
                updatePrefs();
                saveGame();
            }, (value) => {
                return _number(format(value) + "%");
            }));
            makeEntry(i18n.items.cardImages(), choiceGroup = createChoiceGroup({
                0: i18n.values.common.hidden(),
                1: i18n.values.common.shown(),
            }, game.option.cardImages, (choice) => {
                game.option.cardImages = +choice;
                saveGame();
            }));



            elms.content.append(container = $make("div.opt-container"));
            container.append($make("h3", i18n.headers.prefs.audio()));

            makeEntry([i18n.items.musicVolume(),
            ], createSliderGroup(0, 1, 0, game.option.volume.music, (value) => {
                game.option.volume.music = value
                updateMusic();
                saveGame();
            }, (value) => {
                return _number(format(value * 100) + "%");
            }));


        }
        else if (this.subtab == "saves") {

            elms.content.append(container = $make("div.opt-container"));
            container.append($make("h3", i18n.headers.saves.storage()));

            entry = makeEntry(i18n.items.localSave(), ...(() => {
                let list = [];
                let btn;

                let holder = $make("div.choice-group");
                list.push(holder);

                btn = $make("button", i18n.values.items.manualSave());
                btn.onclick = () => {
                    let i18n = str.popups.save;
                    if (saveGame()) {
                        let popup = callPopup("prompt", i18n.saved_title(), i18n.saved_desc());
                        popup.$content.append($make("br"), $make("small.unimportant", 
                            verbify(i18n.saved_noteLocal())
                        ))
                    }
                }
                holder.append(btn);
                btn = $make("button", i18n.values.items.importExport());
                btn.onclick = () => {
                    callPopup("save");
                }
                holder.append(btn);

                btn = $make("button.f-fire", i18n.values.items.hardReset());
                btn.onclick = () => {
                    let i18n = str.popups.save;
                    let popup = callPopup("prompt", 
                        i18n.reset_confirm_title(), 
                        "",
                        {
                            no: i18n.reset_confirm_action_no(),
                            "": "",
                            yes$danger: i18n.reset_confirm_action_yes(),
                        },
                        (x) => {
                            if (x == "yes") {
                                callPopup("prompt", i18n.busy_reset(), i18n.busy_desc(), {});
                                hardReset(popup.querySelector("#keep-opt-checkbox").checked);
                            }
                        }
                    );
                    popup.$content.innerHTML = i18n.reset_confirm_desc1();
                    popup.$content.insertAdjacentHTML("afterend", `
                        <p>${i18n.reset_confirm_desc2()}</p>
                        <hr>
                        <p>
                            <div class="input-group">
                                <input type="checkbox" id="keep-opt-checkbox" checked>
                                <label for="keep-opt-checkbox">${i18n.opt_keepPrefs()}</label>
                            </div>
                            <small class="unimportant">${i18n.opt_keepPrefs_noteReset()}</small>
                        </p>
                        <hr>
                    `)
                }
                holder.append(btn);

                return list;
            })());
            entry.$title.append($make("span.save-timer-br"), this.elms.localSaveTimer = $make("small"));

            if (cloud.type) {
                entry = makeEntry(i18n.items.cloudSave(), ...(() => {
                    let list = [];
                    let btn;
        
                    let holder = $make("div.choice-group");
                    list.push(holder);
        
                    btn = this.elms.cloudSave = $make("button", i18n.values.items.manualSave());
                    btn.onclick = () => {
                        let i18n = str.popups.save;
                        if (game.time.now - lastCloudSaveTime < 30000) {
                            callPopup("prompt", str.popups.common.title_error(), i18n.error_cloudSaveCooldown());
                        } else {
                            awardBadge(24);
                            saveGame();
                            let waitPopup = callPopup("prompt", i18n.busy_saving_cloud(), str.popups.common.desc_pleaseWait(), {});
                            saveToCloud(0, (success) => {
                                waitPopup.close();
                                if (success) {
                                    let popup = callPopup("prompt", i18n.saved_title(), i18n.saved_desc());
                                    popup.$content.append($make("br"), $make("small.unimportant", 
                                        i18n.saved_noteCloud()
                                    ))
                                } else {

                                }
                            }, true)
                        }
                    }
                    holder.append(btn);
                    btn = $make("button", i18n.values.items.checkSaves());
                    btn.onclick = () => {
                        let i18n = str.popups.save;
                        if (game.time.now - lastCloudCheckTime < 30000) {
                            callPopup("prompt", str.popups.common.title_error(), i18n.error_cloudCheckCooldown());
                        } else {
                            checkCloudSave(true);
                        }
                    }
                    holder.append(btn);
        
                    return list;
                })());
                entry.$title.append($make("span.save-timer-br"), this.elms.cloudSaveTimer = $make("small"));
            }


        }
        else if (this.subtab == "other") {

            elms.content.append(container = $make("div.opt-container"));

            entry = makeEntry(i18n.items.info(), ...(() => {
                let list = [];
                let btn;

                let holder = $make("div.choice-group");
                list.push(holder);

                btn = $make("button", i18n.values.items.about());
                btn.onclick = () => {
                    callPopup("about");
                }
                holder.append(btn);

                return list;
            })());

            elms.content.append(container = $make("div.opt-container"));

            if (!cloud.type) {
                entry = makeEntry(i18n.items.otherOther(), ...(() => {
                    let list = [];
                    let btn;
        
                    let holder = $make("div.choice-group");
                    list.push(holder);
        
                    btn = $make("button", i18n.values.items.john());
                    btn.onclick = () => {
                        let popup = callPopup("prompt", "", "");
                        popup.classList.add("theatre");
                        popup.$header.remove();
                        popup.$content.style.margin = "0";
                        popup.$content.style.textAlign = "center";
                        popup.$content.innerHTML = `
                            <iframe src="https://john.citrons.xyz/embed?ref=duducat.moe" class="john"></iframe>
                            <small class="unimportant">${i18n.strings.john_note()}</small>
                        `
                        let frame = popup.$content.querySelector(".john");
                        let button = $make("button", str.popups.common.action_reload());
                        button.disabled = true;
                        button.onclick = () => {
                            frame.src += "";
                            button.disabled = true;
                        }
                        frame.onload = () => {
                            button.disabled = false;
                        }
                        popup.$actions.prepend(button, $make("span.flex-fill"));
                        let confirm = (event) => {
                            event.preventDefault();
                            event.returnValue = '';
                        }

                        window.addEventListener('beforeunload', confirm);
                        let realClose = popup.close
                        popup.close = () => {
                            window.removeEventListener('beforeunload', confirm);
                            realClose();
                        }
                    }
                    holder.append(btn);
        
                    return list;
                })());
            }
        }

        this.onFrame();
    },
    onDestroy() {
        this.elms = {}
        elms.tab.style.removeProperty("--scroll");
    },
    onFrame() {
        let localSaveTime = (game.time.now - lastSaveTime) / 1000;
        let i18n = str.tabs.options;
        if (this.elms.localSaveTimer) {
            this.elms.localSaveTimer.innerHTML = localSaveTime < 1 ? i18n.strings.save_recent() : i18n.strings.save_timer(_number(format.time(localSaveTime)))
        }
        if (this.elms.cloudSaveTimer) {
            let cloudSaveTime = (game.time.now - lastCloudSaveTime) / 1000;
            this.elms.cloudSave.style.display = cloud.state.loggedOut ? "none" : "";
            this.elms.cloudSaveTimer.innerHTML = `${i18n.strings["cloud_type_" + cloud.type]()}<span class="save-timer-br"></span>` + (
                cloud.state.loggedOut ? i18n.strings.cloud_loggedOut() :
                cloudStatus ? i18n.strings["cloud_status_" + cloudStatus.toLowerCase()]() :
                cloudSaveTime < 1 ? i18n.strings.save_recent() : i18n.strings.save_timer(_number(format.time(cloudSaveTime)))
            )
        }
    },


}