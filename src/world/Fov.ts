import { Vec2, distance } from '../core/Vec2';
import { TileMap } from './TileMap';
import { TILE, CONFIG } from '../config';

export const HALF_ANGLE = (CONFIG.cone.angleDeg / 2) * (Math.PI / 180);

export function angleDiff(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function withinCone(from: Vec2, aim: number, target: Vec2, halfAngle: number): boolean {
  const a = Math.atan2(target.y - from.y, target.x - from.x);
  return Math.abs(angleDiff(aim, a)) <= halfAngle;
}

export function lineOfSightClear(from: Vec2, to: Vec2, map: TileMap): boolean {
  const dist = distance(from, to);
  const steps = Math.ceil(dist / (TILE / 4));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (map.isWallAtWorld(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)) return false;
  }
  return true;
}

export function castRay(from: Vec2, angle: number, range: number, map: TileMap): Vec2 {
  const step = TILE / 8;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let d = step;
  while (d < range) {
    const x = from.x + dx * d;
    const y = from.y + dy * d;
    if (map.isWallAtWorld(x, y)) return { x, y };
    d += step;
  }
  return { x: from.x + dx * range, y: from.y + dy * range };
}

export function castConeRays(
  from: Vec2,
  aim: number,
  halfAngle: number,
  range: number,
  rayCount: number,
  map: TileMap,
): Vec2[] {
  const pts: Vec2[] = [{ x: from.x, y: from.y }];
  for (let i = 0; i <= rayCount; i++) {
    const a = aim - halfAngle + 2 * halfAngle * (i / rayCount);
    pts.push(castRay(from, a, range, map));
  }
  return pts;
}

export function isVisible(from: Vec2, aim: number, target: Vec2, map: TileMap): boolean {
  const dist = distance(from, target);
  if (dist <= CONFIG.proximityRadius) return true; // close sense, through walls
  if (dist <= CONFIG.cone.range && withinCone(from, aim, target, HALF_ANGLE)) {
    return lineOfSightClear(from, target, map);
  }
  return false;
}
