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
