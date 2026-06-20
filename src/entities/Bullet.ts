import { Vec2 } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { TILE } from '../config';

export type Team = 'player' | 'enemy';

export class Bullet {
  pos: Vec2;
  private vel: Vec2;
  alive = true;
  private traveled = 0;

  constructor(
    pos: Vec2,
    angle: number,
    speed: number,
    public readonly damage: number,
    public readonly team: Team,
    private readonly maxDist: number,
    public readonly radius: number,
  ) {
    this.pos = { x: pos.x, y: pos.y };
    this.vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
  }

  update(dt: number, map: TileMap): void {
    const fullX = this.vel.x * dt;
    const fullY = this.vel.y * dt;
    const dist = Math.hypot(fullX, fullY);
    const steps = Math.max(1, Math.ceil(dist / (TILE / 2)));
    const sx = fullX / steps;
    const sy = fullY / steps;
    const stepLen = Math.hypot(sx, sy);
    for (let i = 0; i < steps; i++) {
      this.pos.x += sx;
      this.pos.y += sy;
      this.traveled += stepLen;
      if (this.traveled >= this.maxDist || map.isWallAtWorld(this.pos.x, this.pos.y)) {
        this.alive = false;
        return;
      }
    }
  }
}
