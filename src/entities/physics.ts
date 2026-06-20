import { Vec2 } from '../core/Vec2';
import { TileMap } from '../world/TileMap';

export function collidesCircle(x: number, y: number, r: number, map: TileMap): boolean {
  return (
    map.isWallAtWorld(x - r, y - r) ||
    map.isWallAtWorld(x + r, y - r) ||
    map.isWallAtWorld(x - r, y + r) ||
    map.isWallAtWorld(x + r, y + r)
  );
}

export function moveCircle(pos: Vec2, delta: Vec2, r: number, map: TileMap): void {
  if (!collidesCircle(pos.x + delta.x, pos.y, r, map)) pos.x += delta.x;
  if (!collidesCircle(pos.x, pos.y + delta.y, r, map)) pos.y += delta.y;
}
