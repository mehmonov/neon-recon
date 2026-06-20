import { describe, it, expect } from 'vitest';
import { Player } from '../src/entities/Player';
import { TileMap } from '../src/world/TileMap';
import { CONFIG } from '../src/config';

const wallMid = new TileMap(3, 1, [0, 1, 0]); // wall at col1 (x 32..64)

describe('Player movement', () => {
  it('moves right in open space', () => {
    const open = new TileMap(5, 1, [0, 0, 0, 0, 0]);
    const p = new Player({ x: 16, y: 16 });
    p.update(0.1, { x: 1, y: 0 }, open);
    expect(p.pos.x).toBeCloseTo(16 + CONFIG.player.speed * 0.1);
  });

  it('is blocked by a wall ahead', () => {
    const p = new Player({ x: 18, y: 16 });
    p.update(0.05, { x: 1, y: 0 }, wallMid);
    expect(p.pos.x).toBe(18);
  });
});
