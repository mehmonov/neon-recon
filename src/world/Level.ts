import { TileMap } from './TileMap';
import { TILE } from '../config';
import { Vec2 } from '../core/Vec2';
import { PickupKind } from '../entities/Pickup';

export interface PickupSpawn {
  pos: Vec2;
  kind: PickupKind;
}

export interface LevelData {
  map: TileMap;
  playerSpawn: Vec2;
  enemySpawns: Vec2[];
  pickupSpawns: PickupSpawn[];
}

export function parseLevel(rows: string[]): LevelData {
  const cols = rows[0].length;
  const tiles: number[] = [];
  let playerSpawn: Vec2 = { x: TILE * 1.5, y: TILE * 1.5 };
  const enemySpawns: Vec2[] = [];
  const pickupSpawns: PickupSpawn[] = [];
  rows.forEach((line, r) => {
    for (let c = 0; c < cols; c++) {
      const ch = line[c] ?? '#';
      tiles.push(ch === '#' ? 1 : 0);
      const pos = { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
      if (ch === 'P') playerSpawn = pos;
      else if (ch === 'E') enemySpawns.push(pos);
      else if (ch === 'H') pickupSpawns.push({ pos, kind: 'health' });
      else if (ch === 'A') pickupSpawns.push({ pos, kind: 'ammo' });
    }
  });
  return { map: new TileMap(cols, rows.length, tiles), playerSpawn, enemySpawns, pickupSpawns };
}

// Ordered list of candidate enemy positions: hand-placed E markers first, then every
// open floor tile at least 4 tiles from the player. Game slices the first N for the
// chosen enemy count, so counts beyond the markers still get sensible spots.
export function buildEnemyPool(level: LevelData): Vec2[] {
  const { map, playerSpawn } = level;
  const pc = Math.floor(playerSpawn.x / TILE);
  const pr = Math.floor(playerSpawn.y / TILE);
  const pool: Vec2[] = level.enemySpawns.map((s) => ({ x: s.x, y: s.y }));
  const used = new Set(level.enemySpawns.map((s) => `${Math.floor(s.x / TILE)},${Math.floor(s.y / TILE)}`));
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      if (map.isWall(c, r)) continue;
      const key = `${c},${r}`;
      if (used.has(key)) continue;
      if (Math.abs(c - pc) + Math.abs(r - pr) < 4) continue;
      pool.push({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 });
      used.add(key);
    }
  }
  return pool;
}

export const LEVEL_1: string[] = [
  '####################',
  '#P.......#.....E...#',
  '#.####...#...####..#',
  '#.#......#..H...#..#',
  '#.#..###.....##.#..#',
  '#....#....E....#...#',
  '####.#.#######.#.###',
  '#......#.....#..E..#',
  '#.####.#.###.#.###.#',
  '#.#....E.....#.H..##',
  '#.#.######.###.##..#',
  '#..A...#.....#.....#',
  '#.####.#.###.#.###.#',
  '#........E....A....#',
  '####################',
];

export function loadLevel1(): LevelData {
  return parseLevel(LEVEL_1);
}
