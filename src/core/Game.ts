import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';
import { LevelData } from '../world/Level';
import { nearestVisibleEnemy, circleHit } from '../systems/Combat';
import { Vec2, angleOf, sub, distance } from './Vec2';
import { CONFIG, TILE } from '../config';

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

  constructor(readonly level: LevelData) {
    this.reset();
  }

  reset(): void {
    this.player = new Player(this.level.playerSpawn);
    this.enemies = this.level.enemySpawns.map((s) => new Enemy(s));
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

    player.update(dt, input.moveDir(), map);
    const aim = input.aim(viewW / 2, viewH / 2);
    if (aim !== null) player.aim = aim;

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
