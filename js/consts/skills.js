const skills = {
    fire: {
        icon: "tabler:bomb",
        desc: () => {
            return str.skills.fire.desc(
                _number(format.time(effects.skillFireSkip))
            ) + "<br>" + str.format.skill.cooldown(_number(format.time(effects.skillFireCooldown)));
        },
        trigger: () => {
            game.res.energy = addWithCap(game.res.energy, effects.skillFireSkip / 60 * effects.bulkPower, effects.energyCap);
            if (game.time.skillStacks.fire > 0) game.time.skillStacks.fire--;
            else game.time.skillCooldowns.fire = effects.skillFireCooldown;
        },
    },
    water: {
        icon: "tabler:snowflake",
        desc: () => {
            return str.skills.water.desc(
                _number("×" + format(effects.skillWaterGain, 2)),
                _number("×" + format(effects.skillWaterWait, 2))
            ) + "<br>" + str.format.skill.cooldown(_number(format.time(effects.skillWaterCooldown)));
        },
        trigger: () => {
            game.drawPref.skills.water = true;
            game.time.skillCooldowns.water = effects.skillWaterCooldown;
        },
    },
    leaf: {
        icon: "tabler:christmas-tree",
        desc: () => {
            return str.skills.leaf.desc(
                _number("×" + format(effects.skillLeafMult, 2)),
            ) + "<br>" + str.format.skill.cooldown(_number(format.time(effects.skillLeafCooldown)));
        },
        trigger: () => {
            game.drawPref.skills.leaf = true;
            game.time.skillCooldowns.leaf = effects.skillLeafCooldown;
        },
    },
    sun: {
        icon: "icon-park-outline:sapling",
        desc: () => {
            return str.skills.sun.desc(
                _number("×" + format(effects.skillSunBuff, 2)),
                _number("×" + format(effects.skillSunDebuff, 2)),
            ) + "<br>" + str.format.skill.cooldown(_number(format.time(effects.skillSunCooldown)));
        },
        trigger: () => {
            game.drawPref.skills.sun = true;
            game.time.skillCooldowns.sun = effects.skillSunCooldown;
        },
    },
    moon: {
        icon: "lucide:wrench",
        desc: () => {
            return str.skills.moon.desc(
                _number("×" + format(effects.skillMoonBuff, 2)),
                _number("×" + format(effects.skillMoonDebuff, 2)),
            ) + "<br>" + str.format.skill.cooldown(_number(format.time(effects.skillMoonCooldown)));
        },
        trigger: () => {
            game.drawPref.skills.moon = true;
            game.time.skillCooldowns.moon = effects.skillMoonCooldown;
        },
    },
}