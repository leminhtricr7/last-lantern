# LAST LANTERN — Ngọn Đèn Cuối Cùng

Pixel-art adventure platformer (HTML5 canvas + Electron). The Sun has shattered into 7 fragments;
you are Ember, the last Lanternbearer. Cross 7 biomes, beat 7 guardians, relight the Sun.

## Run it

```bash
npm install        # downloads Electron (~100 MB)
npm start          # run as a desktop app
```

Quick browser test (no install): `node tools/serve.js` then open http://localhost:8123

Add `?debug` to the URL to expose `window.LL` (used by `tools/bot.js`, an autoplayer for smoke-testing levels).

## Controls

| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A / D / arrows | D-pad / left stick |
| Jump (double jump from level 2) | Space / W / Z | A |
| Attack (↓ + attack in air = pogo bounce) | J / X | X / RB |
| Dash (from level 4) | K / C / Shift | B / RT |
| Throw item (dagger / bomb / fire flask) | L | Y |
| Switch throwable | Q | LB |
| Talk / use lever, torch, tablet | E / Enter | RB |
| Pause | Esc / P | Start |
| Mouse (laptop) | Left click: attack / pick menu items / talk to NPC / use lever. Right click: throw. Wheel: switch throwable | |
| Mute / Fullscreen | M / F11 | |

## Content

| # | Biome | Enemies | Boss | Mechanics |
|---|---|---|---|---|
| 1 | Verdant Meadow | slimes, bees | King Slime | spikes, tutorial pacing |
| 2 | Whispering Forest | spiders, bats, slimes | Spider Queen | crumble platforms, double jump |
| 3 | Crystal Caverns | cave spiders, bats, crystal slimes | Crystal Golem | darkness — lantern lights the way |
| 4 | Sunscorch Desert | scorpions, vultures, mummies | Sand Pharaoh | dash ability |
| 5 | Frostbite Peaks | ice slimes, snowmen (shooters), ice bats | Frost King | slippery ice |
| 6 | Ember Volcano | lava slimes, fire sprites, lava blobs | Magma Titan | lava pits, moving platforms |
| 7 | Shadow Citadel | knights, ghosts, shadow skeletons | THE ECLIPSE | everything, hardest |

Each level also hides 3 **Sun Shards** (21 total): every 3 shards = +1 max heart, every 7 = stronger sword.
Languages: Vietnamese + English (switch on the title screen). Progress is saved automatically.

## Characters, monsters & traps

- **Ember** - chibi warrior with a flame-plume helm (4-frame run, idle, jump, fall).
- **Story NPCs** (press **E / Enter** next to them): **Lila** (village girl), **Captain Bram** (soldier), **Gob** (swamp goblin merchant - healing potion + shield charm),
  **Durin** (dwarf smith - bombs, daggers, fire flasks), **Old Merl** (wizard - puzzle hints), **Pip** (fairy guide), **Seraph** (angel). Talking to Lila/Bram/Seraph restores your hearts.
- **~25 monster types** incl. small ones (beetle, wisp, imp, mushroom, zombie) and 7 hand-painted bosses.
- **Traps:** pop-up spikes, dart-shooting totems, sliding saw blades, fire vents, falling rocks/icicles (a red ! marker warns you).

**Phones:** the game always plays landscape - if the phone is held upright, the whole game rotates 90 degrees (and it tries to lock landscape in fullscreen).

## Items, puzzles & relics

- **Throwables** (found all over every map, dropped by monsters, sold by Durin): daggers (fast, 2 dmg), bombs (area blast, crumble cracked walls),
  fire flasks (leave flames that burn enemies and light torches).
- **Puzzles** get harder from map 1 to map 7: lever + gate, key + locked door, torches (any order / in the order shown on a stone tablet),
  cracked walls (bomb them), timed levers (run to the gate before it closes, through traps), multi-lever gates, rune plates stepped in order.
- **Boss relics** - every boss drops a permanent relic: +2 hearts, +1 damage, brighter lantern, double coins + magnet, no ice slip + fast dash, flame-wave sword.
- All monsters, bosses, Ember and every NPC have their own voices (growls, screeches, speech blips), generated in code.

## Story characters

- **Princess Lyra** (map 1) is locked in a cage guarded by monsters. Defeat the guards, free her, and she gives you her **glowing Leek Blade** - your new sword
  (+1 damage, longer reach, green glow). Special: every swing shoots 3 light beams (lights dark maps, long range); a hit heals 1 heart (once per 5s) and stuns the target for 3s; any monster or boss under 20% health is finished by a leek tornado. She cheers you on in maps 4, 6 and 7 (restores your hearts).
- **Mr Shorty Phong** (villain) forces a **Trial** on you in maps 2, 4, 6 and 7: the arena seals and waves of monsters spawn; survive to win hearts, coins and a bomb.
- **QuanSadBoy** (sad bookworm wizard) helps a lot in maps 2 and 3 with advice and free supplies.
- **Quoc the Devil** - after every map the screen darkens and you see the giant devil screaming at his minions (Shorty and an imp). Press Enter to advance.

> Mr Shorty Phong, QuanSadBoy and Quoc are named after real friends who agreed to appear in the game - keep that permission in writing if you sell it.

## Shop, inventory & gear

