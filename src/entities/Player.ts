import { Vec2, normalize, scale, length, angleOf } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { CONFIG } from '../config';

export function collidesCircle(x: number, y: number, r: number, map: TileMap): boolean {
  return (
    map.isWallAtWorld(x - r, y - r) ||
    map.isWallAtWorld(x + r, y - r) ||
    map.isWallAtWorld(x - r, y + r) ||
    map.isWallAtWorld(x + r, y + r)
  );
}

export class Player {
  pos: Vec2;
  hp: number;
  aim: number; // radians
  readonly radius = CONFIG.player.radius;

  constructor(spawn: Vec2) {
    this.pos = { x: spawn.x, y: spawn.y };
    this.hp = CONFIG.player.hp;
    this.aim = -Math.PI / 2;
  }

  update(dt: number, dir: Vec2, map: TileMap): void {
    const move = scale(normalize(dir), CONFIG.player.speed * dt);
    this.moveAxis(move, map);
    if (length(dir) > 0) this.aim = angleOf(dir); // auto-face (mouse aim added in M3)
  }

  private moveAxis(v: Vec2, map: TileMap): void {
    const r = this.radius;
    if (!collidesCircle(this.pos.x + v.x, this.pos.y, r, map)) this.pos.x += v.x;
    if (!collidesCircle(this.pos.x, this.pos.y + v.y, r, map)) this.pos.y += v.y;
  }
}
