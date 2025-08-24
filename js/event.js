let events = {}

function addEvent(event, callback) {
    events[event] ??= [];
    if (!events[event].includes(callback)) events[event].push(callback);
}
function removeEvent(event, callback) {
    events[event] ??= [];
    let index;
    if ((index = events[event].indexOf(callback)) >= 0) events[event].splice(index, 1);
}
function emit(event) {
    events[event] ??= [];
    for (let ev of events[event]) ev();
}

function addEventAlias(baseEvent, ...otherEvents) {
    addEvent(baseEvent, () => otherEvents.forEach(emit));
}

addEventAlias("card-upgrade", "card-update", "res-update");