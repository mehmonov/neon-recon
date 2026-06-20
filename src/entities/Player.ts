import { Vec2, normalize, scale, length, angleOf } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { CONFIG } from '../config';
import { moveCircle } from './physics';
import { Weapon } from './Weapon';

export class Player {
  pos: Vec2;
  hp: number;
  aim: number; // radians
  readonly radius = CONFIG.player.radius;
  readonly weapon = new Weapon();

  constructor(spawn: Vec2) {
    this.pos = { x: spawn.x, y: spawn.y };
    this.hp = CONFIG.player.hp;
    this.aim = -Math.PI / 2;
  }

  update(dt: number, dir: Vec2, map: TileMap): void {
    moveCircle(this.pos, scale(normalize(dir), CONFIG.player.speed * dt), this.radius, map);
    if (length(dir) > 0) this.aim = angleOf(dir);
    this.weapon.update(dt);
  }
}
