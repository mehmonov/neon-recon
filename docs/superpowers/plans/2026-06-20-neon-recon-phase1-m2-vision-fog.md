# Neon Recon — Phase 1 / M2 (Vision + Fog) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** Add the signature stealth mechanic — a 45° wall-occluded vision cone, a small 360° proximity sense, and fog of war over everything else — plus mouse aim so the cone can be pointed independently of movement.

**Architecture:** A pure `Fov` module (`angleDiff`, `withinCone`, `lineOfSightClear`, `castRay`, `castConeRays`, `isVisible`) holds all visibility math and is fully unit-tested. `FogRenderer` composites a darkness layer with the cone polygon + proximity circle punched out (canvas `destination-out`). `Input` gains mouse tracking; `Renderer` is split into `drawWorld` / `drawPlayer` so the player draws above the fog.

**Tech Stack:** TypeScript, Canvas 2D, Vitest.

**Run from:** `~/Desktop/neon-recon`

**Done when:** `npm test` green, `tsc` clean, and the dev screenshot shows only the cone + a small circle around the player lit, everything else dark; moving the mouse rotates the cone; walls cut the cone (no seeing around corners).

---

## File map (M2)

| File | Change |
|---|---|
| `src/world/Fov.ts` | Create — all visibility math |
| `src/render/FogRenderer.ts` | Create — darkness + cone/proximity cutout |
| `src/core/Input.ts` | Modify — add mouse tracking + `aimFromCenter` |
| `src/render/Renderer.ts` | Modify — split into `drawWorld` / `drawPlayer` |
| `src/main.ts` | Modify — mouse aim, cone compute, fog draw order |
| `tests/fov.test.ts` | Create |

---

## Task 1: Fov — angle helpers (TDD)

**Files:** Create `src/world/Fov.ts`, Test `tests/fov.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { angleDiff, withinCone } from '../src/world/Fov';

describe('angleDiff', () => {
  it('wraps to [-pi, pi]', () => {
    expect(angleDiff(0, 0.5)).toBeCloseTo(0.5);
    expect(Math.abs(angleDiff(0, 2 * Math.PI))).toBeCloseTo(0);
    expect(angleDiff(0.1, -0.1)).toBeCloseTo(-0.2);
  });
});

describe('withinCone', () => {
  const half = (45 / 2) * (Math.PI / 180);
  it('target straight ahead is inside', () => {
    expect(withinCone({ x: 0, y: 0 }, 0, { x: 10, y: 0 }, half)).toBe(true);
  });
  it('target behind is outside', () => {
    expect(withinCone({ x: 0, y: 0 }, 0, { x: -10, y: 0 }, half)).toBe(false);
  });
  it('target just outside the half-angle is outside', () => {
    expect(withinCone({ x: 0, y: 0 }, 0, { x: 10, y: 10 }, half)).toBe(false); // 45deg > 22.5
  });
});
```

- [ ] **Step 2:** `npx vitest run tests/fov.test.ts` → FAIL (no module)

- [ ] **Step 3: Implement (start of `Fov.ts`)**

```ts
import { Vec2, distance } from '../core/Vec2';
import { TileMap } from './TileMap';
import { TILE, CONFIG } from '../config';

export function angleDiff(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function withinCone(from: Vec2, aim: number, target: Vec2, halfAngle: number): boolean {
  const a = Math.atan2(target.y - from.y, target.x - from.x);
  return Math.abs(angleDiff(aim, a)) <= halfAngle;
}
```

- [ ] **Step 4:** `npx vitest run tests/fov.test.ts` → PASS
- [ ] **Step 5:** commit `feat: fov angle helpers`

---

## Task 2: Fov — line of sight (TDD)

- [ ] **Step 1: Add tests**

```ts
import { lineOfSightClear } from '../src/world/Fov';
import { TileMap } from '../src/world/TileMap';

describe('lineOfSightClear', () => {
  const row = new TileMap(5, 1, [0, 0, 1, 0, 0]); // wall at col2 (x 64..96)
  it('clear in open span', () => {
    expect(lineOfSightClear({ x: 16, y: 16 }, { x: 48, y: 16 }, row)).toBe(true);
  });
  it('blocked by a wall between', () => {
    expect(lineOfSightClear({ x: 16, y: 16 }, { x: 144, y: 16 }, row)).toBe(false);
  });
});
```

- [ ] **Step 2:** run → FAIL
- [ ] **Step 3: Implement (append to `Fov.ts`)**

```ts
export function lineOfSightClear(from: Vec2, to: Vec2, map: TileMap): boolean {
  const dist = distance(from, to);
  const steps = Math.ceil(dist / (TILE / 4));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (map.isWallAtWorld(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)) return false;
  }
  return true;
}
```

- [ ] **Step 4:** run → PASS
- [ ] **Step 5:** commit `feat: fov line of sight`

