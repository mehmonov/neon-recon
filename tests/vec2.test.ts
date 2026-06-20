import { describe, it, expect } from 'vitest';
import { add, sub, scale, length, normalize, angleOf, distance } from '../src/core/Vec2';

describe('Vec2', () => {
  it('adds', () => expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 }));
  it('subtracts', () => expect(sub({ x: 5, y: 5 }, { x: 1, y: 2 })).toEqual({ x: 4, y: 3 }));
  it('scales', () => expect(scale({ x: 2, y: 3 }, 2)).toEqual({ x: 4, y: 6 }));
  it('length', () => expect(length({ x: 3, y: 4 })).toBe(5));
  it('normalize -> unit length', () => expect(length(normalize({ x: 3, y: 4 }))).toBeCloseTo(1));
  it('normalize zero -> zero', () => expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 }));
  it('angleOf +x is 0', () => expect(angleOf({ x: 1, y: 0 })).toBeCloseTo(0));
  it('distance', () => expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5));
});
