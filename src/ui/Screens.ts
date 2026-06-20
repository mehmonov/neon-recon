import { Game } from '../core/Game';

export class Screens {
  constructor(private game: Game) {
    this.on('btn-play', () => this.game.start());
    this.on('btn-resume', () => this.game.resume());
    this.on('btn-restart', () => this.game.start());
    this.on('btn-retry', () => this.game.start());
    this.on('btn-again', () => this.game.start());
    this.on('btn-pause', () => this.game.pause());
  }

  sync(): void {
    const s = this.game.state;
    this.show('screen-menu', s === 'menu');
    this.show('screen-pause', s === 'paused');
    this.show('screen-over', s === 'gameover');
    this.show('screen-win', s === 'victory');
    this.show('btn-pause', s === 'playing');
    if (s === 'gameover') this.el('over-score').textContent = `Ball: ${this.game.score}`;
    if (s === 'victory') this.el('win-score').textContent = `Ball: ${this.game.score}`;
  }

  private el(id: string): HTMLElement {
    return document.getElementById(id)!;
  }

  private on(id: string, fn: () => void): void {
    this.el(id).addEventListener('click', fn);
  }

  private show(id: string, on: boolean): void {
    this.el(id).style.display = on ? 'flex' : 'none';
  }
}
