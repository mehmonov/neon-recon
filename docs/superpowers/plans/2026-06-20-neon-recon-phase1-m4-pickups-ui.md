# Neon Recon — Phase 1 / M4 (Pickups, UI, Win/Lose) Implementation Plan

> Concise design record. Completes Phase 1: a full, start-to-finish playable game.

**Goal:** Pickups (health/ammo), a proper HUD, menu/pause/game-over/victory screens, a win condition (clear all enemies), and touch joysticks for mobile.

**Architecture:** A `Game` class owns the world (player, enemies, bullets, pickups, score) and a `state` machine (`menu | playing | paused | gameover | victory`); its `update` runs the sim only while `playing` and flips to `victory`/`gameover`. `Pickup` entities respawn on a timer. `Input` gains floating touch joysticks (left=move, right=aim) alongside keyboard/mouse. `Hud` draws the canvas HUD + joysticks; `Screens` manages HTML overlay menus. `main` becomes a thin orchestrator.

**Done when:** tests green (Pickup, Game transitions), `tsc` clean; you can start from a menu, play, pick up health/ammo, win by clearing enemies (victory screen) or die (game-over screen), restart, pause/resume; mobile shows working touch joysticks.

## Config additions
`CONFIG.pickup = { healthAmount: 40, ammoAmount: 30 }`.

## Tasks
1. **`Pickup`** (`src/entities/Pickup.ts` + test) — `kind: 'health'|'ammo'`, `active`, `radius`, `update(dt)` (respawn timer), `collect()`. Tests: collect deactivates; reactivates after `pickupRespawnSec`; stays inactive before.
2. **`Level`** — parse `H`/`A` → `pickupSpawns: {pos, kind}[]`; add H/A markers to `LEVEL_1`.
3. **`Game`** (`src/core/Game.ts` + test) — state machine + sim (moved out of `main`): player/enemies/bullets/pickups/score, auto-fire, hit resolution, pickup collection, win/lose. `reset/start/pause/resume`. Tests: starts in menu; `start`→playing; pause/resume; victory when enemies cleared; game over at hp 0.
4. **`Input`** — floating touch joysticks: `moveDir()` (touch left or keys), `aim(cx,cy)` (touch right or mouse); expose `getMoveStick()/getAimStick()` for rendering.
5. **`Renderer`** — `drawPickups(pickups, cam)` (health=pink box, ammo=amber box).
6. **`Hud`** (`src/render/Hud.ts`) — HP bar, enemies count, score, ammo + reload, and joystick rings/knobs from `Input` sticks.
7. **`Screens`** (`src/ui/Screens.ts`) + `index.html` overlays — menu/pause/gameover/victory + a pause button; wired to `game`.
8. **`main`** — orchestrate: `game.update`; render world→pickups→enemies→bullets→fog→player→hud; `screens.sync(state)`; Esc toggles pause. Only `isVisible` enemies/pickups are drawn.

## Acceptance
- [ ] `npm test` green (+ pickup, game).
- [ ] `tsc` clean.
- [ ] Screenshot: menu, then HUD with a pickup, then victory/game-over.
- [ ] Committed. **Phase 1 complete.**

**Next:** Phase 2 — juice/SFX, multiple heroes/maps, PWA; then Phase 3 multiplayer.
