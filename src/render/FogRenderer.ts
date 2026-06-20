import { Vec2 } from '../core/Vec2';

export class FogRenderer {
  private fog: HTMLCanvasElement;
  private fctx: CanvasRenderingContext2D;

  constructor() {
    this.fog = document.createElement('canvas');
    this.fctx = this.fog.getContext('2d')!;
  }

  draw(ctx: CanvasRenderingContext2D, conePts: Vec2[], prox: Vec2, proxR: number): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (this.fog.width !== w || this.fog.height !== h) {
      this.fog.width = w;
      this.fog.height = h;
    }
    const f = this.fctx;
    f.clearRect(0, 0, w, h);
    f.fillStyle = 'rgba(5,7,11,0.93)';
    f.fillRect(0, 0, w, h);

    f.globalCompositeOperation = 'destination-out';
    this.tracePath(f, conePts);
    f.fill();
    f.beginPath();
    f.arc(prox.x, prox.y, proxR, 0, Math.PI * 2);
    f.fill();
    f.globalCompositeOperation = 'source-over';

    ctx.drawImage(this.fog, 0, 0);

    ctx.save();
    this.tracePath(ctx, conePts);
    ctx.clip();
    ctx.fillStyle = 'rgba(43,224,198,0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  private tracePath(c: CanvasRenderingContext2D, pts: Vec2[]): void {
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.closePath();
  }
}
