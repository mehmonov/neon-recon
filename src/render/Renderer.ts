import { TileMap } from '../world/TileMap';
import { Camera } from '../core/Camera';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
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
};

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  drawWorld(map: TileMap, cam: Camera): void {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, w, h);

    const c0 = Math.max(0, Math.floor(cam.pos.x / TILE));
    const r0 = Math.max(0, Math.floor(cam.pos.y / TILE));
    const c1 = Math.min(map.cols, Math.ceil((cam.pos.x + w) / TILE));
    const r1 = Math.min(map.rows, Math.ceil((cam.pos.y + h) / TILE));

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        if (!map.isWall(c, r)) continue;
        const s = cam.worldToScreen({ x: c * TILE, y: r * TILE });
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(s.x, s.y, TILE, TILE);
        ctx.strokeStyle = COLORS.wallEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x + 0.5, s.y + 0.5, TILE - 1, TILE - 1);
      }
    }
  }

  drawEnemies(enemies: ReadonlyArray<Enemy>, cam: Camera): void {
    const ctx = this.ctx;
    for (const e of enemies) {
      if (!e.alive) continue;
      const s = cam.worldToScreen(e.pos);
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
      ctx.fillStyle = b.team === 'player' ? COLORS.bulletPlayer : COLORS.bulletEnemy;
      ctx.beginPath();
      ctx.arc(s.x, s.y, b.radius + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlayer(player: Player, cam: Camera): void {
    const ctx = this.ctx;
    const p = cam.worldToScreen(player.pos);

    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(p.x, p.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.playerCore;
    ctx.beginPath();
    ctx.arc(
      p.x + Math.cos(player.aim) * player.radius,
      p.y + Math.sin(player.aim) * player.radius,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
