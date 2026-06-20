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

export class Input {
  private keys = new Set<string>();

  constructor(target: Window = window) {
    target.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    target.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  moveDir(): Vec2 {
    return dirFromKeys(this.keys);
  }
}
