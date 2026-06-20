export const TILE = 32;

export const CONFIG = {
  player: { hp: 100, speed: 200, radius: 12 },
  cone: { angleDeg: 45, range: 7 * TILE },
  proximityRadius: 2.5 * TILE,
  weapon: {
    magazine: 30,
    reserve: 90,
    reloadSec: 1.3,
    fireRate: 8,
    bulletSpeed: 600,
    damage: 12,
    bulletRadius: 3,
  },
  enemy: {
    hp: 60,
    count: 5,
    speed: 120,
    visionRange: 5 * TILE,
    fireRate: 1.5,
    damage: 8,
    bulletSpeed: 420,
    radius: 12,
    preferredDist: 3 * TILE,
  },
  pickup: { healthAmount: 40, ammoAmount: 30 },
  pickupRespawnSec: 15,
  scorePerKill: 100,
} as const;
