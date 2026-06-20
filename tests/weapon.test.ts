import { describe, it, expect } from 'vitest';
import { Weapon } from '../src/entities/Weapon';
import { CONFIG } from '../src/config';

describe('Weapon', () => {
  it('starts with a full magazine', () => {
    const w = new Weapon();
    expect(w.magazine).toBe(CONFIG.weapon.magazine);
    expect(w.canFire()).toBe(true);
  });

  it('fires and goes on cooldown', () => {
    const w = new Weapon();
    expect(w.fire()).toBe(true);
    expect(w.magazine).toBe(CONFIG.weapon.magazine - 1);
    expect(w.canFire()).toBe(false);
    w.update(1 / CONFIG.weapon.fireRate + 0.001);
    expect(w.canFire()).toBe(true);
  });

  it('reloads after the magazine empties', () => {
    const w = new Weapon();
    for (let i = 0; i < CONFIG.weapon.magazine; i++) {
      w.fire();
      w.update(1 / CONFIG.weapon.fireRate + 0.001);
    }
    expect(w.magazine).toBe(0);
    expect(w.reloading).toBe(true);
    expect(w.canFire()).toBe(false);
    w.update(CONFIG.weapon.reloadSec + 0.01);
    expect(w.magazine).toBe(CONFIG.weapon.magazine);
    expect(w.reserve).toBe(CONFIG.weapon.reserve - CONFIG.weapon.magazine);
  });
});
