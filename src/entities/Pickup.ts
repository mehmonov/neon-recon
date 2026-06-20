import { Vec2 } from '../core/Vec2';
import { CONFIG } from '../config';

export type PickupKind = 'health' | 'ammo';

export class Pickup {
  pos: Vec2;
  active = true;
  readonly radius = 14;
  private respawnTimer = 0;

  constructor(pos: Vec2, public readonly kind: PickupKind) {
    this.pos = { x: pos.x, y: pos.y };
  }

  update(dt: number): void {
    if (!this.active) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.active = true;
    }
  }

  collect(): void {
    this.active = false;
    this.respawnTimer = CONFIG.pickupRespawnSec;
  }
}
