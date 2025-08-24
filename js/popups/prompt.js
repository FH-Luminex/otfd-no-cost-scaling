popups.prompt = {
    call(title, description, choices = undefined, onChoice = () => {}) {
        if (!choices) choices = {close$primary: str.popups.common.action_close()}
        let popup = makePopup();

        popup.$body.append(popup.$header = $make("h3.header", title));
        popup.$body.append(popup.$content = $make("p", description));

        let actions;
        popup.$body.append(popup.$actions = actions = $make("div.actions"));

        for (const choice in choices) {
            let item;
            let value = choices[choice]; 
            if (value) {
                item = $make("button", value);
                let classes = choice.split("$");
                let action = classes.splice(0, 1);
                item.classList.add(...classes);
                item.onclick = () => {
                    onChoice(action);
                    popup.close();
                }
            } else {
                item = $make("div.flex-fill");
            }
            actions.append(item);
        }

        return popup;
    },
}