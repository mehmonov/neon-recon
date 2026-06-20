import { describe, it, expect } from 'vitest';
import {
  angleDiff,
  withinCone,
  lineOfSightClear,
  castRay,
  castConeRays,
  isVisible,
} from '../src/world/Fov';
import { TileMap } from '../src/world/TileMap';

const HALF = (45 / 2) * (Math.PI / 180);

describe('angleDiff', () => {
  it('wraps to [-pi, pi]', () => {
    expect(angleDiff(0, 0.5)).toBeCloseTo(0.5);
    expect(Math.abs(angleDiff(0, Math.PI * 2))).toBeCloseTo(0);
    expect(angleDiff(0.1, -0.1)).toBeCloseTo(-0.2);
  });
});

describe('withinCone', () => {
  it('target straight ahead is inside', () => {
    expect(withinCone({ x: 0, y: 0 }, 0, { x: 10, y: 0 }, HALF)).toBe(true);
  });
  it('target behind is outside', () => {
    expect(withinCone({ x: 0, y: 0 }, 0, { x: -10, y: 0 }, HALF)).toBe(false);
  });
  it('target at 45deg is outside a 22.5deg half-angle', () => {
    expect(withinCone({ x: 0, y: 0 }, 0, { x: 10, y: 10 }, HALF)).toBe(false);
  });
});

describe('lineOfSightClear', () => {
  const row = new TileMap(5, 1, [0, 0, 1, 0, 0]); // wall at col2 (x 64..96)
  it('clear across an open span', () => {
    expect(lineOfSightClear({ x: 16, y: 16 }, { x: 48, y: 16 }, row)).toBe(true);
  });
  it('blocked by a wall between', () => {
    expect(lineOfSightClear({ x: 16, y: 16 }, { x: 144, y: 16 }, row)).toBe(false);
  });
});

describe('castRay', () => {
  it('reaches full range in the open', () => {
    const open = new TileMap(20, 1, new Array(20).fill(0));
    const end = castRay({ x: 16, y: 16 }, 0, 100, open);
    expect(Math.hypot(end.x - 16, end.y - 16)).toBeCloseTo(100, 0);
  });
  it('stops at a wall', () => {
    const row = new TileMap(5, 1, [0, 0, 1, 0, 0]);
    const end = castRay({ x: 16, y: 16 }, 0, 300, row);
    expect(end.x).toBeLessThanOrEqual(96);
    expect(end.x).toBeGreaterThanOrEqual(60);
  });
});

describe('castConeRays', () => {
  it('returns apex + (rayCount + 1) endpoints', () => {
    const open = new TileMap(20, 20, new Array(400).fill(0));
    const pts = castConeRays({ x: 100, y: 100 }, 0, 0.4, 80, 8, open);
    expect(pts.length).toBe(10);
    expect(pts[0]).toEqual({ x: 100, y: 100 });
  });
});

describe('isVisible', () => {
  const open = new TileMap(40, 40, new Array(1600).fill(0));
  it('sees a target inside the cone and range', () => {
    expect(isVisible({ x: 100, y: 100 }, 0, { x: 200, y: 100 }, open)).toBe(true);
  });
  it('does not see a target behind, beyond proximity', () => {
    expect(isVisible({ x: 300, y: 300 }, 0, { x: 200, y: 300 }, open)).toBe(false);
  });
  it('senses a very close target even behind (proximity)', () => {
    expect(isVisible({ x: 300, y: 300 }, 0, { x: 290, y: 300 }, open)).toBe(true);
  });
  it('does not see through a wall', () => {
    const tiles = new Array(1600).fill(0);
    for (let r = 0; r < 40; r++) tiles[r * 40 + 5] = 1; // wall column at col5 (x 160..192)
    const blocked = new TileMap(40, 40, tiles);
    expect(isVisible({ x: 100, y: 100 }, 0, { x: 250, y: 100 }, blocked)).toBe(false);
  });
});
