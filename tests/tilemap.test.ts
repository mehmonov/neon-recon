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
