import { Vec2 } from './Vec2';

export class Camera {
  pos: Vec2 = { x: 0, y: 0 };

  constructor(public viewW: number, public viewH: number) {}

  follow(target: Vec2): void {
    this.pos = { x: target.x - this.viewW / 2, y: target.y - this.viewH / 2 };
  }

  worldToScreen(p: Vec2): Vec2 {
    return { x: p.x - this.pos.x, y: p.y - this.pos.y };
  }
}
