# Summon sprites (optional)

Drop PNG strips here and the game uses them instead of the built-in pixel drawings.

File names: `<kind>_idle.png`, `<kind>_walk.png`, `<kind>_attack.png`
(any of the three can be missing; a missing one falls back to the others).

Each file is ONE horizontal strip of square frames: frame size = image height,
number of frames = width / height. Transparent background, character facing RIGHT,
feet at the bottom edge, centered horizontally in each frame.

Kinds (internal keys; the names shown in the game are in src/game.js GIANT / BEAST): titan, stormgod, seagoddess, moongoddess, frostgiant, sunemperor, shogun, treant,
aegis, valkyrie, angel, golems, phoenix, dragonking, dragonform, thunderkirin, skywhale, ninetail, clones
