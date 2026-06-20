# Neon Recon — Dizayn hujjati (Design Spec)

> Ishchi nom: **Neon Recon** (o'zgartirilishi mumkin).
> Sana: 2026-06-20
> Janr: Top-down 2D stealth-shooter (Bullet Echo uslubida).
> Auditoriya: 12+.

---

## 1. Loyiha haqida

O'yinchi yuqoridan ko'rinadigan (top-down) personajni boshqaradi. Sahna — qorong'u
labirint-yo'laklar. O'yinchi faqat **45° ko'rish konusi (vision cone)** ichini ko'radi,
qolgan joy qorong'u (fog of war). Maqsad — dushmanlarni topib otib, ball yig'ish.
O'q va jon cheklangan; mapdan o'q/jon qutilarini olib to'ldiriladi. Personaj faqat
ko'rish konusiga tushgan dushmanni o'qqa tuta oladi; dushmanlar ham o'zining ko'rish
doirasida o'yinchini otadi.

### Platforma strategiyasi (qaror)
- **Avval web** (HTML5). Brauzerda — ham kompyuter, ham telefon brauzerida — o'ynaladi.
- Mobil ilova keyingi bosqichda: bir xil web kod **PWA / Capacitor** bilan o'raladi
  (qaytadan yozish shart emas), yoki kerak bo'lsa Godot'ga native port qilinadi.
- Multiplayer (jamoaviy) — alohida, keyingi bosqich (Phase 3).

---

## 2. Texnik stack

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Til | **TypeScript** | Tip xavfsizligi, toza arxitektura |
| Render | **HTML5 Canvas 2D** | FOV/fog ustidan to'liq nazorat, yengil |
| Build/dev | **Vite** | Tez dev-server, HMR, oson build |
| Test | **Vitest** | FOV va combat matematikasi uchun unit test |
| Framework | **Yo'q (vanilla)** | Ortiqcha og'irlik yo'q, mobil brauzerda tez yuklanadi |

Alternativlar (rad etildi): Phaser (og'irroq, FOV'ni baribir o'zimiz yozardik),
PixiJS (faqat render qatlami, ortiqcha murakkablik).

---

## 3. Core gameplay (Phase 1)

### 3.1 Boshqaruv (controls) — twin-stick
- **Kompyuter:** `WASD`/strelkalar — harakat; **sichqoncha** — nishon (cone sichqonchaga
  qarab buriladi). Auto-fire (pastga qarang).
- **Telefon:** chap virtual joystick — harakat; o'ng virtual joystick — nishon.
  Tana bir tomonga yurib, cone'ni boshqa tomonga burishi mumkin (strafe).
- **Auto-face:** o'ng stickka / sichqonchaga tegilmasa, cone avtomatik harakat
  yo'nalishiga qaraydi.

### 3.2 Ko'rish (Vision / FOV) — asosiy mexanika
- Konus burchagi **45°**, cheklangan masofa (cone ekranda chiziladi/ko'rinadi).
- **Devorlar ko'rishni to'sadi** — `Fov.ts` tile grid bo'ylab raycasting qiladi;
  burchak ortidagi joy ko'rinmaydi.
- **Proximity radius:** kichik 360° doira — juda yaqindagi dushman cone tashqarisida
  ham xira "blip" bo'lib seziladi (taranglik uchun).
- Qolgan hamma joy fog — qorong'u qatlam bilan yopiladi (`FogRenderer.ts`).

### 3.3 Otish (Combat)
- **Auto-fire:** dushman cone + masofa + to'siqsiz ko'rish (line-of-sight) ichiga
  kirsa, qurol avtomatik otadi.
- O'qlar **magazin + reload** bilan: magazin tugasa qayta o'qlash vaqti ketadi.
  Umumiy o'q zaxirasi (reserve) tugasa otib bo'lmaydi.
- O'q — `Bullet` entity (proyektil), devorga/dushmanga tegsa yo'qoladi va zarar beradi.

### 3.4 Resurslar — jon va o'q
- **HP bar** (boshlang'ich 100). Dushman o'qi tegsa kamayadi; 0 bo'lsa — game over.
- **O'q hisobi** HUD'da (`magazin / zaxira`).
- **Pickup'lar:** mapda **jon qutisi** va **o'q qutisi**; ustidan yurilsa olinadi,
  bir muncha vaqtdan keyin qayta paydo bo'ladi (respawn).

### 3.5 Dushman AI (botlar)
Holatlar (state machine):
1. **Patrol** — belgilangan nuqtalar bo'ylab yuradi.
2. **Detect** — o'z ko'rish doirasiga o'yinchi kirsa, alert bo'ladi.
3. **Attack** — o'yinchiga qarata otadi, masofani saqlaydi/yaqinlashadi.
4. **Search** — o'yinchini ko'zdan yo'qotsa, oxirgi ko'rgan joyni qidiradi.
5. **Return** — topa olmasa, patrulga qaytadi.

Qiyinlik: bot soni, otish aniqligi, reaksiya vaqti va joni orqali sozlanadi.

### 3.6 Ball, yutuq va mag'lubiyat
- Har o'ldirilgan dushman uchun **+ball** (masalan +100).
- Mapdagi barcha botlar tugatilsa — **Yutuq (Victory)** + bonus ball.
- HP 0 — **Mag'lubiyat (Game over)**. "Qayta o'ynash" tugmasi.
- (Phase 2'da: vaqt bonusi, kombo, high score saqlash.)

### 3.7 Boshlang'ich sozlamalar (`config.ts` — keyin o'ynab sozlanadi)

| Parametr | Qiymat |
|---|---|
| Player HP | 100 |
| Player tezligi | ~3.2 tile/sek |
| Cone burchagi | 45° |
| Cone masofasi | ~7 tile |
| Proximity radius | ~2.5 tile |
| Magazin / zaxira | 30 / 90 |
| Reload vaqti | 1.3 sek |
| Otish tezligi | 8 o'q/sek |
| O'q zarari | 12 |
| Dushman HP | 60 |
| Dushman soni (MVP) | 5 |
| Pickup respawn | 15 sek |

---

## 4. Map dizayni

- **Tile-based** panjara (masalan 32px katak). MVP uchun **1 ta qo'lda chizilgan map**:
  tor yo'laklar + bir nechta xona, to'siq (cover)lar bilan.
- Map ma'lumoti `Level.ts` da: devor/pol gridi, player spawn, dushman spawn + patrul
  nuqtalari, pickup spawn nuqtalari.
- Devorlar ham **to'qnashuv (collision)** ham **ko'rishni to'sish** uchun ishlatiladi.
- Keyingi phase'da: procedural generator yoki bir nechta map.

---

## 5. UI / Ekranlar

1. **Bosh menyu** — "Boshlash", "Sozlamalar", eng yuqori ball (high score).
2. **O'yin (HUD):** yuqori chap — HP bar; markaz — qolgan dushmanlar `3/6`;
   o'ng — ball; yuqori o'ng burchak — mini-map; past — ikki joystick + o'q hisobi `24/30`
   + reload bari.
3. **Pauza** — "Davom etish" / "Qayta boshlash" / "Menyu".
4. **Yutuq / Mag'lubiyat** — ball, statistika, "Qayta o'ynash".

Dizayn tili: **Neon dark**. Mobil ekranga moslashuvchan (responsive), touch-friendly.

### Rang palitrasi (Neon dark)
| Element | Hex |
|---|---|
| Fon | `#0A0E14` |
| Devor | `#161C26` |
| Vision cone / teal | `#2BE0C6` |
| Personaj | `#3DDC97` |
| Dushman | `#FF4D5E` |
| O'q qutisi / amber | `#FFB23D` |
| Jon qutisi / pushti | `#FF5C7A` |
| Matn | `#EAF0F0` |
| Xira matn | `#8A95A0` |

---

## 6. Fayl arxitekturasi

```
neon-recon/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  public/
    assets/
      sprites/   (player, enemy, bullet, muzzle...)
      tiles/     (floor, wall)
      ui/        (joystick, buttons, logo)
      audio/     (sfx, music)
  src/
    main.ts                # entry; o'yinni ishga tushiradi
    config.ts              # sozlanadigan raqamlar (HP, cone, tezlik...)
    types.ts
    core/
      GameLoop.ts          # fixed-timestep loop (update + render)
      Game.ts              # holat mashinasi: menu/playing/paused/over
      Input.ts             # klaviatura + sichqoncha + touch joystick
      Camera.ts            # o'yinchiga ergashuvchi kamera
      Vec2.ts, math.ts     # vektor/yordamchi matematika
    world/
      TileMap.ts           # grid, devor, collision
      Level.ts             # map ma'lumoti, spawn nuqtalari
      Fov.ts               # raycasting vision cone + occlusion
    entities/
      Player.ts
      Enemy.ts             # AI state machine
      Bullet.ts
      Pickup.ts
    systems/
      Combat.ts            # auto-fire, zarar, hit detection
      Spawner.ts           # pickup/dushman paydo qilish
      Score.ts
    render/
      Renderer.ts          # canvas chizish
      FogRenderer.ts       # qorong'ulik + cone yoritish (compositing)
      Hud.ts               # HP/o'q/ball/minimap
    ui/
      Menu.ts, Pause.ts, GameOver.ts
    audio/
      Audio.ts
  tests/
    fov.test.ts
    combat.test.ts
  docs/superpowers/specs/2026-06-20-neon-recon-design.md
```

Tamoyil: har bir modul bitta aniq vazifaga ega, aniq interfeys orqali bog'lanadi,
alohida tushuniladi va test qilinadi.

---

## 7. Asset'lar — AI generatsiya promptlari

> Promptlar **inglizcha** (AI image generatorlar inglizchada aniqroq ishlaydi).
> Umumiy uslub barcha sprite'lar uchun: *top-down view, 2D mobile game sprite,
> neon dark sci-fi aesthetic, near-black background, glowing neon accents, flat clean
> shapes, crisp edges, transparent PNG background, centered, high contrast.*

### Sprite'lar
1. **Player** — `Top-down 2D game character sprite, a futuristic stealth soldier seen
   directly from above, compact rounded shoulders, holding a rifle pointing up, glowing
   neon teal-green accents (#3DDC97) on dark armor, subtle rim light, flat shading,
   clean vector-like shapes, transparent background, 256x256, Bullet Echo style.`
2. **Enemy (grunt)** — `Top-down 2D enemy soldier sprite seen from above, aggressive
   silhouette, dark armor with glowing red accents (#FF4D5E), helmet, holding a rifle,
   flat shading, clean shapes, transparent background, 256x256.`
3. **Enemy (heavy) — variant** — `...bulkier armored brute, larger shoulders, glowing
   red-orange accents, heavier weapon, transparent background, 256x256.`
4. **Bullet** — `Glowing projectile sprite, small elongated neon tracer, bright core
   with soft outer glow, transparent background, 32x32. Provide teal (#2BE0C6, player)
   and red (#FF4D5E, enemy) versions.`
5. **Muzzle flash** — `Top-down muzzle flash VFX, small bright neon yellow-white radial
   burst, transparent background, 64x64.`
6. **Hit/spark effect** — `Small radial impact spark VFX, bright neon, few short rays,
   transparent background, 64x64.`

### Tile'lar (seamless / tileable)
7. **Floor** — `Top-down seamless dark sci-fi metal floor tile, base #0E141C, subtle
   panel lines, faint neon teal seams, perfectly tileable, 128x128, flat, minimal noise.`
8. **Wall** — `Top-down dark sci-fi wall tile, raised metal block #161C26 with a thin
   glowing neon teal edge highlight, tileable, 128x128, casts a clear top-down silhouette.`

### Pickup'lar
9. **Health pack** — `Top-down game pickup icon, small medkit box, dark casing with a
   glowing red cross (#FF5C7A), soft glow, transparent background, 64x64, flat neon style.`
10. **Ammo box** — `Top-down game pickup icon, small ammo crate, dark casing with glowing
    amber bullets (#FFB23D), soft glow, transparent background, 64x64.`
11. **Pickup aura** — `Soft circular glow halo, single-color radial, transparent
    background, 128x128, used to highlight items on a dark floor.`

### UI
12. **Joystick** — `Mobile game virtual joystick, two parts: a translucent neon-teal ring
    base (200x200) and a glowing knob (100x100), flat, clean, transparent background.`
13. **Buttons** — `Neon dark UI button, rounded rectangle, dark glass fill with a thin
    glowing teal border, flat, mobile game menu, transparent background. States: normal,
    pressed.`
14. **Logo** — `Game logo wordmark "NEON RECON", bold futuristic letters with teal-to-magenta
    neon glow on black, top-down shooter mobile game, clean, high contrast.`
15. **Menu background** — `Atmospheric top-down dark sci-fi corridor scene, neon teal and
    magenta lighting, moody depth, mobile game menu background, 1080x1920 portrait.`

### Ovozlar (SFX/musiqa — generatorga yoki freesound'ga tavsif)
- Shoot — `short punchy suppressed sci-fi gunshot, snappy`
- Reload — `mechanical magazine reload click-clack`
- Hit/damage — `muffled low impact thud`
- Enemy death — `short electronic power-down glitch`
- Pickup — `bright positive chime blip`
- Footstep — `soft muffled step on metal`
- UI click — `soft neon UI tap`
- Music (loop) — `tense ambient electronic loop, dark synth, low driving pulse, stealth game`

---

## 8. Verifikatsiya (test) yondashuvi

- **Unit testlar (Vitest):** FOV raycasting (devor to'sishi, burchak/masofa),
  combat (line-of-sight, hit detection, zarar, ammo/reload), AI holat o'tishlari.
- **Vizual tekshiruv:** dev-server'ni ishga tushirib, headless brauzer orqali screenshot
  olib, har bir ekran (menyu, o'yin, pauza, game over) va asosiy holatlar (cone, fog,
  pickup, o'lim) ko'z bilan tekshiriladi.
- **Har phase oxirida:** spec bo'yicha "barcha qismlar ishlayaptimi" deb tekshiriladi.

---

## 9. Phase'lar yo'l xaritasi

- **Phase 1 — Web MVP (botlarga qarshi):** ushbu hujjatdagi 3–8 bo'limlar to'liq.
  Natija: brauzerda (PC + telefon) o'ynaladigan, to'liq ishlaydigan yagona-rejim o'yin.
- **Phase 2 — Sayqal & kontent:** effektlar/juice (muzzle flash, hit, ekran tebranishi),
  ovoz+musiqa, bir nechta hero/qurol, 2–3 map, qiyinlik darajalari, high score saqlash
  (localStorage), sozlamalar, **PWA** (o'rnatiladigan, offline).
- **Phase 3 — Multiplayer (jamoaviy):** authoritative server (Node.js + WebSocket,
  masalan Colyseus/socket.io), xona/matchmaking, real-time sync (pozitsiya, otish,
  har o'yinchi uchun alohida FOV), jamoa rejimi (2v2/3v3), interpolatsiya/lag kompensatsiya.
- **Phase 4 — Mobil paketlash:** PWA → Play Store (TWA) yoki Capacitor wrap; yoki haqiqiy
  native kerak bo'lsa — Godot'ga port.

---

## 10. Ochiq savollar / keyingi qadam

- Yakuniy nom (hozircha "Neon Recon").
- Aniq raqamlarni (config) o'ynab ko'rib sozlash — implementatsiya davomida.
- Keyingi qadam: ushbu spec'ni **implementatsiya rejasiga** (step-by-step plan)
  aylantirish va Phase 1 ni qurishni boshlash.
