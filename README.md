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

Two keyboard layouts: **WASD + Space / J / K / L** (or the mouse), or **arrows + Z / X / C**. Both share Q E R F T, 1-4, B, Esc.
The in-game guide (title menu or pause menu > Controls) shows the same list.

| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A / D or ← / → | D-pad / left stick |
| Up / down (climb vines, aim, swim, drop through thin floors) | W / S or ↑ / ↓ | left stick |
| Jump (press again in the air: double jump) | Space / Z | A |
| Attack (↓ + attack in the air = pogo bounce) | J / X / left click | X |
| Dash | K / Shift / C | B |
| Guard | F | LB |
| Hero skill | R | RB |
| Charged skills (slots 1-4) | 1 / 2 / 3 / 4 | R3 (first ready one) |
| Throw item | L / right click | RT |
| Next throwing item | Q / mouse wheel | L3 |
| Swap weapon | T / middle click | LT |
| Talk / use lever, torch, tablet | E | Y |
| Shop & bag | B | Back |
| Pause | Esc | Start |
| Menus: choose / go back | Enter, Space, Z, J / Esc | A / B |
| Mute / Fullscreen | M / F11 | |

## Content

| # | Biome | Enemies | Boss | Mechanics |
|---|---|---|---|---|
| 1 | Verdant Meadow | slimes, bees | Gulgor | spikes, tutorial pacing |
| 2 | Whispering Forest | spiders, bats, slimes | Veylith | crumble platforms, double jump |
| 3 | Crystal Caverns | cave spiders, bats, crystal slimes | Prismor | darkness — lantern lights the way |
| 4 | Sunscorch Desert | scorpions, vultures, mummies | Khepsar | dash ability |
| 5 | Frostbite Peaks | ice slimes, snowmen (shooters), ice bats | Rimvald | slippery ice |
| 6 | Ember Volcano | lava slimes, fire sprites, lava blobs | Kaldrok | lava pits, moving platforms |
| 7 | Shadow Citadel | knights, ghosts, shadow skeletons | Quoc (8 forms) | everything, hardest |

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

