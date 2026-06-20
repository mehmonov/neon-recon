import { describe, it, expect } from 'vitest';
import { dirFromKeys } from '../src/core/Input';

describe('dirFromKeys', () => {
  it('d -> +x', () => expect(dirFromKeys(new Set(['d']))).toEqual({ x: 1, y: 0 }));
  it('w -> -y (up)', () => expect(dirFromKeys(new Set(['w']))).toEqual({ x: 0, y: -1 }));
  it('arrowright -> +x', () => expect(dirFromKeys(new Set(['arrowright']))).toEqual({ x: 1, y: 0 }));
  it('diagonal is normalized', () => {
    const d = dirFromKeys(new Set(['d', 's']));
    expect(Math.hypot(d.x, d.y)).toBeCloseTo(1);
  });
  it('opposite keys cancel', () => expect(dirFromKeys(new Set(['a', 'd']))).toEqual({ x: 0, y: 0 }));
  it('no keys -> zero', () => expect(dirFromKeys(new Set())).toEqual({ x: 0, y: 0 }));
});
