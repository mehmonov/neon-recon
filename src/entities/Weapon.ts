import { CONFIG } from '../config';

export class Weapon {
  magazine = CONFIG.weapon.magazine;
  reserve = CONFIG.weapon.reserve;
  flash = 0;
  private cd = 0;
  private reloadTimer = 0;

  get reloading(): boolean {
    return this.reloadTimer > 0;
  }

  update(dt: number): void {
    if (this.cd > 0) this.cd -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) this.finishReload();
    }
  }

  canFire(): boolean {
    return this.cd <= 0 && this.magazine > 0 && !this.reloading;
  }

  fire(): boolean {
    if (!this.canFire()) return false;
    this.magazine -= 1;
    this.cd = 1 / CONFIG.weapon.fireRate;
    this.flash = 0.05;
    if (this.magazine === 0 && this.reserve > 0) this.reloadTimer = CONFIG.weapon.reloadSec;
    return true;
  }

  private finishReload(): void {
    const need = CONFIG.weapon.magazine - this.magazine;
    const take = Math.min(need, this.reserve);
    this.magazine += take;
    this.reserve -= take;
  }
}
