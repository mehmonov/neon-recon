import { describe, it, expect } from 'vitest';
import { Enemy } from '../src/entities/Enemy';
import { TileMap } from '../src/world/TileMap';

function openMap(): TileMap {
  return new TileMap(40, 40, new Array(1600).fill(0));
}

describe('Enemy AI', () => {
  it('starts in patrol', () => {
    expect(new Enemy({ x: 100, y: 100 }).state).toBe('patrol');
  });

  it('detects the player and fires when in sight', () => {
    const e = new Enemy({ x: 100, y: 100 });
    const shots: number[] = [];
    e.update(0.1, { pos: { x: 140, y: 100 } }, openMap(), () => shots.push(1));
    expect(e.state).toBe('attack');
    expect(shots.length).toBe(1);
  });

  it('switches to search after losing sight', () => {
    const e = new Enemy({ x: 100, y: 100 });
    const map = openMap();
    e.update(0.1, { pos: { x: 140, y: 100 } }, map, () => {});
    e.update(0.1, { pos: { x: 1200, y: 1200 } }, map, () => {});
    expect(e.state).toBe('search');
  });

  it('cannot see the player through a wall', () => {
    const tiles = new Array(1600).fill(0);
    for (let r = 0; r < 40; r++) tiles[r * 40 + 4] = 1; // wall column at col4 (x 128..160)
    const blocked = new TileMap(40, 40, tiles);
    const e = new Enemy({ x: 100, y: 100 });
    e.update(0.1, { pos: { x: 220, y: 100 } }, blocked, () => {});
    expect(e.state).toBe('patrol');
  });
});
