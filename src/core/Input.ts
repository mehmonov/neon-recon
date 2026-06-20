import { Vec2, normalize } from './Vec2';

export function dirFromKeys(keys: ReadonlySet<string>): Vec2 {
  let x = 0;
  let y = 0;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  return normalize({ x, y });
}

export interface Stick {
  id: number;
  ox: number;
  oy: number;
  x: number;
  y: number;
}

const DEADZONE = 12;

export class Input {
  private keys = new Set<string>();
  private mouse: Vec2 | null = null;
  private moveStick: Stick | null = null;
  private aimStick: Stick | null = null;

  constructor(target: Window = window) {
    target.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    target.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    target.addEventListener('mousemove', (e) => {
      this.mouse = { x: e.clientX, y: e.clientY };
    });
    target.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    target.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    target.addEventListener('touchend', (e) => this.onTouchEnd(e));
    target.addEventListener('touchcancel', (e) => this.onTouchEnd(e));
  }

  private onTouchStart(e: TouchEvent): void {
    const half = window.innerWidth / 2;
    for (const t of Array.from(e.changedTouches)) {
      const stick: Stick = { id: t.identifier, ox: t.clientX, oy: t.clientY, x: t.clientX, y: t.clientY };
      if (t.clientX < half) {
        if (!this.moveStick) this.moveStick = stick;
      } else if (!this.aimStick) {
        this.aimStick = stick;
      }
    }
    e.preventDefault();
  }

  private onTouchMove(e: TouchEvent): void {
    for (const t of Array.from(e.changedTouches)) {
      if (this.moveStick && t.identifier === this.moveStick.id) {
        this.moveStick.x = t.clientX;
        this.moveStick.y = t.clientY;
      }
      if (this.aimStick && t.identifier === this.aimStick.id) {
        this.aimStick.x = t.clientX;
        this.aimStick.y = t.clientY;
      }
    }
    e.preventDefault();
  }

  private onTouchEnd(e: TouchEvent): void {
    for (const t of Array.from(e.changedTouches)) {
      if (this.moveStick && t.identifier === this.moveStick.id) this.moveStick = null;
      if (this.aimStick && t.identifier === this.aimStick.id) this.aimStick = null;
    }
  }

  moveDir(): Vec2 {
    if (this.moveStick) {
      const dx = this.moveStick.x - this.moveStick.ox;
      const dy = this.moveStick.y - this.moveStick.oy;
      if (Math.hypot(dx, dy) > DEADZONE) return normalize({ x: dx, y: dy });
      return { x: 0, y: 0 };
    }
    return dirFromKeys(this.keys);
  }

  aim(cx: number, cy: number): number | null {
    if (this.aimStick) {
      const dx = this.aimStick.x - this.aimStick.ox;
      const dy = this.aimStick.y - this.aimStick.oy;
      if (Math.hypot(dx, dy) > DEADZONE) return Math.atan2(dy, dx);
      return null;
    }
    if (this.mouse) return Math.atan2(this.mouse.y - cy, this.mouse.x - cx);
    return null;
  }

  getMoveStick(): Stick | null {
    return this.moveStick;
  }

  getAimStick(): Stick | null {
    return this.aimStick;
  }
}
