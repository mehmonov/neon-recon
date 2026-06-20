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
