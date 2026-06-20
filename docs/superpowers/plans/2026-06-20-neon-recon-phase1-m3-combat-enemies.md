# Neon Recon — Phase 1 / M3 (Combat + Enemies) Implementation Plan

> Concise design record (the team has executed M1/M2 the same way). TDD for all logic units.

**Goal:** Make the game "alive" — AI bots that patrol, detect, chase and shoot the player; the player's weapon auto-fires at any enemy revealed in the cone; bullets, damage, death, and score.

**Architecture:** New entities `Weapon` (ammo + reload), `Bullet` (projectile), `Enemy` (AI state machine), plus a shared `physics` module (`collidesCircle`, `moveCircle`) extracted from M1's `Player`. A small `Combat` module holds targeting/hit helpers (`circleHit`, `nearestVisibleEnemy`). Enemies/bullets render **before** the fog, so you only see them inside the cone/proximity. A temporary debug HUD prints HP/ammo/score (real HUD is M4).

**Tech Stack:** TypeScript, Canvas 2D, Vitest.

**Done when:** `npm test` green (new: physics, weapon, bullet, enemy, combat), `tsc` clean, and in the running game enemies patrol, shoot you when they see you, you auto-fire and kill them inside your cone, HP/ammo/score change, walls block both sights and bullets.

---

## Config additions (`src/config.ts`)
Add to `CONFIG.enemy`: `visionRange: 5 * TILE`, `fireRate: 1.5`, `damage: 8`, `bulletSpeed: 420`, `radius: 12`, `preferredDist: 3 * TILE`.

## Tasks

### Task 1 — `src/entities/physics.ts` (+ `tests/physics.test.ts`)
Move `collidesCircle` out of `Player`; add `moveCircle(pos, delta, r, map)` (axis-separated). Tests: collides detects wall / clear; moveCircle moves in open, blocked axis stays. Update `tests/player.test.ts` to drop the `collidesCircle` block (import stays via Player using physics).

### Task 2 — `src/entities/Weapon.ts` (+ `tests/weapon.test.ts`)
`magazine`, `reserve`, `update(dt)`, `canFire()`, `fire()`, `reloading`. Auto-reload when the magazine empties. Tests: fire decrements + cooldown blocks; empty triggers reload that refills from reserve after `reloadSec`.

### Task 3 — `src/entities/Bullet.ts` (+ `tests/bullet.test.ts`)
`new Bullet(pos, angle, speed, damage, team, maxDist, radius)`; `update(dt, map)` moves, dies on wall or past `maxDist`; `alive`, `team`, `damage`, `radius`. Tests: travels; dies at wall; dies past maxDist.

### Task 4 — `src/entities/Enemy.ts` (+ `tests/enemy.test.ts`)
State machine `patrol | attack | search`. `canSee(player, map)` = within `visionRange` and `lineOfSightClear`. Detect → attack (face + shoot at `fireRate`, chase until `preferredDist`); lose sight → search last-known → patrol (horizontal bounce off walls). `update(dt, player, map, fire)`. Tests: starts patrol; detects → attack + calls `fire`; loses sight → search; cannot see through wall.

### Task 5 — `src/systems/Combat.ts` (+ `tests/combat.test.ts`)
`circleHit(a, b, r)`, `nearestVisibleEnemy(from, aim, enemies, map)` (uses `Fov.isVisible`, skips dead). Tests: hit within radius; nearest alive visible chosen, dead skipped.

### Task 6 — `src/world/Level.ts`
Parse `E` markers → `enemySpawns: Vec2[]` (tile is floor). Add 5 `E`s to `LEVEL_1`.

### Task 7 — `src/entities/Player.ts`
Use `moveCircle` from physics; own a `Weapon`; `update` also calls `weapon.update(dt)`.

### Task 8 — `src/render/Renderer.ts`
Add `drawEnemies(enemies, cam)` (red dot + facing notch) and `drawBullets(bullets, cam)` (teal for player, red for enemy). Both drawn before fog.

### Task 9 — `src/main.ts` (wire combat)
Order per frame: update player+weapon; update enemies (they spawn enemy bullets via callback); player auto-fire at `nearestVisibleEnemy`; update bullets + resolve hits (player bullets→enemies, enemy bullets→player); cull dead bullets; on enemy death `score += scorePerKill`; on player HP 0 set game-over.
Render: world → enemies → bullets → fog → player → debug HUD text (`HP / ammo / score / enemies`). Game-over: freeze + "GAME OVER" text.

## Acceptance
- [ ] `npm test` green (incl. physics, weapon, bullet, enemy, combat).
- [ ] `tsc --noEmit` clean.
- [ ] Screenshot: an enemy lit inside the cone, tracers, debug HUD; combat works.
- [ ] Committed.

**Next:** M4 — pickups, real HUD, menu/pause/game-over/victory, touch joysticks, win/lose loop.
