import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';
import { LevelData, buildEnemyPool } from '../world/Level';
import { nearestVisibleEnemy, circleHit } from '../systems/Combat';
import { angleDiff } from '../world/Fov';
import { Vec2, angleOf, sub, distance } from './Vec2';
import { CONFIG, TILE } from '../config';
import { Settings } from './Settings';

const DEG = Math.PI / 180;

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface InputState {
  moveDir(): Vec2;
  aim(cx: number, cy: number): number | null;
}

export class Game {
  state: GameState = 'menu';
  player!: Player;
  enemies!: Enemy[];
  bullets!: Bullet[];
  pickups!: Pickup[];
  score = 0;

  moveSpeed: number = CONFIG.player.speed;
  turnSpeed = 720 * DEG; // rad/s
  enemyCount: number = CONFIG.enemy.count;

  private readonly pool: Vec2[];

  constructor(readonly level: LevelData) {
    this.pool = buildEnemyPool(level);
    this.reset();
  }

  applySettings(s: Settings): void {
    this.moveSpeed = s.moveSpeed;
    this.turnSpeed = s.turnSpeed * DEG;
    this.enemyCount = s.enemyCount;
    if (this.player) this.player.speed = this.moveSpeed;
  }

  reset(): void {
    this.player = new Player(this.level.playerSpawn);
    this.player.speed = this.moveSpeed;
    const n = Math.min(this.enemyCount, this.pool.length);
    this.enemies = this.pool.slice(0, n).map((p) => new Enemy(p));
    this.bullets = [];
    this.pickups = this.level.pickupSpawns.map((p) => new Pickup(p.pos, p.kind));
    this.score = 0;
  }

  start(): void {
    this.reset();
    this.state = 'playing';
  }

  pause(): void {
    if (this.state === 'playing') this.state = 'paused';
  }

  resume(): void {
    if (this.state === 'paused') this.state = 'playing';
  }

  get enemiesAlive(): number {
    return this.enemies.filter((e) => e.alive).length;
  }

  update(dt: number, input: InputState, viewW: number, viewH: number): void {
    if (this.state !== 'playing') return;
    const map = this.level.map;
    const player = this.player;

    const dir = input.moveDir();
    player.update(dt, dir, map);

    let target = input.aim(viewW / 2, viewH / 2);
    if (target === null && (dir.x !== 0 || dir.y !== 0)) target = Math.atan2(dir.y, dir.x);
    if (target !== null) {
      const diff = angleDiff(player.aim, target);
      const step = this.turnSpeed * dt;
      player.aim = Math.abs(diff) <= step ? target : player.aim + Math.sign(diff) * step;
    }

    for (const e of this.enemies) {
      e.update(dt, player, map, (pos, angle) => this.spawnEnemyBullet(pos, angle));
    }

    const ti = nearestVisibleEnemy(player.pos, player.aim, this.enemies, map);
    if (ti >= 0 && player.weapon.canFire()) {
      const ang = angleOf(sub(this.enemies[ti].pos, player.pos));
      this.bullets.push(
        new Bullet(
          player.pos,
          ang,
          CONFIG.weapon.bulletSpeed,
          CONFIG.weapon.damage,
          'player',
          CONFIG.cone.range,
          CONFIG.weapon.bulletRadius,
        ),
      );
      player.weapon.fire();
    }

    for (const b of this.bullets) {
      b.update(dt, map);
      if (!b.alive) continue;
      if (b.team === 'player') {
        for (const e of this.enemies) {
          if (e.alive && circleHit(b.pos, e.pos, e.radius)) {
            e.hp -= b.damage;
            b.alive = false;
            if (e.hp <= 0) {
              e.alive = false;
              this.score += CONFIG.scorePerKill;
            }
            break;
          }
        }
      } else if (circleHit(b.pos, player.pos, player.radius)) {
        player.hp -= b.damage;
        b.alive = false;
      }
    }
    this.bullets = this.bullets.filter((b) => b.alive);

    for (const p of this.pickups) {
      p.update(dt);
      if (p.active && distance(p.pos, player.pos) <= p.radius + player.radius) {
        this.applyPickup(p);
        p.collect();
      }
    }

    if (player.hp <= 0) {
      player.hp = 0;
      this.state = 'gameover';
    } else if (this.enemiesAlive === 0) {
      this.state = 'victory';
    }
  }

  private applyPickup(p: Pickup): void {
    if (p.kind === 'health') {
      this.player.hp = Math.min(CONFIG.player.hp, this.player.hp + CONFIG.pickup.healthAmount);
    } else {
      this.player.weapon.reserve += CONFIG.pickup.ammoAmount;
    }
  }

  private spawnEnemyBullet(pos: Vec2, angle: number): void {
    this.bullets.push(
      new Bullet(
        pos,
        angle,
        CONFIG.enemy.bulletSpeed,
        CONFIG.enemy.damage,
        'enemy',
        CONFIG.enemy.visionRange + TILE,
        CONFIG.weapon.bulletRadius,
      ),
    );
  }
}