- Open the **Shop & Inventory** from the title menu or press **B** on the world map. Tabs: Swords, Armor, Pets, Weapons, Inventory, Top-up.
- **60 items** (15 each of swords, armors, pets, special weapons). The pricier, the prettier and the more special. Pay with **gold** (coins you collect; every cleared level also pays a bonus) or **gems**.
- Selecting an item shows a card: what it does and how to use it. You can equip **2 weapons** (slot 1 = J / left-click, slot 2 = H / middle-click / gamepad LT / touch H), **1 armor** and **1 pet**. At least one sword must stay equipped.
- Swords: burn, freeze, poison, chain lightning, lifesteal, crits, boss damage, beams, black holes. Armors: more hearts, damage reduction, dodge, thorns, auto-shield, regen, revive. Pets: coin magnet, biting, healing, shielding, fireballs, projectile blocking, revive... Special weapons include bows, wands, meteors, a black hole, a time-slowing hourglass, the **Staff of the Thunder God** (a god appears and smites enemies) and the **Dragon Horn**.
- **Top-up is in TEST MODE** (`TOPUP_TEST = true` in `src/game.js`): it gives free gems. Before selling, replace `topUp()` with a real payment flow.
- Catalog and item art: `src/items.js`. Music is a chiptune EDM engine in `src/audio.js` (BPM is derived from each level's music definition).

## Bosses, dragon & difficulty

- **Boss fights are long** (roughly 1-3 minutes each, longer later), have **armor** (bombs and flames pierce it), **dodge** your attacks and use their own signature skills:
  slime goo/splits, spider webs + ceiling ambush, golem crystal eruptions + shield (break it with a bomb), pharaoh curse (reversed controls) + sand tornado,
  frost king ice cage + blizzard, magma titan lava columns + meteors + fire sweep, the Eclipse darkness + shadow clones + black hole.
- **Ignarok the Ashwing** - a giant talking dragon. Map 1: fight it near the start, it flees at 25% health. Map 6: it returns in 3 forms (red, three-headed, shadow).
- **Animation:** bosses crouch before slamming, stretch in the air, squash on landing (dust + shockwave rings), lean into charges, recoil when shooting, fade away to teleport, turn invisible to stalk you (`cloak`), brace behind a guard, and roar. Small monsters have walk cycles, wind-ups, burrow underground (scorpions/beetles), blink-teleport (ghosts/wisps), raise shields (knights), pop in when summoned and spin away when killed.
- **Monsters** come in sizes: small (fast), big (tanky), elite (armored); later maps have more, faster and tougher enemies.
- **Mr Shorty's trials** (maps 1, 3, 6, 7) now mix waves of monsters with a torch puzzle; reinforcements keep coming until you solve it.
- **Every map has pitch-black stretches** with glowing eyes, watching shadows, fog, skulls and whispers.
- **Ember shows emotions** (happy, angry, hurt, crying when almost dead).
- **Test mode:** `UNLOCK_ALL = true` in `src/game.js` unlocks every map. Set it to `false` for release so each win unlocks the next map.

## Project layout

- `src/art.js` — all pixel art is generated in code (sprites, tilesets, parallax backgrounds)
- `src/audio.js` — procedural chiptune music + sound effects (Web Audio)
- `src/levels.js` — the 7 biome definitions and the level generator (levels are deterministic per biome)
- `src/game.js` — engine: physics, player, enemies, bosses, HUD, menus, map, save
- `main.js` — Electron shell

Tuning knobs: biome `len`, enemy lists/`min` difficulty in `src/levels.js`; enemy stats in `EN`, boss stats in `BOSS`
(`src/game.js`); player physics constants `GRAV/JUMP/DJUMP/RUN` at the top of the gameplay section.

## Shipping on Steam — checklist

What the game already has: a complete loop (title → story → world map → 7 levels → ending), save system, gamepad, fullscreen.

What you still need to do before selling (be realistic about these):

1. **Playtest and tune difficulty.** Levels are procedurally assembled with conservative jump limits and checked with a
   simple bot, but only human playtesting will tell you if it is fun and fair. Expect 20–30 min of play for a first run;
   Steam players will expect more value — consider more levels, a shop, new abilities, or secret areas.
2. **Art & audio polish.** Everything is code-generated placeholder-quality pixel art and chiptune. For a paid release
   consider commissioning a pixel artist/composer and replacing sprites in `ART` and the music definitions.
3. **Font.** Drop an OFL pixel font with Vietnamese glyphs (e.g. Pixelify Sans, VT323) into `assets/fonts/pixel.ttf` and
   uncomment the `@font-face` in `index.html`.
4. **Steamworks account** — $100 app fee, tax/bank info, create the app to get your **App ID**.
5. **Steam integration** — achievements/cloud saves via [`steamworks.js`](https://github.com/ceifa/steamworks.js)
   (init it in `main.js`, where the comment is). Not required to launch, but expected.
6. **Package** — `npm run dist` (electron-builder) produces `dist/win-unpacked/`; upload that folder with SteamPipe
   (Steamworks SDK `steamcmd`). Change `appId` in `package.json`, and replace `© Your Studio` on the title screen.
7. **Store page** — capsule art, 5+ screenshots, a trailer, description, age rating questionnaire. The store page must be
   live ("coming soon") a few weeks before release for wishlists.
8. Check licensing: all code/art/audio here is generated by this project, so there are no third-party assets to credit.
