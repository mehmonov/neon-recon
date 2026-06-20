# Neon Recon — Asset generation prompts

Detailed prompts for AI image/audio generation. Generate each, then drop the PNG/audio
into the exact path shown. Claude will wire them into the renderer (Phase 2).

## Conventions (important)
- **Top-down view** (bird's-eye, straight from above) for everything in-world.
- **Directional sprites (player, enemy) must face straight UP (12 o'clock).** The game
  rotates them to the aim direction in code.
- **Transparent PNG** (alpha) for all sprites/UI; **opaque, perfectly tileable** for floor/wall.
- **No text** baked into sprites (except the logo).
- Palette: base `#0A0E14`/`#161C26`, player mint `#3DDC97`, enemy red `#FF4D5E`,
  teal `#2BE0C6`, amber `#FFB23D`, pink `#FF5C7A`.
- Claude scales sprites down in-game, so generate at the sizes below (high-res is fine).

---

## 1. Characters → `public/assets/sprites/`

### player.png — 256×256
```
Top-down view (straight bird's-eye) of a futuristic stealth operative seen directly from
above, compact rounded shoulders and a sleek helmet, holding a compact rifle that points
straight UP (12 o'clock). Dark charcoal armor (#161C26) with glowing neon mint-green
accents (#3DDC97) on the shoulders, helmet rim and gun, soft green rim light. Flat vector
game-art style, clean crisp edges, neon-dark sci-fi mood, bold readable circular silhouette,
subtle inner glow, no text, transparent background (PNG alpha), centered, 256x256, high
contrast. Character faces straight up.
```

### enemy.png — 256×256
```
Top-down view (straight bird's-eye) of an enemy soldier seen directly from above, aggressive
angular shoulders and a visored helmet, holding a rifle that points straight UP. Dark armor
(#161C26) with glowing neon red accents (#FF4D5E) on the shoulders, visor and gun, soft red
rim light. Flat vector game-art style matching a cohesive set, clean crisp edges, neon-dark
sci-fi mood, bold readable silhouette, subtle inner glow, no text, transparent PNG, centered,
256x256, high contrast. Faces straight up.
```

### enemy_heavy.png — 256×256 (optional variant)
```
Top-down view of a heavy armored enemy brute seen directly from above, bulky pauldrons and a
heavy weapon pointing straight UP, dark armor (#161C26) with glowing neon red-orange accents
(#FF6B3D), soft glow. Same flat vector top-down style as the rest of the set, transparent PNG,
centered, 256x256. Faces straight up.
```

---

## 2. Projectiles & VFX → `public/assets/sprites/`

### bullet_player.png — 48×48
```
A small round glowing energy orb, bright white-mint core fading to a soft mint-green glow
(#7FFFE0 / #3DDC97), no hard outline, semi-transparent edges, transparent PNG, centered,
48x48, no background. Game projectile.
```

### bullet_enemy.png — 48×48
```
A small round glowing energy orb, bright white core fading to a soft red glow (#FF8A93 /
#FF4D5E), no hard outline, semi-transparent edges, transparent PNG, centered, 48x48, no
background. Game projectile.
```

### muzzle.png — 128×128 (points right)
```
Top-down gun muzzle flash, a short sharp radial burst of white and pale-yellow with mint-green
edges, pointing to the RIGHT (3 o'clock), semi-transparent, energetic, transparent PNG,
centered, 128x128, no background, game VFX.
```

---

## 3. Tiles → `public/assets/tiles/` (opaque, seamless)

### wall.png — 256×256 tileable
```
A seamless, perfectly tileable top-down wall tile for a dark sci-fi maze, a raised metal block,
base dark slate (#161C26) with a thin glowing neon teal (#2BE0C6) edge highlight near the
border and subtle interior panel lines, flat, crisp, top-down, tiles seamlessly on all four
sides, 256x256, solid (no transparency).
```

### floor.png — 256×256 tileable
```
A seamless, perfectly tileable top-down dark sci-fi metal floor tile, near-black base (#0A0E14
to #0E141C), very subtle panel seams and faint teal micro-details, low contrast so bright
characters pop on top, flat, top-down, tiles seamlessly on all four sides, 256x256, solid (no
transparency).
```

---

## 4. Pickups → `public/assets/sprites/`

### pickup_health.png — 128×128
```
Top-down view of a small health medkit box seen from above, dark casing (#15202A) with a
glowing pink-red (#FF5C7A) medical cross on top and a soft surrounding glow, flat clean
game-icon style, transparent PNG, centered, 128x128, no text.
```

### pickup_ammo.png — 128×128
```
Top-down view of a small ammo crate seen from above, dark casing (#15202A) with glowing amber
(#FFB23D) bullet stripes/icon on top and a soft surrounding glow, flat clean game-icon style,
transparent PNG, centered, 128x128, no text.
```

---

## 5. UI → `public/assets/ui/`

### joystick_base.png — 256×256
```
A mobile game virtual joystick base: a thin translucent circular ring with a soft neon teal
(#2BE0C6) glow, hollow center, minimal flat UI, transparent PNG, centered, 256x256, no text.
```

### joystick_knob.png — 128×128
```
A mobile game virtual joystick knob: a glossy translucent circle with a neon teal (#2BE0C6)
glowing rim and a soft highlight, minimal flat UI, transparent PNG, centered, 128x128.
```

### logo.png — 1024×256
```
A game logo wordmark reading "NEON RECON" in bold futuristic uppercase letters, glowing neon
teal-to-mint gradient (#2BE0C6 → #3DDC97) with a subtle magenta edge glow, slight tech/stencil
styling, transparent background, centered, 1024x256, crisp, high contrast, no extra background
elements.
```

### menu_bg.png — 1080×1920 (portrait)
```
Atmospheric top-down view of a dark sci-fi corridor maze seen from above, near-black floor
(#0A0E14), faint glowing neon teal wall edges, a few soft volumetric light cones and distant
magenta accents, moody depth, completely empty (no characters or text), suitable as a mobile
game menu background, 1080x1920 portrait, cinematic, subtle.
```

---

## 6. Audio → `public/assets/audio/` (AI audio tools, e.g. ElevenLabs SFX / Suno)
- `sfx_shoot.wav` — "short, punchy, suppressed sci-fi gunshot, snappy, dry"
- `sfx_reload.wav` — "mechanical magazine reload, click-clack, quick"
- `sfx_hit.wav` — "muffled low impact thud, body hit"
- `sfx_enemy_death.wav` — "short electronic power-down / glitch zap"
- `sfx_pickup.wav` — "bright positive chime blip, short"
- `sfx_ui.wav` — "soft neon UI tap/click"
- `music_loop.mp3` — "tense ambient electronic loop, dark synth, slow driving pulse, stealth game, seamless loop, ~60s"

---

## Integration note
When files are dropped into these folders with the exact names above, Claude will add an asset
loader and replace the shape-based rendering (player/enemy/bullets/tiles/pickups) and the HTML
menu with the real sprites. Missing files fall back to the current shapes, so you can add them
one at a time.
