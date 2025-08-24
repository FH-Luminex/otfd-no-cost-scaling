let music = null;

function updateMusic() {
    if (!music) {
        if (!game.option.volume.music) return;
        music = new Audio();
        music.loop = true;
        music.autoplay = true;
    }
    if (game.option.volume.music > 0) {
        let sources = {
            "conscious": "res/music/consciousness_uploader.mp3",
        }
        let src = sources[game.option.music || "conscious"];
        music.volume = game.option.volume.music;
        if (!src) return;
        if (music._music != game.option.music) {
            music.src = src;
            music._music = game.option.music;
        }
        if (music.paused) music.play().catch(e => {
            let d = () => {
                updateMusic();
                document.body.removeEventListener("pointerdown", d);
            };
            spawnNotif(str.notifs.music_needsInteract()).style.textAlign = "center";
            document.body.addEventListener("pointerdown", d);
        });
    } else {
        music.pause();
    }
}