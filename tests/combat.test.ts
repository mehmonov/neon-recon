import { describe, it, expect } from 'vitest';
import { circleHit, nearestVisibleEnemy } from '../src/systems/Combat';
import { TileMap } from '../src/world/TileMap';

const open = new TileMap(40, 40, new Array(1600).fill(0));

describe('circleHit', () => {
  it('true within radius', () => expect(circleHit({ x: 0, y: 0 }, { x: 3, y: 0 }, 5)).toBe(true));
  it('false outside radius', () => expect(circleHit({ x: 0, y: 0 }, { x: 9, y: 0 }, 5)).toBe(false));
});

describe('nearestVisibleEnemy', () => {
  it('picks the nearest alive, visible enemy', () => {
    const enemies = [
      { pos: { x: 300, y: 100 }, alive: true },
      { pos: { x: 160, y: 100 }, alive: true },
      { pos: { x: 130, y: 100 }, alive: false },
    ];
    expect(nearestVisibleEnemy({ x: 100, y: 100 }, 0, enemies, open)).toBe(1);
  });

  it('returns -1 when none are visible', () => {
    const enemies = [{ pos: { x: 100, y: 800 }, alive: true }];
    expect(nearestVisibleEnemy({ x: 100, y: 100 }, 0, enemies, open)).toBe(-1);
  });
});
