ads.minigames.sort = {
    state: {},

    getName() {
        let list = [
            {
                ball: ["Ball", "Bubble", "Sphere", "Orb"],
                water: ["Water", "Liquid"],
            }[this.state.type].pick(),
            ["Sort", "Sorting", "Sorter"].pick(),
        ];

        // Random words
        const words = [
            "Puzzle", "ASMR", "Master", "Relaxing", "Quest", "Infinite", "Magic",
            ["Game", "App"],
            ["Online", "Offline"], 
            ["Color", "Colorful"], 
            ["Fun", "Funny"],
        ]
        for (let i = 0; i < Math.random() * 3; i++) {
            let word = words.pick();
            words.splice(words.indexOf(word), 1);
            if (typeof word == "object") word = word.pick();
            list.push(word);
        }
        list.shuffle();

        if (Math.random() < 0.5) list.splice(Math.random(list.length - 2) + 1, 0, ["-", ":"].pick());

        // Prefix and suffix
        const prefix = [
            "New", "Best", "Great"
        ]
        if (Math.random() < 0.5) list.unshift(prefix.pick());
        const suffix = [
            "2D", "3D", "Free",
            Math.max(new Date().getFullYear(), 2078)
        ]
        if (Math.random() < 0.5) list.push(suffix.pick());

        return list.join(" ");
    },
    onAdInit(holder) {
        let i18n = str.popups.ad;
        popups.ad.elms.taunt.innerText = [...i18n.strings.taunts.generic, ...i18n.strings.taunts.puzzle].pick();
    },
    onPlay(holder) {
        this.state = {
            type: ["ball", "water"].pick(),
        };
        let difficulty = 100 + (50 * Math.random());
        let extraTubes = Math.floor(Math.max(1, Math.sqrt(Math.random() * difficulty / 100)));
        let colors = difficulty / 100 * Math.sqrt(extraTubes) + 2;
        let capacity = 4;
        while (colors > 15 && extraTubes > 1) {
            extraTubes--;
            colors = difficulty / 100 * Math.sqrt(extraTubes) + 2;
        }
        colors = Math.floor(colors);
        let tubes = this.generatePuzzle(colors, capacity, extraTubes, difficulty);
        let tubeElms = [];

        holder.classList.add("minigame-sort");

        let tubeHolder = this.state.tubes = $make("div.tubes");
        tubeHolder.style.setProperty("--capacity", capacity);
        tubeHolder._scale = 1;
        holder.append(tubeHolder);

        let selectedTube = null;
        let selectedBalls = 0;

        let moves = [];
        function moveBall(fromIndex, toIndex, animate = false, offset = 0) {
            tubes[toIndex].push(tubes[fromIndex].pop());
            if (animate) {
                let elm = tubeElms[fromIndex].lastElementChild;
                elm.classList.add("selected");
                let size = parseFloat(getComputedStyle(tubeHolder).fontSize);
                let p1 = elm.childNodes[0].getBoundingClientRect();
                let p2 = elm.parentElement.getBoundingClientRect();
                p2 = new DOMRect(p1.left, p2.top - p1.height);
                tubeElms[toIndex].append(elm);
                elm.classList.remove("selected");
                let p4 = elm.childNodes[0].getBoundingClientRect();
                let p3 = elm.parentElement.getBoundingClientRect();
                p3 = new DOMRect(p4.left, p3.top - p1.height);
                animateBall(elm, [
                    ...lerpKeyframeLinear(p1, p2, Math.abs(p1.top - p2.top) / size * 30),
                    ...lerpKeyframeArc(p2, p3, Math.sqrt((p2.left - p3.left) ** 2 + (p2.top - p3.top) ** 2) / size * 20, size),
                    ...lerpKeyframeBounce(p3, p4, Math.abs(p3.top - p4.top) / (size + offset) * 20 + 300)
                ])
            } else {
                let elm = tubeElms[fromIndex].lastElementChild;
                tubeElms[toIndex].append(elm);
            }
        }
        function doMove(fromIndex, toIndex, count, animate = false) {
            if (selectedTube !== null) deselectTube();
            count = Math.min(count, capacity - tubes[toIndex].length)
            for (let n = 0; n < count; n++) {
                moveBall(fromIndex, toIndex, animate, count - n);
            }
            moves.push([fromIndex, toIndex, count]);
        }
        function undoMove() {
            let [fromIndex, toIndex, count] = moves.pop();
            for (let n = 0; n < count; n++) {
                moveBall(toIndex, fromIndex);
            }
        }

        function tubeSolved(tube) {
            if (tube.length < capacity) return false;
            for (let i = 1; i < tube.length; i++) if (tube[0] != tube[i]) return false;
            return true;
        }
        function puzzleSolved() {
            for (let tube of tubes) if (tube.length && !tubeSolved(tube)) return false;
            return true;
        }

        function animateBall(child, keyframes) {
            child.childNodes[0].animate({
                zIndex: [1, 1],
                top: [0, 0],
                left: [0, 0],
                position: ["fixed", "fixed"],
                transform: keyframes
            }, {
                duration: keyframes.length * 16
            })
        }
        function lerpKeyframeLinear(from, to, duration) {
            let arr = []
            for (let t = 0; t < duration + 16; t += 16) {
                let tDur = Math.min(1, t / duration);
                arr.push(`translate(${
                    from.left + (to.left - from.left) * tDur
                }px, ${
                    from.top + (to.top - from.top) * tDur
                }px)`)
            }
            return arr;
        }
        function lerpKeyframeArc(from, to, duration, size) {
            let arr = []
            for (let t = 0; t < duration + 16; t += 16) {
                let tDur = Math.min(1, t / duration);
                arr.push(`translate(${
                    from.left + (to.left - from.left) * tDur
                }px, ${
                    from.top + (to.top - from.top) * tDur - size * duration / 50 * (1 - (tDur * 2 - 1) ** 2)
                }px)`)
            }
            return arr;
        }
        function lerpKeyframeBounce(from, to, duration) {
            let arr = []
            function bounce(x) {
                const n1 = 7.5625;
                const d1 = 2.75;

                if (x < 1 / d1) {
                    return n1 * x * x;
                } else if (x < 2 / d1) {
                    return n1 * (x -= 1.5 / d1) * x + 0.75;
                } else if (x < 2.5 / d1) {
                    return n1 * (x -= 2.25 / d1) * x + 0.9375;
                } else {
                    return n1 * (x -= 2.625 / d1) * x + 0.984375;
                }
            }
            for (let t = 0; t < duration + 16; t += 16) {
                let tDur = bounce(Math.min(1, t / duration));
                arr.push(`translate(${
                    from.left + (to.left - from.left) * tDur
                }px, ${
                    from.top + (to.top - from.top) * tDur
                }px)`)
            }
            return arr;
        }


        function selectTube(i, animate = false) {
            selectedTube = i; selectedBalls = 0;
            tubeElms[i].classList.add("selected");
            let children = tubeElms[i].children;
            let size = parseFloat(getComputedStyle(tubeHolder).fontSize);
            if (animate) while (tubes[i][tubes[i].length - 1 - selectedBalls] == tubes[i][tubes[i].length - 1]) {
                let child = children[children.length - selectedBalls - 1]
                let fromRect = child.childNodes[0].getBoundingClientRect();
                child.classList.add("selected");
                let toRect = child.childNodes[0].getBoundingClientRect();
                animateBall(child, [
                    ...lerpKeyframeLinear(fromRect, toRect, Math.abs(fromRect.top - toRect.top) / size * 20)
                ])
                selectedBalls++;
            } else while (tubes[i][tubes[i].length - 1 - selectedBalls] == tubes[i][tubes[i].length - 1]) {
                children[children.length - selectedBalls].classList.add("selected");
                selectedBalls++;
            }
        }
        function deselectTube(animate = false) {
            tubeElms[selectedTube].classList.remove("selected");
            let children = tubeElms[selectedTube].children;
            let size = parseFloat(getComputedStyle(tubeHolder).fontSize);
            if (animate) for (let n = 0; n < selectedBalls; n++) {
                let child = children[children.length - n - 1]
                let fromRect = child.childNodes[0].getBoundingClientRect();
                child.classList.remove("selected");
                let toRect = child.childNodes[0].getBoundingClientRect();
                animateBall(child, [
                    ...lerpKeyframeBounce(fromRect, toRect, Math.abs(fromRect.top - toRect.top) / size * 20 + 300)
                ])
            } else for (let n = 0; n < selectedBalls; n++) {
                children[children.length - n - 1].classList.remove("selected");
            }
            selectedTube = null;
        }


        let index = 0;
        for (let tube of tubes) {
            let tubeElm = $make("tube");
            tubeElm._index = index;
            tubeElm.onclick = () => {
                let i = tubeElm._index;
                if (selectedTube !== null) {
                    let sTube = tubes[selectedTube]
                    if (selectedTube == i) {
                        deselectTube(true)
                        return;
                    } else if (tubes[i].length >= capacity) {
                        deselectTube(true);
                    } else if (tubes[i].length > 0 && sTube[sTube.length - 1] != tubes[i][tubes[i].length - 1]) {
                        deselectTube(true);
                    } else {
                        doMove(selectedTube, i, selectedBalls, true);
                        if (puzzleSolved()) {
                            controls.style.opacity = 0;
                            controls.style.pointerEvents = "none";
                            popups.ad.elms.taunt.innerText = str.popups.ad.strings.taunts.completed.pick();
                            popups.ad.state.skipTimer = 0;
                        }
                        return;
                    }
                }
                if (selectedTube === null) {
                    if (!tubes[i].length) return;
                    if (tubeSolved(tubes[i])) return;
                    selectTube(i, true);
                }
            };
            for (let ball of tube) {
                let ballElm = $make("ball");
                ballElm.setAttribute("color", ballElm.$color = ball);
                ballElm.append($make("span", $icon([
                    "",
                    "tabler:circle",
                    "tabler:triangle",
                    "tabler:square-rounded",
                    "tabler:square-rotated",
                    "tabler:star",
                    "tabler:pentagon",
                    "tabler:jewish-star",
                    "tabler:hexagon",
                    "tabler:heart",
                    "tabler:clubs",
                    "tabler:spade",
                    "tabler:rectangle",
                    "tabler:blob",
                    "tabler:flare",
                    "tabler:droplet",
                ][ball])))
                tubeElm.append(ballElm);
            }
            tubeHolder.append(tubeElm);
            tubeElms.push(tubeElm);
            index++;
        }


        let controls = $make("div.controls");
        holder.append(controls);

        let undoBtn = $make("button", str.ads.minigames.sort.action_undo())
        undoBtn.onclick = () => {
            if (selectedTube !== null) deselectTube();
            if (moves.length > 0) undoMove();
        }
        controls.append(undoBtn)

        let restartBtn = $make("button", str.ads.minigames.sort.action_restart())
        restartBtn.onclick = () => {
            if (selectedTube !== null) deselectTube();
            while (moves.length > 0) undoMove();
        }
        controls.append(restartBtn);

        addEvent("frame", this.onFrame)
    },
    onClose() {
        this.state = {}
        removeEvent("frame", this.onFrame);
    },
    onFrame() {
        let self = ads.minigames.sort;
        let state = self.state;

        if (state.width != state.tubes.clientWidth || state.height != state.tubes.clientHeight) {
            state.tubes._scale = 1;
            state.tubes.style.fontSize = "";
            state.width = state.tubes.clientWidth;
            state.height = state.tubes.clientHeight;
            while (state.tubes.scrollHeight > state.tubes.clientHeight) {
                state.tubes._scale /= 1.1;
                state.tubes.style.fontSize = state.tubes._scale + "em";
            }
        }
    },

    generatePuzzle(colors = 4, capacity = 4, extraTubes = 1, moves = 100) {

        // Generate solved puzzle
        let tubes = [];
        for (let col = 1; col <= colors; col++) {
            tubes.push(new Array(capacity).fill(col));
        }
        for (let i = 0; i < extraTubes; i++) {
            tubes.push([]);
        }

        // Merge the unfilled tubes together
        function clean() {
            let unfilledTubes = tubes.filter(tube => tube.length < capacity);
            while (unfilledTubes.length >= 2) {
                let fromTube = unfilledTubes[unfilledTubes.length - 1];
                let toTube = unfilledTubes[0];
                toTube.push(fromTube.pop());
                if (toTube.length >= capacity) unfilledTubes.shift();
                if (fromTube.length <= 0) unfilledTubes.pop();
            }
        }

        // Shuffle the balls
        for (let m = 0; m < moves; m++) {
            let fromIndex = tubes.map((tube, i) => {
                if (tube.length < 2) return null;
                if (tube[tube.length - 1] != tube[tube.length - 2]) return null;
                return i;
            }).filter(i => i !== null);
            if (fromIndex.length == 0) break;
            fromIndex = fromIndex.pick();

            let fromTube = tubes[fromIndex];
            let fromColor = fromTube[fromTube.length - 1];
            let moveCount = 1;
            while (fromTube[fromTube.length - moveCount - 1] == fromColor) {
                moveCount++;
            }
            moveCount--;

            let toIndex = tubes.map((tube, i) => {
                if (i == fromIndex || tube.length >= capacity) return null;
                if (tube[tube.length - 1] == fromColor) return null;
                if (tube.length <= 1) return i;
                if (tube[tube.length - 1] == tube[tube.length - 2]) return null;
                return i;
            }).filter(i => i !== null);
            if (toIndex.length == 0) {
                clean();
                continue;
            }
            toIndex = toIndex.pick();

            let toTube = tubes[toIndex];
            moveCount = Math.min(moveCount, capacity - toTube.length);
            for (let i = 0; i < moveCount; i++) toTube.push(fromTube.pop());
        }

        clean();

        tubes.shuffle()
        tubes.sort((x, y) => y.length - x.length);

        return tubes;
    }
}