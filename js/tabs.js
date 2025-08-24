let tabs = {};
let tabButtons = {};
let currentTab = "";

function initTabs() {
    makeTabButton("collection");
    makeTabButton("marketplace");
    elms.tab.$buttons.append($make("div.flex-fill"));
    makeTabButton("infobook");
    makeTabButton("options");
    updateTabNames();
}

function makeTabButton(id) {
    let data = tabs[id];
    let label;
    let button = $make("button", 
        $icon(data.icon), " ",
        label = $make("span")
    );
    button.$label = label;
    button.onclick = () => {
        setTab(id);
    }
    elms.tab.$buttons.append(tabButtons[id] = button);
    return button;
}

function updateTabNames() {
    for (let tab in tabButtons) {
        tabButtons[tab].$label.innerText = str.tabs[tab].name();
    }
}

function setTab(tab) {
    tabs[currentTab]?.onDestroy?.();
    elms.tab.innerHTML = "";
    currentTab = tab;
    elms.tab.setAttribute("tab-name", str.tabs[currentTab].name());
    tabs[currentTab]?.onInit?.();
    doUIFrame();

    for (let id in tabButtons) tabButtons[id].disabled = id == tab;
}