- **Doctor Sy** (Quoc's second minion) shows up on maps 3 and 5: he wakes the boss for you, then speaks when it falls and vanishes. He also joins Quoc's angry cutscenes.
- **The four helpers** are met by chance on maps 2-5: **QuanSadBoy** (map 2), **HoangKiller** (map 3), **DuongDracular** (map 4), **Santree** (map 5). Each has heard of the lantern boy and promises to help.
- **Map 7 (Shadow Citadel)** is longer and full of monsters, traps and new back-and-forth puzzles (gates that need TWO keys - one lies far behind you). Then:
  1. **Mr Shorty Phong** duel: human form, then he turns into a hat-wearing monster.
  2. More trials and story, then **Doctor Sy** duel: plague-doctor form, then a giant venom serpent.
  3. **Quoc, the Fallen Lanternbearer** (spiked bone crown, black spiked armour, ragged cape, red eyes) - **8 stages**: form 0 the Dark Lord himself, then 7 monster forms (Dark Imp, Hellhound, Chained Demon, Iron General, Winged Archdemon, Ashen Titan, Eternal Eclipse), each with its own look and skills. When form 3 (the Chained Demon) begins, QuanSadBoy, HoangKiller, DuongDracular and Santree join the fight with their own skills.
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
- **Ignar / Ignarok** - a giant talking dragon. Map 1: fight it near the start, it flees at 25% health. Map 6: it returns in 3 forms (red, three-headed, shadow).
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
  - Map 7 **Glowcap Swamp**: giant glowing mushrooms; boss **Morvella**.
  - Map 8 **Sunken Deep**: underwater, you swim (press jump again and again to rise, the water slows your fall); boss **Oktavor**.
  - Map 9 **Deepdig Tunnels**: mines with wooden supports; boss **Vorgrub**, which hides underground, rumbles under a hero for a moment and bursts out - jump away in time.
- Internally the new lands are BIOMES 7-9 and the Citadel stays BIOMES 6; `LORDER` in `src/levels.js` is the play order and `LDIFF` keeps the Citadel the hardest.
- New side characters: Old Croak the frog sage, Granny Moss the witch, Nami the mermaid, Captain Redbeard, Old Tu the fisherman, Bay the miner, Grandpa Mole, Lirio the bard - and **Mira the Gem Trader** on every map.
- **Star Gems**: 4 hidden in every map (usually up high). Trade them with Mira (or the "Star Gems" tab of the shop) for supply crates, gold, permanent +1 heart / +1 damage, a golden glow, dragon wings and 4 secret co-op heroes.
- Press **B** (gamepad Back) during a level to open the shop and bag without leaving the level.
- In co-op, hearts and gold are shared by the whole team; everything else belongs to whoever grabs it first.

## Scenery, secrets and saving
- Every land got an art pass (`src/scenery.js` + tile details in `drawWorld`): textured ground with buried stones/roots/gems, soft depth shading, swaying grass and flowers, snow caps, glowing cracks, roots/icicles/stalactites/kelp hanging under ledges, styled platforms (planks, stone, ice, metal grates, coral) with ropes and chains, 50+ props (fences, wells, shrines, pyramids' statues, ice lamps, gothic pillars, minecarts, anchors...), a distant landmark per land (castle, giant tree, crystal spires, pyramids, aurora and ice castle, lava fall, moon and towers, giant mushroom, sunken ship, mine tunnels), drifting clouds, birds/bats/fish, haze, big foreground plants, a colour mood per land and a soft vignette.
- **Hidden nooks**: in each land a few patches of ground are not really there - walk over them and fall into a small treasure room (look for the tiny sparkle).
- **10 easter eggs** (one per land) hidden in those nooks - affectionate homages to famous anime, shown only as objects and hints (no names, no logos). Each first find gives a Star Gem.
- **Lyra's Seven Notes**: a crystal music note (one colour each) hidden in each of seven lands. Gather all seven and Lyra sings her whole song; the Lightcrane, a crane made of light, grants a wish.
- **Saving on this device**: every checkpoint saves your progress in the level (local storage of this browser / this PC's app). "Resume" on the title screen puts you back at your last checkpoint.

## Divine tier, summons and the deep bosses
- **Divine tier (16-20)**: 10 swords, 5 armors, 5 pets and 5 special weapons above Mythic.
  - Divine swords and armors: a charged skill: land 22 hits, then press the item's slot key (**1** or **2** for a weapon, **3** for the armor; gamepad R3) to summon a giant for up to 30 seconds - Earthvein Colossus, Thunderpeal Lord, Tidecrest Maiden, Phoenix, Paleglow Lady, Elder Goldscale, Glacierfang Giant, Emperor of the Old Sun, Unshadowed General, Old Rootheart, Dawnward Warden, Starspear Maiden, Shadow Trio, Aureole Herald, Gateguard Twins.
  - Divine pets (Coalpup, Qilin Foal, Cobblekin, Starfin Calf, Azure Kit) fight and gather gold, and every 60 s transform for 7 s (Coalheart Drake, Boltmane Qilin, Earthvein Colossus, Lightwhale, Azure Vixen).
  - Divine weapons: Glacier Bow (rain of ice arrows over the screen), Reaper's Scythe (boomerang that stuns and poisons), Meteor Staff (one colossal meteor), Sun Chakram (bounces through 8 enemies), Singularity Cannon (huge black hole then a blast).
- The Morvella, Oktavor and Vorgrub use the artist's designs (`assets/ref/new_bosses.webp`, cut by `tools/cut_bosses.py`), move like living creatures and have their own horror voices.
- Oktavor waits in a huge sea cave: the camera pulls back so the hero looks tiny next to it. Vorgrub's arena is a cavern at the bottom of a deep pit in the tunnels.
- Shortcuts to hear and see each deep boss right away: `?boss=7` (Morvella), `?boss=8` (Oktavor), `?boss=9` (Vorgrub). Click the game once so the browser allows sound. `?level=N` (0-9) starts map N from the beginning (e.g. `?level=8` for the Sunken Deep dive).
- **The Sunken Deep is now a vertical dive** (`genOcean` in `src/levels.js`): you start on a shore with Nami the mermaid, Captain Redbeard and the trader (an opening scene gives the quest), then swim down through six dark zones separated by stone shelves with a hole to the next zone. The deeper you go, the darker it gets and the stronger the currents pushing you away from the way down. Three **Sea Pearls** are hidden in side caves in the walls (other caves hold Star Gems and a secret); bringing all three near the **Tide Door** opens Oktavor's cavern.
- Oktavor fights in a huge tall cavern: it hovers and follows your height, so you fight both on the floor and swimming up; its "tentacle sweep" fills the cavern with bands of tentacles with a single safe gap to swim into.
- Underwater the hero tilts and kicks while swimming and lunges when attacking.
- Every boss slowly heals if nobody hits it for 30 seconds.

## Ranks, the giant forest and the lake
- **Ranks**: every sword, armor, pet and weapon has a grade from **F** up to **SSS** (SSS / SS / S / A / B / C / D / E / F), shown as a badge on each item and in the details. A rank row above the shop grid filters by grade (click it or press **[** and **]**).
- **Giant Forest** (map 7, Glowcap Swamp): the last part of the level is a long, dark forest of huge glowing mushrooms and trees, full of monsters on the ground and in the canopy. At the end the **Morvella** does not walk in: a shadow shows up on the ground, locks on you and she crashes down from the sky - run out of the shadow in time!
- **The Lake** (map 9, Deepdig Tunnels): the pit at the end of the tunnels drops you into a huge flooded cavern. You swim and fight Vorgrub in the water; it digs through the lake bed and bursts out under you. A few islands at the surface give you dry ground.

## Guns (20)
- A new weapon type with its own shop tab: **20 guns**, from the E-rank Flintlock up to the SSS Omega and Celestial Judgment. Put one in Slot 1 or Slot 2 and **hold** the attack key (J / H / mouse) to keep firing; Up / Down aim. Every gun has a magazine (shown on the slot) and reloads when empty, with recoil, muzzle flash, shell casings and its own sounds.
- C-B guns have special ammo (fire, ice that freezes every 5th shot, plasma bursts, tesla lightning, grenades), A guns are heavy (railgun that pierces everything, Gatling that spins up to 14 shots/s, void pistol that leaves black holes).
- **S**: Solar Cannon (sun bolts every 5th shot), The Judge (lightning from the sky + thunder nova). **SS**: Supernova Rifle (homing stars, star ring, supernova blast), Dragon Breath (cone of dragon fire, summons a dragon). **SSS**: OMEGA (reality-tearing beams, void lightning, orbital barrage of 14 sky beams, black hole) and Celestial Judgment (3 homing holy bullets, summons an Aureole Herald and the Emperor of the Old Sun, and a Divine Judgment that strikes every enemy on screen and heals you).

## Title screen and world map (UI redesign)
- **Title**: a twilight scene with a burning Eclipse rising behind layered mountains and a ruined castle, fireflies, embers, mist and the hero beside his lantern; a big gold glowing logo with lantern ornaments; the menu is a glass panel with a glowing selection bar and a bobbing lantern pointer.
- **World map**: each of the 10 lands has its own emblem (hills, pine, crystal, pyramid, snowflake, volcano, mushroom, waves, mine, tower) inside a ringed medallion with a colour glow; the road is a glowing golden path with moving sparks (dark and dotted where locked); cleared lands carry a gold star badge, locked lands are fogged with a padlock; the hero walks to the chosen land; a bottom info panel shows the land, difficulty, puzzles, length, Sun Shards and its relic; the top bar shows the title ribbon, progress, gold, gems and Star Gems.
- Text can now have gradients, outlines, glow and letter spacing (`txt(..., { grad, ol, glow, ls })`).

## Opening film and the new story
- **The story:** the world has no Sun; Aurelia's light comes from **ten Lantern Towers** joined by a river of light in the sky. Every hundred years a **Lanternbearer** carries the **Last Lantern** to relight them. A hundred years ago that was **Quoc**: he lit nine towers, the dark swallowed him at the tenth, and he came back as the **King of the Eclipse**, who wants the world to sleep forever. His servant **Shorty Phong** carries off **Princess Lyra**, whose song is the only voice that can wake a tower. The old lantern chooses an ordinary child: the hero the player picked.
- **"New game" plays a 60 s film** (`drawOpening` in src/game.js; captions in `OPC`): 1) the ten towers and the river of light, 2) the hundred-year Lantern Festival and the child under the old lantern, 3) the black moon: the towers die from the farthest to the nearest and Quoc speaks from the moon, 4) Lyra dragged away by chains of shadow while Shorty laughs, 5) the lantern falls, rolls to the child's feet and lights itself, 6) the child runs into the dark meadow towards the cold First Tower, then the title card. The film uses the player's own hero and their name in the captions.
- **It runs straight into map 1:** after the title card the first map starts with a dialogue (`MAP1_OPEN`: the narrator, the hero and Lila, who gives the old sword and the J hint). Map 1's pages, mid-way beat, Lila, Pip, the Slime King (who sleeps on the First Tower), Shorty's trial and Lyra's rescue were rewritten for the new story; beating the boss relights the First Tower.
- In solo play, story lines written for "Ember" are spoken by the hero the player picked.
- **Map films:** the first time you enter a map from the world map, a short film plays (`MFILM[li]` in src/game.js: captions, sounds and a `draw(t)` per film), then an end card with the map's name, and the map begins with a dialogue (`MFILM[li].open`). Enter skips the film; `save.films` remembers which were seen.
- **Map 2, Whispering Forest (29 s):** the thread of light flies from the First Tower to the sleeping Second Tower; the hero and Lyra walk through the whispering forest (eyes glowing among the leaves); the Ancient Tree opens its eyes and remembers a laughing boy with a lantern a hundred years ago, in faded gold: Quoc; QuanSadBoy walks in reading and bumps into the hero. The map then opens with Quan's book about the old Lanternbearer (nine towers lit, lost at the tenth). Beating the Veylith, Lyra sings and the Second Tower blazes. Castle Aurelia after map 2 was rewritten: the king said goodbye to Quoc in that courtyard a hundred years ago, and eight towers are still dark.
- **Map 3, Crystal Caverns (29 s):** the second thread of light dives into the mountain where the Third Tower is buried; the hero, Lyra and Quan walk through the dark caverns and the crystals wake as the lantern passes ("the crystals keep a memory of every light that touches them"); the great crystal blazes and shows young Quoc lighting a tower while his colour fades from gold to grey: every tower takes a little of the Lanternbearer's warmth, that is the price; Doctor Sy steps out of the dark ("Master Quoc paid that price nine times. Will you pay it ten?") and the Golem wakes. Beating the Golem, the Third Tower's light pours up through every crystal. A caption is hidden as soon as the next one starts (films and opening).
- Maps 4-10 still use the old story text; their films come next.

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
   (Steamworks SDK `steamcmd`). Change `appId` in `package.json`, and replace the `© 2026 Lee Santree and David Quan` credit on the title screen.
