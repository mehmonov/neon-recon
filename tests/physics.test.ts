import { describe, it, expect } from 'vitest';
import { collidesCircle, moveCircle } from '../src/entities/physics';
import { TileMap } from '../src/world/TileMap';

const wallMid = new TileMap(3, 1, [0, 1, 0]); // wall at col1 (x 32..64)

describe('collidesCircle', () => {
  it('detects a wall tile', () => expect(collidesCircle(48, 16, 10, wallMid)).toBe(true));
  it('is clear in open floor', () => expect(collidesCircle(16, 16, 6, wallMid)).toBe(false));
});

describe('moveCircle', () => {
  it('moves freely in open space', () => {
    const open = new TileMap(5, 1, [0, 0, 0, 0, 0]);
    const p = { x: 16, y: 16 };
    moveCircle(p, { x: 10, y: 0 }, 6, open);
    expect(p.x).toBe(26);
  });
  it('does not move on a blocked axis', () => {
    const p = { x: 18, y: 16 };
    moveCircle(p, { x: 20, y: 0 }, 12, wallMid);
    expect(p.x).toBe(18);
  });
});
