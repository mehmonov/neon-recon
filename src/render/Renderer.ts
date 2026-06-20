import { TileMap } from '../world/TileMap';
import { Camera } from '../core/Camera';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';
import { Vec2 } from '../core/Vec2';
import { Assets } from './assets';
import { TILE } from '../config';

const COLORS = {
  bg: '#0A0E14',
  wall: '#161C26',
  wallEdge: '#223040',
  player: '#3DDC97',
  playerCore: '#EAFFF6',
  enemy: '#FF4D5E',
  enemyCore: '#FFE0E4',
  bulletPlayer: '#7FFFE0',
  bulletEnemy: '#FF8A93',
  pickupBox: '#15202A',
  pickupHealth: '#FF5C7A',
  pickupAmmo: '#FFB23D',
};

export class Renderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private assets: Assets,
  ) {}

  drawWorld(map: TileMap, cam: Camera): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const c0 = Math.max(0, Math.floor(cam.pos.x / TILE));
    const r0 = Math.max(0, Math.floor(cam.pos.y / TILE));
    const c1 = Math.min(map.cols, Math.ceil((cam.pos.x + ctx.canvas.width) / TILE));
    const r1 = Math.min(map.rows, Math.ceil((cam.pos.y + ctx.canvas.height) / TILE));

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        const s = cam.worldToScreen({ x: c * TILE, y: r * TILE });
        if (map.isWall(c, r)) {
          if (this.assets.wall) {
            ctx.drawImage(this.assets.wall, s.x, s.y, TILE, TILE);
          } else {
            ctx.fillStyle = COLORS.wall;
            ctx.fillRect(s.x, s.y, TILE, TILE);
            ctx.strokeStyle = COLORS.wallEdge;
            ctx.lineWidth = 1;
            ctx.strokeRect(s.x + 0.5, s.y + 0.5, TILE - 1, TILE - 1);
          }
        } else if (this.assets.floor) {
          ctx.drawImage(this.assets.floor, s.x, s.y, TILE, TILE);
        }
      }
    }
  }

  drawPickups(pickups: ReadonlyArray<Pickup>, cam: Camera): void {
    const ctx = this.ctx;
    for (const p of pickups) {
      if (!p.active) continue;
      const s = cam.worldToScreen(p.pos);
      const img = p.kind === 'health' ? this.assets.pickupHealth : this.assets.pickupAmmo;
      if (img) {
        ctx.drawImage(img, s.x - 14, s.y - 14, 28, 28);
        continue;
      }
      const col = p.kind === 'health' ? COLORS.pickupHealth : COLORS.pickupAmmo;
      ctx.fillStyle = COLORS.pickupBox;
      ctx.fillRect(s.x - 9, s.y - 9, 18, 18);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x - 9, s.y - 9, 18, 18);
      ctx.fillStyle = col;
      if (p.kind === 'health') {
        ctx.fillRect(s.x - 1.5, s.y - 6, 3, 12);
        ctx.fillRect(s.x - 6, s.y - 1.5, 12, 3);
      } else {
        ctx.fillRect(s.x - 1.5, s.y - 5, 3, 10);
      }
    }
  }

  drawEnemies(enemies: ReadonlyArray<Enemy>, cam: Camera): void {
    const ctx = this.ctx;
    for (const e of enemies) {
      if (!e.alive) continue;
      const s = cam.worldToScreen(e.pos);
      if (this.assets.enemy) {
        this.sprite(this.assets.enemy, s, e.aim + Math.PI / 2, 36);
        continue;
      }
      ctx.fillStyle = COLORS.enemy;
      ctx.beginPath();
      ctx.arc(s.x, s.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.enemyCore;
      ctx.beginPath();
      ctx.arc(s.x + Math.cos(e.aim) * e.radius, s.y + Math.sin(e.aim) * e.radius, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBullets(bullets: ReadonlyArray<Bullet>, cam: Camera): void {
    const ctx = this.ctx;
    for (const b of bullets) {
      const s = cam.worldToScreen(b.pos);
      const img = b.team === 'player' ? this.assets.bulletPlayer : this.assets.bulletEnemy;
      if (img) {
        ctx.drawImage(img, s.x - 9, s.y - 9, 18, 18);
        continue;
      }
      ctx.fillStyle = b.team === 'player' ? COLORS.bulletPlayer : COLORS.bulletEnemy;
      ctx.beginPath();
      ctx.arc(s.x, s.y, b.radius + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlayer(player: Player, cam: Camera): void {
    const ctx = this.ctx;
    const s = cam.worldToScreen(player.pos);

    if (player.weapon.flash > 0 && this.assets.muzzle) {
      const tip = { x: s.x + Math.cos(player.aim) * 20, y: s.y + Math.sin(player.aim) * 20 };
      this.sprite(this.assets.muzzle, tip, player.aim, 30);
    }

    if (this.assets.player) {
      this.sprite(this.assets.player, s, player.aim + Math.PI / 2, 38);
      return;
    }

    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(s.x, s.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.playerCore;
    ctx.beginPath();
    ctx.arc(
      s.x + Math.cos(player.aim) * player.radius,
      s.y + Math.sin(player.aim) * player.radius,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  private sprite(img: HTMLImageElement, s: Vec2, rot: number, size: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(rot);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}
