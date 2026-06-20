import { describe, it, expect } from 'vitest';
import { Bullet } from '../src/entities/Bullet';
import { TileMap } from '../src/world/TileMap';

const open = new TileMap(40, 1, new Array(40).fill(0)); // x 0..1280 floor

describe('Bullet', () => {
  it('travels in its aimed direction', () => {
    const b = new Bullet({ x: 100, y: 16 }, 0, 200, 10, 'player', 1000, 3);
    b.update(0.1, open);
    expect(b.pos.x).toBeCloseTo(120);
    expect(b.alive).toBe(true);
  });

  it('dies when it crosses a wall (no tunnelling)', () => {
    const row = new TileMap(5, 1, [0, 0, 1, 0, 0]); // wall at col2 (x 64..96)
    const b = new Bullet({ x: 16, y: 16 }, 0, 600, 10, 'player', 1000, 3);
    b.update(0.2, row); // would jump 120px past the wall in one frame
    expect(b.alive).toBe(false);
  });

  it('dies after exceeding its max distance', () => {
    const b = new Bullet({ x: 0, y: 16 }, 0, 100, 10, 'player', 50, 3);
    b.update(1, open);
    expect(b.alive).toBe(false);
  });
});
