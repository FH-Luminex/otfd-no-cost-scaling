popups.save = {
    call() {
        let popup = makePopup();
        let i18n = str.popups.save;

        popup.$body.append(popup.$header = $make("h3.header", i18n.ie_title()));
        popup.$body.append(popup.$content = $make("p", i18n.ie_desc1()));
        popup.$content.innerHTML += "<br>" + i18n.ie_desc2();

        let saveText = $make("textarea.save-box");
        saveText.value = getTextSaveString();
        popup.$body.append(saveText);

        let actions, saveActions, actionGroup, btn;
        popup.$body.append(popup.$actions = actions = $make("div.actions"));

        btn = $make("button", str.popups.common.action_close());
        btn.onclick = popup.close;
        actions.append(btn);

        popup.$body.append(saveActions = $make("div.save-actions"));
        actions.append(saveActions);

        popup.$body.append(actionGroup = $make("div.action-group"));
        saveActions.append(actionGroup);
        btn = $make("button.primary", i18n.ie_action_save_text());
        btn.onclick = () => {
            awardBadge(24);
            navigator.clipboard.writeText(getTextSaveString()).then(() => {
                callPopup("prompt", i18n.saved_text_title(), i18n.saved_text_desc());
            }).catch((e) => {
                popup = callPopup("prompt", str.popups.common.title_error(), i18n.error_copy1());
                popup.$content.insertAdjacentHTML("afterend", `
                    <p>${i18n.error_copy2()}
                `)
            })
        }
        actionGroup.append(btn);
        btn = $make("button.primary", i18n.ie_action_save_file());
        btn.onclick = () => {
            awardBadge(24);
            let blob = new Blob([LZString.compressToUint8Array(JSON.stringify(game))], { type: "octet/stream" });
            let a = $make("a");
            a.href = URL.createObjectURL(blob);
            a.download = "1tFreeDraws-" + Date.now() + ".e12.sav";
            a.click();
            callPopup("prompt", i18n.saved_file_title(), i18n.saved_file_desc(a.download));
        }
        actionGroup.append(btn);

        popup.$body.append(actionGroup = $make("div.action-group"));
        saveActions.append(actionGroup);
        btn = $make("button.danger", i18n.ie_action_load_text());
        btn.onclick = () => {
            let importData = null;
            try {
                importData = JSON.parse(LZString.decompressFromBase64(saveText.value));
                fixSave(importData, getNewGame());
            } catch {
                if (saveText.value.includes("...") || saveText.value.includes("…")) {
                    callPopup("prompt", i18n.import_error(), i18n.import_error_desc_ellipsis());
                }
                callPopup("prompt", i18n.import_error(), i18n.import_error_desc());
                return;
            }

            this.showImportPopup(importData);
        }
        actionGroup.append(btn);
        btn = $make("button.danger", i18n.ie_action_load_file());
        btn.onclick = () => {
            let file = document.createElement("input");
            file.type = "file";
            file.accept = ".e12.sav";

            file.onchange = (e) => {
                let data = file.files[0];
                if (!data) return;
                let reader = new FileReader();
                reader.onloadend = (evt) => {
                    if (evt.target.readyState == FileReader.DONE) {
                        var arrayBuffer = evt.target.result,
                            array = new Uint8Array(arrayBuffer);

                        console.log(array, LZString.decompressFromUint8Array(array));

                        let importData = null;
                        try {
                            importData = JSON.parse(LZString.decompressFromUint8Array(array));
                            fixSave(importData, getNewGame());
                        } catch (e) {
                            console.log(e);
                            callPopup("prompt", i18n.import_error(), i18n.import_error_desc());
                            return;
                        }

                        this.showImportPopup(importData);
                    }
                }
                reader.readAsArrayBuffer(data);
            }

            file.click();
        }
        actionGroup.append(btn);

        return popup;
    },
    showImportPopup(importData, type = "") {
        let i18n = str.popups.save;

        let title = i18n.import_confirm_title();
        let desc = i18n.import_confirm_desc();
        if (type == "cloudcheck") {
            title = i18n.import_confirm_cloudcheck_title();
            desc = i18n.import_confirm_cloudcheck_desc();
        } if (type == "cloudavail") {
            title = i18n.import_confirm_cloudavail_title();
            desc = i18n.import_confirm_cloudavail_desc();
        }

        let popup = callPopup("prompt", title, desc, {
            no: i18n.import_confirm_action_no(),
            "": "",
            yes$primary: i18n.import_confirm_action_yes(),
        }, x => {
            if (x == "yes") {
                if (popup.querySelector("#keep-opt-checkbox").checked) importData.option = { ...game.option };
                saveGame = () => { return false; }
                callPopup("prompt", i18n.busy_import(), i18n.busy_desc(), {});
                localStorage.setItem(SAVE_KEY, LZString.compress(JSON.stringify(importData)));
                if (cloud.save) {
                    game = importData;
                    saveToCloud(0, () => {
                        window.location.reload();
                    }, true);
                }
                else window.location.reload();
            }
        });

        popup.$content.insertAdjacentHTML("afterend", `
            <hr>
            <p>
                <div class="input-group">
                    <input type="checkbox" id="keep-opt-checkbox">
                    <label for="keep-opt-checkbox">${i18n.opt_keepPrefs()}</label>
                </div>
                <small class="unimportant">${i18n.opt_keepPrefs_noteImport()}</small>
            </p>
            <hr>
        `)

        let saveSummary = $make("div.formula.save-summary");
        popup.$content.insertAdjacentElement("afterend", saveSummary);
        function makeSummaryEntry(title, content) {
            let entry = $make("div", $make("span", title), $make("span.number", content));
            saveSummary.append(entry);
        }

        makeSummaryEntry(str.stats.general.items.timePlayed.name(), format.time(importData.stats.timePlayed));
        if (importData.stats.accountsSold) makeSummaryEntry(str.stats.legacy.items.accountsSold.name(), format(importData.stats.accountsSold, 0, 13));
        makeSummaryEntry(verbify(str.stats.cards.items.cardsDrawn.name()), format(importData.stats.cardsDrawn, 0, 13));
    }
}