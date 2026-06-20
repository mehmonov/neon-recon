import { TileMap } from './TileMap';
import { TILE } from '../config';
import { Vec2 } from '../core/Vec2';

export interface LevelData {
  map: TileMap;
  playerSpawn: Vec2;
  enemySpawns: Vec2[];
}

export function parseLevel(rows: string[]): LevelData {
  const cols = rows[0].length;
  const tiles: number[] = [];
  let playerSpawn: Vec2 = { x: TILE * 1.5, y: TILE * 1.5 };
  const enemySpawns: Vec2[] = [];
  rows.forEach((line, r) => {
    for (let c = 0; c < cols; c++) {
      const ch = line[c] ?? '#';
      tiles.push(ch === '#' ? 1 : 0);
      const center = { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
      if (ch === 'P') playerSpawn = center;
      if (ch === 'E') enemySpawns.push(center);
    }
  });
  return { map: new TileMap(cols, rows.length, tiles), playerSpawn, enemySpawns };
}

export const LEVEL_1: string[] = [
  '####################',
  '#P.......#.....E...#',
  '#.####...#...####..#',
  '#.#......#......#..#',
  '#.#..###.....##.#..#',
  '#....#....E....#...#',
  '####.#.#######.#.###',
  '#......#.....#..E..#',
  '#.####.#.###.#.###.#',
  '#.#....E.....#....##',
  '#.#.######.###.##..#',
  '#......#.....#.....#',
  '#.####.#.###.#.###.#',
  '#........E.........#',
  '####################',
];

export function loadLevel1(): LevelData {
  return parseLevel(LEVEL_1);
}
