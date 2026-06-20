import { describe, it, expect } from 'vitest';
import { Game } from '../src/core/Game';
import { parseLevel } from '../src/world/Level';

const makeLevel = () => parseLevel(['#######', '#P...E#', '#######']);
const stubInput = { moveDir: () => ({ x: 0, y: 0 }), aim: () => null };

describe('Game', () => {
  it('starts in the menu with a fresh world', () => {
    const g = new Game(makeLevel());
    expect(g.state).toBe('menu');
    expect(g.enemies.length).toBe(1);
    expect(g.score).toBe(0);
  });

  it('start() enters playing', () => {
    const g = new Game(makeLevel());
    g.start();
    expect(g.state).toBe('playing');
  });

  it('pauses and resumes', () => {
    const g = new Game(makeLevel());
    g.start();
    g.pause();
    expect(g.state).toBe('paused');
    g.resume();
    expect(g.state).toBe('playing');
  });

  it('reaches victory when all enemies are cleared', () => {
    const g = new Game(makeLevel());
    g.start();
    g.enemies.forEach((e) => (e.alive = false));
    g.update(0.1, stubInput, 800, 600);
    expect(g.state).toBe('victory');
  });

  it('reaches game over when hp hits zero', () => {
    const g = new Game(makeLevel());
    g.start();
    g.player.hp = 0;
    g.update(0.1, stubInput, 800, 600);
    expect(g.state).toBe('gameover');
  });

  it('applySettings sets player speed and enemy count', () => {
    const g = new Game(parseLevel(['#########', '#P......#', '#.......#', '#.......#', '#########']));
    g.applySettings({ moveSpeed: 150, turnSpeed: 360, enemyCount: 3 });
    g.start();
    expect(g.player.speed).toBe(150);
    expect(g.enemies.length).toBe(3);
  });
});
