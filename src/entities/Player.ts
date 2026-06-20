import { Vec2, normalize, scale } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { CONFIG } from '../config';
import { moveCircle } from './physics';
import { Weapon } from './Weapon';

export class Player {
  pos: Vec2;
  hp: number;
  aim: number; // radians (rotated toward the target by Game at turnSpeed)
  speed: number = CONFIG.player.speed;
  readonly radius = CONFIG.player.radius;
  readonly weapon = new Weapon();

  constructor(spawn: Vec2) {
    this.pos = { x: spawn.x, y: spawn.y };
    this.hp = CONFIG.player.hp;
    this.aim = -Math.PI / 2;
  }

  update(dt: number, dir: Vec2, map: TileMap): void {
    moveCircle(this.pos, scale(normalize(dir), this.speed * dt), this.radius, map);
    this.weapon.update(dt);
  }
}
