import { Game } from '../core/Game';
import { Settings, loadSettings, saveSettings, SETTINGS_RANGE } from '../core/Settings';

export class SettingsPanel {
  private s: Settings;

  constructor(private game: Game) {
    this.s = loadSettings();
    this.bind('set-move', 'moveSpeed', (v) => `${v}`);
    this.bind('set-turn', 'turnSpeed', (v) => `${v}°/s`);
    this.bind('set-enemies', 'enemyCount', (v) => `${v}`);
    this.el('btn-settings').addEventListener('click', () => this.open());
    this.el('btn-settings-close').addEventListener('click', () => this.close());
    this.game.applySettings(this.s);
  }

  // Gear is only useful when not actively playing.
  syncGear(): void {
    const show = this.game.state === 'menu' || this.game.state === 'paused';
    this.el('btn-settings').style.display = show ? 'flex' : 'none';
  }

  private open(): void {
    this.el('screen-settings').style.display = 'flex';
  }

  private close(): void {
    this.el('screen-settings').style.display = 'none';
  }

  private el(id: string): HTMLElement {
    return document.getElementById(id)!;
  }

  private bind(id: string, key: keyof Settings, fmt: (v: number) => string): void {
    const input = this.el(id) as HTMLInputElement;
    const out = this.el(`${id}-val`);
    const r = SETTINGS_RANGE[key];
    input.min = String(r.min);
    input.max = String(r.max);
    input.step = String(r.step);
    input.value = String(this.s[key]);
    out.textContent = fmt(this.s[key]);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      this.s[key] = v;
      out.textContent = fmt(v);
      saveSettings(this.s);
      this.game.applySettings(this.s);
    });
  }
}