---

## Task 3: Fov — ray casting for the lit polygon (TDD)

- [ ] **Step 1: Add tests**

```ts
import { castRay, castConeRays } from '../src/world/Fov';

describe('castRay', () => {
  const row = new TileMap(5, 1, [0, 0, 1, 0, 0]); // wall at col2 (x>=64)
  it('reaches full range in the open', () => {
    const open = new TileMap(20, 1, new Array(20).fill(0));
    const end = castRay({ x: 16, y: 16 }, 0, 100, open);
    expect(Math.hypot(end.x - 16, end.y - 16)).toBeCloseTo(100, 0);
  });
  it('stops at a wall', () => {
    const end = castRay({ x: 16, y: 16 }, 0, 300, row);
    expect(end.x).toBeLessThanOrEqual(96); // did not pass the wall
    expect(end.x).toBeGreaterThanOrEqual(60);
  });
});

describe('castConeRays', () => {
  it('returns apex + (rayCount+1) endpoints', () => {
    const open = new TileMap(20, 20, new Array(400).fill(0));
    const pts = castConeRays({ x: 100, y: 100 }, 0, 0.4, 80, 8, open);
    expect(pts.length).toBe(10); // 1 apex + 9 ray ends
    expect(pts[0]).toEqual({ x: 100, y: 100 });
  });
});
```

- [ ] **Step 2:** run → FAIL
- [ ] **Step 3: Implement (append to `Fov.ts`)**

```ts
export function castRay(from: Vec2, angle: number, range: number, map: TileMap): Vec2 {
  const step = TILE / 8;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let d = step;
  while (d < range) {
    const x = from.x + dx * d;
    const y = from.y + dy * d;
    if (map.isWallAtWorld(x, y)) return { x, y };
    d += step;
  }
  return { x: from.x + dx * range, y: from.y + dy * range };
}

export function castConeRays(
  from: Vec2,
  aim: number,
  halfAngle: number,
  range: number,
  rayCount: number,
  map: TileMap,
): Vec2[] {
  const pts: Vec2[] = [{ x: from.x, y: from.y }];
  for (let i = 0; i <= rayCount; i++) {
    const a = aim - halfAngle + 2 * halfAngle * (i / rayCount);
    pts.push(castRay(from, a, range, map));
  }
  return pts;
}
```

- [ ] **Step 4:** run → PASS
- [ ] **Step 5:** commit `feat: fov ray casting for lit cone polygon`

---

## Task 4: Fov — isVisible predicate (TDD)

*Used by enemies/combat in M3. Cone+range needs line-of-sight; proximity senses through walls.*

- [ ] **Step 1: Add tests**

```ts
import { isVisible } from '../src/world/Fov';

describe('isVisible', () => {
  const open = new TileMap(40, 40, new Array(1600).fill(0));
  const aim = 0; // looking +x
  it('sees a target inside the cone and range', () => {
    expect(isVisible({ x: 100, y: 100 }, aim, { x: 200, y: 100 }, open)).toBe(true);
  });
  it('does not see a target behind, beyond proximity', () => {
    expect(isVisible({ x: 300, y: 300 }, aim, { x: 200, y: 300 }, open)).toBe(false);
  });
  it('senses a very close target even behind (proximity)', () => {
    expect(isVisible({ x: 300, y: 300 }, aim, { x: 290, y: 300 }, open)).toBe(true);
  });
  it('does not see through a wall', () => {
    const wall = new TileMap(40, 40, new Array(1600).fill(0));
    // make a vertical wall column at col5 (x 160..192)
    const tiles = new Array(1600).fill(0);
    for (let r = 0; r < 40; r++) tiles[r * 40 + 5] = 1;
    const blocked = new TileMap(40, 40, tiles);
    expect(isVisible({ x: 100, y: 100 }, aim, { x: 250, y: 100 }, blocked)).toBe(false);
    void wall;
  });
});
```

- [ ] **Step 2:** run → FAIL
- [ ] **Step 3: Implement (append to `Fov.ts`)**

```ts
const HALF_ANGLE = (CONFIG.cone.angleDeg / 2) * (Math.PI / 180);

export function isVisible(from: Vec2, aim: number, target: Vec2, map: TileMap): boolean {
  const dist = distance(from, target);
  if (dist <= CONFIG.proximityRadius) return true; // close sense, through walls
  if (dist <= CONFIG.cone.range && withinCone(from, aim, target, HALF_ANGLE)) {
    return lineOfSightClear(from, target, map);
  }
  return false;
}

export { HALF_ANGLE };
```

- [ ] **Step 4:** run → PASS (whole `tests/fov.test.ts`)
- [ ] **Step 5:** commit `feat: fov isVisible predicate`

---

## Task 5: Input — mouse aim (modify `src/core/Input.ts`)

