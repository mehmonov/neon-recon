export interface Assets {
  player?: HTMLImageElement;
  enemy?: HTMLImageElement;
  enemyHeavy?: HTMLImageElement;
  bulletPlayer?: HTMLImageElement;
  bulletEnemy?: HTMLImageElement;
  muzzle?: HTMLImageElement;
  wall?: HTMLImageElement;
  floor?: HTMLImageElement;
  pickupHealth?: HTMLImageElement;
  pickupAmmo?: HTMLImageElement;
  joystickBase?: HTMLImageElement;
  joystickKnob?: HTMLImageElement;
}

const FILES: Record<keyof Assets, string> = {
  player: 'player.png',
  enemy: 'enemy.png',
  enemyHeavy: 'enemy_heavy.png',
  bulletPlayer: 'bullet_player.png',
  bulletEnemy: 'bullet_enemy.png',
  muzzle: 'muzzle.png',
  wall: 'wall.png',
  floor: 'floor.png',
  pickupHealth: 'pickup_health.png',
  pickupAmmo: 'pickup_ammo.png',
  joystickBase: 'joystick_base.png',
  joystickKnob: 'joystick_knob.png',
};

// Loads every sprite. Each entry stays undefined until its image loads, so the
// renderer transparently falls back to its vector shape for anything missing.
export function loadAssets(): Assets {
  const assets: Assets = {};
  (Object.keys(FILES) as (keyof Assets)[]).forEach((key) => {
    const img = new Image();
    img.onload = () => {
      assets[key] = img;
    };
    img.src = `/assets/${FILES[key]}`;
  });
  return assets;
}
