import { Vec2, normalize, distance } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { CONFIG, TILE } from '../config';
import { lineOfSightClear } from '../world/Fov';
import { moveCircle } from './physics';

export type EnemyState = 'patrol' | 'attack' | 'search';

export interface Target {
  pos: Vec2;
}

export class Enemy {
  pos: Vec2;
  hp = CONFIG.enemy.hp;
  aim = 0;
  alive = true;
  state: EnemyState = 'patrol';
  readonly radius = CONFIG.enemy.radius;
  private patrolDir = 1;
  private fireCd = 0;
  private lastKnown: Vec2 | null = null;

  constructor(spawn: Vec2) {
    this.pos = { x: spawn.x, y: spawn.y };
  }

  canSee(target: Target, map: TileMap): boolean {
    return (
      distance(this.pos, target.pos) <= CONFIG.enemy.visionRange &&
      lineOfSightClear(this.pos, target.pos, map)
    );
  }

  update(dt: number, target: Target, map: TileMap, fire: (pos: Vec2, angle: number) => void): void {
    if (!this.alive) return;

    const sees = this.canSee(target, map);
    if (sees) {
      this.state = 'attack';
      this.lastKnown = { x: target.pos.x, y: target.pos.y };
    } else if (this.state === 'attack') {
      this.state = 'search';
    }

    if (this.state === 'attack') {
      this.aim = Math.atan2(target.pos.y - this.pos.y, target.pos.x - this.pos.x);
      if (distance(this.pos, target.pos) > CONFIG.enemy.preferredDist) this.moveToward(target.pos, dt, map);
      this.fireCd -= dt;
      if (this.fireCd <= 0) {
        fire({ x: this.pos.x, y: this.pos.y }, this.aim);
        this.fireCd = 1 / CONFIG.enemy.fireRate;
      }
    } else if (this.state === 'search') {
      if (this.lastKnown) {
        this.aim = Math.atan2(this.lastKnown.y - this.pos.y, this.lastKnown.x - this.pos.x);
        this.moveToward(this.lastKnown, dt, map);
        if (distance(this.pos, this.lastKnown) < TILE * 0.5) {
          this.lastKnown = null;
          this.state = 'patrol';
        }
      } else {
        this.state = 'patrol';
      }
    } else {
      this.aim = this.patrolDir > 0 ? 0 : Math.PI;
      const moved = this.moveToward({ x: this.pos.x + this.patrolDir * TILE, y: this.pos.y }, dt, map);
      if (!moved) this.patrolDir *= -1;
    }
  }

  private moveToward(target: Vec2, dt: number, map: TileMap): boolean {
    const dir = normalize({ x: target.x - this.pos.x, y: target.y - this.pos.y });
    const bx = this.pos.x;
    const by = this.pos.y;
    moveCircle(
      this.pos,
      { x: dir.x * CONFIG.enemy.speed * dt, y: dir.y * CONFIG.enemy.speed * dt },
      this.radius,
      map,
    );
    return Math.abs(this.pos.x - bx) > 0.001 || Math.abs(this.pos.y - by) > 0.001;
  }
}