7. **Store page** — capsule art, 5+ screenshots, a trailer, description, age rating questionnaire. The store page must be
   live ("coming soon") a few weeks before release for wishlists.
8. Check licensing: all code/art/audio here is generated by this project, so there are no third-party assets to credit.

## Credits & sound
- Title menu has a **Credits** button ("Thực hiện bởi"): scrolling credits for the 2-person team, Lê Minh Trí (Lee San Tree) and Đặng Anh Quân (David Quan), plus important notes.
- Every map has its own ambient soundscape (birds, owls, drips, wind, lava, bells, frogs, whales...), footsteps that match the ground, and a splash when diving.
- Bosses have a sound for every skill, stomping footsteps, and the ambience ducks during boss fights.

## Rescuing Princess Lyra
Lyra's cage hangs high above a staircase of ledges. Mr Shorty Phong's giant beetle (tanky, takes a while) guards it; defeat the guards, climb up and free her. Rewards: Leek Blade (same skills), Leek Armor (+5 hearts, stuns nearby enemies for 3s when you are hit) and the Flying Leek pet (ride it in the air, hold Jump to glide, heals 1 heart every 6s).

## Singer hero (TEST BUILD ONLY)
Hero `miku` (src/heroes.js) is a fan tribute to Hatsune Miku (c) Crypton Future Media, allowed only for non-commercial use under the Piapro license. BEFORE SELLING on Steam: rename it to the original "Mira Song" (deep green hair: change hatCol/sw colours and the `longtwin` hat colours in src/game.js), and delete the Miku credit line in the credits screen.

## Summons and bosses
- Summons use a seek-and-destroy AI: they never follow the hero. A summon locks the boss (in a sealed arena), else the nearest elite, else the nearest monster within about two screens. It marches there slowly (walkers on the ground, flyers in the air) and attacks once in range. With no target it holds its ground.
- A T summon evolves after 10 hits or 15 s; a thin gold bar shows the progress. It becomes its Ancient form and casts an ultimate (Firestorm, Blizzard, Thunderstorm or Meteor Storm): three waves that hit every enemy on screen. Then it plays its death animation, dissolves and is removed. Bosses and enemies can hit summons.
- Summon sprite strips play at a fixed 10 fps, packed on a bottom-centre pivot; the death strip plays once.
- Bosses have 70% more health (50% for multi-form bosses) and 4 blood phases (75/50/25%): each phase roars, calls minions, raises fury and, from phase 2, adds a short shield.
- Artist sprites for summons: see assets/summons/README.md.
- The Emperor of the Old Sun now has the artist's sprites too (walk, idle, attack, hurt and the Ancient form; its death sheet was too dark to cut, so it uses the dissolve).
- Summon art: the artist's design sheets live in art/summon_sheets; `tools/extract_summons.py` (rembg, birefnet-general-lite) cuts them into idle/walk/attack/hurt/death strips plus the Ancient final form, and `tools/clean_summons.py` removes captions/labels. The game reads assets/summons/manifest.json; kinds without art keep the built-in pixel giants.

## Dash and parry
- Dash (K / C / Shift, gamepad B, touch »): available from the first map, one air dash per jump, brief invulnerability and afterimages.
- Parry (F, gamepad LB, touch ◆): a 0.24 s guard. A hit inside it does no damage, stuns the attacker (bosses 0.8 s), reflects projectiles as homing light shots, and makes the next sword hit a double-damage counter.

## Intro and outro films (60 s each)
- **Intro** plays when the game starts (any `?query` in the URL skips it for testing). The first screen asks for a key press so the browser lets the sound play. It can be replayed from the title menu ("Intro film"), and Enter, Esc or the SKIP button skips it. Its four scenes:
  1. Despair (0-15 s): a slow pan over the fallen kingdom with wind, ash and distant lightning.
  2. A glimmer of light (15-30 s): an extreme close-up as the hero steps onto a rock with the cloak in the wind. The camera tilts up to the eyes and the hand on the sword.
  3. The summoning (30-45 s): the boss charges, the hero dashes through it, then parries and knocks its axe away. A pillar of light and cracking ground bring down the Golden Dragon in a low-angle shot.
  4. The charge (45-60 s): hero and dragon rush the boss, a desaturated freeze frame, fade to black, a bass drop, then the logo builds up from sparkling pixels.
- **Outro** plays after the ending story and leads into the credits. Its three scenes:
  1. The last boss dissolves into rising pixels, the clouds part and god rays fall.
  2. The Ancient summons dim their aura, bow, and fly back to the sky as light.
  3. The hero puts the sword away and walks into the sunset, then "Thank you for playing" and the credits.
- **Technique:**
  - Parallax scrolling: sky, clouds, far ruins, mid ruins, ground and foreground move at different speeds.
  - Depth of field: the far and near layers are pre-blurred.
  - Volumetric god rays, dynamic shadows that stretch away from the light, and glow auras on the summons.
  - Time-based particles: ash, embers and star dust.
  - Post-processing on every frame: bloom (bright pass, blur, additive), colour grade (soft-light), vignette, film grain and 2.35:1-style letterbox bars.
- **Score:** a separate film score (`Snd.cine`) with a sad piano, a building taiko and strings, an epic part with brass and choir, and a calm part with bells. One-shot hits come from `Snd.cineHit` (parry ring, roar, bass drop). Code: `tools/cine_block.js`, added by `tools/patch_cine.py`.

## Animator (every character)
- **Heroes** have six pixel-art animations drawn frame by frame. All 30 heroes share them through their colour swaps, and frames are 21 rows tall so the feet never jump. Hats, weapons, the lantern and armour follow the head and hands.

  | Animation | Frames | When it plays |
  |---|---|---|
  | Idle | 4 | Breathing (the body sinks 1 px) |
  | Walk | 6 | Starting to move or slowed |
  | Run | 6 | Full speed, leaning forward |
  | Push | 6 | Walking into a wall, leaning in |
  | Jump | 6 | Crouch, take-off, rise, top, fall, landing squash |
  | Hurt | 3 | The middle frame is a red silhouette |

