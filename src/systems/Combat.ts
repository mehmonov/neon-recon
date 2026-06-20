import { Vec2, distance } from '../core/Vec2';
import { TileMap } from '../world/TileMap';
import { isVisible } from '../world/Fov';

export function circleHit(a: Vec2, b: Vec2, radius: number): boolean {
  return distance(a, b) <= radius;
}

export interface Targetable {
  pos: Vec2;
  alive: boolean;
}

export function nearestVisibleEnemy(
  from: Vec2,
  aim: number,
  enemies: ReadonlyArray<Targetable>,
  map: TileMap,
): number {
  let best = -1;
  let bestD = Infinity;
  enemies.forEach((e, i) => {
    if (!e.alive) return;
    if (!isVisible(from, aim, e.pos, map)) return;
    const d = distance(from, e.pos);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}
