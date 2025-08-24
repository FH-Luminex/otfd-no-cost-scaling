popups.offline = {
    popup: null,
    stats: {},

    call(awaySec, progressSec, oldStats, newStats) {
        if (this.popup) {
            this.popup.close();
            awaySec += this.stats.awaySec;
            progressSec += this.stats.progressSec;
            oldStats = this.stats.oldStats;
        }

        let i18n = str.popups.offline;
        let popup = callPopup(popups.prompt, 
            i18n.title(), "",
        );
        popup.$content.innerHTML = i18n.desc_time(_number(format.time(awaySec, 4)));
        if (awaySec - progressSec > 1) {
            popup.$content.append(
                $make("br"),
                $makeHTML("small", i18n.desc_timeReduced(_number(format.time(progressSec, 4))))
            );
        }
        popup.$body.insertBefore($make("hr"), popup.$actions);
        
        let list = $make("ul");
        popup.$body.insertBefore($make("p", i18n.desc_event()), popup.$actions);
        popup.$body.insertBefore(list, popup.$actions);
        for (let event in newStats) {
            if (event == "skillCooldown") {
                for (let skill in newStats[event]) {
                    if (oldStats.skillCooldown[skill] != newStats.skillCooldown[skill]) {
                        list.append($makeHTML("li", i18n.events.skillCooldown(
                            str.skills[skill].name(),
                            _number(oldStats.skillCooldown[skill]), 
                            _number(newStats.skillCooldown[skill])
                        )));
                    }
                    if (oldStats.skillStack[skill] != newStats.skillStack[skill]) {
                        list.append($makeHTML("li", i18n.events.skillStack(
                            str.skills[skill].name(),
                            _number(oldStats.skillStack[skill] ?? 0), 
                            _number(newStats.skillStack[skill] ?? 0)
                        )));
                    }
                }
            } else if (event == "skillStack") {
                continue;
            } else if (oldStats[event] != newStats[event]) {
                list.append($makeHTML("li", verbify(i18n.events[event](
                    _number(oldStats[event]), 
                    _number(newStats[event])
                ))));
            }
        }
        if (list.childCount <= 0) {
            list.append($makeHTML("li", i18n.events.nothing()));
        }
        
        popup.$body.insertBefore($make("hr"), popup.$actions);
        
        this.stats = { awaySec, progressSec, oldStats };
        this.popup = popup;
        return popup;
    },

    onClose() {
        popups.offline.popup = null;
    }
}