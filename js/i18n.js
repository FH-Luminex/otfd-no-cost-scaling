let i18nStrings = {}

function getI18nProxy(obj, fallback, key) {
    if (!(key in obj)) obj = fallback;
    if (!obj || !(key in obj)) return null;
    if (typeof obj[key] == "string") return (...args) => {
        let str = obj[key];
        args.forEach((value, index) => (str = str.replaceAll("{" + index + "}", value)));
        return str;
    }
    if (typeof obj[key] == "object") {
        if (Array.isArray(obj[key])) return obj[key];
        return new Proxy({}, {
            get(t, p, r) {
                return getI18nProxy(obj[key], fallback[key], p);
            }
        })
    }
}

/**
 *  @template {object} T
 *  @typedef {{ [key in keyof T]: 
 *      T[key] extends String ? (...args: string) => string :
 *      T[key] extends Array ? T[key] :
 *      T[key] extends Object ? I18nProxy<T[key]> : T[key] }} I18nProxy<T>
 */

/** @typedef {({ [key in keyof typeof i18nDefault]: key})} A */

/** @type {I18nProxy<typeof i18nDefault>} */
let str = new Proxy({}, {
    get(t, p, r) {
        return getI18nProxy(i18nStrings[game.option.language], i18nStrings.en, p);
    }
})

function setLanguage(lang) {
    let oldLang = game.option.language;
    game.option.language = lang;

    // Change verb
    let oldVerb = game.option.verb, oldVerb2 = i18nStrings[oldLang].verbs[oldVerb]._equiv ?? Math.random();
    let newVerb = Object.keys(i18nStrings[lang].verbs).find(x => {
        let newVerb2 = i18nStrings[lang].verbs[x]._equiv ?? Math.random();
        return x == oldVerb || x == oldVerb2 || newVerb2 == oldVerb || newVerb2 == oldVerb2;
    }) ?? i18nStrings[lang].primaryVerb;
    game.option.verb = newVerb;

    // Update UI
    elms.currencies.$points.$title.textContent = str.currencies.points.name();
    elms.currencies.$shreds.$title.textContent = str.currencies.shreds.name();
    elms.currencies.$energy.$title.textContent = str.currencies.energy.name();

    updateVerb();
    updateTabNames();
    setTab(currentTab);
}

function checkMissingStrings(langCode) {
    function check(base, target, path) {
        for (let key in base) {
            if (key == "verbs" && path == "") {
                // Do not check verbs
            } else if (typeof base[key] == "string" && (target == null || target[key] == null)) {
                console.warn("Missing string: " + path + "." + key + " = \n\t%c" + base[key], "font-style: italic");
            } else if (typeof base[key] == "object") {
                if (Array.isArray(base[key])) {
                    if (target == null || target[key] == null) {
                        console.warn("Missing array: " + path + "." + key);
                    }
                } else check(base[key], target?.[key], path + (path && ".") + key);
            }
        }
    }
    check(i18nStrings.en, i18nStrings[langCode], "");
}