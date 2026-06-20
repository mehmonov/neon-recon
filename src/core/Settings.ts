export interface Settings {
  moveSpeed: number; // px/s
  turnSpeed: number; // deg/s
  enemyCount: number;
}

export const SETTINGS_DEF: Settings = { moveSpeed: 200, turnSpeed: 720, enemyCount: 5 };

export const SETTINGS_RANGE: Record<keyof Settings, { min: number; max: number; step: number }> = {
  moveSpeed: { min: 100, max: 360, step: 10 },
  turnSpeed: { min: 180, max: 1440, step: 30 },
  enemyCount: { min: 1, max: 12, step: 1 },
};

const KEY = 'neon-recon-settings';

export function loadSettings(): Settings {
  try {
    return { ...SETTINGS_DEF, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...SETTINGS_DEF };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore (private mode / no storage) */
  }
}
