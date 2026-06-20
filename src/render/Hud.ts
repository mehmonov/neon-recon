import { Game } from '../core/Game';
import { Input } from '../core/Input';
import { Assets } from './assets';
import { CONFIG } from '../config';

interface StickView {
  ox: number;
  oy: number;
  x: number;
  y: number;
}

export class Hud {
  constructor(private assets: Assets) {}

  draw(ctx: CanvasRenderingContext2D, game: Game, input: Input): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const p = game.player;

    ctx.save();
    ctx.textBaseline = 'middle';

    const hpx = 28;
    const hpy = 22;
    const hpW = 168;
    ctx.fillStyle = '#FF5C7A';
    ctx.fillRect(hpx - 14, hpy + 5, 8, 4);
    ctx.fillRect(hpx - 12, hpy + 3, 4, 8);
    ctx.fillStyle = '#1A2230';
    ctx.fillRect(hpx, hpy, hpW, 14);
    ctx.fillStyle = '#3DDC97';
    ctx.fillRect(hpx, hpy, (hpW * Math.max(0, p.hp)) / CONFIG.player.hp, 14);

    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#EAF0F0';
    ctx.fillText(`Dushman ${game.enemiesAlive}`, w / 2, 29);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFC24B';
    ctx.fillText(`Ball ${game.score}`, w - 72, 29);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#EAF0F0';
    ctx.fillText(`${p.weapon.magazine} / ${p.weapon.reserve}`, w / 2, h - 30);
    if (p.weapon.reloading) {
      ctx.fillStyle = '#2BE0C6';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText('reload…', w / 2, h - 12);
    }

    this.stick(ctx, input.getMoveStick(), '#2BE0C6');
    this.stick(ctx, input.getAimStick(), '#FF6B78');

    ctx.restore();
  }

  private stick(ctx: CanvasRenderingContext2D, s: StickView | null, color: string): void {
    if (!s) return;
    const dx = s.x - s.ox;
    const dy = s.y - s.oy;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(42, d);
    const kx = s.ox + (dx / d) * k;
    const ky = s.oy + (dy / d) * k;

    const base = this.assets.joystickBase;
    const knob = this.assets.joystickKnob;
    if (base && knob) {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(base, s.ox - 46, s.oy - 46, 92, 92);
      ctx.drawImage(knob, kx - 24, ky - 24, 48, 48);
      ctx.globalAlpha = 1;
      return;
    }

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.ox, s.oy, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(kx, ky, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