Add mouse tracking and `aimFromCenter`. Append inside the class (and a `mousemove` listener in the constructor):

```ts
// field
private mouse: Vec2 | null = null;
// in constructor, after the key listeners:
target.addEventListener('mousemove', (e) => {
  this.mouse = { x: e.clientX, y: e.clientY };
});
// method
aimFromCenter(cx: number, cy: number): number | null {
  if (!this.mouse) return null;
  return Math.atan2(this.mouse.y - cy, this.mouse.x - cx);
}
```

(`Vec2` is already imported.) Commit `feat: mouse aim input`.

---

## Task 6: Renderer — split world/player (modify `src/render/Renderer.ts`)

Replace the single `draw(map, player, cam)` with two methods so the player can draw on top of the fog:

```ts
drawWorld(map: TileMap, cam: Camera): void { /* the background + walls loop from M1 */ }
drawPlayer(player: Player, cam: Camera): void { /* the player circle + facing notch from M1 */ }
```

Keep the same `COLORS` and drawing code, just moved into the two methods. Commit `refactor: split renderer into world and player passes`.

---

## Task 7: FogRenderer (create `src/render/FogRenderer.ts`, visual)

```ts
import { Vec2 } from '../core/Vec2';

export class FogRenderer {
  private fog: HTMLCanvasElement;
  private fctx: CanvasRenderingContext2D;

  constructor() {
    this.fog = document.createElement('canvas');
    this.fctx = this.fog.getContext('2d')!;
  }

  draw(ctx: CanvasRenderingContext2D, conePts: Vec2[], prox: Vec2, proxR: number): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (this.fog.width !== w || this.fog.height !== h) {
      this.fog.width = w;
      this.fog.height = h;
    }
    const f = this.fctx;
    f.clearRect(0, 0, w, h);
    f.fillStyle = 'rgba(5,7,11,0.93)';
    f.fillRect(0, 0, w, h);

    f.globalCompositeOperation = 'destination-out';
    f.beginPath();
    f.moveTo(conePts[0].x, conePts[0].y);
    for (let i = 1; i < conePts.length; i++) f.lineTo(conePts[i].x, conePts[i].y);
    f.closePath();
    f.fill();
    f.beginPath();
    f.arc(prox.x, prox.y, proxR, 0, Math.PI * 2);
    f.fill();
    f.globalCompositeOperation = 'source-over';

    ctx.drawImage(this.fog, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(conePts[0].x, conePts[0].y);
    for (let i = 1; i < conePts.length; i++) ctx.lineTo(conePts[i].x, conePts[i].y);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = 'rgba(43,224,198,0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
```

Commit `feat: fog of war renderer with cone + proximity cutout`.

---

## Task 8: Wire into `src/main.ts` (modify) + verify

New render order: world → fog → player. Mouse sets the aim each step.

```ts
import { loadLevel1 } from './world/Level';
import { Player } from './entities/Player';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { FogRenderer } from './render/FogRenderer';
import { GameLoop } from './core/loop';
import { castConeRays, HALF_ANGLE } from './world/Fov';
import { CONFIG } from './config';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const level = loadLevel1();
const player = new Player(level.playerSpawn);
const camera = new Camera(canvas.width, canvas.height);
const input = new Input();
const renderer = new Renderer(ctx);
const fog = new FogRenderer();

const loop = new GameLoop(
  1 / 60,
  (dt) => {
    player.update(dt, input.moveDir(), level.map);
    const aim = input.aimFromCenter(canvas.width / 2, canvas.height / 2);
    if (aim !== null) player.aim = aim;
  },
  () => {
    camera.viewW = canvas.width;
    camera.viewH = canvas.height;
    camera.follow(player.pos);

    renderer.drawWorld(level.map, camera);

    const coneWorld = castConeRays(player.pos, player.aim, HALF_ANGLE, CONFIG.cone.range, 48, level.map);
    const coneScreen = coneWorld.map((p) => camera.worldToScreen(p));
    const proxScreen = camera.worldToScreen(player.pos);
    fog.draw(ctx, coneScreen, proxScreen, CONFIG.proximityRadius);

    renderer.drawPlayer(player, camera);
  },
);
loop.start();
```

- [ ] `npm test` → all green (M1 + fov)
- [ ] `npx tsc --noEmit` → clean
- [ ] `npm run dev` → only the cone + a small circle around the player are lit; the rest is dark; mouse rotates the cone; walls cut it off.
- [ ] commit `feat: vision cone + fog of war wired in (M2 complete)`

---

## M2 acceptance checklist
- [ ] `npm test` green (M1 tests + `fov.test.ts`).
- [ ] `tsc --noEmit` clean.
- [ ] Screenshot: cone + proximity lit, rest dark, mouse-aimable, wall-occluded.
- [ ] Committed.

**Next:** M3 — bullets, auto-fire, enemy AI, damage, score.