- **Monsters, bosses, pets, NPCs and summons** use a shared stepped animator, `animPose`, with the same states: idle, walk, run, push (shield block), jump and hurt. It runs at about 10 fps like pixel art and includes the red hurt frame. Each enemy type's own poses (charge, dive, dig...) are layered on top. `redOf(sprite)` makes the red version of any sprite.

## Skills 1-4 (replaces T)
- Landing hits charges everything you wear: sword hits, thrown daggers and your own shots all count. Shown as four badges at the bottom centre. When one fills up, a message says which key to press. Keys: **1** weapon slot 1, **2** weapon slot 2, **3** armor, **4** pet. On touch screens use the ★ button; on a gamepad, R3 uses the first ready one.

  | Item | Skill |
  |---|---|
  | Divine items (`st.summon`) | Summon their god |
  | Pets with a form | Transform for 3 s into the Ancient form |
  | Other swords | Blade Wave |
  | Other guns | Bullet Storm |
  | Other armor | Divine Shield |
  | Other pets | Healing Bond |
  | Other weapons | Shockwave |

- Charge needed: summons and forms 22 hits, armor 16, pet 14, weapons 12.

## How summons arrive and move
1. **Entrance**, different for each god:
   - Rising from the hero's shadow (Shadow Clone, Nine-Tails)
   - A smoke burst (Shogun)
   - A meteor crash (Titan, Golems, Glacierfang Giant)
   - A lightning strike (Thunderpeal Lord, Kirin, Starspear Maiden)
   - A pillar of light (Paleglow Lady, Angel, Emperor of the Old Sun, Aegis)
   - A water geyser (Tidecrest Maiden) or growing roots (Treant)
   - Swooping in from the sky (the flyers)
2. **The 3-step rule:** a 0.5 s freeze then a head turn to lock the target (glowing eyes), a wind-up, then the character's own gait:
   - heavy stomps that shake the ground
   - a hunched stalk that weaves and drags sparks
   - a gentle glide
   - a swagger
   - a gallop
   - soaring for the flyers
3. **No attacks while walking in.** Close to the target, each one opens with its own move:
   - leap and slam
   - teleport into the sky and cast
   - sink into the shadows and burst out behind the target
   - a lightning-fast dash
   - climb and dive
4. **Evolution:** after the opening strike, each kind evolves after its own time (14-18 s) or 10 hits.
5. **Bosses fight back:** they take 40% less damage from summons, and every 3.6 s they sweep away the summons crowding them.

## Picture quality
- The canvas now matches the screen's real pixel density (retina / 4K), so every game pixel is a sharp block.
- The artist's summon art is drawn at full screen resolution instead of being shrunk into the pixel buffer.
- Rarity effects:
  - Rare+ sparkles on held weapons, armor and pets
  - Epic+ glow, and a Legendary+ halo ring at the feet
  - Divine shifts through every colour
  - A shimmer sweep across item icons in the bag and shop

## Six heroes with their own mechanics (original characters)
These are inspired by classic play styles but use original names and designs, so they are safe to sell.

| Hero | Mechanic | Skill (R) |
|---|---|---|
| **Liêm Ảnh / Shade Reaper** | Hooded scythe wielder. Each dash hit fills one of 6 soul pips; when full you switch form. **Assassin** (blue): faster, dash does x2 damage. **Brawler** (red): dash hits heal, +1 damage. | Dash straight through enemies |
| **Mướp & Tí / Tabby & Squeak** | A cartoon cat that stretches and squashes all the time (eyes pop when hit). Squeak the mouse runs along and sets snap traps. | A random gag: lit bomb, stunning frying pan, or an anvil that flattens |
| **Cao Su / Rubber Rin** | The attack is a stretching punch that reaches about 90 px (hold Up / Down to aim). | A storm of rubber punches |
| **Tê Tê Lốc / Roll** | Speed builds while you keep running, to more than twice the start. Jumping or holding Down at speed curls you into a ball with a smaller hitbox that hurts anything you roll into and bounces off. | Launch at full speed |
| **Bông Gòn / Puff** | Up to 6 flutter jumps in the air with very low gravity. | Inhale: sucks small enemies in and copies their power with a hat: Fire, Spark, Web, Wing, Stone or Star (J uses it, R spits it out). Inhaling only air puffs you up to float. |
| **Thời Vương / Chrono** | Time stop greys out the world and freezes enemies, bosses and their shots for 4 s; only the heroes move. The Guardian spirit punches nearby enemies, and all that damage lands when time flows again. | Time Stop |

