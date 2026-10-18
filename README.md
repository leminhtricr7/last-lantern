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
  (+1 damage, longer reach, green glow). Special: every swing shoots 3 light beams (lights dark maps, long range); a hit heals 1 heart (once per 9s) and stuns the target for 2.5s; monsters under 15% health (bosses under 8%) are finished by a leek tornado. She cheers you on in maps 4, 6 and 7 (restores your hearts).
- **Mr Shorty Phong** (villain) forces a **Trial** on you in maps 2, 4, 6 and 7: the arena seals and waves of monsters spawn; survive to win hearts, coins and a bomb.
- **QuanSadBoy** (sad bookworm wizard) helps a lot in maps 2 and 3 with advice and free supplies.
- **Quoc the Devil** - after every map the screen darkens and you see the giant devil screaming at his minions (Shorty and an imp). Press Enter to advance.

> Mr Shorty Phong, QuanSadBoy and Quoc are named after real friends who agreed to appear in the game - keep that permission in writing if you sell it.

## Shop, inventory & gear

- Open the **Shop & Inventory** from the title menu or press **B** on the world map. Tabs: Swords, Armor, Pets, Weapons, Inventory, Top-up.
- **100 items** (25 each of swords, armors, pets, special weapons). The weapon shop is **free** for everyone (`SHOP_FREE = true` in `src/game.js`; set it to `false` to charge gold/gems). The pricier, the prettier and the more special. Pay with **gold** (coins you collect; every cleared level also pays a bonus) or **gems**.
- Selecting an item shows a card: what it does and how to use it. You can equip **2 weapons** (slot 1 = J / left-click, slot 2 = H / middle-click / gamepad LT / touch H), **1 armor** and **1 pet**. At least one sword must stay equipped.
- Swords: burn, freeze, poison, chain lightning, lifesteal, crits, boss damage, beams, black holes. Armors: more hearts, damage reduction, dodge, thorns, auto-shield, regen, revive. Pets: coin magnet, biting, healing, shielding, fireballs, projectile blocking, revive... Special weapons include bows, wands, meteors, a black hole, a time-slowing hourglass, the **Staff of the Thunder God** (a god appears and smites enemies) and the **Dragon Horn**.
- The **Top-up** tab is hidden (`TOPUP_ENABLED = false`): no real-money payment is connected. Gold from levels still works if you turn `SHOP_FREE` off.
- Catalog and item art: `src/items.js`. Music is a chiptune EDM engine in `src/audio.js` (BPM is derived from each level's music definition).
- **Princess Lyra follows you through map 2.** After you beat map 2 the story moves to **Castle Aurelia**: the crowd cheers, King Aurelius asks you to defeat the guardians, you agree, and a golden egg hatches into a free **Baby Dragon pet** (+500 gold, +20 gems). Plays once per save. Before Ember leaves, Lyra gives him a shy kiss on the cheek and runs into the castle; Quoc's rage scene that follows has its own stormy backdrop.
- **After map 1:** Ember rides a horse home with Lyra - a short, shy romance scene - before the devil cutscene.

## The final story (maps 3-7)

- **Mr Sy** (Quoc's second minion) shows up on maps 3 and 5: he wakes the boss for you, then speaks when it falls and vanishes. He also joins Quoc's angry cutscenes.
- **The four helpers** are met by chance on maps 2-5: **QuanSadBoy** (map 2), **HoangKiller** (map 3), **DuongDracular** (map 4), **Santree** (map 5). Each has heard of the lantern boy and promises to help.
- **Map 7 (Shadow Citadel)** is longer and full of monsters, traps and new back-and-forth puzzles (gates that need TWO keys - one lies far behind you). Then:
  1. **Mr Shorty Phong** duel: human form, then he turns into a hat-wearing monster.
  2. More trials and story, then **Mr Sy** duel: plague-doctor form, then a giant venom serpent.
  3. **Quoc, the Dark Lord** (spiked bone crown, black spiked armour, ragged cape, red eyes) - **8 stages**: form 0 the Dark Lord himself, then 7 monster forms (Dark Imp, Hellhound, Chained Demon, Iron General, Winged Archdemon, Ashen Titan, Eternal Eclipse), each with its own look and skills. When form 3 (the Chained Demon) begins, QuanSadBoy, HoangKiller, DuongDracular and Santree join the fight with their own skills.
- Code: `src/foes.js` (all new art), forms/dialogue tables near `FORMS`/`MINI` in `src/game.js`.

## The movie (story placement)

- Opening story -> long map-1 intro -> each map: intro pages on first visit, a **mid-way story beat at the 2nd lantern**, NPC meetings, **the boss speaks before the fight and gives its last words after** (with cinematic black bars) -> after map 1 the horse ride, after map 2 the castle -> Quoc's rage scene after every map -> final map duels -> Quoc's 8 stages -> Quoc's last words -> long ending.
- **Every boss can roar**: it stands still, the screen shakes, and anyone close loses a heart and is knocked back.
- **Each of Quoc's forms drags you into its own world**: Shadow Void, Hellfire Plains, Chain Dungeon, Iron Fortress, Storm Above the Clouds, Ashen Wasteland, Eclipse Void.
- Shortcut for checking the boss: open the game with `?quoc=N` (N = 0-7).

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
- **Progression:** each boss you beat unlocks the next map (`UNLOCK_ALL` in `src/game.js` is `false`; set it to `true` to unlock every map for testing).

## Online co-op (up to 5 players, 30 heroes)
- Title screen -> **Online Co-op**. One player picks **Create room** and gets a 5-letter room code; friends pick **Join room** on their own computer and type the code.
- In the lobby everyone presses **C** to choose one of **30 heroes** (Warrior, Mage, Ranger, Guardian, Assassin, Support). Each hero has its own colours and hat, small HP/speed/damage changes and **one special skill on R / gamepad RB** (blasts, heals, shields, meteors, chain lightning, black holes, arrow rain, war cry...).
- The host picks the map (left/right) and presses Enter. The host's computer runs the game; guests send their buttons and receive the world about 20 times a second (around 30 KB/s per guest).
- **Co-op story**: the first match in a room opens with a one-minute story (the Sun torn apart, the old lantern calling heroes from all over the kingdom), where every player's hero introduces themselves. Each map starts with a short team scene, Ember's lines in boss and story scenes are spoken by the players' heroes in turn, and beating Quoc together plays a co-op ending. Everyone reads at their own pace; the game waits until all players have finished.
- A hero who runs out of hearts falls down and gets back up after 9 seconds (much faster if a friend stands next to them). If the whole team is down, the host restarts everyone from the checkpoint.
- Enemies chase the nearest hero, bosses switch targets every few seconds, and nobody is left behind a boss wall.
- Connection uses PeerJS (WebRTC, `src/vendor/peerjs.min.js`) with the free public PeerJS server to find each other; very strict networks may block the direct connection.
- Every room has a join link (`...?room=CODE`, press **L** in the lobby to copy it). Opening the link joins the room directly - to test alone, create a room in one tab and open the link in a second tab. The game keeps running while its tab is in the background during co-op.
- Dev test page with a host and a guest side by side: `http://localhost:8123/tools/coop_test.html`.

## 10 maps, Star Gems and the in-level bag
- **10 maps**. After the Volcano come three new lands, then the Shadow Citadel (Quoc) as map 10:
  - Map 7 **Glowcap Swamp**: giant glowing mushrooms; boss **Spore Queen**.
  - Map 8 **Sunken Deep**: underwater, you swim (press jump again and again to rise, the water slows your fall); boss **Abyssal Kraken**.
  - Map 9 **Deepdig Tunnels**: mines with wooden supports; boss **Gravemaw the Great Worm**, which hides underground, rumbles under a hero for a moment and bursts out - jump away in time.
- Internally the new lands are BIOMES 7-9 and the Citadel stays BIOMES 6; `LORDER` in `src/levels.js` is the play order and `LDIFF` keeps the Citadel the hardest.
- New side characters: Old Croak the frog sage, Granny Moss the witch, Nami the mermaid, Captain Redbeard, Old Tu the fisherman, Bay the miner, Grandpa Mole, Lirio the bard - and **Mira the Gem Trader** on every map.
- **Star Gems**: 4 hidden in every map (usually up high). Trade them with Mira (or the "Star Gems" tab of the shop) for supply crates, gold, permanent +1 heart / +1 damage, a golden glow, dragon wings and 4 secret co-op heroes.
- Press **B** (or I / gamepad Back) during a level to open the shop and bag without leaving the level.
- In co-op, hearts and gold are shared by the whole team; everything else belongs to whoever grabs it first.

## Scenery, secrets and saving
- Every land got an art pass (`src/scenery.js` + tile details in `drawWorld`): textured ground with buried stones/roots/gems, soft depth shading, swaying grass and flowers, snow caps, glowing cracks, roots/icicles/stalactites/kelp hanging under ledges, styled platforms (planks, stone, ice, metal grates, coral) with ropes and chains, 50+ props (fences, wells, shrines, pyramids' statues, ice lamps, gothic pillars, minecarts, anchors...), a distant landmark per land (castle, giant tree, crystal spires, pyramids, aurora and ice castle, lava fall, moon and towers, giant mushroom, sunken ship, mine tunnels), drifting clouds, birds/bats/fish, haze, big foreground plants, a colour mood per land and a soft vignette.
- **Hidden nooks**: in each land a few patches of ground are not really there - walk over them and fall into a small treasure room (look for the tiny sparkle).
- **10 easter eggs** (one per land) hidden in those nooks - affectionate homages to famous anime, shown only as objects and hints (no names, no logos). Each first find gives a Star Gem.
- **7 Wish Orbs** with 1-7 stars hidden in seven lands. Gather all seven and a great green dragon grants a wish.
- **Saving on this device**: every checkpoint saves your progress in the level (local storage of this browser / this PC's app). "Resume" on the title screen puts you back at your last checkpoint.

## Divine tier, summons and the deep bosses
- **Divine tier (16-20)**: 10 swords, 5 armors, 5 pets and 5 special weapons above Mythic.
  - Divine swords and armors: press **T** (gamepad right-stick click) to summon a giant for 7 seconds - Stone Titan, Storm God, Sea Goddess, Phoenix, Moon Goddess, Golden Dragon Emperor, Frost Giant, Sun Emperor, Shadow Shogun, Ancient Treant, Golden Guardian, Valkyrie, Shadow Copies, Archangel, Stone Golems. Each rests 60 s (shown top right).
  - Divine pets (Little Wyrmling, Baby Kirin, Pebble Golem, Star Whale, Kitsune Kit) fight and gather gold, and every 60 s transform for 7 s (Great Dragon, Thunder Kirin, Stone Titan, Sky Whale, Nine-Tailed Fox).
  - Divine weapons: Glacier Bow (rain of ice arrows over the screen), Reaper's Scythe (boomerang that stuns and poisons), Meteor Staff (one colossal meteor), Sun Chakram (bounces through 8 enemies), Singularity Cannon (huge black hole then a blast).
- The Spore Queen, the Kraken and Gravemaw use the artist's designs (`assets/ref/new_bosses.webp`, cut by `tools/cut_bosses.py`), move like living creatures and have their own horror voices.
- The Kraken waits in a huge sea cave: the camera pulls back so the hero looks tiny next to it. Gravemaw's arena is a cavern at the bottom of a deep pit in the tunnels.
- Shortcuts to hear and see each deep boss right away: `?boss=7` (Spore Queen), `?boss=8` (Kraken), `?boss=9` (Gravemaw). Click the game once so the browser allows sound. `?level=N` (0-9) starts map N from the beginning (e.g. `?level=8` for the Sunken Deep dive).
- **The Sunken Deep is now a vertical dive** (`genOcean` in `src/levels.js`): you start on a shore with Nami the mermaid, Captain Redbeard and the trader (an opening scene gives the quest), then swim down through six dark zones separated by stone shelves with a hole to the next zone. The deeper you go, the darker it gets and the stronger the currents pushing you away from the way down. Three **Sea Pearls** are hidden in side caves in the walls (other caves hold Star Gems and a secret); bringing all three near the **Tide Door** opens the Kraken's cavern.
- The Kraken fights in a huge tall cavern: it hovers and follows your height, so you fight both on the floor and swimming up; its "tentacle sweep" fills the cavern with bands of tentacles with a single safe gap to swim into.
- Underwater the hero tilts and kicks while swimming and lunges when attacking.
- Every boss slowly heals if nobody hits it for 30 seconds.

## Ranks, the giant forest and the lake
- **Ranks**: every sword, armor, pet and weapon has a grade from **F** up to **SSS** (SSS / SS / S / A / B / C / D / E / F), shown as a badge on each item and in the details. A rank row above the shop grid filters by grade (click it or press **[** and **]**).
- **Giant Forest** (map 7, Glowcap Swamp): the last part of the level is a long, dark forest of huge glowing mushrooms and trees, full of monsters on the ground and in the canopy. At the end the **Spore Queen** does not walk in: a shadow shows up on the ground, locks on you and she crashes down from the sky - run out of the shadow in time!
- **The Lake** (map 9, Deepdig Tunnels): the pit at the end of the tunnels drops you into a huge flooded cavern. You swim and fight Gravemaw in the water; it digs through the lake bed and bursts out under you. A few islands at the surface give you dry ground.

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
