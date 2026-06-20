import { describe, it, expect } from 'vitest';
import { Pickup } from '../src/entities/Pickup';
import { CONFIG } from '../src/config';

describe('Pickup', () => {
  it('starts active', () => {
    expect(new Pickup({ x: 0, y: 0 }, 'health').active).toBe(true);
  });

  it('deactivates when collected', () => {
    const p = new Pickup({ x: 0, y: 0 }, 'ammo');
    p.collect();
    expect(p.active).toBe(false);
  });

  it('reactivates after the respawn time', () => {
    const p = new Pickup({ x: 0, y: 0 }, 'health');
    p.collect();
    p.update(CONFIG.pickupRespawnSec + 0.1);
    expect(p.active).toBe(true);
  });

  it('stays inactive before the respawn time', () => {
    const p = new Pickup({ x: 0, y: 0 }, 'health');
    p.collect();
    p.update(1);
    expect(p.active).toBe(false);
  });
});