## Summons stay on the ground
The same rules a Unity Rigidbody2D summon would use (raycast spawn, Y driven only by gravity, X-only walking, a grounded check), implemented in this engine:
- **Spawn:** a downward probe (`sumProbe`) from the hero finds the floor. The summon appears on that point (in front of the hero if that spot is at the same height, otherwise at the hero's own spot), never in the air, over a pit or inside a wall.
- **Gravity only:** walkers change Y only by falling, accelerating at 1100 px/s² up to 600 px/s, or by climbing a step of at most one tile. Nothing lifts them up.
- **X only:** a wall stops them instead of teleporting them on top of it, and a pit or a drop deeper than 3 tiles stops them at the edge (`sumStepX`). The teleport casters (Thunderpeal Lord, Paleglow Lady, Angel, Emperor of the Old Sun, Tidecrest Maiden) reappear on the ground beside the target instead of hanging in the sky. A leap lands on the real floor of the landing spot.
- **Grounded check:** while a walker is falling it neither walks forward nor attacks. If it ever falls out of the level it reappears next to its owner.
- The real flyers (Phoenix, Dragons, Lightwhale) still fly.

## Fan heroes (TEST BUILD ONLY)
- All of them start with **5 hearts**.
- **Miku** joins the fan team, drawn in the same style by `tools/make_miku.py`.
  - Basic attack: a sound wave plus a homing music note.
  - Passive: every 4th hit heals the team ("Encore!").
  - R, **Live Concert**: 6 beats of sound that hit enemies around her, stage lights and notes, and a team heal at the end.
- **Arm / weapon animator** (`FAN_ARM`): the arm, with the scythe or fist, is cut out of each picture and swings around the shoulder or hand.

  | Hero | Basic attack | Skill |
  |---|---|---|
  | Kayn | Scythe slashes down then up (alternating) | |
  | Rhaast | Scythe slashes down then up | The sweep spins the scythe a full circle |
  | Tom | Swipes | |
  | Dio | Chops down from his raised arm | |
  | Miku | Raises her arm | Concert |
  | Jotaro | Arm shoots out | Ora Ora: rapid punches |
  | Sonic | Arm shoots out, then spins | |
  | Luffy | The arm stretches far out | Gatling: rapid punches |
  | Kirby | Puffs up | |
  | Jerry | Kicks | |

  While walking the arm swings with the steps.
- **Movement animator:** each picture is split into body, left leg and right leg (`FAN_RIG` sets the hip line).
  - Walking and running swing and lift the legs in turn while the body bobs and leans forward, more when running.
  - Jumping tucks the legs; pushing a wall leans in with short steps; landing squashes; when hit the hero recoils and turns red.
- **Movement effects:** footstep dust, take-off and landing dust, a speed trail in the hero's colours, and afterimages for Sonic, Kayn and Jerry at full speed. Each hero also has its own particles:

  | Hero | Particles |
  |---|---|
  | Kayn / Rhaast | Shadow or ember wisps |
  | Dio | Gold sparkles |
  | Jotaro | Stand aura |
  | Kirby | Stars when fluttering |
  | Miku | Floating ♪ ♫ notes |
  | Sonic | Sparks |
- They fight with their own moves: no sword, gun or armor (equipped ones are ignored while you play them), but a pet works. J and H use the basic attack, which has its own reach, speed and effect:

  | Hero | Basic attack |
  |---|---|
  | Kayn | Purple scythe arc |
  | Rhaast | Bigger red scythe arc |
  | Tom | Claw marks |
  | Jerry | Quick kick |
  | Sonic | Spin lunge |
  | Kirby | Puff of air, or the copied power |
  | Luffy | Stretch punch |
  | Jotaro | Punch plus a Star Platinum punch |
  | Dio | Chop plus a knife |

  Hold Down in the air to pogo off enemies. Hits charge the passive (the Darkin bar, skill 4 for the pet, Tom's pans) and R stays the hero's own skill.
- The team's own drawings of Kayn (2 forms: Shadow / Rhaast), Tom, Jerry, Luffy, Sonic, Kirby, Jotaro and Dio. The art is in `assets/fanheroes`; it is cut from the team's sheet at its native pixel size and drawn at full screen resolution in play.
- They are behind `FAN_HEROES = true` in `src/heroes.js`. **Set it to false before selling**: these characters belong to Riot, Warner Bros., Shueisha, SEGA, Nintendo/HAL and Araki. The original heroes with the same mechanics stay in the game.

| Hero | Passive | R |
|---|---|---|
| Kayn (Shadow) | Hits fill the Darkin bar | Dash through enemies; with a full bar, turn into Rhaast |
| Kayn (Rhaast) | +2 damage, every 3rd hit heals | Wide scythe sweep (heals), then back to Shadow |
| Tom | Cartoon squash & stretch; 20% of hits drop a frying pan that stuns | Bomb / pan / anvil gag |
| Jerry | 35% dodge ("Missed!"); drops a snap trap every 5 s | Quick slip that drags nearby enemies along and stuns them |
| Luffy | Stretch punch | Gatling |
| Sonic | Momentum, spin ball | Spin Dash |
| Kirby | Flutter jumps | Inhale and copy; spit the power out as a star |
| Jotaro | Star Platinum punches with every attack | Ora Ora barrage |
| Dio | A knife with every attack | The World: 3.5 s time stop; knives fill the screen around enemies and fly when time flows |

## Art clean-up (summons and fan heroes)
- `tools/declutter_summons.py` is a third pass over every summon strip:
  - It removes pieces of the neighbouring figure that the first cut kept (27 stray wings, tails and half-dragons).
  - It drops frames where two figures were fused into one or the figure lost half of itself.
  - It drops frames that the sheet's grid had sliced with a straight edge.
  - It then re-packs each strip on the figure's feet and updates the manifest.
- Each fan hero's legs are measured on its own picture (`FAN_RIG`: hip row and leg columns). Only the real legs swing; Kayn's scythe, Rhaast's pole, Miku's twin tails and Jerry's tail stay on the body.
- The pet's red dragon form is now a vivid red instead of a muddy brown.
- Summons called at the same time appear side by side instead of on top of each other.

## Weapons: one attack button, T to switch
- **J / left-click** attacks with the weapon in hand; hold it to keep a gun firing.
- **T** switches between weapon 1 and weapon 2. On touch screens use the ⇆ button; middle-click and gamepad LT also switch.
- The old J / H boxes in the corner are gone. Skill badges 1 and 2 show both weapons: the one in hand has a gold frame and a little arrow, and the badges also show gun ammo or reload and weapon cooldowns.
- H no longer attacks. Q / the mouse wheel still switches the throwing item.

## Map backdrops (src/backdrops.js)
- All 10 maps were repainted from the team's art direction. Each has a painted sky and its own parallax layers in a 16-bit style, with atmospheric haze on the far layers, and every layer loops seamlessly over 512 px:

  | Map | Sky | Distant | Mid | Near |
  |---|---|---|---|---|
  | Verdant Meadow | Clear blue with clouds | Hazy hills | Rolling fields with trees and a fence | Round trees and flowers |
  | Whispering Forest | Misty | Giant pale trunks | Trunks with branches and hanging vines | Canopy with light shafts, dense foliage |
  | Crystal Caverns | Dark | Glowing stalagmites | Neon blue/purple crystal clusters | Rocky ledges, a stalactite roof |
  | Sunscorch Desert | Bright, with heat rays | Dunes | Banded mesas | A pyramid, ruined columns, palms |
  | Frostbite Peaks | Starry, with an aurora | Towering snowy mountains | Nearer peaks | Frozen waterfalls, snowy pines |
  | Ember Volcano | Smoky | An erupting volcano with lava bombs | Lava falls | Obsidian spires with glowing cracks |
  | Glowcap Swamp | Foggy, with fireflies | Giant glowing mushrooms | Twisted mossy trees | Swamp water, neon mushrooms |
  | Sunken Deep | Deep blue water with light rays | Whales | A sunken temple | A kelp forest, coral reef |
  | Deepdig Tunnels | | Mining equipment (gears, crane, drill) | Scaffolding with a minecart track | Crates; a rocky ceiling with lanterns |
  | Shadow Citadel | Blood red, with an eclipse and bats | Castle towers | Gothic arches with a rose window | Gargoyle pillars and braziers |

- The story's sun is still drawn by the game (it brightens as you collect its shards).

## Multi-level terrain and themed platforms
- Every map now has at least three **multi-level sections** (`tiers()` in levels.js; the short Verdant Meadow currently gets two). A stair ramp climbs onto a long deck, two higher decks and a top deck hold coins and sometimes an item or a heart, and a ramp leads back down. The ground under the decks stays open: drop through a deck with Down. The puzzles of every map are unchanged.
- A final pass lifts any monster, coin or item that would start inside a solid tile onto the first free tile above.
- The one-way platforms are drawn in each map's own material:

  | Map | Platform |
  |---|---|
  | Meadow | Wooden plank with grass |
  | Forest | Mossy branch |
  | Caves | Stone set with glowing crystals |
  | Desert | Carved sandstone |
  | Frost | Ice with snow and icicles |
  | Volcano | Obsidian with glowing cracks |
  | Swamp | Glowing mushroom cap |
  | Ocean | Coral |
  | Tunnels | Scaffold planks with iron braces |
  | Citadel | Gothic stone with red runes |

## Summons follow you; boss fights pull everyone in
- With no enemy around, summons walk (or fly) a little behind their owner and line up instead of piling on one spot. They catch up when the owner runs ahead, and reappear next to the owner if left very far behind.
- When a boss fight starts, every summon drops what it was doing (even a fight with normal monsters far away), appears inside the arena and goes for the boss.
- **Co-op:** the moment one player walks into the boss arena, the fight starts and every teammate is pulled in to fight together, with a message. Players who were down come back with half their hearts. There is no more waiting for everyone to walk in.

## Tarzan vines and the new swamp / ocean / tunnels art
- **Swamp vines:** the Glowcap Swamp has at least five wide pits crossed on long hanging vines (`vineGap()` in levels.js, `vineStep()` in game.js).
  - Jump toward one: touching it in the air makes you grab it, with no button needed.
  - Left / Right pumps the swing, Up / Down climbs the rope, and Jump lets go with a little boost.
  - You also let go if you hit a wall or reach the ground, and a hit knocks you off.
  - Every player in co-op has their own grip, and the others see the rope bend toward them.
  - The tip hangs just above the ground line so a normal jump from the ledge reaches it.
- **Glowcap Swamp backdrop:** a jungle canopy with lianas, distant ancient trees with buttress roots, tangled vines over glowing water, giant mushrooms, mossy ledges.
- **Sunken Deep:** a vertical descent. The screen fades toward black the deeper you go. Far away are giant leviathan and manta silhouettes, with steep cliffs, a kelp forest, glowing jellyfish and coral ledges stepping down.
- **Deepdig Tunnels:** an epic sinkhole. Behind the player are glowing mining tunnels with lanterns, ladders and rails climbing the far wall, giant cavern walls with strata and scaffolding, lava seeping out, and ledges over a pit that glows hotter toward its bottom.
- The boss arenas of maps 8 and 9 already lock the camera.


## Guard (F), Flash and R for every hero
- **F (guard):** the hero braces with a bracing arm and raises a shield in their own colours (a cross, a lit edge, a glow and a guard arc). The catch window is the first 0.24 s, the pose lasts 0.5 s, and the shield flashes white when it catches a blow (hit-stop, shockwave rings and sparks in the hero's colours).
- **Flash (dash):** each hero has a colour pair and a perk (`HERO_FX` / `DASH_PERK` in src/heroes.js): fire (ignites), frost (chills), thunder (stuns), shadow (extra invulnerability), gale (farther, blows enemies away), blink (instant teleport, faster recharge), holy (shield every 9 s), quake (landing shockwave), magnet (pulls coins), mirror (destroys enemy shots), double (two air dashes), blade (slices), time (slows). The perk is shown on the hero select screen.
- **R:** every hero has an own effect style (24 styles: pillar of light, notes, runes, cross slashes, bats, leaves, frost, flames, thunder bolts, spiral, spikes, quake rings, stars, petals, hearts, beams, souls, sunburst, sparks, bubbles, waves, holy cross, burst, clock) in two own colours, a coloured screen tint and a glow around the caster. Short-cooldown skills get a smaller version.
- `tools/patch_heroflash.py` applied this.

## Kirby's R is Copy; sharp pickers
- **Copy (R, 7 s):** breathe in. A small enemy is pulled in and swallowed. A boss or a big enemy is scanned (hold the breath at it for 0.5 s; it only loses a few hit points). You then turn into a fake copy of what you took for **5 seconds**: its picture, stronger hits (x1.7), an own blast (a boss copy releases a shockwave and pink orbs), and anything you touch is hurt. A pink bar above you counts the 5 s down. Breathing in only air still puffs you up to float (and refunds the cooldown). Puff (Bông Gòn) shares this mechanic.
- The fan heroes in the pickers are drawn with the full-resolution picture through the hi-res queue (sharp like in the game), on a slightly brighter cell.

## Longer, harder maps (maps 3-10)
- Maps 1 and 2 are unchanged. From map 3 on (`HARD(li)` in src/levels.js) the maps are about 50% longer: Crystal Caverns 580 tiles, Desert 640, Frost 700, Volcano 760, Swamp 650, Tunnels 820, Shadow Citadel 1000 (the Sunken Deep is a vertical dive and keeps its size).
- More monsters on each stretch (about 1.5-2x per map), more big and elite monsters, a chance of a second trap on long stretches, and more pitch-black zones on the long maps.
- Monsters on maps 3-10 have 35% more health, bosses x2.2 instead of x1.7, Quoc's first form x1.9 and his later forms x1.25.
- Checkpoints still come every 38-52 tiles, so a longer map also has more of them (15-27 per map).

## Release switch and stability (P0)
- **`RELEASE` in src/heroes.js** (false now). Set it to `true` for the build you sell: the fan heroes disappear (other companies' characters), Star Fox becomes "Comet Fox", and every testing shortcut in the link stops working (`?unlock`, `?debug`, `?level=`, `?boss=`, `?quoc=`, `?leekdemo`). Room links (`?room=`) keep working.
- **Crash guards:** a frame step can no longer get a negative time (the co-op background worker and the browser's frames could interleave and make summons and sprites draw with negative sizes). If a frame still throws, the error is logged once, both canvases and the text/hi-res queues are reset and the game carries on; after about 90 failing frames in a row (outside co-op) it returns to the title instead of freezing. Sprite frame indexes can no longer be negative.
- **Save:** a damaged save is copied to `last_lantern_save_v1_broken` and the game starts from what can be read (shards, cleared maps, coins and the seen/films lists are checked). Saves carry a format number (`v: 2`). "New game" also resets which map films were seen.

## One story everywhere
- Maps 4-10, the ending, Quoc's scenes after each map, Shorty/Sy in the Citadel, the allies' arrival, the co-op story, the Sunken Deep quest, the HUD and the film captions now follow the Lantern Towers story: every boss sleeps on a tower (the Fourth in the desert ... the Tenth on top of the Citadel), and beating it lets Lyra sing the tower back to life.
- Quoc is cold and sad in his scenes (a fallen Lanternbearer who lit nine towers alone); Shorty, Sy and the imp keep the jokes. The ending brings him home instead of destroying him.
- The collectibles are "Tower Embers / Tàn Lửa Tháp" (30 in total), the relic is "Heart of the Towers". In Vietnamese text Quoc is always "Quốc" and the title is always "Người Giữ Đèn".

## P1 polish
- **Difficulty curve:** from map 3 on, everything climbs step by step (`HARDK(li)` in src/levels.js: 0.125 on map 3 ... 1 on map 10): monster health x1.05 ... x1.4, boss health factor x1.77 ... x2.25 (Quoc x1.9, his later forms x1.25), extra monsters, elites, big ones and second traps. `DENS` evens out the monster count: about 16, 26, 45, 56, 65, 81, 96, (Sunken Deep ~100), 118, 115 from map 1 to map 10. Map 1's dragon now comes after the first checkpoint (tile 70).
- **Sound:** the hero speaks with the hero voice in every dialogue; the pause menu has Music and Effects volume rows (left / right, 10 % steps); the title's Sound button steps the master volume 100 % ... 20 % ... Off; volumes and mute (M) are saved; the same sound plays at most once every 30 ms.
- **Wording:** `{hero}` in a story line becomes the name of the hero the player picked (`TX()` reads every story line); lines no longer call the hero "Ember", "boy" or "lad", and the ride home with Lyra no longer says "he".
- **HUD above hi-res sprites:** while full-resolution heroes and summons are on screen, the HUD and the play overlays are drawn in a second pass above them (`drawPlayOver`).

## P2 (so far)
- **Boss music:** `BOSS_TRACK(li, tag)` in src/levels.js builds a fight track for every boss from its map's music (same key, a minor scale, its own melody, a little faster on every map); Shorty and Sy get their own. The dragon keeps the old shared track.
- **R sounds:** every hero's R opens with a sound that matches its effect style (`R_SFX`).
- **Hero poses:** sword swing (wind-up, strike, follow-through), dash, F guard and falling (`hero_atk`, `hero_dash`, `hero_guard`, `hero_die` in src/art.js). A hero who falls now kneels and fades instead of vanishing; custom heroes sink and fade.
- **Performance:** the lighting pass skips things far from the camera; particles drop their oldest in one go.
- **Map 4 film (Sunscorch Desert, 28 s):** the third thread of light dives into the sand by a pyramid; heat and cold ("the more towers we light, the colder it gets"); a carving on a ruined wall lights up and shows Quoc refusing the Pharaoh, who begged him to let the tower sleep; at night two eyes open in the pyramid's doorway.
- **Map films 5-10:** every map now opens with a short film (24-28 s) and an opening dialogue:
  - **Frostbite Peaks:** the Fifth Tower locked in ice; Lyra's song cracks it a little; Seraph tells how the king froze his own heart; Sy shatters the ice cage on the summit.
  - **Ember Volcano:** the Sixth Tower sinking in lava; a shard of old lantern glass: here Quoc's lantern cracked for the first time, and he walked on with it; Ignarok, grown up, flies over the smoke.
  - **Glowcap Swamp:** cold glowing mushrooms remember Quoc's dream and whisper his last words, "I wish someone would walk with me"; the Morvella opens her eyes.
  - **Sunken Deep:** the thread dives off the cliff; a whale of light shows the way down to the drowned Eighth Tower and Oktavor's arms (Nami's shore quest still plays when the map begins).
  - **Deepdig Tunnels:** Shorty, alone, admits he only wanted his master to smile; Vorgrub breaks through the rock.
  - **Shadow Citadel:** nine threads meet over the Citadel; Quoc waits under the dark Tenth Tower; the friends from the road walk up behind the team.

## Boss fixes and the controls guide
- **Dragon, shadow form:** a dive toward the left aimed at a point the dragon's body could never reach (its centre is held at least half a body away from the wall), so the dive never ended. The end point is now kept inside the reachable range, and every dragon skill has a time limit (`DS_MAX`) after which it ends by itself.
- **Every boss skill ends on time:** a skill that runs longer than 7 s ends; a boss hidden longer than that comes back in the middle of the arena (`bossReturn`).
- **Nothing leaves the map:** long moves are cut into short steps (no passing through walls), a body inside a wall is pushed to the nearest free spot (`unembed`), heroes and monsters are kept between the map's sides, and bosses are kept inside the arena's real walls (`arenaInner`: the seal wall or the duel walls). A boss that falls below the map comes back.
- **Shorty stuck on the left:** his teleport (and the beast form's wider body) could place him half inside the duel arena's left wall; the push-out sent him into the wall. Teleport, ambush and burrow targets now keep the whole body inside (`arenaClampB`), and a boss that stops making progress jumps out after 1.2 s and reappears in the arena after 2.6 s.
- **Smarter movement:** a boss picks its next attack early and walks into range for it (close for stomps and slams, a run-up for leaps and charges, keeps away for shots and spells), turns with a short delay instead of flipping every frame, speeds up and slows down smoothly, and hops when blocked.
- **Walking bosses:** one-picture bosses now step (the two halves of the legs take turns lifting, the body bobs and leans, dust at each footfall); fast movement plays the run pose.
- **Controls guide:** "Controls" on the title menu and the pause menu shows every button and what it does (keyboard / mouse and gamepad); it opens by itself the first time you control a hero (`save.ctrlSeen`).
- **The top of the map is a ceiling:** Kirby (and Bong, who flies the same way) could flutter-jump past the top of the map and over the arena walls; every hero now stops at the top edge.
- **Double jump for every hero from map 1** (it used to unlock on map 2). The map-1 tip now says how to double jump and where the controls guide is (the old tip listed every key and ran past the screen's edges).
- **Old intro film retired:** the title menu's "Intro film" now replays the new opening film and returns to the title; the first screen at launch only waits for a key (it unlocks the sound) and then shows the title.

## Names (phase 2B)
Every boss and summon has a new name; each English name was checked on the web for clashes with other games. Bosses
also have a title and a one-line intro, shown on a **boss card** when a fight starts, on every form change and on every
dragon stage. Internal keys in the code (`titan`, `kraken`, `form3`...) did not change.

| What | Name (EN / VI) | Title |
|---|---|---|
| Map 1 boss | Gulgor | the Lantern Gulper / Bụng Nuốt Đèn |
| Map 2 boss | Veylith | the Hush Spinner / Kẻ Dệt Lời Thì Thầm |
| Map 3 boss | Prismor | the Silent Prism / Trái Tim Pha Lê Câm |
| Map 4 boss | Khepsar | the One Who Begged to Sleep / Kẻ Xin Được Ngủ |
| Map 5 boss | Rimvald | the Self-Frozen Heart / Trái Tim Tự Đóng Băng |
| Map 6 boss | Kaldrok | the Walking Forge / Lò Rèn Biết Đi |
| Map 7 boss | Morvella | the Swamp's Lullaby / Lời Ru Của Đầm Lầy |
| Map 8 boss | Oktavor | Drowner of the Eighth Tower / Kẻ Nhấn Chìm Tháp Thứ Tám |
| Map 9 boss | Vorgrub | the Ember Eater / Miệng Nuốt Tàn Lửa |
| Map 10 fight | Quoc, King of the Eclipse / Quốc, Vua Nhật Thực | the Lanternbearer Who Went Dark / Người Giữ Đèn Đã Tắt |
| Quoc's 8 forms | the Fallen Lanternbearer, the Lonely Shade, the Masterless Hound, the Oath-Chained, the Warmthless Knight, Wings That Fell Short, Ash of Nine Towers, HEART OF THE ECLIPSE | Step 1-8: The Fall, Loneliness, Lost, Bound, Empty, Failure, Burned Out, Darkness |
| Gatekeepers | Mr Shorty Phong / Ngài Shorty Phong → Shorty Phong, the Tall-Hat Fiend; Doctor Sy / Thầy Sy → Sy, the Venom Wyrm | the Tall-Hat Butler, the Grin Turned Fang; the Green-Coat Poisoner, the Final Dose |
| Dragon | Ignar (map 1) → Ignarok Ashscale / Vảy Tro, Ignarok of Three Furies / Ba Đầu Thịnh Nộ, Ignarok the Duskflame / Cánh Đêm | the Lost Hatchling; the Grown Flame, Rage Split Three Ways, the Swallowed Flame |
| Divine swords → beings | Earthvein Greatsword → Earthvein Colossus; Thunderpeal → Thunderpeal Lord; Tidecrest Blade → Tidecrest Maiden; Pyreplume → Relit Phoenix; Paleglow Edge → Paleglow Lady; Goldscale Blade → Elder Goldscale; Glacierfang → Glacierfang Giant; Lost Sun Blade → Emperor of the Old Sun; Unshadowed Katana → Unshadowed General; Rootheart Blade → Old Rootheart | |
| Divine armours → beings | Dawnward Plate → Dawnward Warden; Starspear Plate → Starspear Maiden; Cloak of Three Shadows → Shadow Trio; Aureole Robe → Aureole Herald; Twinmount Plate → Gateguard Twins | |
| Pets → big forms | Coalpup → Coalheart Drake; Qilin Foal → Boltmane Qilin; Cobblekin → Cobble Colossus; Starfin Calf → Lightwhale; Azure Kit → Azure Vixen | |
| Secret | Lyra's Seven Notes → the Lightcrane (was 7 Wish Orbs and a green dragon) | |

## Sprites (phase 3A samples)
- `tools/pixel/` is a small pixel-art kit: parts are hard-edged shapes shaded from one top-left light, a 1-px outline is
  added around the figure, and every frame is checked (palette ≤ 16 colours, clean alpha, padding, feet on the anchor
  line, loop seams). `python tools/pixel/kaldrok.py`, `python tools/pixel/phoenix.py` rebuild the samples;
  `python tools/pixel/verify.py` re-checks them.
- Output format (for the code to read in phase 3B): `assets/sprites/<name>/<name>_<state>.png` (one horizontal strip per
  state, every cell the same size, facing right) plus `<name>.json` (cell, anchor, fps, frames, loop, palette).
- Samples: Kaldrok (96×96, 8 states, 49 frames) and the Relit Phoenix (80×80, 8 states, 47 frames). Previews (contact
  sheets, GIFs, an in-game-scale comparison) are in `docs/sprites_3A/`. Not wired into the game yet.

## Sprites (phase 3B, main bosses)
- Bosses now read pixel-art sprite sheets (`loadSheet` in src/quocimg.js, `bossSheet` / `sheetFrame` / `drawSheetFrame`
  in src/game.js). The frame follows the boss state: idle, walk, tele (wind-up, timed to the real wind-up), slam
  (stomps, slams, jumps, charges), cast (shots, spells), hurt (own white flash), death (plays over the 1.4 s death), and
  rage from the second phase on. The anchor (feet, bottom centre) sits on the bottom centre of the hitbox.
- In the game: all nine main bosses (maps 1-9). Oktavor is drawn at 1.5x (`SHEET_SCALE`) to fill its big hitbox.
- Each boss: 8 states, 49 frames. Rebuild with `python tools/pixel/gulgor.py`, `veylith.py`, `giants.py`, `deep.py`.
  Previews in `docs/sprites_3B/`.
- Quoc's 8 forms (`tools/pixel/quoc.py`) and the gatekeepers Shorty and Sy, 2 forms each (`tools/pixel/gatekeepers.py`)
  use their own sheets too (`sheet:` on each form in `FORMS`); the form change shrinks and regrows the new art.
  Cells are fitted automatically to the widest pose (`fit_states`).
- Hitboxes follow the art: each boss's `w` / `h` is the solid body of its sheet (`tools/pixel/hitbox.py`; thin parts
  such as staffs, spider legs and tentacle tips are left out). The art is shifted by `SHEET_OFF` so its body sits on the
  hitbox. Three were tuned by hand: the coiled Venom Wyrm (60×70), Oktavor (110×140) and Mr Shorty Phong (24×60).
- Dragons: Ignar (map 1) and Ignarok's three forms (map 6) draw from `assets/sprites/ignar`, `ignarok1-3`
  (`tools/pixel/dragon.py`): hover, fly, wind-up, breath, dive (the body still tilts), perch, hurt, death, stage change.
- Summons and pets (last 3B group): every summon has two sheets, `assets/sprites/<kind>` and `<kind>_evo` (the final
  form, ~1.35x bigger, more ornate, with an 8-frame `evolve` flicker). States: idle, walk, tele (the final form's charge),
  attack, hurt (white flash), death (dissolves into light), spawn (builds up from the ground). `drawSumSheet` in game.js
  draws them 1:1 on the game's pixels and falls back to the old art if a sheet is missing. Humanoids come from
  `tools/pixel/summons.py` (one rig, a spec per summon: build, armour, head, weapon, wings, cape); beasts, dragons, the
  whale, the phoenix's final form, the Shadow Trio, the Cobble Colossus (`cobble`, used when the Cobblekin pet grows) and
  the five small pets (`pet_<id>`, idle + walk) from `tools/pixel/beasts.py`. Previews in `docs/sprites_3B/`.

## Sound identities (phase 4)
- All sound is synthesised in `src/audio.js` (no recorded samples). Every boss id has a material that colours its
  voice, footsteps and skills: b0 Gulgor slime, b1 Veylith whispering silk, b2 Prismor glass (rings instead of roaring),
  b3 Khepsar sand, b4 Rimvald ice, b5 Kaldrok forge, b7 Morvella spores (a lullaby), b8 Oktavor water, b9 Vorgrub earth;
  Quoc's eight forms steel, shadow (a sob), hound, chains, hollow armour (wind, no voice), torn wings, ash, eclipse
  (choir + heartbeat); Shorty butler then fiend; Sy bottles then snake. `Snd.boss / bossSkill / bossStep` in audio.js,
  `bossVox` / `bossVoxId` in game.js.
- Dragons: `Snd.dragon(form, evt)`: Ignar young and high, Ignarok deep, Three Furies three voices, Duskflame echo + choir.
- Summons: `Snd.summon(kind, 'spawn' | 'attack' | 'evo' | 'step')`; footsteps are quiet and never more than two at once.
- Music: `BOSS_TRACK(li, tag, form)` in levels.js picks a theme per fight (`BOSS_THEME`, `QUOC_THEME`, `MINI_THEME`,
  `DRAGON_THEME`): mode, tempo, lead and a signature layer (`SIG` in audio.js: bubbles, whispers, glass bells, desert
  jingle, music box, anvil, dark choir, lullaby, sonar, taiko, waltz, lab bells, brass, chains, heartbeat, flames).
  The music changes with every Quoc form, each gatekeeper form and each dragon stage.
- Loudness: each id plays through its own gain bus. `BAL` (roars) and `KG` (skills per role, footsteps) were measured
  with `Snd.meter` so every roar peaks near -14 dBFS on the effects bus (Quoc's last form a little louder), skills near
  -24 and footsteps near -30. `tools/soundtest.html` (dev only) plays every voice, skill, step and theme and re-measures.
- Footsteps by surface (phase 5, D): `surfUnder(P)` in game.js reads the tile under the hero: the map's ground
  (`GROUND_SURF`: grass, mud, sand, snow, stone, dirt), its floating ledges (`LEDGE_SURF`: wood, stone or ice), ice
  tiles, a moving platform (metal) or water, and plays `Snd.surf(kind)`. `nearSounds` adds a torch crackle when you pass
  a torch, bubbling when lava is close, and a gust of wind when you stand high up outdoors. Co-op guests play their own
  footsteps and nearby sounds locally.
