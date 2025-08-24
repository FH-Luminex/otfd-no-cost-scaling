popups.about = {
    call() {
        let popup = makePopup();

        let i18n = str.popups.about
        let blabs = i18n.blabs;

        popup.$body.innerHTML = `
            <div class="about-scroll">
                <hgroup class="header">
                    <h1>${verbify(str.common.title_rich())}</h1>
                    <i><small>${verbify(blabs[Math.floor(Math.random() * blabs.length)])}</small></i>
                </hgroup>
                <p>
                    ${i18n.strings.game("{https://duducat.moe|duducat / ducdat0507}")}
                </p>
                <p>
                    ${i18n.strings.openSource()}<br>
                    {LICENSE|${i18n.strings.viewLicense()}}
                    | {https://github.com/ducdat0507/gacha/|${i18n.strings.viewSource()}}
                </p>
                <p>
                    ${i18n.strings.libs()}
                    <br>{https://ducdat0507.github.io/lootalot|lootalot}
                    | {https://github.com/pieroxy/lz-string|lz-string}
                </p>
                <hr>
                <p>
                    ${i18n.strings.music("{https://duducat.moe|duducat}")}
                    <small class="unimportant">${i18n.strings.music_foot()}</small>
                </p>
                <hr>
                <p>
                    ${i18n.strings.icons("{https://iconify.design|Iconify}")}
                </p>
                <p>
                    <small class="unimportant">
                        ${i18n.strings.footer()}
                    </small>
                </p>
                <hr>
                <p>
                    ${i18n.strings.thanks()}
                    <br><b>${i18n.strings.thanks1()}</b>
                    <small class="unimportant">${i18n.strings.thanks1_foot()}</small>
                    
                </p>
            </div>
        `.replaceAll(/\{([^\|\}]+)\|([^\}]+)\}/g, "<a target='_blank' href='$1'>$2</a>")
        popup.$body.classList.add("no-scroll");

        let actions, btn;
        popup.$body.append(popup.$actions = actions = $make("div.actions"));
        btn = $make("button.primary", str.popups.common.action_close());
        btn.onclick = popup.close;
        actions.append(btn);

        return popup;
    },
}