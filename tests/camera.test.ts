import { describe, it, expect } from 'vitest';
import { Camera } from '../src/core/Camera';

describe('Camera', () => {
  it('centers on the target', () => {
    const cam = new Camera(800, 600);
    cam.follow({ x: 1000, y: 1000 });
    expect(cam.pos).toEqual({ x: 600, y: 700 });
  });
  it('converts world to screen', () => {
    const cam = new Camera(800, 600);
    cam.follow({ x: 1000, y: 1000 });
    expect(cam.worldToScreen({ x: 1000, y: 1000 })).toEqual({ x: 400, y: 300 });
  });
});
