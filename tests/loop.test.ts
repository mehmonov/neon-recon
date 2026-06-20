import { describe, it, expect } from 'vitest';
import { fixedSteps } from '../src/core/loop';

describe('fixedSteps', () => {
  it('produces one step when a frame equals the step', () => {
    const r = fixedSteps(0, 0.016, 0.016, 5);
    expect(r.steps).toBe(1);
    expect(r.remainder).toBeCloseTo(0);
  });
  it('carries the remainder', () => {
    const r = fixedSteps(0, 0.02, 0.016, 5);
    expect(r.steps).toBe(1);
    expect(r.remainder).toBeCloseTo(0.004);
  });
  it('caps at maxSteps to avoid spiral of death', () => {
    const r = fixedSteps(0, 1.0, 0.016, 5);
    expect(r.steps).toBe(5);
  });
  it('produces zero steps for a tiny frame', () => {
    const r = fixedSteps(0, 0.005, 0.016, 5);
    expect(r.steps).toBe(0);
    expect(r.remainder).toBeCloseTo(0.005);
  });
});
