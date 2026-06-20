# Neon Recon — Phase 1 / M1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the playable foundation — a Vite + TypeScript project where the player walks a tile-based map (with wall collision), a camera follows them, rendered on an HTML5 canvas in the Neon dark palette.

**Architecture:** Vanilla TypeScript, no game framework. A fixed-timestep `GameLoop` drives `update(dt)` and `render()`. Pure-logic modules (`Vec2`, `TileMap`, `Level`, `Input.dirFromKeys`, `Player`, `Camera`, `fixedSteps`) are unit-tested with Vitest; rendering glue (`Renderer`, `main.ts`) is verified visually.

**Tech Stack:** TypeScript, Vite, Vitest, HTML5 Canvas 2D.

**Run all commands from the project root:** `~/Desktop/neon-recon`

**Milestone done when:** `npm test` is green AND you can run `npm run dev`, open the page, and walk around the map with WASD/arrows, blocked by walls, camera following.

---

## File map (created in M1)

| File | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore` | Project scaffold |
| `src/config.ts` | Tunable constants (TILE, player, weapon, enemy...) |
| `src/core/Vec2.ts` | 2D vector math |
| `src/core/loop.ts` | `fixedSteps()` + `GameLoop` |
| `src/core/Input.ts` | Keyboard input → move direction |
| `src/core/Camera.ts` | Follow player, world→screen transform |
| `src/world/TileMap.ts` | Grid, wall queries, collision source |
| `src/world/Level.ts` | Map parser + `LEVEL_1` data |
| `src/entities/Player.ts` | Player state + movement + collision |
| `src/render/Renderer.ts` | Draw map + player |
| `src/main.ts` | Wire everything, start the loop |
| `tests/*.test.ts` | Unit tests |

---

## Task 1: Project scaffold

*O'zbekcha: Vite+TS loyihani yaratamiz, bo'sh canvas ko'rinishini tekshiramiz.*

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `src/main.ts` (temporary)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "neon-recon",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: { environment: 'node' },
});
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
dist
.DS_Store
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>Neon Recon</title>
    <style>
      html, body { margin: 0; height: 100%; background: #05070B; overflow: hidden; }
      #game { display: block; width: 100vw; height: 100vh; touch-action: none; }
    </style>
  </head>
  <body>
    <canvas id="game"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create temporary `src/main.ts`** (replaced in Task 10)

```ts
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = '#0A0E14';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#3DDC97';
ctx.fillRect(canvas.width / 2 - 10, canvas.height / 2 - 10, 20, 20);
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Verify dev server**

Run: `npm run dev` (then open the printed URL, e.g. `http://localhost:5173`)
Expected: dark screen (`#0A0E14`) with a small green square in the center. Stop the server (Ctrl+C) after confirming.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + TypeScript + Vitest project"
```

---

## Task 2: Vec2 — vector math (TDD)

*O'zbekcha: 2D vektor matematikasi — qo'shish, normalize, burchak.*

**Files:**
- Create: `src/core/Vec2.ts`
- Test: `tests/vec2.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { add, sub, scale, length, normalize, angleOf, distance } from '../src/core/Vec2';

describe('Vec2', () => {
  it('adds', () => expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 }));
  it('subtracts', () => expect(sub({ x: 5, y: 5 }, { x: 1, y: 2 })).toEqual({ x: 4, y: 3 }));
  it('scales', () => expect(scale({ x: 2, y: 3 }, 2)).toEqual({ x: 4, y: 6 }));
  it('length', () => expect(length({ x: 3, y: 4 })).toBe(5));
  it('normalize -> unit length', () => expect(length(normalize({ x: 3, y: 4 }))).toBeCloseTo(1));
  it('normalize zero -> zero', () => expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 }));
  it('angleOf +x is 0', () => expect(angleOf({ x: 1, y: 0 })).toBeCloseTo(0));
  it('distance', () => expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/vec2.test.ts`
Expected: FAIL — cannot find module `../src/core/Vec2`.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface Vec2 {
  x: number;
  y: number;
}

export const vec = (x: number, y: number): Vec2 => ({ x, y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });
export const length = (a: Vec2): number => Math.hypot(a.x, a.y);
export const normalize = (a: Vec2): Vec2 => {
  const l = length(a);
  return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
};
export const angleOf = (a: Vec2): number => Math.atan2(a.y, a.x);
export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/vec2.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/Vec2.ts tests/vec2.test.ts
git commit -m "feat: Vec2 vector math with tests"
```

---

## Task 3: Config constants

*O'zbekcha: o'yin raqamlari bir joyda (TILE, player, weapon...).*

**Files:**
- Create: `src/config.ts`

- [ ] **Step 1: Create the file**

```ts
export const TILE = 32;

export const CONFIG = {
  player: { hp: 100, speed: 200, radius: 12 },
  cone: { angleDeg: 45, range: 7 * TILE },
  proximityRadius: 2.5 * TILE,
  weapon: {
    magazine: 30,
    reserve: 90,
    reloadSec: 1.3,
    fireRate: 8,
    bulletSpeed: 600,
    damage: 12,
    bulletRadius: 3,
  },
  enemy: { hp: 60, count: 5, speed: 120 },
  pickupRespawnSec: 15,
  scorePerKill: 100,
} as const;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: central config constants"
```

---

## Task 4: TileMap — grid + wall queries (TDD)

*O'zbekcha: panjara, devor tekshiruvi, dunyo→katak koordinata.*

**Files:**
- Create: `src/world/TileMap.ts`
- Test: `tests/tilemap.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { TileMap } from '../src/world/TileMap';

// 3 cols x 2 rows: walls in columns 0 and 2, floor in column 1
const map = new TileMap(3, 2, [1, 0, 1, 1, 0, 1]);

describe('TileMap', () => {
  it('reads wall/floor cells', () => {
    expect(map.isWall(0, 0)).toBe(true);
    expect(map.isWall(1, 0)).toBe(false);
  });
  it('treats out-of-bounds as wall', () => {
    expect(map.isWall(-1, 0)).toBe(true);
    expect(map.isWall(3, 0)).toBe(true);
    expect(map.isWall(0, 2)).toBe(true);
  });
  it('maps world coords to tiles (TILE=32)', () => {
    expect(map.isWallAtWorld(40, 10)).toBe(false); // col 1 floor
    expect(map.isWallAtWorld(10, 10)).toBe(true); // col 0 wall
  });
  it('reports pixel size', () => {
    expect(map.widthPx).toBe(96);
    expect(map.heightPx).toBe(64);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/tilemap.test.ts`
Expected: FAIL — cannot find module `../src/world/TileMap`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { TILE } from '../config';

export class TileMap {
  constructor(
    public readonly cols: number,
    public readonly rows: number,
    private readonly tiles: ReadonlyArray<number>,
  ) {}

  isWall(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return true;
    return this.tiles[row * this.cols + col] === 1;
  }

  isWallAtWorld(x: number, y: number): boolean {
    return this.isWall(Math.floor(x / TILE), Math.floor(y / TILE));
  }

  get widthPx(): number {
    return this.cols * TILE;
  }
  get heightPx(): number {
    return this.rows * TILE;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/tilemap.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/world/TileMap.ts tests/tilemap.test.ts
git commit -m "feat: TileMap grid and wall queries"
```

---

## Task 5: Level — map parser + LEVEL_1 (TDD)

*O'zbekcha: matnli mapni TileMap'ga aylantiruvchi parser + birinchi map.*

**Files:**
- Create: `src/world/Level.ts`
- Test: `tests/level.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { parseLevel } from '../src/world/Level';
import { TILE } from '../src/config';

describe('parseLevel', () => {
  const lvl = parseLevel(['###', '#P#', '###']);
  it('reads dimensions', () => {
    expect(lvl.map.cols).toBe(3);
    expect(lvl.map.rows).toBe(3);
  });
  it('marks # as wall and . / P as floor', () => {
    expect(lvl.map.isWall(0, 0)).toBe(true);
    expect(lvl.map.isWall(1, 1)).toBe(false);
  });
  it('places player spawn at P center', () => {
    expect(lvl.playerSpawn).toEqual({ x: TILE * 1.5, y: TILE * 1.5 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/level.test.ts`
Expected: FAIL — cannot find module `../src/world/Level`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { TileMap } from './TileMap';
import { TILE } from '../config';
import { Vec2 } from '../core/Vec2';

export interface LevelData {
  map: TileMap;
  playerSpawn: Vec2;
}

export function parseLevel(rows: string[]): LevelData {
  const cols = rows[0].length;
  const tiles: number[] = [];
  let playerSpawn: Vec2 = { x: TILE * 1.5, y: TILE * 1.5 };
  rows.forEach((line, r) => {
    for (let c = 0; c < cols; c++) {
      const ch = line[c] ?? '#';
      tiles.push(ch === '#' ? 1 : 0);
      if (ch === 'P') playerSpawn = { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
    }
  });
  return { map: new TileMap(cols, rows.length, tiles), playerSpawn };
}

export const LEVEL_1: string[] = [
  '####################',
  '#P.......#.........#',
  '#.####...#...####..#',
  '#.#......#......#..#',
  '#.#..###.....##.#..#',
  '#....#.........#...#',
  '####.#.#######.#.###',
  '#......#.....#.....#',
  '#.####.#.###.#.###.#',
  '#.#..........#....##',
  '#.#.######.###.##..#',
  '#......#.....#.....#',
  '#.####.#.###.#.###.#',
  '#..................#',
  '####################',
];

export function loadLevel1(): LevelData {
  return parseLevel(LEVEL_1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/level.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/world/Level.ts tests/level.test.ts
git commit -m "feat: level parser and LEVEL_1"
```

---

## Task 6: Game loop — fixedSteps + GameLoop (TDD)

*O'zbekcha: fixed-timestep loop. Sof `fixedSteps` funksiyasini test qilamiz.*

**Files:**
- Create: `src/core/loop.ts`
- Test: `tests/loop.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { fixedSteps } from '../src/core/loop';

describe('fixedSteps', () => {
  it('produces one step when a frame equals the step', () => {
    const r = fixedSteps(0, 0.016, 0.016, 5);
    expect(r.steps).toBe(1);
    expect(r.remainder).toBeCloseTo(0);
  });
  it('carries the remainder', () => {
    const r = fixedSteps(0, 0.02, 0.016, 5);
    expect(r.steps).toBe(1);
    expect(r.remainder).toBeCloseTo(0.004);
  });
  it('caps at maxSteps to avoid spiral of death', () => {
    const r = fixedSteps(0, 1.0, 0.016, 5);
    expect(r.steps).toBe(5);
  });
  it('produces zero steps for a tiny frame', () => {
    const r = fixedSteps(0, 0.005, 0.016, 5);
    expect(r.steps).toBe(0);
    expect(r.remainder).toBeCloseTo(0.005);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/loop.test.ts`
Expected: FAIL — cannot find module `../src/core/loop`.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface StepResult {
  steps: number;
  remainder: number;
}

export function fixedSteps(acc: number, frameDt: number, step: number, maxSteps: number): StepResult {
  let total = acc + frameDt;
  let steps = 0;
  while (total >= step && steps < maxSteps) {
    total -= step;
    steps++;
  }
  return { steps, remainder: total };
}

export class GameLoop {
  private acc = 0;
  private last = 0;
  private running = false;
  private readonly maxSteps = 5;

  constructor(
    private readonly step: number,
    private readonly update: (dt: number) => void,
    private readonly render: () => void,
  ) {}

  start(now: number = performance.now()): void {
    this.running = true;
    this.last = now;
    requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    const frameDt = (now - this.last) / 1000;
    this.last = now;
    const { steps, remainder } = fixedSteps(this.acc, frameDt, this.step, this.maxSteps);
    for (let i = 0; i < steps; i++) this.update(this.step);
    this.acc = remainder;
    this.render();
    requestAnimationFrame(this.frame);
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/loop.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/loop.ts tests/loop.test.ts
git commit -m "feat: fixed-timestep game loop"
```

---

## Task 7: Input — keyboard to direction (TDD)

*O'zbekcha: WASD/strelka → harakat yo'nalishi (normalize qilingan).*

**Files:**
- Create: `src/core/Input.ts`
- Test: `tests/input.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { dirFromKeys } from '../src/core/Input';

describe('dirFromKeys', () => {
  it('d -> +x', () => expect(dirFromKeys(new Set(['d']))).toEqual({ x: 1, y: 0 }));
  it('w -> -y (up)', () => expect(dirFromKeys(new Set(['w']))).toEqual({ x: 0, y: -1 }));
  it('arrowright -> +x', () => expect(dirFromKeys(new Set(['arrowright']))).toEqual({ x: 1, y: 0 }));
  it('diagonal is normalized', () => {
    const d = dirFromKeys(new Set(['d', 's']));
    expect(Math.hypot(d.x, d.y)).toBeCloseTo(1);
  });
  it('opposite keys cancel', () => expect(dirFromKeys(new Set(['a', 'd']))).toEqual({ x: 0, y: 0 }));
  it('no keys -> zero', () => expect(dirFromKeys(new Set())).toEqual({ x: 0, y: 0 }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/input.test.ts`
Expected: FAIL — cannot find module `../src/core/Input`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { Vec2, normalize } from './Vec2';

export function dirFromKeys(keys: ReadonlySet<string>): Vec2 {
  let x = 0;
  let y = 0;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  return normalize({ x, y });
}

export class Input {
  private keys = new Set<string>();

  constructor(target: Window = window) {
    target.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    target.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  moveDir(): Vec2 {
    return dirFromKeys(this.keys);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/input.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/Input.ts tests/input.test.ts
git commit -m "feat: keyboard input to movement direction"
```

---

## Task 8: Player — movement + wall collision (TDD)

*O'zbekcha: personaj harakati va devorga urilish (axis-separated collision).*

**Files:**
- Create: `src/entities/Player.ts`
- Test: `tests/player.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { Player, collidesCircle } from '../src/entities/Player';
import { TileMap } from '../src/world/TileMap';
import { CONFIG } from '../src/config';

// 3 cols x 1 row: floor, WALL (col1: x 32..64), floor
const wallMid = new TileMap(3, 1, [0, 1, 0]);

describe('collidesCircle', () => {
  it('detects a wall tile', () => expect(collidesCircle(48, 16, 10, wallMid)).toBe(true));
  it('is clear in open floor', () => expect(collidesCircle(16, 16, 6, wallMid)).toBe(false));
});

describe('Player movement', () => {
  it('moves right in open space', () => {
    const open = new TileMap(5, 1, [0, 0, 0, 0, 0]);
    const p = new Player({ x: 16, y: 16 });
    p.update(0.1, { x: 1, y: 0 }, open);
    expect(p.pos.x).toBeCloseTo(16 + CONFIG.player.speed * 0.1);
  });
  it('is blocked by a wall ahead', () => {
    const p = new Player({ x: 18, y: 16 }); // col0 floor; wall starts at x=32
    p.update(0.05, { x: 1, y: 0 }, wallMid);
    expect(p.pos.x).toBe(18); // target overlaps wall -> rejected
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/player.test.ts`
Expected: FAIL — cannot find module `../src/entities/Player`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { Vec2, normalize, scale, length, angleOf } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { CONFIG } from '../config';

export function collidesCircle(x: number, y: number, r: number, map: TileMap): boolean {
  return (
    map.isWallAtWorld(x - r, y - r) ||
    map.isWallAtWorld(x + r, y - r) ||
    map.isWallAtWorld(x - r, y + r) ||
    map.isWallAtWorld(x + r, y + r)
  );
}

export class Player {
  pos: Vec2;
  hp: number;
  aim: number; // radians
  readonly radius = CONFIG.player.radius;

  constructor(spawn: Vec2) {
    this.pos = { x: spawn.x, y: spawn.y };
    this.hp = CONFIG.player.hp;
    this.aim = -Math.PI / 2;
  }

  update(dt: number, dir: Vec2, map: TileMap): void {
    const move = scale(normalize(dir), CONFIG.player.speed * dt);
    this.moveAxis(move, map);
    if (length(dir) > 0) this.aim = angleOf(dir); // auto-face (mouse aim added in M3)
  }

  private moveAxis(v: Vec2, map: TileMap): void {
    const r = this.radius;
    if (!collidesCircle(this.pos.x + v.x, this.pos.y, r, map)) this.pos.x += v.x;
    if (!collidesCircle(this.pos.x, this.pos.y + v.y, r, map)) this.pos.y += v.y;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/player.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/entities/Player.ts tests/player.test.ts
git commit -m "feat: player movement with wall collision"
```

---

## Task 9: Camera — follow + world→screen (TDD)

*O'zbekcha: kamera o'yinchini markazda tutadi, dunyo→ekran koordinata.*

**Files:**
- Create: `src/core/Camera.ts`
- Test: `tests/camera.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { Camera } from '../src/core/Camera';

describe('Camera', () => {
  it('centers on the target', () => {
    const cam = new Camera(800, 600);
    cam.follow({ x: 1000, y: 1000 });
    expect(cam.pos).toEqual({ x: 600, y: 700 });
  });
  it('converts world to screen', () => {
    const cam = new Camera(800, 600);
    cam.follow({ x: 1000, y: 1000 });
    expect(cam.worldToScreen({ x: 1000, y: 1000 })).toEqual({ x: 400, y: 300 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/camera.test.ts`
Expected: FAIL — cannot find module `../src/core/Camera`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { Vec2 } from './Vec2';

export class Camera {
  pos: Vec2 = { x: 0, y: 0 };

  constructor(public viewW: number, public viewH: number) {}

  follow(target: Vec2): void {
    this.pos = { x: target.x - this.viewW / 2, y: target.y - this.viewH / 2 };
  }

  worldToScreen(p: Vec2): Vec2 {
    return { x: p.x - this.pos.x, y: p.y - this.pos.y };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/camera.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/Camera.ts tests/camera.test.ts
git commit -m "feat: follow camera with world-to-screen transform"
```

---

## Task 10: Renderer + wiring — playable map (visual)

*O'zbekcha: map va personajni chizamiz, hammasini main.ts'da ulаymiz, brauzerda yurib ko'ramiz.*

**Files:**
- Create: `src/render/Renderer.ts`
- Modify (replace fully): `src/main.ts`

- [ ] **Step 1: Create `src/render/Renderer.ts`**

```ts
import { TileMap } from '../world/TileMap';
import { Camera } from '../core/Camera';
import { Player } from '../entities/Player';
import { TILE } from '../config';

const COLORS = {
  bg: '#0A0E14',
  wall: '#161C26',
  wallEdge: '#223040',
  player: '#3DDC97',
  playerCore: '#EAFFF6',
};

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(map: TileMap, player: Player, cam: Camera): void {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, w, h);

    const c0 = Math.max(0, Math.floor(cam.pos.x / TILE));
    const r0 = Math.max(0, Math.floor(cam.pos.y / TILE));
    const c1 = Math.min(map.cols, Math.ceil((cam.pos.x + w) / TILE));
    const r1 = Math.min(map.rows, Math.ceil((cam.pos.y + h) / TILE));

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        if (!map.isWall(c, r)) continue;
        const s = cam.worldToScreen({ x: c * TILE, y: r * TILE });
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(s.x, s.y, TILE, TILE);
        ctx.strokeStyle = COLORS.wallEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x + 0.5, s.y + 0.5, TILE - 1, TILE - 1);
      }
    }

    const p = cam.worldToScreen(player.pos);
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(p.x, p.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.playerCore;
    ctx.beginPath();
    ctx.arc(
      p.x + Math.cos(player.aim) * player.radius,
      p.y + Math.sin(player.aim) * player.radius,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
```

- [ ] **Step 2: Replace `src/main.ts` fully**

```ts
import { loadLevel1 } from './world/Level';
import { Player } from './entities/Player';
import { Camera } from './core/Camera';
import { Input } from './core/Input';
import { Renderer } from './render/Renderer';
import { GameLoop } from './core/loop';

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

const loop = new GameLoop(
  1 / 60,
  (dt) => {
    player.update(dt, input.moveDir(), level.map);
  },
  () => {
    camera.viewW = canvas.width;
    camera.viewH = canvas.height;
    camera.follow(player.pos);
    renderer.draw(level.map, player, camera);
  },
);
loop.start();
```

- [ ] **Step 3: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: ALL tests pass (vec2, tilemap, level, loop, input, player, camera).

- [ ] **Step 5: Visual verification**

Run: `npm run dev`, open the URL.
Expected: dark map with neon-edged walls; green player dot in the open area near the top-left (the `P` spawn). Press WASD/arrows — the player moves, is blocked by walls, and the camera keeps the player centered. Stop the server after confirming.

- [ ] **Step 6: Commit**

```bash
git add src/render/Renderer.ts src/main.ts
git commit -m "feat: render map + player, playable movement (M1 complete)"
```

---

## M1 acceptance checklist

- [ ] `npm test` green (7 test files).
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run dev` → walk the map with WASD/arrows, blocked by walls, camera follows.
- [ ] All work committed.

**Next milestone:** M2 — Vision (FOV raycasting) + fog of war. A separate plan will be written after M1 is verified.
