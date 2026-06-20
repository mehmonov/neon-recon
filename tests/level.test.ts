import { describe, it, expect } from 'vitest';
import { parseLevel } from '../src/world/Level';
import { TILE } from '../src/config';

describe('parseLevel', () => {
  const lvl = parseLevel(['###', '#P#', '###']);
  it('reads dimensions', () => {
    expect(lvl.map.cols).toBe(3);
    expect(lvl.map.rows).toBe(3);
  });
  it('marks # as wall and . / P as floor', () => {
    expect(lvl.map.isWall(0, 0)).toBe(true);
    expect(lvl.map.isWall(1, 1)).toBe(false);
  });
  it('places player spawn at P center', () => {
    expect(lvl.playerSpawn).toEqual({ x: TILE * 1.5, y: TILE * 1.5 });
  });
});
