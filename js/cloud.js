let cloud = {};

function initCloud() {
    if (!document.referrer) {
        console.error(`document.referrer is empty, how`)
    } else if (new URL(document.referrer).hostname == "galaxy.click") {
        initGalaxyAPI();
    }
}

function initGalaxyAPI() {
    let requests = {};

    let send = (msg) => {
        let echo = Math.random();
        window.top.postMessage({
            ...msg,
            echo
        }, "https://galaxy.click");
        return new Promise((resolve) => {
            requests[echo] = resolve
        });
    }
    window.onmessage = (e) => {
        if (e.origin == "https://galaxy.click") {
            if (e.data?.echo) {
                requests[e.data.echo](e.data);
                delete requests[e.data.echo];
            }
        } else {
            console.log("hmmm", e.origin, e.data);
        }
    }

    let error = (msg) => {
        throw {
            "no_account": new NoAccountError("User is not logged in"),
            "empty_slot": new EmptySaveError("Save slot is empty"),
            "server_error": new Error("Server error"),
        }[msg];
    }

    cloud.type = "galaxy";
    cloud.state = {};
    cloud.listSaves = () => send({
        action: "save_list",
    }).then((data) => {
        if (data.error) error(data.message);
        return Object.fromEntries(Object.entries(data.list).map(([index, data]) => {
            let summary = {};
            try { summary = JSON.parse(data.summary) } catch {}
            let timestamp = summary.timestamp ?? Date.now();
            delete summary.timestamp;
            let id = summary.id;
            delete summary.id;
            return [index, {
                id,
                timestamp,
                summary,
                length: length,
                data: data.content
            }]
        }))
    });
    cloud.save = (slot = 0, label = null) => send({
        action: "save",
        slot,
        label: label ?? "Cloud Save",
        summary: JSON.stringify({
            id: game.id,
            timestamp: Date.now(),
            timePlayed: game.stats.timePlayed, 
            cardsDrawn: game.stats.cardsDrawn, 
            accountsSold: game.stats.accountsSold
        }),
        data: getTextSaveString()
    }).then((data) => {
        if (data.error) error(data.message);
        return data.list;
    });
    cloud.load = (slot = 0) => send({
        action: "load",
        slot
    }).then((data) => {
        if (data.error) error(data.message);
        return JSON.parse(LZString.decompressFromBase64(data.content))
    });
    cloud.clearSave = (slot) => send({
        action: "delete",
        slot
    }).then((data) => {
        if (data.error) throw new Error(data.message);
        return true;
    });
}

class NoAccountError extends Error {}
class EmptySaveError extends Error {}